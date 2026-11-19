"""
Idempotent migration & seeder for Nexus ERP Centralized Security (RBAC & JWT Auth).

Creates tables inside the existing `nexus_admin` schema without touching or
dropping any existing ERP tables or schemas:
  - nexus_admin.auth_roles
  - nexus_admin.auth_permissions
  - nexus_admin.auth_role_permissions
  - nexus_admin.auth_users
  - nexus_admin.auth_user_roles
  - nexus_admin.auth_token_sessions
  - nexus_admin.auth_audit_logs
"""

import os
from typing import Dict, List, Tuple

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models.employee import CompanyEmployee
from app.models.security import (
    AuthAuditLog,
    AuthPermission,
    AuthRole,
    AuthRolePermission,
    AuthTokenSession,
    AuthUser,
    AuthUserRole,
)

PERMISSIONS_CATALOG: List[Tuple[str, str, str]] = [
    # Master module
    ("master.view", "master", "View master reference data (companies, customers, products, vendors, expenses, indus)"),
    ("master.manage", "master", "Create, update, and delete master reference records"),
    # Purchase module
    ("purchase.view", "purchase", "View purchase requests, RFQs, POs, and supplier documents"),
    ("purchase.create", "purchase", "Create purchase requests and purchase orders"),
    ("purchase.update", "purchase", "Update purchase requests, RFQs, POs, and upload documents"),
    ("purchase.delete", "purchase", "Delete purchase records"),
    ("purchase.manage", "purchase", "Full purchase module operational control"),
    # Warehouse module
    ("warehouse.view", "warehouse", "View warehouse STN, SRN, MIN, MRN, and delivery challans"),
    ("warehouse.create", "warehouse", "Create warehouse receipts and material issue records"),
    ("warehouse.update", "warehouse", "Update warehouse dispatch, receive, and transport details"),
    ("warehouse.manage", "warehouse", "Full warehouse operational control"),
    # Inventory module
    ("inventory.view", "inventory", "View stock quantities and inventory records"),
    ("inventory.manage", "inventory", "Manage inventory stock and infra warehouse movements"),
    # Commercial module
    ("commercial.view", "commercial", "View commercial projects, JMS, WCC, PO Amend, invoices"),
    ("commercial.manage", "commercial", "Create, update, upload, and process commercial records"),
    ("commercial.approve", "commercial", "Approve or reject JMS, WCC, and PO amendment items"),
    # Projects module
    ("projects.view", "projects", "View project details, DPR, attendance, members, materials, expenses"),
    ("projects.manage", "projects", "Create, update, and delete project DPR, materials, and expenses"),
    # Accounts module
    ("accounts.view", "accounts", "View invoices, receivables, purchase payments, and accounts records"),
    ("accounts.manage", "accounts", "Update receivable amounts, deductions, payment receipts, and sync payments"),
    # Admin & HR module
    ("admin.view", "admin", "View employees, bank/salary/asset subdetails, HR compliance, and admin records"),
    ("admin.manage", "admin", "Manage employees, HR compliance, and administrative records"),
    ("admin.users.manage", "admin", "Create, update, deactivate users and assign non-super-admin roles"),
    ("admin.roles.manage", "admin", "View and manage RBAC roles and permissions"),
    # Common worklist & profile
    ("worklist.view", "worklist", "Access role-scoped worklist views"),
    ("profile.view", "profile", "View own user profile"),
]

