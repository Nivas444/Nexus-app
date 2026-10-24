import io
import os
import base64
from datetime import date
from decimal import Decimal
from PIL import Image
import pytest
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.db.session import ProjectSessionLocal
from app.models.commercial_project import (
    TelecomProject, TelecomIndusPo, ProjectDocument,
    IndusProjectInfra, DprRecord, EmailApproval
)
from app.services.wcc_pdf_service import WccPdfService, SEAL_INK


@pytest.fixture
def db():
    session = ProjectSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _cleanup(db: Session, po_no: str):
    db.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
    db.query(IndusProjectInfra).filter(IndusProjectInfra.po_no == po_no).delete()
    db.query(DprRecord).filter(DprRecord.po_no == po_no).delete()
    db.query(EmailApproval).filter(EmailApproval.po_no == po_no).delete()
    db.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    db.commit()


def _make_sample_pdf(text_content: str, num_pages: int = 1) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(595.27, 841.89))
    for p in range(num_pages):
        c.drawString(72, 750, f"{text_content} - Page {p + 1}")
        c.showPage()
    c.save()
    return buf.getvalue()


def _make_sample_image(color=(30, 144, 255), size=(400, 300)) -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color)
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_pdf_id_extraction_regex(db: Session):
    """
    Verifies that identifiers like STN No, SRN No, CAM No, PTW No, etc.
    are accurately extracted from uploaded PDF text.
    """
    svc = WccPdfService(db)

    # 1. STN PDF with text
    stn_pdf = _make_sample_pdf("Stock Transfer Note\nSTN Number: STN/INDUS/2026/88921\nTransferred Material: Cable")
    stn_id = svc._extract_id_from_pdf_text(stn_pdf, "Stock Transfer Note (STN)")
    assert stn_id == "STN/INDUS/2026/88921"

    # 2. SRN PDF with text
    srn_pdf = _make_sample_pdf("SERVICE RECEIPT NOTE\nSRN No: SRN-GE-908122\nDate: 24/10/2026")
    srn_id = svc._extract_id_from_pdf_text(srn_pdf, "Service Receipt Note (SRN)")
    assert srn_id == "SRN-GE-908122"

    # 3. CAM PDF with text
    cam_pdf = _make_sample_pdf("Cell Site Acceptance Certificate\nCAM No: CAM-TWR-44109\nApproved")
    cam_id = svc._extract_id_from_pdf_text(cam_pdf, "Cell Site Acceptance (CAM)")
    assert cam_id == "CAM-TWR-44109"

    # 4. PTW Height
    ptw_h_pdf = _make_sample_pdf("PERMIT TO WORK - HEIGHT SAFETY\nPTW No: H-PTW-2026-0044")
    ptw_h_id = svc._extract_id_from_pdf_text(ptw_h_pdf, "Permit to Work - Height (PTW)")
    assert ptw_h_id == "H-PTW-2026-0044"

    # 5. Non-PDF bytes return None
    assert svc._extract_id_from_pdf_text(b"not a pdf", "STN") is None


