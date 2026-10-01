from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_infra_service import IndusInfraService
from app.schemas.indus_infra import (
    IndusInfraCreate,
    IndusInfraUpdate,
    IndusInfraResponse,
    IndusInfraListResponse
)

router = APIRouter(tags=["Customer - Indus Infra"])

@router.get("/customer/indus/infra", response_model=IndusInfraListResponse, summary="List Indus Infrastructure Details")
@router.get("/indus/infra", response_model=IndusInfraListResponse, summary="List Indus Infrastructure Details (Direct Alias)", include_in_schema=False)
def list_infra(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by category, description, make, uom, item code"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    infra_category: Optional[str] = Query(None, description="Filter by Infra Category"),
    sort_by: str = Query("item_infrastructure_detail_id", description="Column to sort by"),
    sort_desc: bool = Query(False, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real Indus Tower Infrastructure details from PostgreSQL `indus_customer_infra` table.
    """
    service = IndusInfraService(db)
    return service.get_infra_list(
        page=page,
        page_size=page_size,
        search=search,
        customer_name=customer_name,
        status_filter=status,
        infra_category=infra_category,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/infra/{item_id}", response_model=IndusInfraResponse, summary="Get Indus Infrastructure Record")
@router.get("/indus/infra/{item_id}", response_model=IndusInfraResponse, summary="Get Indus Infrastructure Record (Direct Alias)", include_in_schema=False)
def get_infra(
    item_id: int = Path(..., ge=1, description="Unique primary key `item_infrastructure_detail_id`"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual Infrastructure record by primary key `item_infrastructure_detail_id`.
    """
    service = IndusInfraService(db)
    return service.get_infra_by_id(item_id)

@router.post("/customer/indus/infra", response_model=IndusInfraResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Infrastructure Record")
@router.post("/indus/infra", response_model=IndusInfraResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Infrastructure Record (Direct Alias)", include_in_schema=False)
def create_infra(
    payload: IndusInfraCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new Infrastructure record in `indus_customer_infra`.
    """
    service = IndusInfraService(db)
    return service.create_infra(payload)

@router.put("/customer/indus/infra/{item_id}", response_model=IndusInfraResponse, summary="Update Indus Infrastructure Record")
@router.put("/indus/infra/{item_id}", response_model=IndusInfraResponse, summary="Update Indus Infrastructure Record (Direct Alias)", include_in_schema=False)
def update_infra(
    payload: IndusInfraUpdate,
    item_id: int = Path(..., ge=1, description="Unique primary key `item_infrastructure_detail_id`"),
    db: Session = Depends(get_db)
):
    """
    Update an existing Infrastructure record by primary key `item_infrastructure_detail_id` in `indus_customer_infra`.
    """
    service = IndusInfraService(db)
    return service.update_infra(item_id, payload)

@router.delete("/customer/indus/infra/{item_id}", summary="Delete Indus Infrastructure Record")
@router.delete("/indus/infra/{item_id}", summary="Delete Indus Infrastructure Record (Direct Alias)", include_in_schema=False)
def delete_infra(
    item_id: int = Path(..., ge=1, description="Unique primary key `item_infrastructure_detail_id`"),
    db: Session = Depends(get_db)
):
    """
    Delete an Indus Infrastructure record by primary key `item_infrastructure_detail_id`.
    """
    service = IndusInfraService(db)
    return service.delete_infra(item_id)
