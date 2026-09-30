from datetime import datetime as dt_datetime, date as dt_date
from decimal import Decimal
from typing import Optional, List, Union, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


def parse_boolean_field(val: Any) -> bool:
    """Helper to parse boolean values from 'Yes'/'No', 'true'/'false', 1/0."""
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.strip().lower() in ("yes", "true", "1", "t", "y")
    if isinstance(val, (int, float)):
        return bool(val)
    return False


def parse_date_field(val: Any) -> Optional[dt_date]:
    """Helper to parse date fields safely from string or date."""
    if not val:
        return None
    if isinstance(val, dt_date) and not isinstance(val, dt_datetime):
        return val
    if isinstance(val, dt_datetime):
        return val.date()
    if isinstance(val, str):
        val = val.strip()
        if not val or val.lower() == "none" or val.lower() == "null":
            return None
        # Try common formats
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return dt_datetime.strptime(val, fmt).date()
            except ValueError:
                pass
    return None


def parse_numeric_field(val: Any) -> Optional[Decimal]:
    """Helper to convert string/numeric values to Decimal safely."""
    if val is None or val == "":
        return None
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        cleaned = val.replace(",", "").replace("₹", "").replace("$", "").strip()
        if not cleaned:
            return None
        try:
            return Decimal(cleaned)
        except Exception:
            return None
    return None


# =========================================================================
# Company Master Details Schemas
# =========================================================================
class CompanyMasterDetailsBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company short name or identifier")
    company_legal_name: Optional[str] = Field(None, description="Company registered legal name")
    entity_type: Optional[str] = Field(None, description="Entity type, e.g. Private Limited")
    industry: Optional[str] = Field(None, description="Industry sector")
    state: Optional[str] = Field(None, description="State of registration")
    state_multi_state: Optional[bool] = Field(False)

    logo: Optional[str] = Field(None)
    logo_file: Optional[str] = Field(None)
    logo_edit: Optional[bool] = Field(False)
    logo_multi_state: Optional[bool] = Field(False)

    hex_color_code: Optional[str] = Field(None)
    hex_color_code_edit: Optional[bool] = Field(False)
    hex_color_code_multi_state: Optional[bool] = Field(False)

    digital_stamp_file: Optional[str] = Field(None)
    digital_stamp_edit: Optional[bool] = Field(False)
    digital_stamp_multi_state: Optional[bool] = Field(False)

    dsc_file: Optional[str] = Field(None)
    dsc_multi_state: Optional[bool] = Field(False)

    ssl_certificate_file: Optional[str] = Field(None)
    ssl_certificate_multi_state: Optional[bool] = Field(False)

    e_signature_file: Optional[str] = Field(None)
    e_signature_multi_state: Optional[bool] = Field(False)

    registered_documents: Optional[str] = Field(None)
    registered_documents_file: Optional[str] = Field(None)
    registered_documents_edit: Optional[bool] = Field(False)
    registered_documents_multi_state: Optional[bool] = Field(False)

    registered_address: Optional[str] = Field(None)
    address_documents: Optional[str] = Field(None)
    registered_address_edit: Optional[bool] = Field(False)
    registered_address_multi_state: Optional[bool] = Field(False)

    pan_number: Optional[str] = Field(None)
    pan_documents_file: Optional[str] = Field(None)
    pan_documents_edit: Optional[bool] = Field(False)
    pan_multi_state: Optional[bool] = Field(False)

    gst_code: Optional[str] = Field(None)
    gst_documents: Optional[str] = Field(None)
    gst_edit: Optional[bool] = Field(False)
    gst_multi_state: Optional[bool] = Field(False)

    tan_number: Optional[str] = Field(None)
    tan_documents: Optional[str] = Field(None)
    tan_documents_edit: Optional[bool] = Field(False)
    tan_multi_state: Optional[bool] = Field(False)

    udyam_code_available: Optional[bool] = Field(False)
    udyam_code: Optional[str] = Field(None)
    udyam_documents: Optional[str] = Field(None)
    udyam_code_edit: Optional[bool] = Field(False)
    udyam_code_multi_state: Optional[bool] = Field(False)

    epf_code_available: Optional[bool] = Field(False)
    epf_documents: Optional[str] = Field(None)
    epf_code: Optional[str] = Field(None)
    epf_edit: Optional[bool] = Field(False)
    epf_multi_state: Optional[bool] = Field(False)

    esi_code_available: Optional[bool] = Field(False)
    esi_code: Optional[str] = Field(None)
    esi_documents: Optional[str] = Field(None)
    esi_code_edit: Optional[bool] = Field(False)
    esi_code_multi_state: Optional[bool] = Field(False)

    ptec_code_available: Optional[bool] = Field(False)
    ptec_code: Optional[str] = Field(None)
    ptec_documents: Optional[str] = Field(None)
    ptec_code_edit: Optional[bool] = Field(False)
    ptec_multi_state: Optional[bool] = Field(False)

    lwf_code_available: Optional[bool] = Field(False)
    lwf_code: Optional[str] = Field(None)
    lwf_documents: Optional[str] = Field(None)
    lwf_code_edit: Optional[bool] = Field(False)
    lwf_multi_state: Optional[bool] = Field(False)

    establishment_registration_code_available: Optional[bool] = Field(False)
    establishment_registration_code: Optional[str] = Field(None)
    establishment_registration_documents: Optional[str] = Field(None)
    establishment_registration_code_edit: Optional[bool] = Field(False)
    establishment_registration_code_multi_state: Optional[bool] = Field(False)

    iso_certificate_available: Optional[bool] = Field(False)
    iso_certificate_number: Optional[str] = Field(None)
    iso_certificate_documents: Optional[str] = Field(None)
    iso_certificate_multi_state: Optional[bool] = Field(False)
    iso_certificate_edit: Optional[bool] = Field(False)

    osha_certificate_available: Optional[bool] = Field(False)
    osha_certificate_number: Optional[str] = Field(None)
    osha_certificate_documents: Optional[str] = Field(None)
    osha_certificate_multi_state: Optional[bool] = Field(False)
    osha_certificate_edit: Optional[bool] = Field(False)

    e_invoice: Optional[bool] = Field(False)
    e_invoice_multi_state: Optional[bool] = Field(False)
    e_invoice_edit: Optional[bool] = Field(False)


class CompanyMasterDetailsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    company_name: Optional[str] = None
    company_legal_name: Optional[str] = None
    entity_type: Optional[str] = None
    industry: Optional[str] = None
    state: Optional[str] = None
    state_multi_state: Optional[bool] = None

    logo: Optional[str] = None
    logo_file: Optional[str] = None
    logo_edit: Optional[bool] = None
    logo_multi_state: Optional[bool] = None

    hex_color_code: Optional[str] = None
    hex_color_code_edit: Optional[bool] = None
    hex_color_code_multi_state: Optional[bool] = None

    digital_stamp_file: Optional[str] = None
    digital_stamp_edit: Optional[bool] = None
    digital_stamp_multi_state: Optional[bool] = None

    dsc_file: Optional[str] = None
    dsc_multi_state: Optional[bool] = None

    ssl_certificate_file: Optional[str] = None
    ssl_certificate_multi_state: Optional[bool] = None

    e_signature_file: Optional[str] = None
    e_signature_multi_state: Optional[bool] = None

    registered_documents: Optional[str] = None
    registered_documents_file: Optional[str] = None
    registered_documents_edit: Optional[bool] = None
    registered_documents_multi_state: Optional[bool] = None

    registered_address: Optional[str] = None
    address_documents: Optional[str] = None
    registered_address_edit: Optional[bool] = None
    registered_address_multi_state: Optional[bool] = None

    pan_number: Optional[str] = None
    pan_documents_file: Optional[str] = None
    pan_documents_edit: Optional[bool] = None
    pan_multi_state: Optional[bool] = None

    gst_code: Optional[str] = None
    gst_documents: Optional[str] = None
    gst_edit: Optional[bool] = None
    gst_multi_state: Optional[bool] = None

    tan_number: Optional[str] = None
    tan_documents: Optional[str] = None
    tan_documents_edit: Optional[bool] = None
    tan_multi_state: Optional[bool] = None

    udyam_code_available: Optional[bool] = None
    udyam_code: Optional[str] = None
    udyam_documents: Optional[str] = None
    udyam_code_edit: Optional[bool] = None
    udyam_code_multi_state: Optional[bool] = None

    epf_code_available: Optional[bool] = None
    epf_documents: Optional[str] = None
    epf_code: Optional[str] = None
    epf_edit: Optional[bool] = None
    epf_multi_state: Optional[bool] = None

    esi_code_available: Optional[bool] = None
    esi_code: Optional[str] = None
    esi_documents: Optional[str] = None
    esi_code_edit: Optional[bool] = None
    esi_code_multi_state: Optional[bool] = None

    ptec_code_available: Optional[bool] = None
    ptec_code: Optional[str] = None
    ptec_documents: Optional[str] = None
    ptec_code_edit: Optional[bool] = None
    ptec_multi_state: Optional[bool] = None

    lwf_code_available: Optional[bool] = None
    lwf_code: Optional[str] = None
    lwf_documents: Optional[str] = None
    lwf_code_edit: Optional[bool] = None
    lwf_multi_state: Optional[bool] = None

    establishment_registration_code_available: Optional[bool] = None
    establishment_registration_code: Optional[str] = None
    establishment_registration_documents: Optional[str] = None
    establishment_registration_code_edit: Optional[bool] = None
    establishment_registration_code_multi_state: Optional[bool] = None

    iso_certificate_available: Optional[bool] = None
    iso_certificate_number: Optional[str] = None
    iso_certificate_documents: Optional[str] = None
    iso_certificate_multi_state: Optional[bool] = None
    iso_certificate_edit: Optional[bool] = None

    osha_certificate_available: Optional[bool] = None
    osha_certificate_number: Optional[str] = None
    osha_certificate_documents: Optional[str] = None
    osha_certificate_multi_state: Optional[bool] = None
    osha_certificate_edit: Optional[bool] = None

    e_invoice: Optional[bool] = None
    e_invoice_multi_state: Optional[bool] = None
    e_invoice_edit: Optional[bool] = None


