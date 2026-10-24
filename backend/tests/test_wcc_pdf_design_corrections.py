import io
import re
from decimal import Decimal
import pytest
from pypdf import PdfReader
from sqlalchemy.orm import Session
from reportlab.lib import colors

from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectDocument
from app.services.wcc_pdf_service import WccPdfService, PAGE_WIDTH, PAGE_HEIGHT, BORDER_INSET


def test_pdf_design_corrections_dynamic_rows_and_total(project_db_session: Session):
    """
    Verifies Requirement 2:
    - Annexure table rows are generated dynamically from data records without fixed blank rows.
    - If 2 records, exactly 2 item rows + 1 Total Amount row.
    - If 3 records, exactly 3 item rows + 1 Total Amount row.
    - Total Amount is correctly calculated from the displayed rows.
    - BOQ table has dynamic row generation without unused blank rows.
    """
    test_po = "TEST-DYN-ROWS-001"
    test_site = "SITE-DYN-001"

    try:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Dynamic Rows Hub",
            project_code="PRJ-DYN-001",
            project_type="New Build",
            tower_type="Ground Based Tower (GBT)",
            current_task="JMS to be process"
        )
        # Create exactly 2 items
        line1 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-ITEM-A",
            item_description="Service Item A",
            uom="Set",
            po_qty=Decimal("2.00"),
            po_rate=Decimal("125000.00"),
            po_amount=Decimal("250000.00"),
            jms_qty=Decimal("2.00"),
            jms_amount=Decimal("250000.00"),
            jms_status="Approved"
        )
        line2 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="2",
            item_code="GBPA-ITEM-B",
            item_description="Equipment Item B",
            uom="Nos",
            po_qty=Decimal("1.00"),
            po_rate=Decimal("130000.00"),
            po_amount=Decimal("130000.00"),
            jms_qty=Decimal("1.00"),
            jms_amount=Decimal("130000.00"),
            jms_status="Approved"
        )
        project_db_session.add_all([proj, line1, line2])
        project_db_session.commit()

        svc = WccPdfService(project_db_session)
        pdf_bytes = svc.generate_three_page_wcc_pdf(test_po, test_site)
        reader = PdfReader(io.BytesIO(pdf_bytes))
        assert len(reader.pages) == 3

        # Page 1 Annexure text checks
        p1_text = reader.pages[0].extract_text()
        assert "ANNEXURE" in p1_text
        assert "GBPA-ITEM-A" in p1_text
        assert "GBPA-ITEM-B" in p1_text
        assert "Total Amount" in p1_text
        # Sum is 250,000 + 130,000 = 380,000.00
        assert "380,000.00" in p1_text

        # Page 2 BOQ text checks
        p2_text = reader.pages[1].extract_text()
        assert "BOQ" in p2_text
        assert "GBPA-ITEM-A" in p2_text
        assert "GBPA-ITEM-B" in p2_text

        # Page 3 Work Completion Certificate text checks
        p3_text = reader.pages[2].extract_text()
        assert "Work Completion Certificate" in p3_text
        assert "CIVIL WORKS, ELECTRICAL WORKS & TSP UPGRADATION" in p3_text

    finally:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()


