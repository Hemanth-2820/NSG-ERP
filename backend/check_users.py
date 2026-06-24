from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    res = conn.execute(text("SELECT email, role FROM users")).fetchall()
    print(res)
