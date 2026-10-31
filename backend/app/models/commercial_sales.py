from sqlalchemy import Column, BigInteger, String, Date, Numeric, Text, TIMESTAMP, LargeBinary
from sqlalchemy.sql import func
from app.db.base import Base


class Sales(Base):
    """
    SQLAlchemy model mapping the PostgreSQL `sales` table in `Nexus_Accounts DB`.
    Represents tax invoice and sales records.
    """
    __tablename__ = "sales"

    sales_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True)
    voucher_number = Column(String(100), nullable=True)  # Stores invoice_no
    customer_name = Column(String(255), nullable=True)
    document_type = Column(String(100), nullable=True)  # CGST/SGST or IGST
    document_no = Column(String(100), nullable=True)
    document_date = Column(Date, nullable=True)  # Stores invoice_date
    irn_no = Column(String(100), nullable=True)  # Stores irn_no
    acknowledgement_no = Column(String(100), nullable=True)
    acknowledgement_date = Column(Date, nullable=True)
    qr_code = Column(Text, nullable=True)
    invoice_document = Column(LargeBinary, nullable=True)  # Stores generated PDF bytes
    basic_amount = Column(Numeric, nullable=True)
    cgst = Column(Numeric, nullable=True)
    sgst = Column(Numeric, nullable=True)
    igst = Column(Numeric, nullable=True)
    total_amount = Column(Numeric, nullable=True)
    total_amount_in_words = Column(Text, nullable=True)
    tds_deduction = Column(Numeric, nullable=True)
    approved_amount = Column(Numeric, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ReceiptIndus(Base):
    """
    SQLAlchemy model mapping the PostgreSQL `receipt_indus` table in `Nexus_Accounts DB`.
    Represents customer receipts and receivable details from the Invoice# workflow.
    """
    __tablename__ = "receipt_indus"

    receipt_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=True)
    voucher_number = Column(String(100), nullable=True)  # Invoice No
    indus_payment_receipt_number = Column(String(100), nullable=True)
    indus_payment_receipt_date = Column(Date, nullable=True)
    invoice_no = Column(String(100), nullable=True)
    invoice_amount = Column(Numeric, nullable=True)  # From Invoice# tab
    tds = Column(Numeric, nullable=True)             # From Invoice# tab
    receivable = Column(Numeric, nullable=True)      # From Invoice# tab
    approved_amount = Column(Numeric, nullable=True)
    dn_amount = Column(Numeric, nullable=True)
    dn_number = Column(String(100), nullable=True)
    dn_remarks = Column(Text, nullable=True)
    treds_receipt_number = Column(String(100), nullable=True)
    treds_receipt_date = Column(Date, nullable=True)
    treds_discount_amount = Column(Numeric, nullable=True)
    treds_processing_fee = Column(Numeric, nullable=True)
    treds_gst = Column(Numeric, nullable=True)
    received_amount = Column(Numeric, nullable=True)
    received_date = Column(Date, nullable=True)
    ageing = Column(BigInteger, nullable=True)
    received_bank = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
