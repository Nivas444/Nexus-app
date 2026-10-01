from typing import Optional, List, Tuple, Any
from datetime import date, datetime
import math
import re
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.models.indus_esh import IndusEshDetails
from app.models.customer import Customer
from app.schemas.indus_esh import IndusEshCreate, IndusEshUpdate

def resolve_company_name(db: Session, comp_identifier: Optional[str]) -> str:
    """
    Resolve the canonical company/customer name from the database.
    """
    if not comp_identifier:
        return "Indus Tower Ltd"

    clean_id = comp_identifier.strip()
    if not clean_id or clean_id.lower() in ["undefined", "null"]:
        return "Indus Tower Ltd"

    if "indus" in clean_id.lower():
        return "Indus Tower Ltd"

    cust = None
    if clean_id.isdigit():
        cust = db.query(Customer).filter(Customer.customer_id == int(clean_id)).first()

    if not cust:
        cust = db.query(Customer).filter(
            or_(
                Customer.customer_name.ilike(clean_id),
                Customer.legal_name.ilike(clean_id),
                Customer.customer_code.ilike(clean_id)
            )
        ).first()

    if cust and cust.customer_name:
        return cust.customer_name.strip()

    return clean_id

def parse_expiry_date(val: Any) -> Optional[date]:
    """
    Parse a date object or string into a Python date object.
    Supports formats: YYYY-MM-DD, DD - MM - YYYY, DD-MM-YYYY, DD/MM/YYYY.
    """
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        cleaned = re.sub(r'\s+', '', val.strip())
        if not cleaned:
            return None
        # Try various formats
        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y"]:
            try:
                return datetime.strptime(cleaned, fmt).date()
            except ValueError:
                continue
    return None

class IndusEshRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        company_name: Optional[str] = None,
        employee_type: Optional[str] = None,
        training_type: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusEshDetails], int, int]:
        query = self.db.query(IndusEshDetails)

        if company_name:
            resolved_comp = resolve_company_name(self.db, company_name)
            if "indus" in resolved_comp.lower():
                query = query.filter(
                    or_(
                        IndusEshDetails.company_name.ilike("%indus%"),
                        IndusEshDetails.company_name == "Indus Tower Ltd"
                    )
                )
            else:
                query = query.filter(IndusEshDetails.company_name.ilike(f"%{resolved_comp}%"))
        else:
            query = query.filter(
                or_(
                    IndusEshDetails.company_name.ilike("%indus%"),
                    IndusEshDetails.company_name == "Indus Tower Ltd",
                    IndusEshDetails.company_name.is_(None)
                )
            )

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusEshDetails.name.ilike(search_pattern),
                    IndusEshDetails.company_name.ilike(search_pattern),
                    IndusEshDetails.aadhar_number.ilike(search_pattern),
                    IndusEshDetails.training_id_number.ilike(search_pattern),
                    IndusEshDetails.training_agency.ilike(search_pattern),
                    IndusEshDetails.training_type.ilike(search_pattern)
                )
            )

        if employee_type:
            query = query.filter(IndusEshDetails.employee_type.ilike(f"%{employee_type.strip()}%"))

        if training_type:
            query = query.filter(IndusEshDetails.training_type.ilike(f"%{training_type.strip()}%"))

        if status:
            if "in" in status.lower():
                query = query.filter(IndusEshDetails.status.ilike("%in%"))
            else:
                query = query.filter(IndusEshDetails.status == "Active")

        total = query.count()
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

        sort_col = getattr(IndusEshDetails, sort_by, IndusEshDetails.id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total, total_pages

    def get_by_id(self, item_id: int) -> Optional[IndusEshDetails]:
        return self.db.query(IndusEshDetails).filter(IndusEshDetails.id == item_id).first()

    def create(self, obj_in: IndusEshCreate) -> IndusEshDetails:
        try:
            raw_comp = obj_in.company_name or obj_in.companyName or "Indus Tower Ltd"
            comp_name = resolve_company_name(self.db, raw_comp)
            name = (obj_in.name or "").strip()
            if not name and obj_in.serviceVendorName:
                name = obj_in.serviceVendorName.strip()

            emp_type = obj_in.employee_type or obj_in.employeeType or "On-Roll"
            aadhar = obj_in.aadhar_number or obj_in.aadharNumber
            trn_type = obj_in.training_type or obj_in.trainingType or "CHCTE"
            trn_id = obj_in.training_id_number or obj_in.trainingIdNumber
            agency = obj_in.training_agency or obj_in.trainingAgency
            exp_date = parse_expiry_date(obj_in.expiry_date if obj_in.expiry_date is not None else obj_in.expiryDate)
            stat = obj_in.status or "Active"

            db_obj = IndusEshDetails(
                company_name=comp_name,
                name=name,
                employee_type=emp_type,
                aadhar_number=aadhar,
                training_type=trn_type,
                training_id_number=trn_id,
                training_agency=agency,
                expiry_date=exp_date,
                status=stat
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update(self, db_obj: IndusEshDetails, obj_in: IndusEshUpdate) -> IndusEshDetails:
        try:
            if obj_in.company_name or obj_in.companyName:
                raw_comp = obj_in.company_name or obj_in.companyName
                db_obj.company_name = resolve_company_name(self.db, raw_comp)

            if obj_in.name is not None:
                db_obj.name = obj_in.name.strip()

            if obj_in.employee_type is not None or obj_in.employeeType is not None:
                db_obj.employee_type = obj_in.employee_type or obj_in.employeeType

            if obj_in.aadhar_number is not None or obj_in.aadharNumber is not None:
                db_obj.aadhar_number = obj_in.aadhar_number if obj_in.aadhar_number is not None else obj_in.aadharNumber

            if obj_in.training_type is not None or obj_in.trainingType is not None:
                db_obj.training_type = obj_in.training_type or obj_in.trainingType

            if obj_in.training_id_number is not None or obj_in.trainingIdNumber is not None:
                db_obj.training_id_number = obj_in.training_id_number if obj_in.training_id_number is not None else obj_in.trainingIdNumber

            if obj_in.training_agency is not None or obj_in.trainingAgency is not None:
                db_obj.training_agency = obj_in.training_agency if obj_in.training_agency is not None else obj_in.trainingAgency

            if obj_in.expiry_date is not None or obj_in.expiryDate is not None:
                exp_raw = obj_in.expiry_date if obj_in.expiry_date is not None else obj_in.expiryDate
                db_obj.expiry_date = parse_expiry_date(exp_raw)

            if obj_in.status is not None:
                db_obj.status = obj_in.status

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def delete(self, item_id: int) -> bool:
        try:
            db_obj = self.get_by_id(item_id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise
