from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, defer, load_only

from app.core.cache import reference_data_cache
from app.core.security import AuthenticatedUser, get_current_user
from app.db.session import get_accounts_db, get_db, get_project_db
from app.models.account_bank import AccountBank
from app.models.account_gst_payment import AccountGstPayment
from app.models.account_payment import AccountPayment
from app.models.account_purchase import AccountPurchase
from app.models.account_tds_payable import AccountTdsPayable
from app.models.commercial_project import ProjectExpense
from app.models.commercial_sales import ReceiptIndus, Sales
from app.models.customer import Customer
from app.models.expense import CompanyExpense
from app.models.vendor import VendorMaster

router = APIRouter(prefix="/accounts", tags=["Accounts Worklist"])


def _parse_date(raw: Optional[str]) -> Optional[date]:
    if not raw:
        return None
    s = str(raw).strip()
    if not s:
        return None
    # Normalize spaces around dashes (e.g. "12 - 08 - 2026")
    compact = s.replace(" ", "")
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(compact[:10], fmt).date()
        except ValueError:
            continue
    return None


def _resolve_transfer_to(exp: ProjectExpense) -> str:
    raw = (exp.transfer_to or "").strip()
    if raw == "New Account" and exp.account_name:
        return exp.account_name
    if raw == "Other Employee" and exp.account_name:
        return exp.account_name
    if raw == "Service Vendor" and exp.service_vendor_name:
        return exp.service_vendor_name
    if raw == "Supply Vendor" and exp.supply_vendor_name:
        return exp.supply_vendor_name
    if raw:
        return raw
    return exp.account_name or exp.service_vendor_name or exp.supply_vendor_name or "Self"


def _format_payment_row(exp: ProjectExpense) -> Dict[str, Any]:
    today = date.today()
    ageing_days = 0
    date_str = ""
    if exp.request_date:
        date_str = exp.request_date.strftime("%d/%m/%Y")
        ageing_days = max(0, (today - exp.request_date).days)

    amt = float(
        exp.approved_amount
        if exp.approved_amount is not None
        else (exp.total_amount if exp.total_amount is not None else (exp.amount or 0))
    )

    return {
        "id": f"exp-{exp.expense_management_id}",
        "expenseId": exp.expense_management_id,
        "selected": False,
        "date": date_str,
        "expenseType": exp.expense_type or exp.expense_head or exp.expense_name or "Operational Expenses",
        "remarks": exp.expense_description or exp.expense_name or exp.request_number or "",
        "transferTo": _resolve_transfer_to(exp),
        "amount": amt,
        "ageing": f"{ageing_days} Days",
        "ageingDays": ageing_days,
        "status": exp.status or "Approved",
        "requestNumber": exp.request_number or "",
        "poNo": exp.po_no or "",
        "siteId": exp.site_id or "",
        "customerName": exp.customer_name or "",
    }


def _format_bank_row(row: AccountBank) -> Dict[str, Any]:
    return {
        "id": f"bank-{row.bank_id}",
        "bankId": row.bank_id,
        "selected": False,
        "date": row.voucher_date.strftime("%d/%m/%Y") if row.voucher_date else "",
        "bankName": row.bank_name or "",
        "particulars": row.particulars or "",
        "refNo": row.reference_number or "",
        "withdrawal": float(row.withdrawal_dr or 0),
        "deposit": float(row.deposit_cr or 0),
        "balance": float(row.balance or 0),
        "voucherNumber": row.voucher_number or "",
    }


@router.get("/payments", summary="List approved payment rows for Accounts Worklist Payment page")
def list_accounts_payments(
    project_db: Session = Depends(get_project_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        project_db.query(ProjectExpense)
        .filter(func.lower(func.coalesce(ProjectExpense.status, "")) == "approved")
        .order_by(
            ProjectExpense.request_date.desc().nullslast(),
            ProjectExpense.expense_management_id.desc(),
        )
        .all()
    )
    items = [_format_payment_row(exp) for exp in rows]
    return {"success": True, "count": len(items), "data": items}


@router.post("/payments", summary="Create a payment entry from Accounts Worklist Payment page")
def create_accounts_payment(
    payload: Dict[str, Any],
    project_db: Session = Depends(get_project_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    amount_val = float(payload.get("amount") or 0)
    if amount_val <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than zero.",
        )

    req_date = _parse_date(payload.get("date")) or date.today()
    expense_type = str(payload.get("expenseType") or "IFT").strip()
    remarks = str(payload.get("remarks") or expense_type).strip()
    transfer_to = str(payload.get("transferTo") or "Department Account").strip()

    exp = ProjectExpense(
        company_name="Nexus",
        request_date=req_date,
        request_by=_auth.username if hasattr(_auth, "username") else "Accounts Manager",
        expense_head="Accounts",
        expense_type=expense_type,
        expense_name=expense_type,
        expense_description=remarks,
        transfer_to=transfer_to,
        account_name=transfer_to,
        qty=Decimal("1"),
        rate=Decimal(str(round(amount_val, 2))),
        amount=Decimal(str(round(amount_val, 2))),
        approved_amount=Decimal(str(round(amount_val, 2))),
        transferred_amount=Decimal("0"),
        payable_amount=Decimal(str(round(amount_val, 2))),
        total_amount=Decimal(str(round(amount_val, 2))),
        status="Approved",
    )
    project_db.add(exp)
    project_db.commit()
    project_db.refresh(exp)
    return {"success": True, "data": _format_payment_row(exp)}


@router.post("/payments/submit", summary="Submit selected Accounts payments and link to Accounts DB sales table")
def submit_accounts_payments(
    payload: Dict[str, Any],
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    items = payload.get("items") or []
    utr_number = str(payload.get("utrNumber") or "").strip()
    txn_date = _parse_date(payload.get("txnDate")) or date.today()

    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one payment row must be selected.",
        )

    created_sales_ids: List[int] = []
    submitted_expense_ids: List[int] = []

    for item in items:
        exp_id = item.get("expenseId")
        if exp_id is None and item.get("id"):
            raw_id = str(item["id"]).replace("exp-", "").strip()
            if raw_id.isdigit():
                exp_id = int(raw_id)

        target_exp: Optional[ProjectExpense] = None
        if exp_id is not None:
            try:
                target_exp = (
                    project_db.query(ProjectExpense)
                    .filter(ProjectExpense.expense_management_id == int(exp_id))
                    .first()
                )
            except Exception:
                target_exp = None

        amt = float(item.get("amount") or 0)
        if target_exp is not None and amt <= 0:
            amt = float(
                target_exp.approved_amount
                if target_exp.approved_amount is not None
                else (target_exp.total_amount or target_exp.amount or 0)
            )

        req_date = (
            (target_exp.request_date if target_exp else None)
            or _parse_date(item.get("date"))
            or txn_date
        )
        ageing_days = max(0, (txn_date - req_date).days) if req_date else 0

        voucher_no = (
            (target_exp.request_number if target_exp and target_exp.request_number else None)
            or item.get("requestNumber")
            or (f"PAY-{exp_id}" if exp_id is not None else utr_number)
        )
        customer_name = (
            (_resolve_transfer_to(target_exp) if target_exp else None)
            or item.get("transferTo")
            or ""
        )
        doc_type = (
            (target_exp.expense_type or target_exp.expense_head if target_exp else None)
            or item.get("expenseType")
            or "Payment"
        )

        amt_dec = Decimal(str(round(amt, 2)))
        sale_record = Sales(
            company_name=(target_exp.company_name if target_exp and target_exp.company_name else "Nexus"),
            voucher_number=str(voucher_no)[:100] if voucher_no else None,
            customer_name=str(customer_name)[:255] if customer_name else None,
            document_type=str(doc_type)[:100] if doc_type else None,
            document_no=utr_number[:100] if utr_number else None,
            document_date=req_date,
            basic_amount=amt_dec,
            cgst=Decimal("0"),
            sgst=Decimal("0"),
            igst=Decimal("0"),
            total_amount=amt_dec,
            approved_amount=amt_dec,
            received_amount=amt_dec,
            received_date=txn_date,
            ageing=ageing_days,
        )
        accounts_db.add(sale_record)
        accounts_db.flush()
        if sale_record.sales_id is not None:
            created_sales_ids.append(int(sale_record.sales_id))

        if target_exp is not None:
            target_exp.status = "Paid"
            target_exp.transferred_amount = amt_dec
            target_exp.payable_amount = Decimal("0")
            submitted_expense_ids.append(int(target_exp.expense_management_id))

    accounts_db.commit()
    project_db.commit()

    return {
        "success": True,
        "submittedCount": len(items),
        "salesIds": created_sales_ids,
        "expenseIds": submitted_expense_ids,
    }


@router.get("/bank", summary="List Bank entries from Accounts DB bank table")
def list_accounts_bank(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountBank)
        .order_by(
            AccountBank.voucher_date.desc().nullslast(),
            AccountBank.bank_id.desc(),
        )
        .all()
    )
    items = [_format_bank_row(r) for r in rows]
    return {"success": True, "count": len(items), "data": items}


@router.post("/bank", summary="Create a Bank entry in Accounts DB bank table")
def create_accounts_bank(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    bank_name = str(payload.get("bankName") or "").strip()
    particulars = str(payload.get("particulars") or "").strip()
    ref_no = str(payload.get("refNo") or "").strip()

    if not particulars:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Particulars is required.",
        )
    if not ref_no:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reference number is required.",
        )

    withdrawal_val = float(payload.get("withdrawal") or 0)
    deposit_val = float(payload.get("deposit") or 0)
    if withdrawal_val == 0 and deposit_val == 0:
        amount_val = float(payload.get("amount") or 0)
        if amount_val <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be greater than zero.",
            )
        deposit_val = amount_val

    voucher_date = _parse_date(payload.get("date")) or date.today()

    latest = (
        accounts_db.query(AccountBank)
        .order_by(AccountBank.bank_id.desc())
        .first()
    )
    prev_balance = float(latest.balance or 0) if latest else 0.0
    new_balance = round(prev_balance + deposit_val - withdrawal_val, 2)

    entry = AccountBank(
        company_name=str(payload.get("companyName") or "Nexus").strip(),
        voucher_number=str(payload.get("voucherNumber") or ref_no)[:100],
        voucher_date=voucher_date,
        bank_name=bank_name[:255] if bank_name else None,
        particulars=particulars,
        reference_number=ref_no[:150],
        withdrawal_dr=Decimal(str(round(withdrawal_val, 2))),
        deposit_cr=Decimal(str(round(deposit_val, 2))),
        balance=Decimal(str(new_balance)),
    )
    accounts_db.add(entry)
    accounts_db.commit()
    accounts_db.refresh(entry)
    return {"success": True, "data": _format_bank_row(entry)}


