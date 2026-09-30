from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.vendor_service import VendorService
from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorBankUpdate,
    VendorContactUpdate,
    VendorStatusUpdate,
    VendorResponse,
    VendorListResponse,
    VendorPriceCreate,
    VendorPriceUpdate,
    VendorPriceResponse,
    VendorPriceListResponse
)

router = APIRouter(tags=["Master - Vendors"])

# =============================================================================
# VENDOR MASTER ENDPOINTS
# =============================================================================

@router.get("/master/vendors", response_model=VendorListResponse, summary="List Master Vendors")
def list_vendors(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, GST, PAN, contact, or bank"),
    business_type: Optional[str] = Query(None, description="Filter by business type"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("vendor_id", description="Column to sort by"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.get_vendors_list(
        page=page,
        page_size=page_size,
        search=search,
        business_type=business_type,
        service_type=service_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/master/vendors/{vendor_id}", response_model=VendorResponse, summary="Get Vendor Details")
def get_vendor(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.get_vendor_by_id(vendor_id)

@router.post("/master/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Vendor")
def create_vendor(
    payload: VendorCreate,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.create_vendor(payload)

@router.put("/master/vendors/{vendor_id}", response_model=VendorResponse, summary="Update Master Vendor")
def update_vendor(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    payload: VendorUpdate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.update_vendor(vendor_id, payload)

@router.patch("/master/vendors/{vendor_id}/status", response_model=VendorResponse, summary="Update Vendor Status")
def update_vendor_status(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    payload: VendorStatusUpdate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.update_vendor_status(vendor_id, payload)

@router.put("/master/vendors/{vendor_id}/bank", response_model=VendorResponse, summary="Update Vendor Bank Details")
def update_vendor_bank(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    payload: VendorBankUpdate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.update_vendor_bank(vendor_id, payload)

@router.put("/master/vendors/{vendor_id}/contact", response_model=VendorResponse, summary="Update Vendor Contact Details")
def update_vendor_contact(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    payload: VendorContactUpdate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.update_vendor_contact(vendor_id, payload)

@router.delete("/master/vendors/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Vendor")
def delete_vendor(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    service.delete_vendor(vendor_id)
    return None

# =============================================================================
# VENDOR PRICING / SUPPLY / SERVICE SCOPE ENDPOINTS
# =============================================================================

@router.get("/master/vendors/{vendor_id}/pricing", response_model=VendorPriceListResponse, summary="Get Vendor Pricing / Scopes")
def get_vendor_pricing_by_vendor(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.get_pricing_list(vendor_id=vendor_id, page=page, page_size=page_size, status_filter=status)

@router.post("/master/vendors/{vendor_id}/pricing", response_model=VendorPriceResponse, status_code=status.HTTP_201_CREATED, summary="Create Pricing / Scope for Vendor")
def create_pricing_for_vendor(
    vendor_id: int = Path(..., ge=1, description="Unique ID of the vendor"),
    payload: VendorPriceCreate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.create_pricing(payload, vendor_id=vendor_id)

@router.get("/master/vendor-pricing", response_model=VendorPriceListResponse, summary="List All Vendor Pricing / Scopes")
def list_vendor_pricing(
    vendor_name: Optional[str] = Query(None, description="Filter by vendor name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.get_pricing_list(vendor_name=vendor_name, page=page, page_size=page_size, status_filter=status)

@router.get("/master/vendor-pricing/{pricing_id}", response_model=VendorPriceResponse, summary="Get Vendor Pricing Record")
def get_vendor_pricing_item(
    pricing_id: int = Path(..., ge=1, description="Unique ID of vendor price record"),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.get_pricing_by_id(pricing_id)

@router.post("/master/vendor-pricing", response_model=VendorPriceResponse, status_code=status.HTTP_201_CREATED, summary="Create Vendor Pricing Record")
def create_vendor_pricing_item(
    payload: VendorPriceCreate,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.create_pricing(payload)

@router.put("/master/vendor-pricing/{pricing_id}", response_model=VendorPriceResponse, summary="Update Vendor Pricing Record")
def update_vendor_pricing_item(
    pricing_id: int = Path(..., ge=1, description="Unique ID of vendor price record"),
    payload: VendorPriceUpdate = ...,
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    return service.update_pricing(pricing_id, payload)

@router.delete("/master/vendor-pricing/{pricing_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Vendor Pricing Record")
def delete_vendor_pricing_item(
    pricing_id: int = Path(..., ge=1, description="Unique ID of vendor price record"),
    db: Session = Depends(get_db)
):
    service = VendorService(db)
    service.delete_pricing(pricing_id)
    return None
