from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;"))
        conn.execute(text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS headcount INTEGER DEFAULT 0;"))
        
        try:
            conn.execute(text("ALTER TABLE designations RENAME COLUMN title TO name;"))
        except Exception:
            pass
            
        conn.execute(text("ALTER TABLE designations ADD COLUMN IF NOT EXISTS name VARCHAR;"))
        conn.execute(text("ALTER TABLE designations ADD COLUMN IF NOT EXISTS level VARCHAR;"))
        
        try:
            conn.execute(text("ALTER TABLE designations ADD CONSTRAINT designations_name_key UNIQUE (name);"))
        except Exception:
            pass

    print("Schema fixed successfully!")
except Exception as e:
    print(f"Error: {e}")