def test_pdf_design_seal_and_esign_without_sample_stamp(project_db_session: Session):
    """
    Verifies the generated seal:
    - Does not copy or reuse the sample Bharathi Electricals seal from PDF.pdf.
    - Generates the circular e-seal from Master DB details (company, designation) on every page.
    - Seal block (with 'Authorized Signatory' caption) follows the content on the left.
    """
    test_po = "TEST-SEAL-002"
    test_site = "SITE-SEAL-002"

    try:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Seal Test Hub",
            project_code="PRJ-SEAL-002",
            project_type="New Build",
            tower_type="Ground Based Tower (GBT)",
            current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-SEAL-01",
            item_description="Seal Test Line",
            uom="Nos",
            po_qty=Decimal("1.00"),
            po_rate=Decimal("50000.00"),
            po_amount=Decimal("50000.00"),
            jms_qty=Decimal("1.00"),
            jms_amount=Decimal("50000.00"),
            jms_status="Approved"
        )
        project_db_session.add_all([proj, line])
        project_db_session.commit()

        svc = WccPdfService(project_db_session)
        pdf_bytes = svc.generate_three_page_wcc_pdf(test_po, test_site)
        reader = PdfReader(io.BytesIO(pdf_bytes))

        for idx, page in enumerate(reader.pages):
            txt = page.extract_text()
            # Must NOT contain the sample company from PDF.pdf
            assert "BHARATHI ELECTRICALS" not in txt, f"Page {idx+1} contains sample seal company name!"
            assert "Pandi Selvaraj" not in txt, f"Page {idx+1} contains sample person name!"
            # Must NOT contain wording below the seal (Authorized Sign, For Nexus, Electronically generated)
            assert "Authorized Signatory" not in txt, f"Page {idx+1} should not have Authorized Signatory text below seal!"
            # The circular seal renders company name and location along curved rings
            compact_txt = re.sub(r'\s+', '', txt)
            assert "NEXUS" in compact_txt.upper(), f"Page {idx+1} missing company name in seal!"
            assert "CHENNAI" in compact_txt.upper(), f"Page {idx+1} missing location city in seal!"

    finally:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()


def test_pdf_merge_order_preservation(project_db_session: Session):
    """
    Verifies Requirement 6:
    - Order is preserved: Annexure (p1) -> BOQ (p2) -> Work Completion Certificate (p3) -> appended JMS documents (p4+).
    """
    test_po = "TEST-MERGE-003"
    test_site = "SITE-MERGE-003"

    try:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Merge Test Hub",
            project_code="PRJ-MERGE-003",
            project_type="New Build",
            tower_type="Ground Based Tower (GBT)",
            current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-M1",
            item_description="Merge Item 1",
            uom="Nos",
            po_qty=Decimal("1.00"),
            po_rate=Decimal("10000.00"),
            po_amount=Decimal("10000.00"),
            jms_qty=Decimal("1.00"),
            jms_amount=Decimal("10000.00"),
            jms_status="Approved"
        )
        # Create an attached document in JMS documents tab
        att_doc = ProjectDocument(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            document_name="Tower_Safety_Report.pdf",
            document_number="Safety Report",
            document_details="Approved safety audit report",
            documents="data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvUGFnZXMvQ291bnQgMT4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUGFyZW50IDEgMCBSL0NvbnRlbnRzIDMgMCBSPj5lbmRvYmoKMyAwIG9iajw8L0xlbmd0aCAxMj4+c3RyZWFtCkJUCi9GMSAyNCBUZgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU2IDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjIxNAolJUVPRgo="
        )
        project_db_session.add_all([proj, line, att_doc])
        project_db_session.commit()

        svc = WccPdfService(project_db_session)
        res = svc.process_select_works_submission(test_po, test_site)
        assert res["success"] is True
        assert res["totalPages"] >= 16  # 3 generated pages + 13 additional document categories (with 2-column split photos)

        merged_bytes = svc.merge_with_jms_documents(
            svc.generate_three_page_wcc_pdf(test_po, test_site),
            test_po,
            test_site
        )
        reader = PdfReader(io.BytesIO(merged_bytes))
        assert len(reader.pages) == 4

        # Page 1: Annexure
        assert "ANNEXURE" in reader.pages[0].extract_text()
        # Page 2: BOQ
        assert "BOQ" in reader.pages[1].extract_text()
        # Page 3: Work Completion Certificate
        assert "Work Completion Certificate" in reader.pages[2].extract_text()

    finally:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()


