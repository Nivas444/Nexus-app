from typing import List, Optional, Any, Union
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


class CommercialProjectListResponse(BaseModel):
    items: List[CommercialProjectItem]
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



