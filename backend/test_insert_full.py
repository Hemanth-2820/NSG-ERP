from app.database import engine, SessionLocal
from app import models
from datetime import date
import json

db = SessionLocal()
try:
    initial_docs = []
    db_emp = models.User(
        name="Test2",
        email="test_insert_error_124@hnms.com",
        hashed_password="hash",
        role="employee",
        emp_id="NSG-09998",
    )
    db.add(db_emp)
    db.flush()
    
    db_progress = models.TrainingProgress(
        employee_id=db_emp.id,
        track_id=1,
        completed_modules=0,
        quiz_score=0.0,
        passed=False
    )
    db.add(db_progress)
    db.commit()
    print("Full insert successful")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
