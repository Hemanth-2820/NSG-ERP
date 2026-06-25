from sqlalchemy import create_engine, text

db_url = "postgresql+psycopg2://postgres:Hemanth%402820@db.orameusjachckqygskce.supabase.co:5432/postgres?sslmode=require"
engine = create_engine(db_url, connect_args={"connect_timeout": 10})
try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1")).scalar()
        print("DB OK (Direct Connection):", res)
except Exception as e:
    print("DB ERROR (Direct Connection):", e)
