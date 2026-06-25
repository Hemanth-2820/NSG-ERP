import os
import sys
from datetime import date

sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app import models
    from app.database import engine, SessionLocal
    from app.core import security

    # 1. Create tables automatically!
    print("Creating tables in the new database...")
    models.Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    # 2. Add CEO user
    session = SessionLocal()
    
    # Check if any user has emp_id NSG-001
    existing_ceo = session.query(models.User).filter(models.User.emp_id == "NSG-001").first()
    
    if existing_ceo:
        print("Updating existing CEO credentials...")
        existing_ceo.name = "Admin CEO"
        existing_ceo.email = "admin@example.com"
        existing_ceo.plain_password = "admin123"
        existing_ceo.hashed_password = security.hash_password("admin123")
        session.commit()
        print("CEO User updated successfully! (Email: admin@example.com, Password: admin123)")
    else:
        print("Creating CEO credentials...")
        new_ceo = models.User(
            name="Admin CEO",
            email="admin@example.com",
            department="Management",
            designation="Chief Executive Officer",
            role="ceo",
            join_date=date.today(),
            status="active",
            hashed_password=security.hash_password("admin123"), # Default password
            plain_password="admin123", # Required by current schema logic
            emp_id="NSG-001"
        )
        session.add(new_ceo)
        session.commit()
        print("CEO User created successfully! (Email: admin@example.com, Password: admin123)")
        
    session.close()

except Exception as e:
    print(f"Error: {e}")
