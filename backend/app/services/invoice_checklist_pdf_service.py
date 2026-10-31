"""
Invoice Checklist PDF Service
Generates the Invoice Checklist page to be appended to the Tax Invoice PDF.
Strictly adheres to visual and structural requirements:
- Exactly 28 numbered checklist records on a single page
- Section 1: Partner and Invoice Details with equivalent symmetrical columns (left half = right half = 577.125 pt)
  - Invoice Date row equal to Partner Name row (Row 0: Partner Name & Invoice Date)
  - Row 1: Invoice No & PO No; Row 2: WCC No; Row 3: Partner Billing SPOC - Name & Partner Billing SPOC - Email ID
  - Single-line SPOC labels
  - Bold only for left-side contents (labels) in both sections; values are regular font
- Section 2: Checklist table with header background #d1d5db, black font, vertical dividers in header only
  - Table headers, Mandatory Documents header, and PHD USE ONLY header at 10 pt font size (bold, black)
  - Serial no column content in regular font (no bold, 11 pt)
  - Content rows (Particulars description) at 11 pt font size
- Remarks section has space below, with page border closing neatly right beneath it
- Vector circular status indicators (green check ✓, red cross ✗)
- Curved page border matching WCC / Invoice border
- Top-left header badge using Pop-up Header.svg geometry with teal fill #00cba0
- Top-right company logo retrieval preserved
"""

import io
import os
import logging
from typing import Optional, Dict, Any, List, Tuple

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.graphics.shapes import Drawing, Circle, Line, PolyLine

from app.services.wcc_pdf_service import (
    PAGE_WIDTH,
    PAGE_HEIGHT,
    BORDER_INSET,
    BORDER_COLOR,
    BORDER_RADIUS,
    HEADER_H,
    HEADER_RADIUS,
    HEADER_SLANT_DX,
    TABLE_X,
    TABLE_W,
    _draw_company_logo,
)

logger = logging.getLogger(__name__)

# Color Palette
HEADER_TEAL = colors.HexColor("#00cba0")
GREY_HDR = colors.HexColor("#d1d5db")
DIVIDER_LINE = colors.HexColor("#e5e7eb")
TEXT_DARK = colors.HexColor("#111827")
TEXT_MUTED = colors.HexColor("#374151")
GREEN_INDICATOR = colors.HexColor("#16a34a")
RED_INDICATOR = colors.HexColor("#dc2626")

# Checklist Records (Part 1: Items 1 to 17)
CHECKLIST_ITEMS_PART_1 = [
    (1, "Original Invoice", True),
    (2, "Printed Invoice/Digital Invoice<br/>No Manual correction on Printed invoice. Manual Correction, if any, should be only PO / WCC/WCR No, which needs to be duly signed and stamped by auth. Person", True),
    (3, 'Invoice No. should not exceed 16 characters, containing alphabets or numerals or special characters hyphen or dash and slash symbolised as "-", "\\" and "/" respectively', True),
    (4, "In case of debit / credit note, Number and date of the corresponding original tax invoice", True),
    (5, "Name, Addresss & GSTIN of Partner & Indus on Invoice to be matched with PO", True),
    (6, "Ship TO & Bill TO need to mention on invoices", True),
    (7, "HSN/SAC code present on Invoice to be matched with PO/WCR", True),
    (8, "Description of Goods/ services", True),
    (9, "Quantity in case of goods and Unit/ Unique Quantity Code (UQC) of the same", True),
    (10, "Taxes applied (IGST/CGST+SGST) in invoices to be matched with GRN/WCR", True),
    (11, "Rate & Quantity should match with GRN/WCR", True),
    (12, "In case of Agreement based invoices, rates should match with valid contract summary/valid agreement.", False),
    (13, "Rates which are not part of PO/GBPA need to be verify through BOQ & for NON BOQ Rates circle SCM Head approval is required", True),
    (14, "Total value of supply of goods or services should match with GRN / WCR", True),
    (15, "Place of supply and name of State in case of Inter-State Supply", True),
    (16, "Stamp & Signature on printed invoice or digital signature on a digital invoice", True),
    (17, "PO No & WCC/WCR No to be mentioned on invoice. PO Date should be before Invoice Date", True),
]

