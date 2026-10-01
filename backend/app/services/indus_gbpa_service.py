import math
from decimal import Decimal
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.indus_gbpa_repository import IndusGbpaRepository
from app.models.indus_gbpa import IndusCustomerGbpa
from app.schemas.indus_gbpa import (
    IndusGbpaCreate,
    IndusGbpaUpdate,
    IndusGbpaResponse,
    IndusGbpaListResponse
)

def _parse_numeric(val: Any) -> Optional[Decimal]:
    if val is None:
        return None
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        cleaned = val.replace(",", "").replace("%", "").replace("₹", "").strip()
        if not cleaned:
            return None
        try:
            return Decimal(cleaned)
        except Exception:
            return None
    return None

def _format_rate(val: Any) -> str:
    if val is None:
        return "0.00"
    try:
        return f"{float(val):.2f}"
    except Exception:
        return str(val)

def _format_gbpa_response(item: IndusCustomerGbpa) -> IndusGbpaResponse:
    rate_str = _format_rate(item.rate)
    budget_pct_str = f"{float(item.budget_percentage):.0f}" if item.budget_percentage is not None else ""
    budget_amt_str = _format_rate(item.budget_amount) if item.budget_amount is not None else ""

    return IndusGbpaResponse(
        item_id=item.item_id,
        id=item.item_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        item_code=item.item_code,
        itemCode=item.item_code,
        item_name=item.item_name,
        itemName=item.item_name,
        productName=item.item_name,
        item_description=item.item_description,
        itemDescription=item.item_description,
        productDescription=item.item_description,
        item_type=item.item_type,
        itemType=item.item_type,
        productType=item.item_type,
        hsn_sac=item.hsn_sac,
        hsnSacType=item.hsn_sac,
        hsn_sac_code=item.hsn_sac_code,
        hsnSacCode=item.hsn_sac_code,
        uom=item.uom or "Pcs",
        rate=rate_str,
        activeRate=rate_str,
        gst_rate=item.gst_rate,
        budget_percentage=item.budget_percentage,
        budgetPercent=budget_pct_str,
        budget_amount=item.budget_amount,
        budgetAmount=budget_amt_str,
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class IndusGbpaService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusGbpaRepository(db)

    def get_gbpa_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        item_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_id",
        sort_desc: bool = False
    ) -> IndusGbpaListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_items(
            skip=skip,
            limit=page_size,
            search=search,
            item_type=item_type,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        pages = math.ceil(total / page_size) if total > 0 else 1
        formatted_items = [_format_gbpa_response(item) for item in items]

        return IndusGbpaListResponse(
            items=formatted_items,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def get_gbpa_by_id(self, item_id: int) -> IndusGbpaResponse:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Item with ID {item_id} not found."
            )
        return _format_gbpa_response(item)

    def create_gbpa(self, payload: IndusGbpaCreate) -> IndusGbpaResponse:
        # Check uniqueness of item_code if provided
        if payload.item_code and payload.item_code.strip():
            existing_code = self.repo.get_by_item_code(payload.item_code.strip())
            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"GBPA Item Code '{payload.item_code.strip()}' already exists for Indus Tower Ltd."
                )

        # Check uniqueness of item_name if provided
        if payload.item_name and payload.item_name.strip():
            existing_name = self.repo.get_by_item_name(payload.item_name.strip())
            if existing_name:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"GBPA Item Name '{payload.item_name.strip()}' already exists for Indus Tower Ltd."
                )

        item_dict = {
            "company_name": payload.company_name or "Nexus",
            "customer_name": payload.customer_name or "Indus Tower Ltd",
            "item_code": payload.item_code.strip() if payload.item_code else None,
            "item_name": payload.item_name.strip() if payload.item_name else None,
            "item_description": payload.item_description.strip() if payload.item_description else None,
            "item_type": payload.item_type.strip() if payload.item_type else "Capex",
            "hsn_sac": payload.hsn_sac.strip() if payload.hsn_sac else "HSN",
            "hsn_sac_code": payload.hsn_sac_code.strip() if payload.hsn_sac_code else None,
            "uom": payload.uom.strip() if payload.uom else "Pcs",
            "rate": _parse_numeric(payload.rate),
            "gst_rate": _parse_numeric(payload.gst_rate),
            "budget_percentage": _parse_numeric(payload.budget_percentage),
            "budget_amount": _parse_numeric(payload.budget_amount),
            "status": payload.status.strip() if payload.status else "Active"
        }

        created = self.repo.create(item_dict)
        return _format_gbpa_response(created)

    def update_gbpa(self, item_id: int, payload: IndusGbpaUpdate) -> IndusGbpaResponse:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Item with ID {item_id} not found."
            )

        # Check uniqueness of item_code if changed
        if payload.item_code and payload.item_code.strip():
            existing_code = self.repo.get_by_item_code(payload.item_code.strip())
            if existing_code and existing_code.item_id != item_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"GBPA Item Code '{payload.item_code.strip()}' is already in use by another record."
                )

        # Check uniqueness of item_name if changed
        if payload.item_name and payload.item_name.strip():
            existing_name = self.repo.get_by_item_name(payload.item_name.strip())
            if existing_name and existing_name.item_id != item_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"GBPA Item Name '{payload.item_name.strip()}' is already in use by another record."
                )

        update_dict: Dict[str, Any] = {}
        if payload.company_name is not None:
            update_dict["company_name"] = payload.company_name.strip()
        if payload.customer_name is not None:
            update_dict["customer_name"] = payload.customer_name.strip()
        if payload.item_code is not None:
            update_dict["item_code"] = payload.item_code.strip() if payload.item_code else None
        if payload.item_name is not None:
            update_dict["item_name"] = payload.item_name.strip() if payload.item_name else None
        if payload.item_description is not None:
            update_dict["item_description"] = payload.item_description.strip() if payload.item_description else None
        if payload.item_type is not None:
            update_dict["item_type"] = payload.item_type.strip() if payload.item_type else None
        if payload.hsn_sac is not None:
            update_dict["hsn_sac"] = payload.hsn_sac.strip() if payload.hsn_sac else None
        if payload.hsn_sac_code is not None:
            update_dict["hsn_sac_code"] = payload.hsn_sac_code.strip() if payload.hsn_sac_code else None
        if payload.uom is not None:
            update_dict["uom"] = payload.uom.strip() if payload.uom else None
        if payload.rate is not None:
            update_dict["rate"] = _parse_numeric(payload.rate)
        if payload.gst_rate is not None:
            update_dict["gst_rate"] = _parse_numeric(payload.gst_rate)
        if payload.budget_percentage is not None:
            update_dict["budget_percentage"] = _parse_numeric(payload.budget_percentage)
        if payload.budget_amount is not None:
            update_dict["budget_amount"] = _parse_numeric(payload.budget_amount)
        if payload.status is not None:
            update_dict["status"] = payload.status.strip() if payload.status else "Active"

        updated = self.repo.update(item_id, update_dict)
        return _format_gbpa_response(updated)

    def delete_gbpa(self, item_id: int) -> Dict[str, Any]:
        success = self.repo.delete(item_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Item with ID {item_id} not found."
            )
        return {"success": True, "message": f"GBPA Item {item_id} deleted successfully."}

