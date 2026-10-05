from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.indus_infra_repository import IndusInfraRepository
from app.schemas.indus_infra import (
    IndusInfraCreate,
    IndusInfraUpdate,
    IndusInfraResponse,
    IndusInfraListResponse
)

def _format_infra_response(item) -> IndusInfraResponse:
    comm_str = item.commissioning.isoformat() if item.commissioning else "No"
    return IndusInfraResponse(
        item_infrastructure_detail_id=item.item_infrastructure_detail_id,
        id=item.item_infrastructure_detail_id,
        company_name=item.company_name,
        customer_name=item.customer_name,
        customerName=item.customer_name,
        item_code=item.item_code,
        infra_category=item.infra_category,
        infraCategory=item.infra_category,
        infra_description=item.infra_description,
        infraDescription=item.infra_description,
        uom=item.uom,
        make=item.make,
        commissioning=comm_str,
        i_map=item.i_map,
        iMap=item.i_map,
        status=item.status,
        created_at=item.created_at,
        updated_at=item.updated_at
    )

class IndusInfraService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IndusInfraRepository(db)

    def get_infra_list(
        self,
        page: int = 1,
        page_size: int = 100,
        search: Optional[str] = None,
        customer_name: Optional[str] = None,
        status_filter: Optional[str] = None,
        infra_category: Optional[str] = None,
        sort_by: str = "item_infrastructure_detail_id",
        sort_desc: bool = False
    ) -> IndusInfraListResponse:
        items, total, total_pages = self.repo.get_all(
            page=page,
            page_size=page_size,
            search=search,
            customer_name=customer_name,
            status=status_filter,
            infra_category=infra_category,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

        formatted_items = [_format_infra_response(item) for item in items]

        return IndusInfraListResponse(
            items=formatted_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    def get_infra_by_id(self, item_id: int) -> IndusInfraResponse:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )
        return _format_infra_response(item)

    def create_infra(self, payload: IndusInfraCreate) -> IndusInfraResponse:
        cat = payload.infra_category or payload.infraCategory
        if not cat or not cat.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Infra Category is required."
            )

        db_obj = self.repo.create(payload)
        return _format_infra_response(db_obj)

    def update_infra(self, item_id: int, payload: IndusInfraUpdate) -> IndusInfraResponse:
        db_obj = self.repo.get_by_id(item_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )

        updated_obj = self.repo.update(db_obj, payload)
        return _format_infra_response(updated_obj)

    def delete_infra(self, item_id: int) -> dict:
        deleted = self.repo.delete(item_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Infrastructure record with ID {item_id} not found."
            )
        return {"success": True, "message": f"Infrastructure record {item_id} deleted successfully."}

    def process_bulk_upload(self, file_content: bytes, filename: str = "") -> dict:
        """Parses Excel or CSV content and bulk-inserts records into indus_customer_infra."""
        import io
        import csv
        import re
        from app.models.indus_infra import IndusCustomerInfra
        from app.repositories.indus_infra_repository import parse_commissioning_value, resolve_customer_name

        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        rows_dict_list = []
        raw_headers = []
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

        def norm(h: str) -> str:
            return re.sub(r'[^a-zA-Z0-9]', '', str(h)).lower()

        norm_headers = [norm(h) for h in raw_headers if h is not None]
        # Must have category/infra and commissioning/imap/make/itemcode
        has_infra_structure = any("itemcategry" in nh or "category" in nh or "infracategory" in nh for nh in norm_headers) and any("commissioning" in nh or "imap" in nh or "make" in nh for nh in norm_headers)

        if not has_infra_structure:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Infra Upload Template. Please use the official Infra Upload Template."
            )

        if not rows_dict_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Infra data rows found in uploaded file."
            )

        new_records = []
        row_errors = []
        incoming_codes = []

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

                cust_name = resolve_customer_name(self.db, str(get_val("Customer", default="Indus Tower Ltd") or "Indus Tower Ltd"))
                item_code = str(get_val("Item Code", "ItemCode", default="") or "").strip()
                cat = str(get_val("Item Categry", "Item Category", "Infra Category", default="Infra Item") or "Infra Item").strip()
                desc = str(get_val("Item Description", "Infra Description", "Description", default="") or "").strip() or cat
                make = str(get_val("Make", default="") or "").strip()
                uom = str(get_val("Uom", "UOM", default="Nos") or "Nos").strip()
                comm_raw = get_val("Commissioning", default="No")
                comm_date = parse_commissioning_value(comm_raw)
                imap = str(get_val("I - Map Entry", "IMapEntry", "I-Map", "IMap", default="No") or "No").strip()

                infra_record = IndusCustomerInfra(
                    company_name="Nexus",
                    customer_name=cust_name,
                    item_code=item_code if item_code else None,
                    infra_category=cat,
                    infra_description=desc,
                    make=make if make else None,
                    uom=uom,
                    commissioning=comm_date,
                    i_map=imap,
                    status="Active"
                )
                new_records.append(infra_record)
                if item_code:
                    incoming_codes.append(item_code)
            except Exception as e:
                row_errors.append(f"Row {idx}: {str(e)}")

        if not new_records and row_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse records: {'; '.join(row_errors[:5])}"
            )

        # Idempotency check: if all incoming item_codes already exist in DB
        if incoming_codes:
            existing_count = self.db.query(IndusCustomerInfra).filter(
                IndusCustomerInfra.item_code.in_(incoming_codes)
            ).count()
            if existing_count == len(incoming_codes):
                return {
                    "success": True,
                    "imported_count": len(incoming_codes),
                    "is_retry": True,
                    "message": "Upload already processed. No duplicate records created.",
                    "errors": []
                }

        try:
            self.repo.bulk_create(new_records)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during bulk insert: {str(e)}"
            )

        return {
            "success": True,
            "imported_count": len(new_records),
            "errors": row_errors
        }

