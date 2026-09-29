from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator, field_validator

def parse_numeric_field(val: Any) -> Optional[Decimal]:
    """Helper to convert strings like '18%', '10%', '5,000', 10 to Decimal."""
    if val is None or val == "":
        return None
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        cleaned = val.replace("%", "").replace(",", "").strip()
        if not cleaned:
            return None
        try:
            return Decimal(cleaned)
        except Exception:
            return None
    return None

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

class ProductBase(BaseModel):
    product_name: Optional[str] = Field(None, description="Unique product name")
    material_head: Optional[str] = Field(None, description="Unique material head")
    material_category: Optional[str] = Field(None, description="Product / Material Category")
    material_code: Optional[str] = Field(None, description="Product / Material Code")
    hsn_code: Optional[str] = Field(None, description="HSN Code (non-editable in update)")
    material_description: Optional[str] = Field(None, description="Detailed product description")
    make: Optional[str] = Field(None, description="Make / Brand")
    uom: Optional[str] = Field(None, description="Unit of measurement")
    sale_uom: Optional[str] = Field(None, description="Sale unit of measurement")
    ucf: Optional[Union[Decimal, str, float, int]] = Field(None, description="Unit conversion factor")
    msq: Optional[Union[Decimal, str, float, int]] = Field(None, description="Minimum Stock Quantity")
    moq: Optional[Union[Decimal, str, float, int]] = Field(None, description="Minimum Order Quantity")
    oh: Optional[Union[Decimal, str, float, int]] = Field(None, description="Overhead percentage")
    profit: Optional[Union[Decimal, str, float, int]] = Field(None, description="Margin / Profit percentage")
    gst_rate: Optional[Union[Decimal, str, float, int]] = Field(None, description="GST rate percentage")
    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")
    company_name: Optional[str] = Field("Nexus", description="Company Name")

class ProductCreate(ProductBase):
    # Frontend camelCase aliases
    productName: Optional[str] = None
    productHead: Optional[str] = None
    productCategory: Optional[str] = None
    productCode: Optional[str] = None
    hsnCode: Optional[str] = None
    saleUom: Optional[str] = None
    gstRate: Optional[Union[str, float, int, Decimal]] = None
    gst: Optional[Union[str, float, int, Decimal]] = None
    margin: Optional[Union[str, float, int, Decimal]] = None
    inflation: Optional[Union[str, float, int, Decimal]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "productName" in data and not data.get("product_name"):
                data["product_name"] = data["productName"]
            if "productHead" in data and not data.get("material_head"):
                data["material_head"] = data["productHead"]
            if "productCategory" in data and not data.get("material_category"):
                data["material_category"] = data["productCategory"]
            if "productCode" in data and not data.get("material_code"):
                data["material_code"] = data["productCode"]
            if "hsnCode" in data and not data.get("hsn_code"):
                data["hsn_code"] = data["hsnCode"]
            if "saleUom" in data and not data.get("sale_uom"):
                data["sale_uom"] = data["saleUom"]
            if "gstRate" in data and not data.get("gst_rate"):
                data["gst_rate"] = data["gstRate"]
            if "gst" in data and not data.get("gst_rate"):
                data["gst_rate"] = data["gst"]
            if "margin" in data and not data.get("profit"):
                data["profit"] = data["margin"]
            # Fallback material_head to product_name if missing
            if not data.get("material_head") and data.get("product_name"):
                data["material_head"] = data["product_name"]
            if not data.get("product_name") and data.get("material_head"):
                data["product_name"] = data["material_head"]
        return data

class ProductUpdate(BaseModel):
    """
    Update schema strictly restricting editable fields to:
    - GST Rate (gst_rate / gstRate / gst)
    - MSQ (msq)
    - MOQ (moq)
    - Margin (profit / margin)
    - OH (oh)
    - Status (status)
    
    Attempts to change product_name, material_head, or hsn_code are explicitly forbidden.
    """
    gst_rate: Optional[Union[Decimal, str, float, int]] = None
    gstRate: Optional[Union[Decimal, str, float, int]] = None
    gst: Optional[Union[Decimal, str, float, int]] = None
    msq: Optional[Union[Decimal, str, float, int]] = None
    moq: Optional[Union[Decimal, str, float, int]] = None
    profit: Optional[Union[Decimal, str, float, int]] = None
    margin: Optional[Union[Decimal, str, float, int]] = None
    oh: Optional[Union[Decimal, str, float, int]] = None
    status: Optional[Union[str, bool]] = None

    # Forbidden fields defined to detect unauthorized update attempts
    product_name: Optional[str] = None
    productName: Optional[str] = None
    material_head: Optional[str] = None
    productHead: Optional[str] = None
    hsn_code: Optional[str] = None
    hsnCode: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_update_payload(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "gstRate" in data and not data.get("gst_rate"):
                data["gst_rate"] = data["gstRate"]
            if "gst" in data and not data.get("gst_rate"):
                data["gst_rate"] = data["gst"]
            if "margin" in data and not data.get("profit"):
                data["profit"] = data["margin"]
        return data

class ProductStatusUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int = Field(..., description="ID for frontend compatibility")
    material_id: int = Field(..., description="Primary Key in PostgreSQL company_products")
    product_name: Optional[str] = None
    productName: Optional[str] = None
    material_head: Optional[str] = None
    productHead: Optional[str] = None
    material_category: Optional[str] = None
    productCategory: Optional[str] = None
    material_code: Optional[str] = None
    productCode: Optional[str] = None
    hsn_code: Optional[str] = None
    hsnCode: Optional[str] = None
    material_description: Optional[str] = None
    make: Optional[str] = None
    uom: Optional[str] = None
    sale_uom: Optional[str] = None
    saleUom: Optional[str] = None
    ucf: Optional[float] = None
    msq: Optional[Union[float, str]] = None
    moq: Optional[Union[float, str]] = None
    oh: Optional[str] = None
    margin: Optional[str] = None
    profit: Optional[float] = None
    gst_rate: Optional[float] = None
    gstRate: Optional[str] = None
    gst: Optional[str] = None
    price: Optional[str] = "4,50,000.00"
    stockPrices: Optional[str] = "4,50,000.00"
    status: str = "Active"
    company_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    total: int
    items: List[ProductResponse]
    page: int = 1
    page_size: int = 50