ROLES_MATRIX: Dict[str, Tuple[str, List[str]]] = {
    "Master": (
        "Super Admin with full system access across all Nexus ERP modules",
        [code for code, _, _ in PERMISSIONS_CATALOG],
    ),
    "Admin Manager": (
        "Administration, HR compliance, employee records, and user management",
        [
            "admin.view",
            "admin.manage",
            "admin.users.manage",
            "admin.roles.manage",
            "worklist.view",
            "profile.view",
        ],
    ),
    "Commercial Manager": (
        "Master data, Indus customer setup, commercial projects, JMS, WCC, PO amendments, and invoicing",
        [
            "master.view",
            "master.manage",
            "commercial.view",
            "commercial.manage",
            "commercial.approve",
            "projects.view",
            "projects.manage",
            "worklist.view",
            "profile.view",
        ],
    ),
    "Project Manager": (
        "Project execution, DPR, site materials/expenses, and JMS/WCC approvals",
        [
            "projects.view",
            "projects.manage",
            "commercial.view",
            "commercial.approve",
            "master.view",
            "worklist.view",
            "profile.view",
        ],
    ),
    "Warehouse Manager": (
        "Warehouse operations, PR creation, MIN/MRN/STN/SRN dispatch & receipt, and inventory",
        [
            "warehouse.view",
            "warehouse.create",
            "warehouse.update",
            "warehouse.manage",
            "inventory.view",
            "inventory.manage",
            "purchase.view",
            "purchase.create",
            "worklist.view",
            "profile.view",
        ],
    ),
    "Purchase Manager": (
        "Procurement workflow: PR, RFQ, PO, supplier selection, and vendor/product lookups",
        [
            "purchase.view",
            "purchase.create",
            "purchase.update",
            "purchase.delete",
            "purchase.manage",
            "worklist.view",
            "profile.view",
        ],
    ),
    "Accounts Manager": (
        "Finance & accounts: invoices, receivables, payment receipts, and purchase payment reconciliation",
        [
            "accounts.view",
            "accounts.manage",
            "worklist.view",
            "profile.view",
        ],
    ),
    "MIS": (
        "Management Information System reporting and PTW worklist view",
        [
            "worklist.view",
            "projects.view",
            "profile.view",
        ],
    ),
    "Employee": (
        "Standard employee with restricted self-service profile access only",
        [
            "profile.view",
        ],
    ),
}


def _seed_users_spec() -> List[Dict]:
    """
    Existing Nexus ERP user accounts migrated from legacy hardcoded dicts into PostgreSQL.
    Initial passwords can be overridden via SEED_<USERNAME>_PASSWORD environment variables
    and should be rotated in production via the Admin User Management API.
    """
    return [
        {
            "user_uid": "usr-master-01",
            "email": "master@nexus.com",
            "username": "master",
            "full_name": "Master",
            "password": os.environ.get("SEED_MASTER_PASSWORD", "master123"),
            "role": "Master",
            "is_super_admin": True,
            "department": "Executive Management",
            "phone": "+91 98765 43210",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-admin-01",
            "email": "admin@nexus.com",
            "username": "admin",
            "full_name": "Admin Manager",
            "password": os.environ.get("SEED_ADMIN_PASSWORD", "admin123"),
            "role": "Admin Manager",
            "is_super_admin": False,
            "department": "Administration",
            "phone": "+91 98765 00001",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-comm-02",
            "email": "commercial@nexus.com",
            "username": "commercial",
            "full_name": "Commercial Manager",
            "password": os.environ.get("SEED_COMMERCIAL_PASSWORD", "commercial123"),
            "role": "Commercial Manager",
            "is_super_admin": False,
            "department": "Commercial Operations",
            "phone": "+91 98765 00002",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-proj-03",
            "email": "project@nexus.com",
            "username": "project",
            "full_name": "Project Manager",
            "password": os.environ.get("SEED_PROJECT_PASSWORD", "project123"),
            "role": "Project Manager",
            "is_super_admin": False,
            "department": "Project Management",
            "phone": "+91 98765 00003",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-wh-04",
            "email": "warehouse@nexus.com",
            "username": "warehouse",
            "full_name": "Warehouse Manager",
            "password": os.environ.get("SEED_WAREHOUSE_PASSWORD", "warehouse123"),
            "role": "Warehouse Manager",
            "is_super_admin": False,
            "department": "Warehouse Operations",
            "phone": "+91 98765 00004",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-pur-05",
            "email": "purchase@nexus.com",
            "username": "purchase",
            "full_name": "Purchase Manager",
            "password": os.environ.get("SEED_PURCHASE_PASSWORD", "purchase123"),
            "role": "Purchase Manager",
            "is_super_admin": False,
            "department": "Purchase Operations",
            "phone": "+91 98765 00005",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-acc-06",
            "email": "account@nexus.com",
            "username": "account",
            "full_name": "Accounts Manager",
            "password": os.environ.get("SEED_ACCOUNT_PASSWORD", "account123"),
            "role": "Accounts Manager",
            "is_super_admin": False,
            "department": "Finance & Accounts",
            "phone": "+91 98765 00006",
            "location": "Chennai, India",
        },
        {
            "user_uid": "usr-mis-07",
            "email": "mis@nexus.com",
            "username": "mis",
            "full_name": "MIS",
            "password": os.environ.get("SEED_MIS_PASSWORD", "mis123"),
            "role": "MIS",
            "is_super_admin": False,
            "department": "Management Information System",
            "phone": "+91 98765 00007",
            "location": "Chennai, India",
        },
    ]


