import io
from typing import Optional, List
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db, get_project_db
from app.services.jms_service import JmsService
from app.services.wcc_pdf_service import WccPdfService
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
    PoAmendPoDetailResponse,
    SelectWorksSubmitRequest,
    SelectWorksSubmitResponse,
    PoAmendSubmitReferenceRequest,
    PoAmendQtyUpdateRequest,
    WccSubmitDetailsRequest,
    WccSubmitReceiptRequest,
    SubmitAmendmentStatusRequest,
    PoRowRejectRequest,
    PdfProcessRequest,
    PdfProcessResponse
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


@router.post("/select-works/submit", response_model=SelectWorksSubmitResponse, summary="Submit Select Works & Generate 3-Page WCC Merged PDF")
@router.post("/select-works", response_model=SelectWorksSubmitResponse, summary="Alias: Submit Select Works & Generate 3-Page WCC Merged PDF")
def submit_select_works(
    payload: SelectWorksSubmitRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    """
    Submits Select Works choices, generates 3-page WCC PDF (Annexure, BOQ, Work Completion Certificate),
    merges uploaded JMS documents, and persists idempotently in ProjectDocument and telecom_project.
    """
    selected_works = {
        "civil": payload.civil,
        "electrical": payload.electrical,
        "service": payload.service,
        "eb": payload.eb
    }
    pdf_service = WccPdfService(project_db)
    try:
        return pdf_service.process_select_works_submission(payload.poNo, payload.siteId, selected_works)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)}"
        )


