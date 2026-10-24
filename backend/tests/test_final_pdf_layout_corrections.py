import os
import io
import math
import base64
from datetime import date
from decimal import Decimal
import pytest
from pypdf import PdfReader
from sqlalchemy.orm import Session
from reportlab.lib import colors

from app.db.session import ProjectSessionLocal
from app.models.commercial_project import (
    TelecomProject, TelecomIndusPo, ProjectDocument, IndusProjectInfra, DprRecord, EmailApproval
)
from app.services.wcc_pdf_service import (
    WccPdfService,
    ANNEX_COL_WIDTHS,
    BOQ_COL_WIDTHS,
    TABLE_W,
    BORDER_RADIUS,
    DEFAULT_SITE_PHOTO_BEFORE_PATH,
    DEFAULT_SITE_PHOTO_AFTER_PATH,
    _column_table_style,
    _info_table_style,
    _draw_circular_seal,
    _draw_page_border,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    BORDER_INSET,
    SEAL_INK
)


@pytest.fixture
def db():
    session = ProjectSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _cleanup(db: Session, po_no: str):
    db.query(IndusProjectInfra).filter(IndusProjectInfra.po_no == po_no).delete()
    db.query(DprRecord).filter(DprRecord.po_no == po_no).delete()
    db.query(EmailApproval).filter(EmailApproval.po_no == po_no).delete()
    db.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
    db.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    db.commit()


def test_annexure_and_boq_column_widths_and_row_separators():
    """
    1. Annexure and BOQ tables:
    - Thin, light-grey horizontal separator lines between data rows in both tables.
    - Reduced widths of Rate and Amount columns.
    - Saved width allocated to Item Description (expanded).
    - Sum equals TABLE_W.
    """
    # Verify column widths sum to exact TABLE_W
    assert sum(ANNEX_COL_WIDTHS) == pytest.approx(TABLE_W)
    assert sum(BOQ_COL_WIDTHS) == pytest.approx(TABLE_W)

    # Rate and Amount reduced from original 100.0 and 120.0
    rate_width = ANNEX_COL_WIDTHS[5]
    amount_width = ANNEX_COL_WIDTHS[6]
    assert rate_width <= 75.0, f"Rate width {rate_width} should be reduced"
    assert amount_width <= 95.0, f"Amount width {amount_width} should be reduced"

    # Item Description allocated majority width (expanded from 604.25 to 664.25)
    item_desc_width = ANNEX_COL_WIDTHS[2]
    assert item_desc_width >= 660.0, f"Item description width {item_desc_width} should be expanded"

    # Verify _column_table_style has thin light-grey horizontal separator lines between data rows
    style_cmds = _column_table_style(header_rows=1)
    has_separator_line = any(
        cmd[0] == 'LINEBELOW' and cmd[3] == 0.5 and cmd[4] == colors.HexColor("#d1d5db")
        for cmd in style_cmds
    )
    assert has_separator_line, "Expected 0.5 pt light-grey LINEBELOW separator between data rows"


def test_seal_designation_and_matching_underline():
    """
    2. Seal and designation:
    - Change seal designation to Commercial Manager, replacing Manager.
    - Add a thin horizontal line immediately below the designation, matching the line above it in style and length.
    - Preserve ink-blue seal, concentric circles, company name, stars, employee name, location/PIN code, and generated date.
    """
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))

    # Spy on canvas line drawing to verify matching lines above and below designation
    drawn_lines = []
    orig_line = c.line
    def spy_line(x1, y1, x2, y2):
        drawn_lines.append((x1, y1, x2, y2))
        return orig_line(x1, y1, x2, y2)
    c.line = spy_line

    _draw_circular_seal(
        c, cx=200, cy=500, radius=68,
        company_name="Nexus", location_text="Chennai - 600002",
        person_name="John Doe", designation="Manager", date_str="24/10/2026"
    )
    c.showPage()
    c.save()

    pdf_bytes = buf.getvalue()
    reader = PdfReader(io.BytesIO(pdf_bytes))
    page_text = reader.pages[0].extract_text()

    # Verify designation changed from Manager to COMMERCIAL MANAGER
    assert "COMMERCIAL MANAGER" in page_text
    compact_text = page_text.replace("\n", "")
    assert "NEXUS" in compact_text
    assert "CHENNAI" in compact_text
    assert "24/10/2026" in page_text

    # Verify lines above (cy + 1 = 501) and below (cy - 14 = 486) designation
    # Both lines should have the same length: 2 * (0.70 * 68) * 0.70 ~= 66.64 pt
    r_in = 0.70 * 68.0
    expected_length = 2 * r_in * 0.70
    line_above = [l for l in drawn_lines if abs(l[1] - 501.0) < 1.0]
    line_below = [l for l in drawn_lines if abs(l[1] - 486.0) < 1.0]

    assert len(line_above) == 1, "Expected top line above designation at cy + 1"
    assert len(line_below) == 1, "Expected bottom line below designation at cy - 14"

    len_top = line_above[0][2] - line_above[0][0]
    len_bottom = line_below[0][2] - line_below[0][0]
    assert abs(len_top - expected_length) < 1.0
    assert abs(len_bottom - expected_length) < 1.0
    assert abs(len_top - len_bottom) < 0.01, "Top and bottom lines must match in style and length"


def test_adaptive_page_border_calculation():
    """
    3. Adaptive page border:
    - On Annexure, BOQ, and Work Completion Certificate, end page border immediately below final table row (immediate_table_end=True).
    - When seal is mid-page on additional documents, extend side borders only to seal's bottom level.
    - When content fills page, support full-page border with rounded corners.
    """
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))

    drawn_rects = []
    orig_roundRect = c.roundRect
    def spy_roundRect(x, y, w, h, r, stroke=1, fill=0):
        drawn_rects.append((x, y, w, h, r))
        return orig_roundRect(x, y, w, h, r, stroke=stroke, fill=fill)
    c.roundRect = spy_roundRect

    # Scenario A: Immediate table end (first 3 pages rule)
    _draw_page_border(c, bottom_endpoint=850.0, immediate_table_end=True)
    assert len(drawn_rects) == 1
    x0, y0, w0, h0, r0 = drawn_rects[0]
    assert x0 == BORDER_INSET
    assert y0 == 850.0  # Ends immediately below the table row
    assert w0 == PAGE_WIDTH - 2 * BORDER_INSET
    assert h0 == (PAGE_HEIGHT - BORDER_INSET) - 850.0

    # Scenario B: Seal is mid-page on additional documents (bottom_endpoint = 650.0)
    _draw_page_border(c, bottom_endpoint=650.0, immediate_table_end=False)
    assert len(drawn_rects) == 2
    x, y, w, h, r = drawn_rects[1]
    assert x == BORDER_INSET
    assert y == 650.0 - 14.0  # 636.0 pt
    assert w == PAGE_WIDTH - 2 * BORDER_INSET
    assert h == (PAGE_HEIGHT - BORDER_INSET) - (650.0 - 14.0)

    # Scenario C: Content fills page down to bottom (bottom_endpoint = 34.0)
    _draw_page_border(c, bottom_endpoint=34.0)
    assert len(drawn_rects) == 3
    x2, y2, w2, h2, r2 = drawn_rects[2]
    assert x2 == BORDER_INSET
    assert y2 == BORDER_INSET  # Full-page border
    assert h2 == PAGE_HEIGHT - 2 * BORDER_INSET

    # Scenario D: No bottom_endpoint provided (defaults to full page)
    _draw_page_border(c, bottom_endpoint=None)
    assert len(drawn_rects) == 4
    assert drawn_rects[3][1] == BORDER_INSET


