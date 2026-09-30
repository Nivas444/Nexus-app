from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.vendor import VendorMaster, VendorPrice

class VendorRepository:
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # VENDOR MASTER REPOSITORY METHODS
    # =========================================================================

    def get_by_id(self, vendor_id: int) -> Optional[VendorMaster]:
        return self.db.query(VendorMaster).filter(VendorMaster.vendor_id == vendor_id).first()

    def get_by_vendor_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[VendorMaster]:
        if not name or not name.strip():
            return None
        query = self.db.query(VendorMaster).filter(func.lower(VendorMaster.vendor_name) == name.strip().lower())
        if exclude_id:
            query = query.filter(VendorMaster.vendor_id != exclude_id)
        return query.first()

    def get_list(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        business_type: Optional[str] = None,
        service_type: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "vendor_id",
        sort_desc: bool = True
    ) -> Tuple[List[VendorMaster], int]:
        query = self.db.query(VendorMaster)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    VendorMaster.vendor_name.ilike(search_pattern),
                    VendorMaster.entity_type.ilike(search_pattern),
                    VendorMaster.business_type.ilike(search_pattern),
                    VendorMaster.service_type.ilike(search_pattern),
                    VendorMaster.contract_type.ilike(search_pattern),
                    VendorMaster.gst_number.ilike(search_pattern),
                    VendorMaster.pan_number.ilike(search_pattern),
                    VendorMaster.address.ilike(search_pattern),
                    VendorMaster.contact_name.ilike(search_pattern),
                    VendorMaster.contact_number.ilike(search_pattern),
                    VendorMaster.email.ilike(search_pattern),
                    VendorMaster.bank_name.ilike(search_pattern),
                    VendorMaster.account_number.ilike(search_pattern)
                )
            )

        if business_type:
            query = query.filter(func.lower(VendorMaster.business_type) == business_type.strip().lower())

        if service_type:
            query = query.filter(func.lower(VendorMaster.service_type) == service_type.strip().lower())

        if status:
            cleaned_status = "In - Active" if ("in" in status.lower() or "inactive" in status.lower() or "false" in status.lower()) else "Active"
            query = query.filter(VendorMaster.status == cleaned_status)

        total = query.count()

        # Sorting
        sort_column = getattr(VendorMaster, sort_by, VendorMaster.vendor_id)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, vendor: VendorMaster) -> VendorMaster:
        self.db.add(vendor)
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def update(self, vendor: VendorMaster) -> VendorMaster:
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def delete(self, vendor: VendorMaster) -> None:
        self.db.delete(vendor)
        self.db.commit()

    # =========================================================================
    # VENDOR PRICE REPOSITORY METHODS
    # =========================================================================

    def get_pricing_by_id(self, vendor_service_id: int) -> Optional[VendorPrice]:
        return self.db.query(VendorPrice).filter(VendorPrice.vendor_service_id == vendor_service_id).first()

    def get_pricing_list(
        self,
        vendor_name: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> Tuple[List[VendorPrice], int]:
        query = self.db.query(VendorPrice)

        if vendor_name:
            query = query.filter(func.lower(VendorPrice.vendor_name) == vendor_name.strip().lower())

        if status:
            cleaned_status = "In - Active" if ("in" in status.lower() or "inactive" in status.lower()) else "Active"
            query = query.filter(VendorPrice.status == cleaned_status)

        total = query.count()
        items = query.order_by(desc(VendorPrice.vendor_service_id)).offset(skip).limit(limit).all()
        return items, total

    def create_pricing(self, pricing: VendorPrice) -> VendorPrice:
        self.db.add(pricing)
        self.db.commit()
        self.db.refresh(pricing)
        return pricing

    def update_pricing(self, pricing: VendorPrice) -> VendorPrice:
        self.db.commit()
        self.db.refresh(pricing)
        return pricing

    def delete_pricing(self, pricing: VendorPrice) -> None:
        self.db.delete(pricing)
        self.db.commit()
