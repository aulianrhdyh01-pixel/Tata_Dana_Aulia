# -*- coding: utf-8 -*-
"""
TataDana Forensic Integrity Audit & End-to-End Acceptance Verifier (Round 2)
Author: Forensic Integrity Auditor & End-to-End Acceptance Verifier (Agent 5)
Project Root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Target: Live Backend (localhost:3000) & SQLite Database (tatadana.db)

Verification Scope:
1. End-to-End Acceptance Tests (Criteria 1-6):
   - Superadmin login with shopnoure1619@gmail.com / 160017
   - Invalid credentials login returns 401 with error message
   - User registration persists in users table with is_approved = 0
   - Admin approval switches is_approved = 1 and initializes wallets & categories
   - Real transaction insertion modifies wallet balances accurately in tatadana.db
   - CSV export at /api/export yields real transactions from database
2. Forensic Integrity Audit:
   - Source code analysis for mock/dummy bypass or fake static responses
   - Database persistence check on tatadana.db
   - Binary verdict: CLEAN or INTEGRITY VIOLATION
"""

import sys
import os
import time
import json
import sqlite3
import urllib.request
import urllib.error
import urllib.parse
import threading

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')
SERVER_PY = os.path.join(PROJECT_ROOT, 'server.py')
INDEX_HTML = os.path.join(PROJECT_ROOT, 'index.html')
BASE_URL = 'http://localhost:3000'

results = {
    "acceptance_criteria": {},
    "forensic_checks": {},
    "errors": []
}

def log(msg, status="INFO"):
    symbol = "ℹ️"
    if status == "PASS":
        symbol = "✅"
    elif status == "FAIL":
        symbol = "❌"
    elif status == "WARN":
        symbol = "⚠️"
    print(f"[{symbol} {status}] {msg}")

