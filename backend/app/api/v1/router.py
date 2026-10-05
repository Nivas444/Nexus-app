from fastapi import APIRouter
from app.api.v1.expenses import router as expenses_router
from app.api.v1.products import router as products_router
from app.api.v1.customers import router as customers_router
from app.api.v1.employees import router as employees_router
from app.api.v1.employee_subdetails import router as employee_subdetails_router
from app.api.v1.vendors import router as vendors_router
from app.api.v1.companies import router as companies_router
from app.api.v1.hr_compliance import router as hr_compliance_router
from app.api.v1.indus_site import router as indus_site_router
from app.api.v1.indus_gbpa import router as indus_gbpa_router
from app.api.v1.indus_gbpa_subpages import router as indus_gbpa_subpages_router
from app.api.v1.indus_infra import router as indus_infra_router
from app.api.v1.indus_esh import router as indus_esh_router
from app.api.v1.indus_project import router as indus_project_router
from app.api.v1.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(expenses_router)
api_router.include_router(products_router)
api_router.include_router(customers_router)
api_router.include_router(employees_router)
api_router.include_router(employee_subdetails_router)
api_router.include_router(vendors_router)
api_router.include_router(companies_router)
api_router.include_router(hr_compliance_router)
api_router.include_router(indus_site_router)
api_router.include_router(indus_gbpa_subpages_router)
api_router.include_router(indus_gbpa_router)
api_router.include_router(indus_infra_router)
api_router.include_router(indus_esh_router)
api_router.include_router(indus_project_router)




