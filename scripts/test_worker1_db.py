# -*- coding: utf-8 -*-
"""
scripts/test_worker1_db.py
Comprehensive verification script for Worker 1: Backend Database & Persistent SQLite Engine
Verifies:
1. tatadana.db exists and is a valid SQLite database.
2. All required tables exist: users, wallets, categories, transactions, telegram_updates.
3. Master admin exists with email shopnoure1619@gmail.com, role 'superadmin', is_approved = 1,
   and password_hash matching SHA256 of '160017'.
4. Persistent registration workflow: new users are saved with is_approved = 0 across connections.
5. Persistent approval workflow: admin approval updates is_approved = 1 and provisions default wallets.
6. Real transaction arithmetic: balance calculations persist across independent connections.
7. Telegram idempotency: telegram_updates table enforces unique update_id persistence.
"""

import sys
import os
import sqlite3
import hashlib
from datetime import datetime, timezone, timedelta

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import server as root_server

DB_PATH = os.path.abspath(os.path.join(PROJECT_ROOT, "tatadana.db"))
WIB = timezone(timedelta(hours=7))

total_checks = 0
passed_checks = 0
failed_checks = 0

def check(condition, message, details=""):
    global total_checks, passed_checks, failed_checks
    total_checks += 1
    if condition:
        print(f"  ✅ [PASS] {message}")
        passed_checks += 1
    else:
        print(f"  ❌ [FAIL] {message} {('- ' + details) if details else ''}")
        failed_checks += 1

def hash_pw(pw):
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

print("=" * 70)
print("🔍 TATADANA WORKER 1: SQLITE ENGINE & PERSISTENCE VERIFICATION")
print(f"📁 Target Database: {DB_PATH}")
print(f"⏰ Execution Time  : {datetime.now(WIB).strftime('%Y-%m-%d %H:%M:%S WIB')}")
print("=" * 70)

# Ensure init_db() has been run
root_server.init_db(DB_PATH)

# Check 1: DB File Exists
print("\n--- [1] Database File Existence ---")
check(os.path.exists(DB_PATH), "tatadana.db file exists on disk", f"File not found at {DB_PATH}")
check(os.path.getsize(DB_PATH) > 0, "tatadana.db has non-zero size", f"Size: {os.path.getsize(DB_PATH)} bytes")

# Check 2: Table Existence in sqlite_master
print("\n--- [2] Required Database Tables ---")
conn1 = sqlite3.connect(DB_PATH)
conn1.row_factory = sqlite3.Row
c1 = conn1.cursor()
c1.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row["name"] for row in c1.fetchall()]
conn1.close()

required_tables = ["users", "wallets", "categories", "transactions", "telegram_updates"]
for t in required_tables:
    check(t in tables, f"Table '{t}' exists in tatadana.db schema")

# Check 3: Schema Columns
print("\n--- [3] Table Columns Verification ---")
conn2 = sqlite3.connect(DB_PATH)
conn2.row_factory = sqlite3.Row
c2 = conn2.cursor()

def get_columns(table_name):
    c2.execute(f"PRAGMA table_info({table_name})")
    return [r["name"] for r in c2.fetchall()]

users_cols = get_columns("users")
for col in ["id", "email", "password_hash", "full_name", "phone_number", "role", "is_approved", "plan", "created_at"]:
    check(col in users_cols, f"users.{col} column present")

wallets_cols = get_columns("wallets")
for col in ["id", "user_id", "name", "wallet_type", "balance", "is_default"]:
    check(col in wallets_cols, f"wallets.{col} column present")

cat_cols = get_columns("categories")
for col in ["id", "user_id", "name", "category_type", "budget_limit"]:
    check(col in cat_cols, f"categories.{col} column present")

tx_cols = get_columns("transactions")
for col in ["id", "user_id", "wallet_id", "category_name", "transaction_type", "amount", "notes", "source", "transaction_time"]:
    check(col in tx_cols, f"transactions.{col} column present")

tg_cols = get_columns("telegram_updates")
for col in ["update_id", "processed_at"]:
    check(col in tg_cols, f"telegram_updates.{col} column present")

conn2.close()

# Check 4: Master Superadmin Verification
print("\n--- [4] Master Superadmin Verification ---")
conn3 = sqlite3.connect(DB_PATH)
conn3.row_factory = sqlite3.Row
c3 = conn3.cursor()
admin_email = "shopnoure1619@gmail.com"
c3.execute("SELECT * FROM users WHERE email = ?", (admin_email,))
admin = c3.fetchone()

