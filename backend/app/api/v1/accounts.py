from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, defer, load_only

from app.core.cache import reference_data_cache
from app.core.security import AuthenticatedUser, get_current_user
from app.db.session import get_accounts_db, get_db, get_project_db
from app.models.account_bank import AccountBank
from app.models.account_purchase import AccountPurchase
from app.models.commercial_project import ProjectExpense
from app.models.commercial_sales import ReceiptIndus, Sales
from app.models.customer import Customer
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
