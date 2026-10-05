import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_login_success():
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@nexus.com",
        "password": "admin123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["user"]["email"] == "admin@nexus.com"
    assert data["user"]["role"] == "Admin"
    assert data["user"]["name"] == "Admin User"
    assert "token" in data["user"]
    assert "all" in data["user"]["permissions"]

def test_commercial_manager_login_success():
    resp = client.post("/api/v1/auth/login", json={
        "email": "commercial@nexus.com",
        "password": "commercial123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["user"]["email"] == "commercial@nexus.com"
    assert data["user"]["role"] == "Commercial Manager"
    assert data["user"]["name"] == "Commercial Manager"
    assert "token" in data["user"]
    assert "master" in data["user"]["permissions"]
    assert "worklist" in data["user"]["permissions"]
    assert "projects" in data["user"]["permissions"]

def test_login_invalid_password():
    resp = client.post("/api/v1/auth/login", json={
        "email": "commercial@nexus.com",
        "password": "wrong-password"
    })
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]

def test_login_unknown_email():
    resp = client.post("/api/v1/auth/login", json={
        "email": "unknown@nexus.com",
        "password": "somepassword"
    })
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]

def test_auth_me_endpoint():
    # Login as commercial manager
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "commercial@nexus.com",
        "password": "commercial123"
    })
    token = login_resp.json()["user"]["token"]

    # Call /me with token
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "commercial@nexus.com"
    assert me_data["role"] == "Commercial Manager"
