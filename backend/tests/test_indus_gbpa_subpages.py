import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# =========================================================================
# 1. MATERIALS SUBPAGE TESTS (indus_customer_gpba_materials)
# =========================================================================
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# =========================================================================
# 1. MATERIALS SUBPAGE TESTS (indus_customer_gpba_materials)
# =========================================================================
def test_gbpa_materials_crud():
    # 1. List initially
    resp = client.get("/api/v1/customer/indus/gbpa/materials?customer_name=Indus%20Tower%20Ltd")
    assert resp.status_code == 200
    initial_total = resp.json()["total"]

    # 2. View existing record
    if initial_total > 0:
        existing_mat = resp.json()["items"][0]
        mat_id = existing_mat["item_material_id"]
        assert existing_mat["customer_name"] == "Indus Tower Ltd"

        # View single item
        get_resp = client.get(f"/api/v1/customer/indus/gbpa/materials/{mat_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["item_material_id"] == mat_id

        # Edit mode (Update existing row in-place)
        update_payload = {
            "customer_name": "Indus Tower Ltd",
            "material_head": existing_mat["material_head"],
            "material_category": existing_mat["material_category"] or "Structure",
            "status": "Active"
        }
        update_resp = client.put(f"/api/v1/customer/indus/gbpa/materials/{mat_id}", json=update_payload)
        assert update_resp.status_code == 200
        assert update_resp.json()["item_material_id"] == mat_id

    # 3. Customer isolation check (Other customer should NOT see Indus record)
    list_other = client.get("/api/v1/customer/indus/gbpa/materials?customer_name=Bharti%20Airtel%20Ltd")
    assert list_other.status_code == 200
    assert not any(m["customer_name"] == "Indus Tower Ltd" for m in list_other.json()["items"])


# =========================================================================
# 2. EXPENSES SUBPAGE TESTS (indus_customer_gbpa_expenses)
# =========================================================================
def test_gbpa_expenses_crud():
    # 1. View mode
    list_indus = client.get("/api/v1/customer/indus/gbpa/expenses?customer_name=Indus%20Tower%20Ltd")
    assert list_indus.status_code == 200
    assert list_indus.json()["total"] >= 1
    exp = list_indus.json()["items"][0]
    exp_id = exp["item_expense_id"]
    assert exp["customer_name"] == "Indus Tower Ltd"

    # 2. Customer isolation
    list_other = client.get("/api/v1/customer/indus/gbpa/expenses?customer_name=Bharti%20Airtel%20Ltd")
    assert list_other.status_code == 200
    assert not any(e["customer_name"] == "Indus Tower Ltd" for e in list_other.json()["items"])

    # 3. View single item
    get_resp = client.get(f"/api/v1/customer/indus/gbpa/expenses/{exp_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["item_expense_id"] == exp_id

    # 4. Edit mode
    update_payload = {
        "customer_name": "Indus Tower Ltd",
        "expense_head": exp["expense_head"],
        "status": "Active"
    }
    update_resp = client.put(f"/api/v1/customer/indus/gbpa/expenses/{exp_id}", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["item_expense_id"] == exp_id


# =========================================================================
# 3. INFRASTRUCTURE SUBPAGE TESTS (indus_customer_gbpa_infra)
# =========================================================================
def test_gbpa_infra_crud_and_uniqueness():
    # 1. View mode
    list_indus = client.get("/api/v1/customer/indus/gbpa/infra?customer_name=Indus%20Tower%20Ltd")
    assert list_indus.status_code == 200
    assert list_indus.json()["total"] >= 1
    inf = list_indus.json()["items"][0]
    inf_id = inf["item_infrastructure_id"]
    existing_code = inf["infra_code"]

    # 2. Duplicate Infra Code Check on Add -> Must Return 409 Conflict
    dup_resp = client.post("/api/v1/customer/indus/gbpa/infra", json={
        "customer_name": "Indus Tower Ltd",
        "infra_code": existing_code,
        "infra_category": "DG Set Duplicate"
    })
    assert dup_resp.status_code == 409
    assert "already exists" in dup_resp.json()["detail"]

    # 3. Edit mode with unchanged Infra Code -> Must succeed without false duplicate error
    edit_same_code = client.put(f"/api/v1/customer/indus/gbpa/infra/{inf_id}", json={
        "customer_name": "Indus Tower Ltd",
        "infra_code": existing_code,
        "infra_description": inf["infra_description"] or "Updated description",
        "status": "Active"
    })
    assert edit_same_code.status_code == 200
    assert edit_same_code.json()["item_infrastructure_id"] == inf_id

    # 4. Customer Isolation Check
    airtel_resp = client.get("/api/v1/customer/indus/gbpa/infra?customer_name=Bharti%20Airtel%20Ltd")
    assert airtel_resp.status_code == 200
    airtel_items = airtel_resp.json()["items"]
    assert len(airtel_items) >= 1
    airtel_inf = airtel_items[0]
    airtel_inf_id = airtel_inf["item_infrastructure_id"]
    assert airtel_inf["customer_name"] == "Bharti Airtel Ltd"

    # Indus should not see Airtel's record, Airtel should not see Indus's record
    assert not any(i["item_infrastructure_id"] == airtel_inf_id for i in list_indus.json()["items"])
    assert not any(i["item_infrastructure_id"] == inf_id for i in airtel_items)

    # 5. Duplicate Infra Code Check on Edit -> Changing Airtel Infra Code to Indus's existing code must return 409
    edit_dup = client.put(f"/api/v1/customer/indus/gbpa/infra/{airtel_inf_id}", json={
        "infra_code": existing_code
    })
    assert edit_dup.status_code == 409
    assert "already exists" in edit_dup.json()["detail"]
