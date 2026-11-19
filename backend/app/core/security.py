"""
Centralized Security Architecture for Nexus ERP.

Single source of truth for:
- Password hashing & verification (salted scrypt + constant-time compare)
- JWT creation, validation, expiration & revocation checks
- Cookie + Bearer token extraction and CSRF protection
- Database-backed RBAC (roles & granular permissions)
- Login rate limiting
- Sanitized security audit logging
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import logging
import secrets
import threading
import time
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable, Deque, Dict, FrozenSet, Iterable, List, Optional, Sequence, Set, Tuple

import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.cache import auth_user_cache
from app.core.config import settings
from app.db.session import get_db
from app.models.security import AuthAuditLog, AuthRole, AuthTokenSession, AuthUser

logger = logging.getLogger("nexus.security")

ACCESS_COOKIE_NAME = "nexus_access_token"
REFRESH_COOKIE_NAME = "nexus_refresh_token"
CSRF_COOKIE_NAME = "nexus_csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"

STATE_CHANGING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

# ---------------------------------------------------------------------------
# Password Hashing (Salted scrypt via Python stdlib hashlib)
# ---------------------------------------------------------------------------

SCRYPT_N = 16384
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 32


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using salted scrypt."""
    if not plain_password:
        raise ValueError("Password cannot be empty")
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(
        plain_password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_DKLEN,
    )
    salt_b64 = base64.b64encode(salt).decode("ascii")
    hash_b64 = base64.b64encode(derived).decode("ascii")
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${salt_b64}${hash_b64}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify a plaintext password against a stored salted scrypt hash."""
    if not plain_password or not stored_hash:
        return False
    try:
        parts = stored_hash.split("$")
        if len(parts) != 6 or parts[0] != "scrypt":
            return False
        n = int(parts[1])
        r = int(parts[2])
        p = int(parts[3])
        salt = base64.b64decode(parts[4].encode("ascii"))
        expected = base64.b64decode(parts[5].encode("ascii"))
        derived = hashlib.scrypt(
            plain_password.encode("utf-8"),
            salt=salt,
            n=n,
            r=r,
            p=p,
            dklen=len(expected),
        )
        return hmac.compare_digest(derived, expected)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Authenticated User Context (Derived from DB, never from frontend headers)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class AuthenticatedUser:
    id: int
    user_uid: str
    email: str
    username: str
    name: str
    role: str
    roles: Tuple[str, ...]
    permissions: FrozenSet[str] = field(default_factory=frozenset)  # type: ignore[name-defined]
    is_super_admin: bool = False
    is_active: bool = True
    employee_id: Optional[int] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    jti: Optional[str] = None
    auth_source: str = "bearer"

    def has_permission(self, permission: str) -> bool:
        if self.is_super_admin:
            return True
        return permission in self.permissions

    def has_any_permission(self, required: Iterable[str]) -> bool:
        if self.is_super_admin:
            return True
        return any(p in self.permissions for p in required)

    def has_all_permissions(self, required: Iterable[str]) -> bool:
        if self.is_super_admin:
            return True
        return all(p in self.permissions for p in required)

    def has_role(self, *allowed_roles: str) -> bool:
        if self.is_super_admin:
            return True
        allowed_lower = {r.strip().lower() for r in allowed_roles}
        return any(r.strip().lower() in allowed_lower for r in self.roles)


# ---------------------------------------------------------------------------
# Sliding-Window Rate Limiter for Login Endpoint
# ---------------------------------------------------------------------------

class LoginRateLimiter:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._attempts: Dict[str, Deque[float]] = defaultdict(deque)

    def _prune(self, key: str, now: float, window: int) -> Deque[float]:
        q = self._attempts[key]
        cutoff = now - window
        while q and q[0] < cutoff:
            q.popleft()
        return q

    def check(self, key: str) -> None:
        now = time.monotonic()
        window = settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS
        max_attempts = settings.LOGIN_RATE_LIMIT_MAX_ATTEMPTS
        with self._lock:
            q = self._prune(key, now, window)
            if len(q) >= max_attempts:
                retry_after = max(1, int(window - (now - q[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )

    def record_failure(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            self._attempts[key].append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._attempts.pop(key, None)


login_rate_limiter = LoginRateLimiter()


# ---------------------------------------------------------------------------
# Request Metadata & Sanitized Audit Logging
# ---------------------------------------------------------------------------

def get_client_ip(request: Optional[Request]) -> str:
    if not request:
        return "unknown"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    if request.client and request.client.host:
        return str(request.client.host)[:64]
    return "unknown"


def log_security_event(
    db: Optional[Session],
    event_type: str,
    *,
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    request: Optional[Request] = None,
    status_code: Optional[int] = None,
    detail: Optional[str] = None,
) -> None:
    """
    Persist a sanitized security audit event to nexus_admin.auth_audit_logs
    and emit a structured log entry. Never log passwords, tokens, or secrets.
    """
    ip_addr = get_client_ip(request)
    method = request.method if request else None
    path = str(request.url.path)[:255] if request else None
    safe_detail = (detail or "")[:500] if detail else None

    logger.info(
        "security_event=%s user_id=%s email=%s ip=%s method=%s path=%s status=%s detail=%s",
        event_type,
        user_id,
        email,
        ip_addr,
        method,
        path,
        status_code,
        safe_detail,
    )

    if db is None:
        return

    try:
        entry = AuthAuditLog(
            event_type=event_type,
            user_id=user_id,
            email=email,
            ip_address=ip_addr,
            method=method,
            path=path,
            status_code=status_code,
            detail=safe_detail,
        )
        db.add(entry)
        db.commit()
    except Exception as exc:
        try:
            db.rollback()
        except Exception:
            pass
        logger.warning("Failed to persist audit log event=%s: %s", event_type, exc.__class__.__name__)


# ---------------------------------------------------------------------------
# JWT Creation & Verification
# ---------------------------------------------------------------------------

def create_access_token(
    user: AuthUser,
    *,
    roles: Sequence[str],
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str, datetime]:
    """Create a signed, short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    jti = uuid.uuid4().hex
    payload = {
        "sub": str(user.id),
        "uid": user.user_uid,
        "email": user.email,
        "roles": list(roles),
        "type": "access",
        "jti": jti,
        "iss": settings.JWT_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    token = jwt.encode(payload, settings.effective_jwt_secret, algorithm=settings.JWT_ALGORITHM)
    return token, jti, expire


def create_refresh_token(
    user: AuthUser,
    *,
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str, datetime]:
    """Create a signed JWT refresh token."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    jti = uuid.uuid4().hex
    payload = {
        "sub": str(user.id),
        "uid": user.user_uid,
        "email": user.email,
        "type": "refresh",
        "jti": jti,
        "iss": settings.JWT_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    token = jwt.encode(payload, settings.effective_jwt_secret, algorithm=settings.JWT_ALGORITHM)
    return token, jti, expire


def decode_jwt_token(token: str, expected_type: str = "access") -> Dict:
    """
    Validate JWT signature, expiration, issuer, and token type.
    Also optionally validates Supabase-issued JWTs when SUPABASE_JWT_SECRET is configured.
    """
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            settings.effective_jwt_secret,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"require": ["sub", "exp", "iat", "jti", "type"]},
        )
        if payload.get("type") != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        # Optional Supabase Auth token verification if configured
        if expected_type == "access" and settings.SUPABASE_JWT_SECRET:
            try:
                supa_payload = jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False, "require": ["sub", "exp"]},
                )
                if supa_payload.get("email"):
                    supa_payload["_provider"] = "supabase"
                    return supa_payload
            except jwt.InvalidTokenError:
                pass

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or tampered authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# Cookie & CSRF Helpers
# ---------------------------------------------------------------------------

def set_auth_cookies(
    response: Response,
    *,
    access_token: str,
    refresh_token: str,
    csrf_token: Optional[str] = None,
) -> str:
    """Attach HttpOnly access/refresh cookies and readable double-submit CSRF cookie."""
    secure = settings.effective_cookie_secure
    samesite = settings.effective_cookie_samesite
    domain = settings.COOKIE_DOMAIN or None
    csrf_value = csrf_token or secrets.token_urlsafe(32)

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=secure,
        samesite=samesite,
        domain=domain,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=secure,
        samesite=samesite,
        domain=domain,
        path=f"{settings.API_V1_STR}/auth",
    )
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_value,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False,
        secure=secure,
        samesite=samesite,
        domain=domain,
        path="/",
    )
    return csrf_value


def clear_auth_cookies(response: Response) -> None:
    """Clear all authentication and CSRF cookies on logout."""
    secure = settings.effective_cookie_secure
    samesite = settings.effective_cookie_samesite
    domain = settings.COOKIE_DOMAIN or None

    response.delete_cookie(ACCESS_COOKIE_NAME, path="/", domain=domain, secure=secure, samesite=samesite)
    response.delete_cookie(
        REFRESH_COOKIE_NAME,
        path=f"{settings.API_V1_STR}/auth",
        domain=domain,
        secure=secure,
        samesite=samesite,
    )
    response.delete_cookie(CSRF_COOKIE_NAME, path="/", domain=domain, secure=secure, samesite=samesite)


def _extract_token_from_request(request: Request) -> Tuple[Optional[str], str]:
    """
    Extract access token from Authorization header (preferred) or HttpOnly cookie.
    Returns (token, source) where source is 'bearer' or 'cookie'.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header:
        parts = auth_header.strip().split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer" and parts[1].strip():
            return parts[1].strip(), "bearer"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cookie_token = request.cookies.get(ACCESS_COOKIE_NAME)
    if cookie_token:
        return cookie_token.strip(), "cookie"

    return None, "none"


def _verify_csrf_for_cookie_auth(request: Request) -> None:
    """Enforce double-submit CSRF token validation on state-changing cookie-authenticated requests."""
    if request.method.upper() not in STATE_CHANGING_METHODS:
        return
    cookie_csrf = request.cookies.get(CSRF_COOKIE_NAME)
    header_csrf = request.headers.get(CSRF_HEADER_NAME)
    if not cookie_csrf or not header_csrf or not hmac.compare_digest(cookie_csrf, header_csrf):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF validation failed.",
        )


