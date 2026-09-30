from datetime import datetime as dt_datetime, date as dt_date
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


def parse_sub_status(val: Any) -> str:
    """Helper to standardize status to 'Active' or 'De-Active' / 'In - Active'."""
    if isinstance(val, bool):
        return "Active" if val else "De-Active"
    if isinstance(val, str):
        cleaned = val.strip().lower()
        if "in" in cleaned or "de" in cleaned or "inactive" in cleaned or "false" in cleaned:
            return "De-Active"
        return "Active"
    return "Active"


def parse_sub_date(val: Any) -> Optional[dt_date]:
    """Helper to parse date from string (YYYY-MM-DD, DD - MM - YYYY, or DD-MM-YYYY)."""
    if not val:
        return None
    if isinstance(val, dt_date):
        return val
    if isinstance(val, str):
        val_str = val.strip()
        if not val_str:
            return None
        # Try YYYY-MM-DD
        try:
            return dt_datetime.strptime(val_str, "%Y-%m-%d").date()
        except ValueError:
            pass
        # Try DD - MM - YYYY or DD-MM-YYYY
        try:
            cleaned = val_str.replace(" ", "")
            return dt_datetime.strptime(cleaned, "%d-%m-%Y").date()
        except ValueError:
            pass
        try:
            return dt_datetime.fromisoformat(val_str).date()
        except Exception:
            return None
    return None


def parse_sub_decimal(val: Any, default: Decimal = Decimal("0.00")) -> Decimal:
    """Helper to parse numeric value to Decimal safely."""
    if val is None or val == "":
        return default
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        cleaned = val.replace(",", "").strip()
        if not cleaned:
            return default
        try:
            return Decimal(cleaned)
        except Exception:
            return default
    return default


# ==============================================================================
# Bank Details Schemas
# ==============================================================================

