from sqlalchemy import Column, BigInteger, String, Numeric, Text, Date, DateTime, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base


class TelecomProject(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `telecom_project` table
    in the `Nexus_Project DB` database.
    """
    __tablename__ = "telecom_project"

    project_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True)
    po_no = Column(String(100), nullable=True, index=True)
    po_revision_number = Column(String(50), nullable=True)
    po_date = Column(Date, nullable=True)
    po_amount = Column(Numeric, nullable=True)
    po_type = Column(String(50), nullable=True)
    po_amendment_ref_id = Column(String(100), nullable=True)
    po_amendment_submission_date = Column(Date, nullable=True)
    po_amendment_completion_date = Column(Date, nullable=True)
    po_amendment_ageing = Column(BigInteger, nullable=True)
    po_status = Column(String(50), nullable=True)
    po_ageing = Column(BigInteger, nullable=True)
    po_ageing_group = Column(String(100), nullable=True)
    project_code = Column(String(100), nullable=True, index=True)
    site_id = Column(String(100), nullable=True, index=True)
    site_name = Column(String(255), nullable=True)
    project_type = Column(String(150), nullable=True)
    sub_project_type = Column(String(150), nullable=True)
    upgradation_type = Column(String(150), nullable=True)
    planning_boq = Column(Text, nullable=True)
    tower_type = Column(String(150), nullable=True)
    tower_height = Column(Numeric, nullable=True)
    sbc = Column(Numeric, nullable=True)
    wind_speed = Column(Numeric, nullable=True)
    site_survey = Column(Text, nullable=True)
    stn = Column(Text, nullable=True)
    srn = Column(Text, nullable=True)
    cam = Column(String(100), nullable=True)
    tsp_materials = Column(Text, nullable=True)
    civil_works = Column(Text, nullable=True)
    drawing_name = Column(String(255), nullable=True)
    drawing_documents = Column(Text, nullable=True)
    electrical_works = Column(Text, nullable=True)
    pole_mounts = Column(Text, nullable=True)
    mount_type = Column(String(100), nullable=True)
    sector = Column(Numeric, nullable=True)
    height = Column(Numeric, nullable=True)
    azimuth = Column(Numeric, nullable=True)
    quality_audit = Column(Text, nullable=True)
    audit_type = Column(String(100), nullable=True)
    ptw = Column(Text, nullable=True)
    ptw_type = Column(String(100), nullable=True)
    additional_approval = Column(Text, nullable=True)
    service_contract = Column(Text, nullable=True)
    project_status = Column(String(100), nullable=True)
    completion_date = Column(Date, nullable=True)
    completed_ageing = Column(BigInteger, nullable=True)
    current_task = Column(Text, nullable=True)
    responsible = Column(String(255), nullable=True)
    support_required = Column(Text, nullable=True)
    pending_with = Column(String(255), nullable=True)
    srn_status = Column(String(50), nullable=True)
    stn_status = Column(String(50), nullable=True)
    cam_status = Column(String(100), nullable=True)
    tsp_status = Column(String(100), nullable=True)
    wcc_no = Column(String(100), nullable=True)
    wcc_submission_date = Column(Date, nullable=True)
    wcc_approved_date = Column(Date, nullable=True)
    wcc_ageing = Column(BigInteger, nullable=True)
    receipt_no = Column(String(100), nullable=True)
    ers_no = Column(String(100), nullable=True)
    jms_merged_documents = Column(Text, nullable=True)
    po_amendment_merged_documents = Column(Text, nullable=True)
    invoice_supporting_documents = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<TelecomProject(id={self.project_id}, po_no='{self.po_no}', site_id='{self.site_id}')>"


class TelecomIndusPo(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `telecom_indus_po` table
    in the `Nexus_Project DB` database.
    """
    __tablename__ = "telecom_indus_po"

    project_po_line_item_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Towers Ltd")
    po_no = Column(String(100), nullable=True, index=True)
    site_id = Column(String(100), nullable=True, index=True)
    line_number = Column(String(50), nullable=True)
    hsn_sac = Column(String(50), nullable=True)
    hsn_sac_code = Column(String(50), nullable=True)
    item_code = Column(String(100), nullable=True, index=True)
    item_description = Column(Text, nullable=True)
    uom = Column(String(50), nullable=True)
    po_qty = Column(Numeric, nullable=True)
    po_rate = Column(Numeric, nullable=True)
    po_amount = Column(Numeric, nullable=True)
    gst_amount = Column(Numeric, nullable=True)
    po_total_amount = Column(Numeric, nullable=True)
    jms_qty = Column(Numeric, nullable=True)
    jms_amount = Column(Numeric, nullable=True)
    cgst_rate = Column(Numeric, nullable=True)
    cgst_amount = Column(Numeric, nullable=True)
    sgst_rate = Column(Numeric, nullable=True)
    sgst_amount = Column(Numeric, nullable=True)
    igst_rate = Column(Numeric, nullable=True)
    igst_amount = Column(Numeric, nullable=True)
    jms_igst_amount = Column(Numeric, nullable=True)
    jms_total_amount = Column(Numeric, nullable=True)
    net_material_qty = Column(Numeric, nullable=True)
    material_difference_qty = Column(Numeric, nullable=True)
    po_amendment_type = Column(String(100), nullable=True)
    po_amendment_qty = Column(Numeric, nullable=True)
    jms_status = Column(String(50), nullable=True, default="Not Approved")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    __table_args__ = (
        UniqueConstraint("po_no", "site_id", "item_code", name="uq_telecom_indus_po_composite"),
    )

    def __repr__(self) -> str:
        return f"<TelecomIndusPo(id={self.project_po_line_item_id}, po_no='{self.po_no}', site_id='{self.site_id}', item_code='{self.item_code}', jms_status='{self.jms_status}')>"


class ProjectExpense(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `project_expenses` table
    in `Nexus_Project DB`.
    """
    __tablename__ = "project_expenses"

    expense_management_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True)
    po_no = Column(String(100), nullable=True, index=True)
    site_id = Column(String(100), nullable=True, index=True)
    request_number = Column(String(100), nullable=True)
    request_by = Column(String(255), nullable=True)
    request_date = Column(Date, nullable=True)
    expense_head = Column(String(150), nullable=True)
    expense_name = Column(String(255), nullable=True)
    expense_description = Column(Text, nullable=True)
    expense_type = Column(String(100), nullable=True)
    gst_expense = Column(Boolean, nullable=True, default=False)
    uom = Column(String(50), nullable=True)
    qty = Column(Numeric(15, 2), nullable=True)
    rate = Column(Numeric(15, 2), nullable=True)
    amount = Column(Numeric(15, 2), nullable=True)
    gst_amount = Column(Numeric(15, 2), nullable=True)
    total_amount = Column(Numeric(15, 2), nullable=True)
    gst_number = Column(String(50), nullable=True)
    gst_name = Column(String(255), nullable=True)
    gst_type = Column(String(100), nullable=True)
    transfer_to = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    bank_name = Column(String(255), nullable=True)
    cancelled_cheque = Column(Text, nullable=True)
    whatsapp_number = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<ProjectExpense(id={self.expense_management_id}, po_no='{self.po_no}', amount={self.amount})>"


class ProjectDocument(Base):
    """
    SQLAlchemy ORM Model mapping PostgreSQL `documents` table
    in `Nexus_Project DB`.
    """
    __tablename__ = "documents"

    project_document_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True)
    po_no = Column(String(100), nullable=True, index=True)
    site_id = Column(String(100), nullable=True, index=True)
    date = Column(Date, nullable=True)
    document_name = Column(String(255), nullable=True)
    document_number = Column(String(100), nullable=True)
    document_details = Column(Text, nullable=True)
    documents = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<ProjectDocument(id={self.project_document_id}, po_no='{self.po_no}', name='{self.document_name}')>"