# ---------------------------------------------------------------------------
# User Resolution & Centralized Auth / RBAC Dependencies
# ---------------------------------------------------------------------------

def build_authenticated_user(
    db_user: AuthUser,
    *,
    jti: Optional[str] = None,
    auth_source: str = "bearer",
) -> AuthenticatedUser:
    """Build immutable AuthenticatedUser context from live DB records."""
    role_names: List[str] = []
    perm_codes: Set[str] = set()

    for role in (db_user.roles or []):
        role_names.append(role.name)
        for perm in (role.permissions or []):
            perm_codes.add(perm.code)

    primary_role = role_names[0] if role_names else "Employee"
    if db_user.is_super_admin and "Master" not in role_names:
        primary_role = "Master"

    return AuthenticatedUser(
        id=int(db_user.id),
        user_uid=db_user.user_uid,
        email=db_user.email,
        username=db_user.username,
        name=db_user.full_name,
        role=primary_role,
        roles=tuple(role_names),
        permissions=frozenset(perm_codes),
        is_super_admin=bool(db_user.is_super_admin),
        is_active=bool(db_user.is_active),
        employee_id=int(db_user.employee_id) if db_user.employee_id is not None else None,
        department=db_user.department,
        phone=db_user.phone,
        location=db_user.location,
        jti=jti,
        auth_source=auth_source,
    )


