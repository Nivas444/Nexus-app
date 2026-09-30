from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator

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
        if "in" in cleaned or "inactive" in cleaned or "false" in cleaned or "de-active" in cleaned:
            return "In - Active"
        return "Active"
    return "Active"

def parse_date_field(val: Any) -> Optional[date]:
    """Parse string date formatted like 'YYYY-MM-DD' or 'DD - MM - YYYY' or 'DD-MM-YYYY'."""
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        cleaned = val.strip()
        parts = [p.strip() for p in cleaned.replace("/", "-").split("-") if p.strip()]
        if len(parts) == 3:
            try:
                if len(parts[0]) == 4:
                    return date(int(parts[0]), int(parts[1]), int(parts[2]))
                else:
                    return date(int(parts[2]), int(parts[1]), int(parts[0]))
            except Exception:
                return None
    return None


class VendorBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company Name")
    vendor_name: Optional[str] = Field(None, description="Vendor Name")
    entity_type: Optional[str] = Field(None, description="Entity Type (e.g. Proprietorship, Private Limited)")
    business_type: Optional[str] = Field(None, description="Business Type (e.g. Supply, Service)")
    service_type: Optional[str] = Field(None, description="Service Type (e.g. Project, Transport, Others)")
    contract_type: Optional[str] = Field(None, description="Contract Type (e.g. B2B, B2C)")
    gst_number_available: Optional[bool] = Field(False, description="Whether GST number is available")
    gst_number: Optional[str] = Field(None, description="GST Number")
    gst_certificate: Optional[str] = Field(None, description="GST Certificate / Document link")
    gst_type: Optional[str] = Field(None, description="GST Type (e.g. SGST, IGST)")
    address: Optional[str] = Field(None, description="Vendor Address")
    pan_number: Optional[str] = Field(None, description="PAN Number")
    pan_documents: Optional[str] = Field(None, description="PAN Document link")
    tds_deduction: Optional[bool] = Field(False, description="Whether TDS is deducted")
    tds_rate: Optional[Union[Decimal, str, float, int]] = Field(None, description="TDS deduction rate percentage")
    tds_code: Optional[str] = Field(None, description="TDS Code")

    # Bank fields
    account_name: Optional[str] = Field(None, description="Bank Account Name")
    account_number: Optional[str] = Field(None, description="Bank Account Number")
    bank_name: Optional[str] = Field(None, description="Bank Name")
    account_type: Optional[str] = Field(None, description="Bank Account Type")
    ifsc_code: Optional[str] = Field(None, description="IFSC Code")
    cancelled_cheque: Optional[str] = Field(None, description="Cancelled Cheque Document")

    # Contact fields
    contact_name: Optional[str] = Field(None, description="Contact Person Name")
    contact_number: Optional[str] = Field(None, description="Contact Phone Number")
    email: Optional[str] = Field(None, description="Contact Email Address")

    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")


class VendorCreate(VendorBase):
    # Frontend camelCase aliases
    vendorName: Optional[str] = None
    entityType: Optional[str] = None
    businessType: Optional[str] = None
    vendorType: Optional[str] = None
    serviceType: Optional[str] = None
    contractType: Optional[str] = None
    gstEnabled: Optional[bool] = None
    gstNumber: Optional[str] = None
    gstType: Optional[str] = None
    panNumber: Optional[str] = None
    tdsDeduction: Optional[bool] = None
    tdsRate: Optional[Union[Decimal, str, float, int]] = None
    tdsCode: Optional[str] = None
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    accountType: Optional[str] = None
    ifscCode: Optional[str] = None
    contactName: Optional[str] = None
    contactNumber: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "vendorName": "vendor_name",
                "entityType": "entity_type",
                "businessType": "business_type",
                "vendorType": "business_type",
                "serviceType": "service_type",
                "contractType": "contract_type",
                "gstEnabled": "gst_number_available",
                "gstNumber": "gst_number",
                "gstType": "gst_type",
                "panNumber": "pan_number",
                "tdsDeduction": "tds_deduction",
                "tdsRate": "tds_rate",
                "tdsCode": "tds_code",
                "accountName": "account_name",
                "accountNumber": "account_number",
                "bankName": "bank_name",
                "accountType": "account_type",
                "ifscCode": "ifsc_code",
                "contactName": "contact_name",
                "contactNumber": "contact_number",
            }
            for camel, snake in mapping.items():
                if camel in data and (data.get(snake) is None or data.get(snake) == ""):
                    data[snake] = data[camel]

            if "tds_rate" in data:
                data["tds_rate"] = parse_numeric_field(data["tds_rate"])
            if "status" in data:
                data["status"] = parse_status_field(data["status"])
        return data


