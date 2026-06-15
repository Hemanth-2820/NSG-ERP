from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE shifts ADD COLUMN IF NOT EXISTS days VARCHAR;"))
    print("Shift schema fixed successfully!")
except Exception as e:
    print(f"Error: {e}")
