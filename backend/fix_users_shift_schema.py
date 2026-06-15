from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN shift_timing VARCHAR;"))
    print("User schema fixed successfully!")
except Exception as e:
    print(f"Error: {e}")
