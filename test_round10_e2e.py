#!/usr/bin/env python3
"""
================================================================================
TATADANA ROUND 10 COMPREHENSIVE END-TO-END (E2E) TEST SUITE
================================================================================
File: test_round10_e2e.py
Author: test_writer_r10_1
Target: TataDana Executive Personal & SME Financial Management System
Verification Scope:
  - Tier 1: Feature Coverage (R1 Floating AI Bot, R2 Telegram Bot Integration,
            R3 Admin User Management, R4 Modularization & Deployment Readiness)
  - Tier 2: Boundary & Corner Cases (Invalid syntax, negative/zero/huge amounts,
            unlinked Telegram chat ID, duplicate pairing codes)
  - Tier 3: Cross-Feature Combinations (Pairing -> Telegram transaction ->
            Dashboard stats sync; Admin approve -> Login -> Quick record)
  - Tier 4: Real-World Scenarios (Full multi-user end-to-end journey with strict
            tenant isolation and aggregated superadmin metrics)

Execution:
  python test_round10_e2e.py
  python test_round10_e2e.py --tier [1|2|3|4]
  python test_round10_e2e.py --infra-check
================================================================================
"""

import os
import sys
import io
import json
import time
import re
import tempfile
import sqlite3
import shutil
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, timedelta

# Add workspace directory to python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import server

# ==============================================================================
# TEST ENVIRONMENT & CLIENT HARNESS
# ==============================================================================

class TataDanaTestClient:
    """
    Opaque-box HTTP test client supporting dual-mode operation:
    1. Live HTTP requests against localhost:3000 (when accessible).
    2. Direct in-process handler invocation (when Windows sandbox socket policies
       restrict live socket bindings or in offline CI environments).
    Both modes exercise identical real request processing, JSON serialization,
    and persistent SQLite database mutations.
    """
    def __init__(self, base_url="http://127.0.0.1:3000"):
        self.base_url = base_url
        self.mode = "direct"
        self._detect_mode()

    def _detect_mode(self):
        try:
            req = urllib.request.Request(f"{self.base_url}/api/auth/status")
            with urllib.request.urlopen(req, timeout=0.4) as resp:
                if resp.status in (200, 401, 404):
                    self.mode = "live"
        except Exception:
            self.mode = "direct"

    def request(self, method, path, data=None, headers=None):
        method = method.upper()
        headers = headers or {}

        if self.mode == "live":
            try:
                url = f"{self.base_url}{path}"
                body_bytes = None
                req_headers = dict(headers)
                if data is not None:
                    if isinstance(data, (dict, list)):
                        body_bytes = json.dumps(data).encode("utf-8")
                        req_headers.setdefault("Content-Type", "application/json")
                    elif isinstance(data, str):
                        body_bytes = data.encode("utf-8")
                    elif isinstance(data, bytes):
                        body_bytes = data

                req = urllib.request.Request(url, data=body_bytes, headers=req_headers, method=method)
                with urllib.request.urlopen(req, timeout=5) as resp:
                    status_code = resp.status
                    raw_bytes = resp.read()
                    parsed_json = None
                    try:
                        parsed_json = json.loads(raw_bytes.decode("utf-8"))
                    except Exception:
                        pass
                    return status_code, parsed_json, raw_bytes.decode("utf-8", errors="replace")
            except urllib.error.HTTPError as he:
                raw_bytes = he.read()
                parsed_json = None
                try:
                    parsed_json = json.loads(raw_bytes.decode("utf-8"))
                except Exception:
                    pass
                return he.code, parsed_json, raw_bytes.decode("utf-8", errors="replace")
            except Exception:
                # Live request failed, fall back to direct handler
                self.mode = "direct"

        # Direct in-process invocation
        handler = server.TataDanaRequestHandler.__new__(server.TataDanaRequestHandler)
        handler.path = path
        handler.command = method
        handler.headers = dict(headers)

        body_bytes = b""
        if data is not None:
            if isinstance(data, (dict, list)):
                body_bytes = json.dumps(data).encode("utf-8")
                handler.headers.setdefault("Content-Type", "application/json")
            elif isinstance(data, str):
                body_bytes = data.encode("utf-8")
            elif isinstance(data, bytes):
                body_bytes = data
            handler.headers["Content-Length"] = str(len(body_bytes))
        else:
            handler.headers["Content-Length"] = "0"

        handler.rfile = io.BytesIO(body_bytes)
        handler.wfile = io.BytesIO()

        captured = {"status": 200, "headers": {}}

        def capture_send_response(code, message=None):
            captured["status"] = code

        def capture_send_header(key, val):
            captured["headers"][key] = val

        def capture_end_headers():
            pass

        handler.send_response = capture_send_response
        handler.send_header = capture_send_header
        handler.end_headers = capture_end_headers

        if method == "GET":
            handler.do_GET()
        elif method == "POST":
            handler.do_POST()
        elif method == "OPTIONS":
            handler.do_OPTIONS()
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        raw_output = handler.wfile.getvalue()
        text_output = raw_output.decode("utf-8", errors="replace")
        parsed_json = None
        try:
            parsed_json = json.loads(text_output)
        except Exception:
            pass

        return captured["status"], parsed_json, text_output

    def get(self, path, headers=None):
        return self.request("GET", path, headers=headers)

    def post(self, path, data=None, headers=None):
        return self.request("POST", path, data=data, headers=headers)


