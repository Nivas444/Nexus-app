from typing import Optional, List, Any
from datetime import date, datetime
from pydantic import BaseModel, Field

# =============================================================================
# PURCHASE REQUEST SCHEMAS (PR)
# =============================================================================

class PurchaseRequestBase(BaseModel):
    company_name: Optional[str] = "Nexus"
    pr_no: str
    wh_name: Optional[str] = None
    request_date: Optional[date] = None
    material_head: Optional[str] = None
    material_category: Optional[str] = None
    material_description: Optional[str] = None
    uom: Optional[str] = None
    submit_by: Optional[str] = None
    stock_qty: Optional[float] = 0.0
    pr_qty: Optional[float] = 0.0
    status: Optional[str] = "PR to be submit"
    supply_vendor_1: Optional[str] = None
    supply_vendor_2: Optional[str] = None
    supply_vendor_3: Optional[str] = None

class PurchaseRequestCreate(PurchaseRequestBase):
    pass

class PurchaseRequestUpdate(BaseModel):
    pr_qty: Optional[float] = None
    status: Optional[str] = None
    supply_vendor_1: Optional[str] = None
    supply_vendor_2: Optional[str] = None
    supply_vendor_3: Optional[str] = None

class PurchaseRequestResponse(PurchaseRequestBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PurchaseRequestListResponse(BaseModel):
    success: bool = True
    total: int
    items: List[PurchaseRequestResponse]

class SelectSuppliersRequest(BaseModel):
    pr_ids: Optional[List[int]] = None
    pr_nos: Optional[List[str]] = None
    suppliers: List[str] = Field(..., max_length=3, description="List of up to 3 selected suppliers")


# =============================================================================
# PURCHASE SCHEMAS (RFQ & PO)
# =============================================================================

class PurchaseBase(BaseModel):
    company_name: Optional[str] = "Nexus"
    pr_no: str
    rfq_no: Optional[str] = None
    rfq_id: Optional[str] = None
    request_by: Optional[str] = None
    request_date: Optional[date] = None
    po_no: Optional[str] = None
    po_date: Optional[date] = None
    po_amount: Optional[float] = 0.0
    po_amount_in_words: Optional[str] = None
    po_document: Optional[str] = None
    supply_vendor_name: Optional[str] = None
    po_status: Optional[str] = "RFQ Pending"
    ship_to: Optional[str] = None
    transport_scope: Optional[str] = None
    payment_terms: Optional[str] = None
    logistic_name: Optional[str] = None
    transport_charges: Optional[float] = 0.0
    loading_unloading_charges: Optional[float] = 0.0
    lr_documents: Optional[str] = None
    invoice_document: Optional[str] = None
    pdf_status: Optional[str] = "Pending"
    gst_applicable: Optional[bool] = False
    gst_number: Optional[str] = None
    gst_type: Optional[str] = None
    gst_rate: Optional[float] = 0.0
    gst_amount: Optional[float] = 0.0
    cgst_amount: Optional[float] = 0.0
    sgst_amount: Optional[float] = 0.0
    igst_amount: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0

class PurchaseCreate(PurchaseBase):
    pass

class PurchaseUpdate(BaseModel):
    po_no: Optional[str] = None
    po_date: Optional[date] = None
    po_amount: Optional[float] = None
    supply_vendor_name: Optional[str] = None
    po_status: Optional[str] = None
    transport_scope: Optional[str] = None
    payment_terms: Optional[str] = None
    logistic_name: Optional[str] = None
    transport_charges: Optional[float] = None
    invoice_document: Optional[str] = None
    lr_documents: Optional[str] = None
    po_document: Optional[str] = None
    pdf_status: Optional[str] = None
    gst_applicable: Optional[bool] = None
    gst_number: Optional[str] = None
    gst_type: Optional[str] = None
    gst_amount: Optional[float] = None
    total_amount: Optional[float] = None

class PurchaseResponse(PurchaseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PurchaseListResponse(BaseModel):
    success: bool = True
    total: int
    items: List[PurchaseResponse]

class PurchaseTermsRequest(BaseModel):
    pr_no: Optional[str] = None
    rfq_id: Optional[str] = None
    transport_scope: str
    payment_terms: str

class PurchaseTransportRequest(BaseModel):
    logistic_name: str
    transport_charges: float
    gst_applicable: Optional[bool] = False
    gst_amount: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    supplier_name: Optional[str] = None

class PurchaseUploadDocumentsRequest(BaseModel):
    invoice_document: Optional[str] = None
    lr_documents: Optional[str] = None
    invoice_filename: Optional[str] = None
    lr_filename: Optional[str] = None

class TransportPaymentRequest(BaseModel):
    po_no: Optional[str] = None
    expense_type: Optional[str] = "Transport Charges"
    account_head: Optional[str] = "Transport"
    company_name: Optional[str] = "Nexus"
    request_by: Optional[str] = "Warehouse Manager"
    transferred_to: Optional[str] = None
    transferred_from: Optional[str] = "HDFC Bank - 50200012345"
    amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    remarks: Optional[str] = None
    site_id: Optional[str] = None
    site_name: Optional[str] = None

class MinTransportSubmitRequest(BaseModel):
    company_name: Optional[str] = "Nexus"
    transport_type: Optional[str] = "Rental"
    transporter_name: Optional[str] = ""
    vehicle_number: Optional[str] = ""
    driver_name: Optional[str] = ""
    whatsapp_number: Optional[str] = ""
    amount: Optional[float] = 0.0
    advance_payment: Optional[float] = 0.0
    has_advance_payment: Optional[bool] = False
    po_no: Optional[str] = ""
    site_id: Optional[str] = ""
    site_name: Optional[str] = ""
    request_by: Optional[str] = "Warehouse Manager"

class AccountPurchaseCreate(BaseModel):
    company_name: Optional[str] = "Nexus"
    voucher_number: Optional[str] = None
    vendor_name: str
    invoice_number: str
    invoice_date: Optional[str] = None
    basic_amount: Optional[float] = 0.0
    cgst: Optional[float] = 0.0
    sgst: Optional[float] = 0.0
    igst: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    paid_amount: Optional[float] = 0.0
    payable_amount: Optional[float] = 0.0
    due_date: Optional[str] = None
    ageing: Optional[int] = 0
    partial_payment: Optional[bool] = False
