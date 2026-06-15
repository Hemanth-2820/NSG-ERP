from app.database import engine, SessionLocal
from app import models
from datetime import date
import json

db = SessionLocal()
try:
    initial_docs = []
    db_emp = models.User(
        name="Test",
        email="test_insert_error_123@hnms.com",
        hashed_password="hash",
        role="employee",
        department="Engineering",
        designation="Developer",
        status="probation",
        emp_id="NSG-09999",
        join_date=date.today(),
        probation_end_date=date.today(),
        bank_name=None,
        account_number=None,
        ifsc_code=None,
        grade=3,
        manager="John Doe",
        manager_id=None,
        photo="none",
        documents=json.dumps(initial_docs),
        shift_timing="Morning Shift"
    )
    db.add(db_emp)
    db.flush()
    print("User inserted successfully.")
    db.rollback()
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
