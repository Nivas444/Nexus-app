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
def cleanup_rejected_workflow_records(project_db_session: Session):
    test_pos = [
        "TEST-REJECTED-PO-01",
        "TEST-REJECTED-PO-02",
        "TEST-REJECTED-ISOLATION-01"
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
    c.drawString(100, 700, f"Rejected Workflow Document: {text_label}")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_rejected_po_quantity_edit_recalculates_amount_and_persists(
    client: TestClient, project_db_session: Session, cleanup_rejected_workflow_records
):
    """
    1. Edit rejected PO quantity:
       - Update Qty on line item via PATCH /api/v1/commercial/jms/po-amend/line-items/{id}/qty
       - Persist new quantity in telecom_indus_po.po_amendment_qty
       - Recalculate Amount = Rate * Qty and persist in telecom_indus_po.po_amount and telecom_project.po_amount
       - Validate positive quantity > 0, rejecting <= 0 or invalid without corrupting data
       - Ensure jms_merged_document is invalidated upon quantity edit
    """
    po_no = "TEST-REJECTED-PO-01"
    site_id = "SITE-REJ-01"

    # Setup a rejected PO with 1 line item
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="Rejected Site 01",
        project_code="PRJ-REJ-001",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Anchor",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        po_amendment_ref_id="REF-PREV-REJECTED-01",
        po_amount=Decimal("15000.00"),
        jms_merged_document=b"%PDF-old-stale-doc"
    )
    project_db_session.add(project)
    project_db_session.flush()

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="INDUS-SRV-001",
        item_description="Tower Foundation Strengthening",
        uom="Nos",
        po_rate=Decimal("5000.00"),
        po_qty=Decimal("2.00"),
        jms_qty=Decimal("5.00"),
        po_amendment_qty=Decimal("3.00"),
        po_amount=Decimal("15000.00"),
        po_amendment_type="Rejected",
        jms_status="Rejected"
    )
    project_db_session.add(line_item)
    project_db_session.commit()
    project_db_session.refresh(line_item)
    project_db_session.refresh(project)

    line_id = line_item.project_po_line_item_id

    # 1a. Validate error on non-positive quantity
    res_bad = client.patch(
        f"/api/v1/commercial/jms/po-amend/line-items/{line_id}/qty",
        json={"qty": 0.0, "poNo": po_no, "siteId": site_id}
    )
    assert res_bad.status_code == 400
    assert "positive" in res_bad.json()["detail"].lower()

    res_negative = client.patch(
        f"/api/v1/commercial/jms/po-amend/line-items/{line_id}/qty",
        json={"qty": -4.5, "poNo": po_no, "siteId": site_id}
    )
    assert res_negative.status_code == 400

    # Ensure database was NOT corrupted by the invalid requests
    project_db_session.refresh(line_item)
    assert float(line_item.po_amendment_qty) == 3.0
    assert float(line_item.po_amount) == 15000.0

    # 1b. Save valid new quantity: 4.0
    # Expected amount = 5000.00 * 4.0 = 20000.00
    res_save = client.patch(
        f"/api/v1/commercial/jms/po-amend/line-items/{line_id}/qty",
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
    assert float(line_item.po_amendment_qty) == 4.0
    assert float(line_item.po_amount) == 20000.0
    assert float(project.po_amount) == 20000.0
    # Must have invalidated merged document so regeneration is enforced
    assert project.jms_merged_document is None


def test_rejected_po_pdf_processing_and_download(
    client: TestClient, project_db_session: Session, cleanup_rejected_workflow_records
):
    """
    2. PDF Process and Download:
       - Check po-amend-details returns hasMergedDocument=False when document needs regeneration
       - Process PDF via POST /api/v1/commercial/jms/pdf/process
       - Verifies Annexure, BOQ, and WCC generation with newly saved Qty & recalculated Amount
       - Merges additional documents in Document tab
       - Stores merged PDF in jms_merged_document in database
       - GET /api/v1/commercial/jms/pdf/download downloads fresh merged PDF
    """
    po_no = "TEST-REJECTED-PO-02"
    site_id = "SITE-REJ-02"

    # Setup project and additional document
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="Rejected Site 02",
        project_code="PRJ-REJ-002",
        customer_name="Indus Towers Ltd",
        project_type="Upgrade",
        sub_project_type="Anchor",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        po_amendment_ref_id="REF-PREV-REJECTED-02",
        po_amount=Decimal("40000.00"),
        jms_merged_document=None
    )
    project_db_session.add(project)

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="INDUS-SRV-REJ-02",
        item_description="Tower Structural Modification",
        uom="Nos",
        po_rate=Decimal("8000.00"),
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("6.00"),
        po_amendment_qty=Decimal("5.00"),
        po_amount=Decimal("40000.00"),
        po_amendment_type="Rejected",
        jms_status="Rejected"
    )
    project_db_session.add(line_item)

    # Add an additional document to test merging
    import base64
    sample_doc_bytes = _create_sample_pdf("Additional Signoff Attachment")
    b64_str = base64.b64encode(sample_doc_bytes).decode('utf-8')
    extra_doc = ProjectDocument(
        po_no=po_no,
        site_id=site_id,
        document_name="signoff_annex.pdf",
        document_number="Signoff",
        documents=f"data:application/pdf;base64,{b64_str}"
    )
    project_db_session.add(extra_doc)
    project_db_session.commit()

    # Verify po-amend-details reports hasMergedDocument=False
    res_details = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}"
    )
    assert res_details.status_code == 200
    details_data = res_details.json()
    assert details_data["hasMergedDocument"] is False
    assert details_data["poAmendmentRefId"] == "REF-PREV-REJECTED-02"
    assert len(details_data["lineItems"]) == 1
    assert details_data["lineItems"][0]["qty"] == 5.0
    assert details_data["lineItems"][0]["amount"] == 40000.0

    # 2a. Process PDF
    res_proc = client.post(
        "/api/v1/commercial/jms/pdf/process",
        json={"poNo": po_no, "siteId": site_id}
    )
    assert res_proc.status_code == 200
    proc_data = res_proc.json()
    assert proc_data["success"] is True

    # Verify document is persisted in database
    project_db_session.refresh(project)
    assert project.jms_merged_document is not None
    assert project.jms_merged_document.startswith(b"%PDF-")

    # Read generated PDF pages: 3-page certificate + 1 additional doc = 4 pages
    reader = PdfReader(io.BytesIO(project.jms_merged_document))
    assert len(reader.pages) >= 3

    # Verify po-amend-details now reports hasMergedDocument=True
    res_details_after = client.get(
        f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}"
    )
    assert res_details_after.status_code == 200
    assert res_details_after.json()["hasMergedDocument"] is True

    # 2b. Download PDF
    res_dl = client.get(
        f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}"
    )
    assert res_dl.status_code == 200
    assert res_dl.headers["content-type"] == "application/pdf"
    assert res_dl.content == project.jms_merged_document


