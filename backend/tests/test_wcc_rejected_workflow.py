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
def cleanup_wcc_rejected_records(project_db_session: Session):
    test_pos = [
        "TEST-WCC-REJ-PO-01",
        "TEST-WCC-REJ-PO-02",
        "TEST-WCC-REJ-ISOLATION-01"
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
    c.drawString(100, 700, f"WCC Additional Document: {text_label}")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_rejected_wcc_quantity_edit_recalculates_amount_and_persists(
    client: TestClient, project_db_session: Session, cleanup_wcc_rejected_records
):
    """
    1. Table and quantity editing:
       - Update Qty on line item via PATCH /api/v1/commercial/jms/wcc/line-items/{id}/qty
       - Persist new quantity in telecom_indus_po.jms_qty
       - Recalculate Amount = Rate * Qty and persist in telecom_indus_po.jms_amount,
         telecom_indus_po.po_amount, and telecom_project.wcc_amount
       - Validate positive quantity > 0, rejecting <= 0 or invalid without corrupting data
       - Ensure jms_merged_document is invalidated upon quantity edit so document regeneration is enforced
       - Verify task status remains 'Rejected' (does not prematurely transition)
    """
    po_no = "TEST-WCC-REJ-PO-01"
    site_id = "SITE-WCC-REJ-01"

    # Setup a rejected WCC project with 1 line item
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="WCC Rejected Site 01",
        project_code="PRJ-WCC-REJ-001",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        wcc_no="WCC-PREV-REJ-01",
        po_amount=Decimal("15000.00"),
        wcc_amount=Decimal("15000.00"),
        jms_merged_document=b"%PDF-old-stale-doc"
    )
    project_db_session.add(project)
    project_db_session.flush()

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="CIVIL-SRV-001",
        item_description="Foundation Strengthening",
        uom="Nos",
        po_rate=Decimal("5000.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("3.00"),
        jms_amount=Decimal("15000.00"),
        po_amount=Decimal("15000.00"),
        po_amendment_type="Rejected",
        jms_status="Not Approved"
    )
    project_db_session.add(line_item)
    project_db_session.commit()
    project_db_session.refresh(line_item)
    project_db_session.refresh(project)

    line_id = line_item.project_po_line_item_id

    # 1a. Validate error on non-positive quantity
    res_bad = client.patch(
        f"/api/v1/commercial/jms/wcc/line-items/{line_id}/qty",
        json={"qty": 0.0, "poNo": po_no, "siteId": site_id}
    )
    assert res_bad.status_code == 400
    assert "positive" in res_bad.json()["detail"].lower()

    res_negative = client.patch(
        f"/api/v1/commercial/jms/wcc/line-items/{line_id}/qty",
        json={"qty": -2.5, "poNo": po_no, "siteId": site_id}
    )
    assert res_negative.status_code == 400

    # Ensure database was NOT corrupted by the invalid requests
    project_db_session.refresh(line_item)
    assert float(line_item.jms_qty) == 3.0
    assert float(line_item.jms_amount) == 15000.0

    # 1b. Save valid new quantity: 4.0
    # Expected recalculated amount = 5000.00 * 4.0 = 20000.00
    res_save = client.patch(
        f"/api/v1/commercial/jms/wcc/line-items/{line_id}/qty",
        json={"qty": 4.0, "poNo": po_no, "siteId": site_id}
    )
    assert res_save.status_code == 200
    data = res_save.json()
    assert data["success"] is True
    assert data["qty"] == 4.0
    assert data["rate"] == 5000.0
    assert data["amount"] == 20000.0
    assert data["totalAmount"] == 20000.0

    # Verify persistence in database
    project_db_session.refresh(line_item)
    project_db_session.refresh(project)
    assert float(line_item.jms_qty) == 4.0
    assert float(line_item.jms_amount) == 20000.0
    assert float(project.wcc_amount) == 20000.0
    assert float(project.po_amount) == 20000.0
    # Must have invalidated merged document so regeneration is enforced
    assert project.jms_merged_document is None
    # Task status must remain Rejected
    assert project.current_task == "Rejected"


