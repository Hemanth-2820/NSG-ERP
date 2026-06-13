import sqlite3

conn = sqlite3.connect('backend/sql_app.db')
c = conn.cursor()

try:
    c.execute("ALTER TABLE chat_messages ADD COLUMN is_edited BOOLEAN DEFAULT 0")
except Exception as e:
    print(f"Error adding is_edited: {e}")

try:
    c.execute("ALTER TABLE chat_messages ADD COLUMN deleted_at DATETIME")
except Exception as e:
    print(f"Error adding deleted_at: {e}")

try:
    c.execute("ALTER TABLE chat_messages ADD COLUMN reactions TEXT")
except Exception as e:
    print(f"Error adding reactions: {e}")

try:
    c.execute("ALTER TABLE chat_messages ADD COLUMN seen_by TEXT")
except Exception as e:
    print(f"Error adding seen_by: {e}")

conn.commit()
conn.close()
print("Migration completed.")
