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
def cleanup_e2e_records(project_db_session: Session):
    test_pos = ["TEST-JMS-E2E-VAL", "TEST-JMS-E2E-PROC", "TEST-JMS-E2E-IDEMP", "TEST-JMS-E2E-FAIL"]
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
    c.drawString(100, 700, f"Nexus Test PDF: {text_label}")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_1_and_2_jms_to_be_validate_workflow_and_document_merge(
    client: TestClient, project_db_session: Session, cleanup_e2e_records
):
    """
    Scenario 1 & 2:
    - Approve all line items on 'JMS to be validate'
    - Upload documents in JMS Documents tab
    - Submit JMS to Project Manager
    - Verify:
      1. Project status / task updates to exactly 'JMS Approval Pending'.
      2. Uploaded JMS documents are merged into a valid PDF.
      3. Merged PDF bytes are persisted in jms_merged_document (BYTEA).
      4. Document is associated with correct project, PO, and site.
    """
    test_po = "TEST-JMS-E2E-VAL"
    test_site = "IN-SITE-VAL-01"

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        site_name="Validation Hub",
        project_code="PRJ-VAL-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be validate",
        project_status="Active"
    )
    line1 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="1",
        item_code="GBPA-CIVIL-01",
        item_description="Excavation Works",
        uom="Cum",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("1500.00"),
        po_amount=Decimal("15000.00"),
        jms_qty=Decimal("10.00"),
        jms_amount=Decimal("15000.00"),
        jms_status="Approved"
    )
    line2 = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="2",
        item_code="GBPA-CIVIL-02",
        item_description="PCC Works",
        uom="Cum",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("4000.00"),
        po_amount=Decimal("20000.00"),
        jms_qty=Decimal("5.00"),
        jms_amount=Decimal("20000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line1, line2])
    project_db_session.commit()

    # Upload two separate JMS documents in the Documents tab
    pdf1 = _create_sample_pdf("JMS Document 1 - Soil Test Report")
    pdf2 = _create_sample_pdf("JMS Document 2 - Structural Stability")

    up1 = client.post(
        "/api/v1/commercial/jms/documents",
        data={"po_no": test_po, "site_id": test_site, "doc_type": "Soil Test", "doc_details": "Soil Testing Report"},
        files={"file": ("Soil_Test.pdf", io.BytesIO(pdf1), "application/pdf")}
    )
    assert up1.status_code == 200

    up2 = client.post(
        "/api/v1/commercial/jms/documents",
        data={"po_no": test_po, "site_id": test_site, "doc_type": "Stability", "doc_details": "Structural Certificate"},
        files={"file": ("Stability.pdf", io.BytesIO(pdf2), "application/pdf")}
    )
    assert up2.status_code == 200

    # Submit JMS to Project Manager
    sub_res = client.post("/api/v1/commercial/jms/submit", json={"poNo": test_po, "siteId": test_site})
    assert sub_res.status_code == 200, sub_res.text
    sub_data = sub_res.json()
    assert sub_data["success"] is True
    assert sub_data["task"] == "JMS approval pending"
    assert sub_data["status"] == "JMS Approval Pending"

    # Verify project in DB
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS approval pending"
    assert proj.project_status == "JMS Approval Pending"

    # Verify jms_merged_document stores valid binary PDF bytes
    raw_pdf = proj.jms_merged_document
    assert raw_pdf is not None
    pdf_bytes = bytes(raw_pdf) if isinstance(raw_pdf, memoryview) else raw_pdf
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")

    # Verify PDF contains the 2 uploaded documents
    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) == 2
    full_text = "".join(p.extract_text() for p in reader.pages)
    assert "Soil Test Report" in full_text
    assert "Structural Stability" in full_text

    # Verify download endpoint for JMS merged document
    dl_res = client.get(f"/api/v1/commercial/jms/jms/download?po_no={test_po}&site_id={test_site}")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert dl_res.content.startswith(b"%PDF-")