def invalidate_auth_cache(
    *,
    user_id: Optional[int] = None,
    jti: Optional[str] = None,
) -> None:
    """Immediately evict cached authentication contexts on logout, revoke, or role/status change."""
    if jti:
        auth_user_cache.invalidate_prefix(f"jti:{jti}:")
    if user_id is not None:
        auth_user_cache.invalidate_prefix(f"uid:{user_id}:")
        # Also clear jti-keyed entries for this user by scanning safely
        auth_user_cache.clear()
    if not jti and user_id is None:
        auth_user_cache.clear()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    """
    Centralized authentication dependency.
    Validates JWT, checks revocation, verifies CSRF (for cookie auth),
    and loads live user, roles, and permissions from PostgreSQL (with short-TTL cache
    evicted immediately on logout/revoke/role changes).
    """
    # Reuse per-request cached user if already resolved by an earlier dependency
    cached = getattr(request.state, "authenticated_user", None)
    if isinstance(cached, AuthenticatedUser):
        return cached

    token, source = _extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if source == "cookie":
        _verify_csrf_for_cookie_auth(request)

    payload = decode_jwt_token(token, expected_type="access")
    jti = payload.get("jti")
    sub_key = str(payload.get("sub") or payload.get("email") or "")
    cache_key = f"jti:{jti}:src:{source}" if jti else f"uid:{sub_key}:src:{source}"

    # Strictly bypass auth cache on mutating requests (POST/PUT/PATCH/DELETE) so
    # logout, role changes, and account disabling take effect immediately across all instances.
    is_read_method = request.method.upper() in ("GET", "HEAD", "OPTIONS")
    if is_read_method:
        cached_auth = auth_user_cache.get(cache_key)
        if isinstance(cached_auth, AuthenticatedUser):
            request.state.authenticated_user = cached_auth
            return cached_auth

    # Check if access token was explicitly revoked (logout)
    if jti:
        revoked = (
            db.query(AuthTokenSession.id)
            .filter(
                AuthTokenSession.jti == jti,
                AuthTokenSession.revoked_at.isnot(None),
            )
            .first()
        )
        if revoked is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been revoked. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Eager-load user + roles + permissions in a SINGLE SQL query (eliminates N+1 lazy loads)
    user_query = db.query(AuthUser).options(
        joinedload(AuthUser.roles).joinedload(AuthRole.permissions)
    )
    db_user: Optional[AuthUser] = None
    if payload.get("_provider") == "supabase":
        email = (payload.get("email") or "").strip().lower()
        if email:
            db_user = user_query.filter(AuthUser.email == email).first()
    else:
        try:
            user_id = int(payload["sub"])
            db_user = user_query.filter(AuthUser.id == user_id).first()
        except (ValueError, KeyError, TypeError):
            db_user = None

    if not db_user or not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_user = build_authenticated_user(db_user, jti=jti, auth_source=source)
    if is_read_method:
        auth_user_cache.set(cache_key, auth_user, ttl=5.0)
    request.state.authenticated_user = auth_user
    return auth_user


