import io
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.models.commercial_project import (
    TelecomProject,
    TelecomIndusPo,
    ProjectDocument
)


@pytest.fixture
def cleanup_workflow_records(project_db_session: Session):
    test_pos = [
        "TEST-POAMEND-WF-01",
        "TEST-POAMEND-WF-02",
        "TEST-WCC-WF-01",
        "TEST-WCC-WF-02",
        "TEST-ISOLATION-A",
        "TEST-ISOLATION-B",
        "TEST-WCC-SHARED"
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


def _create_sample_pdf(text_label: str) -> bytes:
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 700, f"Workflow Test PDF: {text_label}")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_1_po_amend_initial_submit_persists_reference_and_transitions_task(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement A1:
    - User submits PO Reference Number modal
    - Saves reference number to telecom_project.po_amendment_ref_id and po_reference_number
    - Transitions task to 'Approval Pending'
    - Unrelated rows remain unaffected
    """
    po_no = "TEST-POAMEND-WF-01"
    site_id = "IN-SITE-PA-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-PA-001",
        po_no=po_no,
        site_id=site_id,
        site_name="Guindy Central",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="PO Amend to be submit",
        po_status="Amend Requested",
        po_amount=Decimal("150000.00")
    )
    po_item = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        item_code="IND-CIV-001",
        item_description="Civil Tower Foundation",
        uom="Nos",
        po_qty=Decimal("2.00"),
        po_rate=Decimal("75000.00"),
        po_amount=Decimal("150000.00"),
        jms_status="Approved"
    )
    project_db_session.add(proj)
    project_db_session.add(po_item)
    project_db_session.commit()

    # Empty ref ID should fail validation
    bad_res = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_no, "siteId": site_id, "poAmendmentRefId": "   "}
    )
    assert bad_res.status_code in (400, 422)

    # Submit valid reference number
    ref_val = "REF-INDUS-2026-99"
    res = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_no, "siteId": site_id, "poAmendmentRefId": ref_val}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "Approval Pending"
    assert data["poAmendmentRefId"] == ref_val

    # Query directly from DB
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj is not None
    assert db_proj.current_task == "Approval Pending"
    assert db_proj.po_amendment_ref_id == ref_val
    assert db_proj.po_reference_number == ref_val


def test_2_po_amend_approval_pending_reject_action(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement A2 Reject:
    - User clicks Reject on row in 'Approval Pending'
    - Task transitions to 'Rejected'
    - Clears jms_merged_document and po_amendment_merged_document
    - Download generated PDF blocks stale document (returns 404)
    """
    po_no = "TEST-POAMEND-WF-01"
    site_id = "IN-SITE-PA-01"

    sample_pdf = _create_sample_pdf("Stale Approved Certificate")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-PA-001",
        po_no=po_no,
        site_id=site_id,
        site_name="Guindy Central",
        current_task="Approval Pending",
        po_status="Under Review",
        po_amendment_ref_id="REF-123",
        jms_merged_document=sample_pdf,
        po_amendment_merged_document=sample_pdf
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Reject PO row
    rej_res = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_no, "siteId": site_id, "workflow": "PO Amend"}
    )
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["success"] is True
    assert rej_data["task"] == "Rejected"

    # Verify DB state
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "Rejected"
    assert db_proj.jms_merged_document is None
    assert db_proj.po_amendment_merged_document is None

    # Attempt to download stale document - must be blocked with 404
    dl_res = client.get(f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}")
    assert dl_res.status_code == 404


