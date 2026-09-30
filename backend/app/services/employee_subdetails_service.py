from typing import Optional, List, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.employee import CompanyEmployee
from app.models.employee_subdetails import (
    EmployeeBankDetail,
    EmployeeBankDocument,
    EmployeeAssetDetail,
    EmployeeSalaryDetail
)
from app.schemas.employee_subdetails import (
    EmployeeBankDetailCreate,
    EmployeeBankDetailUpdate,
    EmployeeBankDetailResponse,
    EmployeeBankDocumentMetadata,
    EmployeeAssetDetailCreate,
    EmployeeAssetDetailResponse,
    EmployeeAssetTotalResponse,
    EmployeeSalaryDetailCreate,
    EmployeeSalaryDetailResponse
)

# Maximum file size for PDF uploads: 15MB
MAX_PDF_FILE_SIZE = 15 * 1024 * 1024


class EmployeeSubdetailsService:
    def __init__(self, db: Session):
        self.db = db

    # --------------------------------------------------------------------------
    # Employee Verification Helper
    # --------------------------------------------------------------------------
    def _find_employee(self, emp_identifier: str) -> Optional[CompanyEmployee]:
        """Find employee by primary key (int) or employee_code."""
        if not emp_identifier:
            return None
        emp = None
        if str(emp_identifier).isdigit():
            emp = self.db.query(CompanyEmployee).filter(CompanyEmployee.employee_id == int(emp_identifier)).first()
        if not emp:
            emp = self.db.query(CompanyEmployee).filter(CompanyEmployee.employee_code == str(emp_identifier)).first()
        return emp

    # --------------------------------------------------------------------------
    # Bank Details Operations
    # --------------------------------------------------------------------------
    def create_bank_detail(self, payload: EmployeeBankDetailCreate, employee_id_or_code: Optional[str] = None) -> EmployeeBankDetailResponse:
        """Create a new bank account record in employee_bank_details."""
        emp_code = payload.employee_id or employee_id_or_code
        emp_name = payload.employee_name

        if emp_code:
            emp = self._find_employee(emp_code)
            if emp:
                emp_code = emp.employee_code or str(emp.employee_id)
                if not emp_name:
                    emp_name = emp.employee_name

        bank_record = EmployeeBankDetail(
            company_name=payload.company_name or "Nexus",
            employee_id=emp_code,
            employee_name=emp_name or payload.responsible or payload.account_name,
            account_name=payload.account_name or payload.bank_name,
            account_number=payload.account_number,
            account_type=payload.account_type or "Savings",
            bank_name=payload.bank_name,
            ifsc_code=payload.ifsc_code,
            cancelled_cheque=payload.cancelled_cheque,
            status=payload.status or "Active"
        )
        try:
            self.db.add(bank_record)
            self.db.commit()
            self.db.refresh(bank_record)
        except IntegrityError as err:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A bank account record with these unique details (e.g. account name or number) already exists."
            ) from err
        except Exception as ex:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create bank detail: {str(ex)}"
            ) from ex

        return EmployeeBankDetailResponse.model_validate(bank_record)

    def get_bank_details(self, employee_id_or_code: Optional[str] = None) -> List[EmployeeBankDetailResponse]:
        """Retrieve bank details, optionally filtered by employee."""
        query = self.db.query(EmployeeBankDetail)
        if employee_id_or_code:
            emp = self._find_employee(employee_id_or_code)
            if emp:
                query = query.filter(
                    or_(
                        EmployeeBankDetail.employee_id == str(emp.employee_id),
                        EmployeeBankDetail.employee_id == emp.employee_code,
                        EmployeeBankDetail.employee_name == emp.employee_name
                    )
                )
            else:
                query = query.filter(
                    or_(
                        EmployeeBankDetail.employee_id == str(employee_id_or_code),
                        EmployeeBankDetail.employee_name == str(employee_id_or_code)
                    )
                )

        records = query.order_by(desc(EmployeeBankDetail.employee_bank_account_id)).all()
        results = []
        for r in records:
            # Check if document is attached
            doc = self.db.query(EmployeeBankDocument).filter(
                EmployeeBankDocument.bank_detail_id == r.employee_bank_account_id
            ).first()
            item = EmployeeBankDetailResponse.model_validate(r)
            if doc:
                item.has_document = True
                item.document_name = doc.file_name
            results.append(item)
        return results

    def get_bank_detail_by_id(self, bank_detail_id: int) -> EmployeeBankDetailResponse:
        """Fetch individual bank record by ID."""
        record = self.db.query(EmployeeBankDetail).filter(
            EmployeeBankDetail.employee_bank_account_id == bank_detail_id
        ).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bank details with ID {bank_detail_id} not found."
            )
        doc = self.db.query(EmployeeBankDocument).filter(
            EmployeeBankDocument.bank_detail_id == record.employee_bank_account_id
        ).first()
        item = EmployeeBankDetailResponse.model_validate(record)
        if doc:
            item.has_document = True
            item.document_name = doc.file_name
        return item

    def update_bank_detail(self, bank_detail_id: int, payload: EmployeeBankDetailUpdate) -> EmployeeBankDetailResponse:
        """Update existing bank details without creating a new record."""
        record = self.db.query(EmployeeBankDetail).filter(
            EmployeeBankDetail.employee_bank_account_id == bank_detail_id
        ).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bank details with ID {bank_detail_id} not found."
            )

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(record, key) and value is not None:
                setattr(record, key, value)

        try:
            self.db.commit()
            self.db.refresh(record)
        except IntegrityError as err:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A bank account record with these updated details already exists."
            ) from err
        except Exception as ex:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update bank detail: {str(ex)}"
            ) from ex

        doc = self.db.query(EmployeeBankDocument).filter(
            EmployeeBankDocument.bank_detail_id == record.employee_bank_account_id
        ).first()
        item = EmployeeBankDetailResponse.model_validate(record)
        if doc:
            item.has_document = True
            item.document_name = doc.file_name
        return item

    def upload_bank_document(
        self,
        bank_detail_id: int,
        file_name: str,
        content_type: str,
        file_bytes: bytes
    ) -> EmployeeBankDocumentMetadata:
        """Upload and persist PDF document in BYTEA format for bank account."""
        record = self.db.query(EmployeeBankDetail).filter(
            EmployeeBankDetail.employee_bank_account_id == bank_detail_id
        ).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bank detail with ID {bank_detail_id} not found."
            )

        # 1. Validate File Size
        if len(file_bytes) > MAX_PDF_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Uploaded PDF exceeds maximum allowed size of {MAX_PDF_FILE_SIZE // (1024 * 1024)}MB."
            )
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # 2. Validate PDF signature (%PDF-)
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Invalid file format. Only legitimate PDF documents are supported."
            )

        # 3. Check for existing document and update or create
        existing_doc = self.db.query(EmployeeBankDocument).filter(
            EmployeeBankDocument.bank_detail_id == bank_detail_id
        ).first()

        try:
            if existing_doc:
                existing_doc.file_name = file_name
                existing_doc.mime_type = content_type or "application/pdf"
                existing_doc.file_size = len(file_bytes)
                existing_doc.file_data = file_bytes
                doc = existing_doc
            else:
                doc = EmployeeBankDocument(
                    bank_detail_id=bank_detail_id,
                    document_type="bank_account_document",
                    file_name=file_name,
                    mime_type=content_type or "application/pdf",
                    file_size=len(file_bytes),
                    file_data=file_bytes
                )
                self.db.add(doc)

            # Keep filename in cancelled_cheque text column as metadata reference
            record.cancelled_cheque = file_name
            self.db.commit()
            self.db.refresh(doc)
        except Exception as ex:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist bank document: {str(ex)}"
            ) from ex

        return EmployeeBankDocumentMetadata.model_validate(doc)

    def download_bank_document(self, bank_detail_id: int) -> Tuple[str, str, bytes]:
        """Retrieve stored PDF binary and metadata for streaming download."""
        doc = self.db.query(EmployeeBankDocument).filter(
            EmployeeBankDocument.bank_detail_id == bank_detail_id
        ).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No account document found for bank detail ID {bank_detail_id}."
            )
        return doc.file_name, doc.mime_type, doc.file_data

    # --------------------------------------------------------------------------
    # Asset Details Operations (Add Only + Summation)
    # --------------------------------------------------------------------------
    def create_asset_detail(self, payload: EmployeeAssetDetailCreate, employee_id_or_code: Optional[str] = None) -> EmployeeAssetDetailResponse:
        """Save a new asset record to employee_assets_details."""
        emp_code = payload.employee_id or employee_id_or_code
        emp_name = payload.employee_name

        if emp_code:
            emp = self._find_employee(emp_code)
            if emp:
                emp_code = emp.employee_code or str(emp.employee_id)
                if not emp_name:
                    emp_name = emp.employee_name

        asset_record = EmployeeAssetDetail(
            company_name=payload.company_name or "Nexus",
            employee_id=emp_code,
            employee_name=emp_name,
            date=payload.date,
            asset_details=payload.asset_details,
            serial_number=payload.serial_number,
            uom=payload.uom or "Nos",
            qty=payload.qty or Decimal("1.00"),
            rate=payload.rate or Decimal("0.00"),
            amount=payload.amount or Decimal("0.00"),
            expiry_date=payload.expiry_date,
            returned_status=payload.returned_status,
            returned_date=payload.returned_date
        )
        try:
            self.db.add(asset_record)
            self.db.commit()
            self.db.refresh(asset_record)
        except Exception as ex:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create asset detail: {str(ex)}"
            ) from ex

        return EmployeeAssetDetailResponse.model_validate(asset_record)

    def get_asset_details(self, employee_id_or_code: Optional[str] = None) -> List[EmployeeAssetDetailResponse]:
        """Retrieve asset records from employee_assets_details."""
        query = self.db.query(EmployeeAssetDetail)
        if employee_id_or_code:
            emp = self._find_employee(employee_id_or_code)
            if emp:
                query = query.filter(
                    or_(
                        EmployeeAssetDetail.employee_id == str(emp.employee_id),
                        EmployeeAssetDetail.employee_id == emp.employee_code,
                        EmployeeAssetDetail.employee_name == emp.employee_name
                    )
                )
            else:
                query = query.filter(
                    or_(
                        EmployeeAssetDetail.employee_id == str(employee_id_or_code),
                        EmployeeAssetDetail.employee_name == str(employee_id_or_code)
                    )
                )

        records = query.order_by(desc(EmployeeAssetDetail.asset_id)).all()
        return [EmployeeAssetDetailResponse.model_validate(r) for r in records]

    def get_asset_total(self, employee_id_or_code: Optional[str] = None) -> EmployeeAssetTotalResponse:
        """Calculate the total amount sum from employee_assets_details using PostgreSQL aggregate function."""
        query = self.db.query(
            func.coalesce(func.sum(EmployeeAssetDetail.amount), 0).label("total_sum"),
            func.count(EmployeeAssetDetail.asset_id).label("item_count")
        )
        if employee_id_or_code:
            emp = self._find_employee(employee_id_or_code)
            if emp:
                query = query.filter(
                    or_(
                        EmployeeAssetDetail.employee_id == str(emp.employee_id),
                        EmployeeAssetDetail.employee_id == emp.employee_code,
                        EmployeeAssetDetail.employee_name == emp.employee_name
                    )
                )
            else:
                query = query.filter(
                    or_(
                        EmployeeAssetDetail.employee_id == str(employee_id_or_code),
                        EmployeeAssetDetail.employee_name == str(employee_id_or_code)
                    )
                )

        result = query.first()
        total_val = Decimal(str(result[0])) if result and result[0] is not None else Decimal("0.00")
        count_val = int(result[1]) if result and result[1] is not None else 0

        formatted = f"{total_val:,.2f}"
        return EmployeeAssetTotalResponse(
            total_amount=total_val,
            formatted_total=formatted,
            item_count=count_val
        )

    # --------------------------------------------------------------------------
    # Salary Details Operations (Add Only)
    # --------------------------------------------------------------------------
    def create_salary_detail(self, payload: EmployeeSalaryDetailCreate, employee_id_or_code: Optional[str] = None) -> EmployeeSalaryDetailResponse:
        """Save a new salary record to employee_salary_details."""
        emp_code = payload.employee_id or employee_id_or_code
        emp_name = payload.employee_name

        if emp_code:
            emp = self._find_employee(emp_code)
            if emp:
                emp_code = emp.employee_code or str(emp.employee_id)
                if not emp_name:
                    emp_name = emp.employee_name

        salary_record = EmployeeSalaryDetail(
            company_name=payload.company_name or "Nexus",
            url=payload.url,
            employee_id=emp_code,
            employee_name=emp_name,
            from_date=payload.from_date,
            to_date=payload.to_date,
            gross_salary=payload.gross_salary or Decimal("0.00"),
            basic_salary=payload.basic_salary or Decimal("0.00"),
            hra=payload.hra or Decimal("0.00"),
            da=payload.da or Decimal("0.00"),
            sa=payload.sa or Decimal("0.00"),
            status=payload.status or "Active"
        )
        try:
            self.db.add(salary_record)
            self.db.commit()
            self.db.refresh(salary_record)
        except Exception as ex:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create salary detail: {str(ex)}"
            ) from ex

        return EmployeeSalaryDetailResponse.model_validate(salary_record)

    def get_salary_details(self, employee_id_or_code: Optional[str] = None) -> List[EmployeeSalaryDetailResponse]:
        """Retrieve salary records from employee_salary_details."""
        query = self.db.query(EmployeeSalaryDetail)
        if employee_id_or_code:
            emp = self._find_employee(employee_id_or_code)
            if emp:
                query = query.filter(
                    or_(
                        EmployeeSalaryDetail.employee_id == str(emp.employee_id),
                        EmployeeSalaryDetail.employee_id == emp.employee_code,
                        EmployeeSalaryDetail.employee_name == emp.employee_name
                    )
                )
            else:
                query = query.filter(
                    or_(
                        EmployeeSalaryDetail.employee_id == str(employee_id_or_code),
                        EmployeeSalaryDetail.employee_name == str(employee_id_or_code)
                    )
                )

        records = query.order_by(desc(EmployeeSalaryDetail.salary_id)).all()
        return [EmployeeSalaryDetailResponse.model_validate(r) for r in records]
