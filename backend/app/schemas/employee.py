from datetime import datetime, date
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

def parse_date_field(val: Any) -> Optional[date]:
    """Helper to parse date from string (YYYY-MM-DD or DD - MM - YYYY)."""
    if not val:
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        # Try YYYY-MM-DD
        try:
            return datetime.strptime(val, "%Y-%m-%d").date()
        except ValueError:
            pass
        # Try DD - MM - YYYY or DD-MM-YYYY
        try:
            cleaned = val.replace(" ", "")
            return datetime.strptime(cleaned, "%d-%m-%Y").date()
        except ValueError:
            pass
        try:
            return datetime.fromisoformat(val).date()
        except Exception:
            return None
    return None

def parse_experience_field(val: Any) -> Optional[Decimal]:
    """Helper to parse experience numeric or YYYY - MM to Decimal years."""
    if val is None or val == "":
        return None
    if isinstance(val, (int, float, Decimal)):
        return Decimal(str(val))
    if isinstance(val, str):
        val_str = val.strip()
        if not val_str:
            return None
        # Check format "02 - 00" or "02-00" (Years - Months)
        if "-" in val_str:
            parts = [p.strip() for p in val_str.split("-")]
            if len(parts) == 2:
                try:
                    years = float(parts[0])
                    months = float(parts[1])
                    total = years + (months / 12.0)
                    return Decimal(str(round(total, 2)))
                except ValueError:
                    pass
        try:
            return Decimal(val_str)
        except Exception:
            return None
    return None


class CompanyEmployeeDocumentMetadata(BaseModel):
    id: int
    employee_id: int
    document_type: str
    file_name: str
    mime_type: str
    file_size: int
    uploaded_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompanyEmployeeBase(BaseModel):
    company_name: Optional[str] = Field("Nexus", description="Company name")
    photo: Optional[str] = Field(None, description="Photo file path or name")
    employee_type: Optional[str] = Field("On-Roll", description="Employee Type: On-Roll / Contract")
    designation: Optional[str] = Field(None, description="Employee designation")
    employee_code: Optional[str] = Field(None, description="Unique Employee ID / Code")
    id_card: Optional[str] = Field(None, description="ID Card details")
    employee_name: Optional[str] = Field(None, description="Employee Name")
    address: Optional[str] = Field(None, description="Address")
    mobile_number: Optional[str] = Field(None, description="Mobile / Contact number")
    email: Optional[str] = Field(None, description="Email address")
    dob: Optional[Union[date, str]] = Field(None, description="Date of birth")
    blood_group: Optional[str] = Field(None, description="Blood Group")
    marital_status: Optional[str] = Field(None, description="Marital Status")
    qualification: Optional[str] = Field(None, description="Educational Qualification")
    pan_number: Optional[str] = Field(None, description="PAN Number")
    aadhaar_number: Optional[str] = Field(None, description="Aadhaar Number")
    dl_number: Optional[str] = Field(None, description="Driving License Number")
    passport_number: Optional[str] = Field(None, description="Passport Number")
    epf_available: Optional[bool] = Field(False, description="EPF Available")
    epf_uan: Optional[str] = Field(None, description="EPF UAN Number")
    esi_code_available: Optional[bool] = Field(False, description="ESI Available")
    esi_code: Optional[str] = Field(None, description="ESI Code / ID")
    medical_insurance_available: Optional[bool] = Field(False, description="Medical Insurance Available")
    medical_insurance_policy_number: Optional[str] = Field(None, description="Medical Insurance Policy Number")
    previous_experience: Optional[Union[Decimal, float, str]] = Field(None, description="Previous Experience")
    current_experience: Optional[Union[Decimal, float, str]] = Field(None, description="Current Experience")
    total_experience: Optional[Union[Decimal, float, str]] = Field(None, description="Total Experience")
    doj: Optional[Union[date, str]] = Field(None, description="Date of joining")
    bio_data: Optional[str] = Field(None, description="Bio data")
    appointment_letter: Optional[str] = Field(None, description="Appointment letter")
    relieving_letter: Optional[str] = Field(None, description="Relieving letter")
    experience_certificate: Optional[str] = Field(None, description="Experience certificate")
    geo_attendance: Optional[bool] = Field(False, description="Geo Attendance Toggle")
    status: Optional[Union[str, bool]] = Field("Active", description="Status: Active / In - Active")
    e_signature: Optional[str] = Field(None, description="E-Signature")


