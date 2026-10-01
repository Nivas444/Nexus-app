from typing import Optional, List, Tuple, Any, Union
import math
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.models.indus_project import (
    IndusCustomerProjectType,
    IndusCustomerProjectTypeActivity,
    IndusCustomerProjectsTypeAdditionalTransport,
    IndusCustomerProjectTypeSupply
)
from app.models.customer import Customer
from app.schemas.indus_project import (
    IndusProjectCreate, IndusProjectUpdate,
    IndusProjectActivityCreate, IndusProjectActivityUpdate,
    IndusProjectTransportCreate, IndusProjectTransportUpdate,
    IndusProjectApprovalCreate, IndusProjectApprovalUpdate
)

def resolve_customer_name(db: Session, comp_identifier: Optional[str]) -> str:
    """
    Resolve the canonical customer name from the database.
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

import re

def parse_numeric(val: Any) -> Optional[Decimal]:
    if val is None or val == "":
        return None
    try:
        clean = str(val).strip()
        return Decimal(clean)
    except Exception:
        match = re.search(r'[-+]?\d*\.?\d+', str(val))
        if match:
            try:
                return Decimal(match.group())
            except Exception:
                return None
        return None

def parse_int(val: Any) -> Optional[int]:
    if val is None or val == "":
        return None
    try:
        return int(float(str(val).strip()))
    except Exception:
        return None


class IndusProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    # ==========================================
    # 1. PROJECT TYPE MASTER
    # ==========================================
    def get_all(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        project_type: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "project_type_id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusCustomerProjectType], int, int]:
        query = self.db.query(IndusCustomerProjectType)

        if customer_name:
            resolved_cust = resolve_customer_name(self.db, customer_name)
            if "indus" in resolved_cust.lower():
                query = query.filter(
                    or_(
                        IndusCustomerProjectType.customer_name.ilike("%indus%"),
                        IndusCustomerProjectType.customer_name == "Indus Tower Ltd"
                    )
                )
            else:
                query = query.filter(IndusCustomerProjectType.customer_name.ilike(f"%{resolved_cust}%"))
        else:
            query = query.filter(
                or_(
                    IndusCustomerProjectType.customer_name.ilike("%indus%"),
                    IndusCustomerProjectType.customer_name == "Indus Tower Ltd",
                    IndusCustomerProjectType.customer_name.is_(None)
                )
            )

        if project_type:
            query = query.filter(IndusCustomerProjectType.project_type.ilike(f"%{project_type.strip()}%"))

        if status:
            if "in" in status.lower():
                query = query.filter(IndusCustomerProjectType.status.ilike("%in%"))
            else:
                query = query.filter(IndusCustomerProjectType.status == "Active")

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerProjectType.project_type.ilike(search_pattern),
                    IndusCustomerProjectType.sub_project_type.ilike(search_pattern),
                    IndusCustomerProjectType.upgradation_type.ilike(search_pattern),
                    IndusCustomerProjectType.pm.ilike(search_pattern),
                    IndusCustomerProjectType.indus_pm.ilike(search_pattern),
                    IndusCustomerProjectType.indus_scm.ilike(search_pattern),
                    IndusCustomerProjectType.customer_name.ilike(search_pattern)
                )
            )

        total = query.count()
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

        sort_col = getattr(IndusCustomerProjectType, sort_by, IndusCustomerProjectType.project_type_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total, total_pages

    def get_by_id(self, project_type_id: int) -> Optional[IndusCustomerProjectType]:
        return self.db.query(IndusCustomerProjectType).filter(
            IndusCustomerProjectType.project_type_id == project_type_id
        ).first()

    def create(self, obj_in: IndusProjectCreate) -> IndusCustomerProjectType:
        try:
            raw_cust = obj_in.customer_name or obj_in.customerName or "Indus Tower Ltd"
            cust_name = resolve_customer_name(self.db, raw_cust)
            comp_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()

            p_type = (obj_in.project_type or obj_in.projectType or "").strip()
            sub_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()
            upg_type = (obj_in.upgradation_type or obj_in.upgradationType or "").strip()

            raw_tat = obj_in.tat
            tat_val = parse_numeric(raw_tat)

            indus_pm = (obj_in.indus_pm or obj_in.indusPm or "").strip()
            indus_scm = (obj_in.indus_scm or obj_in.indusScm or "").strip()
            pm = (obj_in.pm or "").strip()
            survey = obj_in.survey or "Yes"

            raw_add_tr = obj_in.additional_transport if obj_in.additional_transport is not None else obj_in.additionalTransport
            if raw_add_tr is not None:
                if str(raw_add_tr).strip().lower() in ["no", "false", "in-active", "inactive", "0"]:
                    add_tr_val = Decimal("0")
                elif str(raw_add_tr).strip().lower() in ["yes", "true", "active", "1"]:
                    add_tr_val = Decimal("1")
                else:
                    num_val = parse_numeric(raw_add_tr)
                    add_tr_val = Decimal("1") if num_val and num_val > 0 else Decimal("0")
            else:
                add_tr_val = Decimal("1")

            stat = obj_in.status or "Active"

            db_obj = IndusCustomerProjectType(
                company_name=comp_name,
                customer_name=cust_name,
                project_type=p_type,
                sub_project_type=sub_type,
                upgradation_type=upg_type,
                tat=tat_val,
                indus_pm=indus_pm,
                indus_scm=indus_scm,
                pm=pm,
                survey=survey,
                additional_transport=add_tr_val,
                status=stat
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update(self, db_obj: IndusCustomerProjectType, obj_in: IndusProjectUpdate) -> IndusCustomerProjectType:
        try:
            if obj_in.customer_name is not None or obj_in.customerName is not None:
                raw_cust = obj_in.customer_name or obj_in.customerName
                db_obj.customer_name = resolve_customer_name(self.db, raw_cust)

            if obj_in.company_name is not None or obj_in.companyName is not None:
                db_obj.company_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()

            if obj_in.project_type is not None or obj_in.projectType is not None:
                db_obj.project_type = (obj_in.project_type or obj_in.projectType or "").strip()

            if obj_in.sub_project_type is not None or obj_in.subProjectType is not None:
                db_obj.sub_project_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()

            if obj_in.upgradation_type is not None or obj_in.upgradationType is not None:
                db_obj.upgradation_type = (obj_in.upgradation_type or obj_in.upgradationType or "").strip()

            if obj_in.tat is not None:
                db_obj.tat = parse_numeric(obj_in.tat)

            if obj_in.indus_pm is not None or obj_in.indusPm is not None:
                db_obj.indus_pm = (obj_in.indus_pm or obj_in.indusPm or "").strip()

            if obj_in.indus_scm is not None or obj_in.indusScm is not None:
                db_obj.indus_scm = (obj_in.indus_scm or obj_in.indusScm or "").strip()

            if obj_in.pm is not None:
                db_obj.pm = (obj_in.pm or "").strip()

            if obj_in.survey is not None:
                db_obj.survey = obj_in.survey

            if obj_in.additional_transport is not None or obj_in.additionalTransport is not None:
                raw_add_tr = obj_in.additional_transport if obj_in.additional_transport is not None else obj_in.additionalTransport
                if raw_add_tr is not None:
                    if str(raw_add_tr).strip().lower() in ["no", "false", "in-active", "inactive", "0"]:
                        db_obj.additional_transport = Decimal("0")
                    elif str(raw_add_tr).strip().lower() in ["yes", "true", "active", "1"]:
                        db_obj.additional_transport = Decimal("1")
                    else:
                        num_val = parse_numeric(raw_add_tr)
                        db_obj.additional_transport = Decimal("1") if num_val and num_val > 0 else Decimal("0")

            if obj_in.status is not None:
                db_obj.status = obj_in.status

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def delete(self, project_type_id: int) -> bool:
        try:
            db_obj = self.get_by_id(project_type_id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    # ==========================================
    # 2. ACTIVITY ISOLATION & CRUD
    # ==========================================
    def get_activities(
        self,
        project_type: Optional[str] = None,
        sub_project_type: Optional[str] = None,
        stage: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[IndusCustomerProjectTypeActivity]:
        query = self.db.query(IndusCustomerProjectTypeActivity)

        if project_type:
            query = query.filter(IndusCustomerProjectTypeActivity.project_type.ilike(project_type.strip()))

        if sub_project_type:
            query = query.filter(IndusCustomerProjectTypeActivity.sub_project_type.ilike(sub_project_type.strip()))

        if stage:
            query = query.filter(IndusCustomerProjectTypeActivity.stage.ilike(stage.strip()))

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerProjectTypeActivity.activity.ilike(search_pattern),
                    IndusCustomerProjectTypeActivity.stage.ilike(search_pattern),
                    IndusCustomerProjectTypeActivity.project_type.ilike(search_pattern),
                    IndusCustomerProjectTypeActivity.sub_project_type.ilike(search_pattern)
                )
            )

        return query.order_by(IndusCustomerProjectTypeActivity.id.asc()).all()

    def get_activity_by_id(self, item_id: int) -> Optional[IndusCustomerProjectTypeActivity]:
        return self.db.query(IndusCustomerProjectTypeActivity).filter(
            IndusCustomerProjectTypeActivity.id == item_id
        ).first()

    def create_activity(self, obj_in: IndusProjectActivityCreate) -> IndusCustomerProjectTypeActivity:
        try:
            comp_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()
            p_type = (obj_in.project_type or obj_in.projectType or "").strip()
            sub_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()
            stage = (obj_in.stage or "").strip()
            act = (obj_in.activity or "").strip()
            days = parse_int(obj_in.days) or 0

            db_obj = IndusCustomerProjectTypeActivity(
                company_name=comp_name,
                project_type=p_type,
                sub_project_type=sub_type,
                stage=stage,
                activity=act,
                days=days
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update_activity(self, db_obj: IndusCustomerProjectTypeActivity, obj_in: IndusProjectActivityUpdate) -> IndusCustomerProjectTypeActivity:
        try:
            if obj_in.company_name is not None or obj_in.companyName is not None:
                db_obj.company_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()

            if obj_in.project_type is not None or obj_in.projectType is not None:
                db_obj.project_type = (obj_in.project_type or obj_in.projectType or "").strip()

            if obj_in.sub_project_type is not None or obj_in.subProjectType is not None:
                db_obj.sub_project_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()

            if obj_in.stage is not None:
                db_obj.stage = obj_in.stage.strip()

            if obj_in.activity is not None:
                db_obj.activity = obj_in.activity.strip()

            if obj_in.days is not None:
                db_obj.days = parse_int(obj_in.days)

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def delete_activity(self, item_id: int) -> bool:
        try:
            db_obj = self.get_activity_by_id(item_id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    # ==========================================
    # 3. TRANSPORT ISOLATION & CRUD
    # ==========================================
    def get_transports(
        self,
        project_type: Optional[str] = None,
        sub_project_type: Optional[str] = None,
        customer_name: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[IndusCustomerProjectsTypeAdditionalTransport]:
        query = self.db.query(IndusCustomerProjectsTypeAdditionalTransport)

        if customer_name:
            resolved_cust = resolve_customer_name(self.db, customer_name)
            query = query.filter(
                or_(
                    IndusCustomerProjectsTypeAdditionalTransport.customer_name.ilike(f"%{resolved_cust}%"),
                    IndusCustomerProjectsTypeAdditionalTransport.customer_name == "Indus Tower Ltd"
                )
            )

        if project_type:
            query = query.filter(IndusCustomerProjectsTypeAdditionalTransport.project_type.ilike(project_type.strip()))

        if sub_project_type:
            query = query.filter(IndusCustomerProjectsTypeAdditionalTransport.sub_project_type.ilike(sub_project_type.strip()))

        if status:
            if "in" in status.lower():
                query = query.filter(IndusCustomerProjectsTypeAdditionalTransport.status.ilike("%in%"))
            else:
                query = query.filter(IndusCustomerProjectsTypeAdditionalTransport.status == "Active")

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerProjectsTypeAdditionalTransport.item_code.ilike(search_pattern),
                    IndusCustomerProjectsTypeAdditionalTransport.item_description.ilike(search_pattern),
                    IndusCustomerProjectsTypeAdditionalTransport.transport_zone.ilike(search_pattern),
                    IndusCustomerProjectsTypeAdditionalTransport.project_type.ilike(search_pattern)
                )
            )

        return query.order_by(IndusCustomerProjectsTypeAdditionalTransport.customer_project_item_id.asc()).all()

    def get_transport_by_id(self, item_id: int) -> Optional[IndusCustomerProjectsTypeAdditionalTransport]:
        return self.db.query(IndusCustomerProjectsTypeAdditionalTransport).filter(
            IndusCustomerProjectsTypeAdditionalTransport.customer_project_item_id == item_id
        ).first()

    def create_transport(self, obj_in: IndusProjectTransportCreate) -> IndusCustomerProjectsTypeAdditionalTransport:
        try:
            raw_cust = obj_in.customer_name or obj_in.customerName or "Indus Tower Ltd"
            cust_name = resolve_customer_name(self.db, raw_cust)
            comp_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()
            p_type = (obj_in.project_type or obj_in.projectType or "").strip()
            sub_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()
            i_code = (obj_in.item_code or obj_in.itemCode or "").strip()
            i_desc = (obj_in.item_description or obj_in.itemDescription or "").strip()
            t_zone = (obj_in.transport_zone or obj_in.transportZone or "").strip()
            qty_val = parse_numeric(obj_in.qty) or Decimal("1")
            stat = obj_in.status or "Active"

            db_obj = IndusCustomerProjectsTypeAdditionalTransport(
                company_name=comp_name,
                customer_name=cust_name,
                project_type=p_type,
                sub_project_type=sub_type,
                item_code=i_code,
                item_description=i_desc,
                transport_zone=t_zone,
                qty=qty_val,
                status=stat
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update_transport(self, db_obj: IndusCustomerProjectsTypeAdditionalTransport, obj_in: IndusProjectTransportUpdate) -> IndusCustomerProjectsTypeAdditionalTransport:
        try:
            if obj_in.customer_name is not None or obj_in.customerName is not None:
                raw_cust = obj_in.customer_name or obj_in.customerName
                db_obj.customer_name = resolve_customer_name(self.db, raw_cust)

            if obj_in.company_name is not None or obj_in.companyName is not None:
                db_obj.company_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()

            if obj_in.project_type is not None or obj_in.projectType is not None:
                db_obj.project_type = (obj_in.project_type or obj_in.projectType or "").strip()

            if obj_in.sub_project_type is not None or obj_in.subProjectType is not None:
                db_obj.sub_project_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()

            if obj_in.item_code is not None or obj_in.itemCode is not None:
                db_obj.item_code = (obj_in.item_code or obj_in.itemCode or "").strip()

            if obj_in.item_description is not None or obj_in.itemDescription is not None:
                db_obj.item_description = (obj_in.item_description or obj_in.itemDescription or "").strip()

            if obj_in.transport_zone is not None or obj_in.transportZone is not None:
                db_obj.transport_zone = (obj_in.transport_zone or obj_in.transportZone or "").strip()

            if obj_in.qty is not None:
                db_obj.qty = parse_numeric(obj_in.qty)

            if obj_in.status is not None:
                db_obj.status = obj_in.status

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def delete_transport(self, item_id: int) -> bool:
        try:
            db_obj = self.get_transport_by_id(item_id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    # ==========================================
    # 4. APPROVAL HISTORY / SUPPLY ISOLATION & CRUD
    # ==========================================
    def get_approvals(
        self,
        sub_project_type: Optional[str] = None,
        customer_name: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[IndusCustomerProjectTypeSupply]:
        query = self.db.query(IndusCustomerProjectTypeSupply)

        if customer_name:
            resolved_cust = resolve_customer_name(self.db, customer_name)
            query = query.filter(
                or_(
                    IndusCustomerProjectTypeSupply.customer_name.ilike(f"%{resolved_cust}%"),
                    IndusCustomerProjectTypeSupply.customer_name == "Indus Tower Ltd"
                )
            )

        if sub_project_type:
            query = query.filter(IndusCustomerProjectTypeSupply.sub_project_type.ilike(sub_project_type.strip()))

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerProjectTypeSupply.description.ilike(search_pattern),
                    IndusCustomerProjectTypeSupply.observation.ilike(search_pattern),
                    IndusCustomerProjectTypeSupply.remarks.ilike(search_pattern),
                    IndusCustomerProjectTypeSupply.sub_project_type.ilike(search_pattern)
                )
            )

        return query.order_by(IndusCustomerProjectTypeSupply.sub_project_type_detail_id.asc()).all()

    def get_approval_by_id(self, item_id: int) -> Optional[IndusCustomerProjectTypeSupply]:
        return self.db.query(IndusCustomerProjectTypeSupply).filter(
            IndusCustomerProjectTypeSupply.sub_project_type_detail_id == item_id
        ).first()

    def create_approval(self, obj_in: IndusProjectApprovalCreate) -> IndusCustomerProjectTypeSupply:
        try:
            raw_cust = obj_in.customer_name or obj_in.customerName or "Indus Tower Ltd"
            cust_name = resolve_customer_name(self.db, raw_cust)
            comp_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()
            sub_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()
            desc_val = (obj_in.description or "").strip()
            obs_val = (obj_in.observation or "").strip()
            rem_val = (obj_in.remarks or "").strip()

            db_obj = IndusCustomerProjectTypeSupply(
                company_name=comp_name,
                customer_name=cust_name,
                sub_project_type=sub_type,
                description=desc_val,
                observation=obs_val,
                remarks=rem_val
            )
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def update_approval(self, db_obj: IndusCustomerProjectTypeSupply, obj_in: IndusProjectApprovalUpdate) -> IndusCustomerProjectTypeSupply:
        try:
            if obj_in.customer_name is not None or obj_in.customerName is not None:
                raw_cust = obj_in.customer_name or obj_in.customerName
                db_obj.customer_name = resolve_customer_name(self.db, raw_cust)

            if obj_in.company_name is not None or obj_in.companyName is not None:
                db_obj.company_name = (obj_in.company_name or obj_in.companyName or "Nexus").strip()

            if obj_in.sub_project_type is not None or obj_in.subProjectType is not None:
                db_obj.sub_project_type = (obj_in.sub_project_type or obj_in.subProjectType or "").strip()

            if obj_in.description is not None:
                db_obj.description = obj_in.description.strip()

            if obj_in.observation is not None:
                db_obj.observation = obj_in.observation.strip()

            if obj_in.remarks is not None:
                db_obj.remarks = obj_in.remarks.strip()

            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except Exception:
            self.db.rollback()
            raise

    def delete_approval(self, item_id: int) -> bool:
        try:
            db_obj = self.get_approval_by_id(item_id)
            if not db_obj:
                return False
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise
