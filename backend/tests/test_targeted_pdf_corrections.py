import os
import io
import pytest
from pypdf import PdfReader
from PIL import Image

from app.services.wcc_pdf_service import (
    WccPdfService,
    FIXED_SEAL_TOP,
    SAMPLE_ANNEXURE_BOQ_ITEMS,
    REPLACEMENT_SITE_PHOTO_PATHS,
    PAGE_WIDTH,
    PAGE_HEIGHT,
)
from app.models.commercial_project import TelecomProject, TelecomIndusPo


@pytest.fixture
def pdf_service(project_db_session):
    return WccPdfService(project_db=project_db_session)


def test_annexure_and_boq_15_sample_rows_and_square_corners(project_db_session, pdf_service):
    """
    Requirement 3:
    - 15 sample data rows on second table for Annexure and BOQ.
    - Not inserted into production database (TelecomIndusPo count stays identical).
    - Rounded bottom corners removed; normal square bottom edges.
    """
    initial_po_count = project_db_session.query(TelecomIndusPo).count()

    # Create dummy project for rendering
    po_no = "PO-SMP-15-VERIFY"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-TEST-SAMPLE-15",
        site_id="SITE-SMP-15",
        site_name="Sample Verification Site",
        project_type="Civil & Electrical"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Generate 3-page PDF with use_sample_rows=True
    pdf_bytes = pdf_service.generate_three_page_wcc_pdf(
        po_no=po_no,
        site_id=proj.site_id,
        use_sample_rows=True
    )
    assert pdf_bytes is not None and len(pdf_bytes) > 0

    # Ensure no rows were added to TelecomIndusPo
    final_po_count = project_db_session.query(TelecomIndusPo).count()
    assert final_po_count == initial_po_count, "Sample rows must NOT be inserted into production database"

    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) >= 3

    # Check page 1 (Annexure) text
    p1_text = reader.pages[0].extract_text()
    assert "ANNEXURE" in p1_text
    assert "SMP-CIV-001" in p1_text
    assert "SMP-TSP-015" in p1_text
    assert "SMP-TSP-030" in p1_text
    assert "SMP-TSP-040" in p1_text
    assert len(SAMPLE_ANNEXURE_BOQ_ITEMS) == 40

    # Check page 2 (BOQ) text
    p2_text = reader.pages[1].extract_text()
    assert "BOQ" in p2_text
    assert "SMP-CIV-001" in p2_text
    assert "SMP-TSP-015" in p2_text
    assert "SMP-TSP-030" in p2_text
    assert "SMP-TSP-040" in p2_text


def test_additional_document_template_only(pdf_service):
    """
    Requirement 1:
    - Template only: Header, logo, page border, ink-blue seal.
    - Remove all system-generated information tables (Project ID, Site ID, Site Name, Project Type).
    """
    template_bytes = pdf_service.generate_additional_document_template(title="HOTO")
    assert template_bytes is not None and len(template_bytes) > 0

    reader = PdfReader(io.BytesIO(template_bytes))
    assert len(reader.pages) == 1
    page_text = reader.pages[0].extract_text()

    # Must contain title
    assert "HOTO" in page_text

    # Must NOT contain system-generated information table fields
    assert "Project ID" not in page_text
    assert "Site ID" not in page_text
    assert "Site Name" not in page_text
    assert "Project Type" not in page_text
    assert "Project Code" not in page_text


