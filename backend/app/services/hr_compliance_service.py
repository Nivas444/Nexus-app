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

        # Keep unrelated compliance tabs' status columns NULL instead of defaulting all 8 to 'Active'
        status_col_map = {
            "EPF": "epf_status",
            "ESI": "esi_status",
            "PT": "pt_status",
            "LWF": "lwf_status",
            "TDS": "tds_status",
            "Leave": "leave_status",
            "Bonus": "bonus_status",
            "Medical Insurance": "medical_insurance_status",
        }
        active_status_col = status_col_map.get(c_type)
        for t_key, s_col in status_col_map.items():
            if s_col != active_status_col:
                record_data[s_col] = None

        # Filter record_data to existing model columns
        valid_cols = {c.name for c in HRCompliance.__table__.columns}
        filtered_data = {k: v for k, v in record_data.items() if k in valid_cols}

        try:
            record = HRCompliance(**filtered_data)
            saved = self.repo.create(record)
            return HRComplianceResponse.model_validate(saved)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist HR compliance record: {str(e)}"
            )

    def update_compliance(
        self,
        compliance_id: int,
        data: HRComplianceCreate,
        company_name: Optional[str] = None
    ) -> HRComplianceResponse:
        existing = self.repo.get_by_id(compliance_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"HR Compliance record {compliance_id} not found."
            )

        c_type = data.compliance_type.strip() if data.compliance_type else existing.compliance_type
        if c_type not in ALLOWED_COMPLIANCE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid compliance_type '{c_type}'. Supported types: {', '.join(ALLOWED_COMPLIANCE_TYPES)}"
            )

        record_data = data.model_dump(exclude={"compliance_id"}, exclude_unset=True)
        if company_name:
            record_data["company_name"] = company_name
        record_data["compliance_type"] = c_type

        valid_cols = {c.name for c in HRCompliance.__table__.columns}
        for k, v in record_data.items():
            if k in valid_cols and k != "compliance_id":
                setattr(existing, k, v)

        try:
            updated = self.repo.update(existing)
            return HRComplianceResponse.model_validate(updated)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update HR compliance record: {str(e)}"
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
