from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_site_service import IndusSiteService
from app.schemas.indus_site import (
    IndusSiteCreate,
    IndusSiteUpdate,
    IndusSiteResponse,
    IndusSiteListResponse,
    IndusSiteContactSave,
    IndusSiteContactListResponse
)

router = APIRouter(tags=["Customer - Indus Sites"])

# ----------------- Indus Site Endpoints -----------------

@router.get("/customer/indus/sites", response_model=IndusSiteListResponse, summary="List Indus Sites")
@router.get("/master/indus/sites", response_model=IndusSiteListResponse, summary="List Indus Sites (Master Alias)", include_in_schema=False)
@router.get("/indus/sites", response_model=IndusSiteListResponse, summary="List Indus Sites (Direct Alias)", include_in_schema=False)
def list_sites(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by site code, name, WH ID, town, district, FSE, AOM"),
    tower_type: Optional[str] = Query(None, description="Filter by tower type (GBT, RTT, Pole)"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("site_id", description="Column to sort by"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real Indus Tower site records from PostgreSQL `indus_site_details` table.
    """
    service = IndusSiteService(db)
    return service.get_sites_list(
        page=page,
        page_size=page_size,
        search=search,
        tower_type=tower_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Get Indus Site Details")
@router.get("/master/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Get Indus Site Details (Master Alias)", include_in_schema=False)
@router.get("/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Get Indus Site Details (Direct Alias)", include_in_schema=False)
def get_site(
    site_id: int = Path(..., ge=1, description="Unique primary key of site"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual Indus site record by primary key `site_id`, including its mapped contacts.
    """
    service = IndusSiteService(db)
    return service.get_site_by_id(site_id)

@router.post("/customer/indus/sites", response_model=IndusSiteResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Site")
@router.post("/master/indus/sites", response_model=IndusSiteResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Site (Master Alias)", include_in_schema=False)
@router.post("/indus/sites", response_model=IndusSiteResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Site (Direct Alias)", include_in_schema=False)
def create_site(
    payload: IndusSiteCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new site record in `indus_site_details`.
    Enforces uniqueness for both Site ID (`site_code`) and Site Name (`site_name`).
    """
    service = IndusSiteService(db)
    return service.create_site(payload)

@router.put("/customer/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Update Indus Site")
@router.put("/master/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Update Indus Site (Master Alias)", include_in_schema=False)
@router.put("/indus/sites/{site_id}", response_model=IndusSiteResponse, summary="Update Indus Site (Direct Alias)", include_in_schema=False)
def update_site(
    site_id: int = Path(..., ge=1, description="Unique primary key of site"),
    payload: IndusSiteUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing site in `indus_site_details`.
    Enforces uniqueness for both Site ID and Site Name against other records.
    """
    service = IndusSiteService(db)
    return service.update_site(site_id, payload)

@router.delete("/customer/indus/sites/{site_id}", summary="Delete Indus Site")
def delete_site(
    site_id: int = Path(..., ge=1, description="Unique primary key of site"),
    db: Session = Depends(get_db)
):
    """
    Delete a site record from `indus_site_details`.
    """
    service = IndusSiteService(db)
    return service.delete_site(site_id)

# ----------------- Site Contact Details Endpoints -----------------

@router.get("/customer/indus/sites/{site_id}/contacts", response_model=IndusSiteContactListResponse, summary="List Contacts for Selected Site")
@router.get("/master/indus/sites/{site_id}/contacts", response_model=IndusSiteContactListResponse, summary="List Contacts for Selected Site (Alias)", include_in_schema=False)
def get_site_contacts(
    site_id: int = Path(..., ge=1, description="Unique primary key of site"),
    db: Session = Depends(get_db)
):
    """
    Retrieve only the contacts associated with the selected site.
    """
    service = IndusSiteService(db)
    return service.get_site_contacts(site_id)

@router.post("/customer/indus/sites/{site_id}/contacts", response_model=IndusSiteContactListResponse, summary="Save Contact for Selected Site")
@router.put("/customer/indus/sites/{site_id}/contacts", response_model=IndusSiteContactListResponse, summary="Update Contact for Selected Site", include_in_schema=False)
@router.post("/master/indus/sites/{site_id}/contacts", response_model=IndusSiteContactListResponse, summary="Save Contact for Selected Site (Alias)", include_in_schema=False)
def save_site_contact(
    site_id: int = Path(..., ge=1, description="Unique primary key of site"),
    payload: IndusSiteContactSave = ...,
    db: Session = Depends(get_db)
):
    """
    Save or update contact information for the selected site directly in `indus_site_details`.
    """
    service = IndusSiteService(db)
    return service.save_site_contact(site_id, payload)
