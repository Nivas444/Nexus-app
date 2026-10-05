import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_expenses_list_empty_or_populated(client: TestClient):
    response = client.get("/api/v1/master/expenses")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

def test_create_and_get_capex_expense(client: TestClient):
    import time
    ts = int(time.time() * 1000)
    exp_name = f"Test Tower Maintenance {ts}"
    payload = {
        "expenseName": exp_name,
        "expenseCategory": "Direct Operations",
        "expenseSubCategory": "Civil Works",
        "expenseHead": "Capex",
        "gst": "18%",
        "depreciation_rate": "15%",
        "rcm": False,
        "status": "Active"
    }
    create_res = client.post("/api/v1/master/expenses", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["expense_name"] == exp_name
    assert created_data["expense_head"] == "Capex"
    assert created_data["depreciation"] is True
    assert created_data["gst_rate"] == 18.0
    assert created_data["status"] == "Active"
    
    expense_id = created_data["expense_id"]

    # Verify GET by ID
    get_res = client.get(f"/api/v1/master/expenses/{expense_id}")
    assert get_res.status_code == 200
    got_data = get_res.json()
    assert got_data["expense_id"] == expense_id
    assert got_data["expense_name"] == exp_name

    # Clean up test record
    delete_res = client.delete(f"/api/v1/master/expenses/{expense_id}")
    assert delete_res.status_code == 200

def test_create_opex_forces_depreciation_false(client: TestClient):
    payload = {
        "expense_name": "Test Office Utilities Opex",
        "expense_category": "Administrative Support",
        "expense_sub_category": "Office Utilities",
        "expense_head": "Opex",
        "gst_rate": "18%",
        "depreciation": True,  # Should be forced to False by business rule for Opex
        "rcm": True,
        "status": "Active"
    }
    create_res = client.post("/api/v1/master/expenses", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["expense_head"] == "Opex"
    assert created["depreciation"] is False
    assert created["rcm"] is True
    
    expense_id = created["expense_id"]
    client.delete(f"/api/v1/master/expenses/{expense_id}")

def test_validation_error_empty_name(client: TestClient):
    payload = {
        "expense_name": "",
        "expense_head": "Capex"
    }
    create_res = client.post("/api/v1/master/expenses", json=payload)
    assert create_res.status_code in (422, 400)

def test_get_nonexistent_expense_404(client: TestClient):
    response = client.get("/api/v1/master/expenses/999999999")
    assert response.status_code == 404

def test_update_expense(client: TestClient):
    import time
    ts = int(time.time() * 1000)
    # 1. Create
    payload = {
        "expenseName": f"Original Expense Name {ts}",
        "expenseCategory": "Material Procurement",
        "expenseHead": "Capex",
        "gst": "18%",
        "status": "Active"
    }
    res = client.post("/api/v1/master/expenses", json=payload)
    assert res.status_code == 201
    exp_id = res.json()["expense_id"]

    # 2. Update
    update_payload = {
        "expenseName": f"Updated Expense Name {ts}",
        "expenseCategory": "Human Resources",
        "expenseHead": "Opex",
        "gst": "5%",
        "status": "In - Active"
    }
    update_res = client.put(f"/api/v1/master/expenses/{exp_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["expense_name"] == f"Updated Expense Name {ts}"
    assert updated["expense_category"] == "Human Resources"
    assert updated["expense_head"] == "Opex"
    assert updated["gst_rate"] == 5.0
    assert updated["status"] == "In - Active"

    # 3. Clean up
    client.delete(f"/api/v1/master/expenses/{exp_id}")

def test_patch_status_toggle(client: TestClient):
    import time
    ts = int(time.time() * 1000)
    # 1. Create
    payload = {
        "expenseName": f"Status Toggle Test {ts}",
        "status": "Active"
    }
    res = client.post("/api/v1/master/expenses", json=payload)
    assert res.status_code == 201
    exp_id = res.json()["expense_id"]

    # 2. Toggle to In - Active
    patch_res = client.patch(f"/api/v1/master/expenses/{exp_id}/status", json={"is_active": False})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In - Active"

    # 3. Toggle back to Active
    patch_res2 = client.patch(f"/api/v1/master/expenses/{exp_id}/status", json={"status": "Active"})
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "Active"

    # 4. Clean up
    client.delete(f"/api/v1/master/expenses/{exp_id}")

def test_download_template(client: TestClient):
    response = client.get("/api/v1/master/expenses/template")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Expense Name" in response.text

def test_duplicate_expense_name_conflict_409(client: TestClient):
    payload = {
        "expenseName": "Unique Expense Conflict Test",
        "expenseCategory": "Direct Operations",
        "expenseHead": "Capex"
    }
    # 1. First creation succeeds
    res1 = client.post("/api/v1/master/expenses", json=payload)
    assert res1.status_code == 201
    exp_id = res1.json()["expense_id"]

    try:
        # 2. Duplicate creation fails with 409
        res2 = client.post("/api/v1/master/expenses", json=payload)
        assert res2.status_code == 409
        assert "Expense name already exists." in res2.json()["detail"]
    finally:
        client.delete(f"/api/v1/master/expenses/{exp_id}")

def test_duplicate_expense_code_conflict_409(client: TestClient):
    payload1 = {
        "expenseName": "Expense Code Test 1",
        "expense_code": "EXP-DUPLICATE-001",
        "expenseHead": "Capex"
    }
    payload2 = {
        "expenseName": "Expense Code Test 2",
        "expense_code": "EXP-DUPLICATE-001",
        "expenseHead": "Capex"
    }
    res1 = client.post("/api/v1/master/expenses", json=payload1)
    assert res1.status_code == 201
    exp_id = res1.json()["expense_id"]

    try:
        res2 = client.post("/api/v1/master/expenses", json=payload2)
        assert res2.status_code == 409
        assert "Expense code already exists." in res2.json()["detail"]
    finally:
        client.delete(f"/api/v1/master/expenses/{exp_id}")

def test_update_expense_duplicate_name_conflict_409(client: TestClient):
    import time
    ts = int(time.time() * 1000)
    name_alpha = f"Expense Alpha {ts}"
    name_beta = f"Expense Beta {ts}"
    res1 = client.post("/api/v1/master/expenses", json={"expenseName": name_alpha, "expenseHead": "Capex"})
    assert res1.status_code == 201
    id1 = res1.json()["expense_id"]

    res2 = client.post("/api/v1/master/expenses", json={"expenseName": name_beta, "expenseHead": "Capex"})
    assert res2.status_code == 201
    id2 = res2.json()["expense_id"]

    try:
        # Try updating Beta's name to Alpha's name
        update_res = client.put(f"/api/v1/master/expenses/{id2}", json={"expenseName": name_alpha})
        assert update_res.status_code == 409
        assert "Expense name already exists." in update_res.json()["detail"]
    finally:
        client.delete(f"/api/v1/master/expenses/{id1}")
        client.delete(f"/api/v1/master/expenses/{id2}")

