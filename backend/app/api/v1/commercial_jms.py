import io
from typing import Optional, List
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db, get_project_db
from app.services.jms_service import JmsService
from app.services.auth_service import auth_service
from app.schemas.commercial_project import (
    JmsPoDetailResponse,
    JmsLineItem,
    JmsQtyUpdateRequest,
    JmsRowApprovalRequest,
    JmsSubmitRequest,
    JmsAddLineItemRequest,
    GbpaItemResponse,
    JmsDocumentResponse,
    JmsExpensesResponse,
    JmsProcessRequest,
    JmsProcessResponse,
    WccPoDetailResponse,
    PoAmendPoDetailResponse
)

router = APIRouter(prefix="/commercial/jms", tags=["Commercial Manager - JMS Workflow"])


def verify_jms_access(authorization: Optional[str] = Header(None)):
    """
    Ensure the request is authenticated and authorized for Commercial Manager, Project Manager, or Admin.
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


@router.get("/po-details", response_model=JmsPoDetailResponse, summary="Get JMS PO Details & Line Items")
def get_jms_po_details(
    po_no: str = Query(..., description="PO Number"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db, master_db)
    return service.get_jms_po_details(po_no, site_id)


@router.patch("/line-items/{line_item_id}/qty", summary="Update JMS Quantity for a line item")
def update_jms_qty(
    line_item_id: int,
    payload: JmsQtyUpdateRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.update_line_item_qty(line_item_id, payload.jmsQty)


@router.post("/line-items/approve", summary="Approve or Not Approved rows")
def approve_jms_rows(
    payload: JmsRowApprovalRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.update_row_approvals(payload.lineItemIds, payload.status)


@router.get("/gbpa-items", response_model=List[GbpaItemResponse], summary="List eligible GBPA line items (CAPEX/OPEX filtered)")
def get_eligible_gbpa_items(
    po_no: str = Query(..., description="PO Number to determine CAPEX/OPEX type"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    search: Optional[str] = Query(None, description="Search term for item code or description"),
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db, master_db)
    return service.get_eligible_gbpa_items(po_no, site_id, search)


@router.get("/check-item", summary="Check typed GBPA item code eligibility")
def check_jms_line_item(
    po_no: str = Query(...),
    site_id: Optional[str] = Query(None),
    item_code: str = Query(...),
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db, master_db)
    return service.check_gbpa_item(po_no, site_id, item_code)


@router.post("/line-items", response_model=JmsLineItem, summary="Add line item from GBPA to PO")
def add_jms_line_item(
    payload: JmsAddLineItemRequest,
    project_db: Session = Depends(get_project_db),
    master_db: Session = Depends(get_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db, master_db)
    return service.add_line_item(payload.poNo, payload.siteId, payload.itemCode, payload.qty or 1.0)


@router.post("/submit", summary="Submit validated JMS records to Project Manager")
def submit_jms(
    payload: JmsSubmitRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.submit_jms_to_pm(payload.poNo, payload.siteId)


@router.get("/documents", response_model=List[JmsDocumentResponse], summary="List JMS Documents")
def list_jms_documents(
    po_no: str = Query(...),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.get_documents(po_no, site_id)


@router.post("/documents", response_model=JmsDocumentResponse, summary="Upload PDF Document")
async def upload_jms_document(
    file: UploadFile = File(..., description="PDF document file"),
    po_no: str = Form(...),
    site_id: Optional[str] = Form(None),
    doc_type: str = Form(...),
    doc_details: Optional[str] = Form(""),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    content = await file.read()
    service = JmsService(project_db)
    return service.upload_document(
        po_no=po_no,
        site_id=site_id,
        doc_type=doc_type,
        doc_details=doc_details or f"{doc_type} Upload",
        file_name=file.filename or "document.pdf",
        file_bytes=content
    )


@router.delete("/documents/{document_id}", summary="Delete Document")
def delete_jms_document(
    document_id: int,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.delete_document(document_id)


@router.get("/documents/{document_id}/download", summary="Download Document")
def download_jms_document(
    document_id: int,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    file_info = service.get_document_file(document_id)
    return Response(
        content=file_info["bytes"],
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{file_info["fileName"]}"'}
    )


@router.get("/expenses", response_model=JmsExpensesResponse, summary="Get project expenses scoped to PO")
def get_jms_expenses(
    po_no: str = Query(...),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.get_project_expenses(po_no, site_id)


@router.post("/process", response_model=JmsProcessResponse, summary="Route JMS to be process line items to WCC or PO to be Amend")
@router.post("/route", response_model=JmsProcessResponse, summary="Alias: Route JMS to be process line items to WCC or PO to be Amend")
def process_jms_to_be_process(
    payload: JmsProcessRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.process_jms_to_be_process(payload.poNo, payload.siteId, payload.lineItemIds)


@router.get("/wcc-details", response_model=WccPoDetailResponse, summary="Get routed WCC PO details and line items")
def get_wcc_po_details(
    po_no: str = Query(...),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.get_wcc_po_details(po_no, site_id)


@router.get("/po-amend-details", response_model=PoAmendPoDetailResponse, summary="Get routed PO Amend details and line items")
def get_po_amend_po_details(
    po_no: str = Query(...),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.get_po_amend_po_details(po_no, site_id)
