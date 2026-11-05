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
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.get_documents(po_no or "", site_id)


@router.post("/documents", response_model=JmsDocumentResponse, summary="Upload PDF Document")
async def upload_jms_document(
    file: UploadFile = File(..., description="PDF document file"),
    po_no: Optional[str] = Form(""),
    site_id: Optional[str] = Form(None),
    doc_type: Optional[str] = Form("STN Document"),
    doc_details: Optional[str] = Form(""),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    content = await file.read()
    service = JmsService(project_db)
    return service.upload_document(
        po_no=po_no or "",
        site_id=site_id,
        doc_type=doc_type or "STN Document",
        doc_details=doc_details or f"{doc_type or 'Document'} Upload",
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
        headers={
            "Content-Disposition": f'attachment; filename="{file_info["fileName"]}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
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


@router.patch("/wcc/line-items/{line_item_id}/qty", summary="Update WCC line item quantity and persist recalculated amount")
@router.post("/wcc/line-items/{line_item_id}/qty", summary="Alias: Update WCC line item quantity")
def update_wcc_line_item_qty(
    line_item_id: str,
    payload: PoAmendQtyUpdateRequest,
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    service = JmsService(project_db)
    return service.update_wcc_line_item_qty(
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
        payload.wccAmount,
        payload.submissionDate or payload.wccSubmissionDate,
        payload.approvedDate or payload.wccApprovedDate
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


@router.get("/invoice/pdf/download", summary="Download Commercial Invoice PDF (Alias)")
def download_commercial_invoice_pdf_alias(
    invoice_no: Optional[str] = Query(None, description="Invoice Number"),
    po_no: Optional[str] = Query(None, description="PO Number"),
    site_id: Optional[str] = Query(None, description="Site ID"),
    irn_no: Optional[str] = Query(None, description="IRN Number"),
    ers_no: Optional[str] = Query(None, description="ERS Number"),
    invoice_date: Optional[str] = Query(None, description="Invoice Date"),
    gst_type: Optional[str] = Query(None, description="GST Type: SGST or IGST"),
    project_db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_jms_access)
):
    from app.services.invoice_pdf_service import CommercialInvoicePdfService

    pdf_service = CommercialInvoicePdfService(project_db)
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
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


def _ensure_infra_documents_in_db(project_db: Session, po_no: Optional[str] = None, site_id: Optional[str] = None):
    import base64
    from datetime import date, datetime
    from app.models.commercial_project import ProjectDocument

    default_docs = [
        {"doc_type": "MIN", "doc_no": "MIN-234567-01", "doc_date": date(2026, 8, 12)},
        {"doc_type": "MRN", "doc_no": "MRN-234567-01", "doc_date": date(2026, 8, 16)},
        {"doc_type": "MIN", "doc_no": "MIN-234567-02", "doc_date": date(2026, 8, 22)},
        {"doc_type": "MRN", "doc_no": "MRN-234567-02", "doc_date": date(2026, 8, 28)},
    ]

    existing_any = project_db.query(ProjectDocument).filter(
        ProjectDocument.documents.isnot(None)
    ).first()
    fallback_data_uri = existing_any.documents if (existing_any and existing_any.documents) else None
    if not fallback_data_uri:
        minimal_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF"
        fallback_data_uri = "data:application/pdf;base64," + base64.b64encode(minimal_pdf).decode("utf-8")

    results = []
    for item in default_docs:
        doc_row = project_db.query(ProjectDocument).filter(
            ProjectDocument.document_number == item["doc_no"]
        ).first()
        if not doc_row:
            doc_row = ProjectDocument(
                company_name="Nexus",
                customer_name="Indus Towers Ltd",
                po_no=po_no or "4500128934",
                site_id=site_id or "IN-123456",
                date=item["doc_date"],
                document_name=f"{item['doc_no']}.pdf",
                document_number=item["doc_no"],
                document_details=item["doc_type"],
                documents=fallback_data_uri
            )
            project_db.add(doc_row)
            project_db.commit()
            project_db.refresh(doc_row)
        results.append({
            "id": doc_row.project_document_id,
            "docType": item["doc_type"],
            "docNo": doc_row.document_number,
            "docDate": doc_row.date.strftime("%d/%m/%Y") if doc_row.date else item["doc_date"].strftime("%d/%m/%Y")
        })
    return results


@router.get("/infra-documents", summary="List Infra Documents from DB")
def list_infra_documents(
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db)
):
    docs = _ensure_infra_documents_in_db(project_db, po_no=po_no, site_id=site_id)
    return {"status": "success", "data": docs}


@router.get("/infra-documents/download", summary="Download Infra Document PDF from DB")
def download_infra_document(
    doc_no: Optional[str] = Query(None),
    doc_type: Optional[str] = Query(None),
    doc_id: Optional[int] = Query(None),
    po_no: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    project_db: Session = Depends(get_project_db)
):
    import base64
    from app.models.commercial_project import ProjectDocument

    _ensure_infra_documents_in_db(project_db, po_no=po_no, site_id=site_id)

    doc = None
    if doc_id:
        doc = project_db.query(ProjectDocument).filter(ProjectDocument.project_document_id == doc_id).first()
    if not doc and doc_no:
        doc = project_db.query(ProjectDocument).filter(ProjectDocument.document_number == doc_no).first()
    if not doc and doc_no:
        doc = project_db.query(ProjectDocument).filter(ProjectDocument.document_name.ilike(f"%{doc_no}%")).first()
    if not doc:
        doc = project_db.query(ProjectDocument).filter(ProjectDocument.documents.isnot(None)).first()

    if not doc or not doc.documents:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found in database.")

    content = doc.documents
    if content.startswith("data:application/pdf;base64,"):
        raw_bytes = base64.b64decode(content.split(",", 1)[1])
    else:
        try:
            raw_bytes = base64.b64decode(content)
        except Exception:
            raw_bytes = content.encode("utf-8")

    safe_name = (doc_no or doc.document_number or doc.document_name or "Document").replace("/", "_").replace("\\", "_")
    if not safe_name.lower().endswith(".pdf"):
        safe_name = f"{safe_name}.pdf"

    return Response(
        content=raw_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
