from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.company import (
    CompanyMasterDetails,
    CompanyBankAccount,
    CompanyOfficeLocation,
    CompanyHoliday
)

class CompanyRepository:
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # COMPANY MASTER DETAILS
    # =========================================================================

    def get_company_by_id(self, company_id: int) -> Optional[CompanyMasterDetails]:
        return self.db.query(CompanyMasterDetails).filter(CompanyMasterDetails.company_id == company_id).first()

    def get_company_by_name(self, company_name: str) -> Optional[CompanyMasterDetails]:
        if not company_name or not company_name.strip():
            return None
        return self.db.query(CompanyMasterDetails).filter(
            func.lower(CompanyMasterDetails.company_name) == company_name.strip().lower()
        ).first()

    def get_all_companies(self) -> List[CompanyMasterDetails]:
        return self.db.query(CompanyMasterDetails).order_by(CompanyMasterDetails.company_id.asc()).all()

    def get_or_create_default(self, default_name: str = "Nexus") -> CompanyMasterDetails:
        company = self.get_company_by_name(default_name)
        if not company:
            # Check if any company exists
            first = self.db.query(CompanyMasterDetails).order_by(CompanyMasterDetails.company_id.asc()).first()
            if first:
                return first
            # Seed default Nexus company master record
            company = CompanyMasterDetails(
                company_name=default_name,
                company_legal_name="Nexus Enterprise Ltd",
                entity_type="Private Limited",
                industry="Telecommunications & Infrastructure",
                state="Maharashtra"
            )
            self.db.add(company)
            self.db.commit()
            self.db.refresh(company)
        return company

    def update_company(self, company: CompanyMasterDetails) -> CompanyMasterDetails:
        self.db.commit()
        self.db.refresh(company)
        return company

    # =========================================================================
    # COMPANY BANK ACCOUNTS
    # =========================================================================

    def get_bank_by_id(self, bank_account_id: int, company_name: Optional[str] = None) -> Optional[CompanyBankAccount]:
        query = self.db.query(CompanyBankAccount).filter(CompanyBankAccount.bank_account_id == bank_account_id)
        if company_name:
            query = query.filter(func.lower(CompanyBankAccount.company_name) == company_name.strip().lower())
        return query.first()

    def get_banks_by_company(self, company_name: str, status: Optional[str] = None) -> List[CompanyBankAccount]:
        query = self.db.query(CompanyBankAccount).filter(
            func.lower(CompanyBankAccount.company_name) == company_name.strip().lower()
        )
        if status:
            cleaned_status = "In - Active" if ("in" in status.lower() or "inactive" in status.lower() or "false" in status.lower()) else "Active"
            query = query.filter(CompanyBankAccount.status == cleaned_status)
        return query.order_by(CompanyBankAccount.bank_account_id.desc()).all()

    def create_bank(self, bank: CompanyBankAccount) -> CompanyBankAccount:
        self.db.add(bank)
        self.db.commit()
        self.db.refresh(bank)
        return bank

    def update_bank(self, bank: CompanyBankAccount) -> CompanyBankAccount:
        self.db.commit()
        self.db.refresh(bank)
        return bank

    # =========================================================================
    # COMPANY OFFICE LOCATIONS
    # =========================================================================

    def get_location_by_id(self, office_id: int, company_name: Optional[str] = None) -> Optional[CompanyOfficeLocation]:
        query = self.db.query(CompanyOfficeLocation).filter(CompanyOfficeLocation.office_id == office_id)
        if company_name:
            query = query.filter(func.lower(CompanyOfficeLocation.company_name) == company_name.strip().lower())
        return query.first()

    def get_locations_by_company(self, company_name: str, status: Optional[str] = None) -> List[CompanyOfficeLocation]:
        query = self.db.query(CompanyOfficeLocation).filter(
            func.lower(CompanyOfficeLocation.company_name) == company_name.strip().lower()
        )
        if status:
            cleaned_status = "In - Active" if ("in" in status.lower() or "inactive" in status.lower() or "false" in status.lower()) else "Active"
            query = query.filter(CompanyOfficeLocation.status == cleaned_status)
        return query.order_by(CompanyOfficeLocation.office_id.desc()).all()

    def create_location(self, location: CompanyOfficeLocation) -> CompanyOfficeLocation:
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location

    def update_location(self, location: CompanyOfficeLocation) -> CompanyOfficeLocation:
        self.db.commit()
        self.db.refresh(location)
        return location

    # =========================================================================
    # COMPANY HOLIDAYS
    # =========================================================================

    def get_holidays_by_company(
        self,
        company_name: str,
        year: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[CompanyHoliday]:
        query = self.db.query(CompanyHoliday).filter(
            func.lower(CompanyHoliday.company_name) == company_name.strip().lower()
        )
        if year:
            query = query.filter(CompanyHoliday.year == year)
        if status:
            cleaned_status = "In - Active" if ("in" in status.lower() or "inactive" in status.lower() or "false" in status.lower()) else "Active"
            query = query.filter(CompanyHoliday.status == cleaned_status)
        return query.order_by(CompanyHoliday.date.asc(), CompanyHoliday.holiday_id.asc()).all()

    def create_holiday(self, holiday: CompanyHoliday) -> CompanyHoliday:
        self.db.add(holiday)
        self.db.commit()
        self.db.refresh(holiday)
        return holiday
