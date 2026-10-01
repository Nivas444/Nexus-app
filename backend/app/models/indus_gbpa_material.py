from sqlalchemy import Column, BigInteger, String, Text, DateTime, func
from app.db.base import Base

class IndusCustomerGbpaMaterial(Base):
    __tablename__ = "indus_customer_gpba_materials"

    item_material_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    item_code = Column(String(100), nullable=True)
    item_name = Column(String(255), nullable=True)
    material_code = Column(String(100), nullable=True)
    material_head = Column(String(150), nullable=True)
    material_category = Column(String(150), nullable=True)
    material_description = Column(Text, nullable=True)
    material_type = Column(String(100), nullable=True)
    uom = Column(String(50), nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