def test_photo_collage_2x2_grid_and_pagination(db: Session):
    """
    Verifies Section 3:
    - 2x2 grid (exactly 4 photos per page).
    - If > 4 photos (e.g. 6 photos), paginates to next page with remaining photos.
    - If < 4 photos (e.g. 2 photos), renders available without placeholders.
    - Separate Start vs End photos (no mixing).
    """
    test_po = "TEST-PHOTO-COLLAGE"
    test_site = "SITE-PHOTO-COLLAGE"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, project_code="PRJ-PH-001"
        )
        db.add(proj)
        db.commit()

        svc = WccPdfService(db)
        master_assets = svc._get_master_company_assets()

        # Test case A: 6 photos -> should generate 2 pages (4 photos on p1, 2 on p2)
        photos_6 = [_make_sample_image(color=(i * 30, 100, 200)) for i in range(6)]
        pages_6 = svc._generate_photo_collage_pages(
            title="SITE PHOTOS - START WORK",
            category_label="Start Work",
            photos=photos_6,
            proj=proj,
            master_assets=master_assets
        )
        assert len(pages_6) == 2
        r1 = PdfReader(io.BytesIO(pages_6[0]))
        r2 = PdfReader(io.BytesIO(pages_6[1]))
        assert "SITE PHOTOS - START WORK" in r1.pages[0].extract_text()
        assert "Photos 1 to 4 of 6" in r1.pages[0].extract_text()
        assert "Photos 5 to 6 of 6" in r2.pages[0].extract_text()

        # Test case B: 2 photos -> 1 page, no placeholders
        photos_2 = [_make_sample_image(color=(50, 150, 50)) for i in range(2)]
        pages_2 = svc._generate_photo_collage_pages(
            title="SITE PHOTOS - END WORK",
            category_label="End Work",
            photos=photos_2,
            proj=proj,
            master_assets=master_assets
        )
        assert len(pages_2) == 1
        r_end = PdfReader(io.BytesIO(pages_2[0]))
        assert "SITE PHOTOS - END WORK" in r_end.pages[0].extract_text()
        assert "Photos 1 to 2 of 2" in r_end.pages[0].extract_text()

        # Test case C: 0 photos -> 1 clean notice page (no crash)
        pages_0 = svc._generate_photo_collage_pages(
            title="SITE PHOTOS - START WORK",
            category_label="Start Work",
            photos=[],
            proj=proj,
            master_assets=master_assets
        )
        assert len(pages_0) == 1
        r_empty = PdfReader(io.BytesIO(pages_0[0]))
        assert "No Start Work Site Photos Uploaded" in r_empty.pages[0].extract_text()
    finally:
        _cleanup(db, test_po)


def test_jms_line_items_and_calculations(db: Session):
    """
    Verifies Section 4:
    - Retrieves real line items associated with 'JMS to be process' for selected PO/site.
    - Uses real database values and calculations.
    - Total Amount row matches Annexure right-aligned format.
    - Company ink-blue seal is rendered.
    """
    test_po = "TEST-JMS-CALC"
    test_site = "SITE-JMS-CALC"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, project_code="PRJ-JMS-001",
            current_task="JMS to be process"
        )
        line1 = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="SMPS-01",
            item_description="SMPS Rectifier 3KW Module", uom="Nos",
            po_qty=Decimal("4.00"), po_rate=Decimal("12500.00"), po_amount=Decimal("50000.00"),
            jms_qty=Decimal("4.00"), jms_amount=Decimal("50000.00"), jms_status="Approved"
        )
        line2 = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="CBL-02",
            item_description="Power Copper Cable 50 Sqmm", uom="Mtr",
            po_qty=Decimal("100.00"), po_rate=Decimal("350.00"), po_amount=Decimal("35000.00"),
            jms_qty=Decimal("100.00"), jms_amount=Decimal("35000.00"), jms_status="Approved"
        )
        db.add_all([proj, line1, line2])
        db.commit()

        svc = WccPdfService(db)
        master_assets = svc._get_master_company_assets()
        jms_bytes = svc._generate_jms_document_pages(test_po, test_site, proj, master_assets)

        reader = PdfReader(io.BytesIO(jms_bytes))
        page_text = reader.pages[0].extract_text()
        assert "JMS" in page_text
        assert "JOINT MEASUREMENT SHEET" not in page_text
        assert "SMPS-01" in page_text
        assert "CBL-02" in page_text
        assert "85,000.00" in page_text  # 50,000 + 35,000 Total Amount
        assert "JMS to be process" in page_text
    finally:
        _cleanup(db, test_po)


def test_statutory_sample_labels_and_seals(db: Session):
    """
    Verifies Section 5:
    - Generated EPF and ESI documents are clearly labeled SAMPLE / NOT OFFICIAL.
    - No real official government numbers fabricated.
    - Ink-blue company seal and standard layout applied.
    """
    test_po = "TEST-STAT-SAMPLE"
    test_site = "SITE-STAT-SAMPLE"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, project_code="PRJ-STAT-001"
        )
        db.add(proj)
        db.commit()

        svc = WccPdfService(db)
        master_assets = svc._get_master_company_assets()

        sample_page = svc._generate_sample_statutory_page(
            title="EPF MONTHLY CONTRIBUTION CHALLAN",
            doc_category="Employees' Provident Fund (EPF) Challan",
            sample_fields={"TRRN": "SAMPLE-TRRN-NOT-OFFICIAL", "Total EPF Wages": "Rs. 60,000.00"},
            proj=proj,
            master_assets=master_assets
        )

        reader = PdfReader(io.BytesIO(sample_page))
        text = reader.pages[0].extract_text()
        assert "EPF MONTHLY CONTRIBUTION CHALLAN" in text
        assert "SAMPLE / NOT OFFICIAL" in text
        assert "TEMPORARY SYSTEM DATA ONLY" in text
        assert "SAMPLE-TRRN-NOT-OFFICIAL" in text
    finally:
        _cleanup(db, test_po)


