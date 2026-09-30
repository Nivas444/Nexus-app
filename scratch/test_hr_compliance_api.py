import sys
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_api():
    print("Testing HR Compliance API endpoints...")
    
    # 1. Test GET list
    resp = requests.get(f"{BASE_URL}/master/hr-compliance", params={"company_name": "Nexus", "compliance_type": "EPF"})
    print("GET EPF status:", resp.status_code, "count:", len(resp.json()))
    assert resp.status_code == 200

    # 2. Test Invalid compliance type
    bad_payload = {
        "company_name": "Nexus",
        "compliance_type": "INVALID_TYPE",
        "from_date": "2026-04-01",
        "to_date": "2027-03-31"
    }
    resp_bad = requests.post(f"{BASE_URL}/master/hr-compliance", json=bad_payload)
    print("POST invalid type status:", resp_bad.status_code, "response:", resp_bad.text)
    assert resp_bad.status_code in (400, 422)

    # 3. Test Add EPF
    epf_payload = {
        "company_name": "Nexus",
        "compliance_type": "EPF",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "epf_filling_due_date": "15 - 05 - 2026",
        "epf_sealing_amount": "15,000.00",
        "epf_employee_contribution": "12%",
        "epf_employer_contribution": "3.67%",
        "eps_employer_contribution": "8.33%",
        "edli_employer_contribution": "0.50%",
        "epf_admin_charges": "0.50%",
        "epf_status": "Active"
    }
    resp_epf = requests.post(f"{BASE_URL}/master/hr-compliance", json=epf_payload)
    print("POST EPF status:", resp_epf.status_code, resp_epf.json())
    assert resp_epf.status_code == 201
    saved_epf = resp_epf.json()
    assert saved_epf["compliance_type"] == "EPF"
    assert saved_epf["company_name"] == "Nexus"
    assert float(saved_epf["epf_sealing_amount"]) == 15000.00
    assert float(saved_epf["epf_employee_contribution"]) == 12.00
    assert saved_epf["from_date"] == "2026-04-01"

    # 4. Test Add ESI
    esi_payload = {
        "company_name": "Nexus",
        "compliance_type": "ESI",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "esi_filling_frequency": "Monthly",
        "esi_filling_date": "15 - 05 - 2026",
        "esi_sealing_amount": "21,000.00",
        "esi_employee_contribution": "0.75%",
        "esi_employer_contribution": "3.25%",
        "esi_status": "Active"
    }
    resp_esi = requests.post(f"{BASE_URL}/master/hr-compliance", json=esi_payload)
    print("POST ESI status:", resp_esi.status_code, resp_esi.json())
    assert resp_esi.status_code == 201
    assert resp_esi.json()["compliance_type"] == "ESI"

    # 5. Test Add PT
    pt_payload = {
        "company_name": "Nexus",
        "compliance_type": "PT",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "state": "Tamil Nadu",
        "pt_filling_frequency": "Half Yearly",
        "pt_filling_due_date": "30 - 09 - 2026",
        "gross_salary_from": "21000.00",
        "pt_employee_deduction": "200.00",
        "pt_status": "Active"
    }
    resp_pt = requests.post(f"{BASE_URL}/master/hr-compliance", json=pt_payload)
    print("POST PT status:", resp_pt.status_code, resp_pt.json())
    assert resp_pt.status_code == 201
    assert resp_pt.json()["compliance_type"] == "PT"

    # 6. Test Add LWF
    lwf_payload = {
        "company_name": "Nexus",
        "compliance_type": "LWF",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "state": "Tamil Nadu",
        "lwf_filling_frequency": "Annually",
        "lwf_filling_due_date": "31 - 12 - 2026",
        "lwf_employee_contribution": "20.00",
        "lwf_employer_contribution": "40.00",
        "lwf_status": "Active"
    }
    resp_lwf = requests.post(f"{BASE_URL}/master/hr-compliance", json=lwf_payload)
    print("POST LWF status:", resp_lwf.status_code, resp_lwf.json())
    assert resp_lwf.status_code == 201
    assert resp_lwf.json()["compliance_type"] == "LWF"

    # 7. Test Add TDS
    tds_payload = {
        "company_name": "Nexus",
        "compliance_type": "TDS",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "gross_salary_from": "250000.00",
        "tds_standard_deduction": "50000.00",
        "tds_deduction_percentage": "10.00",
        "health_and_education_cess": "4.00",
        "tds_status": "Active"
    }
    resp_tds = requests.post(f"{BASE_URL}/master/hr-compliance", json=tds_payload)
    print("POST TDS status:", resp_tds.status_code, resp_tds.json())
    assert resp_tds.status_code == 201
    assert resp_tds.json()["compliance_type"] == "TDS"

    # 8. Test Add Leave
    leave_payload = {
        "company_name": "Nexus",
        "compliance_type": "Leave",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "cl_eligible": "12",
        "cl_can_claim": "1",
        "leave_status": "Active"
    }
    resp_leave = requests.post(f"{BASE_URL}/master/hr-compliance", json=leave_payload)
    print("POST Leave status:", resp_leave.status_code, resp_leave.json())
    assert resp_leave.status_code == 201
    assert resp_leave.json()["compliance_type"] == "Leave"

    # 9. Test Add Bonus
    bonus_payload = {
        "company_name": "Nexus",
        "compliance_type": "Bonus",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "statutory_bonus_sealing_amount": "21000.00",
        "statutory_bonus": "8.33",
        "bonus_status": "Active"
    }
    resp_bonus = requests.post(f"{BASE_URL}/master/hr-compliance", json=bonus_payload)
    print("POST Bonus status:", resp_bonus.status_code, resp_bonus.json())
    assert resp_bonus.status_code == 201
    assert resp_bonus.json()["compliance_type"] == "Bonus"

    # 10. Test Add Medical Insurance
    med_payload = {
        "company_name": "Nexus",
        "compliance_type": "Medical Insurance",
        "from_date": "01 - 04 - 2026",
        "to_date": "31 - 03 - 2027",
        "medical_insurance_company_name": "Star Health & Allied Insurance",
        "medical_insurance_employee_contribution": "0.00",
        "medical_insurance_employer_contribution": "100.00",
        "medical_insurance_status": "Active"
    }
    resp_med = requests.post(f"{BASE_URL}/master/hr-compliance", json=med_payload)
    print("POST Medical Insurance status:", resp_med.status_code, resp_med.json())
    assert resp_med.status_code == 201
    assert resp_med.json()["compliance_type"] == "Medical Insurance"

    print("\nALL 8 HR COMPLIANCE BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
