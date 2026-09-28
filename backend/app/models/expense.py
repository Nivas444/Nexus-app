from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, func
from app.db.base import Base

class CompanyExpense(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `company_expenses` table.
    """
    __tablename__ = "company_expenses"

    expense_id = Column(BigInteger, primary_key=True, autoincrement=True)
    industry = Column(String(150), nullable=True)
    company_name = Column(String(255), nullable=True)
    expense_head = Column(String(150), nullable=True)
    expense_category = Column(String(150), nullable=True)
    expense_name = Column(String(255), nullable=True)
    raiser = Column(String(255), nullable=True)
    depreciation = Column(Boolean, default=False, nullable=True)
    expense_code = Column(String(100), nullable=True)
    sac_code = Column(String(20), nullable=True)
    expense_description = Column(Text, nullable=True)
    uom = Column(String(50), nullable=True)
    gst_rate = Column(Numeric(5, 2), nullable=True)
    rcm = Column(Boolean, default=False, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyExpense(id={self.expense_id}, name='{self.expense_name}', head='{self.expense_head}', status='{self.status}')>"