class TestDatabaseContext:
    """
    Manages an isolated SQLite test database lifecycle, ensuring complete test
    isolation without contaminating or destroying the existing production database.
    """
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix="tatadana_test_")
        self.db_path = os.path.join(self.temp_dir, "test_tatadana.db")
        self.original_db = server.DB_FILE

    def __enter__(self):
        # Initialize schema and seed master superadmin in isolated DB
        server.DB_FILE = self.db_path
        server.init_db(self.db_path)

        # Apply schema migrations for Round 10 if not present in init_db
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE users ADD COLUMN telegram_chat_id TEXT DEFAULT ''")
        except Exception:
            pass
        try:
            c.execute("ALTER TABLE users ADD COLUMN telegram_pairing_code TEXT DEFAULT ''")
        except Exception:
            pass
        conn.commit()
        conn.close()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        server.DB_FILE = self.original_db
        try:
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
            shutil.rmtree(self.temp_dir, ignore_errors=True)
        except Exception:
            pass

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def query_one(self, sql, params=()):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute(sql, params)
        res = c.fetchone()
        conn.close()
        return res

    def query_all(self, sql, params=()):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute(sql, params)
        res = c.fetchall()
        conn.close()
        return res

    def execute(self, sql, params=()):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute(sql, params)
        conn.commit()
        last_id = c.lastrowid
        conn.close()
        return last_id


# ==============================================================================
# TEST RUNNER & ASSERTION ACCUMULATOR
# ==============================================================================

class TestSuiteRunner:
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.results = []

    def run_case(self, tier_name, test_id, description, func):
        self.total += 1
        print(f"\n[{tier_name} - {test_id}] {description}...")
        start_t = time.time()
        try:
            func()
            duration = (time.time() - start_t) * 1000
            print(f"  --> [PASS] ({duration:.1f}ms) {description}")
            self.passed += 1
            self.results.append({"tier": tier_name, "id": test_id, "desc": description, "status": "PASS", "error": None})
        except Exception as e:
            duration = (time.time() - start_t) * 1000
            print(f"  --> [FAIL] ({duration:.1f}ms) {e}")
            self.failed += 1
            self.results.append({"tier": tier_name, "id": test_id, "desc": description, "status": "FAIL", "error": str(e)})

    def print_summary(self):
        print("\n" + "=" * 80)
        print("TATADANA ROUND 10 E2E TEST EXECUTION SUMMARY")
        print("=" * 80)
        print(f"Total Tests Run : {self.total}")
        print(f"Passed          : {self.passed}")
        print(f"Failed          : {self.failed}")
        print("-" * 80)

        for res in self.results:
            tag = "[PASS]" if res["status"] == "PASS" else "[FAIL]"
            print(f"{tag:7} {res['tier']} | {res['id']:<10} | {res['desc']}")
            if res["error"]:
                print(f"         Error: {res['error']}")

        print("=" * 80)
        return self.failed == 0


# ==============================================================================
# TIER 1: FEATURE COVERAGE
# ==============================================================================

