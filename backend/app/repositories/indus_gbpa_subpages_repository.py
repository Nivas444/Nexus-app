from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.indus_gbpa_material import IndusCustomerGbpaMaterial
from app.models.indus_gbpa_expense import IndusCustomerGbpaExpense
from app.models.indus_gbpa_infra import IndusCustomerGbpaInfra

# =========================================================================
# 1. MATERIALS REPOSITORY
# =========================================================================
class GbpaMaterialsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, material_id: int) -> Optional[IndusCustomerGbpaMaterial]:
        return self.db.query(IndusCustomerGbpaMaterial).filter(IndusCustomerGbpaMaterial.item_material_id == material_id).first()

    def list_items(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_material_id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusCustomerGbpaMaterial], int]:
        query = self.db.query(IndusCustomerGbpaMaterial)

        if customer_name and customer_name.strip():
            c_name = customer_name.strip()
            if "indus" in c_name.lower():
                query = query.filter(func.lower(IndusCustomerGbpaMaterial.customer_name).like("%indus%"))
            else:
                query = query.filter(func.lower(IndusCustomerGbpaMaterial.customer_name) == c_name.lower())

        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(IndusCustomerGbpaMaterial.material_head).like(s),
                    func.lower(IndusCustomerGbpaMaterial.material_category).like(s),
                    func.lower(IndusCustomerGbpaMaterial.material_description).like(s),
                    func.lower(IndusCustomerGbpaMaterial.material_type).like(s),
                    func.lower(IndusCustomerGbpaMaterial.material_code).like(s)
                )
            )

        if status_filter and status_filter.strip():
            if "in" in status_filter.lower():
                query = query.filter(func.lower(IndusCustomerGbpaMaterial.status).like("%in%"))
            else:
                query = query.filter(~func.lower(IndusCustomerGbpaMaterial.status).like("%in%"))

        total = query.count()
        sort_col = getattr(IndusCustomerGbpaMaterial, sort_by, IndusCustomerGbpaMaterial.item_material_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        return query.offset(skip).limit(limit).all(), total

    def create(self, data: dict) -> IndusCustomerGbpaMaterial:
        try:
            item = IndusCustomerGbpaMaterial(**data)
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def update(self, material_id: int, update_data: dict) -> Optional[IndusCustomerGbpaMaterial]:
        try:
            item = self.get_by_id(material_id)
            if not item:
                return None
            for key, val in update_data.items():
                if hasattr(item, key):
                    setattr(item, key, val)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def delete(self, material_id: int) -> bool:
        try:
            item = self.get_by_id(material_id)
            if not item:
                return False
            self.db.delete(item)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def bulk_create(self, items: List[IndusCustomerGbpaMaterial]) -> List[IndusCustomerGbpaMaterial]:
        try:
            self.db.add_all(items)
            self.db.commit()
            return items
        except Exception:
            self.db.rollback()
            raise


# =========================================================================
# 2. EXPENSES REPOSITORY
# =========================================================================
class GbpaExpensesRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, expense_id: int) -> Optional[IndusCustomerGbpaExpense]:
        return self.db.query(IndusCustomerGbpaExpense).filter(IndusCustomerGbpaExpense.item_expense_id == expense_id).first()

    def list_items(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_expense_id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusCustomerGbpaExpense], int]:
        query = self.db.query(IndusCustomerGbpaExpense)

        if customer_name and customer_name.strip():
            c_name = customer_name.strip()
            if "indus" in c_name.lower():
                query = query.filter(func.lower(IndusCustomerGbpaExpense.customer_name).like("%indus%"))
            else:
                query = query.filter(func.lower(IndusCustomerGbpaExpense.customer_name) == c_name.lower())

        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(IndusCustomerGbpaExpense.expense_head).like(s),
                    func.lower(IndusCustomerGbpaExpense.expense_category).like(s),
                    func.lower(IndusCustomerGbpaExpense.expense_description).like(s),
                    func.lower(IndusCustomerGbpaExpense.expense_type).like(s),
                    func.lower(IndusCustomerGbpaExpense.expense_code).like(s)
                )
            )

        if status_filter and status_filter.strip():
            if "in" in status_filter.lower():
                query = query.filter(func.lower(IndusCustomerGbpaExpense.status).like("%in%"))
            else:
                query = query.filter(~func.lower(IndusCustomerGbpaExpense.status).like("%in%"))

        total = query.count()
        sort_col = getattr(IndusCustomerGbpaExpense, sort_by, IndusCustomerGbpaExpense.item_expense_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        return query.offset(skip).limit(limit).all(), total

    def create(self, data: dict) -> IndusCustomerGbpaExpense:
        try:
            item = IndusCustomerGbpaExpense(**data)
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def update(self, expense_id: int, update_data: dict) -> Optional[IndusCustomerGbpaExpense]:
        try:
            item = self.get_by_id(expense_id)
            if not item:
                return None
            for key, val in update_data.items():
                if hasattr(item, key):
                    setattr(item, key, val)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def delete(self, expense_id: int) -> bool:
        try:
            item = self.get_by_id(expense_id)
            if not item:
                return False
            self.db.delete(item)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def bulk_create(self, items: List[IndusCustomerGbpaExpense]) -> List[IndusCustomerGbpaExpense]:
        try:
            self.db.add_all(items)
            self.db.commit()
            return items
        except Exception:
            self.db.rollback()
            raise



# =========================================================================
# 3. INFRASTRUCTURE REPOSITORY
# =========================================================================
class GbpaInfraRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, infra_id: int) -> Optional[IndusCustomerGbpaInfra]:
        return self.db.query(IndusCustomerGbpaInfra).filter(IndusCustomerGbpaInfra.item_infrastructure_id == infra_id).first()

    def get_by_infra_code(self, infra_code: str, customer_name: Optional[str] = None) -> Optional[IndusCustomerGbpaInfra]:
        if not infra_code or not infra_code.strip():
            return None
        query = self.db.query(IndusCustomerGbpaInfra).filter(
            func.lower(IndusCustomerGbpaInfra.infra_code) == infra_code.strip().lower()
        )
        return query.first()

    def list_items(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_infrastructure_id",
        sort_desc: bool = False
    ) -> Tuple[List[IndusCustomerGbpaInfra], int]:
        query = self.db.query(IndusCustomerGbpaInfra)

        if customer_name and customer_name.strip():
            c_name = customer_name.strip()
            if "indus" in c_name.lower():
                query = query.filter(func.lower(IndusCustomerGbpaInfra.customer_name).like("%indus%"))
            else:
                query = query.filter(func.lower(IndusCustomerGbpaInfra.customer_name) == c_name.lower())

        if search and search.strip():
            s = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(IndusCustomerGbpaInfra.infra_code).like(s),
                    func.lower(IndusCustomerGbpaInfra.infra_category).like(s),
                    func.lower(IndusCustomerGbpaInfra.infra_description).like(s),
                    func.lower(IndusCustomerGbpaInfra.infra_type).like(s)
                )
            )

        if status_filter and status_filter.strip():
            if "in" in status_filter.lower():
                query = query.filter(func.lower(IndusCustomerGbpaInfra.status).like("%in%"))
            else:
                query = query.filter(~func.lower(IndusCustomerGbpaInfra.status).like("%in%"))

        total = query.count()
        sort_col = getattr(IndusCustomerGbpaInfra, sort_by, IndusCustomerGbpaInfra.item_infrastructure_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        return query.offset(skip).limit(limit).all(), total

    def create(self, data: dict) -> IndusCustomerGbpaInfra:
        try:
            item = IndusCustomerGbpaInfra(**data)
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def update(self, infra_id: int, update_data: dict) -> Optional[IndusCustomerGbpaInfra]:
        try:
            item = self.get_by_id(infra_id)
            if not item:
                return None
            for key, val in update_data.items():
                if hasattr(item, key):
                    setattr(item, key, val)
            self.db.commit()
            self.db.refresh(item)
            return item
        except Exception:
            self.db.rollback()
            raise

    def delete(self, infra_id: int) -> bool:
        try:
            item = self.get_by_id(infra_id)
            if not item:
                return False
            self.db.delete(item)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise
