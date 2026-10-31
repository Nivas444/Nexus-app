import io
from datetime import date
from decimal import Decimal
import pytest
from pypdf import PdfReader
from fastapi.testclient import TestClient
from sqlalchemy import inspect

from app.main import app
from app.db.session import ProjectSessionLocal, AccountsSessionLocal, accounts_engine
from app.models.commercial_project import TelecomProject
from app.models.commercial_sales import Sales, ReceiptIndus
from app.services.commercial_invoice_service import CommercialInvoiceService
from app.services.invoice_pdf_service import CommercialInvoicePdfService


@pytest.fixture
def client():
    return TestClient(app)


def test_database_column_characteristics():
    """
    Verify schema characteristics:
    - sales.invoice_document is BYTEA
    - receipt_indus has invoice_amount, tds, receivable columns as NUMERIC
    """
    inspector = inspect(accounts_engine)
    sales_cols = {c['name']: str(c['type']).upper() for c in inspector.get_columns('sales')}
    assert 'invoice_document' in sales_cols
    assert 'BYTEA' in sales_cols['invoice_document']

    receipt_cols = {c['name']: str(c['type']).upper() for c in inspector.get_columns('receipt_indus')}
    assert 'invoice_amount' in receipt_cols
    assert 'NUMERIC' in receipt_cols['invoice_amount']
    assert 'tds' in receipt_cols
    assert 'NUMERIC' in receipt_cols['tds']
    assert 'receivable' in receipt_cols
    assert 'NUMERIC' in receipt_cols['receivable']


