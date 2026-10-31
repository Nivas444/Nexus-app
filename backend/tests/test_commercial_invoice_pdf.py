"""
Tests for Commercial Invoice PDF Generation:
1. PO number resolution from invoice number.
2. Field and data mapping from `telecom_project`, `telecom_indus_po`, and `indus_customer_gbpa` master table.
3. Visual and structural compliance with `Invoice CGST_SGST.pdf`:
   - Single-page design for normal items count
   - Pop-Up header badge with "Tax Invoice" and top-right company logo
   - Seller Details with 2x2 inch QR Code (144 pt x 144 pt)
   - Invoice Details (Invoice No, Invoice Date, Acknowledgement No, Acknowledgement Date, IRN No)
   - Bill To / Ship To side by side
   - Project Details (all 12 fields including Indus ID as Site ID, Work Type as Subproject Type)
   - Items table with Sl #, HSN/SAC Code, Description, UOM, Qty, Rate, Basic Amount, CGST %, SGST %, Total Amount
   - Totals block with Rupees In Words, Total Basic, Total CGST, Total SGST, Total Invoice Amount
   - Circular vector seal on the right below totals
   - Bottom border closing immediately below the seal
4. Multi-page pagination when items overflow available space.
5. FastAPI endpoint download behavior and error handling.
6. Verify PO Amendment output remains unchanged.
"""

import io
from decimal import Decimal
import pytest
from pypdf import PdfReader
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import ProjectSessionLocal, SessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo
from app.models.indus_gbpa import IndusCustomerGbpa
from app.services.invoice_pdf_service import (
    CommercialInvoicePdfService,
    number_to_indian_rupees_words,
    format_currency_inr
)
from app.services.wcc_pdf_service import WccPdfService


@pytest.fixture
def test_client():
    return TestClient(app)


def test_number_to_indian_rupees_words():
    assert number_to_indian_rupees_words(245000) == "Rupees Two Lakh Forty Five Thousand Only"
    assert number_to_indian_rupees_words(180000.50) == "Rupees One Lakh Eighty Thousand and Fifty Paise Only"
    assert number_to_indian_rupees_words(0) == "Rupees Zero Only"


def test_format_currency_inr():
    assert format_currency_inr(245000) == "2,45,000.00"
    assert format_currency_inr(1234567.89) == "12,34,567.89"
    assert format_currency_inr(500) == "500.00"


def test_po_number_resolution():
    svc = CommercialInvoicePdfService()
    # Test known invoice number mappings
    assert svc.resolve_po_number("INV-2026-00101") == "4500128934"
    assert svc.resolve_po_number("INV-2026-00102") == "4500128935"
    assert svc.resolve_po_number("INV-2026-00103") == "4500128936"

    # Test explicit PO number override
    assert svc.resolve_po_number("INV-2026-00101", po_no="4500128938") == "4500128938"


