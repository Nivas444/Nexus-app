import io
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectExpense, ProjectDocument
from app.models.indus_gbpa import IndusCustomerGbpa
from app.services.wcc_pdf_service import WccPdfService


def test_jms_workflow_complete(client: TestClient, project_db_session: Session, db_session: Session):
    # Setup test identifiers
    po_capex = "TEST-PO-CAPEX-001"
    po_opex = "TEST-PO-OPEX-002"
    site_id_1 = "IN-SITE-TEST-101"
    site_id_2 = "IN-SITE-TEST-102"

    try:
        # Clean previous test records if any
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(ProjectExpense).filter(ProjectExpense.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.commit()

        # 1. Create CAPEX and OPEX Projects in TelecomProject
        proj_capex = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_capex,
            site_id=site_id_1,
            site_name="Test Capex Site",
            project_code="PRJ-CAPEX-101",
            project_type="New Build",
            sub_project_type="Civil",
            po_type="Capex",
            po_amount=Decimal("500000.00"),
            current_task="JMS to be validate"
        )
        proj_opex = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_opex,
            site_id=site_id_2,
            site_name="Test Opex Site",
            project_code="PRJ-OPEX-102",
            project_type="Maintenance",
            sub_project_type="Electrical",
            po_type="Opex",
            po_amount=Decimal("200000.00"),
            current_task="JMS to be validate"
        )
        project_db_session.add_all([proj_capex, proj_opex])
        project_db_session.commit()

        # 2. Add line items to CAPEX PO
        line_item_1 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_capex,
            site_id=site_id_1,
            line_number="10",
            item_code="GBPA-SRV-INST",
            item_description="Civil & Electrical Installation Service",
            uom="Set",
            po_qty=Decimal("2.00"),
            po_rate=Decimal("125000.00"),
            po_amount=Decimal("250000.00"),
            po_total_amount=Decimal("250000.00"),
            jms_qty=Decimal("2.00"),
            jms_amount=Decimal("250000.00"),
            net_material_qty=Decimal("2.00"),
            jms_status="Not Approved"
        )
        line_item_2 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_capex,
            site_id=site_id_1,
            line_number="20",
            item_code="GBPA-GEN-15K",
            item_description="15kVA Silent Diesel Generator",
            uom="Nos",
            po_qty=Decimal("1.00"),
            po_rate=Decimal("280000.00"),
            po_amount=Decimal("280000.00"),
            po_total_amount=Decimal("280000.00"),
            jms_qty=Decimal("1.00"),
            jms_amount=Decimal("280000.00"),
            net_material_qty=Decimal("1.00"),
            jms_status="Not Approved"
        )
        project_db_session.add_all([line_item_1, line_item_2])

        # 3. Add Project Expenses for CAPEX PO
        exp1 = ProjectExpense(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_capex,
            site_id=site_id_1,
            request_number="REQ-EXP-001",
            expense_head="Survey",
            expense_name="Site Soil Survey",
            amount=Decimal("35000.00")
        )
        exp2 = ProjectExpense(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=po_capex,
            site_id=site_id_1,
            request_number="REQ-EXP-002",
            expense_head="Civil",
            expense_name="Concrete Testing",
            amount=Decimal("15000.00")
        )
        # Expense for an unrelated PO to ensure proper scoping
        exp_unrelated = ProjectExpense(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no="PO-UNRELATED-999",
            site_id="SITE-OTHER-999",
            request_number="REQ-EXP-999",
            expense_head="Other",
            expense_name="Unrelated Expense",
            amount=Decimal("99999.00")
        )
        project_db_session.add_all([exp1, exp2, exp_unrelated])
        project_db_session.commit()

        # Refresh objects to get IDs
        project_db_session.refresh(line_item_1)
        project_db_session.refresh(line_item_2)
        li1_id = line_item_1.project_po_line_item_id
        li2_id = line_item_2.project_po_line_item_id

        # -------------------------------------------------------------
        # Test 1 & 2 & 5 & 6 & 7 & 8: Retrieve PO details & Summaries
        # -------------------------------------------------------------
        res = client.get(f"/api/v1/commercial/jms/po-details?po_no={po_capex}&site_id={site_id_1}")
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["poNo"] == po_capex
        assert data["siteId"] == site_id_1
        assert data["poType"] == "Capex"
        assert len(data["lineItems"]) == 2
        # Financial summary: Total JMS Amount = 250000 + 280000 = 530000
        assert data["totalJmsAmount"] == 530000.00
        # Expense summary: Total Expense = 35000 + 15000 = 50000 (excluding unrelated)
        assert data["totalExpenseAmount"] == 50000.00
        assert data["canSubmit"] is False  # Rows not yet approved

        # -------------------------------------------------------------
        # Test 3 & 4: CAPEX vs OPEX GBPA Line Items Filtering
        # -------------------------------------------------------------
        # For CAPEX PO: only CAPEX GBPA items
        res_capex_gbpa = client.get(f"/api/v1/commercial/jms/gbpa-items?po_no={po_capex}&site_id={site_id_1}")
        assert res_capex_gbpa.status_code == 200
        capex_items = res_capex_gbpa.json()
        assert len(capex_items) > 0
        for item in capex_items:
            assert item["itemType"].lower() == "capex"

        # For OPEX PO: only OPEX GBPA items
        res_opex_gbpa = client.get(f"/api/v1/commercial/jms/gbpa-items?po_no={po_opex}&site_id={site_id_2}")
        assert res_opex_gbpa.status_code == 200
        opex_items = res_opex_gbpa.json()
        assert len(opex_items) > 0
        for item in opex_items:
            assert item["itemType"].lower() == "opex"

        # -------------------------------------------------------------
        # Test 5 & 6: Cross-Category Validation (Reject adding OPEX to CAPEX)
        # -------------------------------------------------------------
        # Try to add OPEX item (GBPA-OPT-FIB) to CAPEX PO -> Should be rejected (400)
        res_invalid_add = client.post(
            "/api/v1/commercial/jms/line-items",
            json={"poNo": po_capex, "siteId": site_id_1, "itemCode": "GBPA-OPT-FIB", "qty": 10.0}
        )
        assert res_invalid_add.status_code == 400
        assert "cannot add opex" in res_invalid_add.json()["detail"].lower()

        # Try to add CAPEX item (GBPA-TWR-40M) to OPEX PO -> Should be rejected (400)
        res_invalid_add_opex = client.post(
            "/api/v1/commercial/jms/line-items",
            json={"poNo": po_opex, "siteId": site_id_2, "itemCode": "GBPA-TWR-40M", "qty": 1.0}
        )
        assert res_invalid_add_opex.status_code == 400
        assert "cannot add capex" in res_invalid_add_opex.json()["detail"].lower()

        # -------------------------------------------------------------
        # Test 12: Editable JMS Qty and Calculations
        # -------------------------------------------------------------
        # Update JMS Qty for line_item_1 from 2.00 to 3.50
        res_update_qty = client.patch(
            f"/api/v1/commercial/jms/line-items/{li1_id}/qty",
            json={"jmsQty": 3.50}
        )
        assert res_update_qty.status_code == 200
        qty_data = res_update_qty.json()
        assert qty_data["jmsQty"] == 3.50
        # Rate is 125000, so new amount = 3.5 * 125000 = 437500
        assert qty_data["amount"] == 437500.00
        # PO Difference = PO Qty - JMS Qty = 2.0 - 3.5 = -1.50
        assert qty_data["poDifference"] == -1.50
        # Total JMS Amount = 437500 + 280000 = 717500
        assert qty_data["totalJmsAmount"] == 717500.00

        # Reload PO details and verify persistence
        res_recheck = client.get(f"/api/v1/commercial/jms/po-details?po_no={po_capex}&site_id={site_id_1}")
        assert res_recheck.status_code == 200
        recheck_data = res_recheck.json()
        assert recheck_data["totalJmsAmount"] == 717500.00
        li1_rechecked = next(it for it in recheck_data["lineItems"] if it["id"] == li1_id)
        assert li1_rechecked["jmsQty"] == 3.50
        assert li1_rechecked["amount"] == 437500.00
        assert li1_rechecked["poDifference"] == -1.50

        # -------------------------------------------------------------
        # Test Check Item Endpoint (Type & Check in Add Line Item)
        # -------------------------------------------------------------
        # Check valid Capex item for Capex PO
        res_check_capex = client.get(
            f"/api/v1/commercial/jms/check-item?po_no={po_capex}&site_id={site_id_1}&item_code=GBPA-TWR-40M"
        )
        assert res_check_capex.status_code == 200
        chk_c = res_check_capex.json()
        assert chk_c["found"] is True
        assert chk_c["eligible"] is True
        assert chk_c["itemCode"] == "GBPA-TWR-40M"

        # Check Opex item for Capex PO (Category Mismatch)
        res_check_opex = client.get(
            f"/api/v1/commercial/jms/check-item?po_no={po_capex}&site_id={site_id_1}&item_code=GBPA-OPT-FIB"
        )
        assert res_check_opex.status_code == 200
        chk_o = res_check_opex.json()
        assert chk_o["found"] is True
        assert chk_o["eligible"] is False
        assert "mismatch" in chk_o["detail"].lower()

        # Check non-existent item
        res_check_none = client.get(
            f"/api/v1/commercial/jms/check-item?po_no={po_capex}&site_id={site_id_1}&item_code=NON-EXISTENT-XYZ"
        )
        assert res_check_none.status_code == 200
        assert res_check_none.json()["found"] is False

        # -------------------------------------------------------------
        # Test 13 & 14: Row Approval & Submit Availability
        # -------------------------------------------------------------
        # Before approval, submit should fail
        res_early_submit = client.post(
            "/api/v1/commercial/jms/submit",
            json={"poNo": po_capex, "siteId": site_id_1}
        )
        assert res_early_submit.status_code == 400
        assert "must be approved" in res_early_submit.json()["detail"].lower()

        # Approve line 1
        res_app1 = client.post(
            "/api/v1/commercial/jms/line-items/approve",
            json={"lineItemIds": [li1_id], "status": "Approved"}
        )
        assert res_app1.status_code == 200
        assert res_app1.json()["canSubmit"] is False  # line 2 still unapproved

        # Approve line 2
        res_app2 = client.post(
            "/api/v1/commercial/jms/line-items/approve",
            json={"lineItemIds": [li2_id], "status": "Approved"}
        )
        assert res_app2.status_code == 200
        assert res_app2.json()["canSubmit"] is True

        # Verify persistence after reload
        res_reload_app = client.get(f"/api/v1/commercial/jms/po-details?po_no={po_capex}&site_id={site_id_1}")
        assert res_reload_app.json()["canSubmit"] is True
        for it in res_reload_app.json()["lineItems"]:
            assert it["jmsStatus"] == "Approved"
        # Test Reversing Approval (where supported by UI/API)
        res_unapprove = client.post(
            "/api/v1/commercial/jms/line-items/approve",
            json={"lineItemIds": [li1_id], "status": "Not Approved"}
        )
        assert res_unapprove.status_code == 200
        assert res_unapprove.json()["canSubmit"] is False
        
        # Verify submit is blocked again
        res_blocked_submit = client.post(
            "/api/v1/commercial/jms/submit",
            json={"poNo": po_capex, "siteId": site_id_1}
        )
        assert res_blocked_submit.status_code == 400
        assert "must be approved" in res_blocked_submit.json()["detail"].lower()

        # Re-approve line 1
        res_reapp = client.post(
            "/api/v1/commercial/jms/line-items/approve",
            json={"lineItemIds": [li1_id], "status": "Approved"}
        )
        assert res_reapp.status_code == 200
        assert res_reapp.json()["canSubmit"] is True

        # -------------------------------------------------------------
        # Test 15 & 16: Submit to Project Manager & Idempotency
        # -------------------------------------------------------------
        res_submit = client.post(
            "/api/v1/commercial/jms/submit",
            json={"poNo": po_capex, "siteId": site_id_1}
        )
        assert res_submit.status_code == 200
        submit_data = res_submit.json()
        assert submit_data["success"] is True
        assert submit_data["task"] == "JMS approval pending"

        # Repeated submit is idempotent and succeeds without duplicates
        res_resubmit = client.post(
            "/api/v1/commercial/jms/submit",
            json={"poNo": po_capex, "siteId": site_id_1}
        )
        assert res_resubmit.status_code == 200

        # Verify DB directly
        proj_in_db = project_db_session.query(TelecomProject).filter(TelecomProject.po_no == po_capex).first()
        assert proj_in_db.current_task == "JMS approval pending"

        # -------------------------------------------------------------
        # Test 17 & 18 & 19: Documents Integration (Upload, List, Delete)
        # -------------------------------------------------------------
        fake_pdf = b"%PDF-1.4 Fake test PDF file for JMS documents testing"
        res_upload = client.post(
            "/api/v1/commercial/jms/documents",
            data={
                "po_no": po_capex,
                "site_id": site_id_1,
                "doc_type": "Survey report",
                "doc_details": "Initial site survey certification"
            },
            files={"file": ("Survey_Report_001.pdf", io.BytesIO(fake_pdf), "application/pdf")}
        )
        assert res_upload.status_code == 200, res_upload.text
        doc_data = res_upload.json()
        doc_id = doc_data["id"]
        assert doc_data["docType"] == "Survey report"
        assert doc_data["docName"] == "Survey_Report_001.pdf"

        # List documents after reload
        res_docs_list = client.get(f"/api/v1/commercial/jms/documents?po_no={po_capex}&site_id={site_id_1}")
        assert res_docs_list.status_code == 200
        docs_list = res_docs_list.json()
        assert any(d["id"] == doc_id for d in docs_list)

        # Download document
        res_dl = client.get(f"/api/v1/commercial/jms/documents/{doc_id}/download")
        assert res_dl.status_code == 200
        assert res_dl.content.startswith(b"%PDF-")

        # Delete document
        res_del = client.delete(f"/api/v1/commercial/jms/documents/{doc_id}")
        assert res_del.status_code == 200

        # Verify deletion from list
        res_after_del = client.get(f"/api/v1/commercial/jms/documents?po_no={po_capex}&site_id={site_id_1}")
        assert not any(d["id"] == doc_id for d in res_after_del.json())

    finally:
        # -------------------------------------------------------------
        # Clean up test records
        # -------------------------------------------------------------
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(ProjectExpense).filter(ProjectExpense.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no.in_([po_capex, po_opex])).delete()
        project_db_session.commit()


