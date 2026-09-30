from sqlalchemy import Column, BigInteger, Integer, String, Text, Boolean, Numeric, DateTime, Date, func
from app.db.base import Base

class CompanyMasterDetails(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `company_master_details` table.
    Stores company master details, registration codes, compliance certificates, and flags.
    """
    __tablename__ = "company_master_details"

    company_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    company_legal_name = Column(String(255), nullable=True)
    entity_type = Column(String(100), nullable=True)
    industry = Column(String(150), nullable=True)
    state = Column(String(100), nullable=True)
    state_multi_state = Column(Boolean, default=False, nullable=True)
    
    logo = Column(Text, nullable=True)
    logo_file = Column(Text, nullable=True)
    logo_edit = Column(Boolean, default=False, nullable=True)
    logo_multi_state = Column(Boolean, default=False, nullable=True)

    hex_color_code = Column(String(50), nullable=True)
    hex_color_code_edit = Column(Boolean, default=False, nullable=True)
    hex_color_code_multi_state = Column(Boolean, default=False, nullable=True)

    digital_stamp_file = Column(Text, nullable=True)
    digital_stamp_edit = Column(Boolean, default=False, nullable=True)
    digital_stamp_multi_state = Column(Boolean, default=False, nullable=True)

    dsc_file = Column(Text, nullable=True)
    dsc_multi_state = Column(Boolean, default=False, nullable=True)

    ssl_certificate_file = Column(Text, nullable=True)
    ssl_certificate_multi_state = Column(Boolean, default=False, nullable=True)

    e_signature_file = Column(Text, nullable=True)
    e_signature_multi_state = Column(Boolean, default=False, nullable=True)

    registered_documents = Column(Text, nullable=True)
    registered_documents_file = Column(Text, nullable=True)
    registered_documents_edit = Column(Boolean, default=False, nullable=True)
    registered_documents_multi_state = Column(Boolean, default=False, nullable=True)

    registered_address = Column(Text, nullable=True)
    address_documents = Column(Text, nullable=True)
    registered_address_edit = Column(Boolean, default=False, nullable=True)
    registered_address_multi_state = Column(Boolean, default=False, nullable=True)

    pan_number = Column(String(50), nullable=True)
    pan_documents_file = Column(Text, nullable=True)
    pan_documents_edit = Column(Boolean, default=False, nullable=True)
    pan_multi_state = Column(Boolean, default=False, nullable=True)

    gst_code = Column(String(50), nullable=True)
    gst_documents = Column(Text, nullable=True)
    gst_edit = Column(Boolean, default=False, nullable=True)
    gst_multi_state = Column(Boolean, default=False, nullable=True)

    tan_number = Column(String(50), nullable=True)
    tan_documents = Column(Text, nullable=True)
    tan_documents_edit = Column(Boolean, default=False, nullable=True)
    tan_multi_state = Column(Boolean, default=False, nullable=True)

    udyam_code_available = Column(Boolean, default=False, nullable=True)
    udyam_code = Column(String(100), nullable=True)
    udyam_documents = Column(Text, nullable=True)
    udyam_code_edit = Column(Boolean, default=False, nullable=True)
    udyam_code_multi_state = Column(Boolean, default=False, nullable=True)

    epf_code_available = Column(Boolean, default=False, nullable=True)
    epf_documents = Column(Text, nullable=True)
    epf_code = Column(String(100), nullable=True)
    epf_edit = Column(Boolean, default=False, nullable=True)
    epf_multi_state = Column(Boolean, default=False, nullable=True)

    esi_code_available = Column(Boolean, default=False, nullable=True)
    esi_code = Column(String(100), nullable=True)
    esi_documents = Column(Text, nullable=True)
    esi_code_edit = Column(Boolean, default=False, nullable=True)
    esi_code_multi_state = Column(Boolean, default=False, nullable=True)

    ptec_code_available = Column(Boolean, default=False, nullable=True)
    ptec_code = Column(String(100), nullable=True)
    ptec_documents = Column(Text, nullable=True)
    ptec_code_edit = Column(Boolean, default=False, nullable=True)
    ptec_multi_state = Column(Boolean, default=False, nullable=True)

    lwf_code_available = Column(Boolean, default=False, nullable=True)
    lwf_code = Column(String(100), nullable=True)
    lwf_documents = Column(Text, nullable=True)
    lwf_code_edit = Column(Boolean, default=False, nullable=True)
    lwf_multi_state = Column(Boolean, default=False, nullable=True)

    establishment_registration_code_available = Column(Boolean, default=False, nullable=True)
    establishment_registration_code = Column(String(100), nullable=True)
    establishment_registration_documents = Column(Text, nullable=True)
    establishment_registration_code_edit = Column(Boolean, default=False, nullable=True)
    establishment_registration_code_multi_state = Column(Boolean, default=False, nullable=True)

    iso_certificate_available = Column(Boolean, default=False, nullable=True)
    iso_certificate_number = Column(String(100), nullable=True)
    iso_certificate_documents = Column(Text, nullable=True)
    iso_certificate_multi_state = Column(Boolean, default=False, nullable=True)
    iso_certificate_edit = Column(Boolean, default=False, nullable=True)

    osha_certificate_available = Column(Boolean, default=False, nullable=True)
    osha_certificate_number = Column(String(100), nullable=True)
    osha_certificate_documents = Column(Text, nullable=True)
    osha_certificate_multi_state = Column(Boolean, default=False, nullable=True)
    osha_certificate_edit = Column(Boolean, default=False, nullable=True)

    e_invoice = Column(Boolean, default=False, nullable=True)
    e_invoice_multi_state = Column(Boolean, default=False, nullable=True)
    e_invoice_edit = Column(Boolean, default=False, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyMasterDetails(id={self.company_id}, name='{self.company_name}')>"


class CompanyBankAccount(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `company_bank_accounts` table.
    """
    __tablename__ = "company_bank_accounts"

    bank_account_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    account_name = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    account_type = Column(String(50), nullable=True)
    bank_name = Column(String(255), nullable=True)
    ifsc_code = Column(String(50), nullable=True)
    cancelled_cheque = Column(Text, nullable=True)
    responsible = Column(String(255), nullable=True)
    connected_banking = Column(Boolean, default=False, nullable=True)
    status = Column(String(50), default="Active", nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyBankAccount(id={self.bank_account_id}, company='{self.company_name}', bank='{self.bank_name}')>"


class CompanyOfficeLocation(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `company_office_locations` table.
    """
    __tablename__ = "company_office_locations"

    office_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    office_code = Column(String(100), nullable=True)
    office_name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    address_documents = Column(Text, nullable=True)
    address_documents_edit = Column(Boolean, default=False, nullable=True)
    gst_registered = Column(Boolean, default=False, nullable=True)
    company_gst_documents = Column(Text, nullable=True)
    gst_edit = Column(Boolean, default=False, nullable=True)
    latitude = Column(Numeric(12, 8), nullable=True)
    longitude = Column(Numeric(12, 8), nullable=True)
    in_charge = Column(String(255), nullable=True)
    eb_sc_number = Column(String(100), nullable=True)
    ll_name = Column(String(255), nullable=True)
    ll_contact_number = Column(String(50), nullable=True)
    from_date = Column(Date, nullable=True)
    to_date = Column(Date, nullable=True)
    rental_amount = Column(Numeric(15, 2), nullable=True)
    status = Column(String(50), default="Active", nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyOfficeLocation(id={self.office_id}, name='{self.office_name}', company='{self.company_name}')>"


class CompanyHoliday(Base):
    """
    SQLAlchemy ORM Model mapping the PostgreSQL `company_holidays` table.
    """
    __tablename__ = "company_holidays"

    holiday_id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    year = Column(Integer, nullable=True)
    month = Column(String(50), nullable=True)
    date = Column(Date, nullable=True)
    day = Column(String(50), nullable=True)
    holiday_name = Column(String(255), nullable=True)
    status = Column(String(50), default="Active", nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<CompanyHoliday(id={self.holiday_id}, holiday='{self.holiday_name}', date={self.date})>"