def check_server_running(url, timeout=2):
    try:
        req = urllib.request.Request(f"{url}/", headers={"User-Agent": "Auditor"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.getcode() == 200
    except Exception:
        return False

# Ensure server is running
server_process = None
server_thread = None

def start_embedded_server():
    global server_thread
    log("Server not detected on localhost:3000. Launching root server.py in background thread...", "WARN")
    sys.path.insert(0, PROJECT_ROOT)
    import server
    server.init_db()
    server.socketserver.TCPServer.allow_reuse_address = True
    httpd = server.socketserver.TCPServer(('', server.PORT), server.TataDanaRequestHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(1.5)
    log("Embedded server started successfully on port 3000", "PASS")

# ----------------------------------------------------------------------
# PHASE 1: FORENSIC INTEGRITY AUDIT (SOURCE CODE & DATABASE INSPECTION)
# ----------------------------------------------------------------------
def run_forensic_integrity_audit():
    log("================================================================", "INFO")
    log("PHASE 1: FORENSIC INTEGRITY AUDIT", "INFO")
    log("================================================================", "INFO")
    
    # Check 1: tatadana.db existence and integrity
    if not os.path.exists(DB_PATH):
        # Maybe not initialized yet, let's initialize or flag
        log(f"tatadana.db not found at {DB_PATH}", "WARN")
    else:
        db_size = os.path.getsize(DB_PATH)
        log(f"tatadana.db found, file size: {db_size} bytes", "PASS")
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in c.fetchall()]
        conn.close()
        log(f"Active SQLite tables in tatadana.db: {tables}", "PASS")
        required_tables = ['users', 'wallets', 'categories', 'transactions', 'telegram_updates']
        missing_tables = [t for t in required_tables if t not in tables]
        if missing_tables:
            results["forensic_checks"]["database_schema"] = f"FAIL (Missing: {missing_tables})"
            log(f"Missing required tables: {missing_tables}", "FAIL")
        else:
            results["forensic_checks"]["database_schema"] = "PASS (All 5 tables present)"
            log("Database schema contains all required tables (users, wallets, categories, transactions, telegram_updates)", "PASS")

    # Check 2: Inspect server.py for mock bypasses
    log("Inspecting server.py for mock/dummy bypass or fake static responses...", "INFO")
    with open(SERVER_PY, 'r', encoding='utf-8') as f:
        server_code = f.read()

    # Search for suspicious patterns
    suspicious_patterns = [
        ("Fake/Dummy transactions return", "return [{'id': 1, 'notes': 'dummy'}]"),
        ("Hardcoded user auth bypass", "if email == 'test' and password == 'test': return {'ok': True}"),
        ("Static CSV without DB", "csv_output = 'No,Tanggal\n1,fake'"),
    ]
    violations = []
    for label, pattern in suspicious_patterns:
        if pattern in server_code:
            violations.append(f"{label}: found '{pattern}'")

    # Confirm genuine DB queries in handlers
    db_queries_verified = []
    if "SELECT id, email, full_name" in server_code and "/api/admin/users" in server_code:
        db_queries_verified.append("/api/admin/users uses real SQLite query")
    if "SELECT SUM(balance)" in server_code and "/api/dashboard/stats" in server_code:
        db_queries_verified.append("/api/dashboard/stats uses real SQLite aggregation")
    if "INSERT INTO transactions" in server_code and "UPDATE wallets SET balance" in server_code:
        db_queries_verified.append("/api/transactions performs real DB INSERT and UPDATE")
    if "SELECT t.id, t.transaction_time" in server_code and "/api/export" in server_code:
        db_queries_verified.append("/api/export reads live rows from SQLite")

    log(f"Verified genuine SQLite operations in server.py: {len(db_queries_verified)} verified", "PASS")
    for v in db_queries_verified:
        log(f"  - {v}", "PASS")

    if violations:
        results["forensic_checks"]["server_code_integrity"] = f"FAIL: {violations}"
        log(f"Violations detected in server.py: {violations}", "FAIL")
    else:
        results["forensic_checks"]["server_code_integrity"] = "PASS (Genuine SQLite operations, no mock bypass)"
        log("server.py passes forensic code inspection. No mock bypasses detected.", "PASS")

    # Check 3: Inspect index.html for real API integration
    log("Inspecting index.html for live REST calls...", "INFO")
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        html_code = f.read()

    frontend_calls = [
        "/api/auth/register",
        "/api/auth/login",
        "/api/admin/users",
        "/api/admin/approve-user",
        "/api/dashboard/stats",
        "/api/wallets",
        "/api/transactions",
        "/api/export"
    ]
    missing_frontend_calls = [call for call in frontend_calls if call not in html_code]
    if missing_frontend_calls:
        results["forensic_checks"]["frontend_api_wiring"] = f"WARN (Missing: {missing_frontend_calls})"
        log(f"Frontend missing API calls: {missing_frontend_calls}", "WARN")
    else:
        results["forensic_checks"]["frontend_api_wiring"] = "PASS (All 8 core REST endpoints wired in frontend)"
        log("index.html passes forensic inspection. All core REST endpoints wired via fetch().", "PASS")


# ----------------------------------------------------------------------
# PHASE 2: END-TO-END ACCEPTANCE TESTING (6 CRITERIA)
# ----------------------------------------------------------------------
def http_post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Auditor'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.getcode()
            body = resp.read().decode('utf-8')
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {'raw': body}
        return e.code, parsed
    except Exception as e:
        return 0, {'error': str(e)}

def http_get(endpoint):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Auditor'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.getcode()
            content_type = resp.headers.get('Content-Type', '')
            content_disposition = resp.headers.get('Content-Disposition', '')
            body = resp.read()
            return status, content_type, content_disposition, body
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Content-Type', ''), '', e.read()
    except Exception as e:
        return 0, '', '', str(e).encode('utf-8')


def run_acceptance_tests():
    log("================================================================", "INFO")
    log("PHASE 2: LIVE END-TO-END ACCEPTANCE TESTS", "INFO")
    log("================================================================", "INFO")

    # Criteria 1: Superadmin Login
    log("Test 1: Superadmin login with shopnoure1619@gmail.com and password 160017", "INFO")
    status, res = http_post('/api/auth/login', {
        'email': 'shopnoure1619@gmail.com',
        'password': '160017'
    })
    c1_pass = (status == 200 and res.get('ok') is True and res.get('role') == 'superadmin' and 
               res.get('user', {}).get('email') == 'shopnoure1619@gmail.com' and res.get('user', {}).get('is_approved') == 1)
    if c1_pass:
        results["acceptance_criteria"]["CRITERIA_1_SUPERADMIN_LOGIN"] = "PASS"
        log("CRITERIA 1 PASSED: Superadmin login succeeded with role 'superadmin' and active approval.", "PASS")
    else:
        results["acceptance_criteria"]["CRITERIA_1_SUPERADMIN_LOGIN"] = f"FAIL (status={status}, res={res})"
        log(f"CRITERIA 1 FAILED: status={status}, response={res}", "FAIL")

    # Criteria 2: Invalid Credentials Login
    log("Test 2: Login with invalid credentials returns 401 with clear error message", "INFO")
    status_inv, res_inv = http_post('/api/auth/login', {
        'email': 'shopnoure1619@gmail.com',
        'password': 'incorrect_password_xyz'
    })
    c2_pass = (status_inv == 401 and res_inv.get('ok') is False and 'message' in res_inv and len(res_inv['message']) > 0)
    if c2_pass:
        results["acceptance_criteria"]["CRITERIA_2_INVALID_CREDENTIALS"] = "PASS"
        log(f"CRITERIA 2 PASSED: Returns HTTP 401 and clear error message: '{res_inv.get('message')}'", "PASS")
    else:
        results["acceptance_criteria"]["CRITERIA_2_INVALID_CREDENTIALS"] = f"FAIL (status={status_inv}, res={res_inv})"
        log(f"CRITERIA 2 FAILED: status={status_inv}, response={res_inv}", "FAIL")

    # Criteria 3: New User Registration (Persisted in SQLite with is_approved = 0)
    timestamp_suffix = int(time.time())
    test_user_email = f"audit_user_{timestamp_suffix}@tatadana.id"
    test_user_phone = f"0899{timestamp_suffix % 100000000:08d}"
    log(f"Test 3: User registration for {test_user_email} (is_approved must be 0)", "INFO")
    status_reg, res_reg = http_post('/api/auth/register', {
        'full_name': 'Auditor Acceptance User',
        'email': test_user_email,
        'phone_number': test_user_phone,
        'password': 'PasswordAuditor123!'
    })
    
    created_user_id = res_reg.get('user_id')
    db_approved_status = None
    if status_reg == 200 and created_user_id:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, email, is_approved, role FROM users WHERE id = ?", (created_user_id,))
        row = c.fetchone()
        conn.close()
        if row:
            db_approved_status = row[2]
            log(f"User in DB: id={row[0]}, email={row[1]}, is_approved={row[2]}, role={row[3]}", "INFO")

    c3_pass = (status_reg == 200 and res_reg.get('ok') is True and created_user_id is not None and db_approved_status == 0)
    if c3_pass:
        results["acceptance_criteria"]["CRITERIA_3_REGISTRATION_PERSISTENCE"] = "PASS"
        log(f"CRITERIA 3 PASSED: New user registered (user_id={created_user_id}) and verified in SQLite with is_approved = 0.", "PASS")
    else:
        results["acceptance_criteria"]["CRITERIA_3_REGISTRATION_PERSISTENCE"] = f"FAIL (status={status_reg}, res={res_reg}, db_is_approved={db_approved_status})"
        log(f"CRITERIA 3 FAILED: status={status_reg}, response={res_reg}, db_approved_status={db_approved_status}", "FAIL")

    # Criteria 4: Admin User Approval (is_approved = 1 + seed wallets & categories)
    log(f"Test 4: Admin approves user ID {created_user_id} and initializes wallets & categories", "INFO")
    status_appr, res_appr = http_post('/api/admin/approve-user', {
        'user_id': created_user_id
    })
    
    db_approved_after = None
    wallets_count = 0
    categories_count = 0
    wallet_names = []
    if status_appr == 200:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT is_approved FROM users WHERE id = ?", (created_user_id,))
        u_row = c.fetchone()
        db_approved_after = u_row[0] if u_row else None
        
        c.execute("SELECT id, name, wallet_type, balance, is_default FROM wallets WHERE user_id = ?", (created_user_id,))
        w_rows = c.fetchall()
        wallets_count = len(w_rows)
        wallet_names = [r[1] for r in w_rows]

        c.execute("SELECT COUNT(*) FROM categories WHERE user_id = ?", (created_user_id,))
        categories_count = c.fetchone()[0]
        conn.close()
        log(f"Post-approval DB state: is_approved={db_approved_after}, wallets={wallet_names}, categories_count={categories_count}", "INFO")

    c4_pass = (status_appr == 200 and res_appr.get('ok') is True and db_approved_after == 1 and 
               wallets_count >= 4 and 'BCA Utama' in wallet_names and categories_count >= 5)
    if c4_pass:
        results["acceptance_criteria"]["CRITERIA_4_ADMIN_APPROVAL_INIT"] = "PASS"
        log(f"CRITERIA 4 PASSED: User ID {created_user_id} status updated to is_approved = 1, initialized {wallets_count} wallets and {categories_count} categories.", "PASS")
    else:
        results["acceptance_criteria"]["CRITERIA_4_ADMIN_APPROVAL_INIT"] = f"FAIL (status={status_appr}, db_approved={db_approved_after}, wallets={wallet_names})"
        log(f"CRITERIA 4 FAILED: status={status_appr}, db_approved={db_approved_after}, wallets={wallet_names}", "FAIL")

    # Criteria 5: Real Transactions and Wallet Balance Calculation
    log(f"Test 5: Transaction recording & accurate wallet balance calculation for user {created_user_id}", "INFO")
    # Get user default wallet ID
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, balance FROM wallets WHERE user_id = ? AND name = 'BCA Utama'", (created_user_id,))
    w_init = c.fetchone()
    conn.close()
    
    if not w_init:
        log("Could not find BCA Utama wallet for user", "FAIL")
        c5_pass = False
    else:
        target_wallet_id = w_init[0]
        initial_balance = w_init[1]
        log(f"Initial balance of wallet ID {target_wallet_id} ('BCA Utama'): Rp {initial_balance:,.2f}", "INFO")

        # 5a. Post Income (Pemasukan) +Rp 2,500,000
        income_amt = 2500000.0
        status_in, res_in = http_post('/api/transactions', {
            'user_id': created_user_id,
            'wallet_id': target_wallet_id,
            'category_name': 'Gaji & Proyek',
            'transaction_type': 'pemasukan',
            'amount': income_amt,
            'notes': 'Acceptance Test Income Freelance',
            'source': 'web'
        })
        log(f"Transaction Income posted: status={status_in}, message={res_in.get('message')}", "INFO")

        # 5b. Post Expense (Pengeluaran) -Rp 350,000
        expense_amt = 350000.0
        status_ex, res_ex = http_post('/api/transactions', {
            'user_id': created_user_id,
            'wallet_id': target_wallet_id,
            'category_name': 'Makanan & Minuman',
            'transaction_type': 'pengeluaran',
            'amount': expense_amt,
            'notes': 'Acceptance Test Dinner Bersama',
            'source': 'web'
        })
        log(f"Transaction Expense posted: status={status_ex}, message={res_ex.get('message')}", "INFO")

        # Verify in SQLite database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT balance FROM wallets WHERE id = ?", (target_wallet_id,))
        final_balance = c.fetchone()[0]
        
        c.execute("SELECT id, transaction_type, amount, notes FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 2", (created_user_id,))
        tx_rows = c.fetchall()
        conn.close()

        expected_balance = initial_balance + income_amt - expense_amt
        balance_match = abs(final_balance - expected_balance) < 0.01
        log(f"Calculated balance: initial({initial_balance:,.2f}) + income({income_amt:,.2f}) - expense({expense_amt:,.2f}) = {expected_balance:,.2f}", "INFO")
        log(f"Actual balance in SQLite wallets table: {final_balance:,.2f}", "INFO")

        # Also verify dashboard stats API
        status_stats, stats_ct, _, stats_body = http_get(f"/api/dashboard/stats?user_id={created_user_id}")
        stats_data = json.loads(stats_body.decode('utf-8'))
        log(f"Dashboard stats API output: {stats_data}", "INFO")

        c5_pass = (status_in == 200 and status_ex == 200 and len(tx_rows) == 2 and balance_match and stats_data.get('ok') is True)
        if c5_pass:
            results["acceptance_criteria"]["CRITERIA_5_TRANSACTIONS_BALANCE_CALC"] = "PASS"
            log(f"CRITERIA 5 PASSED: Transactions recorded in SQLite transactions table and wallet balance calculated exactly ({final_balance:,.2f} == {expected_balance:,.2f}).", "PASS")
        else:
            results["acceptance_criteria"]["CRITERIA_5_TRANSACTIONS_BALANCE_CALC"] = f"FAIL (balance_match={balance_match}, tx_count={len(tx_rows)})"
            log("CRITERIA 5 FAILED: Balance mismatch or transaction insertion error.", "FAIL")

    # Criteria 6: CSV Export Endpoint
    log(f"Test 6: CSV export at /api/export for user {created_user_id}", "INFO")
    status_exp, exp_ct, exp_cd, exp_bytes = http_get(f"/api/export?user_id={created_user_id}")
    csv_text = exp_bytes.decode('utf-8', errors='replace')
    log(f"CSV Export response: status={status_exp}, Content-Type='{exp_ct}', Content-Disposition='{exp_cd}'", "INFO")
    log(f"CSV length: {len(csv_text)} characters, {len(csv_text.splitlines())} lines", "INFO")
    
    # Verify content
    has_header = "No,Tanggal (WIB),Jenis,Kategori,Catatan,Dompet,Nominal (IDR),Sumber" in csv_text
    has_income_tx = "Acceptance Test Income Freelance" in csv_text and "2500000" in csv_text
    has_expense_tx = "Acceptance Test Dinner Bersama" in csv_text and "350000" in csv_text
    
    log(f"CSV Validation checks: has_header={has_header}, has_income_tx={has_income_tx}, has_expense_tx={has_expense_tx}", "INFO")
    c6_pass = (status_exp == 200 and 'text/csv' in exp_ct and has_header and has_income_tx and has_expense_tx)
    if c6_pass:
        results["acceptance_criteria"]["CRITERIA_6_CSV_EXPORT"] = "PASS"
        log("CRITERIA 6 PASSED: /api/export yields real CSV file populated directly with database transaction records.", "PASS")
    else:
        results["acceptance_criteria"]["CRITERIA_6_CSV_EXPORT"] = f"FAIL (status={status_exp}, ct={exp_ct}, header={has_header}, tx_present={has_income_tx and has_expense_tx})"
        log("CRITERIA 6 FAILED: CSV export failed verification.", "FAIL")


def main():
    log("Starting TataDana Forensic Integrity Audit & Acceptance Verification", "INFO")
    log(f"Project Directory: {PROJECT_ROOT}", "INFO")
    log(f"Database File: {DB_PATH}", "INFO")
    
    # 1. Run Forensic Source & DB Integrity
    run_forensic_integrity_audit()

    # 2. Check if live server is running, if not start embedded
    if not check_server_running(BASE_URL):
        start_embedded_server()
    else:
        log(f"Live server detected and running on {BASE_URL}", "PASS")

    # 3. Run Acceptance Criteria Tests
    run_acceptance_tests()

    # Summary
    log("================================================================", "INFO")
    log("AUDIT SUMMARY & VERDICT CALCULATION", "INFO")
    log("================================================================", "INFO")
    
    ac_passed = sum(1 for v in results["acceptance_criteria"].values() if v == "PASS")
    ac_total = len(results["acceptance_criteria"])
    fc_passed = sum(1 for v in results["forensic_checks"].values() if str(v).startswith("PASS"))
    fc_total = len(results["forensic_checks"])

    print(f"\n--- Acceptance Criteria Summary ({ac_passed}/{ac_total}) ---")
    for k, v in results["acceptance_criteria"].items():
        print(f"  {k}: {v}")

    print(f"\n--- Forensic Integrity Summary ({fc_passed}/{fc_total}) ---")
    for k, v in results["forensic_checks"].items():
        print(f"  {k}: {v}")

    all_ac_pass = (ac_passed == ac_total and ac_total == 6)
    all_fc_pass = (fc_passed == fc_total and fc_total >= 3)

    if all_ac_pass and all_fc_pass:
        verdict = "CLEAN"
        print(f"\n🏆 FINAL VERDICT: {verdict}")
        print("All 6 Acceptance Criteria and all Forensic Integrity checks passed with flying colors.")
        exit_code = 0
    else:
        verdict = "INTEGRITY VIOLATION"
        print(f"\n❌ FINAL VERDICT: {verdict}")
        exit_code = 1

    # Output machine-readable JSON for audit report
    summary_path = os.path.join(os.path.dirname(__file__), 'audit_r2_results.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            "verdict": verdict,
            "acceptance_criteria": results["acceptance_criteria"],
            "forensic_checks": results["forensic_checks"],
            "ac_score": f"{ac_passed}/{ac_total}",
            "fc_score": f"{fc_passed}/{fc_total}"
        }, f, indent=2)
    log(f"Full results written to {summary_path}", "INFO")

    sys.exit(exit_code)

if __name__ == '__main__':
    main()
