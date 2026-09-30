from sqlalchemy import text
from app.db.session import engine

with engine.connect() as conn:
    res = conn.execute(text("""
        SELECT table_name, column_name, column_default, is_nullable, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('vendor_master', 'vendor_price')
        ORDER BY table_name, ordinal_position
    """)).fetchall()
    for r in res:
        print(r)
