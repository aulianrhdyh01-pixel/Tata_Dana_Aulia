import sqlite3

db_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tatadana.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("--- WALLETS ---")
for w in c.execute("SELECT * FROM wallets").fetchall():
    print(dict(w))

print("\n--- CATEGORIES ---")
for cat in c.execute("SELECT * FROM categories").fetchall():
    print(dict(cat))

print("\n--- USERS ---")
for u in c.execute("SELECT * FROM users").fetchall():
    print(dict(u))

conn.close()