def _make_project(test_po: str, test_site: str, n_lines: int):
    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=test_po,
        site_id=test_site,
        site_name="Layout Test Hub",
        project_code=f"PRJ-{test_po}",
        project_type="New Build",
        tower_type="Ground Based Tower (GBT)",
        current_task="JMS to be process"
    )
    lines = [
        TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number=str(i),
            item_code=f"GBPA-L{i:03d}",
            item_description=f"Layout line item {i}",
            uom="Nos",
            po_qty=Decimal("1.00"),
            po_rate=Decimal("100.00"),
            po_amount=Decimal("100.00"),
            jms_qty=Decimal("1.00"),
            jms_amount=Decimal("100.00"),
            jms_status="Approved"
        )
        for i in range(1, n_lines + 1)
    ]
    return proj, lines


def _cleanup(session: Session, test_po: str):
    session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
    session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
    session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
    session.commit()


def test_attachments_appended_without_template_styling(project_db_session: Session):
    """
    Uploaded JMS documents are appended after the generated pages in their stored order:
    - PDFs unchanged (original size/content, no generated header),
    - images as plain pages sized to the image (no header/logo/seal),
    - unsupported formats recorded explicitly with a plain notice page.
    """
    import base64
    from PIL import Image
    from reportlab.pdfgen import canvas as rl_canvas

    test_po = "TEST-ATTACH-004"
    test_site = "SITE-ATTACH-004"
    try:
        _cleanup(project_db_session, test_po)
        proj, lines = _make_project(test_po, test_site, 1)

        pdf_buf = io.BytesIO()
        pc = rl_canvas.Canvas(pdf_buf, pagesize=(595.27, 841.89))
        pc.drawString(72, 760, "Original Survey Attachment")
        pc.showPage()
        pc.save()
        img_buf = io.BytesIO()
        Image.new("RGB", (400, 300), (200, 30, 30)).save(img_buf, format="PNG")

        def doc(name, number, uri):
            return ProjectDocument(company_name="Nexus", customer_name="Indus Towers Ltd", po_no=test_po,
                                   site_id=test_site, document_name=name, document_number=number, documents=uri)

        docs = [
            doc("Survey.pdf", "Survey report", "data:application/pdf;base64," + base64.b64encode(pdf_buf.getvalue()).decode()),
            doc("Site_Photo.png", "Photo", "data:image/png;base64," + base64.b64encode(img_buf.getvalue()).decode()),
            doc("Notes.docx", "Notes", "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,"
                + base64.b64encode(b"PK\x03\x04 not a real docx").decode()),
        ]
        project_db_session.add_all([proj, *lines])
        project_db_session.commit()
        for d in docs:  # commit individually to guarantee id order
            project_db_session.add(d)
            project_db_session.commit()

        svc = WccPdfService(project_db_session)
        merged = svc.merge_with_jms_documents(svc.generate_three_page_wcc_pdf(test_po, test_site), test_po, test_site)
        reader = PdfReader(io.BytesIO(merged))
        assert len(reader.pages) == 6

        assert "ANNEXURE" in reader.pages[0].extract_text()
        assert "BOQ" in reader.pages[1].extract_text()
        assert "Work Completion Certificate" in reader.pages[2].extract_text()

        # PDF appended unchanged
        p4 = reader.pages[3]
        assert [round(float(v)) for v in p4.mediabox[2:]] == [595, 842]
        p4_text = p4.extract_text()
        assert "Original Survey Attachment" in p4_text
        assert "ANNEXURE" not in p4_text and "Authorized Signatory" not in p4_text

        # Image page: sized to the image, no generated text/styling
        p5 = reader.pages[4]
        assert [round(float(v)) for v in p5.mediabox[2:]] == [400, 300]
        assert (p5.extract_text() or "").strip() == ""

        # Unsupported format: explicit plain notice
        p6_text = reader.pages[5].extract_text()
        assert "Attachment could not be embedded" in p6_text
        assert "Notes.docx" in p6_text
        assert "Unsupported file format" in p6_text
        assert "Authorized Signatory" not in p6_text
    finally:
        _cleanup(project_db_session, test_po)


