import math
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError

from app.repositories.indus_gbpa_subpages_repository import (
    GbpaMaterialsRepository,
    GbpaExpensesRepository,
    GbpaInfraRepository
)
from app.models.indus_gbpa_material import IndusCustomerGbpaMaterial
from app.models.indus_gbpa_expense import IndusCustomerGbpaExpense
from app.models.indus_gbpa_infra import IndusCustomerGbpaInfra
from app.models.customer import Customer
from app.schemas.indus_gbpa_subpages import (
    GbpaMaterialCreate,
    GbpaMaterialUpdate,
    GbpaMaterialResponse,
    GbpaMaterialListResponse,
    GbpaExpenseCreate,
    GbpaExpenseUpdate,
    GbpaExpenseResponse,
    GbpaExpenseListResponse,
    GbpaInfraCreate,
    GbpaInfraUpdate,
    GbpaInfraResponse,
    GbpaInfraListResponse
)


# =========================================================================
# HELPER: DYNAMIC CANONICAL CUSTOMER RESOLUTION
# =========================================================================
def resolve_customer_name(db: Session, customer_identifier: Optional[str]) -> str:
    """
    Resolves canonical customer name from database customer master.
    Falls back gracefully if the customer identifier is a raw valid name.
    """
    if not customer_identifier or not str(customer_identifier).strip():
        return "Indus Tower Ltd"
    
    raw = str(customer_identifier).strip()
    
    # 1. Check by ID if numeric
    if raw.isdigit():
        cust = db.query(Customer).filter(Customer.customer_id == int(raw)).first()
        if cust and cust.customer_name:
            return cust.customer_name

    # 2. Check by customer_name, legal_name, or customer_code
    cust = db.query(Customer).filter(
        or_(
            func.lower(Customer.customer_name) == raw.lower(),
            func.lower(Customer.legal_name) == raw.lower(),
            func.lower(Customer.customer_code) == raw.lower()
        )
    ).first()
    if cust and cust.customer_name:
        return cust.customer_name

    # 3. If "indus" in string, normalize to canonical "Indus Tower Ltd"
    if "indus" in raw.lower():
        return "Indus Tower Ltd"

    return raw


