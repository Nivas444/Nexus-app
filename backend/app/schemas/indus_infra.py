from typing import Optional, List, Union
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class IndusInfraBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    infra_category: Optional[str] = None
    infraCategory: Optional[str] = None
    infra_description: Optional[str] = None
    infraDescription: Optional[str] = None
    uom: Optional[str] = None
    make: Optional[str] = None
    commissioning: Optional[Union[date, str, bool]] = None
    i_map: Optional[str] = None
    iMap: Optional[str] = None
    status: Optional[str] = "Active"

class IndusInfraCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    infra_category: Optional[str] = None
    infraCategory: Optional[str] = None
    infra_description: Optional[str] = None
    infraDescription: Optional[str] = None
    uom: Optional[str] = None
    make: Optional[str] = None
    commissioning: Optional[Union[date, str, bool]] = None
    i_map: Optional[str] = None
    iMap: Optional[str] = None
    status: Optional[str] = "Active"

class IndusInfraUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    item_code: Optional[str] = None
    itemCode: Optional[str] = None
    infra_category: Optional[str] = None
    infraCategory: Optional[str] = None
    infra_description: Optional[str] = None
    infraDescription: Optional[str] = None
    uom: Optional[str] = None
    make: Optional[str] = None
    commissioning: Optional[Union[date, str, bool]] = None
    i_map: Optional[str] = None
    iMap: Optional[str] = None
    status: Optional[str] = None

class IndusInfraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_infrastructure_detail_id: int
    id: Optional[int] = None
    company_name: Optional[str] = "Nexus"
    customer_name: Optional[str] = "Indus Tower Ltd"
    item_code: Optional[str] = None
    infra_category: Optional[str] = None
    infra_description: Optional[str] = None
    uom: Optional[str] = None
    make: Optional[str] = None
    commissioning: Optional[str] = None
    i_map: Optional[str] = None
    status: Optional[str] = "Active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # UI compatibility aliases
    customerName: Optional[str] = None
    infraCategory: Optional[str] = None
    infraDescription: Optional[str] = None
    iMap: Optional[str] = None

class IndusInfraListResponse(BaseModel):
    items: List[IndusInfraResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
