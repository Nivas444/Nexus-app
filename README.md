# Nexus ERP

**Nexus ERP** is an end-to-end Enterprise Resource Planning platform built for **telecom infrastructure and turnkey engineering companies**. It connects field project execution, procurement, warehouse logistics, statutory HR compliance, customer billing, and financial accounts into a single role-based workspace.

---

## What Nexus ERP Does in Real Life

Telecom infrastructure contractors manage hundreds of active tower/telecom sites simultaneously—coordinating surveys, civil and electrical works, material dispatches, vendor supply chains, fleet transport, statutory payroll rules, and milestone-based customer billing (such as GBPA-driven projects for clients like **Indus Towers Ltd**).

Nexus ERP replaces fragmented spreadsheets and manual sign-offs with structured, auditable workflows across every department:

### 1. Master Data & Organization Control
- **Company Profile & Branding**: Manages legal registrations (GST, PAN, TAN, Udyam, EPF, ESI, ISO, OSHA, DSC, E-Invoice), company bank accounts, office locations, holiday calendars, and dynamic brand theming (hex color code applied across the web UI and generated PDFs).
- **Employee Management**: Stores employee profiles, KYC documents, auto-calculated current and total experience from Date of Joining, salary structures, assigned company assets, and bank accounts.
- **Customer & Telecom Site Masters**: Maintains customer profiles along with telecom-specific sub-masters—**Sites**, **GBPA / Products & Rate Cards**, **Infrastructure catalogs**, **ESH compliance**, and **Project Types**.
- **Vendor, Product, Expense & Transport Masters**: Manages supplier/service vendor directories (with supply/service scopes and pricing), product catalogs (HSN, UOM, GST), Capex/Opex expense heads (RCM, depreciation), and transport fleets with vehicle compliance documents (RC, Insurance, FC, PUC, Permits, FASTag) and expiry tracking.
- **Bulk Data Operations**: Supports CSV/Excel bulk uploads and template downloads with duplicate validation across master tables.

### 2. HR Policies & Statutory Compliance
- Centralizes Indian statutory and company HR rules under one compliance workspace: **EPF**, **ESI**, **Professional Tax (PT)**, **Labour Welfare Fund (LWF)**, **TDS**, **Leave Policies (CL / SL / EL & Sandwich Leave)**, **Bonus (Statutory / Performance)**, and **Medical Insurance**.
- Tracks effective date ranges (`From` / `To`), salary ceiling amounts (`Basic + DA + SA`), filing frequencies, due dates, and employee/employer contribution percentages.

### 3. Projects & Field Execution
- Tracks turnkey site rollouts from **Site Survey** and **Project Planning** through **Civil Works**, **Pole Mounts**, **Daily Progress Reports (DPR)**, and **Team Attendance**.
- Manages **Joint Measurement Sheets (JMS)**, **PO Amendments**, and **Work Completion Certificates (WCC)** with multi-stage review, approval, and rejection workflows.

### 4. Procurement (Purchase)
- Runs the full procure-to-order cycle: **Purchase Requisitions (PR)** raised by project/warehouse teams → **Supplier Selection & RFQs** → **Purchase Orders (PO)** → **LR document tracking** → **Purchase & Transport Payment** handoff to Accounts.

### 5. Warehouse & Infrastructure Inventory
- Separates standard inventory from dedicated **Infrastructure Warehouse (Infra WH)** operations.
- Tracks real-time stock movement via **Material Issue Notes (MIN)**, **Material Return Notes (MRN)**, **Stock Transfer Notes (STN)**, and **Stock Receipt Notes (SRN)** between central warehouses and active project sites.

### 6. Commercial Billing & Accounts
- Generates official **Tax Invoices**, **Invoice Checklists**, and **WCC PDFs** directly from verified project milestones.
- Tracks **Receivables**, **Vendor/Purchase Payments**, **Project Expense Payments**, and **Bank Transfers** in a dedicated accounts ledger.

### 7. Role-Based Worklists & Security
- Every department logs into a tailored **Worklist** showing only pending approvals, dispatches, validations, or payments relevant to their role (**Master, Admin, Commercial, Projects, Purchase, Warehouse, Accounts, Employee**).
- Enforces centralized **Role-Based Access Control (RBAC)** with JWT, HttpOnly cookies, CSRF protection, and domain-separated PostgreSQL schemas (`nexus_master`, `nexus_project`, `nexus_accounts`, `nexus_purchase`, `nexus_inventory`, `nexus_infra_inventory`, `nexus_admin`).

---

## Architecture Overview

- **Frontend**: Responsive web application (`HTML / CSS / Vanilla JS`) with modular department controllers, Excel-style column filtering, dynamic company theming, and global async activity feedback.
- **Backend**: **FastAPI (Python)** REST API with **SQLAlchemy ORM**, Pydantic validation, automated PDF generation, and multi-schema **PostgreSQL** persistence.