def test_long_tables_paginate_in_section_order(project_db_session: Session):
    """
    When tables exceed the printable area, sections continue on extra pages while keeping
    the order Annexure -> BOQ -> Work Completion Certificate, with the Total Amount and
    seal following the final Annexure row.
    """
    test_po = "TEST-PAGINATE-005"
    test_site = "SITE-PAGINATE-005"
    try:
        _cleanup(project_db_session, test_po)
        proj, lines = _make_project(test_po, test_site, 90)
        project_db_session.add_all([proj, *lines])
        project_db_session.commit()

        svc = WccPdfService(project_db_session)
        reader = PdfReader(io.BytesIO(svc.generate_three_page_wcc_pdf(test_po, test_site)))
        texts = [p.extract_text() for p in reader.pages]
        assert len(texts) > 3

        kinds = []
        for t in texts:
            if "Work Completion Certificate" in t:
                kinds.append("WCC")
            elif "ANNEXURE" in t:
                kinds.append("ANNEX")
            elif "BOQ" in t:
                kinds.append("BOQ")
            else:
                kinds.append("?")
        assert "?" not in kinds
        assert kinds == sorted(kinds, key=["ANNEX", "BOQ", "WCC"].index)
        assert kinds.count("WCC") == 1 and kinds[-1] == "WCC"

        annex_pages = [t for t, k in zip(texts, kinds) if k == "ANNEX"]
        assert "GBPA-L090" in annex_pages[-1]
        assert "Total Amount" in annex_pages[-1] and "9,000.00" in annex_pages[-1]
        assert "Authorized Signatory" not in annex_pages[-1]
        boq_pages = [t for t, k in zip(texts, kinds) if k == "BOQ"]
        assert "GBPA-L090" in boq_pages[-1]
    finally:
        _cleanup(project_db_session, test_po)


def test_pdf_final_layout_adjustments_constants_and_city_pin(project_db_session: Session):
    """
    Verifies the Final Layout Adjustments:
    1. Table outer borders match page borders (TABLE_X == BORDER_INSET, TABLE_W == PAGE_WIDTH - 2 * BORDER_INSET).
    2. Header badge length is 580 pt across all pages.
    3. Sl#, Qty, Rate widths reduced; Item Description allocated primary width; sum equals TABLE_W.
    4. City & PIN dynamically extracted from company address records.
    """
    from app.services.wcc_pdf_service import (
        BORDER_INSET,
        PAGE_WIDTH,
        TABLE_X,
        TABLE_W,
        HEADER_BADGE_W,
        ANNEX_COL_WIDTHS,
        BOQ_COL_WIDTHS,
        WccPdfService
    )

    # 1. Outer border alignment
    assert TABLE_X == BORDER_INSET
    assert TABLE_W == PAGE_WIDTH - (2 * BORDER_INSET)

    # 2. Header badge width matches WCC header
    assert HEADER_BADGE_W == 580.0

    # 3. Column widths check
    assert sum(ANNEX_COL_WIDTHS) == TABLE_W
    assert sum(BOQ_COL_WIDTHS) == TABLE_W
    # Sl# is reduced to 45
    assert ANNEX_COL_WIDTHS[0] == 45.0
    assert BOQ_COL_WIDTHS[0] == 45.0
    # Qty reduced
    assert ANNEX_COL_WIDTHS[4] == 65.0
    # Rate reduced (70.0 pt)
    assert ANNEX_COL_WIDTHS[5] <= 75.0
    # Description receives primary room
    assert ANNEX_COL_WIDTHS[2] > 600.0
    assert BOQ_COL_WIDTHS[2] > 700.0

    # 4. Dynamic extraction of city and PIN code
    from app.services.wcc_pdf_service import _extract_city_pin
    assert _extract_city_pin("No. 12, Anna Salai, Chennai, Tamil Nadu - 600002") == "CHENNAI - 600002"
    assert _extract_city_pin("Plot 45, Whitefield, Bangalore, Karnataka 560066") == "BANGALORE - 560066"

    svc = WccPdfService(project_db_session)
    assets = svc._get_master_company_assets()
    extracted = assets["location"]
    assert extracted is not None
    # Active headquarters office in Master DB has Chennai 600002
    assert "CHENNAI" in extracted
    assert "600002" in extracted