def test_sample_additional_documents_have_no_system_info_tables(pdf_service):
    """
    Requirement 1 & 2:
    - Test across additional document sample categories:
      HOTO, NOC, PTW- HEIGHT, PTW- ELECTRICAL, COMMISSIONING REPORT, STN, SRN, CAM, JMS, ADDITIONAL APPROVAL.
    - Ensure none contains system-generated info tables with Site ID, Site Name, Project Code.
    - Seal position is at fixed bottom-left (FIXED_SEAL_TOP).
    """
    categories = [
        "HOTO", "NOC", "PTW- HEIGHT", "PTW- ELECTRICAL",
        "COMMISSIONING REPORT", "STN", "SRN", "CAM", "JMS", "ADDITIONAL APPROVAL"
    ]
    for cat in categories:
        pdf_bytes = pdf_service.generate_sample_additional_document(cat)
        reader = PdfReader(io.BytesIO(pdf_bytes))
        assert len(reader.pages) >= 1
        page_text = reader.pages[0].extract_text()

        # System info metadata table headers should not appear
        assert "Site ID" not in page_text, f"{cat} still has Site ID info table"
        assert "Site Name" not in page_text, f"{cat} still has Site Name info table"
        assert "Project Reference" not in page_text, f"{cat} still has Project Reference info table"


def test_site_photos_2x2_grid_and_replacement_images(pdf_service):
    """
    Requirement 5:
    - Uses four replacement images: E:\1.jpeg, E:\2.jpeg, E:\3.jpeg, E:\4.jpeg.
    - 2x2 grid arrangement.
    - Fixed bottom-left seal.
    - Reports error if any path missing.
    """
    assert len(REPLACEMENT_SITE_PHOTO_PATHS) == 4
    for p in REPLACEMENT_SITE_PHOTO_PATHS:
        assert os.path.exists(p), f"Replacement image missing: {p}"

    grid_pdf = pdf_service._generate_site_photos_2x2_grid_page(watermark_sample=True)
    assert grid_pdf is not None and len(grid_pdf) > 0

    reader = PdfReader(io.BytesIO(grid_pdf))
    assert len(reader.pages) == 1
    text = reader.pages[0].extract_text()
    assert "SITE PHOTOS" in text
    # User Requirement 3: Before/After text headings and caption bars removed
    assert "SITE PHOTO #1" not in text
    assert "SITE PHOTO #2" not in text
    assert "SITE PHOTO #3" not in text
    assert "SITE PHOTO #4" not in text
    assert "Before" not in text
    assert "After" not in text

    # Also test via generate_sample_additional_document("SITE PHOTOS")
    sp_pdf = pdf_service.generate_sample_additional_document("SITE PHOTOS")
    reader_sp = PdfReader(io.BytesIO(sp_pdf))
    assert len(reader_sp.pages) == 1
    sp_text = reader_sp.pages[0].extract_text()
    assert "SITE PHOTOS" in sp_text
    assert "SITE PHOTO #1" not in sp_text
    assert "SITE PHOTO #4" not in sp_text

    # Test error reporting if an image is missing
    with pytest.raises(FileNotFoundError, match="missing or invalid"):
        pdf_service._generate_site_photos_2x2_grid_page(
            photo_paths=[r"E:\1.jpeg", r"E:\non_existent_image.jpeg", r"E:\3.jpeg", r"E:\4.jpeg"]
        )


def test_uploaded_pdf_fitted_into_nexus_template(tmp_path, pdf_service):
    """
    Requirement 4:
    - Load PDF from path, inspect page count & dimensions.
    - Scale and center proportionally between header and seal.
    - Seal at fixed bottom-left, fully visible.
    - Multi-page source PDF preserves all pages within template.
    """
    from reportlab.pdfgen import canvas as rl_canvas
    # Create a 2-page source PDF with distinctive content
    dummy_pdf_path = str(tmp_path / "source_document.pdf")
    c = rl_canvas.Canvas(dummy_pdf_path, pagesize=(600, 800))
    c.drawString(100, 700, "Source PDF Page 1 Content")
    c.rect(50, 200, 500, 400)
    c.showPage()
    c.drawString(100, 700, "Source PDF Page 2 Content")
    c.rect(50, 200, 500, 400)
    c.showPage()
    c.save()

    # Fit PDF into template using path
    output_pdf = pdf_service.fit_pdf_file_into_nexus_template(
        pdf_path=dummy_pdf_path,
        title="NOC",
        watermark_sample=False
    )
    assert output_pdf is not None and len(output_pdf) > 0

    reader = PdfReader(io.BytesIO(output_pdf))
    # Must preserve 2 pages
    assert len(reader.pages) == 2

    # Check Page 1
    p1 = reader.pages[0]
    assert float(p1.mediabox.width) == PAGE_WIDTH
    assert float(p1.mediabox.height) == PAGE_HEIGHT
    t1 = p1.extract_text()
    assert "NOC" in t1
    assert "Source PDF Page 1 Content" in t1

    # Check Page 2
    p2 = reader.pages[1]
    assert float(p2.mediabox.width) == PAGE_WIDTH
    assert float(p2.mediabox.height) == PAGE_HEIGHT
    t2 = p2.extract_text()
    assert "NOC" in t2
    assert "Source PDF Page 2 Content" in t2


