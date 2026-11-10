import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_stn_flow():
    # 1. Fetch STN list
    response = client.get("/api/v1/commercial/stn")
    assert response.status_code == 200, response.text
    res_json = response.json()
    data = res_json.get("data") if isinstance(res_json, dict) else res_json
    assert isinstance(data, list)
    assert len(data) > 0
    first_item = data[0]
    stn_no = first_item.get("stnNo")
    assert stn_no is not None

    # 2. Update BOQ Details
    boq_payload = {
        "stn_no": stn_no,
        "boq_number": "BOQ-TEST-9999",
        "boq_date": "2026-11-10",
        "status": "Dispatch Request Pending"
    }
    boq_res = client.post("/api/v1/commercial/stn/boq", json=boq_payload)
    assert boq_res.status_code == 200, boq_res.text
    boq_data = boq_res.json()
    assert boq_data.get("success") is True
    assert boq_data.get("data", {}).get("boqNo") == "BOQ-TEST-9999"
    assert boq_data.get("data", {}).get("status") == "Dispatch Request Pending"

    # 3. Update Dispatch Details (Warehouse - no receipt name)
    dispatch_payload_warehouse = {
        "stn_no": stn_no,
        "received_location": "Warehouse",
        "received_by": "",
        "status": "Dispatch Approval Pending"
    }
    wh_res = client.post("/api/v1/commercial/stn/dispatch", json=dispatch_payload_warehouse)
    assert wh_res.status_code == 200, wh_res.text
    wh_data = wh_res.json()
    assert wh_data.get("success") is True
    assert wh_data.get("data", {}).get("receivedLocation") == "Warehouse"
    assert wh_data.get("data", {}).get("receivedBy") in [None, ""]

    # 4. Update Dispatch Details (Site - with receipt name)
    dispatch_payload_site = {
        "stn_no": stn_no,
        "received_location": "Site",
        "received_by": "Ramesh Kumar",
        "status": "Dispatch Approval Pending"
    }
    site_res = client.post("/api/v1/commercial/stn/dispatch", json=dispatch_payload_site)
    assert site_res.status_code == 200, site_res.text
    site_data = site_res.json()
    assert site_data.get("success") is True
    assert site_data.get("data", {}).get("receivedLocation") == "Site"
    assert site_data.get("data", {}).get("receivedBy") == "Ramesh Kumar"

    # 5. Fetch members endpoint
    members_res = client.get("/api/v1/commercial/dpr/members?site_id=SITE001")
    assert members_res.status_code == 200, members_res.text
    res_m = members_res.json()
    members = res_m.get("data") if isinstance(res_m, dict) else res_m
    assert isinstance(members, list)
    assert len(members) > 0
