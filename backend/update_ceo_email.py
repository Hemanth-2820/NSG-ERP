from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    # Update the email for the CEO account
    conn.execute(text("UPDATE users SET email='ceo@example.com' WHERE email='ceo@hnms.com'"))
    print("CEO email updated successfully to ceo@example.com!")
