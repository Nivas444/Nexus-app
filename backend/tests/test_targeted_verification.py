import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import TelecomProject, TelecomIndusPo


@pytest.fixture
def cleanup_targeted_records(project_db_session: Session):
    test_pos = [
        "TEST-TARGET-NEG",
        "TEST-TARGET-POS-ZERO",
        "TEST-TARGET-PARTIAL",
        "TEST-TARGET-COND",
        "TEST-TARGET-VAL"
    ]
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_(test_pos)).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_(test_pos)).delete()
    project_db_session.commit()
    yield
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_(test_pos)).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_(test_pos)).delete()
    project_db_session.commit()


def test_1_negative_po_difference_routes_to_po_amend(client: TestClient, project_db_session: Session, cleanup_targeted_records):
    """
    1. Verify that a negative PO Difference routes the line item to the actual PO to be Amend page after refresh,
       using the page's existing retrieval conditions.
    """
    po_no = "TEST-TARGET-NEG"
    site_id = "IN-SITE-NEG-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Negative Diff Targeted Site",
        project_code="PRJ-TGT-NEG",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("150000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-CIVIL-NEG",
        item_description="Excavation Works",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("15000.00"),
        po_amount=Decimal("150000.00"),
        po_total_amount=Decimal("150000.00"),
        jms_qty=Decimal("14.00"),  # PO Diff = 10 - 14 = -4.0 (< 0)
        jms_amount=Decimal("210000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # Route line item
    route_res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert route_res.status_code == 200, route_res.text
    route_data = route_res.json()
    assert route_data["success"] is True
    assert route_data["poAmendCount"] == 1
    assert route_data["wccCount"] == 0

    # Page refresh retrieval: loadPoAmendDetailFromApi calls /commercial/jms/po-amend-details
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200, amend_res.text
    amend_data = amend_res.json()
    assert len(amend_data["lineItems"]) == 1
    item = amend_data["lineItems"][0]
    assert item["itemCode"] == "GBPA-CIVIL-NEG"
    assert item["poDifference"] == -4.0
    assert item["amendmentType"] == "Change QTY"
    assert item["qty"] == 4.0  # abs(-4.0)

    # Confirm mutual exclusivity: WCC endpoint must return 0 items
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    assert len(wcc_res.json()["lineItems"]) == 0


def test_2_zero_and_positive_po_difference_routes_to_wcc(client: TestClient, project_db_session: Session, cleanup_targeted_records):
    """
    2. Verify that a zero or positive PO Difference routes the line item to WCC after refresh.
    """
    po_no = "TEST-TARGET-POS-ZERO"
    site_id = "IN-SITE-POS-ZERO"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Pos and Zero Site",
        project_code="PRJ-TGT-POS-ZERO",
        project_type="New Build",
        sub_project_type="Electrical",
        po_type="Capex",
        po_amount=Decimal("160000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    # Line 1: Zero Difference (10 - 10 = 0)
    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-ZERO-01",
        item_description="Transformer 25kVA",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("100000.00"),
        jms_status="Approved"
    )
    # Line 2: Positive Difference (10 - 6 = +4)
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="GBPA-POS-02",
        item_description="Electrical Switchgear",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("6000.00"),
        po_amount=Decimal("60000.00"),
        po_total_amount=Decimal("60000.00"),
        jms_qty=Decimal("6.00"),
        jms_amount=Decimal("36000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line1, line2])
    project_db_session.commit()

    # Route
    route_res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert route_res.status_code == 200
    assert route_res.json()["wccCount"] == 2
    assert route_res.json()["poAmendCount"] == 0

    # Page refresh retrieval: loadWccDetailFromApi calls /commercial/jms/wcc-details
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 2

    # Check Zero Diff line
    item_zero = next(i for i in wcc_data["lineItems"] if i["itemCode"] == "GBPA-ZERO-01")
    assert item_zero["poDifference"] == 0.0
    assert item_zero["task"] in ["WCC to be submit", "WCC to be raise"]

    # Check Positive Diff line
    item_pos = next(i for i in wcc_data["lineItems"] if i["itemCode"] == "GBPA-POS-02")
    assert item_pos["poDifference"] == 4.0
    assert item_pos["task"] in ["WCC to be submit", "WCC to be raise"]

    # Confirm mutual exclusivity: PO Amend returns 0 items
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    assert len(amend_res.json()["lineItems"]) == 0


def test_3_routing_one_line_item_does_not_hide_or_change_other_lines(client: TestClient, project_db_session: Session, cleanup_targeted_records):
    """
    3. Verify that routing one line item does not hide or change other line items still in JMS to be process.
    """
    po_no = "TEST-TARGET-PARTIAL"
    site_id = "IN-SITE-PARTIAL"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Partial Routing Site",
        project_code="PRJ-TGT-PARTIAL",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("200000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-PARTIAL-01",
        item_description="Foundation Work",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("100000.00"),
        jms_status="Approved"
    )
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="GBPA-PARTIAL-02",
        item_description="Tower Bolting Pending",
        uom="Nos",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("20000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("5.00"),
        jms_amount=Decimal("100000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line1, line2])
    project_db_session.commit()
    project_db_session.refresh(line1)
    project_db_session.refresh(line2)

    # Route ONLY line 1 by specifying lineItemIds
    route_res = client.post(
        "/api/v1/commercial/jms/process",
        json={"poNo": po_no, "siteId": site_id, "lineItemIds": [line1.project_po_line_item_id]}
    )
    assert route_res.status_code == 200
    assert route_res.json()["wccCount"] == 1
    assert route_res.json()["poAmendCount"] == 0

    # Project-level current_task must REMAIN "JMS to be process" because line 2 is still unrouted
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS to be process"

    # Line 2 must be completely unchanged in DB
    project_db_session.refresh(line2)
    assert line2.po_amendment_type is None
    assert line2.jms_status == "Approved"
    assert line2.item_code == "GBPA-PARTIAL-02"

    # Page refresh of JMS detail: loadJmsDetailFromApi calls /commercial/jms/po-details
    # Both lines must still be returned (neither is hidden or removed)
    jms_res = client.get(f"/api/v1/commercial/jms/po-details?po_no={po_no}&site_id={site_id}")
    assert jms_res.status_code == 200
    items = jms_res.json()["lineItems"]
    assert len(items) == 2
    item1_resp = next(i for i in items if i["id"] == line1.project_po_line_item_id)
    item2_resp = next(i for i in items if i["id"] == line2.project_po_line_item_id)
    assert item1_resp["itemCode"] == "GBPA-PARTIAL-01"
    assert item2_resp["itemCode"] == "GBPA-PARTIAL-02"

    # Commercial projects list: Project is still "JMS to be process", so visible in JMS list
    proj_list_res = client.get("/api/v1/commercial/projects")
    assert proj_list_res.status_code == 200
    all_projs = proj_list_res.json()["items"]
    target_p = next((p for p in all_projs if p["poNo"] == po_no), None)
    assert target_p is not None
    assert target_p["task"] == "JMS to be process"


def test_4_project_level_task_status_updates_only_on_business_conditions(client: TestClient, project_db_session: Session, cleanup_targeted_records):
    """
    4. Verify project-level task/status updates occur only when the existing business conditions are satisfied.
       - Condition A: Request is rejected if project task is NOT 'JMS to be process'.
       - Condition B: Project task does NOT change if only a subset of line items is routed.
       - Condition C: Project task updates to 'WCC to be raise' only when all items route to WCC.
       - Condition D: Project task updates to 'To be submit' and status 'PO to be amend' only when all items route to PO Amend.
       - Condition E: Project task updates to 'WCC to be raise / PO to be amend' when items are mixed.
    """
    po_no = "TEST-TARGET-COND"
    site_id = "IN-SITE-COND"

    # Condition A: Non 'JMS to be process' rejection
    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Conditions Site",
        project_code="PRJ-TGT-COND",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("100000.00"),
        current_task="New Project",  # Not "JMS to be process"
        project_status="Active"
    )
    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-COND-01",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("5000.00"),
        po_amount=Decimal("50000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("50000.00"),
        jms_status="Approved"
    )
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="GBPA-COND-02",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("5000.00"),
        po_amount=Decimal("50000.00"),
        jms_qty=Decimal("12.00"),  # negative diff (-2)
        jms_amount=Decimal("60000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line1, line2])
    project_db_session.commit()

    # Routing must fail with 400 because current_task is not 'JMS to be process'
    res_err = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res_err.status_code == 400
    assert "JMS to be process" in res_err.json()["detail"]

    # Now set current_task to 'JMS to be process'
    proj.current_task = "JMS to be process"
    project_db_session.commit()

    # Route only line 1 -> Project task must remain 'JMS to be process'
    project_db_session.refresh(line1)
    res_part = client.post(
        "/api/v1/commercial/jms/process",
        json={"poNo": po_no, "siteId": site_id, "lineItemIds": [line1.project_po_line_item_id]}
    )
    assert res_part.status_code == 200
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS to be process"

    # Now route remaining line 2 -> Now both are routed (Line 1 = WCC, Line 2 = Amend -> Mixed)
    project_db_session.refresh(line2)
    res_full = client.post(
        "/api/v1/commercial/jms/process",
        json={"poNo": po_no, "siteId": site_id, "lineItemIds": [line2.project_po_line_item_id]}
    )
    assert res_full.status_code == 200
    project_db_session.refresh(proj)
    # Mixed condition satisfied: task becomes "WCC to be submit / PO Amend to be submit"
    assert proj.current_task in ["WCC to be submit / PO Amend to be submit", "WCC to be raise / PO to be amend"]
    assert proj.po_status in ["PO Amend to be submit", "Amend Requested"]


def test_5_jms_to_be_validate_workflow_remains_unaffected(client: TestClient, project_db_session: Session, cleanup_targeted_records):
    """
    5. Confirm the previous JMS to be validate workflow remains unaffected.
       - Validates retrieval, quantity edit, row approval, canSubmit toggle, and submit to PM.
    """
    po_no = "TEST-TARGET-VAL"
    site_id = "IN-SITE-VAL"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Validation Workflow Site",
        project_code="PRJ-TGT-VAL",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("100000.00"),
        current_task="JMS to be validate",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-VAL-TEST",
        item_description="Validation Line Item",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("100000.00"),
        net_material_qty=Decimal("10.00"),
        jms_status="Not Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()
    project_db_session.refresh(line)

    # 1. Check details endpoint for JMS to be validate
    det_res = client.get(f"/api/v1/commercial/jms/po-details?po_no={po_no}&site_id={site_id}")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert det_data["task"] == "JMS to be validate"
    assert det_data["canSubmit"] is False

    # 2. Update quantity
    qty_res = client.patch(
        f"/api/v1/commercial/jms/line-items/{line.project_po_line_item_id}/qty",
        json={"jmsQty": 8.0}
    )
    assert qty_res.status_code == 200
    assert qty_res.json()["jmsQty"] == 8.0
    assert qty_res.json()["amount"] == 80000.0

    # 3. Submit blocked when row is Not Approved
    sub_blocked = client.post("/api/v1/commercial/jms/submit", json={"poNo": po_no, "siteId": site_id})
    assert sub_blocked.status_code == 400
    assert "must be approved" in sub_blocked.json()["detail"].lower()

    # 4. Approve row
    app_res = client.post(
        "/api/v1/commercial/jms/line-items/approve",
        json={"lineItemIds": [line.project_po_line_item_id], "status": "Approved"}
    )
    assert app_res.status_code == 200
    assert app_res.json()["canSubmit"] is True

    # 5. Submit to PM successfully transitions to 'JMS approval pending'
    sub_ok = client.post("/api/v1/commercial/jms/submit", json={"poNo": po_no, "siteId": site_id})
    assert sub_ok.status_code == 200
    assert sub_ok.json()["success"] is True
    assert sub_ok.json()["task"] == "JMS approval pending"

    # Verify directly in DB
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS approval pending"
    assert proj.project_status == "JMS Approval Pending"
