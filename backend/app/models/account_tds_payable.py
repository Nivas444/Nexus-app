from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, Date, TIMESTAMP, func
from app.db.base import Base


class AccountTdsPayable(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_accounts.tds_payable` table.
    Stores TDS challan payment details (challan number, paid date, challan documents, amounts).
    """
    __tablename__ = "tds_payable"
    __table_args__ = {"schema": "nexus_accounts"}

    tds_payable_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    year = Column(Integer, nullable=True)
    quarter = Column(String(20), nullable=True)
    month = Column(String(20), nullable=True)
    tds_deducted_amount = Column(Numeric(15, 2), nullable=True, default=0)
    tds_challan_number = Column(String(100), nullable=True)
    tds_paid_amount = Column(Numeric(15, 2), nullable=True, default=0)
    tds_paid_date = Column(Date, nullable=True)
    challan_documents = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AccountTdsPayable(id={self.tds_payable_id}, challan='{self.tds_challan_number}', paid_date={self.tds_paid_date})>"
