import re
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.models.employee import CompanyEmployee, CompanyEmployeeDocument

class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, employee_id: int) -> Optional[CompanyEmployee]:
        return self.db.query(CompanyEmployee).filter(CompanyEmployee.employee_id == employee_id).first()

    def get_by_code(self, code: str, exclude_id: Optional[int] = None) -> Optional[CompanyEmployee]:
        if not code or not str(code).strip():
            return None
        query = self.db.query(CompanyEmployee).filter(
            func.lower(func.trim(CompanyEmployee.employee_code)) == str(code).strip().lower()
        )
        if exclude_id:
            query = query.filter(CompanyEmployee.employee_id != exclude_id)
        return query.first()

    def get_by_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[CompanyEmployee]:
        if not name or not str(name).strip():
            return None
        query = self.db.query(CompanyEmployee).filter(
            func.lower(func.trim(CompanyEmployee.employee_name)) == str(name).strip().lower()
        )
        if exclude_id:
            query = query.filter(CompanyEmployee.employee_id != exclude_id)
        return query.first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        employee_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[CompanyEmployee]:
        query = self.db.query(CompanyEmployee)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CompanyEmployee.employee_name.ilike(term),
                    CompanyEmployee.employee_code.ilike(term),
                    CompanyEmployee.email.ilike(term),
                    CompanyEmployee.mobile_number.ilike(term),
                    CompanyEmployee.designation.ilike(term)
                )
            )

        if employee_type and employee_type.strip():
            query = query.filter(CompanyEmployee.employee_type.ilike(f"%{employee_type.strip()}%"))

        if status and status.strip():
            cleaned_status = status.strip().lower()
            if "in" in cleaned_status:
                query = query.filter(CompanyEmployee.status.ilike("%In%"))
            else:
                query = query.filter(
                    CompanyEmployee.status.ilike("%Active%"),
                    ~CompanyEmployee.status.ilike("%In%")
                )

        return query.order_by(desc(CompanyEmployee.employee_id)).offset(skip).limit(limit).all()

    def count_all(
        self,
        search: Optional[str] = None,
        employee_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> int:
        query = self.db.query(func.count(CompanyEmployee.employee_id))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CompanyEmployee.employee_name.ilike(term),
                    CompanyEmployee.employee_code.ilike(term),
                    CompanyEmployee.email.ilike(term),
                    CompanyEmployee.mobile_number.ilike(term),
                    CompanyEmployee.designation.ilike(term)
                )
            )

        if employee_type and employee_type.strip():
            query = query.filter(CompanyEmployee.employee_type.ilike(f"%{employee_type.strip()}%"))

        if status and status.strip():
            cleaned_status = status.strip().lower()
            if "in" in cleaned_status:
                query = query.filter(CompanyEmployee.status.ilike("%In%"))
            else:
                query = query.filter(
                    CompanyEmployee.status.ilike("%Active%"),
                    ~CompanyEmployee.status.ilike("%In%")
                )

        return query.scalar() or 0

    def create(self, employee_data: dict) -> CompanyEmployee:
        db_emp = CompanyEmployee(**employee_data)
        self.db.add(db_emp)
        self.db.commit()
        self.db.refresh(db_emp)
        return db_emp

    def bulk_create(self, records: List[CompanyEmployee]) -> List[CompanyEmployee]:
        self.db.add_all(records)
        self.db.commit()
        return records

    def update(self, db_emp: CompanyEmployee, update_data: dict) -> CompanyEmployee:
        for key, value in update_data.items():
            if hasattr(db_emp, key):
                setattr(db_emp, key, value)
        self.db.commit()
        self.db.refresh(db_emp)
        return db_emp

    def delete(self, db_emp: CompanyEmployee) -> None:
        self.db.delete(db_emp)
        self.db.commit()

    # --- Document operations ---

    def get_documents_by_employee_id(self, employee_id: int) -> List[CompanyEmployeeDocument]:
        return self.db.query(CompanyEmployeeDocument).filter(
            CompanyEmployeeDocument.employee_id == employee_id
        ).order_by(asc(CompanyEmployeeDocument.id)).all()

    def get_document_by_type(self, employee_id: int, document_type: str) -> Optional[CompanyEmployeeDocument]:
        return self.db.query(CompanyEmployeeDocument).filter(
            CompanyEmployeeDocument.employee_id == employee_id,
            func.lower(CompanyEmployeeDocument.document_type) == document_type.strip().lower()
        ).first()

    def upsert_document(
        self,
        employee_id: int,
        document_type: str,
        file_name: str,
        mime_type: str,
        file_size: int,
        file_data: bytes
    ) -> CompanyEmployeeDocument:
        doc_type_clean = document_type.strip().lower()
        existing = self.get_document_by_type(employee_id, doc_type_clean)
        if existing:
            existing.file_name = file_name
            existing.mime_type = mime_type
            existing.file_size = file_size
            existing.file_data = file_data
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            new_doc = CompanyEmployeeDocument(
                employee_id=employee_id,
                document_type=doc_type_clean,
                file_name=file_name,
                mime_type=mime_type,
                file_size=file_size,
                file_data=file_data
            )
            self.db.add(new_doc)
            self.db.commit()
            self.db.refresh(new_doc)
            return new_doc

    def delete_document(self, employee_id: int, document_type: str) -> bool:
        doc = self.get_document_by_type(employee_id, document_type)
        if doc:
            self.db.delete(doc)
            self.db.commit()
            return True
        return False
