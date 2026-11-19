from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, Date, Integer, func
from app.db.base import Base

class AccountPurchase(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_accounts.purchase` table.
    Stores purchase invoice records, basic amounts, taxes, payable & paid amounts, and partial payment flags.
    """
    __tablename__ = "purchase"
    __table_args__ = {"schema": "nexus_accounts"}

    purchase_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    voucher_number = Column(String(100), nullable=True)
    voucher_date = Column(Date, nullable=True)
    vendor_name = Column(String(255), nullable=True)
    invoice_number = Column(String(100), nullable=True)
    invoice_date = Column(Date, nullable=True)
    basic_amount = Column(Numeric(15, 2), nullable=True, default=0)
    cgst = Column(Numeric(15, 2), nullable=True, default=0)
    sgst = Column(Numeric(15, 2), nullable=True, default=0)
    igst = Column(Numeric(15, 2), nullable=True, default=0)
    total_amount = Column(Numeric(15, 2), nullable=True, default=0)
    due_date = Column(Date, nullable=True)
    ageing = Column(Integer, nullable=True, default=0)
    tds_deduction_amount = Column(Numeric(15, 2), nullable=True, default=0)
    payable_amount = Column(Numeric(15, 2), nullable=True, default=0)
    paid_amount = Column(Numeric(15, 2), nullable=True, default=0)
    payment_reference_number = Column(String(150), nullable=True)
    paid_date = Column(Date, nullable=True)
    payment_receipt_number = Column(String(150), nullable=True)
    partial_payment = Column(Boolean, nullable=True, default=False)
    gstr2b_status = Column(String(50), nullable=True, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AccountPurchase(id={self.purchase_id}, vendor='{self.vendor_name}', invoice='{self.invoice_number}', total={self.total_amount})>"
