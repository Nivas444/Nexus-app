"""
Migration script for Nexus ERP JMS Backend Integration.
Adds jms_status column to telecom_indus_po if not exists.
"""
from sqlalchemy import text, inspect
from app.db.session import project_engine

def run_migration():
    with project_engine.connect() as conn:
        inspector = inspect(project_engine)
        columns = [c['name'] for c in inspector.get_columns('telecom_indus_po')]
        if 'jms_status' not in columns:
            print("Adding jms_status column to telecom_indus_po...")
            conn.execute(text("ALTER TABLE telecom_indus_po ADD COLUMN jms_status VARCHAR(50) DEFAULT 'Not Approved';"))
            conn.commit()
            print("Successfully added jms_status column.")
        else:
            print("Column jms_status already exists in telecom_indus_po.")

if __name__ == "__main__":
    run_migration()
