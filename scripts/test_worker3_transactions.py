# -*- coding: utf-8 -*-
"""
Test Suite for Worker 3: Real Transactions, Wallets & Cash Flow Engine.
Verifies:
1. Initial wallet balance reading from SQLite DB.
2. Expense transaction posting via POST /api/transactions genuinely decrementing wallet balance.
3. Income transaction posting via POST /api/transactions genuinely incrementing wallet balance.
4. Live cash flow calculation at GET /api/dashboard/stats (total_saldo, pemasukan, pengeluaran, budget_tersisa).
5. Category budget tracking at GET /api/budgets.
6. Multi-wallet transfer at POST /api/wallets/transfer conserving total balance.
7. Validation on negative/zero amounts and invalid transaction types.
"""

import sys
import os
import json
import sqlite3
import threading
import time
import socketserver
import urllib.request
import urllib.error

# Set UTF-8 encoding for stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')

sys.path.insert(0, PROJECT_ROOT)
import server

TEST_PORT = 3003
SERVER_URL = f"http://localhost:{TEST_PORT}"
httpd = None

def start_test_server():
    global httpd
    os.chdir(PROJECT_ROOT)
    server.init_db()
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('', TEST_PORT), server.TataDanaRequestHandler)
    httpd.serve_forever()

def api_get(endpoint):
    url = f"{SERVER_URL}{endpoint}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Worker3Test'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.getcode(), json.loads(resp.read().decode('utf-8'))

def api_post(endpoint, payload):
    url = f"{SERVER_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Worker3Test'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.getcode(), json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8'))
        return e.code, body