def test_full_14_additional_documents_merge_order(db: Session):
    """
    Verifies Section 6:
    The final merged PDF contains the 3 generated pages (Annexure, BOQ, WCC)
    followed by the 14 additional document categories in exact order:
    1. STN
    2. SRN
    3. CAM
    4. PTW Height
    5. PTW Electrical
    6. Commissioning Report
    7. Start Site Photos
    8. End Site Photos
    9. JMS
    10. Additional Approval
    11. EPF Challan
    12. EPF Payment Receipt
    13. ESI Challan
    14. ESI Payment Receipt
    """
    test_po = "TEST-ORDER-14"
    test_site = "SITE-ORDER-14"
    try:
        _cleanup(db, test_po)

        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Order Hub",
            project_code="PRJ-ORDER-14", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="MAT-01",
            item_description="Tower Material", uom="Nos",
            po_qty=Decimal("1.00"), po_rate=Decimal("15000.00"), po_amount=Decimal("15000.00"),
            jms_qty=Decimal("1.00"), jms_amount=Decimal("15000.00"), jms_status="Approved"
        )

        # Upload real STN PDF with STN number
        stn_pdf_bytes = _make_sample_pdf("Stock Transfer Note\nSTN Number: STN-998822\nDelivered")
        stn_infra = IndusProjectInfra(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, document_type="STN",
            document_number="STN-998822", document_date=date.today(),
            documents="data:application/pdf;base64," + base64.b64encode(stn_pdf_bytes).decode()
        )

        # Upload SRN record
        srn_infra = IndusProjectInfra(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, document_type="SRN",
            srn_ge_number="SRN-GE-3344", srn_ge_date=date.today(),
            infra_description="Service Receipt for Site Work"
        )

        # DPR record with Height, Electrical, Commissioning, and Photos
        img_start = _make_sample_image(color=(10, 150, 10))
        img_end = _make_sample_image(color=(150, 10, 10))
        dpr_rec = DprRecord(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, date=date.today(),
            h_ptw_number="H-PTW-5501", h_ptw_status="Approved",
            e_ptw_number="E-PTW-6602", e_ptw_status="Approved",
            c_ptw_number="CR-7703", c_ptw_status="Operational", activity="SMPS Commissioning",
            start_photo="data:image/png;base64," + base64.b64encode(img_start).decode(),
            end_photo="data:image/png;base64," + base64.b64encode(img_end).decode()
        )

        # Email approval record
        email_appr = EmailApproval(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, subject="Approval for Additional Tower Material",
            pm="Approved", zpm="Approved", scm="Approved", final_approved_status="Approved",
            final_approved_date=date.today()
        )

        db.add_all([proj, line, stn_infra, srn_infra, dpr_rec, email_appr])
        db.commit()

        svc = WccPdfService(db)
        res = svc.process_select_works_submission(test_po, test_site)
        assert res["success"] is True

        merged_pdf_bytes = base64.b64decode(res["pdfDataUri"].split("base64,")[1])
        reader = PdfReader(io.BytesIO(merged_pdf_bytes))

        # Check total pages: 3 initial + 13 additional category pages (with Photos combined 2-column) + attached original STN (1 page) = 17 pages minimum
        assert len(reader.pages) >= 17

        # Extract text from all pages to verify sequence
        all_text = [p.extract_text() or "" for p in reader.pages]

        # 1. Page 0: Annexure
        assert "ANNEXURE" in all_text[0]
        # 2. Page 1: BOQ
        assert "BOQ" in all_text[1]
        # 3. Page 2: Work Completion Certificate
        assert "Work Completion Certificate" in all_text[2]

        # Scan for each category header in sequential page order
        expected_sequence = [
            "STN No: STN-998822",
            "SRN No: SRN-GE-3344",
            "CAM No:",
            "PTW- Height (H-PTW-5501)",
            "PTW- Electrical (E-PTW-6602)",
            "COMMISSIONING REPORT (SMPS)",
            "SITE PHOTOS",
            "JMS",
            "ADDITIONAL APPROVAL",
            "EPF MONTHLY CONTRIBUTION CHALLAN",
            "EPF",
            "ESI MONTHLY CONTRIBUTION CHALLAN",
            "ESI"
        ]

        last_found_index = 2
        for title in expected_sequence:
            found = False
            for idx in range(last_found_index + 1, len(all_text)):
                if title in all_text[idx]:
                    assert idx > last_found_index, f"Title '{title}' found at page {idx + 1} which is not after page {last_found_index + 1}"
                    last_found_index = idx
                    found = True
                    break
            assert found, f"Expected category title '{title}' not found in merged PDF after page {last_found_index + 1}"

        # Verify extracted STN ID and uploaded content appear inside the templated page
        stn_page_text = all_text[3]  # STN is right after WCC
        assert "STN-998822" in stn_page_text
        # Uploaded document content is fitted inside the template on the SAME page
        assert "Delivered" in stn_page_text or "Stock Transfer Note" in stn_page_text
        assert "COMMERCIAL MANAGER" in stn_page_text

    finally:
        _cleanup(db, test_po)