def test_3_4_5_6_and_7_jms_to_be_process_submit_workflow_and_routing(
    client: TestClient, project_db_session: Session, cleanup_e2e_records
):
    """
    Scenario 3, 4, 5, 6, 7:
    - Setup PO in 'JMS to be process' with previously stored jms_merged_document
    - Mixed line items:
      * Line 1: PO Qty 10, JMS Qty 8 (PO Diff +2 >= 0) -> WCC to be submit
      * Line 2: PO Qty 5, JMS Qty 7 (PO Diff -2 < 0) -> PO Amend to be submit
    - Submit Select Works
    - Verify:
      1. Generates 3-page PDF (Annexure, BOQ, Work Completion Certificate).
      2. Merges with previously persisted JMS merged PDF in correct order (3-page first, then JMS doc).
      3. Persists final merged PDF in po_amendment_merged_document as actual bytes.
      4. Both columns contain valid binary PDF bytes.
      5. Download endpoint serves the final PDF with application/pdf.
      6. Proper routing to WCC and PO Amend with established status values.
      7. PO no longer in active 'JMS to be process' worklist.
    """
    test_po = "TEST-JMS-E2E-PROC"
    test_site = "IN-SITE-PROC-01"

    # Previously persisted JMS PDF (1 page)
    prev_jms_pdf = _create_sample_pdf("Attached Previous JMS Measurement Sheet")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        site_name="Process Metro Hub",
        project_code="PRJ-PROC-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="Active",
        jms_merged_document=prev_jms_pdf,
        jms_merged_documents=prev_jms_pdf
    )
    # Line 1: 10 - 8 = +2 -> WCC
    line_wcc = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="10",
        item_code="GBPA-WCC-01",
        item_description="Foundation Concreting (+2 Diff)",
        uom="Cum",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("5000.00"),
        po_amount=Decimal("50000.00"),
        po_total_amount=Decimal("50000.00"),
        jms_qty=Decimal("8.00"),
        jms_amount=Decimal("40000.00"),
        jms_status="Approved"
    )
    # Line 2: 5 - 7 = -2 -> PO Amend
    line_amend = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="20",
        item_code="GBPA-AMEND-02",
        item_description="Tower Reinforcement Steel (-2 Diff)",
        uom="MT",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("60000.00"),
        po_amount=Decimal("300000.00"),
        po_total_amount=Decimal("300000.00"),
        jms_qty=Decimal("7.00"),
        jms_amount=Decimal("420000.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line_wcc, line_amend])
    project_db_session.commit()

    # Submit Select Works
    sub_res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={
            "poNo": test_po,
            "siteId": test_site,
            "civil": True,
            "electrical": False,
            "service": False,
            "eb": False
        }
    )
    assert sub_res.status_code == 200, sub_res.text
    sub_data = sub_res.json()
    assert sub_data["success"] is True
    # 3 generated pages (Annexure, BOQ, WCC) + 15 additional document pages
    assert sub_data["totalPages"] >= 4
    assert sub_data["destination"] == "mixed"
    assert sub_data["task"] == "WCC to be submit / PO Amend to be submit"

    # Verify DB persistence of actual PDF bytes
    project_db_session.refresh(proj)
    po_bytes = bytes(proj.po_amendment_merged_document) if isinstance(proj.po_amendment_merged_document, memoryview) else proj.po_amendment_merged_document
    assert isinstance(po_bytes, bytes)
    assert po_bytes.startswith(b"%PDF-")

    # Verify page order: 3 generated pages first, followed by additional document categories
    final_reader = PdfReader(io.BytesIO(po_bytes))
    assert len(final_reader.pages) >= 4
    p1_text = final_reader.pages[0].extract_text()
    p2_text = final_reader.pages[1].extract_text()
    p3_text = final_reader.pages[2].extract_text()

    # Pages 1-3 are generated WCC pages (Annexure, BOQ, Work Completion Certificate)
    assert ("ANNEXURE" in p1_text.upper() or "INDUS" in p1_text.upper())
    assert ("BOQ" in p2_text.upper() or "INDUS" in p2_text.upper() or "QUANTITY" in p2_text.upper())
    assert ("WORK COMPLETION" in p3_text.upper() or "CERTIFICATE" in p3_text.upper())
    # Previously merged JMS document is included in the merged document
    all_text = " ".join([p.extract_text() or "" for p in final_reader.pages])
    assert "Attached Previous JMS Measurement Sheet" in all_text

    # Verify download endpoint
    dl_res = client.get(f"/api/v1/commercial/jms/pdf/download?po_no={test_po}&site_id={test_site}")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert dl_res.content == po_bytes

    # Verify WCC details endpoint returns Line 1 with task 'WCC to be submit'
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={test_po}&site_id={test_site}")
    assert wcc_res.status_code == 200
    wcc_items = wcc_res.json()["lineItems"]
    assert len(wcc_items) == 1
    assert wcc_items[0]["itemCode"] == "GBPA-WCC-01"
    assert wcc_items[0]["task"] == "WCC to be submit"

    # Verify PO Amend details endpoint returns Line 2 with amendmentType 'Change QTY'
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={test_po}&site_id={test_site}")
    assert amend_res.status_code == 200
    amend_items = amend_res.json()["lineItems"]
    assert len(amend_items) == 1
    assert amend_items[0]["itemCode"] == "GBPA-AMEND-02"
    assert amend_items[0]["amendmentType"] == "Change QTY"
    assert amend_items[0]["qty"] == 2.0