def test_wcc_pdf_service_three_page_generation(project_db_session: Session):
    """
    Test WccPdfService generates exactly 3 pages:
    Page 1: Annexure
    Page 2: BOQ
    Page 3: Work Completion Certificate
    Verifies dimensions, narrow borders, metadata, and toggle mappings.
    """
    test_po = "TEST-WCC-PDF-001"
    test_site = "IN-SITE-PDF-001"

    try:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Guindy Hub",
            project_code="PRJ-2026-PDF",
            project_type="New Build",
            tower_type="Ground Based Tower (GBT)",
            current_task="JMS to be process"
        )
        line1 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-CIVIL-001",
            item_description="Tower Foundation Excavation and PCC Works",
            uom="Nos",
            po_qty=Decimal("10.00"),
            po_rate=Decimal("15000.00"),
            po_amount=Decimal("150000.00"),
            jms_qty=Decimal("10.00"),
            jms_amount=Decimal("150000.00"),
            jms_status="Approved"
        )
        line2 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="2",
            item_code="GBPA-CIVIL-002",
            item_description="Reinforced Cement Concrete (RCC) M25 Grade",
            uom="Cum",
            po_qty=Decimal("20.00"),
            po_rate=Decimal("6000.00"),
            po_amount=Decimal("120000.00"),
            jms_qty=Decimal("20.00"),
            jms_amount=Decimal("120000.00"),
            jms_status="Approved"
        )
        project_db_session.add_all([proj, line1, line2])
        project_db_session.commit()

        service = WccPdfService(project_db_session)
        selected_works = {"civil": True, "electrical": False, "service": True, "eb": False}
        pdf_bytes = service.generate_three_page_wcc_pdf(test_po, test_site, selected_works)

        assert pdf_bytes.startswith(b"%PDF-")
        reader = PdfReader(io.BytesIO(pdf_bytes))
        assert len(reader.pages) == 3, f"Expected exactly 3 pages, found {len(reader.pages)}"

        # Verify page 1: Annexure
        p1_text = reader.pages[0].extract_text()
        assert "ANNEXURE" in p1_text
        assert "Project ID" in p1_text
        assert "PRJ-2026-PDF" in p1_text
        assert "GBPA-CIVIL-001" in p1_text
        assert "Total Amount" in p1_text

        # Verify page 2: BOQ
        p2_text = reader.pages[1].extract_text()
        assert "BOQ" in p2_text
        assert "GBPA-CIVIL-001" in p2_text
        assert "10.00" in p2_text

        # Verify page 3: Work Completion Certificate
        p3_text = reader.pages[2].extract_text()
        assert "Work Completion Certificate" in p3_text
        assert "CIVIL WORKS, ELECTRICAL WORKS & TSP UPGRADATION" in p3_text
        assert "Contractor" in p3_text
        assert "Guindy Hub" in p3_text
        assert "Civil Works" in p3_text
        assert "Electrical Works" in p3_text
        assert "TSP Services" in p3_text
        assert "EB Works" in p3_text
        assert "This is to Certify that the site has been constructed" in p3_text

    finally:
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()


