from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.indus_site import IndusSiteDetails

class IndusSiteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, site_id: int) -> Optional[IndusSiteDetails]:
        return self.db.query(IndusSiteDetails).filter(IndusSiteDetails.site_id == site_id).first()

    def get_by_code(self, site_code: str, exclude_id: Optional[int] = None) -> Optional[IndusSiteDetails]:
        if not site_code or not site_code.strip():
            return None
        query = self.db.query(IndusSiteDetails).filter(
            func.lower(func.trim(IndusSiteDetails.site_code)) == site_code.strip().lower()
        )
        if exclude_id:
            query = query.filter(IndusSiteDetails.site_id != exclude_id)
        return query.first()

    def get_by_name(self, site_name: str, exclude_id: Optional[int] = None) -> Optional[IndusSiteDetails]:
        if not site_name or not site_name.strip():
            return None
        query = self.db.query(IndusSiteDetails).filter(
            func.lower(func.trim(IndusSiteDetails.site_name)) == site_name.strip().lower()
        )
        if exclude_id:
            query = query.filter(IndusSiteDetails.site_id != exclude_id)
        return query.first()

    def list_sites(
        self,
        page: int = 1,
        page_size: int = 50,
        search: Optional[str] = None,
        tower_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "site_id",
        sort_desc: bool = True
    ) -> Tuple[List[IndusSiteDetails], int]:
        query = self.db.query(IndusSiteDetails)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusSiteDetails.site_code.ilike(term),
                    IndusSiteDetails.site_name.ilike(term),
                    IndusSiteDetails.wh_id.ilike(term),
                    IndusSiteDetails.town.ilike(term),
                    IndusSiteDetails.district.ilike(term),
                    IndusSiteDetails.transport_zone.ilike(term),
                    IndusSiteDetails.fse_name.ilike(term),
                    IndusSiteDetails.aom_name.ilike(term)
                )
            )

        if tower_type and tower_type.strip() and tower_type.strip().lower() != "all":
            query = query.filter(IndusSiteDetails.tower_type.ilike(f"%{tower_type.strip()}%"))

        if status_filter and status_filter.strip() and status_filter.strip().lower() != "all":
            if "in" in status_filter.lower() or "inactive" in status_filter.lower():
                query = query.filter(IndusSiteDetails.status == "In - Active")
            else:
                query = query.filter(IndusSiteDetails.status == "Active")

        total = query.count()

        # Sorting
        sort_col = getattr(IndusSiteDetails, sort_by, IndusSiteDetails.site_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def create(self, site_data: dict) -> IndusSiteDetails:
        site = IndusSiteDetails(**site_data)
        self.db.add(site)
        self.db.commit()
        self.db.refresh(site)
        return site

    def update(self, site_id: int, site_data: dict) -> Optional[IndusSiteDetails]:
        site = self.get_by_id(site_id)
        if not site:
            return None
        for key, value in site_data.items():
            if hasattr(site, key):
                setattr(site, key, value)
        self.db.commit()
        self.db.refresh(site)
        return site

    def delete(self, site_id: int) -> bool:
        site = self.get_by_id(site_id)
        if not site:
            return False
        self.db.delete(site)
        self.db.commit()
        return True
