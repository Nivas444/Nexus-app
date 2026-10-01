from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, func
from app.db.base import Base

class IndusCustomerGbpa(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_gbpa` table.
    Stores GBPA (General Blanket Purchase Agreement) product / service items for Indus Tower Ltd.
    """
    __tablename__ = "indus_customer_gbpa"

    item_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    item_code = Column(String(100), nullable=True)
    item_name = Column(String(255), nullable=True)
    item_description = Column(Text, nullable=True)
    item_type = Column(String(100), nullable=True)
    hsn_sac = Column(String(50), nullable=True)
    hsn_sac_code = Column(String(50), nullable=True)
    uom = Column(String(50), nullable=True)
    rate = Column(Numeric(14, 2), nullable=True)
    gst_rate = Column(Numeric(5, 2), nullable=True)
    budget_percentage = Column(Numeric(5, 2), nullable=True)
    budget_amount = Column(Numeric(14, 2), nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<IndusCustomerGbpa(id={self.item_id}, item_code='{self.item_code}', item_name='{self.item_name}')>"
