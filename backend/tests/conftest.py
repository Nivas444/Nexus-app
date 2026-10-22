import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db, SessionLocal, get_project_db, ProjectSessionLocal

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="function")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def project_db_session():
    db = ProjectSessionLocal()
    try:
        yield db
    finally:
        db.close()