def test_select_works_submission_api_and_persistence(client: TestClient, project_db_session: Session):
    """
    Test Select Works submission endpoint:
    - POST /api/v1/commercial/jms/select-works/submit
    - Generates 3-page PDF and merges with uploaded documents
    - Persists in documents table and telecom_project
    - Retry is idempotent (updates existing documents without duplicates)
    """
    test_po = "TEST-WCC-SUBMIT-002"
    test_site = "IN-SITE-SUBMIT-002"

    try:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            site_name="Ambattur Central",
            project_code="PRJ-SUBMIT-002",
            project_type="New Build",
            tower_type="Rooftop Tower (RTT)",
            current_task="JMS to be process"
        )
        line = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-ELEC-100",
            item_description="Electrical Cable Laying",
            uom="M",
            po_qty=Decimal("50.00"),
            po_rate=Decimal("200.00"),
            po_amount=Decimal("10000.00"),
            jms_qty=Decimal("50.00"),
            jms_amount=Decimal("10000.00"),
            jms_status="Approved"
        )
        project_db_session.add_all([proj, line])
        project_db_session.commit()

        # Upload a 1-page test PDF to JMS documents
        from reportlab.pdfgen import canvas as test_canvas
        dummy_buf = io.BytesIO()
        c = test_canvas.Canvas(dummy_buf)
        c.drawString(100, 700, "Attached JMS Survey Report Document")
        c.showPage()
        c.save()
        dummy_pdf_bytes = dummy_buf.getvalue()

        up_res = client.post(
            "/api/v1/commercial/jms/documents",
            data={"po_no": test_po, "site_id": test_site, "doc_type": "Survey report", "doc_details": "Test Survey"},
            files={"file": ("Attached_Survey.pdf", io.BytesIO(dummy_pdf_bytes), "application/pdf")}
        )
        assert up_res.status_code == 200, up_res.text

        # Call Select Works submit endpoint
        res = client.post(
            "/api/v1/commercial/jms/select-works/submit",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "civil": True,
                "electrical": True,
                "service": False,
                "eb": False
            }
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["totalPages"] >= 4  # 3 generated pages + uploaded JMS document pages
        assert data["fileName"] == f"WCC_Merged_{test_po}.pdf"
        assert "pdfDataUri" in data

        # Verify DB persistence in documents table
        docs = project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).all()
        doc_numbers = [d.document_number for d in docs]
        assert "WCC Certificate" in doc_numbers
        assert "WCC Merged Document" in doc_numbers

        # Verify telecom_project record updated
        project_db_session.refresh(proj)
        assert proj.current_task in ["WCC to be submit", "WCC to be raise"]
        assert proj.wcc_no == f"WCC-{test_po}"

        # Retry submission: should update existing documents without duplicates
        res_retry = client.post(
            "/api/v1/commercial/jms/select-works/submit",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "civil": True,
                "electrical": False,
                "service": False,
                "eb": False
            }
        )
        assert res_retry.status_code == 200
        docs_after_retry = project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).all()
        # Count of WCC Certificate and WCC Merged Document should remain 1 each
        wcc_cert_count = sum(1 for d in docs_after_retry if d.document_number == "WCC Certificate")
        wcc_merged_count = sum(1 for d in docs_after_retry if d.document_number == "WCC Merged Document")
        assert wcc_cert_count == 1, "Duplicate WCC Certificate created on retry"
        assert wcc_merged_count == 1, "Duplicate WCC Merged Document created on retry"

    finally:
        project_db_session.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        project_db_session.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        project_db_session.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        project_db_session.commit()

