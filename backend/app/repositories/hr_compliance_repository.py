from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.hr_compliance import HRCompliance

class HRComplianceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, record: HRCompliance) -> HRCompliance:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_by_id(self, compliance_id: int) -> Optional[HRCompliance]:
        return self.db.query(HRCompliance).filter(HRCompliance.compliance_id == compliance_id).first()

    def list_by_company_and_type(
        self,
        company_name: Optional[str] = None,
        compliance_type: Optional[str] = None
    ) -> List[HRCompliance]:
        query = self.db.query(HRCompliance)
        if company_name and company_name.strip():
            query = query.filter(func.lower(HRCompliance.company_name) == company_name.strip().lower())
        if compliance_type and compliance_type.strip():
            query = query.filter(func.lower(HRCompliance.compliance_type) == compliance_type.strip().lower())
        return query.order_by(HRCompliance.compliance_id.desc()).all()
