from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status, Response, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_project_db, get_accounts_db
from app.services.commercial_project_service import CommercialProjectService
from app.services.commercial_invoice_service import CommercialInvoiceService
from app.services.auth_service import auth_service
from app.schemas.commercial_project import (
    CommercialProjectListResponse,
    CommercialBulkUploadResponse,
    CommercialProjectDeleteRequest,
    CommercialProjectDeleteResponse,
    WccSubmitDetailsRequest,
    CommercialInvoiceListResponse,
    CommercialInvoiceSubmitDetailsRequest,
    CommercialInvoiceSubmitHashRequest,
    CommercialReceivableListResponse,
    CommercialReceivableUpdateInvoiceAmountRequest,
    CommercialReceivableUpdateDeductionRequest,
    CommercialReceivableUpdateReceivedAmountRequest
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




