from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    tables_and_seqs = {
        'chat_messages': 'chat_messages_id_seq'
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
