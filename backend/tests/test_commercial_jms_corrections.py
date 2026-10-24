import io
from datetime import date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectDocument
from app.services.commercial_project_service import CommercialProjectService
from app.services.wcc_pdf_service import WccPdfService
from app.services.jms_service import JmsService


def test_ageing_calculation_scenarios(project_db_session: Session):
    """
    Requirement 1: Ageing column
    - Calculate ageing as max(0, current date - project end date) in calendar days.
    - Test future, current, past, and missing project end dates.
    """
    today = date.today()
    future_date = today + timedelta(days=15)
    past_date = today - timedelta(days=12)

    # 1. Future completion date -> 0 Days
    p_future = TelecomProject(
        po_no="TEST-AGE-FUT",
        project_code="PRJ-AGE-FUT",
        completion_date=future_date,
        po_amount=Decimal("100000.00")
    )
    # 2. Current completion date -> 0 Days
    p_curr = TelecomProject(
        po_no="TEST-AGE-CUR",
        project_code="PRJ-AGE-CUR",
        completion_date=today,
        po_amount=Decimal("100000.00")
    )
    # 3. Past completion date -> 12 Days
    p_past = TelecomProject(
        po_no="TEST-AGE-PAST",
        project_code="PRJ-AGE-PAST",
        completion_date=past_date,
        po_amount=Decimal("100000.00")
    )
    # 4. Missing completion date -> 0 Days
    p_missing = TelecomProject(
        po_no="TEST-AGE-NONE",
        project_code="PRJ-AGE-NONE",
        completion_date=None,
        po_amount=Decimal("100000.00")
    )

    project_db_session.add_all([p_future, p_curr, p_past, p_missing])
    project_db_session.commit()

    try:
        service = CommercialProjectService(project_db_session)
        res = service.get_projects_list()

        items_map = {item.poNo: item.ageing for item in res.items}

        assert items_map["TEST-AGE-FUT"] == "0 Days"
        assert items_map["TEST-AGE-CUR"] == "0 Days"
        assert items_map["TEST-AGE-PAST"] == "12 Days"
        assert items_map["TEST-AGE-NONE"] == "0 Days"

    finally:
        project_db_session.query(TelecomProject).filter(
            TelecomProject.po_no.in_(["TEST-AGE-FUT", "TEST-AGE-CUR", "TEST-AGE-PAST", "TEST-AGE-NONE"])
        ).delete()
        project_db_session.commit()


