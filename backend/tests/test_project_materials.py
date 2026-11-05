import pytest
from app.db.session import ProjectSessionLocal
from app.services.commercial_project_service import CommercialProjectService

def test_project_materials_formulas_and_db_wiring():
    db = ProjectSessionLocal()
    try:
        svc = CommercialProjectService(db)
        # Test save project material
        data = {
            "po_no": "TEST-MAT-PO-99",
            "site_id": "SITE-TEST-99",
            "materials_name": "Test Material Earth Rod",
            "uom": "NOS",
            "request_qty": 30,
            "dispatched_qty": 25,
            "mrn_qty": 5,
            "rate": 150,
            "jms_qty": 28
        }
        res = svc.save_project_material(data)
        assert res["materialName"] == "Test Material Earth Rod"
        # net = min - mrn = 25 - 5 = 20
        assert res["net"] == 20.0
        # mrr = jms - min = 28 - 25 = 3
        assert res["mrr"] == 3.0
        # difference = jms - net = 28 - 20 = 8
        assert res["difference"] == 8.0
        # amount = net * rate = 20 * 150 = 3000
        assert res["amount"] == 3000.0

        # Test retrieval
        items = svc.get_project_materials(po_no="TEST-MAT-PO-99")
        assert len(items) >= 1
        found = next(i for i in items if i["materialName"] == "Test Material Earth Rod")
        assert found["net"] == "20.00"
        assert found["mrr"] == "3.00"
        assert found["difference"] == "8.00"
        assert found["amount"] == "3,000.00"
    finally:
        db.close()