@router.post("/bank/submit", summary="Submit selected Bank entries")
def submit_accounts_bank(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    raw_ids = payload.get("bankIds") or []
    bank_ids: List[int] = []
    for rid in raw_ids:
        s = str(rid).replace("bank-", "").strip()
        if s.isdigit():
            bank_ids.append(int(s))

    if not bank_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one bank entry must be selected.",
        )

    matched = (
        accounts_db.query(AccountBank)
        .filter(AccountBank.bank_id.in_(bank_ids))
        .count()
    )
    return {"success": True, "submittedCount": matched}


@router.get("/receivable", summary="List validated Receivable rows from Accounts DB sales table")
def list_accounts_receivable(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    sales_rows = (
        accounts_db.query(Sales)
        .options(defer(Sales.invoice_document))
        .filter(func.lower(func.coalesce(Sales.invoice_status, "")) == "validated")
        .order_by(
            Sales.document_date.desc().nullslast(),
            Sales.sales_id.desc(),
        )
        .all()
    )

    # Index receipts by invoice_no / voucher_number for enriching breakdown data
    receipts_by_inv: Dict[str, List[ReceiptIndus]] = {}
    for rec in accounts_db.query(ReceiptIndus).all():
        key = (rec.invoice_no or rec.voucher_number or "").strip().lower()
        if key:
            receipts_by_inv.setdefault(key, []).append(rec)

    today = date.today()
    items: List[Dict[str, Any]] = []
    for s in sales_rows:
        inv_no = s.voucher_number or s.document_no or ""
        inv_date = s.document_date
        due_date = (inv_date + timedelta(days=30)) if inv_date else None

        inv_key = inv_no.strip().lower()
        matched_receipts = receipts_by_inv.get(inv_key, [])
        first_rec = matched_receipts[0] if matched_receipts else None

        basic_amt = float(s.basic_amount or 0)
        cgst_amt = float(s.cgst or 0)
        sgst_amt = float(s.sgst or 0)
        igst_amt = float(s.igst or 0)
        inv_amt = float(s.total_amount or (basic_amt + cgst_amt + sgst_amt + igst_amt))

        tds_amt = float(s.tds_deduction if s.tds_deduction is not None else (first_rec.tds if first_rec and first_rec.tds is not None else 0))
        dn_amt = float(s.dn_amount if s.dn_amount is not None else (first_rec.dn_amount if first_rec and first_rec.dn_amount is not None else 0))
        disc_amt = float(s.treds_discount_amount if s.treds_discount_amount is not None else (first_rec.treds_discount_amount if first_rec and first_rec.treds_discount_amount is not None else 0))
        treds_fee = float(s.treds_processing_fee if s.treds_processing_fee is not None else (first_rec.treds_processing_fee if first_rec and first_rec.treds_processing_fee is not None else 0))
        deduction = round(tds_amt + dn_amt + disc_amt + treds_fee, 2)

        approved_amt = float(s.approved_amount) if s.approved_amount is not None else max(0.0, round(inv_amt - deduction, 2))
        received_amt = float(
            s.received_amount
            if s.received_amount is not None
            else sum(float(r.received_amount or 0) for r in matched_receipts)
        )
        receivable_amt = max(0.0, round(approved_amt - received_amt, 2))

        if s.ageing is not None:
            ageing_days = max(0, int(s.ageing))
        elif due_date:
            ageing_days = max(0, (today - due_date).days)
        elif inv_date:
            ageing_days = max(0, (today - inv_date).days)
        else:
            ageing_days = 0

        if receivable_amt == 0 and received_amt > 0:
            row_status = "Paid"
        elif received_amt > 0:
            row_status = "Partially Paid"
        elif due_date and today > due_date:
            row_status = "Overdue"
        else:
            row_status = "Pending"

        receipt_entries = []
        for r in matched_receipts:
            r_amt = float(r.received_amount or 0)
            if r_amt > 0:
                receipt_entries.append({
                    "date": r.received_date.strftime("%d/%m/%Y") if r.received_date else "",
                    "amount": r_amt,
                })
        if not receipt_entries and received_amt > 0:
            receipt_entries.append({
                "date": s.received_date.strftime("%d/%m/%Y") if s.received_date else "",
                "amount": received_amt,
            })

        items.append({
            "id": f"sales-{s.sales_id}",
            "salesId": s.sales_id,
            "customerName": s.customer_name or "",
            "invoiceNo": inv_no,
            "invoiceDate": inv_date.strftime("%d/%m/%Y") if inv_date else "",
            "dueDate": due_date.strftime("%d/%m/%Y") if due_date else "",
            "invoiceAmount": inv_amt,
            "deduction": deduction,
            "approvedAmount": approved_amt,
            "receivedAmount": received_amt,
            "receivable": receivable_amt,
            "status": row_status,
            "ageing": f"{ageing_days} Days",
            "invoiceStatus": s.invoice_status or "Validated",
            "taxBreakup": {
                "basic": basic_amt,
                "cgst": cgst_amt,
                "sgst": sgst_amt,
                "igst": igst_amt,
            },
            "deductionBreakup": {
                "tds": tds_amt,
                "dn": dn_amt,
                "discount": disc_amt,
                "tredsFee": treds_fee,
            },
            "receipts": receipt_entries,
        })

    return {"success": True, "count": len(items), "data": items}


@router.get("/gstr1", summary="List GSTR 1 rows linked to Accounts DB sales table")
def list_accounts_gstr1(
    accounts_db: Session = Depends(get_accounts_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(Sales)
        .options(defer(Sales.invoice_document))
        .filter(func.lower(func.coalesce(Sales.gstr1_status, "")) != "submitted")
        .order_by(
            Sales.document_date.desc().nullslast(),
            Sales.sales_id.desc(),
        )
        .all()
    )

    def _load_cust_gst_map() -> Dict[str, str]:
        mapping: Dict[str, str] = {}
        try:
            for cust_name, legal_name, gst_no in master_db.query(
                Customer.customer_name, Customer.legal_name, Customer.gst_number
            ).filter(Customer.gst_number.isnot(None)).all():
                if cust_name and gst_no:
                    mapping[cust_name.strip().lower()] = gst_no.strip()
                if legal_name and gst_no:
                    mapping[legal_name.strip().lower()] = gst_no.strip()
        except Exception:
            pass
        return mapping

    cust_gst_map = reference_data_cache.get_or_set("master:customer_gst_map", _load_cust_gst_map, ttl=60.0)

    items: List[Dict[str, Any]] = []
    for s in rows:
        cust_name = s.customer_name or ""
        items.append({
            "id": f"sales-{s.sales_id}",
            "salesId": s.sales_id,
            "selected": False,
            "customerName": cust_name,
            "customerGstNo": cust_gst_map.get(cust_name.strip().lower(), ""),
            "invoiceNo": s.voucher_number or s.document_no or "",
            "invoiceDate": s.document_date.strftime("%d/%m/%Y") if s.document_date else "",
            "taxableAmount": float(s.basic_amount or 0),
            "cgst": float(s.cgst or 0),
            "sgst": float(s.sgst or 0),
            "igst": float(s.igst or 0),
            "totalAmount": float(s.total_amount or 0),
        })

    return {"success": True, "count": len(items), "data": items}


@router.post("/gstr1/submit", summary="Submit selected GSTR 1 rows in Accounts DB sales table")
def submit_accounts_gstr1(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    raw_ids = payload.get("salesIds") or []
    sales_ids: List[int] = []
    for rid in raw_ids:
        s = str(rid).replace("sales-", "").strip()
        if s.isdigit():
            sales_ids.append(int(s))

    if not sales_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one GSTR 1 row must be selected.",
        )

    rows = accounts_db.query(Sales).filter(Sales.sales_id.in_(sales_ids)).all()
    for r in rows:
        r.gstr1_status = "Submitted"
    accounts_db.commit()
    return {"success": True, "submittedCount": len(rows)}


@router.get("/gstr2b", summary="List GSTR 2B rows linked to Accounts DB purchase table")
def list_accounts_gstr2b(
    accounts_db: Session = Depends(get_accounts_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountPurchase)
        .options(
            load_only(
                AccountPurchase.purchase_id,
                AccountPurchase.vendor_name,
                AccountPurchase.invoice_number,
                AccountPurchase.voucher_number,
                AccountPurchase.invoice_date,
                AccountPurchase.voucher_date,
                AccountPurchase.basic_amount,
                AccountPurchase.cgst,
                AccountPurchase.sgst,
                AccountPurchase.igst,
                AccountPurchase.total_amount,
                AccountPurchase.ageing,
                AccountPurchase.gstr2b_status,
            )
        )
        .filter(func.lower(func.coalesce(AccountPurchase.gstr2b_status, "pending")) != "completed")
        .order_by(
            AccountPurchase.invoice_date.desc().nullslast(),
            AccountPurchase.purchase_id.desc(),
        )
        .all()
    )

    def _load_vendor_gst_map() -> Dict[str, str]:
        mapping: Dict[str, str] = {}
        try:
            for v_name, gst_no in master_db.query(
                VendorMaster.vendor_name, VendorMaster.gst_number
            ).filter(VendorMaster.gst_number.isnot(None)).all():
                if v_name and gst_no:
                    mapping[v_name.strip().lower()] = gst_no.strip()
        except Exception:
            pass
        return mapping

    vendor_gst_map = reference_data_cache.get_or_set("master:vendor_gst_map", _load_vendor_gst_map, ttl=60.0)

    today = date.today()
    items: List[Dict[str, Any]] = []
    for p in rows:
        v_name = p.vendor_name or ""
        inv_date = p.invoice_date or p.voucher_date
        if p.ageing is not None:
            ageing_days = max(0, int(p.ageing))
        elif inv_date:
            ageing_days = max(0, (today - inv_date).days)
        else:
            ageing_days = 0

        items.append({
            "id": f"purch-{p.purchase_id}",
            "purchaseId": p.purchase_id,
            "selected": False,
            "vendorName": v_name,
            "vendorGstNo": vendor_gst_map.get(v_name.strip().lower(), ""),
            "invoiceNo": p.invoice_number or p.voucher_number or "",
            "invoiceDate": inv_date.strftime("%d/%m/%Y") if inv_date else "",
            "taxableAmount": float(p.basic_amount or 0),
            "cgst": float(p.cgst or 0),
            "sgst": float(p.sgst or 0),
            "igst": float(p.igst or 0),
            "totalAmount": float(p.total_amount or 0),
            "ageing": f"{ageing_days} Days",
            "status": p.gstr2b_status or "Pending",
        })

    return {"success": True, "count": len(items), "data": items}


@router.post("/gstr2b/submit", summary="Mark selected GSTR 2B rows as Completed in Accounts DB purchase table")
def submit_accounts_gstr2b(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    raw_ids = payload.get("purchaseIds") or []
    purchase_ids: List[int] = []
    for rid in raw_ids:
        s = str(rid).replace("purch-", "").strip()
        if s.isdigit():
            purchase_ids.append(int(s))

    if not purchase_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one GSTR 2B row must be selected.",
        )

    rows = (
        accounts_db.query(AccountPurchase)
        .filter(AccountPurchase.purchase_id.in_(purchase_ids))
        .all()
    )
    for r in rows:
        r.gstr2b_status = "Completed"
    accounts_db.commit()
    return {"success": True, "submittedCount": len(rows)}


@router.get("/tds", summary="List TDS rows linked to Accounts DB payment table (where transferred_to is present)")
def list_accounts_tds(
    accounts_db: Session = Depends(get_accounts_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountPayment)
        .options(
            load_only(
                AccountPayment.payment_id,
                AccountPayment.company_name,
                AccountPayment.paid_date,
                AccountPayment.voucher_date,
                AccountPayment.request_date,
                AccountPayment.transferred_to,
                AccountPayment.account_head,
                AccountPayment.expense_type,
                AccountPayment.amount,
                AccountPayment.paid_amount,
            )
        )
        .filter(
            AccountPayment.transferred_to.isnot(None),
            func.trim(AccountPayment.transferred_to) != "",
        )
        .order_by(
            AccountPayment.paid_date.desc().nullslast(),
            AccountPayment.voucher_date.desc().nullslast(),
            AccountPayment.payment_id.desc(),
        )
        .all()
    )

    def _load_vendor_tds_map() -> Dict[str, Dict[str, Any]]:
        mapping: Dict[str, Dict[str, Any]] = {}
        try:
            for v_name, acc_name, pan_no, tds_code, tds_rate in master_db.query(
                VendorMaster.vendor_name,
                VendorMaster.account_name,
                VendorMaster.pan_number,
                VendorMaster.tds_code,
                VendorMaster.tds_rate,
            ).all():
                info = {
                    "panNumber": (pan_no or "").strip(),
                    "tdsCode": (tds_code or "").strip(),
                    "tdsRate": float(tds_rate) if tds_rate is not None else 0.0,
                }
                if v_name:
                    mapping[v_name.strip().lower()] = info
                if acc_name:
                    mapping.setdefault(acc_name.strip().lower(), info)
        except Exception:
            pass
        return mapping

    vendor_tds_map = reference_data_cache.get_or_set("master:vendor_tds_map", _load_vendor_tds_map, ttl=60.0)

    items: List[Dict[str, Any]] = []
    for p in rows:
        transfer_to = (p.transferred_to or "").strip()
        if not transfer_to:
            continue
        pay_dt = p.paid_date or p.voucher_date or p.request_date
        v_info = vendor_tds_map.get(transfer_to.lower(), {})
        taxable = float(
            p.paid_amount
            if p.paid_amount is not None and float(p.paid_amount) > 0
            else (p.amount or 0)
        )
        rate_val = float(v_info.get("tdsRate") or 0.0)
        tds_amt = round(taxable * rate_val / 100.0, 2) if rate_val > 0 else 0.0
        rate_str = f"{rate_val:g}%" if rate_val > 0 else "0%"

        items.append({
            "id": f"tds-pay-{p.payment_id}",
            "paymentId": p.payment_id,
            "paymentDate": pay_dt.strftime("%d/%m/%Y") if pay_dt else "",
            "panName": transfer_to,
            "panNumber": v_info.get("panNumber", ""),
            "tdsCode": v_info.get("tdsCode") or p.expense_type or p.account_head or "",
            "taxableAmount": taxable,
            "tdsRate": rate_str,
            "tdsAmount": tds_amt,
        })

    return {"success": True, "count": len(items), "data": items}


@router.post("/tds/challan", summary="Save TDS Challan Details into Accounts DB tds_payable table")
def submit_accounts_tds_challan(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    challan_no = str(payload.get("tdsChallanNumber") or "").strip()
    if not challan_no:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TDS Challan Number is required.",
        )

    paid_date = _parse_date(payload.get("tdsPaidDate"))
    if not paid_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid TDS Paid Date is required.",
        )

    challan_doc = payload.get("challanDocuments")
    challan_doc_str = str(challan_doc).strip() if challan_doc else None

    deducted_amt = float(payload.get("tdsDeductedAmount") or 0)
    paid_amt = float(payload.get("tdsPaidAmount") if payload.get("tdsPaidAmount") is not None else deducted_amt)

    # Derive year, quarter (Indian FY), and month name from tds_paid_date
    month_num = paid_date.month
    if month_num in (4, 5, 6):
        quarter_str = "Q1"
    elif month_num in (7, 8, 9):
        quarter_str = "Q2"
    elif month_num in (10, 11, 12):
        quarter_str = "Q3"
    else:
        quarter_str = "Q4"

    entry = AccountTdsPayable(
        company_name=str(payload.get("companyName") or "Nexus").strip(),
        year=paid_date.year,
        quarter=quarter_str,
        month=paid_date.strftime("%B"),
        tds_deducted_amount=Decimal(str(round(deducted_amt, 2))),
        tds_challan_number=challan_no[:100],
        tds_paid_amount=Decimal(str(round(paid_amt, 2))),
        tds_paid_date=paid_date,
        challan_documents=challan_doc_str,
    )
    accounts_db.add(entry)
    accounts_db.commit()
    accounts_db.refresh(entry)

    return {
        "success": True,
        "tdsPayableId": entry.tds_payable_id,
        "tdsChallanNumber": entry.tds_challan_number,
        "tdsPaidDate": entry.tds_paid_date.strftime("%d/%m/%Y") if entry.tds_paid_date else "",
    }


def _upsert_gst_payment(
    accounts_db: Session,
    *,
    year: int,
    month_name: str,
    cgst_payable: float,
    sgst_payable: float,
    igst_payable: float,
    company_name: str = "Nexus",
    documents_3b: Optional[str] = None,
    filling_status: Optional[str] = None,
) -> AccountGstPayment:
    existing = (
        accounts_db.query(AccountGstPayment)
        .filter(
            AccountGstPayment.year == year,
            func.lower(func.coalesce(AccountGstPayment.month, "")) == month_name.lower(),
        )
        .first()
    )
    cgst_dec = Decimal(str(round(cgst_payable, 2)))
    sgst_dec = Decimal(str(round(sgst_payable, 2)))
    igst_dec = Decimal(str(round(igst_payable, 2)))
    tot_dec = Decimal(str(round(cgst_payable + sgst_payable + igst_payable, 2)))

    if existing:
        existing.cgst_payable = cgst_dec
        existing.sgst_payable = sgst_dec
        existing.igst_payable = igst_dec
        existing.total_amount = tot_dec
        existing.cash_credit = existing.cash_credit or "Cash"
        if documents_3b is not None:
            existing.documents_3b = documents_3b
        if filling_status is not None:
            existing.filling_status = filling_status
        record = existing
    else:
        record = AccountGstPayment(
            company_name=company_name,
            year=year,
            month=month_name,
            cash_credit="Cash",
            cgst_payable=cgst_dec,
            sgst_payable=sgst_dec,
            igst_payable=igst_dec,
            total_amount=tot_dec,
            documents_3b=documents_3b,
            filling_status=filling_status or "Pending",
        )
        accounts_db.add(record)

    accounts_db.commit()
    accounts_db.refresh(record)
    return record


@router.get("/gstr3b", summary="Get monthly GSTR-3B summary (GSTR 1A, GSTR 2A, RCM, Taxable- Cash) and sync to gst_payment")
def get_accounts_gstr3b(
    year: Optional[int] = Query(None, ge=2000, le=2100),
    month: Optional[int] = Query(None, ge=1, le=12),
    accounts_db: Session = Depends(get_accounts_db),
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    today = date.today()
    target_year = year or today.year
    target_month = month or today.month
    month_name = date(target_year, target_month, 1).strftime("%B")

    # 1. GSTR 1A: monthly summation from nexus_accounts.sales
    g1_row = (
        accounts_db.query(
            func.coalesce(func.sum(Sales.basic_amount), 0),
            func.coalesce(func.sum(Sales.cgst), 0),
            func.coalesce(func.sum(Sales.sgst), 0),
            func.coalesce(func.sum(Sales.igst), 0),
        )
        .filter(
            Sales.document_date.isnot(None),
            extract("year", Sales.document_date) == target_year,
            extract("month", Sales.document_date) == target_month,
        )
        .first()
    )
    g1_basic = float(g1_row[0] or 0)
    g1_cgst = float(g1_row[1] or 0)
    g1_sgst = float(g1_row[2] or 0)
    g1_igst = float(g1_row[3] or 0)

    # 2. GSTR 2A: monthly summation from nexus_accounts.purchase
    purch_date_col = func.coalesce(AccountPurchase.invoice_date, AccountPurchase.voucher_date)
    g2_row = (
        accounts_db.query(
            func.coalesce(func.sum(AccountPurchase.basic_amount), 0),
            func.coalesce(func.sum(AccountPurchase.cgst), 0),
            func.coalesce(func.sum(AccountPurchase.sgst), 0),
            func.coalesce(func.sum(AccountPurchase.igst), 0),
        )
        .filter(
            purch_date_col.isnot(None),
            extract("year", purch_date_col) == target_year,
            extract("month", purch_date_col) == target_month,
        )
        .first()
    )
    g2_basic = float(g2_row[0] or 0)
    g2_cgst = float(g2_row[1] or 0)
    g2_sgst = float(g2_row[2] or 0)
    g2_igst = float(g2_row[3] or 0)

    # 3. RCM: monthly summation ONLY for expense categories/names where RCM toggle is enabled in company_expenses
    rcm_expenses = (
        master_db.query(
            CompanyExpense.expense_category,
            CompanyExpense.expense_name,
            CompanyExpense.expense_head,
            CompanyExpense.gst_rate,
        )
        .filter(CompanyExpense.rcm.is_(True))
        .all()
    )
    rcm_rate_by_key: Dict[str, float] = {}
    for cat, name, head, rate in rcm_expenses:
        r_val = float(rate) if rate is not None else 0.0
        for token in (cat, name):
            if token and token.strip():
                rcm_rate_by_key[token.strip().lower()] = r_val

    rcm_basic = 0.0
    rcm_cgst = 0.0
    rcm_sgst = 0.0
    rcm_igst = 0.0

    if rcm_rate_by_key:
        proj_exps = (
            project_db.query(ProjectExpense)
            .filter(
                ProjectExpense.request_date.isnot(None),
                extract("year", ProjectExpense.request_date) == target_year,
                extract("month", ProjectExpense.request_date) == target_month,
            )
            .all()
        )
        for exp in proj_exps:
            candidates = [
                (exp.expense_type or "").strip().lower(),
                (exp.expense_name or "").strip().lower(),
                (exp.expense_head or "").strip().lower(),
            ]
            matched_rate = None
            for cand in candidates:
                if cand and cand in rcm_rate_by_key:
                    matched_rate = rcm_rate_by_key[cand]
                    break
            if matched_rate is None:
                continue

            base_amt = float(exp.approved_amount if exp.approved_amount is not None and float(exp.approved_amount) > 0 else (exp.amount or 0))
            gst_amt = float(exp.gst_amount) if exp.gst_amount is not None else round(base_amt * matched_rate / 100.0, 2)
            gst_type_str = (exp.gst_type or "").strip().upper()

            rcm_basic += base_amt
            if "IGST" in gst_type_str:
                rcm_igst += gst_amt
            else:
                rcm_cgst += round(gst_amt / 2.0, 2)
                rcm_sgst += round(gst_amt - round(gst_amt / 2.0, 2), 2)

    rcm_basic = round(rcm_basic, 2)
    rcm_cgst = round(rcm_cgst, 2)
    rcm_sgst = round(rcm_sgst, 2)
    rcm_igst = round(rcm_igst, 2)

    # 4. Taxable- Cash = GSTR 1A - GSTR 2A (2B) + RCM (CGST, SGST, IGST only; Basic is blank/None)
    taxable_cgst = round(g1_cgst - g2_cgst + rcm_cgst, 2)
    taxable_sgst = round(g1_sgst - g2_sgst + rcm_sgst, 2)
    taxable_igst = round(g1_igst - g2_igst + rcm_igst, 2)

    # Persist/sync monthly Taxable- Cash values to nexus_accounts.gst_payment
    gst_pay_rec = _upsert_gst_payment(
        accounts_db,
        year=target_year,
        month_name=month_name,
        cgst_payable=taxable_cgst,
        sgst_payable=taxable_sgst,
        igst_payable=taxable_igst,
    )

    items = [
        {
            "id": "ACC-GST3B-001",
            "gstType": "GSTR 1A",
            "basic": round(g1_basic, 2),
            "cgst": round(g1_cgst, 2),
            "sgst": round(g1_sgst, 2),
            "igst": round(g1_igst, 2),
        },
        {
            "id": "ACC-GST3B-002",
            "gstType": "GSTR 2A",
            "basic": round(g2_basic, 2),
            "cgst": round(g2_cgst, 2),
            "sgst": round(g2_sgst, 2),
            "igst": round(g2_igst, 2),
        },
        {
            "id": "ACC-GST3B-003",
            "gstType": "RCM",
            "basic": rcm_basic,
            "cgst": rcm_cgst,
            "sgst": rcm_sgst,
            "igst": rcm_igst,
        },
        {
            "id": "ACC-GST3B-004",
            "gstType": "Taxable- Cash",
            "basic": None,
            "cgst": taxable_cgst,
            "sgst": taxable_sgst,
            "igst": taxable_igst,
        },
    ]

    return {
        "success": True,
        "year": target_year,
        "month": target_month,
        "monthName": month_name,
        "gstPaymentId": gst_pay_rec.gst_payment_id,
        "data": items,
    }


@router.post("/gstr3b/submit", summary="Store uploaded GSTR 3B return document and payables into nexus_accounts.gst_payment")
def submit_accounts_gstr3b_returns(
    payload: Dict[str, Any],
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    doc_3b = payload.get("documents3b")
    if not doc_3b or not str(doc_3b).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a GSTR 3B return PDF document.",
        )

    today = date.today()
    target_year = int(payload.get("year") or today.year)
    raw_month = payload.get("month")
    if isinstance(raw_month, int) or (isinstance(raw_month, str) and raw_month.isdigit()):
        month_name = date(target_year, int(raw_month), 1).strftime("%B")
    elif raw_month:
        month_name = str(raw_month).strip()
    else:
        month_name = today.strftime("%B")

    cgst_val = float(payload.get("cgstPayable") or 0)
    sgst_val = float(payload.get("sgstPayable") or 0)
    igst_val = float(payload.get("igstPayable") or 0)

    rec = _upsert_gst_payment(
        accounts_db,
        year=target_year,
        month_name=month_name,
        cgst_payable=cgst_val,
        sgst_payable=sgst_val,
        igst_payable=igst_val,
        company_name=str(payload.get("companyName") or "Nexus").strip(),
        documents_3b=str(doc_3b).strip(),
        filling_status="Submitted",
    )

    return {
        "success": True,
        "gstPaymentId": rec.gst_payment_id,
        "year": rec.year,
        "month": rec.month,
    }


def _fmt_inr(val: Any) -> str:
    num = float(val or 0)
    neg = num < 0
    num = abs(num)
    s = f"{num:.2f}"
    int_part, dec_part = s.split(".")
    if len(int_part) <= 3:
        formatted = f"{int_part}.{dec_part}"
    else:
        last3 = int_part[-3:]
        rest = int_part[:-3]
        parts = []
        while len(rest) > 2:
            parts.append(rest[-2:])
            rest = rest[:-2]
        if rest:
            parts.append(rest)
        parts.reverse()
        formatted = f"{','.join(parts)},{last3}.{dec_part}"
    return f"-{formatted}" if neg else formatted


def _fmt_date_spaced(d: Optional[date]) -> str:
    return d.strftime("%d - %m - %Y") if d else ""


def _quarter_from_month(m: int) -> str:
    if m in (4, 5, 6):
        return "Q1"
    if m in (7, 8, 9):
        return "Q2"
    if m in (10, 11, 12):
        return "Q3"
    return "Q4"


# =============================================================================
# Accounts Icon (Accounts Module) Endpoints — Linked to nexus_accounts DB
# =============================================================================

@router.get("/module/sales", summary="Accounts Icon -> Sales page linked to nexus_accounts.sales")
def list_accounts_module_sales(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(Sales)
        .options(defer(Sales.invoice_document))
        .order_by(Sales.document_date.desc().nullslast(), Sales.sales_id.desc())
        .all()
    )
    receipts_by_inv: Dict[str, List[ReceiptIndus]] = {}
    for rec in accounts_db.query(ReceiptIndus).all():
        key = (rec.invoice_no or rec.voucher_number or "").strip().lower()
        if key:
            receipts_by_inv.setdefault(key, []).append(rec)

    items = []
    for s in rows:
        inv_no = s.voucher_number or s.document_no or ""
        matched_recs = receipts_by_inv.get(inv_no.strip().lower(), [])
        basic = float(s.basic_amount or 0)
        cgst = float(s.cgst or 0)
        sgst = float(s.sgst or 0)
        igst = float(s.igst or 0)
        inv_amt = float(s.total_amount or (basic + cgst + sgst + igst))
        tds = float(s.tds_deduction or 0)
        dn = float(s.dn_amount or 0)
        treds_disc = float(s.treds_discount_amount or 0)
        treds_fee = float(s.treds_processing_fee or 0)
        treds_gst = sum(float(r.treds_gst or 0) for r in matched_recs)
        deduction = round(tds + dn + treds_disc + treds_fee + treds_gst, 2)
        received = float(s.received_amount or sum(float(r.received_amount or 0) for r in matched_recs))
        receivable = max(0.0, round(inv_amt - deduction - received, 2))

        pay_records = []
        for r in matched_recs:
            r_amt = float(r.received_amount or 0)
            if r_amt > 0:
                pay_records.append({
                    "date": r.received_date.strftime("%d-%m-%Y") if r.received_date else "",
                    "amount": _fmt_inr(r_amt),
                    "refNo": r.treds_receipt_number or r.indus_payment_receipt_number or "",
                    "receiptNo": r.indus_payment_receipt_number or r.voucher_number or "",
                })
        if not pay_records and received > 0:
            pay_records.append({
                "date": s.received_date.strftime("%d-%m-%Y") if s.received_date else "",
                "amount": _fmt_inr(received),
                "refNo": s.document_no or "",
                "receiptNo": s.voucher_number or "",
            })

        dn_remarks = next((r.dn_remarks for r in matched_recs if r.dn_remarks), "N/A")
        items.append({
            "id": f"acc-s-{s.sales_id}",
            "salesId": s.sales_id,
            "voucherNo": s.voucher_number or "",
            "customerName": s.customer_name or "",
            "invoiceNo": inv_no,
            "invoiceDate": _fmt_date_spaced(s.document_date),
            "invoiceAmount": _fmt_inr(inv_amt),
            "basicAmount": _fmt_inr(basic),
            "cgst": _fmt_inr(cgst),
            "sgst": _fmt_inr(sgst),
            "igst": _fmt_inr(igst),
            "deduction": _fmt_inr(deduction),
            "tds": _fmt_inr(tds),
            "dn": _fmt_inr(dn),
            "dnDetails": dn_remarks,
            "tredsDiscountAmount": _fmt_inr(treds_disc),
            "tredsProcessingFee": _fmt_inr(treds_fee),
            "tredsGst": _fmt_inr(treds_gst),
            "receivableAmount": _fmt_inr(receivable),
            "receivedAmount": _fmt_inr(received),
            "paymentRecords": pay_records,
        })
    return {"success": True, "count": len(items), "data": items}


@router.get("/module/purchase", summary="Accounts Icon -> Purchase page linked to nexus_accounts.purchase")
def list_accounts_module_purchase(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountPurchase)
        .order_by(AccountPurchase.invoice_date.desc().nullslast(), AccountPurchase.purchase_id.desc())
        .all()
    )
    items = []
    for p in rows:
        inv_amt = float(p.total_amount or 0)
        paid_amt = float(p.paid_amount or 0)
        payable_amt = float(p.payable_amount if p.payable_amount is not None else max(0.0, inv_amt - paid_amt))
        payments = []
        if paid_amt > 0:
            payments.append({
                "paymentDate": p.paid_date.strftime("%d-%m-%Y") if p.paid_date else "",
                "amount": _fmt_inr(paid_amt),
                "paymentRefNo": p.payment_reference_number or "",
                "receiptNumber": p.payment_receipt_number or "",
            })
        items.append({
            "id": f"acc-pur-{p.purchase_id}",
            "purchaseId": p.purchase_id,
            "voucherNo": p.voucher_number or "",
            "voucherDate": _fmt_date_spaced(p.voucher_date),
            "vendorName": p.vendor_name or "",
            "invoiceNo": p.invoice_number or "",
            "invoiceDate": _fmt_date_spaced(p.invoice_date),
            "invoiceAmount": _fmt_inr(inv_amt),
            "paidAmount": _fmt_inr(paid_amt),
            "payableAmount": _fmt_inr(payable_amt),
            "basicAmount": _fmt_inr(p.basic_amount or 0),
            "cgst": _fmt_inr(p.cgst or 0),
            "sgst": _fmt_inr(p.sgst or 0),
            "igst": _fmt_inr(p.igst or 0),
            "payments": payments,
        })
    return {"success": True, "count": len(items), "data": items}


@router.get("/module/payment", summary="Accounts Icon -> Payment page linked to nexus_accounts.payment")
def list_accounts_module_payment(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountPayment)
        .order_by(AccountPayment.paid_date.desc().nullslast(), AccountPayment.voucher_date.desc().nullslast(), AccountPayment.payment_id.desc())
        .all()
    )
    items = []
    for p in rows:
        req_amt = float(p.amount or 0)
        paid_amt = float(p.paid_amount or 0)
        payable_amt = max(0.0, round(req_amt - paid_amt, 2))
        pay_details_list = []
        if paid_amt > 0:
            pay_details_list.append({
                "paymentDate": p.paid_date.strftime("%d-%m-%Y") if p.paid_date else "",
                "amount": _fmt_inr(paid_amt),
                "paymentRefNo": p.payment_reference_number or "",
                "receiptNumber": p.payment_receipt_number or "",
            })
        items.append({
            "id": f"acc-pay-{p.payment_id}",
            "paymentId": p.payment_id,
            "transferredTo": p.transferred_to or "",
            "requestNo": p.voucher_number or p.po_no or f"PAY-{p.payment_id}",
            "invoiceNo": p.po_no or p.voucher_number or "",
            "expenseHead": p.account_head or p.expense_type or "",
            "transferredFrom": p.transferred_from or "",
            "requested": _fmt_inr(req_amt),
            "approved": _fmt_inr(req_amt),
            "transferred": _fmt_inr(paid_amt),
            "payable": _fmt_inr(payable_amt),
            "bankDetails": {
                "accountName": p.transferred_to or "",
                "accountNumber": p.account_number or "",
                "ifscCode": p.ifsc_code or "",
                "bankName": p.bank_name or "",
            },
            "paymentDetailsList": pay_details_list,
            "items": [
                {
                    "requestDate": p.request_date.strftime("%d-%m-%Y") if p.request_date else "",
                    "requestBy": p.request_by or "",
                    "expenseCategory": p.account_head or "",
                    "expenseName": p.expense_description or p.expense_type or "",
                    "uom": "Nos",
                    "qty": "1",
                    "rate": _fmt_inr(req_amt),
                    "gst": "0%",
                    "amount": _fmt_inr(req_amt),
                }
            ],
        })
    return {"success": True, "count": len(items), "data": items}


