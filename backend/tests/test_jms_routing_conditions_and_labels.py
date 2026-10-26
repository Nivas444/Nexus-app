import io
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import (
    TelecomProject,
    TelecomIndusPo,
    ProjectDocument
)


@pytest.fixture
def cleanup_routing_records(project_db_session: Session):
    test_pos = [
        "TEST-ROUTING-NEG",
        "TEST-ROUTING-ZERO",
        "TEST-ROUTING-POS",
        "TEST-ROUTING-ZERO-JMS",
        "TEST-ROUTING-MIXED",
        "TEST-TASK-LABEL-PO",
        "TEST-TASK-LABEL-WCC"
    ]
    for po in test_pos:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
    project_db_session.commit()

    yield

    for po in test_pos:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
    project_db_session.commit()


def _create_minimal_pdf() -> bytes:
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 700, "Minimal Test PDF")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_negative_difference_routes_to_po_amend_only(
    client: TestClient, project_db_session: Session, cleanup_routing_records
):
    """
    Formula: PO Material Difference = PO Qty - JMS Qty
    If PO Material Difference < 0:
    - Route PO row to PO Amend with task 'PO Amend to be submit'
    - Do NOT send row to WCC
    """
    po_no = "TEST-ROUTING-NEG"
    site_id = "IN-SITE-NEG"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Negative Diff Site",
        project_code="PRJ-NEG-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process",
        jms_merged_document=_create_minimal_pdf()
    )
    project_db_session.add(proj)
    project_db_session.flush()

    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="C-1001",
        item_description="Earth Work Excavation",
        uom="Cum",
        po_rate=Decimal("150.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("16.00"),  # PO Diff = 10 - 16 = -6 < 0
        jms_amount=Decimal("2400.00"),
        jms_status="Approved"
    )
    project_db_session.add(line)
    project_db_session.commit()

    # Submit select works
    res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "selectedWorks": {"civil": True}}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["destination"] == "po_amend"
    assert data["task"] == "PO Amend to be submit"

    # Verify PO row in PO Amend details
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_data = amend_res.json()
    assert amend_data["task"] == "PO Amend to be submit"
    assert len(amend_data["lineItems"]) == 1
    assert amend_data["lineItems"][0]["itemCode"] == "C-1001"
    assert amend_data["lineItems"][0]["poDifference"] == -6.0

    # Verify PO row does NOT appear in WCC details
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 0


def test_zero_difference_routes_to_wcc_only(
    client: TestClient, project_db_session: Session, cleanup_routing_records
):
    """
    Formula: PO Material Difference = PO Qty - JMS Qty
    If PO Material Difference == 0 (>= 0):
    - Route PO row to WCC with task 'WCC to be submit'
    - Do NOT send row to PO Amend
    """
    po_no = "TEST-ROUTING-ZERO"
    site_id = "IN-SITE-ZERO"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Zero Diff Site",
        project_code="PRJ-ZERO-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process",
        jms_merged_document=_create_minimal_pdf()
    )
    project_db_session.add(proj)
    project_db_session.flush()

    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="C-2001",
        item_description="PCC Foundation Concrete",
        uom="Cum",
        po_rate=Decimal("500.00"),
        po_qty=Decimal("12.00"),
        jms_qty=Decimal("12.00"),  # PO Diff = 12 - 12 = 0 >= 0
        jms_amount=Decimal("6000.00"),
        jms_status="Approved"
    )
    project_db_session.add(line)
    project_db_session.commit()

    # Submit select works
    res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "selectedWorks": {"civil": True}}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["destination"] == "wcc"
    assert data["task"] == "WCC to be submit"

    # Verify PO row in WCC details
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert wcc_data["task"] == "WCC to be submit"
    assert len(wcc_data["lineItems"]) == 1
    assert wcc_data["lineItems"][0]["itemCode"] == "C-2001"
    assert wcc_data["lineItems"][0]["poDifference"] == 0.0

    # Verify PO row does NOT appear in PO Amend details
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_data = amend_res.json()
    assert len(amend_data["lineItems"]) == 0


