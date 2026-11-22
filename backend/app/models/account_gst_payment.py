from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, TIMESTAMP, func
from app.db.base import Base


class AccountGstPayment(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_accounts.gst_payment` table.
    Stores monthly GSTR-3B Taxable-Cash payable values (CGST, SGST, IGST) and 3B return documents.
    """
    __tablename__ = "gst_payment"
    __table_args__ = {"schema": "nexus_accounts"}

    gst_payment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    year = Column(Integer, nullable=True)
    month = Column(String(20), nullable=True)
    cash_credit = Column(String(50), nullable=True)
    cgst_payable = Column(Numeric(15, 2), nullable=True, default=0)
    sgst_payable = Column(Numeric(15, 2), nullable=True, default=0)
    igst_payable = Column(Numeric(15, 2), nullable=True, default=0)
    total_amount = Column(Numeric(15, 2), nullable=True, default=0)
    paid_receipt = Column(Text, nullable=True)
    documents_3b = Column("3b_documents", Text, nullable=True)
    filling_status = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AccountGstPayment(id={self.gst_payment_id}, year={self.year}, month='{self.month}', total={self.total_amount})>"
