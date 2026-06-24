from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("UPDATE users SET hashed_password='$2b$12$Vpkc3WE2oeiu3lzqsw8LsuYZHwT7iuG635/2nEQTlB8j05n0I3PY6' WHERE email='ceo@hnms.com'"))
print("Updated Supabase password")
