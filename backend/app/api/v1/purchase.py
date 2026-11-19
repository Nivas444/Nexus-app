import os
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Path, status, HTTPException, BackgroundTasks, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import text
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
    PurchaseUploadDocumentsRequest,
    TransportPaymentRequest,
    MinTransportSubmitRequest,
    AccountPurchaseCreate
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

        import base64
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        # Store complete base64 data URL in po_document column of nexus_purchase.purchase
        pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
        po.po_document = f"data:application/pdf;base64,{pdf_b64}"
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


# =============================================================================
# ACCOUNTS DB INTEGRATION (Payment & Purchase Tables)
# =============================================================================

@router.post("/transport-payment", summary="Submit Transport Payment to Accounts DB")
def submit_transport_payment(payload: TransportPaymentRequest, db: Session = Depends(get_db)):
    """
    Saves transport payment details into PostgreSQL `nexus_accounts.payment` table.
    Sets expense_type = 'Transport Charges'.
    """
    service = PurchaseService(db)
    return service.save_transport_payment(payload)


@router.post("/min/transport-details", summary="Save MIN Transport & Payment Details")
def save_min_transport_details(payload: MinTransportSubmitRequest, db: Session = Depends(get_db)):
    """
    Saves MIN transport details into `nexus_admin.transport` (up to whatsapp number)
    and payment details (amount, advance payment, partial payment boolean) into `nexus_accounts.payment`.
    """
    service = PurchaseService(db)
    return service.save_min_transport_details(payload)


@router.get("/inventory/stock-qty", summary="Get Stock Qty from nexus_inventory.inventry")
def get_inventory_stock_qty(db: Session = Depends(get_db)):
    """
    Returns mapping of material description / doc_no to new_stock_qty from `nexus_inventory.inventry`.
    """
    from sqlalchemy import text
    rows = db.execute(text("SELECT doc_no, new_stock_qty FROM nexus_inventory.inventry ORDER BY inventry_id DESC;")).fetchall()
    stock_map = {}
    for r in rows:
        key = (r[0] or "").strip().lower()
        if key and key not in stock_map:
            stock_map[key] = float(r[1] or 0)
    return {"success": True, "stock": stock_map}


@router.post("/payment", summary="Sync Purchase Payment into Accounts DB")
def sync_purchase_payment(payload: AccountPurchaseCreate, db: Session = Depends(get_db)):
    """
    Upserts purchase record into PostgreSQL `nexus_accounts.purchase` table.
    Links partial_payment to the paid amount column.
    """
    service = PurchaseService(db)
    return service.sync_account_purchase(payload)


@router.get("/payment", summary="List Purchase Records from Accounts DB")
def list_account_purchases(db: Session = Depends(get_db)):
    """
    Retrieves purchase records stored in PostgreSQL `nexus_accounts.purchase`.
    """
    service = PurchaseService(db)
    items = service.get_account_purchases()
    return {"success": True, "total": len(items), "items": items}


@router.post("/min/{min_id}/generate-delivery-challan-pdf", summary="Generate Delivery Challan & E-Way Bill PDF")
def generate_delivery_challan_pdf(
    min_id: str,
    payload: Optional[Dict[str, Any]] = None,
    regenerate: bool = Query(True, description="Force regeneration"),
    db: Session = Depends(get_db)
):
    """
    Generates Delivery Challan and conditional E-Way Bill PDF:
    - If E-Way Bill toggle is enabled: generates E-Way Bill and merges both into a single combined PDF.
    - If E-Way Bill toggle is disabled: generates only the Delivery Challan PDF.
    - Always regenerates latest content and calculations dynamically.
    """
    from app.services.delivery_challan_pdf_service import DeliveryChallanPdfService
    try:
        service = DeliveryChallanPdfService(db)
        result = service.generate_delivery_challan_and_ewaybill(
            min_id=min_id,
            min_payload=payload,
            regenerate=regenerate
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error generating delivery challan PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate delivery challan PDF: {str(e)}"
        )


