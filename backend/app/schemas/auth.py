from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=2, max_length=255, description="User email or username")
    password: str = Field(..., min_length=1, max_length=256, description="User password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not cleaned:
            raise ValueError("Email or username cannot be empty")
        return cleaned


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = Field(default=None, description="Optional refresh token if not sent via HttpOnly cookie")


class UserInfo(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    name: str
    role: str
    roles: List[str] = []
    token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    permissions: List[str] = []
    is_super_admin: bool = False
    employee_id: Optional[int] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class LoginResponse(BaseModel):
    success: bool = True
    message: str = "Authentication successful"
    user: UserInfo


class LogoutResponse(BaseModel):
    success: bool = True
    message: str = "Logged out successfully"


class AdminCreateUserRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    username: str = Field(..., min_length=2, max_length=120)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    roles: List[str] = Field(default_factory=lambda: ["Employee"])
    employee_id: Optional[int] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        return v.strip().lower()


class AdminUpdateUserRolesRequest(BaseModel):
    roles: List[str] = Field(..., min_length=1)


class AdminUpdateUserStatusRequest(BaseModel):
    is_active: bool


class AdminUserRecord(BaseModel):
    id: int
    user_uid: str
    email: str
    username: str
    full_name: str
    roles: List[str]
    permissions: List[str]
    is_active: bool
    is_super_admin: bool
    employee_id: Optional[int] = None
    department: Optional[str] = None
    last_login_at: Optional[datetime] = None


class RoleRecord(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: bool
    permissions: List[str]


class PermissionRecord(BaseModel):
    id: int
    code: str
    module: str
    description: Optional[str] = None


class AuditLogRecord(BaseModel):
    id: int
    event_type: str
    user_id: Optional[int] = None
    email: Optional[str] = None
    ip_address: Optional[str] = None
    method: Optional[str] = None
    path: Optional[str] = None
    status_code: Optional[int] = None
    detail: Optional[str] = None
    created_at: Optional[datetime] = None
