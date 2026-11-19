-- Nexus ERP Performance Indexes Migration (Idempotent, Non-Destructive)
-- Targets frequently filtered, joined, and sorted columns across schemas.
-- Safe to run multiple times (CREATE INDEX IF NOT EXISTS).

-- =============================================================================
-- 1. nexus_accounts
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_sales_voucher_number
    ON nexus_accounts.sales (voucher_number);

CREATE INDEX IF NOT EXISTS idx_accounts_sales_document_no
    ON nexus_accounts.sales (document_no);

CREATE INDEX IF NOT EXISTS idx_accounts_sales_invoice_status
    ON nexus_accounts.sales (LOWER(invoice_status));

CREATE INDEX IF NOT EXISTS idx_accounts_sales_gstr1_status
    ON nexus_accounts.sales (LOWER(gstr1_status));

CREATE INDEX IF NOT EXISTS idx_accounts_sales_doc_date_desc
    ON nexus_accounts.sales (document_date DESC NULLS LAST, sales_id DESC);

CREATE INDEX IF NOT EXISTS idx_accounts_receipt_indus_invoice_no
    ON nexus_accounts.receipt_indus (invoice_no);

CREATE INDEX IF NOT EXISTS idx_accounts_receipt_indus_voucher_no
    ON nexus_accounts.receipt_indus (voucher_number);

CREATE INDEX IF NOT EXISTS idx_accounts_bank_voucher_date_desc
    ON nexus_accounts.bank (voucher_date DESC NULLS LAST, bank_id DESC);

CREATE INDEX IF NOT EXISTS idx_accounts_purchase_gstr2b_status
    ON nexus_accounts.purchase (LOWER(gstr2b_status));

CREATE INDEX IF NOT EXISTS idx_accounts_purchase_invoice_date_desc
    ON nexus_accounts.purchase (invoice_date DESC NULLS LAST, purchase_id DESC);

-- =============================================================================
-- 2. nexus_project
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_project_telecom_po_site
    ON nexus_project.telecom_project (po_no, site_id);

CREATE INDEX IF NOT EXISTS idx_project_telecom_current_task
    ON nexus_project.telecom_project (current_task);

CREATE INDEX IF NOT EXISTS idx_project_expenses_status_date
    ON nexus_project.project_expenses (LOWER(status), request_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_project_expenses_po_site
    ON nexus_project.project_expenses (po_no, site_id);

CREATE INDEX IF NOT EXISTS idx_project_materials_po_site
    ON nexus_project.project_materials (po_no, site_id);

CREATE INDEX IF NOT EXISTS idx_project_documents_po_site
    ON nexus_project.documents (po_no, site_id);

CREATE INDEX IF NOT EXISTS idx_project_dpr_po_site
    ON nexus_project.dpr (po_no, site_id);

-- =============================================================================
-- 3. nexus_purchase
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_purchase_po_status
    ON nexus_purchase.purchase (po_status);

CREATE INDEX IF NOT EXISTS idx_purchase_pr_no
    ON nexus_purchase.purchase (pr_no);

CREATE INDEX IF NOT EXISTS idx_purchase_request_status
    ON nexus_purchase.purchase_request (status);

-- =============================================================================
-- 4. nexus_master
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_master_vendor_name_lower
    ON nexus_master.vendor_master (LOWER(vendor_name));

CREATE INDEX IF NOT EXISTS idx_master_customer_name_lower
    ON nexus_master.customer (LOWER(customer_name));
