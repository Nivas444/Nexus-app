import re
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any, List, Union

from sqlalchemy.orm import Session
from sqlalchemy import text, or_

from app.db.session import ProjectSessionLocal, AccountsSessionLocal, SessionLocal
from app.models.commercial_project import TelecomProject
from app.models.commercial_sales import Sales, ReceiptIndus
from app.schemas.commercial_project import (
    CommercialInvoiceItem,
    CommercialInvoiceListResponse,
    CommercialInvoiceSubmitDetailsRequest,
    CommercialInvoiceSubmitHashRequest,
    CommercialInvoiceGenericResponse,
    CommercialReceivableItem,
    CommercialReceivableListResponse
)
from app.services.invoice_pdf_service import (
    CommercialInvoicePdfService,
    number_to_indian_rupees_words,
    format_currency_inr
)


def parse_flexible_date(val: Optional[Union[str, date, datetime]]) -> Optional[date]:
    if not val:
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val

    s = str(val).strip()
    if not s:
        return None

    # Replace dashes/spaces
    s = s.replace(" - ", "/").replace("-", "/").replace(" ", "")
    for fmt in ("%d/%m/%Y", "%Y/%m/%d", "%Y/%m/%d", "%d/%m/%y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


class CommercialInvoiceService:
    def __init__(self, project_db: Optional[Session] = None, accounts_db: Optional[Session] = None):
        self._project_db = project_db
        self._accounts_db = accounts_db
        self._owns_project_db = False
        self._owns_accounts_db = False

    def get_project_db(self) -> Session:
        if self._project_db is None:
            self._project_db = ProjectSessionLocal()
            self._owns_project_db = True
        return self._project_db

    def get_accounts_db(self) -> Session:
        if self._accounts_db is None:
            self._accounts_db = AccountsSessionLocal()
            self._owns_accounts_db = True
        return self._accounts_db

    def close(self):
        if self._owns_project_db and self._project_db:
            self._project_db.close()
            self._project_db = None
        if self._owns_accounts_db and self._accounts_db:
            self._accounts_db.close()
            self._accounts_db = None

    def get_invoice_projects_list(self) -> CommercialInvoiceListResponse:
        """
        Retrieves real Invoice records from `telecom_project` in `Nexus_Project DB`
        and hydrates them with `sales` table data from `Nexus_Accounts DB`.
        Records that are already moved to Receivable (or persisted in receipt_indus)
        are excluded from the Invoice view.
        """
        pdb = self.get_project_db()
        adb = self.get_accounts_db()

        # 1. Fetch sales and receipt_indus records from Nexus_Accounts DB
        sales_records = adb.query(Sales).all()
        sales_by_voucher: Dict[str, Sales] = {}
        for s in sales_records:
            if s.voucher_number:
                sales_by_voucher[s.voucher_number.strip()] = s
            if s.document_no:
                sales_by_voucher[s.document_no.strip()] = s

        receipt_records = adb.query(ReceiptIndus).all()
        received_invoices = set()
        for r in receipt_records:
            if r.invoice_no:
                received_invoices.add(r.invoice_no.strip().lower())
            if r.voucher_number:
                received_invoices.add(r.voucher_number.strip().lower())

        # 2. Fetch projects from telecom_project
        projects = pdb.query(TelecomProject).order_by(TelecomProject.project_id.asc()).all()

        items: List[CommercialInvoiceItem] = []
        seen_keys = set()
        today = date.today()

        for idx, p in enumerate(projects):
            task_raw = (p.current_task or "").strip()
            t_low = task_raw.lower()

            # Exclude projects already moved to Receivable
            if t_low in ["moved to receivable", "receivable", "completed", "invoice approved"]:
                continue

            # Eligible for Invoice workflow:
            # - Task is explicitly in invoice categories
            # - Or receipt_no is present and WCC is approved/completed
            is_invoice_eligible = (
                t_low in ["to be submit", "invoice to be submit", "invoice to be raise", "approval pending", "rejected", "wcc approved"]
                or bool(p.receipt_no and t_low in ["to be submit", "wcc approved", "approval pending", "amendment approved", "amendment completed"])
                or (p.wcc_approved_date is not None)
            )

            # Skip records still in early workflows (JMS / PO Amend / active WCC submission)
            if not is_invoice_eligible and not p.receipt_no:
                continue

            po_no = p.po_no or f"PO-{p.project_id}"
            default_inv_no = f"INV-2026-{101 + idx:05d}"
            invoice_no = default_inv_no

            sales_row = sales_by_voucher.get(invoice_no) or sales_by_voucher.get(po_no)
            if sales_row and sales_row.voucher_number:
                invoice_no = sales_row.voucher_number

            # If this invoice or PO has already been moved to receipt_indus, exclude from invoice list
            if (
                invoice_no.strip().lower() in received_invoices
                or (sales_row and sales_row.document_no and sales_row.document_no.strip().lower() in received_invoices)
                or (po_no and po_no.strip().lower() in received_invoices)
            ):
                continue

            inv_key = f"{po_no}_{p.site_id or ''}_{invoice_no}"
            if inv_key in seen_keys:
                continue
            seen_keys.add(inv_key)

            # Determine task status
            if t_low in ["rejected", "invoice rejected"]:
                task_display = "Rejected"
            elif t_low in ["approval pending", "pending approval", "under review"]:
                task_display = "Approval Pending"
            else:
                task_display = "to be submit"

            # Determine date
            doc_date = None
            if sales_row and sales_row.document_date:
                doc_date = sales_row.document_date
            elif p.receipt_date:
                doc_date = p.receipt_date
            elif p.wcc_approved_date:
                doc_date = p.wcc_approved_date
            elif p.wcc_date:
                doc_date = p.wcc_date
            elif p.po_date:
                doc_date = p.po_date
            else:
                doc_date = today

            date_str = doc_date.strftime("%d/%m/%Y") if isinstance(doc_date, (date, datetime)) else "12/08/2026"

            # Amount
            raw_amt = 245000.0
            if sales_row and sales_row.total_amount is not None:
                raw_amt = float(sales_row.total_amount)
            elif p.wcc_amount is not None:
                raw_amt = float(p.wcc_amount)
            elif p.po_amount is not None:
                raw_amt = float(p.po_amount)

            amt_formatted = format_currency_inr(raw_amt)

            # Document Type
            doc_type = "CGST/SGST"
            if sales_row and sales_row.document_type:
                doc_type = sales_row.document_type
            elif p.tower_type and "igst" in p.tower_type.lower():
                doc_type = "IGST"

            # IRN and ERS No
            irn_no = (sales_row.irn_no if sales_row and sales_row.irn_no else None) or f"IRN98324701239854{72 + idx}"
            ers_no = p.ers_no or (sales_row.acknowledgement_no if sales_row else None) or f"ERS-IND-880{idx + 1}"

            has_pdf = bool(sales_row and sales_row.invoice_document is not None)

            items.append(CommercialInvoiceItem(
                id=f"prj-{p.project_id}",
                invoiceNo=invoice_no,
                date=date_str,
                poNo=po_no,
                projectId=p.project_code or f"PRJ-{p.project_id}",
                siteId=p.site_id or "",
                siteName=p.site_name or "",
                projectType=p.project_type or "New Build",
                subProjectType=p.sub_project_type or "Civil",
                task=task_display,
                ersNo=ers_no,
                irnNo=irn_no,
                documentType=doc_type,
                amount=amt_formatted,
                rawAmount=raw_amt,
                dueDate=p.completion_date.strftime("%d/%m/%Y") if p.completion_date else "27/08/2026",
                customerName=p.customer_name or (sales_row.customer_name if sales_row else "Indus Towers Limited"),
                companyName=sales_row.company_name if sales_row else "Nexus Power Limited",
                pdfStored=has_pdf
            ))

        # 3. Also include standalone sales records from sales table if not in telecom_project and not in receipt_indus
        for s in sales_records:
            v_no = s.voucher_number or s.document_no
            if not v_no or any(it.invoiceNo == v_no for it in items):
                continue
            if v_no.strip().lower() in received_invoices:
                continue
            if s.document_no and s.document_no.strip().lower() in received_invoices:
                continue

            doc_date_str = s.document_date.strftime("%d/%m/%Y") if s.document_date else "12/08/2026"
            raw_amt = float(s.total_amount) if s.total_amount is not None else 245000.0

            items.append(CommercialInvoiceItem(
                id=f"sales-{s.sales_id}",
                invoiceNo=v_no,
                date=doc_date_str,
                poNo=s.document_no or v_no,
                projectId=f"PRJ-SALES-{s.sales_id}",
                siteId="",
                siteName="",
                projectType="New Build",
                subProjectType="Civil",
                task="Approval Pending",
                ersNo=s.acknowledgement_no or "",
                irnNo=s.irn_no or "",
                documentType=s.document_type or "CGST/SGST",
                amount=format_currency_inr(raw_amt),
                rawAmount=raw_amt,
                dueDate=doc_date_str,
                customerName=s.customer_name or "Indus Towers Limited",
                companyName=s.company_name or "Nexus Power Limited",
                pdfStored=bool(s.invoice_document is not None)
            ))

        return CommercialInvoiceListResponse(items=items, total=len(items))

    def get_receivable_projects_list(self) -> CommercialReceivableListResponse:
        """
        Retrieves real Receivable records from `nexus_accounts` DB (`sales` and `receipt_indus` tables).
        - Deduction column content comes from `sales` table (tds_deduction).
        - Deduction subtab data (TDS, DN, Discount, TReDS Fee) comes from `receipt_indus` table.
        - Invoice amount details (Basic, CGST, SGST, IGST, Total) come from `sales` table.
        - Received amount comes from `receipt_indus` table.
        """
        adb = self.get_accounts_db()
        pdb = self.get_project_db()

        receipt_records = adb.query(ReceiptIndus).order_by(ReceiptIndus.receipt_id.desc()).all()
        sales_records = adb.query(Sales).all()
        sales_map: Dict[str, Sales] = {}
        for s in sales_records:
            if s.voucher_number:
                sales_map[s.voucher_number.strip()] = s
            if s.document_no:
                sales_map[s.document_no.strip()] = s

        projects = pdb.query(TelecomProject).all()
        po_map = {p.po_no.strip(): p for p in projects if p.po_no}

        items: List[CommercialReceivableItem] = []
        seen_invs = set()

        for idx, r in enumerate(receipt_records):
            inv_no = r.invoice_no or r.voucher_number or f"INV-REC-{r.receipt_id}"
            seen_invs.add(inv_no.strip().lower())
            sales_row = sales_map.get(inv_no)
            po_no = (sales_row.document_no if sales_row and sales_row.document_no else None) or ""
            proj = po_map.get(po_no) if po_no else None

            # 1. Invoice Amount Details (from sales table)
            if sales_row and sales_row.total_amount is not None:
                inv_amt = float(sales_row.total_amount)
            elif r.invoice_amount is not None:
                inv_amt = float(r.invoice_amount)
            else:
                inv_amt = 245000.0

            if sales_row and sales_row.basic_amount is not None:
                basic_amt = float(sales_row.basic_amount)
            else:
                basic_amt = round(inv_amt / 1.18, 2)

            if sales_row and sales_row.cgst is not None:
                cgst_amt = float(sales_row.cgst)
            else:
                cgst_amt = round((inv_amt - (inv_amt / 1.18)) / 2, 2)

            if sales_row and sales_row.sgst is not None:
                sgst_amt = float(sales_row.sgst)
            else:
                sgst_amt = round((inv_amt - (inv_amt / 1.18)) / 2, 2)

            if sales_row and sales_row.igst is not None:
                igst_amt = float(sales_row.igst)
            else:
                igst_amt = 0.0

            # 2. Deduction Column Content (from sales table)
            if sales_row and sales_row.tds_deduction is not None:
                deduction_amt = float(sales_row.tds_deduction)
            elif r.tds is not None:
                deduction_amt = float(r.tds)
            else:
                deduction_amt = 5000.0

            # 3. Deduction Subtab Details (from receipt_indus table)
            tds_sub = float(r.tds) if r.tds is not None else deduction_amt
            dn_sub = float(r.dn_amount) if r.dn_amount is not None else 0.0
            discount_sub = float(r.treds_discount_amount) if r.treds_discount_amount is not None else 0.0
            treds_fee_sub = float(r.treds_processing_fee) if r.treds_processing_fee is not None else 0.0

            # 4. Received Amount (from receipt_indus table)
            received_amt = float(r.received_amount) if r.received_amount is not None else 0.0
            received_date_str = (
                r.received_date.strftime("%d/%m/%Y") if r.received_date
                else (r.indus_payment_receipt_date.strftime("%d/%m/%Y") if r.indus_payment_receipt_date
                else (sales_row.document_date.strftime("%d/%m/%Y") if sales_row and sales_row.document_date
                else "12/08/2026"))
            )

            # Dates
            inv_date_str = "12/08/2026"
            if sales_row and sales_row.document_date:
                inv_date_str = sales_row.document_date.strftime("%d/%m/%Y")
            elif proj and proj.receipt_date:
                inv_date_str = proj.receipt_date.strftime("%d/%m/%Y")

            due_date_str = "27/08/2026"
            if proj and proj.completion_date:
                due_date_str = proj.completion_date.strftime("%d/%m/%Y")

            recv_amt = max(0.0, inv_amt - deduction_amt - received_amt)

            items.append(CommercialReceivableItem(
                id=f"rec-{r.receipt_id}",
                poNo=po_no,
                customerName=r.customer_name or (proj.customer_name if proj else "Indus Towers Limited"),
                invoiceNo=inv_no,
                invoiceDate=inv_date_str,
                dueDate=due_date_str,
                invoiceAmount=format_currency_inr(inv_amt),
                rawInvoiceAmount=inv_amt,
                deduction=format_currency_inr(deduction_amt),
                rawDeduction=deduction_amt,
                receivedAmount=format_currency_inr(received_amt),
                rawReceivedAmount=received_amt,
                receivable=format_currency_inr(recv_amt),
                rawReceivable=recv_amt,
                ageing=f"{r.ageing or 0} Days",
                # Subtab fields:
                basicAmount=format_currency_inr(basic_amt),
                rawBasicAmount=basic_amt,
                cgst=format_currency_inr(cgst_amt),
                rawCgst=cgst_amt,
                sgst=format_currency_inr(sgst_amt),
                rawSgst=sgst_amt,
                igst=format_currency_inr(igst_amt),
                rawIgst=igst_amt,
                tds=format_currency_inr(tds_sub),
                rawTds=tds_sub,
                dnAmount=format_currency_inr(dn_sub),
                rawDnAmount=dn_sub,
                discount=format_currency_inr(discount_sub),
                rawDiscount=discount_sub,
                tredsFee=format_currency_inr(treds_fee_sub),
                rawTredsFee=treds_fee_sub,
                receivedDate=received_date_str
            ))

        return CommercialReceivableListResponse(items=items, total=len(items))

    def update_receivable_invoice_amount(
        self,
        invoice_no: str,
        basic_amount: Optional[float] = None,
        cgst: Optional[float] = None,
        sgst: Optional[float] = None,
        igst: Optional[float] = None,
        total_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates invoice amount details in table `sales` in `Nexus_Accounts DB`.
        """
        adb = self.get_accounts_db()
        sales_row = adb.query(Sales).filter(or_(Sales.voucher_number == invoice_no, Sales.document_no == invoice_no)).first()
        if sales_row:
            if basic_amount is not None:
                sales_row.basic_amount = Decimal(str(basic_amount))
            if cgst is not None:
                sales_row.cgst = Decimal(str(cgst))
            if sgst is not None:
                sales_row.sgst = Decimal(str(sgst))
            if igst is not None:
                sales_row.igst = Decimal(str(igst))
            if total_amount is not None:
                sales_row.total_amount = Decimal(str(total_amount))
            adb.commit()

        # Also update receipt_indus invoice_amount if present
        rec = adb.query(ReceiptIndus).filter(or_(ReceiptIndus.invoice_no == invoice_no, ReceiptIndus.voucher_number == invoice_no)).first()
        if rec and total_amount is not None:
            rec.invoice_amount = Decimal(str(total_amount))
            tds = float(rec.tds or 0.0)
            recv_amt = float(rec.received_amount or 0.0)
            rec.receivable = Decimal(str(max(0.0, float(total_amount) - tds - recv_amt)))
            adb.commit()

        return {"success": True, "message": "Invoice amount details updated in sales table."}

    def update_receivable_deduction(
        self,
        invoice_no: str,
        tds: Optional[float] = None,
        dn_amount: Optional[float] = None,
        discount: Optional[float] = None,
        treds_fee: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates deduction subtab details in table `receipt_indus` in `Nexus_Accounts DB`
        and updates overall `tds_deduction` in table `sales`.
        """
        adb = self.get_accounts_db()
        rec = adb.query(ReceiptIndus).filter(or_(ReceiptIndus.invoice_no == invoice_no, ReceiptIndus.voucher_number == invoice_no)).first()
        total_ded = 0.0
        if rec:
            if tds is not None:
                rec.tds = Decimal(str(tds))
            if dn_amount is not None:
                rec.dn_amount = Decimal(str(dn_amount))
            if discount is not None:
                rec.treds_discount_amount = Decimal(str(discount))
            if treds_fee is not None:
                rec.treds_processing_fee = Decimal(str(treds_fee))

            t = float(rec.tds or 0.0)
            d = float(rec.dn_amount or 0.0)
            disc = float(rec.treds_discount_amount or 0.0)
            fee = float(rec.treds_processing_fee or 0.0)
            total_ded = t + d + disc + fee

            inv = float(rec.invoice_amount or 0.0)
            received = float(rec.received_amount or 0.0)
            rec.receivable = Decimal(str(max(0.0, inv - total_ded - received)))
            adb.commit()

        # Update sales table tds_deduction
        sales_row = adb.query(Sales).filter(or_(Sales.voucher_number == invoice_no, Sales.document_no == invoice_no)).first()
        if sales_row:
            sales_row.tds_deduction = Decimal(str(total_ded))
            adb.commit()

        return {"success": True, "totalDeduction": total_ded, "message": "Deduction subtab details updated in receipt_indus and sales tables."}

    def update_receivable_received_amount(
        self,
        invoice_no: str,
        received_amount: float,
        received_date: Optional[Union[str, date]] = None
    ) -> Dict[str, Any]:
        """
        Updates received amount in table `receipt_indus` in `Nexus_Accounts DB`.
        """
        adb = self.get_accounts_db()
        rec = adb.query(ReceiptIndus).filter(or_(ReceiptIndus.invoice_no == invoice_no, ReceiptIndus.voucher_number == invoice_no)).first()
        recv_val = 0.0
        if rec:
            rec.received_amount = Decimal(str(received_amount))
            if received_date:
                parsed_d = parse_flexible_date(received_date)
                if parsed_d:
                    rec.received_date = parsed_d
            inv = float(rec.invoice_amount or 0.0)
            tds = float(rec.tds or 0.0)
            dn = float(rec.dn_amount or 0.0)
            disc = float(rec.treds_discount_amount or 0.0)
            fee = float(rec.treds_processing_fee or 0.0)
            total_ded = tds + dn + disc + fee
            rec.receivable = Decimal(str(max(0.0, inv - total_ded - received_amount)))
            recv_val = float(rec.receivable)
            adb.commit()

        return {"success": True, "receivable": recv_val, "message": "Received amount updated in receipt_indus table."}

    def save_or_update_sales_invoice(
        self,
        invoice_no: str,
        invoice_date: Optional[Union[str, date, datetime]] = None,
        irn_no: Optional[str] = None,
        document_type: Optional[str] = None,
        pdf_bytes: Optional[bytes] = None,
        po_no: Optional[str] = None,
        site_id: Optional[str] = None,
        customer_name: Optional[str] = None,
        company_name: Optional[str] = None,
        basic_amount: Optional[Union[float, Decimal]] = None,
        cgst: Optional[Union[float, Decimal]] = None,
        sgst: Optional[Union[float, Decimal]] = None,
        igst: Optional[Union[float, Decimal]] = None,
        total_amount: Optional[Union[float, Decimal]] = None,
        total_amount_in_words: Optional[str] = None,
        ers_no: Optional[str] = None,
        qr_code: Optional[str] = None
    ) -> Sales:
        """
        Stores or updates an invoice in PostgreSQL table `sales` in `Nexus_Accounts DB`.
        - voucher_number is invoice no
        - document_date is invoice date
        - irn_no is irn no
        - document_type is cgst/sgst or igst
        - invoice_document stores generated PDF bytes in BYTEA format
        """
        adb = self.get_accounts_db()
        parsed_date = parse_flexible_date(invoice_date) or date.today()

        norm_doc_type = (document_type or "CGST/SGST").strip().upper()
        if "IGST" in norm_doc_type:
            norm_doc_type = "IGST"
        else:
            norm_doc_type = "CGST/SGST"

        # Search existing sales record by voucher_number or document_no
        sales_record = adb.query(Sales).filter(
            or_(Sales.voucher_number == invoice_no, Sales.document_no == invoice_no)
        ).first()

        if not sales_record and po_no:
            sales_record = adb.query(Sales).filter(Sales.document_no == po_no).first()

        if sales_record:
            # Update existing record
            sales_record.voucher_number = invoice_no
            sales_record.document_date = parsed_date
            if irn_no:
                sales_record.irn_no = irn_no
            sales_record.document_type = norm_doc_type
            if pdf_bytes:
                sales_record.invoice_document = pdf_bytes
            if customer_name:
                sales_record.customer_name = customer_name
            if company_name:
                sales_record.company_name = company_name
            if basic_amount is not None:
                sales_record.basic_amount = Decimal(str(basic_amount))
            if cgst is not None:
                sales_record.cgst = Decimal(str(cgst))
            if sgst is not None:
                sales_record.sgst = Decimal(str(sgst))
            if igst is not None:
                sales_record.igst = Decimal(str(igst))
            if total_amount is not None:
                sales_record.total_amount = Decimal(str(total_amount))
            if total_amount_in_words:
                sales_record.total_amount_in_words = total_amount_in_words
            if ers_no:
                sales_record.acknowledgement_no = ers_no
            if qr_code:
                sales_record.qr_code = qr_code
        else:
            # Insert new record
            tot_amt = Decimal(str(total_amount)) if total_amount is not None else Decimal("245000.00")
            b_amt = Decimal(str(basic_amount)) if basic_amount is not None else Decimal("207627.12")
            c_amt = Decimal(str(cgst)) if cgst is not None else Decimal("18686.44")
            s_amt = Decimal(str(sgst)) if sgst is not None else Decimal("18686.44")
            i_amt = Decimal(str(igst)) if igst is not None else Decimal("0.00")
            words = total_amount_in_words or number_to_indian_rupees_words(float(tot_amt))

            sales_record = Sales(
                company_name=company_name or "Nexus Power Limited",
                customer_name=customer_name or "Indus Towers Limited",
                voucher_number=invoice_no,
                document_no=invoice_no,
                document_type=norm_doc_type,
                document_date=parsed_date,
                irn_no=irn_no or "IRN9832470123985472",
                acknowledgement_no=ers_no or "122610984523",
                acknowledgement_date=parsed_date,
                qr_code=qr_code,
                invoice_document=pdf_bytes,
                basic_amount=b_amt,
                cgst=c_amt,
                sgst=s_amt,
                igst=i_amt,
                total_amount=tot_amt,
                total_amount_in_words=words
            )
            adb.add(sales_record)

        adb.commit()
        adb.refresh(sales_record)

        # Synchronize with telecom_project if po_no available
        if po_no:
            pdb = self.get_project_db()
            proj = pdb.query(TelecomProject).filter(TelecomProject.po_no == po_no)
            if site_id:
                proj = proj.filter(TelecomProject.site_id == site_id)
            p = proj.first()
            if p and ers_no:
                p.ers_no = ers_no
                pdb.commit()

        return sales_record

    def submit_invoice_details(self, payload: CommercialInvoiceSubmitDetailsRequest) -> Dict[str, Any]:
        """
        Transitions invoice status to 'Approval Pending' and persists submission fields
        into `telecom_project` and `sales` in `Nexus_Accounts DB`.
        """
        pdb = self.get_project_db()
        p_q = pdb.query(TelecomProject).filter(TelecomProject.po_no == payload.poNo)
        if payload.siteId:
            p_q = p_q.filter(TelecomProject.site_id == payload.siteId)
        proj = p_q.first()

        invoice_no = payload.invoiceNo or f"INV-{payload.poNo}"
        inv_date = parse_flexible_date(payload.invoiceDate) or (proj.receipt_date if proj else None) or date.today()
        due_date = parse_flexible_date(payload.dueDate)

        if proj:
            proj.current_task = "Approval Pending"
            if payload.ersNo:
                proj.ers_no = payload.ersNo
            if due_date:
                proj.completion_date = due_date
            pdb.commit()

        # Update or record in sales table
        self.save_or_update_sales_invoice(
            invoice_no=invoice_no,
            invoice_date=inv_date,
            irn_no=payload.irnNo,
            document_type=payload.documentType or "CGST/SGST",
            po_no=payload.poNo,
            site_id=payload.siteId,
            ers_no=payload.ersNo,
            total_amount=payload.amount
        )

        return {
            "success": True,
            "message": "Invoice details submitted successfully. Status updated to Approval Pending.",
            "invoiceNo": invoice_no,
            "task": "Approval Pending"
        }

    def submit_invoice_hash_receipt(self, payload: CommercialInvoiceSubmitHashRequest) -> Dict[str, Any]:
        """
        Processes submission from the 'Invoice#' tab:
        Stores `invoice_amount`, `tds`, `receivable` in PostgreSQL table `receipt_indus` in `Nexus_Accounts DB`.
        Also updates `sales` with `tds_deduction` and `approved_amount`, and marks project as moved to Receivable.
        """
        adb = self.get_accounts_db()
        pdb = self.get_project_db()

        raw_inv = Decimal(str(payload.invoiceAmount))
        raw_tds = Decimal(str(payload.tds))
        raw_recv = Decimal(str(payload.receivable))

        # Check existing receipt in receipt_indus
        receipt = adb.query(ReceiptIndus).filter(
            or_(
                ReceiptIndus.invoice_no == payload.invoiceNo,
                ReceiptIndus.voucher_number == payload.invoiceNo
            )
        ).first()

        if receipt:
            receipt.invoice_no = payload.invoiceNo
            receipt.voucher_number = payload.invoiceNo
            receipt.invoice_amount = raw_inv
            receipt.tds = raw_tds
            receipt.receivable = raw_recv
            receipt.approved_amount = raw_recv
            if payload.customerName:
                receipt.customer_name = payload.customerName
            if payload.companyName:
                receipt.company_name = payload.companyName
        else:
            receipt = ReceiptIndus(
                company_name=payload.companyName or "Nexus Power Limited",
                customer_name=payload.customerName or "Indus Towers Limited",
                voucher_number=payload.invoiceNo,
                invoice_no=payload.invoiceNo,
                invoice_amount=raw_inv,
                tds=raw_tds,
                receivable=raw_recv,
                approved_amount=raw_recv,
                received_amount=Decimal("0.00"),
                ageing=0
            )
            adb.add(receipt)

        # Update sales table tds_deduction and approved_amount
        sales_record = adb.query(Sales).filter(
            or_(Sales.voucher_number == payload.invoiceNo, Sales.document_no == payload.invoiceNo)
        ).first()
        if sales_record:
            sales_record.tds_deduction = raw_tds
            sales_record.approved_amount = raw_recv

        adb.commit()
        adb.refresh(receipt)

        # Update telecom_project status if PO provided
        if payload.poNo:
            p_q = pdb.query(TelecomProject).filter(TelecomProject.po_no == payload.poNo)
            if payload.siteId:
                p_q = p_q.filter(TelecomProject.site_id == payload.siteId)
            proj = p_q.first()
            if proj:
                proj.current_task = "Moved to Receivable"
                pdb.commit()

        return {
            "success": True,
            "message": "Invoice amounts and deductions persisted to receipt_indus successfully.",
            "receiptId": receipt.receipt_id,
            "invoiceNo": payload.invoiceNo,
            "invoiceAmount": float(raw_inv),
            "tds": float(raw_tds),
            "receivable": float(raw_recv)
        }
