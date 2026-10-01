from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_esh_service import IndusEshService
from app.schemas.indus_esh import (
    IndusEshCreate,
    IndusEshUpdate,
    IndusEshResponse,
    IndusEshListResponse
)

router = APIRouter(tags=["Customer - Indus ESH"])

@router.get("/customer/indus/esh", response_model=IndusEshListResponse, summary="List Indus ESH Trainee Records")
@router.get("/indus/esh", response_model=IndusEshListResponse, summary="List Indus ESH Trainee Records (Direct Alias)", include_in_schema=False)
def list_esh(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, company, Aadhar, training ID, agency"),
    company_name: Optional[str] = Query(None, description="Filter by company name"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name alias"),
    employee_type: Optional[str] = Query(None, description="Filter by Employee Type (On-Roll / Contract / Service Vendor)"),
    training_type: Optional[str] = Query(None, description="Filter by Training Type"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_desc: bool = Query(False, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real Indus Tower ESH details from PostgreSQL `indus_esh_details` table.
    """
    service = IndusEshService(db)
    comp = company_name or customer_name or "Indus Tower Ltd"
    return service.get_esh_list(
        page=page,
        page_size=page_size,
        search=search,
        company_name=comp,
        employee_type=employee_type,
        training_type=training_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/esh/{item_id}", response_model=IndusEshResponse, summary="Get Indus ESH Record")
@router.get("/indus/esh/{item_id}", response_model=IndusEshResponse, summary="Get Indus ESH Record (Direct Alias)", include_in_schema=False)
def get_esh(
    item_id: int = Path(..., ge=1, description="Unique primary key `id` of ESH record"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual ESH record by primary key `id`.
    """
    service = IndusEshService(db)
    return service.get_esh_by_id(item_id)

@router.post("/customer/indus/esh", response_model=IndusEshResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus ESH Record")
@router.post("/indus/esh", response_model=IndusEshResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus ESH Record (Direct Alias)", include_in_schema=False)
def create_esh(
    payload: IndusEshCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new ESH trainee record in `indus_esh_details`.
    """
    service = IndusEshService(db)
    return service.create_esh(payload)

@router.put("/customer/indus/esh/{item_id}", response_model=IndusEshResponse, summary="Update Indus ESH Record")
@router.put("/indus/esh/{item_id}", response_model=IndusEshResponse, summary="Update Indus ESH Record (Direct Alias)", include_in_schema=False)
def update_esh(
    payload: IndusEshUpdate,
    item_id: int = Path(..., ge=1, description="Unique primary key `id` of ESH record"),
    db: Session = Depends(get_db)
):
    """
    Update an existing ESH trainee record by primary key `id` in `indus_esh_details`.
    """
    service = IndusEshService(db)
    return service.update_esh(item_id, payload)

@router.delete("/customer/indus/esh/{item_id}", summary="Delete Indus ESH Record")
@router.delete("/indus/esh/{item_id}", summary="Delete Indus ESH Record (Direct Alias)", include_in_schema=False)
def delete_esh(
    item_id: int = Path(..., ge=1, description="Unique primary key `id` of ESH record"),
    db: Session = Depends(get_db)
):
    """
    Delete an Indus ESH record by primary key `id`.
    """
    service = IndusEshService(db)
    return service.delete_esh(item_id)