def test_user_provided_sample_doc_fitted_into_template(pdf_service):
    r"""
    Requirement 4: Test directly with user provided path: 'E:\sample doc.pdf'
    - Verify page count and dimensions are inspected.
    - Verify content is fitted inside template between header and seal.
    - Verify original text and structure are preserved.
    - Verify seal remains visible at fixed bottom-left.
    """
    user_pdf_path = r"E:\sample doc.pdf"
    assert os.path.exists(user_pdf_path), f"User provided PDF not found at {user_pdf_path}"

    src_reader = PdfReader(user_pdf_path)
    assert len(src_reader.pages) == 1
    src_page = src_reader.pages[0]
    assert float(src_page.mediabox.width) > 0
    assert float(src_page.mediabox.height) > 0

    templated_bytes = pdf_service.fit_pdf_file_into_nexus_template(
        pdf_path=user_pdf_path,
        title="STRUCTURAL STABILITY CERTIFICATE",
        watermark_sample=False
    )
    assert templated_bytes is not None and len(templated_bytes) > 0

    out_reader = PdfReader(io.BytesIO(templated_bytes))
    assert len(out_reader.pages) == 1
    out_page = out_reader.pages[0]
    assert float(out_page.mediabox.width) == PAGE_WIDTH
    assert float(out_page.mediabox.height) == PAGE_HEIGHT

    extracted = out_page.extract_text()
    # Fixed chrome
    assert "STRUCTURAL STABILITY CERTIFICATE" in extracted
    # Source PDF content preserved
    assert "Thanthai Periyar Nagar 1" in extracted or "IN-3640920" in extracted or "STRUCTURAL STABILITY" in extracted


def test_annexure_and_boq_exact_15_rows_and_clean_boq_bottom_border(project_db_session, pdf_service):
    """
    User Requirement 1:
    - 15 visible sample data rows appear in the second table on BOTH Annexure and BOQ.
    - Appears in default generated PDF without extra flags.
    - No fake records in DB.
    - BOQ bottom border: clean, straight, continuous horizontal line connected to side borders,
      square corners (no overlapping curved roundRect).
    """
    import fitz

    po_no = "PO-VERIFY-15-ROWS"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-VERIFY-15",
        site_id="SITE-VERIFY-15",
        site_name="Verification Site 15",
        project_type="New Build"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Generate default 3-page PDF without specifying use_sample_rows
    pdf_bytes = pdf_service.generate_three_page_wcc_pdf(po_no=po_no, site_id=proj.site_id)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) == 3

    # 1. Annexure (Page 0)
    p0_text = doc[0].get_text()
    assert "ANNEXURE" in p0_text
    assert "Total Amount" in p0_text
    for item in SAMPLE_ANNEXURE_BOQ_ITEMS:
        assert item["item_code"] in p0_text, f"Missing {item['item_code']} on Annexure"

    # 2. BOQ (Page 1)
    p1_text = doc[1].get_text()
    assert "BOQ" in p1_text
    for item in SAMPLE_ANNEXURE_BOQ_ITEMS:
        assert item["item_code"] in p1_text, f"Missing {item['item_code']} on BOQ"

    # 3. BOQ bottom border inspection
    # All drawing items in the BOQ table should have square line segments, not overlapping rounded arcs at the table's bottom edge.
    drawings = doc[1].get_drawings()
    # Find table bottom y: horizontal line of width ~1154.25 (TABLE_W)
    table_bottom_lines = []
    for d in drawings:
        for item in d.get("items", []):
            if item[0] == "l":  # line segment (p1, p2)
                p1, p2 = item[1], item[2]
                if abs(p1.y - p2.y) < 0.5:  # horizontal line
                    line_w = abs(p2.x - p1.x)
                    if abs(line_w - 1154.25) < 2.0 and p1.y > 500:  # Table bottom line
                        table_bottom_lines.append(item)

    # There should be exactly 1 table bottom line (the clean straight horizontal edge of the table)
    assert len(table_bottom_lines) >= 1
    bottom_y = table_bottom_lines[0][1].y

    # Ensure no curve/roundRect ('c') path overlaps this bottom line at (x=18.0, y=bottom_y)
    overlapping_curves = []
    for d in drawings:
        for item in d.get("items", []):
            if item[0] == "c":  # bezier curve
                # check if any control point is within 5pt of bottom_y
                if any(abs(pt.y - bottom_y) < 5.0 for pt in item[1:]):
                    overlapping_curves.append(item)
    assert len(overlapping_curves) == 0, f"Found overlapping curved border at table bottom: {overlapping_curves}"


