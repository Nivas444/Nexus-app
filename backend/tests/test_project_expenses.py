import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import ProjectSessionLocal
from sqlalchemy import text

@pytest.fixture
def client():
    return TestClient(app)

def test_project_expenses_by_po(client):
    """
    Verify GET /api/v1/commercial/projects/expenses returns correct expenses linked by PO
    and validates Approved, Transferred, and Payable amounts.
    """
    response = client.get("/api/v1/commercial/projects/expenses?po_no=4500128951")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] > 0
    items = data["data"]
    
    # Check item structure
    first = items[0]
    assert "id" in first
    assert "requestDate" in first
    assert "requestBy" in first
    assert "expenseType" in first
    assert "request" in first
    assert "approved" in first
    assert "transferred" in first
    assert "payable" in first
    assert "transferTo" in first
    assert "status" in first

    # Check totals
    total_approved = sum(item["raw_approved"] for item in items)
    total_transferred = sum(item["raw_transferred"] for item in items)
    total_payable = sum(item["raw_payable"] for item in items)
    assert total_approved == 445000.0
    assert total_transferred == 365000.0
    assert total_payable == 80000.0

def test_po_line_items_autocomplete(client):
    """
    Verify GET /api/v1/commercial/projects/po-line-items returns Capex/Opex line items
    for autocomplete filtering.
    """
    response = client.get("/api/v1/commercial/projects/po-line-items?po_no=4500128951")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 3
    
    # Test query filter
    response_q = client.get("/api/v1/commercial/projects/po-line-items?po_no=4500128951&q=Optical")
    assert response_q.status_code == 200
    data_q = response_q.json()
    assert data_q["count"] == 1
    assert "Optical Fiber Cable" in data_q["data"][0]["item_description"]

def test_save_project_expense_with_expense_head(client):
    """
    Verify POST /api/v1/commercial/projects/expenses stores expense_head in project_expenses.
    """
    payload = {
        "po_no": "4500128951",
        "site_id": "IN-123471",
        "expense_head": "Optical Fiber Splicing & Termination",
        "expense_name": "Optical Fiber Splicing & Termination",
        "expense_type": "Optical Fiber Splicing & Termination",
        "amount": 0.0,
        "approved_amount": 0.0,
        "transferred_amount": 0.0,
        "payable_amount": 0.0,
        "status": "Pending"
    }
    response = client.post("/api/v1/commercial/projects/expenses", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "expenseId" in res_data["data"]

    # Verify retrieval has the new expense head
    get_res = client.get("/api/v1/commercial/projects/expenses?po_no=4500128951")
    assert get_res.status_code == 200
    items = get_res.json()["data"]
    heads = [it["expenseHead"] for it in items]
    assert "Optical Fiber Splicing & Termination" in heads