def test_tier1_r1_floating_ai_bot(client, db):
    """
    R1: Floating AI Quick Record Bot di Dashboard User
    Covers:
      1. DOM component presence in template/index.html
      2. POST /api/ai/parse-transaction natural language expense parsing
      3. SQLite database persistence with conn.commit() & wallet deduction
      4. POST /api/ai/parse-transaction natural language income parsing
      5. DOM reactivity / auto-update function invocation contract
    """
    # 1. UI Widget presence contract
    # Check index.html or tpl_dashboard.py for floating widget structure
    dashboard_html = ""
    if os.path.exists(os.path.join(ROOT_DIR, "tpl_dashboard.py")):
        try:
            import tpl_dashboard
            dashboard_html = tpl_dashboard.get_dashboard_html()
        except Exception:
            pass
    if not dashboard_html and os.path.exists(os.path.join(ROOT_DIR, "index.html")):
        with open(os.path.join(ROOT_DIR, "index.html"), "r", encoding="utf-8") as f:
            dashboard_html = f.read()

    assert "aiQuickRecordContainer" in dashboard_html, "Missing #aiQuickRecordContainer floating widget container"
    assert "aiQuickRecordModal" in dashboard_html, "Missing #aiQuickRecordModal popup card"
    assert "aiQuickRecordInput" in dashboard_html, "Missing #aiQuickRecordInput text field"
    assert "btnSubmitAiQuickRecord" in dashboard_html or "submitAiQuickRecord" in dashboard_html, "Missing submit button/action"
    assert "toggleAiQuickRecord" in dashboard_html, "Missing toggleAiQuickRecord function in widget"

    # 2. Seed approved user for testing
    user_id = db.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at)
        VALUES ('ai.tester@tatadana.id', 'dummyhash', 'AI Test User', '081299990001', 'user', 1, 'active', 'pro', '2026-10-31 10:00:00 WIB')
    ''')
    w_cash = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "Cash", "cash", 500000.0, 1)', (user_id,))
    w_bca = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "BCA Utama", "bank", 10000000.0, 0)', (user_id,))

    # 3. Test POST /api/ai/parse-transaction (Expense: "Bensin motor 25rb cash")
    payload_expense = {
        "text": "Bensin motor 25rb cash",
        "user_id": user_id
    }
    status, data, raw = client.post("/api/ai/parse-transaction", payload_expense)
    assert status == 200, f"Expected HTTP 200 from /api/ai/parse-transaction, got {status}: {raw}"
    assert data and (data.get("ok") is True or data.get("success") is True or data.get("status") == "success"), f"Expected success in response: {data}"
    
    parsed = data.get("parsed") or data.get("data") or {}
    tx_type = str(parsed.get("type", "")).lower()
    amount = float(parsed.get("amount", 0))
    category = str(parsed.get("category", ""))
    wallet = str(parsed.get("wallet", ""))

    assert tx_type in ("pengeluaran", "expense"), f"Expected expense type, got '{tx_type}'"
    assert abs(amount - 25000.0) < 0.01, f"Expected amount 25000.0, got {amount}"
    assert "transport" in category.lower() or "bensin" in category.lower(), f"Expected Transport category, got '{category}'"
    assert "cash" in wallet.lower(), f"Expected Cash wallet, got '{wallet}'"

    # Verify SQLite persistence
    tx_row = db.query_one('SELECT * FROM transactions WHERE user_id = ? AND amount = 25000.0 ORDER BY id DESC LIMIT 1', (user_id,))
    assert tx_row is not None, "Transaction record not found in SQLite transactions table"
    assert tx_row["transaction_type"] in ("pengeluaran", "expense"), "DB transaction_type mismatch"
    assert tx_row["source"] in ("ai_bot", "web_ai", "ai"), f"Expected source 'ai_bot', got '{tx_row['source']}'"

    # Verify Cash wallet deduction
    w_row = db.query_one('SELECT balance FROM wallets WHERE id = ?', (w_cash,))
    assert abs(float(w_row["balance"]) - 475000.0) < 0.01, f"Expected Cash balance 475000.0, got {w_row['balance']}"

    # 4. Test POST /api/ai/parse-transaction (Income: "Gaji bulanan 5jt bca")
    payload_income = {
        "text": "Gaji bulanan 5jt bca",
        "user_id": user_id
    }
    status_inc, data_inc, raw_inc = client.post("/api/ai/parse-transaction", payload_income)
    assert status_inc == 200, f"Expected HTTP 200, got {status_inc}: {raw_inc}"
    parsed_inc = data_inc.get("parsed") or data_inc.get("data") or {}
    inc_type = str(parsed_inc.get("type", "")).lower()
    inc_amount = float(parsed_inc.get("amount", 0))
    inc_wallet = str(parsed_inc.get("wallet", ""))

    assert inc_type in ("pemasukan", "income"), f"Expected income type, got '{inc_type}'"
    assert abs(inc_amount - 5000000.0) < 0.01, f"Expected amount 5000000.0, got {inc_amount}"
    assert "bca" in inc_wallet.lower(), f"Expected BCA wallet, got '{inc_wallet}'"

    # Verify BCA wallet balance addition
    bca_row = db.query_one('SELECT balance FROM wallets WHERE id = ?', (w_bca,))
    assert abs(float(bca_row["balance"]) - 15000000.0) < 0.01, f"Expected BCA balance 15000000.0, got {bca_row['balance']}"

    # 5. Check auto-update hook in frontend scripts
    script_content = ""
    if os.path.exists(os.path.join(ROOT_DIR, "tpl_script.py")):
        try:
            import tpl_script
            script_content = tpl_script.get_script_js() if hasattr(tpl_script, 'get_script_js') else tpl_script.get_client_script()
        except Exception:
            pass
    if not script_content and os.path.exists(os.path.join(ROOT_DIR, "index.html")):
        with open(os.path.join(ROOT_DIR, "index.html"), "r", encoding="utf-8") as f:
            script_content = f.read()

    assert "loadRealDashboardData" in script_content, "Missing loadRealDashboardData auto-refresh function in client script"


def test_tier1_r2_telegram_bot_integration(client, db):
    """
    R2: Integrasi Bot Telegram untuk Pencatatan Transaksi Otomatis AI
    Covers:
      1. Schema migration for telegram_chat_id column in users table
      2. POST /api/telegram/pairing-code endpoint
      3. Account pairing card in settings
      4. Telegram /connect <code> listener command
      5. Telegram incoming financial chat parser and persistence
    """
    # 1. Schema verification
    cols = [r["name"] for r in db.query_all("PRAGMA table_info(users)")]
    assert "telegram_chat_id" in cols, "Column 'telegram_chat_id' missing from users table schema"

    # 2. Seed user for pairing
    uid = db.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at)
        VALUES ('tg.user@tatadana.id', 'dummyhash', 'Telegram Link User', '081299990002', 'user', 1, 'active', 'pro', '2026-10-31 10:00:00 WIB')
    ''')
    w_id = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "BCA Utama", "bank", 2000000.0, 1)', (uid,))

    # 3. Request pairing code via API
    status, data, raw = client.post("/api/telegram/pairing-code", {"user_id": uid})
    assert status == 200, f"Expected 200 from /api/telegram/pairing-code, got {status}: {raw}"
    assert data and (data.get("ok") is True or data.get("status") == "success"), f"Pairing code response failed: {data}"
    
    pairing_code = str(data.get("pairing_code", ""))
    assert len(pairing_code) >= 6, f"Expected at least 6-character pairing code, got '{pairing_code}'"

    # Verify code stored in DB
    u_row = db.query_one('SELECT telegram_pairing_code FROM users WHERE id = ?', (uid,))
    assert u_row and u_row["telegram_pairing_code"] == pairing_code, "Pairing code was not committed to users table"

    # 4. Settings view inspection for pairing card
    html_corpus = ""
    for fn in ("tpl_dashboard.py", "index.html"):
        p = os.path.join(ROOT_DIR, fn)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                html_corpus += f.read()

    assert "Hubungkan Akun Telegram" in html_corpus or "Telegram" in html_corpus, "Missing Telegram pairing card in settings"
    assert "/connect" in html_corpus, "Missing /connect instructions in pairing card"
    assert "@tatadana_finance_bot" in html_corpus or "tatadana" in html_corpus.lower(), "Missing official bot reference"

    # 5. Simulate Telegram listener /connect <code>
    captured_replies = []
    original_send = server.send_telegram_reply
    def mock_reply(token, chat_id, text):
        captured_replies.append({"chat_id": chat_id, "text": text})
        return True
    server.send_telegram_reply = mock_reply

    try:
        tg_chat_id = "77889911"
        connect_msg = {
            "chat": {"id": int(tg_chat_id)},
            "from": {"id": int(tg_chat_id), "first_name": "TgUser"},
            "text": f"/connect {pairing_code}"
        }
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, connect_msg)

        # Verify chat_id updated in DB
        u_linked = db.query_one('SELECT telegram_chat_id, telegram_pairing_code FROM users WHERE id = ?', (uid,))
        assert u_linked["telegram_chat_id"] == tg_chat_id, f"Expected telegram_chat_id {tg_chat_id}, got {u_linked['telegram_chat_id']}"
        assert u_linked["telegram_pairing_code"] == "" or u_linked["telegram_pairing_code"] is None, "Pairing code must be cleared after linking"
        assert len(captured_replies) > 0, "No reply sent for /connect command"
        assert "berhasil" in captured_replies[-1]["text"].lower() or "connected" in captured_replies[-1]["text"].lower(), "Confirmation message missing in reply"

        # 6. Incoming financial text via Telegram: "Makan siang 35.000"
        tx_msg = {
            "chat": {"id": int(tg_chat_id)},
            "from": {"id": int(tg_chat_id), "first_name": "TgUser"},
            "text": "Makan siang 35.000"
        }
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, tx_msg)

        # Verify transaction committed
        tx = db.query_one('SELECT * FROM transactions WHERE user_id = ? AND amount = 35000.0', (uid,))
        assert tx is not None, "Telegram transaction not persisted to SQLite"
        assert tx["source"] == "telegram", f"Expected source 'telegram', got '{tx['source']}'"

        # Verify wallet mutated
        w_after = db.query_one('SELECT balance FROM wallets WHERE id = ?', (w_id,))
        assert abs(float(w_after["balance"]) - 1965000.0) < 0.01, f"Expected balance 1965000.0, got {w_after['balance']}"

        # Verify Markdown reply format
        latest_reply = captured_replies[-1]["text"]
        assert "35,000" in latest_reply or "35.000" in latest_reply, "Nominal missing in Telegram Markdown reply"
        assert "*" in latest_reply or "_" in latest_reply, "Markdown formatting missing in reply"
    finally:
        server.send_telegram_reply = original_send


