import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def created_product_id():
    unique_suffix = "TESTPROD999"
    payload = {
        "productName": f"Telecom Mast {unique_suffix}",
        "productHead": f"Civil Mast {unique_suffix}",
        "productCategory": "Tower Infrastructure",
        "productCode": f"PRD-TEST-{unique_suffix}",
        "hsnCode": "73082019",
        "uom": "Nos",
        "saleUom": "Nos",
        "ucf": 1.0,
        "gstRate": "18%",
        "msq": 10,
        "moq": 2,
        "margin": "10%",
        "oh": "2%",
        "status": "Active"
    }
    response = client.post("/api/v1/master/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    product_id = data["material_id"]
    yield product_id

    # Cleanup after tests
    client.delete(f"/api/v1/master/products/{product_id}")

def test_get_products_list():
    response = client.get("/api/v1/master/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

def test_get_product_by_id(created_product_id):
    response = client.get(f"/api/v1/master/products/{created_product_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["material_id"] == created_product_id
    assert "productName" in data
    assert data["hsnCode"] == "73082019"
    assert data["gstRate"] == "18%"

def test_get_nonexistent_product_404():
    response = client.get("/api/v1/master/products/999999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_duplicate_product_name_conflict_409(created_product_id):
    # Fetch existing name
    existing = client.get(f"/api/v1/master/products/{created_product_id}").json()
    payload = {
        "productName": existing["productName"],
        "productHead": "Unique Head Diff",
        "productCategory": "Tower Infrastructure",
        "hsnCode": "73082019"
    }
    response = client.post("/api/v1/master/products", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"] == "Product name already exists."

def test_duplicate_material_head_conflict_409(created_product_id):
    # Fetch existing material_head
    existing = client.get(f"/api/v1/master/products/{created_product_id}").json()
    payload = {
        "productName": "Unique Product Name Diff",
        "productHead": existing["material_head"],
        "productCategory": "Tower Infrastructure",
        "hsnCode": "73082019"
    }
    response = client.post("/api/v1/master/products", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"] == "Material head already exists."

def test_update_permitted_fields(created_product_id):
    update_payload = {
        "gstRate": "5%",
        "msq": "25",
        "moq": "5",
        "margin": "15%",
        "oh": "4%",
        "status": "In - Active"
    }
    response = client.put(f"/api/v1/master/products/{created_product_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gstRate"] == "5%"
    assert data["msq"] == "25"
    assert data["moq"] == "5"
    assert data["margin"] == "15%"
    assert data["oh"] == "4%"
    assert data["status"] == "In - Active"

def test_reject_hsn_code_update_422(created_product_id):
    # Attempting to modify HSN code in edit mode must be rejected
    update_payload = {
        "hsnCode": "99999999",
        "gstRate": "18%"
    }
    response = client.put(f"/api/v1/master/products/{created_product_id}", json=update_payload)
    assert response.status_code == 422
    assert "hsn code cannot be modified" in response.json()["detail"].lower()

def test_reject_product_name_update_422(created_product_id):
    # Attempting to modify product name in edit mode must be rejected
    update_payload = {
        "productName": "Attempted New Name",
        "gstRate": "18%"
    }
    response = client.put(f"/api/v1/master/products/{created_product_id}", json=update_payload)
    assert response.status_code == 422
    assert "product name cannot be modified" in response.json()["detail"].lower()

def test_reject_material_head_update_422(created_product_id):
    # Attempting to modify material head in edit mode must be rejected
    update_payload = {
        "material_head": "Attempted New Material Head",
        "gstRate": "18%"
    }
    response = client.put(f"/api/v1/master/products/{created_product_id}", json=update_payload)
    assert response.status_code == 422
    assert "material head cannot be modified" in response.json()["detail"].lower()

def test_patch_status_toggle(created_product_id):
    response = client.patch(f"/api/v1/master/products/{created_product_id}/status", json={"is_active": True})
    assert response.status_code == 200
    assert response.json()["status"] == "Active"
