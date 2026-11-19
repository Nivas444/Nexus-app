"""
End-to-End Verification Suite for Nexus ERP Centralized Security Architecture.

Runs against the real FastAPI application and real PostgreSQL/Supabase database
(no mock users or mock permissions).
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import ACCESS_COOKIE_NAME, CSRF_COOKIE_NAME, login_rate_limiter
from app.main import app

client = TestClient(app)


def _login(email: str, password: str):
    login_rate_limiter.reset(f"testclient:{email.lower()}")
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res


def _auth_headers(email: str, password: str):
    res = _login(email, password)
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    token = res.json()["user"]["token"]
    assert token and len(token.split(".")) == 3, "Expected a valid 3-part JWT"
    return {"Authorization": f"Bearer {token}"}, res


# 1. Public health check & valid login
def test_public_health_and_valid_login():
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok"}

    api_health = client.get("/api/health")
    assert api_health.status_code == 200
    assert api_health.json() == {"status": "ok"}

    assert settings.effective_cookie_samesite == "lax"

    headers, res = _auth_headers("master@nexus.com", "master123")
    body = res.json()
    assert body["success"] is True
    assert body["user"]["role"] == "Master"
    assert body["user"]["is_super_admin"] is True
    assert ACCESS_COOKIE_NAME in res.cookies
    assert CSRF_COOKIE_NAME in res.cookies

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "master@nexus.com"


# 2. Invalid credentials rejected
def test_invalid_credentials_rejected():
    res = _login("admin@nexus.com", "wrong-password-xyz")
    assert res.status_code == 401
    res2 = _login("nonexistent@nexus.com", "admin123")
    assert res2.status_code == 401


# 3. Expired, malformed, and tampered JWTs rejected
def test_expired_and_tampered_jwt_rejected():
    # Malformed token
    r_bad = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.valid.jwt"})
    assert r_bad.status_code == 401

    # Expired token
    expired_payload = {
        "sub": "1",
        "uid": "usr-master-01",
        "email": "master@nexus.com",
        "type": "access",
        "jti": "expired-jti-test",
        "iss": settings.JWT_ISSUER,
        "iat": int((datetime.now(timezone.utc) - timedelta(hours=2)).timestamp()),
        "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp()),
    }
    expired_token = jwt.encode(expired_payload, settings.effective_jwt_secret, algorithm=settings.JWT_ALGORITHM)
    r_exp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert r_exp.status_code == 401

    # Tampered signature
    tampered = jwt.encode(
        {
            **expired_payload,
            "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
        },
        "wrong-signing-secret-key-1234567890",
        algorithm=settings.JWT_ALGORITHM,
    )
    r_tamp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered}"})
    assert r_tamp.status_code == 401


# 4. Unauthenticated users cannot access protected APIs (401 across all modules & PDFs)
@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/v1/auth/me",
        "/api/v1/auth/users",
        "/api/v1/master/expenses",
        "/api/v1/master/products",
        "/api/v1/master/employees",
        "/api/v1/master/hr-compliance",
        "/api/v1/purchase/pr",
        "/api/v1/purchase/po",
        "/api/v1/purchase/payment",
        "/api/v1/commercial/projects",
        "/api/v1/commercial/invoice/projects",
        "/api/v1/commercial/receivable/projects",
        "/api/v1/commercial/wh/stn",
        "/api/v1/commercial/jms/po-details?po_no=TEST",
        "/api/v1/commercial/invoice/pdf/download?po_no=TEST",
        "/api/v1/commercial/jms/pdf/download?po_no=TEST&doc_type=wcc",
        "/api/v1/purchase/po/1/pdf",
    ],
)
def test_unauthenticated_requests_return_401(endpoint):
    # Use a fresh client with no cookies
    anon_client = TestClient(app)
    res = anon_client.get(endpoint)
    assert res.status_code == 401, f"Expected 401 for {endpoint}, got {res.status_code}"


# 5. Logout revokes JWT immediately
def test_logout_revokes_access_token():
    headers, _ = _auth_headers("mis@nexus.com", "mis123")
    assert client.get("/api/v1/auth/me", headers=headers).status_code == 200

    out = client.post("/api/v1/auth/logout", headers=headers)
    assert out.status_code == 200

    # Reusing the revoked access token must fail with 401
    after = client.get("/api/v1/auth/me", headers=headers)
    assert after.status_code == 401


# 6. Admin Manager can access only authorized operations (403 on Purchase/Accounts/Commercial)
def test_admin_manager_rbac_boundaries():
    headers, _ = _auth_headers("admin@nexus.com", "admin123")

    # Allowed Admin operations
    assert client.get("/api/v1/auth/users", headers=headers).status_code == 200
    assert client.get("/api/v1/auth/roles", headers=headers).status_code == 200
    assert client.get("/api/v1/master/hr-compliance", headers=headers).status_code == 200
    assert client.get("/api/v1/master/employees", headers=headers).status_code == 200

    # Restricted non-Admin operations -> 403
    assert client.get("/api/v1/purchase/po", headers=headers).status_code == 403
    assert client.get("/api/v1/commercial/receivable/projects", headers=headers).status_code == 403
    assert client.get("/api/v1/commercial/projects", headers=headers).status_code == 403


# 7. Purchase Manager cannot access restricted Admin operations (even with spoofed x-user-role header)
def test_purchase_manager_cannot_access_admin_or_spoof_role():
    headers, _ = _auth_headers("purchase@nexus.com", "purchase123")
    spoofed_headers = {**headers, "x-user-role": "Master"}

    # Allowed Purchase operations
    assert client.get("/api/v1/purchase/pr", headers=headers).status_code == 200
    assert client.get("/api/v1/purchase/po", headers=headers).status_code == 200

    # Denied Admin operations (including with spoofed role header) -> 403
    assert client.get("/api/v1/auth/users", headers=spoofed_headers).status_code == 403
    assert client.get("/api/v1/auth/roles", headers=spoofed_headers).status_code == 403
    assert client.get("/api/v1/master/hr-compliance", headers=spoofed_headers).status_code == 403
    assert client.get("/api/v1/master/employee-bank-details", headers=spoofed_headers).status_code == 403


# 8. Warehouse Manager cannot access restricted Accounts operations or Invoice PDFs
def test_warehouse_manager_cannot_access_accounts_or_invoice_pdfs():
    headers, _ = _auth_headers("warehouse@nexus.com", "warehouse123")

    # Allowed Warehouse / Inventory operations
    assert client.get("/api/v1/commercial/wh/stn", headers=headers).status_code == 200
    assert client.get("/api/v1/purchase/pr", headers=headers).status_code == 200

    # Denied Accounts operations & Commercial Invoice PDF -> 403
    assert client.get("/api/v1/commercial/receivable/projects", headers=headers).status_code == 403
    assert client.get("/api/v1/commercial/invoice/projects", headers=headers).status_code == 403
    assert client.get("/api/v1/purchase/payment", headers=headers).status_code == 403
    assert client.get("/api/v1/commercial/invoice/pdf/download?po_no=TEST", headers=headers).status_code == 403


# 9. Cookie-based mutation requires CSRF token
def test_cookie_auth_enforces_csrf_on_mutations():
    c = TestClient(app)
    res = c.post("/api/v1/auth/login", json={"email": "mis@nexus.com", "password": "mis123"})
    assert res.status_code == 200

    # Cookie-only GET works
    assert c.get("/api/v1/auth/me").status_code == 200

    # Cookie-only POST without X-CSRF-Token must be rejected with 403
    no_csrf = c.post("/api/v1/auth/logout")
    assert no_csrf.status_code == 403

    # Cookie-only POST with valid X-CSRF-Token succeeds
    csrf = c.cookies.get(CSRF_COOKIE_NAME)
    with_csrf = c.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
    assert with_csrf.status_code == 200


# 10. Frontend contains no hardcoded credentials, password hashes, or Supabase keys
def test_frontend_has_no_credentials_or_hashes():
    api_js = Path("e:/Nexus_WebUI/frontend/assets/js/api.js").read_text(encoding="utf-8")
    forbidden_markers = [
        "FRONTEND_USERS_CONFIG",
        "pwdHash",
        "service_role",
        "supabase.co",
        "offline_token_",
        "computePureSha256",
    ]
    for marker in forbidden_markers:
        assert marker not in api_js, f"Sensitive marker '{marker}' still present in frontend/assets/js/api.js"


# 11. Audit logs recorded in DB without leaking passwords
def test_audit_logs_recorded_safely():
    headers, _ = _auth_headers("master@nexus.com", "master123")
    res = client.get("/api/v1/auth/audit-logs?limit=25", headers=headers)
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    event_types = {row["event_type"] for row in logs}
    assert "login_success" in event_types
    assert "access_denied" in event_types
    # Ensure no passwords appear in audit log details
    serialized = str(logs)
    assert "master123" not in serialized
    assert "wrong-password-xyz" not in serialized