def test_select_works_routing_priority_and_mutual_exclusivity(client: TestClient, project_db_session: Session):
    """
    Requirement 3:
    - PO Difference = PO Qty - JMS Qty
    - If PO Difference < 0 -> PO Amend with task 'PO Amend to be submit'
    - If JMS Qty != 0 -> WCC with task 'WCC to be submit'
    - Mutual exclusivity: negative difference row routes to PO Amend, never to WCC.
    - Zero JMS Qty with positive diff does not route to WCC.
    - Mixed line items in a single PO.
    """
    po_no = "TEST-MIXED-ROUTING-01"
    site_id = "SITE-MIX-01"

    # Cleanup
    project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    project_db_session.commit()

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        site_name="Mixed Routing Site",
        project_code="PRJ-MIX-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process"
    )

    # Line 1: Negative PO Difference (PO Qty 10, JMS Qty 15 -> PO Diff = -5 < 0)
    # Must route to PO Amend, NOT to WCC
    line_neg = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="ITEM-NEG-DIFF",
        item_description="Excess Quantity Item",
        uom="Nos",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("1000.00"),
        po_amount=Decimal("10000.00"),
        jms_qty=Decimal("15.00"),
        jms_amount=Decimal("15000.00"),
        jms_status="Approved"
    )

    # Line 2: Nonzero JMS Qty, positive PO Diff (PO Qty 20, JMS Qty 18 -> PO Diff = 2 >= 0, JMS Qty != 0)
    # Must route to WCC, NOT to PO Amend
    line_pos = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="20",
        item_code="ITEM-POS-DIFF",
        item_description="Valid Delivered Item",
        uom="Nos",
        po_qty=Decimal("20.00"),
        po_rate=Decimal("2000.00"),
        po_amount=Decimal("40000.00"),
        jms_qty=Decimal("18.00"),
        jms_amount=Decimal("36000.00"),
        jms_status="Approved"
    )

    # Line 3: Zero JMS Qty (PO Qty 5, JMS Qty 0 -> PO Diff = 5 >= 0, JMS Qty == 0)
    # Must NOT route to WCC or PO Amend
    line_zero = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="30",
        item_code="ITEM-ZERO-QTY",
        item_description="Undelivered Item",
        uom="Nos",
        po_qty=Decimal("5.00"),
        po_rate=Decimal("500.00"),
        po_amount=Decimal("2500.00"),
        jms_qty=Decimal("0.00"),
        jms_amount=Decimal("0.00"),
        jms_status="Approved"
    )

    project_db_session.add_all([proj, line_neg, line_pos, line_zero])
    project_db_session.commit()

    try:
        # Submit Select Works
        res = client.post(
            "/api/v1/commercial/jms/select-works/submit",
            json={"poNo": po_no, "siteId": site_id, "civil": True, "electrical": False, "service": False, "eb": False}
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["success"] is True
        assert data["destination"] == "mixed"

        project_db_session.refresh(proj)
        assert proj.current_task == "WCC to be submit / PO Amend to be submit"

        # Check PO Amend details endpoint
        amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
        assert amend_res.status_code == 200
        amend_data = amend_res.json()
        amend_items = amend_data["lineItems"]
        # Only Line 1 (negative diff) should be in PO Amend!
        assert len(amend_items) == 1
        assert amend_items[0]["itemCode"] == "ITEM-NEG-DIFF"
        assert amend_items[0]["poDifference"] == -5.0

        # Check WCC details endpoint
        wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
        assert wcc_res.status_code == 200
        wcc_data = wcc_res.json()
        wcc_items = wcc_data["lineItems"]
        # Only Line 2 (positive diff with nonzero JMS Qty) should be in WCC!
        # Line 1 (negative diff) must NEVER be in WCC!
        # Line 3 (zero JMS Qty) must NEVER be in WCC!
        assert len(wcc_items) == 1
        assert wcc_items[0]["itemCode"] == "ITEM-POS-DIFF"
        assert wcc_items[0]["jmsQty"] == 18.0

    finally:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
        project_db_session.commit()


def test_hoto_and_noc_document_upload_and_persistence(client: TestClient, project_db_session: Session):
    """
    Requirement 5: Documents tab — HOTO/NOC
    - Verify upload, persistence, and retrieval of HOTO and NOC document types.
    """
    po_no = "TEST-DOC-HOTO-01"
    site_id = "SITE-HOTO-01"

    # Cleanup
    project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    project_db_session.commit()

    proj = TelecomProject(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        project_code="PRJ-HOTO-01",
        project_type="New Build",
        current_task="JMS to be validate"
    )
    project_db_session.add(proj)
    project_db_session.commit()

    try:
        dummy_pdf = b"%PDF-1.4 Fake test content for HOTO document"

        # 1. Upload HOTO
        res_hoto = client.post(
            "/api/v1/commercial/jms/documents",
            data={"po_no": po_no, "site_id": site_id, "doc_type": "HOTO", "doc_details": "Handover To Operations Document"},
            files={"file": ("HOTO_Handover.pdf", io.BytesIO(dummy_pdf), "application/pdf")}
        )
        assert res_hoto.status_code == 200, res_hoto.text
        hoto_data = res_hoto.json()
        assert hoto_data["docType"] == "HOTO"
        assert hoto_data["docName"] == "HOTO_Handover.pdf"

        # 2. Upload NOC
        res_noc = client.post(
            "/api/v1/commercial/jms/documents",
            data={"po_no": po_no, "site_id": site_id, "doc_type": "NOC", "doc_details": "No Objection Certificate"},
            files={"file": ("NOC_Certificate.pdf", io.BytesIO(dummy_pdf), "application/pdf")}
        )
        assert res_noc.status_code == 200, res_noc.text
        noc_data = res_noc.json()
        assert noc_data["docType"] == "NOC"
        assert noc_data["docName"] == "NOC_Certificate.pdf"

        # 3. Retrieve documents list and verify both are persisted
        res_list = client.get(f"/api/v1/commercial/jms/documents?po_no={po_no}&site_id={site_id}")
        assert res_list.status_code == 200
        docs = res_list.json()
        doc_types = [d["docType"] for d in docs]
        assert "HOTO" in doc_types
        assert "NOC" in doc_types

        # 4. Verify DB records
        db_docs = project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).all()
        db_types = [d.document_number for d in db_docs]
        assert "HOTO" in db_types
        assert "NOC" in db_types

    finally:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
        project_db_session.commit()
