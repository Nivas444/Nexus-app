from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, Date, func
from app.db.base import Base

class VendorMaster(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `vendor_master` table.
    Stores master vendor information as well as bank and contact details.
    """
    __tablename__ = "vendor_master"

    vendor_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    vendor_name = Column(String(255), nullable=True)
    entity_type = Column(String(100), nullable=True)
    business_type = Column(String(150), nullable=True)
    service_type = Column(String(150), nullable=True)
    contract_type = Column(String(150), nullable=True)
    gst_number_available = Column(Boolean, default=False, nullable=True)
    gst_number = Column(String(50), nullable=True)
    gst_certificate = Column(Text, nullable=True)
    gst_type = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    pan_number = Column(String(20), nullable=True)
    pan_documents = Column(Text, nullable=True)
    tds_deduction = Column(Boolean, default=False, nullable=True)
    tds_rate = Column(Numeric(5, 2), nullable=True)
    tds_code = Column(String(50), nullable=True)

    # Bank details columns
    account_name = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    bank_name = Column(String(255), nullable=True)
    account_type = Column(String(50), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    cancelled_cheque = Column(Text, nullable=True)

    # Contact details columns
    contact_name = Column(String(255), nullable=True)
    contact_number = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)

    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<VendorMaster(id={self.vendor_id}, name='{self.vendor_name}', status='{self.status}')>"


class VendorPrice(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `vendor_price` table.
    Stores vendor supply and service pricing details.
    """
    __tablename__ = "vendor_price"

    vendor_service_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    vendor_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    sub_project_type = Column(String(150), nullable=True)
    item_description = Column(Text, nullable=True)
    vehicle_type = Column(String(100), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    fuel_type = Column(String(50), nullable=True)
    range_value = Column(Numeric(15, 2), nullable=True)
    rental_type = Column(String(100), nullable=True)
    service_description = Column(Text, nullable=True)
    from_date = Column(Date, nullable=True)
    to_date = Column(Date, nullable=True)
    rate = Column(Numeric(15, 2), nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<VendorPrice(id={self.vendor_service_id}, vendor='{self.vendor_name}', rate={self.rate}, status='{self.status}')>"
