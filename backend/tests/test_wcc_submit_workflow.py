import datetime
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import TelecomProject, TelecomIndusPo


@pytest.fixture
def cleanup_wcc_records(project_db_session: Session):
    test_pos = ["TEST-WCC-SUBMIT-01", "TEST-WCC-SUBMIT-02"]
    for po in test_pos:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
    project_db_session.commit()

    yield

    for po in test_pos:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po).delete()
    project_db_session.commit()


def test_wcc_submit_full_workflow_and_persistence(client: TestClient, project_db_session: Session, cleanup_wcc_records):
    """
    Complete end-to-end test of the WCC to be submit workflow:
    1. Project starts in 'WCC to be submit'
    2. Details request / modal open leaves task unchanged
    3. Validation failures reject input with 400 and preserve existing task and DB values
    4. Successful submit saves wcc_no, wcc_date, wcc_submission_date, wcc_approved_date, wcc_amount
    5. Task transitions to 'Approval Pending'
    6. Reloading WCC projects (/commercial/wcc/projects) verifies persisted task status and all 5 columns
    7. Duplicate submissions are prevented with 400 Bad Request
    """
    po_no = "TEST-WCC-SUBMIT-01"
    site_id = "SITE-WCC-01"

    # 1. Seed project and line items in 'WCC to be submit'
    proj = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        project_code="PRJ-WCC-001",
        site_name="Test Site Alpha",
        customer_name="Indus Towers Ltd",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="WCC to be submit",
        project_status="WCC to be submit",
        po_amount=Decimal("200000.00")
    )
    project_db_session.add(proj)

    line1 = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=10,
        item_code="CIVIL-001",
        item_description="Foundation Work",
        uom="Nos",
        po_qty=Decimal("2.0"),
        jms_qty=Decimal("2.0"),
        po_rate=Decimal("50000.00"),
        jms_amount=Decimal("100000.00"),
        po_amendment_type="WCC to be submit"
    )
    line2 = TelecomIndusPo(
        po_no=po_no,
        site_id=site_id,
        line_number=20,
        item_code="CIVIL-002",
        item_description="Tower Erection",
        uom="Nos",
        po_qty=Decimal("1.0"),
        jms_qty=Decimal("1.0"),
        po_rate=Decimal("100000.00"),
        jms_amount=Decimal("100000.00"),
        po_amendment_type="WCC to be submit"
    )
    project_db_session.add_all([line1, line2])
    project_db_session.commit()

    # 2. Opening tab / fetching detail must not change task status
    res_details = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert res_details.status_code == 200
    detail_data = res_details.json()
    assert detail_data["task"] == "WCC to be submit"
    assert len(detail_data["lineItems"]) == 2

    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.current_task == "WCC to be submit"

    # 3. Validation failure: Missing WCC No
    res_bad_no = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "",
            "wccDate": "15/09/2026",
            "wccAmount": 200000.0
        }
    )
    assert res_bad_no.status_code == 400
    assert "WCC Number is required" in res_bad_no.json()["detail"]
    project_db_session.refresh(db_proj)
    assert db_proj.current_task == "WCC to be submit"

    # Validation failure: Missing WCC Date
    res_bad_date = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-101",
            "wccDate": "",
            "wccAmount": 200000.0
        }
    )
    assert res_bad_date.status_code == 400
    assert "WCC Date is required" in res_bad_date.json()["detail"]
    project_db_session.refresh(db_proj)
    assert db_proj.current_task == "WCC to be submit"

    # Validation failure: Invalid WCC Date format
    res_bad_fmt = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-101",
            "wccDate": "not-a-date",
            "wccAmount": 200000.0
        }
    )
    assert res_bad_fmt.status_code == 400
    assert "Invalid WCC Date format" in res_bad_fmt.json()["detail"]

    # Validation failure: Non-positive WCC Amount
    res_bad_amt = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-101",
            "wccDate": "15/09/2026",
            "wccAmount": 0.0
        }
    )
    assert res_bad_amt.status_code == 400
    assert "WCC Amount must be a valid positive number" in res_bad_amt.json()["detail"]
    project_db_session.refresh(db_proj)
    assert db_proj.current_task == "WCC to be submit"

    # 4. Valid submit: Collects WCC No, WCC Date, Submission Date, Approved Date, WCC Amount
    res_submit = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-TEST-8899",
            "wccDate": "15/09/2026",
            "submissionDate": "16/09/2026",
            "approvedDate": "22/09/2026",
            "wccAmount": 200000.0
        }
    )
    assert res_submit.status_code == 200
    body = res_submit.json()
    assert body["success"] is True
    assert body["wccNo"] == "WCC-TEST-8899"
    assert body["task"] == "Approval Pending"

    # Verify directly in PostgreSQL table telecom_project
    project_db_session.refresh(db_proj)
    assert db_proj.wcc_no == "WCC-TEST-8899"
    assert db_proj.wcc_date == datetime.date(2026, 9, 15)
    assert db_proj.wcc_submission_date == datetime.date(2026, 9, 16)
    assert db_proj.wcc_approved_date == datetime.date(2026, 9, 22)
    assert db_proj.wcc_amount == Decimal("200000.00")
    assert db_proj.current_task == "Approval Pending"
    assert db_proj.project_status == "Approval Pending"

    # Verify line items transitioned to 'Approval Pending'
    updated_lines = project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).all()
    for l in updated_lines:
        assert l.po_amendment_type == "Approval Pending"

    # 5. Reload WCC page: Call /commercial/wcc/projects to verify persisted values and task
    res_reload = client.get("/api/v1/commercial/wcc/projects")
    assert res_reload.status_code == 200
    reload_items = res_reload.json()["items"]
    reloaded_item = next((item for item in reload_items if item["poNo"] == po_no), None)
    assert reloaded_item is not None
    assert reloaded_item["task"] == "Approval Pending"
    assert reloaded_item["wccNo"] == "WCC-TEST-8899"
    assert reloaded_item["wccDate"] == "15/09/2026"
    assert reloaded_item["submissionDate"] == "16/09/2026"
    assert reloaded_item["approvedDate"] == "22/09/2026"
    assert float(reloaded_item["wccAmount"]) == 200000.0

    # 6. Prevent duplicate submissions: Submitting again when already in 'Approval Pending'
    res_dup = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-TEST-DUPLICATE",
            "wccDate": "18/09/2026",
            "wccAmount": 200000.0
        }
    )
    assert res_dup.status_code == 400
    assert "already been submitted" in res_dup.json()["detail"]

    # Ensure DB values remain unchanged after rejected duplicate
    project_db_session.refresh(db_proj)
    assert db_proj.wcc_no == "WCC-TEST-8899"
    assert db_proj.current_task == "Approval Pending"


