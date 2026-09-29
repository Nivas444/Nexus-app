from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.product import CompanyProduct

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, material_id: int) -> Optional[CompanyProduct]:
        return self.db.query(CompanyProduct).filter(CompanyProduct.material_id == material_id).first()

    def get_by_product_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[CompanyProduct]:
        if not name or not name.strip():
            return None
        query = self.db.query(CompanyProduct).filter(func.lower(CompanyProduct.product_name) == name.strip().lower())
        if exclude_id:
            query = query.filter(CompanyProduct.material_id != exclude_id)
        return query.first()

    def get_by_material_head(self, head: str, exclude_id: Optional[int] = None) -> Optional[CompanyProduct]:
        if not head or not head.strip():
            return None
        query = self.db.query(CompanyProduct).filter(func.lower(CompanyProduct.material_head) == head.strip().lower())
        if exclude_id:
            query = query.filter(CompanyProduct.material_id != exclude_id)
        return query.first()

    def get_by_material_code(self, code: str, exclude_id: Optional[int] = None) -> Optional[CompanyProduct]:
        if not code or not code.strip():
            return None
        query = self.db.query(CompanyProduct).filter(func.lower(CompanyProduct.material_code) == code.strip().lower())
        if exclude_id:
            query = query.filter(CompanyProduct.material_id != exclude_id)
        return query.first()

    def get_list(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        head: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "material_id",
        sort_desc: bool = True
    ) -> Tuple[List[CompanyProduct], int]:
        query = self.db.query(CompanyProduct)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CompanyProduct.product_name.ilike(search_pattern),
                    CompanyProduct.material_head.ilike(search_pattern),
                    CompanyProduct.material_category.ilike(search_pattern),
                    CompanyProduct.material_code.ilike(search_pattern),
                    CompanyProduct.hsn_code.ilike(search_pattern),
                    CompanyProduct.material_description.ilike(search_pattern)
                )
            )

        if category:
            query = query.filter(CompanyProduct.material_category.ilike(category.strip()))

        if head:
            query = query.filter(CompanyProduct.material_head.ilike(head.strip()))

        if status:
            query = query.filter(CompanyProduct.status.ilike(status.strip()))

        total = query.count()

        # Dynamic sorting
        sort_column = getattr(CompanyProduct, sort_by, CompanyProduct.material_id)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, product: CompanyProduct) -> CompanyProduct:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product: CompanyProduct) -> CompanyProduct:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: CompanyProduct) -> bool:
        self.db.delete(product)
        self.db.commit()
        return True

    def bulk_create(self, products: List[CompanyProduct]) -> List[CompanyProduct]:
        self.db.add_all(products)
        self.db.commit()
        for prod in products:
            self.db.refresh(prod)
        return products
