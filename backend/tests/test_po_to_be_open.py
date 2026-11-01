import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject, ProjectExpense
from app.services.commercial_project_service import CommercialProjectService

client = TestClient(app)


def test_po_to_be_open_api_endpoint():
    """Verify that the GET /api/v1/commercial/po-to-be-open/projects endpoint returns 200 and valid schema."""
    resp = client.get("/api/v1/commercial/po-to-be-open/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] == len(data["items"])


def test_po_to_be_open_eligibility_all_three_conditions():
    """
    Verify all 3 eligibility conditions:
    1. po_status must be 'Closed' or 'Finally Closed'
    2. WCC must not have been raised (wcc_no is None/empty, wcc_submission_date is None, wcc_approved_date is None)
    3. Linked expense records must exist and spent amount > 0
    """
    db = ProjectSessionLocal()
    try:
        service = CommercialProjectService(db)
        res = service.get_po_to_be_open_projects_list()
        items = res.items

        # We know 4500128934 and 4500128939 are in DB with Closed / Finally Closed, no WCC, and linked expenses
        po_numbers = [item.poNo for item in items]
        assert "4500128934" in po_numbers
        assert "4500128939" in po_numbers

        # Verify PO 4500128934 (Closed, 2 expenses: 45k + 40k = 85k)
        item_4500128934 = next(it for it in items if it.poNo == "4500128934")
        assert item_4500128934.rawExpenseAmount == 85000.0
        assert item_4500128934.poStatus == "Closed"
        assert item_4500128934.siteId == "IN-123456"
        assert item_4500128934.siteName == "Guindy Hub"

        # Verify PO 4500128939 (Finally Closed, 1 expense: 15k)
        item_4500128939 = next(it for it in items if it.poNo == "4500128939")
        assert item_4500128939.rawExpenseAmount == 15000.0
        assert item_4500128939.poStatus == "Finally Closed"

        # Condition 1 Exclusion: PO with status 'Amended' (e.g. 4500128940) must NOT be returned
        assert "4500128940" not in po_numbers
        assert "4500128941" not in po_numbers

        # Condition 2 Exclusion: POs with WCC raised must NOT be returned
        # 4500128936 has expenses (25,000) but wcc_no='12' -> excluded
        # 4500128937 has expenses (14,000) but wcc_no='1' -> excluded
        assert "4500128936" not in po_numbers
        assert "4500128937" not in po_numbers

        # Condition 3 Exclusion: PO without expenses (e.g. 4500128935) must NOT be returned
        assert "4500128935" not in po_numbers

        # Unrelated Expenses: 'PO-UNRELATED-999' must NOT be returned
        assert "PO-UNRELATED-999" not in po_numbers

        # No duplicate PO rows
        assert len(po_numbers) == len(set(po_numbers))
    finally:
        db.close()


def test_po_to_be_open_excludes_closed_po_when_wcc_raised():
    """Verify that even if a PO is Closed, it is excluded if WCC was raised."""
    db = ProjectSessionLocal()
    try:
        # Create a temporary test project that is 'Closed' but has a WCC raised and has expenses
        test_po = "TEST-WCC-RAISED-001"
        test_proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id="SITE-TEST-1",
            site_name="Test Site",
            po_status="Closed",
            wcc_no="WCC-TEST-001"
        )
        test_exp = ProjectExpense(
            company_name="Nexus",
            po_no=test_po,
            site_id="SITE-TEST-1",
            amount=Decimal("50000.00")
        )
        db.add(test_proj)
        db.add(test_exp)
        db.commit()

        service = CommercialProjectService(db)
        res = service.get_po_to_be_open_projects_list()
        returned_pos = [item.poNo for item in res.items]
        assert test_po not in returned_pos, "PO with WCC raised must be excluded from PO To Be Open"

        # Cleanup
        db.delete(test_exp)
        db.delete(test_proj)
        db.commit()
    finally:
        db.close()


def test_po_to_be_open_excludes_closed_po_without_expenses():
    """Verify that a Closed PO with no linked expenses is excluded."""
    db = ProjectSessionLocal()
    try:
        test_po = "TEST-NO-EXP-001"
        test_proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id="SITE-TEST-2",
            site_name="Test Site 2",
            po_status="Closed",
            wcc_no=None
        )
        db.add(test_proj)
        db.commit()

        service = CommercialProjectService(db)
        res = service.get_po_to_be_open_projects_list()
        returned_pos = [item.poNo for item in res.items]
        assert test_po not in returned_pos, "PO without expenses must be excluded from PO To Be Open"

        # Cleanup
        db.delete(test_proj)
        db.commit()
    finally:
        db.close()


def test_po_to_be_open_multiple_expenses_aggregation_no_duplicates():
    """Verify that when a PO has multiple expense records, amounts are summed and exactly 1 PO row is returned."""
    db = ProjectSessionLocal()
    try:
        test_po = "TEST-MULTI-EXP-001"
        test_proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id="SITE-TEST-3",
            site_name="Test Site 3",
            project_code="PRJ-TEST-MULTI",
            project_type="New Build",
            sub_project_type="Civil",
            po_status="Finally Closed",
            wcc_no=None
        )
        test_exp1 = ProjectExpense(
            company_name="Nexus",
            po_no=test_po,
            site_id="SITE-TEST-3",
            amount=Decimal("12000.50")
        )
        test_exp2 = ProjectExpense(
            company_name="Nexus",
            po_no=test_po,
            site_id="SITE-TEST-3",
            amount=Decimal("8000.50")
        )
        test_exp3 = ProjectExpense(
            company_name="Nexus",
            po_no=test_po,
            site_id="SITE-TEST-3",
            amount=Decimal("5000.00")
        )
        db.add(test_proj)
        db.add_all([test_exp1, test_exp2, test_exp3])
        db.commit()

        service = CommercialProjectService(db)
        res = service.get_po_to_be_open_projects_list()
        matching = [item for item in res.items if item.poNo == test_po]
        assert len(matching) == 1, "Must avoid duplicate PO rows when multiple expenses exist"
        assert matching[0].rawExpenseAmount == 25001.0
        assert matching[0].expenseAmount == "25,001.00"

        # Cleanup
        db.delete(test_exp1)
        db.delete(test_exp2)
        db.delete(test_exp3)
        db.delete(test_proj)
        db.commit()
    finally:
        db.close()
