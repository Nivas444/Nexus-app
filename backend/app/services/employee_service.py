import re
import io
import csv
import openpyxl
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.employee import CompanyEmployee, CompanyEmployeeDocument
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import (
    CompanyEmployeeCreate,
    CompanyEmployeeUpdate,
    CompanyEmployeeStatusUpdate,
    CompanyEmployeeResponse,
    CompanyEmployeeListResponse,
    CompanyEmployeeDocumentMetadata,
    parse_status_field,
    parse_date_field,
    parse_experience_field
)

# Standardized document type mapping
DOCUMENT_TYPE_MAP: Dict[str, str] = {
    "qualification": "qualification",
    "pan": "pan",
    "pan_number": "pan",
    "aadhar": "aadhaar",
    "aadhaar": "aadhaar",
    "aadhaar_number": "aadhaar",
    "driving_license": "driving_license",
    "drivinglicense": "driving_license",
    "dl": "driving_license",
    "dl_number": "driving_license",
    "passport": "passport",
    "passport_number": "passport",
    "passportnumber": "passport",
    "epf": "epf_uan",
    "epf_uan": "epf_uan",
    "epfuan": "epf_uan",
    "esi": "esi_id",
    "esi_id": "esi_id",
    "esiid": "esi_id",
    "esi_code": "esi_id",
    "esicode": "esi_id"
}

DOCUMENT_COLUMN_MAP: Dict[str, str] = {
    "qualification": "qualification_documents",
    "pan": "pan_documents",
    "aadhaar": "aadhaar_documents",
    "driving_license": "dl_documents",
    "passport": "passport_documents",
    "epf_uan": "epf_documents",
    "esi_id": "esi_documents"
}

# Maximum allowed PDF upload size (10 MB)
MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024


def format_exp_str(exp_val: Optional[Decimal]) -> Optional[str]:
    """Formats decimal years (e.g. 2.5) to '02 - 06' (YYYY - MM) string."""
    if exp_val is None:
        return None
    try:
        total_months = int(round(float(exp_val) * 12))
        years = total_months // 12
        months = total_months % 12
        return f"{years:02d} - {months:02d}"
    except Exception:
        return str(exp_val)


