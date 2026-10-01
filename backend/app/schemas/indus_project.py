from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# ==========================================
# 1. PROJECT TYPE MASTER SCHEMAS
# ==========================================
class IndusProjectBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    upgradation_type: Optional[str] = None
    upgradationType: Optional[str] = None
    tat: Optional[Union[float, int, str]] = None
    indus_pm: Optional[str] = None
    indusPm: Optional[str] = None
    indus_scm: Optional[str] = None
    indusScm: Optional[str] = None
    pm: Optional[str] = None
    survey: Optional[str] = "Yes"
    additional_transport: Optional[Union[float, int, str]] = None
    additionalTransport: Optional[Union[float, int, str]] = None
    status: Optional[str] = "Active"

class IndusProjectCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    upgradation_type: Optional[str] = None
    upgradationType: Optional[str] = None
    tat: Optional[Union[float, int, str]] = None
    indus_pm: Optional[str] = None
    indusPm: Optional[str] = None
    indus_scm: Optional[str] = None
    indusScm: Optional[str] = None
    pm: Optional[str] = None
    survey: Optional[str] = "Yes"
    additional_transport: Optional[Union[float, int, str]] = None
    additionalTransport: Optional[Union[float, int, str]] = None
    status: Optional[str] = "Active"

class IndusProjectUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    upgradation_type: Optional[str] = None
    upgradationType: Optional[str] = None
    tat: Optional[Union[float, int, str]] = None
    indus_pm: Optional[str] = None
    indusPm: Optional[str] = None
    indus_scm: Optional[str] = None
    indusScm: Optional[str] = None
    pm: Optional[str] = None
    survey: Optional[str] = None
    additional_transport: Optional[Union[float, int, str]] = None
    additionalTransport: Optional[Union[float, int, str]] = None
    status: Optional[str] = None

class IndusProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_type_id: int
    id: Optional[int] = None
    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    project_type: Optional[str] = None
    sub_project_type: Optional[str] = None
    upgradation_type: Optional[str] = None
    tat: Optional[str] = None
    indus_pm: Optional[str] = None
    indus_scm: Optional[str] = None
    pm: Optional[str] = None
    survey: Optional[str] = "Yes"
    additional_transport: Optional[str] = "Yes"
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # UI compatibility aliases
    companyName: Optional[str] = None
    customerName: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None
    upgradationType: Optional[str] = None
    indusPm: Optional[str] = None
    indusScm: Optional[str] = None
    additionalTransport: Optional[str] = None

class IndusProjectListResponse(BaseModel):
    items: List[IndusProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==========================================
# 2. ACTIVITY SCHEMAS
# ==========================================
class IndusProjectActivityBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    stage: Optional[str] = None
    activity: Optional[str] = None
    days: Optional[Union[int, str]] = None

class IndusProjectActivityCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    stage: Optional[str] = None
    activity: Optional[str] = None
    days: Optional[Union[int, str]] = 0

class IndusProjectActivityUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    stage: Optional[str] = None
    activity: Optional[str] = None
    days: Optional[Union[int, str]] = None

class IndusProjectActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: Optional[str] = "Nexus"
    project_type: Optional[str] = None
    sub_project_type: Optional[str] = None
    stage: Optional[str] = None
    activity: Optional[str] = None
    days: Optional[str] = None

    # Aliases
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None

class IndusProjectActivityListResponse(BaseModel):
    items: List[IndusProjectActivityResponse]
    total: int


# ==========================================
# 3. TRANSPORT SCHEMAS
# ==========================================
class IndusProjectTransportBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    item_description: Optional[str] = None
    itemDescription: Optional[str] = None
    transport_zone: Optional[str] = None
    transportZone: Optional[str] = None
    qty: Optional[Union[float, int, str]] = None
    status: Optional[str] = "Active"

class IndusProjectTransportCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    item_description: Optional[str] = None
    itemDescription: Optional[str] = None
    transport_zone: Optional[str] = None
    transportZone: Optional[str] = None
    qty: Optional[Union[float, int, str]] = 1
    status: Optional[str] = "Active"

class IndusProjectTransportUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    project_type: Optional[str] = None
    projectType: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    item_description: Optional[str] = None
    itemDescription: Optional[str] = None
    transport_zone: Optional[str] = None
    transportZone: Optional[str] = None
    qty: Optional[Union[float, int, str]] = None
    status: Optional[str] = None

class IndusProjectTransportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_project_item_id: int
    id: Optional[int] = None
    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    project_type: Optional[str] = None
    sub_project_type: Optional[str] = None
    item_code: Optional[str] = None
    item_description: Optional[str] = None
    transport_zone: Optional[str] = None
    qty: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # UI compatibility aliases
    itemCode: Optional[str] = None
    itemDescription: Optional[str] = None
    transportZone: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None

class IndusProjectTransportListResponse(BaseModel):
    items: List[IndusProjectTransportResponse]
    total: int


# ==========================================
# 4. APPROVAL HISTORY / DOCUMENT SCHEMAS
# ==========================================
class IndusProjectApprovalBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    description: Optional[str] = None
    observation: Optional[str] = None
    remarks: Optional[str] = None

class IndusProjectApprovalCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    companyName: Optional[str] = None
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    description: Optional[str] = None
    observation: Optional[str] = None
    remarks: Optional[str] = None

class IndusProjectApprovalUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    companyName: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    sub_project_type: Optional[str] = None
    subProjectType: Optional[str] = None
    description: Optional[str] = None
    observation: Optional[str] = None
    remarks: Optional[str] = None

class IndusProjectApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sub_project_type_detail_id: int
    id: Optional[int] = None
    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    sub_project_type: Optional[str] = None
    description: Optional[str] = None
    observation: Optional[str] = None
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Aliases
    subProjectType: Optional[str] = None

class IndusProjectApprovalListResponse(BaseModel):
    items: List[IndusProjectApprovalResponse]
    total: int
