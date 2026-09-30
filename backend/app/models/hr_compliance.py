from sqlalchemy import Column, BigInteger, Integer, String, Text, Boolean, Numeric, DateTime, Date, func
from app.db.base import Base

class HRCompliance(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `hr_compliance` table.
    Stores HR compliance configurations for EPF, ESI, PT, LWF, TDS, Leave, Bonus, and Medical Insurance.
    """
    __tablename__ = "hr_compliance"

    compliance_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    compliance_type = Column(String(150), nullable=True)
    from_date = Column(Date, nullable=True)
    to_date = Column(Date, nullable=True)
    gross_salary = Column(Numeric(15, 2), nullable=True)
    basic_da_sa = Column(Numeric(15, 2), nullable=True)

    # EPF Specific fields
    epf_filling_frequency = Column(String(50), nullable=True)
    epf_filling_due_date = Column(Date, nullable=True)
    epf_sealing_amount = Column(Numeric(15, 2), nullable=True)
    epf_employee_contribution = Column(Numeric(15, 2), nullable=True)
    epf_employer_contribution = Column(Numeric(15, 2), nullable=True)
    eps_employer_contribution = Column(Numeric(15, 2), nullable=True)
    edli_employer_contribution = Column(Numeric(15, 2), nullable=True)
    epf_admin_charges = Column(Numeric(15, 2), nullable=True)
    epf_status = Column(String(50), default="Active", nullable=True)

    # ESI Specific fields
    esi_filling_frequency = Column(String(50), nullable=True)
    esi_filling_date = Column(Date, nullable=True)
    esi_sealing_amount = Column(Numeric(15, 2), nullable=True)
    esi_employee_contribution = Column(Numeric(15, 2), nullable=True)
    esi_employer_contribution = Column(Numeric(15, 2), nullable=True)
    esi_status = Column(String(50), default="Active", nullable=True)

    # PT Specific fields
    state = Column(String(100), nullable=True)
    pt_filling_frequency = Column(String(50), nullable=True)
    pt_filling_due_date = Column(Date, nullable=True)
    pt_employee_deduction = Column(Numeric(15, 2), nullable=True)
    pt_status = Column(String(50), default="Active", nullable=True)

    # LWF Specific fields
    lwf_filling_frequency = Column(String(50), nullable=True)
    lwf_filling_due_date = Column(Date, nullable=True)
    lwf_employee_contribution = Column(Numeric(15, 2), nullable=True)
    lwf_employer_contribution = Column(Numeric(15, 2), nullable=True)
    lwf_status = Column(String(50), default="Active", nullable=True)

    # TDS Specific fields
    gross_salary_from = Column(Numeric(15, 2), nullable=True)
    gross_salary_to = Column(Numeric(15, 2), nullable=True)
    tds_standard_deduction = Column(Numeric(15, 2), nullable=True)
    section_87a_rebate = Column(Numeric(15, 2), nullable=True)
    taxable_salary = Column(Numeric(15, 2), nullable=True)
    tds_deduction_amount = Column(Numeric(15, 2), nullable=True)
    tds_deduction_percentage = Column(Numeric(5, 2), nullable=True)
    health_and_education_cess = Column(Numeric(15, 2), nullable=True)
    tds_status = Column(String(50), default="Active", nullable=True)

    # Leave Specific fields
    cl_available = Column(Numeric(5, 2), nullable=True)
    cl_eligible = Column(Numeric(5, 2), nullable=True)
    cl_can_claim = Column(Numeric(5, 2), nullable=True)
    sl_available = Column(Numeric(5, 2), nullable=True)
    sl_eligible = Column(Numeric(5, 2), nullable=True)
    sl_can_claim = Column(Numeric(5, 2), nullable=True)
    el_available = Column(Numeric(5, 2), nullable=True)
    el_eligible = Column(Numeric(5, 2), nullable=True)
    el_can_claim = Column(Numeric(5, 2), nullable=True)
    ml_available = Column(Numeric(5, 2), nullable=True)
    ml_eligible = Column(Numeric(5, 2), nullable=True)
    sandwich_leave_policy = Column(Text, nullable=True)
    leave_status = Column(String(50), default="Active", nullable=True)

    # Bonus Specific fields
    statutory_bonus_sealing_amount = Column(Numeric(15, 2), nullable=True)
    statutory_bonus = Column(Numeric(15, 2), nullable=True)
    performance_bonus = Column(Numeric(15, 2), nullable=True)
    company_bonus = Column(Numeric(15, 2), nullable=True)
    bonus_status = Column(String(50), default="Active", nullable=True)

    # Medical Insurance Specific fields
    medical_insurance_company_name = Column(String(255), nullable=True)
    medical_insurance_employee_contribution = Column(Numeric(15, 2), nullable=True)
    medical_insurance_employer_contribution = Column(Numeric(15, 2), nullable=True)
    medical_insurance_status = Column(String(50), default="Active", nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<HRCompliance(id={self.compliance_id}, company='{self.company_name}', type='{self.compliance_type}')>"
