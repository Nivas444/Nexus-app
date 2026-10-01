from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.indus_site import IndusSiteDetails
from app.repositories.indus_site_repository import IndusSiteRepository
from app.schemas.indus_site import (
    IndusSiteCreate,
    IndusSiteUpdate,
    IndusSiteResponse,
    IndusSiteListResponse,
    IndusSiteContactItem,
    IndusSiteContactSave,
    IndusSiteContactListResponse,
    parse_status_field
)

class IndusSiteService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusSiteRepository(db)

    def _extract_contacts(self, site: IndusSiteDetails) -> List[IndusSiteContactItem]:
        contacts: List[IndusSiteContactItem] = []
        if site.fse_name or site.fse_contact_number or site.fse_email:
            contacts.append(
                IndusSiteContactItem(
                    id="SC-FSE",
                    name=site.fse_name or "",
                    designation="Site Engineer",
                    contact=site.fse_contact_number or "",
                    contact_number=site.fse_contact_number or "",
                    email=site.fse_email or "",
                    status=site.status or "Active",
                    site_id=site.site_id,
                    site_code=site.site_code or ""
                )
            )
        if site.aom_name or site.aom_contact_number or site.aom_email:
            contacts.append(
                IndusSiteContactItem(
                    id="SC-AOM",
                    name=site.aom_name or "",
                    designation="Operations Officer",
                    contact=site.aom_contact_number or "",
                    contact_number=site.aom_contact_number or "",
                    email=site.aom_email or "",
                    status=site.status or "Active",
                    site_id=site.site_id,
                    site_code=site.site_code or ""
                )
            )
        return contacts

    def _to_response(self, site: IndusSiteDetails) -> IndusSiteResponse:
        contacts = self._extract_contacts(site)
        return IndusSiteResponse(
            id=site.site_id,
            site_id=site.site_id,
            site_code=site.site_code,
            siteCode=site.site_code,
            siteId=site.site_code,
            wh_id=site.wh_id,
            whId=site.wh_id,
            site_name=site.site_name,
            siteName=site.site_name,
            tower_type=site.tower_type,
            towerType=site.tower_type,
            district=site.district,
            town=site.town,
            address=site.address,
            latitude=str(site.latitude) if site.latitude is not None else None,
            longitude=str(site.longitude) if site.longitude is not None else None,
            transport_zone=site.transport_zone,
            transportZone=site.transport_zone,
            fse_name=site.fse_name,
            fse_contact_number=site.fse_contact_number,
            fse_email=site.fse_email,
            aom_name=site.aom_name,
            aom_contact_number=site.aom_contact_number,
            aom_email=site.aom_email,
            status=site.status or "Active",
            company_name=site.company_name or "Nexus",
            customer_name=site.customer_name or "Indus Tower Ltd",
            contacts=contacts,
            created_at=site.created_at,
            updated_at=site.updated_at
        )

    def get_sites_list(
        self,
        page: int = 1,
        page_size: int = 50,
        search: Optional[str] = None,
        tower_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "site_id",
        sort_desc: bool = True
    ) -> IndusSiteListResponse:
        items, total = self.repo.list_sites(
            page=page,
            page_size=page_size,
            search=search,
            tower_type=tower_type,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        return IndusSiteListResponse(
            total=total,
            items=[self._to_response(item) for item in items],
            page=page,
            page_size=page_size
        )

    def get_site_by_id(self, site_id: int) -> IndusSiteResponse:
        site = self.repo.get_by_id(site_id)
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} not found."
            )
        return self._to_response(site)

    def create_site(self, payload: IndusSiteCreate) -> IndusSiteResponse:
        site_code = (payload.site_code or "").strip()
        site_name = (payload.site_name or "").strip()

        if not site_code:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Site ID is required."
            )
        if not site_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Site Name is required."
            )

        # Enforce unique site_code
        existing_code = self.repo.get_by_code(site_code)
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Site ID '{site_code}' already exists."
            )

        # Enforce unique site_name
        existing_name = self.repo.get_by_name(site_name)
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Site Name '{site_name}' already exists."
            )

        site_data: Dict[str, Any] = {
            "company_name": payload.company_name or "Nexus",
            "customer_name": payload.customer_name or "Indus Tower Ltd",
            "site_code": site_code,
            "wh_id": payload.wh_id.strip() if payload.wh_id else None,
            "site_name": site_name,
            "tower_type": payload.tower_type.strip() if payload.tower_type else None,
            "district": payload.district.strip() if payload.district else None,
            "town": payload.town.strip() if payload.town else None,
            "address": payload.address.strip() if payload.address else None,
            "latitude": payload.latitude if payload.latitude not in ("", None) else None,
            "longitude": payload.longitude if payload.longitude not in ("", None) else None,
            "transport_zone": payload.transport_zone.strip() if payload.transport_zone else None,
            "fse_name": payload.fse_name.strip() if payload.fse_name else None,
            "fse_contact_number": payload.fse_contact_number.strip() if payload.fse_contact_number else None,
            "fse_email": payload.fse_email.strip() if payload.fse_email else None,
            "aom_name": payload.aom_name.strip() if payload.aom_name else None,
            "aom_contact_number": payload.aom_contact_number.strip() if payload.aom_contact_number else None,
            "aom_email": payload.aom_email.strip() if payload.aom_email else None,
            "status": parse_status_field(payload.status)
        }

        try:
            site = self.repo.create(site_data)
            return self._to_response(site)
        except IntegrityError as e:
            self.db.rollback()
            err_msg = str(e.orig).lower()
            if "site_code" in err_msg or "site_id" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Site ID '{site_code}' already exists."
                )
            if "site_name" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Site Name '{site_name}' already exists."
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Database constraint violation: {str(e.orig)}"
            )

    def update_site(self, site_id: int, payload: IndusSiteUpdate) -> IndusSiteResponse:
        existing = self.repo.get_by_id(site_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} not found."
            )

        site_code = (payload.site_code or existing.site_code or "").strip()
        site_name = (payload.site_name or existing.site_name or "").strip()

        if not site_code:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Site ID cannot be empty."
            )
        if not site_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Site Name cannot be empty."
            )

        # Check unique site_code (excluding current site_id)
        existing_code = self.repo.get_by_code(site_code, exclude_id=site_id)
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Site ID '{site_code}' already exists on another site."
            )

        # Check unique site_name (excluding current site_id)
        existing_name = self.repo.get_by_name(site_name, exclude_id=site_id)
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Site Name '{site_name}' already exists on another site."
            )

        update_dict: Dict[str, Any] = {}
        if payload.site_code is not None:
            update_dict["site_code"] = site_code
        if payload.site_name is not None:
            update_dict["site_name"] = site_name
        if payload.wh_id is not None:
            update_dict["wh_id"] = payload.wh_id.strip() if payload.wh_id else None
        if payload.tower_type is not None:
            update_dict["tower_type"] = payload.tower_type.strip() if payload.tower_type else None
        if payload.district is not None:
            update_dict["district"] = payload.district.strip() if payload.district else None
        if payload.town is not None:
            update_dict["town"] = payload.town.strip() if payload.town else None
        if payload.address is not None:
            update_dict["address"] = payload.address.strip() if payload.address else None
        if payload.latitude is not None:
            update_dict["latitude"] = payload.latitude if payload.latitude not in ("", None) else None
        if payload.longitude is not None:
            update_dict["longitude"] = payload.longitude if payload.longitude not in ("", None) else None
        if payload.transport_zone is not None:
            update_dict["transport_zone"] = payload.transport_zone.strip() if payload.transport_zone else None
        if payload.fse_name is not None:
            update_dict["fse_name"] = payload.fse_name.strip() if payload.fse_name else None
        if payload.fse_contact_number is not None:
            update_dict["fse_contact_number"] = payload.fse_contact_number.strip() if payload.fse_contact_number else None
        if payload.fse_email is not None:
            update_dict["fse_email"] = payload.fse_email.strip() if payload.fse_email else None
        if payload.aom_name is not None:
            update_dict["aom_name"] = payload.aom_name.strip() if payload.aom_name else None
        if payload.aom_contact_number is not None:
            update_dict["aom_contact_number"] = payload.aom_contact_number.strip() if payload.aom_contact_number else None
        if payload.aom_email is not None:
            update_dict["aom_email"] = payload.aom_email.strip() if payload.aom_email else None
        if payload.status is not None:
            update_dict["status"] = parse_status_field(payload.status)

        try:
            updated = self.repo.update(site_id, update_dict)
            return self._to_response(updated)
        except IntegrityError as e:
            self.db.rollback()
            err_msg = str(e.orig).lower()
            if "site_code" in err_msg or "site_id" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Site ID '{site_code}' already exists."
                )
            if "site_name" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Site Name '{site_name}' already exists."
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Database constraint violation: {str(e.orig)}"
            )

    def delete_site(self, site_id: int) -> dict:
        site = self.repo.get_by_id(site_id)
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} not found."
            )
        self.repo.delete(site_id)
        return {"success": True, "message": f"Site {site_id} deleted successfully."}

    def get_site_contacts(self, site_id: int) -> IndusSiteContactListResponse:
        site = self.repo.get_by_id(site_id)
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} not found."
            )
        contacts = self._extract_contacts(site)
        return IndusSiteContactListResponse(
            total=len(contacts),
            items=contacts
        )

    def save_site_contact(self, site_id: int, payload: IndusSiteContactSave) -> IndusSiteContactListResponse:
        site = self.repo.get_by_id(site_id)
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} not found."
            )

        desig = str(payload.designation or "").lower()
        cid = str(payload.id or "").upper()
        
        update_dict: Dict[str, Any] = {}
        if "engineer" in desig or "fse" in desig or cid == "SC-FSE" or cid == "1":
            if payload.name is not None:
                update_dict["fse_name"] = payload.name.strip() if payload.name else None
            if payload.contact_number is not None:
                update_dict["fse_contact_number"] = payload.contact_number.strip() if payload.contact_number else None
            if payload.email is not None:
                update_dict["fse_email"] = payload.email.strip() if payload.email else None
        else: # Default to AOM / Operations Officer
            if payload.name is not None:
                update_dict["aom_name"] = payload.name.strip() if payload.name else None
            if payload.contact_number is not None:
                update_dict["aom_contact_number"] = payload.contact_number.strip() if payload.contact_number else None
            if payload.email is not None:
                update_dict["aom_email"] = payload.email.strip() if payload.email else None

        updated = self.repo.update(site_id, update_dict)
        contacts = self._extract_contacts(updated)
        return IndusSiteContactListResponse(
            total=len(contacts),
            items=contacts
        )
