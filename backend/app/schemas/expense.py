from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator

def parse_percentage_to_numeric(val: Any) -> Optional[Decimal]:
    """Helper to convert '18%', '5%', 18, 18.0 to Decimal(18.00)."""
    if val is None or val == "":
        return None
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        cleaned = val.replace("%", "").strip()
        if not cleaned:
            return None
        try:
            return Decimal(cleaned)
        except Exception:
            return None
    return None

def parse_boolean_field(val: Any) -> bool:
    """Helper to parse boolean values from 'Yes'/'No', 'true'/'false', 1/0."""
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.strip().lower() in ("yes", "true", "1", "t", "y")
    if isinstance(val, (int, float)):
        return bool(val)
    return False

def parse_status_field(val: Any) -> str:
    """Helper to standardize status string to 'Active' or 'In - Active'."""
    if isinstance(val, bool):
        return "Active" if val else "In - Active"
    if isinstance(val, str):
        cleaned = val.strip().lower()
        if "in" in cleaned or "inactive" in cleaned or "false" in cleaned:
            return "In - Active"
        return "Active"
    return "Active"

class ExpenseBase(BaseModel):
    expense_name: Optional[str] = Field(None, description="Name of the expense")
    expense_category: Optional[str] = Field(None, description="Category of the expense")
    expense_sub_category: Optional[str] = Field(None, description="Sub-category of the expense")
    expense_head: Optional[str] = Field(None, description="Capex or Opex")
    gst_rate: Optional[Union[Decimal, str, float, int]] = Field(None, description="GST rate percentage")
    depreciation: Optional[Union[bool, str, int, float]] = Field(False, description="Depreciation flag or percentage")
    rcm: Optional[Union[bool, str, int]] = Field(False, description="RCM applicable flag")
    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")
    industry: Optional[str] = Field(None, description="Industry domain")
    company_name: Optional[str] = Field(None, description="Company name")
    raiser: Optional[str] = Field(None, description="Expense raiser")
    expense_code: Optional[str] = Field(None, description="Expense Code, e.g. EXP-001")
    sac_code: Optional[str] = Field(None, description="SAC Code")
    expense_description: Optional[str] = Field(None, description="Detailed description or subcategory")
    uom: Optional[str] = Field(None, description="Unit of Measurement")

class ExpenseCreate(ExpenseBase):
    # Support camelCase aliases from frontend JSON payload
    expenseName: Optional[str] = None
    expenseCategory: Optional[str] = None
    expenseSubCategory: Optional[str] = None
    expenseHead: Optional[str] = None
    gst: Optional[Union[str, float, int, Decimal]] = None
    depreciation_rate: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Align camelCase inputs to snake_case
            if "expenseName" in data and not data.get("expense_name"):
                data["expense_name"] = data["expenseName"]
            if "expenseCategory" in data and not data.get("expense_category"):
                data["expense_category"] = data["expenseCategory"]
            if "expenseSubCategory" in data and not data.get("expense_sub_category"):
                data["expense_sub_category"] = data["expenseSubCategory"]
            if "expenseHead" in data and not data.get("expense_head"):
                data["expense_head"] = data["expenseHead"]
            if "gst" in data and not data.get("gst_rate"):
                data["gst_rate"] = data["gst"]
            if "depreciation_rate" in data and not data.get("depreciation"):
                data["depreciation"] = data["depreciation_rate"]
        return data

class ExpenseUpdate(ExpenseCreate):
    pass

class ExpenseStatusUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None

class ExpenseResponse(BaseModel):
    id: int = Field(..., description="ID for frontend compatibility")
    expense_id: int = Field(..., description="Primary Key in PostgreSQL")
    expense_name: Optional[str] = None
    expenseName: Optional[str] = None
    expense_category: Optional[str] = None
    expenseCategory: Optional[str] = None
    expense_sub_category: Optional[str] = None
    expenseSubCategory: Optional[str] = None
    expense_head: Optional[str] = None
    expenseHead: Optional[str] = None
    gst_rate: Optional[float] = None
    gst: Optional[str] = None
    depreciation: bool = False
    depreciation_rate: Optional[str] = None
    rcm: bool = False
    rcm_text: str = "No"
    status: str = "Active"
    industry: Optional[str] = None
    company_name: Optional[str] = None
    raiser: Optional[str] = None
    expense_code: Optional[str] = None
    sac_code: Optional[str] = None
    expense_description: Optional[str] = None
    uom: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ExpenseListResponse(BaseModel):
    total: int
    items: List[ExpenseResponse]
    page: int = 1
    page_size: int = 50
