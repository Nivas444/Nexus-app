import sys
import os

# Set path to backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.expense import CompanyExpense

def view_expenses():
    db = SessionLocal()
    try:
        records = db.query(CompanyExpense).order_by(CompanyExpense.expense_id.desc()).all()
        
        print("\n" + "=" * 115)
        print(f"  POSTGRESQL DATABASE: Table 'company_expenses' (Total Rows: {len(records)})")
        print("=" * 115)
        
        if not records:
            print("  (Table is currently empty)")
            print("=" * 115 + "\n")
            return
            
        header = f"{'ID':<6} | {'Expense Name':<35} | {'Category':<20} | {'Head':<8} | {'GST':<6} | {'Deprec':<8} | {'RCM':<5} | {'Status':<10}"
        print(header)
        print("-" * 115)
        
        for r in records:
            deprec_str = "Yes" if r.depreciation else "No"
            rcm_str = "Yes" if r.rcm else "No"
            gst_str = f"{r.gst_rate}%" if r.gst_rate is not None else "-"
            row_str = f"{r.expense_id:<6} | {r.expense_name[:33]:<35} | {r.expense_category[:18]:<20} | {r.expense_head:<8} | {gst_str:<6} | {deprec_str:<8} | {rcm_str:<5} | {r.status:<10}"
            print(row_str)
            
        print("=" * 115 + "\n")
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_expenses()
