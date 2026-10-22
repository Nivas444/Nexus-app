import io
import os
import openpyxl
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo

client = TestClient(app)

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "bulk upload template")
PROJECT_TPL_PATH = os.path.join(TEMPLATE_DIR, "New Project - Project Template.xlsx")
PO_TPL_PATH = os.path.join(TEMPLATE_DIR, "New Project - PO Template.xlsx")

COMMERCIAL_TOKEN = "nxtkn_commercial" # Or valid login token


@pytest.fixture(autouse=True)
def cleanup_test_records():
    """Ensure test data with prefix 'TEST_' is cleaned up before and after each test."""
    db: Session = ProjectSessionLocal()
    try:
        db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.like("TEST_%")).delete(synchronize_session=False)
        db.query(TelecomProject).filter(TelecomProject.po_no.like("TEST_%")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()
    yield
    db = ProjectSessionLocal()
    try:
        db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.like("TEST_%")).delete(synchronize_session=False)
        db.query(TelecomProject).filter(TelecomProject.po_no.like("TEST_%")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def test_template_files_exist_and_protected():
    """Verify official templates exist, have sheet protection enabled, headers locked, and data rows unlocked."""
    assert os.path.exists(PROJECT_TPL_PATH), f"Project template not found at {PROJECT_TPL_PATH}"
    assert os.path.exists(PO_TPL_PATH), f"PO template not found at {PO_TPL_PATH}"

    # Project template check
    wb_proj = openpyxl.load_workbook(PROJECT_TPL_PATH)
    ws_proj = wb_proj["New Project & PO"] if "New Project & PO" in wb_proj.sheetnames else wb_proj.active
    assert ws_proj.protection.sheet is True, "Project template sheet protection should be True"
    assert ws_proj.cell(1, 1).protection.locked is True, "Project header A1 should be locked"
    assert ws_proj.cell(2, 1).protection.locked is False, "Project data cell A2 should be unlocked"

    # PO template check
    wb_po = openpyxl.load_workbook(PO_TPL_PATH)
    ws_po = wb_po["New Project & PO"] if "New Project & PO" in wb_po.sheetnames else wb_po.active
    assert ws_po.protection.sheet is True, "PO template sheet protection should be True"
    assert ws_po.cell(1, 1).protection.locked is True, "PO header A1 should be locked"
    assert ws_po.cell(2, 1).protection.locked is False, "PO data cell A2 should be unlocked"


def test_bulk_upload_valid_project():
    """Verify valid Project rows persist to telecom_project table."""
    wb = openpyxl.load_workbook(PROJECT_TPL_PATH)
    ws = wb.active

    # Insert test data in rows 2 and 3
    # Headers: Customer, PO No, PO Date, PO Type, Project ID, Project Type, Sub-Project Type, Site ID, Site Name, PO Amount
    ws.cell(row=2, column=1, value="Indus Towers Ltd")
    ws.cell(row=2, column=2, value="TEST_PO_PRJ_001")
    ws.cell(row=2, column=3, value="15/10/2026")
    ws.cell(row=2, column=4, value="Capex")
    ws.cell(row=2, column=5, value="TEST_PRJ_001")
    ws.cell(row=2, column=6, value="New Build")
    ws.cell(row=2, column=7, value="Civil")
    ws.cell(row=2, column=8, value="TEST_SITE_001")
    ws.cell(row=2, column=9, value="Test Guindy Site")
    ws.cell(row=2, column=10, value=250000.50)

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/projects/bulk-upload",
        files={"file": ("New Project - Project Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["success"] is True
    assert data["imported_count"] == 1

    # Verify database persistence
    db = ProjectSessionLocal()
    try:
        rec = db.query(TelecomProject).filter_by(po_no="TEST_PO_PRJ_001").first()
        assert rec is not None
        assert rec.customer_name == "Indus Towers Ltd"
        assert rec.site_id == "TEST_SITE_001"
        assert rec.po_type == "Capex"
        assert float(rec.po_amount) == 250000.50
    finally:
        db.close()


def test_bulk_upload_valid_po():
    """Verify valid PO rows persist to telecom_indus_po table."""
    wb = openpyxl.load_workbook(PO_TPL_PATH)
    ws = wb.active

    # Headers: PO No, Site ID, Line No, Item Code, Description, Uom, Qty, Rate, GST, Amount
    ws.cell(row=2, column=1, value="TEST_PO_001")
    ws.cell(row=2, column=2, value="TEST_SITE_001")
    ws.cell(row=2, column=3, value="10")
    ws.cell(row=2, column=4, value="TEST_ITEM_100")
    ws.cell(row=2, column=5, value="Tower Leg 40M")
    ws.cell(row=2, column=6, value="Nos")
    ws.cell(row=2, column=7, value=4)
    ws.cell(row=2, column=8, value=12500)
    ws.cell(row=2, column=9, value=9000)
    ws.cell(row=2, column=10, value=59000)

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("New Project - PO Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["success"] is True
    assert data["imported_count"] == 1

    # Verify database persistence
    db = ProjectSessionLocal()
    try:
        rec = db.query(TelecomIndusPo).filter_by(po_no="TEST_PO_001", site_id="TEST_SITE_001", item_code="TEST_ITEM_100").first()
        assert rec is not None
        assert float(rec.po_qty) == 4.0
        assert float(rec.po_rate) == 12500.0
        assert float(rec.gst_amount) == 9000.0
        assert float(rec.po_total_amount) == 59000.0
    finally:
        db.close()


def test_duplicate_item_code_in_same_file_rejected():
    """Verify duplicate (PO No, Site ID, Item Code) within one file is rejected."""
    wb = openpyxl.load_workbook(PO_TPL_PATH)
    ws = wb.active

    # Row 2: first occurrence
    ws.cell(row=2, column=1, value="TEST_PO_DUP")
    ws.cell(row=2, column=2, value="TEST_SITE_DUP")
    ws.cell(row=2, column=3, value="10")
    ws.cell(row=2, column=4, value="ITEM_DUPLICATE")

    # Row 3: duplicate (same PO, same Site, same Item Code)
    ws.cell(row=3, column=1, value="TEST_PO_DUP")
    ws.cell(row=3, column=2, value="TEST_SITE_DUP")
    ws.cell(row=3, column=3, value="20")
    ws.cell(row=3, column=4, value="ITEM_DUPLICATE")

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("New Project - PO Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 400
    assert "Duplicate Item Code" in response.text
    assert "ITEM_DUPLICATE" in response.text


def test_duplicate_item_code_against_db_rejected():
    """Verify duplicate (PO No, Site ID, Item Code) against existing committed DB records is rejected."""
    # First, insert a committed record in DB
    db = ProjectSessionLocal()
    try:
        existing = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no="TEST_PO_EXISTING",
            site_id="TEST_SITE_EXISTING",
            item_code="ITEM_EXISTING_1"
        )
        db.add(existing)
        db.commit()
    finally:
        db.close()

    # Now attempt to upload the same (PO, Site, Item Code)
    wb = openpyxl.load_workbook(PO_TPL_PATH)
    ws = wb.active
    ws.cell(row=2, column=1, value="TEST_PO_EXISTING")
    ws.cell(row=2, column=2, value="TEST_SITE_EXISTING")
    ws.cell(row=2, column=4, value="ITEM_EXISTING_1")

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("New Project - PO Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 400
    assert "Duplicate Item Code 'ITEM_EXISTING_1' already exists in database" in response.text


def test_same_item_code_different_po_or_site_accepted():
    """Verify the business rule: same Item Code is accepted if PO No or Site ID differs."""
    wb = openpyxl.load_workbook(PO_TPL_PATH)
    ws = wb.active

    # PO001 + SITE001 + ITEM100 (Accept)
    ws.cell(row=2, column=1, value="TEST_PO_A")
    ws.cell(row=2, column=2, value="TEST_SITE_A")
    ws.cell(row=2, column=4, value="ITEM_REUSED")

    # PO001 + SITE001 + ITEM200 (Accept: different item)
    ws.cell(row=3, column=1, value="TEST_PO_A")
    ws.cell(row=3, column=2, value="TEST_SITE_A")
    ws.cell(row=3, column=4, value="ITEM_OTHER")

    # PO002 + SITE001 + ITEM100 (Accept: different PO)
    ws.cell(row=4, column=1, value="TEST_PO_B")
    ws.cell(row=4, column=2, value="TEST_SITE_A")
    ws.cell(row=4, column=4, value="ITEM_REUSED")

    # PO001 + SITE002 + ITEM100 (Accept: different Site)
    ws.cell(row=5, column=1, value="TEST_PO_A")
    ws.cell(row=5, column=2, value="TEST_SITE_B")
    ws.cell(row=5, column=4, value="ITEM_REUSED")

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("New Project - PO Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["imported_count"] == 4


def test_transaction_rollback_leaves_no_partial_records():
    """Verify that a batch with one error rolls back completely, leaving 0 records inserted."""
    wb = openpyxl.load_workbook(PO_TPL_PATH)
    ws = wb.active

    # Valid row
    ws.cell(row=2, column=1, value="TEST_PO_ROLLBACK")
    ws.cell(row=2, column=2, value="TEST_SITE_ROLLBACK")
    ws.cell(row=2, column=4, value="ITEM_GOOD")

    # Invalid row (missing Item Code)
    ws.cell(row=3, column=1, value="TEST_PO_ROLLBACK")
    ws.cell(row=3, column=2, value="TEST_SITE_ROLLBACK")
    ws.cell(row=3, column=4, value="") # Missing

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    response = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("New Project - PO Template.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert response.status_code == 400

    # Verify that row 2 was NOT committed to the database
    db = ProjectSessionLocal()
    try:
        count = db.query(TelecomIndusPo).filter_by(po_no="TEST_PO_ROLLBACK").count()
        assert count == 0, f"Expected 0 records due to transaction rollback, but found {count}"
    finally:
        db.close()


def test_incorrect_template_rejected():
    """Verify uploading wrong template headers is rejected with 400 Bad Request."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.cell(row=1, column=1, value="Wrong Header 1")
    ws.cell(row=1, column=2, value="Wrong Header 2")
    ws.cell(row=2, column=1, value="val1")
    ws.cell(row=2, column=2, value="val2")

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)

    # Attempt to upload to project endpoint
    res_proj = client.post(
        "/api/v1/commercial/projects/bulk-upload",
        files={"file": ("wrong.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert res_proj.status_code == 400
    assert "Invalid Project template" in res_proj.text

    # Attempt to upload to PO endpoint
    res_po = client.post(
        "/api/v1/commercial/po/bulk-upload",
        files={"file": ("wrong.xlsx", bio.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert res_po.status_code == 400
    assert "Invalid PO template" in res_po.text


def test_get_commercial_projects_list():
    """Verify GET /api/v1/commercial/projects returns projects formatted for New Project worklist."""
    # Insert a test project
    db = ProjectSessionLocal()
    try:
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Test Customer Ltd",
            po_no="TEST_PO_LIST_1",
            project_code="TEST_PRJ_LIST_1",
            site_id="TEST_SITE_LIST_1",
            site_name="Test Site Name",
            project_type="New Build",
            sub_project_type="Civil",
            po_type="Capex",
            po_amount=150000
        )
        db.add(proj)
        db.commit()
    finally:
        db.close()

    res = client.get("/api/v1/commercial/projects")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    matching = [it for it in data["items"] if it["poNo"] == "TEST_PO_LIST_1"]
    assert len(matching) == 1
    assert matching[0]["customerName"] == "Test Customer Ltd"
    assert matching[0]["poType"] == "Capex"
    assert matching[0]["projectId"] == "TEST_PRJ_LIST_1"
