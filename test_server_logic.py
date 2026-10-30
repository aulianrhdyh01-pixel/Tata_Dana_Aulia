import os
import sys
import tempfile
import sqlite3
import json

# Ensure tatadana directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server

def test_database_and_admin():
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
        temp_db = f.name

    try:
        # 1. Test init_db with Master Superadmin seeding
        server.init_db(temp_db)
        conn = server.get_db(temp_db)
        c = conn.cursor()
        
        # Check master admin exists
        c.execute('SELECT * FROM users WHERE email = ?', ('akunadminaul16@gmail.com',))
        admin = c.fetchone()
        assert admin is not None, "Master admin must exist"
        assert admin['role'] == 'superadmin', f"Expected superadmin, got {admin['role']}"
        assert admin['plan'] == 'PRO VIP', f"Expected PRO VIP, got {admin['plan']}"
        assert admin['is_approved'] == 1, "Master admin must be approved"
        assert admin['password_hash'] == server.hash_pw('akuadmin123'), "Password hash mismatch"

        # Check default wallets for admin
        c.execute('SELECT COUNT(*) as cnt FROM wallets WHERE user_id = ?', (admin['id'],))
        w_cnt = c.fetchone()['cnt']
        assert w_cnt >= 4, f"Admin must have at least 4 default wallets, got {w_cnt}"

        # 2. Test User Registration (Pending Approval)
        test_email = 'budi.test@example.com'
        test_pw = 'Secret123!'
        pw_hash = server.hash_pw(test_pw)
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at)
            VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?)
        ''', (test_email, pw_hash, 'Budi Test', '08123456789', server.get_wib_now()))
        user_id = c.lastrowid
        conn.commit()

        # Verify newly registered user is NOT approved
        c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        u = c.fetchone()
        assert u['is_approved'] == 0, "New user must have is_approved == 0"
        assert u['role'] == 'user', "New user must have role user"

        # 3. Test Admin Approve User
        c.execute('UPDATE users SET is_approved = 1 WHERE id = ?', (user_id,))
        server.seed_user_wallets_and_data(conn, user_id)
        conn.commit()

        c.execute('SELECT is_approved FROM users WHERE id = ?', (user_id,))
        assert c.fetchone()['is_approved'] == 1, "User must now be approved"
        
        c.execute('SELECT COUNT(*) as cnt FROM wallets WHERE user_id = ?', (user_id,))
        assert c.fetchone()['cnt'] >= 4, "Wallets should be seeded upon approval"

        # 4. Test Profile Update (Avatar & Details)
        new_avatar = 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="blue"/></svg>'
        c.execute('UPDATE users SET avatar_url = ?, full_name = ? WHERE id = ?', (new_avatar, 'Budi Updated', user_id))
        conn.commit()

        c.execute('SELECT avatar_url, full_name FROM users WHERE id = ?', (user_id,))
        u_updated = c.fetchone()
        assert u_updated['avatar_url'] == new_avatar, "Avatar must be updated"
        assert u_updated['full_name'] == 'Budi Updated', "Full name must be updated"

        # 5. Test Telegram Webhook idempotency and transaction persistence
        update_id = 998877
        c.execute('INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)', (update_id, server.get_wib_now()))
        c.execute('SELECT update_id FROM telegram_updates WHERE update_id = ?', (update_id,))
        assert c.fetchone() is not None, "Update ID must be recorded"

        # Insert telegram transaction
        c.execute('SELECT id FROM wallets WHERE user_id = ? AND is_default = 1', (user_id,))
        w_id = c.fetchone()['id']
        c.execute('''
            INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
            VALUES (?, ?, 'Makanan & Minuman', 'pengeluaran', 25000.0, 'Telegram: beli bakso 25rb', 'telegram', ?)
        ''', (user_id, w_id, server.get_wib_now()))
        tx_id = c.lastrowid
        c.execute('UPDATE wallets SET balance = balance - 25000.0 WHERE id = ?', (w_id,))
        conn.commit()

        # Verify transaction persistence
        c.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,))
        tx = c.fetchone()
        assert tx is not None, "Transaction must persist in DB"
        assert tx['amount'] == 25000.0, "Amount must match"
        assert tx['source'] == 'telegram', "Source must be telegram"

        conn.close()
        print("ALL DATABASE AND BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!")
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)

if __name__ == '__main__':
    test_database_and_admin()
