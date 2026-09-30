import time
from playwright.sync_api import sync_playwright

def test_leave_modal():
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
        
        # Switch to Leave tab
        page.click(".segmented-btn[data-hr-tab='leave']")
        time.sleep(0.5)
        
        # Click (+) button to open Add Leave tab modal
        page.click("#btnCompanyHrAdd")
        time.sleep(0.5)
        
        assert page.is_visible("#companyHrLeaveCard"), "Modal #companyHrLeaveCard should be visible"
        
        # Verify obsolete CL/SL/EL fields are NOT present
        assert page.query_selector("#inpLeaveClEligible") is None, "CL Eligible should be removed"
        assert page.query_selector("#inpLeaveSlEligible") is None, "SL Eligible should be removed"
        assert page.query_selector("#inpLeaveElEligible") is None, "EL Eligible should be removed"
        
        # Verify Leave Type dropdown
        sel = page.query_selector("#inpLeaveType")
        assert sel is not None, "Leave Type dropdown must exist"
        
        options = page.evaluate("Array.from(document.querySelectorAll('#inpLeaveType option')).map(o => o.text.trim())")
        print("Leave Type options:", options)
        expected_opts = ["Casual Leave", "Sick Leave", "Earning Leave", "Sandwich Leave Policy"]
        for opt in expected_opts:
            assert opt in options, f"Option '{opt}' not found in {options}"
            
        # Select an option
        page.select_option("#inpLeaveType", "Sandwich Leave Policy")
        
        # Verify Eligible Working Days field
        inp_eligible = page.query_selector("#inpLeaveEligibleWorkingDays")
        assert inp_eligible is not None, "Eligible Working Days field must exist"
        page.fill("#inpLeaveEligibleWorkingDays", "240 Days")
        
        # Verify Claimable Period field
        inp_claimable = page.query_selector("#inpLeaveClaimablePeriod")
        assert inp_claimable is not None, "Claimable Period field must exist"
        page.fill("#inpLeaveClaimablePeriod", "15 Days / Year")
        
        # Take a screenshot of the Add Leave modal
        page.screenshot(path="scratch/updated_leave_modal.png")
        print("Screenshot saved to scratch/updated_leave_modal.png")
        
        # Test clicking save toggle
        page.click("#btnCompanyHrLeaveEditToggle")
        time.sleep(0.3)
        
        # Verify fields became readonly/disabled
        is_disabled = page.evaluate("document.getElementById('inpLeaveType').disabled")
        print("Leave Type disabled state after save toggle:", is_disabled)
        assert is_disabled is True, "Leave Type dropdown should be disabled after save"
        
        browser.close()
        print("TEST PASSED: Add Leave Tab fields successfully updated and verified!")

if __name__ == "__main__":
    test_leave_modal()
