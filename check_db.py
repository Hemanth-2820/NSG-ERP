import json
import sqlite3

try:
    conn = sqlite3.connect('backend/nsg_erp.db')
    c = conn.cursor()
    c.execute("SELECT id, type, name FROM chat_channels")
    channels = c.fetchall()
    print("Channels:")
    for ch in channels:
        print(ch)
        
    c.execute("SELECT id, channel_id, sender, text FROM chat_messages ORDER BY id DESC LIMIT 20")
    msgs = c.fetchall()
    print("\nMessages:")
    for m in msgs:
        print(m)
except Exception as e:
    print("Error:", e)
