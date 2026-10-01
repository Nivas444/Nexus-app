from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.indus_infra_repository import IndusInfraRepository
from app.schemas.indus_infra import (
    IndusInfraCreate,
    IndusInfraUpdate,
    IndusInfraResponse,
    IndusInfraListResponse
)

def _format_infra_response(item) -> IndusInfraResponse:
    comm_str = item.commissioning.isoformat() if item.commissioning else "No"
    return IndusInfraResponse(
        item_infrastructure_detail_id=item.item_infrastructure_detail_id,
        id=item.item_infrastructure_detail_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        customerName=item.customer_name,
        item_code=item.item_code,
        infra_category=item.infra_category,
        infraCategory=item.infra_category,
        infra_description=item.infra_description,
        infraDescription=item.infra_description,
        uom=item.uom,
        make=item.make,
        commissioning=comm_str,
        i_map=item.i_map,
        iMap=item.i_map,
        status=item.status,
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class IndusInfraService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusInfraRepository(db)

    def get_infra_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        infra_category: Optional[str] = None,
        sort_by: str = "item_infrastructure_detail_id",
        sort_desc: bool = False
    ) -> IndusInfraListResponse:
        items, total, total_pages = self.repo.get_all(
            page=page,
            page_size=page_size,
            search=search,
            customer_name=customer_name,
            status=status_filter,
            infra_category=infra_category,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        formatted_items = [_format_infra_response(item) for item in items]

        return IndusInfraListResponse(
            items=formatted_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    def get_infra_by_id(self, item_id: int) -> IndusInfraResponse:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )
        return _format_infra_response(item)

    def create_infra(self, payload: IndusInfraCreate) -> IndusInfraResponse:
        cat = payload.infra_category or payload.infraCategory
        if not cat or not cat.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Infra Category is required."
            )

        db_obj = self.repo.create(payload)
        return _format_infra_response(db_obj)

    def update_infra(self, item_id: int, payload: IndusInfraUpdate) -> IndusInfraResponse:
        db_obj = self.repo.get_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )

        updated_obj = self.repo.update(db_obj, payload)
        return _format_infra_response(updated_obj)

    def delete_infra(self, item_id: int) -> dict:
        deleted = self.repo.delete(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )
        return {"success": True, "message": f"Infrastructure record {item_id} deleted successfully."}
