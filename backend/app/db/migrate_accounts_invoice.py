"""
Database migration for Nexus_Accounts DB:
1. Alter `sales.invoice_document` from TEXT to BYTEA so generated PDFs can be stored in binary.
2. Ensure `receipt_indus` has NUMERIC columns for `invoice_amount`, `tds`, and `receivable`.
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy import text, inspect
from app.db.session import accounts_engine

def run_accounts_migration():
    with accounts_engine.connect() as conn:
        inspector = inspect(accounts_engine)

        # 1. Update sales table invoice_document to BYTEA
        sales_cols = {c['name']: str(c['type']).upper() for c in inspector.get_columns('sales')}
        if 'invoice_document' in sales_cols and 'BYTEA' not in sales_cols['invoice_document']:
            print("Altering sales.invoice_document to BYTEA...")
            conn.execute(text("ALTER TABLE sales ALTER COLUMN invoice_document TYPE BYTEA USING invoice_document::bytea;"))
            conn.commit()
            print("Successfully converted sales.invoice_document to BYTEA.")
        else:
            print("sales.invoice_document is already BYTEA.")

        # 2. Update receipt_indus table columns
        receipt_cols = {c['name']: str(c['type']).upper() for c in inspector.get_columns('receipt_indus')}
        if 'invoice_amount' not in receipt_cols:
            print("Adding invoice_amount NUMERIC to receipt_indus...")
            conn.execute(text("ALTER TABLE receipt_indus ADD COLUMN invoice_amount NUMERIC;"))
            conn.commit()

        if 'tds' not in receipt_cols:
            print("Adding tds NUMERIC to receipt_indus...")
            conn.execute(text("ALTER TABLE receipt_indus ADD COLUMN tds NUMERIC;"))
            conn.commit()

        if 'receivable' not in receipt_cols:
            print("Adding receivable NUMERIC to receipt_indus...")
            conn.execute(text("ALTER TABLE receipt_indus ADD COLUMN receivable NUMERIC;"))
            conn.commit()

        print("Accounts migration check completed successfully.")

if __name__ == '__main__':
    run_accounts_migration()