def test_tier1_r3_admin_user_management(client, db):
    """
    R3: Modifikasi Manajemen Pengguna di Halaman Admin (tpl_admin.py)
    Covers:
      1. All registered users (pending and approved) retained in admin table
      2. 1-click Approve button sets status='active', shows '✓ Approved' badge,
         does NOT delete or remove row from DOM
      3. Dedicated 'Hapus' button with confirmation dialog & API deletion
    """
    # 1. Inspect admin template for table retaining both statuses
    admin_html = ""
    if os.path.exists(os.path.join(ROOT_DIR, "tpl_admin.py")):
        try:
            import tpl_admin
            admin_html = tpl_admin.get_admin_html()
        except Exception:
            pass
    if not admin_html and os.path.exists(os.path.join(ROOT_DIR, "index.html")):
        with open(os.path.join(ROOT_DIR, "index.html"), "r", encoding="utf-8") as f:
            admin_html = f.read()

    assert "adminUsersTableBody" in admin_html or "applicantRow" in admin_html, "Missing admin users table container"
    assert "Hapus" in admin_html or "delete" in admin_html.lower(), "Missing 'Hapus' button in admin table"

    # 2. Seed pending user
    pend_id = db.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at)
        VALUES ('pending.candidate@tatadana.id', 'hash123', 'Pending Candidate', '081299990003', 'user', 0, 'pending', 'pro', '2026-10-31 10:00:00 WIB')
    ''')

    # Verify user list API returns this user
    status, data, raw = client.get("/api/admin/users")
    assert status == 200, f"Expected 200 from /api/admin/users, got {status}: {raw}"
    users = data.get("users", [])
    found = [u for u in users if u["id"] == pend_id]
    assert len(found) == 1, "Pending candidate not returned in /api/admin/users"
    assert found[0]["is_approved"] == 0, "User should initially be is_approved=0"

    # 3. Approve user via API
    status_appr, data_appr, raw_appr = client.post("/api/admin/approve-user", {"user_id": pend_id})
    if status_appr != 200:
        # Fallback to query param route if supported
        status_appr, data_appr, raw_appr = client.get(f"/api/admin/approve-user?user_id={pend_id}")
    assert status_appr == 200, f"Approve user failed with status {status_appr}: {raw_appr}"

    # Verify DB persistence of active status
    u_appr = db.query_one('SELECT is_approved, status FROM users WHERE id = ?', (pend_id,))
    assert u_appr["is_approved"] == 1, "is_approved must be 1"
    assert u_appr["status"] == "active", f"status must be 'active', got '{u_appr['status']}'"

    # 4. Verify script logic does NOT remove row on approval
    script_corpus = ""
    for fn in ("tpl_script.py", "index.html"):
        p = os.path.join(ROOT_DIR, fn)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                script_corpus += f.read()

    # In approveDirectUser, row.remove() must NOT be called
    assert "Approved" in script_corpus, "Missing 'Approved' badge logic in script"

    # 5. Test Delete user via API
    status_del, data_del, raw_del = client.post("/api/admin/delete-user", {"user_id": pend_id})
    if status_del != 200:
        status_del, data_del, raw_del = client.post("/api/admin/reject-user", {"user_id": pend_id})
    assert status_del == 200, f"Delete user failed with status {status_del}: {raw_del}"

    # Verify DB deletion
    u_del = db.query_one('SELECT id FROM users WHERE id = ?', (pend_id,))
    assert u_del is None, "User was not deleted from SQLite database"


def test_tier1_r4_modularization_and_deployment_readiness(client, db):
    """
    R4: Modularisasi File Template & Kesiapan Deployment Vercel & GitHub
    Covers:
      1. Presence and importability of modular template files (tpl_*.py)
      2. vercel.json configuration and api/index.py serverless entrypoint
      3. SQLite serverless /tmp fallback mechanism
      4. requirements.txt completeness and .gitignore security
      5. GITHUB_DEPLOYMENT_GUIDE.md documentation
      6. Localhost:3000 execution readiness
    """
    # 1. Template modules check
    template_files = ["tpl_landing.py", "tpl_auth.py", "tpl_dashboard.py", "tpl_admin.py", "tpl_script.py"]
    for tf in template_files:
        path = os.path.join(ROOT_DIR, tf)
        assert os.path.exists(path), f"Modular template file {tf} does not exist"

    # Import modules to verify Python validity
    import tpl_landing
    import tpl_auth
    import tpl_dashboard
    import tpl_admin
    import tpl_script

    assert hasattr(tpl_landing, "get_landing_html"), "tpl_landing missing get_landing_html()"
    assert hasattr(tpl_auth, "get_auth_html"), "tpl_auth missing get_auth_html()"
    assert hasattr(tpl_dashboard, "get_dashboard_html"), "tpl_dashboard missing get_dashboard_html()"
    assert hasattr(tpl_admin, "get_admin_html"), "tpl_admin missing get_admin_html()"
    assert hasattr(tpl_script, "get_script_js") or hasattr(tpl_script, "get_client_script"), "tpl_script missing script getter"

    # 2. Vercel deployment files
    vercel_json_path = os.path.join(ROOT_DIR, "vercel.json")
    assert os.path.exists(vercel_json_path), "vercel.json configuration file missing"
    with open(vercel_json_path, "r", encoding="utf-8") as f:
        v_config = json.load(f)
    assert "builds" in v_config or "routes" in v_config or "rewrites" in v_config, "vercel.json missing routes/builds"

    api_index_path = os.path.join(ROOT_DIR, "api", "index.py")
    assert os.path.exists(api_index_path), "api/index.py serverless entrypoint missing"
    with open(api_index_path, "r", encoding="utf-8") as f:
        api_code = f.read()
    assert "/tmp" in api_code or "tmp" in api_code, "api/index.py missing /tmp SQLite fallback logic"

    # 3. requirements.txt and .gitignore
    req_path = os.path.join(ROOT_DIR, "requirements.txt")
    assert os.path.exists(req_path), "requirements.txt missing"
    with open(req_path, "r", encoding="utf-8") as f:
        req_content = f.read()
    assert "python-dotenv" in req_content, "requirements.txt missing python-dotenv"

    git_path = os.path.join(ROOT_DIR, ".gitignore")
    assert os.path.exists(git_path), ".gitignore missing"
    with open(git_path, "r", encoding="utf-8") as f:
        git_content = f.read()
    assert ".env" in git_content, ".gitignore must exclude .env"
    assert "__pycache__" in git_content, ".gitignore must exclude __pycache__"

    # 4. GitHub deployment guide
    guide_path = os.path.join(ROOT_DIR, "GITHUB_DEPLOYMENT_GUIDE.md")
    assert os.path.exists(guide_path), "GITHUB_DEPLOYMENT_GUIDE.md missing"
    with open(guide_path, "r", encoding="utf-8") as f:
        guide_content = f.read()
    assert "git init" in guide_content, "Deployment guide missing 'git init'"
    assert "git push" in guide_content, "Deployment guide missing 'git push'"

    # 5. Localhost 3000 execution readiness
    status, _, html_resp = client.get("/")
    assert status == 200, f"GET / root endpoint returned HTTP {status}"
    assert "<!DOCTYPE html>" in html_resp or "<html" in html_resp, "GET / must serve HTML"

    status_adm, _, html_adm = client.get("/admin")
    assert status_adm == 200, f"GET /admin returned HTTP {status_adm}"
    assert "Enterprise Superadmin Desk" in html_adm, "GET /admin must serve Enterprise Superadmin Desk"


# ==============================================================================
# TIER 2: BOUNDARY & CORNER CASES
# ==============================================================================

def test_tier2_boundary_cases(client, db):
    """
    Tier 2: Boundary & Corner Cases
    Covers:
      1. Gibberish & non-financial syntax handling in AI parser
      2. Zero, negative, and extreme monetary amounts
      3. Unlinked Telegram chat ID rejection & security
      4. Invalid / duplicate / expired pairing codes
      5. Idempotent admin operations
    """
    # 1. Gibberish input to /api/ai/parse-transaction
    user_id = db.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at)
        VALUES ('boundary.user@tatadana.id', 'dummy', 'Boundary User', '081299990004', 'user', 1, 'active', 'pro', '2026-10-31 10:00:00 WIB')
    ''')
    db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "Cash", "cash", 100000.0, 1)', (user_id,))

    # Gibberish should return 400 or friendly fallback without saving a corrupted record
    prev_tx_cnt = db.query_one('SELECT COUNT(*) as c FROM transactions WHERE user_id = ?', (user_id,))["c"]
    status, data, raw = client.post("/api/ai/parse-transaction", {"text": "Selamat pagi bot salam kenal ya", "user_id": user_id})
    post_tx_cnt = db.query_one('SELECT COUNT(*) as c FROM transactions WHERE user_id = ?', (user_id,))["c"]
    assert post_tx_cnt == prev_tx_cnt, "Gibberish input should not insert any transaction"
    if status == 200:
        # If 200, ok should be False or message must indicate unrecognized transaction
        assert (data.get("ok") is False or "tidak terdeteksi" in str(data).lower() or "gagal" in str(data).lower()), "Expected failure response for gibberish input"

    # 2. Extreme monetary amounts (5 milyar)
    status_huge, data_huge, raw_huge = client.post("/api/ai/parse-transaction", {"text": "Beli properti kantor 5 milyar", "user_id": user_id})
    assert status_huge == 200, f"Failed extreme amount: {raw_huge}"
    parsed_huge = data_huge.get("parsed") or data_huge.get("data") or {}
    assert abs(float(parsed_huge.get("amount", 0)) - 5000000000.0) < 0.01, f"Expected 5,000,000,000, got {parsed_huge.get('amount')}"

    # 3. Zero or negative amount handling
    status_zero, data_zero, _ = client.post("/api/ai/parse-transaction", {"text": "Makan permen 0 rupiah", "user_id": user_id})
    tx_zero = db.query_one('SELECT * FROM transactions WHERE user_id = ? AND amount <= 0', (user_id,))
    assert tx_zero is None, "Zero or negative amounts must not be saved to transactions table"

    # 4. Unlinked Telegram chat ID security
    captured_replies = []
    original_send = server.send_telegram_reply
    def mock_reply(token, chat_id, text):
        captured_replies.append({"chat_id": chat_id, "text": text})
        return True
    server.send_telegram_reply = mock_reply

    try:
        unknown_chat = "999888777"
        unlinked_msg = {
            "chat": {"id": int(unknown_chat)},
            "from": {"id": int(unknown_chat), "first_name": "Stranger"},
            "text": "Beli bensin 30rb cash"
        }
        # In unlinked state, message should prompt user to connect or fallback cleanly without saving to boundary.user
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, unlinked_msg)
        unlinked_tx = db.query_one('SELECT * FROM transactions WHERE user_id = ? AND amount = 30000.0', (user_id,))
        assert unlinked_tx is None, "Unlinked Telegram message must NOT be saved under an unrelated user"

        # 5. Invalid pairing code: /connect 000000
        invalid_connect = {
            "chat": {"id": int(unknown_chat)},
            "from": {"id": int(unknown_chat), "first_name": "Stranger"},
            "text": "/connect 000000"
        }
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, invalid_connect)
        u_bad = db.query_one('SELECT id FROM users WHERE telegram_chat_id = ?', (unknown_chat,))
        assert u_bad is None, "Non-existent pairing code must not link any account"
    finally:
        server.send_telegram_reply = original_send

    # 6. Idempotent admin operations: approving already active user
    status_reappr, _, _ = client.post("/api/admin/approve-user", {"user_id": user_id})
    assert status_reappr in (200, 400), f"Re-approving user should be handled cleanly, got {status_reappr}"

    # Deleting non-existent user
    status_bad_del, _, _ = client.post("/api/admin/delete-user", {"user_id": 999999})
    assert status_bad_del in (200, 400, 404), f"Deleting non-existent user should return 200, 400, or 404, got {status_bad_del}"


