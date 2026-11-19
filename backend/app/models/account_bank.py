from sqlalchemy import Column, BigInteger, String, Text, Numeric, Date, TIMESTAMP, func
from app.db.base import Base


class AccountBank(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `nexus_accounts.bank` table.
    Stores bank statement/transaction entries (withdrawals, deposits, balances).
    """
    __tablename__ = "bank"
    __table_args__ = {"schema": "nexus_accounts"}

    bank_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    url = Column(Text, nullable=True)
    voucher_number = Column(String(100), nullable=True)
    voucher_date = Column(Date, nullable=True)
    bank_name = Column(String(255), nullable=True)
    particulars = Column(Text, nullable=True)
    reference_number = Column(String(150), nullable=True)
    withdrawal_dr = Column(Numeric(15, 2), nullable=True, default=0)
    deposit_cr = Column(Numeric(15, 2), nullable=True, default=0)
    balance = Column(Numeric(15, 2), nullable=True, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<AccountBank(id={self.bank_id}, bank='{self.bank_name}', ref='{self.reference_number}', balance={self.balance})>"