def test_positive_difference_and_zero_jms_qty_routes_to_wcc(
    client: TestClient, project_db_session: Session, cleanup_routing_records
):
    """
    Test positive difference (> 0) and zero JMS Qty (PO Qty > 0, JMS Qty = 0 => Diff > 0):
    - Both must route to WCC with 'WCC to be submit'
    - Neither must route to PO Amend
    """
    po_no = "TEST-ROUTING-POS"
    site_id = "IN-SITE-POS"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Positive Diff Site",
        project_code="PRJ-POS-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process",
        jms_merged_document=_create_minimal_pdf()
    )
    project_db_session.add(proj)
    project_db_session.flush()

    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="C-3001",
        item_description="Reinforcement Steel",
        uom="MT",
        po_rate=Decimal("65000.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("4.00"),  # PO Diff = 10 - 4 = +6 >= 0
        jms_amount=Decimal("260000.00"),
        jms_status="Approved"
    )
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="C-3002",
        item_description="Boundary Wall Plastering",
        uom="Sqm",
        po_rate=Decimal("200.00"),
        po_qty=Decimal("50.00"),
        jms_qty=Decimal("0.00"),  # Zero JMS Qty: PO Diff = 50 - 0 = +50 >= 0
        jms_amount=Decimal("0.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([line1, line2])
    project_db_session.commit()

    res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "selectedWorks": {"civil": True}}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["destination"] == "wcc"
    assert data["task"] == "WCC to be submit"

    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 2
    item_codes = [it["itemCode"] for it in wcc_data["lineItems"]]
    assert "C-3001" in item_codes
    assert "C-3002" in item_codes

    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    assert len(amend_res.json()["lineItems"]) == 0


def test_mixed_po_routes_each_row_independently(
    client: TestClient, project_db_session: Session, cleanup_routing_records
):
    """
    Mixed PO test:
    Row 1: Negative Diff (-4.0) -> PO Amend ('PO Amend to be submit')
    Row 2: Zero Diff (0.0) -> WCC ('WCC to be submit')
    Row 3: Positive Diff (+5.0) -> WCC ('WCC to be submit')

    Verify:
    1. Each row routed independently based on PO Material Difference.
    2. Zero and positive difference rows appear ONLY in WCC.
    3. Negative difference row appears ONLY in PO Amend.
    4. No duplicate rows in both destinations.
    5. Project task and status set to 'WCC to be submit / PO Amend to be submit'.
    6. Routed rows disappear from active JMS list.
    """
    po_no = "TEST-ROUTING-MIXED"
    site_id = "IN-SITE-MIXED"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Mixed Routing Site",
        project_code="PRJ-MIX-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process",
        jms_merged_document=_create_minimal_pdf()
    )
    project_db_session.add(proj)
    project_db_session.flush()

    line_neg = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="ITEM-NEG",
        item_description="Extra Cable Trenching",
        uom="Mtr",
        po_rate=Decimal("100.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("14.00"),  # 10 - 14 = -4 < 0
        jms_amount=Decimal("1400.00"),
        jms_status="Approved"
    )
    line_zero = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="ITEM-ZERO",
        item_description="DG Foundation Pad",
        uom="Nos",
        po_rate=Decimal("5000.00"),
        po_qty=Decimal("2.00"),
        jms_qty=Decimal("2.00"),  # 2 - 2 = 0 >= 0
        jms_amount=Decimal("10000.00"),
        jms_status="Approved"
    )
    line_pos = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="30",
        item_code="ITEM-POS",
        item_description="Earthing Plate Installation",
        uom="Nos",
        po_rate=Decimal("800.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("5.00"),  # 10 - 5 = +5 >= 0
        jms_amount=Decimal("4000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([line_neg, line_zero, line_pos])
    project_db_session.commit()

    # Route via select-works/submit
    submit_res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "selectedWorks": {"civil": True}}
    )
    assert submit_res.status_code == 200, submit_res.text
    submit_data = submit_res.json()
    assert submit_data["destination"] == "mixed"
    assert submit_data["task"] == "WCC to be submit / PO Amend to be submit"

    # Reload project from DB
    project_db_session.expire_all()
    reloaded_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert reloaded_proj.current_task == "WCC to be submit / PO Amend to be submit"
    assert reloaded_proj.project_status == "WCC to be submit / PO Amend to be submit"

    # Check PO Amend items: ONLY ITEM-NEG
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_items = amend_res.json()["lineItems"]
    amend_codes = [it["itemCode"] for it in amend_items]
    assert amend_codes == ["ITEM-NEG"]
    assert amend_items[0]["poDifference"] == -4.0

    # Check WCC items: ONLY ITEM-ZERO and ITEM-POS
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_items = wcc_res.json()["lineItems"]
    wcc_codes = [it["itemCode"] for it in wcc_items]
    assert set(wcc_codes) == {"ITEM-ZERO", "ITEM-POS"}
    assert "ITEM-NEG" not in wcc_codes

    # Verify that reloading the pages produces consistent results
    amend_res_reload = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert [it["itemCode"] for it in amend_res_reload.json()["lineItems"]] == ["ITEM-NEG"]

    wcc_res_reload = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert set([it["itemCode"] for it in wcc_res_reload.json()["lineItems"]]) == {"ITEM-ZERO", "ITEM-POS"}


