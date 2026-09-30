import sys
import os
sys.path.insert(0, r'e:\Freelance\backend')

from sqlalchemy import inspect
from app.db.session import engine

inspector = inspect(engine)
tables = inspector.get_table_names()
print("All tables:", tables)

if 'hr_compliance' in tables:
    print("\n--- hr_compliance COLUMNS ---")
    for col in inspector.get_columns('hr_compliance'):
        print(f"Col: {col['name']}, Type: {col['type']}, Nullable: {col['nullable']}, Default: {col.get('default')}")
    
    print("\n--- hr_compliance PK ---")
    print(inspector.get_pk_constraint('hr_compliance'))
    
    print("\n--- hr_compliance FKs ---")
    for fk in inspector.get_foreign_keys('hr_compliance'):
        print(fk)
        
    print("\n--- hr_compliance Indexes / Constraints ---")
    for idx in inspector.get_indexes('hr_compliance'):
        print(idx)
        
    print("\n--- hr_compliance Unique Constraints ---")
    for uq in inspector.get_unique_constraints('hr_compliance'):
        print(uq)
else:
    print("hr_compliance table not found directly. Checking case-insensitive or similar tables:")
    for t in tables:
        if 'compliance' in t.lower() or 'hr' in t.lower():
            print(t)
