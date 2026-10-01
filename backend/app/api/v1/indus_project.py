from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.indus_project_service import IndusProjectService
from app.schemas.indus_project import (
    IndusProjectCreate, IndusProjectUpdate, IndusProjectResponse, IndusProjectListResponse,
    IndusProjectActivityCreate, IndusProjectActivityUpdate, IndusProjectActivityResponse, IndusProjectActivityListResponse,
    IndusProjectTransportCreate, IndusProjectTransportUpdate, IndusProjectTransportResponse, IndusProjectTransportListResponse,
    IndusProjectApprovalCreate, IndusProjectApprovalUpdate, IndusProjectApprovalResponse, IndusProjectApprovalListResponse
)

router = APIRouter(tags=["Customer - Indus Projects"])

# ==========================================
# 1. PROJECT MASTER ENDPOINTS
# ==========================================

@router.get("/customer/indus/projects", response_model=IndusProjectListResponse, summary="List Indus Projects")
@router.get("/indus/projects", response_model=IndusProjectListResponse, summary="List Indus Projects (Direct Alias)", include_in_schema=False)
def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search across project types, PM, SCM"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name"),
    project_type: Optional[str] = Query(None, description="Filter by project type"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("project_type_id", description="Column to sort by"),
    sort_desc: bool = Query(False, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_projects_list(
        page=page,
        page_size=page_size,
        search=search,
        customer_name=customer_name,
        project_type=project_type,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/customer/indus/projects/{project_type_id}", response_model=IndusProjectResponse, summary="Get Indus Project by ID")
@router.get("/indus/projects/{project_type_id}", response_model=IndusProjectResponse, summary="Get Indus Project by ID (Direct Alias)", include_in_schema=False)
def get_project(
    project_type_id: int = Path(..., ge=1, description="Primary key project_type_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_project_by_id(project_type_id)

@router.post("/customer/indus/projects", response_model=IndusProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Project")
@router.post("/indus/projects", response_model=IndusProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create Indus Project (Direct Alias)", include_in_schema=False)
def create_project(
    payload: IndusProjectCreate,
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.create_project(payload)

@router.put("/customer/indus/projects/{project_type_id}", response_model=IndusProjectResponse, summary="Update Indus Project")
@router.put("/indus/projects/{project_type_id}", response_model=IndusProjectResponse, summary="Update Indus Project (Direct Alias)", include_in_schema=False)
def update_project(
    payload: IndusProjectUpdate,
    project_type_id: int = Path(..., ge=1, description="Primary key project_type_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.update_project(project_type_id, payload)

@router.delete("/customer/indus/projects/{project_type_id}", summary="Delete Indus Project")
@router.delete("/indus/projects/{project_type_id}", summary="Delete Indus Project (Direct Alias)", include_in_schema=False)
def delete_project(
    project_type_id: int = Path(..., ge=1, description="Primary key project_type_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.delete_project(project_type_id)


# ==========================================
# 2. ACTIVITY DETAILS (VIEW ICON 1)
# ==========================================

@router.get("/customer/indus/projects/activities/list", response_model=IndusProjectActivityListResponse, summary="List Project Activities (Isolated)")
@router.get("/customer/indus/projects-activities", response_model=IndusProjectActivityListResponse, summary="List Project Activities (Alias)", include_in_schema=False)
@router.get("/customer/indus/project-activities", response_model=IndusProjectActivityListResponse, summary="List Project Activities (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-activities", response_model=IndusProjectActivityListResponse, summary="List Project Activities (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-activities", response_model=IndusProjectActivityListResponse, summary="List Project Activities (Singular Direct Alias)", include_in_schema=False)
def list_project_activities(
    project_type: Optional[str] = Query(None, description="Filter strictly by Project Type"),
    sub_project_type: Optional[str] = Query(None, description="Filter strictly by Sub Project Type"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_activities_list(
        project_type=project_type,
        sub_project_type=sub_project_type,
        stage=stage,
        search=search
    )

@router.get("/customer/indus/projects-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Get Project Activity by ID")
@router.get("/customer/indus/project-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Get Project Activity by ID (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Get Project Activity by ID (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Get Project Activity by ID (Singular Direct Alias)", include_in_schema=False)
def get_project_activity(
    item_id: int = Path(..., ge=1, description="Primary key id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_activity_by_id(item_id)

@router.post("/customer/indus/projects-activities", response_model=IndusProjectActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Activity")
@router.post("/customer/indus/project-activities", response_model=IndusProjectActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Activity (Singular Alias)", include_in_schema=False)
@router.post("/indus/projects-activities", response_model=IndusProjectActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Activity (Direct Alias)", include_in_schema=False)
@router.post("/indus/project-activities", response_model=IndusProjectActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Activity (Singular Direct Alias)", include_in_schema=False)
def create_project_activity(
    payload: IndusProjectActivityCreate,
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.create_activity(payload)

@router.put("/customer/indus/projects-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Update Project Activity")
@router.put("/customer/indus/project-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Update Project Activity (Singular Alias)", include_in_schema=False)
@router.put("/indus/projects-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Update Project Activity (Direct Alias)", include_in_schema=False)
@router.put("/indus/project-activities/{item_id}", response_model=IndusProjectActivityResponse, summary="Update Project Activity (Singular Direct Alias)", include_in_schema=False)
def update_project_activity(
    payload: IndusProjectActivityUpdate,
    item_id: int = Path(..., ge=1, description="Primary key id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.update_activity(item_id, payload)

@router.delete("/customer/indus/projects-activities/{item_id}", summary="Delete Project Activity")
@router.delete("/customer/indus/project-activities/{item_id}", summary="Delete Project Activity (Singular Alias)", include_in_schema=False)
@router.delete("/indus/projects-activities/{item_id}", summary="Delete Project Activity (Direct Alias)", include_in_schema=False)
@router.delete("/indus/project-activities/{item_id}", summary="Delete Project Activity (Singular Direct Alias)", include_in_schema=False)
def delete_project_activity(
    item_id: int = Path(..., ge=1, description="Primary key id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.delete_activity(item_id)


# ==========================================
# 3. TRANSPORT DETAILS (VIEW ICON 2)
# ==========================================

@router.get("/customer/indus/projects/transports/list", response_model=IndusProjectTransportListResponse, summary="List Project Additional Transports (Isolated)")
@router.get("/customer/indus/projects-transports", response_model=IndusProjectTransportListResponse, summary="List Project Additional Transports (Alias)", include_in_schema=False)
@router.get("/customer/indus/project-transports", response_model=IndusProjectTransportListResponse, summary="List Project Additional Transports (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-transports", response_model=IndusProjectTransportListResponse, summary="List Project Additional Transports (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-transports", response_model=IndusProjectTransportListResponse, summary="List Project Additional Transports (Singular Direct Alias)", include_in_schema=False)
def list_project_transports(
    project_type: Optional[str] = Query(None, description="Filter strictly by Project Type"),
    sub_project_type: Optional[str] = Query(None, description="Filter strictly by Sub Project Type"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_transports_list(
        project_type=project_type,
        sub_project_type=sub_project_type,
        customer_name=customer_name,
        status_filter=status,
        search=search
    )

@router.get("/customer/indus/projects-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Get Project Transport by ID")
@router.get("/customer/indus/project-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Get Project Transport by ID (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Get Project Transport by ID (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Get Project Transport by ID (Singular Direct Alias)", include_in_schema=False)
def get_project_transport(
    item_id: int = Path(..., ge=1, description="Primary key customer_project_item_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_transport_by_id(item_id)

@router.post("/customer/indus/projects-transports", response_model=IndusProjectTransportResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Transport")
@router.post("/customer/indus/project-transports", response_model=IndusProjectTransportResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Transport (Singular Alias)", include_in_schema=False)
@router.post("/indus/projects-transports", response_model=IndusProjectTransportResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Transport (Direct Alias)", include_in_schema=False)
@router.post("/indus/project-transports", response_model=IndusProjectTransportResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Transport (Singular Direct Alias)", include_in_schema=False)
def create_project_transport(
    payload: IndusProjectTransportCreate,
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.create_transport(payload)

@router.put("/customer/indus/projects-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Update Project Transport")
@router.put("/customer/indus/project-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Update Project Transport (Singular Alias)", include_in_schema=False)
@router.put("/indus/projects-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Update Project Transport (Direct Alias)", include_in_schema=False)
@router.put("/indus/project-transports/{item_id}", response_model=IndusProjectTransportResponse, summary="Update Project Transport (Singular Direct Alias)", include_in_schema=False)
def update_project_transport(
    payload: IndusProjectTransportUpdate,
    item_id: int = Path(..., ge=1, description="Primary key customer_project_item_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.update_transport(item_id, payload)

@router.delete("/customer/indus/projects-transports/{item_id}", summary="Delete Project Transport")
@router.delete("/customer/indus/project-transports/{item_id}", summary="Delete Project Transport (Singular Alias)", include_in_schema=False)
@router.delete("/indus/projects-transports/{item_id}", summary="Delete Project Transport (Direct Alias)", include_in_schema=False)
@router.delete("/indus/project-transports/{item_id}", summary="Delete Project Transport (Singular Direct Alias)", include_in_schema=False)
def delete_project_transport(
    item_id: int = Path(..., ge=1, description="Primary key customer_project_item_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.delete_transport(item_id)


# ==========================================
# 4. APPROVAL HISTORY / SUPPLY (VIEW ICON 3)
# ==========================================

@router.get("/customer/indus/projects/approvals/list", response_model=IndusProjectApprovalListResponse, summary="List Project Approval History (Isolated)")
@router.get("/customer/indus/projects-approvals", response_model=IndusProjectApprovalListResponse, summary="List Project Approval History (Alias)", include_in_schema=False)
@router.get("/customer/indus/project-approvals", response_model=IndusProjectApprovalListResponse, summary="List Project Approval History (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-approvals", response_model=IndusProjectApprovalListResponse, summary="List Project Approval History (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-approvals", response_model=IndusProjectApprovalListResponse, summary="List Project Approval History (Singular Direct Alias)", include_in_schema=False)
def list_project_approvals(
    sub_project_type: Optional[str] = Query(None, description="Filter strictly by Sub Project Type"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_approvals_list(
        sub_project_type=sub_project_type,
        customer_name=customer_name,
        search=search
    )

@router.get("/customer/indus/projects-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Get Project Approval History by ID")
@router.get("/customer/indus/project-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Get Project Approval History by ID (Singular Alias)", include_in_schema=False)
@router.get("/indus/projects-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Get Project Approval History by ID (Direct Alias)", include_in_schema=False)
@router.get("/indus/project-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Get Project Approval History by ID (Singular Direct Alias)", include_in_schema=False)
def get_project_approval(
    item_id: int = Path(..., ge=1, description="Primary key sub_project_type_detail_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.get_approval_by_id(item_id)

@router.post("/customer/indus/projects-approvals", response_model=IndusProjectApprovalResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Approval History")
@router.post("/customer/indus/project-approvals", response_model=IndusProjectApprovalResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Approval History (Singular Alias)", include_in_schema=False)
@router.post("/indus/projects-approvals", response_model=IndusProjectApprovalResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Approval History (Direct Alias)", include_in_schema=False)
@router.post("/indus/project-approvals", response_model=IndusProjectApprovalResponse, status_code=status.HTTP_201_CREATED, summary="Create Project Approval History (Singular Direct Alias)", include_in_schema=False)
def create_project_approval(
    payload: IndusProjectApprovalCreate,
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.create_approval(payload)

@router.put("/customer/indus/projects-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Update Project Approval History")
@router.put("/customer/indus/project-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Update Project Approval History (Singular Alias)", include_in_schema=False)
@router.put("/indus/projects-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Update Project Approval History (Direct Alias)", include_in_schema=False)
@router.put("/indus/project-approvals/{item_id}", response_model=IndusProjectApprovalResponse, summary="Update Project Approval History (Singular Direct Alias)", include_in_schema=False)
def update_project_approval(
    payload: IndusProjectApprovalUpdate,
    item_id: int = Path(..., ge=1, description="Primary key sub_project_type_detail_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.update_approval(item_id, payload)

@router.delete("/customer/indus/projects-approvals/{item_id}", summary="Delete Project Approval History")
@router.delete("/customer/indus/project-approvals/{item_id}", summary="Delete Project Approval History (Singular Alias)", include_in_schema=False)
@router.delete("/indus/projects-approvals/{item_id}", summary="Delete Project Approval History (Direct Alias)", include_in_schema=False)
@router.delete("/indus/project-approvals/{item_id}", summary="Delete Project Approval History (Singular Direct Alias)", include_in_schema=False)
def delete_project_approval(
    item_id: int = Path(..., ge=1, description="Primary key sub_project_type_detail_id"),
    db: Session = Depends(get_db)
):
    service = IndusProjectService(db)
    return service.delete_approval(item_id)
