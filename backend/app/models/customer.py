from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, func
from app.db.base import Base

class Customer(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `customer` table.
    """
    __tablename__ = "customer"

    customer_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    business_type = Column(String(150), nullable=True, default="Projects")
    customer_code = Column(String(100), nullable=True, unique=True)
    customer_name = Column(String(255), nullable=True, unique=True)
    legal_name = Column(String(255), nullable=True, unique=True)
    gst_type = Column(String(100), nullable=True, default="SGST")
    gst_number = Column(String(50), nullable=True)
    gst_documents = Column(Text, nullable=True)
    pan_number = Column(String(20), nullable=True)
    pan_documents = Column(Text, nullable=True)
    invoice_type = Column(String(100), nullable=True, default="B2B")
    po_stating_3_digits = Column(String(10), nullable=True)
    gst_address = Column(Text, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Customer(id={self.customer_id}, name='{self.customer_name}', code='{self.customer_code}', status='{self.status}')>"

class CustomerContact(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `customer_contact_details` table.
    """
    __tablename__ = "customer_contact_details"

    contact_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    designation = Column(String(150), nullable=True)
    contact_number = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CustomerContact(id={self.contact_id}, name='{self.name}', customer='{self.customer_name}')>"

class CustomerOfficeLocation(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `customer_office_location_details` table.
    """
    __tablename__ = "customer_office_location_details"

    office_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True)
    office_name = Column(String(255), nullable=True)
    latitude = Column(Numeric, nullable=True)
    longitude = Column(Numeric, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CustomerOfficeLocation(id={self.office_id}, office='{self.office_name}', customer='{self.customer_name}')>"
