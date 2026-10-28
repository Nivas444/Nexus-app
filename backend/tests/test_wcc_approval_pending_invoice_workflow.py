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
def cleanup_wcc_test_records(project_db_session: Session):
    test_pos = [
        "TEST-WCC-INV-01",
        "TEST-WCC-INV-REJ",
        "TEST-WCC-INV-SHARED"
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


def test_wcc_approval_pending_submit_receipt_and_invoice_transition(
    client: TestClient, project_db_session: Session, cleanup_wcc_test_records
):
    """
    Requirement 2: Submit -> Receipt No tab -> Invoice
    - Collects Receipt No, Receipt Date, ERS No
    - Saves to telecom_projects table columns: receipt_no, receipt_date, ers_no
    - Only after backend confirms success, task changes to 'to be submit' for Invoice workflow
    - Completed row is removed from active WCC page (verified via GET /commercial/wcc/projects)
    """
    po_no = "TEST-WCC-INV-01"
    site_id = "SITE-WCC-INV-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-INV-01",
        po_no=po_no,
        site_id=site_id,
        site_name="Velachery Site",
        project_type="Upgrade",
        sub_project_type="Electrical",
        current_task="Approval Pending",
        po_status="Under Review",
        wcc_no="WCC-TN-2026-99",
        wcc_amount=Decimal("180000.00"),
        po_amount=Decimal("180000.00")
    )
    po_item = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        item_code="IND-ELEC-01",
        item_description="Electrical Testing",
        uom="Nos",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("1.00"),
        po_rate=Decimal("180000.00"),
        po_amount=Decimal("180000.00"),
        po_amendment_type="Approval Pending"
    )
    project_db_session.add(proj)
    project_db_session.add(po_item)
    project_db_session.commit()

    # 1. Validation check: Missing receiptNo or receiptDate returns 400
    res_bad = client.post(
        "/api/v1/commercial/jms/wcc/submit-receipt",
        json={"poNo": po_no, "siteId": site_id, "receiptNo": "", "receiptDate": "25/10/2026"}
    )
    assert res_bad.status_code in (400, 422)

    # 2. Valid submission: saves receipt_no, receipt_date, ers_no
    rec_num = "REC-INDUS-2026-7788"
    rec_date = "25/10/2026"
    ers_num = "ERS-IND-9901"

    res = client.post(
        "/api/v1/commercial/jms/wcc/submit-receipt",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "receiptNo": rec_num,
            "receiptDate": rec_date,
            "ersNo": ers_num
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["task"] == "to be submit"
    assert data["receiptNo"] == rec_num
    assert "2026-10-25" in data["receiptDate"]
    assert data["ersNo"] == ers_num

    # 3. Direct DB verification: verifies values in telecom_projects columns
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj is not None
    assert db_proj.current_task == "to be submit"
    assert db_proj.receipt_no == rec_num
    assert str(db_proj.receipt_date) == "2026-10-25"
    assert db_proj.ers_no == ers_num

    # 4. Reload WCC page: completed row must disappear from active WCC page
    wcc_res = client.get("/api/v1/commercial/wcc/projects")
    assert wcc_res.status_code == 200
    active_pos = [item["poNo"] for item in wcc_res.json()["items"]]
    assert po_no not in active_pos, "Completed WCC row must not appear in active WCC worklist after submission"


def test_wcc_approval_pending_reject_persists_status_and_deletes_exclusive_pdf(
    client: TestClient, project_db_session: Session, cleanup_wcc_test_records
):
    """
    Requirement 3: Reject workflow
    - Identify exact PO row being rejected
    - Changes PO's task to 'Rejected' and persists in DB
    - Removes associated generated PDF from jms_merged_document
    - Refreshes WCC page so rejected task displays persisted status correctly
    """
    po_no = "TEST-WCC-INV-REJ"
    site_id = "SITE-WCC-INV-REJ"
    sample_pdf = _create_sample_pdf("WCC Exclusive PDF")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-INV-REJ",
        po_no=po_no,
        site_id=site_id,
        current_task="Approval Pending",
        po_status="Under Review",
        wcc_no="WCC-TN-REJ-01",
        wcc_amount=Decimal("150000.00"),
        jms_merged_document=sample_pdf
    )
    po_item = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        item_code="IND-CIV-01",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("1.00"),
        po_rate=Decimal("150000.00"),
        po_amount=Decimal("150000.00"),
        po_amendment_type="Approval Pending"
    )
    project_db_session.add(proj)
    project_db_session.add(po_item)
    project_db_session.commit()

    # Reject WCC
    res = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_no, "siteId": site_id, "workflow": "WCC"}
    )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["task"] == "Rejected"

    # Verify DB persistence
    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "Rejected"
    assert db_proj.jms_merged_document is None

    # Reload WCC list: rejected task displays persisted status 'Rejected'
    wcc_res = client.get("/api/v1/commercial/wcc/projects")
    assert wcc_res.status_code == 200
    items = {item["poNo"]: item for item in wcc_res.json()["items"]}
    assert po_no in items
    assert items[po_no]["task"] == "Rejected"


def test_wcc_reject_preserves_shared_document_when_po_amend_active(
    client: TestClient, project_db_session: Session, cleanup_wcc_test_records
):
    """
    Requirement 3.4:
    - Before deleting the PDF, verify that it belongs exclusively to this PO/workflow.
    - Do not delete a document shared with another active workflow.
    """
    po_no = "TEST-WCC-INV-SHARED"
    site_id = "SITE-WCC-INV-SHARED"
    shared_pdf = _create_sample_pdf("Shared Multi-workflow Certificate")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        project_code="PRJ-WCC-INV-SHARED",
        po_no=po_no,
        site_id=site_id,
        current_task="WCC to be submit / PO Amend to be submit",
        po_status="Amend Requested",
        jms_merged_document=shared_pdf,
        po_amendment_merged_document=shared_pdf,
        po_amount=Decimal("200000.00")
    )
    # Line 1: PO Amend active line
    po_amend_line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="1",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("2.00"),  # po_diff = -1 < 0 -> PO Amend
        po_rate=Decimal("100000.00"),
        po_amount=Decimal("100000.00"),
        po_amendment_type="PO Amend to be submit"
    )
    # Line 2: WCC line
    wcc_line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="2",
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("1.00"),  # po_diff = 0 >= 0 -> WCC
        po_rate=Decimal("100000.00"),
        po_amount=Decimal("100000.00"),
        po_amendment_type="Approval Pending"
    )
    project_db_session.add(proj)
    project_db_session.add(po_amend_line)
    project_db_session.add(wcc_line)
    project_db_session.commit()

    # Reject WCC
    res = client.post(
        "/api/v1/commercial/jms/reject",
        json={"poNo": po_no, "siteId": site_id, "workflow": "WCC"}
    )
    assert res.status_code == 200

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    # Document is shared with active PO Amend workflow: must NOT be deleted
    assert db_proj.jms_merged_document == shared_pdf
    assert db_proj.po_amendment_merged_document == shared_pdf
    # Task remains on active PO Amend workflow
    assert db_proj.current_task == "PO Amend to be submit"

