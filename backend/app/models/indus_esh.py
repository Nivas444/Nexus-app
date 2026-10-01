from sqlalchemy import Column, BigInteger, String, Date
from app.db.base import Base

class IndusEshDetails(Base):
    """
    SQLAlchemy ORM Model mapping the existing PostgreSQL `indus_esh_details` table.
    Stores ESH (Environment, Safety & Health) trainee/employee certification details for Indus Tower Ltd.
    """
    __tablename__ = "indus_esh_details"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    company_name = Column(String(255), nullable=False, default="Indus Tower Ltd")
    name = Column(String(255), nullable=False)
    employee_type = Column(String(100), nullable=True)
    aadhar_number = Column(String(20), nullable=True)
    training_type = Column(String(150), nullable=True)
    training_id_number = Column(String(100), nullable=True)
    training_agency = Column(String(255), nullable=True)
    expiry_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=True, default="Active")

    def __repr__(self) -> str:
        return f"<IndusEshDetails(id={self.id}, name='{self.name}', employee_type='{self.employee_type}', status='{self.status}')>"
