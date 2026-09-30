from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, UploadFile, File, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.employee_subdetails_service import EmployeeSubdetailsService
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

router = APIRouter(tags=["Master - Employee Subdetails (Bank, Assets, Salary)"])


# ==============================================================================
# Bank Details Endpoints (Add, View, Edit, Document Upload & Download)
# ==============================================================================

@router.post(
    "/master/employees/{employee_id}/bank-details",
    response_model=EmployeeBankDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Bank Details"
)
@router.post(
    "/employees/{employee_id}/bank-details",
    response_model=EmployeeBankDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Bank Details (Alias)",
    include_in_schema=False
)
def add_employee_bank_details(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    payload: EmployeeBankDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Persist new bank account record into PostgreSQL `employee_bank_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_bank_detail(payload, employee_id_or_code=employee_id)


@router.post(
    "/master/employee-bank-details",
    response_model=EmployeeBankDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Bank Detail Directly"
)
@router.post(
    "/employee-bank-details",
    response_model=EmployeeBankDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Bank Detail Directly (Alias)",
    include_in_schema=False
)
def create_bank_detail_direct(
    payload: EmployeeBankDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Persist new bank account record directly into PostgreSQL `employee_bank_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_bank_detail(payload)


@router.get(
    "/master/employees/{employee_id}/bank-details",
    response_model=List[EmployeeBankDetailResponse],
    summary="List Bank Details for Employee"
)
@router.get(
    "/employees/{employee_id}/bank-details",
    response_model=List[EmployeeBankDetailResponse],
    summary="List Bank Details for Employee (Alias)",
    include_in_schema=False
)
def list_employee_bank_details(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real bank details from PostgreSQL `employee_bank_details` for given employee.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_bank_details(employee_id_or_code=employee_id)


@router.get(
    "/master/employee-bank-details",
    response_model=List[EmployeeBankDetailResponse],
    summary="List All Bank Details"
)
@router.get(
    "/employee-bank-details",
    response_model=List[EmployeeBankDetailResponse],
    summary="List All Bank Details (Alias)",
    include_in_schema=False
)
def list_all_bank_details(
    employee_id: Optional[str] = Query(None, description="Optional filter by Employee ID or Code"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real bank records from PostgreSQL `employee_bank_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_bank_details(employee_id_or_code=employee_id)


@router.get(
    "/master/employee-bank-details/{bank_detail_id}",
    response_model=EmployeeBankDetailResponse,
    summary="Get Bank Detail by ID"
)
@router.get(
    "/employee-bank-details/{bank_detail_id}",
    response_model=EmployeeBankDetailResponse,
    summary="Get Bank Detail by ID (Alias)",
    include_in_schema=False
)
def get_bank_detail_by_id(
    bank_detail_id: int = Path(..., ge=1, description="Primary key of bank detail"),
    db: Session = Depends(get_db)
):
    """
    Fetch a single bank record from PostgreSQL `employee_bank_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_bank_detail_by_id(bank_detail_id)


@router.put(
    "/master/employee-bank-details/{bank_detail_id}",
    response_model=EmployeeBankDetailResponse,
    summary="Update Bank Details"
)
@router.put(
    "/employee-bank-details/{bank_detail_id}",
    response_model=EmployeeBankDetailResponse,
    summary="Update Bank Details (Alias)",
    include_in_schema=False
)
def update_bank_detail(
    bank_detail_id: int = Path(..., ge=1, description="Primary key of bank detail"),
    payload: EmployeeBankDetailUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Save permitted changes to existing bank record in `employee_bank_details` without creating duplicates.
    """
    service = EmployeeSubdetailsService(db)
    return service.update_bank_detail(bank_detail_id, payload)


@router.post(
    "/master/employee-bank-details/{bank_detail_id}/document",
    response_model=EmployeeBankDocumentMetadata,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Bank Account PDF Document"
)
@router.post(
    "/employee-bank-details/{bank_detail_id}/document",
    response_model=EmployeeBankDocumentMetadata,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Bank Account PDF Document (Alias)",
    include_in_schema=False
)
async def upload_bank_document(
    bank_detail_id: int = Path(..., ge=1, description="Primary key of bank detail"),
    file: UploadFile = File(..., description="PDF document of bank account / cheque"),
    db: Session = Depends(get_db)
):
    """
    Upload and persist PDF document in PostgreSQL `employee_bank_documents` as BYTEA.
    """
    service = EmployeeSubdetailsService(db)
    file_bytes = await file.read()
    return service.upload_bank_document(
        bank_detail_id=bank_detail_id,
        file_name=file.filename or "bank_document.pdf",
        content_type=file.content_type or "application/pdf",
        file_bytes=file_bytes
    )


@router.get(
    "/master/employee-bank-details/{bank_detail_id}/document",
    summary="Download Bank Account PDF Document"
)
@router.get(
    "/employee-bank-details/{bank_detail_id}/document",
    summary="Download Bank Account PDF Document (Alias)",
    include_in_schema=False
)
def download_bank_document(
    bank_detail_id: int = Path(..., ge=1, description="Primary key of bank detail"),
    db: Session = Depends(get_db)
):
    """
    Retrieve stored PDF document binary with Content-Type: application/pdf for secure download.
    """
    service = EmployeeSubdetailsService(db)
    file_name, mime_type, file_data = service.download_bank_document(bank_detail_id)
    return Response(
        content=file_data,
        media_type=mime_type or "application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"',
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )


# ==============================================================================
# Asset Details Endpoints (Add-Only + Summation)
# ==============================================================================

@router.post(
    "/master/employees/{employee_id}/assets",
    response_model=EmployeeAssetDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Asset Record"
)
@router.post(
    "/employees/{employee_id}/assets",
    response_model=EmployeeAssetDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Asset Record (Alias)",
    include_in_schema=False
)
def add_employee_asset(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    payload: EmployeeAssetDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Add a new asset record into PostgreSQL `employee_assets_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_asset_detail(payload, employee_id_or_code=employee_id)


@router.post(
    "/master/employee-assets",
    response_model=EmployeeAssetDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Asset Record Directly"
)
@router.post(
    "/employee-assets",
    response_model=EmployeeAssetDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Asset Record Directly (Alias)",
    include_in_schema=False
)
def create_asset_direct(
    payload: EmployeeAssetDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Add a new asset record directly into PostgreSQL `employee_assets_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_asset_detail(payload)


@router.get(
    "/master/employees/{employee_id}/assets",
    response_model=List[EmployeeAssetDetailResponse],
    summary="List Assets for Employee"
)
@router.get(
    "/employees/{employee_id}/assets",
    response_model=List[EmployeeAssetDetailResponse],
    summary="List Assets for Employee (Alias)",
    include_in_schema=False
)
def list_employee_assets(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real asset records from PostgreSQL `employee_assets_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_asset_details(employee_id_or_code=employee_id)


@router.get(
    "/master/employee-assets",
    response_model=List[EmployeeAssetDetailResponse],
    summary="List All Asset Records"
)
@router.get(
    "/employee-assets",
    response_model=List[EmployeeAssetDetailResponse],
    summary="List All Asset Records (Alias)",
    include_in_schema=False
)
def list_all_assets(
    employee_id: Optional[str] = Query(None, description="Optional filter by Employee ID or Code"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real asset records from PostgreSQL `employee_assets_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_asset_details(employee_id_or_code=employee_id)


@router.get(
    "/master/employees/{employee_id}/assets/total",
    response_model=EmployeeAssetTotalResponse,
    summary="Get Total Asset Sum for Employee"
)
@router.get(
    "/employees/{employee_id}/assets/total",
    response_model=EmployeeAssetTotalResponse,
    summary="Get Total Asset Sum for Employee (Alias)",
    include_in_schema=False
)
def get_employee_asset_total(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    db: Session = Depends(get_db)
):
    """
    Calculate the total sum of amounts from `employee_assets_details` for employee.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_asset_total(employee_id_or_code=employee_id)


@router.get(
    "/master/employee-assets/total",
    response_model=EmployeeAssetTotalResponse,
    summary="Get Total Asset Sum"
)
@router.get(
    "/employee-assets/total",
    response_model=EmployeeAssetTotalResponse,
    summary="Get Total Asset Sum (Alias)",
    include_in_schema=False
)
def get_all_assets_total(
    employee_id: Optional[str] = Query(None, description="Optional filter by Employee ID or Code"),
    db: Session = Depends(get_db)
):
    """
    Calculate the total sum of amounts from `employee_assets_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_asset_total(employee_id_or_code=employee_id)


# ==============================================================================
# Salary Details Endpoints (Add-Only)
# ==============================================================================

@router.post(
    "/master/employees/{employee_id}/salary-details",
    response_model=EmployeeSalaryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Salary Details"
)
@router.post(
    "/employees/{employee_id}/salary-details",
    response_model=EmployeeSalaryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Employee Salary Details (Alias)",
    include_in_schema=False
)
def add_employee_salary_details(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    payload: EmployeeSalaryDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Save salary structure record into PostgreSQL `employee_salary_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_salary_detail(payload, employee_id_or_code=employee_id)


@router.post(
    "/master/employee-salary-details",
    response_model=EmployeeSalaryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Salary Detail Directly"
)
@router.post(
    "/employee-salary-details",
    response_model=EmployeeSalaryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Salary Detail Directly (Alias)",
    include_in_schema=False
)
def create_salary_detail_direct(
    payload: EmployeeSalaryDetailCreate = ...,
    db: Session = Depends(get_db)
):
    """
    Save salary structure record directly into PostgreSQL `employee_salary_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.create_salary_detail(payload)


@router.get(
    "/master/employees/{employee_id}/salary-details",
    response_model=List[EmployeeSalaryDetailResponse],
    summary="List Salary Details for Employee"
)
@router.get(
    "/employees/{employee_id}/salary-details",
    response_model=List[EmployeeSalaryDetailResponse],
    summary="List Salary Details for Employee (Alias)",
    include_in_schema=False
)
def list_employee_salary_details(
    employee_id: str = Path(..., description="Employee Code or Numeric ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real salary records from PostgreSQL `employee_salary_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_salary_details(employee_id_or_code=employee_id)


@router.get(
    "/master/employee-salary-details",
    response_model=List[EmployeeSalaryDetailResponse],
    summary="List All Salary Details"
)
@router.get(
    "/employee-salary-details",
    response_model=List[EmployeeSalaryDetailResponse],
    summary="List All Salary Details (Alias)",
    include_in_schema=False
)
def list_all_salary_details(
    employee_id: Optional[str] = Query(None, description="Optional filter by Employee ID or Code"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real salary records from PostgreSQL `employee_salary_details`.
    """
    service = EmployeeSubdetailsService(db)
    return service.get_salary_details(employee_id_or_code=employee_id)
