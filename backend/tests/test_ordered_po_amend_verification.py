import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectDocument

client = TestClient(app)

TEST_PO_A = "TEST-PO-VERIF-A-001"
TEST_SITE_A = "IN-VERIF-SITE-01"

TEST_PO_B = "TEST-PO-VERIF-B-002"
TEST_SITE_B = "IN-VERIF-SITE-02"


def setup_module():
    db = ProjectSessionLocal()
    try:
        for po in [TEST_PO_A, TEST_PO_B]:
            db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
            db.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
            db.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
        db.commit()

        # Seed TEST_PO_A: PO Amend to be submit
        proj_a = TelecomProject(
            project_code=f"PRJ-{TEST_PO_A}",
            po_no=TEST_PO_A,
            site_id=TEST_SITE_A,
            site_name="Test Site A",
            customer_name="Indus Towers Ltd",
            project_type="New Build",
            current_task="PO Amend to be submit",
            po_status="PO Amend to be submit",
            po_amount=Decimal("15000.00")
        )
        db.add(proj_a)

        line_a = TelecomIndusPo(
            po_no=TEST_PO_A,
            site_id=TEST_SITE_A,
            line_number="001",
            item_code="ITEM-TEST-A1",
            item_description="Test Item A1",
            uom="Nos",
            po_qty=Decimal("10.00"),
            jms_qty=Decimal("20.00"),  # negative difference (-10) -> PO Amend
            po_rate=Decimal("1000.00"),
            jms_amount=Decimal("20000.00"),
            po_amendment_type="Change QTY"
        )
        db.add(line_a)
        db.commit()
    finally:
        db.close()


def teardown_module():
    db = ProjectSessionLocal()
    try:
        for po in [TEST_PO_A, TEST_PO_B]:
            db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
            db.query(ProjectDocument).filter(ProjectDocument.po_no == po).delete()
            db.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
        db.commit()
    finally:
        db.close()


def test_A_status_protection_on_open_and_back():
    """
    Test A:
    1. Opening a PO whose task is 'PO Amend to be submit' is read-only; no status update.
    2. Navigating back/refreshing: no status update.
    3. Multiple detail fetches and list fetches do NOT flip task to 'Approval Pending'.
    """
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "PO Amend to be submit"
    finally:
        db.close()

    # 1. Open PO Amend Details
    resp_detail = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_detail.status_code == 200, resp_detail.text
    data_detail = resp_detail.json()
    assert data_detail["task"] == "PO Amend to be submit"
    assert len(data_detail["lineItems"]) == 1

    # Verify DB remains unchanged
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "PO Amend to be submit"
    finally:
        db.close()

    # 2. Simulate clicking Back (fetch PO Amend projects list)
    resp_list = client.get(
        "/api/v1/commercial/po-amend/projects",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_list.status_code == 200, resp_list.text
    items = resp_list.json().get("items", [])
    matched = [it for it in items if it.get("poNo") == TEST_PO_A]
    assert len(matched) == 1
    assert matched[0]["task"] == "PO Amend to be submit"

    # 3. Simulate refreshing or reopening
    resp_detail2 = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_detail2.status_code == 200
    assert resp_detail2.json()["task"] == "PO Amend to be submit"

    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "PO Amend to be submit"
    finally:
        db.close()


def test_B_final_submission_transitions_task():
    """
    Test B:
    Only clicking Submit inside PO Amendment ID modal after validation transitions to 'Approval Pending'.
    """
    # Empty Ref ID must fail validation
    resp_fail = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "poAmendmentRefId": ""},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_fail.status_code in [400, 422]

    # Task remains 'PO Amend to be submit'
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "PO Amend to be submit"
    finally:
        db.close()

    # Submit valid Ref ID
    resp_ok = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "poAmendmentRefId": "REF-VERIF-12345"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_ok.status_code == 200, resp_ok.text
    assert resp_ok.json().get("task") == "Approval Pending"

    # Verify DB transitioned to 'Approval Pending' and stored Ref ID
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "Approval Pending"
        assert proj.po_reference_number == "REF-VERIF-12345"
    finally:
        db.close()

    # GET details reflects 'Approval Pending'
    resp_detail = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_detail.status_code == 200
    assert resp_detail.json()["task"] == "Approval Pending"
    assert resp_detail.json()["poAmendmentRefId"] == "REF-VERIF-12345"


