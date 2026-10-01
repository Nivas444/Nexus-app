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

class IndusSiteContactItem(BaseModel):
    id: Optional[str] = Field(None, description="Contact slot ID, e.g., 'SC-FSE' or 'SC-AOM'")
    name: Optional[str] = None
    designation: Optional[str] = None
    contact: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = "Active"
    site_id: Optional[int] = None
    site_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def reconcile_contact_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "contact" in data and not data.get("contact_number"):
                data["contact_number"] = data["contact"]
            if "contact_number" in data and not data.get("contact"):
                data["contact"] = data["contact_number"]
        return data

class IndusSiteBase(BaseModel):
    site_code: Optional[str] = Field(None, description="Unique Site ID / Code")
    wh_id: Optional[str] = Field(None, description="Warehouse ID")
    site_name: Optional[str] = Field(None, description="Unique Site Name")
    tower_type: Optional[str] = Field(None, description="Tower Type: GBT / RTT / Pole")
    district: Optional[str] = Field(None, description="District")
    town: Optional[str] = Field(None, description="Town / City")
    address: Optional[str] = Field(None, description="Site Address")
    latitude: Optional[Union[Decimal, float, str]] = Field(None, description="Latitude")
    longitude: Optional[Union[Decimal, float, str]] = Field(None, description="Longitude")
    transport_zone: Optional[str] = Field(None, description="Transport Zone")
    fse_name: Optional[str] = Field(None, description="Field Service Engineer Name")
    fse_contact_number: Optional[str] = Field(None, description="Field Service Engineer Contact")
    fse_email: Optional[str] = Field(None, description="Field Service Engineer Email")
    aom_name: Optional[str] = Field(None, description="Area Operations Manager Name")
    aom_contact_number: Optional[str] = Field(None, description="Area Operations Manager Contact")
    aom_email: Optional[str] = Field(None, description="Area Operations Manager Email")
    status: Optional[Union[str, bool]] = Field("Active", description="Active or In - Active")
    company_name: Optional[str] = Field("Nexus", description="Company Name")
    customer_name: Optional[str] = Field("Indus Tower Ltd", description="Customer Name")

class IndusSiteCreate(IndusSiteBase):
    siteId: Optional[str] = None
    siteCode: Optional[str] = None
    whId: Optional[str] = None
    siteName: Optional[str] = None
    towerType: Optional[str] = None
    transportZone: Optional[str] = None
    fseName: Optional[str] = None
    fseContactNumber: Optional[str] = None
    fseContact: Optional[str] = None
    fseEmail: Optional[str] = None
    aomName: Optional[str] = None
    aomContactNumber: Optional[str] = None
    aomContact: Optional[str] = None
    aomEmail: Optional[str] = None
    contacts: Optional[List[IndusSiteContactItem]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_camel_case(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "siteId" in data and not data.get("site_code"):
                data["site_code"] = data["siteId"]
            if "siteCode" in data and not data.get("site_code"):
                data["site_code"] = data["siteCode"]
            if "whId" in data and not data.get("wh_id"):
                data["wh_id"] = data["whId"]
            if "siteName" in data and not data.get("site_name"):
                data["site_name"] = data["siteName"]
            if "towerType" in data and not data.get("tower_type"):
                data["tower_type"] = data["towerType"]
            if "transportZone" in data and not data.get("transport_zone"):
                data["transport_zone"] = data["transportZone"]
            if "fseName" in data and not data.get("fse_name"):
                data["fse_name"] = data["fseName"]
            if "fseContactNumber" in data and not data.get("fse_contact_number"):
                data["fse_contact_number"] = data["fseContactNumber"]
            if "fseContact" in data and not data.get("fse_contact_number"):
                data["fse_contact_number"] = data["fseContact"]
            if "fseEmail" in data and not data.get("fse_email"):
                data["fse_email"] = data["fseEmail"]
            if "aomName" in data and not data.get("aom_name"):
                data["aom_name"] = data["aomName"]
            if "aomContactNumber" in data and not data.get("aom_contact_number"):
                data["aom_contact_number"] = data["aomContactNumber"]
            if "aomContact" in data and not data.get("aom_contact_number"):
                data["aom_contact_number"] = data["aomContact"]
            if "aomEmail" in data and not data.get("aom_email"):
                data["aom_email"] = data["aomEmail"]

            # If contacts list is passed, extract FSE and AOM from it
            contacts_list = data.get("contacts")
            if contacts_list and isinstance(contacts_list, list):
                for item in contacts_list:
                    if not isinstance(item, dict):
                        continue
                    desig = str(item.get("designation") or "").lower()
                    cid = str(item.get("id") or "").upper()
                    cname = item.get("name")
                    cphone = item.get("contact") or item.get("contact_number")
                    cemail = item.get("email")
                    
                    if "engineer" in desig or "fse" in desig or cid == "SC-FSE" or cid == "1":
                        if cname and not data.get("fse_name"):
                            data["fse_name"] = cname
                        if cphone and not data.get("fse_contact_number"):
                            data["fse_contact_number"] = cphone
                        if cemail and not data.get("fse_email"):
                            data["fse_email"] = cemail
                    elif "officer" in desig or "manager" in desig or "aom" in desig or cid == "SC-AOM" or cid == "2":
                        if cname and not data.get("aom_name"):
                            data["aom_name"] = cname
                        if cphone and not data.get("aom_contact_number"):
                            data["aom_contact_number"] = cphone
                        if cemail and not data.get("aom_email"):
                            data["aom_email"] = cemail
        return data

class IndusSiteUpdate(IndusSiteCreate):
    pass

class IndusSiteContactSave(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    designation: Optional[str] = None
    contact: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = "Active"

    @model_validator(mode="before")
    @classmethod
    def reconcile_contact_save(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "contact" in data and not data.get("contact_number"):
                data["contact_number"] = data["contact"]
            if "contact_number" in data and not data.get("contact"):
                data["contact"] = data["contact_number"]
        return data

class IndusSiteResponse(BaseModel):
    id: int = Field(..., description="Site primary key ID")
    site_id: int = Field(..., description="Site primary key ID")
    site_code: Optional[str] = None
    siteCode: Optional[str] = None
    siteId: Optional[str] = None
    wh_id: Optional[str] = None
    whId: Optional[str] = None
    site_name: Optional[str] = None
    siteName: Optional[str] = None
    tower_type: Optional[str] = None
    towerType: Optional[str] = None
    district: Optional[str] = None
    town: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    transport_zone: Optional[str] = None
    transportZone: Optional[str] = None
    fse_name: Optional[str] = None
    fse_contact_number: Optional[str] = None
    fse_email: Optional[str] = None
    aom_name: Optional[str] = None
    aom_contact_number: Optional[str] = None
    aom_email: Optional[str] = None
    status: str = "Active"
    company_name: Optional[str] = None
    customer_name: Optional[str] = None
    contacts: List[IndusSiteContactItem] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class IndusSiteListResponse(BaseModel):
    total: int
    items: List[IndusSiteResponse]
    page: int = 1
    page_size: int = 50

class IndusSiteContactListResponse(BaseModel):
    total: int
    items: List[IndusSiteContactItem]
