import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import TelecomProject, TelecomIndusPo


@pytest.fixture
def cleanup_routing_test_records(project_db_session: Session):
    test_pos = [
        "TEST-ROUTE-PO-ZERO",
        "TEST-ROUTE-PO-POS",
        "TEST-ROUTE-PO-NEG",
        "TEST-ROUTE-PO-VAL",
        "TEST-ROUTE-PO-MIX"
    ]
    # Cleanup before test
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_(test_pos)).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_(test_pos)).delete()
    project_db_session.commit()
    yield
    # Cleanup after test
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_(test_pos)).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_(test_pos)).delete()
    project_db_session.commit()


def test_routing_po_diff_zero(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 1: PO Qty = 10, JMS Qty = 10 -> PO Diff = 0 (>= 0)
    Route to WCC with task 'WCC to be raise'.
    Mutual exclusivity: Must NOT appear in PO Amend.
    """
    po_no = "TEST-ROUTE-PO-ZERO"
    site_id = "IN-SITE-ZERO"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Zero Diff Site",
        project_code="PRJ-ZERO-001",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("100000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-CIVIL-001",
        item_description="Civil Works",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("100000.00"),
        net_material_qty=Decimal("10.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()
    project_db_session.refresh(line)

    # Execute routing
    res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["wccCount"] == 1
    assert data["poAmendCount"] == 0
    assert data["projectTask"] in ["WCC to be submit", "WCC to be raise"]

    # Verify WCC endpoint returns line item
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 1
    item = wcc_data["lineItems"][0]
    assert item["poQty"] == 10.0
    assert item["jmsQty"] == 10.0
    assert item["poDifference"] == 0.0
    assert item["task"] in ["WCC to be submit", "WCC to be raise"]

    # Verify PO Amend endpoint returns 0 items (mutually exclusive)
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    assert len(amend_res.json()["lineItems"]) == 0


def test_routing_po_diff_positive(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 2: PO Qty = 10, JMS Qty = 7 -> PO Diff = 3 (>= 0)
    Route to WCC with task 'WCC to be raise'.
    Mutual exclusivity: Must NOT appear in PO Amend.
    """
    po_no = "TEST-ROUTE-PO-POS"
    site_id = "IN-SITE-POS"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Positive Diff Site",
        project_code="PRJ-POS-001",
        project_type="Run project",
        sub_project_type="Electrical",
        po_type="Opex",
        po_amount=Decimal("70000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-ELEC-002",
        item_description="Electrical Cabling",
        uom="Mtr",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("7.00"),
        jms_amount=Decimal("70000.00"),
        net_material_qty=Decimal("7.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["wccCount"] == 1
    assert data["poAmendCount"] == 0

    # Verify WCC details
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 1
    item = wcc_data["lineItems"][0]
    assert item["poQty"] == 10.0
    assert item["jmsQty"] == 7.0
    assert item["poDifference"] == 3.0
    assert item["task"] in ["WCC to be submit", "WCC to be raise"]

    # Verify PO Amend returns 0 items
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    assert len(amend_res.json()["lineItems"]) == 0


def test_routing_po_diff_negative(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 3: PO Qty = 10, JMS Qty = 12 -> PO Diff = -2 (< 0)
    Route to PO to be Amend with amendmentType: 'Change QTY', qty = abs(-2) = 2.0.
    Mutual exclusivity: Must NOT appear in WCC.
    """
    po_no = "TEST-ROUTE-PO-NEG"
    site_id = "IN-SITE-NEG"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Negative Diff Site",
        project_code="PRJ-NEG-001",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("120000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-CIVIL-003",
        item_description="Tower Erection",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("12.00"),
        jms_amount=Decimal("120000.00"),
        net_material_qty=Decimal("12.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["wccCount"] == 0
    assert data["poAmendCount"] == 1
    assert data["projectTask"] in ["PO Amend to be submit", "To be submit"]

    # Verify PO Amend endpoint returns line item with amendmentType "Change QTY" and qty = 2.0
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_data = amend_res.json()
    assert len(amend_data["lineItems"]) == 1
    item = amend_data["lineItems"][0]
    assert item["poQty"] == 10.0
    assert item["jmsQty"] == 12.0
    assert item["poDifference"] == -2.0
    assert item["amendmentType"] == "Change QTY"
    assert item["qty"] == 2.0  # abs(po_difference)

    # Verify WCC returns 0 items
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    assert len(wcc_res.json()["lineItems"]) == 0


def test_mixed_routing_and_removal_from_jms(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 4 & 5: Mixed line items (one >= 0, one < 0).
    Verify accurate routing, persistence on reload, and project task update.
    """
    po_no = "TEST-ROUTE-PO-MIX"
    site_id = "IN-SITE-MIX"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Mixed Site",
        project_code="PRJ-MIX-001",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("200000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    # Line 1: PO Diff = 10 - 8 = +2 -> WCC
    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-MIX-01",
        item_description="Foundation Works",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("8.00"),
        jms_amount=Decimal("80000.00"),
        jms_status="Approved"
    )
    # Line 2: PO Diff = 5 - 7 = -2 -> PO Amend
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="GBPA-MIX-02",
        item_description="Tower Bolting",
        uom="Nos",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("20000.00"),
        po_amount=Decimal("100000.00"),
        po_total_amount=Decimal("100000.00"),
        jms_qty=Decimal("7.00"),
        jms_amount=Decimal("140000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line1, line2])
    project_db_session.commit()

    # Route both lines
    res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res.status_code == 200
    data = res.json()
    assert data["wccCount"] == 1
    assert data["poAmendCount"] == 1

    # Reload WCC details
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_items = wcc_res.json()["lineItems"]
    assert len(wcc_items) == 1
    assert wcc_items[0]["itemCode"] == "GBPA-MIX-01"
    assert wcc_items[0]["poDifference"] == 2.0

    # Reload PO Amend details
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_items = amend_res.json()["lineItems"]
    assert len(amend_items) == 1
    assert amend_items[0]["itemCode"] == "GBPA-MIX-02"
    assert amend_items[0]["poDifference"] == -2.0
    assert amend_items[0]["qty"] == 2.0

    # Verify project status in commercial projects list is updated (no longer 'JMS to be process')
    proj_in_db = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert proj_in_db.current_task != "JMS to be process"


def test_routing_idempotency(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 6: Repeated routing must be idempotent and not create duplicate records.
    """
    po_no = "TEST-ROUTE-PO-POS"
    site_id = "IN-SITE-POS"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Idempotency Site",
        project_code="PRJ-IDEMP-001",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("50000.00"),
        current_task="JMS to be process",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-IDEMP-01",
        item_description="Solar Unit",
        uom="Nos",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("50000.00"),
        po_total_amount=Decimal("50000.00"),
        jms_qty=Decimal("5.00"),
        jms_amount=Decimal("50000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # First call
    res1 = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res1.status_code == 200

    # Second call (repeated routing)
    res2 = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res2.status_code == 200
    assert res2.json()["success"] is True

    # Count lines in DB to ensure no duplication
    count = project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).count()
    assert count == 1


def test_reject_other_task_categories(client: TestClient, project_db_session: Session, cleanup_routing_test_records):
    """
    Scenario 7: Rows whose task is NOT 'JMS to be process' (e.g. 'JMS to be validate')
    must be rejected by the process endpoint.
    """
    po_no = "TEST-ROUTE-PO-VAL"
    site_id = "IN-SITE-VAL"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Validate Site",
        project_code="PRJ-VAL-001",
        project_type="New Build",
        sub_project_type="Civil",
        po_type="Capex",
        po_amount=Decimal("50000.00"),
        current_task="JMS to be validate",
        project_status="Active"
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-VAL-01",
        item_description="Testing Item",
        uom="Nos",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("10000.00"),
        po_amount=Decimal("50000.00"),
        po_total_amount=Decimal("50000.00"),
        jms_qty=Decimal("5.00"),
        jms_amount=Decimal("50000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # Attempt to route a 'JMS to be validate' task -> must be rejected with 400
    res = client.post("/api/v1/commercial/jms/process", json={"poNo": po_no, "siteId": site_id})
    assert res.status_code == 400
    assert "JMS to be process" in res.json()["detail"]

    # Verify task remains unchanged in DB
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS to be validate"
