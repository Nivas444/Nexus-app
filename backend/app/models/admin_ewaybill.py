from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, Date, func
from app.db.base import Base

class AdminEWayBill(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_admin.ewaybill` table.
    Stores statutory E-Way Bill numbers, generation date, distance, barcodes, and routing details.
    """
    __tablename__ = "ewaybill"
    __table_args__ = {"schema": "nexus_admin"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    document_no = Column(String(100), nullable=True)
    e_way_bill_no = Column(String(100), nullable=True)
    e_way_bill_date = Column(Date, nullable=True)
    distance = Column(Numeric(10, 2), nullable=True)
    type = Column(String(100), nullable=True)
    qr_code = Column(Text, nullable=True)
    bar_code = Column(Text, nullable=True)
    transporter_name = Column(String(255), nullable=True)
    lr_no = Column(String(100), nullable=True)
    from_district = Column(String(150), nullable=True)
    from_pincode = Column(String(10), nullable=True)
    to_district = Column(String(150), nullable=True)
    to_pincode = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AdminEWayBill(id={self.id}, ewb='{self.e_way_bill_no}', doc='{self.document_no}')>"
