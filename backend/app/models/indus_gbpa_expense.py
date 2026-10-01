from sqlalchemy import Column, BigInteger, String, Text, DateTime, func
from app.db.base import Base

class IndusCustomerGbpaExpense(Base):
    __tablename__ = "indus_customer_gbpa_expenses"

    item_expense_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    item_code = Column(String(100), nullable=True)
    item_name = Column(String(255), nullable=True)
    expense_code = Column(String(100), nullable=True)
    expense_head = Column(String(150), nullable=True)
    expense_category = Column(String(150), nullable=True)
    expense_description = Column(Text, nullable=True)
    expense_type = Column(String(100), nullable=True)
    uom = Column(String(50), nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