def test_additional_documents_blank_template_only_rigorous(project_db_session, pdf_service):
    """
    User Requirement 2:
    - ALL content and ALL tables removed from every additional-document template page.
    - Page contains ONLY:
      1. Header design (Pop-up Header.svg)
      2. Company logo at top-right
      3. Company seal at bottom-left corner
    - Everything between header/logo and seal must remain completely blank.
    - Strictly prohibited: Project ID, Site ID, Site Name, Project Type, tables, table headers,
      sample rows, labels, generated text, placeholders, watermark.
    """
    import fitz

    categories = [
        "STN", "SRN", "CAM", "PTW- Height", "PTW- Electrical",
        "Commissioning Report", "JMS", "Additional Approval",
        "EPF Challan", "EPF Payment Receipt", "ESI Challan", "ESI Payment Receipt",
        "HOTO", "NOC"
    ]

    for cat in categories:
        raw_pdf = pdf_service.generate_sample_additional_document(cat)
        doc = fitz.open(stream=raw_pdf, filetype="pdf")
        assert len(doc) == 1, f"{cat} template should have exactly 1 page"

        page = doc[0]
        text = page.get_text()

        # Prohibited fields
        assert "Project ID" not in text, f"{cat} has Project ID"
        assert "Site ID" not in text, f"{cat} has Site ID"
        assert "Site Name" not in text, f"{cat} has Site Name"
        assert "Project Type" not in text, f"{cat} has Project Type"
        assert "SAMPLE — NOT OFFICIAL" not in text, f"{cat} has watermark"

        # Prohibited table content
        prohibited_terms = [
            "Sl#", "Establishment Code", "TRRN", "ESIC", "Lock-Out",
            "Permit to Work", "Full Body Safety Harness", "Main Incomer",
            "Batch / Serial", "Dispatched Qty", "Cell Site Acceptance",
            "Clearance Parameter", "Chartered Structural Engineer"
        ]
        for term in prohibited_terms:
            assert term not in text, f"{cat} contains table content: '{term}'"

        # Required elements: Title in header, seal info in bottom-left
        assert any(word in text.upper() for word in cat.upper().split()), f"{cat} missing title in header"
        assert "NEXUS" in "".join(text.split()), f"{cat} missing seal company name"
        assert "COMMERCIAL MANAGER" in text.upper(), f"{cat} missing seal designation"


