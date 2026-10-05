import io
import csv
from typing import List, Optional, Tuple, Dict, Any
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense import CompanyExpense
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseStatusUpdate,
    ExpenseResponse,
    ExpenseListResponse,
    parse_percentage_to_numeric,
    parse_boolean_field,
    parse_status_field
)

from sqlalchemy.exc import IntegrityError

class ExpenseService:
    def __init__(self, db: Session):
        self.repository = ExpenseRepository(db)

    def _to_response_dto(self, exp: CompanyExpense) -> ExpenseResponse:
        """Converts an ORM CompanyExpense model instance to an ExpenseResponse schema with dual field mappings."""
        gst_num = float(exp.gst_rate) if exp.gst_rate is not None else None
        gst_str = f"{int(gst_num)}%" if gst_num is not None and gst_num.is_integer() else (f"{gst_num}%" if gst_num is not None else "18%")
        
        # Determine depreciation rate string or fallback
        deprec_bool = bool(exp.depreciation)
        deprec_str = "10%" if deprec_bool else "0%"

        return ExpenseResponse(
            id=exp.expense_id,
            expense_id=exp.expense_id,
            expense_name=exp.expense_name or "",
            expenseName=exp.expense_name or "",
            expense_category=exp.expense_category or "",
            expenseCategory=exp.expense_category or "",
            expense_sub_category=exp.expense_description or "",
            expenseSubCategory=exp.expense_description or "",
            expense_head=exp.expense_head or "Capex",
            expenseHead=exp.expense_head or "Capex",
            gst_rate=gst_num,
            gst=gst_str,
            depreciation=deprec_bool,
            depreciation_rate=deprec_str,
            rcm=bool(exp.rcm),
            rcm_text="Yes" if exp.rcm else "No",
            status=exp.status or "Active",
            industry=exp.industry,
            company_name=exp.company_name,
            raiser=exp.raiser,
            expense_code=exp.expense_code,
            sac_code=exp.sac_code,
            expense_description=exp.expense_description,
            uom=exp.uom,
            created_at=exp.created_at,
            updated_at=exp.updated_at
        )

    def get_expenses_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        head: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "expense_id",
        sort_desc: bool = False
    ) -> ExpenseListResponse:
        page = max(1, page)
        page_size = max(1, min(page_size, 500))
        skip = (page - 1) * page_size

        items, total = self.repository.get_list(
            skip=skip,
            limit=page_size,
            search=search,
            category=category,
            head=head,
            status=status_filter,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        response_items = [self._to_response_dto(item) for item in items]
        return ExpenseListResponse(
            total=total,
            items=response_items,
            page=page,
            page_size=page_size
        )

    def get_expense_by_id(self, expense_id: int) -> ExpenseResponse:
        exp = self.repository.get_by_id(expense_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )
        return self._to_response_dto(exp)

    def create_expense(self, data: ExpenseCreate) -> ExpenseResponse:
        # Business rule validations
        name = (data.expense_name or data.expenseName or "").strip()
        if not name:
            raise HTTPException(
                status_code=422,
                detail="Expense Name is required."
            )

        # Check duplicate expense name
        if self.repository.get_by_name(name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Expense name already exists."
            )

        category = (data.expense_category or data.expenseCategory or "").strip()
        sub_category = (data.expense_sub_category or data.expenseSubCategory or "").strip()
        head = (data.expense_head or data.expenseHead or "Capex").strip()

        # Capex vs Opex business logic
        depreciation_input = data.depreciation if data.depreciation is not None else data.depreciation_rate
        if head.lower() == "capex":
            is_deprec = parse_boolean_field(depreciation_input) or (
                isinstance(depreciation_input, str) and depreciation_input.strip() not in ("0%", "0", "")
            )
        else:
            is_deprec = False  # Opex expenses do not incur depreciation

        gst_numeric = parse_percentage_to_numeric(data.gst_rate if data.gst_rate is not None else data.gst)
        if gst_numeric is None:
            gst_numeric = Decimal("18.00")

        rcm_bool = parse_boolean_field(data.rcm)
        status_val = parse_status_field(data.status)

        # Generate or validate expense code
        exp_code = data.expense_code or f"EXP-{head[:3].upper()}-{abs(hash(name)) % 1000:03d}"
        if data.expense_code and self.repository.get_by_code(data.expense_code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Expense code already exists."
            )

        new_expense = CompanyExpense(
            expense_name=name,
            expense_category=category or "Direct Operations",
            expense_description=sub_category or data.expense_description or name,
            expense_head=head,
            depreciation=is_deprec,
            gst_rate=gst_numeric,
            rcm=rcm_bool,
            status=status_val,
            industry=data.industry or "Telecom",
            company_name=data.company_name or "Nexus",
            raiser=data.raiser,
            expense_code=exp_code,
            sac_code=data.sac_code or "998313",
            uom=data.uom or "Nos"
        )

        try:
            saved = self.repository.create(new_expense)
            return self._to_response_dto(saved)
        except IntegrityError as e:
            self.repository.db.rollback()
            err_str = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
            if "expense_code" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense code already exists."
                )
            elif "expense_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense name already exists."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense record already exists."
                )

    def update_expense(self, expense_id: int, data: ExpenseUpdate) -> ExpenseResponse:
        exp = self.repository.get_by_id(expense_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )

        name = data.expense_name or data.expenseName
        if name is not None and name.strip():
            name_clean = name.strip()
            existing_with_name = self.repository.get_by_name(name_clean, exclude_id=expense_id)
            if existing_with_name:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense name already exists."
                )
            exp.expense_name = name_clean

        if data.expense_code is not None and data.expense_code.strip():
            code_clean = data.expense_code.strip()
            existing_with_code = self.repository.get_by_code(code_clean, exclude_id=expense_id)
            if existing_with_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense code already exists."
                )
            exp.expense_code = code_clean

        category = data.expense_category or data.expenseCategory
        if category is not None:
            exp.expense_category = category.strip()

        sub_category = data.expense_sub_category or data.expenseSubCategory
        if sub_category is not None:
            exp.expense_description = sub_category.strip()

        head = data.expense_head or data.expenseHead
        if head is not None:
            exp.expense_head = head.strip()

        # Capex vs Opex business logic for depreciation
        if exp.expense_head and exp.expense_head.lower() == "capex":
            deprec_val = data.depreciation if data.depreciation is not None else data.depreciation_rate
            if deprec_val is not None:
                exp.depreciation = parse_boolean_field(deprec_val) or (
                    isinstance(deprec_val, str) and deprec_val.strip() not in ("0%", "0", "")
                )
        else:
            exp.depreciation = False

        gst_input = data.gst_rate if data.gst_rate is not None else data.gst
        if gst_input is not None:
            parsed_gst = parse_percentage_to_numeric(gst_input)
            if parsed_gst is not None:
                exp.gst_rate = parsed_gst

        if data.rcm is not None:
            exp.rcm = parse_boolean_field(data.rcm)

        if data.status is not None:
            exp.status = parse_status_field(data.status)

        if data.sac_code is not None:
            exp.sac_code = data.sac_code
        if data.uom is not None:
            exp.uom = data.uom
        if data.industry is not None:
            exp.industry = data.industry
        if data.company_name is not None:
            exp.company_name = data.company_name

        try:
            updated = self.repository.update(exp)
            return self._to_response_dto(updated)
        except IntegrityError as e:
            self.repository.db.rollback()
            err_str = str(e.orig).lower() if hasattr(e, 'orig') else str(e).lower()
            if "expense_code" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense code already exists."
                )
            elif "expense_name" in err_str:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense name already exists."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expense record already exists."
                )

    def update_status(self, expense_id: int, status_data: ExpenseStatusUpdate) -> ExpenseResponse:
        exp = self.repository.get_by_id(expense_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )

        if status_data.is_active is not None:
            exp.status = "Active" if status_data.is_active else "In - Active"
        elif status_data.status is not None:
            exp.status = parse_status_field(status_data.status)

        updated = self.repository.update(exp)
        return self._to_response_dto(updated)

    def delete_expense(self, expense_id: int) -> Dict[str, Any]:
        exp = self.repository.get_by_id(expense_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )
        self.repository.delete(exp)
        return {"success": True, "message": f"Expense {expense_id} deleted successfully."}

    def process_bulk_upload(self, file_content: bytes, filename: str = "") -> Dict[str, Any]:
        """Parses Excel (.xlsx/.xls) or CSV content and bulk-inserts records into company_expenses."""
        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        rows_dict_list: List[Dict[str, Any]] = []
        raw_headers: List[str] = []
        is_excel = filename.lower().endswith((".xlsx", ".xls")) or file_content.startswith(b"PK\x03\x04")

        if is_excel:
            try:
                import openpyxl
                wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)
                sheet = wb.active
                if sheet is None:
                    raise ValueError("Excel file contains no active sheet.")
                
                for col in range(1, sheet.max_column + 1):
                    val = sheet.cell(1, col).value
                    raw_headers.append(str(val).strip() if val is not None else f"col_{col}")

                for row_idx in range(2, sheet.max_row + 1):
                    row_data = {}
                    has_data = False
                    for col_idx, header in enumerate(raw_headers, start=1):
                        cell_val = sheet.cell(row_idx, col_idx).value
                        if cell_val is not None and str(cell_val).strip():
                            has_data = True
                        row_data[header] = cell_val
                    if has_data:
                        rows_dict_list.append(row_data)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid Excel file or corrupted workbook: {str(e)}"
                )
        else:
            try:
                try:
                    decoded = file_content.decode("utf-8-sig")
                except UnicodeDecodeError:
                    decoded = file_content.decode("latin-1")
                
                reader = csv.DictReader(io.StringIO(decoded))
                raw_headers = reader.fieldnames or []
                for r in reader:
                    if any(v and str(v).strip() for v in r.values()):
                        rows_dict_list.append(r)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to read CSV file: {str(e)}"
                )

        # Template Header Validation
        import re
        def norm(h: str) -> str:
            return re.sub(r'[^a-zA-Z0-9]', '', str(h)).lower()

        norm_headers = [norm(h) for h in raw_headers if h is not None]
        # Match either Company Expenses template headers or generic expense headers
        has_expense_head = any("head" in nh for nh in norm_headers)
        has_expense_desc_or_name = any("expense" in nh or "desc" in nh or "name" in nh for nh in norm_headers)

        if not (has_expense_head and has_expense_desc_or_name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Expense Upload Template. Please use the official Expense Upload Template."
            )

        if not rows_dict_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No expense data rows found in uploaded file."
            )

        new_records: List[CompanyExpense] = []
        row_errors: List[str] = []
        incoming_names: List[str] = []

        for idx, row in enumerate(rows_dict_list, start=2):
            try:
                def get_val(*keys: str, default: Any = None) -> Any:
                    for k in keys:
                        if k in row and row[k] is not None:
                            return row[k]
                        k_norm = norm(k)
                        for rk, rv in row.items():
                            if rv is not None and norm(rk) == k_norm:
                                return rv
                    return default

                exp_name = str(get_val("Expense Description", "Expense Name", "Description", "ExpenseDescription", "ExpenseName", "Name", default="") or "").strip()
                if not exp_name:
                    exp_type = str(get_val("Expense Type", "Type", default="") or "").strip()
                    exp_name = exp_type or f"Expense Item {idx}"

                category = str(get_val("Expense Categry", "Expense Category", "Category", default="Direct Operations") or "Direct Operations").strip()
                sub_category = str(get_val("Expense Type", "Expense Sub-Category", "Sub-Category", default="") or "").strip()
                head = str(get_val("Accounts Head", "Expense Head", "Head", default="Capex") or "Capex").strip()
                gst_val = get_val("GST", "GST Rate", default="18%")
                gst_num = parse_percentage_to_numeric(gst_val) or Decimal("18.00")
                rcm_val = parse_boolean_field(get_val("RCM", default="No"))
                status_val = parse_status_field(get_val("Status", default="Active"))
                exp_code = str(get_val("Expense Code", "Expense ID", "Code", default="") or "").strip() or f"EXP-{head[:3].upper()}-{idx:04d}"
                sac_code = str(get_val("SAC Code", "SAC", default="998313") or "998313").strip()
                uom = str(get_val("Uom", "UOM", default="Nos") or "Nos").strip()

                is_deprec = (head.lower() == "capex") and parse_boolean_field(get_val("Depreciation", default="No"))

                record = CompanyExpense(
                    expense_name=exp_name,
                    expense_category=category,
                    expense_description=sub_category or exp_name,
                    expense_head=head,
                    depreciation=is_deprec,
                    gst_rate=gst_num,
                    rcm=rcm_val,
                    status=status_val,
                    expense_code=exp_code,
                    sac_code=sac_code,
                    uom=uom,
                    company_name="Nexus",
                    industry="Telecom"
                )
                new_records.append(record)
                incoming_names.append(exp_name)
            except Exception as e:
                row_errors.append(f"Row {idx}: {str(e)}")

        if not new_records and row_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse records: {'; '.join(row_errors[:5])}"
            )

        # Idempotency check: if all incoming expense names already exist in DB
        if incoming_names:
            existing_count = self.repository.db.query(CompanyExpense).filter(
                CompanyExpense.expense_name.in_(incoming_names)
            ).count()
            if existing_count == len(incoming_names):
                return {
                    "success": True,
                    "imported_count": len(incoming_names),
                    "is_retry": True,
                    "message": "Upload already processed. No duplicate records created.",
                    "errors": []
                }

        try:
            self.repository.bulk_create(new_records)
        except Exception as e:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during bulk insert: {str(e)}"
            )

        return {
            "success": True,
            "imported_count": len(new_records),
            "errors": row_errors
        }
