from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator

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

class CustomerBase(BaseModel):
    customer_name: Optional[str] = Field(None, description="Unique customer name")
    legal_name: Optional[str] = Field(None, description="Unique legal name")
    customer_code: Optional[str] = Field(None, description="Unique customer code / ID")
    business_type: Optional[str] = Field("Projects", description="Business Type: Projects / Supply")
    gst_type: Optional[str] = Field("SGST", description="GST Type: SGST / IGST / NA")
    gst_number: Optional[str] = Field(None, description="GST Number")
    pan_number: Optional[str] = Field(None, description="PAN Number")
    invoice_type: Optional[str] = Field("B2B", description="Invoice Type: B2B / B2C / Cash")
    po_stating_3_digits: Optional[str] = Field(None, description="Starting 3 digits of PO")
    gst_address: Optional[str] = Field(None, description="Company address")
    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")
    company_name: Optional[str] = Field("Nexus", description="Company Name")

class CustomerCreate(CustomerBase):
    # Frontend camelCase aliases
    customerName: Optional[str] = None
    legalName: Optional[str] = None
    customerId: Optional[str] = None
    customerCode: Optional[str] = None
    businessType: Optional[str] = None
    gstType: Optional[str] = None
    gstNumber: Optional[str] = None
    panNumber: Optional[str] = None
    invoiceType: Optional[str] = None
    poDigits: Optional[str] = None
    address: Optional[str] = None
    gstEnabled: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "customerName" in data and not data.get("customer_name"):
                data["customer_name"] = data["customerName"]
            if "legalName" in data and not data.get("legal_name"):
                data["legal_name"] = data["legalName"]
            if "customerId" in data and not data.get("customer_code"):
                data["customer_code"] = data["customerId"]
            if "customerCode" in data and not data.get("customer_code"):
                data["customer_code"] = data["customerCode"]
            if "businessType" in data and not data.get("business_type"):
                data["business_type"] = data["businessType"]
            if "gstType" in data and not data.get("gst_type"):
                data["gst_type"] = data["gstType"]
            if "gstNumber" in data and not data.get("gst_number"):
                data["gst_number"] = data["gstNumber"]
            if "panNumber" in data and not data.get("pan_number"):
                data["pan_number"] = data["panNumber"]
            if "invoiceType" in data and not data.get("invoice_type"):
                data["invoice_type"] = data["invoiceType"]
            if "poDigits" in data and not data.get("po_stating_3_digits"):
                data["po_stating_3_digits"] = data["poDigits"]
            if "address" in data and not data.get("gst_address"):
                data["gst_address"] = data["address"]

            # If legal_name provided but customer_name missing, fallback
            if not data.get("customer_name") and data.get("legal_name"):
                data["customer_name"] = data["legal_name"]
            if not data.get("legal_name") and data.get("customer_name"):
                data["legal_name"] = data["customer_name"]
        return data

class CustomerUpdate(CustomerCreate):
    pass

class CustomerRestrictedUpdate(BaseModel):
    """
    Restricted edit schema specifically for Indus Towers green banner edit mode:
    Only 6 permitted fields:
    1. GST (gstEnabled)
    2. GST Number (gstNumber / gst_number)
    3. GST Type (gstType / gst_type)
    4. Address (address / gst_address)
    5. Status (status)
    6. No other fields
    """
    gst_enabled: Optional[bool] = None
    gstEnabled: Optional[bool] = None
    gst_number: Optional[str] = None
    gstNumber: Optional[str] = None
    gst_type: Optional[str] = None
    gstType: Optional[str] = None
    gst_address: Optional[str] = None
    address: Optional[str] = None
    status: Optional[Union[str, bool]] = None

    # Forbidden fields defined to detect unauthorized update attempts
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    customer_code: Optional[str] = None
    customerCode: Optional[str] = None
    customerId: Optional[str] = None
    legal_name: Optional[str] = None
    legalName: Optional[str] = None
    business_type: Optional[str] = None
    businessType: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_update_payload(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "gstNumber" in data and not data.get("gst_number"):
                data["gst_number"] = data["gstNumber"]
            if "gstType" in data and not data.get("gst_type"):
                data["gst_type"] = data["gstType"]
            if "address" in data and not data.get("gst_address"):
                data["gst_address"] = data["address"]
            if "gstEnabled" in data and data.get("gst_enabled") is None:
                data["gst_enabled"] = data["gstEnabled"]
        return data

class CustomerStatusUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(BaseModel):
    id: int = Field(..., description="ID for frontend compatibility")
    customer_id: int = Field(..., description="Primary Key in PostgreSQL customer table")
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    legal_name: Optional[str] = None
    legalName: Optional[str] = None
    customer_code: Optional[str] = None
    customerCode: Optional[str] = None
    customerId: Optional[str] = None
    business_type: Optional[str] = None
    businessType: Optional[str] = None
    gst_type: Optional[str] = None
    gstType: Optional[str] = None
    gst_number: Optional[str] = None
    gstNumber: Optional[str] = None
    pan_number: Optional[str] = None
    panNumber: Optional[str] = None
    invoice_type: Optional[str] = None
    invoiceType: Optional[str] = None
    po_stating_3_digits: Optional[str] = None
    poDigits: Optional[str] = None
    gst_address: Optional[str] = None
    address: Optional[str] = None
    status: str = "Active"
    company_name: Optional[str] = None
    gstEnabled: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    total: int
    items: List[CustomerResponse]
    page: int = 1
    page_size: int = 50

# --- Customer Contact Schemas ---
class CustomerContactBase(BaseModel):
    customer_name: Optional[str] = None
    name: Optional[str] = None
    designation: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[Union[str, bool]] = "Active"

class CustomerContactCreate(CustomerContactBase):
    contact: Optional[str] = None
    customerName: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_contact(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "contact" in data and not data.get("contact_number"):
                data["contact_number"] = data["contact"]
            if "customerName" in data and not data.get("customer_name"):
                data["customer_name"] = data["customerName"]
        return data

class CustomerContactResponse(BaseModel):
    id: int
    contact_id: int
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    name: Optional[str] = None
    designation: Optional[str] = None
    contact_number: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    status: str = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerContactListResponse(BaseModel):
    total: int
    items: List[CustomerContactResponse]

# --- Customer Office Location Schemas ---
class CustomerLocationBase(BaseModel):
    customer_name: Optional[str] = None
    office_name: Optional[str] = None
    latitude: Optional[Union[Decimal, float, str]] = None
    longitude: Optional[Union[Decimal, float, str]] = None
    status: Optional[Union[str, bool]] = "Active"

class CustomerLocationCreate(CustomerLocationBase):
    officeName: Optional[str] = None
    customerName: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_location(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "officeName" in data and not data.get("office_name"):
                data["office_name"] = data["officeName"]
            if "customerName" in data and not data.get("customer_name"):
                data["customer_name"] = data["customerName"]
        return data

class CustomerLocationResponse(BaseModel):
    id: int
    office_id: int
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    office_name: Optional[str] = None
    officeName: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    status: str = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerLocationListResponse(BaseModel):
    total: int
    items: List[CustomerLocationResponse]
