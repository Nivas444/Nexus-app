"""
Shared Bulk Upload Utility for Master Modules.

Provides:
1. Temporary cache-file staging (never stores uploaded files in DB) with guaranteed cleanup
   in a `finally` block after extraction finishes.
2. Unified parsing for `.xlsx`, `.xls`, and `.csv` files.
3. Strict template-header validation against the official downloadable template headers.
"""

import csv
import os
import re
import tempfile
from typing import Any, Dict, List, Optional, Sequence, Tuple

import openpyxl
from fastapi import HTTPException, status


DEFAULT_HEADER_ALIASES: Dict[str, str] = {
    # Common spelling variants / typos present in official downloadable templates
    "materialcategry": "materialcategory",
    "expensecategry": "expensecategory",
    "itemcategry": "itemcategory",
    "martialstatus": "maritalstatus",
    "lattitude": "latitude",
    "longtitude": "longitude",
    "drivinglicense": "drivinglicence",
    "aadharnumber": "aadhaarnumber",
    "aadhar": "aadhaarnumber",
    "aadhaar": "aadhaarnumber",
    "email": "emailid",
    "emailaddress": "emailid",
    "budgetrs": "budget",
    "budgetamount": "budget",
    "budgetinr": "budget",
    "budget": "budget",
    "imapeentry": "imapentry",
    "imap": "imapentry",
    "itemtype": "itemtype",
    "hsnsac": "hsnsac",
    "hsnsaccode": "hsnsaccode",
}


def normalize_bulk_header(header: Any, extra_aliases: Optional[Dict[str, str]] = None) -> str:
    """Normalize a template column header for reliable comparison."""
    raw = str(header or "").strip()
    # Special-case Budget (%) vs Budget (₹) before stripping symbols so they stay distinct!
    raw_lower = raw.lower()
    if "budget" in raw_lower:
        if "%" in raw_lower or "percent" in raw_lower:
            return "budgetpercent"
        return "budgetamount"

    cleaned = re.sub(r"[^a-zA-Z0-9]", "", raw).lower()
    if extra_aliases and cleaned in extra_aliases:
        cleaned = extra_aliases[cleaned]
    if cleaned in DEFAULT_HEADER_ALIASES:
        cleaned = DEFAULT_HEADER_ALIASES[cleaned]
    return cleaned


def extract_bulk_upload_rows(
    file_content: bytes,
    filename: str,
    template_label: str,
    expected_header_sets: Sequence[Sequence[str]],
    extra_aliases: Optional[Dict[str, str]] = None,
) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Stages uploaded bytes into a temporary cache file, parses `.xlsx`/`.xls`/`.csv`,
    strictly validates that the uploaded headers match one of `expected_header_sets`
    (the downloadable template headers), and deletes the temporary cache file immediately
    in a `finally` block.

    Returns:
        (raw_headers, rows_dict_list)
    """
    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    lower_name = (filename or "").lower()
    is_excel = lower_name.endswith((".xlsx", ".xls")) or file_content.startswith(b"PK\x03\x04")
    is_csv = lower_name.endswith(".csv") or not is_excel

    if lower_name and not lower_name.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a .xlsx, .xls, or .csv file matching the official template.",
        )

    suffix = ".xlsx" if is_excel else ".csv"
    tmp_path: Optional[str] = None
    raw_headers: List[str] = []
    rows_dict_list: List[Dict[str, Any]] = []

    try:
        # Stage in temporary local cache file (never persisted in DB)
        with tempfile.NamedTemporaryFile(prefix="nexus_bulk_cache_", suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name

        if is_excel:
            wb = None
            try:
                wb = openpyxl.load_workbook(tmp_path, data_only=True)
                sheet = wb.active
                if sheet is None:
                    raise ValueError("Excel file contains no active sheet.")

                # Read row 1 headers, stripping embedded newlines & trailing empty columns
                col_headers: List[Tuple[int, str]] = []
                for col in range(1, sheet.max_column + 1):
                    val = sheet.cell(1, col).value
                    if val is not None and str(val).strip():
                        clean_h = str(val).replace("\r", " ").replace("\n", " ").strip()
                        col_headers.append((col, clean_h))

                raw_headers = [h for _, h in col_headers]

                for row_idx in range(2, sheet.max_row + 1):
                    row_data: Dict[str, Any] = {}
                    has_data = False
                    for col_idx, header in col_headers:
                        cell_val = sheet.cell(row_idx, col_idx).value
                        if cell_val is not None and str(cell_val).strip():
                            has_data = True
                        row_data[header] = cell_val
                    if has_data:
                        rows_dict_list.append(row_data)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid Excel file or corrupted workbook: {str(e)}",
                )
            finally:
                if wb is not None:
                    try:
                        wb.close()
                    except Exception:
                        pass
        elif is_csv:
            try:
                try:
                    with open(tmp_path, "r", encoding="utf-8-sig", newline="") as fh:
                        content_str = fh.read()
                except UnicodeDecodeError:
                    with open(tmp_path, "r", encoding="latin-1", newline="") as fh:
                        content_str = fh.read()

                import io
                reader = csv.DictReader(io.StringIO(content_str))
                fieldnames = [
                    str(h).replace("\r", " ").replace("\n", " ").strip()
                    for h in (reader.fieldnames or [])
                    if h is not None and str(h).strip()
                ]
                raw_headers = fieldnames
                for r in reader:
                    cleaned_row: Dict[str, Any] = {}
                    has_data = False
                    for k, v in r.items():
                        if k is None or not str(k).strip():
                            continue
                        ck = str(k).replace("\r", " ").replace("\n", " ").strip()
                        if v is not None and str(v).strip():
                            has_data = True
                        cleaned_row[ck] = v
                    if has_data:
                        rows_dict_list.append(cleaned_row)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to read CSV file: {str(e)}",
                )
    finally:
        # Always remove temporary cache file immediately after extraction
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    # Strict Header Validation against official downloadable template(s)
    uploaded_norm = [normalize_bulk_header(h, extra_aliases) for h in raw_headers if h]
    uploaded_set = set(uploaded_norm)

    matched = False
    best_missing: List[str] = []
    best_unexpected: List[str] = []
    best_score = 10**9

    for expected_headers in expected_header_sets:
        exp_norm_map = {normalize_bulk_header(h, extra_aliases): h for h in expected_headers}
        exp_set = set(exp_norm_map.keys())
        missing = [orig for norm_k, orig in exp_norm_map.items() if norm_k not in uploaded_set]
        unexpected = [
            raw_h
            for raw_h in raw_headers
            if normalize_bulk_header(raw_h, extra_aliases) not in exp_set
        ]
        if not missing and not unexpected:
            matched = True
            break
        score = len(missing) + len(unexpected)
        if score < best_score:
            best_score = score
            best_missing = missing
            best_unexpected = unexpected

    if not matched:
        parts = [f"Invalid {template_label} Upload Template. Uploaded file headers must match the downloadable template."]
        if best_missing:
            parts.append(f"Missing columns: {', '.join(best_missing[:5])}{'...' if len(best_missing) > 5 else ''}.")
        if best_unexpected:
            parts.append(f"Unexpected columns: {', '.join(best_unexpected[:5])}{'...' if len(best_unexpected) > 5 else ''}.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=" ".join(parts),
        )

    if not rows_dict_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No {template_label} data rows found in uploaded file.",
        )

    return raw_headers, rows_dict_list
