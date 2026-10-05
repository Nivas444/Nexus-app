from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_gbpa_service import IndusGbpaService
from app.schemas.indus_gbpa import (
    IndusGbpaCreate,
    IndusGbpaUpdate,
    IndusGbpaResponse,
    IndusGbpaListResponse
)

router = APIRouter(tags=["Customer - Indus GBPA"])

@router.get("/customer/indus/gbpa", response_model=IndusGbpaListResponse, summary="List Indus GBPA Items")
@router.get("/customer/indus/products", response_model=IndusGbpaListResponse, summary="List Indus GBPA Items (Products Alias)", include_in_schema=False)
@router.get("/indus/gbpa", response_model=IndusGbpaListResponse, summary="List Indus GBPA Items (Direct Alias)", include_in_schema=False)
@router.get("/indus/products", response_model=IndusGbpaListResponse, summary="List Indus GBPA Items (Direct Products Alias)", include_in_schema=False)
def list_gbpa(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by item code, name, description, HSN/SAC code, UOM"),
    item_type: Optional[str] = Query(None, description="Filter by item type (Capex / Opex)"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("item_id", description="Column to sort by"),
    sort_desc: bool = Query(False, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real Indus Tower GBPA items from PostgreSQL `indus_customer_gbpa` table.
    """
    service = IndusGbpaService(db)
    return service.get_gbpa_list(
        page=page,
        page_size=page_size,
        search=search,
        item_type=item_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/gbpa/{item_id}", response_model=IndusGbpaResponse, summary="Get Indus GBPA Item")
@router.get("/customer/indus/products/{item_id}", response_model=IndusGbpaResponse, summary="Get Indus GBPA Item (Products Alias)", include_in_schema=False)
@router.get("/indus/gbpa/{item_id}", response_model=IndusGbpaResponse, summary="Get Indus GBPA Item (Direct Alias)", include_in_schema=False)
@router.get("/indus/products/{item_id}", response_model=IndusGbpaResponse, summary="Get Indus GBPA Item (Direct Products Alias)", include_in_schema=False)
def get_gbpa(
    item_id: int = Path(..., ge=1, description="Unique primary key `item_id` of GBPA item"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual Indus GBPA item by primary key `item_id`.
    """
    service = IndusGbpaService(db)
    return service.get_gbpa_by_id(item_id)

@router.post("/customer/indus/gbpa", response_model=IndusGbpaResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus GBPA Item")
@router.post("/customer/indus/products", response_model=IndusGbpaResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus GBPA Item (Products Alias)", include_in_schema=False)
@router.post("/indus/gbpa", response_model=IndusGbpaResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus GBPA Item (Direct Alias)", include_in_schema=False)
@router.post("/indus/products", response_model=IndusGbpaResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus GBPA Item (Direct Products Alias)", include_in_schema=False)
def create_gbpa(
    payload: IndusGbpaCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new GBPA item in `indus_customer_gbpa`.
    """
    service = IndusGbpaService(db)
    return service.create_gbpa(payload)

@router.put("/customer/indus/gbpa/{item_id}", response_model=IndusGbpaResponse, summary="Update Indus GBPA Item")
@router.put("/customer/indus/products/{item_id}", response_model=IndusGbpaResponse, summary="Update Indus GBPA Item (Products Alias)", include_in_schema=False)
@router.put("/indus/gbpa/{item_id}", response_model=IndusGbpaResponse, summary="Update Indus GBPA Item (Direct Alias)", include_in_schema=False)
@router.put("/indus/products/{item_id}", response_model=IndusGbpaResponse, summary="Update Indus GBPA Item (Direct Products Alias)", include_in_schema=False)
def update_gbpa(
    payload: IndusGbpaUpdate,
    item_id: int = Path(..., ge=1, description="Unique primary key `item_id` of GBPA item"),
    db: Session = Depends(get_db)
):
    """
    Update an existing GBPA item by primary key `item_id` in `indus_customer_gbpa`.
    """
    service = IndusGbpaService(db)
    return service.update_gbpa(item_id, payload)

@router.delete("/customer/indus/gbpa/{item_id}", summary="Delete Indus GBPA Item")
@router.delete("/customer/indus/products/{item_id}", summary="Delete Indus GBPA Item (Products Alias)", include_in_schema=False)
@router.delete("/indus/gbpa/{item_id}", summary="Delete Indus GBPA Item (Direct Alias)", include_in_schema=False)
@router.delete("/indus/products/{item_id}", summary="Delete Indus GBPA Item (Direct Products Alias)", include_in_schema=False)
def delete_gbpa(
    item_id: int = Path(..., ge=1, description="Unique primary key `item_id` of GBPA item"),
    db: Session = Depends(get_db)
):
    """
    Delete an Indus GBPA item by primary key `item_id`.
    """
    service = IndusGbpaService(db)
    return service.delete_gbpa(item_id)

from fastapi import File, UploadFile

@router.post("/customer/indus/gbpa/bulk-upload", summary="Bulk Upload GBPA Items")
@router.post("/customer/indus/products/bulk-upload", summary="Bulk Upload GBPA Items (Products Alias)", include_in_schema=False)
@router.post("/indus/gbpa/bulk-upload", summary="Bulk Upload GBPA Items (Direct Alias)", include_in_schema=False)
@router.post("/indus/products/bulk-upload", summary="Bulk Upload GBPA Items (Direct Products Alias)", include_in_schema=False)
async def bulk_upload_gbpa(
    file: UploadFile = File(..., description="Official Indus GBPA Excel (.xlsx/.xls) or CSV template file"),
    db: Session = Depends(get_db)
):
    """
    Bulk import GBPA items into `indus_customer_gbpa` with template structure validation and idempotency retry safety.
    """
    content = await file.read()
    service = IndusGbpaService(db)
    return service.process_bulk_upload(content, filename=file.filename or "")


