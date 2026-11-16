import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    dbname=os.getenv('DB_NAME')
)
cur = conn.cursor()

print("Applying migrations for nexus_purchase...")

# 1. Update purchase table: add invoice_document and GST category columns
purchase_alter_stmts = [
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS invoice_document TEXT;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS po_amount NUMERIC(15,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS rfq_no VARCHAR(100);",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS rfq_id VARCHAR(100);",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS gst_applicable BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50);",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS gst_type VARCHAR(50);",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(15,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(15,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(15,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(15,2) DEFAULT 0;",
    "ALTER TABLE nexus_purchase.purchase ADD COLUMN IF NOT EXISTS total_amount NUMERIC(15,2) DEFAULT 0;"
]

for stmt in purchase_alter_stmts:
    try:
        cur.execute(stmt)
        print("Executed:", stmt.split()[4] if "ADD COLUMN" in stmt else stmt)
    except Exception as e:
        print("Error on stmt:", stmt, e)
        conn.rollback()
conn.commit()

# 2. Update purchase_request table: ensure uom, submit_by, stock_qty exist
pr_alter_stmts = [
    "ALTER TABLE nexus_purchase.purchase_request ADD COLUMN IF NOT EXISTS uom VARCHAR(50);",
    "ALTER TABLE nexus_purchase.purchase_request ADD COLUMN IF NOT EXISTS submit_by VARCHAR(255);",
    "ALTER TABLE nexus_purchase.purchase_request ADD COLUMN IF NOT EXISTS stock_qty NUMERIC(15,2) DEFAULT 0;"
]

for stmt in pr_alter_stmts:
    try:
        cur.execute(stmt)
        print("Executed:", stmt.split()[4] if "ADD COLUMN" in stmt else stmt)
    except Exception as e:
        print("Error on stmt:", stmt, e)
        conn.rollback()
conn.commit()

# Verify columns
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'nexus_purchase' AND table_name = 'purchase'
    ORDER BY ordinal_position;
""")
print("\nUpdated nexus_purchase.purchase columns:")
for r in cur.fetchall():
    print(" ", r[0], r[1])

conn.close()
print("Migration completed successfully!")
