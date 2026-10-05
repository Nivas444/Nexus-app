from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_gbpa_subpages_service import (
    GbpaMaterialsService,
    GbpaExpensesService,
    GbpaInfraService
)
from app.schemas.indus_gbpa_subpages import (
    GbpaMaterialCreate,
    GbpaMaterialUpdate,
    GbpaMaterialResponse,
    GbpaMaterialListResponse,
    GbpaExpenseCreate,
    GbpaExpenseUpdate,
    GbpaExpenseResponse,
    GbpaExpenseListResponse,
    GbpaInfraCreate,
    GbpaInfraUpdate,
    GbpaInfraResponse,
    GbpaInfraListResponse
)

router = APIRouter(tags=["Customer - Indus GBPA Subpages"])

# =========================================================================
# 1. MATERIALS ENDPOINTS
# =========================================================================
@router.get("/customer/indus/gbpa/materials", response_model=GbpaMaterialListResponse, summary="List GBPA Materials")
@router.get("/customer/gbpa/materials", response_model=GbpaMaterialListResponse, summary="List GBPA Materials (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/materials", response_model=GbpaMaterialListResponse, summary="List GBPA Materials (Direct Alias)", include_in_schema=False)
def list_materials(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    customer_name: Optional[str] = Query(None, description="Customer name filter"),
    status: Optional[str] = Query(None, description="Status filter (Active / In - Active)"),
    sort_by: str = Query("item_material_id", description="Sort column"),
    sort_desc: bool = Query(False, description="Sort descending"),
    db: Session = Depends(get_db)
):
    service = GbpaMaterialsService(db)
    return service.get_materials_list(
        page=page,
        page_size=page_size,
        search=search,
        customer_name=customer_name,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Get GBPA Material")
@router.get("/customer/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Get GBPA Material (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Get GBPA Material (Direct Alias)", include_in_schema=False)
def get_material(
    material_id: int = Path(..., ge=1, description="Material ID"),
    db: Session = Depends(get_db)
):
    service = GbpaMaterialsService(db)
    return service.get_material_by_id(material_id)

@router.post("/customer/indus/gbpa/materials", response_model=GbpaMaterialResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Material")
@router.post("/customer/gbpa/materials", response_model=GbpaMaterialResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Material (Alias)", include_in_schema=False)
@router.post("/indus/gbpa/materials", response_model=GbpaMaterialResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Material (Direct Alias)", include_in_schema=False)
def create_material(
    payload: GbpaMaterialCreate,
    db: Session = Depends(get_db)
):
    service = GbpaMaterialsService(db)
    return service.create_material(payload)

@router.put("/customer/indus/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Update GBPA Material")
@router.put("/customer/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Update GBPA Material (Alias)", include_in_schema=False)
@router.put("/indus/gbpa/materials/{material_id}", response_model=GbpaMaterialResponse, summary="Update GBPA Material (Direct Alias)", include_in_schema=False)
def update_material(
    payload: GbpaMaterialUpdate,
    material_id: int = Path(..., ge=1, description="Material ID"),
    db: Session = Depends(get_db)
):
    service = GbpaMaterialsService(db)
    return service.update_material(material_id, payload)

@router.delete("/customer/indus/gbpa/materials/{material_id}", summary="Delete GBPA Material")
@router.delete("/customer/gbpa/materials/{material_id}", summary="Delete GBPA Material (Alias)", include_in_schema=False)
@router.delete("/indus/gbpa/materials/{material_id}", summary="Delete GBPA Material (Direct Alias)", include_in_schema=False)
def delete_material(
    material_id: int = Path(..., ge=1, description="Material ID"),
    db: Session = Depends(get_db)
):
    service = GbpaMaterialsService(db)
    return service.delete_material(material_id)

from fastapi import File, UploadFile

@router.post("/customer/indus/gbpa/materials/bulk-upload", summary="Bulk Upload GBPA Materials")
@router.post("/customer/gbpa/materials/bulk-upload", summary="Bulk Upload GBPA Materials (Alias)", include_in_schema=False)
@router.post("/indus/gbpa/materials/bulk-upload", summary="Bulk Upload GBPA Materials (Direct Alias)", include_in_schema=False)
async def bulk_upload_materials(
    file: UploadFile = File(..., description="Official Indus GBPA Materials Excel (.xlsx/.xls) or CSV template file"),
    db: Session = Depends(get_db)
):
    content = await file.read()
    service = GbpaMaterialsService(db)
    return service.process_bulk_upload(content, filename=file.filename or "")


# =========================================================================
# 2. EXPENSES ENDPOINTS
# =========================================================================
@router.get("/customer/indus/gbpa/expenses", response_model=GbpaExpenseListResponse, summary="List GBPA Expenses")
@router.get("/customer/gbpa/expenses", response_model=GbpaExpenseListResponse, summary="List GBPA Expenses (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/expenses", response_model=GbpaExpenseListResponse, summary="List GBPA Expenses (Direct Alias)", include_in_schema=False)
def list_expenses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    customer_name: Optional[str] = Query(None, description="Customer name filter"),
    status: Optional[str] = Query(None, description="Status filter (Active / In - Active)"),
    sort_by: str = Query("item_expense_id", description="Sort column"),
    sort_desc: bool = Query(False, description="Sort descending"),
    db: Session = Depends(get_db)
):
    service = GbpaExpensesService(db)
    return service.get_expenses_list(
        page=page,
        page_size=page_size,
        search=search,
        customer_name=customer_name,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Get GBPA Expense")
@router.get("/customer/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Get GBPA Expense (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Get GBPA Expense (Direct Alias)", include_in_schema=False)
def get_expense(
    expense_id: int = Path(..., ge=1, description="Expense ID"),
    db: Session = Depends(get_db)
):
    service = GbpaExpensesService(db)
    return service.get_expense_by_id(expense_id)

@router.post("/customer/indus/gbpa/expenses", response_model=GbpaExpenseResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Expense")
@router.post("/customer/gbpa/expenses", response_model=GbpaExpenseResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Expense (Alias)", include_in_schema=False)
@router.post("/indus/gbpa/expenses", response_model=GbpaExpenseResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Expense (Direct Alias)", include_in_schema=False)
def create_expense(
    payload: GbpaExpenseCreate,
    db: Session = Depends(get_db)
):
    service = GbpaExpensesService(db)
    return service.create_expense(payload)

@router.put("/customer/indus/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Update GBPA Expense")
@router.put("/customer/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Update GBPA Expense (Alias)", include_in_schema=False)
@router.put("/indus/gbpa/expenses/{expense_id}", response_model=GbpaExpenseResponse, summary="Update GBPA Expense (Direct Alias)", include_in_schema=False)
def update_expense(
    payload: GbpaExpenseUpdate,
    expense_id: int = Path(..., ge=1, description="Expense ID"),
    db: Session = Depends(get_db)
):
    service = GbpaExpensesService(db)
    return service.update_expense(expense_id, payload)

@router.delete("/customer/indus/gbpa/expenses/{expense_id}", summary="Delete GBPA Expense")
@router.delete("/customer/gbpa/expenses/{expense_id}", summary="Delete GBPA Expense (Alias)", include_in_schema=False)
@router.delete("/indus/gbpa/expenses/{expense_id}", summary="Delete GBPA Expense (Direct Alias)", include_in_schema=False)
def delete_expense(
    expense_id: int = Path(..., ge=1, description="Expense ID"),
    db: Session = Depends(get_db)
):
    service = GbpaExpensesService(db)
    return service.delete_expense(expense_id)

@router.post("/customer/indus/gbpa/expenses/bulk-upload", summary="Bulk Upload GBPA Expenses")
@router.post("/customer/gbpa/expenses/bulk-upload", summary="Bulk Upload GBPA Expenses (Alias)", include_in_schema=False)
@router.post("/indus/gbpa/expenses/bulk-upload", summary="Bulk Upload GBPA Expenses (Direct Alias)", include_in_schema=False)
async def bulk_upload_expenses(
    file: UploadFile = File(..., description="Official Indus GBPA Expenses Excel (.xlsx/.xls) or CSV template file"),
    db: Session = Depends(get_db)
):
    content = await file.read()
    service = GbpaExpensesService(db)
    return service.process_bulk_upload(content, filename=file.filename or "")



# =========================================================================
# 3. INFRASTRUCTURE ENDPOINTS
# =========================================================================
@router.get("/customer/indus/gbpa/infra", response_model=GbpaInfraListResponse, summary="List GBPA Infrastructure")
@router.get("/customer/gbpa/infra", response_model=GbpaInfraListResponse, summary="List GBPA Infrastructure (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/infra", response_model=GbpaInfraListResponse, summary="List GBPA Infrastructure (Direct Alias)", include_in_schema=False)
def list_infra(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    customer_name: Optional[str] = Query(None, description="Customer name filter"),
    status: Optional[str] = Query(None, description="Status filter (Active / In - Active)"),
    sort_by: str = Query("item_infrastructure_id", description="Sort column"),
    sort_desc: bool = Query(False, description="Sort descending"),
    db: Session = Depends(get_db)
):
    service = GbpaInfraService(db)
    return service.get_infra_list(
        page=page,
        page_size=page_size,
        search=search,
        customer_name=customer_name,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Get GBPA Infrastructure")
@router.get("/customer/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Get GBPA Infrastructure (Alias)", include_in_schema=False)
@router.get("/indus/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Get GBPA Infrastructure (Direct Alias)", include_in_schema=False)
def get_infra(
    infra_id: int = Path(..., ge=1, description="Infrastructure ID"),
    db: Session = Depends(get_db)
):
    service = GbpaInfraService(db)
    return service.get_infra_by_id(infra_id)

@router.post("/customer/indus/gbpa/infra", response_model=GbpaInfraResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Infrastructure")
@router.post("/customer/gbpa/infra", response_model=GbpaInfraResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Infrastructure (Alias)", include_in_schema=False)
@router.post("/indus/gbpa/infra", response_model=GbpaInfraResponse, status_code=status.HTTP_201_CREATED, summary="Create GBPA Infrastructure (Direct Alias)", include_in_schema=False)
def create_infra(
    payload: GbpaInfraCreate,
    db: Session = Depends(get_db)
):
    service = GbpaInfraService(db)
    return service.create_infra(payload)

@router.put("/customer/indus/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Update GBPA Infrastructure")
@router.put("/customer/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Update GBPA Infrastructure (Alias)", include_in_schema=False)
@router.put("/indus/gbpa/infra/{infra_id}", response_model=GbpaInfraResponse, summary="Update GBPA Infrastructure (Direct Alias)", include_in_schema=False)
def update_infra(
    payload: GbpaInfraUpdate,
    infra_id: int = Path(..., ge=1, description="Infrastructure ID"),
    db: Session = Depends(get_db)
):
    service = GbpaInfraService(db)
    return service.update_infra(infra_id, payload)

@router.delete("/customer/indus/gbpa/infra/{infra_id}", summary="Delete GBPA Infrastructure")
@router.delete("/customer/gbpa/infra/{infra_id}", summary="Delete GBPA Infrastructure (Alias)", include_in_schema=False)
@router.delete("/indus/gbpa/infra/{infra_id}", summary="Delete GBPA Infrastructure (Direct Alias)", include_in_schema=False)
def delete_infra(
    infra_id: int = Path(..., ge=1, description="Infrastructure ID"),
    db: Session = Depends(get_db)
):
    service = GbpaInfraService(db)
    return service.delete_infra(infra_id)
