from typing import Optional, List, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status

from app.db.session import AccountsSessionLocal
from app.models.purchase import PurchaseRequest, Purchase
from app.models.account_payment import AccountPayment
from app.models.account_purchase import AccountPurchase
from app.models.admin_transport import AdminTransport
from app.models.vendor import VendorMaster
from app.schemas.purchase import (
    PurchaseRequestCreate,
    PurchaseRequestUpdate,
    SelectSuppliersRequest,
    PurchaseCreate,
    PurchaseUpdate,
    PurchaseTermsRequest,
    PurchaseTransportRequest,
    PurchaseUploadDocumentsRequest,
    TransportPaymentRequest,
    MinTransportSubmitRequest,
    AccountPurchaseCreate
)

class PurchaseService:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # PR METHODS
    # -------------------------------------------------------------------------
    def get_pr_list(self) -> List[PurchaseRequest]:
        items = self.db.query(PurchaseRequest).order_by(PurchaseRequest.id.asc()).all()
        if not items:
            self._seed_default_pr()
            items = self.db.query(PurchaseRequest).order_by(PurchaseRequest.id.asc()).all()
        return items

    def _seed_default_pr(self):
        default_items = [
            {
                "pr_no": "PR-2026-0001",
                "wh_name": "Warehouse - North",
                "submit_by": "Rajesh Kumar (Warehouse)",
                "request_date": date(2026, 10, 12),
                "material_head": "Tower Structure",
                "material_category": "Tower Infrastructure",
                "material_description": "40M Galvanized Tubular Telecom Tower Mast Structure",
                "uom": "Nos",
                "stock_qty": 25.00,
                "pr_qty": 10.00,
                "status": "PR to be submit"
            },
            {
                "pr_no": "PR-2026-0002",
                "wh_name": "Warehouse - North",
                "submit_by": "Vikram Singh (Site Engg)",
                "request_date": date(2026, 10, 12),
                "material_head": "Power Cable",
                "material_category": "Electrical & Cabling",
                "material_description": "3.5C x 50 Sq.mm Armoured Aluminium Power Cable",
                "uom": "Mtr",
                "stock_qty": 150.00,
                "pr_qty": 500.00,
                "status": "PR to be submit"
            },
            {
                "pr_no": "PR-2026-0003",
                "wh_name": "Warehouse - South",
                "submit_by": "Anand Sharma (Stores)",
                "request_date": date(2026, 10, 13),
                "material_head": "Optical Fiber",
                "material_category": "Optical Fiber",
                "material_description": "24F Single Mode Armoured Optical Fiber Cable",
                "uom": "Mtr",
                "stock_qty": 80.00,
                "pr_qty": 1200.00,
                "status": "PR to be submit"
            },
            {
                "pr_no": "PR-2026-0004",
                "wh_name": "Warehouse - South",
                "submit_by": "Pooja Patel (Site Team)",
                "request_date": date(2026, 10, 13),
                "material_head": "Earthing Rod",
                "material_category": "Earthing & Lightning Protection",
                "material_description": "Copper Bonded Chemical Earthing Electrode 3M",
                "uom": "Set",
                "stock_qty": 15.00,
                "pr_qty": 30.00,
                "status": "PR to be submit"
            },
            {
                "pr_no": "PR-2026-0005",
                "wh_name": "Warehouse - Central",
                "submit_by": "Deepak Verma (Site Tech)",
                "request_date": date(2026, 10, 14),
                "material_head": "Fasteners & Bolts",
                "material_category": "Tower Infrastructure",
                "material_description": "High Tensile Foundation Anchor Bolts M24 x 1000mm",
                "uom": "Nos",
                "stock_qty": 40.00,
                "pr_qty": 160.00,
                "status": "PR to be submit"
            }
        ]
        for it in default_items:
            pr = PurchaseRequest(**it)
            self.db.add(pr)
        self.db.commit()

    def create_pr(self, data: PurchaseRequestCreate) -> PurchaseRequest:
        pr = PurchaseRequest(**data.dict())
        self.db.add(pr)
        self.db.commit()
        self.db.refresh(pr)
        return pr

    def update_pr(self, pr_id: int, data: PurchaseRequestUpdate) -> PurchaseRequest:
        pr = self.db.query(PurchaseRequest).filter(PurchaseRequest.id == pr_id).first()
        if not pr:
            raise HTTPException(status_code=404, detail="PR item not found")
        for k, v in data.dict(exclude_unset=True).items():
            setattr(pr, k, v)
        self.db.commit()
        self.db.refresh(pr)
        return pr

    def select_suppliers(self, payload: SelectSuppliersRequest) -> List[PurchaseRequest]:
        query = self.db.query(PurchaseRequest)
        if payload.pr_ids:
            query = query.filter(PurchaseRequest.id.in_(payload.pr_ids))
        elif payload.pr_nos:
            query = query.filter(PurchaseRequest.pr_no.in_(payload.pr_nos))
        else:
            query = query.filter(PurchaseRequest.status == "PR to be submit")

        records = query.all()
        if not records:
            records = self.db.query(PurchaseRequest).all()

        v1 = payload.suppliers[0] if len(payload.suppliers) > 0 else None
        v2 = payload.suppliers[1] if len(payload.suppliers) > 1 else None
        v3 = payload.suppliers[2] if len(payload.suppliers) > 2 else None

        updated_records = []
        for pr in records:
            pr.supply_vendor_1 = v1
            pr.supply_vendor_2 = v2
            pr.supply_vendor_3 = v3
            pr.status = "RFQ to be submit"
            updated_records.append(pr)

            # Create/sync linked RFQ entries in purchase table with rfq_id = pr_no
            for idx, vendor in enumerate(payload.suppliers[:3]):
                if not vendor:
                    continue
                existing_purchase = self.db.query(Purchase).filter(
                    and_(
                        Purchase.pr_no == pr.pr_no,
                        Purchase.supply_vendor_name == vendor
                    )
                ).first()
                if not existing_purchase:
                    rfq_num = f"RFQ-{pr.pr_no.replace('PR-', '')}-{idx + 1}"
                    new_rfq = Purchase(
                        pr_no=pr.pr_no,
                        rfq_id=pr.pr_no,
                        rfq_no=rfq_num,
                        request_by=pr.submit_by,
                        request_date=pr.request_date or date.today(),
                        supply_vendor_name=vendor,
                        po_status="RFQ Pending",
                        po_amount=0.0
                    )
                    self.db.add(new_rfq)

        self.db.commit()
        return updated_records

    # -------------------------------------------------------------------------
    # RFQ METHODS
    # -------------------------------------------------------------------------
    def get_rfq_list(self) -> List[Purchase]:
        items = self.db.query(Purchase).filter(
            or_(
                Purchase.po_status.ilike("%RFQ%"),
                Purchase.po_status.is_(None)
            )
        ).order_by(Purchase.id.asc()).all()
        return items

    def save_rfq_terms(self, payload: PurchaseTermsRequest) -> Purchase:
        query = self.db.query(Purchase)
        if payload.rfq_id:
            query = query.filter(or_(Purchase.rfq_id == payload.rfq_id, Purchase.pr_no == payload.rfq_id))
        elif payload.pr_no:
            query = query.filter(Purchase.pr_no == payload.pr_no)
        else:
            raise HTTPException(status_code=400, detail="pr_no or rfq_id is required")

        record = query.first()
        if not record:
            record = Purchase(
                pr_no=payload.pr_no or payload.rfq_id or "PR-2026-0001",
                rfq_id=payload.rfq_id or payload.pr_no or "PR-2026-0001",
                transport_scope=payload.transport_scope,
                payment_terms=payload.payment_terms
            )
            self.db.add(record)
        else:
            record.transport_scope = payload.transport_scope
            record.payment_terms = payload.payment_terms

        self.db.commit()
        self.db.refresh(record)
        return record

    # -------------------------------------------------------------------------
    # PO METHODS
    # -------------------------------------------------------------------------
    def get_po_list(self) -> List[Purchase]:
        items = self.db.query(Purchase).filter(
            and_(
                Purchase.po_no.isnot(None),
                Purchase.po_no != ""
            )
        ).order_by(Purchase.id.asc()).all()
        return items

    def get_po_by_id(self, po_id: int) -> Purchase:
        po = self.db.query(Purchase).filter(Purchase.id == po_id).first()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        return po

    def find_or_create_po(self, po_id: Optional[int] = None, po_no: Optional[str] = None, pr_no: Optional[str] = None, vendor_name: Optional[str] = None) -> Purchase:
        po = None
        if po_id:
            try:
                numeric_id = int(po_id)
                po = self.db.query(Purchase).filter(Purchase.id == numeric_id).first()
            except (ValueError, TypeError):
                pass
        if not po and po_no:
            po = self.db.query(Purchase).filter(Purchase.po_no == po_no).first()
        if not po and pr_no:
            po = self.db.query(Purchase).filter(Purchase.pr_no == pr_no).first()

        if not po:
            # Fallback to first existing PO if available, or create
            gen_no = po_no or f"PO-2026-{(self.db.query(Purchase).count() + 1):04d}"
            po = Purchase(
                pr_no=pr_no or "PR-2026-0001",
                po_no=gen_no,
                po_date=date.today(),
                supply_vendor_name=vendor_name or "Polycab Wires & Cables",
                po_status="Dispatch Pending",
                pdf_status="Pending",
                po_amount=18250.0
            )
            self.db.add(po)
            self.db.commit()
            self.db.refresh(po)
        else:
            if po_no and not po.po_no:
                po.po_no = po_no
            if vendor_name and not po.supply_vendor_name:
                po.supply_vendor_name = vendor_name
            po.po_status = "Dispatch Pending"
            self.db.commit()
            self.db.refresh(po)

        return po

    def update_po_status(self, po_id: int, new_status: str) -> Purchase:
        po = self.get_po_by_id(po_id)
        po.po_status = new_status
        self.db.commit()
        self.db.refresh(po)
        return po

    def save_transport_details(self, po_id: int, data: PurchaseTransportRequest) -> Purchase:
        po = self.get_po_by_id(po_id)
        po.logistic_name = data.logistic_name
        po.transport_charges = data.transport_charges
        po.gst_applicable = data.gst_applicable
        po.gst_amount = data.gst_amount or 0.0
        po.total_amount = data.total_amount or (data.transport_charges + (data.gst_amount or 0.0))

        # Take GST details from Master DB according to supplier/vendor name
        vendor_name = data.supplier_name or po.supply_vendor_name
        if vendor_name:
            v_match = self.db.query(VendorMaster).filter(
                VendorMaster.vendor_name.ilike(f"%{vendor_name.strip()}%")
            ).first()
            if v_match:
                po.gst_number = v_match.gst_number if v_match.gst_number and v_match.gst_number != "NA" else "33AABCT2345D1Z2"
                po.gst_type = v_match.gst_type if v_match.gst_type and v_match.gst_type != "NA" else "SGST"
            else:
                po.gst_number = "33AABCT2345D1Z2"
                po.gst_type = "SGST"
        else:
            po.gst_number = "33AABCT2345D1Z2"
            po.gst_type = "SGST"

        # Categorize GST amounts
        gst_type_norm = (po.gst_type or "").upper()
        if "IGST" in gst_type_norm:
            po.igst_amount = po.gst_amount
            po.cgst_amount = 0.0
            po.sgst_amount = 0.0
        else:
            po.cgst_amount = round(float(po.gst_amount or 0) / 2.0, 2)
            po.sgst_amount = round(float(po.gst_amount or 0) / 2.0, 2)
            po.igst_amount = 0.0

        self.db.commit()
        self.db.refresh(po)
        return po

    def upload_documents(self, po_id: int, data: PurchaseUploadDocumentsRequest) -> Purchase:
        po = self.get_po_by_id(po_id)
        if data.invoice_document:
            po.invoice_document = data.invoice_document
        if data.lr_documents:
            po.lr_documents = data.lr_documents

        po.po_status = "In-Transit"
        self.db.commit()
        self.db.refresh(po)
        return po

    def get_document(self, po_id: int, doc_type: str) -> Dict[str, Any]:
        po = self.get_po_by_id(po_id)
        if doc_type.lower() in ["invoice", "invoicedoc", "invoice_document"]:
            doc_content = po.invoice_document
            filename = f"Invoice_{po.po_no or po.id}.pdf"
        elif doc_type.lower() in ["lr", "lrdoc", "lr_documents"]:
            doc_content = po.lr_documents
            filename = f"LR_{po.po_no or po.id}.pdf"
        elif doc_type.lower() in ["po", "podoc", "po_document"]:
            doc_content = po.po_document
            filename = f"Purchase_Order_{po.po_no or po.id}.pdf"
        else:
            raise HTTPException(status_code=400, detail=f"Invalid document type: {doc_type}")

        if not doc_content:
            # Fallback placeholder PDF data URL
            doc_content = "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA0OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrVAgwsFBIVMhIzMsvVUjOz1NQCEssUSguKUgsKklNysxLT1UIzUstS80r0VAvAQC9cw9KCmVuZHN0cmVhbQplbmRvYmoK"
        return {"filename": filename, "content": doc_content, "po_no": po.po_no}

    # -------------------------------------------------------------------------
    # ACCOUNTS DB INTEGRATION (Payment & Purchase Tables)
    # -------------------------------------------------------------------------
    def save_transport_payment(self, data: TransportPaymentRequest) -> Dict[str, Any]:
        """
        Stores transport payment submission from WH GRN into PostgreSQL `nexus_accounts.payment`.
        Sets expense_type = 'Transport Charges' and stores financial and bank details.
        """
        adb = AccountsSessionLocal()
        try:
            now_date = date.today()
            safe_po = (data.po_no or "001").replace("/", "-")
            vch_no = f"VCH-TRN-{now_date.strftime('%Y%m%d')}-{safe_po}"
            payment_record = AccountPayment(
                company_name=data.company_name or "Nexus",
                voucher_number=vch_no,
                voucher_date=now_date,
                po_no=data.po_no,
                site_id=data.site_id,
                site_name=data.site_name,
                request_date=now_date,
                request_by=data.request_by or "Warehouse Manager",
                account_head=data.account_head or "Transport",
                expense_type="Transport Charges",
                expense_description=data.remarks or "Transport & Logistics Freight Charges",
                transferred_from=data.transferred_from or "HDFC Bank - 50200012345",
                transferred_to=data.transferred_to,
                amount=data.amount,
                paid_amount=data.paid_amount,
                account_number=data.account_number,
                bank_name=data.bank_name,
                ifsc_code=data.ifsc_code,
                partial_payment=bool(data.paid_amount and data.paid_amount < data.amount),
                ageing=0
            )
            adb.add(payment_record)
            adb.commit()
            adb.refresh(payment_record)
            return {
                "success": True,
                "payment_id": payment_record.payment_id,
                "voucher_number": payment_record.voucher_number,
                "expense_type": payment_record.expense_type,
                "amount": float(payment_record.amount or 0),
                "paid_amount": float(payment_record.paid_amount or 0)
            }
        finally:
            adb.close()

    def sync_account_purchase(self, data: AccountPurchaseCreate) -> Dict[str, Any]:
        """
        Upserts purchase record into PostgreSQL `nexus_accounts.purchase`.
        Links partial_payment column to whether partial amount was paid.
        """
        adb = AccountsSessionLocal()
        try:
            existing = adb.query(AccountPurchase).filter(
                AccountPurchase.invoice_number == data.invoice_number
            ).first()
            now_date = date.today()
            is_partial = bool(data.partial_payment or ((data.paid_amount or 0) > 0 and (data.payable_amount or 0) > 0))
            if existing:
                existing.vendor_name = data.vendor_name
                existing.basic_amount = data.basic_amount
                existing.cgst = data.cgst
                existing.sgst = data.sgst
                existing.igst = data.igst
                existing.total_amount = data.total_amount
                existing.paid_amount = data.paid_amount
                existing.payable_amount = data.payable_amount
                existing.partial_payment = is_partial
                existing.ageing = data.ageing or existing.ageing
                adb.commit()
                adb.refresh(existing)
                return {"success": True, "purchase_id": existing.purchase_id, "updated": True}
            else:
                inv_suffix = data.invoice_number[-6:] if len(data.invoice_number) >= 6 else "001"
                vch_no = data.voucher_number or f"VCH-PUR-{now_date.strftime('%Y%m%d')}-{inv_suffix}"
                new_row = AccountPurchase(
                    company_name=data.company_name or "Nexus",
                    voucher_number=vch_no,
                    voucher_date=now_date,
                    vendor_name=data.vendor_name,
                    invoice_number=data.invoice_number,
                    invoice_date=now_date,
                    basic_amount=data.basic_amount,
                    cgst=data.cgst,
                    sgst=data.sgst,
                    igst=data.igst,
                    total_amount=data.total_amount,
                    paid_amount=data.paid_amount,
                    payable_amount=data.payable_amount,
                    partial_payment=is_partial,
                    ageing=data.ageing or 0
                )
                adb.add(new_row)
                adb.commit()
                adb.refresh(new_row)
                return {"success": True, "purchase_id": new_row.purchase_id, "created": True}
        finally:
            adb.close()

    def get_account_purchases(self) -> List[Dict[str, Any]]:
        """
        Retrieves all purchase payment records stored in PostgreSQL `nexus_accounts.purchase`.
        """
        adb = AccountsSessionLocal()
        try:
            rows = adb.query(AccountPurchase).order_by(AccountPurchase.purchase_id.desc()).all()
            return [
                {
                    "purchase_id": r.purchase_id,
                    "company_name": r.company_name,
                    "voucher_number": r.voucher_number,
                    "vendor_name": r.vendor_name,
                    "invoice_number": r.invoice_number,
                    "invoice_date": r.invoice_date.strftime("%d-%m-%Y") if r.invoice_date else None,
                    "basic_amount": float(r.basic_amount or 0),
                    "cgst": float(r.cgst or 0),
                    "sgst": float(r.sgst or 0),
                    "igst": float(r.igst or 0),
                    "total_amount": float(r.total_amount or 0),
                    "paid_amount": float(r.paid_amount or 0),
                    "payable_amount": float(r.payable_amount or 0),
                    "partial_payment": bool(r.partial_payment),
                    "ageing": r.ageing or 0
                }
                for r in rows
            ]
        finally:
            adb.close()

    def save_min_transport_details(self, data: MinTransportSubmitRequest) -> Dict[str, Any]:
        """
        Saves MIN transport details into PostgreSQL:
        - Transport details (transporter_name, vehicle_number, transport_type, driver_name, whatsapp_number) -> `nexus_admin.transport`
        - Amount and Advance Payment -> `nexus_accounts.payment` (expense_type='Transport Charges', partial_payment=has_advance_payment)
        """
        now_date = date.today()
        # 1. Save to nexus_admin.transport
        vch_admin = f"VCH-TRN-{now_date.strftime('%Y%m%d')}-{data.vehicle_number or '001'}"
        admin_rec = AdminTransport(
            company_name=data.company_name or "Nexus",
            voucher_no=vch_admin,
            voucher_date=now_date,
            year=now_date.year,
            month=now_date.strftime("%B"),
            transporter_name=data.transporter_name,
            vehicle_number=data.vehicle_number,
            transport_type=data.transport_type,
            driver_name=data.driver_name,
            whatsapp_number=data.whatsapp_number,
            advance=data.advance_payment if data.has_advance_payment else 0,
            total_rental_amount=data.amount or 0
        )
        self.db.add(admin_rec)
        self.db.commit()
        self.db.refresh(admin_rec)

        # 2. Save to nexus_accounts.payment
        adb = AccountsSessionLocal()
        try:
            vch_acc = f"VCH-PAY-TRN-{now_date.strftime('%Y%m%d')}-{admin_rec.transporter_payment_id}"
            payment_rec = AccountPayment(
                company_name=data.company_name or "Nexus",
                voucher_number=vch_acc,
                voucher_date=now_date,
                po_no=data.po_no,
                site_id=data.site_id,
                site_name=data.site_name,
                request_date=now_date,
                request_by=data.request_by or "Warehouse Manager",
                account_head="Transport",
                expense_type="Transport Charges",
                expense_description=f"MIN Transport charges for {data.transporter_name or 'Transporter'} ({data.vehicle_number or ''})",
                transferred_to=data.transporter_name,
                transferred_from="HDFC Bank - 50200012345",
                amount=data.amount or 0,
                advance_payment=data.advance_payment if data.has_advance_payment else 0,
                paid_amount=data.advance_payment if data.has_advance_payment else 0,
                partial_payment=bool(data.has_advance_payment),
                ageing=0
            )
            adb.add(payment_rec)
            adb.commit()
            adb.refresh(payment_rec)

            return {
                "success": True,
                "transport_payment_id": admin_rec.transporter_payment_id,
                "payment_id": payment_rec.payment_id,
                "voucher_number": payment_rec.voucher_number
            }
        finally:
            adb.close()
