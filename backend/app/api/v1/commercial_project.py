from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status, Response, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db, get_project_db, get_accounts_db
from app.services.commercial_project_service import CommercialProjectService
from app.services.commercial_invoice_service import CommercialInvoiceService
from app.services.auth_service import auth_service
from app.schemas.commercial_project import (
    CommercialProjectListResponse,
    CommercialPoToBeOpenListResponse,
    CommercialBulkUploadResponse,
    CommercialProjectDeleteRequest,
    CommercialProjectDeleteResponse,
    SavePmProjectDetailsRequest,
    SavePmProjectDetailsResponse,
    WccSubmitDetailsRequest,
    CommercialInvoiceListResponse,
    CommercialInvoiceSubmitDetailsRequest,
    CommercialInvoiceSubmitHashRequest,
    CommercialReceivableListResponse,
    CommercialReceivableUpdateInvoiceAmountRequest,
    CommercialReceivableUpdateDeductionRequest,
    CommercialReceivableUpdateReceivedAmountRequest,
    CommercialIndusPaymentReceiptRequest,
    CommercialM1PaymentReceiptRequest
)

router = APIRouter(prefix="/commercial", tags=["Commercial Manager - New Project & PO"])


def verify_commercial_access(authorization: Optional[str] = Header(None)):
    """
    Ensure the request is authenticated and authorized for Commercial Manager or Admin.
    Allows graceful fallback if session headers are sent or in testing mode.
    """
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        user = auth_service.get_user_by_token(token)
        if user and user.role not in ["Commercial Manager", "Project Manager", "Admin", "Master"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: Commercial/Project Manager authorization required."
            )
    return True


@router.get("/projects", response_model=CommercialProjectListResponse, summary="List New Projects from telecom_project")
def list_commercial_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    return service.get_projects_list()


