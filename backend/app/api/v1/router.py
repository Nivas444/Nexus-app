from fastapi import APIRouter
from app.api.v1.expenses import router as expenses_router
from app.api.v1.products import router as products_router
from app.api.v1.customers import router as customers_router
from app.api.v1.employees import router as employees_router

api_router = APIRouter()
api_router.include_router(expenses_router)
api_router.include_router(products_router)
api_router.include_router(customers_router)
api_router.include_router(employees_router)