def test_invoice_list_endpoint(client):
    """
    GET /api/v1/commercial/invoice/projects
    Retrieves invoice records linking telecom_project with sales table.
    """
    resp = client.get("/api/v1/commercial/invoice/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    first = data["items"][0]
    assert "invoiceNo" in first
    assert "date" in first
    assert "task" in first
    assert "documentType" in first


def test_sales_db_linking_and_pdf_storage(client):
    """
    Verify that generating/downloading invoice PDF links to PostgreSQL table `sales`:
    - voucher_number is invoice no
    - document_date is document date
    - irn_no is irn no
    - document_type is cgst/sgst or igst
    - invoice_document stores generated PDF bytes (BYTEA)
    """
    test_inv = "INV-2026-TEST-999"
    test_po = "4500128936"
    test_irn = "IRN-TEST-123456789"
    test_ers = "ERS-TEST-888888"
    test_date = "15/09/2026"

    # Call download PDF endpoint
    resp = client.get(
        f"/api/v1/commercial/invoice/pdf/download?invoice_no={test_inv}&po_no={test_po}&irn_no={test_irn}&ers_no={test_ers}&invoice_date={test_date}&gst_type=SGST"
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    pdf_bytes = resp.content
    assert len(pdf_bytes) > 5000

    # Verify PDF is valid
    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) >= 1

    # Verify persisted in `sales` table in Nexus_Accounts DB
    adb = AccountsSessionLocal()
    try:
        sales_record = adb.query(Sales).filter(Sales.voucher_number == test_inv).first()
        assert sales_record is not None, "Sales record not found in sales table"
        assert sales_record.voucher_number == test_inv
        assert sales_record.document_date == date(2026, 9, 15)
        assert sales_record.irn_no == test_irn
        assert sales_record.document_type == "CGST/SGST"
        assert sales_record.invoice_document is not None
        assert bytes(sales_record.invoice_document) == pdf_bytes
    finally:
        adb.close()


def test_invoice_details_submission(client):
    """
    POST /api/v1/commercial/invoice/submit-details
    Transitions invoice to 'Approval Pending', updates due date and ERS/IRN.
    """
    test_po = "4500128936"
    test_inv = "INV-2026-TEST-SUBMIT"

    payload = {
        "poNo": test_po,
        "invoiceNo": test_inv,
        "invoiceDate": "12/08/2026",
        "ersNo": "ERS-SUB-101",
        "irnNo": "IRN-SUB-202",
        "dueDate": "30/08/2026",
        "documentType": "CGST/SGST",
        "amount": 320000.0
    }
    resp = client.post("/api/v1/commercial/invoice/submit-details", json=payload)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["task"] == "Approval Pending"

    # Check sales table updated
    adb = AccountsSessionLocal()
    try:
        s = adb.query(Sales).filter(Sales.voucher_number == test_inv).first()
        assert s is not None
        assert s.voucher_number == test_inv
        assert s.irn_no == "IRN-SUB-202"
        assert s.document_type == "CGST/SGST"
    finally:
        adb.close()


def test_invoice_hash_receipt_indus_storage(client):
    """
    POST /api/v1/commercial/invoice/submit-hash
    Verify 'Invoice#' tab keeps invoice amount, tds, receivable in receipt_indus table:
    - invoice_amount
    - tds
    - receivable
    - voucher_number & invoice_no
    """
    test_inv = "INV-2026-TEST-RECEIPT"
    test_po = "4500128936"
    inv_amount = 245000.00
    tds_val = 5000.00
    recv_val = 240000.00

    payload = {
        "poNo": test_po,
        "invoiceNo": test_inv,
        "customerName": "Indus Towers Limited",
        "companyName": "Nexus Power Limited",
        "invoiceAmount": inv_amount,
        "tds": tds_val,
        "receivable": recv_val,
        "dueDate": "27/08/2026"
    }

    resp = client.post("/api/v1/commercial/invoice/submit-hash", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["invoiceAmount"] == inv_amount
    assert data["tds"] == tds_val
    assert data["receivable"] == recv_val

    # Verify directly in receipt_indus table in Nexus_Accounts DB
    adb = AccountsSessionLocal()
    try:
        receipt = adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).first()
        assert receipt is not None, "Receipt not found in receipt_indus table"
        assert receipt.voucher_number == test_inv
        assert receipt.invoice_no == test_inv
        assert float(receipt.invoice_amount) == inv_amount
        assert float(receipt.tds) == tds_val
        assert float(receipt.receivable) == recv_val
        assert float(receipt.approved_amount) == recv_val
        assert receipt.customer_name == "Indus Towers Limited"
        assert receipt.company_name == "Nexus Power Limited"
    finally:
        adb.close()


def test_invoice_moved_to_receivable_excluded_from_invoice_list(client):
    """
    Verify that once an invoice is approved and persisted to receipt_indus:
    1. It is excluded from the Invoice list (/invoice/projects) and does NOT linger with task 'Moved to Receivable'.
    2. It appears in the Receivable list (/receivable/projects).
    """
    test_inv = "INV-2026-TEST-RECV-EXCLUDE"
    test_po = "4500128935"

    # Submit hash (moves to receivable)
    payload = {
        "poNo": test_po,
        "invoiceNo": test_inv,
        "customerName": "Indus Towers Limited",
        "companyName": "Nexus Power Limited",
        "invoiceAmount": 180000.0,
        "tds": 3600.0,
        "receivable": 176400.0,
        "dueDate": "25/09/2026"
    }
    submit_resp = client.post("/api/v1/commercial/invoice/submit-hash", json=payload)
    assert submit_resp.status_code == 200

    # 1. Fetch invoice projects - test_inv and test_po must NOT be present
    inv_resp = client.get("/api/v1/commercial/invoice/projects")
    assert inv_resp.status_code == 200
    inv_data = inv_resp.json()
    invoice_nos = [it["invoiceNo"] for it in inv_data["items"]]
    assert test_inv not in invoice_nos
    # Also verify no items in the invoice list have task 'Moved to Receivable'
    tasks = [it["task"].lower() for it in inv_data["items"]]
    assert "moved to receivable" not in tasks

    # 2. Fetch receivable projects - test_inv must be present in receivable
    recv_resp = client.get("/api/v1/commercial/receivable/projects")
    assert recv_resp.status_code == 200
    recv_data = recv_resp.json()
    recv_invoices = [it["invoiceNo"] for it in recv_data["items"]]
    assert test_inv in recv_invoices
    matched = next(it for it in recv_data["items"] if it["invoiceNo"] == test_inv)
    assert matched["rawInvoiceAmount"] == 180000.0
    assert matched["rawDeduction"] == 3600.0
    assert matched["rawReceivable"] == 176400.0



def test_receivable_db_linking_sales_and_receipt_indus(client):
    """
    Verify receivable page data linking to PostgreSQL db `nexus_accounts`,
    tables `sales` and `receipt_indus`:
    - Deduction column content comes from sales table (tds_deduction)
    - Deduction subtab data comes from receipt_indus table (tds, dn_amount, treds_discount_amount, treds_processing_fee)
    - Invoice amount details come from sales table (total_amount, basic_amount, cgst, sgst, igst)
    - Received amount comes from receipt_indus table (received_amount, received_date)
    """
    test_inv = "INV-2026-RECV-LINK-01"
    test_po = "4500999991"

    # Seed sales table with specific amounts
    adb = AccountsSessionLocal()
    try:
        # Clean up existing test records if any
        adb.query(Sales).filter(Sales.voucher_number == test_inv).delete()
        adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).delete()
        adb.commit()

        sales_entry = Sales(
            voucher_number=test_inv,
            document_date=date(2026, 8, 12),
            document_type="CGST/SGST",
            irn_no="IRN-RECV-TEST-01",
            total_amount=Decimal("250000.00"),
            basic_amount=Decimal("211864.41"),
            cgst=Decimal("19067.80"),
            sgst=Decimal("19067.79"),
            igst=Decimal("0.00"),
            tds_deduction=Decimal("12500.00")
        )
        adb.add(sales_entry)

        # Seed receipt_indus table with specific subtab and received amounts
        receipt_entry = ReceiptIndus(
            voucher_number=test_inv,
            invoice_no=test_inv,
            customer_name="Indus Towers Limited",
            company_name="Nexus Power Limited",
            invoice_amount=Decimal("250000.00"),
            tds=Decimal("6250.00"),
            dn_amount=Decimal("3125.00"),
            treds_discount_amount=Decimal("1875.00"),
            treds_processing_fee=Decimal("1250.00"),
            received_amount=Decimal("150000.00"),
            receivable=Decimal("87500.00"),
            approved_amount=Decimal("237500.00"),
            received_date=date(2026, 8, 20)
        )
        adb.add(receipt_entry)
        adb.commit()
    finally:
        adb.close()

    # Query receivable list endpoint
    resp = client.get("/api/v1/commercial/receivable/projects")
    assert resp.status_code == 200
    data = resp.json()
    items = data["items"]
    matched = next((it for it in items if it["invoiceNo"] == test_inv), None)
    assert matched is not None, f"{test_inv} should be present in receivable projects"

    # Verify Invoice amount details from sales table
    assert matched["rawInvoiceAmount"] == 250000.0
    assert matched["rawBasicAmount"] == 211864.41
    assert matched["rawCgst"] == 19067.80
    assert matched["rawSgst"] == 19067.79
    assert matched["rawIgst"] == 0.0

    # Verify Deduction column content from sales table
    assert matched["rawDeduction"] == 12500.0

    # Verify Deduction subtab data from receipt_indus table
    assert matched["rawTds"] == 6250.0
    assert matched["rawDnAmount"] == 3125.0
    assert matched["rawDiscount"] == 1875.0
    assert matched["rawTredsFee"] == 1250.0

    # Verify Received Amount from receipt_indus table
    assert matched["rawReceivedAmount"] == 150000.0
    assert matched["receivedDate"] == "20/08/2026"

    # Verify Net Receivable
    assert matched["rawReceivable"] == 87500.0


