import sys, os
sys.path.insert(0, os.path.abspath("backend"))
from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    res = conn.execute(text("SELECT column_name, column_default, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'indus_site_details'")).fetchall()
    for row in res:
        print(row)