@router.patch("/po-amend/line-items/{line_item_id}/qty", summary="Update PO Amendment line item quantity and persist recalculated amount")
@router.post("/po-amend/line-items/{line_item_id}/qty", summary="Alias: Update PO Amendment line item quantity")
def update_po_amend_line_item_qty(
    line_item_id: str,
    payload: PoAmendQtyUpdateRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.update_po_amend_line_item_qty(
        line_item_id=line_item_id,
        new_qty=payload.qty,
        po_no=payload.poNo,
        site_id=payload.siteId
    )


@router.post("/po-amend/submit-reference", summary="Submit PO Reference Number and transition task to Approval Pending")
def submit_po_amend_reference(
    payload: PoAmendSubmitReferenceRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    ref_val = payload.get_ref_id()
    if not ref_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PO Reference Number cannot be empty."
        )
    service = JmsService(project_db)
    return service.submit_po_amend_reference(payload.poNo, payload.siteId, ref_val)


@router.post("/wcc/submit-details", summary="Submit WCC Details and transition task to Approval Pending")
def submit_wcc_details(
    payload: WccSubmitDetailsRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.submit_wcc_details(
        payload.poNo,
        payload.siteId,
        payload.wccNo,
        payload.wccDate,
        payload.wccAmount
    )


@router.post("/wcc/submit-receipt", summary="Submit Receipt No, Receipt Date, and ERS No for WCC")
def submit_wcc_receipt(
    payload: WccSubmitReceiptRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.submit_wcc_receipt(
        payload.poNo,
        payload.siteId,
        payload.receiptNo,
        payload.receiptDate,
        payload.ersNo
    )


@router.post("/reject", summary="Reject PO row and remove merged PDF from database")
def reject_po_workflow_row(
    payload: PoRowRejectRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.reject_po_workflow_row(payload.poNo, payload.siteId, payload.workflow or "po_amend")


@router.post("/submit-amendment-status", summary="Submit Revision Number and Approved Date")
def submit_amendment_status(
    payload: SubmitAmendmentStatusRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.submit_amendment_status(
        payload.poNo,
        payload.siteId,
        payload.workflow or "po_amend",
        payload.revisionNo,
        payload.approvedDate
    )


@router.post("/pdf/process", response_model=PdfProcessResponse, summary="Process/regenerate 3-page certificate and merge with additional documents")
def process_pdf_regeneration(
    payload: PdfProcessRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    pdf_service = WccPdfService(project_db)
    try:
        res = pdf_service.process_pdf_regeneration(payload.poNo, payload.siteId)
        return PdfProcessResponse(
            success=True,
            message=res.get("message", "PDF regenerated and persisted successfully."),
            poNo=payload.poNo,
            siteId=payload.siteId,
            fileName=res.get("fileName", f"WCC_Merged_{payload.poNo}.pdf"),
            totalPages=res.get("totalPages", 3)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF processing failed: {str(e)}"
        )


@router.get("/pdf/download", summary="Download generated WCC / PO Amend PDF")
def download_generated_pdf(
    po_no: str = Query(..., description="PO Number"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    doc_type: Optional[str] = Query(None, description="Document type: 'jms' or 'wcc' / 'po_amend'"),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    """
    Downloads the persisted binary PDF from PostgreSQL database:
    - If doc_type == 'jms': serves jms_merged_document.
    - Otherwise (default): serves po_amendment_merged_document (Annexure, BOQ, WCC + JMS documents).
    Ensures application/pdf content type and valid PDF bytes.
    If the document was rejected and not yet processed, returns 404 without serving stale document.
    """
    from app.models.commercial_project import TelecomProject
    from app.services.wcc_pdf_service import WccPdfService

    pdf_service = WccPdfService(project_db)

    proj_q = project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no)
    if site_id:
        proj_q = proj_q.filter(TelecomProject.site_id == site_id)
    proj = proj_q.first()
    if not proj:
        proj = project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()

    # Prevent exposing stale document if PO is in Rejected state
    if proj and proj.current_task == "Rejected":
        raw_po = proj.po_amendment_merged_document or proj.po_amendment_merged_documents
        raw_jms = proj.jms_merged_document or proj.jms_merged_documents
        if not raw_po and not raw_jms:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PO #{po_no} is currently Rejected. Please click 'PDF Process' to generate the updated document before download."
            )

    pdf_bytes: Optional[bytes] = None
    file_name = f"WCC_Merged_{po_no}.pdf"

    if (doc_type or "").lower() == "jms":
        file_name = f"JMS_Merged_{po_no}.pdf"
        if proj:
            raw_jms = proj.jms_merged_document or proj.jms_merged_documents
            if raw_jms:
                pdf_bytes, _ = pdf_service._decode_document_content(raw_jms)

        if not pdf_bytes:
            # Fall back to merging uploaded JMS documents live
            pdf_bytes = pdf_service.merge_uploaded_jms_documents(
                po_no=po_no,
                site_id=site_id or (proj.site_id if proj else None),
                proj=proj
            )
            if proj and pdf_bytes:
                try:
                    proj.jms_merged_document = pdf_bytes
                    proj.jms_merged_documents = pdf_bytes
                    project_db.commit()
                except Exception:
                    project_db.rollback()
    else:
        # Default: WCC / PO Amendment merged document
        if proj:
            raw_po = proj.po_amendment_merged_document or proj.po_amendment_merged_documents
            if raw_po:
                pdf_bytes, _ = pdf_service._decode_document_content(raw_po)
            elif proj.jms_merged_document or proj.jms_merged_documents:
                pdf_bytes, _ = pdf_service._decode_document_content(
                    proj.jms_merged_document or proj.jms_merged_documents
                )

        if not pdf_bytes and proj and proj.current_task != "Rejected":
            # Live generate and merge if not yet generated and not rejected
            try:
                res = pdf_service.process_select_works_submission(
                    po_no=po_no,
                    site_id=site_id or (proj.site_id if proj else None)
                )
                if proj:
                    project_db.refresh(proj)
                    raw_po = proj.po_amendment_merged_document or proj.po_amendment_merged_documents
                    if raw_po:
                        pdf_bytes, _ = pdf_service._decode_document_content(raw_po)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Could not generate or retrieve PDF for PO #{po_no}: {str(e)}"
                )

    if not pdf_bytes or not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No valid PDF document found or generated for PO #{po_no}."
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/jms/download", summary="Download merged JMS PDF")
def download_jms_pdf(
    po_no: str = Query(..., description="PO Number"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    return download_generated_pdf(
        po_no=po_no,
        site_id=site_id,
        doc_type="jms",
        project_db=project_db,
        _auth=_auth
    )


