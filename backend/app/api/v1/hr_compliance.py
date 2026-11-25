from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.hr_compliance_service import HRComplianceService
from app.schemas.hr_compliance import (
    HRComplianceCreate,
    HRComplianceResponse
)

router = APIRouter(prefix="/master/hr-compliance", tags=["Master - HR Compliance"])

@router.get(
    "",
    response_model=List[HRComplianceResponse],
    summary="List HR Compliance Records"
)
def list_compliance_records(
    company_name: Optional[str] = Query("Nexus", description="Company Name"),
    compliance_type: Optional[str] = Query(None, description="Filter by compliance type (EPF, ESI, PT, LWF, TDS, Leave, Bonus, Medical Insurance)"),
    db: Session = Depends(get_db)
):
    service = HRComplianceService(db)
    return service.list_compliance(company_name=company_name, compliance_type=compliance_type)

@router.post(
    "",
    response_model=HRComplianceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add HR Compliance Record"
)
def create_compliance_record(
    payload: HRComplianceCreate,
    company_name: Optional[str] = Query(None, description="Target company name"),
    db: Session = Depends(get_db)
):
    service = HRComplianceService(db)
    target_company = company_name or payload.company_name or "Nexus"
    return service.create_compliance(data=payload, company_name=target_company)


@router.put(
    "/{compliance_id}",
    response_model=HRComplianceResponse,
    summary="Update HR Compliance Record"
)
def update_compliance_record(
    compliance_id: int,
    payload: HRComplianceCreate,
    company_name: Optional[str] = Query(None, description="Target company name"),
    db: Session = Depends(get_db)
):
    service = HRComplianceService(db)
    return service.update_compliance(compliance_id=compliance_id, data=payload, company_name=company_name)