def test_task_label_approval_pending_in_wcc_and_po_amend(
    client: TestClient, project_db_session: Session, cleanup_routing_records
):
    """
    Verify:
    1. In PO Amend page, task label 'Approval Pending' replaces 'Pending with Indus'.
    2. In WCC page, task label 'Approval Pending' replaces 'Pending with Indus'.
    3. Backend responses map 'Pending with Indus' or 'Approval Pending' to 'Approval Pending'.
    """
    po_wcc = "TEST-TASK-LABEL-WCC"
    site_wcc = "IN-SITE-WCC-LBL"

    proj_wcc = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_wcc,
        site_id=site_wcc,
        site_name="WCC Label Site",
        project_code="PRJ-WCC-LBL",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="Pending with Indus",
        project_status="Active"
    )
    line_wcc = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_wcc,
        site_id=site_wcc,
        line_number="10",
        item_code="WCC-LBL-01",
        item_description="Tower Painting",
        uom="Nos",
        po_rate=Decimal("2000.00"),
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("1.00"),
        jms_amount=Decimal("2000.00"),
        po_amendment_type="WCC to be submit"
    )
    project_db_session.add_all([proj_wcc, line_wcc])

    po_amend = "TEST-TASK-LABEL-PO"
    site_amend = "IN-SITE-PO-LBL"

    proj_amend = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_amend,
        site_id=site_amend,
        site_name="PO Amend Label Site",
        project_code="PRJ-PO-LBL",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="Pending with Indus",
        project_status="Active"
    )
    line_amend = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_amend,
        site_id=site_amend,
        line_number="10",
        item_code="AMEND-LBL-01",
        item_description="Extra Earth Work",
        uom="Cum",
        po_rate=Decimal("100.00"),
        po_qty=Decimal("5.00"),
        jms_qty=Decimal("10.00"),  # negative diff
        jms_amount=Decimal("1000.00"),
        po_amendment_type="PO Amend to be submit"
    )
    project_db_session.add_all([proj_amend, line_amend])
    project_db_session.commit()

    # 1. WCC Details endpoint should return 'Approval Pending'
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_wcc}&site_id={site_wcc}")
    assert wcc_res.status_code == 200
    assert wcc_res.json()["task"] == "Approval Pending"

    # 2. PO Amend Details endpoint should return 'Approval Pending'
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_amend}&site_id={site_amend}")
    assert amend_res.status_code == 200
    assert amend_res.json()["task"] == "Approval Pending"

    # 3. PO Amend Projects List endpoint should return 'Approval Pending' for proj_amend
    projects_res = client.get("/api/v1/commercial/po-amend/projects")
    assert projects_res.status_code == 200
    items = projects_res.json()["items"]
    target_item = next((it for it in items if it["poNo"] == po_amend), None)
    assert target_item is not None
    assert target_item["task"] == "Approval Pending"
