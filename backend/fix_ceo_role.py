from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("UPDATE users SET role='ceo' WHERE email='ceo@hnms.com'"))
    print("CEO role updated to lowercase 'ceo'!")
