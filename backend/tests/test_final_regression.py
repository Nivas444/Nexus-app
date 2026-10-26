import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import TelecomProject, TelecomIndusPo


def test_final_targeted_regression(client: TestClient, project_db_session: Session):
    """
    Final targeted regression test:
    - Test PO with mixed JMS line items (one >= 0, one < 0)
    - Verifies:
      1. Each line appears only on its correct destination page after reload.
      2. The mixed project-level task/status does not hide either line.
      3. Neither line remains in the active JMS to be process list.
      4. Repeating the routing request creates no duplicates or changes destination.
      5. Cleans up only test records and confirms pre-existing records are untouched.
    """
    # 0. Snapshot pre-existing records to ensure they are untouched
    pre_existing_pos = set(
        r[0] for r in project_db_session.query(TelecomProject.po_no).all()
    )
    pre_existing_line_ids = set(
        r[0] for r in project_db_session.query(TelecomIndusPo.project_po_line_item_id).all()
    )

    test_po = "TEST-FINAL-REG-MIXED"
    test_site = "IN-SITE-REG-999"

    try:
        # Clean any stale test record with this key
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        # 1. Setup test PO with 2 line items in 'JMS to be process'
        # Line A: PO Qty - JMS Qty = 10 - 8 = +2 (>= 0) -> WCC
        # Line B: PO Qty - JMS Qty = 5 - 9 = -4 (< 0) -> PO to be Amend
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Final Regression Site",
            project_code="PRJ-FINAL-REG",
            project_type="New Build",
            sub_project_type="Civil",
            po_type="Capex",
            po_amount=Decimal("200000.00"),
            current_task="JMS to be process",
            project_status="Active"
        )
        line_wcc = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="10",
            item_code="GBPA-REG-WCC",
            item_description="WCC Line Item (+2 Diff)",
            uom="Nos",
            po_qty=Decimal("10.00"),
            po_rate=Decimal("10000.00"),
            po_amount=Decimal("100000.00"),
            po_total_amount=Decimal("100000.00"),
            jms_qty=Decimal("8.00"),   # 10 - 8 = +2.0 (>= 0)
            jms_amount=Decimal("80000.00"),
            net_material_qty=Decimal("8.00"),
            jms_status="Approved"
        )
        line_amend = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="20",
            item_code="GBPA-REG-AMEND",
            item_description="Amend Line Item (-4 Diff)",
            uom="Nos",
            po_qty=Decimal("5.00"),
            po_rate=Decimal("20000.00"),
            po_amount=Decimal("100000.00"),
            po_total_amount=Decimal("100000.00"),
            jms_qty=Decimal("9.00"),   # 5 - 9 = -4.0 (< 0)
            jms_amount=Decimal("180000.00"),
            net_material_qty=Decimal("5.00"),
            jms_status="Approved"
        )
        project_db_session.add_all([proj, line_wcc, line_amend])
        project_db_session.commit()
        project_db_session.refresh(line_wcc)
        project_db_session.refresh(line_amend)
        wcc_line_id = line_wcc.project_po_line_item_id
        amend_line_id = line_amend.project_po_line_item_id

        # Verify initial active state in JMS
        jms_before = client.get(f"/api/v1/commercial/jms/po-details?po_no={test_po}&site_id={test_site}")
        assert jms_before.status_code == 200
        assert jms_before.json()["task"] == "JMS to be process"

        # --- EXECUTE ROUTING ---
        route_res = client.post("/api/v1/commercial/jms/process", json={"poNo": test_po, "siteId": test_site})
        assert route_res.status_code == 200, route_res.text
        route_data = route_res.json()
        assert route_data["success"] is True
        assert route_data["wccCount"] == 1
        assert route_data["projectTask"] in ["WCC to be submit / PO Amend to be submit", "WCC to be raise / PO to be amend"]

        # -------------------------------------------------------------
        # VERIFICATION 1: Each line appears only on its correct destination page after reload
        # -------------------------------------------------------------
        # WCC Page reload (/api/v1/commercial/jms/wcc-details)
        wcc_reload = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={test_po}&site_id={test_site}")
        assert wcc_reload.status_code == 200
        wcc_items = wcc_reload.json()["lineItems"]
        assert len(wcc_items) == 1
        assert wcc_items[0]["id"] == wcc_line_id
        assert wcc_items[0]["itemCode"] == "GBPA-REG-WCC"
        assert wcc_items[0]["poDifference"] == 2.0
        assert wcc_items[0]["task"] in ["WCC to be submit", "WCC to be raise"]
        # Ensure Amend line is NOT in WCC
        assert not any(i["id"] == amend_line_id for i in wcc_items)

        # PO Amend Page reload (/api/v1/commercial/jms/po-amend-details)
        amend_reload = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={test_po}&site_id={test_site}")
        assert amend_reload.status_code == 200
        amend_items = amend_reload.json()["lineItems"]
        assert len(amend_items) == 1
        assert amend_items[0]["id"] == amend_line_id
        assert amend_items[0]["itemCode"] == "GBPA-REG-AMEND"
        assert amend_items[0]["poDifference"] == -4.0
        assert amend_items[0]["amendmentType"] == "Change QTY"
        assert amend_items[0]["qty"] == 4.0
        # Ensure WCC line is NOT in PO Amend
        assert not any(i["id"] == wcc_line_id for i in amend_items)

        # -------------------------------------------------------------
        # VERIFICATION 2: Mixed project-level task/status does not hide either line
        # -------------------------------------------------------------
        project_db_session.refresh(proj)
        assert proj.current_task in ["WCC to be submit / PO Amend to be submit", "WCC to be raise / PO to be amend"]
        assert proj.po_status in ["PO Amend to be submit", "Amend Requested"]
        assert proj.project_status in ["WCC to be submit / PO Amend to be submit", "WCC to be raise", "WCC to be submit"]
        # Confirm both endpoints successfully returned their items under this mixed project task
        assert len(wcc_items) == 1
        assert len(amend_items) == 1

        # -------------------------------------------------------------
        # VERIFICATION 3: Neither line remains in the active JMS to be process list
        # -------------------------------------------------------------
        # Commercial Projects endpoint /commercial/projects
        projs_res = client.get("/api/v1/commercial/projects")
        assert projs_res.status_code == 200
        active_jms_projects = [
            p for p in projs_res.json()["items"]
            if (p.get("task") or "").strip().lower() == "jms to be process"
        ]
        # Test PO is not in the active "JMS to be process" list
        assert not any(p["poNo"] == test_po for p in active_jms_projects)

        # Verify frontend JMS filtering logic: items with task containing 'wcc' or 'amend' are excluded
        project_db_session.refresh(proj)
        t_lower = (proj.current_task or "").strip().lower()
        is_visible_in_active_jms = (
            not "pending" in t_lower
            and not "wcc" in t_lower
            and not "amend" in t_lower
            and t_lower != "jms approval pending"
        )
        assert is_visible_in_active_jms is False

        # -------------------------------------------------------------
        # VERIFICATION 4: Repeating the routing request creates no duplicates or changes destination
        # -------------------------------------------------------------
        repeat_res = client.post("/api/v1/commercial/jms/process", json={"poNo": test_po, "siteId": test_site})
        assert repeat_res.status_code == 200
        repeat_data = repeat_res.json()
        assert repeat_data["success"] is True
        assert repeat_data["wccCount"] == 1
        assert repeat_data["poAmendCount"] == 1

        # Total line items in DB for this PO must still be exactly 2
        total_lines_in_db = project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).count()
        assert total_lines_in_db == 2

        # Destinations remain unchanged after repeating
        wcc_repeat = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={test_po}&site_id={test_site}")
        amend_repeat = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={test_po}&site_id={test_site}")
        assert len(wcc_repeat.json()["lineItems"]) == 1
        assert wcc_repeat.json()["lineItems"][0]["id"] == wcc_line_id
        assert len(amend_repeat.json()["lineItems"]) == 1
        assert amend_repeat.json()["lineItems"][0]["id"] == amend_line_id

    finally:
        # -------------------------------------------------------------
        # VERIFICATION 5: Clean up only test records and confirm pre-existing records are untouched
        # -------------------------------------------------------------
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        # Confirm test records are completely removed
        assert project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).count() == 0
        assert project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).count() == 0

        # Confirm pre-existing records are intact and untouched
        post_pos = set(r[0] for r in project_db_session.query(TelecomProject.po_no).all())
        post_line_ids = set(r[0] for r in project_db_session.query(TelecomIndusPo.project_po_line_item_id).all())
        assert pre_existing_pos.issubset(post_pos), "Pre-existing projects were altered!"
        assert pre_existing_line_ids.issubset(post_line_ids), "Pre-existing line items were altered!"