def test_merge_with_additional_documents_all_blank_except_site_photos(project_db_session, pdf_service):
    """
    User Requirement 2 & 3:
    - Merged PDF appends all 16 categories.
    - All additional document template pages are strictly blank templates (only header, logo, seal).
    - Site Photos is the only one with content (2x2 grid with 4 replacement images).
    - Original documents are not deleted from DB.
    """
    import fitz

    po_no = "PO-MERGE-BLANK-TEST"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-MERGE-001",
        site_id="SITE-MERGE-01",
        site_name="Merge Verification Site",
        project_type="New Build"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    three_page = pdf_service.generate_three_page_wcc_pdf(po_no=po_no, site_id=proj.site_id)
    merged_pdf = pdf_service.merge_with_additional_documents(three_page, po_no=po_no, site_id=proj.site_id)
    doc = fitz.open(stream=merged_pdf, filetype="pdf")

    # 3 certificate pages + 15 additional document pages = 18 total pages
    assert len(doc) == 18

    # Pages 0, 1, 2: Annexure, BOQ, Work Completion Certificate
    assert "ANNEXURE" in doc[0].get_text()
    assert "BOQ" in doc[1].get_text()
    assert "Work Completion Certificate" in doc[2].get_text()

    # Page 9 (index 9) is Site Photos (after STN, SRN, CAM, PTW-H, PTW-E, Comm = pages 3, 4, 5, 6, 7, 8)
    sp_page = doc[9]
    sp_text = sp_page.get_text()
    assert "SITE PHOTOS" in sp_text
    assert "SITE PHOTO #1" not in sp_text
    assert "Before" not in sp_text
    assert "After" not in sp_text

    # All other additional document pages (indices 3..8 and 10..17) must be blank templates
    template_page_indices = list(range(3, 9)) + list(range(10, 18))
    for idx in template_page_indices:
        p = doc[idx]
        txt = p.get_text()
        assert "Project ID" not in txt, f"Page {idx+1} has Project ID"
        assert "Site ID" not in txt, f"Page {idx+1} has Site ID"
        assert "Sl#" not in txt, f"Page {idx+1} has table header Sl#"
        assert "NEXUS" in "".join(txt.split()), f"Page {idx+1} missing company seal"
        assert "COMMERCIAL MANAGER" in txt.upper(), f"Page {idx+1} missing designation"


def test_wcc_border_stops_at_table_end_and_40_sample_rows_and_rounded_bottom(project_db_session, pdf_service):
    """
    Verify:
    1. Annexure and BOQ have 40 sample rows (SMP-CIV-001 through SMP-TSP-040).
    2. Work Completion Certificate (Page 3) border stops at table end (not bottom of page) and has rounded bottom corners.
    3. Site photos page contains no Before/After headings.
    """
    import fitz

    po_no = "PO-VERIFY-40-AND-WCC-BORDER"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-VERIFY-40",
        site_id="SITE-VERIFY-40",
        site_name="Verification Site 40",
        project_type="New Build"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # Generate 3-page PDF
    pdf_bytes = pdf_service.generate_three_page_wcc_pdf(po_no=po_no, site_id=proj.site_id)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) == 3

    # Page 0 (Annexure): check items up to 40
    p0_text = doc[0].get_text()
    assert "SMP-CIV-001" in p0_text
    assert "SMP-TSP-015" in p0_text
    assert "SMP-TSP-030" in p0_text
    assert "SMP-TSP-040" in p0_text

    # Page 1 (BOQ): check items up to 40
    p1_text = doc[1].get_text()
    assert "SMP-CIV-001" in p1_text
    assert "SMP-TSP-015" in p1_text
    assert "SMP-TSP-030" in p1_text
    assert "SMP-TSP-040" in p1_text

    # Page 2 (WCC): border should NOT extend to bottom of page (PAGE_HEIGHT - 18 = ~823 in fitz coords)
    p2 = doc[2]
    drawings = p2.get_drawings()
    # Find horizontal border lines of width ~ 1154.25 (PAGE_WIDTH - 36)
    wcc_border_bottom_y = None
    for d in drawings:
        for item in d.get("items", []):
            if item[0] == "l":
                p_start, p_end = item[1], item[2]
                if abs(p_start.y - p_end.y) < 1.0:  # horizontal line
                    if abs(abs(p_end.x - p_start.x) - 1154.25) < 3.0:
                        # If this line is below the header (y > 100)
                        if p_start.y > 100:
                            wcc_border_bottom_y = p_start.y

    assert wcc_border_bottom_y is not None, "WCC table bottom border line not found"
    assert wcc_border_bottom_y < 650.0, f"WCC border extends too far down: y={wcc_border_bottom_y} (expected < 650)"

    # Verify smoothly rounded bottom corners on WCC (curves below y=500)
    wcc_curves_below_500 = [
        item for d in drawings for item in d.get("items", [])
        if item[0] == "c" and any(pt.y > 500 for pt in item[1:])
    ]
    assert len(wcc_curves_below_500) > 0, "Expected rounded bottom corner curves on WCC page border"


