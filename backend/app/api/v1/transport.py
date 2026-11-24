from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, Query, Response, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.master_transport import MasterTransport

router = APIRouter(prefix="/master/transport", tags=["Master - Transport"])

DOC_TYPE_TO_COLUMN: Dict[str, str] = {
    "rc copy": "rc_copy",
    "rc_copy": "rc_copy",
    "vehicle insurance certificate": "vehicle_insurance_certificate",
    "vehicle_insurance_certificate": "vehicle_insurance_certificate",
    "fitness certificate (fc)": "fitness_certificate_fc",
    "fitness certificate": "fitness_certificate_fc",
    "fitness_certificate_fc": "fitness_certificate_fc",
    "pollution certificate (puc)": "pollution_certificate_puc",
    "pollution certificate": "pollution_certificate_puc",
    "pollution_certificate_puc": "pollution_certificate_puc",
    "goods carriage permit": "goods_carriage_permit",
    "goods_carriage_permit": "goods_carriage_permit",
    "commercial driving licence": "commercial_driving_licence",
    "commercial driving license": "commercial_driving_licence",
    "commercial_driving_licence": "commercial_driving_licence",
    "road tax receipt": "road_tax_receipt",
    "road_tax_receipt": "road_tax_receipt",
    "fastag": "fastag",
}

COLUMN_TO_DOC_LABEL: Dict[str, str] = {
    "rc_copy": "RC Copy",
    "vehicle_insurance_certificate": "Vehicle Insurance Certificate",
    "fitness_certificate_fc": "Fitness Certificate (FC)",
    "pollution_certificate_puc": "Pollution Certificate (PUC)",
    "goods_carriage_permit": "Goods Carriage Permit",
    "commercial_driving_licence": "Commercial Driving Licence",
    "road_tax_receipt": "Road Tax Receipt",
    "fastag": "FASTag",
}

MAX_PDF_BYTES = 10 * 1024 * 1024


def _parse_decimal(val: Any) -> Optional[Decimal]:
    if val is None or val == "":
        return None
    try:
        cleaned = str(val).replace(",", "").strip()
        return Decimal(cleaned) if cleaned else None
    except (InvalidOperation, ValueError):
        return None


def _parse_date(val: Any) -> Optional[date]:
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    s = str(val).strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _serialize_transport(rec: MasterTransport) -> Dict[str, Any]:
    docs: List[Dict[str, Any]] = []
    exp_str = rec.expiry_date.isoformat() if rec.expiry_date else ""
    for col_name, label in COLUMN_TO_DOC_LABEL.items():
        raw_bytes = getattr(rec, col_name, None)
        if raw_bytes:
            docs.append({
                "id": f"{rec.id}-{col_name}",
                "column": col_name,
                "docName": label,
                "expiryDate": exp_str or "-",
                "fileSize": len(raw_bytes),
                "hasFile": True,
            })

    contacts: List[Dict[str, Any]] = []
    if rec.name or rec.mobile_number:
        contacts.append({
            "id": f"vc-{rec.id}",
            "name": rec.name or "",
            "designation": rec.designation or "",
            "contactNumber": rec.mobile_number or "",
            "status": rec.contact_status or "Active",
        })

    banks: List[Dict[str, Any]] = []
    if rec.account_name or rec.account_number or rec.bank_name:
        banks.append({
            "id": f"vb-{rec.id}",
            "accountName": rec.account_name or "",
            "accountNumber": rec.account_number or "",
            "bankName": rec.bank_name or "",
            "ifscCode": rec.ifsc_code or "",
            "status": rec.account_status or "Active",
        })

    return {
        "id": rec.id,
        "company_name": rec.company_name or "Nexus",
        "transportName": rec.transport_name or "",
        "transport_name": rec.transport_name or "",
        "transportType": rec.transport_type or "",
        "transport_type": rec.transport_type or "",
        "vehicleType": rec.vehicle_type or "",
        "vehicle_type": rec.vehicle_type or "",
        "vehicleNumber": rec.vehicle_number or "",
        "vehicle_number": rec.vehicle_number or "",
        "rentalType": rec.rental_type or "",
        "rental_type": rec.rental_type or "",
        "rentalAmount": f"{rec.rental_amount:.2f}" if rec.rental_amount is not None else "0.00",
        "rental_amount": float(rec.rental_amount) if rec.rental_amount is not None else 0.0,
        "haltRent": f"{rec.halt_rent:.2f}" if rec.halt_rent is not None else "0.00",
        "halt_rent": float(rec.halt_rent) if rec.halt_rent is not None else 0.0,
        "status": rec.transport_status or "Active",
        "transport_status": rec.transport_status or "Active",
        "expiry_date": exp_str,
        "account_name": rec.account_name or "",
        "account_number": rec.account_number or "",
        "bank_name": rec.bank_name or "",
        "ifsc_code": rec.ifsc_code or "",
        "account_status": rec.account_status or "Active",
        "name": rec.name or "",
        "designation": rec.designation or "",
        "mobile_number": rec.mobile_number or "",
        "contact_status": rec.contact_status or "Active",
        "documents": docs,
        "contacts": contacts,
        "banks": banks,
    }