class CompanyMasterDetailsResponse(CompanyMasterDetailsBase):
    model_config = ConfigDict(from_attributes=True)

    company_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None


# =========================================================================
# Company Bank Account Schemas
# =========================================================================
class CompanyBankAccountBase(BaseModel):
    company_name: Optional[str] = Field("Nexus")
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    cancelled_cheque: Optional[str] = None
    responsible: Optional[str] = None
    connected_banking: Optional[bool] = False
    status: Optional[str] = "Active"


class CompanyBankAccountCreate(CompanyBankAccountBase):
    account_name: str
    account_number: str
    bank_name: str
    ifsc_code: str


class CompanyBankAccountUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    account_name: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    cancelled_cheque: Optional[str] = None
    responsible: Optional[str] = None
    connected_banking: Optional[bool] = None
    status: Optional[str] = None


class CompanyBankAccountResponse(CompanyBankAccountBase):
    model_config = ConfigDict(from_attributes=True)

    bank_account_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None


# =========================================================================
# Company Office Location Schemas
# =========================================================================
class CompanyOfficeLocationBase(BaseModel):
    company_name: Optional[str] = Field("Nexus")
    office_code: Optional[str] = None
    office_name: Optional[str] = None
    address: Optional[str] = None
    address_documents: Optional[str] = None
    address_documents_edit: Optional[bool] = False
    gst_registered: Optional[bool] = False
    company_gst_documents: Optional[str] = None
    gst_edit: Optional[bool] = False
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    in_charge: Optional[str] = None
    eb_sc_number: Optional[str] = None
    ll_name: Optional[str] = None
    ll_contact_number: Optional[str] = None
    from_date: Optional[dt_date] = None
    to_date: Optional[dt_date] = None
    rental_amount: Optional[Decimal] = None
    status: Optional[str] = "Active"

    @model_validator(mode="before")
    @classmethod
    def parse_complex_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "from_date" in data:
                data["from_date"] = parse_date_field(data["from_date"])
            if "to_date" in data:
                data["to_date"] = parse_date_field(data["to_date"])
            if "rental_amount" in data:
                data["rental_amount"] = parse_numeric_field(data["rental_amount"])
            if "latitude" in data:
                data["latitude"] = parse_numeric_field(data["latitude"])
            if "longitude" in data:
                data["longitude"] = parse_numeric_field(data["longitude"])
            if "gst_registered" in data:
                data["gst_registered"] = parse_boolean_field(data["gst_registered"])
            if "address_documents_edit" in data:
                data["address_documents_edit"] = parse_boolean_field(data["address_documents_edit"])
            if "gst_edit" in data:
                data["gst_edit"] = parse_boolean_field(data["gst_edit"])
        return data


