from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.indus_esh_repository import IndusEshRepository
from app.schemas.indus_esh import (
    IndusEshCreate,
    IndusEshUpdate,
    IndusEshResponse,
    IndusEshListResponse
)

def _format_esh_response(item) -> IndusEshResponse:
    exp_str = item.expiry_date.strftime("%d - %m - %Y") if item.expiry_date else None
    return IndusEshResponse(
        id=item.id,
        company_name=item.company_name,
        companyName=item.company_name,
        serviceVendorName=item.company_name if item.employee_type == "Service Vendor" else None,
        name=item.name,
        employee_type=item.employee_type,
        employeeType=item.employee_type,
        aadhar_number=item.aadhar_number,
        aadharNumber=item.aadhar_number,
        training_type=item.training_type,
        trainingType=item.training_type,
        training_id_number=item.training_id_number,
        trainingIdNumber=item.training_id_number,
        training_agency=item.training_agency,
        trainingAgency=item.training_agency,
        expiry_date=exp_str,
        expiryDate=exp_str,
        status=item.status or "Active"
    )

class IndusEshService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusEshRepository(db)

    def get_esh_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        company_name: Optional[str] = None,
        employee_type: Optional[str] = None,
        training_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "id",
        sort_desc: bool = False
    ) -> IndusEshListResponse:
        items, total, total_pages = self.repo.get_all(
            page=page,
            page_size=page_size,
            search=search,
            company_name=company_name,
            employee_type=employee_type,
            training_type=training_type,
            status=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        formatted_items = [_format_esh_response(item) for item in items]

        return IndusEshListResponse(
            items=formatted_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    def get_esh_by_id(self, item_id: int) -> IndusEshResponse:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ESH record with ID {item_id} not found."
            )
        return _format_esh_response(item)

    def create_esh(self, payload: IndusEshCreate) -> IndusEshResponse:
        name = (payload.name or payload.serviceVendorName or "").strip()
        if not name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Name or Service Vendor Name is required."
            )

        db_obj = self.repo.create(payload)
        return _format_esh_response(db_obj)

    def update_esh(self, item_id: int, payload: IndusEshUpdate) -> IndusEshResponse:
        db_obj = self.repo.get_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ESH record with ID {item_id} not found."
            )

        updated_obj = self.repo.update(db_obj, payload)
        return _format_esh_response(updated_obj)

    def delete_esh(self, item_id: int) -> dict:
        deleted = self.repo.delete(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ESH record with ID {item_id} not found."
            )
        return {"success": True, "message": f"ESH record {item_id} deleted successfully."}
