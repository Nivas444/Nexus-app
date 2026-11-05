import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import ProjectSessionLocal
from app.models.commercial_project import TelecomProject

client = TestClient(app)

TEST_PO = "TEST_PM_PO_999"
TEST_SITE = "TEST_PM_SITE_999"


@pytest.fixture(autouse=True)
def setup_and_teardown():
    db: Session = ProjectSessionLocal()
    try:
        db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO).delete(synchronize_session=False)
        # Create a new project row as if uploaded by commercial bulk upload
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=TEST_PO,
            project_code="PRJ-PM-999",
            project_type="New Build",
            sub_project_type="Civil",
            site_id=TEST_SITE,
            site_name="Test PM Site",
            po_amount=150000.0,
            project_status=None
        )
        db.add(proj)
        db.commit()
    finally:
        db.close()

    yield

    db = ProjectSessionLocal()
    try:
        db.query(TelecomProject).filter(TelecomProject.po_no == TEST_PO).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def test_get_projects_returns_pm_fields():
    """Verify GET /api/v1/commercial/projects includes PM fields."""
    response = client.get("/api/v1/commercial/projects")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    match = next((item for item in data["items"] if item["poNo"] == TEST_PO), None)
    assert match is not None
    assert match["siteName"] == "Test PM Site"
    assert match["projectStatus"] is None
    assert match["stn"] == ""
    assert match["isStn"] is False


def test_save_pm_project_details_with_stn_moves_to_yts():
    """When STN/SRN/CAM is enabled, status moves to YTS and STN is generated."""
    response = client.post(
        "/api/v1/commercial/projects/save-pm-details",
        json={
            "po_no": TEST_PO,
            "site_id": TEST_SITE,
            "project_status": "YTS",
            "tower_type": "GBT",
            "tower_height": "40m",
            "sbc": "15 t/m2",
            "wind_speed": "47 m/s",
            "planning_boq": "Civil foundation items",
            "stn": True,
            "srn": False,
            "cam": False,
            "tsp_materials": True,
            "site_survey": True,
            "civil_works": True
        }
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    proj_item = res_data["project"]
    assert proj_item["projectStatus"] == "YTS"
    assert proj_item["towerType"] == "GBT"
    assert proj_item["towerHeight"] == "40m"
    assert proj_item["isStn"] is True
    assert proj_item["stn"].startswith("STN-")
    assert proj_item["tspMaterials"] is True
    assert proj_item["materials"] == "Dispatched"

    # Verify DB persistence
    db: Session = ProjectSessionLocal()
    try:
        db_proj = db.query(TelecomProject).filter_by(po_no=TEST_PO).first()
        assert db_proj is not None
        assert db_proj.project_status == "YTS"
        assert db_proj.tower_type == "GBT"
        assert float(db_proj.tower_height) == 40.0
        assert db_proj.stn is True
        assert db_proj.tsp_materials is True
        assert db_proj.srn is False
        assert db_proj.cam is False
    finally:
        db.close()


def test_save_pm_project_details_without_stn_moves_to_project_update():
    """When neither STN, SRN, nor CAM is enabled, status moves to Project Update."""
    response = client.post(
        "/api/v1/commercial/projects/save-pm-details",
        json={
            "po_no": TEST_PO,
            "site_id": TEST_SITE,
            "project_status": "Project Update",
            "tower_type": "RTT",
            "tower_height": "30m",
            "stn": False,
            "srn": False,
            "cam": False,
            "tsp_materials": False,
            "additional_approval": True,
            "service_contract": True
        }
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    proj_item = res_data["project"]
    assert proj_item["projectStatus"] == "Project Update"
    assert proj_item["towerType"] == "RTT"
    assert proj_item["isStn"] is False
    assert proj_item["stn"] == ""
    assert proj_item["additionalApproval"] is True
    assert proj_item["serviceContract"] is True

    # Verify DB persistence
    db: Session = ProjectSessionLocal()
    try:
        db_proj = db.query(TelecomProject).filter_by(po_no=TEST_PO).first()
        assert db_proj is not None
        assert db_proj.project_status == "Project Update"
        assert db_proj.tower_type == "RTT"
        assert db_proj.stn is False
        assert db_proj.additional_approval is True
        assert db_proj.service_contract is True
        assert db_proj.site_survey is False
    finally:
        db.close()