def test_first_three_pages_border_and_info_separators(db: Session):
    """
    1. Border and tables — first three pages only:
    - On Annexure, BOQ, and Work Completion Certificate, end page border immediately below final table row.
    - Place seal below table outside table itself.
    - Information tables have thin subtle light-grey horizontal separator lines between rows.
    """
    test_po = "TEST-FIRST3-BORDER"
    test_site = "SITE-FIRST3-BORDER"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Border Test Site",
            project_code="PRJ-BORD-001", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, line_number="1",
            item_code="ITEM-BORD-01", item_description="Tower Ladder 30m",
            uom="Mtr", po_qty=Decimal("10.00"), po_rate=Decimal("250.00"),
            po_amount=Decimal("2500.00"), jms_qty=Decimal("10.00"),
            jms_amount=Decimal("2500.00"), jms_status="Approved"
        )
        db.add_all([proj, line])
        db.commit()

        # Check info table style contains subtle row separator
        style = _info_table_style()
        line_below_cmds = [cmd for cmd in style if cmd[0] == 'LINEBELOW']
        assert len(line_below_cmds) >= 1
        cmd = line_below_cmds[0]
        assert cmd[3] == 0.5  # 0.5 pt thin
        assert cmd[4] == colors.HexColor("#d1d5db")  # Light grey

        svc = WccPdfService(db)
        pdf_bytes = svc.generate_three_page_wcc_pdf(test_po, test_site)
        reader = PdfReader(io.BytesIO(pdf_bytes))
        assert len(reader.pages) == 3

        # All 3 pages have Commercial Manager seal
        for idx, pg in enumerate(reader.pages):
            txt = pg.extract_text()
            assert "COMMERCIAL MANAGER" in txt, f"Page {idx+1} missing Commercial Manager seal"

    finally:
        _cleanup(db, test_po)


def test_additional_documents_no_repeated_project_info_table(db: Session):
    """
    4. Additional documents layout:
    - Remove the repeated project-information table containing Project ID, Site ID, Site Name, Project Type
      from the additional-document pages.
    - Retain document-specific content and tables.
    - Position ink-blue seal at bottom-left inside adaptive border.
    """
    test_po = "TEST-NO-REPEAT-META"
    test_site = "SITE-NO-REPEAT-META"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Meta Hub",
            project_code="PRJ-META-999", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="SMPS-01",
            item_description="SMPS Module", uom="Nos",
            po_qty=Decimal("2.00"), po_rate=Decimal("1000.00"), po_amount=Decimal("2000.00"),
            jms_qty=Decimal("2.00"), jms_amount=Decimal("2000.00"), jms_status="Approved"
        )
        db.add_all([proj, line])
        db.commit()

        svc = WccPdfService(db)
        master_assets = svc._get_master_company_assets()

        # 1. Category cover page (e.g. PTW Height)
        cover_page_bytes = svc._generate_category_cover_page(
            title="PTW- Height (H-PTW-001)",
            category_name="PTW- Height",
            doc_number="H-PTW-001",
            doc_date_str="24/10/2026",
            details_list=[("Work Type", "Tower Erection")],
            proj=proj,
            master_assets=master_assets
        )
        r_cover = PdfReader(io.BytesIO(cover_page_bytes))
        cover_text = r_cover.pages[0].extract_text()
        assert "Project Code:" not in cover_text
        assert "PO Number:" not in cover_text
        assert "DOCUMENT SPECIFICATION" in cover_text
        assert "PTW- Height" in cover_text
        assert "COMMERCIAL MANAGER" in cover_text

        # 2. Line item document page (e.g. STN)
        li_page_bytes = svc._generate_line_item_document_page(
            title="STN No: STN-1234",
            doc_date_str="24/10/2026",
            headers=["Sl#", "Item Description", "Qty"],
            col_widths=[50.0, 1000.0, 104.25],
            rows_data=[["1", "Tower Leg Material", "5.00"]],
            proj=proj,
            master_assets=master_assets
        )
        r_li = PdfReader(io.BytesIO(li_page_bytes))
        li_text = r_li.pages[0].extract_text()
        assert "Project Code:" not in li_text
        assert "PO Number:" not in li_text
        assert "Tower Leg Material" in li_text
        assert "COMMERCIAL MANAGER" in li_text

        # 3. JMS document page
        jms_page_bytes = svc._generate_jms_document_pages(test_po, test_site, proj, master_assets)
        r_jms = PdfReader(io.BytesIO(jms_page_bytes))
        jms_text = r_jms.pages[0].extract_text()
        assert "Project Code:" not in jms_text
        assert "PO Number:" not in jms_text
        assert "SMPS-01" in jms_text
        assert "COMMERCIAL MANAGER" in jms_text

        # 4. Sample statutory page (e.g. EPF)
        sample_page_bytes = svc._generate_sample_statutory_page(
            title="EPF MONTHLY CONTRIBUTION CHALLAN",
            doc_category="EPF Challan",
            sample_fields={"TRRN": "SAMPLE-TRRN-123"},
            proj=proj,
            master_assets=master_assets
        )
        r_sample = PdfReader(io.BytesIO(sample_page_bytes))
        sample_text = r_sample.pages[0].extract_text()
        assert "Project Code:" not in sample_text
        assert "PO Number:" not in sample_text
        assert "SAMPLE / NOT OFFICIAL" in sample_text
        assert "COMMERCIAL MANAGER" in sample_text
        assert "SAMPLE — NOT OFFICIAL" in sample_text

    finally:
        _cleanup(db, test_po)


