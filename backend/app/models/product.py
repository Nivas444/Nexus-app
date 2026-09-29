from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, func
from app.db.base import Base

class CompanyProduct(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `company_products` table.
    """
    __tablename__ = "company_products"

    material_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    product_name = Column(String(255), nullable=True, unique=True)
    material_head = Column(String(150), nullable=True, unique=True)
    material_category = Column(String(150), nullable=True)
    material_code = Column(String(100), nullable=True)
    hsn_code = Column(String(20), nullable=True)
    material_description = Column(Text, nullable=True)
    make = Column(String(150), nullable=True)
    uom = Column(String(50), nullable=True)
    msq = Column(Numeric, nullable=True)
    moq = Column(Numeric, nullable=True)
    sale_uom = Column(String(50), nullable=True)
    ucf = Column(Numeric, nullable=True)
    value_addition_charges = Column(Numeric, nullable=True)
    oh = Column(Numeric, nullable=True)
    profit = Column(Numeric, nullable=True)
    interest = Column(Numeric, nullable=True)
    cmp = Column(Numeric, nullable=True)
    gst_rate = Column(Numeric, nullable=True)
    site_purchase = Column(Boolean, default=False, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyProduct(id={self.material_id}, name='{self.product_name}', head='{self.material_head}', status='{self.status}')>"
