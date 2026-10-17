# -*- coding: utf-8 -*-
"""
Automated Test Suite for Worker 2:
Admin Authentication & User Registration/Approval Workflow.

Validates:
1. Admin login with shopnoure1619@gmail.com / 160017 returns 200 and superadmin role.
2. Invalid password login returns 401 with clear error message.
3. User registration via /api/auth/register records user in users table with is_approved = 0.
4. User login when is_approved = 0 returns pending approval status.
5. Admin endpoint /api/admin/users lists all registered users from database.
6. Admin approval endpoint /api/admin/approve-user updates user is_approved to 1,
   and initializes default wallets (BCA Utama, Mandiri, GoPay, Cash) and default budget categories.
7. Approved user login returns 200 active with session token.
"""

import sys
import os
import json
import time
import sqlite3
import urllib.request
import urllib.parse
import urllib.error
import threading

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT_DIR)

import server

SERVER_PORT = 3000
BASE_URL = f"http://127.0.0.1:{SERVER_PORT}"

total_tests = 0
passed_tests = 0
failed_tests = 0

def log_test(cond, title, details=""):
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    if cond:
        print(f"  ✅ [PASS] {title}")
        passed_tests += 1
    else:
        print(f"  ❌ [FAIL] {title} {('- ' + details) if details else ''}")
        failed_tests += 1