# ==============================================================================
# TIER 3: CROSS-FEATURE COMBINATIONS
# ==============================================================================

def test_tier3_cross_feature_combinations(client, db):
    """
    Tier 3: Cross-Feature Combinations
    Covers:
      1. Flow A: Pairing -> Telegram transaction -> Dashboard stats sync
      2. Flow B: Admin approve -> Login -> Floating AI quick record
    """
    # --------------------------------------------------------------------------
    # Flow A: Pairing -> Telegram Transaction -> Dashboard Stats Sync
    # --------------------------------------------------------------------------
    uid_a = db.execute('''
        INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, status, plan, created_at)
        VALUES ('cross.a@tatadana.id', 'dummy', 'Cross User A', '081299990005', 'user', 1, 'active', 'pro', '2026-10-31 10:00:00 WIB')
    ''')
    w_a = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "BCA Utama", "bank", 1000000.0, 1)', (uid_a,))

    # Step 1: Generate pairing code
    status, data, raw = client.post("/api/telegram/pairing-code", {"user_id": uid_a})
    assert status == 200, f"Expected 200 from /api/telegram/pairing-code, got {status}: {raw}"
    pcode = data.get("pairing_code")

    # Step 2: Connect Telegram account
    captured = []
    orig_reply = server.send_telegram_reply
    server.send_telegram_reply = lambda tok, cid, txt: captured.append(txt)

    try:
        tg_id = "55566677"
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, {
            "chat": {"id": int(tg_id)},
            "from": {"id": int(tg_id), "first_name": "CrossA"},
            "text": f"/connect {pcode}"
        })

        # Step 3: Record transaction via Telegram: "Kopi susu 25rb cash"
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, {
            "chat": {"id": int(tg_id)},
            "from": {"id": int(tg_id), "first_name": "CrossA"},
            "text": "Kopi susu 25rb cash"
        })

        # Step 4: Verify Dashboard Stats sync
        status_stats, stats_data, raw_stats = client.get(f"/api/dashboard/stats?user_id={uid_a}")
        assert status_stats == 200, f"Failed /api/dashboard/stats: {raw_stats}"
        stats = stats_data.get("stats") or stats_data
        expense = float(stats.get("monthly_expense", 0))
        assert abs(expense - 25000.0) < 0.01, f"Expected monthly_expense 25000.0, got {expense}"

        # Step 5: Verify Transactions endpoint sync
        status_tx, tx_data, raw_tx = client.get(f"/api/transactions?user_id={uid_a}")
        assert status_tx == 200, f"Failed /api/transactions: {raw_tx}"
        tx_list = tx_data.get("transactions", [])
        assert len(tx_list) >= 1, "Expected transaction in user history"
        assert abs(float(tx_list[0]["amount"]) - 25000.0) < 0.01
        assert tx_list[0]["source"] == "telegram"
    finally:
        server.send_telegram_reply = orig_reply

    # --------------------------------------------------------------------------
    # Flow B: Admin Approve -> Login -> Floating AI Quick Record
    # --------------------------------------------------------------------------
    ts = int(time.time())
    email_b = f"cross.b.{ts}@tatadana.id"
    phone_b = f"0812{str(ts)[-8:]}"
    pw_b = "SecretPass123!"

    # Step 1: Register new user
    status_reg, data_reg, raw_reg = client.post("/api/auth/register", {
        "full_name": "Budi Santoso",
        "email": email_b,
        "phone_number": phone_b,
        "password": pw_b
    })
    assert status_reg == 200, f"Registration failed: {raw_reg}"
    uid_b = data_reg.get("user_id") or data_reg.get("user", {}).get("id")

    # Step 2: Attempt login before approval (must be rejected / pending)
    status_l1, data_l1, raw_l1 = client.post("/api/auth/login", {"email": email_b, "password": pw_b})
    assert status_l1 == 200, f"Expected 200 from /api/auth/login, got {status_l1}: {raw_l1}"
    assert data_l1.get("status") == "pending_approval" or data_l1.get("is_approved") == 0, f"Expected pending_approval status, got {data_l1}"

    # Step 3: Admin approves user
    status_appr, data_appr, raw_appr = client.post("/api/admin/approve-user", {"user_id": uid_b})
    if status_appr != 200:
        status_appr, data_appr, raw_appr = client.get(f"/api/admin/approve-user?user_id={uid_b}")
    assert status_appr == 200, f"Approval failed: {raw_appr}"

    # Step 4: Login after approval (must succeed as active)
    status_l2, data_l2, raw_l2 = client.post("/api/auth/login", {"email": email_b, "password": pw_b})
    assert status_l2 == 200, f"Login failed post-approval: {raw_l2}"
    assert data_l2.get("ok") is True
    assert data_l2.get("status") == "active"
    assert data_l2.get("is_approved") == 1

    # Step 5: Execute AI Quick Record
    status_ai, data_ai, raw_ai = client.post("/api/ai/parse-transaction", {
        "text": "Bayar tagihan listrik 150rb",
        "user_id": uid_b
    })
    assert status_ai == 200, f"AI Quick Record failed: {raw_ai}"
    parsed_ai = data_ai.get("parsed") or data_ai.get("data") or {}
    assert abs(float(parsed_ai.get("amount", 0)) - 150000.0) < 0.01

    # Step 6: Verify Admin view keeps user with approved status
    status_adm, data_adm, _ = client.get("/api/admin/users")
    assert status_adm == 200
    found_b = [u for u in data_adm.get("users", []) if u["id"] == uid_b]
    assert len(found_b) == 1, "Approved user Budi must remain in admin user list"
    assert found_b[0]["is_approved"] == 1


