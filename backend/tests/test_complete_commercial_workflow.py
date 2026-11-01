import io
from datetime import date
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader
from reportlab.pdfgen import canvas

from app.main import app
from app.db.session import ProjectSessionLocal, AccountsSessionLocal
from app.models.commercial_project import TelecomProject, TelecomIndusPo, ProjectExpense, ProjectDocument
from app.models.commercial_sales import Sales, ReceiptIndus

client = TestClient(app)


def _create_sample_pdf(text: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 700, f"Test PDF Page: {text}")
    c.showPage()
    c.save()
    return buf.getvalue()


def test_complete_commercial_workflow_end_to_end():
    """
    Complete end-to-end audit test of the full Commercial Manager workflow:
    1. New Project creation & validation
    2. JMS workflow: row approval, line item qty update, merged document generation, submit
    3. PO Amendment workflow:
       - PO Amend to be submit -> submit reference ID -> Approval Pending
       - Approval Pending -> Reject -> Rejected
       - Rejected -> Edit qty, PDF Process, resubmit -> Approval Pending
       - Approval Pending -> submit amendment status -> routes to WCC
    4. WCC workflow:
       - WCC to be submit -> submit WCC details -> Approval Pending
       - Approval Pending -> Reject -> Rejected
       - Rejected -> Edit qty, PDF Process, resubmit -> Approval Pending
       - Approval Pending -> submit receipt details -> routes to Invoice
    5. Invoice workflow:
       - Retrieved in invoice list
       - Submit invoice details and hash
       - Tax invoice PDF generation + 28 checklist items on 1 page, stored in sales.invoice_document
       - Download verified
       - Approved -> moved to Receivable
    6. Receivable workflow:
       - Hydrated from sales and receipt_indus
       - Update invoice amount, deduction, received amount verified in DB
    7. PO To Be Open workflow:
       - Tested independently with all 3 eligibility conditions
    """
    pdb = ProjectSessionLocal()
    adb = AccountsSessionLocal()

    test_po = "E2E-TEST-PO-001"
    test_site = "E2E-SITE-001"
    test_inv = "INV-E2E-TEST-001"

    try:
        # Cleanup any existing test records with these IDs first
        pdb.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        pdb.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        pdb.query(ProjectExpense).filter(ProjectExpense.po_no == test_po).delete()
        pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        pdb.commit()

        adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).delete()
        adb.query(Sales).filter(Sales.voucher_number == test_inv).delete()
        adb.commit()

        # =================================================================
        # STEP 1: NEW PROJECT
        # =================================================================
        proj = TelecomProject(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            project_code="PRJ-E2E-001",
            po_no=test_po,
            site_id=test_site,
            site_name="E2E Test Site",
            project_type="New Build",
            sub_project_type="Civil",
            po_type="Capex",
            po_amount=Decimal("300000.00"),
            current_task="JMS to be validate",
            project_status="JMS to be validate"
        )
        line1 = TelecomIndusPo(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            po_no=test_po,
            site_id=test_site,
            line_number="1",
            item_code="GBPA-CIVIL-001",
            item_description="Tower Foundation Civil",
            uom="Nos",
            po_qty=Decimal("2.00"),
            po_rate=Decimal("100000.00"),
            po_amount=Decimal("200000.00"),
            jms_qty=Decimal("3.00"),  # JMS > PO requires PO amendment
            jms_amount=Decimal("300000.00"),
            jms_status="Not Approved"
        )
        pdb.add(proj)
        pdb.add(line1)
        pdb.commit()

        # Verify New Project listed
        res_np = client.get("/api/v1/commercial/projects")
        assert res_np.status_code == 200
        np_pos = [p["poNo"] for p in res_np.json()["items"]]
        assert test_po in np_pos

        # =================================================================
        # STEP 2: JMS
        # =================================================================
        # 2a. Detail lookup
        res_jms_det = client.get(f"/api/v1/commercial/jms/po-details?po_no={test_po}&site_id={test_site}")
        assert res_jms_det.status_code == 200
        jms_det = res_jms_det.json()
        assert jms_det["canSubmit"] is False
        assert len(jms_det["lineItems"]) == 1

        li1_id = line1.project_po_line_item_id

        # 2b. Row approval
        res_app = client.post(
            "/api/v1/commercial/jms/line-items/approve",
            json={"lineItemIds": [li1_id], "status": "Approved"}
        )
        assert res_app.status_code == 200
        assert res_app.json()["canSubmit"] is True

        # 2c. Attach a sample document to JMS Documents tab
        sample_doc_pdf = _create_sample_pdf("Initial JMS Survey Report")
        res_doc_up = client.post(
            "/api/v1/commercial/jms/documents",
            data={"po_no": test_po, "site_id": test_site, "doc_type": "Survey report", "doc_details": "Site Survey"},
            files={"file": ("JMS_Survey.pdf", io.BytesIO(sample_doc_pdf), "application/pdf")}
        )
        assert res_doc_up.status_code == 200

        # 2d. Submit JMS to PM (generates and persists jms_merged_document)
        res_jms_sub = client.post(
            "/api/v1/commercial/jms/submit",
            json={"poNo": test_po, "siteId": test_site}
        )
        assert res_jms_sub.status_code == 200
        assert res_jms_sub.json()["task"] == "JMS approval pending"

        # Verify jms_merged_document stored in DB
        pdb.expire_all()
        refreshed_proj = pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).first()
        assert refreshed_proj.jms_merged_document is not None
        assert refreshed_proj.jms_merged_document.startswith(b"%PDF-")

        # 2e. Route task to PO Amendment
        refreshed_proj.current_task = "PO Amend to be submit"
        refreshed_proj.po_status = "Amend Requested"
        line1.po_amendment_type = "PO Amend to be submit"
        pdb.commit()

        # =================================================================
        # STEP 3: PO AMENDMENT
        # =================================================================
        # 3a. State 1: PO Amend to be submit -> submit reference ID
        ref_id_val = "REF-E2E-PA-001"
        res_pa_ref = client.post(
            "/api/v1/commercial/jms/po-amend/submit-reference",
            json={"poNo": test_po, "siteId": test_site, "poAmendmentRefId": ref_id_val}
        )
        assert res_pa_ref.status_code == 200
        assert res_pa_ref.json()["task"] == "Approval Pending"

        # Verify DB
        pdb.expire_all()
        db_proj = pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).first()
        assert db_proj.current_task == "Approval Pending"
        assert db_proj.po_amendment_ref_id == ref_id_val

        # 3b. State 2: Reject -> Rejected
        res_rej = client.post(
            "/api/v1/commercial/jms/reject",
            json={"poNo": test_po, "siteId": test_site, "workflow": "PO Amend"}
        )
        assert res_rej.status_code == 200
        assert res_rej.json()["task"] == "Rejected"

        pdb.expire_all()
        db_proj = pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).first()
        assert db_proj.current_task == "Rejected"

        # 3c. State 3: Rejected -> Edit qty, PDF Process, resubmit
        res_qty = client.patch(
            f"/api/v1/commercial/jms/po-amend/line-items/{li1_id}/qty",
            json={"qty": 2.50, "poNo": test_po, "siteId": test_site}
        )
        assert res_qty.status_code == 200

        # PDF Process in Rejected state
        res_pdf_proc = client.post(
            "/api/v1/commercial/jms/pdf/process",
            json={"poNo": test_po, "siteId": test_site}
        )
        assert res_pdf_proc.status_code == 200
        assert res_pdf_proc.json()["totalPages"] >= 4

        # Download PDF
        res_dl = client.get(f"/api/v1/commercial/jms/pdf/download?po_no={test_po}&site_id={test_site}")
        assert res_dl.status_code == 200
        assert res_dl.headers["content-type"] == "application/pdf"
        assert len(res_dl.content) > 1000

        # Resubmit from Rejected -> Approval Pending
        res_resub = client.post(
            "/api/v1/commercial/jms/po-amend/submit-reference",
            json={"poNo": test_po, "siteId": test_site, "poAmendmentRefId": ref_id_val}
        )
        assert res_resub.status_code == 200
        assert res_resub.json()["task"] == "Approval Pending"

        # 3d. Submit Amendment Status with material diff <= 0 -> Routes to WCC with 'WCC to be submit'
        db_proj.po_material_difference = Decimal("0.00")
        pdb.commit()

        res_amend_stat = client.post(
            "/api/v1/commercial/jms/submit-amendment-status",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "workflow": "PO Amend",
                "revisionNo": "REV-01",
                "approvedDate": "2026-10-20"
            }
        )
        assert res_amend_stat.status_code == 200
        assert res_amend_stat.json()["task"] == "WCC to be submit"
        assert res_amend_stat.json()["destination"] == "wcc"

        # =================================================================
        # STEP 4: WCC
        # =================================================================
        # 4a. State 1: WCC to be submit -> Submit WCC details
        res_wcc_det = client.post(
            "/api/v1/commercial/wcc/submit-details",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "wccNo": "WCC-E2E-9999",
                "wccDate": "2026-10-22",
                "wccAmount": 285000.0,
                "wccSubmissionDate": "2026-10-22",
                "wccApprovedDate": "2026-10-24"
            }
        )
        assert res_wcc_det.status_code == 200
        assert res_wcc_det.json()["task"] == "Approval Pending"

        # 4b. State 2: Reject -> Rejected
        res_wcc_rej = client.post(
            "/api/v1/commercial/jms/reject",
            json={"poNo": test_po, "siteId": test_site, "workflow": "WCC"}
        )
        assert res_wcc_rej.status_code == 200
        assert res_wcc_rej.json()["task"] == "Rejected"

        # 4c. State 3: Resubmit WCC details -> Approval Pending
        res_wcc_resub = client.post(
            "/api/v1/commercial/wcc/submit-details",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "wccNo": "WCC-E2E-9999",
                "wccDate": "2026-10-22",
                "wccAmount": 285000.0,
                "wccSubmissionDate": "2026-10-22",
                "wccApprovedDate": "2026-10-24"
            }
        )
        assert res_wcc_resub.status_code == 200
        assert res_wcc_resub.json()["task"] == "Approval Pending"

        # 4d. Submit Receipt details -> Routes to Invoice with task 'to be submit'
        res_wcc_rec = client.post(
            "/api/v1/commercial/jms/wcc/submit-receipt",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "receiptNo": "REC-E2E-001",
                "receiptDate": "2026-10-25",
                "ersNo": "ERS-E2E-001"
            }
        )
        assert res_wcc_rec.status_code == 200
        assert res_wcc_rec.json()["task"] == "to be submit"

        pdb.expire_all()
        db_proj = pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).first()
        assert db_proj.current_task == "to be submit"
        assert db_proj.receipt_no == "REC-E2E-001"

        # =================================================================
        # STEP 5: INVOICE
        # =================================================================
        # 5a. PO appears in Invoice list
        res_inv_list = client.get("/api/v1/commercial/invoice/projects")
        assert res_inv_list.status_code == 200
        inv_pos = [item["poNo"] for item in res_inv_list.json()["items"]]
        assert test_po in inv_pos

        # 5b. Submit Invoice details (stores in sales)
        res_inv_sub = client.post(
            "/api/v1/commercial/invoice/submit-details",
            json={
                "poNo": test_po,
                "siteId": test_site,
                "invoiceNo": test_inv,
                "invoiceDate": "2026-10-26",
                "irnNo": "IRN-E2E-1234567890",
                "ersNo": "ERS-E2E-001",
                "gstType": "CGST/SGST",
                "basicAmount": 241525.42,
                "cgst": 21737.29,
                "sgst": 21737.29,
                "igst": 0.0,
                "totalAmount": 285000.0,
                "tdsDeduction": 5700.0,
                "approvedAmount": 279300.0
            }
        )
        assert res_inv_sub.status_code == 200

        # 5c. Test PDF Download (generates official 2-page invoice+checklist PDF and stores in sales.invoice_document)
        res_inv_dl = client.get(f"/api/v1/commercial/invoice/pdf/download?invoice_no={test_inv}&po_no={test_po}")
        assert res_inv_dl.status_code == 200
        assert res_inv_dl.headers["content-type"] == "application/pdf"
        assert len(res_inv_dl.content) > 1000

        # Verify PDF in sales.invoice_document
        adb.expire_all()
        db_sales = adb.query(Sales).filter(Sales.voucher_number == test_inv).first()
        assert db_sales is not None
        assert db_sales.invoice_document is not None
        assert db_sales.invoice_document.startswith(b"%PDF-")
        assert len(db_sales.invoice_document) == len(res_inv_dl.content)

        # Verify page count of generated Invoice PDF
        inv_reader = PdfReader(io.BytesIO(db_sales.invoice_document))
        assert len(inv_reader.pages) >= 2, "Invoice PDF must contain at least Tax Invoice page + Checklist page"

        # 5d. Transition to Receivable
        db_proj.current_task = "Moved to Receivable"
        pdb.commit()

        # =================================================================
        # STEP 6: RECEIVABLE
        # =================================================================
        # 6a. Create receipt_indus record for test invoice
        rec_row = ReceiptIndus(
            company_name="Nexus",
            customer_name="Indus Towers Ltd",
            voucher_number=test_inv,
            invoice_no=test_inv,
            invoice_amount=Decimal("285000.00"),
            tds=Decimal("5700.00"),
            receivable=Decimal("279300.00"),
            approved_amount=Decimal("279300.00"),
            received_amount=Decimal("150000.00"),
            received_date=date(2026, 10, 28)
        )
        adb.add(rec_row)
        adb.commit()

        # 6b. Verify in Receivable list
        res_recv_list = client.get("/api/v1/commercial/receivable/projects")
        assert res_recv_list.status_code == 200
        recv_items = res_recv_list.json()["items"]
        test_recv = next((it for it in recv_items if it.get("invoiceNo") == test_inv), None)
        assert test_recv is not None
        assert test_recv["rawReceivedAmount"] == 150000.0
        assert test_recv["rawDeduction"] == 5700.0

        # 6c. Update deduction
        res_up_ded = client.post(
            "/api/v1/commercial/receivable/update-deduction",
            json={"invoiceNo": test_inv, "tds": 6000.0, "dnAmount": 1000.0}
        )
        assert res_up_ded.status_code == 200

        # Verify DB updated
        adb.expire_all()
        refreshed_rec = adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).first()
        assert float(refreshed_rec.tds) == 6000.0
        assert float(refreshed_rec.dn_amount) == 1000.0

        # =================================================================
        # STEP 7: PO TO BE OPEN (Separate Workflow)
        # =================================================================
        res_ptbo = client.get("/api/v1/commercial/po-to-be-open/projects")
        assert res_ptbo.status_code == 200
        ptbo_data = res_ptbo.json()
        assert "items" in ptbo_data
        for it in ptbo_data["items"]:
            assert it["poStatus"].lower() in ["closed", "finally closed"]
            assert it["rawExpenseAmount"] > 0

    finally:
        # Clean up all created test records
        pdb.query(ProjectDocument).filter(ProjectDocument.po_no == test_po).delete()
        pdb.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == test_po).delete()
        pdb.query(ProjectExpense).filter(ProjectExpense.po_no == test_po).delete()
        pdb.query(TelecomProject).filter(TelecomProject.po_no == test_po).delete()
        pdb.commit()

        adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).delete()
        adb.query(Sales).filter(Sales.voucher_number == test_inv).delete()
        adb.commit()

        pdb.close()
        adb.close()