def test_3_po_amend_approval_pending_submit_action(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement A2 Submit:
    - User clicks Submit on row in 'Approval Pending'
    - Captures Revision No & Approved Date
    - Validates values, saves in database (po_revision_number, po_amendment_completion_date)
    - Transitions task to 'Amend Approved'
    """
    po_no = "TEST-POAMEND-WF-01"
    site_id = "IN-SITE-PA-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-PA-001",
        po_no=po_no,
        site_id=site_id,
        current_task="Approval Pending",
        po_status="Under Review"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Missing fields should fail
    bad_res = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={"poNo": po_no, "siteId": site_id, "workflow": "PO Amend", "revisionNo": "", "approvedDate": ""}
    )
    assert bad_res.status_code in (400, 422)

    # Submit amendment status
    sub_res = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "workflow": "PO Amend",
            "revisionNo": "REV-02",
            "approvedDate": "15-10-2026"
        }
    )
    assert sub_res.status_code == 200
    data = sub_res.json()
    assert data["success"] is True
    assert data["task"] == "WCC to be submit"

    # Verify DB values
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "WCC to be submit"
    assert db_proj.po_revision_number == "REV-02"
    assert str(db_proj.po_date) == "2026-10-15"
    assert str(db_proj.po_amendment_completion_date) == "2026-10-15"
    assert db_proj.po_amendment_completion_status == "Approved"


def test_4_po_amend_rejected_pdf_process_and_resubmission(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement A3:
    - Row is in 'Rejected' state
    - PDF Process action regenerates certificate and merges with existing docs
    - On success, PDF download becomes available
    - Resubmission pre-populates previously saved Ref ID, saves and transitions to 'Approval Pending'
    """
    po_no = "TEST-POAMEND-WF-02"
    site_id = "IN-SITE-PA-02"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-PA-002",
        po_no=po_no,
        site_id=site_id,
        site_name="Velachery Hub",
        current_task="Rejected",
        po_status="Rejected",
        po_amendment_ref_id="PREV-REF-100",
        po_amount=Decimal("80000.00")
    )
    po_item = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        item_code="IND-ELE-002",
        item_description="Electrical Panel Cabling",
        uom="Nos",
        po_qty=Decimal("1.00"),
        po_rate=Decimal("80000.00"),
        po_amount=Decimal("80000.00"),
        jms_status="Approved"
    )
    project_db_session.add(proj)
    project_db_session.add(po_item)
    project_db_session.commit()

    # Upload an additional document via API
    add_pdf = _create_sample_pdf("Site Photo Page")
    up_res = client.post(
        "/api/v1/commercial/jms/documents",
        data={"po_no": po_no, "site_id": site_id, "doc_type": "Site Photos", "doc_details": "Pre-installation site photo"},
        files={"file": ("Site_Photos.pdf", io.BytesIO(add_pdf), "application/pdf")}
    )
    assert up_res.status_code == 200

    # Detail API returns hasMergedDocument=False and pre-populates poAmendmentRefId
    det_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert det_data["task"] == "Rejected"
    assert det_data["hasMergedDocument"] is False
    assert det_data["poAmendmentRefId"] == "PREV-REF-100"

    # Trigger PDF Process
    proc_res = client.post(
        "/api/v1/commercial/jms/pdf/process",
        json={"poNo": po_no, "siteId": site_id}
    )
    assert proc_res.status_code == 200
    proc_data = proc_res.json()
    assert proc_data["success"] is True
    assert proc_data["totalPages"] >= 4  # 3 certificate pages + 1 additional doc page

    # PDF Download is now available
    dl_res = client.get(f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    reader = PdfReader(io.BytesIO(dl_res.content))
    assert len(reader.pages) == proc_data["totalPages"]

    # Resubmission transitions back to Approval Pending
    sub_res = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_no, "siteId": site_id, "poAmendmentRefId": "PREV-REF-100"}
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["task"] == "Approval Pending"

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "Approval Pending"
    assert db_proj.po_amendment_ref_id == "PREV-REF-100"


def test_5_wcc_initial_submit_persists_details_and_transitions_task(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement B1:
    - User opens WCC details modal
    - Collects WCC Number, WCC Date, WCC Amount
    - Validates values, saves in telecom_project table (wcc_no, wcc_submission_date, wcc_amount)
    - Transitions task to 'Approval Pending'
    """
    po_no = "TEST-WCC-WF-01"
    site_id = "IN-SITE-WCC-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-001",
        po_no=po_no,
        site_id=site_id,
        site_name="Tambaram Hub",
        current_task="WCC to be submit",
        po_status="WCC Requested",
        po_amount=Decimal("245000.00")
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Invalid submissions should fail
    res_bad1 = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={"poNo": po_no, "siteId": site_id, "wccNo": "", "wccDate": "20-10-2026", "wccAmount": 100}
    )
    assert res_bad1.status_code in (400, 422)

    res_bad2 = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={"poNo": po_no, "siteId": site_id, "wccNo": "WCC-123", "wccDate": "20-10-2026", "wccAmount": 0}
    )
    assert res_bad2.status_code in (400, 422)

    # Valid submission
    wcc_num = "WCC-TN-2026-0042"
    wcc_dt = "20-10-2026"
    wcc_amt = 245000.00

    res = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={"poNo": po_no, "siteId": site_id, "wccNo": wcc_num, "wccDate": wcc_dt, "wccAmount": wcc_amt}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "Approval Pending"
    assert data["wccNo"] == wcc_num
    assert "2026-10-20" in data["wccDate"] or "20-10-2026" in data["wccDate"] or "20/10/2026" in data["wccDate"]
    assert float(data["wccAmount"]) == wcc_amt

    # Verify DB persistence
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "Approval Pending"
    assert db_proj.wcc_no == wcc_num
    assert str(db_proj.wcc_submission_date) == "2026-10-20"
    assert float(db_proj.wcc_amount) == wcc_amt


def test_6_wcc_approval_pending_reject_and_submit_actions(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement B2:
    - In 'Approval Pending', Reject changes task to 'Rejected' and clears jms_merged_document
    - Submit opens PO Amendment Status modal, captures Revision No & Approved Date,
      saves to po_revision_number and wcc_approved_date, transitions to 'WCC Approved'
    """
    po_no = "TEST-WCC-WF-01"
    site_id = "IN-SITE-WCC-01"

    sample_pdf = _create_sample_pdf("WCC Merged Document")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-001",
        po_no=po_no,
        site_id=site_id,
        current_task="Approval Pending",
        jms_merged_document=sample_pdf
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Reject
    rej_res = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_no, "siteId": site_id, "workflow": "WCC"}
    )
    assert rej_res.status_code == 200
    assert rej_res.json()["task"] == "Rejected"

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "Rejected"
    assert db_proj.jms_merged_document is None

    # Now simulate approval flow
    db_proj.current_task = "Approval Pending"
    project_db_session.commit()

    sub_res = client.post(
        "/api/v1/commercial/jms/submit-amendment-status",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "workflow": "WCC",
            "revisionNo": "REV-01",
            "approvedDate": "22-10-2026"
        }
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["task"] == "WCC Approved"

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "WCC Approved"
    assert db_proj.po_revision_number == "REV-01"
    assert str(db_proj.wcc_approved_date) == "2026-10-22"


