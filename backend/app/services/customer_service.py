from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.customer import Customer, CustomerContact, CustomerOfficeLocation
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerRestrictedUpdate,
    CustomerStatusUpdate,
    CustomerResponse,
    CustomerListResponse,
    CustomerContactCreate,
    CustomerContactResponse,
    CustomerContactListResponse,
    CustomerLocationCreate,
    CustomerLocationResponse,
    CustomerLocationListResponse,
    parse_status_field
)

class CustomerService:
    def __init__(self, db: Session):
        self.repository = CustomerRepository(db)

    def _to_response_dto(self, c: Customer) -> CustomerResponse:
        """Converts an ORM Customer model instance to a CustomerResponse schema with dual field mappings."""
        gst_on = bool(c.gst_number and c.gst_number != "NA")
        return CustomerResponse(
            id=c.customer_id,
            customer_id=c.customer_id,
            customer_name=c.customer_name or "",
            customerName=c.customer_name or "",
            legal_name=c.legal_name or c.customer_name or "",
            legalName=c.legal_name or c.customer_name or "",
            customer_code=c.customer_code or "",
            customerCode=c.customer_code or "",
            customerId=c.customer_code or str(c.customer_id),
            business_type=c.business_type or "Projects",
            businessType=c.business_type or "Projects",
            gst_type=c.gst_type or "SGST",
            gstType=c.gst_type or "SGST",
            gst_number=c.gst_number or "NA",
            gstNumber=c.gst_number or "NA",
            pan_number=c.pan_number or "",
            panNumber=c.pan_number or "",
            invoice_type=c.invoice_type or "B2B",
            invoiceType=c.invoice_type or "B2B",
            po_stating_3_digits=c.po_stating_3_digits or "",
            poDigits=c.po_stating_3_digits or "",
            gst_address=c.gst_address or "",
            address=c.gst_address or "",
            status=c.status or "Active",
            company_name=c.company_name or "Nexus",
            gstEnabled=gst_on,
            created_at=c.created_at,
            updated_at=c.updated_at
        )

    def _to_contact_dto(self, c: CustomerContact) -> CustomerContactResponse:
        return CustomerContactResponse(
            id=c.contact_id,
            contact_id=c.contact_id,
            customer_name=c.customer_name or "",
            customerName=c.customer_name or "",
            name=c.name or "",
            designation=c.designation or "",
            contact_number=c.contact_number or "",
            contact=c.contact_number or "",
            email=c.email or "",
            status=c.status or "Active",
            created_at=c.created_at,
            updated_at=c.updated_at
        )

    def _to_location_dto(self, l: CustomerOfficeLocation) -> CustomerLocationResponse:
        lat_str = str(l.latitude) if l.latitude is not None else ""
        lng_str = str(l.longitude) if l.longitude is not None else ""
        return CustomerLocationResponse(
            id=l.office_id,
            office_id=l.office_id,
            customer_name=l.customer_name or "",
            customerName=l.customer_name or "",
            office_name=l.office_name or "",
            officeName=l.office_name or "",
            latitude=lat_str,
            longitude=lng_str,
            status=l.status or "Active",
            created_at=l.created_at,
            updated_at=l.updated_at
        )

    def get_customers_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        business_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "customer_id",
        sort_desc: bool = True
    ) -> CustomerListResponse:
        page = max(1, page)
        page_size = max(1, min(page_size, 500))
        skip = (page - 1) * page_size

        items, total = self.repository.get_list(
            skip=skip,
            limit=page_size,
            search=search,
            business_type=business_type,
            status=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        response_items = [self._to_response_dto(item) for item in items]
        return CustomerListResponse(
            total=total,
            items=response_items,
            page=page,
            page_size=page_size
        )

    def get_customer_by_id(self, customer_id: int) -> CustomerResponse:
        c = self.repository.get_by_id(customer_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )
        return self._to_response_dto(c)

    def create_customer(self, data: CustomerCreate) -> CustomerResponse:
        c_name = (data.customer_name or data.customerName or data.legal_name or data.legalName or "").strip()
        l_name = (data.legal_name or data.legalName or c_name).strip()

        if not c_name:
            raise HTTPException(
                status_code=422,
                detail="Customer Name is required."
            )

        # Indus Towers variant special check (Only 1 Indus Towers record allowable in entire system)
        from app.repositories.customer_repository import is_indus_variant
        if is_indus_variant(c_name) or is_indus_variant(l_name):
            existing_indus = self.repository.get_existing_indus()
            if existing_indus:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Indus Towers Ltd already exists. Only one Indus Towers customer record is allowable."
                )

        # Uniqueness checks
        if self.repository.get_by_name(c_name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Customer name already exists. Please use a different name."
            )

        if self.repository.get_by_legal_name(l_name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Legal name already exists. Please use a different legal name."
            )

        c_code = (data.customer_code or data.customerId or f"23051068{abs(hash(c_name)) % 1000:03d}").strip()
        if self.repository.get_by_code(c_code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Customer code already exists. Please use a different code."
            )

        b_type = (data.business_type or data.businessType or "Projects").strip()
        status_val = parse_status_field(data.status)

        # GST logic
        is_gst_on = data.gstEnabled if data.gstEnabled is not None else (data.gst_number and data.gst_number != "NA")
        gst_type_val = (data.gst_type or data.gstType or "SGST").strip() if is_gst_on else "NA"
        gst_num_val = (data.gst_number or data.gstNumber or "NA").strip() if is_gst_on else "NA"

        pan_val = (data.pan_number or data.panNumber or "").strip()
        po_digits_val = (data.po_stating_3_digits or data.poDigits or "").strip()
        addr_val = (data.gst_address or data.address or "").strip()
        inv_type = (data.invoice_type or data.invoiceType or "B2B").strip()

        new_customer = Customer(
            customer_name=c_name,
            legal_name=l_name,
            customer_code=c_code,
            business_type=b_type,
            gst_type=gst_type_val,
            gst_number=gst_num_val,
            pan_number=pan_val,
            po_stating_3_digits=po_digits_val,
            gst_address=addr_val,
            invoice_type=inv_type,
            status=status_val,
            company_name=data.company_name or "Nexus"
        )

        try:
            saved = self.repository.create(new_customer)
            return self._to_response_dto(saved)
        except IntegrityError as e:
            self.repository.db.rollback()
            err_str = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
            if "customer_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer name already exists. Please use a different name."
                )
            elif "customer_code" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer code already exists. Please use a different code."
                )
            elif "legal_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Legal name already exists. Please use a different legal name."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer record already exists."
                )

    def update_customer(self, customer_id: int, data: CustomerUpdate) -> CustomerResponse:
        c = self.repository.get_by_id(customer_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )

        c_name = data.customer_name or data.customerName
        if c_name is not None and c_name.strip():
            c_name_clean = c_name.strip()
            from app.repositories.customer_repository import is_indus_variant
            if is_indus_variant(c_name_clean):
                existing_indus = self.repository.get_existing_indus(exclude_id=customer_id)
                if existing_indus:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Indus Towers Ltd already exists. Only one Indus Towers customer record is allowable."
                    )
            existing = self.repository.get_by_name(c_name_clean, exclude_id=customer_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer name already exists. Please use a different name."
                )
            c.customer_name = c_name_clean

        l_name = data.legal_name or data.legalName
        if l_name is not None and l_name.strip():
            l_name_clean = l_name.strip()
            from app.repositories.customer_repository import is_indus_variant
            if is_indus_variant(l_name_clean):
                existing_indus = self.repository.get_existing_indus(exclude_id=customer_id)
                if existing_indus:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Indus Towers Ltd already exists. Only one Indus Towers customer record is allowable."
                    )
            existing = self.repository.get_by_legal_name(l_name_clean, exclude_id=customer_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Legal name already exists. Please use a different legal name."
                )
            c.legal_name = l_name_clean

        c_code = data.customer_code or data.customerId or data.customerCode
        if c_code is not None and c_code.strip():
            c_code_clean = c_code.strip()
            existing = self.repository.get_by_code(c_code_clean, exclude_id=customer_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer code already exists. Please use a different code."
                )
            c.customer_code = c_code_clean

        if data.business_type or data.businessType:
            c.business_type = (data.business_type or data.businessType).strip()

        if data.gst_type or data.gstType:
            c.gst_type = (data.gst_type or data.gstType).strip()

        if data.gst_number or data.gstNumber:
            c.gst_number = (data.gst_number or data.gstNumber).strip()

        if data.pan_number or data.panNumber:
            c.pan_number = (data.pan_number or data.panNumber).strip()

        if data.invoice_type or data.invoiceType:
            c.invoice_type = (data.invoice_type or data.invoiceType).strip()

        if data.po_stating_3_digits or data.poDigits:
            c.po_stating_3_digits = (data.po_stating_3_digits or data.poDigits).strip()

        if data.gst_address or data.address:
            c.gst_address = (data.gst_address or data.address).strip()

        if data.status is not None:
            c.status = parse_status_field(data.status)

        try:
            updated = self.repository.update(c)
            return self._to_response_dto(updated)
        except IntegrityError as e:
            self.repository.db.rollback()
            err_str = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
            if "customer_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer name already exists. Please use a different name."
                )
            elif "customer_code" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer code already exists. Please use a different code."
                )
            elif "legal_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Legal name already exists. Please use a different legal name."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Customer update failed due to constraint violation."
                )

    def update_restricted_customer(self, customer_id: int, data: CustomerRestrictedUpdate) -> CustomerResponse:
        """
        Restricted edit workflow for Indus Towers green banner edit mode:
        Only GST, GST Number, GST Type, Address, and Status are allowed to be modified.
        Modifications to customer name, legal name, code, or business type are rejected.
        """
        c = self.repository.get_by_id(customer_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )

        # Check for forbidden field change attempts
        req_cname = data.customer_name or data.customerName
        if req_cname is not None and req_cname.strip() and req_cname.strip() != c.customer_name:
            raise HTTPException(
                status_code=422,
                detail="Customer name cannot be modified in restricted edit mode."
            )

        req_lname = data.legal_name or data.legalName
        if req_lname is not None and req_lname.strip() and req_lname.strip() != c.legal_name:
            raise HTTPException(
                status_code=422,
                detail="Legal name cannot be modified in restricted edit mode."
            )

        req_ccode = data.customer_code or data.customerCode or data.customerId
        if req_ccode is not None and req_ccode.strip() and req_ccode.strip() != c.customer_code:
            raise HTTPException(
                status_code=422,
                detail="Customer code cannot be modified in restricted edit mode."
            )

        req_btype = data.business_type or data.businessType
        if req_btype is not None and req_btype.strip() and req_btype.strip() != c.business_type:
            raise HTTPException(
                status_code=422,
                detail="Business type cannot be modified in restricted edit mode."
            )

        # Apply only permitted updates:
        # 1. GST & GST Type / Number
        is_gst_on = data.gst_enabled if data.gst_enabled is not None else data.gstEnabled
        if is_gst_on is not None:
            if not is_gst_on:
                c.gst_number = "NA"
                c.gst_type = "NA"
            else:
                if data.gst_number or data.gstNumber:
                    c.gst_number = (data.gst_number or data.gstNumber).strip()
                if data.gst_type or data.gstType:
                    c.gst_type = (data.gst_type or data.gstType).strip()
        else:
            if data.gst_number or data.gstNumber:
                c.gst_number = (data.gst_number or data.gstNumber).strip()
            if data.gst_type or data.gstType:
                c.gst_type = (data.gst_type or data.gstType).strip()

        # 2. Address
        if data.gst_address or data.address:
            c.gst_address = (data.gst_address or data.address).strip()

        # 3. Status
        if data.status is not None:
            c.status = parse_status_field(data.status)

        try:
            updated = self.repository.update(c)
            return self._to_response_dto(updated)
        except IntegrityError as e:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Customer update failed due to constraint violation."
            )

    def update_status(self, customer_id: int, status_data: CustomerStatusUpdate) -> CustomerResponse:
        c = self.repository.get_by_id(customer_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )

        if status_data.is_active is not None:
            c.status = "Active" if status_data.is_active else "In - Active"
        elif status_data.status is not None:
            c.status = parse_status_field(status_data.status)

        updated = self.repository.update(c)
        return self._to_response_dto(updated)

    def delete_customer(self, customer_id: int) -> Dict[str, Any]:
        c = self.repository.get_by_id(customer_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )
        self.repository.delete(c)
        return {"success": True, "message": f"Customer {customer_id} deleted successfully."}

    # --- Contacts & Locations Service Methods ---
    def get_contacts(self, customer_id: Optional[int] = None, customer_name: Optional[str] = None) -> CustomerContactListResponse:
        if customer_id is not None:
            c = self.repository.get_by_id(customer_id)
            if not c:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {customer_id} not found"
                )
            items = self.repository.get_contacts_by_customer(c)
        else:
            items = self.repository.get_contacts(customer_name)
        return CustomerContactListResponse(
            total=len(items),
            items=[self._to_contact_dto(it) for it in items]
        )

    def create_contact(self, data: CustomerContactCreate, customer_id: Optional[int] = None) -> CustomerContactResponse:
        target_customer_name = None
        if customer_id is not None:
            c = self.repository.get_by_id(customer_id)
            if not c:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {customer_id} not found"
                )
            target_customer_name = c.customer_name or c.legal_name
        else:
            target_customer_name = data.customer_name or data.customerName or "Indus Towers Ltd"

        name_val = data.name or ""
        if not name_val.strip():
            raise HTTPException(status_code=422, detail="Contact Name is required.")
        new_c = CustomerContact(
            customer_name=target_customer_name,
            name=name_val.strip(),
            designation=(data.designation or "").strip(),
            contact_number=(data.contact_number or data.contact or "").strip(),
            email=(data.email or "").strip(),
            status=parse_status_field(data.status),
            company_name="Nexus"
        )
        saved = self.repository.create_contact(new_c)
        return self._to_contact_dto(saved)

    def delete_contact(self, contact_id: int) -> Dict[str, Any]:
        success = self.repository.delete_contact(contact_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Contact {contact_id} not found")
        return {"success": True, "message": "Contact deleted."}

    def get_locations(self, customer_id: Optional[int] = None, customer_name: Optional[str] = None) -> CustomerLocationListResponse:
        if customer_id is not None:
            c = self.repository.get_by_id(customer_id)
            if not c:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {customer_id} not found"
                )
            items = self.repository.get_locations_by_customer(c)
        else:
            items = self.repository.get_locations(customer_name)
        return CustomerLocationListResponse(
            total=len(items),
            items=[self._to_location_dto(it) for it in items]
        )

    def create_location(self, data: CustomerLocationCreate, customer_id: Optional[int] = None) -> CustomerLocationResponse:
        target_customer_name = None
        if customer_id is not None:
            c = self.repository.get_by_id(customer_id)
            if not c:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {customer_id} not found"
                )
            target_customer_name = c.customer_name or c.legal_name
        else:
            target_customer_name = data.customer_name or data.customerName or "Indus Towers Ltd"

        off_name = data.office_name or data.officeName or ""
        if not off_name.strip():
            raise HTTPException(status_code=422, detail="Office Name is required.")
        new_loc = CustomerOfficeLocation(
            customer_name=target_customer_name,
            office_name=off_name.strip(),
            latitude=data.latitude if data.latitude else None,
            longitude=data.longitude if data.longitude else None,
            status=parse_status_field(data.status),
            company_name="Nexus"
        )
        saved = self.repository.create_location(new_loc)
        return self._to_location_dto(saved)

    def delete_location(self, office_id: int) -> Dict[str, Any]:
        success = self.repository.delete_location(office_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Location {office_id} not found")
        return {"success": True, "message": "Location deleted."}