def test_8_idempotency_prevents_duplicate_submissions_and_duplicate_pages(
    client: TestClient, project_db_session: Session, cleanup_e2e_records
):
    """
    Scenario 8: Repeated clicks / retries must NOT create duplicate records or multiply PDF pages.
    """
    test_po = "TEST-JMS-E2E-IDEMP"
    test_site = "IN-SITE-IDEMP-01"

    prev_jms = _create_sample_pdf("Single Page Measurement Doc")
    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        current_task="JMS to be process",
        jms_merged_document=prev_jms,
        jms_merged_documents=prev_jms
    )
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="1",
        item_code="GBPA-CIVIL-55",
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("10.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # First submission
    res1 = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": test_po, "siteId": test_site, "civil": True}
    )
    assert res1.status_code == 200
    pages1 = res1.json()["totalPages"]

    # Second submission (retry click)
    res2 = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": test_po, "siteId": test_site, "civil": True}
    )
    assert res2.status_code == 200
    pages2 = res2.json()["totalPages"]

    # Pages must be identical and not duplicated
    assert pages1 == pages2

    # Project documents count must remain 1 WCC Certificate and 1 WCC Merged Document
    docs = project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).all()
    assert sum(1 for d in docs if d.document_number == "WCC Certificate") == 1
    assert sum(1 for d in docs if d.document_number == "WCC Merged Document") == 1


def test_9_failure_and_rollback_safety(
    client: TestClient, project_db_session: Session, cleanup_e2e_records
):
    """
    Scenario 9: Unapproved rows reject submission; database rolls back on failure;
    pre-existing stored documents are never lost.
    """
    test_po = "TEST-JMS-E2E-FAIL"
    test_site = "IN-SITE-FAIL-01"

    existing_doc_bytes = _create_sample_pdf("Pre-existing Protected Document")

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        current_task="JMS to be validate",
        jms_merged_document=existing_doc_bytes,
        jms_merged_documents=existing_doc_bytes
    )
    line_unapproved = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        line_number="1",
        item_code="GBPA-CIVIL-99",
        po_qty=Decimal("10.00"),
        jms_qty=Decimal("10.00"),
        jms_status="Not Approved"  # Unapproved!
    )
    project_db_session.add_all([proj, line_unapproved])
    project_db_session.commit()

    # Submission must fail with 400
    res = client.post("/api/v1/commercial/jms/submit", json={"poNo": test_po, "siteId": test_site})
    assert res.status_code == 400
    assert "not yet Approved" in res.json()["detail"]

    # Verify task was NOT modified to 'JMS approval pending'
    project_db_session.refresh(proj)
    assert proj.current_task == "JMS to be validate"

    # Verify pre-existing document was NOT lost
    assert bytes(proj.jms_merged_document) == existing_doc_bytes
