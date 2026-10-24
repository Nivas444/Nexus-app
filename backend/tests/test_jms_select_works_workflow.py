import io
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectDocument


def test_select_works_routing_to_po_amend(client: TestClient, project_db_session: Session):
    """
    When PO has PO Difference < 0 (or material difference > 0), submitting Select Works
    must route the project to PO Amend with task and status 'PO Amend to be submit'.
    """
    po_no = "TEST-SW-AMEND-01"
    site_id = "SITE-SW-01"

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
        site_name="Amend Route Site",
        project_code="PRJ-SW-01",
        project_type="New Build",
        sub_project_type="Civil",
        current_task="JMS to be process",
        project_status="JMS to be process"
    )
    # Line with negative difference (JMS Qty 15 > PO Qty 10 -> diff -5)
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-CIVIL-001",
        item_description="Civil Concrete Work",
        uom="M3",
        po_qty=Decimal("10.00"),
        po_rate=Decimal("5000.00"),
        po_amount=Decimal("50000.00"),
        jms_qty=Decimal("15.00"),
        jms_amount=Decimal("75000.00"),
        net_material_qty=Decimal("10.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # Submit select works
    res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "civil": True, "electrical": False, "service": False, "eb": False}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["destination"] == "po_amend"
    assert data["task"] == "PO Amend to be submit"
    assert data["status"] == "PO Amend to be submit"

    # Verify project record in DB
    project_db_session.refresh(proj)
    assert proj.current_task == "PO Amend to be submit"
    assert proj.project_status == "PO Amend to be submit"
    assert proj.po_status == "PO Amend to be submit"

    # Verify PO Amend details endpoint includes this line
    amend_res = client.get(f"/api/v1/commercial/jms/po-amend-details?po_no={po_no}&site_id={site_id}")
    assert amend_res.status_code == 200
    amend_data = amend_res.json()
    assert len(amend_data["lineItems"]) == 1
    assert amend_data["task"] == "PO Amend to be submit"

    # Cleanup
    project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    project_db_session.commit()


def test_select_works_routing_to_wcc(client: TestClient, project_db_session: Session):
    """
    When PO has PO Difference >= 0 (and no material difference), submitting Select Works
    must route the project to WCC with task and status 'WCC to be submit'.
    """
    po_no = "TEST-SW-WCC-01"
    site_id = "SITE-SW-02"

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
        site_name="WCC Route Site",
        project_code="PRJ-SW-02",
        project_type="New Build",
        sub_project_type="Electrical",
        current_task="JMS to be process",
        project_status="JMS to be process"
    )
    # Line with zero difference (JMS Qty 8 == PO Qty 8)
    line = TelecomIndusPo(
        company_name="Nexus",
        customer_name="Indus Towers Ltd",
        po_no=po_no,
        site_id=site_id,
        line_number="10",
        item_code="GBPA-ELEC-001",
        item_description="Electrical Panel",
        uom="Nos",
        po_qty=Decimal("8.00"),
        po_rate=Decimal("12000.00"),
        po_amount=Decimal("96000.00"),
        jms_qty=Decimal("8.00"),
        jms_amount=Decimal("96000.00"),
        net_material_qty=Decimal("8.00"),
        jms_status="Approved"
    )
    project_db_session.add_all([proj, line])
    project_db_session.commit()

    # Submit select works
    res = client.post(
        "/api/v1/commercial/jms/select-works/submit",
        json={"poNo": po_no, "siteId": site_id, "civil": False, "electrical": True, "service": False, "eb": False}
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["destination"] == "wcc"
    assert data["task"] == "WCC to be submit"
    assert data["status"] == "WCC to be submit"

    # Verify project record in DB
    project_db_session.refresh(proj)
    assert proj.current_task == "WCC to be submit"
    assert proj.project_status == "WCC to be submit"

    # Verify WCC details endpoint includes this line
    wcc_res = client.get(f"/api/v1/commercial/jms/wcc-details?po_no={po_no}&site_id={site_id}")
    assert wcc_res.status_code == 200
    wcc_data = wcc_res.json()
    assert len(wcc_data["lineItems"]) == 1
    assert wcc_data["task"] == "WCC to be submit"

    # Verify PDF download endpoint works
    dl_res = client.get(f"/api/v1/commercial/jms/pdf/download?po_no={po_no}&site_id={site_id}")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert len(dl_res.content) > 1000

    # Cleanup
    project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == po_no).delete()
    project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no).delete()
    project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_no).delete()
    project_db_session.commit()
