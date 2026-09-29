from sqlalchemy import Column, BigInteger, String, Text, Numeric, Boolean, Date, DateTime, LargeBinary, ForeignKey, func
from app.db.base import Base

class CompanyEmployee(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `company_employee_details` table.
    """
    __tablename__ = "company_employee_details"

    employee_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    photo = Column(Text, nullable=True)
    employee_type = Column(String(100), nullable=True, default="On-Roll")
    designation = Column(String(255), nullable=True)
    designation_edit = Column(Boolean, default=False, nullable=True)
    employee_code = Column(String(100), nullable=True, unique=True)
    id_card = Column(Text, nullable=True)
    employee_name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    address_edit = Column(Boolean, default=False, nullable=True)
    mobile_number = Column(String(50), nullable=True)
    mobile_number_edit = Column(Boolean, default=False, nullable=True)
    email = Column(String(255), nullable=True)
    email_edit = Column(Boolean, default=False, nullable=True)
    dob = Column(Date, nullable=True)
    blood_group = Column(String(50), nullable=True)
    marital_status = Column(String(50), nullable=True)
    marital_status_edit = Column(Boolean, default=False, nullable=True)
    qualification = Column(String(255), nullable=True)
    qualification_documents = Column(Text, nullable=True)
    pan_number = Column(String(50), nullable=True)
    pan_documents = Column(Text, nullable=True)
    aadhaar_number = Column(String(50), nullable=True)
    aadhaar_documents = Column(Text, nullable=True)
    dl_number = Column(String(50), nullable=True)
    dl_documents = Column(Text, nullable=True)
    passport_number = Column(String(50), nullable=True)
    passport_documents = Column(Text, nullable=True)
    epf_available = Column(Boolean, default=False, nullable=True)
    epf_uan = Column(String(100), nullable=True)
    epf_documents = Column(Text, nullable=True)
    esi_code_available = Column(Boolean, default=False, nullable=True)
    esi_code = Column(String(100), nullable=True)
    esi_documents = Column(Text, nullable=True)
    medical_insurance_available = Column(Boolean, default=False, nullable=True)
    medical_insurance_policy_number = Column(String(100), nullable=True)
    medical_insurance_policy_documents = Column(Text, nullable=True)
    previous_experience = Column(Numeric(10, 2), nullable=True)
    previous_experience_documents = Column(Text, nullable=True)
    current_experience = Column(Numeric(10, 2), nullable=True)
    total_experience = Column(Numeric(10, 2), nullable=True)
    doj = Column(Date, nullable=True)
    bio_data = Column(Text, nullable=True)
    appointment_letter = Column(Text, nullable=True)
    relieving_letter = Column(Text, nullable=True)
    experience_certificate = Column(Text, nullable=True)
    geo_attendance = Column(Boolean, default=False, nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    e_signature = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyEmployee(id={self.employee_id}, name='{self.employee_name}', code='{self.employee_code}', type='{self.employee_type}', status='{self.status}')>"


class CompanyEmployeeDocument(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `company_employee_documents` table.
    Stores binary PDF documents attached to an employee.
    """
    __tablename__ = "company_employee_documents"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("company_employee_details.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<CompanyEmployeeDocument(id={self.id}, employee_id={self.employee_id}, type='{self.document_type}', file='{self.file_name}', size={self.file_size})>"
