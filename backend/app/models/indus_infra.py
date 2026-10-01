from sqlalchemy import Column, BigInteger, String, Text, Date, DateTime, func
from app.db.base import Base

class IndusCustomerInfra(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_infra` table.
    Stores infrastructure details for Indus Tower Ltd customer.
    """
    __tablename__ = "indus_customer_infra"

    item_infrastructure_detail_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    item_code = Column(String(100), nullable=True)
    infra_category = Column(String(150), nullable=True)
    infra_description = Column(Text, nullable=True)
    uom = Column(String(50), nullable=True)
    make = Column(String(150), nullable=True)
    commissioning = Column(Date, nullable=True)
    i_map = Column(Text, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<IndusCustomerInfra(id={self.item_infrastructure_detail_id}, infra_category='{self.infra_category}', customer='{self.customer_name}')>"
