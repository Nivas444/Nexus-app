from fastapi import APIRouter, Depends

from app.core.security import (
    require_method_permissions,
    require_route_permission_map,
)
from app.api.v1.auth import router as auth_router
from app.api.v1.commercial_jms import router as commercial_jms_router
from app.api.v1.commercial_project import router as commercial_project_router
from app.api.v1.companies import router as companies_router
from app.api.v1.customers import router as customers_router
from app.api.v1.employee_subdetails import router as employee_subdetails_router
from app.api.v1.employees import router as employees_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.hr_compliance import router as hr_compliance_router
from app.api.v1.indus_esh import router as indus_esh_router
from app.api.v1.indus_gbpa import router as indus_gbpa_router
from app.api.v1.indus_gbpa_subpages import router as indus_gbpa_subpages_router
from app.api.v1.indus_infra import router as indus_infra_router
from app.api.v1.indus_project import router as indus_project_router
from app.api.v1.indus_site import router as indus_site_router
from app.api.v1.products import router as products_router
from app.api.v1.purchase import router as purchase_router
from app.api.v1.vendors import router as vendors_router

api_router = APIRouter()

# Centralized Authentication & RBAC Management Router
api_router.include_router(auth_router)

# ---------------------------------------------------------------------------
# Master Module Routers (Centralized RBAC via app.core.security)
# ---------------------------------------------------------------------------
api_router.include_router(
    expenses_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("master.view", "projects.view", "accounts.view"),
                write=("master.manage",),
            )
        )
    ],
)
api_router.include_router(
    products_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("master.view", "purchase.view", "warehouse.view", "inventory.view"),
                write=("master.manage",),
            )
        )
    ],
)
api_router.include_router(
    customers_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("master.view", "commercial.view", "projects.view", "accounts.view"),
                write=("master.manage",),
            )
        )
    ],
)
api_router.include_router(
    vendors_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("master.view", "purchase.view", "accounts.view"),
                write=("master.manage",),
            )
        )
    ],
)
api_router.include_router(
    companies_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=(
                    "master.view",
                    "commercial.view",
                    "purchase.view",
                    "warehouse.view",
                    "accounts.view",
                    "admin.view",
                    "projects.view",
                ),
                write=("master.manage",),
            )
        )
    ],
)

# ---------------------------------------------------------------------------
# Admin & HR Module Routers (Restricted to Admin / Master)
# ---------------------------------------------------------------------------
api_router.include_router(
    employees_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("admin.view", "master.view"),
                write=("admin.manage", "master.manage"),
            )
        )
    ],
)
api_router.include_router(
    employee_subdetails_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("admin.view", "accounts.view"),
                write=("admin.manage",),
            )
        )
    ],
)
api_router.include_router(
    hr_compliance_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("admin.view",),
                write=("admin.manage",),
            )
        )
    ],
)

# ---------------------------------------------------------------------------
# Indus Customer / Telecom Master Routers
# ---------------------------------------------------------------------------
_indus_master_dep = Depends(
    require_method_permissions(
        read=("master.view", "commercial.view", "projects.view"),
        write=("master.manage",),
    )
)
api_router.include_router(indus_site_router, dependencies=[_indus_master_dep])
api_router.include_router(indus_gbpa_subpages_router, dependencies=[_indus_master_dep])
api_router.include_router(indus_gbpa_router, dependencies=[_indus_master_dep])
api_router.include_router(
    indus_infra_router,
    dependencies=[
        Depends(
            require_method_permissions(
                read=("master.view", "commercial.view", "projects.view", "warehouse.view"),
                write=("master.manage",),
            )
        )
    ],
)
api_router.include_router(indus_esh_router, dependencies=[_indus_master_dep])
api_router.include_router(indus_project_router, dependencies=[_indus_master_dep])