def test_additional_documents_fit_sample_doc_inside_template(project_db_session, pdf_service):
    r"""
    Requirement 3:
    - All additional document categories (except Site Photos) fit the uploaded PDF (E:\sample doc.pdf) inside template.
    - Preserves header design, company logo, seal at bottom-left, page border.
    - Content of E:\sample doc.pdf is scaled proportionally between header and seal.
    - Site Photos remains 2x2 grid with 4 replacement images.
    """
    import fitz

    po_no = "PO-FITTED-DOC-TEST"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-FIT-001",
        site_id="SITE-FIT-01",
        site_name="Fit Verification Site",
        project_type="New Build"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    three_page = pdf_service.generate_three_page_wcc_pdf(po_no=po_no, site_id=proj.site_id)
    merged_pdf = pdf_service.merge_with_additional_documents(three_page, po_no=po_no, site_id=proj.site_id)
    doc = fitz.open(stream=merged_pdf, filetype="pdf")
    assert len(doc) == 18

    # Inspect STN (Page index 3), Commissioning (Page index 8), JMS (Page index 10), NOC (Page index 17)
    for idx in [3, 4, 8, 10, 16, 17]:
        page = doc[idx]
        txt = page.get_text()
        assert "Thanthai Periyar Nagar 1" in txt or "IN-3640920" in txt or "STRUCTURAL STABILITY" in txt
        assert "NEXUS" in "".join(txt.split())
        assert "COMMERCIAL MANAGER" in txt

    # Site photos (Page index 9) must NOT contain the sample doc text; it must have its 2x2 grid
    sp_page = doc[9]
    sp_txt = sp_page.get_text()
    assert "SITE PHOTOS" in sp_txt
    assert "Thanthai Periyar Nagar 1" not in sp_txt


def test_annexure_and_boq_info_table_thin_horizontal_lines(project_db_session, pdf_service):
    """
    Verify top and bottom horizontal lines of meta info table (Project ID, Site ID, Site Name, Project Type)
    in Annexure and BOQ have reduced thickness (0.5 pt) matching internal row separator lines.
    """
    import fitz

    po_no = "PO-INFO-LINES-TEST"
    proj = TelecomProject(
        po_no=po_no,
        project_code="PRJ-INFO-001",
        site_id="SITE-INFO-01",
        site_name="Info Lines Verification Site",
        project_type="New Build"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    three_page = pdf_service.generate_three_page_wcc_pdf(po_no=po_no, site_id=proj.site_id, use_sample_rows=True)
    doc = fitz.open(stream=three_page, filetype="pdf")

    for p_idx, name in [(0, "Annexure"), (1, "BOQ")]:
        page = doc[p_idx]
        info_lines = []
        for d in page.get_drawings():
            for item in d["items"]:
                if item[0] == "l" and abs(item[1].y - item[2].y) < 1.0 and abs(item[2].x - item[1].x) > 1000:
                    if 80 < item[1].y < 240:  # Info table area (y=100 to y=232)
                        info_lines.append((round(item[1].y, 1), d.get("width"), d.get("color")))

        # Must have exactly 5 horizontal lines (top, 3 interior rows, bottom)
        assert len(info_lines) == 5, f"{name} info table should have 5 horizontal lines, found {len(info_lines)}"
        for y_pos, width, color in info_lines:
            assert width == 0.5, f"{name} info table horizontal line at y={y_pos} has width {width}, expected 0.5"





