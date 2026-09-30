from datetime import datetime as dt_datetime, date as dt_date
from decimal import Decimal
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

ALLOWED_COMPLIANCE_TYPES = [
    "EPF",
    "ESI",
    "PT",
    "LWF",
    "TDS",
    "Leave",
    "Bonus",
    "Medical Insurance"
]

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
        if not val or val.lower() in ("none", "null", "undefined", ""):
            return None
        # Clean potential spaces around hyphens/slashes
        cleaned = val.replace(" - ", "-").replace(" / ", "/").replace(" . ", ".")
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y", "%Y/%m/%d"):
            try:
                return dt_datetime.strptime(cleaned, fmt).date()
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
        cleaned = (
            val.replace(",", "")
            .replace("₹", "")
            .replace("$", "")
            .replace("%", "")
            .replace("Days", "")
            .replace("days", "")
            .replace("/ Month", "")
            .strip()
        )
        if not cleaned or cleaned.upper() in ("NA", "N/A", "NONE", "NULL"):
            return None
        try:
            return Decimal(cleaned)
        except Exception:
            return None
    return None

class HRComplianceBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company short name or identifier")
    compliance_type: str = Field(..., description="HR Compliance Type (EPF, ESI, PT, LWF, TDS, Leave, Bonus, Medical Insurance)")
    from_date: Optional[dt_date] = None
    to_date: Optional[dt_date] = None
    gross_salary: Optional[Decimal] = None
    basic_da_sa: Optional[Decimal] = None

    # EPF Specific
    epf_filling_frequency: Optional[str] = None
    epf_filling_due_date: Optional[dt_date] = None
    epf_sealing_amount: Optional[Decimal] = None
    epf_employee_contribution: Optional[Decimal] = None
    epf_employer_contribution: Optional[Decimal] = None
    eps_employer_contribution: Optional[Decimal] = None
    edli_employer_contribution: Optional[Decimal] = None
    epf_admin_charges: Optional[Decimal] = None
    epf_status: Optional[str] = "Active"

    # ESI Specific
    esi_filling_frequency: Optional[str] = None
    esi_filling_date: Optional[dt_date] = None
    esi_sealing_amount: Optional[Decimal] = None
    esi_employee_contribution: Optional[Decimal] = None
    esi_employer_contribution: Optional[Decimal] = None
    esi_status: Optional[str] = "Active"

    # PT Specific
    state: Optional[str] = None
    pt_filling_frequency: Optional[str] = None
    pt_filling_due_date: Optional[dt_date] = None
    pt_employee_deduction: Optional[Decimal] = None
    pt_status: Optional[str] = "Active"

    # LWF Specific
    lwf_filling_frequency: Optional[str] = None
    lwf_filling_due_date: Optional[dt_date] = None
    lwf_employee_contribution: Optional[Decimal] = None
    lwf_employer_contribution: Optional[Decimal] = None
    lwf_status: Optional[str] = "Active"

    # TDS Specific
    gross_salary_from: Optional[Decimal] = None
    gross_salary_to: Optional[Decimal] = None
    tds_standard_deduction: Optional[Decimal] = None
    section_87a_rebate: Optional[Decimal] = None
    taxable_salary: Optional[Decimal] = None
    tds_deduction_amount: Optional[Decimal] = None
    tds_deduction_percentage: Optional[Decimal] = None
    health_and_education_cess: Optional[Decimal] = None
    tds_status: Optional[str] = "Active"

    # Leave Specific
    cl_available: Optional[Decimal] = None
    cl_eligible: Optional[Decimal] = None
    cl_can_claim: Optional[Decimal] = None
    sl_available: Optional[Decimal] = None
    sl_eligible: Optional[Decimal] = None
    sl_can_claim: Optional[Decimal] = None
    el_available: Optional[Decimal] = None
    el_eligible: Optional[Decimal] = None
    el_can_claim: Optional[Decimal] = None
    ml_available: Optional[Decimal] = None
    ml_eligible: Optional[Decimal] = None
    sandwich_leave_policy: Optional[str] = None
    leave_status: Optional[str] = "Active"

    # Bonus Specific
    bonus_type: Optional[str] = None
    statutory_bonus_sealing_amount: Optional[Decimal] = None
    statutory_bonus: Optional[Decimal] = None
    performance_bonus: Optional[Decimal] = None
    company_bonus: Optional[Decimal] = None
    bonus_status: Optional[str] = "Active"

    # Leave helper
    leave_type: Optional[str] = None

    # Medical Insurance Specific
    medical_insurance_company_name: Optional[str] = None
    medical_insurance_employee_contribution: Optional[Decimal] = None
    medical_insurance_employer_contribution: Optional[Decimal] = None
    medical_insurance_status: Optional[str] = "Active"

    @model_validator(mode="before")
    @classmethod
    def handle_compliance_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync bonus_type to state or vice versa
            if data.get("bonus_type") and not data.get("state"):
                data["state"] = data["bonus_type"]
            elif data.get("state") and not data.get("bonus_type") and data.get("compliance_type") == "Bonus":
                data["bonus_type"] = data["state"]

            # Sync leave_type
            if data.get("leave_type") and not data.get("state"):
                data["state"] = data["leave_type"]

            # Normalize sandwich leave policy
            if "sandwich_leave_policy" in data and data["sandwich_leave_policy"] is not None:
                val = str(data["sandwich_leave_policy"]).strip()
                if val.lower() in ("yes", "true", "1"):
                    data["sandwich_leave_policy"] = "Yes"
                elif val.lower() in ("no", "false", "0"):
                    data["sandwich_leave_policy"] = "No"
                else:
                    data["sandwich_leave_policy"] = val

            # Sync bonus values based on bonus_type
            b_type = data.get("bonus_type") or data.get("state")
            if b_type == "Performance Bonus":
                if data.get("statutory_bonus") is not None and data.get("performance_bonus") is None:
                    data["performance_bonus"] = data["statutory_bonus"]
        return data

    @field_validator("compliance_type")
    @classmethod
    def validate_compliance_type(cls, val: str) -> str:
        if not val or val.strip() not in ALLOWED_COMPLIANCE_TYPES:
            raise ValueError(
                f"Invalid compliance_type '{val}'. Must be one of: {', '.join(ALLOWED_COMPLIANCE_TYPES)}"
            )
        return val.strip()

    @field_validator("sandwich_leave_policy", mode="before")
    @classmethod
    def validate_sandwich_leave_policy(cls, val: Any) -> Optional[str]:
        if val is None or val == "":
            return None
        s = str(val).strip()
        if s.lower() in ("yes", "true", "1"):
            return "Yes"
        if s.lower() in ("no", "false", "0"):
            return "No"
        return s

    @field_validator("from_date", "to_date", "epf_filling_due_date", "esi_filling_date", "pt_filling_due_date", "lwf_filling_due_date", mode="before")
    @classmethod
    def parse_all_dates(cls, val: Any) -> Optional[dt_date]:
        return parse_date_field(val)

    @field_validator(
        "gross_salary", "basic_da_sa", "epf_sealing_amount", "epf_employee_contribution",
        "epf_employer_contribution", "eps_employer_contribution", "edli_employer_contribution",
        "epf_admin_charges", "esi_sealing_amount", "esi_employee_contribution", "esi_employer_contribution",
        "pt_employee_deduction", "lwf_employee_contribution", "lwf_employer_contribution",
        "gross_salary_from", "gross_salary_to", "tds_standard_deduction", "section_87a_rebate",
        "taxable_salary", "tds_deduction_amount", "tds_deduction_percentage", "health_and_education_cess",
        "cl_available", "cl_eligible", "cl_can_claim", "sl_available", "sl_eligible", "sl_can_claim",
        "el_available", "el_eligible", "el_can_claim", "ml_available", "ml_eligible",
        "statutory_bonus_sealing_amount", "statutory_bonus", "performance_bonus", "company_bonus",
        "medical_insurance_employee_contribution", "medical_insurance_employer_contribution",
        mode="before"
    )
    @classmethod
    def parse_all_numerics(cls, val: Any) -> Optional[Decimal]:
        return parse_numeric_field(val)

class HRComplianceCreate(HRComplianceBase):
    pass

class HRComplianceResponse(HRComplianceBase):
    model_config = ConfigDict(from_attributes=True)

    compliance_id: int
    created_at: Optional[dt_datetime] = None
    updated_at: Optional[dt_datetime] = None

class HRComplianceListResponse(BaseModel):
    items: List[HRComplianceResponse]
    total: int