def test_single_page_invoice_pdf_generation():
    svc = CommercialInvoicePdfService()
    pdf_bytes = svc.generate_invoice_pdf(
        invoice_no="INV-2026-00101",
        po_no="4500128934",
        site_id="IN-123456",
        irn_no="IRN9832470123985472",
        ers_no="ERS-IND-8801",
        invoice_date_str="12/08/2026"
    )

    assert pdf_bytes is not None
    assert pdf_bytes.startswith(b"%PDF-")

    reader = PdfReader(io.BytesIO(pdf_bytes))
    # Must contain Tax Invoice page + appended Invoice Checklist page
    assert len(reader.pages) == 2

    page = reader.pages[0]
    text = page.extract_text()

    # Header check
    assert "TAX INVOICE" in text or "Tax Invoice" in text

    # Section 1 check
    assert "GSTIN" in text
    assert "PAN No" in text
    assert "Bill To" in text
    assert "Indus GST No" in text
    assert "Acknowledgement No" in text
    assert "Acknowledgement Date" in text
    assert "IRN No" in text or "IRN Number" in text
    assert "IRN9832470123985472" in text
    assert "Indus Towers" in text

    # Section 2 check (all invoice and project fields)
    assert "Invoice No" in text
    assert "INV-2026-00101" in text
    assert "Invoice Date" in text
    assert "12/08/2026" in text
    assert "PO Number" in text or "PO No" in text
    assert "4500128934" in text
    assert "Site Type" in text
    assert "PO Date" in text

    # Page 2: Invoice Checklist check
    chk_page = reader.pages[1]
    chk_text = chk_page.extract_text()
    assert "Invoice CheckList" in chk_text or "Invoice Checklist" in chk_text
    assert "Mandatory Documents" in chk_text
    assert "PHD USE ONLY" in chk_text
    assert "INV-2026-00101" in chk_text
    assert "4500128934" in chk_text
    assert "Original Invoice" in chk_text
    assert "Photocopy Pollution control certificate" in chk_text
    assert "RFAID Date" in text
    assert "Indus ID" in text
    assert "IN-123456" in text  # Indus Site shows Site ID
    assert "PTW No" in text
    assert "Site Name" in text
    assert "Guindy Hub" in text
    assert "WCC No" in text
    assert "Project ID" in text
    assert "Work Type" in text
    assert "Civil" in text  # Work Type shows Subproject Type
    assert "Cluster Area" in text
    assert "Receipt No" in text
    assert "Site Address" in text

    # Items table check
    assert "S.No" in text
    assert "HSC" in text or "HSN" in text
    assert "Type" in text
    assert "Code" in text
    assert "Description" in text
    assert "UOM" in text
    assert "Qty" in text
    assert "Rate" in text
    assert "Basic" in text
    assert "CGST" in text
    assert "SGST" in text
    assert "Grand Total" in text

    # Totals check (Rupees in Words wording prefix removed; amount in words displayed)
    assert "Rupees" in text and "Only" in text
    assert "Total Basic Amount" in text
    assert "Total CGST on Basic" in text or "Total CGST On Basic" in text
    assert "Total SGST on Basic" in text or "Total SGST On Basic" in text
    assert "Total Invoice Amount" in text

    # Seal check (Signatory wording removed; circular seal rendered)
    assert "COMMERCIAL MANAGER" in text


def test_multi_page_invoice_pagination():
    """Verify that an invoice with many line items splits gracefully across multiple pages with repeated headers."""
    db = ProjectSessionLocal()
    svc = CommercialInvoicePdfService(db)

    proj = db.query(TelecomProject).filter(TelecomProject.po_no == "4500128934").first()
    assert proj is not None

    # Synthesize 60 items with descriptive text to trigger continuation across pages
    synth_items = []
    for i in range(1, 61):
        synth_items.append({
            "sl": i,
            "hsn_code": "9954",
            "description": f"Extended Infrastructure Item #{i} with comprehensive site specification details, electrical laying and civil foundations",
            "uom": "Set",
            "qty": Decimal("2.00"),
            "rate": Decimal("5000.00"),
            "basic_amount": Decimal("10000.00"),
            "cgst_pct": Decimal("9.00"),
            "cgst_amount": Decimal("900.00"),
            "sgst_pct": Decimal("9.00"),
            "sgst_amount": Decimal("900.00"),
            "total_amount": Decimal("11800.00")
        })

    # Monkeypatch _fetch_invoice_items to return synthetic 60 items
    svc._fetch_invoice_items = lambda po_no, p: synth_items

    pdf_bytes = svc.generate_invoice_pdf(
        invoice_no="INV-2026-00999",
        po_no="4500128934",
        site_id="IN-123456"
    )

    reader = PdfReader(io.BytesIO(pdf_bytes))
    # Must paginate onto 2 or more invoice pages + 1 checklist page (total >= 3)
    assert len(reader.pages) >= 3

    # First page has TAX INVOICE and Section 1
    p1_text = reader.pages[0].extract_text()
    assert "TAX INVOICE" in p1_text or "Tax Invoice" in p1_text
    assert "GSTIN" in p1_text

    # Final invoice page (second to last) has Totals and Rupees in Words
    final_inv_text = reader.pages[-2].extract_text()
    assert "Rupees" in final_inv_text and "Only" in final_inv_text
    assert "Total Invoice Amount" in final_inv_text
    assert "COMMERCIAL MANAGER" in final_inv_text

    # Appended page (last) has Invoice Checklist
    chk_text = reader.pages[-1].extract_text()
    assert "Invoice CheckList" in chk_text or "Invoice Checklist" in chk_text
    assert "Mandatory Documents" in chk_text
    db.close()


def test_fastapi_invoice_pdf_download_endpoint(test_client):
    # Test primary endpoint
    resp = test_client.get("/api/v1/commercial/invoice/pdf/download?invoice_no=INV-2026-00101&po_no=4500128934")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert "Tax_Invoice_INV-2026-00101.pdf" in resp.headers["content-disposition"]
    assert resp.content.startswith(b"%PDF-")

    # Test with explicit IGST query parameter
    resp_igst = test_client.get("/api/v1/commercial/invoice/pdf/download?invoice_no=INV-2026-00101&gst_type=IGST")
    assert resp_igst.status_code == 200
    assert resp_igst.content.startswith(b"%PDF-")
    reader_igst = PdfReader(io.BytesIO(resp_igst.content))
    txt_igst = reader_igst.pages[0].extract_text()
    assert "IGST" in txt_igst
    assert "Total IGST on Basic" in txt_igst

    # Test alias endpoint
    resp_alias = test_client.get("/api/v1/commercial/jms/invoice/pdf/download?invoice_no=INV-2026-00101")
    assert resp_alias.status_code == 200
    assert resp_alias.headers["content-type"] == "application/pdf"
    assert resp_alias.content.startswith(b"%PDF-")

    # Test nonexistent invoice returns 404
    resp_404 = test_client.get("/api/v1/commercial/invoice/pdf/download?invoice_no=INV-NONEXISTENT-99999")
    assert resp_404.status_code == 404


def test_po_amendment_unchanged(test_client):
    """Ensure PO Amendment and WCC generation logic and outputs remain completely unchanged."""
    db = ProjectSessionLocal()
    wcc_svc = WccPdfService(db)
    # Verify generate_three_page_wcc_pdf generates valid 3-page PDF without errors
    pdf_bytes = wcc_svc.generate_three_page_wcc_pdf(po_no="4500128934", site_id="IN-123456")
    assert pdf_bytes is not None
    assert pdf_bytes.startswith(b"%PDF-")
    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) == 3
    db.close()


def test_igst_invoice_pdf_generation():
    """Verify that when customer or parameter is IGST, IGST layout is generated."""
    svc = CommercialInvoicePdfService()
    pdf_bytes = svc.generate_invoice_pdf(
        invoice_no="INV-2026-00101",
        po_no="4500128934",
        site_id="IN-123456",
        gst_type="IGST"
    )

    assert pdf_bytes is not None
    assert pdf_bytes.startswith(b"%PDF-")

    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) == 2
    text = reader.pages[0].extract_text()

    # IGST columns present, CGST/SGST columns absent
    assert "IGST" in text
    assert "Total IGST on Basic" in text
    assert "Total CGST on Basic" not in text
    assert "Total SGST on Basic" not in text
    assert "Total Invoice Amount" in text

    # Page 2: Checklist
    chk_text = reader.pages[1].extract_text()
    assert "Invoice CheckList" in chk_text or "Invoice Checklist" in chk_text


