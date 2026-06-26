import sys
import os

# add backend folder to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import Payslip

db = SessionLocal()
payslips = db.query(Payslip).filter(Payslip.month == 5, Payslip.year == 2026).all()
for p in payslips:
    db.delete(p)
db.commit()
print(f"Deleted {len(payslips)} payslips from postgres db")
db.close()
