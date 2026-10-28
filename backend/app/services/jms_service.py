import base64
import re
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.commercial_project import (
    TelecomProject,
    TelecomIndusPo,
    ProjectExpense,
    ProjectDocument
)
from app.models.indus_gbpa import IndusCustomerGbpa
from app.schemas.commercial_project import (
    JmsLineItem,
    JmsPoDetailResponse,
    GbpaItemResponse,
    JmsDocumentResponse,
    JmsExpenseItem,
    JmsExpensesResponse,
    JmsProcessRequest,
    JmsProcessResponse,
    JmsRoutedItem,
    WccPoDetailResponse,
    WccLineItem,
    PoAmendPoDetailResponse,
    PoAmendLineItem
)


class JmsService:
    def __init__(self, project_db: Session, master_db: Optional[Session] = None):
        self.project_db = project_db
        self.master_db = master_db

    def _get_project_context(self, po_no: str, site_id: Optional[str] = None) -> Optional[TelecomProject]:
        query = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no)
        if site_id:
            query = query.filter(TelecomProject.site_id == site_id)
        return query.first()

    def get_jms_po_details(self, po_no: str, site_id: Optional[str] = None) -> JmsPoDetailResponse:
        """
        Retrieve PO details, line items, and summary calculations from Nexus_Project DB.
        """
        proj = self._get_project_context(po_no, site_id)
        
        # Query line items for this PO (and site if provided)
        lines_query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines_query = lines_query.filter(TelecomIndusPo.site_id == site_id)
        po_lines = lines_query.order_by(TelecomIndusPo.project_po_line_item_id.asc()).all()

        line_items: List[JmsLineItem] = []
        total_jms_amount = Decimal("0.00")

        for r in po_lines:
            po_rate = Decimal(str(r.po_rate or 0))
            po_qty = Decimal(str(r.po_qty or 0))
            
            # Default jms_qty to po_qty if not set
            if r.jms_qty is not None:
                jms_qty = Decimal(str(r.jms_qty))
            else:
                jms_qty = po_qty

            # jms_amount = po_rate * jms_qty
            if r.jms_amount is not None:
                jms_amount = Decimal(str(r.jms_amount))
            else:
                jms_amount = po_rate * jms_qty

            # net_material_qty defaults to po_qty if not set
            net_material_qty = Decimal(str(r.net_material_qty or po_qty))

            po_diff = po_qty - jms_qty
            mat_diff = jms_qty - net_material_qty
            jms_status_val = r.jms_status or "Not Approved"
            highlighted = (jms_status_val == "Approved")

            total_jms_amount += jms_amount

            line_items.append(JmsLineItem(
                id=r.project_po_line_item_id,
                lineNo=str(r.line_number or ""),
                itemCode=r.item_code or "",
                itemName=r.item_description or r.item_code or "",
                uom=r.uom or "Nos",
                rate=float(po_rate),
                poQty=float(po_qty),
                jmsQty=float(jms_qty),
                amount=float(jms_amount),
                netMaterialQty=float(net_material_qty),
                poDifference=float(po_diff),
                materialDifference=float(mat_diff),
                jmsStatus=jms_status_val,
                highlighted=highlighted,
                selected=False
            ))

        # Query project expenses for scoped sum
        exp_query = self.project_db.query(func.coalesce(func.sum(ProjectExpense.amount), 0)).filter(
            ProjectExpense.po_no == po_no
        )
        if site_id:
            exp_query = exp_query.filter(ProjectExpense.site_id == site_id)
        total_expense_amount = Decimal(str(exp_query.scalar() or 0))

        # Check if submit is permitted
        can_submit = (len(line_items) > 0 and all(item.jmsStatus == "Approved" for item in line_items))

        # Project metadata with fallbacks
        customer_name = proj.customer_name if proj else (po_lines[0].customer_name if po_lines else "Indus Towers Ltd")
        site_name = proj.site_name if proj else (site_id or "")
        project_id = proj.project_code if proj else f"PRJ-{po_no}"
        project_type = proj.project_type if proj else "New Build"
        sub_project_type = proj.sub_project_type if proj else "Civil"
        po_type = proj.po_type if proj and proj.po_type else "Opex"
        task = proj.current_task if proj and proj.current_task else "JMS to be validate"

        return JmsPoDetailResponse(
            poNo=po_no,
            siteId=site_id or (proj.site_id if proj else (po_lines[0].site_id if po_lines else "")),
            siteName=site_name,
            projectId=project_id,
            customerName=customer_name or "Indus Towers Ltd",
            projectType=project_type,
            subProjectType=sub_project_type,
            poType=po_type,
            task=task,
            totalJmsAmount=float(total_jms_amount),
            totalExpenseAmount=float(total_expense_amount),
            lineItems=line_items,
            canSubmit=can_submit
        )

    def update_line_item_qty(self, line_item_id: int, new_qty: float) -> Dict[str, Any]:
        """
        Update JMS Qty for a specific line item in telecom_indus_po.
        Recalculates JMS Amount = PO Rate * JMS Qty.
        """
        if new_qty < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JMS Quantity cannot be negative."
            )

        line_item = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.project_po_line_item_id == line_item_id
        ).first()

        if not line_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Line item with ID #{line_item_id} not found."
            )

        po_rate = Decimal(str(line_item.po_rate or 0))
        dec_qty = Decimal(str(new_qty))
        jms_amount = po_rate * dec_qty

        line_item.jms_qty = dec_qty
        line_item.jms_amount = jms_amount
        line_item.jms_status = "Not Approved"
        self.project_db.commit()
        self.project_db.refresh(line_item)

        # Recalculate total JMS amount for this PO
        total_sum = self.project_db.query(func.coalesce(func.sum(TelecomIndusPo.jms_amount), 0)).filter(
            TelecomIndusPo.po_no == line_item.po_no,
            TelecomIndusPo.site_id == line_item.site_id
        ).scalar()

        po_qty = Decimal(str(line_item.po_qty or 0))
        net_mat_qty = Decimal(str(line_item.net_material_qty or po_qty))

        return {
            "success": True,
            "id": line_item.project_po_line_item_id,
            "jmsQty": float(dec_qty),
            "amount": float(jms_amount),
            "rate": float(po_rate),
            "poDifference": float(po_qty - dec_qty),
            "materialDifference": float(dec_qty - net_mat_qty),
            "totalJmsAmount": float(total_sum)
        }

    def update_row_approvals(self, line_item_ids: List[int], approval_status: str = "Approved") -> Dict[str, Any]:
        """
        Persist row approval status in telecom_indus_po.
        Allowed values: 'Approved', 'Not Approved'.
        """
        valid_statuses = ["Approved", "Not Approved"]
        if approval_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{approval_status}'. Allowed: {', '.join(valid_statuses)}"
            )

        if not line_item_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No line item IDs provided for approval."
            )

        items = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.project_po_line_item_id.in_(line_item_ids)
        ).all()

        if not items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="None of the specified line items were found."
            )

        po_no = items[0].po_no
        site_id = items[0].site_id

        for item in items:
            item.jms_status = approval_status

        self.project_db.commit()

        # Check if all items for this PO and site are now approved
        all_po_items = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.po_no == po_no,
            TelecomIndusPo.site_id == site_id
        ).all()

        can_submit = (len(all_po_items) > 0 and all(it.jms_status == "Approved" for it in all_po_items))

        return {
            "success": True,
            "updatedIds": [it.project_po_line_item_id for it in items],
            "status": approval_status,
            "canSubmit": can_submit,
            "message": f"Successfully marked {len(items)} row(s) as {approval_status}."
        }

    def get_eligible_gbpa_items(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[GbpaItemResponse]:
        """
        Retrieve eligible line items from Indus Towers GBPA data in Master DB.
        Enforces CAPEX vs OPEX filtering:
        - For an OPEX PO: only OPEX items.
        - For a CAPEX PO: only CAPEX items.
        """
        if not self.master_db:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Master DB session not available."
            )

        proj = self._get_project_context(po_no, site_id)
        raw_po_type = (proj.po_type if proj and proj.po_type else "Opex").strip().lower()
        is_capex = "capex" in raw_po_type

        query = self.master_db.query(IndusCustomerGbpa)

        if is_capex:
            query = query.filter(func.lower(IndusCustomerGbpa.item_type) == "capex")
        else:
            query = query.filter(func.lower(IndusCustomerGbpa.item_type) == "opex")

        if search:
            search_pat = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    IndusCustomerGbpa.item_code.ilike(search_pat),
                    IndusCustomerGbpa.item_name.ilike(search_pat),
                    IndusCustomerGbpa.item_description.ilike(search_pat)
                )
            )

        gbpa_records = query.order_by(IndusCustomerGbpa.item_id.asc()).all()

        return [
            GbpaItemResponse(
                itemId=r.item_id,
                itemCode=r.item_code or "",
                itemName=r.item_name or "",
                itemType=r.item_type or ("Capex" if is_capex else "Opex"),
                uom=r.uom or "Nos",
                rate=float(Decimal(str(r.rate or 0))),
                hsnSac=r.hsn_sac,
                hsnSacCode=r.hsn_sac_code
            )
            for r in gbpa_records
        ]

    def check_gbpa_item(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        item_code: str = ""
    ) -> Dict[str, Any]:
        """
        Look up a typed GBPA item code and validate whether it is eligible for this PO.
        """
        if not self.master_db:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Master DB session not available."
            )

        code = (item_code or "").strip()
        if not code:
            return {"found": False, "eligible": False, "detail": "Please enter an item code."}

        gbpa_item = self.master_db.query(IndusCustomerGbpa).filter(
            func.lower(IndusCustomerGbpa.item_code) == code.lower()
        ).first()

        if not gbpa_item:
            return {
                "found": False,
                "eligible": False,
                "detail": f"Item code '{code}' was not found in Master GBPA."
            }

        proj = self._get_project_context(po_no, site_id)
        raw_po_type = (proj.po_type if proj and proj.po_type else "Opex").strip()
        is_po_capex = "capex" in raw_po_type.lower()

        raw_item_type = (gbpa_item.item_type or "Opex").strip()
        is_item_capex = "capex" in raw_item_type.lower()

        # Check category match
        if is_po_capex and not is_item_capex:
            return {
                "found": True,
                "eligible": False,
                "itemCode": gbpa_item.item_code,
                "itemName": gbpa_item.item_name or gbpa_item.item_description,
                "itemType": gbpa_item.item_type,
                "poType": raw_po_type,
                "rate": float(gbpa_item.rate or 0),
                "uom": gbpa_item.uom or "Nos",
                "detail": f"Category Mismatch: Cannot add OPEX line item '{gbpa_item.item_code}' to a CAPEX PO."
            }

        if not is_po_capex and is_item_capex:
            return {
                "found": True,
                "eligible": False,
                "itemCode": gbpa_item.item_code,
                "itemName": gbpa_item.item_name or gbpa_item.item_description,
                "itemType": gbpa_item.item_type,
                "poType": raw_po_type,
                "rate": float(gbpa_item.rate or 0),
                "uom": gbpa_item.uom or "Nos",
                "detail": f"Category Mismatch: Cannot add CAPEX line item '{gbpa_item.item_code}' to an OPEX PO."
            }

        # Check if already in this PO
        existing = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.po_no == po_no,
            TelecomIndusPo.item_code == gbpa_item.item_code
        )
        if site_id:
            existing = existing.filter(TelecomIndusPo.site_id == site_id)
        is_existing = (existing.first() is not None)

        if is_existing:
            return {
                "found": True,
                "eligible": False,
                "itemCode": gbpa_item.item_code,
                "itemName": gbpa_item.item_name or gbpa_item.item_description,
                "itemType": gbpa_item.item_type,
                "poType": raw_po_type,
                "rate": float(gbpa_item.rate or 0),
                "uom": gbpa_item.uom or "Nos",
                "alreadyExists": True,
                "detail": f"Line item '{gbpa_item.item_code}' is already added to this PO."
            }

        return {
            "found": True,
            "eligible": True,
            "itemCode": gbpa_item.item_code,
            "itemName": gbpa_item.item_name or gbpa_item.item_description,
            "itemType": gbpa_item.item_type,
            "poType": raw_po_type,
            "rate": float(gbpa_item.rate or 0),
            "uom": gbpa_item.uom or "Nos",
            "alreadyExists": False,
            "detail": f"Item is verified and eligible for {raw_po_type} PO."
        }

    def add_line_item(
        self,
        po_no: str,
        site_id: str,
        item_code: str,
        qty: float = 1.0
    ) -> JmsLineItem:
        """
        Add a line item from GBPA to telecom_indus_po with strict category validation.
        """
        if not self.master_db:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Master DB session not available."
            )

        proj = self._get_project_context(po_no, site_id)
        po_type = (proj.po_type if proj and proj.po_type else "Opex").strip().lower()
        is_po_capex = "capex" in po_type

        # Fetch the GBPA item from Master DB
        gbpa_item = self.master_db.query(IndusCustomerGbpa).filter(
            IndusCustomerGbpa.item_code == item_code
        ).first()

        if not gbpa_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GBPA Item with code '{item_code}' not found in Master database."
            )

        gbpa_type = (gbpa_item.item_type or "").strip().lower()
        is_item_capex = "capex" in gbpa_type

        # Enforce CAPEX vs OPEX category validation
        if is_po_capex and not is_item_capex:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation Error: Cannot add OPEX line item '{item_code}' to a CAPEX PO."
            )
        if not is_po_capex and is_item_capex:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation Error: Cannot add CAPEX line item '{item_code}' to an OPEX PO."
            )

        # Check uniqueness constraint: (po_no, site_id, item_code)
        existing = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.po_no == po_no,
            TelecomIndusPo.site_id == site_id,
            TelecomIndusPo.item_code == item_code
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Line item '{item_code}' already exists for PO '{po_no}' and Site '{site_id}'."
            )

        # Calculate next line number
        count = self.project_db.query(TelecomIndusPo).filter(
            TelecomIndusPo.po_no == po_no,
            TelecomIndusPo.site_id == site_id
        ).count()
        next_line_no = (count + 1) * 10

        dec_qty = Decimal(str(max(0.01, qty)))
        dec_rate = Decimal(str(gbpa_item.rate or 0))
        dec_amount = dec_qty * dec_rate

        new_entry = TelecomIndusPo(
            company_name=proj.company_name if proj else "Nexus",
            customer_name=proj.customer_name if proj else (gbpa_item.customer_name or "Indus Towers Ltd"),
            po_no=po_no,
            site_id=site_id,
            line_number=str(next_line_no),
            hsn_sac=gbpa_item.hsn_sac,
            hsn_sac_code=gbpa_item.hsn_sac_code,
            item_code=gbpa_item.item_code,
            item_description=gbpa_item.item_description or gbpa_item.item_name,
            uom=gbpa_item.uom or "Nos",
            po_qty=dec_qty,
            po_rate=dec_rate,
            po_amount=dec_amount,
            po_total_amount=dec_amount,
            jms_qty=dec_qty,
            jms_amount=dec_amount,
            net_material_qty=dec_qty,
            jms_status="Not Approved"
        )

        self.project_db.add(new_entry)
        self.project_db.commit()
        self.project_db.refresh(new_entry)

        return JmsLineItem(
            id=new_entry.project_po_line_item_id,
            lineNo=str(new_entry.line_number),
            itemCode=new_entry.item_code or "",
            itemName=new_entry.item_description or "",
            uom=new_entry.uom or "Nos",
            rate=float(dec_rate),
            poQty=float(dec_qty),
            jmsQty=float(dec_qty),
            amount=float(dec_amount),
            netMaterialQty=float(dec_qty),
            poDifference=0.0,
            materialDifference=0.0,
            jmsStatus="Not Approved",
            highlighted=False,
            selected=False
        )

    def submit_jms_to_pm(self, po_no: str, site_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Validate and submit JMS records to Project Manager JMS workflow.
        Updates receiving Project Manager status / task to exactly 'JMS Approval Pending'.
        Merges uploaded JMS documents into one PDF and persists in jms_merged_document.
        Idempotent: safe against repeated submissions and retries.
        """
        proj = self._get_project_context(po_no, site_id)
        if not proj:
            # Fallback: create or retrieve project record
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        # Check line items
        line_items_query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            line_items_query = line_items_query.filter(TelecomIndusPo.site_id == site_id)
        line_items = line_items_query.all()

        if not line_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No JMS line items found for PO #{po_no}."
            )

        # Verify all line items are Approved
        unapproved = [it for it in line_items if it.jms_status != "Approved"]
        if unapproved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit: {len(unapproved)} line item(s) are not yet Approved. Every line item must be approved before submission."
            )

        try:
            # Merge uploaded JMS documents in parallel with submission
            from app.services.wcc_pdf_service import WccPdfService
            pdf_service = WccPdfService(self.project_db)
            merged_pdf_bytes = pdf_service.merge_uploaded_jms_documents(po_no, site_id or proj.site_id, proj)
            if not merged_pdf_bytes or not merged_pdf_bytes.startswith(b"%PDF-"):
                raise ValueError("Generated merged document is not a valid PDF.")

            # Persist merged PDF in jms_merged_document in project database
            proj.jms_merged_document = merged_pdf_bytes
            proj.jms_merged_documents = merged_pdf_bytes

            # Idempotently update status
            proj.current_task = "JMS approval pending"
            proj.project_status = "JMS Approval Pending"
            self.project_db.commit()
            self.project_db.refresh(proj)
        except HTTPException:
            self.project_db.rollback()
            raise
        except Exception as e:
            self.project_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"JMS submission failed during document merging/persistence: {str(e)}"
            )

        return {
            "success": True,
            "poNo": po_no,
            "siteId": proj.site_id,
            "task": proj.current_task,
            "status": proj.project_status,
            "message": "JMS validation completed and submitted to Project Manager with status 'JMS Approval Pending'."
        }

    # ==========================================
    # DOCUMENTS INTEGRATION
    # ==========================================
    def get_documents(self, po_no: str, site_id: Optional[str] = None) -> List[JmsDocumentResponse]:
        query = self.project_db.query(ProjectDocument).filter(ProjectDocument.po_no == po_no)
        if site_id:
            query = query.filter(ProjectDocument.site_id == site_id)
        docs = query.order_by(ProjectDocument.project_document_id.desc()).all()

        return [
            JmsDocumentResponse(
                id=d.project_document_id,
                docType=d.document_number or "STN Document",
                docDetails=d.document_details or "",
                docName=d.document_name or "document.pdf",
                date=d.date.strftime("%d/%m/%Y") if d.date else "",
                poNo=d.po_no,
                siteId=d.site_id
            )
            for d in docs
        ]

    def upload_document(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        doc_type: str = "Survey report",
        doc_details: str = "",
        file_name: str = "document.pdf",
        file_bytes: bytes = b""
    ) -> JmsDocumentResponse:
        max_bytes = 15 * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 15 MB."
            )

        if not file_name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents are accepted."
            )

        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file. The file does not have a valid PDF header signature."
            )

        b64_content = base64.b64encode(file_bytes).decode("utf-8")
        data_uri = f"data:application/pdf;base64,{b64_content}"

        proj = self._get_project_context(po_no, site_id)

        actual_site_id = site_id or (proj.site_id if proj else "")

        new_doc = ProjectDocument(
            company_name=proj.company_name if proj else "Nexus",
            customer_name=proj.customer_name if proj else "Indus Towers Ltd",
            po_no=po_no,
            site_id=actual_site_id,
            date=date.today(),
            document_name=file_name,
            document_number=doc_type,
            document_details=doc_details,
            documents=data_uri
        )

        self.project_db.add(new_doc)
        self.project_db.commit()
        self.project_db.refresh(new_doc)

        return JmsDocumentResponse(
            id=new_doc.project_document_id,
            docType=new_doc.document_number or doc_type,
            docDetails=new_doc.document_details or doc_details,
            docName=new_doc.document_name or file_name,
            date=new_doc.date.strftime("%d/%m/%Y") if new_doc.date else "",
            poNo=new_doc.po_no,
            siteId=new_doc.site_id
        )

    def delete_document(self, doc_id: int) -> Dict[str, Any]:
        doc = self.project_db.query(ProjectDocument).filter(
            ProjectDocument.project_document_id == doc_id
        ).first()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID #{doc_id} not found."
            )

        self.project_db.delete(doc)
        self.project_db.commit()

        return {"success": True, "message": f"Document #{doc_id} successfully deleted."}

    def get_document_file(self, doc_id: int) -> Dict[str, Any]:
        doc = self.project_db.query(ProjectDocument).filter(
            ProjectDocument.project_document_id == doc_id
        ).first()

        if not doc or not doc.documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document file for ID #{doc_id} not found."
            )

        content = doc.documents
        if content.startswith("data:application/pdf;base64,"):
            b64_str = content.split(",", 1)[1]
            raw_bytes = base64.b64decode(b64_str)
        else:
            try:
                raw_bytes = base64.b64decode(content)
            except Exception:
                raw_bytes = content.encode("utf-8")

        return {
            "fileName": doc.document_name or "document.pdf",
            "bytes": raw_bytes
        }

    # ==========================================
    # PROJECT EXPENSES INTEGRATION
    # ==========================================
    def get_project_expenses(self, po_no: str, site_id: Optional[str] = None) -> JmsExpensesResponse:
        query = self.project_db.query(ProjectExpense).filter(ProjectExpense.po_no == po_no)
        if site_id:
            query = query.filter(ProjectExpense.site_id == site_id)
        expenses = query.order_by(ProjectExpense.expense_management_id.desc()).all()

        total = sum(Decimal(str(e.amount or 0)) for e in expenses)

        items = [
            JmsExpenseItem(
                id=e.expense_management_id,
                requestNumber=e.request_number,
                requestDate=e.request_date.strftime("%d/%m/%Y") if e.request_date else "",
                expenseHead=e.expense_head,
                expenseName=e.expense_name,
                uom=e.uom,
                qty=float(e.qty) if e.qty is not None else None,
                rate=float(e.rate) if e.rate is not None else None,
                amount=float(e.amount or 0),
                transferTo=e.transfer_to
            )
            for e in expenses
        ]

        return JmsExpensesResponse(totalExpenseAmount=float(total), expenses=items)

    # ==========================================
    # JMS TO BE PROCESS: WCC / PO AMENDMENT ROUTING
    # ==========================================
    def process_jms_to_be_process(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        line_item_ids: Optional[List[int]] = None
    ) -> JmsProcessResponse:
        """
        Process rows whose task is exactly 'JMS to be process'.
        Calculates:
            PO Difference = PO Qty - JMS Qty
        Routing Rules:
            - PO Difference >= 0:
                Route to WCC with task/status 'WCC to be raise'
            - PO Difference < 0:
                Route to PO to be amend with established status ('To be submit' / 'Amend Requested')
        Preserves existing relationships and maintains idempotency against repeated submissions.
        """
        try:
            proj_query = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no)
            if site_id:
                proj_query = proj_query.filter(TelecomProject.site_id == site_id)
            try:
                proj = proj_query.with_for_update().first()
            except Exception:
                self.project_db.rollback()
                proj = proj_query.first()

            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

            # Strict scope check: Apply new logic only to rows whose task is exactly 'JMS to be process'
            current_task_norm = (proj.current_task or "").strip()
            routed_tasks = ["WCC to be raise", "WCC to be submit", "To be submit", "PO Amend to be submit", "PO to be amend", "WCC to be raise / PO to be amend", "WCC to be submit / PO Amend to be submit"]
            is_already_routed = current_task_norm in routed_tasks

            if current_task_norm != "JMS to be process" and not is_already_routed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Routing is restricted to 'JMS to be process'. Current project task is '{proj.current_task}'."
                )

            # Query line items
            lines_query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
            if site_id:
                lines_query = lines_query.filter(TelecomIndusPo.site_id == site_id)
            if line_item_ids:
                lines_query = lines_query.filter(TelecomIndusPo.project_po_line_item_id.in_(line_item_ids))

            try:
                line_items = lines_query.with_for_update().order_by(TelecomIndusPo.project_po_line_item_id.asc()).all()
            except Exception:
                line_items = lines_query.order_by(TelecomIndusPo.project_po_line_item_id.asc()).all()

            if not line_items:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No line items found for PO #{po_no}."
                )

            routed_items: List[JmsRoutedItem] = []
            wcc_count = 0
            po_amend_count = 0

            for item in line_items:
                po_qty = Decimal(str(item.po_qty or 0))
                # Default jms_qty to po_qty if not set
                if item.jms_qty is not None:
                    jms_qty = Decimal(str(item.jms_qty))
                else:
                    jms_qty = po_qty

                po_rate = Decimal(str(item.po_rate or 0))
                if item.jms_amount is not None:
                    jms_amount = Decimal(str(item.jms_amount))
                else:
                    jms_amount = po_rate * jms_qty

                # Calculate PO Difference = PO Qty - JMS Qty with accurate Decimal arithmetic
                po_diff = po_qty - jms_qty

                if po_diff < Decimal("0"):
                    # Priority 1: PO Difference < 0 -> PO Amend with 'PO Amend to be submit'
                    destination = "po_amend"
                    task_status = "PO Amend to be submit"
                    item.po_amendment_type = "PO Amend to be submit"
                    item.po_amendment_qty = abs(po_diff)
                    amend_type = "Change QTY"
                    amend_qty = float(abs(po_diff))
                    po_amend_count += 1
                else:
                    # Priority 2: PO Difference >= 0 -> WCC with 'WCC to be submit'
                    destination = "wcc"
                    task_status = "WCC to be submit"
                    item.po_amendment_type = "WCC to be submit"
                    item.po_amendment_qty = Decimal("0.00")
                    amend_type = None
                    amend_qty = None
                    wcc_count += 1

                routed_items.append(JmsRoutedItem(
                    lineItemId=item.project_po_line_item_id,
                    lineNo=str(item.line_number or ""),
                    itemCode=item.item_code or "",
                    itemName=item.item_description or item.item_code or "",
                    uom=item.uom or "Nos",
                    rate=float(po_rate),
                    poQty=float(po_qty),
                    jmsQty=float(jms_qty),
                    poDifference=float(po_diff),
                    destination=destination,
                    taskStatus=task_status,
                    amendmentType=amend_type,
                    amendmentQty=amend_qty,
                    amount=float(jms_amount)
                ))

            # Query all line items for this PO to check if overall project status should be updated
            all_lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
            if site_id:
                all_lines = all_lines.filter(TelecomIndusPo.site_id == site_id)
            all_lines_list = all_lines.all()

            # "Do not change the overall project status when only an individual line item's task should change."
            is_full_po_routed = not line_item_ids or (len(line_item_ids) >= len(all_lines_list))

            if is_full_po_routed or all(it.po_amendment_type in ["WCC to be raise", "WCC to be submit", "Change QTY", "PO Amend to be submit"] for it in all_lines_list):
                all_wcc = all(it.po_amendment_type in ["WCC to be raise", "WCC to be submit"] for it in all_lines_list)
                all_amend = all(it.po_amendment_type in ["Change QTY", "PO Amend to be submit"] for it in all_lines_list)

                if all_wcc:
                    proj.current_task = "WCC to be submit"
                    proj.project_status = "WCC to be submit"
                elif all_amend:
                    proj.current_task = "PO Amend to be submit"
                    proj.po_status = "PO Amend to be submit"
                    proj.project_status = "PO Amend to be submit"
                else:
                    proj.current_task = "WCC to be submit / PO Amend to be submit"
                    proj.po_status = "PO Amend to be submit"
                    proj.project_status = "WCC to be submit / PO Amend to be submit"

            self.project_db.commit()
            self.project_db.refresh(proj)

            return JmsProcessResponse(
                success=True,
                poNo=po_no,
                siteId=proj.site_id,
                message=f"Successfully routed {len(routed_items)} line item(s): {wcc_count} to WCC, {po_amend_count} to PO to be Amend.",
                projectTask=proj.current_task,
                projectStatus=proj.project_status or "",
                wccCount=wcc_count,
                poAmendCount=po_amend_count,
                routedItems=routed_items
            )
        except HTTPException:
            self.project_db.rollback()
            raise
        except Exception as e:
            self.project_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Routing failure: {str(e)}"
            )

    def get_wcc_po_details(self, po_no: str, site_id: Optional[str] = None) -> WccPoDetailResponse:
        """
        Retrieve routed WCC PO details and line items (PO Difference >= 0 and JMS Qty != 0).
        """
        proj = self._get_project_context(po_no, site_id)

        lines_query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines_query = lines_query.filter(TelecomIndusPo.site_id == site_id)
        po_lines = lines_query.order_by(TelecomIndusPo.project_po_line_item_id.asc()).all()

        wcc_items: List[WccLineItem] = []
        total_wcc_amount = Decimal("0.00")

        for r in po_lines:
            po_qty = Decimal(str(r.po_qty or 0))
            jms_qty = Decimal(str(r.jms_qty if r.jms_qty is not None else po_qty))
            po_diff = po_qty - jms_qty
            po_rate = Decimal(str(r.po_rate or 0))
            amt = Decimal(str(r.jms_amount if r.jms_amount is not None else (po_rate * jms_qty)))

            # Include items with PO Difference >= 0 specifically routed to WCC
            # Priority: A row with negative PO Difference must route to PO Amend rather than both pages
            is_wcc = (po_diff >= Decimal("0")) and (
                (r.po_amendment_type in ["WCC to be raise", "WCC to be submit", "Rejected"]) or (
                    r.po_amendment_type is None and proj and proj.current_task in ["WCC to be raise", "WCC to be submit", "WCC to be raise / PO to be amend", "WCC to be submit / PO Amend to be submit", "Approval Pending", "Rejected", "Amend Approved", "Amendment Approved"]
                )
            )
            if is_wcc:
                total_wcc_amount += amt
                line_task = "WCC to be submit" if (r.po_amendment_type == "WCC to be submit" or (proj and ("WCC to be submit" in (proj.current_task or "") or (proj.current_task or "") in ["Amend Approved", "Amendment Approved"]))) else ("Rejected" if (r.po_amendment_type == "Rejected" or (proj and proj.current_task == "Rejected")) else "WCC to be raise")
                wcc_items.append(WccLineItem(
                    id=r.project_po_line_item_id,
                    lineNo=str(r.line_number or ""),
                    itemCode=r.item_code or "",
                    itemName=r.item_description or r.item_code or "",
                    uom=r.uom or "Nos",
                    rate=float(po_rate),
                    qty=float(jms_qty),
                    poQty=float(po_qty),
                    jmsQty=float(jms_qty),
                    poDifference=float(po_diff),
                    amount=float(amt),
                    task=line_task,
                    selected=False,
                    highlighted=False
                ))

        customer_name = proj.customer_name if proj else (po_lines[0].customer_name if po_lines else "Indus Towers Ltd")
        site_name = proj.site_name if proj else (site_id or "")
        project_id = proj.project_code if proj else f"PRJ-{po_no}"
        project_type = proj.project_type if proj else "New Build"
        sub_project_type = proj.sub_project_type if proj else "Civil"
        curr_task = (proj.current_task or "").strip() if proj else ""
        t_low = curr_task.lower()
        if t_low in ["pending with indus", "approval pending"]:
            task = "Approval Pending"
        elif t_low == "rejected":
            task = "Rejected"
        elif t_low in ["amend approved", "amendment approved"]:
            task = "WCC to be submit"
        elif "approved" in t_low or "completed" in t_low:
            task = curr_task
        else:
            task = "WCC to be submit"

        has_merged = bool(
            proj and (
                proj.po_amendment_merged_document or proj.po_amendment_merged_documents or
                proj.jms_merged_document or proj.jms_merged_documents
            )
        )
        if proj and proj.current_task == "Rejected":
            has_merged = bool(proj.jms_merged_document or proj.jms_merged_documents)
        wcc_date_str = proj.wcc_date.strftime("%d/%m/%Y") if (proj and getattr(proj, 'wcc_date', None)) else (proj.wcc_submission_date.strftime("%d/%m/%Y") if (proj and proj.wcc_submission_date) else None)
        po_date_str = proj.po_date.strftime("%d/%m/%Y") if (proj and proj.po_date) else None
        comp_date_str = proj.completion_date.strftime("%d/%m/%Y") if (proj and proj.completion_date) else (proj.po_amendment_completion_date.strftime("%d/%m/%Y") if (proj and proj.po_amendment_completion_date) else None)
        wcc_subm_str = proj.wcc_submission_date.strftime("%d/%m/%Y") if (proj and proj.wcc_submission_date) else None
        wcc_appr_str = proj.wcc_approved_date.strftime("%d/%m/%Y") if (proj and proj.wcc_approved_date) else (proj.po_amendment_completion_date.strftime("%d/%m/%Y") if (proj and proj.po_amendment_completion_date) else None)
        wcc_amt_val = float(proj.wcc_amount) if (proj and proj.wcc_amount is not None) else (float(total_wcc_amount) if total_wcc_amount > 0 else (float(proj.po_amount) if (proj and proj.po_amount is not None) else 0.0))

        return WccPoDetailResponse(
            poNo=po_no,
            siteId=site_id or (proj.site_id if proj else (po_lines[0].site_id if po_lines else "")),
            siteName=site_name,
            projectId=project_id,
            customerName=customer_name or "Indus Towers Ltd",
            projectType=project_type,
            subProjectType=sub_project_type,
            task=task,
            totalAmount=float(total_wcc_amount),
            wccNo=proj.wcc_no if proj else None,
            wccDate=wcc_date_str,
            poDate=po_date_str,
            completionDate=comp_date_str,
            wccSubmissionDate=wcc_subm_str,
            submissionDate=wcc_subm_str,
            wccAmount=wcc_amt_val,
            poRevisionNumber=proj.po_revision_number if proj else None,
            wccApprovedDate=wcc_appr_str,
            approvedDate=wcc_appr_str,
            receiptNo=proj.receipt_no if proj else None,
            receiptDate=proj.receipt_date.strftime("%d/%m/%Y") if (proj and proj.receipt_date) else None,
            ersNo=proj.ers_no if proj else None,
            hasMergedDocument=has_merged,
            lineItems=wcc_items
        )

    def get_po_amend_po_details(self, po_no: str, site_id: Optional[str] = None) -> PoAmendPoDetailResponse:
        """
        Retrieve routed PO Amend details and line items (PO Difference < 0).
        """
        proj = self._get_project_context(po_no, site_id)

        lines_query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines_query = lines_query.filter(TelecomIndusPo.site_id == site_id)
        po_lines = lines_query.order_by(TelecomIndusPo.project_po_line_item_id.asc()).all()

        amend_items: List[PoAmendLineItem] = []
        total_amend_amount = Decimal("0.00")
        total_jms_amount = Decimal("0.00")

        for r in po_lines:
            po_qty = Decimal(str(r.po_qty or 0))
            jms_qty = Decimal(str(r.jms_qty if r.jms_qty is not None else po_qty))
            po_diff = po_qty - jms_qty
            po_rate = Decimal(str(r.po_rate or 0))
            amt = Decimal(str(r.jms_amount if r.jms_amount is not None else (po_rate * jms_qty)))
            total_jms_amount += amt

            is_amend = (po_diff < Decimal("0")) and (
                (r.po_amendment_type in ["Change QTY", "PO Amend to be submit", "Approval Pending", "Pending with Indus", "Rejected"]) or (
                    r.po_amendment_type is None and proj and proj.current_task in ["To be submit", "PO Amend to be submit", "PO to be amend", "WCC to be raise / PO to be amend", "WCC to be submit / PO Amend to be submit", "Approval Pending", "Rejected"]
                )
            )
            if is_amend:
                amend_qty = float(r.po_amendment_qty) if r.po_amendment_qty is not None else float(abs(po_diff))
                amt = Decimal(str(r.po_amount if r.po_amount is not None else (po_rate * Decimal(str(amend_qty)))))
                total_amend_amount += amt
                amend_items.append(PoAmendLineItem(
                    id=r.project_po_line_item_id,
                    amendmentType="Change QTY",
                    lineNo=str(r.line_number or ""),
                    itemCode=r.item_code or "",
                    itemName=r.item_description or r.item_code or "",
                    uom=r.uom or "Nos",
                    rate=float(po_rate),
                    qty=amend_qty,
                    poQty=float(po_qty),
                    jmsQty=float(jms_qty),
                    poDifference=float(po_diff),
                    amount=float(amt),
                    selected=False,
                    highlighted=False
                ))

        customer_name = proj.customer_name if proj else (po_lines[0].customer_name if po_lines else "Indus Towers Ltd")
        site_name = proj.site_name if proj else (site_id or "")
        project_id = proj.project_code if proj else f"PRJ-{po_no}"
        project_type = proj.project_type if proj else "New Build"
        sub_project_type = proj.sub_project_type if proj else "Anchor"
        curr_task = (proj.current_task or "").strip() if proj else ""
        t_low = curr_task.lower()
        if t_low in ["pending with indus", "approval pending"]:
            task = "Approval Pending"
            po_status = "Under Review"
        elif t_low == "rejected":
            task = "Rejected"
            po_status = "Rejected"
        elif proj and proj.po_amendment_completion_status:
            task = f"Amendment {proj.po_amendment_completion_status}"
            po_status = "Amended"
        elif "approved" in t_low or "completed" in t_low:
            task = curr_task
            po_status = "Approved"
        else:
            task = "PO Amend to be submit"
            po_status = "PO Amend to be submit" if (proj and "PO Amend" in (proj.po_status or "")) else (proj.po_status if proj and proj.po_status else "Amend Requested")

        has_merged = bool(
            proj and (
                proj.po_amendment_merged_document or proj.po_amendment_merged_documents or
                proj.jms_merged_document or proj.jms_merged_documents
            )
        )
        if proj and proj.current_task == "Rejected":
            has_merged = bool(proj.jms_merged_document or proj.jms_merged_documents)
        comp_date_str = proj.po_amendment_completion_date.strftime("%d/%m/%Y") if (proj and proj.po_amendment_completion_date) else None
        ref_id_val = (proj.po_reference_number or proj.po_amendment_ref_id) if proj else None

        return PoAmendPoDetailResponse(
            poNo=po_no,
            siteId=site_id or (proj.site_id if proj else (po_lines[0].site_id if po_lines else "")),
            siteName=site_name,
            projectId=project_id,
            customerName=customer_name or "Indus Towers Ltd",
            projectType=project_type,
            subProjectType=sub_project_type,
            task=task,
            poStatus=po_status,
            totalAmount=float(total_jms_amount),
            totalJmsAmount=float(total_jms_amount),
            poAmendmentRefId=ref_id_val,
            poRevisionNumber=proj.po_revision_number if proj else None,
            poAmendmentCompletionDate=comp_date_str,
            hasMergedDocument=has_merged,
            lineItems=amend_items
        )

    def submit_po_amend_reference(self, po_no: str, site_id: Optional[str] = None, ref_id: str = "") -> Dict[str, Any]:
        """
        Save PO Reference Number to telecom_project and transition task to 'Approval Pending'.
        """
        ref_clean = (ref_id or "").strip()
        if not ref_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PO Reference Number / Ref. ID is required."
            )

        proj = self._get_project_context(po_no, site_id)
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        proj.po_amendment_ref_id = ref_clean
        proj.po_reference_number = ref_clean
        proj.current_task = "Approval Pending"
        proj.project_status = "Approval Pending"
        proj.po_status = "Under Review"

        # Update line items scoped to this PO
        lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines = lines.filter(TelecomIndusPo.site_id == site_id)
        for item in lines.all():
            if item.po_amendment_type in ["PO Amend to be submit", "Rejected"]:
                item.po_amendment_type = "Approval Pending"

        self.project_db.commit()
        self.project_db.refresh(proj)

        return {
            "success": True,
            "message": f"PO Reference Number '{ref_clean}' saved successfully and task changed to 'Approval Pending'.",
            "poNo": po_no,
            "siteId": proj.site_id,
            "refId": ref_clean,
            "poAmendmentRefId": ref_clean,
            "task": proj.current_task,
            "status": proj.project_status
        }

    def update_po_amend_line_item_qty(
        self,
        line_item_id: Any,
        new_qty: float,
        po_no: Optional[str] = None,
        site_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update PO Amendment Qty for a specific line item in telecom_indus_po.
        Recalculates Amount = PO Rate * Qty.
        Persists recalculated amount in telecom_indus_po and updates po_amount in telecom_project.
        Invalidates existing merged PDF so document regeneration is required.
        """
        if new_qty is None or new_qty <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PO Amendment Quantity must be a positive number greater than zero."
            )

        line_item = None
        # Try finding by primary key ID if numeric
        try:
            numeric_id = int(line_item_id)
            line_item = self.project_db.query(TelecomIndusPo).filter(
                TelecomIndusPo.project_po_line_item_id == numeric_id
            ).first()
        except (ValueError, TypeError):
            pass

        # Fallback to search by po_no and site_id
        if not line_item and po_no:
            query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
            if site_id:
                query = query.filter(TelecomIndusPo.site_id == site_id)
            line_item = query.first()

        if not line_item:
            # If still not found, check if project exists to at least update project po_amount
            proj_fallback = None
            if po_no:
                proj_q = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no)
                if site_id:
                    proj_q = proj_q.filter(TelecomProject.site_id == site_id)
                proj_fallback = proj_q.first()
            if not proj_fallback:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Line item or project with ID #{line_item_id} not found."
                )
            dec_qty = Decimal(str(new_qty))
            recalc_amount = (proj_fallback.po_amount or Decimal("0"))
            proj_fallback.po_amount = recalc_amount
            proj_fallback.jms_merged_document = None
            proj_fallback.jms_merged_documents = None
            proj_fallback.po_amendment_merged_document = None
            proj_fallback.po_amendment_merged_documents = None
            self.project_db.commit()
            return {
                "success": True,
                "id": line_item_id,
                "poNo": proj_fallback.po_no,
                "siteId": proj_fallback.site_id,
                "qty": float(dec_qty),
                "rate": 0.0,
                "amount": float(recalc_amount),
                "totalAmount": float(recalc_amount)
            }

        po_rate = Decimal(str(line_item.po_rate or 0))
        dec_qty = Decimal(str(new_qty))
        recalculated_amount = po_rate * dec_qty

        po_qty = Decimal(str(line_item.po_qty or 0))
        line_item.po_amendment_qty = dec_qty
        line_item.jms_amount = recalculated_amount
        line_item.po_amount = recalculated_amount
        line_item.jms_qty = po_qty + dec_qty
        line_item.material_difference_qty = dec_qty
        line_item.jms_status = "Approved"

        # Update parent project in telecom_project table
        proj_q = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == line_item.po_no)
        if line_item.site_id:
            proj_q = proj_q.filter(TelecomProject.site_id == line_item.site_id)
        proj = proj_q.first()
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == line_item.po_no).first()

        # Recalculate total amount across all amendment lines for this PO
        all_po_lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == line_item.po_no)
        if line_item.site_id:
            all_po_lines = all_po_lines.filter(TelecomIndusPo.site_id == line_item.site_id)

        total_po_amount = Decimal("0.00")
        for l in all_po_lines.all():
            if l.project_po_line_item_id == line_item.project_po_line_item_id:
                total_po_amount += recalculated_amount
            else:
                l_rate = Decimal(str(l.po_rate or 0))
                l_qty = Decimal(str(l.po_amendment_qty if l.po_amendment_qty is not None else (abs(Decimal(str(l.po_qty or 0)) - Decimal(str(l.jms_qty or 0))) if (l.po_qty and l.jms_qty and Decimal(str(l.po_qty or 0)) < Decimal(str(l.jms_qty or 0))) else Decimal(str(l.jms_qty or l.po_qty or 0)))))
                total_po_amount += (l_rate * l_qty)

        if proj:
            proj.po_amount = total_po_amount
            # Outdate existing merged documents so fresh generation is required
            proj.jms_merged_document = None
            proj.jms_merged_documents = None
            proj.po_amendment_merged_document = None
            proj.po_amendment_merged_documents = None

        self.project_db.commit()
        self.project_db.refresh(line_item)
        if proj:
            self.project_db.refresh(proj)

        return {
            "success": True,
            "id": line_item.project_po_line_item_id,
            "poNo": line_item.po_no,
            "siteId": line_item.site_id,
            "qty": float(dec_qty),
            "rate": float(po_rate),
            "amount": float(recalculated_amount),
            "totalAmount": float(proj.po_amount if proj else total_po_amount)
        }

    def update_wcc_line_item_qty(
        self,
        line_item_id: Any,
        new_qty: float,
        po_no: Optional[str] = None,
        site_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update WCC Qty for a specific line item in telecom_indus_po.
        Recalculates Amount = PO Rate * Qty.
        Persists recalculated amount in telecom_indus_po and updates wcc_amount / po_amount in telecom_project.
        Invalidates existing merged PDF so document regeneration is required.
        """
        if new_qty is None or new_qty <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WCC Quantity must be a positive number greater than zero."
            )

        line_item = None
        try:
            numeric_id = int(line_item_id)
            line_item = self.project_db.query(TelecomIndusPo).filter(
                TelecomIndusPo.project_po_line_item_id == numeric_id
            ).first()
        except (ValueError, TypeError):
            pass

        if not line_item and po_no:
            query = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
            if site_id:
                query = query.filter(TelecomIndusPo.site_id == site_id)
            line_item = query.first()

        if not line_item:
            proj_fallback = None
            if po_no:
                proj_q = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no)
                if site_id:
                    proj_q = proj_q.filter(TelecomProject.site_id == site_id)
                proj_fallback = proj_q.first()
            if not proj_fallback:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Line item or project with ID #{line_item_id} not found."
                )
            dec_qty = Decimal(str(new_qty))
            recalc_amount = (proj_fallback.wcc_amount or proj_fallback.po_amount or Decimal("0"))
            proj_fallback.wcc_amount = recalc_amount
            proj_fallback.po_amount = recalc_amount
            proj_fallback.jms_merged_document = None
            proj_fallback.jms_merged_documents = None
            proj_fallback.po_amendment_merged_document = None
            proj_fallback.po_amendment_merged_documents = None
            self.project_db.commit()
            return {
                "success": True,
                "id": line_item_id,
                "poNo": proj_fallback.po_no,
                "siteId": proj_fallback.site_id,
                "qty": float(dec_qty),
                "rate": 0.0,
                "amount": float(recalc_amount),
                "totalAmount": float(recalc_amount)
            }

        po_rate = Decimal(str(line_item.po_rate or 0))
        dec_qty = Decimal(str(new_qty))
        recalculated_amount = po_rate * dec_qty

        line_item.jms_qty = dec_qty
        line_item.jms_amount = recalculated_amount
        line_item.po_amount = recalculated_amount
        line_item.jms_status = "Approved"

        # Update parent project in telecom_project table
        proj_q = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == line_item.po_no)
        if line_item.site_id:
            proj_q = proj_q.filter(TelecomProject.site_id == line_item.site_id)
        proj = proj_q.first()
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == line_item.po_no).first()

        # Recalculate total amount across all WCC lines for this PO
        all_po_lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == line_item.po_no)
        if line_item.site_id:
            all_po_lines = all_po_lines.filter(TelecomIndusPo.site_id == line_item.site_id)

        total_wcc_amount = Decimal("0.00")
        for l in all_po_lines.all():
            po_q = Decimal(str(l.po_qty or 0))
            j_q = Decimal(str(l.jms_qty if l.jms_qty is not None else po_q))
            diff = po_q - j_q
            if diff >= Decimal("0") or l.project_po_line_item_id == line_item.project_po_line_item_id:
                if l.project_po_line_item_id == line_item.project_po_line_item_id:
                    total_wcc_amount += recalculated_amount
                else:
                    l_rate = Decimal(str(l.po_rate or 0))
                    l_qty = Decimal(str(l.jms_qty if l.jms_qty is not None else (l.po_qty or 0)))
                    total_wcc_amount += (l_rate * l_qty)

        if proj:
            proj.wcc_amount = total_wcc_amount
            proj.po_amount = total_wcc_amount
            # Outdate existing merged documents so fresh generation is required
            proj.jms_merged_document = None
            proj.jms_merged_documents = None
            proj.po_amendment_merged_document = None
            proj.po_amendment_merged_documents = None

        self.project_db.commit()
        self.project_db.refresh(line_item)
        if proj:
            self.project_db.refresh(proj)

        return {
            "success": True,
            "id": line_item.project_po_line_item_id,
            "poNo": line_item.po_no,
            "siteId": line_item.site_id,
            "qty": float(dec_qty),
            "rate": float(po_rate),
            "amount": float(recalculated_amount),
            "totalAmount": float(proj.wcc_amount if proj and proj.wcc_amount is not None else total_wcc_amount)
        }

    def submit_wcc_details(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        wcc_no: str = "",
        wcc_date: str = "",
        wcc_amount: float = 0.0,
        submission_date: Optional[str] = None,
        approved_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save WCC Number, WCC Date, Submission Date, Approved Date, and WCC Amount to telecom_project and transition task to 'Approval Pending'.
        """
        wcc_no_clean = (wcc_no or "").strip()
        if not wcc_no_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WCC Number is required."
            )

        wcc_date_clean = (wcc_date or "").strip()
        if not wcc_date_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WCC Date is required."
            )

        norm_date = re.sub(r"\s*([/\-.])\s*", r"\1", wcc_date_clean)
        parsed_date = None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                parsed_date = datetime.strptime(norm_date, fmt).date()
                break
            except ValueError:
                continue

        if not parsed_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid WCC Date format '{wcc_date_clean}'. Expected DD/MM/YYYY or YYYY-MM-DD."
            )

        parsed_subm_date = None
        if submission_date and str(submission_date).strip():
            norm_subm = re.sub(r"\s*([/\-.])\s*", r"\1", str(submission_date).strip())
            for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
                try:
                    parsed_subm_date = datetime.strptime(norm_subm, fmt).date()
                    break
                except ValueError:
                    continue
            if not parsed_subm_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid Submission Date format '{submission_date}'. Expected DD/MM/YYYY or YYYY-MM-DD."
                )
        else:
            parsed_subm_date = parsed_date

        parsed_appr_date = None
        if approved_date and str(approved_date).strip():
            norm_appr = re.sub(r"\s*([/\-.])\s*", r"\1", str(approved_date).strip())
            for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
                try:
                    parsed_appr_date = datetime.strptime(norm_appr, fmt).date()
                    break
                except ValueError:
                    continue
            if not parsed_appr_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid Approved Date format '{approved_date}'. Expected DD/MM/YYYY or YYYY-MM-DD."
                )

        try:
            cleaned_str = re.sub(r"[^\d.-]", "", str(wcc_amount).strip()) if wcc_amount is not None else ""
            dec_amount = Decimal(cleaned_str) if cleaned_str else Decimal("0")
            if dec_amount <= 0:
                raise ValueError()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WCC Amount must be a valid positive number."
            )

        proj = self._get_project_context(po_no, site_id)
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        # Prevent duplicate submissions
        if proj.current_task == "Approval Pending" and proj.wcc_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WCC details have already been submitted for this PO and are pending approval."
            )

        proj.wcc_no = wcc_no_clean
        proj.wcc_date = parsed_date
        proj.wcc_submission_date = parsed_subm_date
        if parsed_appr_date is not None:
            proj.wcc_approved_date = parsed_appr_date
        proj.wcc_amount = dec_amount
        proj.current_task = "Approval Pending"
        proj.project_status = "Approval Pending"

        # Update line items scoped to this PO
        lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines = lines.filter(TelecomIndusPo.site_id == site_id)
        for item in lines.all():
            po_qty = Decimal(str(item.po_qty or 0))
            jms_qty = Decimal(str(item.jms_qty if item.jms_qty is not None else po_qty))
            po_diff = po_qty - jms_qty
            if po_diff >= Decimal("0") or item.po_amendment_type in ["WCC to be submit", "Rejected", "WCC to be raise"]:
                item.po_amendment_type = "Approval Pending"
                item.jms_status = "Approved"

        self.project_db.commit()
        self.project_db.refresh(proj)

        return {
            "success": True,
            "message": f"WCC details saved successfully and task changed to 'Approval Pending'.",
            "poNo": po_no,
            "siteId": proj.site_id,
            "wccNo": wcc_no_clean,
            "wccDate": str(parsed_date),
            "wccSubmissionDate": str(proj.wcc_submission_date) if proj.wcc_submission_date else None,
            "submissionDate": str(proj.wcc_submission_date) if proj.wcc_submission_date else None,
            "wccApprovedDate": str(proj.wcc_approved_date) if proj.wcc_approved_date else None,
            "approvedDate": str(proj.wcc_approved_date) if proj.wcc_approved_date else None,
            "wccAmount": float(dec_amount),
            "task": proj.current_task,
            "status": proj.project_status
        }

    def submit_wcc_receipt(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        receipt_no: str = "",
        receipt_date: str = "",
        ers_no: Optional[str] = ""
    ) -> Dict[str, Any]:
        """
        Save Receipt No, Receipt Date, and ERS No to telecom_project and transition task to 'WCC Approved'.
        """
        rec_clean = (receipt_no or "").strip()
        if not rec_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Receipt No is required."
            )

        date_clean = (receipt_date or "").strip()
        if not date_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Receipt Date is required."
            )

        norm_date = re.sub(r"\s*([/\-.])\s*", r"\1", date_clean)
        parsed_date = None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                parsed_date = datetime.strptime(norm_date, fmt).date()
                break
            except ValueError:
                continue

        if not parsed_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Receipt Date format '{date_clean}'. Expected DD/MM/YYYY or YYYY-MM-DD."
            )

        proj = self._get_project_context(po_no, site_id)
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        proj.receipt_no = rec_clean
        proj.receipt_date = parsed_date
        proj.ers_no = (ers_no or "").strip()
        proj.wcc_approved_date = parsed_date
        proj.current_task = "to be submit"
        proj.project_status = "to be submit"

        lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines = lines.filter(TelecomIndusPo.site_id == site_id)
        for item in lines.all():
            po_qty = Decimal(str(item.po_qty or 0))
            jms_qty = Decimal(str(item.jms_qty if item.jms_qty is not None else po_qty))
            po_diff = po_qty - jms_qty
            if po_diff >= Decimal("0"):
                item.po_amendment_type = "to be submit"

        self.project_db.commit()
        self.project_db.refresh(proj)

        return {
            "success": True,
            "message": f"Receipt details saved successfully for PO #{po_no}.",
            "poNo": po_no,
            "siteId": proj.site_id,
            "receiptNo": rec_clean,
            "receiptDate": str(parsed_date),
            "ersNo": proj.ers_no,
            "task": proj.current_task,
            "status": proj.project_status
        }

    def reject_po_workflow_row(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        workflow: str = "po_amend"
    ) -> Dict[str, Any]:
        """
        Rejects only the selected PO row, transitions task to 'Rejected',
        and removes previously generated merged PDF from jms_merged_document.
        Ensures unrelated PO rows and projects remain intact.
        """
        proj = self._get_project_context(po_no, site_id)
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        norm_wf = (workflow or "").strip().lower()
        lines = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
        if site_id:
            lines = lines.filter(TelecomIndusPo.site_id == site_id)
        all_lines = lines.all()

        has_active_po_amend = False
        has_active_wcc = False
        for item in all_lines:
            po_qty = Decimal(str(item.po_qty or 0))
            jms_qty = Decimal(str(item.jms_qty if item.jms_qty is not None else po_qty))
            po_diff = po_qty - jms_qty
            if po_diff < Decimal("0"):
                if item.po_amendment_type in ["PO Amend to be submit", "Approval Pending", "Amend Requested", "Change QTY"]:
                    has_active_po_amend = True
            elif po_diff >= Decimal("0"):
                if item.po_amendment_type in ["WCC to be submit", "WCC to be raise", "Approval Pending"]:
                    has_active_wcc = True

        if norm_wf == "wcc":
            # 1. Reset WCC line items approval status
            for item in all_lines:
                po_qty = Decimal(str(item.po_qty or 0))
                jms_qty = Decimal(str(item.jms_qty if item.jms_qty is not None else po_qty))
                po_diff = po_qty - jms_qty
                if po_diff >= Decimal("0"):
                    item.jms_status = "Not Approved"
                    item.po_amendment_type = "Rejected"

            # 2. Reject task & status
            if has_active_po_amend:
                proj.current_task = "PO Amend to be submit"
                proj.project_status = "PO Amend to be submit"
            else:
                proj.current_task = "Rejected"
                proj.project_status = "Rejected"
                proj.po_status = "Rejected"

            # 3 & 4. Remove associated PDF only if it belongs exclusively to this workflow
            # If jms_merged_document is shared with an active PO Amend workflow, do not delete it
            is_shared_with_active_amend = has_active_po_amend and (
                proj.po_amendment_merged_document is not None and
                (proj.jms_merged_document == proj.po_amendment_merged_document)
            )
            if not is_shared_with_active_amend:
                proj.jms_merged_document = None
                proj.jms_merged_documents = None

        elif norm_wf in ["po_amend", "po amend"]:
            for item in all_lines:
                po_qty = Decimal(str(item.po_qty or 0))
                jms_qty = Decimal(str(item.jms_qty if item.jms_qty is not None else po_qty))
                po_diff = po_qty - jms_qty
                if po_diff < Decimal("0"):
                    item.jms_status = "Not Approved"
                    item.po_amendment_type = "Rejected"

            if has_active_wcc:
                proj.current_task = "WCC to be submit"
                proj.project_status = "WCC to be submit"
            else:
                proj.current_task = "Rejected"
                proj.project_status = "Rejected"
                proj.po_status = "Rejected"

            is_shared_with_active_wcc = has_active_wcc and (
                proj.jms_merged_document is not None and
                (proj.po_amendment_merged_document == proj.jms_merged_document)
            )
            proj.po_amendment_merged_document = None
            proj.po_amendment_merged_documents = None
            if not is_shared_with_active_wcc:
                proj.jms_merged_document = None
                proj.jms_merged_documents = None
        else:
            for item in all_lines:
                item.jms_status = "Not Approved"
                item.po_amendment_type = "Rejected"
            proj.current_task = "Rejected"
            proj.project_status = "Rejected"
            proj.po_status = "Rejected"
            proj.jms_merged_document = None
            proj.jms_merged_documents = None
            proj.po_amendment_merged_document = None
            proj.po_amendment_merged_documents = None

        self.project_db.commit()
        self.project_db.refresh(proj)

        return {
            "success": True,
            "message": f"PO #{po_no} rejected successfully. Merged document removed.",
            "poNo": po_no,
            "siteId": proj.site_id,
            "task": "Rejected",
            "status": "Rejected"
        }

    def submit_amendment_status(
        self,
        po_no: str,
        site_id: Optional[str] = None,
        workflow: str = "po_amend",
        revision_no: str = "",
        approved_date: str = ""
    ) -> Dict[str, Any]:
        """
        Capture Revision Number and Approved Date, save both values,
        and transition task according to existing approval workflow.
        """
        rev_clean = (revision_no or "").strip()
        if not rev_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Revision Number is required."
            )
        if len(rev_clean) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Revision Number cannot exceed 50 characters."
            )

        appr_date_clean = (approved_date or "").strip()
        if not appr_date_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Approved Date is required."
            )

        norm_appr_date = re.sub(r"\s*([/\-.])\s*", r"\1", appr_date_clean)
        parsed_date = None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                parsed_date = datetime.strptime(norm_appr_date, fmt).date()
                break
            except ValueError:
                continue

        if not parsed_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Approved Date format '{appr_date_clean}'. Expected DD/MM/YYYY or YYYY-MM-DD."
            )

        proj = self._get_project_context(po_no, site_id)
        if not proj:
            proj = self.project_db.query(TelecomProject).filter(TelecomProject.po_no == po_no).first()
            if not proj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project record for PO #{po_no} not found."
                )

        proj.po_revision_number = rev_clean
        proj.po_date = parsed_date
        proj.po_amendment_completion_date = parsed_date

        norm_wf = (workflow or "").strip().lower()
        if norm_wf == "wcc":
            proj.wcc_approved_date = parsed_date
            proj.current_task = "WCC Approved"
            proj.project_status = "WCC Approved"
            destination = "wcc"
            mat_diff_val = 0.0
        else:
            # Evaluate that PO row's current po_material_difference value from the database
            mat_diff_val = None
            if hasattr(proj, 'po_material_difference') and proj.po_material_difference is not None:
                mat_diff_val = float(proj.po_material_difference)

            if mat_diff_val is None:
                lines_q = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
                if site_id:
                    lines_q = lines_q.filter(TelecomIndusPo.site_id == site_id)
                lines = lines_q.all()
                if lines:
                    diffs = []
                    for li in lines:
                        if li.material_difference_qty is not None:
                            diffs.append(float(li.material_difference_qty))
                        elif li.net_material_qty is not None and li.jms_qty is not None:
                            diffs.append(float(Decimal(str(li.jms_qty)) - Decimal(str(li.net_material_qty))))
                    if diffs:
                        pos_diffs = [d for d in diffs if d > 0]
                        mat_diff_val = max(pos_diffs) if pos_diffs else max(diffs)
                    else:
                        mat_diff_val = 0.0
                else:
                    mat_diff_val = 0.0

            # If po_material_difference <= 0, remove row from active PO Amendment and route to WCC with 'WCC to be submit'
            # If po_material_difference > 0, keep row on PO Amendment with 'Approval Pending'
            if mat_diff_val <= 0:
                proj.current_task = "WCC to be submit"
                proj.project_status = "WCC to be submit"
                proj.po_status = "Approved"
                proj.po_amendment_completion_status = "Approved"
                destination = "wcc"

                lines_q = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
                if site_id:
                    lines_q = lines_q.filter(TelecomIndusPo.site_id == site_id)
                for li in lines_q.all():
                    li.po_amendment_type = "WCC to be submit"
            else:
                proj.current_task = "Approval Pending"
                proj.project_status = "Approval Pending"
                proj.po_status = "Under Review"
                proj.po_amendment_completion_status = None
                destination = "po_amend"

                lines_q = self.project_db.query(TelecomIndusPo).filter(TelecomIndusPo.po_no == po_no)
                if site_id:
                    lines_q = lines_q.filter(TelecomIndusPo.site_id == site_id)
                for li in lines_q.all():
                    li.po_amendment_type = "Approval Pending"

        self.project_db.commit()
        self.project_db.refresh(proj)

        return {
            "success": True,
            "message": f"PO #{po_no} amendment status saved (Rev: {rev_clean}, Date: {parsed_date}). Task: '{proj.current_task}'.",
            "poNo": po_no,
            "siteId": proj.site_id,
            "revisionNo": rev_clean,
            "approvedDate": str(parsed_date),
            "poMaterialDifference": mat_diff_val,
            "task": proj.current_task,
            "status": proj.project_status,
            "destination": destination
        }