def ensure_security_tables_and_seed(db: Session | None = None) -> None:
    """Create security tables in `nexus_admin` if missing and seed default RBAC + users."""
    security_tables = [
        AuthRole.__table__,
        AuthPermission.__table__,
        AuthRolePermission.__table__,
        AuthUser.__table__,
        AuthUserRole.__table__,
        AuthTokenSession.__table__,
        AuthAuditLog.__table__,
    ]
    for tbl in security_tables:
        tbl.create(bind=engine, checkfirst=True)

    owns_session = db is None
    session = db or SessionLocal()
    try:
        # 1. Seed permissions
        perm_by_code: Dict[str, AuthPermission] = {}
        existing_perms = session.query(AuthPermission).all()
        for p in existing_perms:
            perm_by_code[p.code] = p

        for code, module, desc in PERMISSIONS_CATALOG:
            if code not in perm_by_code:
                perm = AuthPermission(code=code, module=module, description=desc)
                session.add(perm)
                session.flush()
                perm_by_code[code] = perm

        # 2. Seed roles and role->permission mappings
        role_by_name: Dict[str, AuthRole] = {}
        existing_roles = session.query(AuthRole).all()
        for r in existing_roles:
            role_by_name[r.name] = r

        for role_name, (desc, perm_codes) in ROLES_MATRIX.items():
            role = role_by_name.get(role_name)
            if not role:
                role = AuthRole(name=role_name, description=desc, is_system=True)
                session.add(role)
                session.flush()
                role_by_name[role_name] = role

            existing_perm_ids = {p.id for p in (role.permissions or [])}
            for p_code in perm_codes:
                perm = perm_by_code.get(p_code)
                if perm and perm.id not in existing_perm_ids:
                    session.add(AuthRolePermission(role_id=role.id, permission_id=perm.id))
                    existing_perm_ids.add(perm.id)

        session.flush()

        # 3. Seed existing ERP users idempotently (link employee_id if email matches)
        for spec in _seed_users_spec():
            email = spec["email"].strip().lower()
            existing_user = session.query(AuthUser).filter(AuthUser.email == email).first()
            if existing_user:
                # Ensure user has at least their primary role assigned
                target_role = role_by_name.get(spec["role"])
                if target_role and target_role.id not in {r.id for r in (existing_user.roles or [])}:
                    session.add(AuthUserRole(user_id=existing_user.id, role_id=target_role.id))
                continue

            matched_emp_id = None
            try:
                emp = (
                    session.query(CompanyEmployee)
                    .filter(CompanyEmployee.email.ilike(email))
                    .first()
                )
                if emp:
                    matched_emp_id = emp.employee_id
            except Exception:
                pass

            user = AuthUser(
                user_uid=spec["user_uid"],
                email=email,
                username=spec["username"].strip().lower(),
                full_name=spec["full_name"],
                password_hash=hash_password(spec["password"]),
                employee_id=matched_emp_id,
                department=spec["department"],
                phone=spec["phone"],
                location=spec["location"],
                is_active=True,
                is_super_admin=spec["is_super_admin"],
            )
            session.add(user)
            session.flush()

            target_role = role_by_name.get(spec["role"])
            if target_role:
                session.add(AuthUserRole(user_id=user.id, role_id=target_role.id))

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        if owns_session:
            session.close()


if __name__ == "__main__":
    ensure_security_tables_and_seed()
    print("Nexus ERP security tables created and seeded successfully in nexus_admin.")
