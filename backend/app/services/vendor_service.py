from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vendor import VendorMaster, VendorPrice
from app.repositories.vendor_repository import VendorRepository
from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorBankUpdate,
    VendorContactUpdate,
    VendorStatusUpdate,
    VendorResponse,
    VendorListResponse,
    VendorPriceCreate,
    VendorPriceUpdate,
    VendorPriceResponse,
    VendorPriceListResponse
)

class VendorService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = VendorRepository(db)

    # =========================================================================
    # VENDOR MASTER SERVICES
    # =========================================================================

    def get_vendors_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        business_type: Optional[str] = None,
        service_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "vendor_id",
        sort_desc: bool = True
    ) -> VendorListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.get_list(
            skip=skip,
            limit=page_size,
            search=search,
            business_type=business_type,
            service_type=service_type,
            status=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        return VendorListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[VendorResponse.model_validate(item) for item in items]
        )

    def get_vendor_by_id(self, vendor_id: int) -> VendorResponse:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )
        return VendorResponse.model_validate(vendor)

    def create_vendor(self, payload: VendorCreate) -> VendorResponse:
        v_name = payload.vendor_name or payload.vendorName
        if not v_name or not v_name.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Vendor Name is required."
            )

        # Map fields to VendorMaster model
        vendor_data = {
            "company_name": payload.company_name or "Nexus",
            "vendor_name": v_name.strip(),
            "entity_type": payload.entity_type,
            "business_type": payload.business_type,
            "service_type": payload.service_type,
            "contract_type": payload.contract_type,
            "gst_number_available": payload.gst_number_available,
            "gst_number": payload.gst_number,
            "gst_certificate": payload.gst_certificate,
            "gst_type": payload.gst_type,
            "address": payload.address,
            "pan_number": payload.pan_number,
            "pan_documents": payload.pan_documents,
            "tds_deduction": payload.tds_deduction,
            "tds_rate": payload.tds_rate,
            "tds_code": payload.tds_code,
            "account_name": payload.account_name,
            "account_number": payload.account_number,
            "bank_name": payload.bank_name,
            "account_type": payload.account_type,
            "ifsc_code": payload.ifsc_code,
            "cancelled_cheque": payload.cancelled_cheque,
            "contact_name": payload.contact_name,
            "contact_number": payload.contact_number,
            "email": payload.email,
            "status": payload.status or "Active"
        }

        try:
            vendor = VendorMaster(**vendor_data)
            created_vendor = self.repo.create(vendor)
            return VendorResponse.model_validate(created_vendor)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create vendor: {str(e)}"
            )

    def update_vendor(self, vendor_id: int, payload: VendorUpdate) -> VendorResponse:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )

        # Update only non-None submitted fields (partial update safety)
        update_dict = payload.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            if hasattr(vendor, key) and value is not None:
                setattr(vendor, key, value)

        try:
            updated_vendor = self.repo.update(vendor)
            return VendorResponse.model_validate(updated_vendor)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update vendor: {str(e)}"
            )

    def update_vendor_status(self, vendor_id: int, payload: VendorStatusUpdate) -> VendorResponse:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )
        vendor.status = payload.status
        try:
            updated = self.repo.update(vendor)
            return VendorResponse.model_validate(updated)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update vendor status: {str(e)}"
            )

    def update_vendor_bank(self, vendor_id: int, payload: VendorBankUpdate) -> VendorResponse:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )

        if payload.account_name is not None:
            vendor.account_name = payload.account_name
        if payload.account_number is not None:
            vendor.account_number = payload.account_number
        if payload.bank_name is not None:
            vendor.bank_name = payload.bank_name
        if payload.account_type is not None:
            vendor.account_type = payload.account_type
        if payload.ifsc_code is not None:
            vendor.ifsc_code = payload.ifsc_code
        if payload.cancelled_cheque is not None:
            vendor.cancelled_cheque = payload.cancelled_cheque

        try:
            updated = self.repo.update(vendor)
            return VendorResponse.model_validate(updated)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update bank details: {str(e)}"
            )

    def update_vendor_contact(self, vendor_id: int, payload: VendorContactUpdate) -> VendorResponse:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )

        if payload.contact_name is not None:
            vendor.contact_name = payload.contact_name
        if payload.contact_number is not None:
            vendor.contact_number = payload.contact_number
        if payload.email is not None:
            vendor.email = payload.email

        try:
            updated = self.repo.update(vendor)
            return VendorResponse.model_validate(updated)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update contact details: {str(e)}"
            )

    def delete_vendor(self, vendor_id: int) -> None:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID '{vendor_id}' not found."
            )
        try:
            # Delete associated pricing records in transaction
            pricing_items, _ = self.repo.get_pricing_list(vendor_name=vendor.vendor_name, limit=1000)
            for p in pricing_items:
                self.db.delete(p)
            self.repo.delete(vendor)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete vendor: {str(e)}"
            )

    # =========================================================================
    # VENDOR PRICING / SUPPLY / SERVICE SCOPE SERVICES
    # =========================================================================

    def get_pricing_list(
        self,
        vendor_id: Optional[int] = None,
        vendor_name: Optional[str] = None,
        page: int = 1,
        page_size: int = 100,
        status_filter: Optional[str] = None
    ) -> VendorPriceListResponse:
        v_name = vendor_name
        if vendor_id:
            vendor = self.repo.get_by_id(vendor_id)
            if not vendor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Vendor with ID '{vendor_id}' not found."
                )
            v_name = vendor.vendor_name

        skip = (page - 1) * page_size
        items, total = self.repo.get_pricing_list(
            vendor_name=v_name,
            skip=skip,
            limit=page_size,
            status=status_filter
        )
        return VendorPriceListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[VendorPriceResponse.model_validate(item) for item in items]
        )

    def get_pricing_by_id(self, pricing_id: int) -> VendorPriceResponse:
        pricing = self.repo.get_pricing_by_id(pricing_id)
        if not pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor price record with ID '{pricing_id}' not found."
            )
        return VendorPriceResponse.model_validate(pricing)

    def create_pricing(self, payload: VendorPriceCreate, vendor_id: Optional[int] = None) -> VendorPriceResponse:
        v_name = payload.vendor_name or payload.vendorName
        if vendor_id:
            vendor = self.repo.get_by_id(vendor_id)
            if not vendor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Vendor with ID '{vendor_id}' not found."
                )
            v_name = vendor.vendor_name

        if not v_name or not v_name.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Vendor Name is required for supply/pricing record."
            )

        pricing_data = {
            "company_name": payload.company_name or "Nexus",
            "vendor_name": v_name.strip(),
            "product_name": payload.product_name,
            "sub_project_type": payload.sub_project_type,
            "item_description": payload.item_description,
            "vehicle_type": payload.vehicle_type,
            "vehicle_number": payload.vehicle_number,
            "fuel_type": payload.fuel_type,
            "range_value": payload.range_value,
            "rental_type": payload.rental_type,
            "service_description": payload.service_description,
            "from_date": payload.from_date,
            "to_date": payload.to_date,
            "rate": payload.rate,
            "status": payload.status or "Active"
        }

        try:
            pricing = VendorPrice(**pricing_data)
            created = self.repo.create_pricing(pricing)
            return VendorPriceResponse.model_validate(created)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create pricing record: {str(e)}"
            )

    def update_pricing(self, pricing_id: int, payload: VendorPriceUpdate) -> VendorPriceResponse:
        pricing = self.repo.get_pricing_by_id(pricing_id)
        if not pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor price record with ID '{pricing_id}' not found."
            )

        update_dict = payload.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(pricing, key) and value is not None:
                setattr(pricing, key, value)

        try:
            updated = self.repo.update_pricing(pricing)
            return VendorPriceResponse.model_validate(updated)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update pricing record: {str(e)}"
            )

    def delete_pricing(self, pricing_id: int) -> None:
        pricing = self.repo.get_pricing_by_id(pricing_id)
        if not pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor price record with ID '{pricing_id}' not found."
            )
        try:
            self.repo.delete_pricing(pricing)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete pricing record: {str(e)}"
            )