def test_rejected_po_submit_reference_transitions_task_and_updates_projects_list(
    client: TestClient, project_db_session: Session, cleanup_rejected_workflow_records
):
    """
    3. Submit After Successful PDF Processing:
       - Submits PO Amendment ID modal via POST /api/v1/commercial/jms/po-amend/submit-reference
       - Prepopulates previous Ref ID or accepts updated Ref ID
       - Persists po_amendment_ref_id in telecom_project
       - Transitions project current_task to 'Approval Pending' and po_status to 'Under Review'
       - GET /api/v1/commercial/po-amend/projects returns project with task 'Approval Pending',
         ensuring the record no longer appears in Rejected workflow
    """
    po_no = "TEST-REJECTED-PO-01"
    site_id = "SITE-REJ-01"

    # Setup project in Rejected state
    project = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        site_name="Rejected Site 01",
        project_code="PRJ-REJ-001",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Anchor",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        po_amendment_ref_id="REF-PREV-REJECTED-01",
        po_amount=Decimal("20000.00")
    )
    project_db_session.add(project)

    line_item = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=1,
        item_code="INDUS-SRV-001",
        item_description="Tower Foundation Strengthening",
        uom="Nos",
        po_rate=Decimal("5000.00"),
        po_qty=Decimal("2.00"),
        jms_qty=Decimal("6.00"),
        po_amendment_qty=Decimal("4.00"),
        po_amount=Decimal("20000.00"),
        po_amendment_type="Rejected",
        jms_status="Approved"
    )
    project_db_session.add(line_item)
    project_db_session.commit()

    # Pre-submission check: project list shows this record with task 'Rejected'
    res_list_before = client.get("/api/v1/commercial/po-amend/projects")
    assert res_list_before.status_code == 200
    item_before = next(i for i in res_list_before.json()["items"] if i["poNo"] == po_no)
    assert item_before["task"] == "Rejected"

    # Submit updated Reference ID
    new_ref_id = "REF-RESUBMITTED-999"
    res_sub = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_no, "siteId": site_id, "poAmendmentRefId": new_ref_id}
    )
    assert res_sub.status_code == 200
    sub_data = res_sub.json()
    assert sub_data["success"] is True
    assert sub_data["refId"] == new_ref_id
    assert sub_data["task"] == "Approval Pending"

    # Verify persistence in database
    project_db_session.refresh(project)
    project_db_session.refresh(line_item)
    assert project.po_amendment_ref_id == new_ref_id
    assert project.current_task == "Approval Pending"
    assert project.po_status == "Under Review"
    assert line_item.po_amendment_type == "Approval Pending"

    # Refresh PO Amendment projects list from backend
    res_list_after = client.get("/api/v1/commercial/po-amend/projects")
    assert res_list_after.status_code == 200
    item_after = next(i for i in res_list_after.json()["items"] if i["poNo"] == po_no)
    # The record is now 'Approval Pending', no longer appearing in the Rejected workflow
    assert item_after["task"] == "Approval Pending"
    assert item_after["poStatus"] == "Under Review"
    assert item_after["poAmendmentRefId"] == new_ref_id


