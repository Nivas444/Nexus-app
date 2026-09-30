from typing import Optional, List, Union
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import calendar

from app.models.company import (
    CompanyMasterDetails,
    CompanyBankAccount,
    CompanyOfficeLocation,
    CompanyHoliday
)
from app.repositories.company_repository import CompanyRepository
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

class CompanyService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CompanyRepository(db)

    # =========================================================================
    # COMPANY MASTER DETAILS
    # =========================================================================

    def get_company_details(self, identifier: Optional[Union[int, str]] = None) -> CompanyMasterDetailsResponse:
        company = None
        if identifier is not None and str(identifier).strip():
            str_id = str(identifier).strip()
            if str_id.isdigit():
                company = self.repo.get_company_by_id(int(str_id))
            if not company:
                company = self.repo.get_company_by_name(str_id)
        
        if not company:
            company = self.repo.get_or_create_default("Nexus")

        return CompanyMasterDetailsResponse.model_validate(company)

    def list_companies(self) -> List[CompanyMasterDetailsResponse]:
        companies = self.repo.get_all_companies()
        if not companies:
            default_co = self.repo.get_or_create_default("Nexus")
            companies = [default_co]
        return [CompanyMasterDetailsResponse.model_validate(c) for c in companies]

    def update_company_details(
        self,
        identifier: Union[int, str],
        data: CompanyMasterDetailsUpdate
    ) -> CompanyMasterDetailsResponse:
        company = None
        str_id = str(identifier).strip()
        if str_id.isdigit():
            company = self.repo.get_company_by_id(int(str_id))
        if not company:
            company = self.repo.get_company_by_name(str_id)

        if not company:
            # If not found, get or create default
            company = self.repo.get_or_create_default(str_id if str_id else "Nexus")

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(company, field, value)

        updated = self.repo.update_company(company)
        return CompanyMasterDetailsResponse.model_validate(updated)

    # =========================================================================
    # BANK ACCOUNTS
    # =========================================================================

    def get_bank_accounts(self, company_name: str, status: Optional[str] = None) -> List[CompanyBankAccountResponse]:
        if not company_name or not company_name.strip():
            company_name = "Nexus"
        banks = self.repo.get_banks_by_company(company_name, status=status)
        return [CompanyBankAccountResponse.model_validate(b) for b in banks]

    def create_bank_account(self, company_name: str, data: CompanyBankAccountCreate) -> CompanyBankAccountResponse:
        if not company_name or not company_name.strip():
            company_name = "Nexus"

        payload = data.model_dump()
        payload["company_name"] = company_name

        bank = CompanyBankAccount(**payload)
        created = self.repo.create_bank(bank)
        return CompanyBankAccountResponse.model_validate(created)

    def update_bank_account(
        self,
        company_name: str,
        bank_account_id: int,
        data: CompanyBankAccountUpdate
    ) -> CompanyBankAccountResponse:
        bank = self.repo.get_bank_by_id(bank_account_id, company_name=company_name)
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bank account with ID {bank_account_id} not found for company '{company_name}'."
            )

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(bank, field, value)

        updated = self.repo.update_bank(bank)
        return CompanyBankAccountResponse.model_validate(updated)

    # =========================================================================
    # OFFICE LOCATIONS
    # =========================================================================

    def get_locations(self, company_name: str, status: Optional[str] = None) -> List[CompanyOfficeLocationResponse]:
        if not company_name or not company_name.strip():
            company_name = "Nexus"
        locations = self.repo.get_locations_by_company(company_name, status=status)
        return [CompanyOfficeLocationResponse.model_validate(loc) for loc in locations]

    def create_location(self, company_name: str, data: CompanyOfficeLocationCreate) -> CompanyOfficeLocationResponse:
        if not company_name or not company_name.strip():
            company_name = "Nexus"

        payload = data.model_dump()
        payload["company_name"] = company_name

        loc = CompanyOfficeLocation(**payload)
        created = self.repo.create_location(loc)
        return CompanyOfficeLocationResponse.model_validate(created)

    def update_location(
        self,
        company_name: str,
        office_id: int,
        data: CompanyOfficeLocationUpdate
    ) -> CompanyOfficeLocationResponse:
        loc = self.repo.get_location_by_id(office_id, company_name=company_name)
        if not loc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Office location with ID {office_id} not found for company '{company_name}'."
            )

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(loc, field, value)

        updated = self.repo.update_location(loc)
        return CompanyOfficeLocationResponse.model_validate(updated)

    # =========================================================================
    # HOLIDAYS (ADD ONLY)
    # =========================================================================

    def get_holidays(
        self,
        company_name: str,
        year: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[CompanyHolidayResponse]:
        if not company_name or not company_name.strip():
            company_name = "Nexus"
        holidays = self.repo.get_holidays_by_company(company_name, year=year, status=status)
        return [CompanyHolidayResponse.model_validate(h) for h in holidays]

    def create_holiday(self, company_name: str, data: CompanyHolidayCreate) -> CompanyHolidayResponse:
        if not company_name or not company_name.strip():
            company_name = "Nexus"

        payload = data.model_dump()
        payload["company_name"] = company_name

        dt = payload.get("date")
        if dt:
            if not payload.get("year"):
                payload["year"] = dt.year
            if not payload.get("month"):
                payload["month"] = calendar.month_name[dt.month]
            if not payload.get("day"):
                payload["day"] = calendar.day_name[dt.weekday()]

        holiday = CompanyHoliday(**payload)
        created = self.repo.create_holiday(holiday)
        return CompanyHolidayResponse.model_validate(created)
