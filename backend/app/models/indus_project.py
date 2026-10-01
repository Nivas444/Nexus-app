from sqlalchemy import Column, BigInteger, String, Numeric, Text, Integer, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class IndusCustomerProjectType(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_project_type` table.
    Stores project type master records for Indus Tower Ltd in Nexus ERP.
    """
    __tablename__ = "indus_customer_project_type"

    project_type_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    project_type = Column(String(150), nullable=True)
    sub_project_type = Column(String(150), nullable=True)
    upgradation_type = Column(String(150), nullable=True)
    tat = Column(Numeric, nullable=True)
    indus_pm = Column(String(255), nullable=True)
    indus_scm = Column(String(255), nullable=True)
    pm = Column(String(255), nullable=True)
    survey = Column(String(255), nullable=True, default="Yes")
    additional_transport = Column(Numeric, nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<IndusCustomerProjectType(id={self.project_type_id}, project_type='{self.project_type}', status='{self.status}')>"


class IndusCustomerProjectTypeActivity(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_project_type_activity` table.
    Stores activity details associated with project types.
    """
    __tablename__ = "indus_customer_project_type_activity"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=False, default="Nexus")
    project_type = Column(String(255), nullable=True)
    sub_project_type = Column(String(255), nullable=True)
    stage = Column(String(255), nullable=True)
    activity = Column(String(255), nullable=True)
    days = Column(Integer, nullable=True)

    def __repr__(self) -> str:
        return f"<IndusCustomerProjectTypeActivity(id={self.id}, project_type='{self.project_type}', activity='{self.activity}')>"


class IndusCustomerProjectsTypeAdditionalTransport(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_projects_type_additional_transport` table.
    Stores additional transport items associated with project types.
    """
    __tablename__ = "indus_customer_projects_type_additional_transport"

    customer_project_item_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    project_type = Column(String(150), nullable=True)
    sub_project_type = Column(String(150), nullable=True)
    item_code = Column(String(100), nullable=True)
    item_description = Column(Text, nullable=True)
    transport_zone = Column(String(150), nullable=True)
    qty = Column(Numeric, nullable=True)
    status = Column(String(50), nullable=True, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<IndusCustomerProjectsTypeAdditionalTransport(id={self.customer_project_item_id}, item_code='{self.item_code}')>"


class IndusCustomerProjectTypeSupply(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_customer_project_type_supply` table.
    Stores approval history and document observation records for project types.
    """
    __tablename__ = "indus_customer_project_type_supply"

    sub_project_type_detail_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=True, default="Nexus")
    customer_name = Column(String(255), nullable=True, default="Indus Tower Ltd")
    sub_project_type = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    observation = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    def __repr__(self) -> str:
        return f"<IndusCustomerProjectTypeSupply(id={self.sub_project_type_detail_id}, sub_project_type='{self.sub_project_type}')>"