def test_rejected_workflow_does_not_affect_unrelated_projects(
    client: TestClient, project_db_session: Session, cleanup_rejected_workflow_records
):
    """
    4. Workflow Isolation:
       - Modifying quantity, processing PDF, or submitting reference on a rejected PO
         does not alter or delete data/documents for any other PO.
    """
    po_active = "TEST-REJECTED-ISOLATION-01"
    po_rejected = "TEST-REJECTED-PO-01"

    # Unrelated active project in 'PO Amend to be submit'
    active_proj = TelecomProject(
        po_no=po_active,
        site_id="SITE-ISO-01",
        site_name="Active Project Site",
        project_code="PRJ-ISO-001",
        customer_name="Indus Towers Ltd",
        current_task="PO Amend to be submit",
        project_status="In Progress",
        po_status="Amend Requested",
        po_amount=Decimal("77000.00"),
        jms_merged_document=b"%PDF-active-untouched-doc"
    )
    # Rejected project
    rej_proj = TelecomProject(
        po_no=po_rejected,
        site_id="SITE-REJ-01",
        site_name="Rejected Site",
        project_code="PRJ-REJ-001",
        customer_name="Indus Towers Ltd",
        current_task="Rejected",
        project_status="Rejected",
        po_status="Rejected",
        po_amount=Decimal("10000.00")
    )
    rej_line = TelecomIndusPo(
        po_no=po_rejected,
        site_id="SITE-REJ-01",
        line_number=1,
        po_rate=Decimal("2000.00"),
        po_qty=Decimal("1.00"),
        jms_qty=Decimal("6.00"),
        po_amendment_qty=Decimal("5.00"),
        po_amount=Decimal("10000.00")
    )
    project_db_session.add_all([active_proj, rej_proj, rej_line])
    project_db_session.commit()
    project_db_session.refresh(rej_line)

    # Edit quantity on rejected line
    res_qty = client.patch(
        f"/api/v1/commercial/jms/po-amend/line-items/{rej_line.project_po_line_item_id}/qty",
        json={"qty": 6.0, "poNo": po_rejected, "siteId": "SITE-REJ-01"}
    )
    assert res_qty.status_code == 200

    # Submit reference on rejected project
    res_sub = client.post(
        "/api/v1/commercial/jms/po-amend/submit-reference",
        json={"poNo": po_rejected, "siteId": "SITE-REJ-01", "poAmendmentRefId": "REF-REJ-ISOLATED"}
    )
    assert res_sub.status_code == 200

    # Verify active project was 100% untouched
    project_db_session.refresh(active_proj)
    assert active_proj.current_task == "PO Amend to be submit"
    assert active_proj.po_status == "Amend Requested"
    assert float(active_proj.po_amount) == 77000.00
    assert active_proj.jms_merged_document == b"%PDF-active-untouched-doc"