# =========================================================================
# 1. MATERIALS SERVICE
# =========================================================================
def _format_material_response(item: IndusCustomerGbpaMaterial) -> GbpaMaterialResponse:
    return GbpaMaterialResponse(
        item_material_id=item.item_material_id,
        id=item.item_material_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        customerName=item.customer_name,
        item_code=item.item_code,
        item_name=item.item_name,
        itemName=item.item_name,
        material_code=item.material_code,
        materialCode=item.material_code,
        material_head=item.material_head,
        materialHead=item.material_head,
        material_category=item.material_category,
        materialCategory=item.material_category,
        material_description=item.material_description,
        materialDescription=item.material_description,
        material_type=item.material_type,
        make=item.material_code or "",
        type=item.material_type or "Parent",
        uom=item.uom or "",
        ucf=item.uom or "",
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class GbpaMaterialsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = GbpaMaterialsRepository(db)

    def get_materials_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_material_id",
        sort_desc: bool = False
    ) -> GbpaMaterialListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_items(
            skip=skip,
            limit=page_size,
            search=search,
            customer_name=customer_name,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        pages = math.ceil(total / page_size) if total > 0 else 1
        formatted = [_format_material_response(i) for i in items]
        return GbpaMaterialListResponse(
            items=formatted,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def get_material_by_id(self, material_id: int) -> GbpaMaterialResponse:
        item = self.repo.get_by_id(material_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Material with ID {material_id} not found."
            )
        return _format_material_response(item)

    def create_material(self, payload: GbpaMaterialCreate) -> GbpaMaterialResponse:
        mat_head = (payload.material_head or payload.materialHead or "").strip()
        mat_cat = (payload.material_category or payload.materialCategory or "").strip()
        mat_desc = (payload.material_description or payload.materialDescription or "").strip()
        mat_make = (payload.make or payload.material_code or "").strip()
        mat_type = (payload.type or payload.material_type or "Parent").strip()
        mat_ucf = (payload.ucf or payload.uom or "").strip()

        customer_name = resolve_customer_name(self.db, payload.customer_name or payload.customerName)

        data = {
            "company_name": payload.company_name or "Nexus",
            "customer_name": customer_name,
            "item_code": payload.item_code.strip() if payload.item_code else None,
            "item_name": payload.item_name.strip() if payload.item_name else None,
            "material_code": mat_make if mat_make else (payload.material_code or None),
            "material_head": mat_head if mat_head else None,
            "material_category": mat_cat if mat_cat else None,
            "material_description": mat_desc if mat_desc else None,
            "material_type": mat_type,
            "uom": mat_ucf if mat_ucf else (payload.uom or None),
            "status": payload.status.strip() if payload.status else "Active"
        }
        try:
            created = self.repo.create(data)
            return _format_material_response(created)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create GBPA Material: {str(e)}"
            )

    def update_material(self, material_id: int, payload: GbpaMaterialUpdate) -> GbpaMaterialResponse:
        item = self.repo.get_by_id(material_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Material with ID {material_id} not found."
            )

        update_dict: Dict[str, Any] = {}
        if payload.company_name is not None:
            update_dict["company_name"] = payload.company_name.strip()
        
        c_name = payload.customer_name or payload.customerName
        if c_name is not None:
            update_dict["customer_name"] = resolve_customer_name(self.db, c_name)
            
        if payload.item_code is not None:
            update_dict["item_code"] = payload.item_code.strip() if payload.item_code else None
        if payload.item_name is not None:
            update_dict["item_name"] = payload.item_name.strip() if payload.item_name else None

        mat_head = payload.material_head or payload.materialHead
        if mat_head is not None:
            update_dict["material_head"] = mat_head.strip() if mat_head else None

        mat_cat = payload.material_category or payload.materialCategory
        if mat_cat is not None:
            update_dict["material_category"] = mat_cat.strip() if mat_cat else None

        mat_desc = payload.material_description or payload.materialDescription
        if mat_desc is not None:
            update_dict["material_description"] = mat_desc.strip() if mat_desc else None

        mat_make = payload.make or payload.material_code
        if mat_make is not None:
            update_dict["material_code"] = mat_make.strip() if mat_make else None

        mat_type = payload.type or payload.material_type
        if mat_type is not None:
            update_dict["material_type"] = mat_type.strip() if mat_type else "Parent"

        mat_ucf = payload.ucf or payload.uom
        if mat_ucf is not None:
            update_dict["uom"] = mat_ucf.strip() if mat_ucf else None

        if payload.status is not None:
            update_dict["status"] = payload.status.strip() if payload.status else "Active"

        try:
            updated = self.repo.update(material_id, update_dict)
            return _format_material_response(updated)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update GBPA Material: {str(e)}"
            )

    def delete_material(self, material_id: int) -> Dict[str, Any]:
        success = self.repo.delete(material_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Material with ID {material_id} not found."
            )
        return {"success": True, "message": f"Material {material_id} deleted successfully."}