def send_request(method, path, body=None, headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{path}"
    data = None
    if body is not None:
        if isinstance(body, dict):
            data = json.dumps(body).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        elif isinstance(body, str):
            data = body.encode('utf-8')
        elif isinstance(body, bytes):
            data = body

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp_body = resp.read().decode('utf-8')
            try:
                parsed = json.loads(resp_body)
            except Exception:
                parsed = resp_body
            return resp.status, parsed, resp.headers
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = err_body
        return e.code, parsed, e.headers

def ensure_server_running():
    # Initialize DB first
    server.init_db()
    
    # Check if server is already running
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/admin/users", method='GET')
        with urllib.request.urlopen(req, timeout=1) as resp:
            if resp.status == 200:
                print(f"[Info] Backend server already running on {BASE_URL}")
                return
    except Exception:
        pass

    # Start server in daemon thread
    print(f"[Info] Starting backend server on port {SERVER_PORT} in background thread...")
    server.socketserver.TCPServer.allow_reuse_address = True
    httpd = server.socketserver.TCPServer(('', SERVER_PORT), server.TataDanaRequestHandler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    time.sleep(1.5)
    print(f"[Info] Backend server started successfully on {BASE_URL}")

def run_tests():
    print("=" * 70)
    print("🧪 TATADANA WORKER 2: AUTH & APPROVAL WORKFLOW VERIFICATION SUITE")
    print(f"   Target: {BASE_URL} | Database: {server.DB_FILE}")
    print("=" * 70 + "\n")

    ensure_server_running()

    # --------------------------------------------------------------------------
    # TEST 1: Superadmin Login (Valid Credentials)
    # --------------------------------------------------------------------------
    print("--- 1. Testing Superadmin Authentication ---")
    status, res, _ = send_request('POST', '/api/auth/login', {
        'email': 'shopnoure1619@gmail.com',
        'password': '160017'
    })
    log_test(status == 200, f"Superadmin login returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is True, "Superadmin login returns ok: True")
    log_test(isinstance(res, dict) and res.get('role') == 'superadmin', f"Superadmin role is 'superadmin' (Got {res.get('role') if isinstance(res, dict) else None})")
    log_test(isinstance(res, dict) and bool(res.get('token')), f"Session token issued: {res.get('token') if isinstance(res, dict) else None}")
    if isinstance(res, dict) and 'user' in res:
        u = res['user']
        log_test(u.get('email') == 'shopnoure1619@gmail.com', "User email matches shopnoure1619@gmail.com")
        log_test(u.get('is_approved') == 1, "Superadmin is_approved == 1")

    # --------------------------------------------------------------------------
    # TEST 2: Invalid Password for Admin
    # --------------------------------------------------------------------------
    print("\n--- 2. Testing Invalid Password Rejection (Admin) ---")
    status, res, _ = send_request('POST', '/api/auth/login', {
        'email': 'shopnoure1619@gmail.com',
        'password': 'wrongpassword999'
    })
    log_test(status == 401, f"Admin login with wrong password returns HTTP 401 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is False, "Response ok is False")
    log_test(isinstance(res, dict) and 'tidak cocok' in str(res.get('message', '')).lower(), f"Error message clearly indicates credential mismatch: '{res.get('message') if isinstance(res, dict) else None}'")

    # --------------------------------------------------------------------------
    # TEST 3: Invalid Password for Non-existent User
    # --------------------------------------------------------------------------
    print("\n--- 3. Testing Non-Existent User Login ---")
    status, res, _ = send_request('POST', '/api/auth/login', {
        'email': 'unknown_user_999@tatadana.id',
        'password': 'somepassword'
    })
    log_test(status == 401, f"Non-existent user login returns HTTP 401 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is False, "Response ok is False")

    # --------------------------------------------------------------------------
    # TEST 4: Missing Fields
    # --------------------------------------------------------------------------
    print("\n--- 4. Testing Empty / Missing Credentials ---")
    status, res, _ = send_request('POST', '/api/auth/login', {'email': ''})
    log_test(status == 400, f"Empty credentials returns HTTP 400 (Got {status})")

    # --------------------------------------------------------------------------
    # TEST 5: New User Registration (Persisted with is_approved = 0)
    # --------------------------------------------------------------------------
    print("\n--- 5. Testing User Registration Workflow ---")
    ts = int(time.time() * 1000) % 1000000
    test_email = f"budi_test_{ts}@gmail.com"
    test_phone = f"0812{ts:08d}"[:13]
    test_pass = "SandiAman123!"

    status, res, _ = send_request('POST', '/api/auth/register', {
        'full_name': f'Budi Test {ts}',
        'email': test_email,
        'phone_number': test_phone,
        'password': test_pass
    })
    log_test(status == 200, f"Registration returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is True, "Registration ok is True")
    new_user_id = res.get('user_id') if isinstance(res, dict) else None
    log_test(bool(new_user_id), f"Registration returned new user_id: {new_user_id}")

    # Check direct SQLite persistence for is_approved = 0
    conn = sqlite3.connect(server.DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT id, email, full_name, role, is_approved FROM users WHERE id = ?', (new_user_id,))
    db_user = c.fetchone()
    conn.close()

    log_test(db_user is not None, f"User ID {new_user_id} genuinely exists in SQLite users table")
    log_test(db_user and db_user['is_approved'] == 0, f"Newly registered user is_approved == 0 in SQLite (Got {db_user['is_approved'] if db_user else None})")

    # --------------------------------------------------------------------------
    # TEST 6: User Login when is_approved = 0 (Pending Approval)
    # --------------------------------------------------------------------------
    print("\n--- 6. Testing Pending Approval Login Response ---")
    status, res, _ = send_request('POST', '/api/auth/login', {
        'email': test_email,
        'password': test_pass
    })
    log_test(status == 200, f"Pending user login returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('status') == 'pending_approval', f"Status is 'pending_approval' (Got {res.get('status') if isinstance(res, dict) else None})")
    log_test(isinstance(res, dict) and res.get('is_approved') == 0, f"Response is_approved is 0")
    log_test(isinstance(res, dict) and 'menunggu persetujuan' in str(res.get('message', '')).lower(), f"Message indicates awaiting admin approval")

    # --------------------------------------------------------------------------
    # TEST 7: Admin Endpoint /api/admin/users
    # --------------------------------------------------------------------------
    print("\n--- 7. Testing Admin Users Directory Endpoint ---")
    status, res, _ = send_request('GET', '/api/admin/users')
    log_test(status == 200, f"GET /api/admin/users returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is True, "Response ok is True")
    users_list = res.get('users', []) if isinstance(res, dict) else []
    log_test(len(users_list) > 0, f"Returned {len(users_list)} registered users")

    # Verify newly registered user is present in the list
    found_user = next((u for u in users_list if u.get('id') == new_user_id), None)
    log_test(found_user is not None, f"Newly registered user #{new_user_id} found in /api/admin/users output")
    log_test(found_user and found_user.get('is_approved') == 0, f"User #{new_user_id} has is_approved == 0 in directory")

    # Verify admin user is also in the list
    admin_in_list = next((u for u in users_list if u.get('email') == 'shopnoure1619@gmail.com'), None)
    log_test(admin_in_list is not None and admin_in_list.get('role') == 'superadmin', "Superadmin shopnoure1619@gmail.com listed in directory")

    # --------------------------------------------------------------------------
    # TEST 8: Admin Approval Endpoint /api/admin/approve-user
    # --------------------------------------------------------------------------
    print("\n--- 8. Testing Admin User Approval & Wallet/Category Seeding ---")
    status, res, _ = send_request('POST', '/api/admin/approve-user', {
        'user_id': new_user_id
    })
    log_test(status == 200, f"POST /api/admin/approve-user returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('ok') is True, "Approval response ok is True")
    log_test(isinstance(res, dict) and res.get('is_approved') == 1, "Approval response returns is_approved == 1")

    # Direct SQLite Verification of Approval and Wallets
    conn = sqlite3.connect(server.DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 8a. Check user table is_approved is 1
    c.execute('SELECT is_approved FROM users WHERE id = ?', (new_user_id,))
    u_after = c.fetchone()
    log_test(u_after is not None and u_after['is_approved'] == 1, f"SQLite persistence check: user is_approved is now 1")

    # 8b. Check wallets initialized: BCA Utama, Mandiri, GoPay, Cash
    c.execute('SELECT name, wallet_type, balance, is_default FROM wallets WHERE user_id = ? ORDER BY id ASC', (new_user_id,))
    wallets = [dict(w) for w in c.fetchall()]
    wallet_names = [w['name'] for w in wallets]
    print(f"      Initialized wallets for user #{new_user_id}: {wallet_names}")

    log_test('BCA Utama' in wallet_names, "Default wallet 'BCA Utama' initialized")
    log_test('Mandiri' in wallet_names, "Default wallet 'Mandiri' initialized")
    log_test('GoPay' in wallet_names, "Default wallet 'GoPay' initialized")
    log_test('Cash' in wallet_names, "Default wallet 'Cash' initialized")

    # Check default wallet is BCA Utama
    bca_w = next((w for w in wallets if w['name'] == 'BCA Utama'), None)
    log_test(bca_w is not None and bca_w['is_default'] == 1, "'BCA Utama' is flagged as is_default = 1")

    # 8c. Check budget categories initialized
    c.execute('SELECT name, category_type, budget_limit FROM categories WHERE user_id = ?', (new_user_id,))
    categories = [dict(row) for row in c.fetchall()]
    cat_names = [c_row['name'] for c_row in categories]
    print(f"      Initialized categories for user #{new_user_id}: {cat_names}")
    log_test('Makanan & Minuman' in cat_names, "Default category 'Makanan & Minuman' initialized")
    log_test('Transportasi' in cat_names, "Default category 'Transportasi' initialized")
    log_test('Gaji & Proyek' in cat_names, "Default category 'Gaji & Proyek' initialized")

    conn.close()

    # --------------------------------------------------------------------------
    # TEST 9: Approved User Can Now Log In with Active Status
    # --------------------------------------------------------------------------
    print("\n--- 9. Testing Login for Approved User ---")
    status, res, _ = send_request('POST', '/api/auth/login', {
        'email': test_email,
        'password': test_pass
    })
    log_test(status == 200, f"Approved user login returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('status') == 'active', f"Status is 'active' (Got {res.get('status') if isinstance(res, dict) else None})")
    log_test(isinstance(res, dict) and bool(res.get('token')), f"Active session token issued: {res.get('token') if isinstance(res, dict) else None}")

    # --------------------------------------------------------------------------
    # TEST 10: GET Support for /api/admin/approve-user
    # --------------------------------------------------------------------------
    print("\n--- 10. Testing GET Support for /api/admin/approve-user ---")
    ts2 = (ts + 100) % 1000000
    test_email2 = f"test2_{ts2}@gmail.com"
    status, res, _ = send_request('POST', '/api/auth/register', {
        'full_name': f'Test 2 User {ts2}',
        'email': test_email2,
        'phone_number': f'0813{ts2:08d}'[:13],
        'password': 'Password123!'
    })
    new_user_id2 = res.get('user_id') if isinstance(res, dict) else None
    log_test(bool(new_user_id2), f"Second user registered with ID #{new_user_id2}")

    status, res, _ = send_request('GET', f'/api/admin/approve-user?user_id={new_user_id2}')
    log_test(status == 200, f"GET /api/admin/approve-user returns HTTP 200 (Got {status})")
    log_test(isinstance(res, dict) and res.get('is_approved') == 1, "User 2 is_approved == 1 via GET")

    # --------------------------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print(f"📊 TEST SUMMARY: Total: {total_tests} | Passed: {passed_tests} | Failed: {failed_tests}")
    print("=" * 70)

    if failed_tests == 0:
        print("\n🎉 ALL TESTS PASSED! Worker 2 verification successful.\n")
        return 0
    else:
        print(f"\n⚠️ {failed_tests} TESTS FAILED. Please review failures above.\n")
        return 1

if __name__ == '__main__':
    code = run_tests()
    sys.exit(code)
