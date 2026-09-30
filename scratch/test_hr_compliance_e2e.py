import os
import sys
import time
from playwright.sync_api import sync_playwright

# Add backend directory to sys.path for DB session
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
from app.db.session import SessionLocal
from app.models.hr_compliance import HRCompliance

def test_hr_compliance_ui():
    print("Starting Playwright E2E UI verification for all 8 HR Compliance types...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        # Listen to console messages
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))

        # Navigate to frontend home
        page.goto("http://127.0.0.1:8000/static/home.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # 1. Switch to Master -> Company Master -> HR Policies
        print("Navigating to HR Policies view...")
        page.evaluate("() => { if (typeof openCompanyHrPoliciesPage === 'function') openCompanyHrPoliciesPage('epf'); }")
        time.sleep(1)

        # List of tabs and test data to verify
        tests = [
            {
                "type": "EPF",
                "tab_key": "epf",
                "card_id": "companyHrEpfCard",
                "fill": {
                    "inpEpfFromDate": "01 - 04 - 2026",
                    "inpEpfToDate": "31 - 03 - 2027",
                    "inpEpfFillingDueDate": "15 - 05 - 2026",
                    "inpEpfSealingAmount": "15000",
                    "inpEpfEmpContribution": "12",
                    "inpEpfEmployerContribution": "3.67",
                    "inpEpsEmployerContribution": "8.33",
                    "inpEdliEmployerContribution": "0.50",
                    "inpEpfAdminCharges": "0.50"
                },
                "save_btn_id": "#btnCompanyHrEpfEditToggle"
            },
            {
                "type": "ESI",
                "tab_key": "esi",
                "card_id": "companyHrEsiCard",
                "fill": {
                    "inpEsiFromDate": "01 - 04 - 2026",
                    "inpEsiToDate": "31 - 03 - 2027",
                    "inpEsiFillingDueDate": "15 - 05 - 2026",
                    "inpEsiSealingAmount": "21000",
                    "inpEsiEmpContribution": "0.75",
                    "inpEsiEmployerContribution": "3.25"
                },
                "save_btn_id": "#btnCompanyHrEsiEditToggle"
            },
            {
                "type": "PT",
                "tab_key": "pt",
                "card_id": "companyHrPtCard",
                "fill": {
                    "inpPtFromDate": "01 - 04 - 2026",
                    "inpPtToDate": "31 - 03 - 2027",
                    "inpPtState": "Tamil Nadu",
                    "inpPtFillingDueDate": "30 - 09 - 2026",
                    "inpPtThresholdLimit": "21000",
                    "inpPtEmpContribution": "200"
                },
                "save_btn_id": "#btnCompanyHrPtEditToggle"
            },
            {
                "type": "LWF",
                "tab_key": "lwf",
                "card_id": "companyHrLwfCard",
                "fill": {
                    "inpLwfFromDate": "01 - 04 - 2026",
                    "inpLwfToDate": "31 - 03 - 2027",
                    "inpLwfState": "Tamil Nadu",
                    "inpLwfFillingDueDate": "31 - 12 - 2026",
                    "inpLwfEmpContribution": "20",
                    "inpLwfEmployerContribution": "40"
                },
                "save_btn_id": "#btnCompanyHrLwfEditToggle"
            },
            {
                "type": "TDS",
                "tab_key": "tds",
                "card_id": "companyHrTdsCard",
                "fill": {
                    "inpTdsFromDate": "01 - 04 - 2026",
                    "inpTdsToDate": "31 - 03 - 2027",
                    "inpTdsThresholdLimit": "250000",
                    "inpTdsStandardDeduction": "50000",
                    "inpTdsRate": "10",
                    "inpTdsHealthCess": "4"
                },
                "save_btn_id": "#btnCompanyHrTdsEditToggle"
            },
            {
                "type": "Leave",
                "tab_key": "leave",
                "card_id": "companyHrLeaveCard",
                "fill": {
                    "inpLeaveFromDate": "01 - 04 - 2026",
                    "inpLeaveToDate": "31 - 03 - 2027",
                    "inpLeaveEligibleWorkingDays": "12",
                    "inpLeaveClaimablePeriod": "1"
                },
                "save_btn_id": "#btnCompanyHrLeaveEditToggle"
            },
            {
                "type": "Bonus",
                "tab_key": "bonus",
                "card_id": "companyHrBonusCard",
                "fill": {
                    "inpBonusFromDate": "01 - 04 - 2026",
                    "inpBonusToDate": "31 - 03 - 2027",
                    "inpBonusSealingAmount": "21000",
                    "inpBonusPercent": "8.33"
                },
                "save_btn_id": "#btnCompanyHrBonusEditToggle"
            },
            {
                "type": "Medical Insurance",
                "tab_key": "medical_insurance",
                "card_id": "companyHrMedicalInsuranceCard",
                "fill": {
                    "inpMedFromDate": "01 - 04 - 2026",
                    "inpMedToDate": "31 - 03 - 2027",
                    "inpMedInsuranceCompany": "Star Health E2E Test",
                    "inpMedEmpContribution": "0",
                    "inpMedEmployerContribution": "100"
                },
                "save_btn_id": "#btnCompanyHrMedEditToggle"
            }
        ]

        for t in tests:
            comp_type = t["type"]
            tab_key = t["tab_key"]
            card_id = t["card_id"]
            print(f"\n--- Testing UI flow for: {comp_type} ({tab_key}) ---")
            
            # Switch tab
            page.locator(f".segmented-btn[data-hr-tab='{tab_key}']").click()
            time.sleep(0.5)

            # Click Add button
            page.locator("#btnCompanyHrAdd").click()
            time.sleep(0.5)

            # Verify card is visible
            card = page.locator(f"#{card_id}")
            assert card.is_visible(), f"Card #{card_id} should be visible"

            # Fill inputs via page.evaluate
            fill_data = t["fill"]
            page.evaluate("""(data) => {
                for (const [id, val] of Object.entries(data)) {
                    const el = document.getElementById(id);
                    if (el) {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }""", fill_data)

            # Click Save/Submit button
            page.locator(t["save_btn_id"]).click()
            time.sleep(1)

            # Verify SVG popup or success notification
            popup = page.locator("#nexusSuccessPopupOverlay")
            if popup.is_visible():
                print(f"Verified SVG Success Popup displayed for {comp_type}!")
                page.evaluate("() => { if (typeof closeSvgSuccessPopup === 'function') closeSvgSuccessPopup(); }")
                time.sleep(0.5)

            # Verify card closed
            assert not card.is_visible(), f"Card #{card_id} should be closed after save"
            print(f"Successfully added {comp_type} record through UI!")

        # Verify records in database using SessionLocal
        print("\nVerifying database records in PostgreSQL via SQLAlchemy session...")
        db = SessionLocal()
        try:
            for t in tests:
                comp_type = t["type"]
                records = db.query(HRCompliance).filter(HRCompliance.compliance_type == comp_type).all()
                count = len(records)
                print(f"Database verification -> {comp_type}: {count} records found in hr_compliance table (Latest ID: {records[-1].compliance_id if count > 0 else 'N/A'})")
                assert count > 0, f"No records found for compliance_type '{comp_type}'"
        finally:
            db.close()

        # Take screenshot of final UI
        page.screenshot(path="scratch/hr_compliance_e2e_verified.png")
        print("Captured screenshot scratch/hr_compliance_e2e_verified.png")

        browser.close()
        print("\n=========================================================================")
        print("ALL 8 HR COMPLIANCE UI FLOWS TESTED & VERIFIED IN POSTGRESQL SUCCESSFULLY!")
        print("=========================================================================")

if __name__ == "__main__":
    test_hr_compliance_ui()
