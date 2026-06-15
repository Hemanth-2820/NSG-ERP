"""
One-time script to create announcements and announcement_reads tables.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'nsg_erp.db')

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create announcements table
cursor.execute("""
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR NOT NULL,
    body TEXT NOT NULL,
    priority VARCHAR DEFAULT 'Normal',
    audience VARCHAR DEFAULT 'All Portals',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR DEFAULT 'CEO Office',
    read_count INTEGER DEFAULT 0,
    read_pct FLOAT DEFAULT 0.0
);
""")

# Create announcement_reads table
cursor.execute("""
CREATE TABLE IF NOT EXISTS announcement_reads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()

# Verify tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('announcements', 'announcement_reads');")
tables = cursor.fetchall()
print(f"Tables created: {[t[0] for t in tables]}")

# Verify schema
cursor.execute("PRAGMA table_info(announcements);")
cols = cursor.fetchall()
print(f"announcements columns: {[c[1] for c in cols]}")

cursor.execute("PRAGMA table_info(announcement_reads);")
cols = cursor.fetchall()
print(f"announcement_reads columns: {[c[1] for c in cols]}")

conn.close()
print("Done! Tables are ready.")
