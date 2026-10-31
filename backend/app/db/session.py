from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
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


