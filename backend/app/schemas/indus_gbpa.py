from typing import Optional, List, Union
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class IndusGbpaBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", max_length=255)
    customer_name: Optional[str] = Field("Indus Tower Ltd", max_length=255)
    item_code: Optional[str] = Field(None, max_length=100)
    item_name: Optional[str] = Field(None, max_length=255)
    item_description: Optional[str] = None
    item_type: Optional[str] = Field(None, max_length=100)
    hsn_sac: Optional[str] = Field(None, max_length=50)
    hsn_sac_code: Optional[str] = Field(None, max_length=50)
    uom: Optional[str] = Field(None, max_length=50)
    rate: Optional[Union[Decimal, float, str]] = None
    gst_rate: Optional[Union[Decimal, float, str]] = None
    budget_percentage: Optional[Union[Decimal, float, str]] = None
    budget_amount: Optional[Union[Decimal, float, str]] = None
    status: Optional[str] = Field("Active", max_length=50)

class IndusGbpaCreate(IndusGbpaBase):
    item_name: str = Field(..., min_length=1, max_length=255, description="Item / Product Name")
    item_code: Optional[str] = Field(None, max_length=100, description="Item Code")

class IndusGbpaUpdate(BaseModel):
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    item_code: Optional[str] = None
    item_name: Optional[str] = None
    item_description: Optional[str] = None
    item_type: Optional[str] = None
    hsn_sac: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    uom: Optional[str] = None
    rate: Optional[Union[Decimal, float, str]] = None
    gst_rate: Optional[Union[Decimal, float, str]] = None
    budget_percentage: Optional[Union[Decimal, float, str]] = None
    budget_amount: Optional[Union[Decimal, float, str]] = None
    status: Optional[str] = None

class IndusGbpaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    id: Optional[Union[int, str]] = None
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    item_name: Optional[str] = None
    itemName: Optional[str] = None
    productName: Optional[str] = None
    item_description: Optional[str] = None
    itemDescription: Optional[str] = None
    productDescription: Optional[str] = None
    item_type: Optional[str] = None
    itemType: Optional[str] = None
    productType: Optional[str] = None
    hsn_sac: Optional[str] = None
    hsnSacType: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    hsnSacCode: Optional[str] = None
    uom: Optional[str] = None
    rate: Optional[Union[str, float, Decimal]] = None
    activeRate: Optional[Union[str, float, Decimal]] = None
    gst_rate: Optional[Union[str, float, Decimal]] = None
    budget_percentage: Optional[Union[str, float, Decimal]] = None
    budgetPercent: Optional[Union[str, float, Decimal]] = None
    budget_amount: Optional[Union[str, float, Decimal]] = None
    budgetAmount: Optional[Union[str, float, Decimal]] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class IndusGbpaListResponse(BaseModel):
    items: List[IndusGbpaResponse]
    total: int
    page: int
    page_size: int
    pages: int