def test_submission_idempotency_no_duplicate_merges(db: Session):
    """
    Verifies Section 7:
    - Retries update the existing WCC Merged Document without creating duplicates.
    - Exactly 1 'WCC Certificate' and 1 'WCC Merged Document' exist for the PO/site.
    """
    test_po = "TEST-IDEMPOTENT-001"
    test_site = "SITE-IDEMPOTENT-001"
    try:
        _cleanup(db, test_po)

        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, project_code="PRJ-IDEMP-01"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="M-01",
            po_qty=Decimal("1.00"), po_rate=Decimal("5000.00"), po_amount=Decimal("5000.00")
        )
        db.add_all([proj, line])
        db.commit()

        svc = WccPdfService(db)

        # First submission
        res1 = svc.process_select_works_submission(test_po, test_site)
        assert res1["success"] is True

        count_merged_1 = db.query(ProjectDocument).filter(
            ProjectDocument.po_no == test_po,
            ProjectDocument.document_number == "WCC Merged Document"
        ).count()
        assert count_merged_1 == 1

        # Second submission (retry)
        res2 = svc.process_select_works_submission(test_po, test_site)
        assert res2["success"] is True

        count_merged_2 = db.query(ProjectDocument).filter(
            ProjectDocument.po_no == test_po,
            ProjectDocument.document_number == "WCC Merged Document"
        ).count()
        assert count_merged_2 == 1  # Still exactly 1, no duplicate!

        assert res1["mergedDocumentId"] == res2["mergedDocumentId"]
    finally:
        _cleanup(db, test_po)