# Checklist Records (Part 2: Items 18 to 28)
CHECKLIST_ITEMS_PART_2 = [
    (18, "E-Waybill /LR copy", False),
    (19, "Delivery Challans (in case multiple supply below 50K and consolidated bill above 50K is raised)", False),
    (20, "In case of Direct Tower Supply, PDI copy is required", False),
    (21, "Measurement sheet / Annexure sheet", True),
    (22, "PF/ESIC/Wages Register/Returns proof attached (in case labour charges are mentioned)", True),
    (23, "Receipt copy in cases of New connections / Load Up gradation / Transfer Installation", False),
    (24, "Original Receipt required in EB Reimbursement bills with security & other Expense bifurcation", False),
    (25, "Increase of HT EB Liaisoning Electricity Board approval letter required", False),
    (26, "STN (Stock Transfer note) / MRN / SRN", True),
    (27, "Photocopy of NOC from Gram panchayat in case of Municipal service charges", False),
    (28, "Photocopy Pollution control certificate copy in case of PUC Service", False),
]


def _create_indicator_drawing(is_valid: bool, size: float = 14.0) -> Drawing:
    """Creates a vector raw checkmark or cross in its respective color without circle background."""
    d = Drawing(size, size)

    if is_valid:
        # Raw green checkmark
        pl = PolyLine([
            0.15 * size, 0.45 * size,
            0.40 * size, 0.20 * size,
            0.85 * size, 0.80 * size
        ])
        pl.strokeColor = GREEN_INDICATOR
        pl.strokeWidth = 2.0
        pl.strokeLineCap = 1
        pl.strokeLineJoin = 1
        d.add(pl)
    else:
        # Raw red cross
        l1 = Line(0.20 * size, 0.20 * size, 0.80 * size, 0.80 * size)
        l1.strokeColor = RED_INDICATOR
        l1.strokeWidth = 2.0
        l1.strokeLineCap = 1
        l2 = Line(0.20 * size, 0.80 * size, 0.80 * size, 0.20 * size)
        l2.strokeColor = RED_INDICATOR
        l2.strokeWidth = 2.0
        l2.strokeLineCap = 1
        d.add(l1)
        d.add(l2)
    return d


def _draw_checklist_header_badge(canv: canvas.Canvas, title: str = "Invoice CheckList", width: float = 450.0):
    """
    Renders the vector geometry of Pop-up Header.svg anchored to the page border's top-left corner:
    - Rounded top-left corner matching page border curve
    - Slanted right edge
    - Teal background #00cba0
    - Bold white title
    """
    x0 = BORDER_INSET
    h = HEADER_H
    y_top = PAGE_HEIGHT - BORDER_INSET
    y_bottom = y_top - h
    r = HEADER_RADIUS
    badge_w = max(width, 400.0)
    title_size = 24.0
    while title_size > 14.0 and pdfmetrics.stringWidth(title, "Helvetica-Bold", title_size) > (badge_w - HEADER_SLANT_DX - 42.0):
        title_size -= 0.5

    canv.saveState()
    canv.setFillColor(HEADER_TEAL)
    p = canv.beginPath()
    p.moveTo(x0, y_bottom)
    p.lineTo(x0, y_top - r)
    k = 0.55228475
    p.curveTo(x0, y_top - r + r * k, x0 + r - r * k, y_top, x0 + r, y_top)
    p.lineTo(x0 + badge_w, y_top)
    p.lineTo(x0 + badge_w - HEADER_SLANT_DX, y_bottom)
    p.lineTo(x0, y_bottom)
    p.close()
    canv.drawPath(p, stroke=0, fill=1)

    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", title_size)
    text_x = x0 + 32.0
    text_y = y_bottom + (h - title_size) / 2.0 + 3.0
    canv.drawString(text_x, text_y, title)
    canv.restoreState()


def _draw_checklist_page_border(canv: canvas.Canvas, bottom_y: float = BORDER_INSET):
    """Draws a clean, slightly curved 0.75 pt border enclosing the content down to bottom_y."""
    canv.saveState()
    canv.setStrokeColor(BORDER_COLOR)
    canv.setLineWidth(0.75)
    y_top = PAGE_HEIGHT - BORDER_INSET
    canv.roundRect(
        BORDER_INSET, bottom_y,
        PAGE_WIDTH - 2 * BORDER_INSET, y_top - bottom_y,
        BORDER_RADIUS, stroke=1, fill=0
    )
    canv.restoreState()


