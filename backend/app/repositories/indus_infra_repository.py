from typing import Optional, List, Tuple, Any
from datetime import date, datetime
import math
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.models.indus_infra import IndusCustomerInfra
from app.models.customer import Customer
from app.schemas.indus_infra import IndusInfraCreate, IndusInfraUpdate

def resolve_customer_name(db: Session, customer_identifier: Optional[str]) -> str:
    """
    Resolve the canonical customer name from the database.
    """
    if not customer_identifier:
        return "Indus Tower Ltd"

    clean_id = customer_identifier.strip()
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

def parse_commissioning_value(val: Any) -> Optional[date]:
    """
    Safely convert boolean, string, or date to date or None for PostgreSQL date column.
    """
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, bool):
        return date.today() if val else None
    if isinstance(val, str):
        val_str = val.strip().lower()
        if val_str in ["yes", "true", "1", "active"]:
            return date.today()
        elif val_str in ["no", "false", "0", "inactive", "null", "none"]:
            return None
        else:
            try:
                return datetime.strptime(val[:10], "%Y-%m-%d").date()
            except Exception:
                return date.today()
    return None

class IndusInfraRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status: Optional[str] = None,
        infra_category: Optional[str] = None,
        sort_by: str = "item_infrastructure_detail_id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusCustomerInfra], int, int]:
        query = self.db.query(IndusCustomerInfra)

        if customer_name:
            resolved_cust = resolve_customer_name(self.db, customer_name)
            if "indus" in resolved_cust.lower():
                query = query.filter(
                    or_(
                        IndusCustomerInfra.customer_name.ilike("%indus%"),
                        IndusCustomerInfra.customer_name == "Indus Tower Ltd"
                    )
                )
            else:
                query = query.filter(IndusCustomerInfra.customer_name.ilike(f"%{resolved_cust}%"))
        else:
            # Default to Indus Tower Ltd for this module
            query = query.filter(
                or_(
                    IndusCustomerInfra.customer_name.ilike("%indus%"),
                    IndusCustomerInfra.customer_name == "Indus Tower Ltd",
                    IndusCustomerInfra.customer_name.is_(None)
                )
            )

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerInfra.infra_category.ilike(search_pattern),
                    IndusCustomerInfra.infra_description.ilike(search_pattern),
                    IndusCustomerInfra.make.ilike(search_pattern),
                    IndusCustomerInfra.uom.ilike(search_pattern),
                    IndusCustomerInfra.item_code.ilike(search_pattern)
                )
            )

        if status:
            if "in" in status.lower():
                query = query.filter(IndusCustomerInfra.status.ilike("%in%"))
            else:
                query = query.filter(IndusCustomerInfra.status == "Active")

        if infra_category:
            query = query.filter(IndusCustomerInfra.infra_category.ilike(f"%{infra_category.strip()}%"))

        total = query.count()
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

        sort_col = getattr(IndusCustomerInfra, sort_by, IndusCustomerInfra.item_infrastructure_detail_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total, total_pages

    def get_by_id(self, item_id: int) -> Optional[IndusCustomerInfra]:
        return self.db.query(IndusCustomerInfra).filter(
            IndusCustomerInfra.item_infrastructure_detail_id == item_id
        ).first()

    def create(self, obj_in: IndusInfraCreate) -> IndusCustomerInfra:
        try:
            cust_name = resolve_customer_name(self.db, obj_in.customer_name or obj_in.customerName)
            cat = obj_in.infra_category or obj_in.infraCategory or ""
            desc = obj_in.infra_description or obj_in.infraDescription or ""
            item_code = obj_in.item_code or obj_in.itemCode
            imap = obj_in.i_map or obj_in.iMap or "No"
            comm = parse_commissioning_value(obj_in.commissioning)
            comp_name = obj_in.company_name or "Nexus"
            stat = obj_in.status or "Active"

            db_obj = IndusCustomerInfra(
                company_name=comp_name,
                customer_name=cust_name,
                item_code=item_code,
                infra_category=cat,
                infra_description=desc,
                uom=obj_in.uom,
                make=obj_in.make,
                commissioning=comm,
                i_map=imap,
                status=stat
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update(self, db_obj: IndusCustomerInfra, obj_in: IndusInfraUpdate) -> IndusCustomerInfra:
        try:
            if obj_in.customer_name or obj_in.customerName:
                db_obj.customer_name = resolve_customer_name(self.db, obj_in.customer_name or obj_in.customerName)
            if obj_in.company_name is not None:
                db_obj.company_name = obj_in.company_name
            if obj_in.item_code is not None or obj_in.itemCode is not None:
                db_obj.item_code = obj_in.item_code or obj_in.itemCode
            if obj_in.infra_category is not None or obj_in.infraCategory is not None:
                db_obj.infra_category = obj_in.infra_category or obj_in.infraCategory
            if obj_in.infra_description is not None or obj_in.infraDescription is not None:
                db_obj.infra_description = obj_in.infra_description or obj_in.infraDescription
            if obj_in.uom is not None:
                db_obj.uom = obj_in.uom
            if obj_in.make is not None:
                db_obj.make = obj_in.make
            if obj_in.commissioning is not None:
                db_obj.commissioning = parse_commissioning_value(obj_in.commissioning)
            if obj_in.i_map is not None or obj_in.iMap is not None:
                db_obj.i_map = obj_in.i_map or obj_in.iMap
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
