import sqlite3
from app.database import engine
from sqlalchemy import text

# Read from sqlite
conn = sqlite3.connect('sql_app.db')
c = conn.cursor()
c.execute("SELECT name, email, hashed_password, role, department, designation, phone, emp_id, created_at FROM users WHERE email='ceo@hnms.com'")
user = c.fetchone()
conn.close()

if user:
    print(f"Found CEO in sqlite: {user}")
    # Insert into PostgreSQL
    with engine.begin() as pg_conn:
        try:
            pg_conn.execute(text("""
                INSERT INTO users (name, email, hashed_password, role, department, designation, phone, emp_id, created_at) 
                VALUES (:name, :email, :hashed_password, :role, :department, :designation, :phone, :emp_id, :created_at)
            """), {"name": user[0], "email": user[1], "hashed_password": user[2], "role": user[3], "department": user[4], "designation": user[5], "phone": user[6], "emp_id": user[7], "created_at": user[8]})
            print("Successfully inserted CEO into PostgreSQL.")
        except Exception as e:
            print(f"Failed to insert (maybe already exists): {e}")
else:
    print("CEO not found in SQLite.")