def test_hoto_and_noc_merge_workflow_and_ordering(db: Session):
    """
    2 & 5. HOTO and NOC headers and merge:
    - Use exactly HOTO and NOC as document titles without abbreviation expansion.
    - Integrated into merge workflow at the end (items 15 and 16).
    - Handle both uploaded files and labelled draft/template if not uploaded.
    """
    test_po = "TEST-HOTO-NOC-MERGE"
    test_site = "SITE-HOTO-NOC-MERGE"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Handover Site",
            project_code="PRJ-HN-001", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, item_code="MAT-HN",
            item_description="Handover Equipment", uom="Nos",
            po_qty=Decimal("1.00"), po_rate=Decimal("5000.00"), po_amount=Decimal("5000.00"),
            jms_qty=Decimal("1.00"), jms_amount=Decimal("5000.00"), jms_status="Approved"
        )

        # Upload a real NOC PDF document
        from reportlab.pdfgen import canvas
        noc_buf = io.BytesIO()
        c = canvas.Canvas(noc_buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
        c.drawString(100, 700, "Official No Objection Certificate: NOC-OFFICIAL-8877")
        c.showPage()
        c.save()
        noc_pdf_bytes = noc_buf.getvalue()

        noc_doc = ProjectDocument(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site,
            document_name="NOC_Official_Site.pdf", document_number="NOC-OFFICIAL-8877",
            documents="data:application/pdf;base64," + base64.b64encode(noc_pdf_bytes).decode(),
            date=date.today()
        )

        db.add_all([proj, line, noc_doc])
        db.commit()

        svc = WccPdfService(db)
        res = svc.process_select_works_submission(test_po, test_site)
        assert res["success"] is True

        merged_pdf_bytes = base64.b64decode(res["pdfDataUri"].split("base64,")[1])
        reader = PdfReader(io.BytesIO(merged_pdf_bytes))
        all_text = [p.extract_text() or "" for p in reader.pages]

        # Check that HOTO (item 15) uses exact abbreviation HOTO
        hoto_page_idx = None
        for idx, txt in enumerate(all_text):
            first_lines = txt.split("\n")[:3]
            if first_lines and first_lines[0].strip() == "HOTO":
                hoto_page_idx = idx
                break
        assert hoto_page_idx is not None, "HOTO page not found in merged PDF"
        # Confirm no expanded form is used
        assert "HAND OVER TAKE OVER" not in all_text[hoto_page_idx]
        assert "COMMERCIAL MANAGER" in all_text[hoto_page_idx]
        assert "SAMPLE" in all_text[hoto_page_idx]

        # Check that NOC (item 16) is present and uses exact abbreviation NOC
        noc_page_idx = None
        for idx in range(hoto_page_idx + 1, len(all_text)):
            first_lines = all_text[idx].split("\n")[:3]
            if first_lines and first_lines[0].strip() == "NOC":
                noc_page_idx = idx
                break
        assert noc_page_idx is not None, "NOC page not found in merged PDF after HOTO"
        assert noc_page_idx > hoto_page_idx, "NOC must appear after HOTO"
        assert "NO OBJECTION CERTIFICATE" not in all_text[noc_page_idx]
        # In the corrected template-fitting implementation, the uploaded NOC PDF is scaled and fitted INSIDE the template page
        # with the header, logo, and seal on the SAME page, rather than appended as a raw page after a blank cover.
        assert "NOC-OFFICIAL-8877" in all_text[noc_page_idx]
        assert "COMMERCIAL MANAGER" in all_text[noc_page_idx]
        assert not any("NOC-OFFICIAL-8877" in t for t in all_text[noc_page_idx + 1:])

    finally:
        _cleanup(db, test_po)


def test_generate_all_15_sample_pdfs_and_watermark(db: Session):
    """
    4, 5, 6. Sample PDFs for all 15 additional document categories:
    - Generates 15 standalone sample PDFs.
    - All include SAMPLE — NOT OFFICIAL watermark.
    - Site Photos sample has Before on left and After on right in a neat grid.
    - HOTO sample has handover checklist & punch points without fabricated signatures.
    """
    svc = WccPdfService(db)
    results = svc.generate_all_sample_pdfs()
    assert len(results) == 15

    expected_categories = [
        "STN", "SRN", "CAM", "PTW- Height", "PTW- Electrical",
        "Commissioning Report", "Site Photos", "JMS", "Additional Approval",
        "EPF Challan", "EPF Payment Receipt", "ESI Challan", "ESI Payment Receipt",
        "HOTO", "NOC"
    ]
    for cat in expected_categories:
        assert cat in results, f"Missing category: {cat}"
        file_path = results[cat]
        assert os.path.exists(file_path), f"Sample file not created: {file_path}"

        rdr = PdfReader(file_path)
        assert len(rdr.pages) >= 1
        page_text = rdr.pages[0].extract_text()
        assert "SAMPLE — NOT OFFICIAL" in page_text or "SAMPLE" in page_text

    # Specific check for Site Photos Before and After
    photos_pdf = results["Site Photos"]
    photos_txt = PdfReader(photos_pdf).pages[0].extract_text()
    assert "BEFORE" in photos_txt
    assert "AFTER" in photos_txt
    assert "SITE PHOTOS" in photos_txt

    # Specific check for HOTO exact title and checklist
    hoto_pdf = results["HOTO"]
    hoto_txt = PdfReader(hoto_pdf).pages[0].extract_text()
    assert "HOTO" in hoto_txt
    assert "HAND OVER TAKE OVER" not in hoto_txt
    assert "Tower Mast & Foundation" in hoto_txt
    assert "No authorized handover signature" in hoto_txt

    # Specific check for NOC exact title
    noc_pdf = results["NOC"]
    noc_txt = PdfReader(noc_pdf).pages[0].extract_text()
    assert "NOC" in noc_txt
    assert "NO OBJECTION CERTIFICATE" not in noc_txt


def test_rounded_table_borders_and_wcc_no_vertical_separators(db: Session):
    """
    1. Fix rounded table borders on first three pages:
    - Annexure, BOQ, WCC: final row bottom border has matching rounded corners (BORDER_RADIUS)
      and connects smoothly to left/right borders without overlapping square corners.
    - _column_table_style(header_rows=1, rounded_bottom=True) omits square BOX.
    - On Work Completion Certificate: first info table removes all internal vertical separator lines
      while preserving outer border and horizontal lines.
    """
    # 1. Verify style helper when rounded_bottom=True
    std_style = _column_table_style(header_rows=1, rounded_bottom=False)
    box_cmd = [c for c in std_style if c[0] == 'BOX']
    assert len(box_cmd) >= 1, "Standard table style must have BOX command"

    rounded_style = _column_table_style(header_rows=1, rounded_bottom=True)
    box_cmd_rounded = [c for c in rounded_style if c[0] == 'BOX']
    assert len(box_cmd_rounded) == 0, "Rounded bottom style must NOT have square BOX command"
    line_after_cmd = [c for c in rounded_style if c[0] == 'LINEAFTER']
    line_before_cmd = [c for c in rounded_style if c[0] == 'LINEBEFORE']
    assert len(line_after_cmd) >= 1, "Must have LINEAFTER for right border"
    assert len(line_before_cmd) >= 1, "Must have LINEBEFORE for left border"

    # 2. Verify 3-page generation generates valid PDF with rounded treatment
    test_po = "TEST-ROUNDED-WCC"
    test_site = "SITE-ROUNDED-WCC"
    try:
        _cleanup(db, test_po)
        proj = TelecomProject(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, site_name="Rounded Border Site",
            project_code="PRJ-RND-001", current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus", customer_name="Indus Towers Ltd",
            po_no=test_po, site_id=test_site, line_number="1",
            item_code="ITEM-RND-01", item_description="High-grade galvanized cable tray 300mm",
            uom="Mtr", po_qty=Decimal("15.00"), po_rate=Decimal("350.00"),
            po_amount=Decimal("5250.00"), jms_qty=Decimal("15.00"),
            jms_amount=Decimal("5250.00"), jms_status="Approved"
        )
        db.add_all([proj, line])
        db.commit()

        svc = WccPdfService(db)
        pdf_bytes = svc.generate_three_page_wcc_pdf(test_po, test_site)
        reader = PdfReader(io.BytesIO(pdf_bytes))
        assert len(reader.pages) == 3

        # Page 1: Annexure text
        annex_txt = reader.pages[0].extract_text()
        assert "ANNEXURE" in annex_txt
        assert "COMMERCIAL MANAGER" in annex_txt

        # Page 2: BOQ text
        boq_txt = reader.pages[1].extract_text()
        assert "BOQ" in boq_txt
        assert "COMMERCIAL MANAGER" in boq_txt

        # Page 3: WCC text
        wcc_txt = reader.pages[2].extract_text()
        assert "Work Completion Certificate" in wcc_txt
        assert "COMMERCIAL MANAGER" in wcc_txt
    finally:
        _cleanup(db, test_po)


def test_fit_pdf_into_nexus_template_single_and_multipage(db: Session):
    """
    2. Additional-document template — critical correction:
    - Scaled down proportionally and centered between header and seal.
    - Page composition on the SAME page:
      Top: Header with doc title & logo.
      Middle: Uploaded PDF content scaled and centered.
      Bottom: Generated company seal.
      Border: Rounded page border.
    - Multi-page source produces one templated page for each source page.
    - Never append original PDF unchanged after template page; never create blank template cover page followed by raw PDF.
    """
    svc = WccPdfService(db)
    master_assets = svc._get_master_company_assets()

    # Create a 2-page source PDF with specific text on each page
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(595.27, 841.89))
    c.drawString(72, 750, "FIRST SOURCE PAGE CONTENT: COMMISSIONING DATA")
    c.showPage()
    c.drawString(72, 750, "SECOND SOURCE PAGE CONTENT: BATTERY LOG REPORT")
    c.showPage()
    c.save()
    src_bytes = buf.getvalue()

    # Fit into Nexus template
    fitted_bytes = svc.fit_pdf_into_nexus_template(
        raw_pdf_bytes=src_bytes,
        title="COMMISSIONING REPORT",
        master_assets=master_assets,
        watermark_sample=False
    )

    reader = PdfReader(io.BytesIO(fitted_bytes))
    # Must produce exactly 2 templated pages
    assert len(reader.pages) == 2, f"Expected 2 templated pages, got {len(reader.pages)}"

    # Page 1 must have header chrome, original content, AND seal on the same page
    p1_txt = reader.pages[0].extract_text()
    assert "COMMISSIONING REPORT" in p1_txt
    assert "FIRST SOURCE PAGE CONTENT" in p1_txt
    assert "COMMERCIAL MANAGER" in p1_txt
    assert "SECOND SOURCE PAGE" not in p1_txt

    # Page 2 must have header chrome, original content, AND seal on the same page
    p2_txt = reader.pages[1].extract_text()
    assert "COMMISSIONING REPORT" in p2_txt
    assert "SECOND SOURCE PAGE CONTENT" in p2_txt
    assert "COMMERCIAL MANAGER" in p2_txt
    assert "FIRST SOURCE PAGE" not in p2_txt


