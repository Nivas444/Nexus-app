import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_indus_projects_crud_and_validation():
    # 1. Check existing records to stay strictly within the <= 4 test records budget
    list_init = client.get("/api/v1/customer/indus/projects?company_name=Indus%20Tower%20Ltd")
    assert list_init.status_code == 200
    existing_items = list_init.json()["items"]

    # Filter or reuse test projects if they exist
    test_recs = [i for i in existing_items if "Test" in str(i.get("project_type", ""))]

    if len(test_recs) >= 2:
        rec_id_1 = test_recs[0]["id"]
        rec_id_2 = test_recs[1]["id"]
        proj_type_1 = test_recs[0]["project_type"]
        sub_proj_type_1 = test_recs[0]["sub_project_type"]
        proj_type_2 = test_recs[1]["project_type"]
        sub_proj_type_2 = test_recs[1]["sub_project_type"]
    else:
        # Create Test Record 1 (New Site Build Test)
        create_payload_1 = {
            "companyName": "Indus Tower Ltd",
            "customerName": "Indus Tower Ltd",
            "projectType": "New Site Build Test",
            "subProjectType": "GBT 40M With DG Test",
            "upgradationType": "Major",
            "tat": "45 Days",
            "indusPm": "Rajesh Sharma Test",
            "indusScm": "Anand Verma Test",
            "pm": "Suresh Narayanan Test",
            "survey": "Yes",
            "additionalTransport": "Yes",
            "status": "Active"
        }
        add_resp_1 = client.post("/api/v1/customer/indus/projects", json=create_payload_1)
        assert add_resp_1.status_code == 201
        rec_1 = add_resp_1.json()
        rec_id_1 = rec_1["id"]
        proj_type_1 = rec_1["project_type"]
        sub_proj_type_1 = rec_1["sub_project_type"]
        assert rec_1["project_type"] == "New Site Build Test"
        assert rec_1["sub_project_type"] == "GBT 40M With DG Test"
        assert rec_1["tat"] == "45 Days"

        # Create Test Record 2 (Tower Sharing Test)
        create_payload_2 = {
            "companyName": "Indus Tower Ltd",
            "customerName": "Indus Tower Ltd",
            "projectType": "Tower Sharing Test",
            "subProjectType": "Rooftop RTT 15M Test",
            "upgradationType": "Minor",
            "tat": "30 Days",
            "indusPm": "Vikram Malhotra Test",
            "indusScm": "Siddharth Sen Test",
            "pm": "Manoj Swaminathan Test",
            "survey": "No",
            "additionalTransport": "Yes",
            "status": "Active"
        }
        add_resp_2 = client.post("/api/v1/customer/indus/projects", json=create_payload_2)
        assert add_resp_2.status_code == 201
        rec_2 = add_resp_2.json()
        rec_id_2 = rec_2["id"]
        proj_type_2 = rec_2["project_type"]
        sub_proj_type_2 = rec_2["sub_project_type"]
        assert rec_id_2 != rec_id_1
        assert rec_2["project_type"] == "Tower Sharing Test"

    # 2. VIEW MODE - List records and check pagination
    list_resp = client.get("/api/v1/customer/indus/projects?company_name=Indus%20Tower%20Ltd")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 2
    assert any(i["id"] == rec_id_1 for i in list_data["items"])
    assert any(i["id"] == rec_id_2 for i in list_data["items"])

    # 3. VIEW MODE - Single project by ID
    get_resp = client.get(f"/api/v1/customer/indus/projects/{rec_id_1}")
    assert get_resp.status_code == 200
    single_data = get_resp.json()
    assert single_data["id"] == rec_id_1
    assert "New Site Build" in single_data["project_type"]

    # 4. EDIT MODE - Update existing project in place
    initial_total = list_data["total"]
    update_payload = {
        "projectType": proj_type_1,
        "subProjectType": sub_proj_type_1,
        "upgradationType": "Major",
        "tat": "60 Days",
        "indusPm": "Rajesh Sharma Test Updated",
        "indusScm": "Anand Verma Test Updated",
        "pm": "Suresh Narayanan Test Updated",
        "survey": "Yes",
        "additionalTransport": "No",
        "status": "Active"
    }
    put_resp = client.put(f"/api/v1/customer/indus/projects/{rec_id_1}", json=update_payload)
    assert put_resp.status_code == 200
    updated_data = put_resp.json()
    assert updated_data["id"] == rec_id_1
    assert updated_data["tat"] == "60 Days"
    assert updated_data["indus_pm"] == "Rajesh Sharma Test Updated"
    assert updated_data["additional_transport"] == "No"

    # Verify no duplicate was created (count remains identical)
    list_after_update = client.get("/api/v1/customer/indus/projects?company_name=Indus%20Tower%20Ltd")
    assert list_after_update.json()["total"] == initial_total

    # 5. Validation and Error handling
    invalid_create = client.post("/api/v1/customer/indus/projects", json={
        "companyName": "Indus Tower Ltd"
        # missing projectType and subProjectType
    })
    assert invalid_create.status_code == 422

    not_found = client.get("/api/v1/customer/indus/projects/999999999")
    assert not_found.status_code == 404


