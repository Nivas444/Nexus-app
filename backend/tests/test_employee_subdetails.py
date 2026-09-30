import io
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_bank_details_crud_and_pdf():
    unique_ts = int(time.time() * 1000)
    # 1. Create Bank Detail
    payload = {
        "account_name": f"Nexus Tech Operations {unique_ts}",
        "account_number": f"987654{unique_ts % 1000000}",
        "bank_name": "HDFC Bank",
        "ifsc_code": "HDFC0001234",
        "account_type": "Current",
        "responsible": "Finance Lead",
        "status": "Active"
    }
    create_res = client.post("/api/v1/master/employee-bank-details", json=payload)
    assert create_res.status_code == 201, create_res.text
    created = create_res.json()
    assert created["account_name"] == f"Nexus Tech Operations {unique_ts}"
    assert created["bank_name"] == "HDFC Bank"
    bank_id = created["employee_bank_account_id"]
    assert bank_id is not None

    # 2. Get Bank Detail by ID
    get_res = client.get(f"/api/v1/master/employee-bank-details/{bank_id}")
    assert get_res.status_code == 200
    assert get_res.json()["account_name"] == f"Nexus Tech Operations {unique_ts}"

    # 3. Update Bank Detail (Edit)
    update_payload = {
        "bank_name": "HDFC Bank Ltd",
        "status": "De-Active"
    }
    put_res = client.put(f"/api/v1/master/employee-bank-details/{bank_id}", json=update_payload)
    assert put_res.status_code == 200
    assert put_res.json()["bank_name"] == "HDFC Bank Ltd"
    assert put_res.json()["status"] == "De-Active"
    assert put_res.json()["employee_bank_account_id"] == bank_id  # Same record, not a new one!

    # 4. Upload Account PDF Document
    pdf_content = b"%PDF-1.4 sample bank account document binary content for testing"
    files = {"file": ("bank_passbook.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_res = client.post(f"/api/v1/master/employee-bank-details/{bank_id}/document", files=files)
    assert upload_res.status_code == 201, upload_res.text
    doc_meta = upload_res.json()
    assert doc_meta["file_name"] == "bank_passbook.pdf"
    assert doc_meta["bank_detail_id"] == bank_id

    # 5. Download Account PDF Document
    dl_res = client.get(f"/api/v1/master/employee-bank-details/{bank_id}/document")
    assert dl_res.status_code == 200
    assert dl_res.content == pdf_content
    assert dl_res.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="bank_passbook.pdf"' in dl_res.headers.get("content-disposition", "")

    # 6. Reject invalid PDF (non-PDF header)
    bad_files = {"file": ("fake.pdf", io.BytesIO(b"NOT A REAL PDF CONTENT"), "application/pdf")}
    bad_res = client.post(f"/api/v1/master/employee-bank-details/{bank_id}/document", files=bad_files)
    assert bad_res.status_code == 415


def test_asset_details_add_and_total():
    unique_ts = int(time.time() * 1000)
    # 1. Add Asset 1
    asset1 = {
        "asset_details": f"MacBook Pro M3 {unique_ts}",
        "serial_number": f"MBP-2026-{unique_ts % 10000}",
        "uom": "Nos",
        "qty": 2,
        "rate": 150000.00,
        "amount": 300000.00,
        "date": "2026-01-15",
        "expiry_date": "2029-01-15"
    }
    res1 = client.post("/api/v1/master/employee-assets", json=asset1)
    assert res1.status_code == 201, res1.text
    data1 = res1.json()
    assert float(data1["amount"]) == 300000.00

    # 2. Add Asset 2
    asset2 = {
        "asset_details": f"Dell 27-inch 4K Monitor {unique_ts}",
        "serial_number": f"MON-4K-{unique_ts % 10000}",
        "uom": "Nos",
        "qty": 1,
        "rate": 45000.00,
        "amount": 45000.00,
        "date": "2026-02-01"
    }
    res2 = client.post("/api/v1/master/employee-assets", json=asset2)
    assert res2.status_code == 201, res2.text

    # 3. Retrieve All Assets
    list_res = client.get("/api/v1/master/employee-assets")
    assert list_res.status_code == 200
    assets = list_res.json()
    assert len(assets) >= 2

    # 4. Check Total Sum
    total_res = client.get("/api/v1/master/employee-assets/total")
    assert total_res.status_code == 200
    total_data = total_res.json()
    assert float(total_data["total_amount"]) >= 345000.00


def test_salary_details_add():
    unique_ts = int(time.time() * 1000)
    # Add Salary Structure
    salary_payload = {
        "from_date": "2026-01-01",
        "to_date": "2026-12-31",
        "gross_salary": 60000.00,
        "basic_salary": 33000.00,
        "hra": 15000.00,
        "da": 7200.00,
        "sa": 4800.00,
        "status": "Active"
    }
    res = client.post("/api/v1/master/employee-salary-details", json=salary_payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert float(data["gross_salary"]) == 60000.00
    assert float(data["basic_salary"]) == 33000.00
    assert data["status"] == "Active"

    # List salary details
    list_res = client.get("/api/v1/master/employee-salary-details")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
