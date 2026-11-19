import os
import secrets
from pathlib import Path
from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from sqlalchemy.engine import URL

# Root directory of the project where .env lives
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"
BACKEND_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

_DEV_FALLBACK_JWT_SECRET = secrets.token_urlsafe(48)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus ERP API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development")  # development | staging | production
    DEBUG: bool = Field(default=False)

    # Optional full PostgreSQL connection strings (Render / Supabase)
    DATABASE_URL: Optional[str] = Field(default=None)
    PROJECT_DATABASE_URL: Optional[str] = Field(default=None)
    ACCOUNTS_DATABASE_URL: Optional[str] = Field(default=None)

    # Supabase backend-only configuration (never exposed to frontend)
    SUPABASE_URL: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None)
    SUPABASE_JWT_SECRET: Optional[str] = Field(default=None)

    # Database configuration matching .env keys
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=5432)
    DB_NAME: str = Field(default="postgres")
    DB_PROJECT_NAME: str = Field(default="postgres")
    DB_ACCOUNTS_NAME: str = Field(default="postgres")
    DB_USER: str = Field(default="postgres")
    DB_PASSWORD: str = Field(default="")

    # Database Schemas (7 existing Supabase schemas)
    DB_MASTER_SCHEMA: str = Field(default="nexus_master")
    DB_PROJECT_SCHEMA: str = Field(default="nexus_project")
    DB_ACCOUNTS_SCHEMA: str = Field(default="nexus_accounts")
    DB_ADMIN_SCHEMA: str = Field(default="nexus_admin")
    DB_INFRA_INVENTORY_SCHEMA: str = Field(default="nexus_infra_inventory")
    DB_INVENTORY_SCHEMA: str = Field(default="nexus_inventory")
    DB_PURCHASE_SCHEMA: str = Field(default="nexus_purchase")

    # Centralized JWT & Cookie Security Configuration
    JWT_SECRET_KEY: str = Field(default="")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_ISSUER: str = Field(default="nexus-erp")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Cookie settings (cross-origin Vercel -> Render requires Secure=True, SameSite=None in production)
    COOKIE_SECURE: Optional[bool] = Field(default=None)
    COOKIE_SAMESITE: Optional[str] = Field(default=None)
    COOKIE_DOMAIN: Optional[str] = Field(default=None)

    # Login rate limiting & account lockout
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: int = Field(default=10)
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=300)
    ACCOUNT_LOCKOUT_THRESHOLD: int = Field(default=10)
    ACCOUNT_LOCKOUT_MINUTES: int = Field(default=15)

    # CORS configuration (comma-separated string or JSON list via env)
    CORS_ORIGINS: Union[List[str], str] = Field(
        default=[
            "https://nexus-app-trail.vercel.app",
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:5500",
            "http://localhost:8000",
            "http://localhost:8080",
            "http://127.0.0.1",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:8080",
        ]
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("["):
                import json
                return [item.strip().rstrip("/") for item in json.loads(v) if item and item.strip() != "*"]
            return [item.strip().rstrip("/") for item in v.split(",") if item.strip() and item.strip() != "*"]
        if isinstance(v, list):
            return [str(item).strip().rstrip("/") for item in v if str(item).strip() and str(item).strip() != "*"]
        return v

    @property
    def is_production(self) -> bool:
        return (self.ENVIRONMENT or "").strip().lower() == "production"

    @property
    def effective_jwt_secret(self) -> str:
        if self.JWT_SECRET_KEY and len(self.JWT_SECRET_KEY.strip()) >= 16:
            return self.JWT_SECRET_KEY.strip()
        if self.is_production:
            raise RuntimeError("JWT_SECRET_KEY must be set (>= 16 chars) in production environment.")
        return _DEV_FALLBACK_JWT_SECRET

    @property
    def effective_cookie_secure(self) -> bool:
        if self.COOKIE_SECURE is not None:
            return self.COOKIE_SECURE
        return self.is_production

    @property
    def effective_cookie_samesite(self) -> str:
        if self.COOKIE_SAMESITE:
            return self.COOKIE_SAMESITE.lower()
        # Same-origin proxy on Vercel -> Render supports SameSite=Lax securely
        return "lax"

    @staticmethod
    def _normalize_db_url(raw_url: str) -> str:
        if raw_url.startswith("postgres://"):
            return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
        if raw_url.startswith("postgresql://"):
            return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return raw_url

    @property
    def sqlalchemy_database_uri(self) -> Union[URL, str]:
        if self.DATABASE_URL:
            return self._normalize_db_url(self.DATABASE_URL)
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
        )

    @property
    def sqlalchemy_project_database_uri(self) -> Union[URL, str]:
        if self.PROJECT_DATABASE_URL:
            return self._normalize_db_url(self.PROJECT_DATABASE_URL)
        if self.DATABASE_URL:
            return self._normalize_db_url(self.DATABASE_URL)
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_PROJECT_NAME,
        )

    @property
    def sqlalchemy_accounts_database_uri(self) -> Union[URL, str]:
        if self.ACCOUNTS_DATABASE_URL:
            return self._normalize_db_url(self.ACCOUNTS_DATABASE_URL)
        if self.DATABASE_URL:
            return self._normalize_db_url(self.DATABASE_URL)
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_ACCOUNTS_NAME,
        )

    model_config = SettingsConfigDict(
        env_file=(
            str(ENV_FILE) if ENV_FILE.exists()
            else (str(BACKEND_ENV_FILE) if BACKEND_ENV_FILE.exists() else ".env")
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
