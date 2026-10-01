from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, func
from app.db.base import Base

class IndusSiteDetails(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_site_details` table.
    Stores both Site information and Contact information (FSE, AOM) in a single table.
    """
    __tablename__ = "indus_site_details"

    site_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    site_code = Column(String(100), nullable=True, unique=True)
    wh_id = Column(String(100), nullable=True)
    site_name = Column(String(255), nullable=True, unique=True)
    tower_type = Column(String(150), nullable=True)
    district = Column(String(100), nullable=True)
    town = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    transport_zone = Column(String(150), nullable=True)
    
    # Contact Information
    fse_name = Column(String(255), nullable=True)
    fse_contact_number = Column(String(30), nullable=True)
    fse_email = Column(String(255), nullable=True)
    
    aom_name = Column(String(255), nullable=True)
    aom_contact_number = Column(String(30), nullable=True)
    aom_email = Column(String(255), nullable=True)
    
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<IndusSiteDetails(id={self.site_id}, site_code='{self.site_code}', site_name='{self.site_name}')>"
