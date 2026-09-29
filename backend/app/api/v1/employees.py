from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, UploadFile, File, Form, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.employee_service import EmployeeService
from app.schemas.employee import (
    CompanyEmployeeCreate,
    CompanyEmployeeUpdate,
    CompanyEmployeeStatusUpdate,
    CompanyEmployeeResponse,
    CompanyEmployeeListResponse,
    CompanyEmployeeDocumentMetadata
)

router = APIRouter(tags=["Master - Employees"])

# ----------------- Employee CRUD Endpoints -----------------

@router.get("/master/employees", response_model=CompanyEmployeeListResponse, summary="List Master Employees")
@router.get("/employees", response_model=CompanyEmployeeListResponse, summary="List Employees (Alias)", include_in_schema=False)
def list_employees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, code, email, mobile, or designation"),
    employee_type: Optional[str] = Query(None, description="Filter by On-Roll / Contract"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real employee records from PostgreSQL `company_employee_details` with filtering and pagination.
    """
    service = EmployeeService(db)
    skip = (page - 1) * page_size
    return service.get_employees(
        skip=skip,
        limit=page_size,
        search=search,
        employee_type=employee_type,
        status=status
    )


@router.get("/master/employees/{employee_id}", response_model=CompanyEmployeeResponse, summary="Get Employee Details")
@router.get("/employees/{employee_id}", response_model=CompanyEmployeeResponse, summary="Get Employee Details (Alias)", include_in_schema=False)
def get_employee(
    employee_id: int = Path(..., ge=1, description="Unique primary key of employee"),
    db: Session = Depends(get_db)
):
    """
    Fetch an individual employee record with attached document metadata.
    """
    service = EmployeeService(db)
    return service.get_employee_by_id(employee_id)


@router.post("/master/employees", response_model=CompanyEmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create Employee")
@router.post("/employees", response_model=CompanyEmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create Employee (Alias)", include_in_schema=False)
def create_employee(
    payload: CompanyEmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new employee record in PostgreSQL `company_employee_details`.
    Enforces uniqueness of Employee ID / Code.
    """
    service = EmployeeService(db)
    return service.create_employee(payload)


@router.put("/master/employees/{employee_id}", response_model=CompanyEmployeeResponse, summary="Update Employee Details")
@router.put("/employees/{employee_id}", response_model=CompanyEmployeeResponse, summary="Update Employee Details (Alias)", include_in_schema=False)
def update_employee(
    employee_id: int = Path(..., ge=1, description="Unique primary key of employee"),
    payload: CompanyEmployeeUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing employee record.
    """
    service = EmployeeService(db)
    return service.update_employee(employee_id, payload)


@router.patch("/master/employees/{employee_id}/status", response_model=CompanyEmployeeResponse, summary="Toggle Employee Status")
@router.patch("/employees/{employee_id}/status", response_model=CompanyEmployeeResponse, summary="Toggle Employee Status (Alias)", include_in_schema=False)
def update_employee_status(
    employee_id: int = Path(..., ge=1, description="Unique primary key of employee"),
    payload: CompanyEmployeeStatusUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Patch employee status to 'Active' or 'In - Active'.
    """
    service = EmployeeService(db)
    return service.update_status(employee_id, payload)


@router.delete("/master/employees/{employee_id}", summary="Delete Employee")
@router.delete("/employees/{employee_id}", summary="Delete Employee (Alias)", include_in_schema=False)
def delete_employee(
    employee_id: int = Path(..., ge=1, description="Unique primary key of employee"),
    db: Session = Depends(get_db)
):
    """
    Delete an employee record.
    """
    service = EmployeeService(db)
    return service.delete_employee(employee_id)


# ----------------- PDF Document Upload & Retrieval Endpoints -----------------

@router.post(
    "/master/employees/{employee_id}/documents",
    response_model=CompanyEmployeeDocumentMetadata,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Employee PDF Document"
)
@router.post(
    "/employees/{employee_id}/documents",
    response_model=CompanyEmployeeDocumentMetadata,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Employee PDF Document (Alias)",
    include_in_schema=False
)
async def upload_employee_document(
    employee_id: int = Path(..., ge=1, description="Unique employee primary key"),
    document_type: str = Form(..., description="Document type: qualification, pan, aadhaar, driving_license, passport, epf_uan, esi_id"),
    file: UploadFile = File(..., description="PDF file to upload"),
    db: Session = Depends(get_db)
):
    """
    Upload and persist a PDF document for an employee in PostgreSQL `company_employee_documents` as BYTEA.
    """
    service = EmployeeService(db)
    file_bytes = await file.read()
    return service.upload_document(
        employee_id=employee_id,
        document_type=document_type,
        file_name=file.filename or f"{document_type}.pdf",
        content_type=file.content_type or "application/pdf",
        file_bytes=file_bytes
    )


@router.get(
    "/master/employees/{employee_id}/documents",
    response_model=List[CompanyEmployeeDocumentMetadata],
    summary="List Employee Document Metadata"
)
@router.get(
    "/employees/{employee_id}/documents",
    response_model=List[CompanyEmployeeDocumentMetadata],
    summary="List Employee Document Metadata (Alias)",
    include_in_schema=False
)
def list_employee_documents(
    employee_id: int = Path(..., ge=1, description="Unique employee primary key"),
    db: Session = Depends(get_db)
):
    """
    List all uploaded document metadata for an employee.
    """
    service = EmployeeService(db)
    return service.get_employee_documents(employee_id)


@router.get(
    "/master/employees/{employee_id}/documents/{document_type}",
    summary="Download / View Employee PDF Document"
)
@router.get(
    "/employees/{employee_id}/documents/{document_type}",
    summary="Download / View Employee PDF Document (Alias)",
    include_in_schema=False
)
def download_employee_document(
    employee_id: int = Path(..., ge=1, description="Unique employee primary key"),
    document_type: str = Path(..., description="Document type: qualification, pan, aadhaar, driving_license, passport, epf_uan, esi_id"),
    db: Session = Depends(get_db)
):
    """
    Retrieve and stream stored PDF document with Content-Type: application/pdf.
    """
    service = EmployeeService(db)
    file_name, mime_type, file_data = service.download_document(employee_id, document_type)
    return Response(
        content=file_data,
        media_type=mime_type or "application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{file_name}"',
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )
