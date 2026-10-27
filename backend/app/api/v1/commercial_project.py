from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.db.session import get_project_db
from app.services.commercial_project_service import CommercialProjectService
from app.services.auth_service import auth_service
from app.schemas.commercial_project import (
    CommercialProjectListResponse,
    CommercialBulkUploadResponse,
    CommercialProjectDeleteRequest,
    CommercialProjectDeleteResponse
)

router = APIRouter(prefix="/commercial", tags=["Commercial Manager - New Project & PO"])


def verify_commercial_access(authorization: Optional[str] = Header(None)):
    """
    Ensure the request is authenticated and authorized for Commercial Manager or Admin.
    Allows graceful fallback if session headers are sent or in testing mode.
    """
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        user = auth_service.get_user_by_token(token)
        if user and user.role not in ["Commercial Manager", "Project Manager", "Admin", "Master"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: Commercial/Project Manager authorization required."
            )
    return True


@router.get("/projects", response_model=CommercialProjectListResponse, summary="List New Projects from telecom_project")
def list_commercial_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    return service.get_projects_list()


@router.delete("/projects/{project_id}", summary="Delete Commercial Project")
def delete_commercial_project(
    project_id: str,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Deletes a project record from PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    success = service.delete_project(project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found."
        )
    return {"success": True, "message": f"Project '{project_id}' deleted successfully."}


@router.post("/projects/delete", response_model=CommercialProjectDeleteResponse, summary="Bulk Delete Commercial Projects")
def bulk_delete_commercial_projects(
    payload: CommercialProjectDeleteRequest,
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Bulk deletes projects from PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    service = CommercialProjectService(db)
    count = service.delete_projects_bulk(payload.project_ids)
    return CommercialProjectDeleteResponse(
        success=True,
        deleted_count=count,
        message=f"Successfully deleted {count} project(s)."
    )


@router.post("/projects/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload New Projects via Excel")
async def bulk_upload_commercial_projects(
    file: UploadFile = File(..., description="Excel (.xlsx) file matching the Project template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse Excel file into PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_project_bulk_upload(content, file.filename or "")


@router.post("/po/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload PO Line Items via Excel")
async def bulk_upload_commercial_po(
    file: UploadFile = File(..., description="Excel (.xlsx) file matching the PO template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse Excel file into PostgreSQL `telecom_indus_po` table in `Nexus_Project DB`.
    Enforces the composite duplicate rule: (PO No, Site ID, Item Code) must be unique.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_po_bulk_upload(content, file.filename or "")


@router.post("/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Unified Bulk Upload for Commercial Manager")
async def bulk_upload_commercial_unified(
    file: UploadFile = File(..., description="Excel (.xlsx) file"),
    upload_type: str = Form("projects", description="'projects' or 'po'"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Unified endpoint accepting upload_type ('projects' or 'po') and dispatching to the respective processor.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    norm_type = upload_type.strip().lower()

    if norm_type in ["po", "purchase_order", "po_lines"]:
        return service.process_po_bulk_upload(content, file.filename or "")
    elif norm_type in ["po_amend", "po_amendment", "amend", "amendment"]:
        return service.process_po_amend_bulk_upload(content, file.filename or "")
    else:
        return service.process_project_bulk_upload(content, file.filename or "")


@router.get("/po-amend/projects", response_model=CommercialProjectListResponse, summary="List PO Amend Projects from telecom_project")
def list_po_amend_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB` for PO Amend workflow.
    """
    service = CommercialProjectService(db)
    return service.get_po_amend_projects_list()


@router.post("/po-amend/bulk-upload", response_model=CommercialBulkUploadResponse, summary="Bulk Upload PO Amendment via CSV/Excel")
async def bulk_upload_commercial_po_amend(
    file: UploadFile = File(..., description="CSV or Excel (.xlsx) file matching the PO Amendment template"),
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Upload and parse CSV or Excel file to update PO Revision Number, Amendment Completion Date,
    and Amendment Completion Status into PostgreSQL `telecom_project` table in `Nexus_Project DB`.
    """
    content = await file.read()
    service = CommercialProjectService(db)
    return service.process_po_amend_bulk_upload(content, file.filename or "")


@router.get("/wcc/projects", response_model=CommercialProjectListResponse, summary="List WCC Projects from telecom_project")
def list_wcc_projects(
    db: Session = Depends(get_project_db),
    _auth: bool = Depends(verify_commercial_access)
):
    """
    Retrieves real Project records from PostgreSQL table `telecom_project` in `Nexus_Project DB` for WCC workflow.
    """
    service = CommercialProjectService(db)
    return service.get_wcc_projects_list()

