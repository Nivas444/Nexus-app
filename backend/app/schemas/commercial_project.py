from typing import List, Optional, Any, Union, Dict
from pydantic import BaseModel, ConfigDict


class CommercialProjectItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    customerName: Optional[str] = None
    date: Optional[str] = None
    poNo: Optional[str] = None
    projectId: Optional[str] = None
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None
    poType: Optional[str] = None
    poAmount: Optional[float] = None
    ageing: Optional[str] = None
    task: Optional[str] = None
    raBill: bool = False
    selected: bool = False
    poRevNo: Optional[str] = None
    poAmendmentRefId: Optional[str] = None
    poAmendmentCompletionDate: Optional[str] = None
    poAmendmentCompletionStatus: Optional[str] = None
    poStatus: Optional[str] = None
    completionDate: Optional[str] = None
    amount: Optional[str] = None
    wccNo: Optional[str] = None
    wccDate: Optional[str] = None
    submissionDate: Optional[str] = None
    wccSubmissionDate: Optional[str] = None
    approvedDate: Optional[str] = None
    wccApprovedDate: Optional[str] = None
    wccAmount: Optional[float] = None
    receiptNo: Optional[str] = None
    receiptDate: Optional[str] = None
    ersNo: Optional[str] = None
    projectStatus: Optional[str] = None
    status: Optional[str] = None
    towerType: Optional[str] = None
    towerHeight: Optional[str] = None
    sbc: Optional[str] = None
    windSpeed: Optional[str] = None
    planningBoq: Optional[str] = None
    siteSurvey: Optional[bool] = None
    tspMaterials: Optional[bool] = None
    qualityAudit: Optional[bool] = None
    stn: Optional[str] = None
    isStn: Optional[bool] = None
    civilWorks: Optional[bool] = None
    ptw: Optional[bool] = None
    srn: Optional[str] = None
    isSrn: Optional[bool] = None
    electricalWorks: Optional[bool] = None
    additionalApproval: Optional[bool] = None
    additionalApprove: Optional[bool] = None
    cam: Optional[str] = None
    isCam: Optional[bool] = None
    poleMounts: Optional[bool] = None
    serviceContract: Optional[bool] = None
    supportRequired: Optional[str] = None
    pendingWith: Optional[str] = None
    remarks: Optional[str] = None
    materials: Optional[str] = None


class CommercialProjectListResponse(BaseModel):
    items: List[CommercialProjectItem]
    total: int


class CommercialPoToBeOpenItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    poNo: str
    projectId: str
    siteId: str
    siteName: str
    projectType: str
    subProjectType: str
    expenseAmount: str
    rawExpenseAmount: float
    poStatus: Optional[str] = None


class CommercialPoToBeOpenListResponse(BaseModel):
    items: List[CommercialPoToBeOpenItem]
    total: int


class CommercialBulkUploadResponse(BaseModel):
    success: bool
    message: str
    imported_count: int
    total_count: int
    error_count: int
    errors: List[str]


class CommercialProjectDeleteRequest(BaseModel):
    project_ids: List[Any]


class CommercialProjectDeleteResponse(BaseModel):
    success: bool
    deleted_count: int
    message: str


class SavePmProjectDetailsRequest(BaseModel):
    project_id: Optional[Any] = None
    po_no: Optional[str] = None
    site_id: Optional[str] = None
    project_status: Optional[str] = None
    tower_type: Optional[str] = None
    tower_height: Optional[Union[float, str]] = None
    sbc: Optional[Union[float, str]] = None
    wind_speed: Optional[Union[float, str]] = None
    planning_boq: Optional[str] = None
    site_survey: Optional[bool] = None
    tsp_materials: Optional[bool] = None
    quality_audit: Optional[bool] = None
    stn: Optional[bool] = None
    civil_works: Optional[bool] = None
    ptw: Optional[bool] = None
    srn: Optional[bool] = None
    electrical_works: Optional[bool] = None
    additional_approval: Optional[bool] = None
    additional_approve: Optional[bool] = None
    cam: Optional[bool] = None
    pole_mounts: Optional[bool] = None
    service_contract: Optional[bool] = None
    support_required: Optional[str] = None
    pending_with: Optional[str] = None
    remarks: Optional[str] = None