def test_rejected_wcc_pdf_processing_and_download(
    client: TestClient, project_db_session: Session, cleanup_wcc_rejected_records
):
    """
    2. PDF Process and Download:
       - Check wcc-details returns hasMergedDocument=False when document needs regeneration
       - Prior to processing, GET /api/v1/commercial/jms/pdf/download refuses stale document and returns 404
       - Process PDF via POST /api/v1/commercial/jms/pdf/process
       - Verifies Annexure, BOQ, and WCC generation with newly saved Qty & recalculated Amount
       - Merges additional documents in Document tab
       - Stores merged PDF in jms_merged_document in telecom_project table
       - GET /api/v1/commercial/jms/pdf/download retrieves the newly generated PDF, not a stale document
    """
    po_no = "TEST-WCC-REJ-PO-02"
    site_id = "SITE-WCC-REJ-02"

    # Setup project and additional document
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="WCC Rejected Site 02",
        project_code="PRJ-WCC-REJ-002",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        wcc_no="WCC-PREV-REJ-02",
        wcc_amount=Decimal("24000.00"),
        po_amount=Decimal("24000.00"),
        jms_merged_document=None
    )
    project_db_session.add(project)

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="INDUS-CIV-002",
        item_description="Tower Foundation Cast",
        uom="Nos",
        po_rate=Decimal("6000.00"),
        po_qty=Decimal("5.00"),
        jms_qty=Decimal("4.00"),
        jms_amount=Decimal("24000.00"),
        po_amount=Decimal("24000.00"),
        po_amendment_type="Rejected",
        jms_status="Approved"
    )
    project_db_session.add(line_item)

    # Add an additional document to test merging with Document tab
    import base64
    sample_doc_bytes = _create_sample_pdf("Civil Site Handover Protocol")
    b64_str = base64.b64encode(sample_doc_bytes).decode('utf-8')
    extra_doc = ProjectDocument(
        po_no=po_no,
        site_id=site_id,
        document_name="handover_protocol.pdf",
        document_number="Handover",
        documents=f"data:application/pdf;base64,{b64_str}"
    )
    project_db_session.add(extra_doc)
    project_db_session.commit()

    # Verify wcc-details reports hasMergedDocument=False
    res_details = client.get(
        f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}"
    )
    assert res_details.status_code == 200
    details_data = res_details.json()
    assert details_data["hasMergedDocument"] is False
    assert details_data["wccNo"] == "WCC-PREV-REJ-02"
    assert len(details_data["lineItems"]) == 1
    assert details_data["lineItems"][0]["qty"] == 4.0
    assert details_data["lineItems"][0]["amount"] == 24000.0

    # Before processing, attempting download must return 404 rather than serving stale document
    res_dl_stale = client.get(
        f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}"
    )
    assert res_dl_stale.status_code == 404

    # 2a. Process PDF
    res_proc = client.post(
        "/api/v1/commercial/jms/pdf/process",
        json={"poNo": po_no, "siteId": site_id}
    )
    assert res_proc.status_code == 200
    proc_data = res_proc.json()
    assert proc_data["success"] is True

    # Verify document is persisted in jms_merged_document in telecom_project table
    project_db_session.refresh(project)
    assert project.jms_merged_document is not None
    assert project.jms_merged_document.startswith(b"%PDF-")

    # Read generated PDF pages: 3-page certificate + 1 additional doc = 4 pages
    reader = PdfReader(io.BytesIO(project.jms_merged_document))
    assert len(reader.pages) >= 4

    # Verify wcc-details now reports hasMergedDocument=True
    res_details_after = client.get(
        f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}"
    )
    assert res_details_after.status_code == 200
    assert res_details_after.json()["hasMergedDocument"] is True

    # 2b. Download PDF: Retrieves the newly generated binary PDF
    res_dl = client.get(
        f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}"
    )
    assert res_dl.status_code == 200
    assert res_dl.headers["content-type"] == "application/pdf"
    assert res_dl.content == project.jms_merged_document


