from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.expense import CompanyExpense

class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, expense_id: int) -> Optional[CompanyExpense]:
        return self.db.query(CompanyExpense).filter(CompanyExpense.expense_id == expense_id).first()

    def get_by_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[CompanyExpense]:
        if not name or not name.strip():
            return None
        query = self.db.query(CompanyExpense).filter(func.lower(CompanyExpense.expense_name) == name.strip().lower())
        if exclude_id:
            query = query.filter(CompanyExpense.expense_id != exclude_id)
        return query.first()

    def get_by_code(self, code: str, exclude_id: Optional[int] = None) -> Optional[CompanyExpense]:
        if not code or not code.strip():
            return None
        query = self.db.query(CompanyExpense).filter(func.lower(CompanyExpense.expense_code) == code.strip().lower())
        if exclude_id:
            query = query.filter(CompanyExpense.expense_id != exclude_id)
        return query.first()

    def get_by_name_or_code(self, name: str, code: Optional[str] = None) -> Optional[CompanyExpense]:
        query = self.db.query(CompanyExpense).filter(CompanyExpense.expense_name == name)
        if code:
            query = query.filter(CompanyExpense.expense_code == code)
        return query.first()

    def get_list(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        head: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "expense_id",
        sort_desc: bool = False
    ) -> Tuple[List[CompanyExpense], int]:
        query = self.db.query(CompanyExpense)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CompanyExpense.expense_name.ilike(search_pattern),
                    CompanyExpense.expense_category.ilike(search_pattern),
                    CompanyExpense.expense_head.ilike(search_pattern),
                    CompanyExpense.expense_code.ilike(search_pattern),
                    CompanyExpense.expense_description.ilike(search_pattern)
                )
            )

        if category:
            query = query.filter(CompanyExpense.expense_category.ilike(category.strip()))

        if head:
            query = query.filter(CompanyExpense.expense_head.ilike(head.strip()))

        if status:
            query = query.filter(CompanyExpense.status.ilike(status.strip()))

        total = query.count()

        # Dynamic sorting
        sort_column = getattr(CompanyExpense, sort_by, CompanyExpense.expense_id)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, expense: CompanyExpense) -> CompanyExpense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def update(self, expense: CompanyExpense) -> CompanyExpense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: CompanyExpense) -> bool:
        self.db.delete(expense)
        self.db.commit()
        return True

    def bulk_create(self, expenses: List[CompanyExpense]) -> List[CompanyExpense]:
        self.db.add_all(expenses)
        self.db.commit()
        for exp in expenses:
            self.db.refresh(exp)
        return expenses
