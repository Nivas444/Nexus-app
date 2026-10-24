import csv
import io
import re
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict, Any, Optional, Set, Tuple

import openpyxl
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.commercial_project import TelecomProject, TelecomIndusPo
from app.schemas.commercial_project import (
    CommercialProjectItem,
    CommercialProjectListResponse,
    CommercialBulkUploadResponse
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

    def get_projects_list(self) -> CommercialProjectListResponse:
        """
        Fetch real project records from `telecom_project` in `Nexus_Project DB`.
        """
        projects = self.db.query(TelecomProject).order_by(TelecomProject.project_id.desc()).all()
        items: List[CommercialProjectItem] = []
        today = date.today()

        for p in projects:
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
                task=p.current_task or "",
                raBill=False,
                selected=False,
                completionDate=p.completion_date.strftime("%d/%m/%Y") if p.completion_date else None
            ))

        return CommercialProjectListResponse(items=items, total=len(items))

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

            task_display = p.current_task or ""
            if not task_display:
                if p.po_amendment_completion_status:
                    task_display = f"Amendment {p.po_amendment_completion_status}"
                else:
                    task_display = "To be submit"

            formatted_amount = f"₹ {float(p.po_amount):,.2f}" if p.po_amount is not None else "₹ 0.00"
            status_display = p.po_status or ("Amended" if p.po_amendment_completion_status else "Amend Requested")

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
                poAmendmentCompletionDate=completion_date_str,
                poAmendmentCompletionStatus=p.po_amendment_completion_status,
                poStatus=status_display,
                amount=formatted_amount
            ))

        return CommercialProjectListResponse(items=items, total=len(items))

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