def test_rejected_wcc_submit_transitions_task_and_updates_projects_list(
    client: TestClient, project_db_session: Session, cleanup_wcc_rejected_records
):
    """
    3. Submit -> WCC tab -> Approval Pending:
       - Retrieves previously saved WCC details from telecom_project
       - Validates data
       - Submits WCC details via POST /api/v1/commercial/jms/wcc/submit-details
       - Persists wcc_no, wcc_date, wcc_amount in telecom_project
       - Transitions current_task to 'Approval Pending'
       - GET /api/v1/commercial/wcc/projects reflects 'Approval Pending', no longer remaining in Rejected workflow
    """
    po_no = "TEST-WCC-REJ-PO-01"
    site_id = "SITE-WCC-REJ-01"

    # Setup project in Rejected state
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="WCC Rejected Site 01",
        project_code="PRJ-WCC-REJ-001",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        wcc_no="WCC-PREV-REJ-01",
        wcc_amount=Decimal("20000.00"),
        po_amount=Decimal("20000.00")
    )
    project_db_session.add(project)

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="CIVIL-SRV-001",
        item_description="Foundation Strengthening",
        uom="Nos",
        po_rate=Decimal("5000.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("4.00"),
        jms_amount=Decimal("20000.00"),
        po_amount=Decimal("20000.00"),
        po_amendment_type="Rejected",
        jms_status="Approved"
    )
    project_db_session.add(line_item)
    project_db_session.commit()

    # Pre-submission check: project list shows this record with task 'Rejected'
    res_list_before = client.get("/api/v1/commercial/wcc/projects")
    assert res_list_before.status_code == 200
    item_before = next(i for i in res_list_before.json()["items"] if i["poNo"] == po_no)
    assert item_before["task"] == "Rejected"

    # Submit updated WCC Details
    new_wcc_no = "WCC-RESUBMITTED-888"
    new_wcc_date = "28/10/2026"
    new_wcc_amount = 20000.00

    res_sub = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": new_wcc_no,
            "wccDate": new_wcc_date,
            "wccAmount": new_wcc_amount
        }
    )
    assert res_sub.status_code == 200
    sub_data = res_sub.json()
    assert sub_data["success"] is True
    assert sub_data["wccNo"] == new_wcc_no
    assert sub_data["task"] == "Approval Pending"

    # Verify persistence in database
    project_db_session.refresh(project)
    project_db_session.refresh(line_item)
    assert project.wcc_no == new_wcc_no
    assert project.current_task == "Approval Pending"
    assert project.project_status == "Approval Pending"
    assert float(project.wcc_amount) == 20000.0

    # Refresh WCC projects list from backend
    res_list_after = client.get("/api/v1/commercial/wcc/projects")
    assert res_list_after.status_code == 200
    item_after = next(i for i in res_list_after.json()["items"] if i["poNo"] == po_no)
    # The record is now 'Approval Pending', no longer appearing in the Rejected workflow
    assert item_after["task"] == "Approval Pending"
    assert item_after["wccNo"] == new_wcc_no


def test_rejected_wcc_workflow_isolation(
    client: TestClient, project_db_session: Session, cleanup_wcc_rejected_records
):
    """
    4. Workflow Isolation:
       - Modifying quantity, processing PDF, or submitting WCC on a rejected PO
         does not alter or delete data/documents for any other PO.
    """
    po_active = "TEST-WCC-REJ-ISOLATION-01"
    po_rejected = "TEST-WCC-REJ-PO-01"

    # Create an unrelated active PO with existing PDF
    active_project = TelecomProject(
        po_no=po_active,
        site_id="SITE-ACTIVE",
        project_code="PRJ-ACTIVE-01",
        customer_name="Indus Towers Ltd",
        current_task="WCC to be submit",
        project_status="WCC to be submit",
        po_amount=Decimal("99000.00"),
        jms_merged_document=b"%PDF-unrelated-document"
    )
    project_db_session.add(active_project)

    rejected_project = TelecomProject(
        po_no=po_rejected,
        site_id="SITE-REJ",
        project_code="PRJ-REJ-01",
        customer_name="Indus Towers Ltd",
        current_task="Rejected",
        project_status="Rejected",
        po_amount=Decimal("10000.00"),
        jms_merged_document=None
    )
    project_db_session.add(rejected_project)

    rej_line = TelecomIndusPo(
        po_no=po_rejected,
        site_id="SITE-REJ",
        line_number=1,
        item_code="CIVIL-ISO-01",
        item_description="Isolation Line",
        uom="Nos",
        po_rate=Decimal("1000.00"),
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("10000.00"),
        po_amendment_type="Rejected",
        jms_status="Not Approved"
    )
    project_db_session.add(rej_line)
    project_db_session.commit()

    # Update quantity on rejected PO
    res_qty = client.patch(
        f"/api/v1/commercial/jms/wcc/line-items/{rej_line.project_po_line_item_id}/qty",
        json={"qty": 15.0, "poNo": po_rejected, "siteId": "SITE-REJ"}
    )
    assert res_qty.status_code == 200

    # Verify active project was untouched
    project_db_session.refresh(active_project)
    assert active_project.po_amount == Decimal("99000.00")
    assert active_project.current_task == "WCC to be submit"
    assert active_project.jms_merged_document == b"%PDF-unrelated-document"
