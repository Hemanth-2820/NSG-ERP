from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    # First delete any existing user just in case
    conn.execute(text("DELETE FROM users WHERE email='ceo@hnms.com'"))
    
    # Insert new CEO user
    conn.execute(text("""
        INSERT INTO users (name, email, hashed_password, role, department, designation, phone, emp_id, created_at)
        VALUES (
            'CEO User',
            'ceo@hnms.com',
            '$2b$12$Vpkc3WE2oeiu3lzqsw8LsuYZHwT7iuG635/2nEQTlB8j05n0I3PY6',
            'CEO',
            'Management',
            'Chief Executive Officer',
            '1234567890',
            'CEO001',
            CURRENT_TIMESTAMP
        )
    """))
    print("CEO user successfully created in Supabase database!")
