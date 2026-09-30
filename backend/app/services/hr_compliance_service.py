from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hr_compliance import HRCompliance
from app.repositories.hr_compliance_repository import HRComplianceRepository
from app.schemas.hr_compliance import (
    HRComplianceCreate,
    HRComplianceResponse,
    HRComplianceListResponse,
    ALLOWED_COMPLIANCE_TYPES
)

class HRComplianceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = HRComplianceRepository(db)

    def create_compliance(
        self,
        data: HRComplianceCreate,
        company_name: Optional[str] = None
    ) -> HRComplianceResponse:
        # Validate compliance_type
        c_type = data.compliance_type.strip() if data.compliance_type else ""
        if c_type not in ALLOWED_COMPLIANCE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid compliance_type '{c_type}'. Supported types: {', '.join(ALLOWED_COMPLIANCE_TYPES)}"
            )

        target_company = company_name or data.company_name or "Nexus"

        record_data = data.model_dump(exclude={"compliance_id"})
        record_data["company_name"] = target_company
        record_data["compliance_type"] = c_type

        try:
            record = HRCompliance(**record_data)
            saved = self.repo.create(record)
            return HRComplianceResponse.model_validate(saved)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist HR compliance record: {str(e)}"
            )

    def list_compliance(
        self,
        company_name: Optional[str] = None,
        compliance_type: Optional[str] = None
    ) -> List[HRComplianceResponse]:
        records = self.repo.list_by_company_and_type(
            company_name=company_name,
            compliance_type=compliance_type
        )
        return [HRComplianceResponse.model_validate(r) for r in records]