class SavePmProjectDetailsResponse(BaseModel):
    success: bool
    message: str
    project: Optional[CommercialProjectItem] = None


# ==========================================
# JMS WORKFLOW SCHEMAS
# ==========================================

class JmsLineItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lineNo: str
    itemCode: str
    itemName: str
    uom: str
    rate: float
    poQty: float
    jmsQty: float
    amount: float
    netMaterialQty: float
    poDifference: float
    materialDifference: float
    jmsStatus: str = "Not Approved"
    highlighted: bool = False
    selected: bool = False


class JmsPoDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    poNo: str
    siteId: str
    siteName: str
    projectId: str
    customerName: str
    projectType: str
    subProjectType: str
    poType: str
    task: str
    totalJmsAmount: float
    totalExpenseAmount: float
    lineItems: List[JmsLineItem]
    canSubmit: bool = False


class JmsQtyUpdateRequest(BaseModel):
    jmsQty: float


class JmsRowApprovalRequest(BaseModel):
    lineItemIds: List[int]
    status: str = "Approved"


class JmsSubmitRequest(BaseModel):
    poNo: str
    siteId: str


class JmsAddLineItemRequest(BaseModel):
    poNo: str
    siteId: str
    itemCode: str
    qty: Optional[float] = 1.0


class GbpaItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    itemId: int
    itemCode: str
    itemName: str
    itemType: str
    uom: str
    rate: float
    hsnSac: Optional[str] = None
    hsnSacCode: Optional[str] = None


class JmsDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    docType: str
    docDetails: str
    docName: str
    date: Optional[str] = None
    poNo: Optional[str] = None
    siteId: Optional[str] = None


class JmsExpenseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requestNumber: Optional[str] = None
    requestDate: Optional[str] = None
    expenseHead: Optional[str] = None
    expenseName: Optional[str] = None
    uom: Optional[str] = None
    qty: Optional[float] = None
    rate: Optional[float] = None
    amount: float
    transferTo: Optional[str] = None


class JmsExpensesResponse(BaseModel):
    totalExpenseAmount: float
    expenses: List[JmsExpenseItem]


class JmsProcessRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    lineItemIds: Optional[List[int]] = None
    workTypes: Optional[List[str]] = None


class JmsRoutedItem(BaseModel):
    lineItemId: int
    lineNo: str
    itemCode: str
    itemName: str
    uom: str
    rate: float
    poQty: float
    jmsQty: float
    poDifference: float
    destination: str  # "wcc" or "po_amend"
    taskStatus: str   # "WCC to be raise" or "To be submit" / "Amend Requested"
    amendmentType: Optional[str] = None
    amendmentQty: Optional[float] = None
    amount: float


class JmsProcessResponse(BaseModel):
    success: bool
    poNo: str
    siteId: Optional[str] = None
    message: str
    projectTask: str
    projectStatus: str
    wccCount: int
    poAmendCount: int
    routedItems: List[JmsRoutedItem]


class WccLineItem(BaseModel):
    id: int
    lineNo: str
    itemCode: str
    itemName: str
    uom: str
    rate: float
    qty: float
    poQty: float
    jmsQty: float
    poDifference: float
    amount: float
    task: str = "WCC to be raise"
    selected: bool = False
    highlighted: bool = False


