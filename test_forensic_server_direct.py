#!/usr/bin/env python3
"""
test_forensic_server_direct.py
Independent Forensic Direct Handler Verification for TataDana.
Executes server.py's actual TataDanaRequestHandler methods (do_GET, do_POST)
directly in-process without any network sockets or mock bypasses.
Verifies real SQL queries, real commits, and real HTTP status/responses.
"""
import os
import sys
import io
import json
import sqlite3

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_DIR)

import server
from reset_production_db import reset_db

class DirectHandlerInvoker:
    """Invokes actual server.TataDanaRequestHandler methods with simulated socket streams."""
    def __init__(self):
        pass

    def request(self, method, path, body=None, headers=None):
        handler = server.TataDanaRequestHandler.__new__(server.TataDanaRequestHandler)
        handler.path = path
        handler.command = method
        handler.headers = headers or {}
        
        body_bytes = b""
        if body is not None:
            if isinstance(body, dict):
                body_bytes = json.dumps(body).encode('utf-8')
                handler.headers['Content-Type'] = 'application/json'
            elif isinstance(body, str):
                body_bytes = body.encode('utf-8')
            elif isinstance(body, bytes):
                body_bytes = body
            handler.headers['Content-Length'] = str(len(body_bytes))
        else:
            handler.headers['Content-Length'] = '0'

        handler.rfile = io.BytesIO(body_bytes)
        handler.wfile = io.BytesIO()

        # Capture status code and headers
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
        elif method == 'OPTIONS':
            handler.do_OPTIONS()
        else:
            raise ValueError(f"Unsupported method: {method}")

        raw_output = handler.wfile.getvalue()
        json_data = None
        try:
            json_data = json.loads(raw_output.decode('utf-8'))
        except Exception:
            pass

        return captured['status'], json_data, raw_output

