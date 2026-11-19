from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


def _build_pg_connect_args(*schemas: str) -> dict:
    """
    Passes PostgreSQL `search_path` in the connection startup packet (`options`),
    so it persists across all pooled transactions with ZERO extra SQL round-trips.
    """
    valid_schemas = [s.strip() for s in schemas if s and s.strip()]
    if "public" not in valid_schemas:
        valid_schemas.append("public")
    args = {
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
    if valid_schemas:
        args["options"] = f"-c search_path={','.join(valid_schemas)}"
    return args


engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=5,
    pool_recycle=300,
    connect_args=_build_pg_connect_args(
        settings.DB_MASTER_SCHEMA,
        settings.DB_ADMIN_SCHEMA,
        settings.DB_INVENTORY_SCHEMA,
        settings.DB_INFRA_INVENTORY_SCHEMA,
        settings.DB_PURCHASE_SCHEMA,
    ),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request
    and ensures proper closing on completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


project_engine = create_engine(
    settings.sqlalchemy_project_database_uri,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=5,
    pool_recycle=300,
    connect_args=_build_pg_connect_args(
        settings.DB_PROJECT_SCHEMA,
        settings.DB_MASTER_SCHEMA,
    ),
)

ProjectSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=project_engine)

def get_project_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency providing a database session to Nexus_Project DB.
    """
    db = ProjectSessionLocal()
    try:
        yield db
    finally:
        db.close()


accounts_engine = create_engine(
    settings.sqlalchemy_accounts_database_uri,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=5,
    pool_recycle=300,
    connect_args=_build_pg_connect_args(
        settings.DB_ACCOUNTS_SCHEMA,
        settings.DB_MASTER_SCHEMA,
    ),
)

AccountsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=accounts_engine)

def get_accounts_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency providing a database session to Nexus_Accounts DB.
    """
    db = AccountsSessionLocal()
    try:
        yield db
    finally:
        db.close()


