import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.begin() as conn:
    conn.execute(text('ALTER TABLE global_templates ADD COLUMN IF NOT EXISTS file_data BYTEA;'))
print("Done")