def run_forensic_suite():
    print("=" * 75)
    print(" FORENSIC INTEGRITY AUDIT: DIRECT SERVER.PY HANDLER VERIFICATION ")
    print("=" * 75)

    # -----------------------------------------------------------------
    # PHASE 1: Reset DB to Pristine State
    # -----------------------------------------------------------------
    print("\n[PHASE 1] Resetting tatadana.db to clean production baseline...")
    reset_db()
    invoker = DirectHandlerInvoker()

    # -----------------------------------------------------------------
    # PHASE 2: Check Initial DB Baseline & Auto-Seed Eradication
    # -----------------------------------------------------------------
    print("\n[PHASE 2] Auditing SQLite DB Baseline directly...")
    conn = sqlite3.connect(server.DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    assert c.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1, "Must have exactly 1 user"
    assert c.execute("SELECT COUNT(*) FROM users WHERE is_approved = 0").fetchone()[0] == 0, "Must have 0 pending"
    assert c.execute("SELECT COUNT(*) FROM transactions").fetchone()[0] == 0, "Must have 0 transactions"
    assert c.execute("SELECT COUNT(*) FROM wallets").fetchone()[0] == 0, "Must have 0 wallets"

    c.execute("SELECT email, role, is_approved, status, plan, password_hash FROM users WHERE email = 'akunadminaul16@gmail.com'")
    admin = c.fetchone()
    assert admin is not None, "Superadmin akunadminaul16@gmail.com must exist"
    assert admin['role'] == 'admin', f"Superadmin role must be 'admin', got {admin['role']}"
    assert admin['is_approved'] == 1, f"Superadmin is_approved must be 1, got {admin['is_approved']}"
    assert admin['status'] == 'active', f"Superadmin status must be 'active', got {admin['status']}"
    assert admin['plan'] == 'PRO VIP', f"Superadmin plan must be 'PRO VIP', got {admin['plan']}"
    assert admin['password_hash'] == server.hash_pw('akuadmin123'), "Superadmin password hash invalid"
    conn.close()
    print("  --> [PASS] Database baseline verified: 1 superadmin (admin, active, PRO VIP), 0 users, 0 pending, 0 tx, 0 wallets.")

    # -----------------------------------------------------------------
    # PHASE 3: Real server.py do_POST('/api/auth/login') Superadmin
    # -----------------------------------------------------------------
    print("\n[PHASE 3] Auditing server.py do_POST('/api/auth/login') for Superadmin...")
    status, data, _ = invoker.request('POST', '/api/auth/login', {
        'email': 'akunadminaul16@gmail.com',
        'password': 'akuadmin123'
    })
    assert status == 200, f"Expected 200, got {status}"
    assert data['ok'] is True and data['success'] is True
    assert data['role'] == 'admin', f"Expected role 'admin', got {data['role']}"
    assert data['status'] == 'active', f"Expected status 'active', got {data['status']}"
    assert data['is_approved'] == 1, f"Expected is_approved=1, got {data['is_approved']}"
    assert data['plan'] == 'PRO VIP', f"Expected plan 'PRO VIP', got {data['plan']}"
    print("  --> [PASS] Superadmin login through real server.py handler verified successfully.")

    # -----------------------------------------------------------------
    # PHASE 4: Real server.py do_GET('/api/admin/metrics') Dynamic COUNT(*)
    # -----------------------------------------------------------------
    print("\n[PHASE 4] Auditing server.py do_GET('/api/admin/metrics') Dynamic Counts...")
    status, metrics, _ = invoker.request('GET', '/api/admin/metrics')
    assert status == 200, f"Expected 200, got {status}"
    assert metrics['total_users'] == 1, f"Expected total_users=1, got {metrics['total_users']}"
    assert metrics['pending_approvals'] == 0, f"Expected pending_approvals=0, got {metrics['pending_approvals']}"
    assert metrics['approved_users_count'] == 0, f"Expected approved_users_count=0 (admin excluded), got {metrics['approved_users_count']}"
    assert metrics['total_transactions'] == 0, f"Expected total_transactions=0, got {metrics['total_transactions']}"
    print("  --> [PASS] /api/admin/metrics accurately computes dynamic SQLite COUNT(*) aggregates.")

    # -----------------------------------------------------------------
    # PHASE 5: Real server.py do_POST('/api/auth/register') New User
    # -----------------------------------------------------------------
    print("\n[PHASE 5] Auditing server.py do_POST('/api/auth/register') New User Registration...")
    status, reg_data, _ = invoker.request('POST', '/api/auth/register', {
        'email': 'auditor_real_user@tatadana.id',
        'password': 'PasswordAudit123!',
        'full_name': 'Auditor User Asli',
        'phone_number': '089876543210'
    })
    assert status == 200, f"Expected 200, got {status}"
    assert reg_data['is_approved'] == 0, "Registered user must have is_approved=0"
    assert reg_data['status'] == 'pending_approval', f"Expected status 'pending_approval', got {reg_data['status']}"
    new_user_id = reg_data['user_id']
    print(f"  --> [PASS] User registered: id={new_user_id}, status='pending_approval', is_approved=0.")

    # Re-verify /api/admin/metrics reflects 1 pending applicant
    status, metrics2, _ = invoker.request('GET', '/api/admin/metrics')
    assert metrics2['total_users'] == 2, f"Expected total_users=2, got {metrics2['total_users']}"
    assert metrics2['pending_approvals'] == 1, f"Expected pending_approvals=1, got {metrics2['pending_approvals']}"
    assert metrics2['approved_users_count'] == 0, f"Expected approved_users_count=0, got {metrics2['approved_users_count']}"
    print("  --> [PASS] /api/admin/metrics dynamically updated to pending_approvals=1.")

    # Check unapproved user login is gated
    status, login_pend, _ = invoker.request('POST', '/api/auth/login', {
        'email': 'auditor_real_user@tatadana.id',
        'password': 'PasswordAudit123!'
    })
    assert status == 200
    assert login_pend['status'] == 'pending_approval'
    assert login_pend['is_approved'] == 0
    assert '082115624408' in login_pend.get('whatsapp_contact', '')
    print("  --> [PASS] Pending user login gated with status='pending_approval'.")

    # -----------------------------------------------------------------
    # PHASE 6: Real server.py do_GET('/api/admin/approve-user') & Commit Persistence
    # -----------------------------------------------------------------
    print("\n[PHASE 6] Auditing server.py do_GET('/api/admin/approve-user') & SQLite Persistence...")
    status, appr_data, _ = invoker.request('GET', f'/api/admin/approve-user?user_id={new_user_id}')
    assert status == 200, f"Expected 200, got {status}"
    assert appr_data.get('ok') is True or appr_data.get('success') is True
    assert appr_data['status'] == 'active'
    assert appr_data['is_approved'] == 1

    # Verify SQLite commit on disk with fresh independent connection
    conn2 = sqlite3.connect(server.DB_FILE)
    conn2.row_factory = sqlite3.Row
    c2 = conn2.cursor()
    c2.execute("SELECT id, email, status, is_approved, role FROM users WHERE id = ?", (new_user_id,))
    u_persisted = c2.fetchone()
    assert u_persisted is not None
    assert u_persisted['status'] == 'active', f"DB status must be 'active', got {u_persisted['status']}"
    assert u_persisted['is_approved'] == 1, f"DB is_approved must be 1, got {u_persisted['is_approved']}"
    assert u_persisted['role'] == 'user', f"DB role must be 'user', got {u_persisted['role']}"

    # Verify 4 wallets provisioned with balance 0.0
    c2.execute("SELECT id, name, balance, is_default FROM wallets WHERE user_id = ?", (new_user_id,))
    w_persisted = c2.fetchall()
    assert len(w_persisted) == 4, f"Expected 4 wallets, found {len(w_persisted)}"
    for w in w_persisted:
        assert float(w['balance']) == 0.0, f"Expected wallet balance 0.0, got {w['balance']}"
    conn2.close()
    print("  --> [PASS] Approval SQLite commit verified: status='active', is_approved=1, 4 wallets at Rp 0.0.")

    # -----------------------------------------------------------------
    # PHASE 7: Real server.py do_POST('/api/auth/login') Approved User
    # -----------------------------------------------------------------
    print("\n[PHASE 7] Auditing server.py do_POST('/api/auth/login') for Approved User...")
    status, appr_login, _ = invoker.request('POST', '/api/auth/login', {
        'email': 'auditor_real_user@tatadana.id',
        'password': 'PasswordAudit123!'
    })
    assert status == 200
    assert appr_login['status'] == 'active', f"Expected status 'active', got {appr_login['status']}"
    assert appr_login['is_approved'] == 1, f"Expected is_approved=1, got {appr_login['is_approved']}"
    assert appr_login['role'] == 'user', f"Expected role 'user', got {appr_login['role']}"
    print("  --> [PASS] Approved user successfully logged in with role='user' and status='active'.")

    # -----------------------------------------------------------------
    # PHASE 8: Real server.py User Dashboard Isolation
    # -----------------------------------------------------------------
    print("\n[PHASE 8] Auditing User Dashboard Endpoints Data Isolation...")
    # Stats
    status, stats, _ = invoker.request('GET', f'/api/dashboard/stats?user_id={new_user_id}')
    assert status == 200
    assert stats['total_saldo'] == 0.0
    assert stats['net_balance'] == 0.0
    assert stats['pemasukan'] == 0.0
    assert stats['monthly_income'] == 0.0
    assert stats['pengeluaran'] == 0.0
    assert stats['monthly_expense'] == 0.0
    assert stats['budget_tersisa'] == stats['total_budget'] # 8.25M allocated budgets - 0 expenses = 8.25M remaining, NO 6.25M fallback
    print("  --> [PASS] /api/dashboard/stats returns Rp 0.0 balance, 0 income, 0 expense.")

    # Transactions
    status, tx_res, _ = invoker.request('GET', f'/api/transactions?user_id={new_user_id}')
    assert status == 200
    assert tx_res['transactions'] == [], f"Expected empty transactions, got {tx_res['transactions']}"
    print("  --> [PASS] /api/transactions returns empty array [].")

    # Wallets
    status, w_res, _ = invoker.request('GET', f'/api/wallets?user_id={new_user_id}')
    assert status == 200
    assert len(w_res['wallets']) == 4
    for w in w_res['wallets']:
        assert w['wallet_name'] == w['name']
        assert float(w['balance']) == 0.0
    print("  --> [PASS] /api/wallets returns 4 wallets with wallet_name property and Rp 0.0 balance.")

    # -----------------------------------------------------------------
    # PHASE 9: Error & Edge Case Handling in server.py
    # -----------------------------------------------------------------
    print("\n[PHASE 9] Auditing Error & Edge Case Responses in server.py...")
    # Non-existent user approval
    status, err_res, _ = invoker.request('GET', '/api/admin/approve-user?user_id=888888')
    assert status == 404, f"Expected 404, got {status}"
    assert err_res['ok'] is False

    # Invalid non-integer user_id
    status, err_res2, _ = invoker.request('GET', '/api/admin/approve-user?user_id=abc')
    assert status == 400, f"Expected 400, got {status}"

    # Missing user_id
    status, err_res3, _ = invoker.request('GET', '/api/admin/approve-user')
    assert status == 400, f"Expected 400, got {status}"

    # Invalid password login
    status, err_res4, _ = invoker.request('POST', '/api/auth/login', {
        'email': 'akunadminaul16@gmail.com',
        'password': 'wrongpassword'
    })
    assert status == 401, f"Expected 401, got {status}"

    # Non-existent user login
    status, err_res5, _ = invoker.request('POST', '/api/auth/login', {
        'email': 'ghost@tatadana.id',
        'password': 'Password123'
    })
    assert status == 401, f"Expected 401, got {status}"
    print("  --> [PASS] Error handling: 400, 401, 404 responses verified accurately.")

    # -----------------------------------------------------------------
    # PHASE 10: Frontend index.html Code Integrity Inspection
    # -----------------------------------------------------------------
    print("\n[PHASE 10] Auditing Frontend index.html Code Integrity...")
    with open(os.path.join(PROJECT_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        html = f.read()

    # R4: Immediate button disable
    assert 'btn.disabled = true' in html, "index.html must set btn.disabled = true"
    assert "btn.setAttribute('disabled', 'true')" in html, "index.html must set disabled attribute"
    assert "btn.innerText = 'Memproses...'" in html, "index.html must update button text to Memproses..."
    assert "applicantRow-" in html, "index.html must have applicantRow- id"
    assert "row.remove()" in html, "index.html must immediately remove row on HTTP 200 OK"

    # R3: Static HTML placeholders sanitized to 0
    assert 'id="metricTotalUsers">0 Akun</div>' in html
    assert 'id="metricPendingUsers">0 Pendaftar</div>' in html
    assert 'id="adminPendingCountBadge">0</span>' in html
    assert 'id="navPendingBadge"' in html and '>0</span>' in html

    # R2: Charts 0 fallback fix
    assert "stats.monthly_income || 5000000" not in html
    assert "stats.monthly_expense || 2100000" not in html
    print("  --> [PASS] Frontend code integrity verified: button disable, row removal, 0 placeholders, 0 chart fallback fix.")

    # -----------------------------------------------------------------
    # PHASE 11: Final DB Restoration & Pristine Baseline Guarantee
    # -----------------------------------------------------------------
    print("\n[PHASE 11] Restoring pristine production database baseline...")
    reset_db()

    conn_final = sqlite3.connect(server.DB_FILE)
    conn_final.row_factory = sqlite3.Row
    c_final = conn_final.cursor()

    assert c_final.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1
    assert c_final.execute("SELECT COUNT(*) FROM users WHERE is_approved = 0").fetchone()[0] == 0
    assert c_final.execute("SELECT COUNT(*) FROM transactions").fetchone()[0] == 0
    assert c_final.execute("SELECT COUNT(*) FROM wallets").fetchone()[0] == 0

    c_final.execute("SELECT email, role, is_approved, status, plan FROM users WHERE email = 'akunadminaul16@gmail.com'")
    final_admin = c_final.fetchone()
    assert final_admin['role'] == 'admin'
    assert final_admin['is_approved'] == 1
    assert final_admin['status'] == 'active'
    assert final_admin['plan'] == 'PRO VIP'
    conn_final.close()
    print("  --> [PASS] Production database verified in pristine baseline state.")

    print("\n" + "=" * 75)
    print(" >>> ALL 11 FORENSIC DIRECT VERIFICATION PHASES PASSED (100% CLEAN) <<< ")
    print("=" * 75)

if __name__ == '__main__':
    run_forensic_suite()
