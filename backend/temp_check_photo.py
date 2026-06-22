from sqlalchemy import create_engine, text
engine = create_engine('postgresql://postgres.orameusjachckqygskce:Hemanth%402820@aws-1-ap-south-1.pooler.supabase.com:6543/postgres')
with engine.connect() as conn:
    # Reset the corrupted test photo for Ch Haswanth
    conn.execute(text("UPDATE users SET photo = NULL WHERE name = 'Ch Haswanth'"))
    conn.commit()
    print("Reset Ch Haswanth photo to NULL")
    
    # Check prasad user
    res = conn.execute(text("SELECT id, name, email, role, photo FROM users WHERE name LIKE '%prasad%' OR name LIKE '%Prasad%'"))
    for row in res:
        print(f"User {row[0]}: name={row[1]}, email={row[2]}, role={row[3]}, photo={row[4]}")