# ---------------------------------------------------------------------------
# Commercial, Projects, Warehouse STN/SRN & Accounts Invoice/Receivable Routers
# ---------------------------------------------------------------------------
api_router.include_router(
    commercial_project_router,
    dependencies=[
        Depends(
            require_route_permission_map(
                prefix_rules=[
                    # Accounts & Commercial Billing / Receivables (denied to Warehouse/Purchase/Admin/Employee)
                    ("/commercial/invoice", ("accounts.view", "commercial.view"), ("accounts.manage", "commercial.manage")),
                    ("/commercial/receivable", ("accounts.view", "commercial.view"), ("accounts.manage", "commercial.manage")),
                    # Warehouse STN / SRN / Infra dispatch & receive
                    ("/commercial/wh/", ("warehouse.view", "inventory.view"), ("warehouse.manage", "warehouse.update", "inventory.manage")),
                    ("/commercial/infra/", ("warehouse.view", "inventory.view"), ("warehouse.manage", "warehouse.update", "inventory.manage")),
                    ("/commercial/stn", ("warehouse.view", "projects.view", "commercial.view"), ("warehouse.manage", "projects.manage", "commercial.manage")),
                    ("/commercial/srn", ("warehouse.view", "projects.view", "commercial.view"), ("warehouse.manage", "projects.manage", "commercial.manage")),
                    # Project DPR, Attendance, Members, Survey, Pole Mounts, Civil Works
                    ("/commercial/dpr", ("projects.view", "commercial.view"), ("projects.manage", "commercial.manage")),
                ],
                default_read=("commercial.view", "projects.view"),
                default_write=("commercial.manage", "projects.manage"),
            )
        )
    ],
)

api_router.include_router(
    commercial_jms_router,
    dependencies=[
        Depends(
            require_route_permission_map(
                prefix_rules=[
                    # Approval / Rejection actions
                    ("/commercial/jms/line-items/approve", ("commercial.approve",), ("commercial.approve",)),
                    ("/commercial/jms/reject", ("commercial.approve",), ("commercial.approve",)),
                    ("/commercial/jms/submit-amendment-status", ("commercial.approve",), ("commercial.approve",)),
                    # Commercial Invoice PDF Download alias
                    ("/commercial/jms/invoice/pdf/download", ("accounts.view", "commercial.view"), ("accounts.manage", "commercial.manage")),
                ],
                default_read=("commercial.view", "projects.view"),
                default_write=("commercial.manage", "projects.manage", "commercial.approve"),
            )
        )
    ],
)

# ---------------------------------------------------------------------------
# Purchase, Warehouse MIN/MRN & Purchase Payment Router
# ---------------------------------------------------------------------------
api_router.include_router(
    purchase_router,
    dependencies=[
        Depends(
            require_route_permission_map(
                prefix_rules=[
                    # Purchase Payments synced to Accounts DB (denied to Warehouse/Admin/Employee)
                    ("/purchase/payment", ("accounts.view", "purchase.manage"), ("accounts.manage", "purchase.manage")),
                    ("/purchase/transport-payment", ("accounts.view", "purchase.manage"), ("accounts.manage", "purchase.manage")),
                    # Warehouse & Inventory operations inside purchase router
                    ("/purchase/inventory/", ("inventory.view", "warehouse.view", "purchase.view"), ("inventory.manage", "warehouse.manage")),
                    ("/purchase/min/", ("warehouse.view", "inventory.view", "purchase.view"), ("warehouse.manage", "warehouse.update", "purchase.manage")),
                    ("/purchase/mrn/", ("warehouse.view", "inventory.view", "purchase.view"), ("warehouse.manage", "warehouse.update")),
                    ("/purchase/lr-document", ("warehouse.view", "purchase.view", "accounts.view"), ("warehouse.manage", "purchase.manage")),
                    # PR creation/listing (shared by Warehouse Manager & Purchase Manager)
                    ("/purchase/pr/select-suppliers", ("purchase.view",), ("purchase.manage", "purchase.update")),
                    ("/purchase/pr", ("purchase.view", "warehouse.view"), ("purchase.create", "purchase.manage", "warehouse.create", "warehouse.manage")),
                    # RFQ & PO management
                    ("/purchase/rfq", ("purchase.view",), ("purchase.manage", "purchase.update")),
                    ("/purchase/po", ("purchase.view", "warehouse.view", "accounts.view"), ("purchase.manage", "purchase.update")),
                ],
                default_read=("purchase.view",),
                default_write=("purchase.manage",),
            )
        )
    ],
)