class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    vendor_name: Optional[str] = None
    entity_type: Optional[str] = None
    business_type: Optional[str] = None
    service_type: Optional[str] = None
    contract_type: Optional[str] = None
    gst_number_available: Optional[bool] = None
    gst_number: Optional[str] = None
    gst_certificate: Optional[str] = None
    gst_type: Optional[str] = None
    address: Optional[str] = None
    pan_number: Optional[str] = None
    pan_documents: Optional[str] = None
    tds_deduction: Optional[bool] = None
    tds_rate: Optional[Union[Decimal, str, float, int]] = None
    tds_code: Optional[str] = None

    account_name: Optional[str] = None
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    ifsc_code: Optional[str] = None
    cancelled_cheque: Optional[str] = None

    contact_name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[Union[str, bool]] = None

    # camelCase aliases
    vendorName: Optional[str] = None
    entityType: Optional[str] = None
    businessType: Optional[str] = None
    vendorType: Optional[str] = None
    serviceType: Optional[str] = None
    contractType: Optional[str] = None
    gstEnabled: Optional[bool] = None
    gstNumber: Optional[str] = None
    gstType: Optional[str] = None
    panNumber: Optional[str] = None
    tdsDeduction: Optional[bool] = None
    tdsRate: Optional[Union[Decimal, str, float, int]] = None
    tdsCode: Optional[str] = None
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    accountType: Optional[str] = None
    ifscCode: Optional[str] = None
    contactName: Optional[str] = None
    contactNumber: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "vendorName": "vendor_name",
                "entityType": "entity_type",
                "businessType": "business_type",
                "vendorType": "business_type",
                "serviceType": "service_type",
                "contractType": "contract_type",
                "gstEnabled": "gst_number_available",
                "gstNumber": "gst_number",
                "gstType": "gst_type",
                "panNumber": "pan_number",
                "tdsDeduction": "tds_deduction",
                "tdsRate": "tds_rate",
                "tdsCode": "tds_code",
                "accountName": "account_name",
                "accountNumber": "account_number",
                "bankName": "bank_name",
                "accountType": "account_type",
                "ifscCode": "ifsc_code",
                "contactName": "contact_name",
                "contactNumber": "contact_number",
            }
            for camel, snake in mapping.items():
                if camel in data and (data.get(snake) is None or data.get(snake) == ""):
                    data[snake] = data[camel]

            if "tds_rate" in data and data["tds_rate"] is not None:
                data["tds_rate"] = parse_numeric_field(data["tds_rate"])
            if "status" in data and data["status"] is not None:
                data["status"] = parse_status_field(data["status"])
        return data


class VendorBankUpdate(BaseModel):
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    ifsc_code: Optional[str] = None
    cancelled_cheque: Optional[str] = None
    status: Optional[str] = None

    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    accountType: Optional[str] = None
    ifscCode: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "accountName" in data and not data.get("account_name"):
                data["account_name"] = data["accountName"]
            if "accountNumber" in data and not data.get("account_number"):
                data["account_number"] = data["accountNumber"]
            if "bankName" in data and not data.get("bank_name"):
                data["bank_name"] = data["bankName"]
            if "accountType" in data and not data.get("account_type"):
                data["account_type"] = data["accountType"]
            if "ifscCode" in data and not data.get("ifsc_code"):
                data["ifsc_code"] = data["ifscCode"]
        return data


class VendorContactUpdate(BaseModel):
    contact_name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None

    contactName: Optional[str] = None
    contactNumber: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "contactName" in data and not data.get("contact_name"):
                data["contact_name"] = data["contactName"]
            elif "name" in data and not data.get("contact_name"):
                data["contact_name"] = data["name"]
            if "contactNumber" in data and not data.get("contact_number"):
                data["contact_number"] = data["contactNumber"]
            elif "phone" in data and not data.get("contact_number"):
                data["contact_number"] = data["phone"]
        return data


class VendorStatusUpdate(BaseModel):
    status: Union[str, bool]

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict) and "status" in data:
            data["status"] = parse_status_field(data["status"])
        return data


