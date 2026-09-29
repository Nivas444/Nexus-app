from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.customer_service import CustomerService
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerRestrictedUpdate,
    CustomerStatusUpdate,
    CustomerResponse,
    CustomerListResponse,
    CustomerContactCreate,
    CustomerContactResponse,
    CustomerContactListResponse,
    CustomerLocationCreate,
    CustomerLocationResponse,
    CustomerLocationListResponse
)

router = APIRouter(tags=["Master - Customers"])

# ----------------- Customer CRUD Endpoints -----------------

@router.get("/master/customers", response_model=CustomerListResponse, summary="List Master Customers")
@router.get("/customers", response_model=CustomerListResponse, summary="List Customers (Alias)", include_in_schema=False)
def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, code, or legal name"),
    business_type: Optional[str] = Query(None, description="Filter by Projects / Supply"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("customer_id", description="Column to sort by"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real customer records from PostgreSQL `customer` table with filtering, search, and pagination.
    """
    service = CustomerService(db)
    return service.get_customers_list(
        page=page,
        page_size=page_size,
        search=search,
        business_type=business_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/master/customers/{customer_id}", response_model=CustomerResponse, summary="Get Customer Details")
@router.get("/customers/{customer_id}", response_model=CustomerResponse, summary="Get Customer Details (Alias)", include_in_schema=False)
def get_customer(
    customer_id: int = Path(..., ge=1, description="Unique primary key of customer"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual customer record by its primary key (`customer_id`).
    """
    service = CustomerService(db)
    return service.get_customer_by_id(customer_id)

@router.post("/master/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer")
@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer (Alias)", include_in_schema=False)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new customer in the `customer` table. Enforces uniqueness on customer_name, customer_code, and legal_name.
    """
    service = CustomerService(db)
    return service.create_customer(payload)

@router.put("/master/customers/{customer_id}", response_model=CustomerResponse, summary="Update Customer")
@router.put("/customers/{customer_id}", response_model=CustomerResponse, summary="Update Customer (Alias)", include_in_schema=False)
def update_customer(
    customer_id: int = Path(..., ge=1, description="Unique primary key of customer"),
    payload: CustomerUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing customer record in the `customer` table.
    """
    service = CustomerService(db)
    return service.update_customer(customer_id, payload)

@router.put("/master/customers/{customer_id}/restricted", response_model=CustomerResponse, summary="Indus Banner Restricted Edit")
@router.put("/customers/{customer_id}/restricted", response_model=CustomerResponse, summary="Indus Banner Restricted Edit (Alias)", include_in_schema=False)
def update_restricted_customer(
    customer_id: int = Path(..., ge=1, description="Unique primary key of customer"),
    payload: CustomerRestrictedUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Restricted update specifically for Indus Tower Top Green Banner workflow.
    Only allows editing GST, GST Number, GST Type, Address, and Status.
    Modifications to customer name, legal name, code, or business type are rejected with 422.
    """
    service = CustomerService(db)
    return service.update_restricted_customer(customer_id, payload)

@router.patch("/master/customers/{customer_id}/status", response_model=CustomerResponse, summary="Toggle Customer Status")
@router.patch("/customers/{customer_id}/status", response_model=CustomerResponse, summary="Toggle Customer Status (Alias)", include_in_schema=False)
def update_customer_status(
    customer_id: int = Path(..., ge=1, description="Unique primary key of customer"),
    payload: CustomerStatusUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update customer status (Active / In - Active).
    """
    service = CustomerService(db)
    return service.update_status(customer_id, payload)

@router.delete("/master/customers/{customer_id}", summary="Delete Customer")
@router.delete("/customers/{customer_id}", summary="Delete Customer (Alias)", include_in_schema=False)
def delete_customer(
    customer_id: int = Path(..., ge=1, description="Unique primary key of customer"),
    db: Session = Depends(get_db)
):
    """
    Delete a customer from `customer` table.
    """
    service = CustomerService(db)
    return service.delete_customer(customer_id)

# ----------------- Contact Details Endpoints -----------------

@router.get("/customers/{customer_id}/contacts", response_model=CustomerContactListResponse, summary="List Customer Contacts by ID", include_in_schema=False)
@router.get("/customers/{customer_id}/contact-details", response_model=CustomerContactListResponse, summary="List Customer Contact Details by ID", include_in_schema=False)
@router.get("/master/customers/{customer_id}/contacts", response_model=CustomerContactListResponse, summary="List Customer Contacts by ID")
@router.get("/master/customers/{customer_id}/contact-details", response_model=CustomerContactListResponse, summary="List Customer Contact Details by ID", include_in_schema=False)
@router.get("/customer-contacts", response_model=CustomerContactListResponse, summary="List Customer Contacts")
def list_contacts(
    customer_id: Optional[int] = None,
    customer_name: Optional[str] = Query(None, description="Filter contacts by customer name"),
    db: Session = Depends(get_db)
):
    """
    Retrieve contact details records from `customer_contact_details`.
    """
    service = CustomerService(db)
    return service.get_contacts(customer_id=customer_id, customer_name=customer_name)

@router.post("/customer-contacts", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Contact")
@router.post("/customers/{customer_id}/contacts", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Contact by Customer ID", include_in_schema=False)
@router.post("/customers/{customer_id}/contact-details", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Contact by Customer ID", include_in_schema=False)
@router.post("/master/customers/{customer_id}/contacts", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Contact by Customer ID", include_in_schema=False)
@router.post("/master/customers/{customer_id}/contact-details", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Contact by Customer ID", include_in_schema=False)
def create_contact(
    payload: CustomerContactCreate,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Save contact details into `customer_contact_details`.
    """
    service = CustomerService(db)
    return service.create_contact(payload, customer_id=customer_id)

@router.delete("/customer-contacts/{contact_id}", summary="Delete Customer Contact", include_in_schema=False)
def delete_contact(
    contact_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.delete_contact(contact_id)

# ----------------- Office Location Details Endpoints -----------------

@router.get("/customers/{customer_id}/locations", response_model=CustomerLocationListResponse, summary="List Customer Locations by ID", include_in_schema=False)
@router.get("/customers/{customer_id}/office-locations", response_model=CustomerLocationListResponse, summary="List Customer Office Locations by ID", include_in_schema=False)
@router.get("/master/customers/{customer_id}/locations", response_model=CustomerLocationListResponse, summary="List Customer Locations by ID")
@router.get("/master/customers/{customer_id}/office-locations", response_model=CustomerLocationListResponse, summary="List Customer Office Locations by ID", include_in_schema=False)
@router.get("/customer-locations", response_model=CustomerLocationListResponse, summary="List Customer Locations")
def list_locations(
    customer_id: Optional[int] = None,
    customer_name: Optional[str] = Query(None, description="Filter locations by customer name"),
    db: Session = Depends(get_db)
):
    """
    Retrieve office locations from `customer_office_location_details`.
    """
    service = CustomerService(db)
    return service.get_locations(customer_id=customer_id, customer_name=customer_name)

@router.post("/customer-locations", response_model=CustomerLocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Location")
@router.post("/customers/{customer_id}/locations", response_model=CustomerLocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Location by Customer ID", include_in_schema=False)
@router.post("/customers/{customer_id}/office-locations", response_model=CustomerLocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Office Location by Customer ID", include_in_schema=False)
@router.post("/master/customers/{customer_id}/locations", response_model=CustomerLocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Location by Customer ID", include_in_schema=False)
@router.post("/master/customers/{customer_id}/office-locations", response_model=CustomerLocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Customer Office Location by Customer ID", include_in_schema=False)
def create_location(
    payload: CustomerLocationCreate,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Save office location into `customer_office_location_details`.
    """
    service = CustomerService(db)
    return service.create_location(payload, customer_id=customer_id)

@router.delete("/customer-locations/{office_id}", summary="Delete Customer Location", include_in_schema=False)
def delete_location(
    office_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.delete_location(office_id)