def test_exact_headers_and_infra_table_corrections(db: Session):
    """
    Verifies all 5 specific corrections:
    1. STN, SRN, CAM: Headers 'STN No: ...', 'SRN No: ...', 'CAM No: ...' (no full forms),
       and same line-item table columns as Infra page (STR reference).
    2. PTW: 'PTW- Height (...)', 'PTW- Electrical (...)' (no expansion).
    3. Site Photos: Two-column split on each page (Left: Before, Right: After).
    4. JMS: Exact header 'JMS', no full form, only 'JMS to be process' records.
    5. Additional Approval: Table structure matching Projects module.
    """
    test_po = "TEST-CORRECTIONS-PO"
    test_site = "SITE-CORRECTIONS-01"
    try:
        _cleanup(db, test_po)

        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Corrections Tower",
            project_code="PRJ-CORR-001", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="REC-01",
            item_description="SMPS Rectifier 50A", uom="Nos",
            po_qty=Decimal("2.00"), po_rate=Decimal("25000.00"), po_amount=Decimal("50000.00"),
            jms_qty=Decimal("2.00"), jms_amount=Decimal("50000.00"), jms_status="Approved"
        )

        stn_pdf = _make_sample_pdf("Stock Transfer Note\nSTN Number: STN/2026/8811\nCable items")
        stn_infra = IndusProjectInfra(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, document_type="STN",
            document_number="STN/2026/8811", boq_number="BOQ-STN-01",
            infra_category="Power Equipment", infra_description="48V Power Plant",
            installation_type="Indoor", infra_type="Delta", uom="Nos", qty=Decimal("1.00"),
            documents="data:application/pdf;base64," + base64.b64encode(stn_pdf).decode()
        )

        srn_infra = IndusProjectInfra(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, document_type="SRN",
            srn_ge_number="SRN-990022", boq_number="BOQ-SRN-02",
            infra_category="Installation Services", infra_description="Tower Erection Service",
            infra_type="Service", uom="Lot", qty=Decimal("1.00")
        )

        cam_infra = IndusProjectInfra(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, document_type="CAM",
            document_number="CAM-SITE-7711", boq_number="BOQ-CAM-03", boq_date=date.today(),
            infra_category="Civil Infrastructure", infra_description="Rooftop Tower Acceptance",
            infra_type="Ground Based", uom="Nos", qty=Decimal("1.00")
        )

        img_b = _make_sample_image(color=(20, 120, 20))
        img_a = _make_sample_image(color=(120, 20, 20))
        dpr_rec = DprRecord(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, date=date.today(),
            h_ptw_number="PTW-H-1001", h_ptw_status="Approved",
            e_ptw_number="PTW-E-2002", e_ptw_status="Approved",
            start_photo="data:image/png;base64," + base64.b64encode(img_b).decode(),
            end_photo="data:image/png;base64," + base64.b64encode(img_a).decode()
        )

        email_appr = EmailApproval(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, subject="DG Foundation Approval",
            pm="Approved", zpm="Approved", scm="Approved", final_approved_status="Approved",
            final_approved_date=date.today()
        )

        db.add_all([proj, line, stn_infra, srn_infra, cam_infra, dpr_rec, email_appr])
        db.commit()

        svc = WccPdfService(db)
        res = svc.process_select_works_submission(test_po, test_site)
        assert res["success"] is True

        pdf_bytes = base64.b64decode(res["pdfDataUri"].split("base64,")[1])
        reader = PdfReader(io.BytesIO(pdf_bytes))
        all_text = "\n---PAGE---\n".join([p.extract_text() or "" for p in reader.pages])

        # 1. STN, SRN, CAM exact headers and no full forms in header
        assert "STN No: STN/2026/8811" in all_text
        assert "STOCK TRANSFER NOTE (STN)" not in all_text

        assert "SRN No: SRN-990022" in all_text
        assert "SERVICE RECEIPT NOTE (SRN)" not in all_text

        assert "CAM No: CAM-SITE-7711" in all_text
        assert "CELL SITE ACCEPTANCE (CAM)" not in all_text

        # 1. Line-item table columns from Infra page (SRN / CAM)
        assert "BOQ No" in all_text
        assert "Infra Description" in all_text
        assert "Item Category" in all_text

        # 2. PTW Height and PTW Electrical exact headers
        assert "PTW- Height (PTW-H-1001)" in all_text
        assert "PERMIT TO WORK - HEIGHT" not in all_text
        assert "PTW- Electrical (PTW-E-2002)" in all_text
        assert "PERMIT TO WORK - ELECTRICAL" not in all_text

        # 3. Site Photos two-column split
        assert "SITE PHOTOS" in all_text
        assert "BEFORE" in all_text
        assert "AFTER" in all_text
        assert "Before Photo #1" in all_text
        assert "After Photo #1" in all_text

        # 4. JMS header exactly JMS
        assert "JMS" in all_text
        assert "JOINT MEASUREMENT SHEET" not in all_text
        assert "REC-01" in all_text
        assert "50,000.00" in all_text

        # 5. Additional Approval table
        assert "ADDITIONAL APPROVAL" in all_text
        assert "DG Foundation & Canopy Installation" in all_text
        assert "Estimated" in all_text
        assert "Expensed" in all_text
        assert "Approved" in all_text

    finally:
        _cleanup(db, test_po)
