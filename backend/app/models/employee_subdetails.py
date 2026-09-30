from sqlalchemy import Column, BigInteger, String, Text, Numeric, Date, DateTime, LargeBinary, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class EmployeeBankDetail(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `employee_bank_details` table.
    """
    __tablename__ = "employee_bank_details"

    employee_bank_account_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    employee_id = Column(String(100), nullable=True)
    employee_name = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    account_type = Column(String(50), nullable=True)
    bank_name = Column(String(255), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    cancelled_cheque = Column(Text, nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=True)

    documents = relationship("EmployeeBankDocument", back_populates="bank_detail", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<EmployeeBankDetail(id={self.employee_bank_account_id}, bank='{self.bank_name}', acc_num='{self.account_number}', status='{self.status}')>"


class EmployeeBankDocument(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `employee_bank_documents` table.
    Stores binary PDF documents attached to a bank detail record.
    """
    __tablename__ = "employee_bank_documents"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    bank_detail_id = Column(BigInteger, ForeignKey("employee_bank_details.employee_bank_account_id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), default="bank_account_document", nullable=False)
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    bank_detail = relationship("EmployeeBankDetail", back_populates="documents")

    def __repr__(self) -> str:
        return f"<EmployeeBankDocument(id={self.id}, bank_detail_id={self.bank_detail_id}, file='{self.file_name}', size={self.file_size})>"


class EmployeeAssetDetail(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `employee_assets_details` table.
    """
    __tablename__ = "employee_assets_details"

    asset_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    employee_id = Column(String(100), nullable=True)
    employee_name = Column(String(255), nullable=True)
    date = Column(Date, nullable=True)
    asset_details = Column(Text, nullable=True)
    serial_number = Column(String(150), nullable=True)
    uom = Column(String(50), nullable=True, default="Nos")
    qty = Column(Numeric(15, 2), nullable=True, default=1)
    rate = Column(Numeric(15, 2), nullable=True, default=0)
    amount = Column(Numeric(15, 2), nullable=True, default=0)
    expiry_date = Column(Date, nullable=True)
    returned_status = Column(String(50), nullable=True)
    returned_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<EmployeeAssetDetail(id={self.asset_id}, asset='{self.asset_details}', amount={self.amount})>"


class EmployeeSalaryDetail(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `employee_salary_details` table.
    """
    __tablename__ = "employee_salary_details"

    salary_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    url = Column(Text, nullable=True)
    employee_id = Column(String(100), nullable=True)
    employee_name = Column(String(255), nullable=True)
    from_date = Column(Date, nullable=True)
    to_date = Column(Date, nullable=True)
    gross_salary = Column(Numeric(15, 2), nullable=True, default=0)
    basic_salary = Column(Numeric(15, 2), nullable=True, default=0)
    hra = Column(Numeric(15, 2), nullable=True, default=0)
    da = Column(Numeric(15, 2), nullable=True, default=0)
    sa = Column(Numeric(15, 2), nullable=True, default=0)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<EmployeeSalaryDetail(id={self.salary_id}, employee='{self.employee_name}', gross={self.gross_salary})>"
