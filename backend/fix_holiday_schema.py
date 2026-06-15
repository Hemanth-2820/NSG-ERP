from app.database import engine
from app.models import Base, Holiday

def fix_holiday_schema():
    print("Creating Holiday table...")
    Holiday.__table__.create(engine, checkfirst=True)
    print("Holiday table created successfully.")

if __name__ == "__main__":
    fix_holiday_schema()
