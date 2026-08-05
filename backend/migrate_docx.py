from app.database import engine
from app.models import Base

# Create new tables
Base.metadata.create_all(bind=engine)
print("DocxTemplate table created successfully (if it didn't exist).")