def test_receivable_update_endpoints_persist_to_sales_and_receipt_indus(client):
    """
    Verify POST endpoints update sales and receipt_indus correctly:
    1. /update-invoice-amount updates sales.basic_amount, cgst, sgst, igst, total_amount
    2. /update-deduction updates receipt_indus.tds, dn_amount, treds_discount_amount, treds_processing_fee,
       and syncs sales.tds_deduction
    3. /update-received-amount updates receipt_indus.received_amount and recalculates receivable
    """
    test_inv = "INV-2026-RECV-UPDATE-02"

    adb = AccountsSessionLocal()
    try:
        adb.query(Sales).filter(Sales.voucher_number == test_inv).delete()
        adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).delete()
        adb.commit()

        s = Sales(voucher_number=test_inv, total_amount=Decimal("100000.00"), basic_amount=Decimal("84745.76"), cgst=Decimal("7627.12"), sgst=Decimal("7627.12"), igst=Decimal("0.00"), tds_deduction=Decimal("2000.00"))
        r = ReceiptIndus(voucher_number=test_inv, invoice_no=test_inv, invoice_amount=Decimal("100000.00"), tds=Decimal("2000.00"), received_amount=Decimal("50000.00"), receivable=Decimal("48000.00"))
        adb.add(s)
        adb.add(r)
        adb.commit()
    finally:
        adb.close()

    # 1. Update invoice amount
    inv_payload = {
        "invoiceNo": test_inv,
        "basicAmount": 90000.0,
        "cgst": 8100.0,
        "sgst": 8100.0,
        "igst": 0.0,
        "totalAmount": 106200.0
    }
    r1 = client.post("/api/v1/commercial/receivable/update-invoice-amount", json=inv_payload)
    assert r1.status_code == 200
    assert r1.json()["success"] is True

    # 2. Update deduction
    ded_payload = {
        "invoiceNo": test_inv,
        "tds": 2500.0,
        "dnAmount": 1500.0,
        "discount": 500.0,
        "tredsFee": 200.0
    }
    r2 = client.post("/api/v1/commercial/receivable/update-deduction", json=ded_payload)
    assert r2.status_code == 200
    assert r2.json()["totalDeduction"] == 4700.0

    # 3. Update received amount
    recv_payload = {
        "invoiceNo": test_inv,
        "receivedAmount": 60000.0,
        "receivedDate": "25/08/2026"
    }
    r3 = client.post("/api/v1/commercial/receivable/update-received-amount", json=recv_payload)
    assert r3.status_code == 200
    assert r3.json()["receivable"] == 41500.0  # 106200 - 4700 - 60000

    # Verify directly in DB
    adb = AccountsSessionLocal()
    try:
        updated_sales = adb.query(Sales).filter(Sales.voucher_number == test_inv).first()
        assert float(updated_sales.total_amount) == 106200.0
        assert float(updated_sales.basic_amount) == 90000.0
        assert float(updated_sales.cgst) == 8100.0
        assert float(updated_sales.sgst) == 8100.0
        assert float(updated_sales.tds_deduction) == 4700.0

        updated_receipt = adb.query(ReceiptIndus).filter(ReceiptIndus.invoice_no == test_inv).first()
        assert float(updated_receipt.tds) == 2500.0
        assert float(updated_receipt.dn_amount) == 1500.0
        assert float(updated_receipt.treds_discount_amount) == 500.0
        assert float(updated_receipt.treds_processing_fee) == 200.0
        assert float(updated_receipt.received_amount) == 60000.0
        assert float(updated_receipt.receivable) == 41500.0
        assert updated_receipt.received_date == date(2026, 8, 25)
    finally:
        adb.close()


