from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

def _attach_schema_search_path(engine_instance, *schemas: str):
    """
    Ensures that when pooled connections are checked out, PostgreSQL sets
    search_path to the configured schemas (e.g. for Supabase or multi-schema setups).
    """
    valid_schemas = [s.strip() for s in schemas if s and s.strip()]
    if not valid_schemas:
        return
    if "public" not in valid_schemas:
        valid_schemas.append("public")
    search_path_str = ", ".join(valid_schemas)

    @event.listens_for(engine_instance, "checkout")
    def receive_checkout(dbapi_connection, connection_record, connection_proxy):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute(f"SET search_path TO {search_path_str};")
        finally:
            cursor.close()

engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)
_attach_schema_search_path(
    engine,
    settings.DB_MASTER_SCHEMA,
    settings.DB_ADMIN_SCHEMA,
    settings.DB_INVENTORY_SCHEMA,
    settings.DB_INFRA_INVENTORY_SCHEMA,
    settings.DB_PURCHASE_SCHEMA
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
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)
_attach_schema_search_path(
    project_engine,
    settings.DB_PROJECT_SCHEMA,
    settings.DB_MASTER_SCHEMA
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
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)
_attach_schema_search_path(
    accounts_engine,
    settings.DB_ACCOUNTS_SCHEMA,
    settings.DB_MASTER_SCHEMA
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


