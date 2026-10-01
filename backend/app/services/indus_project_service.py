from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.indus_project_repository import IndusProjectRepository
from app.schemas.indus_project import (
    IndusProjectCreate, IndusProjectUpdate, IndusProjectResponse, IndusProjectListResponse,
    IndusProjectActivityCreate, IndusProjectActivityUpdate, IndusProjectActivityResponse, IndusProjectActivityListResponse,
    IndusProjectTransportCreate, IndusProjectTransportUpdate, IndusProjectTransportResponse, IndusProjectTransportListResponse,
    IndusProjectApprovalCreate, IndusProjectApprovalUpdate, IndusProjectApprovalResponse, IndusProjectApprovalListResponse
)

def _format_project_response(item) -> IndusProjectResponse:
    if item.tat is not None:
        try:
            num = int(item.tat) if float(item.tat).is_integer() else float(item.tat)
            tat_str = f"{num} Days"
        except Exception:
            tat_str = str(item.tat)
    else:
        tat_str = None
    if item.additional_transport is not None:
        try:
            add_tr_str = "Yes" if float(item.additional_transport) > 0 else "No"
        except Exception:
            add_tr_str = "Yes"
    else:
        add_tr_str = "Yes"
    return IndusProjectResponse(
        project_type_id=item.project_type_id,
        id=item.project_type_id,
        company_name=item.company_name or "Nexus",
        companyName=item.company_name or "Nexus",
        customer_name=item.customer_name or "Indus Tower Ltd",
        customerName=item.customer_name or "Indus Tower Ltd",
        project_type=item.project_type,
        projectType=item.project_type,
        sub_project_type=item.sub_project_type,
        subProjectType=item.sub_project_type,
        upgradation_type=item.upgradation_type,
        upgradationType=item.upgradation_type,
        tat=tat_str,
        indus_pm=item.indus_pm,
        indusPm=item.indus_pm,
        indus_scm=item.indus_scm,
        indusScm=item.indus_scm,
        pm=item.pm,
        survey=item.survey or "Yes",
        additional_transport=add_tr_str,
        additionalTransport=add_tr_str,
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

def _format_activity_response(item) -> IndusProjectActivityResponse:
    days_str = str(item.days) if item.days is not None else "0"
    return IndusProjectActivityResponse(
        id=item.id,
        company_name=item.company_name or "Nexus",
        project_type=item.project_type,
        projectType=item.project_type,
        sub_project_type=item.sub_project_type,
        subProjectType=item.sub_project_type,
        stage=item.stage,
        activity=item.activity,
        days=days_str
    )

def _format_transport_response(item) -> IndusProjectTransportResponse:
    qty_str = str(item.qty) if item.qty is not None else "1"
    return IndusProjectTransportResponse(
        customer_project_item_id=item.customer_project_item_id,
        id=item.customer_project_item_id,
        company_name=item.company_name or "Nexus",
        customer_name=item.customer_name or "Indus Tower Ltd",
        project_type=item.project_type,
        projectType=item.project_type,
        sub_project_type=item.sub_project_type,
        subProjectType=item.sub_project_type,
        item_code=item.item_code,
        itemCode=item.item_code,
        item_description=item.item_description,
        itemDescription=item.item_description,
        transport_zone=item.transport_zone,
        transportZone=item.transport_zone,
        qty=qty_str,
        status=item.status or "Active",
        created_at=item.created_at,
        updated_at=item.updated_at
    )

def _format_approval_response(item) -> IndusProjectApprovalResponse:
    return IndusProjectApprovalResponse(
        sub_project_type_detail_id=item.sub_project_type_detail_id,
        id=item.sub_project_type_detail_id,
        company_name=item.company_name or "Nexus",
        customer_name=item.customer_name or "Indus Tower Ltd",
        sub_project_type=item.sub_project_type,
        subProjectType=item.sub_project_type,
        description=item.description,
        observation=item.observation,
        remarks=item.remarks,
        created_at=item.created_at,
        updated_at=item.updated_at
    )


class IndusProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusProjectRepository(db)

    # ==========================================
    # 1. PROJECT MASTER
    # ==========================================
    def get_projects_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        project_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "project_type_id",
        sort_desc: bool = False
    ) -> IndusProjectListResponse:
        items, total, total_pages = self.repo.get_all(
            page=page,
            page_size=page_size,
            search=search,
            customer_name=customer_name,
            project_type=project_type,
            status=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        return IndusProjectListResponse(
            items=[_format_project_response(it) for it in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    def get_project_by_id(self, project_type_id: int) -> IndusProjectResponse:
        item = self.repo.get_by_id(project_type_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project record with ID {project_type_id} not found."
            )
        return _format_project_response(item)

    def create_project(self, payload: IndusProjectCreate) -> IndusProjectResponse:
        p_type = (payload.project_type or payload.projectType or "").strip()
        if not p_type:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Project Type is required."
            )
        db_obj = self.repo.create(payload)
        return _format_project_response(db_obj)

    def update_project(self, project_type_id: int, payload: IndusProjectUpdate) -> IndusProjectResponse:
        db_obj = self.repo.get_by_id(project_type_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project record with ID {project_type_id} not found."
            )
        updated_obj = self.repo.update(db_obj, payload)
        return _format_project_response(updated_obj)

    def delete_project(self, project_type_id: int) -> dict:
        deleted = self.repo.delete(project_type_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project record with ID {project_type_id} not found."
            )
        return {"success": True, "message": f"Project record {project_type_id} deleted successfully."}

    # ==========================================
    # 2. ACTIVITY DETAILS (ISOLATED)
    # ==========================================
    def get_activities_list(
        self,
        project_type: Optional[str] = None,
        sub_project_type: Optional[str] = None,
        stage: Optional[str] = None,
        search: Optional[str] = None
    ) -> IndusProjectActivityListResponse:
        items = self.repo.get_activities(
            project_type=project_type,
            sub_project_type=sub_project_type,
            stage=stage,
            search=search
        )
        return IndusProjectActivityListResponse(
            items=[_format_activity_response(it) for it in items],
            total=len(items)
        )

    def get_activity_by_id(self, item_id: int) -> IndusProjectActivityResponse:
        item = self.repo.get_activity_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity record with ID {item_id} not found."
            )
        return _format_activity_response(item)

    def create_activity(self, payload: IndusProjectActivityCreate) -> IndusProjectActivityResponse:
        act = (payload.activity or "").strip()
        if not act:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Activity description is required."
            )
        db_obj = self.repo.create_activity(payload)
        return _format_activity_response(db_obj)

    def update_activity(self, item_id: int, payload: IndusProjectActivityUpdate) -> IndusProjectActivityResponse:
        db_obj = self.repo.get_activity_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity record with ID {item_id} not found."
            )
        updated_obj = self.repo.update_activity(db_obj, payload)
        return _format_activity_response(updated_obj)

    def delete_activity(self, item_id: int) -> dict:
        deleted = self.repo.delete_activity(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity record with ID {item_id} not found."
            )
        return {"success": True, "message": f"Activity record {item_id} deleted successfully."}

    # ==========================================
    # 3. TRANSPORT DETAILS (ISOLATED)
    # ==========================================
    def get_transports_list(
        self,
        project_type: Optional[str] = None,
        sub_project_type: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> IndusProjectTransportListResponse:
        items = self.repo.get_transports(
            project_type=project_type,
            sub_project_type=sub_project_type,
            customer_name=customer_name,
            status=status_filter,
            search=search
        )
        return IndusProjectTransportListResponse(
            items=[_format_transport_response(it) for it in items],
            total=len(items)
        )

    def get_transport_by_id(self, item_id: int) -> IndusProjectTransportResponse:
        item = self.repo.get_transport_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transport record with ID {item_id} not found."
            )
        return _format_transport_response(item)

    def create_transport(self, payload: IndusProjectTransportCreate) -> IndusProjectTransportResponse:
        item_desc = (payload.item_description or payload.itemDescription or payload.item_code or payload.itemCode or "").strip()
        if not item_desc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Item Code or Description is required."
            )
        db_obj = self.repo.create_transport(payload)
        return _format_transport_response(db_obj)

    def update_transport(self, item_id: int, payload: IndusProjectTransportUpdate) -> IndusProjectTransportResponse:
        db_obj = self.repo.get_transport_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transport record with ID {item_id} not found."
            )
        updated_obj = self.repo.update_transport(db_obj, payload)
        return _format_transport_response(updated_obj)

    def delete_transport(self, item_id: int) -> dict:
        deleted = self.repo.delete_transport(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transport record with ID {item_id} not found."
            )
        return {"success": True, "message": f"Transport record {item_id} deleted successfully."}

    # ==========================================
    # 4. APPROVAL HISTORY / SUPPLY (ISOLATED)
    # ==========================================
    def get_approvals_list(
        self,
        sub_project_type: Optional[str] = None,
        customer_name: Optional[str] = None,
        search: Optional[str] = None
    ) -> IndusProjectApprovalListResponse:
        items = self.repo.get_approvals(
            sub_project_type=sub_project_type,
            customer_name=customer_name,
            search=search
        )
        return IndusProjectApprovalListResponse(
            items=[_format_approval_response(it) for it in items],
            total=len(items)
        )

    def get_approval_by_id(self, item_id: int) -> IndusProjectApprovalResponse:
        item = self.repo.get_approval_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Approval history record with ID {item_id} not found."
            )
        return _format_approval_response(item)

    def create_approval(self, payload: IndusProjectApprovalCreate) -> IndusProjectApprovalResponse:
        sub_type = (payload.sub_project_type or payload.subProjectType or "").strip()
        if not sub_type:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Sub Project Type is required."
            )
        db_obj = self.repo.create_approval(payload)
        return _format_approval_response(db_obj)

    def update_approval(self, item_id: int, payload: IndusProjectApprovalUpdate) -> IndusProjectApprovalResponse:
        db_obj = self.repo.get_approval_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Approval history record with ID {item_id} not found."
            )
        updated_obj = self.repo.update_approval(db_obj, payload)
        return _format_approval_response(updated_obj)

    def delete_approval(self, item_id: int) -> dict:
        deleted = self.repo.delete_approval(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Approval history record with ID {item_id} not found."
            )
        return {"success": True, "message": f"Approval history record {item_id} deleted successfully."}
