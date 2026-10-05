from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.indus_gbpa import IndusCustomerGbpa

class IndusGbpaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, item_id: int) -> Optional[IndusCustomerGbpa]:
        return self.db.query(IndusCustomerGbpa).filter(IndusCustomerGbpa.item_id == item_id).first()

    def get_by_item_code(self, item_code: str, customer_name: str = "Indus Tower Ltd") -> Optional[IndusCustomerGbpa]:
        if not item_code:
            return None
        return (
            self.db.query(IndusCustomerGbpa)
            .filter(
                func.lower(IndusCustomerGbpa.item_code) == item_code.strip().lower(),
                func.lower(IndusCustomerGbpa.customer_name) == customer_name.strip().lower()
            )
            .first()
        )

    def get_by_item_name(self, item_name: str, customer_name: str = "Indus Tower Ltd") -> Optional[IndusCustomerGbpa]:
        if not item_name:
            return None
        return (
            self.db.query(IndusCustomerGbpa)
            .filter(
                func.lower(IndusCustomerGbpa.item_name) == item_name.strip().lower(),
                func.lower(IndusCustomerGbpa.customer_name) == customer_name.strip().lower()
            )
            .first()
        )

    def list_items(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        item_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "item_id",
        sort_desc: bool = False,
        customer_name: str = "Indus Tower Ltd"
    ) -> Tuple[List[IndusCustomerGbpa], int]:
        query = self.db.query(IndusCustomerGbpa)

        if customer_name:
            query = query.filter(func.lower(IndusCustomerGbpa.customer_name) == customer_name.strip().lower())

        if search:
            s = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(IndusCustomerGbpa.item_code).like(s),
                    func.lower(IndusCustomerGbpa.item_name).like(s),
                    func.lower(IndusCustomerGbpa.item_description).like(s),
                    func.lower(IndusCustomerGbpa.hsn_sac_code).like(s),
                    func.lower(IndusCustomerGbpa.uom).like(s)
                )
            )

        if item_type:
            query = query.filter(func.lower(IndusCustomerGbpa.item_type) == item_type.strip().lower())

        if status_filter:
            if "in" in status_filter.lower():
                query = query.filter(func.lower(IndusCustomerGbpa.status).like("%in%"))
            else:
                query = query.filter(~func.lower(IndusCustomerGbpa.status).like("%in%"))

        total = query.count()

        # Sorting
        sort_col = getattr(IndusCustomerGbpa, sort_by, IndusCustomerGbpa.item_id)
        if sort_desc:
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, item_data: dict) -> IndusCustomerGbpa:
        item = IndusCustomerGbpa(**item_data)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item_id: int, update_data: dict) -> Optional[IndusCustomerGbpa]:
        item = self.get_by_id(item_id)
        if not item:
            return None

        for key, val in update_data.items():
            if hasattr(item, key):
                setattr(item, key, val)

        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item_id: int) -> bool:
        item = self.get_by_id(item_id)
        if not item:
            return False
        self.db.delete(item)
        self.db.commit()
        return True

    def bulk_create(self, items: List[IndusCustomerGbpa]) -> List[IndusCustomerGbpa]:
        self.db.add_all(items)
        self.db.commit()
        return items

