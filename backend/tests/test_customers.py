import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def created_customer_id():
    unique_suffix = "TESTCUST99"
    payload = {
        "customerName": f"Enterprise Test Corp {unique_suffix}",
        "legalName": f"Enterprise Test Corp Legal {unique_suffix}",
        "customerCode": f"CUST-{unique_suffix}",
        "businessType": "Projects",
        "gstType": "SGST",
        "gstNumber": "27AAACN1234F1Z5",
        "panNumber": "AAACN1234F",
        "invoiceType": "B2B",
        "poDigits": "301",
        "address": "Building 5, Business Park, Mumbai, MH",
        "status": "Active",
        "gstEnabled": True
    }
    response = client.post("/api/v1/master/customers", json=payload)
    assert response.status_code == 201
    data = response.json()
    cust_id = data["customer_id"]
    yield cust_id

    # Cleanup after tests
    client.delete(f"/api/v1/master/customers/{cust_id}")

def test_get_customers_list():
    response = client.get("/api/v1/master/customers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

def test_get_customer_by_id(created_customer_id):
    response = client.get(f"/api/v1/master/customers/{created_customer_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == created_customer_id
    assert "Enterprise Test Corp" in data["customerName"]
    assert data["gstNumber"] == "27AAACN1234F1Z5"
    assert data["businessType"] == "Projects"

def test_get_nonexistent_customer_404():
    response = client.get("/api/v1/master/customers/999999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_duplicate_customer_name_conflict_409(created_customer_id):
    existing = client.get(f"/api/v1/master/customers/{created_customer_id}").json()
    payload = {
        "customerName": existing["customerName"],
        "legalName": "Unique Legal Name Diff 1",
        "customerCode": "DIFF-CODE-001",
        "businessType": "Supply",
        "gstEnabled": False
    }
    response = client.post("/api/v1/master/customers", json=payload)
    assert response.status_code == 409
    assert "Customer name already exists" in response.json()["detail"]

def test_duplicate_legal_name_conflict_409(created_customer_id):
    existing = client.get(f"/api/v1/master/customers/{created_customer_id}").json()
    payload = {
        "customerName": "Unique Customer Name Diff 2",
        "legalName": existing["legalName"],
        "customerCode": "DIFF-CODE-002",
        "businessType": "Supply",
        "gstEnabled": False
    }
    response = client.post("/api/v1/master/customers", json=payload)
    assert response.status_code == 409
    assert "Legal name already exists" in response.json()["detail"]

def test_duplicate_customer_code_conflict_409(created_customer_id):
    existing = client.get(f"/api/v1/master/customers/{created_customer_id}").json()
    payload = {
        "customerName": "Unique Customer Name Diff 3",
        "legalName": "Unique Legal Name Diff 3",
        "customerCode": existing["customerCode"],
        "businessType": "Supply",
        "gstEnabled": False
    }
    response = client.post("/api/v1/master/customers", json=payload)
    assert response.status_code == 409
    assert "Customer code already exists" in response.json()["detail"]

def test_create_supply_customer_gst_disabled():
    suffix = "SUPPLYGSTOFF"
    payload = {
        "customerName": f"Supply Co {suffix}",
        "legalName": f"Supply Co Legal {suffix}",
        "customerCode": f"SUPP-{suffix}",
        "businessType": "Supply",
        "gstEnabled": False,
        "status": "Active"
    }
    response = client.post("/api/v1/master/customers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["gstNumber"] == "NA"
    assert data["gstType"] == "NA"
    assert data["businessType"] == "Supply"

    # Cleanup
    client.delete(f"/api/v1/master/customers/{data['customer_id']}")

def test_update_customer_full(created_customer_id):
    update_payload = {
        "gstType": "IGST",
        "gstNumber": "27AAACN9999F1Z9",
        "address": "Updated Address 123 Street",
        "status": "In - Active"
    }
    response = client.put(f"/api/v1/master/customers/{created_customer_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gstType"] == "IGST"
    assert data["gstNumber"] == "27AAACN9999F1Z9"
    assert data["address"] == "Updated Address 123 Street"
    assert data["status"] == "In - Active"

def test_restricted_update_permitted_fields(created_customer_id):
    # Indus green banner restricted edit: GST, GST Number, GST Type, Address, Status
    restricted_payload = {
        "gstEnabled": True,
        "gstType": "SGST",
        "gstNumber": "27AAACN8888F1Z1",
        "address": "Green Banner Address Tower",
        "status": "Active"
    }
    response = client.put(f"/api/v1/master/customers/{created_customer_id}/restricted", json=restricted_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gstType"] == "SGST"
    assert data["gstNumber"] == "27AAACN8888F1Z1"
    assert data["address"] == "Green Banner Address Tower"
    assert data["status"] == "Active"

def test_restricted_update_reject_forbidden_field_422(created_customer_id):
    # Attempting to modify customer_name or legal_name in restricted edit mode must fail with 422
    restricted_payload = {
        "customerName": "Unauthorized Rename Corp",
        "address": "Valid Address"
    }
    response = client.put(f"/api/v1/master/customers/{created_customer_id}/restricted", json=restricted_payload)
    assert response.status_code == 422
    assert "customer name cannot be modified" in response.json()["detail"].lower()

def test_patch_customer_status(created_customer_id):
    response = client.patch(f"/api/v1/master/customers/{created_customer_id}/status", json={"is_active": True})
    assert response.status_code == 200
    assert response.json()["status"] == "Active"

def test_customer_contact_crud():
    contact_payload = {
        "customerName": "Indus Towers Ltd",
        "name": "Rajesh Sharma",
        "designation": "Procurement Head",
        "contact": "+91 9876543210",
        "email": "rajesh.sharma@industowers.com",
        "status": "Active"
    }
    create_res = client.post("/api/v1/customer-contacts", json=contact_payload)
    assert create_res.status_code == 201
    contact_data = create_res.json()
    contact_id = contact_data["contact_id"]
    assert contact_data["name"] == "Rajesh Sharma"

    # List contacts
    list_res = client.get("/api/v1/customer-contacts?customer_name=Indus%20Towers%20Ltd")
    assert list_res.status_code == 200
    assert any(c["contact_id"] == contact_id for c in list_res.json()["items"])

    # Cleanup
    del_res = client.delete(f"/api/v1/customer-contacts/{contact_id}")
    assert del_res.status_code == 200

def test_customer_location_crud():
    loc_payload = {
        "customerName": "Indus Towers Ltd",
        "officeName": "Gurgaon Circle Office",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "status": "Active"
    }
    create_res = client.post("/api/v1/customer-locations", json=loc_payload)
    assert create_res.status_code == 201
    loc_data = create_res.json()
    office_id = loc_data["office_id"]
    assert loc_data["officeName"] == "Gurgaon Circle Office"

    # List locations
    list_res = client.get("/api/v1/customer-locations?customer_name=Indus%20Towers%20Ltd")
    assert list_res.status_code == 200
    assert any(l["office_id"] == office_id for l in list_res.json()["items"])

    # Cleanup
    del_res = client.delete(f"/api/v1/customer-locations/{office_id}")
    assert del_res.status_code == 200
