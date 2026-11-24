from typing import List, Optional

from fastapi import APIRouter, Body, Depends, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.security import (
    AuthenticatedUser,
    get_current_user,
    require_permissions,
)
from app.db.session import get_db
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
    RefreshTokenRequest,
    RoleRecord,
    UserInfo,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/login", response_model=LoginResponse, summary="Authenticate user and issue JWT session")
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    return auth_service.authenticate_user(db, payload, request, response)


@router.post("/refresh", response_model=LoginResponse, summary="Rotate refresh token and issue new access JWT")
def refresh_token(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = Body(default=None),
    db: Session = Depends(get_db),
) -> LoginResponse:
    body_token = payload.refresh_token if payload else None
    return auth_service.refresh_session(db, request, response, body_refresh_token=body_token)


@router.post("/logout", response_model=LogoutResponse, summary="Revoke active JWT/refresh session and clear cookies")
def logout(
    request: Request,
    response: Response,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LogoutResponse:
    return auth_service.logout_user(db, current_user, request, response)


@router.get("/me", response_model=UserInfo, summary="Get authenticated user profile, roles, and permissions")
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> UserInfo:
    return auth_service.get_current_user_info(current_user)


# ---------------------------------------------------------------------------
# Centralized Admin RBAC Management Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/users",
    response_model=List[AdminUserRecord],
    summary="List all ERP users and assigned roles",
)
def list_users(
    _user: AuthenticatedUser = Depends(require_permissions("admin.users.manage")),
    db: Session = Depends(get_db),
) -> List[AdminUserRecord]:
    return auth_service.list_users(db)


@router.post(
    "/users",
    response_model=AdminUserRecord,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ERP user account",
)
def create_user(
    payload: AdminCreateUserRequest,
    request: Request,
    current_user: AuthenticatedUser = Depends(require_permissions("admin.users.manage")),
    db: Session = Depends(get_db),
) -> AdminUserRecord:
    return auth_service.create_user(db, current_user, payload, request)


@router.put(
    "/users/{user_id}/roles",
    response_model=AdminUserRecord,
    summary="Update assigned roles for a user",
)
def update_user_roles(
    user_id: int,
    payload: AdminUpdateUserRolesRequest,
    request: Request,
    current_user: AuthenticatedUser = Depends(require_permissions("admin.roles.manage")),
    db: Session = Depends(get_db),
) -> AdminUserRecord:
    return auth_service.update_user_roles(db, current_user, user_id, payload, request)


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserRecord,
    summary="Activate or deactivate a user account",
)
def update_user_status(
    user_id: int,
    payload: AdminUpdateUserStatusRequest,
    request: Request,
    current_user: AuthenticatedUser = Depends(require_permissions("admin.users.manage")),
    db: Session = Depends(get_db),
) -> AdminUserRecord:
    return auth_service.update_user_status(db, current_user, user_id, payload, request)


@router.get(
    "/roles",
    response_model=List[RoleRecord],
    summary="List all RBAC roles and their permissions",
)
def list_roles(
    _user: AuthenticatedUser = Depends(require_permissions("admin.roles.manage")),
    db: Session = Depends(get_db),
) -> List[RoleRecord]:
    return auth_service.list_roles(db)


@router.get(
    "/permissions",
    response_model=List[PermissionRecord],
    summary="List all granular RBAC permissions",
)
def list_permissions(
    _user: AuthenticatedUser = Depends(require_permissions("admin.roles.manage")),
    db: Session = Depends(get_db),
) -> List[PermissionRecord]:
    return auth_service.list_permissions(db)


@router.get(
    "/audit-logs",
    response_model=List[AuditLogRecord],
    summary="Retrieve recent security audit logs",
)
def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    _user: AuthenticatedUser = Depends(require_permissions("admin.manage")),
    db: Session = Depends(get_db),
) -> List[AuditLogRecord]:
    return auth_service.list_audit_logs(db, limit=limit)


@router.get("/theme", summary="Get active company platform theme color (public)")
def get_public_company_theme(db: Session = Depends(get_db)):
    """Public read-only endpoint returning the configured company hex color for login & ERP pages."""
    from app.services.company_theme import get_company_theme_hex, DEFAULT_THEME_HEX
    hex_code = get_company_theme_hex(db=db)
    return {
        "hex_color_code": hex_code,
        "default_hex_color_code": DEFAULT_THEME_HEX,
    }