# =========================================================================
# 2. EXPENSES SERVICE
# =========================================================================
def _format_expense_response(item: IndusCustomerGbpaExpense) -> GbpaExpenseResponse:
    return GbpaExpenseResponse(
        item_expense_id=item.item_expense_id,
        id=item.item_expense_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        customerName=item.customer_name,
        item_code=item.item_code,
        item_name=item.item_name,
        itemName=item.item_name,
        expense_code=item.expense_code,
        expenseCode=item.expense_code,
        expense_head=item.expense_head,
        expenseHead=item.expense_head,
        expense_category=item.expense_category,
        expenseCategory=item.expense_category,
        expense_description=item.expense_description,
        expenseDescription=item.expense_description,
        expense_type=item.expense_type,
        type=item.expense_type or "Parent",
        uom=item.uom,
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class GbpaExpensesService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = GbpaExpensesRepository(db)

    def get_expenses_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_expense_id",
        sort_desc: bool = False
    ) -> GbpaExpenseListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_items(
            skip=skip,
            limit=page_size,
            search=search,
            customer_name=customer_name,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        pages = math.ceil(total / page_size) if total > 0 else 1
        formatted = [_format_expense_response(i) for i in items]
        return GbpaExpenseListResponse(
            items=formatted,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def get_expense_by_id(self, expense_id: int) -> GbpaExpenseResponse:
        item = self.repo.get_by_id(expense_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Expense with ID {expense_id} not found."
            )
        return _format_expense_response(item)

    def create_expense(self, payload: GbpaExpenseCreate) -> GbpaExpenseResponse:
        exp_head = (payload.expense_head or payload.expenseHead or "").strip()
        exp_cat = (payload.expense_category or payload.expenseCategory or "").strip()
        exp_desc = (payload.expense_description or payload.expenseDescription or "").strip()
        exp_type = (payload.type or payload.expense_type or "Parent").strip()

        customer_name = resolve_customer_name(self.db, payload.customer_name or payload.customerName)

        data = {
            "company_name": payload.company_name or "Nexus",
            "customer_name": customer_name,
            "item_code": payload.item_code.strip() if payload.item_code else None,
            "item_name": payload.item_name.strip() if payload.item_name else None,
            "expense_code": payload.expense_code.strip() if payload.expense_code else (exp_head or None),
            "expense_head": exp_head if exp_head else None,
            "expense_category": exp_cat if exp_cat else None,
            "expense_description": exp_desc if exp_desc else None,
            "expense_type": exp_type,
            "uom": payload.uom.strip() if payload.uom else None,
            "status": payload.status.strip() if payload.status else "Active"
        }
        try:
            created = self.repo.create(data)
            return _format_expense_response(created)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create GBPA Expense: {str(e)}"
            )

    def update_expense(self, expense_id: int, payload: GbpaExpenseUpdate) -> GbpaExpenseResponse:
        item = self.repo.get_by_id(expense_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Expense with ID {expense_id} not found."
            )

        update_dict: Dict[str, Any] = {}
        if payload.company_name is not None:
            update_dict["company_name"] = payload.company_name.strip()
        
        c_name = payload.customer_name or payload.customerName
        if c_name is not None:
            update_dict["customer_name"] = resolve_customer_name(self.db, c_name)

        if payload.item_code is not None:
            update_dict["item_code"] = payload.item_code.strip() if payload.item_code else None
        if payload.item_name is not None:
            update_dict["item_name"] = payload.item_name.strip() if payload.item_name else None

        exp_head = payload.expense_head or payload.expenseHead
        if exp_head is not None:
            update_dict["expense_head"] = exp_head.strip() if exp_head else None

        exp_cat = payload.expense_category or payload.expenseCategory
        if exp_cat is not None:
            update_dict["expense_category"] = exp_cat.strip() if exp_cat else None

        exp_desc = payload.expense_description or payload.expenseDescription
        if exp_desc is not None:
            update_dict["expense_description"] = exp_desc.strip() if exp_desc else None

        exp_type = payload.type or payload.expense_type
        if exp_type is not None:
            update_dict["expense_type"] = exp_type.strip() if exp_type else "Parent"

        if payload.status is not None:
            update_dict["status"] = payload.status.strip() if payload.status else "Active"

        try:
            updated = self.repo.update(expense_id, update_dict)
            return _format_expense_response(updated)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update GBPA Expense: {str(e)}"
            )

    def delete_expense(self, expense_id: int) -> Dict[str, Any]:
        success = self.repo.delete(expense_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Expense with ID {expense_id} not found."
            )
        return {"success": True, "message": f"Expense {expense_id} deleted successfully."}


