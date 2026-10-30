import sqlite3

db_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tatadana.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()
for col in c.execute("PRAGMA table_info(users)").fetchall():
    print(col)
conn.close()
