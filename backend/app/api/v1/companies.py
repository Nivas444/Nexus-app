from typing import Optional, List, Union
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.company_service import CompanyService
from app.schemas.company import (
    CompanyMasterDetailsUpdate,
    CompanyMasterDetailsResponse,
    CompanyBankAccountCreate,
    CompanyBankAccountUpdate,
    CompanyBankAccountResponse,
    CompanyOfficeLocationCreate,
    CompanyOfficeLocationUpdate,
    CompanyOfficeLocationResponse,
    CompanyHolidayCreate,
    CompanyHolidayResponse
)

router = APIRouter(tags=["Master - Company"])

# =============================================================================
# COMPANY MASTER DETAILS ENDPOINTS (VIEW & EDIT ONLY)
# =============================================================================

@router.get(
    "/master/company",
    response_model=CompanyMasterDetailsResponse,
    summary="Get Company Master Details"
)
def get_company(
    company_name: Optional[str] = Query(None, description="Company name identifier"),
    company_id: Optional[int] = Query(None, description="Company ID"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    identifier = company_id if company_id is not None else company_name
    return service.get_company_details(identifier)


@router.get(
    "/master/companies",
    response_model=List[CompanyMasterDetailsResponse],
    summary="List All Companies"
)
def list_companies(db: Session = Depends(get_db)):
    service = CompanyService(db)
    return service.list_companies()


@router.get(
    "/master/company/{company_id_or_name}",
    response_model=CompanyMasterDetailsResponse,
    summary="Get Company Master Details by ID or Name"
)
def get_company_by_param(
    company_id_or_name: str = Path(..., description="Company ID or Company Name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.get_company_details(company_id_or_name)


@router.put(
    "/master/company/{company_id_or_name}",
    response_model=CompanyMasterDetailsResponse,
    summary="Update Company Master Details"
)
def update_company(
    company_id_or_name: str = Path(..., description="Company ID or Company Name to update"),
    payload: CompanyMasterDetailsUpdate = ...,
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.update_company_details(company_id_or_name, payload)


# =============================================================================
# COMPANY BANK ACCOUNTS (ADD, VIEW, EDIT)
# =============================================================================

@router.get(
    "/master/company-bank-accounts",
    response_model=List[CompanyBankAccountResponse],
    summary="List Bank Accounts for Company"
)
def get_bank_accounts(
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.get_bank_accounts(company_name=company_name, status=status)


@router.post(
    "/master/company-bank-accounts",
    response_model=CompanyBankAccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Bank Account for Company"
)
def create_bank_account(
    payload: CompanyBankAccountCreate,
    company_name: Optional[str] = Query(None, description="Target company name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    target_company = company_name or payload.company_name or "Nexus"
    return service.create_bank_account(company_name=target_company, data=payload)


@router.put(
    "/master/company-bank-accounts/{bank_account_id}",
    response_model=CompanyBankAccountResponse,
    summary="Update Bank Account for Company"
)
def update_bank_account(
    bank_account_id: int = Path(..., ge=1, description="Bank account ID"),
    payload: CompanyBankAccountUpdate = ...,
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.update_bank_account(
        company_name=company_name,
        bank_account_id=bank_account_id,
        data=payload
    )


# =============================================================================
# COMPANY OFFICE LOCATIONS (ADD, VIEW, EDIT)
# =============================================================================

@router.get(
    "/master/company-locations",
    response_model=List[CompanyOfficeLocationResponse],
    summary="List Office Locations for Company"
)
def get_locations(
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.get_locations(company_name=company_name, status=status)


@router.post(
    "/master/company-locations",
    response_model=CompanyOfficeLocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Office Location for Company"
)
def create_location(
    payload: CompanyOfficeLocationCreate,
    company_name: Optional[str] = Query(None, description="Target company name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    target_company = company_name or payload.company_name or "Nexus"
    return service.create_location(company_name=target_company, data=payload)


@router.put(
    "/master/company-locations/{office_id}",
    response_model=CompanyOfficeLocationResponse,
    summary="Update Office Location for Company"
)
def update_location(
    office_id: int = Path(..., ge=1, description="Office location ID"),
    payload: CompanyOfficeLocationUpdate = ...,
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.update_location(
        company_name=company_name,
        office_id=office_id,
        data=payload
    )


# =============================================================================
# COMPANY HOLIDAYS (ADD ONLY)
# =============================================================================

@router.get(
    "/master/company-holidays",
    response_model=List[CompanyHolidayResponse],
    summary="List Holidays for Company"
)
def get_holidays(
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    year: Optional[int] = Query(None, description="Filter by year"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    return service.get_holidays(company_name=company_name, year=year, status=status)


@router.post(
    "/master/company-holidays",
    response_model=CompanyHolidayResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Holiday for Company (Add-only)"
)
def create_holiday(
    payload: CompanyHolidayCreate,
    company_name: Optional[str] = Query(None, description="Target company name"),
    db: Session = Depends(get_db)
):
    service = CompanyService(db)
    target_company = company_name or payload.company_name or "Nexus"
    return service.create_holiday(company_name=target_company, data=payload)
