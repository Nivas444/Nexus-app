import csv



import io



import re



import random



from datetime import datetime, date



from decimal import Decimal



from typing import List, Dict, Any, Optional, Set, Tuple







import openpyxl



from fastapi import HTTPException, status



from sqlalchemy.orm import Session







from sqlalchemy import func, or_







from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectExpense, ProjectMaterial



from app.schemas.commercial_project import (



    CommercialProjectItem,



    CommercialProjectListResponse,



    CommercialBulkUploadResponse,



    CommercialPoToBeOpenItem,



    CommercialPoToBeOpenListResponse,



    SavePmProjectDetailsRequest,



    SavePmProjectDetailsResponse



)











def _normalize_header(header: Any) -> str:



    """Normalize column header for robust matching."""



    if header is None:



        return ""



    return re.sub(r'[^a-zA-Z0-9]', '', str(header)).lower()











def _parse_date(value: Any) -> Optional[date]:



    """Parse Excel date values (date, datetime, or date string)."""



    if value is None:



        return None



    if isinstance(value, datetime):



        return value.date()



    if isinstance(value, date):



        return value



    val_str = str(value).strip()



    if not val_str:



        return None







    # Try common date formats



    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y", "%m/%d/%Y", "%d.%m.%Y"):



        try:



            return datetime.strptime(val_str, fmt).date()



        except ValueError:



            continue



    return None











def _parse_numeric(value: Any, default: Decimal = Decimal("0")) -> Decimal:



    """Parse numeric values (int, float, decimal, or numeric string)."""



    if value is None:



        return default



    if isinstance(value, (int, float, Decimal)):



        return Decimal(str(value))



    val_str = str(value).strip().replace(",", "").replace("%", "")



    if not val_str:



        return default



    try:



        return Decimal(val_str)



    except Exception:



        return default