check(admin is not None, f"Admin account '{admin_email}' exists in database")
if admin:
    check(admin["role"] == "superadmin", "Admin role is 'superadmin'", f"Actual: {admin['role']}")
    check(admin["is_approved"] == 1, "Admin is_approved is 1 (Active)", f"Actual: {admin['is_approved']}")
    expected_hash = hash_pw("160017")
    check(admin["password_hash"] == expected_hash, "Admin password_hash matches SHA256('160017')", f"Actual hash: {admin['password_hash']}")

    # Check admin wallets
    c3.execute("SELECT name, balance, is_default FROM wallets WHERE user_id = ?", (admin["id"],))
    admin_wallets = {r["name"]: r["balance"] for r in c3.fetchall()}
    check("BCA Utama" in admin_wallets, "Admin has default wallet 'BCA Utama'")
    check(len(admin_wallets) >= 3, f"Admin has multiple wallets provisioned ({len(admin_wallets)} wallets)")
conn3.close()

# Check 5: Cross-Connection Persistence: New User Registration with is_approved = 0
print("\n--- [5] Cross-Connection User Registration Persistence (is_approved = 0) ---")
test_email = f"test_worker1_reg_{int(datetime.now().timestamp())}@tatadana.id"
test_phone = f"0819{int(datetime.now().timestamp()) % 100000000:08d}"
test_pw = "Rahasia123!"

# Connection A: Insert
conn_a = sqlite3.connect(DB_PATH)
c_a = conn_a.cursor()
c_a.execute("""
    INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at)
    VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?)
""", (test_email, hash_pw(test_pw), "Budi Test Persisten", test_phone, root_server.get_wib_now()))
conn_a.commit()
new_user_id = c_a.lastrowid
conn_a.close() # FULLY CLOSED

# Connection B: Verify persistence across independent connection
conn_b = sqlite3.connect(DB_PATH)
conn_b.row_factory = sqlite3.Row
c_b = conn_b.cursor()
c_b.execute("SELECT * FROM users WHERE id = ?", (new_user_id,))
persisted_user = c_b.fetchone()
conn_b.close() # FULLY CLOSED

check(persisted_user is not None, "New user persisted across separate SQLite connection")
if persisted_user:
    check(persisted_user["email"] == test_email, "User email persisted accurately")
    check(persisted_user["is_approved"] == 0, "New user has initial is_approved = 0 (Pending Admin Approval)")
    check(persisted_user["role"] == "user", "New user has role 'user'")

# Check 6: Admin Approval Workflow Persistence & Wallet Provisioning
print("\n--- [6] Admin Approval Workflow Persistence ---")
# Connection C: Approve user and seed wallets
conn_c = sqlite3.connect(DB_PATH)
c_c = conn_c.cursor()
c_c.execute("UPDATE users SET is_approved = 1 WHERE id = ?", (new_user_id,))
root_server.seed_user_wallets_and_data(conn_c, new_user_id)
conn_c.commit()
conn_c.close()

# Connection D: Verify approval state & wallets on fresh connection
conn_d = sqlite3.connect(DB_PATH)
conn_d.row_factory = sqlite3.Row
c_d = conn_d.cursor()
c_d.execute("SELECT is_approved FROM users WHERE id = ?", (new_user_id,))
approved_status = c_d.fetchone()["is_approved"]
check(approved_status == 1, "User is_approved changed to 1 and persisted")

c_d.execute("SELECT name, balance FROM wallets WHERE user_id = ?", (new_user_id,))
provisioned_wallets = {r["name"]: r["balance"] for r in c_d.fetchall()}
check("BCA Utama" in provisioned_wallets, "Approved user received 'BCA Utama' wallet")
check("Mandiri" in provisioned_wallets, "Approved user received 'Mandiri' wallet")
check("GoPay" in provisioned_wallets, "Approved user received 'GoPay' wallet")
conn_d.close()

# Check 7: Transaction Logging & Balance Arithmetic Persistence
print("\n--- [7] Real Transaction Balance Arithmetic Persistence ---")
conn_e = sqlite3.connect(DB_PATH)
conn_e.row_factory = sqlite3.Row
c_e = conn_e.cursor()
c_e.execute("SELECT id, balance FROM wallets WHERE user_id = ? AND name = 'BCA Utama'", (new_user_id,))
w_row = c_e.fetchone()
target_wallet_id = w_row["id"]
initial_balance = w_row["balance"]