class TransportPayload(BaseModel):
    company_name: Optional[str] = "Nexus"
    transport_name: Optional[str] = None
    transportName: Optional[str] = None
    transport_type: Optional[str] = None
    transportType: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicleType: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicleNumber: Optional[str] = None
    rental_type: Optional[str] = None
    rentalType: Optional[str] = None
    rental_amount: Optional[Any] = None
    rentalAmount: Optional[Any] = None
    halt_rent: Optional[Any] = None
    haltRent: Optional[Any] = None
    transport_status: Optional[str] = None
    status: Optional[str] = None
    expiry_date: Optional[str] = None
    account_name: Optional[str] = None
    accountName: Optional[str] = None
    account_number: Optional[str] = None
    accountNumber: Optional[str] = None
    bank_name: Optional[str] = None
    bankName: Optional[str] = None
    ifsc_code: Optional[str] = None
    ifscCode: Optional[str] = None
    account_status: Optional[str] = None
    name: Optional[str] = None
    designation: Optional[str] = None
    mobile_number: Optional[str] = None
    contactNumber: Optional[str] = None
    contact_status: Optional[str] = None


@router.get("", summary="List Master Transport Records")
def list_transport(
    page: int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=500),
    transport_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(MasterTransport)
    if transport_name:
        q = q.filter(MasterTransport.transport_name.ilike(f"%{transport_name.strip()}%"))
    total = q.count()
    items = (
        q.order_by(MasterTransport.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"items": [_serialize_transport(r) for r in items], "total": total}


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create Master Transport Record")
def create_transport(payload: TransportPayload, db: Session = Depends(get_db)):
    t_name = (payload.transport_name or payload.transportName or "").strip()
    if not t_name:
        raise HTTPException(status_code=422, detail="Transport Name is required.")

    rec = MasterTransport(
        company_name=payload.company_name or "Nexus",
        transport_name=t_name,
        transport_type=(payload.transport_type or payload.transportType or "").strip() or None,
        vehicle_type=(payload.vehicle_type or payload.vehicleType or "").strip() or None,
        vehicle_number=(payload.vehicle_number or payload.vehicleNumber or "").strip() or None,
        rental_type=(payload.rental_type or payload.rentalType or "").strip() or None,
        rental_amount=_parse_decimal(payload.rental_amount if payload.rental_amount is not None else payload.rentalAmount),
        halt_rent=_parse_decimal(payload.halt_rent if payload.halt_rent is not None else payload.haltRent),
        transport_status=(payload.transport_status or payload.status or "Active").strip(),
        expiry_date=_parse_date(payload.expiry_date),
        account_name=(payload.account_name or payload.accountName or "").strip() or None,
        account_number=(payload.account_number or payload.accountNumber or "").strip() or None,
        bank_name=(payload.bank_name or payload.bankName or "").strip() or None,
        ifsc_code=(payload.ifsc_code or payload.ifscCode or "").strip() or None,
        account_status=(payload.account_status or "Active").strip(),
        name=(payload.name or "").strip() or None,
        designation=(payload.designation or "").strip() or None,
        mobile_number=(payload.mobile_number or payload.contactNumber or "").strip() or None,
        contact_status=(payload.contact_status or "Active").strip(),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return _serialize_transport(rec)


@router.put("/{transport_id}", summary="Update Master Transport Record")
def update_transport(
    transport_id: int = Path(..., ge=1),
    payload: TransportPayload = ...,
    db: Session = Depends(get_db),
):
    rec = db.query(MasterTransport).filter(MasterTransport.id == transport_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Transport record not found.")

    if payload.transport_name or payload.transportName:
        rec.transport_name = (payload.transport_name or payload.transportName).strip()
    if payload.transport_type is not None or payload.transportType is not None:
        rec.transport_type = (payload.transport_type or payload.transportType or "").strip() or None
    if payload.vehicle_type is not None or payload.vehicleType is not None:
        rec.vehicle_type = (payload.vehicle_type or payload.vehicleType or "").strip() or None
    if payload.vehicle_number is not None or payload.vehicleNumber is not None:
        rec.vehicle_number = (payload.vehicle_number or payload.vehicleNumber or "").strip() or None
    if payload.rental_type is not None or payload.rentalType is not None:
        rec.rental_type = (payload.rental_type or payload.rentalType or "").strip() or None
    if payload.rental_amount is not None or payload.rentalAmount is not None:
        rec.rental_amount = _parse_decimal(payload.rental_amount if payload.rental_amount is not None else payload.rentalAmount)
    if payload.halt_rent is not None or payload.haltRent is not None:
        rec.halt_rent = _parse_decimal(payload.halt_rent if payload.halt_rent is not None else payload.haltRent)
    if payload.transport_status or payload.status:
        rec.transport_status = (payload.transport_status or payload.status).strip()
    if payload.expiry_date is not None:
        rec.expiry_date = _parse_date(payload.expiry_date)
    if payload.account_name is not None or payload.accountName is not None:
        rec.account_name = (payload.account_name or payload.accountName or "").strip() or None
    if payload.account_number is not None or payload.accountNumber is not None:
        rec.account_number = (payload.account_number or payload.accountNumber or "").strip() or None
    if payload.bank_name is not None or payload.bankName is not None:
        rec.bank_name = (payload.bank_name or payload.bankName or "").strip() or None
    if payload.ifsc_code is not None or payload.ifscCode is not None:
        rec.ifsc_code = (payload.ifsc_code or payload.ifscCode or "").strip() or None
    if payload.account_status is not None:
        rec.account_status = payload.account_status.strip()
    if payload.name is not None:
        rec.name = payload.name.strip() or None
    if payload.designation is not None:
        rec.designation = payload.designation.strip() or None
    if payload.mobile_number is not None or payload.contactNumber is not None:
        rec.mobile_number = (payload.mobile_number or payload.contactNumber or "").strip() or None
    if payload.contact_status is not None:
        rec.contact_status = payload.contact_status.strip()

    db.commit()
    db.refresh(rec)
    return _serialize_transport(rec)


@router.post("/{transport_id}/documents", summary="Upload Transport PDF Document to Respective Column")
async def upload_transport_document(
    transport_id: int = Path(..., ge=1),
    document_type: str = Form(..., description="Document Name / Type"),
    expiry_date: Optional[str] = Form(None, description="Expiry date (YYYY-MM-DD)"),
    file: UploadFile = File(..., description="PDF document"),
    db: Session = Depends(get_db),
):
    rec = db.query(MasterTransport).filter(MasterTransport.id == transport_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Transport record not found.")

    col_name = DOC_TYPE_TO_COLUMN.get((document_type or "").strip().lower())
    if not col_name:
        raise HTTPException(status_code=422, detail=f"Unsupported document type: {document_type}")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")
    if len(file_bytes) > MAX_PDF_BYTES:
        raise HTTPException(status_code=400, detail="PDF file exceeds 10 MB limit.")
    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Only valid PDF files are allowed.")

    setattr(rec, col_name, file_bytes)
    parsed_exp = _parse_date(expiry_date)
    if parsed_exp is not None:
        rec.expiry_date = parsed_exp

    db.commit()
    db.refresh(rec)
    return _serialize_transport(rec)


@router.get("/{transport_id}/documents/{doc_column}", summary="Download Transport PDF Document")
def download_transport_document(
    transport_id: int = Path(..., ge=1),
    doc_column: str = Path(...),
    db: Session = Depends(get_db),
):
    col_name = DOC_TYPE_TO_COLUMN.get((doc_column or "").strip().lower())
    if not col_name:
        raise HTTPException(status_code=404, detail="Unknown document type.")
    rec = db.query(MasterTransport).filter(MasterTransport.id == transport_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Transport record not found.")
    file_bytes = getattr(rec, col_name, None)
    if not file_bytes:
        raise HTTPException(status_code=404, detail="Document not uploaded.")
    return Response(
        content=file_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{col_name}_{transport_id}.pdf"'},
    )


@router.delete("/{transport_id}", summary="Delete Master Transport Record")
def delete_transport(transport_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    rec = db.query(MasterTransport).filter(MasterTransport.id == transport_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Transport record not found.")
    db.delete(rec)
    db.commit()
    return {"success": True, "deleted_id": transport_id}
