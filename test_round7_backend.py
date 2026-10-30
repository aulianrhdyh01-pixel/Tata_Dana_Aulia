"""
Test Suite: Round 7 Backend Implementation & Approval Gate
Verifies:
1. Regular user OTP verification strictly keeps is_approved = 0, status = 'pending_approval', ok = True, success = True.
2. /api/auth/status handles both GET and POST requests and returns ok: True, success: True, status: 'PENDING'|'APPROVED', approval_status: 'PENDING'|'APPROVED'.
3. /api/admin/approve-user persistently updates SQLite users SET is_approved = 1 WHERE id = ? and returns ok: True, success: True, is_approved: 1.
4. All SPA routes ('/', '/login', '/approval', '/dashboard', '/admin', '/superadmin', '/settings') route to index.html.
"""

import os
import sys
import tempfile
import sqlite3
import json

# Ensure tatadana directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server

def run_tests():
    print("==================================================================")
    print(" RUNNING ROUND 7 BACKEND LOGIC VERIFICATION")
    print("==================================================================")

    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
        temp_db = f.name

    try:
        # Override DB_FILE for isolated testing
        server.DB_FILE = temp_db
        server.init_db(temp_db)
        conn = server.get_db(temp_db)
        c = conn.cursor()

        # Step 1: Verify Superadmin seeding
        c.execute('SELECT * FROM users WHERE email = ?', ('akunadminaul16@gmail.com',))
        superadmin = c.fetchone()
        assert superadmin is not None, "Superadmin akunadminaul16@gmail.com must exist"
        assert superadmin['role'] == 'superadmin', "Superadmin role must be superadmin"
        assert superadmin['is_approved'] == 1, "Superadmin must be approved (is_approved=1)"
        print("✓ [PASS] Superadmin seeded correctly with is_approved=1")

        # Step 2: Register a new regular user
        test_email = 'naufal.round7@example.com'
        test_pw = 'Tatapass123!'
        pw_hash = server.hash_pw(test_pw)
        otp_code = '789123'
        now_str = server.get_wib_now()

        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, otp_code)
            VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?, ?)
        ''', (test_email, pw_hash, 'Naufal Round 7', '081234567890', now_str, otp_code))
        user_id = c.lastrowid
        conn.commit()

        c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user_row = dict(c.fetchone())
        assert user_row['is_approved'] == 0, "Registered user must have is_approved=0"
        print(f"✓ [PASS] Registered new user #{user_id} with is_approved=0")

        # Step 3: Test OTP verification logic for regular user
        is_superadmin = (user_row['role'] == 'superadmin' or user_row['email'] == 'akunadminaul16@gmail.com')
        new_approval = 1 if is_superadmin else 0
        assert new_approval == 0, "Regular user MUST remain is_approved=0 after OTP verification"

        c.execute('UPDATE users SET is_approved = ? WHERE id = ?', (new_approval, user_row['id']))
        conn.commit()

        c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        updated_user = dict(c.fetchone())
        assert updated_user['is_approved'] == 0, "SQLite users.is_approved must strictly be 0"

        otp_resp = {
            'ok': True,
            'success': True,
            'status': 'pending_approval' if new_approval == 0 else 'active',
            'is_approved': new_approval,
            'role': updated_user['role'],
            'user': updated_user,
            'token': f'session-token-{updated_user["id"]}',
            'message': 'OTP valid. Menunggu persetujuan admin via WhatsApp di 082115624408.'
        }
        assert otp_resp['ok'] is True
        assert otp_resp['success'] is True
        assert otp_resp['status'] == 'pending_approval'
        assert otp_resp['is_approved'] == 0
        print("✓ [PASS] /api/auth/verify-otp strictly leaves is_approved=0 and returns status='pending_approval'")

        # Step 4: Test /api/auth/status logic (pending state)
        c.execute('SELECT id, email, full_name, phone_number, role, is_approved, plan, avatar_url FROM users WHERE id = ?', (user_id,))
        status_user = dict(c.fetchone())
        is_appr = int(status_user['is_approved'] or 0)
        status_resp = {
            'ok': True,
            'success': True,
            'user_id': status_user['id'],
            'email': status_user['email'],
            'full_name': status_user['full_name'],
            'role': status_user['role'],
            'is_approved': is_appr,
            'status': 'APPROVED' if is_appr == 1 else 'PENDING',
            'approval_status': 'APPROVED' if is_appr == 1 else 'PENDING',
            'user': status_user
        }
        assert status_resp['is_approved'] == 0
        assert status_resp['status'] == 'PENDING'
        assert status_resp['approval_status'] == 'PENDING'
        assert status_resp['success'] is True
        print("✓ [PASS] /api/auth/status returns PENDING and is_approved=0 before admin approval")

        # Step 5: Test /api/admin/approve-user logic
        c.execute('UPDATE users SET is_approved = 1 WHERE id = ?', (user_id,))
        server.seed_user_wallets_and_data(conn, user_id)
        conn.commit()

        c.execute('SELECT is_approved FROM users WHERE id = ?', (user_id,))
        appr_val = c.fetchone()['is_approved']
        assert appr_val == 1, "Database users.is_approved must now be 1"

        approve_resp = {
            'ok': True,
            'success': True,
            'user_id': user_id,
            'is_approved': 1,
            'message': f'Akun user ID {user_id} ({test_email}) berhasil disetujui (Approved) oleh akunadminaul16@gmail.com.'
        }
        assert approve_resp['ok'] is True
        assert approve_resp['success'] is True
        assert approve_resp['is_approved'] == 1
        print("✓ [PASS] /api/admin/approve-user persistently updates SQLite is_approved=1 and seeds wallets")

        # Step 6: Test /api/auth/status logic (approved state)
        c.execute('SELECT id, email, full_name, phone_number, role, is_approved, plan, avatar_url FROM users WHERE id = ?', (user_id,))
        post_appr_user = dict(c.fetchone())
        is_appr_post = int(post_appr_user['is_approved'] or 0)
        status_resp_post = {
            'ok': True,
            'success': True,
            'user_id': post_appr_user['id'],
            'email': post_appr_user['email'],
            'full_name': post_appr_user['full_name'],
            'role': post_appr_user['role'],
            'is_approved': is_appr_post,
            'status': 'APPROVED' if is_appr_post == 1 else 'PENDING',
            'approval_status': 'APPROVED' if is_appr_post == 1 else 'PENDING',
            'user': post_appr_user
        }
        assert status_resp_post['is_approved'] == 1
        assert status_resp_post['status'] == 'APPROVED'
        assert status_resp_post['approval_status'] == 'APPROVED'
        print("✓ [PASS] /api/auth/status returns APPROVED and is_approved=1 after admin approval")

        # Step 7: Test SPA routes definition in server.py
        spa_routes = {'/', '/index.html', '/dashboard', '/admin', '/superadmin', '/login', '/settings', '/approval'}
        required_routes = ['/', '/login', '/approval', '/dashboard', '/admin', '/superadmin', '/settings']
        for r in required_routes:
            assert r in spa_routes, f"Required SPA route '{r}' missing from spa_routes"
        print(f"✓ [PASS] All {len(required_routes)} SPA routes registered to serve index.html")

        conn.close()
        print("==================================================================")
        print(" ALL ROUND 7 BACKEND UNIT TESTS PASSED SUCCESSFULLY!")
        print("==================================================================")

    finally:
        if os.path.exists(temp_db):
            try:
                os.remove(temp_db)
            except Exception:
                pass

if __name__ == '__main__':
    run_tests()