@router.get("/module/receipt", summary="Accounts Icon -> Receipt page linked to nexus_accounts.receipt_indus")
def list_accounts_module_receipt(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(ReceiptIndus)
        .order_by(ReceiptIndus.received_date.desc().nullslast(), ReceiptIndus.receipt_id.desc())
        .all()
    )
    items = []
    for r in rows:
        rec_date = r.received_date or r.indus_payment_receipt_date or r.treds_receipt_date
        amt = float(r.received_amount if r.received_amount is not None and float(r.received_amount) > 0 else (r.invoice_amount or 0))
        items.append({
            "id": f"rec-{r.receipt_id}",
            "receiptId": r.receipt_id,
            "receiptNo": r.indus_payment_receipt_number or r.voucher_number or f"REC-{r.receipt_id}",
            "date": _fmt_date_spaced(rec_date),
            "customerName": r.customer_name or "",
            "receivedBank": r.received_bank or "",
            "amount": _fmt_inr(amt),
            "particulars": f"Payment towards Invoice {r.invoice_no}" if r.invoice_no else (r.dn_remarks or "Payment towards Invoice"),
            "paymentRefNo": r.treds_receipt_number or r.indus_payment_receipt_number or "",
        })
    return {"success": True, "count": len(items), "data": items}


@router.get("/module/bank", summary="Accounts Icon -> Bank page linked to nexus_accounts.bank")
def list_accounts_module_bank(
    accounts_db: Session = Depends(get_accounts_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    rows = (
        accounts_db.query(AccountBank)
        .order_by(AccountBank.voucher_date.desc().nullslast(), AccountBank.bank_id.desc())
        .all()
    )
    items = []
    for b in rows:
        items.append({
            "id": f"bank-{b.bank_id}",
            "bankId": b.bank_id,
            "date": _fmt_date_spaced(b.voucher_date),
            "bankName": b.bank_name or "",
            "particulars": b.particulars or "",
            "refNo": b.reference_number or "",
            "withdrawal": _fmt_inr(b.withdrawal_dr or 0),
            "deposit": _fmt_inr(b.deposit_cr or 0),
            "balance": _fmt_inr(b.balance or 0),
        })
    return {"success": True, "count": len(items), "data": items}


@router.get("/module/tds", summary="Accounts Icon -> TDS page linked to sales, payment, and tds_payable tables")
def list_accounts_module_tds(
    accounts_db: Session = Depends(get_accounts_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    # Vendor TDS lookup map (cached)
    def _load_vendor_tds_map() -> Dict[str, Dict[str, Any]]:
        mapping: Dict[str, Dict[str, Any]] = {}
        try:
            for v_name, acc_name, pan_no, tds_code, tds_rate in master_db.query(
                VendorMaster.vendor_name,
                VendorMaster.account_name,
                VendorMaster.pan_number,
                VendorMaster.tds_code,
                VendorMaster.tds_rate,
            ).all():
                info = {
                    "panNumber": (pan_no or "").strip(),
                    "tdsCode": (tds_code or "").strip(),
                    "tdsRate": float(tds_rate) if tds_rate is not None else 0.0,
                }
                if v_name:
                    mapping[v_name.strip().lower()] = info
                if acc_name:
                    mapping.setdefault(acc_name.strip().lower(), info)
        except Exception:
            pass
        return mapping

    vendor_tds_map = reference_data_cache.get_or_set("master:vendor_tds_map", _load_vendor_tds_map, ttl=60.0)

    # Customer PAN lookup map
    cust_pan_map: Dict[str, str] = {}
    try:
        for c in master_db.query(Customer).all():
            pan_val = getattr(c, "pan_number", None) or ""
            if c.customer_name and pan_val:
                cust_pan_map[c.customer_name.strip().lower()] = pan_val.strip()
    except Exception:
        pass

    # 1. Sales rows -> TDS Receivable section (summation of tds_deduction column in sales table)
    sales_rows = (
        accounts_db.query(Sales)
        .options(
            load_only(
                Sales.sales_id,
                Sales.customer_name,
                Sales.document_date,
                Sales.basic_amount,
                Sales.total_amount,
                Sales.tds_deduction,
            )
        )
        .all()
    )

    # 2. Payment rows -> TDS Payable section (from payment table in accounts db)
    payment_rows = (
        accounts_db.query(AccountPayment)
        .options(
            load_only(
                AccountPayment.payment_id,
                AccountPayment.paid_date,
                AccountPayment.voucher_date,
                AccountPayment.request_date,
                AccountPayment.transferred_to,
                AccountPayment.expense_type,
                AccountPayment.account_head,
                AccountPayment.amount,
                AccountPayment.paid_amount,
            )
        )
        .all()
    )

    # 3. TDS Payable challan rows -> Paid Amount per (year, month)
    tds_paid_rows = accounts_db.query(AccountTdsPayable).all()
    paid_by_ym: Dict[tuple, float] = {}
    for tp in tds_paid_rows:
        if tp.year and tp.month:
            k = (int(tp.year), tp.month.strip().lower())
            paid_by_ym[k] = paid_by_ym.get(k, 0.0) + float(tp.tds_paid_amount or 0)

    # Group by (year, quarter, month_num)
    quarters: Dict[tuple, Dict[int, Dict[str, Any]]] = {}

    def _ensure_bucket(yr: int, mo: int) -> Dict[str, Any]:
        q_str = _quarter_from_month(mo)
        q_key = (yr, q_str)
        if q_key not in quarters:
            quarters[q_key] = {}
        if mo not in quarters[q_key]:
            quarters[q_key][mo] = {
                "year": yr,
                "quarter": q_str,
                "monthNum": mo,
                "month": date(yr, mo, 1).strftime("%B"),
                "taxableReceivable": 0.0,
                "tdsReceivable": 0.0,
                "taxablePayable": 0.0,
                "deductedPayable": 0.0,
                "paidPayable": 0.0,
            }
        return quarters[q_key][mo]

    tds_receivable_list = []
    for s in sales_rows:
        dt = s.document_date or date.today()
        bucket = _ensure_bucket(dt.year, dt.month)
        basic = float(s.basic_amount or s.total_amount or 0)
        tds_ded = float(s.tds_deduction or 0)
        bucket["taxableReceivable"] += basic
        bucket["tdsReceivable"] += tds_ded
        if tds_ded > 0 or basic > 0:
            rate_pct = round((tds_ded / basic) * 100.0, 2) if basic > 0 and tds_ded > 0 else 0.0
            tds_receivable_list.append({
                "id": f"tds-rec-{s.sales_id}",
                "paymentDate": _fmt_date_spaced(dt),
                "panName": s.customer_name or "",
                "panNumber": cust_pan_map.get((s.customer_name or "").strip().lower(), ""),
                "tdsCode": "TDS Receivable (Sales)",
                "taxableAmount": _fmt_inr(basic),
                "tdsRate": f"{rate_pct:g}%",
                "tdsAmount": _fmt_inr(tds_ded),
            })

    tds_payable_list = []
    for p in payment_rows:
        dt = p.paid_date or p.voucher_date or p.request_date or date.today()
        bucket = _ensure_bucket(dt.year, dt.month)
        taxable = float(p.paid_amount if p.paid_amount is not None and float(p.paid_amount) > 0 else (p.amount or 0))
        t_to = (p.transferred_to or "").strip()
        v_info = vendor_tds_map.get(t_to.lower(), {}) if t_to else {}
        rate_val = float(v_info.get("tdsRate") or 0.0)
        ded_amt = round(taxable * rate_val / 100.0, 2) if rate_val > 0 else 0.0
        bucket["taxablePayable"] += taxable
        bucket["deductedPayable"] += ded_amt
        if t_to:
            tds_payable_list.append({
                "id": f"tds-pay-sub-{p.payment_id}",
                "year": str(dt.year),
                "quarter": _quarter_from_month(dt.month),
                "panName": t_to,
                "panNumber": v_info.get("panNumber", ""),
                "tdsCode": v_info.get("tdsCode") or p.expense_type or p.account_head or "",
                "taxableAmount": _fmt_inr(taxable),
                "tdsRate": f"{rate_val:g}%",
                "deductedAmount": _fmt_inr(ded_amt),
                "paidAmount": _fmt_inr(paid_by_ym.get((dt.year, date(dt.year, dt.month, 1).strftime("%B").lower()), 0.0)),
            })

    # Also include any tds_payable challan months not yet in buckets
    for tp in tds_paid_rows:
        if tp.year and tp.month:
            try:
                m_num = datetime.strptime(tp.month.strip()[:3], "%b").month
                _ensure_bucket(int(tp.year), m_num)
            except ValueError:
                pass

    # Build final grouped quarterly TDS data
    tds_grouped = []
    for (yr, q_str) in sorted(quarters.keys(), key=lambda x: (x[0], x[1]), reverse=True):
        months_map = quarters[(yr, q_str)]
        q_tds_receivable_sum = sum(m["tdsReceivable"] for m in months_map.values())
        month_entries = []
        for m_num in sorted(months_map.keys()):
            m = months_map[m_num]
            paid_amt = paid_by_ym.get((yr, m["month"].lower()), 0.0)
            month_entries.append({
                "id": f"acc-tds-{yr}-{m_num}",
                "year": str(yr),
                "quarter": q_str,
                "month": m["month"],
                "taxableAmountReceivable": _fmt_inr(m["taxableReceivable"]),
                "tdsAmountReceivable": _fmt_inr(m["tdsReceivable"]),
                "taxableAmountPayable": _fmt_inr(m["taxablePayable"]),
                "deductedAmount": _fmt_inr(m["deductedPayable"]),
                "paidAmount": _fmt_inr(paid_amt),
                "items": [],
            })
        tds_grouped.append({
            "id": f"tds-{q_str.lower()}-{yr}",
            "year": str(yr),
            "quarter": q_str,
            "tdsReceivable": _fmt_inr(q_tds_receivable_sum),
            "tdsCreditAvailable": _fmt_inr(0.0),
            "months": month_entries,
        })

    return {
        "success": True,
        "data": tds_grouped,
        "tdsReceivable": tds_receivable_list,
        "tdsPayable": tds_payable_list,
    }


@router.get("/module/gst", summary="Accounts Icon -> GST page linked to nexus_accounts.gst_payment & monthly tax summaries")
def list_accounts_module_gst(
    accounts_db: Session = Depends(get_accounts_db),
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: AuthenticatedUser = Depends(get_current_user),
):
    gst_rows = (
        accounts_db.query(AccountGstPayment)
        .order_by(AccountGstPayment.year.desc().nullslast(), AccountGstPayment.gst_payment_id.desc())
        .all()
    )

    # Monthly sums from sales (GSTR-1A) and purchase (GSTR-2B)
    sales_by_ym: Dict[tuple, tuple] = {}
    for yr, mo, b, c, s, i in (
        accounts_db.query(
            extract("year", Sales.document_date),
            extract("month", Sales.document_date),
            func.coalesce(func.sum(Sales.basic_amount), 0),
            func.coalesce(func.sum(Sales.cgst), 0),
            func.coalesce(func.sum(Sales.sgst), 0),
            func.coalesce(func.sum(Sales.igst), 0),
        )
        .filter(Sales.document_date.isnot(None))
        .group_by(extract("year", Sales.document_date), extract("month", Sales.document_date))
        .all()
    ):
        sales_by_ym[(int(yr), int(mo))] = (float(b or 0), float(c or 0), float(s or 0), float(i or 0))

    purch_dt = func.coalesce(AccountPurchase.invoice_date, AccountPurchase.voucher_date)
    purch_by_ym: Dict[tuple, tuple] = {}
    for yr, mo, b, c, s, i in (
        accounts_db.query(
            extract("year", purch_dt),
            extract("month", purch_dt),
            func.coalesce(func.sum(AccountPurchase.basic_amount), 0),
            func.coalesce(func.sum(AccountPurchase.cgst), 0),
            func.coalesce(func.sum(AccountPurchase.sgst), 0),
            func.coalesce(func.sum(AccountPurchase.igst), 0),
        )
        .filter(purch_dt.isnot(None))
        .group_by(extract("year", purch_dt), extract("month", purch_dt))
        .all()
    ):
        purch_by_ym[(int(yr), int(mo))] = (float(b or 0), float(c or 0), float(s or 0), float(i or 0))

    # RCM lookup
    rcm_rate_by_key: Dict[str, float] = {}
    for cat, name, rate in master_db.query(
        CompanyExpense.expense_category, CompanyExpense.expense_name, CompanyExpense.gst_rate
    ).filter(CompanyExpense.rcm.is_(True)).all():
        rv = float(rate) if rate is not None else 0.0
        for tok in (cat, name):
            if tok and tok.strip():
                rcm_rate_by_key[tok.strip().lower()] = rv

    rcm_by_ym: Dict[tuple, List[float]] = {}
    if rcm_rate_by_key:
        for exp in project_db.query(ProjectExpense).filter(ProjectExpense.request_date.isnot(None)).all():
            cands = [(exp.expense_type or "").strip().lower(), (exp.expense_name or "").strip().lower()]
            m_rate = next((rcm_rate_by_key[c] for c in cands if c in rcm_rate_by_key), None)
            if m_rate is None:
                continue
            ym = (exp.request_date.year, exp.request_date.month)
            acc = rcm_by_ym.setdefault(ym, [0.0, 0.0, 0.0, 0.0])
            base_amt = float(exp.approved_amount if exp.approved_amount is not None and float(exp.approved_amount) > 0 else (exp.amount or 0))
            gst_amt = float(exp.gst_amount) if exp.gst_amount is not None else round(base_amt * m_rate / 100.0, 2)
            acc[0] += base_amt
            if "IGST" in (exp.gst_type or "").upper():
                acc[3] += gst_amt
            else:
                half = round(gst_amt / 2.0, 2)
                acc[1] += half
                acc[2] += round(gst_amt - half, 2)

    items = []
    for gp in gst_rows:
        yr = int(gp.year or date.today().year)
        m_str = (gp.month or "").strip()
        m_num = None
        if m_str:
            try:
                m_num = datetime.strptime(m_str[:3], "%b").month
            except ValueError:
                m_num = None
        ym = (yr, m_num) if m_num else None
        g1 = sales_by_ym.get(ym, (0.0, 0.0, 0.0, 0.0)) if ym else (0.0, 0.0, 0.0, 0.0)
        g2 = purch_by_ym.get(ym, (0.0, 0.0, 0.0, 0.0)) if ym else (0.0, 0.0, 0.0, 0.0)
        rcm = rcm_by_ym.get(ym, [0.0, 0.0, 0.0, 0.0]) if ym else [0.0, 0.0, 0.0, 0.0]

        items.append({
            "id": f"gst-{gp.gst_payment_id}",
            "gstPaymentId": gp.gst_payment_id,
            "year": yr,
            "month": m_str or (date(yr, m_num, 1).strftime("%B") if m_num else ""),
            "gstr1aBasic": _fmt_inr(g1[0]),
            "gstr1aCgst": _fmt_inr(g1[1]),
            "gstr1aSgst": _fmt_inr(g1[2]),
            "gstr1aIgst": _fmt_inr(g1[3]),
            "gstr2bBasic": _fmt_inr(g2[0]),
            "gstr2bCgst": _fmt_inr(g2[1]),
            "gstr2bSgst": _fmt_inr(g2[2]),
            "gstr2bIgst": _fmt_inr(g2[3]),
            "rcmBasic": _fmt_inr(rcm[0]),
            "rcmCgst": _fmt_inr(rcm[1]),
            "rcmSgst": _fmt_inr(rcm[2]),
            "rcmIgst": _fmt_inr(rcm[3]),
            "cgstPayable": _fmt_inr(gp.cgst_payable or 0),
            "sgstPayable": _fmt_inr(gp.sgst_payable or 0),
            "igstPayable": _fmt_inr(gp.igst_payable or 0),
            "totalPayable": _fmt_inr(gp.total_amount or 0),
            "fillingStatus": gp.filling_status or "Pending",
        })

    return {"success": True, "count": len(items), "data": items}
