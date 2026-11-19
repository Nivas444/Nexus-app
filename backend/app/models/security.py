from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.core.config import settings
from app.db.base import Base

ADMIN_SCHEMA = settings.DB_ADMIN_SCHEMA


class AuthRole(Base):
    __tablename__ = "auth_roles"
    __table_args__ = {"schema": ADMIN_SCHEMA}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_system = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    permissions = relationship(
        "AuthPermission",
        secondary=f"{ADMIN_SCHEMA}.auth_role_permissions",
        back_populates="roles",
        lazy="joined",
    )


class AuthPermission(Base):
    __tablename__ = "auth_permissions"
    __table_args__ = {"schema": ADMIN_SCHEMA}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(120), nullable=False, unique=True, index=True)
    module = Column(String(80), nullable=False, index=True)
    description = Column(Text, nullable=True)

    roles = relationship(
        "AuthRole",
        secondary=f"{ADMIN_SCHEMA}.auth_role_permissions",
        back_populates="permissions",
    )


class AuthRolePermission(Base):
    __tablename__ = "auth_role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_auth_role_permission"),
        {"schema": ADMIN_SCHEMA},
    )

    role_id = Column(
        BigInteger,
        ForeignKey(f"{ADMIN_SCHEMA}.auth_roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    permission_id = Column(
        BigInteger,
        ForeignKey(f"{ADMIN_SCHEMA}.auth_permissions.id", ondelete="CASCADE"),
        primary_key=True,
    )


class AuthUser(Base):
    __tablename__ = "auth_users"
    __table_args__ = {"schema": ADMIN_SCHEMA}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_uid = Column(String(64), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    username = Column(String(120), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(Text, nullable=False)
    employee_id = Column(BigInteger, nullable=True, index=True)
    department = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(150), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    is_super_admin = Column(Boolean, nullable=False, default=False)
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    roles = relationship(
        "AuthRole",
        secondary=f"{ADMIN_SCHEMA}.auth_user_roles",
        lazy="joined",
    )


class AuthUserRole(Base):
    __tablename__ = "auth_user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_auth_user_role"),
        {"schema": ADMIN_SCHEMA},
    )

    user_id = Column(
        BigInteger,
        ForeignKey(f"{ADMIN_SCHEMA}.auth_users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id = Column(
        BigInteger,
        ForeignKey(f"{ADMIN_SCHEMA}.auth_roles.id", ondelete="CASCADE"),
        primary_key=True,
    )


class AuthTokenSession(Base):
    """
    Tracks active refresh tokens and explicitly revoked access/refresh token JTIs
    to support secure logout, refresh rotation, and session invalidation.
    """
    __tablename__ = "auth_token_sessions"
    __table_args__ = {"schema": ADMIN_SCHEMA}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    jti = Column(String(64), nullable=False, unique=True, index=True)
    user_id = Column(
        BigInteger,
        ForeignKey(f"{ADMIN_SCHEMA}.auth_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_type = Column(String(24), nullable=False, index=True)  # refresh | access
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True, index=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuthAuditLog(Base):
    """
    Centralized security audit trail (login, logout, failures, RBAC denials, admin changes).
    Never stores passwords, tokens, or secrets.
    """
    __tablename__ = "auth_audit_logs"
    __table_args__ = {"schema": ADMIN_SCHEMA}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    event_type = Column(String(64), nullable=False, index=True)
    user_id = Column(BigInteger, nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    ip_address = Column(String(64), nullable=True)
    method = Column(String(16), nullable=True)
    path = Column(String(255), nullable=True)
    status_code = Column(Integer, nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
