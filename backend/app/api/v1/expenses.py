from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, UploadFile, File, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.expense_service import ExpenseService
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseStatusUpdate,
    ExpenseResponse,
    ExpenseListResponse
)

router = APIRouter(prefix="/master/expenses", tags=["Master - Expenses"])

@router.get("", response_model=ExpenseListResponse, summary="List Master Expenses")
def list_expenses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, category, head, or code"),
    category: Optional[str] = Query(None, description="Filter by category"),
    head: Optional[str] = Query(None, description="Filter by Capex or Opex"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("expense_id", description="Column to sort by"),
    sort_desc: bool = Query(False, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real expense records from PostgreSQL with filtering, search, and pagination.
    """
    service = ExpenseService(db)
    return service.get_expenses_list(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        head=head,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/template", summary="Download Bulk Expense CSV Template")
def download_expense_template():
    """
    Returns standard CSV template header and sample row for Bulk Upload.
    """
    headers = ["Expense Name", "Expense Category", "Expense Sub-Category", "Expense Head", "GST Rate", "Depreciation", "RCM", "Status"]
    sample_row = ["Site Infrastructure Maintenance", "Direct Operations", "Civil Works", "Capex", "18%", "Yes", "No", "Active"]
    csv_content = "\n".join([",".join(headers), ",".join(sample_row)])
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Master_Expenses_Template.csv"}
    )

@router.get("/{expense_id}", response_model=ExpenseResponse, summary="Get Expense Details")
def get_expense(
    expense_id: int = Path(..., ge=1, description="Unique primary key of expense"),
    db: Session = Depends(get_db)
):
    """
    Fetch a single expense by primary key for viewing in the detail panel.
    """
    service = ExpenseService(db)
    return service.get_expense_by_id(expense_id)

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED, summary="Create Expense")
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db)
):
    """
    Persist a newly added expense into the `company_expenses` PostgreSQL table.
    """
    service = ExpenseService(db)
    return service.create_expense(payload)

@router.put("/{expense_id}", response_model=ExpenseResponse, summary="Update Expense")
def update_expense(
    expense_id: int = Path(..., ge=1, description="Unique primary key of expense"),
    payload: ExpenseUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing expense in `company_expenses`.
    """
    service = ExpenseService(db)
    return service.update_expense(expense_id, payload)

@router.patch("/{expense_id}/status", response_model=ExpenseResponse, summary="Toggle Expense Status")
def update_expense_status(
    expense_id: int = Path(..., ge=1, description="Unique primary key of expense"),
    payload: ExpenseStatusUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Toggle Active/In-Active status of an expense.
    """
    service = ExpenseService(db)
    return service.update_status(expense_id, payload)

@router.delete("/{expense_id}", summary="Delete Expense")
def delete_expense(
    expense_id: int = Path(..., ge=1, description="Unique primary key of expense"),
    db: Session = Depends(get_db)
):
    """
    Delete an expense record from `company_expenses`.
    """
    service = ExpenseService(db)
    return service.delete_expense(expense_id)

@router.post("/bulk-upload", summary="Bulk Upload Expenses via CSV")
async def bulk_upload_expenses(
    file: UploadFile = File(..., description="CSV file containing expense records"),
    db: Session = Depends(get_db)
):
    """
    Upload and parse CSV file to bulk-insert records into PostgreSQL `company_expenses`.
    """
    content = await file.read()
    service = ExpenseService(db)
    return service.process_bulk_csv(content)