class InvoiceChecklistPdfService:
    """Service to render the single-page Invoice Checklist matching the reference design."""

    def __init__(self):
        pass

    def _resolve_service_column_index(self, work_type: Optional[str] = None) -> int:
        """
        Resolves which column receives the checklist indicators:
        - 2: Supply
        - 3: TSP (Electrical / Civil & others)
        - 4: IME / OME / SMS / SME
        - 5: EB / Liaisoning
        - 6: Others Services (Legal / Rent etc.)
        Defaults to Column 3 (TSP) matching reference image.
        """
        if not work_type:
            return 3
        wt = work_type.strip().lower()
        if "supply" in wt and "service" not in wt:
            return 2
        if any(k in wt for k in ["ime", "ome", "sms", "sme"]):
            return 4
        if any(k in wt for k in ["eb", "liaison", "electricity"]):
            return 5
        if any(k in wt for k in ["rent", "legal", "other"]):
            return 6
        return 3

    def generate_checklist_pdf(
        self,
        invoice_no: str,
        invoice_date: str,
        po_no: str,
        wcc_no: str,
        partner_name: str,
        spoc_name: str = "Commercial Manager",
        spoc_email: str = "commercial@nexus.com",
        logo_bytes: Optional[bytes] = None,
        work_type: Optional[str] = None,
        status_overrides: Optional[Dict[int, bool]] = None
    ) -> bytes:
        """
        Renders the Invoice Checklist as a single PDF page (binary bytes).
        All 28 checklist items fit strictly on this single page.
        """
        buf = io.BytesIO()
        canv = canvas.Canvas(buf, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
        canv.setTitle(f"Invoice Checklist - {invoice_no}")

        # 1. Page chrome: top-left header badge (in #00cba0) and top-right company logo
        _draw_checklist_header_badge(canv, "Invoice CheckList", width=450.0)
        _draw_company_logo(canv, logo_bytes)

        # 2. Typography Styles:
        # - Left-side contents (labels) are BOLD: s_lbl
        # - Right-side contents (values) are REGULAR: s_val
        s_lbl = ParagraphStyle(
            'ChecklistLbl',
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16.0,
            textColor=TEXT_DARK
        )
        s_val = ParagraphStyle(
            'ChecklistVal',
            fontName="Helvetica",
            fontSize=12.5,
            leading=16.0,
            textColor=TEXT_DARK
        )

        # 3. Section 1: Partner and Invoice Details Table
        # Left half = 240.0 pt (label) + 337.125 pt (value) = 577.125 pt
        # Right half = 240.0 pt (label) + 337.125 pt (value) = 577.125 pt
        # Row 0: Partner Name | Invoice Date
        # Row 1: Invoice No | PO No
        # Row 2: WCC No | Partner Billing SPOC - Email ID (right side of WCC No, just below PO No)
        # Row 3: Partner Billing SPOC - Name
        details_data = [
            [
                Paragraph("Partner Name", s_lbl),
                Paragraph(partner_name or "Bharathi Electricals", s_val),
                Paragraph("Invoice Date", s_lbl),
                Paragraph(invoice_date or "18-10-2026", s_val)
            ],
            [
                Paragraph("Invoice No", s_lbl),
                Paragraph(invoice_no or "IN-1876/26-27", s_val),
                Paragraph("PO No", s_lbl),
                Paragraph(po_no or "23030614026", s_val)
            ],
            [
                Paragraph("WCC No", s_lbl),
                Paragraph(wcc_no or "2318564999", s_val),
                Paragraph("Partner Billing SPOC - Email ID", s_lbl),
                Paragraph(spoc_email or "commercial@nexus.com", s_val)
            ],
            [
                Paragraph("Partner Billing SPOC - Name", s_lbl),
                Paragraph(spoc_name or "Commercial Manager", s_val),
                "",
                ""
            ]
        ]
        col_w_details = [240.0, 337.125, 240.0, 337.125]
        t_details = Table(details_data, colWidths=col_w_details)
        t_details.setStyle(TableStyle([
            ('SPAN', (1, 3), (3, 3)),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        _, h_details = t_details.wrap(TABLE_W, 350)
        y_details = PAGE_HEIGHT - BORDER_INSET - HEADER_H - 16.0 - h_details
        t_details.drawOn(canv, TABLE_X, y_details)

        # 4. Section 2: Invoice Checklist Table
        # - Table header, Mandatory Documents, and PHD USE ONLY headers: 10 pt font size (bold, black)
        # - Table content section: 11 pt font size (regular, not bold)
        # - Subcolumns of Services kept as a single line, column widths expanded accordingly
        col_widths = [40.0, 464.25, 65.0, 168.0, 125.0, 102.0, 190.0]

        s_th = ParagraphStyle(
            'ChecklistTH',
            fontName="Helvetica-Bold",
            fontSize=10.0,
            leading=13.0,
            alignment=1,
            textColor=colors.black
        )
        s_banner = ParagraphStyle(
            'ChecklistBanner',
            fontName="Helvetica-Bold",
            fontSize=10.0,
            leading=13.0,
            alignment=1,
            textColor=colors.black
        )
        s_phd_banner = ParagraphStyle(
            'ChecklistPhdBanner',
            fontName="Helvetica-Bold",
            fontSize=10.0,
            leading=13.0,
            alignment=1,
            textColor=colors.black
        )

        s_td_no = ParagraphStyle(
            'ChecklistTDNo',
            fontName="Helvetica",
            fontSize=11.0,
            leading=14.0,
            alignment=1,
            textColor=TEXT_DARK
        )
        s_td_desc = ParagraphStyle(
            'ChecklistTDDesc',
            fontName="Helvetica",
            fontSize=11.0,
            leading=14.0,
            textColor=TEXT_DARK
        )
        s_phd_text = ParagraphStyle(
            'ChecklistPhdText',
            fontName="Helvetica-Bold",
            fontSize=11.0,
            leading=14.0,
            textColor=TEXT_DARK
        )

        tbl_rows = []
        # Header Rows (10 pt bold black font on #d1d5db lightgrey background)
        tbl_rows.append([
            Paragraph("S.No", s_th),
            Paragraph("Particulars", s_th),
            Paragraph("Supply", s_th),
            Paragraph("Services", s_th),
            "", "", ""
        ])
        tbl_rows.append([
            "", "", "",
            Paragraph("TSP (Electrical / Civil & others)", s_th),
            Paragraph("IME / OME / SMS / SME", s_th),
            Paragraph("EB / Liaisoning", s_th),
            Paragraph("Others Services (Legal / Rent etc.)", s_th)
        ])

        tstyle = [
            # Header column and row spans
            ('SPAN', (0, 0), (0, 1)),
            ('SPAN', (1, 0), (1, 1)),
            ('SPAN', (2, 0), (2, 1)),
            ('SPAN', (3, 0), (6, 0)),
            # Table Header styling: #d1d5db background, black text, vertical dividers
            ('BACKGROUND', (0, 0), (-1, 1), GREY_HDR),
            ('ALIGN', (0, 0), (-1, 1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 1), 'MIDDLE'),
            ('INNERGRID', (0, 0), (-1, 1), 0.75, colors.white),
            ('BOX', (0, 0), (-1, 1), 0.75, GREY_HDR),
            ('TOPPADDING', (0, 0), (-1, 1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, 1), 5),
        ]

        target_col = self._resolve_service_column_index(work_type)
        status_map = status_overrides or {}
        curr_row_idx = 2

        # Part 1 Items (1 to 17) - 11 pt content, S.No is regular (not bold)
        for sno, desc, def_status in CHECKLIST_ITEMS_PART_1:
            status = status_map.get(sno, def_status)
            indicator = _create_indicator_drawing(status, size=14.0)

            row_cells = [
                Paragraph(str(sno), s_td_no),
                Paragraph(desc, s_td_desc),
                "", "", "", "", ""
            ]
            row_cells[target_col] = indicator
            tbl_rows.append(row_cells)

            tstyle.append(('ALIGN', (0, curr_row_idx), (0, curr_row_idx), 'CENTER'))
            tstyle.append(('ALIGN', (2, curr_row_idx), (-1, curr_row_idx), 'CENTER'))
            tstyle.append(('VALIGN', (0, curr_row_idx), (-1, curr_row_idx), 'MIDDLE'))
            tstyle.append(('LINEBELOW', (0, curr_row_idx), (-1, curr_row_idx), 0.5, DIVIDER_LINE))
            tstyle.append(('TOPPADDING', (0, curr_row_idx), (-1, curr_row_idx), 3.5))
            tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (-1, curr_row_idx), 3.5))
            curr_row_idx += 1

        # Section Divider: Mandatory Documents (lightgrey #d1d5db, black 10 pt font, centered)
        tbl_rows.append([
            Paragraph("Mandatory Documents", s_banner),
            "", "", "", "", "", ""
        ])
        tstyle.append(('SPAN', (0, curr_row_idx), (6, curr_row_idx)))
        tstyle.append(('BACKGROUND', (0, curr_row_idx), (6, curr_row_idx), GREY_HDR))
        tstyle.append(('ALIGN', (0, curr_row_idx), (6, curr_row_idx), 'CENTER'))
        tstyle.append(('VALIGN', (0, curr_row_idx), (6, curr_row_idx), 'MIDDLE'))
        tstyle.append(('TOPPADDING', (0, curr_row_idx), (6, curr_row_idx), 4.0))
        tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (6, curr_row_idx), 4.0))
        curr_row_idx += 1

        # Part 2 Items (18 to 28) - 11 pt content, S.No is regular (not bold)
        for sno, desc, def_status in CHECKLIST_ITEMS_PART_2:
            status = status_map.get(sno, def_status)
            indicator = _create_indicator_drawing(status, size=14.0)

            row_cells = [
                Paragraph(str(sno), s_td_no),
                Paragraph(desc, s_td_desc),
                "", "", "", "", ""
            ]
            row_cells[target_col] = indicator
            tbl_rows.append(row_cells)

            tstyle.append(('ALIGN', (0, curr_row_idx), (0, curr_row_idx), 'CENTER'))
            tstyle.append(('ALIGN', (2, curr_row_idx), (-1, curr_row_idx), 'CENTER'))
            tstyle.append(('VALIGN', (0, curr_row_idx), (-1, curr_row_idx), 'MIDDLE'))
            tstyle.append(('LINEBELOW', (0, curr_row_idx), (-1, curr_row_idx), 0.5, DIVIDER_LINE))
            tstyle.append(('TOPPADDING', (0, curr_row_idx), (-1, curr_row_idx), 3.5))
            tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (-1, curr_row_idx), 3.5))
            curr_row_idx += 1

        # PHD USE ONLY Section (lightgrey #d1d5db, black 10 pt font, centered)
        tbl_rows.append([
            Paragraph("PHD USE ONLY", s_phd_banner),
            "", "", "", "", "", ""
        ])
        tstyle.append(('SPAN', (0, curr_row_idx), (6, curr_row_idx)))
        tstyle.append(('BACKGROUND', (0, curr_row_idx), (6, curr_row_idx), GREY_HDR))
        tstyle.append(('ALIGN', (0, curr_row_idx), (6, curr_row_idx), 'CENTER'))
        tstyle.append(('VALIGN', (0, curr_row_idx), (6, curr_row_idx), 'MIDDLE'))
        tstyle.append(('TOPPADDING', (0, curr_row_idx), (6, curr_row_idx), 4.0))
        tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (6, curr_row_idx), 4.0))
        curr_row_idx += 1

        tbl_rows.append([
            Paragraph("PHD Inward No. (Mandatory)", s_phd_text),
            "", "", "", "", "", ""
        ])
        tstyle.append(('SPAN', (0, curr_row_idx), (6, curr_row_idx)))
        tstyle.append(('VALIGN', (0, curr_row_idx), (6, curr_row_idx), 'MIDDLE'))
        tstyle.append(('TOPPADDING', (0, curr_row_idx), (6, curr_row_idx), 5.0))
        tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (6, curr_row_idx), 5.0))
        curr_row_idx += 1

        # Remarks row with space left below for writing remarks
        tbl_rows.append([
            Paragraph("Remarks", s_phd_text),
            "", "", "", "", "", ""
        ])
        tstyle.append(('SPAN', (0, curr_row_idx), (6, curr_row_idx)))
        tstyle.append(('VALIGN', (0, curr_row_idx), (6, curr_row_idx), 'TOP'))
        tstyle.append(('TOPPADDING', (0, curr_row_idx), (6, curr_row_idx), 5.0))
        tstyle.append(('BOTTOMPADDING', (0, curr_row_idx), (6, curr_row_idx), 40.0))
        curr_row_idx += 1

        t_check = Table(tbl_rows, colWidths=col_widths)
        t_check.setStyle(TableStyle(tstyle))
        _, h_check = t_check.wrap(TABLE_W, 1500)
        y_check = y_details - 14.0 - h_check
        t_check.drawOn(canv, TABLE_X, y_check)

        # Close the page border right below the remarks section
        border_bottom_y = y_check - 15.0
        _draw_checklist_page_border(canv, bottom_y=border_bottom_y)

        canv.showPage()
        canv.save()
        return buf.getvalue()