@router.get("/min/{min_id}/delivery-challan-pdf", summary="Preview or Download Delivery Challan PDF")
def download_delivery_challan_pdf(
    min_id: str,
    doc_no: Optional[str] = Query(None),
    download: bool = Query(False, description="Whether to trigger file download (attachment) or inline preview"),
    db: Session = Depends(get_db)
):
    """
    Previews (inline) or downloads (attachment) the combined or single Delivery Challan PDF for the specified MIN record.
    """
    import re
    import tempfile
    from app.services.delivery_challan_pdf_service import _DC_PDF_CACHE

    clean_doc = (doc_no or min_id or "Delivery_Challan").replace('/', '_')
    fname = f"Delivery_Challan_{clean_doc}.pdf"
    if download:
        headers = {"Content-Disposition": f'attachment; filename="{fname}"'}
    else:
        headers = {"Content-Disposition": "inline"}

    # 1. Check in-memory cache first
    if doc_no and doc_no in _DC_PDF_CACHE:
        return Response(content=_DC_PDF_CACHE[doc_no], media_type="application/pdf", headers=headers)
    if min_id in _DC_PDF_CACHE:
        return Response(content=_DC_PDF_CACHE[min_id], media_type="application/pdf", headers=headers)

    # 2. Check temp dir
    temp_dir = os.path.join(tempfile.gettempdir(), "nexus_generated_pdfs")
    if os.path.exists(temp_dir):
        cand = os.path.join(temp_dir, fname)
        if os.path.exists(cand):
            return FileResponse(cand, media_type="application/pdf", headers=headers)
        for f in os.listdir(temp_dir):
            if f.startswith("Delivery_Challan_") and f.endswith(".pdf"):
                if clean_doc in f or min_id in f:
                    return FileResponse(os.path.join(temp_dir, f), media_type="application/pdf", headers=headers)

    # 3. Check legacy frontend/assets/generated_pdfs if present
    legacy_dir = os.path.join("frontend", "assets", "generated_pdfs")
    if os.path.exists(legacy_dir):
        cand = os.path.join(legacy_dir, fname)
        if os.path.exists(cand):
            return FileResponse(cand, media_type="application/pdf", headers=headers)

    # 4. Generate on-the-fly if not found
    from app.services.delivery_challan_pdf_service import DeliveryChallanPdfService
    service = DeliveryChallanPdfService(db)
    result = service.generate_delivery_challan_and_ewaybill(
        min_id=min_id,
        min_payload={'document_no': doc_no} if doc_no else None,
        regenerate=True
    )
    if doc_no and doc_no in _DC_PDF_CACHE:
        return Response(content=_DC_PDF_CACHE[doc_no], media_type="application/pdf", headers=headers)
    if min_id in _DC_PDF_CACHE:
        return Response(content=_DC_PDF_CACHE[min_id], media_type="application/pdf", headers=headers)

    target_path = os.path.join(temp_dir, fname)
    if os.path.exists(target_path):
        return FileResponse(target_path, media_type="application/pdf", headers=headers)

    raise HTTPException(status_code=404, detail="Delivery Challan PDF not found")


@router.get("/lr-document", summary="Get stored LR Document from DB")
def get_stored_lr_document(po_no: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Retrieves stored LR document (PDF Data URI / URL) from purchase database.
    """
    try:
        if po_no:
            row = db.execute(text("SELECT lr_documents FROM nexus_purchase.purchase WHERE po_no = :po_no AND lr_documents IS NOT NULL LIMIT 1"), {"po_no": po_no}).fetchone()
        else:
            row = db.execute(text("SELECT lr_documents FROM nexus_purchase.purchase WHERE lr_documents IS NOT NULL LIMIT 1")).fetchone()
        if row and row[0]:
            return {"success": True, "lr_document": str(row[0])}
    except Exception as e:
        logger.warning(f"Error reading LR document from DB: {e}")

    fallback = "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA0OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrVAgwsFBIVMhIzMsvVUjOz1NQCEssUSguKUgsKklNysxLT1UIzUstS80r0VAvAQC9cw9KCmVuZHN0cmVhbQplbmRvYmoK"
    return {"success": True, "lr_document": fallback}


@router.get("/mrn/materials", summary="Get project materials for WH MRN")
def get_mrn_project_materials(db: Session = Depends(get_db)):
    """
    Fetches materials from nexus_project.project_materials linked to stock rates for WH MRN page.
    """
    try:
        sql = text("""
            SELECT 
                pm.material_management_id,
                pm.po_no,
                pm.site_id,
                pm.request_by,
                pm.request_date,
                pm.materials_name,
                pm.materials_description,
                pm.uom,
                COALESCE(pm.mrr_qty, 0) as mrr_qty,
                COALESCE(pm.mrn_qty, 0) as mrn_qty,
                COALESCE(sp.new_stock_price, s.stock_price, pm.rate, 450.00) as new_stock_rate,
                COALESCE(inv.new_stock_qty, s.stock_qty, 100.00) as stock_qty
            FROM nexus_project.project_materials pm
            LEFT JOIN nexus_inventory.inventry inv 
                ON LOWER(TRIM(inv.doc_no)) = LOWER(TRIM(pm.materials_description))
                OR LOWER(TRIM(inv.doc_no)) = LOWER(TRIM(pm.materials_name))
            LEFT JOIN nexus_inventory.stock s
                ON LOWER(TRIM(s.product_description)) = LOWER(TRIM(pm.materials_description))
                OR LOWER(TRIM(s.product_description)) = LOWER(TRIM(pm.materials_name))
            LEFT JOIN nexus_inventory.stock_price sp
                ON LOWER(TRIM(sp.product_description)) = LOWER(TRIM(pm.materials_description))
                OR LOWER(TRIM(sp.product_description)) = LOWER(TRIM(pm.materials_name))
            ORDER BY pm.material_management_id ASC
        """)
        rows = db.execute(sql).fetchall()
        materials = []
        for r in rows:
            materials.append({
                "id": f"mrn-db-{r[0]}",
                "po_no": r[1] or "",
                "site_id": r[2] or "IN-123456",
                "request_by": r[3] or "Project Site Engineer",
                "request_date": r[4].strftime("%d-%m-%Y") if r[4] else "14-10-2026",
                "material_name": r[5] or "Material",
                "material_description": r[6] or r[5] or "Material Description",
                "uom": r[7] or "Nos",
                "mrr_qty": float(r[8] or 0),
                "mrn_qty": float(r[9] or r[8] or 0),
                "rate": float(r[10] or 450.00),
                "stock_qty": float(r[11] or 100.00)
            })
        return {"success": True, "materials": materials}
    except Exception as e:
        logger.warning(f"Error fetching MRN project materials: {e}")
        return {"success": False, "materials": [], "error": str(e)}




