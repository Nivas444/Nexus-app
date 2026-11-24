from sqlalchemy import Column, BigInteger, String, Numeric, Date, DateTime, LargeBinary, func
from app.db.base import Base


class MasterTransport(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_master.transport` table.
    Stores transport details, bank info, contact info, expiry_date, and 8 BYTEA PDF document columns.
    """
    __tablename__ = "transport"
    __table_args__ = {"schema": "nexus_master"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    transport_name = Column(String(255), nullable=True)
    transport_type = Column(String(100), nullable=True)
    vehicle_type = Column(String(100), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    rental_type = Column(String(100), nullable=True)
    rental_amount = Column(Numeric(12, 2), nullable=True)
    halt_rent = Column(Numeric(12, 2), nullable=True)
    transport_status = Column(String(50), nullable=True, default="Active")

    # Bank details
    account_name = Column(String(255), nullable=True)
    account_number = Column(String(50), nullable=True)
    bank_name = Column(String(255), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    account_status = Column(String(50), nullable=True, default="Active")

    # Document expiry date & 8 BYTEA PDF document columns
    expiry_date = Column(Date, nullable=True)
    rc_copy = Column(LargeBinary, nullable=True)
    vehicle_insurance_certificate = Column(LargeBinary, nullable=True)
    fitness_certificate_fc = Column(LargeBinary, nullable=True)
    pollution_certificate_puc = Column(LargeBinary, nullable=True)
    goods_carriage_permit = Column(LargeBinary, nullable=True)
    commercial_driving_licence = Column(LargeBinary, nullable=True)
    road_tax_receipt = Column(LargeBinary, nullable=True)
    fastag = Column(LargeBinary, nullable=True)

    # Contact details
    name = Column(String(255), nullable=True)
    designation = Column(String(150), nullable=True)
    mobile_number = Column(String(20), nullable=True)
    contact_status = Column(String(50), nullable=True, default="Active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
