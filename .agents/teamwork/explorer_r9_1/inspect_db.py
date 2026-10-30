import sqlite3

db_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tatadana.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print('Tables:', tables)

for t in tables:
    cnt = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    print(f"Table {t}: {cnt} rows")

print("\nUsers detail:")
for row in c.execute("SELECT id, email, full_name, role, is_approved, plan, password_hash FROM users").fetchall():
    print(row)

print("\nTransactions detail:")
for row in c.execute("SELECT * FROM transactions LIMIT 10").fetchall():
    print(row)

print("\nWallets detail:")
for row in c.execute("SELECT * FROM wallets LIMIT 10").fetchall():
    print(row)

conn.close()
