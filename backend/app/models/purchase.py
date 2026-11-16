from sqlalchemy import Column, BigInteger, String, Text, Boolean, Numeric, DateTime, Date, func
from app.db.base import Base

class PurchaseRequest(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_purchase.purchase_request` table.
    Stores PR items submitted from Warehouse or Purchase Manager.
    """
    __tablename__ = "purchase_request"
    __table_args__ = {"schema": "nexus_purchase"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    pr_no = Column(String(100), nullable=False)
    wh_name = Column(String(255), nullable=True)
    request_date = Column(Date, nullable=True)
    material_head = Column(String(255), nullable=True)
    material_category = Column(String(255), nullable=True)
    material_description = Column(Text, nullable=True)
    uom = Column(String(50), nullable=True)
    submit_by = Column(String(255), nullable=True)
    stock_qty = Column(Numeric(15, 2), nullable=True, default=0)
    pr_qty = Column(Numeric(15, 2), nullable=True, default=0)
    status = Column(String(100), nullable=True, default="PR to be submit")

    # Supply Vendor 1
    supply_vendor_1 = Column(String(255), nullable=True)
    supply_vendor_1_rfq_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_po_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_invoice_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_rate = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_taxable_amount = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_cgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_sgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_igst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_1_total_amount = Column(Numeric(15, 2), nullable=True)

    # Supply Vendor 2
    supply_vendor_2 = Column(String(255), nullable=True)
    supply_vendor_2_rfq_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_po_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_invoice_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_rate = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_taxable_amount = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_cgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_sgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_igst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_2_total_amount = Column(Numeric(15, 2), nullable=True)

    # Supply Vendor 3
    supply_vendor_3 = Column(String(255), nullable=True)
    supply_vendor_3_rfq_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_po_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_invoice_qty = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_rate = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_taxable_amount = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_cgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_sgst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_igst = Column(Numeric(15, 2), nullable=True)
    supply_vendor_3_total_amount = Column(Numeric(15, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<PurchaseRequest(id={self.id}, pr_no='{self.pr_no}', status='{self.status}')>"


class Purchase(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_purchase.purchase` table.
    Stores RFQ & PO records, supplier terms, transport details, GST categories, and uploaded documents.
    """
    __tablename__ = "purchase"
    __table_args__ = {"schema": "nexus_purchase"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    pr_no = Column(String(100), nullable=False)
    rfq_no = Column(String(100), nullable=True)
    rfq_id = Column(String(100), nullable=True)
    request_by = Column(String(255), nullable=True)
    request_date = Column(Date, nullable=True)
    po_no = Column(String(100), nullable=True)
    po_date = Column(Date, nullable=True)
    po_amount = Column(Numeric(15, 2), nullable=True, default=0)
    po_amount_in_words = Column(Text, nullable=True)
    po_document = Column(Text, nullable=True)
    supply_vendor_name = Column(String(255), nullable=True)
    po_status = Column(String(100), nullable=True, default="RFQ Pending")
    ship_to = Column(Text, nullable=True)
    transport_scope = Column(String(255), nullable=True)
    payment_terms = Column(Text, nullable=True)
    logistic_name = Column(String(255), nullable=True)
    transport_charges = Column(Numeric(15, 2), nullable=True, default=0)
    loading_unloading_charges = Column(Numeric(15, 2), nullable=True, default=0)
    lr_documents = Column(Text, nullable=True)
    invoice_document = Column(Text, nullable=True)
    pdf_status = Column(String(50), nullable=True, default="Pending")

    # GST category columns
    gst_applicable = Column(Boolean, nullable=True, default=False)
    gst_number = Column(String(50), nullable=True)
    gst_type = Column(String(50), nullable=True)
    gst_rate = Column(Numeric(5, 2), nullable=True, default=0)
    gst_amount = Column(Numeric(15, 2), nullable=True, default=0)
    cgst_amount = Column(Numeric(15, 2), nullable=True, default=0)
    sgst_amount = Column(Numeric(15, 2), nullable=True, default=0)
    igst_amount = Column(Numeric(15, 2), nullable=True, default=0)
    total_amount = Column(Numeric(15, 2), nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Purchase(id={self.id}, pr_no='{self.pr_no}', po_no='{self.po_no}', status='{self.po_status}')>"
