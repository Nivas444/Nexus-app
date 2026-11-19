"""
Centralized Authentication & RBAC Management Service.

Backed by PostgreSQL tables in `nexus_admin`:
  - auth_users, auth_roles, auth_permissions, auth_user_roles, auth_token_sessions, auth_audit_logs
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from fastapi import HTTPException, Request, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    REFRESH_COOKIE_NAME,
    AuthenticatedUser,
    build_authenticated_user,
    clear_auth_cookies,
    create_access_token,
    create_refresh_token,
    decode_jwt_token,
    get_client_ip,
    hash_password,
    invalidate_auth_cache,
    log_security_event,
    login_rate_limiter,
    set_auth_cookies,
    verify_password,
)
from app.models.security import (
    AuthAuditLog,
    AuthPermission,
    AuthRole,
    AuthTokenSession,
    AuthUser,
    AuthUserRole,
)
from app.schemas.auth import (
    AdminCreateUserRequest,
    AdminUpdateUserRolesRequest,
    AdminUpdateUserStatusRequest,
    AdminUserRecord,
    AuditLogRecord,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    PermissionRecord,
    RoleRecord,
    UserInfo,
)


def _user_info_from_auth_user(
    auth_user: AuthenticatedUser,
    *,
    access_token: Optional[str] = None,
) -> UserInfo:
    return UserInfo(
        id=auth_user.user_uid,
        email=auth_user.email,
        username=auth_user.username,
        name=auth_user.name,
        role=auth_user.role,
        roles=list(auth_user.roles),
        token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60 if access_token else None,
        permissions=sorted(auth_user.permissions),
        is_super_admin=auth_user.is_super_admin,
        employee_id=auth_user.employee_id,
        department=auth_user.department,
        phone=auth_user.phone,
        location=auth_user.location,
    )


class AuthService:
    def authenticate_user(
        self,
        db: Session,
        payload: LoginRequest,
        request: Request,
        response: Response,
    ) -> LoginResponse:
        identifier = payload.email.strip().lower()
        client_ip = get_client_ip(request)
        rate_key = f"{client_ip}:{identifier}"
        login_rate_limiter.check(rate_key)

        db_user = (
            db.query(AuthUser)
            .filter(or_(AuthUser.email == identifier, AuthUser.username == identifier))
            .first()
        )

        now = datetime.now(timezone.utc)

        if not db_user:
            login_rate_limiter.record_failure(rate_key)
            log_security_event(
                db,
                "login_failed",
                email=identifier,
                request=request,
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unknown user identifier",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not db_user.is_active:
            log_security_event(
                db,
                "login_failed",
                user_id=db_user.id,
                email=db_user.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact administrator.",
            )

        if db_user.locked_until and db_user.locked_until > now:
            log_security_event(
                db,
                "login_failed",
                user_id=db_user.id,
                email=db_user.email,
                request=request,
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account temporarily locked due to repeated failed attempts",
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account temporarily locked due to too many failed attempts. Try again later.",
            )

        if not verify_password(payload.password, db_user.password_hash):
            login_rate_limiter.record_failure(rate_key)
            db_user.failed_login_attempts = (db_user.failed_login_attempts or 0) + 1
            if db_user.failed_login_attempts >= settings.ACCOUNT_LOCKOUT_THRESHOLD:
                db_user.locked_until = now + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
            db.commit()
            log_security_event(
                db,
                "login_failed",
                user_id=db_user.id,
                email=db_user.email,
                request=request,
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password",
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Success: reset lockout counters & rate limit
        login_rate_limiter.reset(rate_key)
        db_user.failed_login_attempts = 0
        db_user.locked_until = None
        db_user.last_login_at = now

        auth_user = build_authenticated_user(db_user)
        access_token, access_jti, _ = create_access_token(db_user, roles=auth_user.roles)
        refresh_token, refresh_jti, refresh_exp = create_refresh_token(db_user)

        session_row = AuthTokenSession(
            jti=refresh_jti,
            user_id=db_user.id,
            token_type="refresh",
            expires_at=refresh_exp,
            ip_address=client_ip,
            user_agent=(request.headers.get("user-agent") or "")[:255],
        )
        db.add(session_row)
        db.add(
            AuthAuditLog(
                event_type="login_success",
                user_id=db_user.id,
                email=db_user.email,
                ip_address=client_ip,
                method=request.method,
                path=str(request.url.path)[:255],
                status_code=status.HTTP_200_OK,
                detail=f"Authenticated with roles: {', '.join(auth_user.roles)}",
            )
        )
        db.commit()

        set_auth_cookies(
            response,
            access_token=access_token,
            refresh_token=refresh_token,
        )

        return LoginResponse(
            success=True,
            message="Authentication successful",
            user=_user_info_from_auth_user(auth_user, access_token=access_token),
        )

    def refresh_session(
        self,
        db: Session,
        request: Request,
        response: Response,
        body_refresh_token: Optional[str] = None,
    ) -> LoginResponse:
        raw_token = request.cookies.get(REFRESH_COOKIE_NAME) or body_refresh_token
        if not raw_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing. Please log in again.",
            )

        payload = decode_jwt_token(raw_token, expected_type="refresh")
        refresh_jti = payload.get("jti")
        user_id = int(payload["sub"])

        token_row = (
            db.query(AuthTokenSession)
            .filter(
                AuthTokenSession.jti == refresh_jti,
                AuthTokenSession.user_id == user_id,
                AuthTokenSession.token_type == "refresh",
            )
            .first()
        )
        now = datetime.now(timezone.utc)
        if not token_row or token_row.revoked_at is not None or token_row.expires_at <= now:
            clear_auth_cookies(response)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid or revoked. Please log in again.",
            )

        db_user = db.query(AuthUser).filter(AuthUser.id == user_id, AuthUser.is_active.is_(True)).first()
        if not db_user:
            clear_auth_cookies(response)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive.",
            )

        # Rotate refresh token: revoke old, issue new pair
        token_row.revoked_at = now
        auth_user = build_authenticated_user(db_user)
        new_access_token, _, _ = create_access_token(db_user, roles=auth_user.roles)
        new_refresh_token, new_refresh_jti, new_refresh_exp = create_refresh_token(db_user)

        db.add(
            AuthTokenSession(
                jti=new_refresh_jti,
                user_id=db_user.id,
                token_type="refresh",
                expires_at=new_refresh_exp,
                ip_address=get_client_ip(request),
                user_agent=(request.headers.get("user-agent") or "")[:255],
            )
        )
        db.commit()

        set_auth_cookies(
            response,
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        )

        log_security_event(
            db,
            "token_refresh",
            user_id=db_user.id,
            email=db_user.email,
            request=request,
            status_code=status.HTTP_200_OK,
            detail="Rotated refresh token and issued new access token",
        )

        return LoginResponse(
            success=True,
            message="Session refreshed",
            user=_user_info_from_auth_user(auth_user, access_token=new_access_token),
        )

    def logout_user(
        self,
        db: Session,
        current_user: AuthenticatedUser,
        request: Request,
        response: Response,
    ) -> LogoutResponse:
        now = datetime.now(timezone.utc)

        # 1. Revoke current access token JTI so it cannot be reused before expiry
        if current_user.jti:
            existing = db.query(AuthTokenSession).filter(AuthTokenSession.jti == current_user.jti).first()
            if existing:
                existing.revoked_at = now
            else:
                db.add(
                    AuthTokenSession(
                        jti=current_user.jti,
                        user_id=current_user.id,
                        token_type="access",
                        expires_at=now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
                        revoked_at=now,
                        ip_address=get_client_ip(request),
                    )
                )

        # 2. Revoke refresh cookie token if present
        raw_refresh = request.cookies.get(REFRESH_COOKIE_NAME)
        if raw_refresh:
            try:
                refresh_payload = decode_jwt_token(raw_refresh, expected_type="refresh")
                r_jti = refresh_payload.get("jti")
                if r_jti:
                    r_row = db.query(AuthTokenSession).filter(AuthTokenSession.jti == r_jti).first()
                    if r_row and r_row.revoked_at is None:
                        r_row.revoked_at = now
            except HTTPException:
                pass

        db.commit()
        invalidate_auth_cache(jti=current_user.jti, user_id=current_user.id)
        clear_auth_cookies(response)

        log_security_event(
            db,
            "logout",
            user_id=current_user.id,
            email=current_user.email,
            request=request,
            status_code=status.HTTP_200_OK,
            detail="User logged out and tokens revoked",
        )

        return LogoutResponse(success=True, message="Logged out successfully")

    def get_current_user_info(self, current_user: AuthenticatedUser) -> UserInfo:
        return _user_info_from_auth_user(current_user)

    # -----------------------------------------------------------------------
    # Centralized Admin User & RBAC Management (Privilege Escalation Safe)
    # -----------------------------------------------------------------------

    def list_users(self, db: Session) -> List[AdminUserRecord]:
        users = db.query(AuthUser).order_by(AuthUser.id.asc()).all()
        results: List[AdminUserRecord] = []
        for u in users:
            au = build_authenticated_user(u)
            results.append(
                AdminUserRecord(
                    id=au.id,
                    user_uid=au.user_uid,
                    email=au.email,
                    username=au.username,
                    full_name=au.name,
                    roles=list(au.roles),
                    permissions=sorted(au.permissions),
                    is_active=au.is_active,
                    is_super_admin=au.is_super_admin,
                    employee_id=au.employee_id,
                    department=au.department,
                    last_login_at=u.last_login_at,
                )
            )
        return results

    def create_user(
        self,
        db: Session,
        actor: AuthenticatedUser,
        payload: AdminCreateUserRequest,
        request: Request,
    ) -> AdminUserRecord:
        existing = (
            db.query(AuthUser)
            .filter(or_(AuthUser.email == payload.email, AuthUser.username == payload.username))
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email or username already exists.",
            )

        requested_roles = db.query(AuthRole).filter(AuthRole.name.in_(payload.roles)).all()
        if len(requested_roles) != len(set(payload.roles)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more specified roles do not exist.",
            )

        # Prevent privilege escalation: only Super Admin can assign Master / Super Admin role
        if any(r.name == "Master" for r in requested_roles) and not actor.is_super_admin:
            log_security_event(
                db,
                "privilege_escalation_blocked",
                user_id=actor.id,
                email=actor.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Attempted to create Master user {payload.email}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admin can assign the Master role.",
            )

        new_user = AuthUser(
            user_uid=f"usr-{uuid.uuid4().hex[:10]}",
            email=payload.email,
            username=payload.username,
            full_name=payload.full_name.strip(),
            password_hash=hash_password(payload.password),
            employee_id=payload.employee_id,
            department=payload.department,
            phone=payload.phone,
            location=payload.location,
            is_active=True,
            is_super_admin=any(r.name == "Master" for r in requested_roles),
        )
        db.add(new_user)
        db.flush()

        for role in requested_roles:
            db.add(AuthUserRole(user_id=new_user.id, role_id=role.id))

        db.commit()
        db.refresh(new_user)

        log_security_event(
            db,
            "user_created",
            user_id=actor.id,
            email=actor.email,
            request=request,
            status_code=status.HTTP_201_CREATED,
            detail=f"Created user {new_user.email} with roles {', '.join(r.name for r in requested_roles)}",
        )

        au = build_authenticated_user(new_user)
        return AdminUserRecord(
            id=au.id,
            user_uid=au.user_uid,
            email=au.email,
            username=au.username,
            full_name=au.name,
            roles=list(au.roles),
            permissions=sorted(au.permissions),
            is_active=au.is_active,
            is_super_admin=au.is_super_admin,
            employee_id=au.employee_id,
            department=au.department,
            last_login_at=new_user.last_login_at,
        )

    def update_user_roles(
        self,
        db: Session,
        actor: AuthenticatedUser,
        target_user_id: int,
        payload: AdminUpdateUserRolesRequest,
        request: Request,
    ) -> AdminUserRecord:
        target = db.query(AuthUser).filter(AuthUser.id == target_user_id).first()
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if target.is_super_admin and not actor.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admin can modify another Super Admin account.",
            )

        new_roles = db.query(AuthRole).filter(AuthRole.name.in_(payload.roles)).all()
        if len(new_roles) != len(set(payload.roles)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified.")

        if any(r.name == "Master" for r in new_roles) and not actor.is_super_admin:
            log_security_event(
                db,
                "privilege_escalation_blocked",
                user_id=actor.id,
                email=actor.email,
                request=request,
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Attempted to escalate user_id={target_user_id} to Master",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admin can grant the Master role.",
            )

        db.query(AuthUserRole).filter(AuthUserRole.user_id == target.id).delete()
        for r in new_roles:
            db.add(AuthUserRole(user_id=target.id, role_id=r.id))
        target.is_super_admin = any(r.name == "Master" for r in new_roles)
        db.commit()
        db.refresh(target)

        log_security_event(
            db,
            "role_change",
            user_id=actor.id,
            email=actor.email,
            request=request,
            status_code=status.HTTP_200_OK,
            detail=f"Updated roles for {target.email} -> {', '.join(r.name for r in new_roles)}",
        )

        au = build_authenticated_user(target)
        invalidate_auth_cache(user_id=target.id)
        return AdminUserRecord(
            id=au.id,
            user_uid=au.user_uid,
            email=au.email,
            username=au.username,
            full_name=au.name,
            roles=list(au.roles),
            permissions=sorted(au.permissions),
            is_active=au.is_active,
            is_super_admin=au.is_super_admin,
            employee_id=au.employee_id,
            department=au.department,
            last_login_at=target.last_login_at,
        )

    def update_user_status(
        self,
        db: Session,
        actor: AuthenticatedUser,
        target_user_id: int,
        payload: AdminUpdateUserStatusRequest,
        request: Request,
    ) -> AdminUserRecord:
        target = db.query(AuthUser).filter(AuthUser.id == target_user_id).first()
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        if target.id == actor.id and not payload.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )
        if target.is_super_admin and not actor.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admin can modify a Super Admin account.",
            )

        target.is_active = payload.is_active
        if not payload.is_active:
            now = datetime.now(timezone.utc)
            db.query(AuthTokenSession).filter(
                AuthTokenSession.user_id == target.id,
                AuthTokenSession.revoked_at.is_(None),
            ).update({"revoked_at": now})
        db.commit()
        db.refresh(target)

        log_security_event(
            db,
            "user_status_change",
            user_id=actor.id,
            email=actor.email,
            request=request,
            status_code=status.HTTP_200_OK,
            detail=f"Set is_active={payload.is_active} for {target.email}",
        )

        au = build_authenticated_user(target)
        invalidate_auth_cache(user_id=target.id)
        return AdminUserRecord(
            id=au.id,
            user_uid=au.user_uid,
            email=au.email,
            username=au.username,
            full_name=au.name,
            roles=list(au.roles),
            permissions=sorted(au.permissions),
            is_active=au.is_active,
            is_super_admin=au.is_super_admin,
            employee_id=au.employee_id,
            department=au.department,
            last_login_at=target.last_login_at,
        )

    def list_roles(self, db: Session) -> List[RoleRecord]:
        roles = db.query(AuthRole).order_by(AuthRole.id.asc()).all()
        return [
            RoleRecord(
                id=int(r.id),
                name=r.name,
                description=r.description,
                is_system=bool(r.is_system),
                permissions=sorted(p.code for p in (r.permissions or [])),
            )
            for r in roles
        ]

    def list_permissions(self, db: Session) -> List[PermissionRecord]:
        perms = db.query(AuthPermission).order_by(AuthPermission.module.asc(), AuthPermission.code.asc()).all()
        return [
            PermissionRecord(
                id=int(p.id),
                code=p.code,
                module=p.module,
                description=p.description,
            )
            for p in perms
        ]

    def list_audit_logs(self, db: Session, limit: int = 100) -> List[AuditLogRecord]:
        safe_limit = max(1, min(limit, 500))
        rows = db.query(AuthAuditLog).order_by(AuthAuditLog.created_at.desc()).limit(safe_limit).all()
        return [
            AuditLogRecord(
                id=int(r.id),
                event_type=r.event_type,
                user_id=int(r.user_id) if r.user_id is not None else None,
                email=r.email,
                ip_address=r.ip_address,
                method=r.method,
                path=r.path,
                status_code=r.status_code,
                detail=r.detail,
                created_at=r.created_at,
            )
            for r in rows
        ]


auth_service = AuthService()