class VendorResponse(VendorBase):
    vendor_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # camelCase convenience fields for frontend
    id: Optional[int] = None
    vendorName: Optional[str] = None
    entityType: Optional[str] = None
    businessType: Optional[str] = None
    vendorType: Optional[str] = None
    serviceType: Optional[str] = None
    contractType: Optional[str] = None
    gstEnabled: Optional[bool] = None
    gstNumber: Optional[str] = None
    gstType: Optional[str] = None
    panNumber: Optional[str] = None
    tdsDeduction: Optional[bool] = None
    tdsRate: Optional[str] = None
    tdsCode: Optional[str] = None
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    accountType: Optional[str] = None
    ifscCode: Optional[str] = None
    contactName: Optional[str] = None
    contactNumber: Optional[str] = None

    @model_validator(mode="after")
    def populate_aliases(self) -> "VendorResponse":
        self.id = self.vendor_id
        self.vendorName = self.vendor_name
        self.entityType = self.entity_type
        self.businessType = self.business_type
        self.vendorType = self.business_type
        self.serviceType = self.service_type
        self.contractType = self.contract_type
        self.gstEnabled = self.gst_number_available
        self.gstNumber = self.gst_number
        self.gstType = self.gst_type
        self.panNumber = self.pan_number
        self.tdsDeduction = self.tds_deduction
        self.tdsRate = f"{self.tds_rate}%" if self.tds_rate is not None else None
        self.tdsCode = self.tds_code
        self.accountName = self.account_name
        self.accountNumber = self.account_number
        self.bankName = self.bank_name
        self.accountType = self.account_type
        self.ifscCode = self.ifsc_code
        self.contactName = self.contact_name
        self.contactNumber = self.contact_number
        return self

    model_config = ConfigDict(from_attributes=True)


class VendorListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[VendorResponse]


# =========================================================================
# VENDOR PRICE / SUPPLY / SERVICE SCOPE SCHEMAS
# =========================================================================

class VendorPriceBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company Name")
    vendor_name: Optional[str] = Field(None, description="Vendor Name")
    product_name: Optional[str] = Field(None, description="Product Name or Code")
    sub_project_type: Optional[str] = Field(None, description="Sub Project Type")
    item_description: Optional[str] = Field(None, description="Item / Service description or UOM")
    vehicle_type: Optional[str] = Field(None, description="Vehicle Type (e.g. LCV, HCV)")
    vehicle_number: Optional[str] = Field(None, description="Vehicle Number")
    fuel_type: Optional[str] = Field(None, description="Fuel Type (e.g. Petrol, Diesel)")
    range_value: Optional[Union[Decimal, str, float, int]] = Field(None, description="Range Value / Capacity")
    rental_type: Optional[str] = Field(None, description="Rental Type (e.g. Daily, Monthly)")
    service_description: Optional[str] = Field(None, description="Service Description")
    from_date: Optional[Union[date, str]] = Field(None, description="Effective from date")
    to_date: Optional[Union[date, str]] = Field(None, description="Effective to date")
    rate: Optional[Union[Decimal, str, float, int]] = Field(None, description="Rate / Price")
    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")


class VendorPriceCreate(VendorPriceBase):
    # Frontend camelCase aliases
    vendorName: Optional[str] = None
    productName: Optional[str] = None
    subProjectType: Optional[str] = None
    itemDescription: Optional[str] = None
    vehicleType: Optional[str] = None
    vehicleNumber: Optional[str] = None
    fuelType: Optional[str] = None
    rangeValue: Optional[Union[Decimal, str, float, int]] = None
    rentalType: Optional[str] = None
    serviceDescription: Optional[str] = None
    fromDate: Optional[Union[date, str]] = None
    toDate: Optional[Union[date, str]] = None
    uom: Optional[str] = None
    price: Optional[Union[Decimal, str, float, int]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "vendorName": "vendor_name",
                "productName": "product_name",
                "subProjectType": "sub_project_type",
                "itemDescription": "item_description",
                "vehicleType": "vehicle_type",
                "vehicleNumber": "vehicle_number",
                "fuelType": "fuel_type",
                "rangeValue": "range_value",
                "rentalType": "rental_type",
                "serviceDescription": "service_description",
                "fromDate": "from_date",
                "toDate": "to_date",
            }
            for camel, snake in mapping.items():
                if camel in data and (data.get(snake) is None or data.get(snake) == ""):
                    data[snake] = data[camel]

            if "uom" in data and not data.get("item_description"):
                data["item_description"] = data["uom"]
            if "price" in data and not data.get("rate"):
                data["rate"] = data["price"]

            if "rate" in data:
                data["rate"] = parse_numeric_field(data["rate"])
            if "range_value" in data:
                data["range_value"] = parse_numeric_field(data["range_value"])
            if "from_date" in data:
                data["from_date"] = parse_date_field(data["from_date"])
            if "to_date" in data:
                data["to_date"] = parse_date_field(data["to_date"])
            if "status" in data:
                data["status"] = parse_status_field(data["status"])
        return data


