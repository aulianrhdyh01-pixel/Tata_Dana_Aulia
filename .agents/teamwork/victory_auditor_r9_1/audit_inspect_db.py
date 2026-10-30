import sqlite3
import json

db_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tatadana.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

tables = [t['name'] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print(f"=== DATABASE TABLES ({len(tables)}) ===")
print(tables)

print("\n=== TABLE ROW COUNTS ===")
for t in tables:
    count = c.execute(f"SELECT COUNT(*) FROM [{t}]").fetchone()[0]
    print(f"  {t}: {count}")

cols = [r['name'] for r in c.execute("PRAGMA table_info(users)").fetchall()]
print(f"\n=== USERS TABLE COLUMNS ===")
print(cols)

users = [dict(r) for r in c.execute("SELECT * FROM users").fetchall()]
print(f"\n=== USERS ({len(users)}) ===")
for u in users:
    print(f"  ID={u.get('id')}, Email={u.get('email')}, Role={u.get('role')}, Status={u.get('status')}, is_approved={u.get('is_approved')}, Plan={u.get('plan')}")

wallets = c.execute("SELECT COUNT(*) FROM wallets").fetchone()[0]
txs = c.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
cats = c.execute("SELECT COUNT(*) FROM categories").fetchone()[0]

print("\n=== ZERO-MOCK BASELINE CHECK ===")
print(f"Wallets count: {wallets} (Expected: 0)")
print(f"Transactions count: {txs} (Expected: 0)")
print(f"Categories count: {cats} (Expected: 0)")
print(f"Total Users: {len(users)} (Expected: 1 superadmin)")

if len(users) == 1 and users[0].get('email') == 'akunadminaul16@gmail.com' and users[0].get('role') == 'admin' and users[0].get('status') == 'active' and users[0].get('is_approved') == 1 and wallets == 0 and txs == 0:
    print("\n>>> ZERO-MOCK DB BASELINE: VERIFIED CLEAN <<<")
else:
    print("\n>>> ZERO-MOCK DB BASELINE: FAILED <<<")

conn.close()