class CompanyOfficeLocationCreate(CompanyOfficeLocationBase):
    office_name: str


class CompanyOfficeLocationUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    office_code: Optional[str] = None
    office_name: Optional[str] = None
    address: Optional[str] = None
    address_documents: Optional[str] = None
    address_documents_edit: Optional[bool] = None
    gst_registered: Optional[bool] = None
    company_gst_documents: Optional[str] = None
    gst_edit: Optional[bool] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    in_charge: Optional[str] = None
    eb_sc_number: Optional[str] = None
    ll_name: Optional[str] = None
    ll_contact_number: Optional[str] = None
    from_date: Optional[dt_date] = None
    to_date: Optional[dt_date] = None
    rental_amount: Optional[Decimal] = None
    status: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def parse_complex_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "from_date" in data:
                data["from_date"] = parse_date_field(data["from_date"])
            if "to_date" in data:
                data["to_date"] = parse_date_field(data["to_date"])
            if "rental_amount" in data:
                data["rental_amount"] = parse_numeric_field(data["rental_amount"])
            if "latitude" in data:
                data["latitude"] = parse_numeric_field(data["latitude"])
            if "longitude" in data:
                data["longitude"] = parse_numeric_field(data["longitude"])
            if "gst_registered" in data and data["gst_registered"] is not None:
                data["gst_registered"] = parse_boolean_field(data["gst_registered"])
            if "address_documents_edit" in data and data["address_documents_edit"] is not None:
                data["address_documents_edit"] = parse_boolean_field(data["address_documents_edit"])
            if "gst_edit" in data and data["gst_edit"] is not None:
                data["gst_edit"] = parse_boolean_field(data["gst_edit"])
        return data


class CompanyOfficeLocationResponse(CompanyOfficeLocationBase):
    model_config = ConfigDict(from_attributes=True)

    office_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None


# =========================================================================
# Company Holiday Schemas
# =========================================================================
MONTH_NAME_TO_INT = {
    "january": 1, "jan": 1, "1": 1,
    "february": 2, "feb": 2, "2": 2,
    "march": 3, "mar": 3, "3": 3,
    "april": 4, "apr": 4, "4": 4,
    "may": 5, "5": 5,
    "june": 6, "jun": 6, "6": 6,
    "july": 7, "jul": 7, "7": 7,
    "august": 8, "aug": 8, "8": 8,
    "september": 9, "sep": 9, "sept": 9, "9": 9,
    "october": 10, "oct": 10, "10": 10,
    "november": 11, "nov": 11, "11": 11,
    "december": 12, "dec": 12, "12": 12
}


class CompanyHolidayBase(BaseModel):
    company_name: Optional[str] = Field("Nexus")
    year: Optional[int] = None
    month: Optional[str] = None
    date: Optional[Union[dt_date, int, str]] = None
    day: Optional[str] = None
    holiday_name: Optional[str] = None
    status: Optional[str] = "Active"

    @model_validator(mode="before")
    @classmethod
    def parse_holiday_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            raw_date = data.get("date")
            raw_year = data.get("year")
            raw_month = data.get("month")

            # Try parsing raw_date as a full date first
            parsed_d = parse_date_field(raw_date)
            if parsed_d:
                data["date"] = parsed_d
                if not raw_year:
                    data["year"] = parsed_d.year
                if not raw_month:
                    data["month"] = parsed_d.strftime("%B")
            elif raw_date is not None and str(raw_date).isdigit():
                # Day of month number
                day_num = int(str(raw_date))
                year_num = int(raw_year) if raw_year and str(raw_year).isdigit() else 2026
                month_num = 1
                if raw_month:
                    month_num = MONTH_NAME_TO_INT.get(str(raw_month).strip().lower(), 1)
                try:
                    data["date"] = dt_date(year_num, month_num, day_num)
                except Exception:
                    data["date"] = None
        return data


class CompanyHolidayCreate(CompanyHolidayBase):
    holiday_name: str


class CompanyHolidayResponse(CompanyHolidayBase):
    model_config = ConfigDict(from_attributes=True)

    holiday_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None