class CompanyEmployeeCreate(CompanyEmployeeBase):
    # Frontend camelCase aliases
    employeeName: Optional[str] = None
    employeeId: Optional[str] = None
    empId: Optional[str] = None
    empType: Optional[str] = None
    employeeType: Optional[str] = None
    contactNumber: Optional[str] = None
    mobileNumber: Optional[str] = None
    bloodGroup: Optional[str] = None
    maritalStatus: Optional[str] = None
    pan: Optional[str] = None
    aadhar: Optional[str] = None
    aadhaar: Optional[str] = None
    drivingLicense: Optional[str] = None
    passportNumber: Optional[str] = None
    epfUan: Optional[str] = None
    esiId: Optional[str] = None
    esiCode: Optional[str] = None
    prevExp: Optional[Union[str, float]] = None
    currentExp: Optional[Union[str, float]] = None
    totalExp: Optional[Union[str, float]] = None
    geoAttendance: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "employeeName" in data and not data.get("employee_name"):
                data["employee_name"] = data["employeeName"]
            if "employeeId" in data and not data.get("employee_code"):
                data["employee_code"] = data["employeeId"]
            if "empId" in data and not data.get("employee_code"):
                data["employee_code"] = data["empId"]
            if "empType" in data and not data.get("employee_type"):
                data["employee_type"] = data["empType"]
            if "employeeType" in data and not data.get("employee_type"):
                data["employee_type"] = data["employeeType"]
            if "contactNumber" in data and not data.get("mobile_number"):
                data["mobile_number"] = data["contactNumber"]
            if "mobileNumber" in data and not data.get("mobile_number"):
                data["mobile_number"] = data["mobileNumber"]
            if "bloodGroup" in data and not data.get("blood_group"):
                data["blood_group"] = data["bloodGroup"]
            if "maritalStatus" in data and not data.get("marital_status"):
                data["marital_status"] = data["maritalStatus"]
            if "pan" in data and not data.get("pan_number"):
                data["pan_number"] = data["pan"]
            if "aadhar" in data and not data.get("aadhaar_number"):
                data["aadhaar_number"] = data["aadhar"]
            if "aadhaar" in data and not data.get("aadhaar_number"):
                data["aadhaar_number"] = data["aadhaar"]
            if "drivingLicense" in data and not data.get("dl_number"):
                data["dl_number"] = data["drivingLicense"]
            if "passportNumber" in data and not data.get("passport_number"):
                data["passport_number"] = data["passportNumber"]
            if "epfUan" in data and not data.get("epf_uan"):
                data["epf_uan"] = data["epfUan"]
            if "esiId" in data and not data.get("esi_code"):
                data["esi_code"] = data["esiId"]
            if "esiCode" in data and not data.get("esi_code"):
                data["esi_code"] = data["esiCode"]
            if "prevExp" in data and not data.get("previous_experience"):
                data["previous_experience"] = data["prevExp"]
            if "currentExp" in data and not data.get("current_experience"):
                data["current_experience"] = data["currentExp"]
            if "totalExp" in data and not data.get("total_experience"):
                data["total_experience"] = data["totalExp"]
            if "geoAttendance" in data and "geo_attendance" not in data:
                data["geo_attendance"] = data["geoAttendance"]

            # Auto-set flags if values provided
            if data.get("epf_uan"):
                data["epf_available"] = True
            if data.get("esi_code"):
                data["esi_code_available"] = True

            if "status" in data:
                data["status"] = parse_status_field(data["status"])

            # Clean and sanitize strings
            for field in ["employee_name", "employee_code", "designation", "email", "address", "mobile_number", "pan_number", "aadhaar_number", "dl_number", "passport_number", "epf_uan", "esi_code", "qualification"]:
                if field in data and isinstance(data[field], str):
                    data[field] = data[field].strip() or None

        return data


