import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        file_path = os.path.abspath("frontend/home.html")
        await page.goto(f"file:///{file_path}")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1000)

        # Navigate to Indus Towers Ltd -> Products
        await page.evaluate("""() => {
            currentModule = 'indus_towers';
            currentIndusSubpage = 'products';
            updateURL();
            renderApp();
            fetchIndusGbpa(true);
        }""")
        await page.wait_for_timeout(1000)

        # 1. Open Add GBPA (Standard short title)
        print("Testing Short Header ('Add GBPA')...")
        await page.click("#btnIndusAdd")
        await page.wait_for_timeout(500)

        card_box = await page.locator("#addGbpaCard").bounding_box()
        close_btn_box = await page.locator("#btnCloseGbpaForm").bounding_box()
        print(f"Short Title Card Width: {card_box['width']:.1f}px")
        print(f"Close Button Position: x={close_btn_box['x']:.1f}, y={close_btn_box['y']:.1f}, width={close_btn_box['width']:.1f}")
        
        # Verify close button is inside card bounds and visible
        assert close_btn_box['x'] + close_btn_box['width'] <= card_box['x'] + card_box['width'] + 5
        assert await page.is_visible("#btnCloseGbpaForm")
        await page.screenshot(path="scratch/gbpa_short_header.png")
        print("Captured scratch/gbpa_short_header.png")

        # Close
        await page.click("#btnCloseGbpaForm")
        await page.wait_for_timeout(500)

        # 2. Open with Long Header (e.g. "Civil & Electrical Installation Service & Structural Commissioning with 5G Antenna Mast Extended")
        print("\nTesting Long Header...")
        await page.evaluate("""() => {
            const longTitle = 'Civil & Electrical Installation Service & Structural Commissioning with 5G Antenna Mast Extended';
            openViewGbpaCard(32); // Record 3
            document.getElementById('lblGbpaCardTitle').innerText = longTitle;
        }""")
        await page.wait_for_timeout(600)

        card_box_long = await page.locator("#addGbpaCard").bounding_box()
        close_btn_box_long = await page.locator("#btnCloseGbpaForm").bounding_box()
        edit_btn_box_long = await page.locator("#btnGbpaCardEditToggle").bounding_box()

        print(f"Long Title Card Width: {card_box_long['width']:.1f}px")
        print(f"Close Button Position: x={close_btn_box_long['x']:.1f}, y={close_btn_box_long['y']:.1f}, width={close_btn_box_long['width']:.1f}")
        print(f"Edit Button Position: x={edit_btn_box_long['x']:.1f}, y={edit_btn_box_long['y']:.1f}")

        # Check that card expanded to fit long title
        assert card_box_long['width'] > card_box['width'], f"Card width ({card_box_long['width']}px) should expand beyond default ({card_box['width']}px)"
        
        # Check that close button is fully visible and inside the header
        assert await page.is_visible("#btnCloseGbpaForm")
        assert await page.is_visible("#btnGbpaCardEditToggle")
        assert close_btn_box_long['x'] + close_btn_box_long['width'] <= card_box_long['x'] + card_box_long['width'] + 5

        await page.screenshot(path="scratch/gbpa_long_header_adjusted.png")
        print("Captured scratch/gbpa_long_header_adjusted.png")

        # Test clicking close button on long header to ensure it works smoothly
        await page.click("#btnCloseGbpaForm")
        await page.wait_for_timeout(500)
        is_card_open = await page.is_visible("#addGbpaCard")
        assert not is_card_open, "Card should close cleanly when close button is clicked!"

        await browser.close()
        print("\n=== HEADER DYNAMIC TAB SIZE & STATIC CLOSE ICON VERIFIED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(main())
