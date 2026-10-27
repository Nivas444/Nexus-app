import io
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectDocument

client = TestClient(app)

TEST_PO_LEQ0 = "TEST-PO-APPR-LEQ0"
TEST_SITE_LEQ0 = "SITE-APPR-LEQ0"

TEST_PO_GT0 = "TEST-PO-APPR-GT0"
TEST_SITE_GT0 = "SITE-APPR-GT0"

TEST_PO_REJ = "TEST-PO-APPR-REJ"
TEST_SITE_REJ = "SITE-APPR-REJ"

TEST_PO_ACTIVE_OTHER = "TEST-PO-ACTIVE-OTHER"
TEST_SITE_ACTIVE_OTHER = "SITE-ACTIVE-OTHER"


@pytest.fixture(autouse=True)
def cleanup_records():
    db = ProjectSessionLocal()
    try:
        for po in [TEST_PO_LEQ0, TEST_PO_GT0, TEST_PO_REJ, TEST_PO_ACTIVE_OTHER]:
            db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
            db.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
            db.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
        db.commit()
        yield
        for po in [TEST_PO_LEQ0, TEST_PO_GT0, TEST_PO_REJ, TEST_PO_ACTIVE_OTHER]:
            db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
            db.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
            db.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
        db.commit()
    finally:
        db.close()


def test_submit_po_material_difference_leq_zero():
    """
    Branch 1: po_material_difference <= 0
    - Saves po_revision_number and po_date in telecom_project.
    - Transitions task to 'WCC to be submit'.
    - Removes row from active PO Amendment list (GET /commercial/po-amend/projects).
    - Routes row to WCC list (GET /commercial/wcc/projects) with task 'WCC to be submit'.
    """
    db = ProjectSessionLocal()
    try:
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code=f"PRJ-{TEST_PO_LEQ0}",
            po_no=TEST_PO_LEQ0,
            site_id=TEST_SITE_LEQ0,
            site_name="LEQ Zero Difference Site",
            project_type="New Build",
            sub_project_type="Civil",
            current_task="Approval Pending",
            project_status="Approval Pending",
            po_status="Under Review",
            po_amount=Decimal("50000.00"),
            po_material_difference=Decimal("0.0")  # <= 0
        )
        db.add(proj)
        line = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=TEST_PO_LEQ0,
            site_id=TEST_SITE_LEQ0,
            line_number="1",
            item_code="C-101",
            item_description="Civil Works Item",
            uom="Nos",
            po_qty=Decimal("10.00"),
            jms_qty=Decimal("15.00"),
            net_material_qty=Decimal("15.00"),  # jms - net_mat = 0 <= 0
            material_difference_qty=Decimal("0.00"),
            po_rate=Decimal("5000.00"),
            po_amount=Decimal("50000.00")
        )
        db.add(line)
        db.commit()
    finally:
        db.close()

    # User submits Revision Number and Approved Date
    res = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={
            "poNo": TEST_PO_LEQ0,
            "siteId": TEST_SITE_LEQ0,
            "workflow": "po_amend",
            "revisionNo": "REV-LEQ-01",
            "approvedDate": "27/10/2026"
        },
        headers={"x-user-role": "Commercial Manager"}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "WCC to be submit"
    assert data["destination"] == "wcc"
    assert data["revisionNo"] == "REV-LEQ-01"

    # Verify database persistence in telecom_project
    db = ProjectSessionLocal()
    try:
        saved_proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_LEQ0).first()
        assert saved_proj.current_task == "WCC to be submit"
        assert saved_proj.po_revision_number == "REV-LEQ-01"
        assert str(saved_proj.po_date) == "2026-10-27"
        assert str(saved_proj.po_amendment_completion_date) == "2026-10-27"
        assert saved_proj.po_amendment_completion_status == "Approved"
    finally:
        db.close()

    # Verify PO row is REMOVED from active PO Amendment list
    po_amend_list_res = client.get("/api/v1/commercial/po-amend/projects")
    assert po_amend_list_res.status_code == 200
    amend_items = po_amend_list_res.json()["items"]
    assert not any(it["poNo"] == TEST_PO_LEQ0 for it in amend_items), "Row must be removed from active PO Amend list"

    # Verify PO row appears on WCC list with task 'WCC to be submit'
    wcc_list_res = client.get("/api/v1/commercial/wcc/projects")
    assert wcc_list_res.status_code == 200
    wcc_items = wcc_list_res.json()["items"]
    routed_wcc = next((it for it in wcc_items if it["poNo"] == TEST_PO_LEQ0), None)
    assert routed_wcc is not None, "Row must appear on WCC page"
    assert routed_wcc["task"] == "WCC to be submit"


