from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        result = conn.execute(text("SELECT id, name, designation, shift_timing FROM users ORDER BY id DESC LIMIT 5;"))
        rows = result.fetchall()
        print("Recent 5 Employees from Database:")
        print("-" * 60)
        print(f"{'ID':<5} | {'NAME':<20} | {'DESIGNATION':<15} | {'SHIFT TIMING':<15}")
        print("-" * 60)
        for row in rows:
            print(f"{row.id:<5} | {row.name:<20} | {str(row.designation):<15} | {str(row.shift_timing):<15}")
except Exception as e:
    print(f"Error checking database: {e}")
