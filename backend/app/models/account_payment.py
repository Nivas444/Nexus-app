from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, Date, Integer, func
from app.db.base import Base

class AccountPayment(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_accounts.payment` table.
    Stores payment vouchers, transport charges, expenses, and transaction details.
    """
    __tablename__ = "payment"
    __table_args__ = {"schema": "nexus_accounts"}

    payment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    voucher_number = Column(String(100), nullable=True)
    voucher_date = Column(Date, nullable=True)
    po_no = Column(String(100), nullable=True)
    site_id = Column(String(100), nullable=True)
    site_name = Column(String(255), nullable=True)
    request_date = Column(Date, nullable=True)
    request_by = Column(String(255), nullable=True)
    account_head = Column(String(150), nullable=True)
    expense_type = Column(String(100), nullable=True)
    expense_description = Column(Text, nullable=True)
    transferred_from = Column(String(255), nullable=True)
    transferred_to = Column(String(255), nullable=True)
    documents = Column(Text, nullable=True)
    ageing = Column(Integer, nullable=True, default=0)
    account_number = Column(String(100), nullable=True)
    bank_name = Column(String(255), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    partial_payment = Column(Boolean, nullable=True, default=False)
    advance_payment = Column(Numeric(15, 2), nullable=True, default=0)
    whatsapp_receipt = Column(Text, nullable=True)
    amount = Column(Numeric(15, 2), nullable=True, default=0)
    raiser_remarks = Column(Text, nullable=True)
    approver_remarks = Column(Text, nullable=True)
    approved_date = Column(Date, nullable=True)
    validator_remarks = Column(Text, nullable=True)
    validated_date = Column(Date, nullable=True)
    md_approved_date = Column(Date, nullable=True)
    md_remarks = Column(Text, nullable=True)
    account_transferred_date = Column(Date, nullable=True)
    accounts_remarks = Column(Text, nullable=True)
    amount_in_words = Column(Text, nullable=True)
    payment_receipt_number = Column(String(150), nullable=True)
    paid_amount = Column(Numeric(15, 2), nullable=True, default=0)
    payment_reference_number = Column(String(150), nullable=True)
    paid_date = Column(Date, nullable=True)
    receipt_documents = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AccountPayment(id={self.payment_id}, po_no='{self.po_no}', expense_type='{self.expense_type}', amount={self.amount})>"