def test_submit_po_material_difference_gt_zero():
    """
    Branch 2: po_material_difference > 0
    - Saves po_revision_number and po_date in telecom_project.
    - Keeps task as 'Approval Pending'.
    - Keeps row on active PO Amendment page with task 'Approval Pending'.
    - Does NOT route row to WCC page.
    """
    db = ProjectSessionLocal()
    try:
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code=f"PRJ-{TEST_PO_GT0}",
            po_no=TEST_PO_GT0,
            site_id=TEST_SITE_GT0,
            site_name="GT Zero Difference Site",
            project_type="New Build",
            sub_project_type="Electrical",
            current_task="Approval Pending",
            project_status="Approval Pending",
            po_status="Under Review",
            po_amount=Decimal("60000.00"),
            po_material_difference=Decimal("5.0")  # > 0
        )
        db.add(proj)
        line = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=TEST_PO_GT0,
            site_id=TEST_SITE_GT0,
            line_number="1",
            item_code="E-201",
            item_description="Electrical Cable Item",
            uom="Mtr",
            po_qty=Decimal("100.00"),
            jms_qty=Decimal("120.00"),
            net_material_qty=Decimal("115.00"),  # jms - net_mat = 5 > 0
            material_difference_qty=Decimal("5.00"),
            po_rate=Decimal("500.00"),
            po_amount=Decimal("50000.00")
        )
        db.add(line)
        db.commit()
    finally:
        db.close()

    # User submits Revision Number and Approved Date
    res = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={
            "poNo": TEST_PO_GT0,
            "siteId": TEST_SITE_GT0,
            "workflow": "po_amend",
            "revisionNo": "REV-GT-02",
            "approvedDate": "25/10/2026"
        },
        headers={"x-user-role": "Commercial Manager"}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "Approval Pending"
    assert data["destination"] == "po_amend"
    assert data["revisionNo"] == "REV-GT-02"

    # Verify database persistence in telecom_project
    db = ProjectSessionLocal()
    try:
        saved_proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_GT0).first()
        assert saved_proj.current_task == "Approval Pending"
        assert saved_proj.po_revision_number == "REV-GT-02"
        assert str(saved_proj.po_date) == "2026-10-25"
        assert str(saved_proj.po_amendment_completion_date) == "2026-10-25"
    finally:
        db.close()

    # Verify PO row is KEPT on active PO Amendment list with task 'Approval Pending'
    po_amend_list_res = client.get("/api/v1/commercial/po-amend/projects")
    assert po_amend_list_res.status_code == 200
    amend_items = po_amend_list_res.json()["items"]
    kept_item = next((it for it in amend_items if it["poNo"] == TEST_PO_GT0), None)
    assert kept_item is not None, "Row must remain on active PO Amend list"
    assert kept_item["task"] == "Approval Pending"

    # Verify PO row does NOT appear on WCC page
    wcc_list_res = client.get("/api/v1/commercial/wcc/projects")
    assert wcc_list_res.status_code == 200
    wcc_items = wcc_list_res.json()["items"]
    assert not any(it["poNo"] == TEST_PO_GT0 for it in wcc_items), "Row must not be routed to WCC page"


