from typing import Optional, List, Union
from datetime import date
from pydantic import BaseModel, ConfigDict

class IndusEshBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Indus Tower Ltd"
    companyName: Optional[str] = None
    serviceVendorName: Optional[str] = None
    name: Optional[str] = None
    employee_type: Optional[str] = "On-Roll"
    employeeType: Optional[str] = None
    aadhar_number: Optional[str] = None
    aadharNumber: Optional[str] = None
    training_type: Optional[str] = "CHCTE"
    trainingType: Optional[str] = None
    training_id_number: Optional[str] = None
    trainingIdNumber: Optional[str] = None
    training_agency: Optional[str] = None
    trainingAgency: Optional[str] = None
    expiry_date: Optional[Union[date, str]] = None
    expiryDate: Optional[Union[date, str]] = None
    status: Optional[str] = "Active"

class IndusEshCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    serviceVendorName: Optional[str] = None
    name: Optional[str] = None
    employee_type: Optional[str] = None
    employeeType: Optional[str] = None
    aadhar_number: Optional[str] = None
    aadharNumber: Optional[str] = None
    training_type: Optional[str] = None
    trainingType: Optional[str] = None
    training_id_number: Optional[str] = None
    trainingIdNumber: Optional[str] = None
    training_agency: Optional[str] = None
    trainingAgency: Optional[str] = None
    expiry_date: Optional[Union[date, str]] = None
    expiryDate: Optional[Union[date, str]] = None
    status: Optional[str] = "Active"

class IndusEshUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    serviceVendorName: Optional[str] = None
    name: Optional[str] = None
    employee_type: Optional[str] = None
    employeeType: Optional[str] = None
    aadhar_number: Optional[str] = None
    aadharNumber: Optional[str] = None
    training_type: Optional[str] = None
    trainingType: Optional[str] = None
    training_id_number: Optional[str] = None
    trainingIdNumber: Optional[str] = None
    training_agency: Optional[str] = None
    trainingAgency: Optional[str] = None
    expiry_date: Optional[Union[date, str]] = None
    expiryDate: Optional[Union[date, str]] = None
    status: Optional[str] = None

class IndusEshResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    name: str
    employee_type: Optional[str] = None
    aadhar_number: Optional[str] = None
    training_type: Optional[str] = None
    training_id_number: Optional[str] = None
    training_agency: Optional[str] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = "Active"

    # UI compatibility aliases
    companyName: Optional[str] = None
    serviceVendorName: Optional[str] = None
    employeeType: Optional[str] = None
    aadharNumber: Optional[str] = None
    trainingType: Optional[str] = None
    trainingIdNumber: Optional[str] = None
    trainingAgency: Optional[str] = None
    expiryDate: Optional[str] = None

class IndusEshListResponse(BaseModel):
    items: List[IndusEshResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