def main():
    print("======================================================================")
    print("  Worker 3: Real Transactions & Wallets Verification Test")
    print(f"  Project Root: {PROJECT_ROOT}")
    print(f"  Database    : {DB_PATH}")
    print("======================================================================")

    # 1. Start server on TEST_PORT in background thread
    t = threading.Thread(target=start_test_server, daemon=True)
    t.start()
    time.sleep(1.0)
    print(f"[*] Background test server active on {SERVER_URL}")

    passed = 0
    failed = 0

    def assert_test(condition, title, details=""):
        nonlocal passed, failed
        if condition:
            print(f"  ✅ [PASS] {title}")
            if details:
                print(f"       -> {details}")
            passed += 1
        else:
            print(f"  ❌ [FAIL] {title}")
            if details:
                print(f"       -> {details}")
            failed += 1

    # -------------------------------------------------------------------------
    # TEST 1: Database Initialization & Tables Check
    # -------------------------------------------------------------------------
    print("\n--- TEST 1: Inspect SQLite Schema & Initial Data ---")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    assert_test('wallets' in tables and 'transactions' in tables and 'categories' in tables and 'users' in tables,
                "Required SQLite tables exist (wallets, transactions, categories, users)",
                f"Tables: {tables}")

    admin = c.execute("SELECT * FROM users WHERE email='shopnoure1619@gmail.com'").fetchone()
    assert_test(admin is not None and admin['role'] == 'superadmin',
                "Master Superadmin shopnoure1619@gmail.com present in database",
                f"Admin ID: {admin['id'] if admin else 'None'}")
    user_id = admin['id'] if admin else 1

    # -------------------------------------------------------------------------
    # TEST 2: Read Initial Wallet Balance & Dashboard Stats
    # -------------------------------------------------------------------------
    print("\n--- TEST 2: Read Initial Wallets & Stats ---")
    code, w_res = api_get(f"/api/wallets?user_id={user_id}")
    assert_test(code == 200 and w_res.get('ok') is True, "GET /api/wallets returns 200 OK")
    
    wallets = w_res.get('wallets', [])
    assert_test(len(wallets) >= 1, f"User {user_id} has at least 1 wallet", f"Found {len(wallets)} wallets")
    
    target_wallet = wallets[0]
    wallet_id = target_wallet['id']
    wallet_name = target_wallet['name']
    init_balance = float(target_wallet['balance'])
    print(f"  [*] Target Wallet: '{wallet_name}' (ID: {wallet_id}) with Balance: Rp {init_balance:,.2f}")

    code, s_res = api_get(f"/api/dashboard/stats?user_id={user_id}")
    assert_test(code == 200 and s_res.get('ok') is True, "GET /api/dashboard/stats returns 200 OK")
    init_total_saldo = float(s_res['total_saldo'])
    init_income = float(s_res['pemasukan'])
    init_expense = float(s_res['pengeluaran'])
    init_budget_remaining = float(s_res['budget_tersisa'])
    total_budget = float(s_res['total_budget'])
    print(f"  [*] Initial Stats: Saldo=Rp {init_total_saldo:,.0f}, Pemasukan=Rp {init_income:,.0f}, Pengeluaran=Rp {init_expense:,.0f}, Sisa Budget=Rp {init_budget_remaining:,.0f}")

    # -------------------------------------------------------------------------
    # TEST 3: Post Real Expense Transaction -> Verify Balance Decrement
    # -------------------------------------------------------------------------
    print("\n--- TEST 3: Real Expense Transaction (Pengeluaran) ---")
    expense_amount = 250000.0
    expense_payload = {
        'user_id': user_id,
        'wallet_id': wallet_id,
        'category_name': 'Makanan & Minuman',
        'transaction_type': 'pengeluaran',
        'amount': expense_amount,
        'notes': 'Uji Pengeluaran Engineering Lunch Worker 3',
        'source': 'web'
    }
    code, exp_res = api_post("/api/transactions", expense_payload)
    assert_test(code == 200 and exp_res.get('ok') is True, "POST /api/transactions (pengeluaran) returns 200 OK")
    
    expected_bal_after_exp = init_balance - expense_amount
    assert_test(abs(exp_res.get('new_balance', 0) - expected_bal_after_exp) < 0.01,
                f"Response reports wallet balance decremented by exact Rp {expense_amount:,.0f}",
                f"New balance in response: Rp {exp_res.get('new_balance'):,.2f} == Expected: Rp {expected_bal_after_exp:,.2f}")

    # Verify directly in SQLite DB
    c.execute("SELECT balance FROM wallets WHERE id = ?", (wallet_id,))
    db_bal_after_exp = c.fetchone()['balance']
    assert_test(abs(db_bal_after_exp - expected_bal_after_exp) < 0.01,
                "Direct SQLite check: wallet balance decremented genuinely in 'wallets' table",
                f"DB Balance: Rp {db_bal_after_exp:,.2f}")

    tx_id = exp_res.get('transaction_id')
    c.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
    db_tx = c.fetchone()
    assert_test(db_tx is not None and db_tx['amount'] == expense_amount and db_tx['transaction_type'] == 'pengeluaran',
                "Direct SQLite check: transaction recorded in 'transactions' table with genuine fields",
                f"Tx ID: {db_tx['id']}, Amount: Rp {db_tx['amount']:,.0f}, Type: {db_tx['transaction_type']}")

    # -------------------------------------------------------------------------
    # TEST 4: Post Real Income Transaction -> Verify Balance Increment
    # -------------------------------------------------------------------------
    print("\n--- TEST 4: Real Income Transaction (Pemasukan) ---")
    income_amount = 1750000.0
    income_payload = {
        'user_id': user_id,
        'wallet_id': wallet_id,
        'category_name': 'Gaji & Proyek',
        'transaction_type': 'pemasukan',
        'amount': income_amount,
        'notes': 'Uji Pemasukan Bonus Project Worker 3',
        'source': 'web'
    }
    code, inc_res = api_post("/api/transactions", income_payload)
    assert_test(code == 200 and inc_res.get('ok') is True, "POST /api/transactions (pemasukan) returns 200 OK")

    expected_bal_after_inc = expected_bal_after_exp + income_amount
    assert_test(abs(inc_res.get('new_balance', 0) - expected_bal_after_inc) < 0.01,
                f"Response reports wallet balance incremented by exact Rp {income_amount:,.0f}",
                f"New balance in response: Rp {inc_res.get('new_balance'):,.2f} == Expected: Rp {expected_bal_after_inc:,.2f}")

    # Verify directly in SQLite DB
    c.execute("SELECT balance FROM wallets WHERE id = ?", (wallet_id,))
    db_bal_after_inc = c.fetchone()['balance']
    assert_test(abs(db_bal_after_inc - expected_bal_after_inc) < 0.01,
                "Direct SQLite check: wallet balance incremented genuinely in 'wallets' table",
                f"DB Balance: Rp {db_bal_after_inc:,.2f}")

    # -------------------------------------------------------------------------
    # TEST 5: Verify Live Cash Flow Reflection in /api/dashboard/stats
    # -------------------------------------------------------------------------
    print("\n--- TEST 5: Verify /api/dashboard/stats Live Calculation ---")
    code, new_stats = api_get(f"/api/dashboard/stats?user_id={user_id}")
    assert_test(code == 200 and new_stats.get('ok') is True, "GET /api/dashboard/stats returns updated stats")

    expected_total_saldo = init_total_saldo - expense_amount + income_amount
    expected_expense = init_expense + expense_amount
    expected_income = init_income + income_amount
    expected_budget_rem = max(0.0, total_budget - expected_expense)

    assert_test(abs(new_stats['total_saldo'] - expected_total_saldo) < 0.01,
                f"total_saldo updated correctly by net amount (diff: {new_stats['total_saldo'] - init_total_saldo:+,.0f})",
                f"Current: Rp {new_stats['total_saldo']:,.0f} == Expected: Rp {expected_total_saldo:,.0f}")

    assert_test(abs(new_stats['pengeluaran'] - expected_expense) < 0.01,
                f"pengeluaran incremented by Rp {expense_amount:,.0f}",
                f"Current: Rp {new_stats['pengeluaran']:,.0f} == Expected: Rp {expected_expense:,.0f}")

    assert_test(abs(new_stats['pemasukan'] - expected_income) < 0.01,
                f"pemasukan incremented by Rp {income_amount:,.0f}",
                f"Current: Rp {new_stats['pemasukan']:,.0f} == Expected: Rp {expected_income:,.0f}")

    assert_test(abs(new_stats['budget_tersisa'] - expected_budget_rem) < 0.01,
                "budget_tersisa accurately recalculated as max(0, total_budget - expense)",
                f"Current: Rp {new_stats['budget_tersisa']:,.0f} == Expected: Rp {expected_budget_rem:,.0f}")

    # -------------------------------------------------------------------------
    # TEST 6: Verify Live Budgets Calculation in /api/budgets
    # -------------------------------------------------------------------------
    print("\n--- TEST 6: Verify /api/budgets Spent Calculation ---")
    code, b_res = api_get(f"/api/budgets?user_id={user_id}")
    assert_test(code == 200 and b_res.get('ok') is True, "GET /api/budgets returns 200 OK")
    
    budgets = {b['name']: b for b in b_res.get('budgets', [])}
    makan_cat = budgets.get('Makanan & Minuman')
    assert_test(makan_cat is not None and makan_cat['spent'] >= expense_amount,
                "Category 'Makanan & Minuman' reflects real spent amount from transactions",
                f"Spent: Rp {makan_cat['spent']:,.0f} / Limit: Rp {makan_cat['budget_limit']:,.0f}" if makan_cat else "None")

    # -------------------------------------------------------------------------
    # TEST 7: Verify Wallet-to-Wallet Transfer & Conservation of Total Saldo
    # -------------------------------------------------------------------------
    print("\n--- TEST 7: Multi-Wallet Transfer & Balance Conservation ---")
    if len(wallets) >= 2:
        from_w = wallets[0]['id']
        to_w = wallets[1]['id']
        transfer_amt = 100000.0

        c.execute("SELECT balance FROM wallets WHERE id = ?", (from_w,))
        from_before = c.fetchone()['balance']
        c.execute("SELECT balance FROM wallets WHERE id = ?", (to_w,))
        to_before = c.fetchone()['balance']

        code, xfer_res = api_post("/api/wallets/transfer", {
            'user_id': user_id,
            'from_wallet_id': from_w,
            'to_wallet_id': to_w,
            'amount': transfer_amt
        })
        assert_test(code == 200 and xfer_res.get('ok') is True, "POST /api/wallets/transfer returns 200 OK", xfer_res.get('message'))

        c.execute("SELECT balance FROM wallets WHERE id = ?", (from_w,))
        from_after = c.fetchone()['balance']
        c.execute("SELECT balance FROM wallets WHERE id = ?", (to_w,))
        to_after = c.fetchone()['balance']

        assert_test(abs(from_after - (from_before - transfer_amt)) < 0.01 and abs(to_after - (to_before + transfer_amt)) < 0.01,
                    f"Transfer shifted Rp {transfer_amt:,.0f} genuinely from Wallet {from_w} to Wallet {to_w}",
                    f"From: {from_before:,.0f} -> {from_after:,.0f}, To: {to_before:,.0f} -> {to_after:,.0f}")
        
        # Verify total balance is conserved
        c.execute("SELECT SUM(balance) as total FROM wallets WHERE user_id = ?", (user_id,))
        net_after_xfer = c.fetchone()['total']
        assert_test(abs(net_after_xfer - expected_total_saldo) < 0.01,
                    "Total saldo is perfectly conserved across wallet transfer",
                    f"Total Saldo: Rp {net_after_xfer:,.0f}")
    else:
        print("  [*] Skipped transfer test (fewer than 2 wallets)")

    # -------------------------------------------------------------------------
    # TEST 8: Input Validations (Negative, Zero, Invalid Type)
    # -------------------------------------------------------------------------
    print("\n--- TEST 8: Input Validations & Error Handling ---")
    c_zero, r_zero = api_post("/api/transactions", {'user_id': user_id, 'amount': 0, 'transaction_type': 'pengeluaran'})
    assert_test(c_zero == 400 and r_zero.get('ok') is False, "Zero amount rejected with 400 Bad Request", r_zero.get('message'))

    c_neg, r_neg = api_post("/api/transactions", {'user_id': user_id, 'amount': -50000, 'transaction_type': 'pengeluaran'})
    assert_test(c_neg == 400 and r_neg.get('ok') is False, "Negative amount rejected with 400 Bad Request", r_neg.get('message'))

    c_bad, r_bad = api_post("/api/transactions", {'user_id': user_id, 'amount': 50000, 'transaction_type': 'invalid_type'})
    assert_test(c_bad == 400 and r_bad.get('ok') is False, "Invalid transaction type rejected with 400 Bad Request", r_bad.get('message'))

    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------
    conn.close()
    print("\n======================================================================")
    print(f"  TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("======================================================================")
    if failed == 0:
        print("  🎉 ALL WORKER 3 REAL TRANSACTION & WALLET TESTS PASSED PERFECTLY!")
        sys.exit(0)
    else:
        print(f"  ❌ {failed} test(s) failed.")
        sys.exit(1)

if __name__ == '__main__':
    main()
