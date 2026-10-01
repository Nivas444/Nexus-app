import asyncio
import os
import requests
from playwright.async_api import async_playwright

API_BASE = "http://127.0.0.1:8000/api/v1/customer/indus/gbpa"

async def close_any_popup(page):
    await page.evaluate("""() => {
        if (typeof closeSvgSuccessPopup === 'function') closeSvgSuccessPopup();
        if (typeof closeSvgErrorPopup === 'function') closeSvgErrorPopup();
        const s = document.getElementById('nexusSuccessPopupOverlay');
        if (s) s.style.display = 'none';
        const e = document.getElementById('nexusErrorPopupOverlay');
        if (e) e.style.display = 'none';
    }""")
    await page.wait_for_timeout(300)

async def main():
    print("=== STARTING INDUS GBPA E2E PLAYWRIGHT TEST ===")

    # 1. Clean DB to start fresh
    res = requests.get(API_BASE)
    if res.status_code == 200:
        for item in res.json().get("items", []):
            requests.delete(f"{API_BASE}/{item['item_id']}")
    print("Database cleaned. Current records: 0")

    # Start Playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[BROWSER ERROR] {err}"))

        # Navigate to home.html
        file_path = os.path.abspath("frontend/home.html")
        await page.goto(f"file:///{file_path}")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1000)

        # Switch to Indus Towers Ltd module
        print("Navigating to Indus Towers Ltd -> Products (GBPA)...")
        await page.evaluate("""() => {
            currentModule = 'indus_towers';
            currentIndusSubpage = 'products';
            updateURL();
            renderApp();
            fetchIndusGbpa(true);
        }""")
        await page.wait_for_timeout(1500)

        # Take screenshot of empty/initial state
        await page.screenshot(path="scratch/gbpa_initial_state.png")
        print("Captured scratch/gbpa_initial_state.png")

        # --- TEST RECORD 1: Add GBPA Record 1 ---
        print("\n--- Adding Record 1 (40M Tubular Tower) ---")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)
        
        # Verify Add Card is open
        is_card_visible = await page.is_visible("#addGbpaCard")
        assert is_card_visible, "addGbpaCard should be visible!"

        await page.fill("#inpGbpaItemCode", "GBPA-TWR-40M")
        await page.fill("#inpGbpaProductName", "40M Tubular Tower")
        await page.select_option("#inpGbpaProductType", "Capex")
        await page.fill("#inpGbpaProductDescription", "Galvanized steel lattice tower")
        await page.select_option("#inpGbpaUom", "Pcs")
        await page.fill("#inpGbpaRate", "450000.00")
        await page.select_option("#inpGbpaHsnSac", "HSN")
        await page.fill("#inpGbpaHsnSacCode", "73082019")
        await page.fill("#inpGbpaBudgetPercent", "10")
        await page.fill("#inpGbpaBudgetAmount", "45000.00")

        # Click Save
        await page.click("#btnSubmitGbpa")
        await page.wait_for_timeout(1500)

        # Verify success popup
        popup_visible = await page.evaluate("() => document.getElementById('nexusSuccessPopupOverlay')?.style.display === 'flex'")
        print(f"Success Popup Visible: {popup_visible}")
        assert popup_visible, "Success popup should be visible!"
        await page.screenshot(path="scratch/gbpa_record1_added.png")
        await close_any_popup(page)

        # --- TEST RECORD 2: Add GBPA Record 2 ---
        print("\n--- Adding Record 2 (15kVA Diesel Generator) ---")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)

        await page.fill("#inpGbpaItemCode", "GBPA-GEN-15K")
        await page.fill("#inpGbpaProductName", "15kVA Silent Diesel Generator")
        await page.select_option("#inpGbpaProductType", "Capex")
        await page.fill("#inpGbpaProductDescription", "Soundproof standby generator")
        await page.select_option("#inpGbpaUom", "Nos")
        await page.fill("#inpGbpaRate", "280000.00")
        await page.select_option("#inpGbpaHsnSac", "HSN")
        await page.fill("#inpGbpaHsnSacCode", "85021100")
        await page.fill("#inpGbpaBudgetPercent", "15")
        await page.fill("#inpGbpaBudgetAmount", "42000.00")

        await page.click("#btnSubmitGbpa")
        await page.wait_for_timeout(1500)
        await close_any_popup(page)

        # --- TEST RECORD 3: Add GBPA Record 3 ---
        print("\n--- Adding Record 3 (Civil & Electrical Installation Service) ---")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)

        await page.fill("#inpGbpaItemCode", "GBPA-SRV-INST")
        await page.fill("#inpGbpaProductName", "Civil & Electrical Installation Service")
        await page.select_option("#inpGbpaProductType", "Capex")
        await page.fill("#inpGbpaProductDescription", "Complete site erection and commissioning")
        await page.select_option("#inpGbpaUom", "Set")
        await page.fill("#inpGbpaRate", "125000.00")
        await page.select_option("#inpGbpaHsnSac", "SAC")
        await page.fill("#inpGbpaHsnSacCode", "9954")
        await page.fill("#inpGbpaBudgetPercent", "5")
        await page.fill("#inpGbpaBudgetAmount", "6250.00")

        await page.click("#btnSubmitGbpa")
        await page.wait_for_timeout(1500)
        await close_any_popup(page)

        # --- TEST RECORD 4: Add GBPA Record 4 ---
        print("\n--- Adding Record 4 (24-Core Armored Optical Fiber Cable) ---")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)

        await page.fill("#inpGbpaItemCode", "GBPA-OPT-FIB")
        await page.fill("#inpGbpaProductName", "24-Core Armored Optical Fiber Cable")
        await page.select_option("#inpGbpaProductType", "Opex")
        await page.fill("#inpGbpaProductDescription", "Direct burial optical fiber cable")
        await page.select_option("#inpGbpaUom", "Mtr")
        await page.fill("#inpGbpaRate", "95.00")
        await page.select_option("#inpGbpaHsnSac", "HSN")
        await page.fill("#inpGbpaHsnSacCode", "85447090")
        await page.fill("#inpGbpaBudgetPercent", "8")
        await page.fill("#inpGbpaBudgetAmount", "7.60")

        # Set Status to In-Active
        status_checked = await page.is_checked("#inpGbpaStatusToggle")
        if status_checked:
            await page.click("#inpGbpaStatusToggle + .toggle-slide-slider")

        await page.click("#btnSubmitGbpa")
        await page.wait_for_timeout(1500)
        await close_any_popup(page)

        # Take screenshot of table with 4 records
        await page.screenshot(path="scratch/gbpa_4_records_table.png")
        print("Captured scratch/gbpa_4_records_table.png")

        # Verify DB has exactly 4 records
        db_res = requests.get(API_BASE)
        items = db_res.json().get("items", [])
        print(f"Total records in DB: {len(items)}")
        assert len(items) == 4, f"Expected exactly 4 records in DB, found {len(items)}"

        # --- TEST DUPLICATE REJECTION IN UI ---
        print("\n--- Testing Duplicate Item Code Rejection in UI ---")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)

        await page.fill("#inpGbpaItemCode", "GBPA-TWR-40M") # Duplicate!
        await page.fill("#inpGbpaProductName", "Unique Name XYZ")
        await page.fill("#inpGbpaRate", "100.00")
        await page.click("#btnSubmitGbpa")
        await page.wait_for_timeout(1500)

        # Check Error Popup
        err_popup_visible = await page.evaluate("() => document.getElementById('nexusErrorPopupOverlay')?.style.display === 'flex'")
        err_msg = await page.evaluate("() => [document.getElementById('svgErrorPopupLine1')?.textContent, document.getElementById('svgErrorPopupLine2')?.textContent].join(' ')")
        print(f"Duplicate Code Error Popup: {err_popup_visible}, Message: {err_msg}")
        assert err_popup_visible, "Error popup should appear for duplicate item code!"
        assert "already exists" in err_msg
        await page.screenshot(path="scratch/gbpa_duplicate_code_error.png")

        # Close Error Popup and Form
        await close_any_popup(page)
        await page.evaluate("() => closeSideForm()")
        await page.wait_for_timeout(500)

        # --- TEST VIEW & EDIT MODE ---
        print("\n--- Testing View & Edit Mode on Record 1 ---")
        # Click radio button of first row
        first_row_radio = page.locator(".gbpa-row-radio").first
        await first_row_radio.click()
        await page.wait_for_timeout(500)

        # Open View Card
        await page.evaluate("async () => await window.openSelectedGbpaItem()")
        await page.wait_for_timeout(1000)

        card_title = await page.inner_text("#lblGbpaCardTitle")
        print(f"View Card Title: {card_title}")
        assert "40M Tubular Tower" in card_title

        # Verify read-only state
        is_readonly = await page.get_attribute("#inpGbpaProductName", "readonly")
        assert is_readonly is not None, "Product name should be readonly in View mode"

        # Toggle Edit Mode
        print("Toggling Edit Mode...")
        await page.click("#btnGbpaCardEditToggle")
        await page.wait_for_timeout(500)

        is_readonly_now = await page.get_attribute("#inpGbpaProductName", "readonly")
        assert is_readonly_now is None, "Product name should now be editable in Edit mode"

        # Edit Rate and Item Name
        await page.fill("#inpGbpaProductName", "40M Tubular Tower - Heavy Duty")
        await page.fill("#inpGbpaRate", "495000.00")

        # Save Changes
        print("Saving Edit changes...")
        await page.click("#btnGbpaCardEditToggle")
        await page.wait_for_timeout(2000)


        # Check success popup
        succ_visible = await page.evaluate("() => document.getElementById('nexusSuccessPopupOverlay')?.style.display === 'flex'")
        print(f"Edit Success Popup Visible: {succ_visible}")
        assert succ_visible, "Success popup should appear on edit save!"
        await page.screenshot(path="scratch/gbpa_record1_edited.png")
        print("Captured scratch/gbpa_record1_edited.png")
        await close_any_popup(page)

        # Close form
        await page.evaluate("() => closeSideForm()")
        await page.wait_for_timeout(500)


        # Verify DB still has exactly 4 records and Record 1 is updated
        db_res_final = requests.get(API_BASE)
        final_items = db_res_final.json().get("items", [])
        print(f"Final records count in DB: {len(final_items)}")
        for itm in final_items:
            print("DB Item:", itm["item_id"], itm["item_code"], itm["item_name"], itm["rate"])
        assert len(final_items) == 4, f"Expected 4 records, got {len(final_items)}"
        
        updated_rec = next((x for x in final_items if x["item_code"] == "GBPA-TWR-40M"), None)
        assert updated_rec is not None
        assert updated_rec["item_name"] == "40M Tubular Tower - Heavy Duty"
        assert updated_rec["rate"] == "495000.00"
        print("DB update verified successfully!")


        # --- TEST PRODUCT NAME HYPERLINK ---
        print("\n--- Testing Item Name Hyperlink Navigation ---")
        link = page.locator("a.req-link.td-link-blue").first
        await link.click()
        await page.wait_for_timeout(1000)

        current_sub = await page.evaluate("() => currentIndusSubpage")
        print(f"Current subpage after clicking hyperlink: {current_sub}")
        assert current_sub == "product_details", "Clicking hyperlink should open product_details"
        await page.screenshot(path="scratch/gbpa_drilldown_product_details.png")

        await browser.close()
        print("\n=== ALL INDUS GBPA E2E TESTS PASSED PERFECTLY WITH EXACTLY 4 RECORDS! ===")

if __name__ == "__main__":
    asyncio.run(main())
