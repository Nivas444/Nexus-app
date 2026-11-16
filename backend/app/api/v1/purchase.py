import os
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Path, status, HTTPException, BackgroundTasks, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db, SessionLocal
from app.models.purchase import Purchase
from app.services.purchase_service import PurchaseService
from app.services.po_pdf_service import PurchaseOrderPdfService
from app.schemas.purchase import (
    PurchaseRequestCreate,
    PurchaseRequestUpdate,
    PurchaseRequestResponse,
    PurchaseRequestListResponse,
    SelectSuppliersRequest,
    PurchaseCreate,
    PurchaseUpdate,
    PurchaseResponse,
    PurchaseListResponse,
    PurchaseTermsRequest,
    PurchaseTransportRequest,
    PurchaseUploadDocumentsRequest
)

router = APIRouter(prefix="/purchase", tags=["Purchase Module"])

# =============================================================================
# PR ENDPOINTS
# =============================================================================

@router.get("/pr", response_model=PurchaseRequestListResponse, summary="List Purchase Requests")
def list_purchase_requests(db: Session = Depends(get_db)):
    service = PurchaseService(db)
    items = service.get_pr_list()
    return {"success": True, "total": len(items), "items": items}

@router.post("/pr", response_model=PurchaseRequestResponse, status_code=status.HTTP_201_CREATED, summary="Create PR Item")
def create_purchase_request(data: PurchaseRequestCreate, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.create_pr(data)

@router.put("/pr/{pr_id}", response_model=PurchaseRequestResponse, summary="Update PR Item")
def update_purchase_request(pr_id: int = Path(..., ge=1), data: PurchaseRequestUpdate = None, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.update_pr(pr_id, data)

@router.post("/pr/select-suppliers", response_model=PurchaseRequestListResponse, summary="Select up to 3 suppliers for PR items")
def select_suppliers_for_pr(payload: SelectSuppliersRequest, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    items = service.select_suppliers(payload)
    return {"success": True, "total": len(items), "items": items}


# =============================================================================
# RFQ ENDPOINTS
# =============================================================================

@router.get("/rfq", response_model=PurchaseListResponse, summary="List RFQ Records")
def list_rfq_records(db: Session = Depends(get_db)):
    service = PurchaseService(db)
    items = service.get_rfq_list()
    return {"success": True, "total": len(items), "items": items}

@router.post("/rfq/terms", response_model=PurchaseResponse, summary="Save Transportation Scope and Payment Terms")
def save_rfq_terms(payload: PurchaseTermsRequest, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.save_rfq_terms(payload)


# =============================================================================
# PO ENDPOINTS
# =============================================================================

@router.get("/po", response_model=PurchaseListResponse, summary="List PO Records")
def list_po_records(db: Session = Depends(get_db)):
    service = PurchaseService(db)
    items = service.get_po_list()
    return {"success": True, "total": len(items), "items": items}

@router.get("/po/{po_id}", response_model=PurchaseResponse, summary="Get PO Record by ID")
def get_po_record(po_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.get_po_by_id(po_id)

@router.put("/po/{po_id}/status", response_model=PurchaseResponse, summary="Update PO Status")
def update_po_status(po_id: int = Path(..., ge=1), new_status: str = Query(...), db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.update_po_status(po_id, new_status)

@router.post("/po/{po_id}/transport-details", response_model=PurchaseResponse, summary="Save Transport Details & GST Categories")
def save_po_transport_details(po_id: int = Path(..., ge=1), data: PurchaseTransportRequest = None, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.save_transport_details(po_id, data)

@router.post("/po/{po_id}/upload-documents", response_model=PurchaseResponse, summary="Upload Invoice and LR Documents")
def upload_po_documents(po_id: int = Path(..., ge=1), data: PurchaseUploadDocumentsRequest = None, db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.upload_documents(po_id, data)

@router.get("/po/{po_id}/document/{doc_type}", summary="Download Invoice or LR Document")
def download_po_document(po_id: int = Path(..., ge=1), doc_type: str = Path(..., description="invoice or lr"), db: Session = Depends(get_db)):
    service = PurchaseService(db)
    return service.get_document(po_id, doc_type)


# =============================================================================
# PO PDF GENERATION ENDPOINTS (ASYNC BACKGROUND TASK)
# =============================================================================

logger = logging.getLogger(__name__)

def background_generate_po_pdf(po_id: int):
    """Executes asynchronous PO PDF generation in background without blocking the UI."""
    db = SessionLocal()
    try:
        po = db.query(Purchase).filter(Purchase.id == po_id).first()
        if not po:
            logger.warning(f"Async PO PDF generation: PO #{po_id} not found in DB.")
            return

        service = PurchaseOrderPdfService(db)
        pdf_bytes = service.generate_po_pdf(po_id)

        safe_po_no = (po.po_no or f"PO-{po.id}").replace("/", "_").replace("\\", "_")
        rel_dir = os.path.join("frontend", "assets", "generated_pdfs")
        os.makedirs(rel_dir, exist_ok=True)
        filename = f"PO_{safe_po_no}.pdf"
        file_path = os.path.join(rel_dir, filename)

        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        po.po_document = f"/assets/generated_pdfs/{filename}"
        po.pdf_status = "Generated"
        db.commit()
        logger.info(f"Successfully generated PO PDF for PO #{po_id} at {file_path}")
    except Exception as e:
        logger.error(f"Error in async PO PDF generation for PO #{po_id}: {e}", exc_info=True)
        try:
            po = db.query(Purchase).filter(Purchase.id == po_id).first()
            if po:
                po.pdf_status = "Failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


class TriggerPoPdfRequest(BaseModel):
    po_id: Optional[Any] = None
    po_no: Optional[str] = None
    pr_no: Optional[str] = None
    vendor_name: Optional[str] = None


@router.post("/po/{po_id}/generate-pdf", summary="Trigger Asynchronous PO PDF Generation")
def trigger_po_pdf_generation(
    po_id: int = Path(..., ge=1),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    service = PurchaseService(db)
    po = service.get_po_by_id(po_id)

    # Prevent duplicate generation if already generating
    if po.pdf_status == "Generating":
        return {
            "success": True,
            "status": "Generating",
            "message": "PO PDF generation is already in progress",
            "po_id": po.id,
            "po_no": po.po_no
        }

    po.pdf_status = "Generating"
    db.commit()

    if background_tasks is not None:
        background_tasks.add_task(background_generate_po_pdf, po.id)
    else:
        background_generate_po_pdf(po.id)

    return {
        "success": True,
        "status": "Generating",
        "message": "PO PDF generation started in background",
        "po_id": po.id,
        "po_no": po.po_no
    }


@router.post("/po/trigger-pdf", summary="Trigger PO PDF Generation by PO or PR identifier")
def trigger_po_pdf_by_identifier(
    payload: TriggerPoPdfRequest,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    service = PurchaseService(db)
    po = service.find_or_create_po(
        po_id=payload.po_id,
        po_no=payload.po_no,
        pr_no=payload.pr_no,
        vendor_name=payload.vendor_name
    )

    if po.pdf_status == "Generating":
        return {
            "success": True,
            "status": "Generating",
            "message": "PO PDF generation is already in progress",
            "po_id": po.id,
            "po_no": po.po_no
        }

    po.pdf_status = "Generating"
    db.commit()

    if background_tasks is not None:
        background_tasks.add_task(background_generate_po_pdf, po.id)
    else:
        background_generate_po_pdf(po.id)

    return {
        "success": True,
        "status": "Generating",
        "message": "PO PDF generation started in background",
        "po_id": po.id,
        "po_no": po.po_no
    }


@router.get("/po/{po_id}/pdf-status", summary="Check PO PDF Generation Status")
def check_po_pdf_status(po_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    service = PurchaseService(db)
    po = service.get_po_by_id(po_id)
    return {
        "success": True,
        "po_id": po.id,
        "po_no": po.po_no,
        "pdf_status": po.pdf_status or "Pending",
        "po_document": po.po_document
    }


@router.get("/po/{po_id}/pdf", summary="Download or Stream Generated PO PDF")
def download_or_stream_po_pdf(po_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    service = PurchaseService(db)
    po = service.get_po_by_id(po_id)
    safe_po_no = (po.po_no or f"PO-{po.id}").replace("/", "_").replace("\\", "_")
    file_path = os.path.join("frontend", "assets", "generated_pdfs", f"PO_{safe_po_no}.pdf")

    content = None
    if os.path.exists(file_path):
        with open(file_path, "rb") as f:
            content = f.read()
    else:
        pdf_service = PurchaseOrderPdfService(db)
        content = pdf_service.generate_po_pdf(po_id)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)
        po.po_document = f"/assets/generated_pdfs/PO_{safe_po_no}.pdf"
        po.pdf_status = "Generated"
        db.commit()

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="Purchase_Order_{safe_po_no}.pdf"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