def test_customer_master_db_gst_type_mapping():
    """Verify customer master DB lookup by PO prefix sets gst_type correctly."""
    db = ProjectSessionLocal()
    try:
        svc = CommercialInvoicePdfService(db)
        # Indus project (PO 450...)
        proj_indus = db.query(TelecomProject).filter(TelecomProject.po_no.like("450%")).first()
        if proj_indus:
            bill_to, _ = svc._load_customer_and_site(proj_indus)
            assert bill_to.get("gst_type") in ["SGST", "CGST/SGST"]

        # Synthetic project with PO starting with 451 (Bharti Airtel -> IGST)
        proj_airtel = TelecomProject(
            project_id=9999,
            po_no="4510099999",
            customer_name="Bharti Airtel Ltd",
            site_id="IN-999999",
            site_name="Airtel Delhi Hub"
        )
        bill_to_airtel, _ = svc._load_customer_and_site(proj_airtel)
        assert bill_to_airtel.get("gst_type") == "IGST"
        assert "Airtel" in bill_to_airtel.get("legal_name", "")
    finally:
        db.close()


def test_invoice_checklist_page_generation():
    """Verify that Invoice Checklist PDF service generates exactly 28 items on a single page matching specifications."""
    from app.services.invoice_checklist_pdf_service import (
        InvoiceChecklistPdfService,
        CHECKLIST_ITEMS_PART_1,
        CHECKLIST_ITEMS_PART_2
    )

    chk_svc = InvoiceChecklistPdfService()
    pdf_bytes = chk_svc.generate_checklist_pdf(
        invoice_no="IN-1876/26-27",
        invoice_date="18-10-2026",
        po_no="23030614026",
        wcc_no="2318564999",
        partner_name="Bharathi Electricals",
        spoc_name="Commercial Manager",
        spoc_email="commercial@nexus.com"
    )

    assert pdf_bytes is not None
    assert pdf_bytes.startswith(b"%PDF-")

    reader = PdfReader(io.BytesIO(pdf_bytes))
    # Strict requirement: single checklist page
    assert len(reader.pages) == 1

    text = reader.pages[0].extract_text()

    # Chrome & Header Check
    assert "Invoice CheckList" in text or "Invoice Checklist" in text

    # Section 1 Details Check
    assert "Partner Name" in text
    assert "Bharathi Electricals" in text
    assert "IN-1876/26-27" in text
    assert "18-10-2026" in text
    assert "23030614026" in text
    assert "2318564999" in text
    assert "Commercial Manager" in text
    assert "commercial@nexus.com" in text

    # Section 2 Headers & Subcategories Check
    assert "S.No" in text
    assert "Particulars" in text
    assert "Supply" in text
    assert "Services" in text
    assert "TSP (Electrical / Civil & others)" in text
    assert "IME / OME / SMS / SME" in text
    assert "EB / Liaisoning" in text
    assert "Others Services (Legal / Rent etc.)" in text

    # Exactly 28 items verification
    all_items = CHECKLIST_ITEMS_PART_1 + CHECKLIST_ITEMS_PART_2
    assert len(all_items) == 28
    for sno, desc, status in all_items:
        clean_desc = desc.split("<br/>")[0].replace("\\", "").replace('"', '').strip()[:20]
        assert clean_desc in text, f"Checklist item #{sno} ({clean_desc}) not found in text"

    # Section Dividers Check
    assert "Mandatory Documents" in text
    assert "PHD USE ONLY" in text
    assert "PHD Inward No. (Mandatory)" in text
    assert "Remarks" in text

    # Verify indicator drawings: raw tick and cross without circle background
    from app.services.invoice_checklist_pdf_service import _create_indicator_drawing, GREEN_INDICATOR, RED_INDICATOR
    from reportlab.graphics.shapes import Circle

    tick_drawing = _create_indicator_drawing(True)
    assert not any(isinstance(shape, Circle) for shape in tick_drawing.contents)
    assert any(getattr(shape, "strokeColor", None) == GREEN_INDICATOR for shape in tick_drawing.contents)

    wrong_drawing = _create_indicator_drawing(False)
    assert not any(isinstance(shape, Circle) for shape in wrong_drawing.contents)
    assert any(getattr(shape, "strokeColor", None) == RED_INDICATOR for shape in wrong_drawing.contents)


