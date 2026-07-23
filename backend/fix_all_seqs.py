from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Get all tables
    tables = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")).fetchall()
    tables = [t[0] for t in tables]
    
    for table in tables:
        seq_name = f"{table}_id_seq"
        try:
            # Check if sequence exists and fix
            db.execute(text(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX(id)+1 FROM {table}), 1), false);"))
            print(f"Fixed sequence for {table}")
        except Exception as e:
            # Many tables won't have sequences named exactly this way or no sequence at all, which is fine
            db.rollback()
    
    db.commit()
finally:
    db.close()