class WccPoDetailResponse(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    projectId: Optional[str] = None
    customerName: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None
    task: str
    totalAmount: float
    wccNo: Optional[str] = None
    wccDate: Optional[str] = None
    poDate: Optional[str] = None
    completionDate: Optional[str] = None
    wccSubmissionDate: Optional[str] = None
    submissionDate: Optional[str] = None
    wccAmount: Optional[float] = None
    poRevisionNumber: Optional[str] = None
    wccApprovedDate: Optional[str] = None
    approvedDate: Optional[str] = None
    receiptNo: Optional[str] = None
    receiptDate: Optional[str] = None
    ersNo: Optional[str] = None
    hasMergedDocument: bool = False
    lineItems: List[WccLineItem]


class PoAmendLineItem(BaseModel):
    id: int
    amendmentType: str = "Change QTY"
    lineNo: str
    itemCode: str
    itemName: str
    uom: str
    rate: float
    qty: float
    poQty: float
    jmsQty: float
    poDifference: float
    amount: float
    selected: bool = False
    highlighted: bool = False


class PoAmendPoDetailResponse(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    projectId: Optional[str] = None
    customerName: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None
    task: str
    poStatus: str
    totalAmount: float
    totalJmsAmount: Optional[float] = None
    poAmendmentRefId: Optional[str] = None
    poRevisionNumber: Optional[str] = None
    poAmendmentCompletionDate: Optional[str] = None
    hasMergedDocument: bool = False
    lineItems: List[PoAmendLineItem]


class PoAmendSubmitReferenceRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    refId: Optional[str] = None
    poAmendmentRefId: Optional[str] = None

    def get_ref_id(self) -> str:
        ref = self.refId or self.poAmendmentRefId or ""
        return ref.strip()


class PoAmendQtyUpdateRequest(BaseModel):
    qty: float
    poNo: Optional[str] = None
    siteId: Optional[str] = None


class WccSubmitDetailsRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    wccNo: str
    wccDate: str
    wccAmount: Union[float, str]
    submissionDate: Optional[str] = None
    wccSubmissionDate: Optional[str] = None
    approvedDate: Optional[str] = None
    wccApprovedDate: Optional[str] = None


class WccSubmitReceiptRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    receiptNo: str
    receiptDate: str
    ersNo: Optional[str] = None


class SubmitAmendmentStatusRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    workflow: Optional[str] = "po_amend"
    revisionNo: str
    approvedDate: str


class PoRowRejectRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    workflow: Optional[str] = "po_amend"


class PdfProcessRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None


class PdfProcessResponse(BaseModel):
    success: bool
    message: str
    poNo: str
    siteId: Optional[str] = None
    fileName: str
    totalPages: int



class SelectWorksSubmitRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    civil: bool = True
    electrical: bool = False
    service: bool = False
    eb: bool = False


class SelectWorksSubmitResponse(BaseModel):
    success: bool
    message: str
    poNo: str
    siteId: Optional[str] = None
    projectId: Optional[str] = None
    task: str
    status: str
    destination: Optional[str] = None
    mergedDocumentId: Optional[int] = None
    certificateDocumentId: Optional[int] = None
    totalPages: int
    fileName: str
    pdfDataUri: Optional[str] = None


# ==========================================
# COMMERCIAL INVOICE SCHEMAS
# ==========================================

class CommercialInvoiceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    invoiceNo: Optional[str] = None
    date: Optional[str] = None
    poNo: Optional[str] = None
    projectId: Optional[str] = None
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    projectType: Optional[str] = None
    subProjectType: Optional[str] = None
    task: Optional[str] = None
    ersNo: Optional[str] = None
    irnNo: Optional[str] = None
    documentType: Optional[str] = None
    amount: Optional[str] = None
    rawAmount: Optional[float] = None
    dueDate: Optional[str] = None
    customerName: Optional[str] = None
    companyName: Optional[str] = None
    pdfStored: bool = False


class CommercialInvoiceListResponse(BaseModel):
    items: List[CommercialInvoiceItem]
    total: int


class CommercialInvoiceSubmitDetailsRequest(BaseModel):
    poNo: str
    siteId: Optional[str] = None
    invoiceNo: Optional[str] = None
    invoiceDate: Optional[str] = None
    ersNo: Optional[str] = None
    irnNo: Optional[str] = None
    dueDate: Optional[str] = None
    documentType: Optional[str] = None
    amount: Optional[float] = None


class CommercialInvoiceSubmitHashRequest(BaseModel):
    poNo: Optional[str] = None
    siteId: Optional[str] = None
    invoiceNo: str
    customerName: Optional[str] = None
    companyName: Optional[str] = None
    invoiceAmount: float
    tds: float
    receivable: float
    dueDate: Optional[str] = None


class CommercialInvoiceGenericResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


# ==========================================
# COMMERCIAL RECEIVABLE SCHEMAS
# ==========================================

class CommercialReceivableItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Any
    poNo: Optional[str] = None
    customerName: Optional[str] = None
    invoiceNo: Optional[str] = None
    invoiceDate: Optional[str] = None
    dueDate: Optional[str] = None
    invoiceAmount: Optional[str] = None
    rawInvoiceAmount: Optional[float] = None
    deduction: Optional[str] = None
    rawDeduction: Optional[float] = None
    receivedAmount: Optional[str] = None
    rawReceivedAmount: Optional[float] = None
    receivable: Optional[str] = None
    rawReceivable: Optional[float] = None
    ageing: Optional[str] = None
    # Subtab details: Invoice amount breakdown from sales table
    basicAmount: Optional[str] = None
    rawBasicAmount: Optional[float] = None
    cgst: Optional[str] = None
    rawCgst: Optional[float] = None
    sgst: Optional[str] = None
    rawSgst: Optional[float] = None
    igst: Optional[str] = None
    rawIgst: Optional[float] = None
    # Subtab details: Deduction breakdown from receipt_indus table
    tds: Optional[str] = None
    rawTds: Optional[float] = None
    dnAmount: Optional[str] = None
    rawDnAmount: Optional[float] = None
    discount: Optional[str] = None
    rawDiscount: Optional[float] = None
    tredsFee: Optional[str] = None
    rawTredsFee: Optional[float] = None
    # Subtab details: Received amount date from receipt_indus table
    receivedDate: Optional[str] = None


class CommercialReceivableListResponse(BaseModel):
    items: List[CommercialReceivableItem]
    total: int


class CommercialReceivableUpdateInvoiceAmountRequest(BaseModel):
    invoiceNo: str
    basicAmount: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    totalAmount: Optional[float] = None


class CommercialReceivableUpdateDeductionRequest(BaseModel):
    invoiceNo: str
    tds: Optional[float] = None
    dnAmount: Optional[float] = None
    discount: Optional[float] = None
    tredsFee: Optional[float] = None


class CommercialReceivableUpdateReceivedAmountRequest(BaseModel):
    invoiceNo: str
    receivedAmount: float
    receivedDate: Optional[str] = None


class CommercialIndusPaymentReceiptRequest(BaseModel):
    receiptNo: str
    paymentDate: Optional[str] = None
    approvedAmount: float
    treds: bool = False
    dn: Optional[bool] = None  # Hold toggle
    hold: Optional[bool] = None
    holdAmount: Optional[float] = 0.0
    holdReason: Optional[str] = None
    indusProcessedAmount: float
    remarks: Optional[str] = None
    invoices: Optional[List[Dict[str, Any]]] = None

    @property
    def is_hold(self) -> bool:
        if self.dn is not None:
            return bool(self.dn)
        if self.hold is not None:
            return bool(self.hold)
        return False


class CommercialM1PaymentReceiptRequest(BaseModel):
    indusReceiptNo: str
    m1ReceiptNumber: Optional[str] = None
    miReceiptNumber: Optional[str] = None
    paymentDate: Optional[str] = None
    discountAmount: Optional[float] = 0.0
    processingFee: Optional[float] = 0.0
    tredsProcessedAmount: float
    invoices: Optional[List[Dict[str, Any]]] = None

    @property
    def receipt_number(self) -> str:
        return self.m1ReceiptNumber or self.miReceiptNumber or ""