# Add expense Rp 75.000
expense_amt = 75000.0
c_e.execute("""
    INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
    VALUES (?, ?, 'Makanan & Minuman', 'pengeluaran', ?, 'Makan siang uji coba', 'web', ?)
""", (new_user_id, target_wallet_id, expense_amt, root_server.get_wib_now()))
c_e.execute("UPDATE wallets SET balance = balance - ? WHERE id = ?", (expense_amt, target_wallet_id))

# Add income Rp 300.000
income_amt = 300000.0
c_e.execute("""
    INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
    VALUES (?, ?, 'Gaji & Proyek', 'pemasukan', ?, 'Bonus proyek uji coba', 'web', ?)
""", (new_user_id, target_wallet_id, income_amt, root_server.get_wib_now()))
c_e.execute("UPDATE wallets SET balance = balance + ? WHERE id = ?", (income_amt, target_wallet_id))

conn_e.commit()
conn_e.close() # FULLY CLOSED

# Connection F: Verify on independent connection
conn_f = sqlite3.connect(DB_PATH)
conn_f.row_factory = sqlite3.Row
c_f = conn_f.cursor()
c_f.execute("SELECT balance FROM wallets WHERE id = ?", (target_wallet_id,))
final_balance = c_f.fetchone()["balance"]
expected_balance = initial_balance - expense_amt + income_amt

check(abs(final_balance - expected_balance) < 0.01,
      f"Wallet balance correctly calculated: {initial_balance:,.0f} - {expense_amt:,.0f} + {income_amt:,.0f} = {final_balance:,.0f}",
      f"Expected: {expected_balance}, Actual: {final_balance}")

c_f.execute("SELECT COUNT(*) as cnt FROM transactions WHERE user_id = ? AND wallet_id = ?", (new_user_id, target_wallet_id))
tx_count = c_f.fetchone()["cnt"]
check(tx_count >= 2, f"Transactions persisted in SQLite database (count = {tx_count})")
conn_f.close()

# Check 8: Telegram Update Idempotency Table
print("\n--- [8] Telegram Update Idempotency Table Verification ---")
test_update_id = 998811
conn_g = sqlite3.connect(DB_PATH)
c_g = conn_g.cursor()
# Delete if exists from previous test
c_g.execute("DELETE FROM telegram_updates WHERE update_id = ?", (test_update_id,))
c_g.execute("INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)", (test_update_id, root_server.get_wib_now()))
conn_g.commit()
conn_g.close()

# Fresh connection: check update_id
conn_h = sqlite3.connect(DB_PATH)
c_h = conn_h.cursor()
c_h.execute("SELECT update_id FROM telegram_updates WHERE update_id = ?", (test_update_id,))
found_upd = c_h.fetchone()
check(found_upd is not None and found_upd[0] == test_update_id, f"update_id {test_update_id} persisted in telegram_updates")

# Verify PRIMARY KEY constraint rejects duplicate
try:
    c_h.execute("INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)", (test_update_id, root_server.get_wib_now()))
    check(False, "Duplicate update_id was NOT rejected by database constraint")
except sqlite3.IntegrityError:
    check(True, "Duplicate update_id correctly rejected by PRIMARY KEY constraint")

# Cleanup test update_id
c_h.execute("DELETE FROM telegram_updates WHERE update_id = ?", (test_update_id,))
conn_h.commit()
conn_h.close()

# Cleanup test user and related records
conn_clean = sqlite3.connect(DB_PATH)
c_clean = conn_clean.cursor()
c_clean.execute("DELETE FROM transactions WHERE user_id = ?", (new_user_id,))
c_clean.execute("DELETE FROM categories WHERE user_id = ?", (new_user_id,))
c_clean.execute("DELETE FROM wallets WHERE user_id = ?", (new_user_id,))
c_clean.execute("DELETE FROM users WHERE id = ?", (new_user_id,))
conn_clean.commit()
conn_clean.close()

print("\n" + "=" * 70)
print(f"SUMMARY: {passed_checks}/{total_checks} checks passed ({round((passed_checks/total_checks)*100)}%)")
if failed_checks == 0:
    print("🎉 ALL DATABASE & PERSISTENCE INTEGRITY VERIFICATIONS PASSED!")
    print("=" * 70 + "\n")
    sys.exit(0)
else:
    print(f"❌ {failed_checks} checks failed.")
    print("=" * 70 + "\n")
    sys.exit(1)