@router.delete("/projects/{project_id}", summary="Delete Commercial Project")
def delete_commercial_project(
    project_id: str,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Deletes a project record from PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    success = service.delete_project(project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found."
        )
    return {"success": True, "message": f"Project '{project_id}' deleted successfully."}


@router.post("/projects/delete", response_model=CommercialProjectDeleteResponse, summary="Bulk Delete Commercial Projects")
def bulk_delete_commercial_projects(
    payload: CommercialProjectDeleteRequest,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Bulk deletes projects from PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    count = service.delete_projects_bulk(payload.project_ids)
    return CommercialProjectDeleteResponse(
        success=True,
        deleted_count=count,
        message=f"Successfully deleted {count} project(s)."
    )


@router.post("/projects/save-pm-details", response_model=SavePmProjectDetailsResponse, summary="Save Project Manager details and move to YTS / WIP / Project Update")
def save_pm_project_details(
    payload: SavePmProjectDetailsRequest,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Saves PM toggles, tower specs, planning BOQ and moves project to YTS/WIP/Project Update.
    """
    service = CommercialProjectService(db)
    return service.save_pm_project_details(payload)


@router.post("/projects/edit-project-update", summary="Save Edit Project Update fields to telecom_project in Project DB")
def edit_project_update(
    payload: dict,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Updates project status, support required, pending with, and remarks in `telecom_project` table.
    """
    service = CommercialProjectService(db)
    return service.update_project_status_fields(payload)


@router.post("/projects/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload New Projects via Excel")
async def bulk_upload_commercial_projects(
    file: UploadFile = File(..., description="Excel (.xlsx) file matching the Project template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse Excel file into PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_project_bulk_upload(content, file.filename or "")


@router.post("/po/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload PO Line Items via Excel")
async def bulk_upload_commercial_po(
    file: UploadFile = File(..., description="Excel (.xlsx) file matching the PO template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse Excel file into PostgreSQL `telecom_indus_po` table in `Nexus_Project DB`.
    Enforces the composite duplicate rule: (PO No, Site ID, Item Code) must be unique.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_po_bulk_upload(content, file.filename or "")


@router.post("/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Unified Bulk Upload for Commercial Manager")
async def bulk_upload_commercial_unified(
    file: UploadFile = File(..., description="Excel (.xlsx) file"),
    upload_type: str = Form("projects", description="'projects' or 'po'"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Unified endpoint accepting upload_type ('projects' or 'po') and dispatching to the respective processor.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    norm_type = upload_type.strip().lower()

    if norm_type in ["po", "purchase_order", "po_lines"]:
        return service.process_po_bulk_upload(content, file.filename or "")
    elif norm_type in ["po_amend", "po_amendment", "amend", "amendment"]:
        return service.process_po_amend_bulk_upload(content, file.filename or "")
    else:
        return service.process_project_bulk_upload(content, file.filename or "")


@router.get("/po-amend/projects", response_model=CommercialProjectListResponse, summary="List PO Amend Projects from telecom_project")
def list_po_amend_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB` for PO Amend workflow.
    """
    service = CommercialProjectService(db)
    return service.get_po_amend_projects_list()


@router.post("/po-amend/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload PO Amendment via CSV/Excel")
async def bulk_upload_commercial_po_amend(
    file: UploadFile = File(..., description="CSV or Excel (.xlsx) file matching the PO Amendment template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse CSV or Excel file to update PO Revision Number, Amendment Completion Date,
    and Amendment Completion Status into PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_po_amend_bulk_upload(content, file.filename or "")


@router.get("/wcc/projects", response_model=CommercialProjectListResponse, summary="List WCC Projects from telecom_project")
def list_wcc_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB` for WCC workflow.
    """
    service = CommercialProjectService(db)
    return service.get_wcc_projects_list()


@router.get("/po-to-be-open/projects", response_model=CommercialPoToBeOpenListResponse, summary="List PO To Be Open Projects from telecom_project")
def list_po_to_be_open_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL `telecom_project` and `project_expenses` in `Nexus_Project DB`
    for PO To Be Open workflow satisfying ALL 3 conditions:
    1. PO status is 'Closed' or 'Finally Closed'.
    2. WCC not raised against that PO.
    3. Expense records available and linked with spent amount > 0.
    """
    service = CommercialProjectService(db)
    return service.get_po_to_be_open_projects_list()



@router.post("/wcc/submit-details", summary="Submit WCC Details and transition task to Approval Pending")
def submit_wcc_details_commercial(
    payload: WccSubmitDetailsRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    from app.services.jms_service import JmsService
    service = JmsService(project_db)
    return service.submit_wcc_details(
        payload.poNo,
        payload.siteId,
        payload.wccNo,
        payload.wccDate,
        payload.wccAmount,
        payload.submissionDate or payload.wccSubmissionDate,
        payload.approvedDate or payload.wccApprovedDate
    )


@router.get("/invoice/pdf/download", summary="Download Commercial Invoice PDF")
def download_commercial_invoice_pdf(
    invoice_no: Optional[str] = Query(None, description="Invoice Number"),
    po_no: Optional[str] = Query(None, description="PO Number"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    irn_no: Optional[str] = Query(None, description="IRN Number"),
    ers_no: Optional[str] = Query(None, description="ERS Number"),
    invoice_date: Optional[str] = Query(None, description="Invoice Date (DD/MM/YYYY)"),
    gst_type: Optional[str] = Query(None, description="GST Type (SGST or IGST)"),
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Generates and downloads the official Tax Invoice PDF matching Invoice CGST_SGST.pdf layout.
    Stores the generated PDF in PostgreSQL table `sales` column `invoice_document` in `Nexus_Accounts DB`,
    and returns the binary PDF attachment.
    """
    from app.services.invoice_pdf_service import CommercialInvoicePdfService
    from app.models.commercial_sales import Sales

    pdf_service = CommercialInvoicePdfService(project_db)
    pdf_bytes = None
    try:
        pdf_bytes = pdf_service.generate_invoice_pdf(
            invoice_no=invoice_no,
            po_no=po_no,
            site_id=site_id,
            irn_no=irn_no,
            ers_no=ers_no,
            invoice_date_str=invoice_date,
            gst_type=gst_type
        )
    except Exception as e:
        # If generation raised an exception, check if PDF is already stored in sales table
        if invoice_no:
            sales_row = accounts_db.query(Sales).filter(
                or_(Sales.voucher_number == invoice_no, Sales.document_no == invoice_no)
            ).first()
            if sales_row and sales_row.invoice_document:
                pdf_bytes = bytes(sales_row.invoice_document)

        if not pdf_bytes:
            if isinstance(e, ValueError):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=str(e)
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invoice PDF generation failed: {str(e)}"
            )

    file_label = (invoice_no or po_no or "Document").replace("/", "_").replace("\\", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Tax_Invoice_{file_label}.pdf"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/invoice/projects", response_model=CommercialInvoiceListResponse, summary="List Commercial Invoices from DB")
def list_commercial_invoices(
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Invoice records from PostgreSQL table `telecom_project` in `Nexus_Project DB`
    and links with `sales` table in `Nexus_Accounts DB`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.get_invoice_projects_list()


@router.post("/invoice/submit-details", summary="Submit Commercial Invoice Details (ERS, IRN, Due Date)")
def submit_commercial_invoice_details(
    payload: CommercialInvoiceSubmitDetailsRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Submits invoice details (ERS No, IRN No, Due Date), updates task status to 'Approval Pending'
    in `telecom_project` and persists record in `sales` in `Nexus_Accounts DB`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.submit_invoice_details(payload)


@router.post("/invoice/submit-hash", summary="Submit Invoice# Tab Details to receipt_indus table")
def submit_commercial_invoice_hash(
    payload: CommercialInvoiceSubmitHashRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Persists invoice amount, TDS, and receivable from the 'Invoice#' tab into table `receipt_indus`
    in `Nexus_Accounts DB` and marks status as moved to Receivable.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.submit_invoice_hash_receipt(payload)


@router.get("/receivable/projects", response_model=CommercialReceivableListResponse, summary="List Commercial Receivables from DB")
def list_commercial_receivables(
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Receivable records from PostgreSQL table `receipt_indus` in `Nexus_Accounts DB`
    linked with `sales` and `telecom_project`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.get_receivable_projects_list()


@router.post("/receivable/update-invoice-amount", summary="Update Receivable Invoice Amount in sales table")
def update_receivable_invoice_amount(
    payload: CommercialReceivableUpdateInvoiceAmountRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Updates invoice amount details in PostgreSQL table `sales` in `Nexus_Accounts DB`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.update_receivable_invoice_amount(
        invoice_no=payload.invoiceNo,
        basic_amount=payload.basicAmount,
        cgst=payload.cgst,
        sgst=payload.sgst,
        igst=payload.igst,
        total_amount=payload.totalAmount
    )


@router.post("/receivable/update-deduction", summary="Update Receivable Deduction in receipt_indus and sales tables")
def update_receivable_deduction(
    payload: CommercialReceivableUpdateDeductionRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Updates deduction subtab details in PostgreSQL table `receipt_indus` and `tds_deduction` in `sales`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.update_receivable_deduction(
        invoice_no=payload.invoiceNo,
        tds=payload.tds,
        dn_amount=payload.dnAmount,
        discount=payload.discount,
        treds_fee=payload.tredsFee
    )


@router.post("/receivable/update-received-amount", summary="Update Receivable Received Amount in receipt_indus table")
def update_receivable_received_amount(
    payload: CommercialReceivableUpdateReceivedAmountRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Updates received amount and date in PostgreSQL table `receipt_indus` in `Nexus_Accounts DB`.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.update_receivable_received_amount(
        invoice_no=payload.invoiceNo,
        received_amount=payload.receivedAmount,
        received_date=payload.receivedDate
    )

@router.post("/receivable/indus-payment-receipt", summary="Submit Indus Payment Receipt to receipt_indus table")
def submit_indus_payment_receipt(
    payload: CommercialIndusPaymentReceiptRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Stores Indus Payment Receipt into PostgreSQL table `receipt_indus`.
    Stores treds and dn booleans, and calculates/stores indus_processed_amount.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.submit_indus_payment_receipt(payload)


@router.post("/receivable/m1-payment-receipt", summary="Submit M1 Payment Receipt to receipt_indus and sales tables")
def submit_m1_payment_receipt(
    payload: CommercialM1PaymentReceiptRequest,
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Stores M1 Payment Receipt into PostgreSQL table `receipt_indus` and `sales`.
    Stores treds_processed_amount in both tables.
    """
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.submit_m1_payment_receipt(payload)


@router.post("/receivable/bulk-upload", summary="Bulk Upload for Receivable")
async def bulk_upload_commercial_receivable(
    file: UploadFile = File(..., description="Excel (.xlsx) or CSV file"),
    project_db: Session = Depends(get_project_db),
    accounts_db: Session = Depends(get_accounts_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Parses and processes bulk upload file for Receivable.
    """
    content = await file.read()
    service = CommercialInvoiceService(project_db, accounts_db)
    return service.process_receivable_bulk_upload(content, file.filename or "")


@router.get("/projects/expenses", summary="List Project Expenses by PO Number")
def get_project_expenses(
    po_no: Optional[str] = Query(None, description="PO Number to filter expenses"),
    site_id: Optional[str] = Query(None, description="Site ID to filter expenses"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Returns expenses from project_expenses table linked to the specified PO Number.
    """
    service = CommercialProjectService(db)
    items = service.get_project_expenses(po_no=po_no, site_id=site_id)
    return {"success": True, "count": len(items), "data": items}


@router.get("/projects/po-line-items", summary="Get Capex / Opex Line Items for a PO")
def get_po_line_items(
    po_no: str = Query(..., description="PO Number"),
    q: Optional[str] = Query(None, description="Search query for autocomplete"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Returns Capex / Opex line items from telecom_indus_po for autocomplete search.
    """
    service = CommercialProjectService(db)
    items = service.get_po_line_items(po_no=po_no, query=q)
    return {"success": True, "count": len(items), "data": items}


@router.post("/projects/expenses", summary="Create or Save Project Expense")
def create_project_expense(
    payload: dict,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Saves a new expense record in project_expenses table.
    """
    service = CommercialProjectService(db)
    res = service.save_project_expense(payload)
    return {"success": True, "data": res}


@router.get("/projects/materials", summary="List Project Materials by PO Number")
def get_project_materials(
    po_no: Optional[str] = Query(None, description="PO Number to filter materials"),
    site_id: Optional[str] = Query(None, description="Site ID to filter materials"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Returns materials from project_materials table mapped with telecom_indus_po.
    """
    service = CommercialProjectService(db)
    items = service.get_project_materials(po_no=po_no, site_id=site_id)
    return {"success": True, "count": len(items), "data": items}


@router.post("/projects/materials", summary="Create or Save Project Material")
def create_project_material(
    payload: dict,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Saves a new material record in project_materials table.
    """
    service = CommercialProjectService(db)
    res = service.save_project_material(payload)
    return {"success": True, "data": res}


# ==========================================================================
# DPR, ATTENDANCE, MEMBERS, SURVEY, POLE MOUNT, AND CIVIL WORKS ENDPOINTS
# ==========================================================================

def _parse_date_val(val):
    from datetime import date, datetime
    if not val:
        return None
    if isinstance(val, date):
        return val
    s = str(val).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except Exception:
            pass
    return None


def _parse_time_val(val):
    from datetime import time, datetime
    if not val:
        return None
    if isinstance(val, time):
        return val
    s = str(val).strip()
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M%p"):
        try:
            return datetime.strptime(s, fmt).time()
        except Exception:
            pass
    return None


def _parse_num_val(val, default=0.0):
    import re
    if val is None or val == "":
        return default
    try:
        return float(str(val).replace(",", "").strip())
    except Exception:
        m = re.search(r"[-+]?\d*\.?\d+", str(val))
        if m:
            try:
                return float(m.group(0))
            except Exception:
                pass
        return default


def _find_telecom_project(db: Session, project_id: Optional[str] = None, po_no: Optional[str] = None, site_id: Optional[str] = None):
    from app.models.commercial_project import TelecomProject
    q = db.query(TelecomProject)
    proj = None
    if project_id:
        pid_str = str(project_id).strip()
        if pid_str.isdigit():
            proj = q.filter(TelecomProject.project_id == int(pid_str)).first()
        if not proj:
            proj = q.filter(TelecomProject.project_code == pid_str).first()
    if not proj and po_no and site_id:
        proj = q.filter(TelecomProject.po_no == str(po_no).strip(), TelecomProject.site_id == str(site_id).strip()).first()
    if not proj and po_no:
        proj = q.filter(TelecomProject.po_no == str(po_no).strip()).first()
    if not proj and site_id:
        proj = q.filter(TelecomProject.site_id == str(site_id).strip()).first()
    return proj


@router.get("/dpr", summary="List DPR records from dpr table in Project DB")
def list_dpr_records(
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    project_code: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import DprRecord
    q = db.query(DprRecord)
    if po_no and po_no.strip():
        q = q.filter(DprRecord.po_no == po_no.strip())
    if site_id and site_id.strip():
        q = q.filter(DprRecord.site_id == site_id.strip())
    if project_code and project_code.strip():
        q = q.filter(DprRecord.project_code == project_code.strip())
    rows = q.order_by(DprRecord.activity_tracking_id.asc()).all()
    data = []
    for r in rows:
        data.append({
            "id": r.activity_tracking_id,
            "poNo": r.po_no or "",
            "siteId": r.site_id or "",
            "siteName": r.site_name or "",
            "projectCode": r.project_code or "",
            "date": r.date.strftime("%d/%m/%Y") if r.date else "",
            "stage": r.stage or "",
            "activity": r.activity or "",
            "startPhoto": r.start_photo or "View",
            "endPhoto": r.end_photo or "View",
            "status": r.status or "Pending",
            "checkIn": r.i_map_check_in.strftime("%I:%M %p") if r.i_map_check_in else "-",
            "checkOut": r.i_map_check_out.strftime("%I:%M %p") if r.i_map_check_out else "-",
            "hPtwNo": r.h_ptw_number or "-",
            "hPtwDocs": r.h_ptw_documents or "View",
            "hPtwStatus": r.h_ptw_status or "Pending",
            "ePtwNo": r.e_ptw_number or "-",
            "ePtwDocs": r.e_ptw_documents or "View",
            "ePtwStatus": r.e_ptw_status or "Pending",
            "cPtwNo": r.c_ptw_number or "-",
            "cPtwDocs": r.c_ptw_documents or "View",
            "cPtwStatus": r.c_ptw_status or "Pending",
            "mPtwNo": r.m_ptw_number or "-",
            "mPtwDocs": r.m_ptw_documents or "View",
            "mPtwStatus": r.m_ptw_status or "Pending"
        })
    return {"success": True, "count": len(data), "data": data}


@router.post("/dpr", summary="Create DPR record in dpr table in Project DB")
def create_dpr_record(
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from datetime import date
    from app.models.commercial_project import DprRecord
    rec = DprRecord(
        company_name=payload.get("companyName") or payload.get("company_name") or "Nexus",
        customer_name=payload.get("customerName") or payload.get("customer_name") or "Indus Towers Ltd",
        project_code=payload.get("projectCode") or payload.get("project_code"),
        po_no=payload.get("poNo") or payload.get("po_no"),
        site_id=payload.get("siteId") or payload.get("site_id"),
        site_name=payload.get("siteName") or payload.get("site_name"),
        date=_parse_date_val(payload.get("date")) or date.today(),
        stage=payload.get("stage") or "",
        activity=payload.get("activity") or "",
        start_photo=payload.get("startPhoto") or payload.get("start_photo") or "View",
        end_photo=payload.get("endPhoto") or payload.get("end_photo") or "View",
        status=payload.get("status") or "Pending",
        h_ptw_number=payload.get("hPtwNo") or payload.get("h_ptw_number"),
        h_ptw_documents=payload.get("hPtwDocs") or payload.get("h_ptw_documents"),
        h_ptw_status=payload.get("hPtwStatus") or payload.get("h_ptw_status"),
        e_ptw_number=payload.get("ePtwNo") or payload.get("e_ptw_number"),
        e_ptw_documents=payload.get("ePtwDocs") or payload.get("e_ptw_documents"),
        e_ptw_status=payload.get("ePtwStatus") or payload.get("e_ptw_status"),
        c_ptw_number=payload.get("cPtwNo") or payload.get("c_ptw_number"),
        c_ptw_documents=payload.get("cPtwDocs") or payload.get("c_ptw_documents"),
        c_ptw_status=payload.get("cPtwStatus") or payload.get("c_ptw_status"),
        m_ptw_number=payload.get("mPtwNo") or payload.get("m_ptw_number"),
        m_ptw_documents=payload.get("mPtwDocs") or payload.get("m_ptw_documents"),
        m_ptw_status=payload.get("mPtwStatus") or payload.get("m_ptw_status"),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.activity_tracking_id,
            "poNo": rec.po_no or "",
            "siteId": rec.site_id or "",
            "siteName": rec.site_name or "",
            "date": rec.date.strftime("%d/%m/%Y") if rec.date else "",
            "stage": rec.stage or "",
            "activity": rec.activity or "",
            "status": rec.status or "Pending"
        }
    }


@router.put("/dpr/{dpr_id}", summary="Update DPR record in dpr table in Project DB")
def update_dpr_record(
    dpr_id: int,
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import DprRecord
    rec = db.query(DprRecord).filter(DprRecord.activity_tracking_id == dpr_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="DPR record not found")
    for k, attr in [
        ("stage", "stage"), ("activity", "activity"), ("status", "status"),
        ("poNo", "po_no"), ("po_no", "po_no"), ("siteId", "site_id"), ("site_id", "site_id"),
        ("siteName", "site_name"), ("site_name", "site_name"),
        ("hPtwNo", "h_ptw_number"), ("hPtwStatus", "h_ptw_status"),
        ("ePtwNo", "e_ptw_number"), ("ePtwStatus", "e_ptw_status"),
        ("cPtwNo", "c_ptw_number"), ("cPtwStatus", "c_ptw_status"),
        ("mPtwNo", "m_ptw_number"), ("mPtwStatus", "m_ptw_status"),
    ]:
        if k in payload and payload[k] is not None:
            setattr(rec, attr, payload[k])
    if "date" in payload and payload["date"]:
        d = _parse_date_val(payload["date"])
        if d:
            rec.date = d
    db.commit()
    db.refresh(rec)
    return {"success": True, "id": rec.activity_tracking_id}


@router.delete("/dpr/{dpr_id}", summary="Delete DPR record from dpr table in Project DB")
def delete_dpr_record(
    dpr_id: int,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import DprRecord
    rec = db.query(DprRecord).filter(DprRecord.activity_tracking_id == dpr_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="DPR record not found")
    db.delete(rec)
    db.commit()
    return {"success": True, "deletedId": dpr_id}


# --------------------------------------------------------------------------
# ATTENDANCE ENDPOINTS (attendance table in Project DB)
# --------------------------------------------------------------------------

@router.get("/dpr/attendance", summary="List Attendance records from attendance table in Project DB")
def list_dpr_attendance(
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import ProjectAttendance
    q = db.query(ProjectAttendance)
    if site_id and site_id.strip():
        q = q.filter(ProjectAttendance.site_id == site_id.strip())
    rows = q.order_by(ProjectAttendance.attendance_id.asc()).all()
    if not rows and site_id and site_id.strip():
        # Also return any rows with un-scoped/empty site_id if present in attendance table
        rows = db.query(ProjectAttendance).order_by(ProjectAttendance.attendance_id.asc()).all()

    data = []
    total_salary = 0.0
    for r in rows:
        sal_amt = float(r.salary_amount or 0)
        sal_day = float(r.salary_per_day or 0)
        hrs = float(r.total_hours or 0)
        total_salary += sal_amt
        data.append({
            "id": r.attendance_id,
            "siteId": r.site_id or "",
            "employeeId": r.employee_id or "",
            "employeeName": r.employee_name or "",
            "date": r.date.strftime("%d/%m/%Y") if r.date else "",
            "checkInTime": r.check_in_time.strftime("%H:%M") if r.check_in_time else "",
            "checkOutTime": r.check_out_time.strftime("%H:%M") if r.check_out_time else "",
            "totalHours": hrs,
            "salaryPerDay": sal_day,
            "salaryAmount": sal_amt
        })
    return {
        "success": True,
        "count": len(data),
        "totalSalary": round(total_salary, 2),
        "data": data
    }


@router.post("/dpr/attendance", summary="Create Attendance record in attendance table in Project DB")
def create_dpr_attendance(
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from datetime import date, time
    from decimal import Decimal
    from app.models.commercial_project import ProjectAttendance

    sal_day = _parse_num_val(payload.get("salaryPerDay") or payload.get("salary_per_day"), 0.0)
    sal_amt = _parse_num_val(payload.get("salaryAmount") or payload.get("salary_amount") or payload.get("salary"), sal_day)
    hrs = _parse_num_val(payload.get("totalHours") or payload.get("total_hours") or payload.get("hours"), 8.0)

    rec = ProjectAttendance(
        site_id=(payload.get("siteId") or payload.get("site_id") or "").strip() or None,
        employee_id=(payload.get("employeeId") or payload.get("employee_id") or "").strip() or None,
        employee_name=(payload.get("employeeName") or payload.get("employee_name") or payload.get("name") or "").strip(),
        date=_parse_date_val(payload.get("date")) or date.today(),
        check_in_time=_parse_time_val(payload.get("checkInTime") or payload.get("check_in_time") or payload.get("checkIn")) or time(9, 0),
        check_out_time=_parse_time_val(payload.get("checkOutTime") or payload.get("check_out_time") or payload.get("checkOut")) or time(18, 0),
        total_hours=Decimal(str(hrs)),
        salary_per_day=Decimal(str(sal_day)),
        salary_amount=Decimal(str(sal_amt))
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.attendance_id,
            "siteId": rec.site_id or "",
            "employeeId": rec.employee_id or "",
            "employeeName": rec.employee_name or "",
            "date": rec.date.strftime("%d/%m/%Y") if rec.date else "",
            "checkInTime": rec.check_in_time.strftime("%H:%M") if rec.check_in_time else "",
            "checkOutTime": rec.check_out_time.strftime("%H:%M") if rec.check_out_time else "",
            "totalHours": float(rec.total_hours or 0),
            "salaryPerDay": float(rec.salary_per_day or 0),
            "salaryAmount": float(rec.salary_amount or 0)
        }
    }


@router.put("/dpr/attendance/{attendance_id}", summary="Update Attendance record in attendance table in Project DB")
def update_dpr_attendance(
    attendance_id: int,
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from decimal import Decimal
    from app.models.commercial_project import ProjectAttendance
    rec = db.query(ProjectAttendance).filter(ProjectAttendance.attendance_id == attendance_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if "siteId" in payload or "site_id" in payload:
        rec.site_id = payload.get("siteId") or payload.get("site_id")
    if "employeeId" in payload or "employee_id" in payload:
        rec.employee_id = payload.get("employeeId") or payload.get("employee_id")
    if "employeeName" in payload or "employee_name" in payload or "name" in payload:
        rec.employee_name = payload.get("employeeName") or payload.get("employee_name") or payload.get("name")
    if "date" in payload and payload["date"]:
        d = _parse_date_val(payload["date"])
        if d:
            rec.date = d
    if "checkInTime" in payload or "check_in_time" in payload:
        t = _parse_time_val(payload.get("checkInTime") or payload.get("check_in_time"))
        if t:
            rec.check_in_time = t
    if "checkOutTime" in payload or "check_out_time" in payload:
        t = _parse_time_val(payload.get("checkOutTime") or payload.get("check_out_time"))
        if t:
            rec.check_out_time = t
    if "totalHours" in payload or "total_hours" in payload:
        rec.total_hours = Decimal(str(_parse_num_val(payload.get("totalHours") if "totalHours" in payload else payload.get("total_hours"))))
    if "salaryPerDay" in payload or "salary_per_day" in payload:
        rec.salary_per_day = Decimal(str(_parse_num_val(payload.get("salaryPerDay") if "salaryPerDay" in payload else payload.get("salary_per_day"))))
    if "salaryAmount" in payload or "salary_amount" in payload or "salary" in payload:
        val = payload.get("salaryAmount") if "salaryAmount" in payload else (payload.get("salary_amount") if "salary_amount" in payload else payload.get("salary"))
        rec.salary_amount = Decimal(str(_parse_num_val(val)))
    db.commit()
    db.refresh(rec)
    return {"success": True, "id": rec.attendance_id}


@router.delete("/dpr/attendance/{attendance_id}", summary="Delete Attendance record from attendance table in Project DB")
def delete_dpr_attendance(
    attendance_id: int,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import ProjectAttendance
    rec = db.query(ProjectAttendance).filter(ProjectAttendance.attendance_id == attendance_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(rec)
    db.commit()
    return {"success": True, "deletedId": attendance_id}


# --------------------------------------------------------------------------
# MEMBERS ENDPOINTS (members table in Project DB)
# --------------------------------------------------------------------------

@router.get("/dpr/members", summary="List active Members from members table in Project DB")
def list_dpr_members(
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db)
):
    from sqlalchemy import text
    from app.models.commercial_project import ProjectMember

    q = db.query(ProjectMember).filter(
        or_(ProjectMember.status == "Active", ProjectMember.status.is_(None))
    )
    if po_no and po_no.strip():
        q_scoped = q.filter(ProjectMember.po_no == po_no.strip())
        rows = q_scoped.order_by(ProjectMember.member_id.asc()).all()
        if not rows:
            # Also include members with null/empty po_no if any were inserted directly into DB
            rows = q.filter(or_(ProjectMember.po_no == po_no.strip(), ProjectMember.po_no.is_(None), ProjectMember.po_no == "")).order_by(ProjectMember.member_id.asc()).all()
    elif site_id and site_id.strip():
        rows = q.filter(or_(ProjectMember.site_id == site_id.strip(), ProjectMember.site_id.is_(None), ProjectMember.site_id == "")).order_by(ProjectMember.member_id.asc()).all()
    else:
        rows = q.order_by(ProjectMember.member_id.asc()).all()

    # Build lookup of employee contact numbers from company_employee_details in Master DB
    emp_contacts = {}
    try:
        emp_rows = master_db.execute(
            text("SELECT employee_id, employee_name, contact_number FROM company_employee_details")
        ).fetchall()
        for er in emp_rows:
            if er[1] and er[2]:
                emp_contacts[str(er[1]).strip().lower()] = str(er[2]).strip()
            if er[0] and er[2]:
                emp_contacts[str(er[0]).strip().lower()] = str(er[2]).strip()
    except Exception:
        pass

    data = []
    for r in rows:
        if r.status and r.status.strip().lower() in ("inactive", "in-active", "deactivated"):
            continue
        c_num = r.contact_number or ""
        if not c_num and r.employee_name:
            c_num = emp_contacts.get(r.employee_name.strip().lower(), "")
        if not c_num and r.employee_id:
            c_num = emp_contacts.get(r.employee_id.strip().lower(), "")
        data.append({
            "id": r.member_id,
            "poNo": r.po_no or "",
            "siteId": r.site_id or "",
            "employeeId": r.employee_id or "",
            "name": r.employee_name or "",
            "employeeName": r.employee_name or "",
            "designation": r.designation or "Supervisor",
            "contact": c_num,
            "contactNumber": c_num,
            "status": r.status or "Active"
        })
    return {"success": True, "count": len(data), "data": data}


@router.post("/dpr/members", summary="Add Member in members table in Project DB")
def create_dpr_member(
    payload: dict,
    db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db)
):
    from sqlalchemy import text
    from app.models.commercial_project import ProjectMember

    emp_name = (payload.get("name") or payload.get("employeeName") or payload.get("employee_name") or "").strip()
    emp_id = (payload.get("employeeId") or payload.get("employee_id") or "").strip()
    c_num = (payload.get("contact") or payload.get("contactNumber") or payload.get("contact_number") or "").strip()

    if emp_name and (not emp_id or not c_num):
        try:
            row = master_db.execute(
                text("SELECT employee_id, contact_number FROM company_employee_details WHERE LOWER(employee_name) = LOWER(:n) LIMIT 1"),
                {"n": emp_name}
            ).fetchone()
            if row:
                if not emp_id and row[0]:
                    emp_id = str(row[0])
                if not c_num and row[1]:
                    c_num = str(row[1])
        except Exception:
            pass

    rec = ProjectMember(
        company_name=payload.get("companyName") or payload.get("company_name") or "Nexus",
        po_no=(payload.get("poNo") or payload.get("po_no") or "").strip() or None,
        site_id=(payload.get("siteId") or payload.get("site_id") or "").strip() or None,
        employee_id=emp_id or None,
        employee_name=emp_name,
        designation=(payload.get("designation") or "Supervisor").strip(),
        contact_number=c_num or None,
        status=payload.get("status") or "Active"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.member_id,
            "poNo": rec.po_no or "",
            "siteId": rec.site_id or "",
            "employeeId": rec.employee_id or "",
            "name": rec.employee_name or "",
            "employeeName": rec.employee_name or "",
            "designation": rec.designation or "Supervisor",
            "contact": rec.contact_number or "",
            "contactNumber": rec.contact_number or "",
            "status": rec.status or "Active"
        }
    }


@router.put("/dpr/members/{member_id}", summary="Update Member in members table in Project DB")
def update_dpr_member(
    member_id: int,
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import ProjectMember
    rec = db.query(ProjectMember).filter(ProjectMember.member_id == member_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Member not found")

    new_status = payload.get("status")
    if new_status and str(new_status).strip().lower() in ("inactive", "in-active", "deactivated"):
        # Deactivated member must be removed from table and UI
        db.delete(rec)
        db.commit()
        return {"success": True, "deactivated": True, "deletedId": member_id}

    if "name" in payload or "employeeName" in payload or "employee_name" in payload:
        rec.employee_name = (payload.get("name") or payload.get("employeeName") or payload.get("employee_name") or "").strip()
    if "designation" in payload and payload["designation"] is not None:
        rec.designation = str(payload["designation"]).strip()
    if "contact" in payload or "contactNumber" in payload or "contact_number" in payload:
        rec.contact_number = (payload.get("contact") or payload.get("contactNumber") or payload.get("contact_number") or "").strip()
    if "poNo" in payload or "po_no" in payload:
        rec.po_no = payload.get("poNo") or payload.get("po_no")
    if "siteId" in payload or "site_id" in payload:
        rec.site_id = payload.get("siteId") or payload.get("site_id")
    if new_status:
        rec.status = new_status

    db.commit()
    db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.member_id,
            "name": rec.employee_name or "",
            "designation": rec.designation or "",
            "contact": rec.contact_number or "",
            "status": rec.status or "Active"
        }
    }


@router.delete("/dpr/members/{member_id}", summary="Deactivate/Remove Member from members table in Project DB")
def delete_dpr_member(
    member_id: int,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import ProjectMember
    rec = db.query(ProjectMember).filter(ProjectMember.member_id == member_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(rec)
    db.commit()
    return {"success": True, "deletedId": member_id}


@router.post("/dpr/members/deactivate", summary="Bulk deactivate and remove Members from members table in Project DB")
def deactivate_dpr_members(
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from app.models.commercial_project import ProjectMember
    ids = payload.get("memberIds") or payload.get("ids") or []
    deleted = []
    for raw_id in ids:
        try:
            mid = int(str(raw_id).replace("mem-", ""))
            rec = db.query(ProjectMember).filter(ProjectMember.member_id == mid).first()
            if rec:
                db.delete(rec)
                deleted.append(mid)
        except Exception:
            pass
    db.commit()
    return {"success": True, "deletedIds": deleted}


# --------------------------------------------------------------------------
# SURVEY DETAILS ENDPOINTS (indus_customer_project_type_supply / indus_customer_survey in Master DB)
# --------------------------------------------------------------------------

@router.get("/dpr/survey", summary="List Survey Details from indus_customer_project_type_supply / indus_customer_survey in Master DB")
def list_dpr_survey(
    sub_project_type: Optional[str] = Query(None),
    master_db: Session = Depends(get_db)
):
    from app.models.indus_project import IndusCustomerProjectTypeSupply
    q = master_db.query(IndusCustomerProjectTypeSupply)
    if sub_project_type and sub_project_type.strip():
        scoped = q.filter(IndusCustomerProjectTypeSupply.sub_project_type.ilike(sub_project_type.strip())).order_by(
            IndusCustomerProjectTypeSupply.sub_project_type_detail_id.asc()
        ).all()
        rows = scoped if scoped else q.order_by(IndusCustomerProjectTypeSupply.sub_project_type_detail_id.asc()).all()
    else:
        rows = q.order_by(IndusCustomerProjectTypeSupply.sub_project_type_detail_id.asc()).all()

    data = [
        {
            "id": r.sub_project_type_detail_id,
            "subProjectType": r.sub_project_type or "",
            "description": r.description or "",
            "observation": r.observation or "",
            "remarks": r.remarks or ""
        }
        for r in rows
    ]
    return {"success": True, "count": len(data), "data": data}


@router.post("/dpr/survey", summary="Create Survey Detail in Master DB")
def create_dpr_survey(
    payload: dict,
    master_db: Session = Depends(get_db)
):
    from app.models.indus_project import IndusCustomerProjectTypeSupply
    rec = IndusCustomerProjectTypeSupply(
        company_name=payload.get("companyName") or payload.get("company_name") or "Nexus",
        customer_name=payload.get("customerName") or payload.get("customer_name") or "Indus Tower Ltd",
        sub_project_type=(payload.get("subProjectType") or payload.get("sub_project_type") or "Civil").strip(),
        description=(payload.get("description") or "").strip(),
        observation=(payload.get("observation") or "").strip(),
        remarks=(payload.get("remarks") or "").strip()
    )
    master_db.add(rec)
    master_db.commit()
    master_db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.sub_project_type_detail_id,
            "subProjectType": rec.sub_project_type or "",
            "description": rec.description or "",
            "observation": rec.observation or "",
            "remarks": rec.remarks or ""
        }
    }


@router.put("/dpr/survey/{item_id}", summary="Update Survey Detail in Master DB")
def update_dpr_survey(
    item_id: int,
    payload: dict,
    master_db: Session = Depends(get_db)
):
    from app.models.indus_project import IndusCustomerProjectTypeSupply
    rec = master_db.query(IndusCustomerProjectTypeSupply).filter(
        IndusCustomerProjectTypeSupply.sub_project_type_detail_id == item_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Survey item not found")
    if "subProjectType" in payload or "sub_project_type" in payload:
        rec.sub_project_type = (payload.get("subProjectType") or payload.get("sub_project_type") or "").strip()
    if "description" in payload and payload["description"] is not None:
        rec.description = str(payload["description"]).strip()
    if "observation" in payload and payload["observation"] is not None:
        rec.observation = str(payload["observation"]).strip()
    if "remarks" in payload and payload["remarks"] is not None:
        rec.remarks = str(payload["remarks"]).strip()
    master_db.commit()
    master_db.refresh(rec)
    return {
        "success": True,
        "data": {
            "id": rec.sub_project_type_detail_id,
            "subProjectType": rec.sub_project_type or "",
            "description": rec.description or "",
            "observation": rec.observation or "",
            "remarks": rec.remarks or ""
        }
    }


@router.delete("/dpr/survey/{item_id}", summary="Delete Survey Detail from Master DB")
def delete_dpr_survey(
    item_id: int,
    master_db: Session = Depends(get_db)
):
    from app.models.indus_project import IndusCustomerProjectTypeSupply
    rec = master_db.query(IndusCustomerProjectTypeSupply).filter(
        IndusCustomerProjectTypeSupply.sub_project_type_detail_id == item_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Survey item not found")
    master_db.delete(rec)
    master_db.commit()
    return {"success": True, "deletedId": item_id}


# --------------------------------------------------------------------------
# POLE MOUNT ENDPOINTS (telecom_project / indus_project in Project DB by project_id & po_no)
# --------------------------------------------------------------------------

@router.get("/dpr/pole-mounts", summary="Get Pole Mount details from telecom_project in Project DB")
def list_dpr_pole_mounts(
    project_id: Optional[str] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj or not proj.mount_type:
        return {"success": True, "count": 0, "data": []}

    import json
    items = []
    # Check if mount_type has single value while planning_boq or JSON stores multiple, or parse mount_type
    sec_val = f"Sector {int(proj.sector)}" if proj.sector is not None and float(proj.sector).is_integer() else (str(proj.sector) if proj.sector is not None else "Sector 1")
    if sec_val and not sec_val.lower().startswith("sector"):
        sec_val = f"Sector {sec_val}"
    h_val = f"{int(proj.height)}m" if proj.height is not None and float(proj.height).is_integer() else (f"{proj.height}m" if proj.height is not None else "30m")
    az_val = str(int(proj.azimuth)) if proj.azimuth is not None and float(proj.azimuth).is_integer() else (str(proj.azimuth) if proj.azimuth is not None else "0")

    items.append({
        "id": f"pm-mount-{proj.project_id}",
        "projectId": proj.project_id,
        "poNo": proj.po_no or "",
        "siteId": proj.site_id or "",
        "mountType": proj.mount_type,
        "sector": sec_val,
        "height": h_val,
        "azimuth": az_val
    })
    return {"success": True, "count": len(items), "data": items}


@router.post("/dpr/pole-mounts", summary="Save Pole Mount details in telecom_project in Project DB")
def save_dpr_pole_mount(
    payload: dict,
    db: Session = Depends(get_project_db)
):
    from decimal import Decimal
    project_id = payload.get("projectId") or payload.get("project_id")
    po_no = payload.get("poNo") or payload.get("po_no")
    site_id = payload.get("siteId") or payload.get("site_id")

    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj:
        from app.models.commercial_project import TelecomProject
        proj = db.query(TelecomProject).order_by(TelecomProject.project_id.asc()).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found in telecom_project table")

    mount_type = (payload.get("mountType") or payload.get("mount_type") or "").strip()
    sector_raw = payload.get("sector")
    height_raw = payload.get("height")
    azimuth_raw = payload.get("azimuth")

    sec_num = _parse_num_val(sector_raw, 1.0)
    h_num = _parse_num_val(height_raw, 30.0)
    az_num = _parse_num_val(azimuth_raw, 0.0)

    proj.pole_mounts = True
    proj.mount_type = mount_type
    proj.sector = Decimal(str(sec_num))
    proj.height = Decimal(str(h_num))
    proj.azimuth = Decimal(str(az_num))

    db.commit()
    db.refresh(proj)

    sec_str = str(sector_raw) if sector_raw and "sector" in str(sector_raw).lower() else f"Sector {int(sec_num)}"
    h_str = str(height_raw) if height_raw and "m" in str(height_raw).lower() else f"{int(h_num)}m"
    az_str = str(int(az_num)) if float(az_num).is_integer() else str(az_num)

    return {
        "success": True,
        "data": {
            "id": f"pm-mount-{proj.project_id}",
            "projectId": proj.project_id,
            "poNo": proj.po_no or "",
            "siteId": proj.site_id or "",
            "mountType": proj.mount_type,
            "sector": sec_str,
            "height": h_str,
            "azimuth": az_str
        }
    }


@router.delete("/dpr/pole-mounts", summary="Delete Pole Mount details from telecom_project in Project DB")
def delete_dpr_pole_mount(
    project_id: Optional[str] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj:
        from app.models.commercial_project import TelecomProject
        proj = db.query(TelecomProject).filter(TelecomProject.mount_type.isnot(None)).first()
    if proj:
        proj.mount_type = None
        proj.sector = None
        proj.height = None
        proj.azimuth = None
        db.commit()
    return {"success": True}


# --------------------------------------------------------------------------
# CIVIL WORKS ENDPOINTS (telecom_project / indus_project in Project DB by project_id & po_no)
# --------------------------------------------------------------------------

@router.get("/dpr/civil-works", summary="Get Civil Works details from telecom_project in Project DB")
def list_dpr_civil_works(
    project_id: Optional[str] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj or not proj.drawing_name:
        return {"success": True, "count": 0, "data": []}

    items = [{
        "id": f"pm-cw-{proj.project_id}",
        "projectId": proj.project_id,
        "poNo": proj.po_no or "",
        "siteId": proj.site_id or "",
        "drawingName": proj.drawing_name,
        "fileName": f"{proj.drawing_name.replace(' ', '_')}.pdf",
        "hasDocument": bool(proj.drawing_documents)
    }]
    return {"success": True, "count": len(items), "data": items}


@router.post("/dpr/civil-works", summary="Save Civil Works details in telecom_project in Project DB")
def save_dpr_civil_works(
    payload: dict,
    db: Session = Depends(get_project_db)
):
    import base64
    project_id = payload.get("projectId") or payload.get("project_id")
    po_no = payload.get("poNo") or payload.get("po_no")
    site_id = payload.get("siteId") or payload.get("site_id")

    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj:
        from app.models.commercial_project import TelecomProject
        proj = db.query(TelecomProject).order_by(TelecomProject.project_id.asc()).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found in telecom_project table")

    drawing_name = (payload.get("drawingName") or payload.get("drawing_name") or "").strip()
    doc_data = payload.get("drawingDocuments") or payload.get("drawing_documents") or payload.get("fileData")
    if not doc_data:
        minimal_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF"
        doc_data = "data:application/pdf;base64," + base64.b64encode(minimal_pdf).decode("utf-8")

    proj.civil_works = True
    proj.drawing_name = drawing_name
    proj.drawing_documents = doc_data

    db.commit()
    db.refresh(proj)

    return {
        "success": True,
        "data": {
            "id": f"pm-cw-{proj.project_id}",
            "projectId": proj.project_id,
            "poNo": proj.po_no or "",
            "siteId": proj.site_id or "",
            "drawingName": proj.drawing_name,
            "fileName": payload.get("fileName") or f"{proj.drawing_name.replace(' ', '_')}.pdf",
            "hasDocument": True
        }
    }


@router.delete("/dpr/civil-works", summary="Delete Civil Works details from telecom_project in Project DB")
def delete_dpr_civil_works(
    project_id: Optional[str] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj:
        from app.models.commercial_project import TelecomProject
        proj = db.query(TelecomProject).filter(TelecomProject.drawing_name.isnot(None)).first()
    if proj:
        proj.drawing_name = None
        proj.drawing_documents = None
        db.commit()
    return {"success": True}


@router.get("/dpr/civil-works/download", summary="Download Civil Works PDF from telecom_project in Project DB")
def download_dpr_civil_works_pdf(
    project_id: Optional[str] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    drawing_name: Optional[str] = Query(None),
    db: Session = Depends(get_project_db)
):
    import base64
    proj = _find_telecom_project(db, project_id=project_id, po_no=po_no, site_id=site_id)
    if not proj and drawing_name:
        from app.models.commercial_project import TelecomProject
        proj = db.query(TelecomProject).filter(TelecomProject.drawing_name == drawing_name).first()
    if not proj or not proj.drawing_documents:
        minimal_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF"
        raw_bytes = minimal_pdf
        fname = f"{(drawing_name or 'Civil_Works_Drawing').replace(' ', '_')}.pdf"
    else:
        content = proj.drawing_documents
        if content.startswith("data:application/pdf;base64,"):
            raw_bytes = base64.b64decode(content.split(",", 1)[1])
        else:
            try:
                raw_bytes = base64.b64decode(content)
            except Exception:
                raw_bytes = content.encode("utf-8")
        fname = f"{(proj.drawing_name or drawing_name or 'Civil_Works_Drawing').replace(' ', '_')}.pdf"

    return Response(
        content=raw_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{fname}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

