import time
from playwright.sync_api import sync_playwright

def test_hr_policies():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Navigate to home
        page.goto("http://127.0.0.1:8000/static/home.html?module=master&subpage=customer")
        page.wait_for_load_state("domcontentloaded")
        time.sleep(1)
        
        # Open View Company Name tab
        page.evaluate("openIndusTowerPageCard()")
        time.sleep(0.5)
        
        # Click HR icon in View Company Name card
        page.click("#btnIndusTowerHrPolicies")
        time.sleep(0.5)
        
        tabs = [
            ("epf", "EPF", "#companyHrEpfCard", ["From", "To", "Filling Frequency", "Filling Due Date", "Sealing Amount", "Employee", "Employer", "Status", "EPF", "EPS", "EDLI", "Admin Charges"]),
            ("esi", "ESI", "#companyHrEsiCard", ["From", "To", "Filling Frequency", "Filling Due Date", "Sealing Amount", "Employee", "Employer", "Status"]),
            ("pt", "PT", "#companyHrPtCard", ["From", "To", "State", "Filling Frequency", "Filling Due Date", "Threshold Limit", "Sealing Amount", "Employee", "Status"]),
            ("lwf", "LWF", "#companyHrLwfCard", ["From", "To", "State", "Filling Frequency", "Filling Due Date", "Sealing Amount", "Employee", "Employer", "Status"]),
            ("tds", "TDS", "#companyHrTdsCard", ["From", "To", "Filling Frequency", "Filling Due Date", "TDS Code", "TDS Category", "Threshold Limit", "Standard Deduction", "TDS Rate", "Health & Education Cess", "Sealing Amount", "Status"]),
            ("leave", "Leave", "#companyHrLeaveCard", ["From", "To", "CL", "SL", "EL", "Status", "Eligible working days", "Claimable day"]),
            ("bonus", "Bonus", "#companyHrBonusCard", ["From", "To", "Bonus Type", "Sealing Amount", "Bonus (%)", "Status"]),
            ("medical_insurance", "Medical Insurance", "#companyHrMedicalInsuranceCard", ["From", "To", "Insurance Company Name", "Sealing Amount", "Employee", "Employer", "Status"]),
        ]
        
        for key, label, modal_id, expected_cols in tabs:
            print(f"\n--- Testing Tab: {label} ({key}) ---")
            
            # Switch to tab via segmented button
            page.click(f".segmented-btn[data-hr-tab='{key}']")
            time.sleep(0.3)
            
            # Check table header
            th_texts = page.evaluate("Array.from(document.querySelectorAll('#worklistTableHead th')).map(th => th.innerText.trim())")
            print(f"Header th texts: {th_texts}")
            for col in expected_cols:
                assert any(col.lower() in t.lower() for t in th_texts), f"Column '{col}' not found in th texts: {th_texts}"
            
            # Check row count
            row_count = page.evaluate("document.querySelectorAll('#worklistTableBody tr').length")
            print(f"Row count for {label}: {row_count}")
            assert row_count > 0, f"Expected rows for {label}, got 0"
            
            # Test clicking (+) button opens modal
            page.click("#btnCompanyHrAdd")
            time.sleep(0.3)
            is_visible = page.is_visible(modal_id)
            print(f"Modal {modal_id} visible after (+) click: {is_visible}")
            assert is_visible, f"Modal {modal_id} should be visible"
            
            # Take screenshot of the modal
            page.screenshot(path=f"scratch/hr_{key}_modal.png")
            
            # Close modal via close button
            page.evaluate(f"document.querySelector('{modal_id} .side-form-close-btn').click()")
            time.sleep(0.3)
            assert not page.is_visible(modal_id), f"Modal {modal_id} should be hidden after close"
            
            # Test clicking row opens modal
            page.click("#worklistTableBody tr")
            time.sleep(0.3)
            assert page.is_visible(modal_id), f"Modal {modal_id} should open when clicking row"
            
            # Close modal again
            page.evaluate(f"document.querySelector('{modal_id} .side-form-close-btn').click()")
            time.sleep(0.3)
            
            # Take screenshot of table view
            page.screenshot(path=f"scratch/hr_{key}_table.png")
            print(f"PASSED: {label} tab and modal verified!")
            
        browser.close()
        print("\nALL HR POLICIES TABS AND MODALS PASSED 100%!")

if __name__ == "__main__":
    test_hr_policies()
