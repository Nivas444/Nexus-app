import io
import time
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_e2e_tests():
    print("\n--- Running Nexus ERP Employee Subdetails E2E Live Tests ---")
    ts = int(time.time() * 1000)

    # =========================================================================
    # 1. Bank Details E2E Test
    # =========================================================================
    print("\n[1/3] Testing Bank Details (Add, View, Edit, PDF upload & download)...")
    
    # A. Add Bank Details
    bank_payload = {
        "account_name": f"Nexus E2E Enterprise {ts}",
        "account_number": f"998877{ts % 1000000}",
        "bank_name": "State Bank of India",
        "ifsc_code": "SBIN0001234",
        "account_type": "Current",
        "responsible": "Finance Controller",
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/master/employee-bank-details", json=bank_payload)
    assert res.status_code == 201, f"Failed to create bank: {res.text}"
    bank_data = res.json()
    bank_id = bank_data["employee_bank_account_id"]
    print(f"  + Created Bank Record ID: {bank_id}, Account: {bank_data['account_number']}")

    # B. Upload PDF Document for Bank
    pdf_content = b"%PDF-1.4 E2E test PDF passbook document content verified."
    files = {"file": (f"passbook_{ts}.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_res = requests.post(f"{BASE_URL}/master/employee-bank-details/{bank_id}/document", files=files)
    assert upload_res.status_code == 201, f"Failed to upload document: {upload_res.text}"
    doc_info = upload_res.json()
    print(f"  + Uploaded Bank PDF Document: {doc_info['file_name']}, size: {doc_info['file_size']} bytes")

    # C. View Bank Details
    view_res = requests.get(f"{BASE_URL}/master/employee-bank-details/{bank_id}")
    assert view_res.status_code == 200, f"Failed to get bank details: {view_res.text}"
    view_data = view_res.json()
    assert view_data["has_document"] is True
    assert view_data["document_name"] == f"passbook_{ts}.pdf"
    print(f"  + Verified View Bank Record: has_document=True, name='{view_data['document_name']}'")

    # D. Download Bank Document
    dl_res = requests.get(f"{BASE_URL}/master/employee-bank-details/{bank_id}/document")
    assert dl_res.status_code == 200, f"Failed to download document: {dl_res.text}"
    assert dl_res.content == pdf_content, "Downloaded PDF content does not match uploaded content!"
    assert dl_res.headers.get("content-type") == "application/pdf"
    print(f"  + Verified PDF Download: binary exact match, Content-Type: application/pdf")

    # E. Edit Bank Details (Update without duplicate)
    update_payload = {
        "bank_name": "State Bank of India - Corporate Branch",
        "ifsc_code": "SBIN0009999",
        "status": "Active"
    }
    put_res = requests.put(f"{BASE_URL}/master/employee-bank-details/{bank_id}", json=update_payload)
    assert put_res.status_code == 200, f"Failed to update bank details: {put_res.text}"
    updated_data = put_res.json()
    assert updated_data["employee_bank_account_id"] == bank_id, "Edit created a new record instead of updating!"
    assert updated_data["ifsc_code"] == "SBIN0009999"
    print(f"  + Verified Edit Bank Record: Same ID {bank_id} preserved, IFSC updated to {updated_data['ifsc_code']}")

    # =========================================================================
    # 2. Asset Details E2E Test (Add-Only + Summation)
    # =========================================================================
    print("\n[2/3] Testing Asset Details (Add Only & Summation Total)...")
    
    # A. Add Asset 1
    asset1 = {
        "asset_details": f"Lenovo ThinkPad X1 Carbon {ts}",
        "serial_number": f"LNV-TP-{ts % 10000}",
        "uom": "Nos",
        "qty": 2,
        "rate": 80000.00,
        "amount": 160000.00,
        "date": "2026-02-01",
        "expiry_date": "2029-02-01"
    }
    res_a1 = requests.post(f"{BASE_URL}/master/employee-assets", json=asset1)
    assert res_a1.status_code == 201, f"Failed to add asset 1: {res_a1.text}"
    a1_data = res_a1.json()
    print(f"  + Added Asset 1: {a1_data['asset_details']}, Amount: {a1_data['amount']}")

    # B. Add Asset 2
    asset2 = {
        "asset_details": f"Ergonomic Chair Pro {ts}",
        "serial_number": f"CHR-{ts % 10000}",
        "uom": "Nos",
        "qty": 3,
        "rate": 15000.00,
        "amount": 45000.00,
        "date": "2026-02-05"
    }
    res_a2 = requests.post(f"{BASE_URL}/master/employee-assets", json=asset2)
    assert res_a2.status_code == 201, f"Failed to add asset 2: {res_a2.text}"
    a2_data = res_a2.json()
    print(f"  + Added Asset 2: {a2_data['asset_details']}, Amount: {a2_data['amount']}")

    # C. Calculate Total Sum
    tot_res = requests.get(f"{BASE_URL}/master/employee-assets/total")
    assert tot_res.status_code == 200, f"Failed to get asset total: {tot_res.text}"
    tot_data = tot_res.json()
    assert float(tot_data["total_amount"]) >= 205000.00
    print(f"  + Verified Summation Total: {tot_data['formatted_total']} (Items: {tot_data['item_count']})")

    # =========================================================================
    # 3. Salary Details E2E Test (Add-Only)
    # =========================================================================
    print("\n[3/3] Testing Salary Details (Add Only)...")
    
    salary_payload = {
        "from_date": "2026-01-01",
        "to_date": "2026-12-31",
        "gross_salary": 75000.00,
        "basic_salary": 41250.00,
        "hra": 18750.00,
        "da": 9000.00,
        "sa": 6000.00,
        "status": "Active"
    }
    sal_res = requests.post(f"{BASE_URL}/master/employee-salary-details", json=salary_payload)
    assert sal_res.status_code == 201, f"Failed to add salary: {sal_res.text}"
    sal_data = sal_res.json()
    print(f"  + Added Salary Details: ID={sal_data['salary_id']}, Gross={sal_data['gross_salary']}, Basic={sal_data['basic_salary']}")

    sal_list_res = requests.get(f"{BASE_URL}/master/employee-salary-details")
    assert sal_list_res.status_code == 200
    print(f"  + Verified Salary List retrieved {len(sal_list_res.json())} records.")

    print("\n=======================================================")
    print("ALL LIVE BACKEND & DATABASE E2E TESTS PASSED PERFECTLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_e2e_tests()
