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
    payload = {
        "expenseName": "Test Tower Maintenance 2026",
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
    assert created_data["expense_name"] == "Test Tower Maintenance 2026"
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
    assert got_data["expense_name"] == "Test Tower Maintenance 2026"

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
    # 1. Create
    payload = {
        "expenseName": "Original Expense Name",
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
        "expenseName": "Updated Expense Name",
        "expenseCategory": "Human Resources",
        "expenseHead": "Opex",
        "gst": "5%",
        "status": "In - Active"
    }
    update_res = client.put(f"/api/v1/master/expenses/{exp_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["expense_name"] == "Updated Expense Name"
    assert updated["expense_category"] == "Human Resources"
    assert updated["expense_head"] == "Opex"
    assert updated["gst_rate"] == 5.0
    assert updated["status"] == "In - Active"

    # 3. Clean up
    client.delete(f"/api/v1/master/expenses/{exp_id}")

def test_patch_status_toggle(client: TestClient):
    # 1. Create
    payload = {
        "expenseName": "Status Toggle Test",
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