def test_indus_project_icons_data_isolation():
    proj_type_a = "Iso Project Alpha"
    sub_proj_type_a = "Iso Sub Alpha"
    proj_type_b = "Iso Project Beta"
    sub_proj_type_b = "Iso Sub Beta"

    # =========================================================================
    # 1. ICON 1: ACTIVITY DATA ISOLATION
    # =========================================================================
    # Create Activity for Project A
    act_resp_a = client.post("/api/v1/customer/indus/project-activities", json={
        "companyName": "Indus Tower Ltd",
        "projectType": proj_type_a,
        "subProjectType": sub_proj_type_a,
        "stage": "C1",
        "activity": "Alpha Soil & Foundation Survey",
        "days": "3"
    })
    assert act_resp_a.status_code == 201
    act_a_id = act_resp_a.json()["id"]

    # Create Activity for Project B
    act_resp_b = client.post("/api/v1/customer/indus/project-activities", json={
        "companyName": "Indus Tower Ltd",
        "projectType": proj_type_b,
        "subProjectType": sub_proj_type_b,
        "stage": "T1",
        "activity": "Beta Tenancy Tower Load Assessment",
        "days": "7"
    })
    assert act_resp_b.status_code == 201
    act_b_id = act_resp_b.json()["id"]

    # Query Activity for Project A -> Must contain ONLY Activity A, NOT Activity B
    get_act_a = client.get(f"/api/v1/customer/indus/project-activities?project_type={proj_type_a}&sub_project_type={sub_proj_type_a}")
    assert get_act_a.status_code == 200
    items_act_a = get_act_a.json()["items"]
    act_a_ids = [i["id"] for i in items_act_a]
    assert act_a_id in act_a_ids
    assert act_b_id not in act_a_ids

    # Query Activity for Project B -> Must contain ONLY Activity B, NOT Activity A
    get_act_b = client.get(f"/api/v1/customer/indus/project-activities?project_type={proj_type_b}&sub_project_type={sub_proj_type_b}")
    assert get_act_b.status_code == 200
    items_act_b = get_act_b.json()["items"]
    act_b_ids = [i["id"] for i in items_act_b]
    assert act_b_id in act_b_ids
    assert act_a_id not in act_b_ids

    # Query Activity for Non-Existent Project -> Must return empty, never cross-contaminate
    get_act_empty = client.get("/api/v1/customer/indus/project-activities?project_type=NonExistent&sub_project_type=NonExistent")
    assert get_act_empty.status_code == 200
    assert len(get_act_empty.json()["items"]) == 0

    # =========================================================================
    # 2. ICON 2: ADDITIONAL TRANSPORT DATA ISOLATION
    # =========================================================================
    # Create Transport for Project A
    tr_resp_a = client.post("/api/v1/customer/indus/project-transports", json={
        "companyName": "Indus Tower Ltd",
        "customerName": "Indus Tower Ltd",
        "projectType": proj_type_a,
        "subProjectType": sub_proj_type_a,
        "itemCode": "TR-ALPHA-101",
        "itemDescription": "Alpha Extra Tower Transport Zone A",
        "transportZone": "A",
        "qty": "5",
        "status": "Active"
    })
    assert tr_resp_a.status_code == 201
    tr_a_id = tr_resp_a.json()["id"]

    # Create Transport for Project B
    tr_resp_b = client.post("/api/v1/customer/indus/project-transports", json={
        "companyName": "Indus Tower Ltd",
        "customerName": "Indus Tower Ltd",
        "projectType": proj_type_b,
        "subProjectType": sub_proj_type_b,
        "itemCode": "TR-BETA-202",
        "itemDescription": "Beta Heavy Cable Transport Zone D",
        "transportZone": "D",
        "qty": "10",
        "status": "Active"
    })
    assert tr_resp_b.status_code == 201
    tr_b_id = tr_resp_b.json()["id"]

    # Query Transport for Project A -> Must contain ONLY Transport A, NOT Transport B
    get_tr_a = client.get(f"/api/v1/customer/indus/project-transports?project_type={proj_type_a}&sub_project_type={sub_proj_type_a}")
    assert get_tr_a.status_code == 200
    items_tr_a = get_tr_a.json()["items"]
    tr_a_ids = [i["id"] for i in items_tr_a]
    assert tr_a_id in tr_a_ids
    assert tr_b_id not in tr_a_ids

    # Query Transport for Project B -> Must contain ONLY Transport B, NOT Transport A
    get_tr_b = client.get(f"/api/v1/customer/indus/project-transports?project_type={proj_type_b}&sub_project_type={sub_proj_type_b}")
    assert get_tr_b.status_code == 200
    items_tr_b = get_tr_b.json()["items"]
    tr_b_ids = [i["id"] for i in items_tr_b]
    assert tr_b_id in tr_b_ids
    assert tr_a_id not in tr_b_ids

    # Query Transport for Non-Existent Project -> Must return empty
    get_tr_empty = client.get("/api/v1/customer/indus/project-transports?project_type=NonExistent&sub_project_type=NonExistent")
    assert get_tr_empty.status_code == 200
    assert len(get_tr_empty.json()["items"]) == 0

    # =========================================================================
    # 3. ICON 3: APPROVAL HISTORY DATA ISOLATION
    # =========================================================================
    # Create Approval for Sub-Project A
    appr_resp_a = client.post("/api/v1/customer/indus/project-approvals", json={
        "companyName": "Indus Tower Ltd",
        "customerName": "Indus Tower Ltd",
        "subProjectType": sub_proj_type_a,
        "description": "Alpha Structural Clearance Approved by Chief Engineer."
    })
    assert appr_resp_a.status_code == 201
    appr_a_id = appr_resp_a.json()["id"]

    # Create Approval for Sub-Project B
    appr_resp_b = client.post("/api/v1/customer/indus/project-approvals", json={
        "companyName": "Indus Tower Ltd",
        "customerName": "Indus Tower Ltd",
        "subProjectType": sub_proj_type_b,
        "description": "Beta Environmental Green Tribunal NOC Granted."
    })
    assert appr_resp_b.status_code == 201
    appr_b_id = appr_resp_b.json()["id"]

    # Query Approval for Sub-Project A -> Must contain ONLY Approval A, NOT Approval B
    get_appr_a = client.get(f"/api/v1/customer/indus/project-approvals?sub_project_type={sub_proj_type_a}")
    assert get_appr_a.status_code == 200
    items_appr_a = get_appr_a.json()["items"]
    appr_a_ids = [i["id"] for i in items_appr_a]
    assert appr_a_id in appr_a_ids
    assert appr_b_id not in appr_a_ids

    # Query Approval for Sub-Project B -> Must contain ONLY Approval B, NOT Approval A
    get_appr_b = client.get(f"/api/v1/customer/indus/project-approvals?sub_project_type={sub_proj_type_b}")
    assert get_appr_b.status_code == 200
    items_appr_b = get_appr_b.json()["items"]
    appr_b_ids = [i["id"] for i in items_appr_b]
    assert appr_b_id in appr_b_ids
    assert appr_a_id not in appr_b_ids

    # Query Approval for Non-Existent Sub-Project -> Must return empty
    get_appr_empty = client.get("/api/v1/customer/indus/project-approvals?sub_project_type=NonExistentSub")
    assert get_appr_empty.status_code == 200
    assert len(get_appr_empty.json()["items"]) == 0

    # =========================================================================
    # 4. EDIT MODE VALIDATION FOR ACTIVITY & TRANSPORT
    # =========================================================================
    # Edit Activity A
    edit_act_resp = client.put(f"/api/v1/customer/indus/project-activities/{act_a_id}", json={
        "stage": "C2",
        "activity": "Alpha Soil Survey Updated",
        "days": "5"
    })
    assert edit_act_resp.status_code == 200
    act_updated = edit_act_resp.json()
    assert act_updated["stage"] == "C2"
    assert act_updated["activity"] == "Alpha Soil Survey Updated"
    assert str(act_updated["days"]) == "5"

    # Edit Transport A
    edit_tr_resp = client.put(f"/api/v1/customer/indus/project-transports/{tr_a_id}", json={
        "transportZone": "B",
        "qty": "8",
        "status": "In - Active"
    })
    assert edit_tr_resp.status_code == 200
    tr_updated = edit_tr_resp.json()
    assert tr_updated["transport_zone"] == "B"
    assert float(tr_updated["qty"]) == 8.0
    assert tr_updated["status"] == "In - Active"