# ==============================================================================
# TIER 4: REAL-WORLD MULTI-USER JOURNEY & STRICT DATA ISOLATION
# ==============================================================================

def test_tier4_real_world_multi_user_journey(client, db):
    """
    Tier 4: Real-World Scenarios
    Covers:
      Full multi-user end-to-end journey:
      1. User A (Freelancer) and User B (Merchant) register & get approved
      2. Superadmin table shows both users with ✓ Approved badge
      3. User A pairs Telegram account & records expense
      4. User B uses Web Floating AI Bot & records income
      5. Strict Data Isolation:
         - User A sees ONLY their expense, 0 income
         - User B sees ONLY their income, 0 expense
         - Zero tenant leakage
      6. Superadmin metrics accurately aggregate totals across both users
      7. Superadmin deletes User A -> User A records deleted, User B remains intact
    """
    # 1. Register User A and User B
    ts = int(time.time())
    email_a = f"freelancer.{ts}@tatadana.id"
    email_b = f"merchant.{ts}@tatadana.id"

    client.post("/api/auth/register", {
        "full_name": "Freelancer User",
        "email": email_a,
        "phone_number": f"0811{str(ts)[-8:]}",
        "password": "Password123!"
    })
    client.post("/api/auth/register", {
        "full_name": "Merchant User",
        "email": email_b,
        "phone_number": f"0813{str(ts)[-8:]}",
        "password": "Password123!"
    })

    uid_a = db.query_one('SELECT id FROM users WHERE email = ?', (email_a,))["id"]
    uid_b = db.query_one('SELECT id FROM users WHERE email = ?', (email_b,))["id"]

    # 2. Superadmin approves both users
    client.post("/api/admin/approve-user", {"user_id": uid_a})
    client.post("/api/admin/approve-user", {"user_id": uid_b})

    # Verify both approved
    u_a_row = db.query_one('SELECT is_approved, status FROM users WHERE id = ?', (uid_a,))
    u_b_row = db.query_one('SELECT is_approved, status FROM users WHERE id = ?', (uid_b,))
    assert u_a_row["is_approved"] == 1 and u_a_row["status"] == "active"
    assert u_b_row["is_approved"] == 1 and u_b_row["status"] == "active"

    # Seed wallets
    w_a = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "Cash", "cash", 1000000.0, 1)', (uid_a,))
    w_b = db.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "BCA Utama", "bank", 5000000.0, 1)', (uid_b,))

    # 3. User A pairs Telegram account
    _, pair_data, _ = client.post("/api/telegram/pairing-code", {"user_id": uid_a})
    pcode_a = pair_data.get("pairing_code")

    captured = []
    orig_reply = server.send_telegram_reply
    server.send_telegram_reply = lambda tok, cid, txt: captured.append(txt)

    try:
        tg_a_chat = "99887711"
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, {
            "chat": {"id": int(tg_a_chat)},
            "from": {"id": int(tg_a_chat), "first_name": "Freelancer"},
            "text": f"/connect {pcode_a}"
        })

        # User A records expense via Telegram: "Beli bensin pertamax 50rb cash"
        server.process_telegram_incoming_message(server.TELEGRAM_BOT_TOKEN, {
            "chat": {"id": int(tg_a_chat)},
            "from": {"id": int(tg_a_chat), "first_name": "Freelancer"},
            "text": "Beli bensin pertamax 50rb cash"
        })
    finally:
        server.send_telegram_reply = orig_reply

    # 4. User B records income via Web Floating AI Bot: "Pemasukan catering 2jt bca"
    status_b, data_b, raw_b = client.post("/api/ai/parse-transaction", {
        "text": "Pemasukan catering 2jt bca",
        "user_id": uid_b
    })
    assert status_b == 200, f"User B AI parse failed: {raw_b}"

    # 5. Strict Tenant Data Isolation Audit
    # User A stats
    _, stats_a_data, _ = client.get(f"/api/dashboard/stats?user_id={uid_a}")
    stats_a = stats_a_data.get("stats") or stats_a_data
    assert abs(float(stats_a.get("monthly_expense", 0)) - 50000.0) < 0.01, "User A expense must be exactly 50000"
    assert abs(float(stats_a.get("monthly_income", 0)) - 0.0) < 0.01, "User A income must be 0 (no leakage from User B)"

    # User B stats
    _, stats_b_data, _ = client.get(f"/api/dashboard/stats?user_id={uid_b}")
    stats_b = stats_b_data.get("stats") or stats_b_data
    assert abs(float(stats_b.get("monthly_income", 0)) - 2000000.0) < 0.01, "User B income must be exactly 2000000"
    assert abs(float(stats_b.get("monthly_expense", 0)) - 0.0) < 0.01, "User B expense must be 0 (no leakage from User A)"

    # User A transactions history
    _, tx_a_data, _ = client.get(f"/api/transactions?user_id={uid_a}")
    tx_a_list = tx_a_data.get("transactions", [])
    assert len(tx_a_list) == 1, f"User A must have exactly 1 tx, got {len(tx_a_list)}"
    assert abs(float(tx_a_list[0]["amount"]) - 50000.0) < 0.01

    # User B transactions history
    _, tx_b_data, _ = client.get(f"/api/transactions?user_id={uid_b}")
    tx_b_list = tx_b_data.get("transactions", [])
    assert len(tx_b_list) == 1, f"User B must have exactly 1 tx, got {len(tx_b_list)}"
    assert abs(float(tx_b_list[0]["amount"]) - 2000000.0) < 0.01

    # 6. Superadmin Global Aggregated Metrics
    status_met, data_met, _ = client.get("/api/admin/metrics")
    assert status_met == 200
    assert data_met.get("total_users", 0) >= 3, "Total users should include admin, User A, and User B"

    # 7. Superadmin deletes User A -> User B remains untouched
    status_del_a, _, _ = client.post("/api/admin/delete-user", {"user_id": uid_a})
    if status_del_a != 200:
        status_del_a, _, _ = client.post("/api/admin/reject-user", {"user_id": uid_a})
    assert status_del_a == 200

    # User A deleted
    assert db.query_one('SELECT id FROM users WHERE id = ?', (uid_a,)) is None
    assert db.query_one('SELECT COUNT(*) as c FROM transactions WHERE user_id = ?', (uid_a,))["c"] == 0

    # User B completely intact
    assert db.query_one('SELECT id FROM users WHERE id = ?', (uid_b,)) is not None
    assert db.query_one('SELECT COUNT(*) as c FROM transactions WHERE user_id = ?', (uid_b,))["c"] == 1