# =========================================================================
# 3. INFRASTRUCTURE SERVICE
# =========================================================================
def _format_infra_response(item: IndusCustomerGbpaInfra) -> GbpaInfraResponse:
    return GbpaInfraResponse(
        item_infrastructure_id=item.item_infrastructure_id,
        id=item.item_infrastructure_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        customerName=item.customer_name,
        item_code=item.item_code,
        item_name=item.item_name,
        itemName=item.item_name,
        infra_code=item.infra_code,
        infraCode=item.infra_code,
        infra_category=item.infra_category,
        infraCategory=item.infra_category,
        infra_description=item.infra_description,
        infraDescription=item.infra_description,
        infra_type=item.infra_type,
        type=item.infra_type or "Parent",
        uom=item.uom,
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class GbpaInfraService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = GbpaInfraRepository(db)

    def get_infra_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_infrastructure_id",
        sort_desc: bool = False
    ) -> GbpaInfraListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.list_items(
            skip=skip,
            limit=page_size,
            search=search,
            customer_name=customer_name,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        pages = math.ceil(total / page_size) if total > 0 else 1
        formatted = [_format_infra_response(i) for i in items]
        return GbpaInfraListResponse(
            items=formatted,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def get_infra_by_id(self, infra_id: int) -> GbpaInfraResponse:
        item = self.repo.get_by_id(infra_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Infrastructure with ID {infra_id} not found."
            )
        return _format_infra_response(item)

    def create_infra(self, payload: GbpaInfraCreate) -> GbpaInfraResponse:
        infra_code = (payload.infra_code or payload.infraCode or "").strip()
        if not infra_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Infra Code is required."
            )

        customer_name = resolve_customer_name(self.db, payload.customer_name or payload.customerName)

        # Enforce unique Infra Code
        existing = self.repo.get_by_infra_code(infra_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This Infra Code already exists. Please use a unique Infra Code."
            )

        inf_cat = (payload.infra_category or payload.infraCategory or "").strip()
        inf_desc = (payload.infra_description or payload.infraDescription or "").strip()
        inf_type = (payload.type or payload.infra_type or "Parent").strip()

        data = {
            "company_name": payload.company_name or "Nexus",
            "customer_name": customer_name,
            "item_code": payload.item_code.strip() if payload.item_code else None,
            "item_name": payload.item_name.strip() if payload.item_name else None,
            "infra_code": infra_code,
            "infra_category": inf_cat if inf_cat else None,
            "infra_description": inf_desc if inf_desc else None,
            "infra_type": inf_type,
            "uom": payload.uom.strip() if payload.uom else None,
            "status": payload.status.strip() if payload.status else "Active"
        }
        try:
            created = self.repo.create(data)
            return _format_infra_response(created)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This Infra Code already exists. Please use a unique Infra Code."
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create GBPA Infrastructure: {str(e)}"
            )

    def update_infra(self, infra_id: int, payload: GbpaInfraUpdate) -> GbpaInfraResponse:
        item = self.repo.get_by_id(infra_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Infrastructure with ID {infra_id} not found."
            )

        infra_code = payload.infra_code or payload.infraCode
        if infra_code is not None:
            infra_code_clean = infra_code.strip()
            if infra_code_clean:
                existing = self.repo.get_by_infra_code(infra_code_clean)
                if existing and existing.item_infrastructure_id != infra_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="This Infra Code already exists. Please use a unique Infra Code."
                    )

        update_dict: Dict[str, Any] = {}
        if payload.company_name is not None:
            update_dict["company_name"] = payload.company_name.strip()
        
        c_name = payload.customer_name or payload.customerName
        if c_name is not None:
            update_dict["customer_name"] = resolve_customer_name(self.db, c_name)

        if payload.item_code is not None:
            update_dict["item_code"] = payload.item_code.strip() if payload.item_code else None
        if payload.item_name is not None:
            update_dict["item_name"] = payload.item_name.strip() if payload.item_name else None
        if infra_code is not None:
            update_dict["infra_code"] = infra_code.strip() if infra_code else None

        inf_cat = payload.infra_category or payload.infraCategory
        if inf_cat is not None:
            update_dict["infra_category"] = inf_cat.strip() if inf_cat else None

        inf_desc = payload.infra_description or payload.infraDescription
        if inf_desc is not None:
            update_dict["infra_description"] = inf_desc.strip() if inf_desc else None

        inf_type = payload.type or payload.infra_type
        if inf_type is not None:
            update_dict["infra_type"] = inf_type.strip() if inf_type else "Parent"

        if payload.status is not None:
            update_dict["status"] = payload.status.strip() if payload.status else "Active"

        try:
            updated = self.repo.update(infra_id, update_dict)
            return _format_infra_response(updated)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This Infra Code already exists. Please use a unique Infra Code."
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update GBPA Infrastructure: {str(e)}"
            )

    def delete_infra(self, infra_id: int) -> Dict[str, Any]:
        success = self.repo.delete(infra_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Infrastructure with ID {infra_id} not found."
            )
        return {"success": True, "message": f"Infrastructure {infra_id} deleted successfully."}
