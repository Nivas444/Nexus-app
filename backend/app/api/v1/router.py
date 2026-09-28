from fastapi import APIRouter
from app.api.v1.expenses import router as expenses_router

api_router = APIRouter()
api_router.include_router(expenses_router)