class EmployeeService:
    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)

    def _to_response_dto(self, emp: CompanyEmployee, docs: Optional[List[CompanyEmployeeDocument]] = None) -> CompanyEmployeeResponse:
        """Converts an ORM CompanyEmployee model instance to a CompanyEmployeeResponse DTO."""
        if docs is None:
            docs = self.repository.get_documents_by_employee_id(emp.employee_id)

        doc_metas = [
            CompanyEmployeeDocumentMetadata(
                id=d.id,
                employee_id=d.employee_id,
                document_type=d.document_type,
                file_name=d.file_name,
                mime_type=d.mime_type,
                file_size=d.file_size,
                uploaded_at=d.uploaded_at
            )
            for d in docs
        ]

        prev_exp_str = format_exp_str(emp.previous_experience)
        curr_exp_str = format_exp_str(emp.current_experience)
        tot_exp_str = format_exp_str(emp.total_experience)

        return CompanyEmployeeResponse(
            employee_id=emp.employee_id,
            id=emp.employee_id,
            company_name=emp.company_name or "Nexus",
            photo=emp.photo,
            employee_type=emp.employee_type or "On-Roll",
            empType=emp.employee_type or "On-Roll",
            designation=emp.designation or "",
            employee_code=emp.employee_code or "",
            employeeId=emp.employee_code or str(emp.employee_id),
            id_card=emp.id_card,
            employee_name=emp.employee_name or "",
            employeeName=emp.employee_name or "",
            address=emp.address or "",
            mobile_number=emp.mobile_number or "",
            contactNumber=emp.mobile_number or "",
            email=emp.email or "",
            dob=emp.dob,
            blood_group=emp.blood_group or "A+",
            bloodGroup=emp.blood_group or "A+",
            marital_status=emp.marital_status or "Single",
            maritalStatus=emp.marital_status or "Single",
            qualification=emp.qualification or "",
            qualification_documents=emp.qualification_documents,
            pan_number=emp.pan_number or "",
            pan=emp.pan_number or "",
            aadhaar_number=emp.aadhaar_number or "",
            aadhar=emp.aadhaar_number or "",
            dl_number=emp.dl_number or "",
            drivingLicense=emp.dl_number or "",
            passport_number=emp.passport_number or "",
            passportNumber=emp.passport_number or "",
            epf_available=emp.epf_available or False,
            epf_uan=emp.epf_uan or "",
            epfUan=emp.epf_uan or "",
            esi_code_available=emp.esi_code_available or False,
            esi_code=emp.esi_code or "",
            esiId=emp.esi_code or "",
            esiCode=emp.esi_code or "",
            medical_insurance_available=emp.medical_insurance_available or False,
            medical_insurance_policy_number=emp.medical_insurance_policy_number or "",
            previous_experience=emp.previous_experience,
            prevExp=prev_exp_str,
            current_experience=emp.current_experience,
            currentExp=curr_exp_str,
            total_experience=emp.total_experience,
            totalExp=tot_exp_str,
            doj=emp.doj,
            geo_attendance=bool(emp.geo_attendance),
            geoAttendance=bool(emp.geo_attendance),
            status=emp.status or "Active",
            created_at=emp.created_at,
            updated_at=emp.updated_at,
            documents=doc_metas
        )

    def get_employees(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        employee_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> CompanyEmployeeListResponse:
        records = self.repository.get_all(skip, limit, search, employee_type, status)
        total = self.repository.count_all(search, employee_type, status)
        items = [self._to_response_dto(emp) for emp in records]
        return CompanyEmployeeListResponse(items=items, total=total, skip=skip, limit=limit)

    def get_employee_by_id(self, employee_id: int) -> CompanyEmployeeResponse:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )
        return self._to_response_dto(emp)

    def create_employee(self, payload: CompanyEmployeeCreate) -> CompanyEmployeeResponse:
        emp_name = payload.employee_name or payload.employeeName or "New Employee"
        emp_code = payload.employee_code or payload.employeeId or payload.empId

        # Check unique employee code
        if emp_code:
            existing_code = self.repository.get_by_code(emp_code)
            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Employee ID/Code '{emp_code}' already exists. Please use a unique Employee ID."
                )

        # Parse and sanitize date fields
        dob_date = parse_date_field(payload.dob)
        doj_date = parse_date_field(payload.doj)

        # Parse experience fields
        prev_exp = parse_experience_field(payload.previous_experience or payload.prevExp)
        curr_exp = parse_experience_field(payload.current_experience or payload.currentExp)
        tot_exp = parse_experience_field(payload.total_experience or payload.totalExp)

        status_val = parse_status_field(payload.status)

        db_dict = {
            "company_name": payload.company_name or "Nexus",
            "photo": payload.photo,
            "employee_type": payload.employee_type or payload.empType or "On-Roll",
            "designation": payload.designation,
            "employee_code": emp_code,
            "id_card": payload.id_card,
            "employee_name": emp_name,
            "address": payload.address,
            "mobile_number": payload.mobile_number or payload.contactNumber,
            "email": payload.email,
            "dob": dob_date,
            "blood_group": payload.blood_group or payload.bloodGroup or "A+",
            "marital_status": payload.marital_status or payload.maritalStatus or "Single",
            "qualification": payload.qualification,
            "pan_number": payload.pan_number or payload.pan,
            "aadhaar_number": payload.aadhaar_number or payload.aadhaar or payload.aadhar,
            "dl_number": payload.dl_number or payload.drivingLicense,
            "passport_number": payload.passport_number or payload.passportNumber,
            "epf_available": bool(payload.epf_available or payload.epf_uan or payload.epfUan),
            "epf_uan": payload.epf_uan or payload.epfUan,
            "esi_code_available": bool(payload.esi_code_available or payload.esi_code or payload.esiId or payload.esiCode),
            "esi_code": payload.esi_code or payload.esiId or payload.esiCode,
            "medical_insurance_available": bool(payload.medical_insurance_available or payload.medical_insurance_policy_number),
            "medical_insurance_policy_number": payload.medical_insurance_policy_number,
            "previous_experience": prev_exp,
            "current_experience": curr_exp,
            "total_experience": tot_exp,
            "doj": doj_date,
            "bio_data": payload.bio_data,
            "appointment_letter": payload.appointment_letter,
            "relieving_letter": payload.relieving_letter,
            "experience_certificate": payload.experience_certificate,
            "geo_attendance": bool(payload.geo_attendance or payload.geoAttendance),
            "status": status_val,
            "e_signature": payload.e_signature
        }

        try:
            created = self.repository.create(db_dict)
            return self._to_response_dto(created)
        except IntegrityError as ie:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Database conflict occurred when creating employee: {str(ie.orig) if hasattr(ie, 'orig') else str(ie)}"
            )
        except Exception as e:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create employee record: {str(e)}"
            )

    def update_employee(self, employee_id: int, payload: CompanyEmployeeUpdate) -> CompanyEmployeeResponse:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )

        emp_code = payload.employee_code or payload.employeeId or payload.empId
        if emp_code and emp_code != emp.employee_code:
            existing_code = self.repository.get_by_code(emp_code, exclude_id=employee_id)
            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Employee ID/Code '{emp_code}' already in use by another employee."
                )

        update_dict: Dict[str, Any] = {}

        if payload.employee_name or payload.employeeName:
            update_dict["employee_name"] = payload.employee_name or payload.employeeName
        if emp_code:
            update_dict["employee_code"] = emp_code
        if payload.employee_type or payload.empType or payload.employeeType:
            update_dict["employee_type"] = payload.employee_type or payload.empType or payload.employeeType
        if payload.designation is not None:
            update_dict["designation"] = payload.designation
        if payload.address is not None:
            update_dict["address"] = payload.address
        if payload.mobile_number or payload.contactNumber or payload.mobileNumber:
            update_dict["mobile_number"] = payload.mobile_number or payload.contactNumber or payload.mobileNumber
        if payload.email is not None:
            update_dict["email"] = payload.email
        if payload.blood_group or payload.bloodGroup:
            update_dict["blood_group"] = payload.blood_group or payload.bloodGroup
        if payload.marital_status or payload.maritalStatus:
            update_dict["marital_status"] = payload.marital_status or payload.maritalStatus
        if payload.qualification is not None:
            update_dict["qualification"] = payload.qualification
        if payload.pan_number is not None or payload.pan is not None:
            update_dict["pan_number"] = payload.pan_number if payload.pan_number is not None else payload.pan
        if payload.aadhaar_number is not None or payload.aadhaar is not None or payload.aadhar is not None:
            update_dict["aadhaar_number"] = payload.aadhaar_number if payload.aadhaar_number is not None else (payload.aadhaar if payload.aadhaar is not None else payload.aadhar)
        if payload.dl_number is not None or payload.drivingLicense is not None:
            update_dict["dl_number"] = payload.dl_number if payload.dl_number is not None else payload.drivingLicense
        if payload.passport_number is not None or payload.passportNumber is not None:
            update_dict["passport_number"] = payload.passport_number if payload.passport_number is not None else payload.passportNumber
        if payload.epf_uan is not None or payload.epfUan is not None:
            val = payload.epf_uan if payload.epf_uan is not None else payload.epfUan
            update_dict["epf_uan"] = val
            update_dict["epf_available"] = bool(val and str(val).strip())
        if payload.esi_code is not None or payload.esiId is not None or payload.esiCode is not None:
            val = payload.esi_code if payload.esi_code is not None else (payload.esiId if payload.esiId is not None else payload.esiCode)
            update_dict["esi_code"] = val
            update_dict["esi_code_available"] = bool(val and str(val).strip())
        if payload.medical_insurance_policy_number is not None:
            update_dict["medical_insurance_policy_number"] = payload.medical_insurance_policy_number
            update_dict["medical_insurance_available"] = bool(payload.medical_insurance_policy_number and str(payload.medical_insurance_policy_number).strip())
        if payload.dob is not None:
            update_dict["dob"] = parse_date_field(payload.dob)
        if payload.doj is not None:
            update_dict["doj"] = parse_date_field(payload.doj)
        if payload.previous_experience is not None or payload.prevExp is not None:
            update_dict["previous_experience"] = parse_experience_field(payload.previous_experience if payload.previous_experience is not None else payload.prevExp)
        if payload.current_experience is not None or payload.currentExp is not None:
            update_dict["current_experience"] = parse_experience_field(payload.current_experience if payload.current_experience is not None else payload.currentExp)
        if payload.total_experience is not None or payload.totalExp is not None:
            update_dict["total_experience"] = parse_experience_field(payload.total_experience if payload.total_experience is not None else payload.totalExp)
        if payload.geo_attendance is not None or payload.geoAttendance is not None:
            update_dict["geo_attendance"] = bool(payload.geo_attendance if payload.geo_attendance is not None else payload.geoAttendance)
        if payload.status is not None:
            update_dict["status"] = parse_status_field(payload.status)

        try:
            updated = self.repository.update(emp, update_dict)
            return self._to_response_dto(updated)
        except IntegrityError as ie:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Database conflict updating employee: {str(ie.orig) if hasattr(ie, 'orig') else str(ie)}"
            )
        except Exception as e:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update employee: {str(e)}"
            )

    def update_status(self, employee_id: int, payload: CompanyEmployeeStatusUpdate) -> CompanyEmployeeResponse:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )
        status_val = parse_status_field(payload.status)
        updated = self.repository.update(emp, {"status": status_val})
        return self._to_response_dto(updated)

    def delete_employee(self, employee_id: int) -> Dict[str, Any]:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )
        name = emp.employee_name
        self.repository.delete(emp)
        return {"success": True, "message": f"Employee '{name}' (ID: #{employee_id}) deleted successfully."}

    # --- Document Services ---

    def validate_and_normalize_doc_type(self, raw_type: str) -> str:
        """Validates and maps document type string to canonical type."""
        clean = raw_type.strip().lower().replace("-", "_").replace(" ", "_")
        if clean not in DOCUMENT_TYPE_MAP:
            allowed = ", ".join(sorted(set(DOCUMENT_TYPE_MAP.values())))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type '{raw_type}'. Allowed document types: {allowed}"
            )
        return DOCUMENT_TYPE_MAP[clean]

    def validate_pdf_content(self, file_bytes: bytes, file_name: str, content_type: Optional[str]) -> None:
        """Validates PDF file content, magic bytes signature, MIME type, and size limit."""
        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        if len(file_bytes) > MAX_PDF_SIZE_BYTES:
            max_mb = MAX_PDF_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size ({round(len(file_bytes)/(1024*1024), 2)} MB) exceeds maximum allowed limit of {max_mb} MB."
            )

        # Check file extension
        if not file_name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents (.pdf) are permitted for employee document upload."
            )

        # Validate PDF magic bytes header %PDF-
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file. The file does not contain a valid PDF header signature."
            )

    def upload_document(
        self,
        employee_id: int,
        document_type: str,
        file_name: str,
        content_type: str,
        file_bytes: bytes
    ) -> CompanyEmployeeDocumentMetadata:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )

        doc_type_canonical = self.validate_and_normalize_doc_type(document_type)
        self.validate_pdf_content(file_bytes, file_name, content_type)

        try:
            doc = self.repository.upsert_document(
                employee_id=employee_id,
                document_type=doc_type_canonical,
                file_name=file_name,
                mime_type="application/pdf",
                file_size=len(file_bytes),
                file_data=file_bytes
            )

            # Update document filename reference on employee table if column exists
            col_name = DOCUMENT_COLUMN_MAP.get(doc_type_canonical)
            if col_name and hasattr(emp, col_name):
                self.repository.update(emp, {col_name: file_name})

            return CompanyEmployeeDocumentMetadata(
                id=doc.id,
                employee_id=doc.employee_id,
                document_type=doc.document_type,
                file_name=doc.file_name,
                mime_type=doc.mime_type,
                file_size=doc.file_size,
                uploaded_at=doc.uploaded_at
            )
        except Exception as e:
            self.repository.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store employee PDF document: {str(e)}"
            )

    def get_employee_documents(self, employee_id: int) -> List[CompanyEmployeeDocumentMetadata]:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )
        docs = self.repository.get_documents_by_employee_id(employee_id)
        return [
            CompanyEmployeeDocumentMetadata(
                id=d.id,
                employee_id=d.employee_id,
                document_type=d.document_type,
                file_name=d.file_name,
                mime_type=d.mime_type,
                file_size=d.file_size,
                uploaded_at=d.uploaded_at
            )
            for d in docs
        ]

    def download_document(self, employee_id: int, document_type: str) -> Tuple[str, str, bytes]:
        emp = self.repository.get_by_id(employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID #{employee_id} not found."
            )
        doc_type_canonical = self.validate_and_normalize_doc_type(document_type)
        doc = self.repository.get_document_by_type(employee_id, doc_type_canonical)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No '{doc_type_canonical}' PDF document found for employee #{employee_id}."
            )
        return doc.file_name, doc.mime_type, bytes(doc.file_data)

    def process_bulk_upload(self, file_content: bytes, filename: str = "", upload_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses Excel (.xlsx/.xls) or CSV content and bulk-inserts employee records
        into PostgreSQL `company_employee_details` table with full transaction safety,
        official template structure validation, DOB/DOJ date validation, and idempotent retry support.
        """
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

        # 1. Structure & Official Header Validation
        def normalize_header(h: str) -> str:
            s = re.sub(r'[^a-zA-Z0-9]', '', str(h)).lower()
            if s == "martialstatus":
                s = "maritalstatus"
            if s in ("drivinglicense", "drivinglicence", "dl"):
                s = "drivinglicence"
            if s in ("email", "emailaddress", "emailid"):
                s = "emailid"
            if s in ("aadhaarnumber", "aadharnumber", "aadhaar", "aadhar"):
                s = "aadharnumber"
            if s.startswith("esiipnumber") or s.startswith("esicode") or s.startswith("esi"):
                s = "esiipnumber"
            if s.startswith("epfuan") or s.startswith("epf"):
                s = "epfuan"
            if s.startswith("previousexperience") or s.startswith("prevexp"):
                s = "previousexperience"
            return s

        norm_headers = [normalize_header(h) for h in raw_headers if h is not None]
        required_canonical = ["employeetype", "employeename", "employeeid", "dob", "doj", "status"]
        for req in required_canonical:
            if req not in norm_headers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Employee Upload Template. Please use the official Employee Upload Template."
                )

        if not rows_dict_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No employee data rows found in uploaded file."
            )

        new_records: List[CompanyEmployee] = []
        row_errors: List[str] = []
        seen_codes: set = set()
        incoming_codes: List[str] = []

        for idx, row in enumerate(rows_dict_list, start=2):
            try:
                def get_val(*keys: str, default: Any = None) -> Any:
                    for k in keys:
                        if k in row and row[k] is not None:
                            return row[k]
                        k_norm = normalize_header(k)
                        for rk, rv in row.items():
                            if rv is not None and normalize_header(rk) == k_norm:
                                return rv
                    return default

                emp_name = str(get_val("Employee Name", "EmployeeName", "Name", default="") or "").strip()
                emp_code = str(get_val("Employee ID", "Employee Code", "EmployeeID", "EmployeeCode", "ID", default="") or "").strip()
                emp_type_raw = str(get_val("Employee Type", "EmployeeType", default="On-Roll") or "On-Roll").strip()
                emp_type = "Contract" if "contract" in emp_type_raw.lower() else "On-Roll"

                if not emp_name:
                    row_errors.append(f"Row {idx}: Missing Employee Name")
                    continue

                if not emp_code:
                    emp_code = f"EMP-{idx:04d}"

                if emp_code in seen_codes:
                    row_errors.append(f"Row {idx}: Duplicate Employee ID '{emp_code}' within the uploaded file")
                    continue
                seen_codes.add(emp_code)
                incoming_codes.append(emp_code)

                # Dates
                dob_raw = get_val("DOB", "Date of Birth", "Birth Date")
                doj_raw = get_val("DOJ", "Date of Joining", "Joining Date")
                dob_date = parse_date_field(dob_raw)
                doj_date = parse_date_field(doj_raw)

                # Experience
                prev_exp_raw = get_val("Previous Experience", "PreviousExperience", "Prev Exp")
                prev_exp = parse_experience_field(prev_exp_raw)

                # Other text fields
                address = str(get_val("Address", default="") or "").strip() or None
                mobile = str(get_val("Mobile Number", "MobileNumber", "Mobile", "Contact Number", default="") or "").strip() or None
                email = str(get_val("E - Mail ID", "E-Mail ID", "Email", "Email ID", default="") or "").strip() or None
                blood_group = str(get_val("Blood Group", "BloodGroup", default="A+") or "A+").strip()
                marital_status = str(get_val("Martial Status", "Marital Status", "MaritalStatus", default="Single") or "Single").strip()
                designation = str(get_val("Designation", default="") or "").strip() or None
                qualification = str(get_val("Qualification", default="") or "").strip() or None
                pan = str(get_val("PAN Number", "PAN", default="") or "").strip() or None
                aadhaar = str(get_val("Aadhar Number", "Aadhaar Number", "Aadhar", "Aadhaar", default="") or "").strip() or None
                dl = str(get_val("Driving Licence", "Driving License", "DL Number", default="") or "").strip() or None
                passport = str(get_val("Passport Number", "Passport", default="") or "").strip() or None

                epf_uan = str(get_val("EPF UAN", "EPF", "UAN", default="") or "").strip() or None
                esi_code = str(get_val("ESI IP Number  ", "ESI IP Number", "ESI Code", "ESI", default="") or "").strip() or None

                geo_attendance_raw = get_val("Geo Attendance", "GeoAttendance", default=False)
                if isinstance(geo_attendance_raw, bool):
                    geo_attendance = geo_attendance_raw
                else:
                    geo_attendance = str(geo_attendance_raw or "").strip().lower() in ("yes", "true", "1", "y")

                status_raw = get_val("Status", default="Active")
                status_val = parse_status_field(status_raw)

                emp_record = CompanyEmployee(
                    company_name="Nexus",
                    employee_type=emp_type,
                    employee_name=emp_name,
                    employee_code=emp_code,
                    address=address,
                    mobile_number=mobile,
                    email=email,
                    dob=dob_date,
                    blood_group=blood_group,
                    marital_status=marital_status,
                    doj=doj_date,
                    designation=designation,
                    previous_experience=prev_exp,
                    qualification=qualification,
                    pan_number=pan,
                    aadhaar_number=aadhaar,
                    dl_number=dl,
                    passport_number=passport,
                    epf_available=bool(epf_uan),
                    epf_uan=epf_uan,
                    esi_code_available=bool(esi_code),
                    esi_code=esi_code,
                    geo_attendance=geo_attendance,
                    status=status_val
                )
                new_records.append(emp_record)
            except Exception as row_ex:
                row_errors.append(f"Row {idx}: {str(row_ex)}")

        if not new_records and row_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process records: {'; '.join(row_errors[:5])}"
            )

        # 2. Idempotent Retry Check: If all incoming employee codes already exist in DB
        if incoming_codes:
            existing_count = self.repository.db.query(CompanyEmployee).filter(
                CompanyEmployee.employee_code.in_(incoming_codes)
            ).count()
            if existing_count == len(incoming_codes):
                # All records from this batch already exist -> Safe retry return
                return {
                    "success": True,
                    "imported_count": len(incoming_codes),
                    "is_retry": True,
                    "message": "Upload already processed. No duplicate records created.",
                    "errors": []
                }

        # 3. Atomic Database Insertion
        try:
            self.repository.bulk_create(new_records)
        except IntegrityError as ie:
            self.repository.db.rollback()
            err_msg = str(ie.orig) if hasattr(ie, 'orig') else str(ie)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Duplicate Employee record conflict during bulk upload: {err_msg}"
            )
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
