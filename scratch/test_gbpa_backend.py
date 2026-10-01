import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1/customer/indus/gbpa"

def run_tests():
    print("Testing Indus GBPA Backend API...")
    
    # 1. Fetch initial list
    res = requests.get(BASE_URL)
    print(f"GET {BASE_URL} -> Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    initial_items = res.json().get("items", [])
    print(f"Initial GBPA items count: {len(initial_items)}")

    # Clean up test records if any exist
    for item in initial_items:
        if item.get("item_code", "").startswith("TEST-GBPA-"):
            requests.delete(f"{BASE_URL}/{item['item_id']}")

    # 2. Create Record 1
    rec1 = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-001",
        "item_name": "Test 40M Tubular Tower",
        "item_description": "Galvanized steel structure",
        "item_type": "Capex",
        "hsn_sac": "HSN",
        "hsn_sac_code": "73082019",
        "uom": "Pcs",
        "rate": "450000.00",
        "budget_percentage": "10%",
        "budget_amount": "45000.00",
        "status": "Active"
    }
    res1 = requests.post(BASE_URL, json=rec1)
    print(f"POST Record 1 -> Status: {res1.status_code}")
    assert res1.status_code in (200, 201), f"Failed creating record 1: {res1.text}"
    created1 = res1.json()
    id1 = created1["item_id"]
    print(f"Created Record 1 with ID: {id1}")

    # 3. Create Record 2
    rec2 = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-002",
        "item_name": "Test Diesel Generator 15kVA",
        "item_description": "Backup power generator",
        "item_type": "Capex",
        "hsn_sac": "HSN",
        "hsn_sac_code": "85021100",
        "uom": "Nos",
        "rate": "275000.00",
        "budget_percentage": "15%",
        "budget_amount": "41250.00",
        "status": "Active"
    }
    res2 = requests.post(BASE_URL, json=rec2)
    print(f"POST Record 2 -> Status: {res2.status_code}")
    assert res2.status_code in (200, 201), f"Failed creating record 2: {res2.text}"
    created2 = res2.json()
    id2 = created2["item_id"]
    print(f"Created Record 2 with ID: {id2}")

    # 4. Create Record 3
    rec3 = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-003",
        "item_name": "Test Site Installation Service",
        "item_description": "Tower assembly and civil works",
        "item_type": "Services",
        "hsn_sac": "SAC",
        "hsn_sac_code": "9954",
        "uom": "Site",
        "rate": "120000.00",
        "budget_percentage": "5%",
        "budget_amount": "6000.00",
        "status": "Active"
    }
    res3 = requests.post(BASE_URL, json=rec3)
    print(f"POST Record 3 -> Status: {res3.status_code}")
    assert res3.status_code in (200, 201), f"Failed creating record 3: {res3.text}"
    created3 = res3.json()
    id3 = created3["item_id"]
    print(f"Created Record 3 with ID: {id3}")

    # 5. Create Record 4
    rec4 = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-004",
        "item_name": "Test Optical Fiber Cable 24F",
        "item_description": "Armored outdoor fiber cable",
        "item_type": "Opex",
        "hsn_sac": "HSN",
        "hsn_sac_code": "85447090",
        "uom": "Mtr",
        "rate": "85.00",
        "budget_percentage": "8%",
        "budget_amount": "6.80",
        "status": "In - Active"
    }
    res4 = requests.post(BASE_URL, json=rec4)
    print(f"POST Record 4 -> Status: {res4.status_code}")
    assert res4.status_code in (200, 201), f"Failed creating record 4: {res4.text}"
    created4 = res4.json()
    id4 = created4["item_id"]
    print(f"Created Record 4 with ID: {id4}")

    # 6. Test Uniqueness: Duplicate Item Code
    dup_code_rec = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-001", # Duplicate!
        "item_name": "Another item name",
        "item_type": "Capex"
    }
    res_dup_code = requests.post(BASE_URL, json=dup_code_rec)
    print(f"POST Duplicate Item Code -> Status: {res_dup_code.status_code} (Expected 409)")
    assert res_dup_code.status_code == 409, f"Expected 409, got {res_dup_code.status_code}"
    print(f"Conflict response: {res_dup_code.json()}")

    # 7. Test Uniqueness: Duplicate Item Name
    dup_name_rec = {
        "company_name": "Nexus",
        "customer_name": "Indus Tower Ltd",
        "item_code": "TEST-GBPA-UNIQUE-999",
        "item_name": "Test 40M Tubular Tower", # Duplicate!
        "item_type": "Capex"
    }
    res_dup_name = requests.post(BASE_URL, json=dup_name_rec)
    print(f"POST Duplicate Item Name -> Status: {res_dup_name.status_code} (Expected 409)")
    assert res_dup_name.status_code == 409, f"Expected 409, got {res_dup_name.status_code}"
    print(f"Conflict response: {res_dup_name.json()}")

    # 8. Test Edit Mode on Record 1
    update_rec1 = {
        "item_name": "Test 40M Tubular Tower - Updated",
        "item_description": "Updated Galvanized steel structure with heavy coating",
        "rate": "480000.00",
        "budget_percentage": "12%",
        "budget_amount": "57600.00",
        "status": "Active"
    }
    res_upd = requests.put(f"{BASE_URL}/{id1}", json=update_rec1)
    print(f"PUT Record 1 -> Status: {res_upd.status_code}")
    assert res_upd.status_code == 200, f"Failed updating record 1: {res_upd.text}"
    updated1 = res_upd.json()
    assert updated1["item_name"] == "Test 40M Tubular Tower - Updated"
    assert updated1["rate"] == "480000.00"
    print("Record 1 updated successfully in DB!")

    # 9. Verify single item retrieval
    res_get1 = requests.get(f"{BASE_URL}/{id1}")
    assert res_get1.status_code == 200
    assert res_get1.json()["item_name"] == "Test 40M Tubular Tower - Updated"

    print("All backend tests passed successfully!")

if __name__ == "__main__":
    run_tests()
