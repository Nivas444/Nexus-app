import sys
sys.path.append('backend')
from app.db.session import engine
from sqlalchemy import inspect

insp = inspect(engine)

for t in ['employee_bank_details', 'employee_assets_details', 'employee_salary_details', 'company_employee_documents']:
    print(f"\n==========================================")
    print(f"Table: {t}")
    print(f"==========================================")
    if t in insp.get_table_names():
        for c in insp.get_columns(t):
            print(f"  Column: {c['name']:<35} Type: {str(c['type']):<20} Nullable: {c['nullable']}")
        print("  Primary Key:", insp.get_pk_constraint(t))
        print("  Foreign Keys:", insp.get_foreign_keys(t))
    else:
        print("  TABLE NOT FOUND IN DB!")