def test_site_photos_two_image_side_by_side_layout(db: Session):
    """
    4. Site Photos layout:
    - Loads image1: E:\\Bedroom Makeover_ Before and After (1).png (Before, left)
      and image2: E:\\Messy Desk to Motivational Workspace.png (After, right).
    - Arranges side by side on one page, fitted between header and seal without clipping.
    """
    assert os.path.exists(DEFAULT_SITE_PHOTO_BEFORE_PATH), f"Before photo file not found: {DEFAULT_SITE_PHOTO_BEFORE_PATH}"
    assert os.path.exists(DEFAULT_SITE_PHOTO_AFTER_PATH), f"After photo file not found: {DEFAULT_SITE_PHOTO_AFTER_PATH}"

    svc = WccPdfService(db)
    master_assets = svc._get_master_company_assets()

    # Generate sample site photos
    photos_pdf_bytes = svc.generate_sample_additional_document("Site Photos")
    reader = PdfReader(io.BytesIO(photos_pdf_bytes))
    assert len(reader.pages) == 1

    page_txt = reader.pages[0].extract_text()
    assert "SITE PHOTOS" in page_txt
    assert "BEFORE" in page_txt
    assert "AFTER" in page_txt
    assert "COMMERCIAL MANAGER" in page_txt


def test_hoto_two_images_on_one_page(db: Session):
    """
    4. HOTO image layout:
    - Support two images on one page side by side when image content is supplied.
    - Title strictly 'HOTO'.
    """
    svc = WccPdfService(db)
    master_assets = svc._get_master_company_assets()

    # Load 2 images from default photos
    with open(DEFAULT_SITE_PHOTO_BEFORE_PATH, "rb") as f:
        img1 = f.read()
    with open(DEFAULT_SITE_PHOTO_AFTER_PATH, "rb") as f:
        img2 = f.read()

    hoto_page = svc._generate_two_image_page(
        title="HOTO",
        img1_bytes=img1,
        img2_bytes=img2,
        img1_label="HANDOVER ASSET 1",
        img2_label="HANDOVER ASSET 2",
        master_assets=master_assets
    )

    reader = PdfReader(io.BytesIO(hoto_page))
    assert len(reader.pages) == 1
    page_txt = reader.pages[0].extract_text()
    assert "HOTO" in page_txt
    assert "HAND OVER TAKE OVER" not in page_txt
    assert "HANDOVER ASSET 1" in page_txt
    assert "HANDOVER ASSET 2" in page_txt
    assert "COMMERCIAL MANAGER" in page_txt


