from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ==========================================
# 1. MATERIALS SCHEMAS
# ==========================================
class GbpaMaterialBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", max_length=255)
    customer_name: Optional[str] = Field("Indus Tower Ltd", max_length=255)
    customerName: Optional[str] = None
    item_code: Optional[str] = Field(None, max_length=100)
    item_name: Optional[str] = Field(None, max_length=255)
    material_code: Optional[str] = Field(None, max_length=100)
    material_head: Optional[str] = Field(None, max_length=150)
    material_category: Optional[str] = Field(None, max_length=150)
    material_description: Optional[str] = None
    material_type: Optional[str] = Field(None, max_length=100)
    uom: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field("Active", max_length=50)

    # Aliases for UI compatibility
    materialHead: Optional[str] = None
    materialCategory: Optional[str] = None
    materialDescription: Optional[str] = None
    make: Optional[str] = None
    type: Optional[str] = None
    ucf: Optional[str] = None

class GbpaMaterialCreate(GbpaMaterialBase):
    material_head: Optional[str] = Field(None, max_length=150, description="Material Head")

class GbpaMaterialUpdate(BaseModel):
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    material_code: Optional[str] = None
    material_head: Optional[str] = None
    material_category: Optional[str] = None
    material_description: Optional[str] = None
    material_type: Optional[str] = None
    uom: Optional[str] = None
    status: Optional[str] = None

    # Aliases for UI compatibility
    materialHead: Optional[str] = None
    materialCategory: Optional[str] = None
    materialDescription: Optional[str] = None
    make: Optional[str] = None
    type: Optional[str] = None
    ucf: Optional[str] = None

class GbpaMaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_material_id: int
    id: Union[int, str]
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    itemName: Optional[str] = None
    material_code: Optional[str] = None
    materialCode: Optional[str] = None
    material_head: Optional[str] = None
    materialHead: Optional[str] = None
    material_category: Optional[str] = None
    materialCategory: Optional[str] = None
    material_description: Optional[str] = None
    materialDescription: Optional[str] = None
    material_type: Optional[str] = None
    make: Optional[str] = None
    type: Optional[str] = None
    uom: Optional[str] = None
    ucf: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class GbpaMaterialListResponse(BaseModel):
    items: List[GbpaMaterialResponse]
    total: int
    page: int
    page_size: int
    pages: int


# ==========================================
# 2. EXPENSES SCHEMAS
# ==========================================
class GbpaExpenseBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", max_length=255)
    customer_name: Optional[str] = Field("Indus Tower Ltd", max_length=255)
    customerName: Optional[str] = None
    item_code: Optional[str] = Field(None, max_length=100)
    item_name: Optional[str] = Field(None, max_length=255)
    expense_code: Optional[str] = Field(None, max_length=100)
    expense_head: Optional[str] = Field(None, max_length=150)
    expense_category: Optional[str] = Field(None, max_length=150)
    expense_description: Optional[str] = None
    expense_type: Optional[str] = Field(None, max_length=100)
    uom: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field("Active", max_length=50)

    # Aliases for UI compatibility
    expenseHead: Optional[str] = None
    expenseCategory: Optional[str] = None
    expenseDescription: Optional[str] = None
    type: Optional[str] = None

class GbpaExpenseCreate(GbpaExpenseBase):
    expense_head: Optional[str] = Field(None, max_length=150, description="Expense Head")

class GbpaExpenseUpdate(BaseModel):
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    expense_code: Optional[str] = None
    expense_head: Optional[str] = None
    expense_category: Optional[str] = None
    expense_description: Optional[str] = None
    expense_type: Optional[str] = None
    uom: Optional[str] = None
    status: Optional[str] = None

    # Aliases for UI compatibility
    expenseHead: Optional[str] = None
    expenseCategory: Optional[str] = None
    expenseDescription: Optional[str] = None
    type: Optional[str] = None

class GbpaExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_expense_id: int
    id: Union[int, str]
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    itemName: Optional[str] = None
    expense_code: Optional[str] = None
    expenseCode: Optional[str] = None
    expense_head: Optional[str] = None
    expenseHead: Optional[str] = None
    expense_category: Optional[str] = None
    expenseCategory: Optional[str] = None
    expense_description: Optional[str] = None
    expenseDescription: Optional[str] = None
    expense_type: Optional[str] = None
    type: Optional[str] = None
    uom: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class GbpaExpenseListResponse(BaseModel):
    items: List[GbpaExpenseResponse]
    total: int
    page: int
    page_size: int
    pages: int


# ==========================================
# 3. INFRASTRUCTURE SCHEMAS
# ==========================================
class GbpaInfraBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", max_length=255)
    customer_name: Optional[str] = Field("Indus Tower Ltd", max_length=255)
    customerName: Optional[str] = None
    item_code: Optional[str] = Field(None, max_length=100)
    item_name: Optional[str] = Field(None, max_length=255)
    infra_code: Optional[str] = Field(None, max_length=100)
    infra_category: Optional[str] = Field(None, max_length=150)
    infra_description: Optional[str] = None
    infra_type: Optional[str] = Field(None, max_length=100)
    uom: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field("Active", max_length=50)

    # Aliases for UI compatibility
    infraCode: Optional[str] = None
    infraCategory: Optional[str] = None
    infraDescription: Optional[str] = None
    type: Optional[str] = None

class GbpaInfraCreate(GbpaInfraBase):
    infra_code: str = Field(..., min_length=1, max_length=100, description="Infra Code")

class GbpaInfraUpdate(BaseModel):
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    infra_code: Optional[str] = None
    infra_category: Optional[str] = None
    infra_description: Optional[str] = None
    infra_type: Optional[str] = None
    uom: Optional[str] = None
    status: Optional[str] = None

    # Aliases for UI compatibility
    infraCode: Optional[str] = None
    infraCategory: Optional[str] = None
    infraDescription: Optional[str] = None
    type: Optional[str] = None

class GbpaInfraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_infrastructure_id: int
    id: Union[int, str]
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    itemName: Optional[str] = None
    infra_code: Optional[str] = None
    infraCode: Optional[str] = None
    infra_category: Optional[str] = None
    infraCategory: Optional[str] = None
    infra_description: Optional[str] = None
    infraDescription: Optional[str] = None
    infra_type: Optional[str] = None
    type: Optional[str] = None
    uom: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class GbpaInfraListResponse(BaseModel):
    items: List[GbpaInfraResponse]
    total: int
    page: int
    page_size: int
    pages: int