class EmployeeBankDocumentMetadata(BaseModel):
    id: int
    bank_detail_id: int
    document_type: str
    file_name: str
    mime_type: str
    file_size: int
    uploaded_at: Optional[dt_datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EmployeeBankDetailBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company name")
    employee_id: Optional[str] = Field(None, description="Employee Code or ID")
    employee_name: Optional[str] = Field(None, description="Employee / Responsible Name")
    account_name: Optional[str] = Field(None, description="Account Name")
    account_number: Optional[str] = Field(None, description="Account Number")
    account_type: Optional[str] = Field("Savings", description="Account Type")
    bank_name: Optional[str] = Field(None, description="Bank Name")
    ifsc_code: Optional[str] = Field(None, description="IFSC Code")
    cancelled_cheque: Optional[str] = Field(None, description="Cancelled Cheque file name")
    status: Optional[str] = Field("Active", description="Status (Active / De-Active)")


class EmployeeBankDetailCreate(EmployeeBankDetailBase):
    @model_validator(mode="before")
    @classmethod
    def map_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map camelCase frontend fields
            if "accountName" in data and "account_name" not in data:
                data["account_name"] = data.get("accountName")
            if "accountNumber" in data and "account_number" not in data:
                data["account_number"] = data.get("accountNumber")
            if "accountType" in data and "account_type" not in data:
                data["account_type"] = data.get("accountType")
            if "bankName" in data and "bank_name" not in data:
                data["bank_name"] = data.get("bankName")
            if "ifscCode" in data and "ifsc_code" not in data:
                data["ifsc_code"] = data.get("ifscCode")
            if "responsible" in data and "employee_name" not in data:
                data["employee_name"] = data.get("responsible")
            if "status" in data:
                data["status"] = parse_sub_status(data.get("status"))
        return data


class EmployeeBankDetailUpdate(BaseModel):
    company_name: Optional[str] = None
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    cancelled_cheque: Optional[str] = None
    status: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def map_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "accountName" in data and "account_name" not in data:
                data["account_name"] = data.get("accountName")
            if "accountNumber" in data and "account_number" not in data:
                data["account_number"] = data.get("accountNumber")
            if "accountType" in data and "account_type" not in data:
                data["account_type"] = data.get("accountType")
            if "bankName" in data and "bank_name" not in data:
                data["bank_name"] = data.get("bankName")
            if "ifscCode" in data and "ifsc_code" not in data:
                data["ifsc_code"] = data.get("ifscCode")
            if "responsible" in data and "employee_name" not in data:
                data["employee_name"] = data.get("responsible")
            if "status" in data:
                data["status"] = parse_sub_status(data.get("status"))
        return data


class EmployeeBankDetailResponse(EmployeeBankDetailBase):
    employee_bank_account_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None
    has_document: bool = False
    document_name: Optional[str] = None

    # Aliases for frontend compatibility
    id: Optional[int] = None
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    ifscCode: Optional[str] = None
    responsible: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def populate_aliases(self) -> "EmployeeBankDetailResponse":
        self.id = self.employee_bank_account_id
        self.accountName = self.account_name
        self.accountNumber = self.account_number
        self.bankName = self.bank_name
        self.ifscCode = self.ifsc_code
        self.responsible = self.employee_name
        return self


# ==============================================================================
# Asset Details Schemas
# ==============================================================================

class EmployeeAssetDetailBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company name")
    employee_id: Optional[str] = Field(None, description="Employee Code or ID")
    employee_name: Optional[str] = Field(None, description="Employee Name")
    date: Optional[Union[dt_date, str]] = Field(None, description="Asset assignment date")
    asset_details: Optional[str] = Field(None, description="Asset description / details")
    serial_number: Optional[str] = Field(None, description="Asset Serial Number")
    uom: Optional[str] = Field("Nos", description="Unit of measurement")
    qty: Optional[Union[Decimal, float, int, str]] = Field(Decimal("1.00"), description="Quantity")
    rate: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Rate per unit")
    amount: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Total amount")
    expiry_date: Optional[Union[dt_date, str]] = Field(None, description="Expiry date")
    returned_status: Optional[str] = Field(None, description="Returned status")
    returned_date: Optional[Union[dt_date, str]] = Field(None, description="Returned date")


class EmployeeAssetDetailCreate(EmployeeAssetDetailBase):
    @model_validator(mode="before")
    @classmethod
    def map_and_parse(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "assetDetails" in data and "asset_details" not in data:
                data["asset_details"] = data.get("assetDetails")
            if "serialNumber" in data and "serial_number" not in data:
                data["serial_number"] = data.get("serialNumber")
            if "expiryDate" in data and "expiry_date" not in data:
                data["expiry_date"] = data.get("expiryDate")
            if "returnedStatus" in data and "returned_status" not in data:
                data["returned_status"] = data.get("returnedStatus")
            if "returnedDate" in data and "returned_date" not in data:
                data["returned_date"] = data.get("returnedDate")

            # Parse dates
            if "date" in data:
                data["date"] = parse_sub_date(data.get("date"))
            if "expiry_date" in data:
                data["expiry_date"] = parse_sub_date(data.get("expiry_date"))
            if "returned_date" in data:
                data["returned_date"] = parse_sub_date(data.get("returned_date"))

            # Calculate amount if not provided or parse numeric
            qty = parse_sub_decimal(data.get("qty"), Decimal("1.00"))
            rate = parse_sub_decimal(data.get("rate"), Decimal("0.00"))
            amt = parse_sub_decimal(data.get("amount"), Decimal("0.00"))
            if amt == Decimal("0.00") and rate > Decimal("0.00"):
                amt = qty * rate
            data["qty"] = qty
            data["rate"] = rate
            data["amount"] = amt
        return data


class EmployeeAssetDetailResponse(BaseModel):
    asset_id: int
    company_name: Optional[str] = "Nexus"
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    date: Optional[dt_date] = None
    asset_details: Optional[str] = None
    serial_number: Optional[str] = None
    uom: Optional[str] = "Nos"
    qty: Optional[Decimal] = Decimal("1.00")
    rate: Optional[Decimal] = Decimal("0.00")
    amount: Optional[Decimal] = Decimal("0.00")
    expiry_date: Optional[dt_date] = None
    returned_status: Optional[str] = None
    returned_date: Optional[dt_date] = None
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None

    # Aliases
    id: Optional[int] = None
    assetDetails: Optional[str] = None
    serialNumber: Optional[str] = None
    expiryDate: Optional[dt_date] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def populate_aliases(self) -> "EmployeeAssetDetailResponse":
        self.id = self.asset_id
        self.assetDetails = self.asset_details
        self.serialNumber = self.serial_number
        self.expiryDate = self.expiry_date
        return self


class EmployeeAssetTotalResponse(BaseModel):
    total_amount: Decimal = Decimal("0.00")
    formatted_total: str = "0.00"
    item_count: int = 0


# ==============================================================================
# Salary Details Schemas
# ==============================================================================

class EmployeeSalaryDetailBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company name")
    url: Optional[str] = Field(None, description="Document URL or reference")
    employee_id: Optional[str] = Field(None, description="Employee Code or ID")
    employee_name: Optional[str] = Field(None, description="Employee Name")
    from_date: Optional[Union[dt_date, str]] = Field(None, description="Start date of salary structure")
    to_date: Optional[Union[dt_date, str]] = Field(None, description="End date of salary structure")
    gross_salary: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Gross Salary")
    basic_salary: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Basic Salary")
    hra: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="House Rent Allowance")
    da: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Dearness Allowance")
    sa: Optional[Union[Decimal, float, int, str]] = Field(Decimal("0.00"), description="Special Allowance")
    status: Optional[str] = Field("Active", description="Status (Active / De-Active)")


class EmployeeSalaryDetailCreate(EmployeeSalaryDetailBase):
    @model_validator(mode="before")
    @classmethod
    def map_and_parse(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "fromDate" in data and "from_date" not in data:
                data["from_date"] = data.get("fromDate")
            if "toDate" in data and "to_date" not in data:
                data["to_date"] = data.get("toDate")
            if "grossSalary" in data and "gross_salary" not in data:
                data["gross_salary"] = data.get("grossSalary")
            if "basicSalary" in data and "basic_salary" not in data:
                data["basic_salary"] = data.get("basicSalary")

            if "from_date" in data:
                data["from_date"] = parse_sub_date(data.get("from_date"))
            if "to_date" in data:
                data["to_date"] = parse_sub_date(data.get("to_date"))

            # Calculate breakdown if gross given and sub-fields not given
            gross = parse_sub_decimal(data.get("gross_salary") or data.get("gross"), Decimal("0.00"))
            basic = parse_sub_decimal(data.get("basic_salary") or data.get("basic"), Decimal("0.00"))
            hra = parse_sub_decimal(data.get("hra"), Decimal("0.00"))
            da = parse_sub_decimal(data.get("da"), Decimal("0.00"))
            sa = parse_sub_decimal(data.get("sa"), Decimal("0.00"))

            if gross > Decimal("0.00") and basic == Decimal("0.00"):
                basic = (gross * Decimal("0.55")).quantize(Decimal("0.01"))
                hra = (gross * Decimal("0.25")).quantize(Decimal("0.01"))
                da = (gross * Decimal("0.12")).quantize(Decimal("0.01"))
                sa = (gross * Decimal("0.08")).quantize(Decimal("0.01"))

            data["gross_salary"] = gross
            data["basic_salary"] = basic
            data["hra"] = hra
            data["da"] = da
            data["sa"] = sa

            if "status" in data:
                data["status"] = parse_sub_status(data.get("status"))
        return data


class EmployeeSalaryDetailResponse(BaseModel):
    salary_id: int
    company_name: Optional[str] = "Nexus"
    url: Optional[str] = None
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    from_date: Optional[dt_date] = None
    to_date: Optional[dt_date] = None
    gross_salary: Optional[Decimal] = Decimal("0.00")
    basic_salary: Optional[Decimal] = Decimal("0.00")
    hra: Optional[Decimal] = Decimal("0.00")
    da: Optional[Decimal] = Decimal("0.00")
    sa: Optional[Decimal] = Decimal("0.00")
    status: Optional[str] = "Active"
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None

    # Aliases
    id: Optional[int] = None
    fromDate: Optional[dt_date] = None
    toDate: Optional[dt_date] = None
    grossSalary: Optional[Decimal] = None
    basicSalary: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def populate_aliases(self) -> "EmployeeSalaryDetailResponse":
        self.id = self.salary_id
        self.fromDate = self.from_date
        self.toDate = self.to_date
        self.grossSalary = self.gross_salary
        self.basicSalary = self.basic_salary
        return self
