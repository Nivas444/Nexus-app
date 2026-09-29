from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path, UploadFile, File, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.product_service import ProductService
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductStatusUpdate,
    ProductResponse,
    ProductListResponse
)

router = APIRouter(prefix="/master/products", tags=["Master - Products"])

@router.get("", response_model=ProductListResponse, summary="List Master Products")
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, category, head, or code"),
    category: Optional[str] = Query(None, description="Filter by category"),
    head: Optional[str] = Query(None, description="Filter by product head"),
    status: Optional[str] = Query(None, description="Filter by Active or In - Active"),
    sort_by: str = Query("material_id", description="Column to sort by"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real product records from PostgreSQL company_products with filtering, search, and pagination.
    """
    service = ProductService(db)
    return service.get_products_list(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        head=head,
        status_filter=status,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/{product_id}", response_model=ProductResponse, summary="Get Product Details")
def get_product(
    product_id: int = Path(..., ge=1, description="Unique primary key of product (material_id)"),
    db: Session = Depends(get_db)
):
    """
    Fetch a single product by primary key for viewing in the detail panel.
    """
    service = ProductService(db)
    return service.get_product_by_id(product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, summary="Create Product")
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Persist a newly added product into the `company_products` PostgreSQL table.
    """
    service = ProductService(db)
    return service.create_product(payload)

@router.put("/{product_id}", response_model=ProductResponse, summary="Update Product")
def update_product(
    product_id: int = Path(..., ge=1, description="Unique primary key of product (material_id)"),
    payload: ProductUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing product in `company_products`.
    Strictly restricts editable fields to GST Rate, MSQ, MOQ, Margin, OH, and Status.
    Modifications to product name, material head, or HSN code are rejected with 422.
    """
    service = ProductService(db)
    return service.update_product(product_id, payload)

@router.patch("/{product_id}/status", response_model=ProductResponse, summary="Toggle Product Status")
def update_product_status(
    product_id: int = Path(..., ge=1, description="Unique primary key of product (material_id)"),
    payload: ProductStatusUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Toggle Active/In-Active status of a product.
    """
    service = ProductService(db)
    return service.update_status(product_id, payload)

@router.delete("/{product_id}", summary="Delete Product")
def delete_product(
    product_id: int = Path(..., ge=1, description="Unique primary key of product (material_id)"),
    db: Session = Depends(get_db)
):
    """
    Delete a product record from `company_products`.
    """
    service = ProductService(db)
    return service.delete_product(product_id)
