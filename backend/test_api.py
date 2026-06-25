import os
import sys
import json
import traceback

sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User
from app.routers.hr_portal import update_employee, EmployeeUpdateRequest

db = SessionLocal()
try:
    ceo = db.query(User).filter(User.role == "ceo").first()
    emp = db.query(User).filter(User.role == "employee").first()
    if not emp:
        print("No employee found")
        sys.exit(0)
    
    req = EmployeeUpdateRequest(status="Resigned")
    print(f"Updating employee {emp.id} by {ceo.email} with {req}")
    update_employee(emp.id, req, current_user=ceo, db=db)
    print("Success!")
except Exception as e:
    print("FAILED")
    traceback.print_exc()
finally:
    db.close()