def test_6b_wcc_approval_pending_submit_receipt_action(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement B2 Submit:
    - User clicks Submit in WCC 'Approval Pending'
    - Opens Receipt No tab
    - Saves Receipt No, Receipt Date and ERS No in telecom_projects in project DB
    - Changes task to 'WCC Approved'
    """
    po_no = "TEST-WCC-WF-01"
    site_id = "IN-SITE-WCC-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-001",
        po_no=po_no,
        site_id=site_id,
        current_task="Approval Pending",
        po_status="Under Review"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Missing required receipt fields fails
    bad_res = client.post(
        "/api/v1/commercial/jms/wcc/submit-receipt",
        json={"poNo": po_no, "siteId": site_id, "receiptNo": "", "receiptDate": ""}
    )
    assert bad_res.status_code in (400, 422)

    # Valid submission
    rec_res = client.post(
        "/api/v1/commercial/jms/wcc/submit-receipt",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "receiptNo": "REC-INDUS-8899",
            "receiptDate": "25-10-2026",
            "ersNo": "ERS-2026-0012"
        }
    )
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["success"] is True
    assert rec_data["task"] == "to be submit"
    assert rec_data["receiptNo"] == "REC-INDUS-8899"
    assert "2026-10-25" in rec_data["receiptDate"]
    assert rec_data["ersNo"] == "ERS-2026-0012"

    # Verify DB persistence directly
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "to be submit"
    assert db_proj.receipt_no == "REC-INDUS-8899"
    assert str(db_proj.receipt_date) == "2026-10-25"
    assert db_proj.ers_no == "ERS-2026-0012"

    # Verify completed PO is removed from active WCC project worklist
    wcc_list_res = client.get("/api/v1/commercial/wcc/projects")
    assert wcc_list_res.status_code == 200
    active_pos = [item["poNo"] for item in wcc_list_res.json()["items"]]
    assert po_no not in active_pos

    # Detail API exposes saved receipt fields
    det_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert det_data["receiptNo"] == "REC-INDUS-8899"
    assert "25/10/2026" in det_data["receiptDate"] or "2026-10-25" in det_data["receiptDate"]
    assert det_data["ersNo"] == "ERS-2026-0012"


def test_7_wcc_rejected_pdf_process_and_prepopulation(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement B3:
    - In Rejected task state:
      - WCC detail returns previously saved values without resetting
      - PDF Process regenerates certificate and merges additional docs without duplicates
      - Resubmission returns task to 'Approval Pending'
    """
    po_no = "TEST-WCC-WF-02"
    site_id = "IN-SITE-WCC-02"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-002",
        po_no=po_no,
        site_id=site_id,
        current_task="Rejected",
        wcc_no="WCC-SAVED-999",
        wcc_submission_date="2026-10-18",
        wcc_amount=Decimal("180000.00"),
        po_amount=Decimal("180000.00")
    )
    po_item = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        item_code="IND-SRV-003",
        item_description="Service Commissioning",
        uom="Nos",
        po_qty=Decimal("1.00"),
        po_rate=Decimal("180000.00"),
        po_amount=Decimal("180000.00"),
        jms_status="Approved"
    )
    project_db_session.add(proj)
    project_db_session.add(po_item)
    project_db_session.commit()

    # Pre-population verification in get_wcc_po_details
    det_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert det_data["task"] == "Rejected"
    assert det_data["wccNo"] == "WCC-SAVED-999"
    assert "18/10/2026" in det_data["wccDate"] or "2026-10-18" in det_data["wccDate"]
    assert float(det_data["wccAmount"]) == 180000.00

    # PDF Process regeneration
    proc_res = client.post(
        "/api/v1/commercial/jms/pdf/process",
        json={"poNo": po_no, "siteId": site_id}
    )
    assert proc_res.status_code == 200
    assert proc_res.json()["success"] is True

    # Resubmission transitions to Approval Pending
    sub_res = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": det_data["wccNo"],
            "wccDate": det_data["wccDate"],
            "wccAmount": det_data["wccAmount"]
        }
    )
    assert sub_res.status_code == 200
    assert sub_res.json()["task"] == "Approval Pending"


