from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, Date, Integer, func
from app.db.base import Base

class AdminTransport(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_admin.transport` table.
    Stores transport vehicles, rental information, driver details, and contact info.
    """
    __tablename__ = "transport"
    __table_args__ = {"schema": "nexus_admin"}

    transporter_payment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    url = Column(Text, nullable=True)
    voucher_no = Column(String(100), nullable=True)
    voucher_date = Column(Date, nullable=True)
    year = Column(Integer, nullable=True)
    month = Column(String(50), nullable=True)
    total_month_days = Column(Numeric, nullable=True)
    transporter_name = Column(String(255), nullable=True)
    vehicle_number = Column(String(100), nullable=True)
    vehicle_type = Column(String(100), nullable=True)
    transport_type = Column(String(100), nullable=True)
    driver_name = Column(String(255), nullable=True)
    whatsapp_number = Column(String(50), nullable=True)
    total_worked_days = Column(Numeric, nullable=True)
    total_halt_days = Column(Numeric, nullable=True)
    lop = Column(Numeric, nullable=True)
    daily_rental_amount = Column(Numeric, nullable=True)
    daily_halt_amount = Column(Numeric, nullable=True)
    total_rental_amount = Column(Numeric, nullable=True)
    diesel_amount = Column(Numeric, nullable=True)
    total_mileage = Column(Numeric, nullable=True)
    diesel_shortage = Column(Numeric, nullable=True)
    fastag_amount = Column(Numeric, nullable=True)
    advance = Column(Numeric, nullable=True)
    balance_rental_amount = Column(Numeric, nullable=True)
    account_name = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    bank_name = Column(String(255), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    payment_date = Column(Date, nullable=True)
    payment_reference_number = Column(String(100), nullable=True)
    payment_receipt = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AdminTransport(id={self.transporter_payment_id}, name='{self.transporter_name}', vehicle='{self.vehicle_number}')>"
