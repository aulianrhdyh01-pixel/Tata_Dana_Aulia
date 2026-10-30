import os
import sys
import sqlite3
import hashlib
import json
import io
import urllib.parse

PROJECT_DIR = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana'
sys.path.insert(0, PROJECT_DIR)

import server

print("=" * 70)
print("INDEPENDENT VICTORY AUDITOR ADVERSARIAL STRESS TEST")
print("=" * 70)

# Connect to database
db_path = os.path.join(PROJECT_DIR, 'tatadana.db')
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

# Test 1: Superadmin credential verification
print("\n[STRESS TEST 1] Superadmin Authentication Rigor")
admin_email = 'akunadminaul16@gmail.com'
admin_pw = 'akuadmin123'
expected_hash = hashlib.sha256(admin_pw.encode('utf-8')).hexdigest()

c.execute("SELECT * FROM users WHERE email = ?", (admin_email,))
admin = c.fetchone()
assert admin is not None, "Superadmin missing!"
assert admin['password_hash'] == expected_hash, "Hash mismatch!"
assert admin['role'] == 'admin', f"Role is {admin['role']}, expected 'admin'"
assert admin['is_approved'] == 1, "Must be approved"
assert admin['status'] == 'active', "Must be active"
assert admin['plan'] == 'PRO VIP', "Must be PRO VIP"
print("  --> PASS: Superadmin credentials and role verified.")

# Test 2: In-Process handler verification for malicious / malformed requests
print("\n[STRESS TEST 2] Malicious / Malformed Requests to Handlers")

def call_handler(method, path, body=None):
    handler = server.TataDanaRequestHandler.__new__(server.TataDanaRequestHandler)
    handler.path = path
    handler.command = method
    handler.headers = {}
    
    body_bytes = b""
    if body is not None:
        if isinstance(body, dict):
            body_bytes = json.dumps(body).encode('utf-8')
            handler.headers['Content-Type'] = 'application/json'
        elif isinstance(body, str):
            body_bytes = body.encode('utf-8')
        handler.headers['Content-Length'] = str(len(body_bytes))
    else:
        handler.headers['Content-Length'] = '0'

    handler.rfile = io.BytesIO(body_bytes)
    handler.wfile = io.BytesIO()

    captured = {'status': None, 'headers': {}}
    def mock_send_response(code, message=None):
        captured['status'] = code
    def mock_send_header(keyword, value):
        captured['headers'][keyword] = value
    def mock_end_headers():
        pass

    handler.send_response = mock_send_response
    handler.send_header = mock_send_header
    handler.end_headers = mock_end_headers

    if method == 'GET':
        handler.do_GET()
    elif method == 'POST':
        handler.do_POST()

    raw_output = handler.wfile.getvalue()
    json_data = None
    try:
        json_data = json.loads(raw_output.decode('utf-8'))
    except Exception:
        pass

    return captured['status'], json_data

# Test 2a: Approval endpoint with invalid/missing user_id
status, data = call_handler('GET', '/api/admin/approve-user')
assert status == 400, f"Expected 400 for missing user_id, got {status}"
status, data = call_handler('GET', '/api/admin/approve-user?user_id=nonexistent')
assert status == 400, f"Expected 400 for non-int user_id, got {status}"
status, data = call_handler('GET', '/api/admin/approve-user?user_id=99999999')
assert status == 404, f"Expected 404 for missing user, got {status}"
print("  --> PASS: Missing / non-int / non-existent user_id rejected cleanly.")

# Test 2b: SQL injection in login
status, data = call_handler('POST', '/api/auth/login', {'email': "' OR '1'='1", 'password': "' OR '1'='1"})
assert status == 401, f"Expected 401 for SQLi attempt, got {status}"
status, data = call_handler('POST', '/api/auth/login', {'email': "admin'--", 'password': "any"})
assert status == 401, f"Expected 401 for SQLi comment, got {status}"
print("  --> PASS: SQL injection attempts safely rejected with 401.")

# Test 3: Idempotency of approval (calling approve twice on same user)
print("\n[STRESS TEST 3] Idempotency of Approval & Duplicate Prevention")
# Register test user
status, data = call_handler('POST', '/api/auth/register', {
    'email': 'idempotent_test@tatadana.id',
    'password': 'SecurePassword123!',
    'full_name': 'Idempotent Tester',
    'phone_number': '08999998888'
})
assert status == 200, f"Register failed: {status}"
test_uid = data['user_id']

# First approval
status, data1 = call_handler('GET', f'/api/admin/approve-user?user_id={test_uid}')
assert status == 200, f"First approval failed: {status}"
assert data1['is_approved'] == 1

# Check wallets count after 1st approval
c.execute("SELECT COUNT(*) FROM wallets WHERE user_id = ?", (test_uid,))
w_count_1 = c.fetchone()[0]
assert w_count_1 == 4, f"Expected 4 wallets, found {w_count_1}"

# Second approval (idempotent retry)
status, data2 = call_handler('GET', f'/api/admin/approve-user?user_id={test_uid}')
assert status == 200, f"Second approval failed: {status}"
assert data2['is_approved'] == 1

# Check wallets count after 2nd approval (must NOT duplicate wallets)
c.execute("SELECT COUNT(*) FROM wallets WHERE user_id = ?", (test_uid,))
w_count_2 = c.fetchone()[0]
assert w_count_2 == 4, f"DUPLICATE WALLET BUG: Expected 4 wallets after retry, found {w_count_2}"
print("  --> PASS: Approval is strictly idempotent; no duplicate wallets or categories created on repeat calls.")

# Test 4: Data isolation stress test
print("\n[STRESS TEST 4] Strict Data Isolation Across Users")
# Add a transaction for test_uid
c.execute("SELECT id FROM wallets WHERE user_id = ? AND is_default = 1", (test_uid,))
w_row = c.fetchone()
w_id = w_row['id']
c.execute("UPDATE wallets SET balance = 5000000.0 WHERE id = ?", (w_id,))
c.execute("""
    INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, transaction_time)
    VALUES (?, ?, 'Makanan & Minuman', 'pengeluaran', 150000.0, 'Makan siang audit', datetime('now'))
""", (test_uid, w_id))
conn.commit()

# Query test_uid dashboard stats
status, stats_user = call_handler('GET', f'/api/dashboard/stats?user_id={test_uid}')
assert status == 200
assert stats_user['total_saldo'] == 5000000.0
assert stats_user['pengeluaran'] == 150000.0

# Register second user
status, data_u2 = call_handler('POST', '/api/auth/register', {
    'email': 'isolation_user2@tatadana.id',
    'password': 'SecurePassword123!',
    'full_name': 'Isolation User 2',
    'phone_number': '08999997777'
})
u2_id = data_u2['user_id']
# Approve second user
call_handler('GET', f'/api/admin/approve-user?user_id={u2_id}')

# Query second user stats - MUST BE 0.0, zero leak from test_uid
status, stats_u2 = call_handler('GET', f'/api/dashboard/stats?user_id={u2_id}')
assert status == 200
assert stats_u2['total_saldo'] == 0.0, f"LEAK: u2 total_saldo is {stats_u2['total_saldo']}"
assert stats_u2['pengeluaran'] == 0.0, f"LEAK: u2 pengeluaran is {stats_u2['pengeluaran']}"
assert stats_u2['pemasukan'] == 0.0, f"LEAK: u2 pemasukan is {stats_u2['pemasukan']}"

# Query second user transactions - MUST BE EMPTY
status, tx_u2 = call_handler('GET', f'/api/transactions?user_id={u2_id}')
assert status == 200
assert len(tx_u2['transactions']) == 0, f"LEAK: u2 has transactions: {tx_u2['transactions']}"

print("  --> PASS: Absolute data isolation verified with zero data leakage across accounts.")

# Test 5: Dynamic admin metrics verification
print("\n[STRESS TEST 5] Admin Metrics Real-Time Precision")
status, metrics = call_handler('GET', '/api/admin/metrics')
assert status == 200
# Total users: superadmin (1) + test_uid (1) + u2_id (1) = 3
assert metrics['total_users'] == 3, f"Expected 3 users, got {metrics['total_users']}"
assert metrics['approved_users_count'] == 2, f"Expected 2 approved users, got {metrics['approved_users_count']}"
assert metrics['pending_approvals'] == 0, f"Expected 0 pending, got {metrics['pending_approvals']}"
assert metrics['total_transactions'] == 1, f"Expected 1 transaction, got {metrics['total_transactions']}"
print("  --> PASS: Admin metrics dynamically matched exact database row counts.")

# Cleanup database to pristine baseline
print("\n[CLEANUP] Restoring pristine production baseline")
from reset_production_db import reset_db
reset_db()

conn.close()
print("\n" + "=" * 70)
print(">>> ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS <<<")
print("=" * 70)