def test_8_isolation_unrelated_projects_remain_unaffected(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement Isolation:
    - Mutating Project A must not modify or alter Project B's task, reference, or documents
    """
    po_a = "TEST-ISOLATION-A"
    po_b = "TEST-ISOLATION-B"

    pdf_b = _create_sample_pdf("Project B Untouched Certificate")

    proj_a = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-ISO-A",
        po_no=po_a,
        site_id="SITE-A",
        current_task="PO Amend to be submit",
        po_amount=Decimal("50000.00")
    )
    proj_b = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-ISO-B",
        po_no=po_b,
        site_id="SITE-B",
        current_task="Approval Pending",
        po_amendment_ref_id="REF-KEEP-B",
        po_reference_number="REF-KEEP-B",
        po_amount=Decimal("95000.00"),
        jms_merged_document=pdf_b
    )
    project_db_session.add(proj_a)
    project_db_session.add(proj_b)
    project_db_session.commit()

    # Reject Project A
    client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_a, "siteId": "SITE-A", "workflow": "PO Amend"}
    )

    # Submit reference for Project A
    client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_a, "siteId": "SITE-A", "poAmendmentRefId": "REF-NEW-A"}
    )

    # Re-verify Project B is completely untouched
    project_db_session.expire_all()
    b_fresh = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_b).first()
    assert b_fresh.current_task == "Approval Pending"
    assert b_fresh.po_amendment_ref_id == "REF-KEEP-B"
    assert b_fresh.po_reference_number == "REF-KEEP-B"
    assert b_fresh.jms_merged_document == pdf_b
    assert b_fresh.po_amount == Decimal("95000.00")


def test_9_wcc_reject_preserves_shared_document_if_other_workflow_active(
    client: TestClient, project_db_session: Session, cleanup_workflow_records
):
    """
    Requirement 3.4:
    - Before deleting the PDF, verify that it belongs exclusively to this PO/workflow.
    - Do not delete a document shared with another active workflow (e.g. active PO Amend).
    """
    po_no = "TEST-WCC-SHARED"
    site_id = "SITE-SHARED-01"
    shared_pdf = _create_sample_pdf("Shared PDF Certificate")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-SHARED",
        po_no=po_no,
        site_id=site_id,
        current_task="WCC to be submit / PO Amend to be submit",
        po_status="Amend Requested",
        jms_merged_document=shared_pdf,
        po_amendment_merged_document=shared_pdf,
        po_amount=Decimal("120000.00")
    )
    # Line 1: PO difference < 0 (PO Amend - still active)
    item_amend = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("2.00"),  # po_diff = -1
        po_rate=Decimal("60000.00"),
        po_amount=Decimal("60000.00"),
        po_amendment_type="PO Amend to be submit"
    )
    # Line 2: PO difference >= 0 (WCC - to be rejected)
    item_wcc = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="2",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("1.00"),  # po_diff = 0
        po_rate=Decimal("60000.00"),
        po_amount=Decimal("60000.00"),
        po_amendment_type="Approval Pending"
    )
    project_db_session.add(proj)
    project_db_session.add(item_amend)
    project_db_session.add(item_wcc)
    project_db_session.commit()

    # Reject WCC workflow
    rej_res = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_no, "siteId": site_id, "workflow": "WCC"}
    )
    assert rej_res.status_code == 200

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    # Shared document must NOT be deleted because PO Amend is still active!
    assert db_proj.po_amendment_merged_document == shared_pdf
    assert db_proj.jms_merged_document == shared_pdf
    # Task retains active PO Amend workflow
    assert db_proj.current_task == "PO Amend to be submit"

