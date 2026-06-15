import sqlite3
conn = sqlite3.connect('nsg_erp.db')
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE name='announcements';")
print('announcements table:', cursor.fetchone())
cursor.execute("SELECT sql FROM sqlite_master WHERE name='announcement_reads';")
print('announcement_reads table:', cursor.fetchone())
cursor.execute("SELECT * FROM announcements;")
rows = cursor.fetchall()
print(f'Existing announcements: {len(rows)}')
for r in rows:
    print(r)
conn.close()
