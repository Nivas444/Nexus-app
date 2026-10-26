import base64
from sqlalchemy import text, inspect
from app.db.session import project_engine

def run_migration():
    with project_engine.connect() as conn:
        inspector = inspect(project_engine)
        
        # 1. jms_status column in telecom_indus_po
        columns = [c['name'] for c in inspector.get_columns('telecom_indus_po')]
        if 'jms_status' not in columns:
            print("Adding jms_status column to telecom_indus_po...")
            conn.execute(text("ALTER TABLE telecom_indus_po ADD COLUMN jms_status VARCHAR(50) DEFAULT 'Not Approved';"))
            conn.commit()
            print("Successfully added jms_status column.")
        else:
            print("Column jms_status already exists in telecom_indus_po.")

        # 2. BYTEA columns for telecom_project
        proj_cols = {c['name']: c['type'] for c in inspector.get_columns('telecom_project')}
        
        # Ensure jms_merged_document BYTEA exists
        if 'jms_merged_document' not in proj_cols:
            print("Adding jms_merged_document BYTEA to telecom_project...")
            conn.execute(text("ALTER TABLE telecom_project ADD COLUMN jms_merged_document BYTEA;"))
            conn.commit()

        # Ensure po_amendment_merged_document BYTEA exists
        if 'po_amendment_merged_document' not in proj_cols:
            print("Adding po_amendment_merged_document BYTEA to telecom_project...")
            conn.execute(text("ALTER TABLE telecom_project ADD COLUMN po_amendment_merged_document BYTEA;"))
            conn.commit()

        if 'po_reference_number' not in proj_cols:
            print("Adding po_reference_number VARCHAR(100) to telecom_project...")
            conn.execute(text("ALTER TABLE telecom_project ADD COLUMN po_reference_number VARCHAR(100);"))
            conn.commit()

        if 'wcc_amount' not in proj_cols:
            print("Adding wcc_amount NUMERIC to telecom_project...")
            conn.execute(text("ALTER TABLE telecom_project ADD COLUMN wcc_amount NUMERIC;"))
            conn.commit()

        if 'receipt_date' not in proj_cols:
            print("Adding receipt_date DATE to telecom_project...")
            conn.execute(text("ALTER TABLE telecom_project ADD COLUMN receipt_date DATE;"))
            conn.commit()

        # Check and migrate text columns if needed
        proj_cols = {c['name']: str(c['type']).upper() for c in inspector.get_columns('telecom_project')}
        for col_name in ['jms_merged_documents', 'po_amendment_merged_documents', 'jms_merged_document', 'po_amendment_merged_document']:
            if col_name in proj_cols and 'BYTEA' not in proj_cols[col_name]:
                print(f"Altering {col_name} to BYTEA...")
                # Fetch text rows to convert safely
                rows = conn.execute(text(f"SELECT project_id, {col_name} FROM telecom_project WHERE {col_name} IS NOT NULL;")).fetchall()
                for pid, text_val in rows:
                    if text_val and isinstance(text_val, str):
                        if "base64," in text_val:
                            pdf_bytes = base64.b64decode(text_val.split("base64,", 1)[1])
                        else:
                            try:
                                pdf_bytes = base64.b64decode(text_val)
                            except Exception:
                                pdf_bytes = text_val.encode("utf-8")
                        conn.execute(
                            text(f"UPDATE telecom_project SET {col_name} = :bytes WHERE project_id = :pid"),
                            {"bytes": pdf_bytes, "pid": pid}
                        )
                conn.execute(text(f"ALTER TABLE telecom_project ALTER COLUMN {col_name} TYPE BYTEA USING {col_name}::bytea;"))
                conn.commit()
                print(f"Successfully converted {col_name} to BYTEA.")

if __name__ == "__main__":
    run_migration()

