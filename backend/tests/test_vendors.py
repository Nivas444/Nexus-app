import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

def test_create_vendor_and_db_persistence(client: TestClient):
    payload = {
        "vendor_name": "Test Telecom Infra Pvt Ltd",
        "entity_type": "Private Limited",
        "business_type": "Service",
        "service_type": "Project",
        "contract_type": "B2B",
        "gst_number_available": True,
        "gst_number": "33ASMPM8643F1Z5",
        "gst_type": "SGST",
        "address": "123 Telecom Tower Road, Chennai",
        "pan_number": "ASMPM8643F",
        "tds_deduction": True,
        "tds_rate": "1%",
        "tds_code": "1027",
        "account_name": "Test Telecom Operations",
        "account_number": "987654321012",
        "bank_name": "HDFC Bank",
        "account_type": "Current",
        "ifsc_code": "HDFC0001234",
        "contact_name": "Ramesh Sharma",
        "contact_number": "9876543210",
        "email": "ramesh@testtelecom.com",
        "status": "Active"
    }

    response = client.post("/api/v1/master/vendors", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["vendor_name"] == "Test Telecom Infra Pvt Ltd"
    assert data["vendorName"] == "Test Telecom Infra Pvt Ltd"
    assert data["account_name"] == "Test Telecom Operations"
    assert data["contact_name"] == "Ramesh Sharma"
    assert "vendor_id" in data
    vendor_id = data["vendor_id"]

    # Retrieve by ID
    get_res = client.get(f"/api/v1/master/vendors/{vendor_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["vendor_name"] == "Test Telecom Infra Pvt Ltd"
    assert get_data["bank_name"] == "HDFC Bank"
    assert get_data["ifsc_code"] == "HDFC0001234"

    # Add Pricing / Scope records to vendor_price
    price_payload = {
        "product_name": "Telecom Towers 30M",
        "item_description": "Nos",
        "rate": 150000.00,
        "status": "Active"
    }
    price_res = client.post(f"/api/v1/master/vendors/{vendor_id}/pricing", json=price_payload)
    assert price_res.status_code == 201
    price_data = price_res.json()
    assert price_data["vendor_name"] == "Test Telecom Infra Pvt Ltd"
    assert float(price_data["rate"]) == 150000.00
    pricing_id = price_data["vendor_service_id"]

    # Add another pricing record (transport scope)
    trans_payload = {
        "vehicle_type": "LCV",
        "vehicle_number": "TN09AB1234",
        "fuel_type": "Diesel",
        "rental_type": "Monthly",
        "rate": 45000.00,
        "status": "Active"
    }
    trans_res = client.post(f"/api/v1/master/vendors/{vendor_id}/pricing", json=trans_payload)
    assert trans_res.status_code == 201

    # Retrieve pricing list for this vendor
    pricing_list_res = client.get(f"/api/v1/master/vendors/{vendor_id}/pricing")
    assert pricing_list_res.status_code == 200
    pricing_list = pricing_list_res.json()
    assert pricing_list["total"] >= 2

    # Update Vendor Details in Edit Mode
    update_payload = {
        "address": "456 Updated Telecom Way, Chennai",
        "tds_rate": "2%"
    }
    update_res = client.put(f"/api/v1/master/vendors/{vendor_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["address"] == "456 Updated Telecom Way, Chennai"
    # Verify unedited fields were preserved
    assert updated_data["vendor_name"] == "Test Telecom Infra Pvt Ltd"
    assert updated_data["account_number"] == "987654321012"

    # Update Bank details directly
    bank_update = {
        "account_number": "123456789098",
        "bank_name": "ICICI Bank"
    }
    bank_res = client.put(f"/api/v1/master/vendors/{vendor_id}/bank", json=bank_update)
    assert bank_res.status_code == 200
    assert bank_res.json()["bank_name"] == "ICICI Bank"
    assert bank_res.json()["account_number"] == "123456789098"

    # Clean up
    del_res = client.delete(f"/api/v1/master/vendors/{vendor_id}")
    assert del_res.status_code == 204

    # Verify 404 after deletion
    get_del = client.get(f"/api/v1/master/vendors/{vendor_id}")
    assert get_del.status_code == 404


def test_vendor_data_isolation(client: TestClient):
    # Create Vendor A
    res_a = client.post("/api/v1/master/vendors", json={
        "vendor_name": "Vendor Alpha Solutions",
        "business_type": "Supply",
        "status": "Active"
    })
    assert res_a.status_code == 201
    vendor_a_id = res_a.json()["vendor_id"]

    # Create Vendor B
    res_b = client.post("/api/v1/master/vendors", json={
        "vendor_name": "Vendor Beta Logistics",
        "business_type": "Service",
        "status": "Active"
    })
    assert res_b.status_code == 201
    vendor_b_id = res_b.json()["vendor_id"]

    # Add pricing for Vendor A
    client.post(f"/api/v1/master/vendors/{vendor_a_id}/pricing", json={
        "product_name": "Alpha Cable 100M",
        "rate": 5000.00
    })

    # Add pricing for Vendor B
    client.post(f"/api/v1/master/vendors/{vendor_b_id}/pricing", json={
        "vehicle_type": "Heavy Truck",
        "rate": 75000.00
    })

    # Verify Vendor A only has Vendor A pricing
    pricing_a = client.get(f"/api/v1/master/vendors/{vendor_a_id}/pricing").json()
    assert pricing_a["total"] == 1
    assert pricing_a["items"][0]["product_name"] == "Alpha Cable 100M"

    # Verify Vendor B only has Vendor B pricing
    pricing_b = client.get(f"/api/v1/master/vendors/{vendor_b_id}/pricing").json()
    assert pricing_b["total"] == 1
    assert pricing_b["items"][0]["vehicle_type"] == "Heavy Truck"

    # Clean up
    client.delete(f"/api/v1/master/vendors/{vendor_a_id}")
    client.delete(f"/api/v1/master/vendors/{vendor_b_id}")