class VendorPriceUpdate(BaseModel):
    company_name: Optional[str] = None
    vendor_name: Optional[str] = None
    product_name: Optional[str] = None
    sub_project_type: Optional[str] = None
    item_description: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    fuel_type: Optional[str] = None
    range_value: Optional[Union[Decimal, str, float, int]] = None
    rental_type: Optional[str] = None
    service_description: Optional[str] = None
    from_date: Optional[Union[date, str]] = None
    to_date: Optional[Union[date, str]] = None
    rate: Optional[Union[Decimal, str, float, int]] = None
    status: Optional[Union[str, bool]] = None

    # camelCase aliases
    vendorName: Optional[str] = None
    productName: Optional[str] = None
    subProjectType: Optional[str] = None
    itemDescription: Optional[str] = None
    vehicleType: Optional[str] = None
    vehicleNumber: Optional[str] = None
    fuelType: Optional[str] = None
    rangeValue: Optional[Union[Decimal, str, float, int]] = None
    rentalType: Optional[str] = None
    serviceDescription: Optional[str] = None
    fromDate: Optional[Union[date, str]] = None
    toDate: Optional[Union[date, str]] = None
    uom: Optional[str] = None
    price: Optional[Union[Decimal, str, float, int]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "vendorName": "vendor_name",
                "productName": "product_name",
                "subProjectType": "sub_project_type",
                "itemDescription": "item_description",
                "vehicleType": "vehicle_type",
                "vehicleNumber": "vehicle_number",
                "fuelType": "fuel_type",
                "rangeValue": "range_value",
                "rentalType": "rental_type",
                "serviceDescription": "service_description",
                "fromDate": "from_date",
                "toDate": "to_date",
            }
            for camel, snake in mapping.items():
                if camel in data and (data.get(snake) is None or data.get(snake) == ""):
                    data[snake] = data[camel]

            if "uom" in data and not data.get("item_description"):
                data["item_description"] = data["uom"]
            if "price" in data and not data.get("rate"):
                data["rate"] = data["price"]

            if "rate" in data and data["rate"] is not None:
                data["rate"] = parse_numeric_field(data["rate"])
            if "range_value" in data and data["range_value"] is not None:
                data["range_value"] = parse_numeric_field(data["range_value"])
            if "from_date" in data and data["from_date"] is not None:
                data["from_date"] = parse_date_field(data["from_date"])
            if "to_date" in data and data["to_date"] is not None:
                data["to_date"] = parse_date_field(data["to_date"])
            if "status" in data and data["status"] is not None:
                data["status"] = parse_status_field(data["status"])
        return data


class VendorPriceResponse(VendorPriceBase):
    vendor_service_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # camelCase convenience fields
    id: Optional[int] = None
    vendorName: Optional[str] = None
    productName: Optional[str] = None
    subProjectType: Optional[str] = None
    itemDescription: Optional[str] = None
    vehicleType: Optional[str] = None
    vehicleNumber: Optional[str] = None
    fuelType: Optional[str] = None
    rangeValue: Optional[Decimal] = None
    rentalType: Optional[str] = None
    serviceDescription: Optional[str] = None
    fromDate: Optional[str] = None
    toDate: Optional[str] = None
    uom: Optional[str] = None
    price: Optional[Decimal] = None

    @model_validator(mode="after")
    def populate_aliases(self) -> "VendorPriceResponse":
        self.id = self.vendor_service_id
        self.vendorName = self.vendor_name
        self.productName = self.product_name
        self.subProjectType = self.sub_project_type
        self.itemDescription = self.item_description
        self.vehicleType = self.vehicle_type
        self.vehicleNumber = self.vehicle_number
        self.fuelType = self.fuel_type
        self.rangeValue = self.range_value
        self.rentalType = self.rental_type
        self.serviceDescription = self.service_description
        self.fromDate = self.from_date.strftime("%d - %m - %Y") if self.from_date else None
        self.toDate = self.to_date.strftime("%d - %m - %Y") if self.to_date else None
        self.uom = self.item_description
        self.price = self.rate
        return self

    model_config = ConfigDict(from_attributes=True)


class VendorPriceListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[VendorPriceResponse]
