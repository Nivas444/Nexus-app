import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_indus_infra_crud_and_validation():
    # 1. VIEW MODE - Check existing records first
    list_init = client.get("/api/v1/customer/indus/infra?customer_name=Indus%20Tower%20Ltd")
    assert list_init.status_code == 200
    existing_items = list_init.json()["items"]

    if len(existing_items) >= 2:
        rec_id_1 = existing_items[0]["item_infrastructure_detail_id"]
        rec_id_2 = existing_items[1]["item_infrastructure_detail_id"]
    else:
        # 1. ADD MODE - Create Test Record 1
        create_payload_1 = {
            "customerName": "Indus Tower Ltd",
            "companyName": "Nexus",
            "infraCategory": "Tower Structure",
            "infraDescription": "40M Ground Based Lattice Tower Structure GBT-40",
            "uom": "Nos",
            "make": "Skipper Ltd",
            "commissioning": "Yes",
            "iMap": "Yes",
            "status": "Active"
        }

        add_resp_1 = client.post("/api/v1/customer/indus/infra", json=create_payload_1)
        assert add_resp_1.status_code == 201
        record_1 = add_resp_1.json()
        rec_id_1 = record_1["item_infrastructure_detail_id"]
        assert record_1["customer_name"] == "Indus Tower Ltd"
        assert record_1["infra_category"] == "Tower Structure"

        # 2. ADD MODE - Create Test Record 2
        create_payload_2 = {
            "customerName": "Indus Tower Ltd",
            "companyName": "Nexus",
            "infraCategory": "Diesel Generator",
            "infraDescription": "15 KVA Silent Diesel Generator Set CPCB-II",
            "uom": "Set",
            "make": "Kirloskar",
            "commissioning": "Yes",
            "iMap": "Yes",
            "status": "Active"
        }

        add_resp_2 = client.post("/api/v1/customer/indus/infra", json=create_payload_2)
        assert add_resp_2.status_code == 201
        record_2 = add_resp_2.json()
        rec_id_2 = record_2["item_infrastructure_detail_id"]
        assert rec_id_2 != rec_id_1

    # 3. VIEW MODE - List records and check customer isolation
    list_resp = client.get("/api/v1/customer/indus/infra?customer_name=Indus%20Tower%20Ltd")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 2
    assert any(i["item_infrastructure_detail_id"] == rec_id_1 for i in list_data["items"])
    assert any(i["item_infrastructure_detail_id"] == rec_id_2 for i in list_data["items"])

    # 4. VIEW MODE - Get single record by ID
    get_resp = client.get(f"/api/v1/customer/indus/infra/{rec_id_1}")
    assert get_resp.status_code == 200
    single_rec = get_resp.json()
    assert single_rec["item_infrastructure_detail_id"] == rec_id_1

    # 5. EDIT MODE - Update existing record in place
    initial_count = list_data["total"]
    update_payload = {
        "infraDescription": "40M Ground Based Lattice Tower Structure GBT-40 (Updated Revision)",
        "uom": "Nos",
        "make": "Skipper Heavy Ltd",
        "commissioning": "Yes",
        "iMap": "Yes",
        "status": "Active"
    }

    put_resp = client.put(f"/api/v1/customer/indus/infra/{rec_id_1}", json=update_payload)
    assert put_resp.status_code == 200
    updated_rec = put_resp.json()
    assert updated_rec["item_infrastructure_detail_id"] == rec_id_1
    assert updated_rec["infra_description"] == "40M Ground Based Lattice Tower Structure GBT-40 (Updated Revision)"
    assert updated_rec["make"] == "Skipper Heavy Ltd"

    # Verify total record count has NOT increased
    list_after_edit = client.get("/api/v1/customer/indus/infra?customer_name=Indus%20Tower%20Ltd")
    assert list_after_edit.json()["total"] == initial_count

    # 6. VALIDATION & ERROR HANDLING (No additional rows created)
    # 6a. Missing required field on create
    invalid_add = client.post("/api/v1/customer/indus/infra", json={
        "infraCategory": ""
    })
    assert invalid_add.status_code in [422, 400]

    # 6b. Non-existent record ID on GET
    non_existent_get = client.get("/api/v1/customer/indus/infra/99999999")
    assert non_existent_get.status_code == 404

    # 6c. Non-existent record ID on PUT
    non_existent_put = client.put("/api/v1/customer/indus/infra/99999999", json=update_payload)
    assert non_existent_put.status_code == 404