class CompanyEmployeeUpdate(BaseModel):
    company_name: Optional[str] = None
    photo: Optional[str] = None
    employee_type: Optional[str] = None
    designation: Optional[str] = None
    employee_code: Optional[str] = None
    id_card: Optional[str] = None
    employee_name: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[Union[date, str]] = None
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    qualification: Optional[str] = None
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    dl_number: Optional[str] = None
    passport_number: Optional[str] = None
    epf_available: Optional[bool] = None
    epf_uan: Optional[str] = None
    esi_code_available: Optional[bool] = None
    esi_code: Optional[str] = None
    medical_insurance_available: Optional[bool] = None
    medical_insurance_policy_number: Optional[str] = None
    previous_experience: Optional[Union[Decimal, float, str]] = None
    current_experience: Optional[Union[Decimal, float, str]] = None
    total_experience: Optional[Union[Decimal, float, str]] = None
    doj: Optional[Union[date, str]] = None
    geo_attendance: Optional[bool] = None
    status: Optional[Union[str, bool]] = None

    # camelCase aliases
    employeeName: Optional[str] = None
    employeeId: Optional[str] = None
    empId: Optional[str] = None
    empType: Optional[str] = None
    employeeType: Optional[str] = None
    contactNumber: Optional[str] = None
    mobileNumber: Optional[str] = None
    bloodGroup: Optional[str] = None
    maritalStatus: Optional[str] = None
    pan: Optional[str] = None
    aadhar: Optional[str] = None
    aadhaar: Optional[str] = None
    drivingLicense: Optional[str] = None
    passportNumber: Optional[str] = None
    epfUan: Optional[str] = None
    esiId: Optional[str] = None
    esiCode: Optional[str] = None
    prevExp: Optional[Union[str, float]] = None
    currentExp: Optional[Union[str, float]] = None
    totalExp: Optional[Union[str, float]] = None
    geoAttendance: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "employeeName" in data and "employee_name" not in data:
                data["employee_name"] = data["employeeName"]
            if "employeeId" in data and "employee_code" not in data:
                data["employee_code"] = data["employeeId"]
            if "empId" in data and "employee_code" not in data:
                data["employee_code"] = data["empId"]
            if "empType" in data and "employee_type" not in data:
                data["employee_type"] = data["empType"]
            if "employeeType" in data and "employee_type" not in data:
                data["employee_type"] = data["employeeType"]
            if "contactNumber" in data and "mobile_number" not in data:
                data["mobile_number"] = data["contactNumber"]
            if "mobileNumber" in data and "mobile_number" not in data:
                data["mobile_number"] = data["mobileNumber"]
            if "bloodGroup" in data and "blood_group" not in data:
                data["blood_group"] = data["bloodGroup"]
            if "maritalStatus" in data and "marital_status" not in data:
                data["marital_status"] = data["maritalStatus"]
            if "pan" in data and "pan_number" not in data:
                data["pan_number"] = data["pan"]
            if "aadhar" in data and "aadhaar_number" not in data:
                data["aadhaar_number"] = data["aadhar"]
            if "aadhaar" in data and "aadhaar_number" not in data:
                data["aadhaar_number"] = data["aadhaar"]
            if "drivingLicense" in data and "dl_number" not in data:
                data["dl_number"] = data["drivingLicense"]
            if "passportNumber" in data and "passport_number" not in data:
                data["passport_number"] = data["passportNumber"]
            if "epfUan" in data and "epf_uan" not in data:
                data["epf_uan"] = data["epfUan"]
            if "esiId" in data and "esi_code" not in data:
                data["esi_code"] = data["esiId"]
            if "esiCode" in data and "esi_code" not in data:
                data["esi_code"] = data["esiCode"]
            if "prevExp" in data and "previous_experience" not in data:
                data["previous_experience"] = data["prevExp"]
            if "currentExp" in data and "current_experience" not in data:
                data["current_experience"] = data["currentExp"]
            if "totalExp" in data and "total_experience" not in data:
                data["total_experience"] = data["totalExp"]
            if "geoAttendance" in data and "geo_attendance" not in data:
                data["geo_attendance"] = data["geoAttendance"]

            if "status" in data:
                data["status"] = parse_status_field(data["status"])

        return data


class CompanyEmployeeStatusUpdate(BaseModel):
    status: Union[str, bool] = Field(..., description="Active or In - Active")

    @model_validator(mode="before")
    @classmethod
    def reconcile(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "status" in data:
                data["status"] = parse_status_field(data["status"])
        return data


class CompanyEmployeeResponse(BaseModel):
    employee_id: int
    id: int = Field(..., description="Frontend ID alias")
    company_name: Optional[str] = None
    photo: Optional[str] = None
    employee_type: Optional[str] = "On-Roll"
    empType: Optional[str] = None
    designation: Optional[str] = None
    employee_code: Optional[str] = None
    employeeId: Optional[str] = None
    id_card: Optional[str] = None
    employee_name: Optional[str] = None
    employeeName: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    contactNumber: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[date] = None
    blood_group: Optional[str] = None
    bloodGroup: Optional[str] = None
    marital_status: Optional[str] = None
    maritalStatus: Optional[str] = None
    qualification: Optional[str] = None
    qualification_documents: Optional[str] = None
    pan_number: Optional[str] = None
    pan: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhar: Optional[str] = None
    dl_number: Optional[str] = None
    drivingLicense: Optional[str] = None
    passport_number: Optional[str] = None
    passportNumber: Optional[str] = None
    epf_available: Optional[bool] = False
    epf_uan: Optional[str] = None
    epfUan: Optional[str] = None
    esi_code_available: Optional[bool] = False
    esi_code: Optional[str] = None
    esiId: Optional[str] = None
    esiCode: Optional[str] = None
    medical_insurance_available: Optional[bool] = False
    medical_insurance_policy_number: Optional[str] = None
    previous_experience: Optional[Decimal] = None
    prevExp: Optional[str] = None
    current_experience: Optional[Decimal] = None
    currentExp: Optional[str] = None
    total_experience: Optional[Decimal] = None
    totalExp: Optional[str] = None
    doj: Optional[date] = None
    geo_attendance: Optional[bool] = False
    geoAttendance: Optional[bool] = False
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    documents: List[CompanyEmployeeDocumentMetadata] = []

    model_config = ConfigDict(from_attributes=True)


class CompanyEmployeeListResponse(BaseModel):
    items: List[CompanyEmployeeResponse]
    total: int
    skip: int = 0
    limit: int = 100