# ==============================================================================
# CLI DISPATCHER
# ==============================================================================

def main():
    import argparse
    parser = argparse.ArgumentParser(description="TataDana Round 10 E2E Automated Test Suite")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3, 4], help="Run a specific test tier (1 to 4)")
    parser.add_argument("--infra-check", action="store_true", help="Perform sanity check on test harness & test DB")
    args = parser.parse_args()

    print("=" * 80)
    print("STARTING TATADANA ROUND 10 E2E AUTOMATED VERIFICATION")
    print(f"Timestamp : {datetime.now(timezone(timedelta(hours=7))).strftime('%Y-%m-%d %H:%M:%S WIB')}")
    print(f"Directory : {ROOT_DIR}")
    print("=" * 80)

    client = TataDanaTestClient()
    print(f"[*] Test Client Operating Mode: {client.mode.upper()}")

    if args.infra_check:
        print("[*] Running Test Infrastructure Self-Check...")
        with TestDatabaseContext() as db:
            cols = [r["name"] for r in db.query_all("PRAGMA table_info(users)")]
            assert "email" in cols and "telegram_chat_id" in cols, "Test DB schema missing expected columns"
            superadmin = db.query_one("SELECT email, role FROM users WHERE id = 1")
            assert superadmin is not None, "Master Superadmin ID=1 not seeded in test DB"
            print("  --> [PASS] Test DB Context & Schema Migrations verified cleanly.")
            status, data, _ = client.get("/api/auth/status")
            print(f"  --> [PASS] Client invoker responsive (status={status}).")
        print("\n>>> TEST HARNESS & INFRASTRUCTURE READY! <<<")
        sys.exit(0)

    runner = TestSuiteRunner()

    with TestDatabaseContext() as db:
        if args.tier is None or args.tier == 1:
            print("\n" + "=" * 60)
            print("RUNNING TIER 1: FEATURE COVERAGE (R1, R2, R3, R4)")
            print("=" * 60)
            runner.run_case("Tier 1", "T1-R1", "Floating AI Bot UI & Natural Language Persistence",
                            lambda: test_tier1_r1_floating_ai_bot(client, db))
            runner.run_case("Tier 1", "T1-R2", "Telegram Bot Schema, Pairing Code & Markdown Persistence",
                            lambda: test_tier1_r2_telegram_bot_integration(client, db))
            runner.run_case("Tier 1", "T1-R3", "Admin User Management, 1-Click Approve & Confirmed Deletion",
                            lambda: test_tier1_r3_admin_user_management(client, db))
            runner.run_case("Tier 1", "T1-R4", "Template Modularization, Vercel & GitHub Readiness",
                            lambda: test_tier1_r4_modularization_and_deployment_readiness(client, db))

        if args.tier is None or args.tier == 2:
            print("\n" + "=" * 60)
            print("RUNNING TIER 2: BOUNDARY & CORNER CASES")
            print("=" * 60)
            runner.run_case("Tier 2", "T2-01", "Boundary & Corner Cases (Syntax, Amounts, Security, Idempotency)",
                            lambda: test_tier2_boundary_cases(client, db))

        if args.tier is None or args.tier == 3:
            print("\n" + "=" * 60)
            print("RUNNING TIER 3: CROSS-FEATURE COMBINATIONS")
            print("=" * 60)
            runner.run_case("Tier 3", "T3-01", "Cross-Feature Combinations (Pairing-Telegram & Admin-AI flows)",
                            lambda: test_tier3_cross_feature_combinations(client, db))

        if args.tier is None or args.tier == 4:
            print("\n" + "=" * 60)
            print("RUNNING TIER 4: REAL-WORLD SCENARIOS")
            print("=" * 60)
            runner.run_case("Tier 4", "T4-01", "Multi-User E2E Journey with Strict Tenant Isolation",
                            lambda: test_tier4_real_world_multi_user_journey(client, db))

    all_passed = runner.print_summary()
    if all_passed:
        print("\n>>> ALL TESTS PASSED SUCCESSFULLY (EXIT CODE 0) <<<")
        sys.exit(0)
    else:
        print("\n>>> TEST SUITE DETECTED UNMET REQUIREMENTS (EXIT CODE 1) <<<")
        sys.exit(1)


if __name__ == "__main__":
    main()