def test_D_rejection_clears_merged_pdf_and_sets_rejected():
    """
    Test D:
    Rejecting transitions PO to 'Rejected' and clears jms_merged_document.
    """
    # Set a dummy merged document
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        proj.jms_merged_document = b"%PDF-dummy-content"
        db.commit()
    finally:
        db.close()

    # Call Reject endpoint
    resp_reject = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "workflow": "PO Amend"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_reject.status_code == 200, resp_reject.text

    # Verify DB: task is 'Rejected' and jms_merged_document is cleared
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "Rejected"
        assert proj.jms_merged_document is None
    finally:
        db.close()

    # GET details reflects 'Rejected' and hasMergedDocument == False
    resp_detail = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_detail.status_code == 200
    assert resp_detail.json()["task"] == "Rejected"
    assert resp_detail.json()["hasMergedDocument"] is False


def test_E_pdf_regeneration_and_resubmission():
    """
    Test E:
    1. Calling PDF process regenerates merged PDF in jms_merged_document.
    2. Download PDF succeeds.
    3. Details endpoint returns saved Ref ID.
    4. Resubmitting reference transitions task to 'Approval Pending'.
    """
    resp_process = client.post(
        "/api/v1/commercial/jms/pdf/process",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_process.status_code == 200, resp_process.text

    # Verify merged document exists in DB
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.jms_merged_document is not None
        assert len(proj.jms_merged_document) > 0
    finally:
        db.close()

    # Download PDF
    resp_download = client.get(
        f"/api/v1/commercial/jms/pdf/download?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_download.status_code == 200
    assert resp_download.headers.get("content-type") == "application/pdf"

    # Prepopulated previously saved Ref ID check
    resp_detail = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO_A}&site_id={TEST_SITE_A}",
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_detail.status_code == 200
    assert resp_detail.json()["poAmendmentRefId"] == "REF-VERIF-12345"
    assert resp_detail.json()["hasMergedDocument"] is True

    # Resubmit reference
    resp_resubmit = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "poAmendmentRefId": "REF-VERIF-12345-RESUBMIT"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_resubmit.status_code == 200
    assert resp_resubmit.json()["task"] == "Approval Pending"

    # Verify DB reflects 'Approval Pending' and new ref ID
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "Approval Pending"
        assert proj.po_reference_number == "REF-VERIF-12345-RESUBMIT"
    finally:
        db.close()


def test_C_approval_pending_status_modal_submission():
    """
    Test C:
    1. Validation requires revisionNo and approvedDate.
    2. Submitting valid revisionNo and approvedDate transitions task to 'Amend Approved'.
    3. Values are persisted to po_revision_number and po_amendment_completion_date.
    """
    # Validation failure cases
    resp_fail1 = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "workflow": "PO Amend", "revisionNo": "", "approvedDate": "26/10/2026"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_fail1.status_code == 400

    resp_fail2 = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "workflow": "PO Amend", "revisionNo": "REV-01", "approvedDate": ""},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_fail2.status_code == 400

    # Successful submission
    resp_ok = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": TEST_PO_A, "siteId": TEST_SITE_A, "workflow": "PO Amend", "revisionNo": "REV-01", "approvedDate": "26/10/2026"},
        headers={"x-user-role": "Commercial Manager"}
    )
    assert resp_ok.status_code == 200, resp_ok.text
    assert resp_ok.json().get("task") == "Amend Approved"
    assert resp_ok.json().get("revisionNo") == "REV-01"

    # Verify DB persistence
    db = ProjectSessionLocal()
    try:
        proj = db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO_A).first()
        assert proj.current_task == "Amend Approved"
        assert proj.po_revision_number == "REV-01"
        assert str(proj.po_amendment_completion_date) == "2026-10-26"
        assert proj.po_amendment_completion_status == "Approved"
    finally:
        db.close()