def require_permissions(
    *required_permissions: str,
    require_all: bool = False,
) -> Callable:
    """
    Centralized RBAC permission dependency.
    - If require_all=False (default): user must hold AT LEAST ONE of required_permissions (or be Super Admin).
    - If require_all=True: user must hold ALL of required_permissions (or be Super Admin).
    """
    perms = tuple(p.strip() for p in required_permissions if p and p.strip())

    def _dependency(
        request: Request,
        current_user: AuthenticatedUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> AuthenticatedUser:
        if not perms:
            return current_user

        allowed = (
            current_user.has_all_permissions(perms)
            if require_all
            else current_user.has_any_permission(perms)
        )
        if not allowed:
            log_security_event(
                db,
                "access_denied",
                user_id=current_user.id,
                email=current_user.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission(s): {', '.join(perms)}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not have permission to perform this action.",
            )
        return current_user

    return _dependency


def require_roles(*allowed_roles: str) -> Callable:
    """Centralized RBAC role dependency (fallback when role-level check is explicitly needed)."""
    roles_tuple = tuple(r.strip() for r in allowed_roles if r and r.strip())

    def _dependency(
        request: Request,
        current_user: AuthenticatedUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> AuthenticatedUser:
        if not current_user.has_role(*roles_tuple):
            log_security_event(
                db,
                "access_denied",
                user_id=current_user.id,
                email=current_user.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not in allowed roles: {', '.join(roles_tuple)}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient role privileges.",
            )
        return current_user

    return _dependency


def require_super_admin(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    """Centralized dependency restricting an endpoint strictly to Super Admin accounts."""
    if not current_user.is_super_admin:
        log_security_event(
            db,
            "access_denied",
            user_id=current_user.id,
            email=current_user.email,
            request=request,
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privilege required.",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Super Admin privilege required.",
        )
    return current_user


def require_method_permissions(
    *,
    read: Sequence[str],
    write: Sequence[str],
    delete: Optional[Sequence[str]] = None,
) -> Callable:
    """
    Router-level centralized RBAC dependency that enforces read permissions on
    GET/HEAD/OPTIONS, delete permissions on DELETE (defaults to write),
    and write permissions on POST/PUT/PATCH.
    """
    read_perms = tuple(read)
    write_perms = tuple(write)
    delete_perms = tuple(delete) if delete is not None else write_perms

    def _dependency(
        request: Request,
        current_user: AuthenticatedUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> AuthenticatedUser:
        method = request.method.upper()
        if method in ("GET", "HEAD", "OPTIONS"):
            needed = read_perms
        elif method == "DELETE":
            needed = delete_perms
        else:
            needed = write_perms

        if needed and not current_user.has_any_permission(needed):
            log_security_event(
                db,
                "access_denied",
                user_id=current_user.id,
                email=current_user.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Method {method} denied; requires one of: {', '.join(needed)}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not have permission to perform this action.",
            )
        return current_user

    return _dependency


def require_route_permission_map(
    *,
    prefix_rules: Sequence[Tuple[str, Sequence[str], Sequence[str]]],
    default_read: Sequence[str],
    default_write: Sequence[str],
) -> Callable:
    """
    Centralized path-aware RBAC dependency for multi-domain routers
    (e.g., purchase.py, commercial_project.py, commercial_jms.py).
    Each rule is (path_substring, read_permissions, write_permissions).
    First matching rule wins; otherwise falls back to default_read / default_write.
    """
    compiled = [
        (pattern.lower(), tuple(r_perms), tuple(w_perms))
        for pattern, r_perms, w_perms in prefix_rules
    ]
    def_read = tuple(default_read)
    def_write = tuple(default_write)

    def _dependency(
        request: Request,
        current_user: AuthenticatedUser = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> AuthenticatedUser:
        path_lower = request.url.path.lower()
        method = request.method.upper()
        is_read = method in ("GET", "HEAD", "OPTIONS")

        needed = def_read if is_read else def_write
        for pattern, r_perms, w_perms in compiled:
            if pattern in path_lower:
                needed = r_perms if is_read else w_perms
                break

        if needed and not current_user.has_any_permission(needed):
            log_security_event(
                db,
                "access_denied",
                user_id=current_user.id,
                email=current_user.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Path {request.url.path} ({method}) denied; requires one of: {', '.join(needed)}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: you do not have permission to perform this action.",
            )
        return current_user

    return _dependency