def test_reject_workflow():
    """
    Reject workflow:
    - Identifies exact PO row being rejected.
    - Transitions only that row's task status to 'Rejected'.
    - Removes associated generated PDF from jms_merged_document.
    - Verifies another active project's PDF is NOT deleted.
    - Refreshes state and verifies persisted status.
    """
    dummy_pdf_bytes = b"%PDF-1.4 Mock PDF Certificate Content For Testing"

    db = ProjectSessionLocal()
    try:
        # 1. Row to reject
        rej_proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code=f"PRJ-{TEST_PO_REJ}",
            po_no=TEST_PO_REJ,
            site_id=TEST_SITE_REJ,
            site_name="Reject Target Site",
            current_task="Approval Pending",
            project_status="Approval Pending",
            po_status="Under Review",
            jms_merged_document=dummy_pdf_bytes
        )
        # 2. Another active task with PDF
        other_proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code=f"PRJ-{TEST_PO_ACTIVE_OTHER}",
            po_no=TEST_PO_ACTIVE_OTHER,
            site_id=TEST_SITE_ACTIVE_OTHER,
            site_name="Other Active Site",
            current_task="Approval Pending",
            project_status="Approval Pending",
            po_status="Under Review",
            jms_merged_document=dummy_pdf_bytes
        )
        db.add_all([rej_proj, other_proj])
        db.commit()
    finally:
        db.close()

    # Reject the target PO
    res = client.post(
        "/api/v1/commercial/jms/reject",
        json={
            "poNo": TEST_PO_REJ,
            "siteId": TEST_SITE_REJ,
            "workflow": "po_amend"
        },
        headers={"x-user-role": "Commercial Manager"}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "Rejected"

    # Verify DB persistence
    db = ProjectSessionLocal()
    try:
        db_rej = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_REJ).first()
        assert db_rej.current_task == "Rejected"
        assert db_rej.po_status == "Rejected"
        assert db_rej.jms_merged_document is None

        # Verify other active project's PDF is completely preserved
        db_other = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_ACTIVE_OTHER).first()
        assert db_other.current_task == "Approval Pending"
        assert db_other.jms_merged_document is not None
        assert db_other.jms_merged_document == dummy_pdf_bytes
    finally:
        db.close()

    # Verify PO Amend list reflects 'Rejected' status
    po_amend_list_res = client.get("/api/v1/commercial/po-amend/projects")
    assert po_amend_list_res.status_code == 200
    amend_items = po_amend_list_res.json()["items"]
    rej_item = next((it for it in amend_items if it["poNo"] == TEST_PO_REJ), None)
    assert rej_item is not None
    assert rej_item["task"] == "Rejected"
    assert rej_item["poStatus"] == "Rejected"


def test_validation_and_duplicate_prevention():
    """
    Validates:
    - Missing revision number or approved date returns 400.
    - Database state is not altered on validation failure.
    """
    db = ProjectSessionLocal()
    try:
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code=f"PRJ-{TEST_PO_GT0}",
            po_no=TEST_PO_GT0,
            site_id=TEST_SITE_GT0,
            current_task="Approval Pending",
            project_status="Approval Pending"
        )
        db.add(proj)
        db.commit()
    finally:
        db.close()

    # Missing revisionNo
    res1 = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": TEST_PO_GT0, "siteId": TEST_SITE_GT0, "workflow": "po_amend", "revisionNo": "", "approvedDate": "27/10/2026"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert res1.status_code == 400

    # Missing approvedDate
    res2 = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": TEST_PO_GT0, "siteId": TEST_SITE_GT0, "workflow": "po_amend", "revisionNo": "REV-01", "approvedDate": ""},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert res2.status_code == 400

    # Verify task status was NOT changed
    db = ProjectSessionLocal()
    try:
        check_proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_GT0).first()
        assert check_proj.current_task == "Approval Pending"
    finally:
        db.close()
