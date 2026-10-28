from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo

client = TestClient(app)

TEST_PO = "TEST-PO-AMEND-SUM-001"
TEST_SITE = "SITE-SUM-001"


@pytest.fixture(autouse=True)
def setup_and_teardown():
    db = ProjectSessionLocal()
    try:
        db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == TEST_PO).delete()
        db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO).delete()
        db.commit()

        # Create telecom project
        proj = TelecomProject(
            project_code=f"PRJ-{TEST_PO}",
            po_no=TEST_PO,
            site_id=TEST_SITE,
            site_name="Test Site",
            current_task="PO Amend to be submit",
            project_status="PO Amend to be submit",
            po_status="Amend Requested"
        )
        db.add(proj)

        # Line 1: Normal line (PO diff = 0)
        line1 = TelecomIndusPo(
            po_no=TEST_PO,
            site_id=TEST_SITE,
            line_number="10",
            item_code="ITEM-1",
            po_rate=Decimal("100.00"),
            po_qty=Decimal("10.00"),
            jms_qty=Decimal("10.00"),
            jms_amount=Decimal("1000.00")
        )
        # Line 2: Amendment line (PO diff < 0)
        line2 = TelecomIndusPo(
            po_no=TEST_PO,
            site_id=TEST_SITE,
            line_number="20",
            item_code="ITEM-2",
            po_rate=Decimal("200.00"),
            po_qty=Decimal("5.00"),
            jms_qty=Decimal("8.00"),
            jms_amount=Decimal("1600.00")
        )
        db.add_all([line1, line2])
        db.commit()

        yield

        db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == TEST_PO).delete()
        db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO).delete()
        db.commit()
    finally:
        db.close()


def test_po_amend_details_total_jms_amount():
    """
    Test that GET /api/v1/commercial/po-amend/po-details returns totalJmsAmount and totalAmount
    equal to the sum of jms_amount across all lines of the PO (1000.00 + 1600.00 = 2600.00).
    """
    res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={TEST_PO}&site_id={TEST_SITE}")
    assert res.status_code == 200, res.text
    data = res.json()

    # Sum of jms_amount is 1000 + 1600 = 2600
    assert data["totalJmsAmount"] == 2600.0
    assert data["totalAmount"] == 2600.0

    # Line items in response should only be the negative variance items (PO Difference < 0)
    assert len(data["lineItems"]) == 1
    assert data["lineItems"][0]["lineNo"] == "20"