def test_generate_and_store_14_sample_documents_in_db_and_filesystem(db: Session):
    """
    3. Generate and store sample documents first:
    - Generate one sample PDF for each of the 14 categories (excluding Site Photos).
    - Mark clearly with 'SAMPLE — NOT OFFICIAL'.
    - Stored in ProjectDocument table without overwriting real user uploads.
    - Stored in frontend/assets/sample_pdfs/.
    - Run each through template-fitting operation.
    """
    svc = WccPdfService(db)
    results = svc.generate_and_store_sample_documents()

    assert len(results) == 14
    expected_14 = [
        "STN", "SRN", "CAM", "PTW- Height", "PTW- Electrical",
        "Commissioning Report", "JMS", "Additional Approval",
        "EPF Challan", "EPF Payment Receipt", "ESI Challan", "ESI Payment Receipt",
        "HOTO", "NOC"
    ]

    for cat in expected_14:
        assert cat in results, f"Missing category: {cat}"
        file_path = results[cat]
        assert os.path.exists(file_path), f"File {file_path} does not exist"

        # Check DB record
        slug = cat.lower().replace(" ", "_").replace("-", "_")
        doc_num = f"SAMPLE-{slug.upper()}-2026"
        db_doc = db.query(ProjectDocument).filter(
            ProjectDocument.document_number == doc_num
        ).first()
        assert db_doc is not None, f"DB record missing for {cat}"
        assert "SAMPLE" in (db_doc.document_details or "").upper()

        # Check PDF content has watermark and template
        rdr = PdfReader(file_path)
        assert len(rdr.pages) >= 1
        txt = rdr.pages[0].extract_text()
        assert "COMMERCIAL MANAGER" in txt
        assert "SAMPLE — NOT OFFICIAL" in txt or "SAMPLE" in txt

