import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_indus_esh_crud_and_validation():
    # Check if dedicated test records already exist
    list_init = client.get("/api/v1/customer/indus/esh?company_name=Indus%20Tower%20Ltd")
    assert list_init.status_code == 200
    existing_items = list_init.json()["items"]

    if len(existing_items) >= 2:
        rec_id_1 = existing_items[0]["id"]
        rec_id_2 = existing_items[1]["id"]
    else:
        # 1. ADD MODE - Create Test Record 1 (On-Roll Trainee)
        create_payload_1 = {
            "name": "Ramesh Kumar Test",
            "employeeType": "On-Roll",
            "companyName": "Indus Tower Ltd",
            "aadharNumber": "4532 8901 2345",
            "trainingType": "CHCTE",
            "trainingIdNumber": "TRN-IND-2026-081",
            "trainingAgency": "National Safety Council",
            "expiryDate": "15 - 08 - 2027",
            "status": "Active"
        }

        add_resp_1 = client.post("/api/v1/customer/indus/esh", json=create_payload_1)
        assert add_resp_1.status_code == 201
        record_1 = add_resp_1.json()
        rec_id_1 = record_1["id"]
        assert record_1["name"] == "Ramesh Kumar Test"
        assert record_1["employee_type"] == "On-Roll"
        assert record_1["company_name"] == "Indus Tower Ltd"
        assert record_1["training_type"] == "CHCTE"

        # 2. ADD MODE - Create Test Record 2 (Service Vendor Trainee)
        create_payload_2 = {
            "name": "Anand Rajan Test",
            "employeeType": "Service Vendor",
            "serviceVendorName": "Delta Power & Infra",
            "aadharNumber": "9012 4432 7865",
            "trainingType": "E-STAG",
            "trainingIdNumber": "TRN-IND-2026-112",
            "trainingAgency": "Energy & Electrical Safety Board",
            "expiryDate": "10 - 05 - 2027",
            "status": "Active"
        }

        add_resp_2 = client.post("/api/v1/customer/indus/esh", json=create_payload_2)
        assert add_resp_2.status_code == 201
        record_2 = add_resp_2.json()
        rec_id_2 = record_2["id"]
        assert rec_id_2 != rec_id_1
        assert record_2["name"] == "Anand Rajan Test"
        assert record_2["employee_type"] == "Service Vendor"

    # 3. VIEW MODE - List records and check customer/company association
    list_resp = client.get("/api/v1/customer/indus/esh?company_name=Indus%20Tower%20Ltd")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 2
    assert any(i["id"] == rec_id_1 for i in list_data["items"])
    assert any(i["id"] == rec_id_2 for i in list_data["items"])

    # 4. VIEW MODE - Get single record by ID
    get_resp = client.get(f"/api/v1/customer/indus/esh/{rec_id_1}")
    assert get_resp.status_code == 200
    single_rec = get_resp.json()
    assert single_rec["id"] == rec_id_1
    assert "Ramesh Kumar" in single_rec["name"]
    assert single_rec["training_type"] == "CHCTE"

    # 5. EDIT MODE - Update existing record in place
    initial_count = list_data["total"]
    update_payload = {
        "name": "Ramesh Kumar Updated",
        "employeeType": "On-Roll",
        "companyName": "Indus Tower Ltd",
        "aadharNumber": "4532 8901 9999",
        "trainingType": "CHCTE",
        "trainingIdNumber": "TRN-IND-2026-081-REV",
        "trainingAgency": "National Safety Council of India",
        "expiryDate": "20 - 12 - 2028",
        "status": "Active"
    }

    put_resp = client.put(f"/api/v1/customer/indus/esh/{rec_id_1}", json=update_payload)
    assert put_resp.status_code == 200
    updated_rec = put_resp.json()
    assert updated_rec["id"] == rec_id_1
    assert updated_rec["name"] == "Ramesh Kumar Updated"
    assert updated_rec["training_id_number"] == "TRN-IND-2026-081-REV"
    assert updated_rec["aadhar_number"] == "4532 8901 9999"

    # Verify total record count has NOT increased
    list_after_edit = client.get("/api/v1/customer/indus/esh?company_name=Indus%20Tower%20Ltd")
    assert list_after_edit.json()["total"] == initial_count

    # 6. VALIDATION & ERROR HANDLING (No additional rows created)
    # 6a. Missing required name field on create
    invalid_add = client.post("/api/v1/customer/indus/esh", json={
        "name": ""
    })
    assert invalid_add.status_code in [422, 400]

    # 6b. Non-existent record ID on GET
    non_existent_get = client.get("/api/v1/customer/indus/esh/99999999")
    assert non_existent_get.status_code == 404

    # 6c. Non-existent record ID on PUT
    non_existent_put = client.put("/api/v1/customer/indus/esh/99999999", json=update_payload)
    assert non_existent_put.status_code == 404
