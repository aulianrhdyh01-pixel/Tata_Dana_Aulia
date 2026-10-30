#!/usr/bin/env python3
"""
reset_production_db.py
Clean Production Database Reset Script for TataDana.
- Ensures tatadana.db has clean state:
  * 0 regular users
  * 0 pending applicants
  * 0 dummy transactions
  * 0 dummy wallets (or clean state)
  * Exactly 1 superadmin: akunadminaul16@gmail.com (role: 'admin', is_approved: 1, status: 'active', plan: 'PRO VIP')
"""
import os
import sqlite3
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tatadana.db')

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

def reset_db():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Ensure table schemas and columns exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone_number TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user',
            is_approved INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            plan TEXT DEFAULT 'pro',
            created_at TEXT NOT NULL,
            avatar_url TEXT DEFAULT '',
            telegram_user_id TEXT DEFAULT '',
            telegram_chat_id TEXT DEFAULT '',
            telegram_pairing_code TEXT DEFAULT '',
            otp_code TEXT DEFAULT ''
        )
    ''')
    try:
        c.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN telegram_user_id TEXT DEFAULT ''")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN telegram_chat_id TEXT DEFAULT ''")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN telegram_pairing_code TEXT DEFAULT ''")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN otp_code TEXT DEFAULT ''")
    except Exception:
        pass

    c.execute('''
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            wallet_type TEXT DEFAULT 'bank',
            balance REAL DEFAULT 0.0,
            is_default INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            category_type TEXT NOT NULL,
            budget_limit REAL DEFAULT 0.0
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            wallet_id INTEGER NOT NULL,
            category_name TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            amount REAL NOT NULL,
            notes TEXT,
            source TEXT DEFAULT 'web',
            transaction_time TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (wallet_id) REFERENCES wallets (id)
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS telegram_updates (
            update_id INTEGER PRIMARY KEY,
            processed_at TEXT NOT NULL
        )
    ''')

    # 2. Clean all dummy transactions, wallets, telegram updates
    print("Clearing transactions, wallets, telegram_updates...")
    c.execute("DELETE FROM transactions")
    c.execute("DELETE FROM wallets")
    c.execute("DELETE FROM telegram_updates")
    c.execute("DELETE FROM categories")

    # 3. Clean all regular and pending users, keeping ONLY superadmin
    admin_email = 'akunadminaul16@gmail.com'
    admin_pw_hash = hash_pw('akuadmin123')
    expected_hash = "2413701f499af5a38c8842e20064cfb83808ba82812ffa513c692b4186003a8f"
    assert admin_pw_hash == expected_hash, f"Hash mismatch: {admin_pw_hash} != {expected_hash}"

    print(f"Deleting all users except {admin_email}...")
    c.execute("DELETE FROM users WHERE email != ?", (admin_email,))

    c.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    existing_admin = c.fetchone()

    if existing_admin:
        c.execute('''
            UPDATE users 
            SET password_hash = ?, 
                role = 'admin', 
                is_approved = 1, 
                status = 'active', 
                plan = 'PRO VIP', 
                full_name = 'Superadmin TataDana', 
                phone_number = '082115624408' 
            WHERE email = ?
        ''', (admin_pw_hash, admin_email))
        admin_id = existing_admin['id']
    else:
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at, avatar_url)
            VALUES (?, ?, 'Superadmin TataDana', '082115624408', 'admin', 1, 'active', 'PRO VIP', datetime('now'), '')
        ''', (admin_email, admin_pw_hash))
        admin_id = c.lastrowid

    # Commit all changes
    conn.commit()

    # 4. Verify clean state
    c.execute("SELECT COUNT(*) FROM users")
    total_users = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM users WHERE is_approved = 0")
    pending_users = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM transactions")
    total_tx = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM wallets")
    total_wallets = c.fetchone()[0]

    c.execute("SELECT email, role, is_approved, status, plan, password_hash FROM users WHERE email = ?", (admin_email,))
    admin_row = c.fetchone()

    conn.close()

    print("\n--- Production Database Verification Summary ---")
    print(f"Total Users: {total_users} (Expected: 1)")
    print(f"Pending Users: {pending_users} (Expected: 0)")
    print(f"Total Transactions: {total_tx} (Expected: 0)")
    print(f"Total Wallets: {total_wallets} (Expected: 0)")
    print(f"Admin Email: {admin_row['email']}")
    print(f"Admin Role: {admin_row['role']} (Expected: 'admin')")
    print(f"Admin is_approved: {admin_row['is_approved']} (Expected: 1)")
    print(f"Admin Status: {admin_row['status']} (Expected: 'active')")
    print(f"Admin Plan: {admin_row['plan']} (Expected: 'PRO VIP')")
    print(f"Admin Hash Valid: {admin_row['password_hash'] == expected_hash}")

    assert total_users == 1, f"Expected 1 user, found {total_users}"
    assert pending_users == 0, f"Expected 0 pending, found {pending_users}"
    assert total_tx == 0, f"Expected 0 transactions, found {total_tx}"
    assert admin_row['role'] == 'admin', f"Expected role 'admin', found {admin_row['role']}"
    assert admin_row['is_approved'] == 1, f"Expected is_approved 1, found {admin_row['is_approved']}"
    assert admin_row['status'] == 'active', f"Expected status 'active', found {admin_row['status']}"

    print("\n[SUCCESS] Production Database Reset Completed Cleanly!\n")

if __name__ == '__main__':
    reset_db()