def test_wcc_submit_alias_endpoint(client: TestClient, project_db_session: Session, cleanup_wcc_records):
    """
    Verify the commercial alias route /api/v1/commercial/wcc/submit-details works seamlessly.
    """
    po_no = "TEST-WCC-SUBMIT-02"
    site_id = "SITE-WCC-02"

    proj = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        current_task="WCC to be submit",
        project_status="WCC to be submit",
        po_amount=Decimal("150000.00")
    )
    project_db_session.add(proj)
    project_db_session.commit()

    res = client.post(
        "/api/v1/commercial/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-ALIAS-1234",
            "wccDate": "10/10/2026",
            "submissionDate": "11/10/2026",
            "approvedDate": "15/10/2026",
            "wccAmount": 150000.0
        }
    )
    assert res.status_code == 200
    assert res.json()["success"] is True

    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.wcc_no == "WCC-ALIAS-1234"
    assert db_proj.wcc_date == datetime.date(2026, 10, 10)
    assert db_proj.wcc_submission_date == datetime.date(2026, 10, 11)
    assert db_proj.wcc_approved_date == datetime.date(2026, 10, 15)
    assert db_proj.wcc_amount == Decimal("150000.00")
    assert db_proj.current_task == "Approval Pending"


def test_wcc_submit_amount_formats_and_validations(client: TestClient, project_db_session: Session, cleanup_wcc_records):
    """
    Verify WCC Amount accepts various valid positive formats (e.g. '₹ 2,45,000.00', '2,45,000.00', 245000)
    and strictly rejects non-positive or invalid amounts (e.g. 0, '0', -50, '-50', 'abc').
    """
    po_no = "TEST-WCC-SUBMIT-01"
    site_id = "SITE-WCC-01"

    proj = TelecomProject(
        po_no=po_no,
        site_id=site_id,
        project_code="PRJ-WCC-001",
        current_task="WCC to be submit",
        project_status="WCC to be submit",
        po_amount=Decimal("245000.00")
    )
    project_db_session.add(proj)
    project_db_session.commit()

    # 1. Non-positive and invalid amounts should fail
    for bad_amt in [0, 0.0, "0", "0.00", -100, "-100", "-₹ 500", "invalid_text"]:
        res_bad = client.post(
            "/api/v1/commercial/jms/wcc/submit-details",
            json={
                "poNo": po_no,
                "siteId": site_id,
                "wccNo": "WCC-VAL-01",
                "wccDate": "15/09/2026",
                "wccAmount": bad_amt
            }
        )
        assert res_bad.status_code in (400, 422), f"Expected failure for amount {bad_amt}, got {res_bad.status_code}"
        if res_bad.status_code == 400:
            assert "positive" in res_bad.json()["detail"].lower()

    # 2. Formatted positive amounts with currency symbol and commas should succeed
    res_formatted = client.post(
        "/api/v1/commercial/jms/wcc/submit-details",
        json={
            "poNo": po_no,
            "siteId": site_id,
            "wccNo": "WCC-VAL-01",
            "wccDate": "15/09/2026",
            "wccAmount": "₹ 2,45,000.00"
        }
    )
    assert res_formatted.status_code == 200
    assert res_formatted.json()["success"] is True
    assert float(res_formatted.json()["wccAmount"]) == 245000.0

    project_db_session.expire_all()
    db_proj = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
    assert db_proj.wcc_amount == Decimal("245000.00")
    assert db_proj.current_task == "Approval Pending"