def test_invoice_pdf_download_no_404_and_stores_in_sales_invoice_document(client):
    """
    Verify that downloading invoice PDF:
    1. Never returns 404 for arbitrary/custom/dummy PO or invoice numbers.
    2. Stores the generated PDF into PostgreSQL table `sales` column `invoice_document` as BYTEA.
    3. Serves the stored PDF with Content-Disposition attachment.
    """
    test_inv = "INV-2026-DOWNLOAD-VERIFY-01"
    test_po = "999888777666"  # Arbitrary PO not in database

    # Clean up test record if any
    adb = AccountsSessionLocal()
    try:
        adb.query(Sales).filter(Sales.voucher_number == test_inv).delete()
        adb.commit()
    finally:
        adb.close()

    resp = client.get(
        f"/api/v1/commercial/invoice/pdf/download?invoice_no={test_inv}&po_no={test_po}&invoice_date=12/08/2026&gst_type=SGST"
    )
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}: {resp.text}"
    assert resp.headers["content-type"] == "application/pdf"
    assert "attachment" in resp.headers["content-disposition"]
    pdf_bytes = resp.content
    assert len(pdf_bytes) > 10000

    # Verify that reader reads 2 pages (Tax Invoice + Invoice Checklist)
    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) >= 2

    # Verify persisted in `sales` table in Nexus_Accounts DB
    adb = AccountsSessionLocal()
    try:
        sales_row = adb.query(Sales).filter(Sales.voucher_number == test_inv).first()
        assert sales_row is not None, "Sales record was not saved to sales table"
        assert sales_row.voucher_number == test_inv
        assert sales_row.invoice_document is not None, "invoice_document column is NULL in sales table"
        assert len(sales_row.invoice_document) == len(pdf_bytes)
        assert bytes(sales_row.invoice_document) == pdf_bytes
    finally:
        adb.close()
