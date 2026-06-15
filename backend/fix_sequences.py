from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    tables_and_seqs = {
        'users': 'users_id_seq',
        'audit_logs': 'audit_logs_id_seq',
        'employees': 'employees_id_seq',
        'system_settings': 'system_settings_id_seq'
    }
    
    for table, seq in tables_and_seqs.items():
        try:
            db.execute(text(f"SELECT setval('{seq}', COALESCE((SELECT MAX(id)+1 FROM {table}), 1), false);"))
            print(f"Reset sequence for {table}")
        except Exception as e:
            print(f"Failed for {table}: {e}")
            db.rollback()
    db.commit()
finally:
    db.close()
