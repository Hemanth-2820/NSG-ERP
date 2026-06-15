import sqlite3

def test():
    conn = sqlite3.connect('nsgerp.db')
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='announcement_reads'")
    print("announcement_reads schema:")
    print(cursor.fetchone()[0])
    
    cursor.execute("SELECT sql FROM sqlite_master WHERE sql LIKE '%REFERENCES announcements%'")
    rows = cursor.fetchall()
    print("Tables with FK to announcements:")
    for r in rows:
        print(r[0])

if __name__ == "__main__":
    test()