class CommercialProjectService:



    def __init__(self, db: Session):



        self.db = db







    def _map_project_to_item(self, p: TelecomProject, today: Optional[date] = None) -> CommercialProjectItem:



        if today is None:



            today = date.today()







        date_str = ""



        if p.po_date:



            date_str = p.po_date.strftime("%d/%m/%Y")



        elif p.created_at:



            date_str = p.created_at.strftime("%d/%m/%Y")







        # Calculate ageing as max(0, current date - project end date) in calendar days



        end_date = p.completion_date



        if end_date:



            if isinstance(end_date, datetime):



                end_date = end_date.date()



            days_diff = (today - end_date).days



            ageing_days = max(0, days_diff)



            ageing_str = f"{ageing_days} Days"



        else:



            ageing_str = "0 Days"







        def format_metric(val: Any, unit: str) -> str:

            if val is None or val == "":

                return ""

            try:

                num = float(val)

                num_str = f"{int(num)}" if num.is_integer() else f"{num}"

                return f"{num_str}{unit}"

            except Exception:

                return f"{val}{unit}"



        def is_truthy(val: Any) -> bool:



            if val is None:



                return False



            s = str(val).strip().lower()



            return s not in ["", "false", "0", "no", "none", "null"]







        return CommercialProjectItem(



            id=f"prj-{p.project_id}",



            customerName=p.customer_name or "",



            date=date_str,



            poNo=p.po_no or "",



            projectId=p.project_code or f"PRJ-{p.project_id}",



            siteId=p.site_id or "",



            siteName=p.site_name or "",



            projectType=p.project_type or "",



            subProjectType=p.sub_project_type or "",



            poType=p.po_type or "Opex",



            poAmount=float(p.po_amount) if p.po_amount is not None else 0.0,



            ageing=ageing_str,



            task=p.current_task or "",



            raBill=False,



            selected=False,



            completionDate=p.completion_date.strftime("%d/%m/%Y") if p.completion_date else None,



            projectStatus=p.project_status,



            status=p.project_status,



            towerType=p.tower_type or "",



            towerHeight=format_metric(p.tower_height, "m"),



            sbc=format_metric(p.sbc, " t/m2"),



            windSpeed=format_metric(p.wind_speed, " m/s"),



            planningBoq=p.planning_boq or "",



            siteSurvey=bool(p.site_survey),



            tspMaterials=bool(p.tsp_materials),



            qualityAudit=bool(p.quality_audit),



            stn=(p.stn_status or f"STN-{1000 + (p.project_id % 9000)}") if bool(p.stn) else "",



            isStn=bool(p.stn),



            civilWorks=bool(p.civil_works),



            ptw=bool(p.ptw),



            srn=(p.srn_status or f"SRN-{1000 + (p.project_id % 9000)}") if bool(p.srn) else "",



            isSrn=bool(p.srn),



            electricalWorks=bool(p.electrical_works),



            additionalApproval=bool(p.additional_approval or getattr(p, "additional_approve", False)),



            additionalApprove=bool(p.additional_approval or getattr(p, "additional_approve", False)),



            cam=(p.cam_status or f"CAM-{100 + (p.project_id % 900)}") if bool(p.cam) else "",



            isCam=bool(p.cam),



            poleMounts=bool(p.pole_mounts),



            serviceContract=bool(p.service_contract),



            supportRequired=p.support_required or "",



            pendingWith=p.pending_with or "",



            materials="Dispatched" if is_truthy(p.tsp_materials) else "Pending"



        )







    def get_projects_list(self) -> CommercialProjectListResponse:



        """



        Fetch real project records from `telecom_project` in `Nexus_Project DB`.



        """



        projects = self.db.query(TelecomProject).order_by(TelecomProject.project_id.desc()).all()



        today = date.today()



        items = [self._map_project_to_item(p, today) for p in projects]



        return CommercialProjectListResponse(items=items, total=len(items))







    def save_pm_project_details(self, payload: SavePmProjectDetailsRequest) -> SavePmProjectDetailsResponse:



        """



        Persist Project Manager toggle configurations, tower specs, planning BOQ,



        and project status to PostgreSQL table `telecom_project`.



        """



        str_id = str(payload.project_id or "").strip()



        cleaned_id = str_id.replace("prj-", "").replace("PRJ-", "")



        pid = int(cleaned_id) if cleaned_id.isdigit() else None







        query = self.db.query(TelecomProject)



        proj = None



        if pid is not None:



            proj = query.filter(TelecomProject.project_id == pid).first()



        if not proj and payload.po_no and payload.site_id:



            proj = query.filter(



                func.lower(TelecomProject.po_no) == payload.po_no.strip().lower(),



                func.lower(TelecomProject.site_id) == payload.site_id.strip().lower()



            ).first()



        if not proj and payload.po_no:



            proj = query.filter(



                func.lower(TelecomProject.po_no) == payload.po_no.strip().lower()



            ).first()



        if not proj and str_id:



            proj = query.filter(



                func.lower(TelecomProject.project_code) == str_id.lower()



            ).first()







        if not proj:



            raise HTTPException(



                status_code=status.HTTP_404_NOT_FOUND,



                detail=f"Project with ID '{payload.project_id or payload.po_no}' not found."



            )







        def parse_numeric(val: Any) -> Optional[float]:



            if val is None or val == "":



                return None



            if isinstance(val, (int, float)):



                return float(val)



            cleaned = re.sub(r"[^\d.]", "", str(val))



            return float(cleaned) if cleaned else None







        if payload.tower_type is not None:



            proj.tower_type = payload.tower_type or None



        if payload.tower_height is not None:



            proj.tower_height = parse_numeric(payload.tower_height)



        if payload.sbc is not None:



            proj.sbc = parse_numeric(payload.sbc)



        if payload.wind_speed is not None:



            proj.wind_speed = parse_numeric(payload.wind_speed)



        if payload.planning_boq is not None:



            proj.planning_boq = payload.planning_boq







        # Store boolean true when user enabled toggle, false when user not enabled toggle

        proj.site_survey = bool(payload.site_survey) if payload.site_survey is not None else False

        proj.tsp_materials = bool(payload.tsp_materials) if payload.tsp_materials is not None else False

        proj.quality_audit = bool(payload.quality_audit) if payload.quality_audit is not None else False



        is_stn_enabled = bool(payload.stn) if payload.stn is not None else False

        proj.stn = is_stn_enabled

        if is_stn_enabled and not proj.stn_status:

            proj.stn_status = f"STN-{random.randint(1000, 9999)}"

        elif not is_stn_enabled:

            proj.stn_status = None



        proj.civil_works = bool(payload.civil_works) if payload.civil_works is not None else False

        proj.ptw = bool(payload.ptw) if payload.ptw is not None else False



        is_srn_enabled = bool(payload.srn) if payload.srn is not None else False

        proj.srn = is_srn_enabled

        if is_srn_enabled and not proj.srn_status:

            proj.srn_status = f"SRN-{random.randint(1000, 9999)}"

        elif not is_srn_enabled:

            proj.srn_status = None



        proj.electrical_works = bool(payload.electrical_works) if payload.electrical_works is not None else False



        add_appr_val = payload.additional_approval if payload.additional_approval is not None else getattr(payload, "additional_approve", None)

        is_add_appr_enabled = bool(add_appr_val) if add_appr_val is not None else False

        proj.additional_approval = is_add_appr_enabled

        if hasattr(proj, "additional_approve"):

            proj.additional_approve = is_add_appr_enabled



        is_cam_enabled = bool(payload.cam) if payload.cam is not None else False

        proj.cam = is_cam_enabled

        if is_cam_enabled and not proj.cam_status:

            proj.cam_status = f"CAM-{random.randint(100, 999)}"

        elif not is_cam_enabled:

            proj.cam_status = None



        proj.pole_mounts = bool(payload.pole_mounts) if payload.pole_mounts is not None else False

        proj.service_contract = bool(payload.service_contract) if payload.service_contract is not None else False







        if payload.project_status is not None:



            proj.project_status = payload.project_status







        if payload.support_required is not None:



            proj.support_required = payload.support_required



        if payload.pending_with is not None:



            proj.pending_with = payload.pending_with







        try:



            self.db.commit()



            self.db.refresh(proj)



        except Exception as e:



            self.db.rollback()



            raise HTTPException(



                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,



                detail=f"Failed to update project details: {str(e)}"



            )







        updated_item = self._map_project_to_item(proj)



        return SavePmProjectDetailsResponse(



            success=True,



            message="Project details saved successfully.",



            project=updated_item



        )







    def update_project_status_fields(self, payload: Dict[str, Any]) -> Dict[str, Any]:

        """

        Updates project_status, support_required, pending_with, and remarks in `telecom_project`.

        """

        items = payload.get("items")

        if not items:

            items = [payload]



        updated_count = 0

        updated_records = []



        for item in items:

            pid = item.get("project_id") or item.get("projectId") or item.get("id")

            po_no = item.get("po_no") or item.get("poNo")

            site_id = item.get("site_id") or item.get("siteId")



            str_id = str(pid or "").strip().replace("prj-", "").replace("PRJ-", "")

            int_pid = int(str_id) if str_id.isdigit() else None



            query = self.db.query(TelecomProject)

            proj = None

            if int_pid is not None:

                proj = query.filter(TelecomProject.project_id == int_pid).first()

            if not proj and po_no and site_id:

                proj = query.filter(

                    func.lower(TelecomProject.po_no) == str(po_no).strip().lower(),

                    func.lower(TelecomProject.site_id) == str(site_id).strip().lower()

                ).first()

            if not proj and po_no:

                proj = query.filter(func.lower(TelecomProject.po_no) == str(po_no).strip().lower()).first()

            if not proj and site_id:

                proj = query.filter(func.lower(TelecomProject.site_id) == str(site_id).strip().lower()).first()



            if proj:

                new_status = item.get("project_status") or item.get("status")

                if new_status:

                    stat_clean = str(new_status).strip()

                    if stat_clean.upper() in ["NOT REQUIRED", "NR"]:

                        proj.project_status = "NR"

                    elif stat_clean.upper() == "HOLD":

                        proj.project_status = "HOLD"

                    elif stat_clean.upper() == "WIP":

                        proj.project_status = "WIP"

                    elif stat_clean.upper() == "YTS":

                        proj.project_status = "YTS"

                    else:

                        proj.project_status = stat_clean



                if "support_required" in item or "supportRequired" in item:

                    proj.support_required = item.get("support_required") if "support_required" in item else item.get("supportRequired")

                if "pending_with" in item or "pendingWith" in item:

                    proj.pending_with = item.get("pending_with") if "pending_with" in item else item.get("pendingWith")

                if "remarks" in item:

                    proj.remarks = item.get("remarks")



                proj.updated_at = datetime.now()

                updated_count += 1

                updated_records.append({

                    "projectId": proj.project_id,

                    "poNo": proj.po_no,

                    "siteId": proj.site_id,

                    "status": proj.project_status,

                    "supportRequired": proj.support_required,

                    "pendingWith": proj.pending_with,

                    "remarks": proj.remarks

                })



        self.db.commit()

        return {

            "success": True,

            "updated_count": updated_count,

            "records": updated_records

        }







    def delete_project(self, project_id: Any) -> bool:



        """



        Delete a project record from `telecom_project` by project_id, project_code, or po_no.



        """



        str_id = str(project_id).strip()



        cleaned_id = str_id.replace("prj-", "").replace("PRJ-", "")



        pid = int(cleaned_id) if cleaned_id.isdigit() else None







        query = self.db.query(TelecomProject)



        proj = None



        if pid is not None:



            proj = query.filter(TelecomProject.project_id == pid).first()



        if not proj:



            proj = query.filter(



                (TelecomProject.project_code == str_id) |



                (TelecomProject.po_no == str_id)



            ).first()







        if not proj:



            return False







        self.db.delete(proj)



        self.db.commit()



        return True







    def delete_projects_bulk(self, project_ids: List[Any]) -> int:



        """



        Bulk delete project records from `telecom_project`.



        """



        deleted_count = 0



        for pid in project_ids:



            if self.delete_project(pid):



                deleted_count += 1



        return deleted_count







    def process_project_bulk_upload(self, file_content: bytes, filename: str = "") -> CommercialBulkUploadResponse:



        """



        Validate and bulk upload Project records into `telecom_project`.



        """



        if not file_content:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="Uploaded file is empty."



            )







        try:



            wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)



        except Exception as e:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail=f"Invalid Excel workbook or corrupted file: {str(e)}"



            )







        # Expected sheet: 'New Project & PO' or active



        sheet = wb["New Project & PO"] if "New Project & PO" in wb.sheetnames else wb.active



        if sheet is None:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="The workbook does not contain an active worksheet."



            )







        # Extract headers from row 1



        raw_headers: List[str] = []



        for col_idx in range(1, sheet.max_column + 1):



            val = sheet.cell(1, col_idx).value



            if val is not None and str(val).strip():



                raw_headers.append(str(val).strip())



            else:



                break







        norm_headers = [_normalize_header(h) for h in raw_headers]







        # Verify required Project template headers



        required_project_headers = ["customer", "pono", "podate", "potype", "projectid", "siteid"]



        missing_headers = [req for req in required_project_headers if not any(req in nh for nh in norm_headers)]







        if missing_headers:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail=f"Invalid Project template. Expected headers: Customer, PO No, PO Date, PO Type, Project ID, Project Type, Sub-Project Type, Site ID, Site Name, PO Amount."



            )







        # Helper to get cell value by column name prefix



        def get_col_index(needle: str) -> Optional[int]:



            needle_norm = _normalize_header(needle)



            for idx, nh in enumerate(norm_headers, 1):



                if needle_norm in nh or nh in needle_norm:



                    return idx



            return None







        idx_customer = get_col_index("customer")



        idx_pono = get_col_index("pono")



        idx_podate = get_col_index("podate")



        idx_potype = get_col_index("potype")



        idx_projid = get_col_index("projectid")



        idx_projtype = get_col_index("projecttype")



        idx_subprojtype = get_col_index("subprojecttype")



        idx_siteid = get_col_index("siteid")



        idx_sitename = get_col_index("sitename")



        idx_poamount = get_col_index("poamount")







        row_errors: List[str] = []



        parsed_records: List[Dict[str, Any]] = []



        seen_file_pos: Set[str] = set()







        for row_idx in range(2, sheet.max_row + 1):



            # Check if row is completely empty



            row_values = [sheet.cell(row_idx, c).value for c in range(1, len(raw_headers) + 1)]



            if not any(v is not None and str(v).strip() for v in row_values):



                continue







            customer = str(sheet.cell(row_idx, idx_customer).value or "").strip() if idx_customer else ""



            po_no = str(sheet.cell(row_idx, idx_pono).value or "").strip() if idx_pono else ""



            po_date_raw = sheet.cell(row_idx, idx_podate).value if idx_podate else None



            po_type = str(sheet.cell(row_idx, idx_potype).value or "").strip() if idx_potype else ""



            project_code = str(sheet.cell(row_idx, idx_projid).value or "").strip() if idx_projid else ""



            project_type = str(sheet.cell(row_idx, idx_projtype).value or "").strip() if idx_projtype else ""



            sub_project_type = str(sheet.cell(row_idx, idx_subprojtype).value or "").strip() if idx_subprojtype else ""



            site_id = str(sheet.cell(row_idx, idx_siteid).value or "").strip() if idx_siteid else ""



            site_name = str(sheet.cell(row_idx, idx_sitename).value or "").strip() if idx_sitename else ""



            po_amount_raw = sheet.cell(row_idx, idx_poamount).value if idx_poamount else None







            # Validation



            if not customer:



                row_errors.append(f"Row {row_idx}: Customer name is required.")



            if not po_no:



                row_errors.append(f"Row {row_idx}: PO No is required.")



            if not site_id:



                row_errors.append(f"Row {row_idx}: Site ID is required.")







            po_date = _parse_date(po_date_raw)



            if po_date_raw is not None and str(po_date_raw).strip() and po_date is None:



                row_errors.append(f"Row {row_idx}: Invalid date format '{po_date_raw}' for PO Date. Please use DD/MM/YYYY or YYYY-MM-DD.")







            po_amount = _parse_numeric(po_amount_raw)







            # Check duplicate within file



            if po_no:



                norm_po = po_no.lower()



                if norm_po in seen_file_pos:



                    row_errors.append(f"Row {row_idx}: Duplicate PO No '{po_no}' within upload file.")



                else:



                    seen_file_pos.add(norm_po)







            parsed_records.append({



                "row_idx": row_idx,



                "customer_name": customer,



                "po_no": po_no,



                "po_date": po_date,



                "po_type": po_type,



                "project_code": project_code,



                "project_type": project_type,



                "sub_project_type": sub_project_type,



                "site_id": site_id,



                "site_name": site_name,



                "po_amount": po_amount



            })







        if not parsed_records:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="No data rows found in uploaded file."



            )







        # Check duplicates against database



        if seen_file_pos:



            existing_pos = self.db.query(TelecomProject.po_no).filter(



                func.lower(TelecomProject.po_no).in_(list(seen_file_pos))



            ).all()



            existing_po_set = {row[0].lower() for row in existing_pos if row[0]}



            for item in parsed_records:



                if item["po_no"] and item["po_no"].lower() in existing_po_set:



                    row_errors.append(f"Row {item['row_idx']}: PO No '{item['po_no']}' already exists in database.")







        if row_errors:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="; ".join(row_errors)



            )







        # Transactional insert



        try:



            new_projects = []



            for item in parsed_records:



                proj = TelecomProject(



                    company_name="Nexus",



                    customer_name=item["customer_name"],



                    po_no=item["po_no"],



                    po_date=item["po_date"],



                    po_type=item["po_type"],



                    project_code=item["project_code"],



                    project_type=item["project_type"],



                    sub_project_type=item["sub_project_type"],



                    site_id=item["site_id"],



                    site_name=item["site_name"],



                    po_amount=item["po_amount"]



                )



                new_projects.append(proj)







            self.db.add_all(new_projects)



            self.db.commit()



        except Exception as e:



            self.db.rollback()



            raise HTTPException(



                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,



                detail=f"Database transaction failed: {str(e)}"



            )







        imported_count = len(new_projects)



        return CommercialBulkUploadResponse(



            success=True,



            message=f"Successfully imported {imported_count} project records into telecom_project.",



            imported_count=imported_count,



            total_count=imported_count,



            error_count=0,



            errors=[]



        )







    def process_po_bulk_upload(self, file_content: bytes, filename: str = "") -> CommercialBulkUploadResponse:



        """



        Validate and bulk upload PO Line Item records into `telecom_indus_po`.



        Enforces Critical Duplicate Item-Code Business Rule:



        The same PO number + the same Site ID must not contain the same Item Code more than once.



        """



        if not file_content:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="Uploaded file is empty."



            )







        try:



            wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)



        except Exception as e:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail=f"Invalid Excel workbook or corrupted file: {str(e)}"



            )







        sheet = wb["New Project & PO"] if "New Project & PO" in wb.sheetnames else wb.active



        if sheet is None:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="The workbook does not contain an active worksheet."



            )







        raw_headers: List[str] = []



        for col_idx in range(1, sheet.max_column + 1):



            val = sheet.cell(1, col_idx).value



            if val is not None and str(val).strip():



                raw_headers.append(str(val).strip())



            else:



                break







        norm_headers = [_normalize_header(h) for h in raw_headers]







        # Verify required PO template headers: PO No, Site ID, Line No, Item Code, Description, Uom, Qty, Rate, GST, Amount



        required_po_headers = ["pono", "siteid", "itemcode"]



        missing_headers = [req for req in required_po_headers if not any(req in nh for nh in norm_headers)]







        if missing_headers:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="Invalid PO template. Expected headers: PO No, Site ID, Line No, Item Code, Description, Uom, Qty, Rate, GST, Amount."



            )







        def get_col_index(needle: str) -> Optional[int]:



            needle_norm = _normalize_header(needle)



            for idx, nh in enumerate(norm_headers, 1):



                if needle_norm in nh or nh in needle_norm:



                    return idx



            return None







        idx_pono = get_col_index("pono")



        idx_siteid = get_col_index("siteid")



        idx_lineno = get_col_index("lineno") or get_col_index("line")



        idx_itemcode = get_col_index("itemcode")



        idx_desc = get_col_index("description") or get_col_index("desc")



        idx_uom = get_col_index("uom")



        idx_qty = get_col_index("qty") or get_col_index("quantity")



        idx_rate = get_col_index("rate") or get_col_index("price")



        idx_gst = get_col_index("gst")



        idx_amount = get_col_index("amount")







        row_errors: List[str] = []



        parsed_records: List[Dict[str, Any]] = []







        # Duplicate tracking: composite key = (po_no, site_id, item_code)



        seen_composite_keys: Set[Tuple[str, str, str]] = set()







        for row_idx in range(2, sheet.max_row + 1):



            row_values = [sheet.cell(row_idx, c).value for c in range(1, len(raw_headers) + 1)]



            if not any(v is not None and str(v).strip() for v in row_values):



                continue







            po_no = str(sheet.cell(row_idx, idx_pono).value or "").strip() if idx_pono else ""



            site_id = str(sheet.cell(row_idx, idx_siteid).value or "").strip() if idx_siteid else ""



            line_no = str(sheet.cell(row_idx, idx_lineno).value or "").strip() if idx_lineno else ""



            item_code = str(sheet.cell(row_idx, idx_itemcode).value or "").strip() if idx_itemcode else ""



            description = str(sheet.cell(row_idx, idx_desc).value or "").strip() if idx_desc else ""



            uom = str(sheet.cell(row_idx, idx_uom).value or "").strip() if idx_uom else ""



            qty_raw = sheet.cell(row_idx, idx_qty).value if idx_qty else None



            rate_raw = sheet.cell(row_idx, idx_rate).value if idx_rate else None



            gst_raw = sheet.cell(row_idx, idx_gst).value if idx_gst else None



            amount_raw = sheet.cell(row_idx, idx_amount).value if idx_amount else None







            # Validation



            if not po_no:



                row_errors.append(f"Row {row_idx}: PO No is required.")



            if not site_id:



                row_errors.append(f"Row {row_idx}: Site ID is required.")



            if not item_code:



                row_errors.append(f"Row {row_idx}: Item Code is required.")







            qty = _parse_numeric(qty_raw)



            rate = _parse_numeric(rate_raw)



            gst = _parse_numeric(gst_raw)



            amount = _parse_numeric(amount_raw)







            # Auto-calculate amount if not provided: (qty * rate) + gst



            if amount == Decimal("0") and (qty > 0 or rate > 0):



                base_amt = qty * rate



                amount = base_amt + gst







            # Enforce duplicate rule within uploaded workbook



            if po_no and site_id and item_code:



                comp_key = (po_no.lower(), site_id.lower(), item_code.lower())



                if comp_key in seen_composite_keys:



                    row_errors.append(



                        f"Row {row_idx}: Duplicate Item Code '{item_code}' for PO '{po_no}' and Site ID '{site_id}' within upload file."



                    )



                else:



                    seen_composite_keys.add(comp_key)







            parsed_records.append({



                "row_idx": row_idx,



                "po_no": po_no,



                "site_id": site_id,



                "line_number": line_no,



                "item_code": item_code,



                "item_description": description,



                "uom": uom,



                "po_qty": qty,



                "po_rate": rate,



                "gst_amount": gst,



                "po_amount": qty * rate if (qty * rate) > 0 else amount,



                "po_total_amount": amount



            })







        if not parsed_records:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="No PO data rows found in uploaded file."



            )







        # Enforce duplicate rule against existing database records



        if seen_composite_keys:



            # Query existing records for these PO numbers



            po_nos_list = list({item["po_no"] for item in parsed_records if item["po_no"]})



            existing_db_records = self.db.query(



                TelecomIndusPo.po_no,



                TelecomIndusPo.site_id,



                TelecomIndusPo.item_code



            ).filter(



                TelecomIndusPo.po_no.in_(po_nos_list)



            ).all()







            existing_db_keys: Set[Tuple[str, str, str]] = {



                (



                    (r[0] or "").strip().lower(),



                    (r[1] or "").strip().lower(),



                    (r[2] or "").strip().lower()



                )



                for r in existing_db_records



            }







            for item in parsed_records:



                if item["po_no"] and item["site_id"] and item["item_code"]:



                    check_key = (



                        item["po_no"].lower(),



                        item["site_id"].lower(),



                        item["item_code"].lower()



                    )



                    if check_key in existing_db_keys:



                        row_errors.append(



                            f"Row {item['row_idx']}: Duplicate Item Code '{item['item_code']}' already exists in database for PO '{item['po_no']}' and Site ID '{item['site_id']}'."



                        )







        if row_errors:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="; ".join(row_errors)



            )







        # Transactional insert



        try:



            new_pos = []



            for item in parsed_records:



                po_entry = TelecomIndusPo(



                    company_name="Nexus",



                    customer_name="Indus Towers Ltd",



                    po_no=item["po_no"],



                    site_id=item["site_id"],



                    line_number=item["line_number"],



                    item_code=item["item_code"],



                    item_description=item["item_description"],



                    uom=item["uom"],



                    po_qty=item["po_qty"],



                    po_rate=item["po_rate"],



                    po_amount=item["po_amount"],



                    gst_amount=item["gst_amount"],



                    po_total_amount=item["po_total_amount"]



                )



                new_pos.append(po_entry)







            self.db.add_all(new_pos)



            self.db.commit()



        except Exception as e:



            self.db.rollback()



            raise HTTPException(



                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,



                detail=f"Database transaction failed: {str(e)}"



            )







        imported_count = len(new_pos)



        return CommercialBulkUploadResponse(



            success=True,



            message=f"Successfully imported {imported_count} PO records into telecom_indus_po.",



            imported_count=imported_count,



            total_count=imported_count,



            error_count=0,



            errors=[]



        )







    def get_po_amend_projects_list(self) -> CommercialProjectListResponse:



        """



        Fetch real project records from `telecom_project` in `Nexus_Project DB` for the PO Amend worklist.



        """



        projects = self.db.query(TelecomProject).order_by(TelecomProject.project_id.asc()).all()



        items: List[CommercialProjectItem] = []



        today = date.today()







        for p in projects:



            date_str = ""



            ageing_str = "0 Days"



            if p.po_date:



                date_str = p.po_date.strftime("%d/%m/%Y")



            elif p.created_at:



                date_str = p.created_at.strftime("%d/%m/%Y")







            # Calculate ageing as max(0, current date - project end date) in calendar days



            end_date = p.po_amendment_completion_date or p.completion_date



            if end_date:



                if isinstance(end_date, datetime):



                    end_date = end_date.date()



                days_diff = (today - end_date).days



                ageing_days = max(0, days_diff)



                ageing_str = f"{ageing_days} Days"



            else:



                ageing_str = "0 Days"







            completion_date_str = p.po_amendment_completion_date.strftime("%d/%m/%Y") if p.po_amendment_completion_date else (p.completion_date.strftime("%d/%m/%Y") if p.completion_date else None)







            task_raw = (p.current_task or "").strip()



            t_low = task_raw.lower()



            if t_low in ["wcc to be submit", "wcc to be raise", "wcc approved"]:



                # Routed to WCC: remove from active PO Amendment page



                continue



            if t_low in ["pending with indus", "approval pending"]:



                task_display = "Approval Pending"



                status_display = "Under Review"



            elif t_low == "rejected":



                task_display = "Rejected"



                status_display = "Rejected"



            elif p.po_amendment_completion_status:



                task_display = f"Amendment {p.po_amendment_completion_status}"



                status_display = "Amended"



            elif "approved" in t_low or "completed" in t_low:



                task_display = task_raw



                status_display = "Approved"



            else:



                task_display = "PO Amend to be submit"



                status_display = p.po_status or "Amend Requested"







            formatted_amount = f"₹ {float(p.po_amount):,.2f}" if p.po_amount is not None else "₹ 0.00"







            items.append(CommercialProjectItem(



                id=f"prj-{p.project_id}",



                customerName=p.customer_name or "",



                date=date_str,



                poNo=p.po_no or "",



                projectId=p.project_code or f"PRJ-{p.project_id}",



                siteId=p.site_id or "",



                siteName=p.site_name or "",



                projectType=p.project_type or "",



                subProjectType=p.sub_project_type or "",



                poType=p.po_type or "Opex",



                poAmount=float(p.po_amount) if p.po_amount is not None else 0.0,



                ageing=ageing_str,



                task=task_display,



                raBill=False,



                selected=False,



                poRevNo=p.po_revision_number,



                poAmendmentRefId=p.po_amendment_ref_id or p.po_reference_number,



                poAmendmentCompletionDate=completion_date_str,



                poAmendmentCompletionStatus=p.po_amendment_completion_status,



                poStatus=status_display,



                amount=formatted_amount



            ))







        return CommercialProjectListResponse(items=items, total=len(items))







    def get_wcc_projects_list(self) -> CommercialProjectListResponse:



        """



        Fetch real project records from `telecom_project` in `Nexus_Project DB` for the WCC worklist.



        """



        projects = self.db.query(TelecomProject).order_by(TelecomProject.project_id.asc()).all()



        items: List[CommercialProjectItem] = []



        today = date.today()







        for p in projects:



            date_str = ""



            ageing_str = "0 Days"



            if p.po_date:



                date_str = p.po_date.strftime("%d/%m/%Y")



            elif p.created_at:



                date_str = p.created_at.strftime("%d/%m/%Y")







            end_date = p.wcc_submission_date or p.completion_date



            if end_date:



                if isinstance(end_date, datetime):



                    end_date = end_date.date()



                days_diff = (today - end_date).days



                ageing_days = max(0, days_diff)



                ageing_str = f"{ageing_days} Days"







            task_raw = (p.current_task or "").strip()



            t_low = task_raw.lower()



            if t_low in ["wcc approved", "to be submit", "invoice to be submit", "invoice to be raise"] or (p.receipt_no and t_low in ["to be submit", "wcc approved"]):



                # Successfully completed WCC task moves out of active WCC task list into Invoice workflow



                continue







            if t_low in ["po amend to be submit", "amend requested"]:



                continue







            if t_low in ["pending with indus", "approval pending"]:



                if (p.po_material_difference is not None and float(p.po_material_difference) > 0) or (p.po_amendment_ref_id and not (p.wcc_no or p.wcc_submission_date)):



                    continue



                task_display = "Approval Pending"



                status_display = "Under Review"



            elif t_low == "rejected":



                task_display = "Rejected"



                status_display = "Rejected"



            elif t_low in ["amend approved", "amendment approved"]:



                # Completed PO Amend task moves into active WCC as 'WCC to be submit'



                task_display = "WCC to be submit"



                status_display = "WCC Requested"



            elif "approved" in t_low or "completed" in t_low:



                task_display = task_raw



                status_display = "Approved"



            else:



                task_display = "WCC to be submit"



                status_display = p.po_status or "WCC Requested"







            amt_val = float(p.wcc_amount) if p.wcc_amount is not None else (float(p.po_amount) if p.po_amount is not None else 0.0)



            formatted_amount = f"₹ {amt_val:,.2f}"







            items.append(CommercialProjectItem(



                id=f"prj-{p.project_id}",



                customerName=p.customer_name or "",



                date=date_str,



                poNo=p.po_no or "",



                projectId=p.project_code or f"PRJ-{p.project_id}",



                siteId=p.site_id or "",



                siteName=p.site_name or "",



                projectType=p.project_type or "",



                subProjectType=p.sub_project_type or "",



                poType=p.po_type or "Opex",



                poAmount=amt_val,



                ageing=ageing_str,



                task=task_display,



                raBill=False,



                selected=False,



                poRevNo=p.po_revision_number,



                poStatus=status_display,



                amount=formatted_amount,



                wccNo=p.wcc_no,



                wccDate=p.wcc_date.strftime("%d/%m/%Y") if p.wcc_date else None,



                submissionDate=p.wcc_submission_date.strftime("%d/%m/%Y") if p.wcc_submission_date else None,



                wccSubmissionDate=p.wcc_submission_date.strftime("%d/%m/%Y") if p.wcc_submission_date else None,



                approvedDate=p.wcc_approved_date.strftime("%d/%m/%Y") if p.wcc_approved_date else None,



                wccApprovedDate=p.wcc_approved_date.strftime("%d/%m/%Y") if p.wcc_approved_date else None,



                wccAmount=float(p.wcc_amount) if p.wcc_amount is not None else None,



                receiptNo=p.receipt_no,



                receiptDate=p.receipt_date.strftime("%d/%m/%Y") if p.receipt_date else None,



                ersNo=p.ers_no



            ))







        return CommercialProjectListResponse(items=items, total=len(items))







    def get_po_to_be_open_projects_list(self) -> CommercialPoToBeOpenListResponse:



        """



        Retrieve PO records eligible for 'PO To Be Open' satisfying ALL 3 conditions:



        1. PO status must be 'Closed' or 'Finally Closed' (case-insensitive, trimmed).



        2. WCC must not have been raised against that PO (wcc_no is null/empty,



           wcc_submission_date is null, and wcc_approved_date is null).



        3. Expense records must be available and linked to the corresponding PO in `project_expenses`,



           with spent amount calculated from SUM(COALESCE(ProjectExpense.amount, 0)) > 0.



        Grouped by PO to avoid duplicate PO rows when multiple expense records exist.



        """



        exp_subquery = (



            self.db.query(



                ProjectExpense.po_no.label("exp_po_no"),



                func.sum(func.coalesce(ProjectExpense.amount, 0)).label("spent_amount"),



                func.count(ProjectExpense.expense_management_id).label("exp_count")



            )



            .filter(



                ProjectExpense.po_no.isnot(None),



                func.trim(ProjectExpense.po_no) != ""



            )



            .group_by(ProjectExpense.po_no)



            .having(func.sum(func.coalesce(ProjectExpense.amount, 0)) > 0)



            .subquery()



        )







        query = (



            self.db.query(



                TelecomProject,



                exp_subquery.c.spent_amount



            )



            .join(exp_subquery, exp_subquery.c.exp_po_no == TelecomProject.po_no)



            .filter(



                func.trim(func.lower(TelecomProject.po_status)).in_(["closed", "finally closed"]),



                or_(TelecomProject.wcc_no.is_(None), func.trim(TelecomProject.wcc_no) == ""),



                TelecomProject.wcc_submission_date.is_(None),



                TelecomProject.wcc_approved_date.is_(None)



            )



            .order_by(TelecomProject.project_id.asc())



        )







        rows = query.all()



        items: List[CommercialPoToBeOpenItem] = []







        for proj, spent_amount in rows:



            raw_amt = float(spent_amount) if spent_amount is not None else 0.0







            # Format spent amount in Indian currency format (e.g. 85,000.00)



            s_val = f"{raw_amt:.2f}"



            parts = s_val.split(".")



            int_p, dec_p = parts[0], parts[1]



            if len(int_p) > 3:



                last3 = int_p[-3:]



                rem = int_p[:-3]



                groups = []



                while len(rem) > 2:



                    groups.insert(0, rem[-2:])



                    rem = rem[:-2]



                if rem:



                    groups.insert(0, rem)



                groups.append(last3)



                formatted_int = ",".join(groups)



            else:



                formatted_int = int_p



            formatted_expense = f"{formatted_int}.{dec_p}"







            items.append(CommercialPoToBeOpenItem(



                id=f"ptbo-{proj.project_id}",



                poNo=proj.po_no or "",



                projectId=proj.project_code or f"PRJ-{proj.project_id}",



                siteId=proj.site_id or "",



                siteName=proj.site_name or "",



                projectType=proj.project_type or "",



                subProjectType=proj.sub_project_type or "",



                expenseAmount=formatted_expense,



                rawExpenseAmount=raw_amt,



                poStatus=proj.po_status or ""



            ))







        return CommercialPoToBeOpenListResponse(items=items, total=len(items))







    def process_po_amend_bulk_upload(self, file_content: bytes, filename: str = "") -> CommercialBulkUploadResponse:



        """



        Validate and bulk update PO Amendment fields into PostgreSQL `telecom_project` table in `Nexus_Project DB`.



        Matches Customer + PO No + Site Name against existing records.



        Updates PO Rev No, PO Amendment Completion Date, PO Amendment Completion Status.



        Does not insert duplicate projects or POs. Uses proper transactions and reports row-level errors.



        """



        if not file_content:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="Uploaded file is empty."



            )







        filename_lower = (filename or "").lower()



        is_csv = filename_lower.endswith(".csv")







        raw_headers: List[str] = []



        rows_data: List[Tuple[int, List[Any]]] = []







        if is_csv or (not filename_lower.endswith(".xlsx") and not filename_lower.endswith(".xls")):



            try:



                try:



                    text_content = file_content.decode("utf-8-sig")



                except UnicodeDecodeError:



                    text_content = file_content.decode("latin-1")



                



                reader = list(csv.reader(io.StringIO(text_content)))



                if not reader:



                    raise HTTPException(



                        status_code=status.HTTP_400_BAD_REQUEST,



                        detail="The CSV file is empty."



                    )



                raw_headers = [str(col).strip() for col in reader[0] if str(col).strip()]



                for row_idx, r_vals in enumerate(reader[1:], 2):



                    rows_data.append((row_idx, r_vals))



            except HTTPException:



                raise



            except Exception as e:



                try:



                    wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)



                    sheet = wb["PO Amendment"] if "PO Amendment" in wb.sheetnames else wb.active



                    for col_idx in range(1, sheet.max_column + 1):



                        val = sheet.cell(1, col_idx).value



                        if val is not None and str(val).strip():



                            raw_headers.append(str(val).strip())



                    for r_idx in range(2, sheet.max_row + 1):



                        r_vals = [sheet.cell(r_idx, c).value for c in range(1, len(raw_headers) + 1)]



                        rows_data.append((r_idx, r_vals))



                except Exception:



                    raise HTTPException(



                        status_code=status.HTTP_400_BAD_REQUEST,



                        detail=f"Failed to parse uploaded file: {str(e)}"



                    )



        else:



            try:



                wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)



            except Exception as e:



                raise HTTPException(



                    status_code=status.HTTP_400_BAD_REQUEST,



                    detail=f"Invalid Excel workbook or corrupted file: {str(e)}"



                )



            sheet = wb["PO Amendment"] if "PO Amendment" in wb.sheetnames else wb.active



            if sheet is None:



                raise HTTPException(



                    status_code=status.HTTP_400_BAD_REQUEST,



                    detail="The workbook does not contain an active worksheet."



                )



            for col_idx in range(1, sheet.max_column + 1):



                val = sheet.cell(1, col_idx).value



                if val is not None and str(val).strip():



                    raw_headers.append(str(val).strip())



                else:



                    break



            for r_idx in range(2, sheet.max_row + 1):



                r_vals = [sheet.cell(r_idx, c).value for c in range(1, len(raw_headers) + 1)]



                rows_data.append((r_idx, r_vals))







        norm_headers = [_normalize_header(h) for h in raw_headers]







        required_headers = [



            ("customer", "Customer"),



            ("pono", "PO No"),



            ("sitename", "Site Name"),



            ("rev", "PO Rev No"),



            ("date", "PO Amendment Completion Date"),



            ("status", "PO Amendment Completion Status")



        ]







        missing_headers = [label for key, label in required_headers if not any(key in nh for nh in norm_headers)]



        if missing_headers:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail=f"Invalid PO Amendment template. Missing required headers: {', '.join(missing_headers)}. Expected headers: Customer, PO No, Site Name, PO Rev No, PO Amendment Completion Date, PO Amendment Completion Status."



            )







        def get_col_index(key: str) -> Optional[int]:



            needle = _normalize_header(key)



            for idx, nh in enumerate(norm_headers):



                if needle in nh or nh in needle:



                    return idx



            return None







        idx_customer = get_col_index("customer")



        idx_pono = get_col_index("pono")



        idx_sitename = get_col_index("sitename")



        idx_revno = get_col_index("rev")



        idx_comp_date = get_col_index("date")



        idx_comp_status = get_col_index("status")







        row_errors: List[str] = []



        updates_to_apply: List[Dict[str, Any]] = []



        seen_keys: Set[Tuple[str, str, str]] = set()







        total_evaluated_rows = 0







        for row_idx, r_vals in rows_data:



            if not any(v is not None and str(v).strip() for v in r_vals):



                continue







            total_evaluated_rows += 1







            def val_at(idx: Optional[int]) -> Any:



                if idx is not None and idx < len(r_vals):



                    return r_vals[idx]



                return None







            customer_raw = val_at(idx_customer)



            customer = str(customer_raw).strip() if customer_raw is not None else ""







            po_no_raw = val_at(idx_pono)



            po_no = str(po_no_raw).strip() if po_no_raw is not None else ""







            site_name_raw = val_at(idx_sitename)



            site_name = str(site_name_raw).strip() if site_name_raw is not None else ""







            po_rev_no_raw = val_at(idx_revno)



            po_rev_no = str(po_rev_no_raw).strip() if po_rev_no_raw is not None else ""







            comp_date_raw = val_at(idx_comp_date)



            parsed_date = _parse_date(comp_date_raw)







            comp_status_raw = val_at(idx_comp_status)



            comp_status = str(comp_status_raw).strip() if comp_status_raw is not None else ""







            has_error = False



            if not customer:



                row_errors.append(f"Row {row_idx}: Customer name is required.")



                has_error = True



            if not po_no:



                row_errors.append(f"Row {row_idx}: PO No is required.")



                has_error = True



            if not site_name:



                row_errors.append(f"Row {row_idx}: Site Name is required.")



                has_error = True



            if not po_rev_no:



                row_errors.append(f"Row {row_idx}: PO Rev No is required.")



                has_error = True



            elif len(po_rev_no) > 50:



                row_errors.append(f"Row {row_idx}: PO Rev No '{po_rev_no}' exceeds 50 characters.")



                has_error = True



            



            if parsed_date is None:



                row_errors.append(f"Row {row_idx}: Invalid or missing PO Amendment Completion Date '{comp_date_raw or ''}'. Expected valid date format (DD/MM/YYYY or YYYY-MM-DD).")



                has_error = True







            if not comp_status:



                row_errors.append(f"Row {row_idx}: PO Amendment Completion Status is required.")



                has_error = True



            elif len(comp_status) > 50:



                row_errors.append(f"Row {row_idx}: PO Amendment Completion Status '{comp_status}' exceeds 50 characters.")



                has_error = True







            if has_error:



                continue







            match_key = (customer.lower(), po_no.lower(), site_name.lower())



            if match_key in seen_keys:



                row_errors.append(f"Row {row_idx}: Duplicate record for Customer '{customer}', PO No '{po_no}', Site Name '{site_name}' within uploaded file.")



                continue



            seen_keys.add(match_key)







            # Match Customer + PO No + Site Name against existing records



            matched_project = self.db.query(TelecomProject).filter(



                func.lower(TelecomProject.customer_name) == customer.lower(),



                TelecomProject.po_no == po_no,



                func.lower(TelecomProject.site_name) == site_name.lower()



            ).first()







            if not matched_project:



                row_errors.append(f"Row {row_idx}: No matching project found in telecom_project for Customer '{customer}', PO No '{po_no}', Site Name '{site_name}'.")



                continue







            updates_to_apply.append({



                "project": matched_project,



                "po_rev_no": po_rev_no,



                "completion_date": parsed_date,



                "completion_status": comp_status



            })







        if total_evaluated_rows == 0:



            raise HTTPException(



                status_code=status.HTTP_400_BAD_REQUEST,



                detail="No data rows found in uploaded file."



            )







        if updates_to_apply:



            try:



                for item in updates_to_apply:



                    proj = item["project"]



                    proj.po_revision_number = item["po_rev_no"]



                    proj.po_amendment_completion_date = item["completion_date"]



                    proj.po_amendment_completion_status = item["completion_status"]



                    if item["completion_status"].lower() in ["completed", "approved"]:



                        proj.po_status = "Amended"



                        proj.current_task = f"Amendment {item['completion_status']}"



                self.db.commit()



            except Exception as e:



                self.db.rollback()



                raise HTTPException(



                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,



                    detail=f"Database transaction failed: {str(e)}"



                )







        imported_count = len(updates_to_apply)



        error_count = len(row_errors)



        is_success = imported_count > 0







        summary_msg = f"Bulk upload processed: {imported_count} updated successfully, {error_count} row errors."







        return CommercialBulkUploadResponse(



            success=is_success,



            message=summary_msg,



            imported_count=imported_count,



            total_count=total_evaluated_rows,



            error_count=error_count,



            errors=row_errors



        )



    def get_project_expenses(self, po_no: Optional[str] = None, site_id: Optional[str] = None) -> List[Dict[str, Any]]:

        """

        Retrieves expenses from `project_expenses` table linked by `po_no` and/or `site_id`.

        """

        def _fmt_curr(val):

            if val is None:

                return "0.00"

            v = float(val)

            s, *d = f"{v:.2f}".split(".")

            dec = "." + d[0] if d else ".00"

            if len(s) <= 3:

                return s + dec

            last3 = s[-3:]

            rest = s[:-3]

            res = []

            while len(rest) > 2:

                res.append(rest[-2:])

                rest = rest[:-2]

            if rest:

                res.append(rest)

            res.reverse()

            return ",".join(res) + "," + last3 + dec



        query = self.db.query(ProjectExpense)

        if po_no and site_id:

            query = query.filter(or_(ProjectExpense.po_no == str(po_no).strip(), ProjectExpense.site_id == str(site_id).strip()))

        elif po_no:

            query = query.filter(ProjectExpense.po_no == str(po_no).strip())

        elif site_id:

            query = query.filter(ProjectExpense.site_id == str(site_id).strip())



        query = query.order_by(ProjectExpense.request_date.desc().nullslast(), ProjectExpense.expense_management_id.desc())

        expenses = query.all()



        results = []

        for exp in expenses:

            req_amt = float(exp.amount or 0)

            appr_amt = float(exp.approved_amount if exp.approved_amount is not None else req_amt)

            trans_amt = float(exp.transferred_amount if exp.transferred_amount is not None else 0)

            pay_amt = float(exp.payable_amount if exp.payable_amount is not None else 0)

            exp_qty = float(exp.qty) if exp.qty is not None else 1.0

            exp_rate = float(exp.rate) if exp.rate is not None else (appr_amt / exp_qty if exp_qty else appr_amt)



            results.append({

                "id": f"exp-{exp.expense_management_id}",

                "expenseId": exp.expense_management_id,

                "poNo": exp.po_no or "",

                "siteId": exp.site_id or "",

                "requestNumber": exp.request_number or "",

                "requestDate": exp.request_date.strftime("%d-%m-%Y") if exp.request_date else "",

                "requestBy": exp.request_by or "",

                "expenseType": exp.expense_type or exp.expense_head or exp.expense_name or "Operational Expenses",

                "expenseHead": exp.expense_head or "",

                "expenseName": exp.expense_name or "",

                "expenseDescription": exp.expense_description or "",

                "qty": exp_qty,

                "rate": exp_rate,

                "uom": exp.uom or "Nos",

                "rateApproved": appr_amt,

                "formatted_qty": f"{exp_qty:.2f}",

                "formatted_rate": _fmt_curr(exp_rate),

                "request": _fmt_curr(req_amt),

                "approved": _fmt_curr(appr_amt),

                "transferred": _fmt_curr(trans_amt),

                "payable": _fmt_curr(pay_amt),

                "raw_amount": req_amt,

                "raw_approved": appr_amt,

                "raw_transferred": trans_amt,

                "raw_payable": pay_amt,

                "transferTo": exp.transfer_to or "",

                "accountName": exp.account_name or "",

                "serviceVendorName": exp.service_vendor_name or "",

                "supplyVendorName": exp.supply_vendor_name or "",

                "gst": bool(exp.gst) if exp.gst is not None else False,

                "gstNumber": exp.gst_number or "",

                "legalName": exp.legal_name or exp.gst_name or "",

                "accountNumber": exp.account_number or "",

                "bankName": exp.bank_name or "",

                "ifscCode": exp.ifsc_code or "",

                "whatsappNumber": exp.whatsapp_number or "",

                "status": exp.status or ("Completed" if pay_amt == 0 and trans_amt > 0 else "Partially Transferred" if trans_amt > 0 else "Pending")

            })



        return results



    def get_po_line_items(self, po_no: str, query: Optional[str] = None) -> List[Dict[str, Any]]:

        """

        Retrieves Capex / Opex line items from `telecom_indus_po` for the specified `po_no`.

        """

        po_str = str(po_no).strip()

        proj = self.db.query(TelecomProject).filter(TelecomProject.po_no == po_str).first()

        po_type = proj.po_type if proj and proj.po_type else "Capex"



        q = self.db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_str)

        if query:

            clean_q = str(query).strip()

            q = q.filter(TelecomIndusPo.item_description.ilike(f"%{clean_q}%"))



        q = q.order_by(TelecomIndusPo.line_number.asc())

        items = q.all()



        results = []

        for it in items:

            results.append({

                "line_number": it.line_number,

                "item_description": it.item_description,

                "uom": it.uom or "Set",

                "qty": float(it.po_qty or 0),

                "rate": float(it.po_rate or 0),

                "amount": float(it.po_amount or 0),

                "po_type": po_type

            })



        return results



    def save_project_expense(self, data: Dict[str, Any]) -> Dict[str, Any]:

        """

        Creates or updates an expense row in `project_expenses`.

        """

        exp_id = data.get("expense_management_id") or data.get("expenseId")

        if not exp_id and data.get("id"):

            str_id = str(data["id"]).replace("exp-", "")

            if str_id.isdigit():

                exp_id = int(str_id)



        target_exp = None

        if exp_id:

            try:

                target_exp = self.db.query(ProjectExpense).filter(ProjectExpense.expense_management_id == int(exp_id)).first()

            except Exception:

                target_exp = None



        req_date = None

        if data.get("request_date"):

            try:

                req_date = datetime.strptime(str(data["request_date"])[:10], "%Y-%m-%d").date()

            except Exception:

                try:

                    req_date = datetime.strptime(str(data["request_date"])[:10], "%d-%m-%Y").date()

                except Exception:

                    req_date = None



        transfer_to_val = data.get("transfer_to") or data.get("transferTo") or ""

        account_name_val = data.get("account_name") or data.get("accountName") or ""

        service_vendor_name_val = data.get("service_vendor_name") or data.get("serviceVendorName") or ""

        supply_vendor_name_val = data.get("supply_vendor_name") or data.get("supplyVendorName") or ""

        gst_val = bool(data.get("gst", False))

        gst_number_val = data.get("gst_number") or data.get("gstNumber") or ""

        legal_name_val = data.get("legal_name") or data.get("legalName") or data.get("gst_name") or ""

        account_number_val = data.get("account_number") or data.get("accountNumber") or ""

        bank_name_val = data.get("bank_name") or data.get("bankName") or ""

        ifsc_code_val = data.get("ifsc_code") or data.get("ifscCode") or ""

        whatsapp_number_val = data.get("whatsapp_number") or data.get("whatsappNumber") or ""



        if target_exp:

            if "po_no" in data and data["po_no"]:

                target_exp.po_no = data["po_no"]

            if "site_id" in data and data["site_id"]:

                target_exp.site_id = data["site_id"]

            if "qty" in data and data["qty"] is not None:

                try:

                    target_exp.qty = float(data["qty"])

                except Exception:

                    pass

            if "rate" in data and data["rate"] is not None:

                try:

                    target_exp.rate = float(data["rate"])

                except Exception:

                    pass

            if "uom" in data and data["uom"]:

                target_exp.uom = str(data["uom"])

            if "amount" in data and data["amount"] is not None:

                try:

                    target_exp.amount = float(data["amount"])

                except Exception:

                    pass
            elif "qty" in data and target_exp.rate is not None:

                try:

                    target_exp.amount = float(target_exp.qty or 1.0) * float(target_exp.rate or 0.0)

                except Exception:

                    pass

            appr_val = data.get("approved_amount") if data.get("approved_amount") is not None else (data.get("rateApproved") if data.get("rateApproved") is not None else data.get("approved"))

            if appr_val is not None:

                try:

                    if isinstance(appr_val, str):

                        appr_val = float(appr_val.replace("₹", "").replace(",", "").strip() or 0)

                    target_exp.approved_amount = float(appr_val)

                except Exception:

                    pass

            if "transferred_amount" in data and data["transferred_amount"] is not None:

                try:

                    target_exp.transferred_amount = float(data["transferred_amount"])

                except Exception:

                    pass

            if "payable_amount" in data and data["payable_amount"] is not None:

                try:

                    target_exp.payable_amount = float(data["payable_amount"])

                except Exception:

                    pass
            else:

                target_exp.payable_amount = max(0.0, float(target_exp.approved_amount if target_exp.approved_amount is not None else (target_exp.amount or 0)) - float(target_exp.transferred_amount or 0))

            if "expense_head" in data and data["expense_head"]:

                target_exp.expense_head = data["expense_head"]

            if "expense_name" in data and data["expense_name"]:

                target_exp.expense_name = data["expense_name"]

            if "expense_description" in data and data["expense_description"]:

                target_exp.expense_description = data["expense_description"]

            if "request_number" in data and data["request_number"]:

                target_exp.request_number = data["request_number"]

            if "request_by" in data and data["request_by"]:

                target_exp.request_by = data["request_by"]



            if "transfer_to" in data or "transferTo" in data:

                target_exp.transfer_to = transfer_to_val

            if "account_name" in data or "accountName" in data:

                target_exp.account_name = account_name_val

            if "service_vendor_name" in data or "serviceVendorName" in data:

                target_exp.service_vendor_name = service_vendor_name_val

            if "supply_vendor_name" in data or "supplyVendorName" in data:

                target_exp.supply_vendor_name = supply_vendor_name_val

            if "gst" in data:

                target_exp.gst = gst_val

                target_exp.gst_expense = gst_val

            if "gst_number" in data or "gstNumber" in data:

                target_exp.gst_number = gst_number_val

            if "legal_name" in data or "legalName" in data or "gst_name" in data:

                target_exp.legal_name = legal_name_val

                target_exp.gst_name = legal_name_val

            if "account_number" in data or "accountNumber" in data:

                target_exp.account_number = account_number_val

            if "bank_name" in data or "bankName" in data:

                target_exp.bank_name = bank_name_val

            if "ifsc_code" in data or "ifscCode" in data:

                target_exp.ifsc_code = ifsc_code_val

            if "whatsapp_number" in data or "whatsappNumber" in data:

                target_exp.whatsapp_number = whatsapp_number_val



            if data.get("status"):

                target_exp.status = data["status"]



            self.db.commit()

            self.db.refresh(target_exp)



            return {

                "id": f"exp-{target_exp.expense_management_id}",

                "expenseId": target_exp.expense_management_id,

                "poNo": target_exp.po_no,

                "siteId": target_exp.site_id,

                "transferTo": target_exp.transfer_to,

                "accountName": target_exp.account_name,

                "serviceVendorName": target_exp.service_vendor_name,

                "supplyVendorName": target_exp.supply_vendor_name,

                "gst": target_exp.gst,

                "gstNumber": target_exp.gst_number,

                "legalName": target_exp.legal_name,

                "qty": float(target_exp.qty) if target_exp.qty is not None else 1.0,

                "rate": float(target_exp.rate) if target_exp.rate is not None else float(target_exp.amount or 0),

                "uom": target_exp.uom or "Nos",

                "amount": float(target_exp.amount or 0),

                "approved_amount": float(target_exp.approved_amount if target_exp.approved_amount is not None else (target_exp.amount or 0)),

                "payable_amount": float(target_exp.payable_amount if target_exp.payable_amount is not None else 0),

                "status": target_exp.status

            }



        req_amt = float(data.get("amount") or (float(data.get("rate", 0)) * float(data.get("qty", 1))) or 0)

        appr_amt = float(data.get("approved_amount") if data.get("approved_amount") is not None else req_amt)

        trans_amt = float(data.get("transferred_amount") if data.get("transferred_amount") is not None else 0)

        pay_amt = float(data.get("payable_amount") if data.get("payable_amount") is not None else max(0, appr_amt - trans_amt))



        new_exp = ProjectExpense(

            company_name=data.get("company_name", "Nexus"),

            customer_name=data.get("customer_name", "Indus Towers Ltd"),

            po_no=data.get("po_no"),

            site_id=data.get("site_id"),

            request_number=data.get("request_number", f"REQ-{datetime.now().strftime('%Y%m%d%H%M%S')}"),

            request_by=data.get("request_by", "Project Manager"),

            request_date=req_date or date.today(),

            expense_head=data.get("expense_head") or data.get("expense_type", "Operational Expenses"),

            expense_name=data.get("expense_name") or data.get("item_description", ""),

            expense_description=data.get("expense_description", ""),

            expense_type=data.get("expense_type", "Operational Expenses"),

            qty=data.get("qty", 1),

            rate=data.get("rate", req_amt),

            amount=req_amt,

            approved_amount=appr_amt,

            transferred_amount=trans_amt,

            payable_amount=pay_amt,

            transfer_to=transfer_to_val,

            account_name=account_name_val,

            service_vendor_name=service_vendor_name_val,

            supply_vendor_name=supply_vendor_name_val,

            gst=gst_val,

            gst_expense=gst_val,

            gst_number=gst_number_val,

            legal_name=legal_name_val,

            gst_name=legal_name_val,

            account_number=account_number_val,

            bank_name=bank_name_val,

            ifsc_code=ifsc_code_val,

            whatsapp_number=whatsapp_number_val,

            status=data.get("status") or ("Completed" if pay_amt == 0 and trans_amt > 0 else "Partially Transferred" if trans_amt > 0 else "Pending")

        )



        self.db.add(new_exp)

        self.db.commit()

        self.db.refresh(new_exp)



        return {

            "id": f"exp-{new_exp.expense_management_id}",

            "expenseId": new_exp.expense_management_id,

            "poNo": new_exp.po_no,

            "siteId": new_exp.site_id,

            "transferTo": new_exp.transfer_to,

            "accountName": new_exp.account_name,

            "serviceVendorName": new_exp.service_vendor_name,

            "supplyVendorName": new_exp.supply_vendor_name,

            "gst": new_exp.gst,

            "gstNumber": new_exp.gst_number,

            "legalName": new_exp.legal_name,

            "status": new_exp.status

        }



    def get_project_materials(self, po_no: Optional[str] = None, site_id: Optional[str] = None) -> List[Dict[str, Any]]:

        """

        Retrieves materials from `project_materials` in `Nexus_Project DB`.

        Maps:

          - mir -> request_qty

          - min -> dispatched_qty

          - mrr -> mrr_qty (jms - min)

          - mrn -> mrn_qty

          - net -> net_qty (min - mrn)

          - jms -> jms_qty from telecom_indus_po

          - difference -> difference_qty (jms - net)

          - rate -> rate

          - amount -> amount (net * rate)

        """

        def _fmt_curr(val: float) -> str:

            s = f"{float(val or 0):.2f}"

            parts = s.split(".")

            int_part = parts[0]

            dec = "." + parts[1]

            if len(int_part) <= 3:

                return int_part + dec

            last3 = int_part[-3:]

            rest = int_part[:-3]

            res = []

            while len(rest) > 2:

                res.append(rest[-2:])

                rest = rest[:-2]

            if rest:

                res.append(rest)

            res.reverse()

            return ",".join(res) + "," + last3 + dec



        def _fmt_num(val: float) -> str:

            return f"{float(val or 0):.2f}"



        query = self.db.query(ProjectMaterial)

        if po_no and site_id:

            query = query.filter(or_(ProjectMaterial.po_no == str(po_no).strip(), ProjectMaterial.site_id == str(site_id).strip()))

        elif po_no:

            query = query.filter(ProjectMaterial.po_no == str(po_no).strip())

        elif site_id:

            query = query.filter(ProjectMaterial.site_id == str(site_id).strip())



        materials = query.order_by(ProjectMaterial.material_management_id.asc()).all()

        # Pre-fetch telecom_project metadata by po_no / site_id
        proj_by_po = {}
        proj_by_site = {}
        for p in self.db.query(TelecomProject).all():
            if p.po_no:
                proj_by_po[str(p.po_no).strip()] = p
            if p.site_id:
                proj_by_site[str(p.site_id).strip()] = p

        # Pre-fetch telecom_indus_po items for jms_qty mapping
        po_items_map = {}
        if po_no:
            po_rows = self.db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == str(po_no).strip()).all()
            for r in po_rows:
                if r.item_description:
                    po_items_map[r.item_description.strip().lower()] = r
                if r.item_code:
                    po_items_map[r.item_code.strip().lower()] = r

        results = []
        for mat in materials:
            proj = proj_by_po.get((mat.po_no or "").strip()) or proj_by_site.get((mat.site_id or "").strip())
            desc_key = (mat.materials_name or "").strip().lower()
            po_item = po_items_map.get(desc_key)
            if not po_item and mat.materials_name:
                for k, v in po_items_map.items():
                    if k in desc_key or desc_key in k:
                        po_item = v
                        break

            req_qty = float(mat.request_qty or 0)
            disp_qty = float(mat.dispatched_qty or 0)
            mrn_qty = float(mat.mrn_qty or 0)
            net_qty = float(mat.net_qty if mat.net_qty is not None else (disp_qty - mrn_qty))
            
            jms_val = float(po_item.jms_qty if po_item and po_item.jms_qty is not None else (mat.jms_qty if getattr(mat, 'jms_qty', None) is not None else (float(mat.mrr_qty or 0) + disp_qty if mat.mrr_qty is not None else req_qty)))
            mrr_qty = float(mat.mrr_qty if mat.mrr_qty is not None else (jms_val - disp_qty))
            diff_qty = float(mat.difference_qty if mat.difference_qty is not None else (jms_val - net_qty))
            rate_val = float(mat.rate if mat.rate is not None and mat.rate > 0 else (po_item.po_rate if po_item else 0))
            amt_val = float(mat.amount if mat.amount is not None else (net_qty * rate_val))
            req_date_str = mat.request_date.strftime("%d/%m/%Y") if mat.request_date else ""
            ageing_val = f"{proj.po_ageing} Days" if (proj and proj.po_ageing is not None) else "12 Days"

            results.append({
                "id": f"mat-{mat.material_management_id}",
                "materialManagementId": mat.material_management_id,
                "poNo": mat.po_no or "",
                "siteId": mat.site_id or "",
                "siteName": (proj.site_name if proj and proj.site_name else (mat.site_id or "")),
                "projectId": (proj.project_code if proj and proj.project_code else ""),
                "projectType": (proj.project_type if proj and proj.project_type else ""),
                "subProjectType": (proj.sub_project_type if proj and proj.sub_project_type else ""),
                "requestBy": mat.request_by or "",
                "requestDate": req_date_str,
                "ageing": ageing_val,
                "materialType": mat.materials_type or "",
                "materialName": mat.materials_name or "",
                "boqName": mat.materials_name or "",
                "materialsDescription": mat.materials_description or "",
                "uom": (mat.uom or (po_item.uom if po_item else "Set")).upper(),
                "qty": _fmt_num(req_qty),
                "mir": _fmt_num(req_qty),
                "min": _fmt_num(disp_qty),
                "mrr": _fmt_num(mrr_qty),
                "mrn": _fmt_num(mrn_qty),
                "net": _fmt_num(net_qty),
                "jms": _fmt_num(jms_val),
                "difference": _fmt_num(diff_qty),
                "rate": _fmt_curr(rate_val),
                "amount": _fmt_curr(amt_val),
                "raw_mir": req_qty,
                "raw_min": disp_qty,
                "raw_mrr": mrr_qty,
                "raw_mrn": mrn_qty,
                "raw_net": net_qty,
                "raw_jms": jms_val,
                "raw_difference": diff_qty,
                "raw_rate": rate_val,
                "raw_amount": amt_val
            })

        return results



    def save_project_material(self, data: Dict[str, Any]) -> Dict[str, Any]:

        """

        Creates or updates a material row in `project_materials`.

        """

        mat_id = data.get("material_management_id") or data.get("materialManagementId")

        if not mat_id and data.get("id"):

            str_id = str(data["id"]).replace("mat-", "")

            if str_id.isdigit():

                mat_id = int(str_id)



        target_mat = None

        if mat_id:

            try:

                target_mat = self.db.query(ProjectMaterial).filter(ProjectMaterial.material_management_id == int(mat_id)).first()

            except Exception:

                target_mat = None



        mat_name = data.get("materials_name") or data.get("materialName") or data.get("boqName") or ""

        po_no = str(data.get("po_no") or "").strip()

        site_id = str(data.get("site_id") or "").strip()



        # Find line item in telecom_indus_po for jms_qty and rate

        po_item = None

        if po_no and mat_name:

            po_item = self.db.query(TelecomIndusPo).filter(

                TelecomIndusPo.po_no == po_no,

                or_(

                    TelecomIndusPo.item_description.ilike(f"%{mat_name}%"),

                    TelecomIndusPo.item_code.ilike(f"%{mat_name}%")

                )

            ).first()



        jms_val = float(po_item.jms_qty if po_item and po_item.jms_qty is not None else (data.get("jms_qty") or data.get("jms") or 0))

        rate_val = float(data.get("rate") if data.get("rate") is not None and float(data.get("rate") or 0) > 0 else (po_item.po_rate if po_item else 0))

        disp_val = float(data.get("dispatched_qty") if data.get("dispatched_qty") is not None else (data.get("min") or 0))

        mrn_val = float(data.get("mrn_qty") if data.get("mrn_qty") is not None else (data.get("mrn") or 0))

        req_val = float(data.get("request_qty") if data.get("request_qty") is not None else (data.get("mir") or 0))



        net_val = disp_val - mrn_val

        mrr_val = jms_val - disp_val

        diff_val = jms_val - net_val

        amt_val = net_val * rate_val



        uom_val = (data.get("uom") or (po_item.uom if po_item else "Set")).upper()



        if not target_mat and po_no and mat_name:

            target_mat = self.db.query(ProjectMaterial).filter(

                ProjectMaterial.po_no == po_no,

                ProjectMaterial.materials_name == mat_name

            ).first()



        if target_mat:

            target_mat.materials_name = mat_name

            target_mat.materials_description = mat_name

            target_mat.uom = uom_val

            target_mat.request_qty = req_val

            target_mat.dispatched_qty = disp_val

            target_mat.mrn_qty = mrn_val

            target_mat.net_qty = net_val

            target_mat.mrr_qty = mrr_val

            target_mat.jms_qty = jms_val
            target_mat.difference_qty = diff_val
            target_mat.rate = rate_val

            target_mat.amount = amt_val

        else:

            target_mat = ProjectMaterial(

                company_name=data.get("company_name", "Nexus"),

                customer_name=data.get("customer_name") or (po_item.customer_name if po_item else "Indus Towers Ltd"),

                po_no=po_no,

                site_id=site_id,

                materials_name=mat_name,

                materials_description=mat_name,

                uom=uom_val,

                request_qty=req_val,

                dispatched_qty=disp_val,

                mrn_qty=mrn_val,

                net_qty=net_val,

                mrr_qty=mrr_val,

                jms_qty=jms_val,
                difference_qty=diff_val,
                rate=rate_val,

                amount=amt_val

            )

            self.db.add(target_mat)



        self.db.commit()

        self.db.refresh(target_mat)



        return {

            "id": f"mat-{target_mat.material_management_id}",

            "materialManagementId": target_mat.material_management_id,

            "materialName": target_mat.materials_name,

            "boqName": target_mat.materials_name,

            "uom": target_mat.uom,

            "mir": req_val,

            "min": disp_val,

            "mrr": mrr_val,

            "mrn": mrn_val,

            "net": net_val,

            "jms": jms_val,

            "difference": diff_val,

            "rate": rate_val,

            "amount": amt_val

        }

