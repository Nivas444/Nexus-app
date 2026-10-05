import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_PDF_BYTES = b"%PDF-1.4\n%test pdf content for unit test\n%%EOF"

@pytest.fixture(autouse=True)
def cleanup_test_employees():
    yield
    from app.db.session import SessionLocal
    from app.models.employee import CompanyEmployee, CompanyEmployeeDocument
    db = SessionLocal()
    try:
        # Clean up any test employees created with EMP- prefix
        test_emps = db.query(CompanyEmployee).filter(CompanyEmployee.employee_code.like("EMP-%")).all()
        for emp in test_emps:
            db.query(CompanyEmployeeDocument).filter(CompanyEmployeeDocument.employee_id == emp.employee_id).delete()
            db.delete(emp)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

def test_get_employees_list():
    response = client.get("/api/v1/master/employees")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_create_and_get_on_roll_employee():
    emp_code = f"EMP-ONR-{uuid.uuid4().hex[:6]}"
    payload = {
        "employee_name": "Aakash Test Verma",
        "employee_code": emp_code,
        "employee_type": "On-Roll",
        "designation": "Project Manager",
        "mobile_number": "9840112345",
        "email": "aakash.test@nexus.com",
        "address": "DLF Cyber City, Tower A",
        "blood_group": "A+",
        "marital_status": "Single",
        "qualification": "B.Tech CSE",
        "pan_number": "ABCDE1234F",
        "aadhaar_number": "1234-5678-9012",
        "dl_number": "DL-04-2023-1234",
        "passport_number": "P1234567",
        "epf_uan": "100123456789",
        "esi_code": "31001234560000001",
        "prevExp": "02 - 00",
        "currentExp": "01 - 06",
        "totalExp": "03 - 06",
        "dob": "1995-05-15",
        "doj": "2023-01-10",
        "geo_attendance": True,
        "status": "Active"
    }
    create_res = client.post("/api/v1/master/employees", json=payload)
    assert create_res.status_code == 201, f"Failed: {create_res.json()}"
    emp = create_res.json()
    assert emp["employee_name"] == "Aakash Test Verma"
    assert emp["employee_code"] == emp_code
    assert emp["empType"] == "On-Roll"
    assert emp["status"] == "Active"
    assert emp["geo_attendance"] is True
    emp_id = emp["employee_id"]

    # Get by ID
    get_res = client.get(f"/api/v1/master/employees/{emp_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["employee_name"] == "Aakash Test Verma"
    assert fetched["employee_code"] == emp_code

def test_duplicate_employee_code_conflict_409():
    emp_code = f"EMP-DUP-{uuid.uuid4().hex[:6]}"
    payload1 = {
        "employee_name": "Shared Employee Name",
        "employee_code": emp_code,
        "employee_type": "On-Roll",
        "status": "Active"
    }
    res1 = client.post("/api/v1/master/employees", json=payload1)
    assert res1.status_code == 201

    # Same employee ID -> 409 Conflict (Employee ID alone is unique)
    payload2 = {
        "employee_name": "Different Person",
        "employee_code": emp_code,
        "employee_type": "Contract",
        "status": "Active"
    }
    res2 = client.post("/api/v1/master/employees", json=payload2)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()

    # Same name with different employee ID -> 201 Created (Names are NOT unique)
    payload3 = {
        "employee_name": "Shared Employee Name",
        "employee_code": f"EMP-DIFF-{uuid.uuid4().hex[:6]}",
        "employee_type": "On-Roll",
        "status": "Active"
    }
    res3 = client.post("/api/v1/master/employees", json=payload3)
    assert res3.status_code == 201

def test_create_contract_employee():
    emp_code = f"EMP-CON-{uuid.uuid4().hex[:6]}"
    payload = {
        "employee_name": "Deepak Contract Sharma",
        "employee_code": emp_code,
        "employee_type": "Contract",
        "designation": "Site Engineer",
        "mobile_number": "9840223456",
        "address": "Site Office B, Sector 62",
        "pan_number": "XYZDE5678G",
        "aadhaar_number": "9876-5432-1098",
        "status": "Active"
    }
    create_res = client.post("/api/v1/master/employees", json=payload)
    assert create_res.status_code == 201
    emp = create_res.json()
    assert emp["employee_type"] == "Contract"
    assert emp["empType"] == "Contract"
    assert emp["employee_code"] == emp_code

def test_update_employee():
    emp_code = f"EMP-UPD-{uuid.uuid4().hex[:6]}"
    create_res = client.post("/api/v1/master/employees", json={
        "employee_name": "Initial Name",
        "employee_code": emp_code,
        "employee_type": "On-Roll",
        "designation": "Junior Engineer",
        "address": "Initial Address",
        "status": "Active"
    })
    assert create_res.status_code == 201
    emp_id = create_res.json()["employee_id"]

    update_res = client.put(f"/api/v1/master/employees/{emp_id}", json={
        "designation": "Senior Engineer",
        "address": "Updated Address 456",
        "status": "In - Active"
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["designation"] == "Senior Engineer"
    assert updated["address"] == "Updated Address 456"
    assert updated["status"] == "In - Active"

def test_patch_employee_status():
    emp_code = f"EMP-STAT-{uuid.uuid4().hex[:6]}"
    create_res = client.post("/api/v1/master/employees", json={
        "employee_name": "Status Tester",
        "employee_code": emp_code,
        "status": "Active"
    })
    assert create_res.status_code == 201
    emp_id = create_res.json()["employee_id"]

    patch_res = client.patch(f"/api/v1/master/employees/{emp_id}/status", json={"status": False})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In - Active"

    patch_res2 = client.patch(f"/api/v1/master/employees/{emp_id}/status", json={"status": "Active"})
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "Active"

def test_get_nonexistent_employee_404():
    res = client.get("/api/v1/master/employees/9999999")
    assert res.status_code == 404

def test_pdf_document_upload_and_download_flow():
    # 1. Create Employee
    emp_code = f"EMP-DOC-{uuid.uuid4().hex[:6]}"
    create_res = client.post("/api/v1/master/employees", json={
        "employee_name": "Document Testing Employee",
        "employee_code": emp_code,
        "status": "Active"
    })
    assert create_res.status_code == 201
    emp_id = create_res.json()["employee_id"]

    # 2. Upload PDF documents for all 7 required types
    doc_types = ["qualification", "pan", "aadhaar", "driving_license", "passport", "epf_uan", "esi_id"]

    for dtype in doc_types:
        pdf_file = io.BytesIO(SAMPLE_PDF_BYTES)
        upload_res = client.post(
            f"/api/v1/master/employees/{emp_id}/documents",
            data={"document_type": dtype},
            files={"file": (f"{dtype}_doc.pdf", pdf_file, "application/pdf")}
        )
        assert upload_res.status_code == 201, f"Failed {dtype}: {upload_res.json()}"
        doc_data = upload_res.json()
        assert doc_data["document_type"] == dtype
        assert doc_data["file_name"] == f"{dtype}_doc.pdf"
        assert doc_data["mime_type"] == "application/pdf"
        assert doc_data["file_size"] == len(SAMPLE_PDF_BYTES)

    # 3. List Documents
    list_docs_res = client.get(f"/api/v1/master/employees/{emp_id}/documents")
    assert list_docs_res.status_code == 200
    docs_list = list_docs_res.json()
    assert len(docs_list) == 7

    # 4. Download / View individual PDF document
    download_res = client.get(f"/api/v1/master/employees/{emp_id}/documents/pan")
    assert download_res.status_code == 200
    assert download_res.headers["content-type"] == "application/pdf"
    assert download_res.content == SAMPLE_PDF_BYTES

def test_pdf_upload_reject_non_pdf_file():
    emp_code = f"EMP-REJ-{uuid.uuid4().hex[:6]}"
    create_res = client.post("/api/v1/master/employees", json={
        "employee_name": "Reject Non-PDF Tester",
        "employee_code": emp_code,
        "status": "Active"
    })
    assert create_res.status_code == 201
    emp_id = create_res.json()["employee_id"]

    # Upload plain text file
    txt_file = io.BytesIO(b"Hello world, this is a text file not a PDF")
    upload_res = client.post(
        f"/api/v1/master/employees/{emp_id}/documents",
        data={"document_type": "pan"},
        files={"file": ("malicious.txt", txt_file, "text/plain")}
    )
    assert upload_res.status_code == 400
    assert "only pdf documents" in upload_res.json()["detail"].lower()

def test_pdf_upload_reject_corrupted_pdf():
    emp_code = f"EMP-COR-{uuid.uuid4().hex[:6]}"
    create_res = client.post("/api/v1/master/employees", json={
        "employee_name": "Corrupt PDF Tester",
        "employee_code": emp_code,
        "status": "Active"
    })
    assert create_res.status_code == 201
    emp_id = create_res.json()["employee_id"]

    # Fake PDF file missing %PDF- header
    bad_pdf_file = io.BytesIO(b"NOT_A_PDF_HEADER_DATA_12345")
    upload_res = client.post(
        f"/api/v1/master/employees/{emp_id}/documents",
        data={"document_type": "aadhaar"},
        files={"file": ("bad.pdf", bad_pdf_file, "application/pdf")}
    )
    assert upload_res.status_code == 400
    assert "valid pdf header" in upload_res.json()["detail"].lower()

def test_bulk_upload_employees_csv():
    import uuid
    suffix = uuid.uuid4().hex[:6]
    csv_content = f"""Employee Type,Employee Name,Employee ID,Address,Mobile Number,E - Mail ID,DOB,Blood Group,Martial Status,DOJ,Designation,Previous Experience,Qualification,PAN Number,Aadhar Number,Driving Licence,Passport Number,EPF UAN,ESI IP Number  ,Geo Attendance,Status
On-Roll,Bulk Test User 1,EMP-BULK-A-{suffix},Sector 1 Chennai,9876500111,bulk1_{suffix}@nexus.com,15/05/1990,A+,Single,01/01/2024,Engineer,02 - 00,B.E,ABCDE1111F,123456789001,DL-01-1111,Z1111111,100111111111,3100111111,Yes,Active
Contract,Bulk Test User 2,EMP-BULK-B-{suffix},Sector 2 Chennai,9876500222,bulk2_{suffix}@nexus.com,20/08/1995,B+,Married,15/02/2024,Technician,01 - 06,Diploma,ABCDE2222F,123456789002,DL-02-2222,Z2222222,100222222222,3100222222,No,Active
"""
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    upload_res = client.post(
        "/api/v1/master/employees/bulk-upload",
        files={"file": ("test_employees.csv", file_bytes, "text/csv")}
    )
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert data["success"] is True
    assert data["imported_count"] == 2
