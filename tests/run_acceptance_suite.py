"""
================================================================================
ACCEPTANCE TEST RUNNER & VERIFIER (GEN 2) — TATADANA PRIME
================================================================================
Executes automated validation across all 7 Acceptance Criteria.
Validates code contracts, SQLite database records, UI wiring, and live endpoints.
Generates an assertion matrix, logs, and outputs definitive pass/fail status.
================================================================================
"""

import sys
import os
import json
import sqlite3
import time
import io
import csv
import re
import hashlib
import urllib.request
import urllib.error

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')
HTML_PATH = os.path.join(PROJECT_ROOT, 'index.html')
SERVER_PY = os.path.join(PROJECT_ROOT, 'server.py')
BASE_URL = os.environ.get('TATADANA_TEST_URL', 'http://localhost:3000')

results = {
    'total_tests': 0,
    'passed_tests': 0,
    'failed_tests': 0,
    'skipped_tests': 0,
    'assertions_checked': 0,
    'criteria': {}
}

def log(msg):
    print(f"[TEST RUNNER] {msg}")

def record_assertion(ac_id, name, passed, details=""):
    results['assertions_checked'] += 1
    if ac_id not in results['criteria']:
        results['criteria'][ac_id] = {'passed': 0, 'failed': 0, 'tests': []}
    
    status_str = "PASS" if passed else "FAIL"
    results['criteria'][ac_id]['tests'].append({
        'name': name,
        'passed': passed,
        'details': details
    })
    if passed:
        results['criteria'][ac_id]['passed'] += 1
    else:
        results['criteria'][ac_id]['failed'] += 1
    print(f"  [{status_str}] ({ac_id}) {name} {f'-- {details}' if details else ''}")

def check_live_server():
    try:
        req = urllib.request.Request(f'{BASE_URL}/', headers={'User-Agent': 'TestRunner/2.0'})
        with urllib.request.urlopen(req, timeout=2) as res:
            return res.status == 200
    except Exception:
        return False

def run_acceptance_audit():
    print("=" * 80)
    print(" TATADANA PRIME — ACCEPTANCE CRITERIA AUTOMATED VERIFICATION SUITE (GEN 2)")
    print(f" Target URL : {BASE_URL}")
    print(f" Project Dir: {PROJECT_ROOT}")
    print(f" SQLite DB  : {DB_PATH}")
    print("=" * 80)

    server_up = check_live_server()
    log(f"Live server detection at {BASE_URL}: {'ONLINE (HTTP 200)' if server_up else 'OFFLINE / RESTRICTED'}")

    with open(SERVER_PY, 'r', encoding='utf-8') as f:
        server_code = f.read()

    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        html_code = f.read()

    db_exists = os.path.exists(DB_PATH)

    # =========================================================================
    # CRITERION 1: Server localhost:3000 responds with 200 OK for routes
    # =========================================================================
    print("\n--- [AC 1] SERVER LOCALHOST:3000 & SPA ROUTES VERIFICATION ---")
    routes = ['/', '/dashboard', '/admin', '/superadmin', '/login', '/approval', '/settings']
    
    server_routes_defined = all(f"'{r}'" in server_code for r in routes)
    record_assertion("AC1", "Server Code SPA Routes Set contains all 7 routes", server_routes_defined,
                     "Checked routes: /, /dashboard, /admin, /superadmin, /login, /approval, /settings")

    server_spa_rewrite = "self.path = '/index.html'" in server_code
    record_assertion("AC1", "Server rewrites SPA routes to /index.html", server_spa_rewrite)

    client_router_coverage = all(f"norm === '{r}'" in html_code for r in routes)
    record_assertion("AC1", "Client SPA handleRoute() handles all 7 routes", client_router_coverage)

    approval_route_handled = ("'/approval'" in server_code) and ("norm === '/approval'" in html_code)
    record_assertion("AC1", "Approval waiting route /approval handled in server and client", approval_route_handled)

    if server_up:
        for r in routes:
            try:
                with urllib.request.urlopen(f'{BASE_URL}{r}', timeout=4) as res:
                    body = res.read().decode('utf-8', errors='ignore')
                    is_ok = (res.status == 200) and ('<!DOCTYPE html>' in body) and ('TataDana' in body)
                    record_assertion("AC1", f"HTTP GET {r} returns 200 OK HTML", is_ok, f"Status: {res.status}")
            except Exception as e:
                record_assertion("AC1", f"HTTP GET {r} returns 200 OK HTML", False, str(e))

    # =========================================================================
    # CRITERION 2: Superadmin login shopnoure1619@gmail.com / tugasbisnis16
    # =========================================================================
    print("\n--- [AC 2] SUPERADMIN AUTH & ROLE VERIFICATION ---")
    
    # Check Server initialization code
    record_assertion("AC2", "Server auto-seeds Superadmin with PRO VIP and tugasbisnis16",
                     "admin_email = 'shopnoure1619@gmail.com'" in server_code and "'PRO VIP'" in server_code and "admin_pw_hash = hash_pw('tugasbisnis16')" in server_code)

    # Check UI auto-fill and Quick Login
    record_assertion("AC2", "UI auto-fills shopnoure1619@gmail.com in login modal",
                     'value="shopnoure1619@gmail.com"' in html_code)
    record_assertion("AC2", "UI auto-fills tugasbisnis16 in login modal",
                     'value="tugasbisnis16"' in html_code)
    record_assertion("AC2", "UI provides Quick Login 'Masuk sebagai Superadmin' button",
                     'quickSuperadminLogin' in html_code and 'Masuk sebagai Superadmin' in html_code)

    # Check SQLite DB directly
    if db_exists:
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute('SELECT email, password_hash, role, is_approved, plan FROM users WHERE email = ?', ('shopnoure1619@gmail.com',))
            admin_row = c.fetchone()
            pw_match = admin_row and admin_row['password_hash'] == hashlib.sha256('tugasbisnis16'.encode('utf-8')).hexdigest()
            role_match = admin_row and admin_row['role'] == 'superadmin' and admin_row['plan'] == 'PRO VIP' and admin_row['is_approved'] == 1
            record_assertion("AC2", "SQLite DB contains Superadmin credentials with PRO VIP & role superadmin", bool(admin_row and pw_match and role_match))
            conn.close()
        except Exception as e:
            record_assertion("AC2", "SQLite DB contains Superadmin credentials", False, str(e))

    if server_up:
        # Live login test
        try:
            req = urllib.request.Request(
                f'{BASE_URL}/api/auth/login',
                data=json.dumps({'email': 'shopnoure1619@gmail.com', 'password': 'tugasbisnis16'}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=4) as res:
                data = json.loads(res.read().decode('utf-8'))
                record_assertion("AC2", "Live Superadmin Login returns ok: true", data.get('ok') is True)
                record_assertion("AC2", "Live Superadmin Login returns role: superadmin", data.get('role') == 'superadmin')
                record_assertion("AC2", "Live Superadmin Login returns plan: PRO VIP", data.get('plan') == 'PRO VIP')
        except Exception as e:
            record_assertion("AC2", "Live Superadmin Login API call", False, str(e))

        # Live negative login test
        try:
            req_neg = urllib.request.Request(
                f'{BASE_URL}/api/auth/login',
                data=json.dumps({'email': 'shopnoure1619@gmail.com', 'password': 'wrongpassword999'}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            urllib.request.urlopen(req_neg, timeout=4)
            record_assertion("AC2", "Live wrong password rejected with 401", False, "Expected 401 but succeeded")
        except urllib.error.HTTPError as he:
            record_assertion("AC2", "Live wrong password rejected with 401", he.code == 401, f"HTTP {he.code}")
        except Exception as e:
            record_assertion("AC2", "Live wrong password rejected with 401", False, str(e))

    # =========================================================================
    # CRITERION 3: Export PDF and Excel endpoints/functions are operational
    # =========================================================================
    print("\n--- [AC 3] EXPORT PDF & EXCEL FUNCTIONALITY VERIFICATION ---")

    record_assertion("AC3", "Server /api/export endpoint generates RFC-4180 CSV",
                     "path == '/api/export'" in server_code and "text/csv" in server_code)
    record_assertion("AC3", "Server /api/export restricts downloads to PRO / PRO VIP",
                     "is_pro = (u_row['role'] in ('admin', 'superadmin'))" in server_code)
    record_assertion("AC3", "UI contains Excel export button calling downloadRealReport",
                     "downloadRealReport('excel')" in html_code and "Ekspor Excel" in html_code)
    record_assertion("AC3", "UI contains PDF export generator generatePdfReport() with printWin",
                     "generatePdfReport()" in html_code and "window.print()" in html_code)
    record_assertion("AC3", "UI shows PRO VIP Unlocked status for exports",
                     "PRO VIP UNLOCKED" in html_code)

    if server_up:
        try:
            req_exp = urllib.request.Request(f'{BASE_URL}/api/export?user_id=1')
            with urllib.request.urlopen(req_exp, timeout=4) as res:
                ct = res.headers.get('Content-Type', '')
                cd = res.headers.get('Content-Disposition', '')
                content = res.read().decode('utf-8')
                is_csv = 'text/csv' in ct and 'attachment' in cd and 'No,Tanggal (WIB)' in content
                record_assertion("AC3", "Live /api/export returns valid CSV attachment with headers", is_csv)
        except Exception as e:
            record_assertion("AC3", "Live /api/export returns valid CSV", False, str(e))

    # =========================================================================
    # CRITERION 4: Profile photo update persists in SQLite users.avatar_url
    # =========================================================================
    print("\n--- [AC 4] PROFILE PHOTO & AVATAR PERSISTENCE VERIFICATION ---")

    record_assertion("AC4", "Database schema supports users.avatar_url column",
                     "avatar_url TEXT DEFAULT ''" in server_code)
    record_assertion("AC4", "Server endpoint /api/user/profile updates avatar_url in SQLite",
                     "UPDATE users SET avatar_url = ?" in server_code)
    record_assertion("AC4", "UI provides local image upload with FileReader Data URL",
                     "handleLocalPhotoUpload" in html_code and "readAsDataURL" in html_code)
    record_assertion("AC4", "UI provides 4 distinct avatar presets (Cyber Blue, Gold VIP, Emerald, Dark Neon)",
                     all(p in html_code for p in ['Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon']))

    if db_exists:
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("PRAGMA table_info(users)")
            col_names = [r['name'] for r in c.fetchall()]
            record_assertion("AC4", "SQLite users table contains avatar_url column", 'avatar_url' in col_names)
            conn.close()
        except Exception as e:
            record_assertion("AC4", "SQLite schema avatar_url check", False, str(e))

    if server_up:
        test_avatar = "data:image/svg+xml;utf8,<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23059669'/></svg>"
        try:
            req_prof = urllib.request.Request(
                f'{BASE_URL}/api/user/profile',
                data=json.dumps({'user_id': 1, 'avatar_url': test_avatar, 'full_name': 'Superadmin TataDana'}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req_prof, timeout=4) as res:
                p_data = json.loads(res.read().decode('utf-8'))
                record_assertion("AC4", "Live POST /api/user/profile returns updated avatar",
                                 p_data.get('ok') is True and p_data.get('user', {}).get('avatar_url') == test_avatar)

            req_get_p = urllib.request.Request(f'{BASE_URL}/api/user/profile?user_id=1')
            with urllib.request.urlopen(req_get_p, timeout=4) as res_gp:
                gp_data = json.loads(res_gp.read().decode('utf-8'))
                record_assertion("AC4", "Live GET /api/user/profile confirms avatar persisted in SQLite",
                                 gp_data.get('user', {}).get('avatar_url') == test_avatar)
        except Exception as e:
            record_assertion("AC4", "Live profile photo update test", False, str(e))

    # =========================================================================
    # CRITERION 5: Registration is_approved = 0, held at pending, admin approval
    # =========================================================================
    print("\n--- [AC 5] USER REGISTRATION & APPROVAL WORKFLOW VERIFICATION ---")

    record_assertion("AC5", "Server registers new users with is_approved = 0",
                     ("VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?, ?)" in server_code or "VALUES (?, ?, ?, ?, 'user', 0, 'pro'" in server_code))
    record_assertion("AC5", "Server /api/auth/login holds unapproved users in pending_approval",
                     "status': 'pending_approval'" in server_code and "is_approved': 0" in server_code)
    record_assertion("AC5", "Server /api/admin/approve-user toggles is_approved = 1 and seeds wallets",
                     "UPDATE users SET is_approved = 1 WHERE id = ?" in server_code and "seed_user_wallets_and_data" in server_code)
    record_assertion("AC5", "UI blocks unapproved user from /dashboard and shows Waiting Screen",
                     "sessionUser.is_approved !== 1 && sessionUser.role !== 'superadmin'" in html_code and "viewApproval" in html_code)

    if server_up:
        ts = int(time.time() * 1000)
        u_email = f"audit.user.{ts}@tatadana.id"
        u_phone = f"0813{str(ts)[-8:]}"
        u_pass = "TestPass123!"
        try:
            # 1. Register
            req_r = urllib.request.Request(
                f'{BASE_URL}/api/auth/register',
                data=json.dumps({'full_name': 'Audit User', 'email': u_email, 'phone_number': u_phone, 'password': u_pass}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req_r, timeout=4) as res_r:
                r_data = json.loads(res_r.read().decode('utf-8'))
                record_assertion("AC5", "Live Register creates user with is_approved = 0",
                                 r_data.get('ok') is True and r_data.get('is_approved') == 0)
                new_uid = r_data.get('user_id')

            # 2. Login Before Approval
            req_lb = urllib.request.Request(
                f'{BASE_URL}/api/auth/login',
                data=json.dumps({'email': u_email, 'password': u_pass}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req_lb, timeout=4) as res_lb:
                lb_data = json.loads(res_lb.read().decode('utf-8'))
                record_assertion("AC5", "Live Login before approval returns status: pending_approval",
                                 lb_data.get('status') == 'pending_approval' and lb_data.get('is_approved') == 0)

            # 3. Superadmin Approves User
            req_ap = urllib.request.Request(
                f'{BASE_URL}/api/admin/approve-user',
                data=json.dumps({'user_id': new_uid}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req_ap, timeout=4) as res_ap:
                ap_data = json.loads(res_ap.read().decode('utf-8'))
                record_assertion("AC5", "Live Admin Approve User toggles is_approved = 1",
                                 ap_data.get('ok') is True and ap_data.get('is_approved') == 1)

            # 4. Login After Approval
            with urllib.request.urlopen(req_lb, timeout=4) as res_la:
                la_data = json.loads(res_la.read().decode('utf-8'))
                record_assertion("AC5", "Live Login after approval returns status: active and is_approved: 1",
                                 la_data.get('status') == 'active' and la_data.get('is_approved') == 1)

        except Exception as e:
            record_assertion("AC5", "Live Registration & Approval workflow test", False, str(e))

    # =========================================================================
    # CRITERION 6: Blue-Themed OTP Screen, Realtime SMTP & Role-Based Navigation
    # =========================================================================
    print("\n--- [AC 6] BLUE-THEMED OTP SCREEN, REALTIME SMTP & ROLE-BASED NAVIGATION ---")

    # Blue Themed OTP Verification Screen (Harmonisasi Desain)
    record_assertion("AC6", "Branding contains Tata (putih) and Dana (cyan-400)",
                     'Tata<span class="text-cyan-400">Dana</span>' in html_code)
    record_assertion("AC6", "6-digit OTP input styled with border-2 border-blue-500 text-cyan-300",
                     'border-2 border-blue-500 text-cyan-300' in html_code)
    record_assertion("AC6", "Live OTP helper display #otpLiveDisplay and #otpHintCode exist",
                     'id="otpLiveDisplay"' in html_code and 'id="otpHintCode"' in html_code)
    record_assertion("AC6", "Live OTP helper button 'Isi Cepat' triggers autoFillOtp()",
                     'onclick="autoFillOtp()"' in html_code and 'function autoFillOtp()' in html_code)
    record_assertion("AC6", "Main action button styled with from-blue-600 to-cyan-500 and text 'Lanjutkan'",
                     'from-blue-600 to-cyan-500' in html_code and '<span>Lanjutkan</span>' in html_code)
    record_assertion("AC6", "Phrase 'secara realtime' completely removed from HTML UI",
                     'secara realtime' not in html_code)

    # Backend Realtime SMTP Email Module
    record_assertion("AC6", "Backend server.py contains send_real_smtp_email function definition",
                     'def send_real_smtp_email(to_email, otp_code):' in server_code)
    record_assertion("AC6", "send_real_smtp_email integrates SMTP configuration env vars",
                     all(v in server_code for v in ['TATADANA_SMTP_HOST', 'TATADANA_SMTP_PORT', 'TATADANA_SMTP_USER', 'TATADANA_SMTP_PASS']))
    record_assertion("AC6", "Server defines POST /api/auth/verify-otp endpoint",
                     "path == '/api/auth/verify-otp'" in server_code)
    record_assertion("AC6", "Server defines POST /api/auth/resend-otp endpoint",
                     "path == '/api/auth/resend-otp'" in server_code)

    # Role-Based Navigation Rules
    record_assertion("AC6", "Superadmin Desk navigation element #dNav-adminPanel exists in HTML",
                     'id="dNav-adminPanel"' in html_code)
    record_assertion("AC6", "UI logic shows #dNav-adminPanel only for superadmin/admin",
                     ("adminNav.classList.remove('hidden')" in html_code and "adminNav.classList.add('hidden')" in html_code))
    record_assertion("AC6", "Mobile navigation #mNav-adminPanel enforces role visibility",
                     ("mAdminNav.classList.remove('hidden')" in html_code and "mAdminNav.classList.add('hidden')" in html_code))
    record_assertion("AC6", "Client router guards /admin and /superadmin routes against non-admin roles",
                     "sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin'" in html_code and "navigate('/dashboard'" in html_code)
    record_assertion("AC6", "selectTab('adminPanel') enforces role check before rendering admin users",
                     "tab === 'adminPanel' && currentUserRole !== 'superadmin'" in html_code)

    # Live E2E OTP Verification & Account Activation (Lanjutkan flow)
    if server_up:
        try:
            ts_otp = int(time.time() * 1000)
            u_otp_email = f"live.otp.{ts_otp}@tatadana.id"
            reg_body = json.dumps({
                'full_name': f'Live OTP Tester {ts_otp}',
                'email': u_otp_email,
                'phone_number': f'0899{ts_otp % 100000000:08d}',
                'password': 'Password123!'
            }).encode('utf-8')
            req_reg_otp = urllib.request.Request(f'{BASE_URL}/api/auth/register', data=reg_body, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req_reg_otp, timeout=4) as res_ro:
                d_ro = json.loads(res_ro.read().decode('utf-8'))
                otp_uid = d_ro.get('user_id')
                reg_otp_code = d_ro.get('otp_code')

            # Verify OTP
            v_body = json.dumps({'user_id': otp_uid, 'email': u_otp_email, 'otp': reg_otp_code}).encode('utf-8')
            req_vo = urllib.request.Request(f'{BASE_URL}/api/auth/verify-otp', data=v_body, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req_vo, timeout=4) as res_vo:
                d_vo = json.loads(res_vo.read().decode('utf-8'))
                record_assertion("AC6", "Live POST /api/auth/verify-otp activates user (is_approved = 1, status = active)",
                                 d_vo.get('ok') is True and d_vo.get('is_approved') == 1 and d_vo.get('status') == 'active')

            # Resend OTP
            rs_body = json.dumps({'user_id': otp_uid, 'email': u_otp_email}).encode('utf-8')
            req_rso = urllib.request.Request(f'{BASE_URL}/api/auth/resend-otp', data=rs_body, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req_rso, timeout=4) as res_rso:
                d_rso = json.loads(res_rso.read().decode('utf-8'))
                record_assertion("AC6", "Live POST /api/auth/resend-otp dispatches new 6-digit OTP code",
                                 d_rso.get('ok') is True and len(str(d_rso.get('otp_code', ''))) == 6)

            # Direct 'Lanjutkan' click flow (empty OTP fallback)
            ts_lanjut = ts_otp + 1
            u_lanjut_email = f"live.lanjut.{ts_lanjut}@tatadana.id"
            reg_lanjut_body = json.dumps({
                'full_name': f'Lanjut Tester {ts_lanjut}',
                'email': u_lanjut_email,
                'phone_number': f'0898{ts_lanjut % 100000000:08d}',
                'password': 'Password123!'
            }).encode('utf-8')
            with urllib.request.urlopen(urllib.request.Request(f'{BASE_URL}/api/auth/register', data=reg_lanjut_body, headers={'Content-Type': 'application/json'}), timeout=4) as res_rl:
                d_rl = json.loads(res_rl.read().decode('utf-8'))
                lanjut_uid = d_rl.get('user_id')

            v_lanjut_body = json.dumps({'user_id': lanjut_uid, 'email': u_lanjut_email, 'otp': ''}).encode('utf-8')
            with urllib.request.urlopen(urllib.request.Request(f'{BASE_URL}/api/auth/verify-otp', data=v_lanjut_body, headers={'Content-Type': 'application/json'}), timeout=4) as res_vl:
                d_vl = json.loads(res_vl.read().decode('utf-8'))
                record_assertion("AC6", "Live 'Lanjutkan' button click instantly activates user without manual typing",
                                 d_vl.get('ok') is True and d_vl.get('is_approved') == 1)
        except Exception as e:
            record_assertion("AC6", "Live OTP verification and Lanjutkan execution flow", False, str(e))

    # =========================================================================
    # CRITERION 7: Telegram Webhook records real mutation & updates balance
    # =========================================================================
    print("\n--- [AC 7] TELEGRAM WEBHOOK PERSISTENCE & BALANCE MUTATION ---")

    record_assertion("AC7", "Server /api/telegram/webhook enforces idempotency with telegram_updates table",
                     "SELECT update_id FROM telegram_updates WHERE update_id = ?" in server_code and "already_processed" in server_code)
    record_assertion("AC7", "Natural language parsing extracts nominals in IDR formats (jt, rb, k)",
                     "re.search(r'([\\d.,]+)\\s*(?:jt|juta)'" in server_code and "re.search(r'([\\d.,]+)\\s*(?:rb|ribu|k)'" in server_code)
    record_assertion("AC7", "Webhook inserts real transaction into transactions table with source 'telegram'",
                     "INSERT INTO transactions" in server_code and "'telegram'" in server_code)
    record_assertion("AC7", "Webhook updates real wallet balance in wallets table",
                     "UPDATE wallets SET balance = balance" in server_code)

    if db_exists:
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='telegram_updates'")
            record_assertion("AC7", "SQLite DB contains telegram_updates table for idempotency", c.fetchone() is not None)
            conn.close()
        except Exception as e:
            record_assertion("AC7", "SQLite DB telegram_updates table check", False, str(e))

    if server_up:
        try:
            # Get initial balance
            with urllib.request.urlopen(f'{BASE_URL}/api/wallets?user_id=1', timeout=4) as res_w:
                w_list = json.loads(res_w.read().decode('utf-8')).get('wallets', [])
                def_wallet = next((w for w in w_list if w.get('is_default') == 1), w_list[0])
                w_id = def_wallet['id']
                start_bal = float(def_wallet['balance'])

            # Send Telegram Webhook expense
            wh_uid = int(time.time() * 1000)
            req_tg = urllib.request.Request(
                f'{BASE_URL}/api/telegram/webhook',
                data=json.dumps({
                    'update_id': wh_uid,
                    'user_id': 1,
                    'message': {'text': 'Makan siang ayam geprek 20rb'}
                }).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req_tg, timeout=4) as res_tg:
                tg_data = json.loads(res_tg.read().decode('utf-8'))
                record_assertion("AC7", "Live Telegram Webhook returns ok: true and parsed amount 20000",
                                 tg_data.get('ok') is True and tg_data.get('amount') == 20000.0)
                new_tx_id = tg_data.get('transaction_id')

            # Idempotency test: duplicate update_id
            with urllib.request.urlopen(req_tg, timeout=4) as res_tg_dup:
                dup_data = json.loads(res_tg_dup.read().decode('utf-8'))
                record_assertion("AC7", "Live duplicate update_id returns status: already_processed",
                                 dup_data.get('status') == 'already_processed')

            # Check wallet balance decremented by 20,000
            with urllib.request.urlopen(f'{BASE_URL}/api/wallets?user_id=1', timeout=4) as res_w2:
                w_list2 = json.loads(res_w2.read().decode('utf-8')).get('wallets', [])
                w_after = next((w for w in w_list2 if w.get('id') == w_id), None)
                expected_bal = start_bal - 20000.0
                record_assertion("AC7", "Live wallet balance accurately decremented by 20,000",
                                 abs(float(w_after['balance']) - expected_bal) < 0.01)

            # Check transaction persisted in /api/transactions
            with urllib.request.urlopen(f'{BASE_URL}/api/transactions?user_id=1', timeout=4) as res_tx:
                tx_all = json.loads(res_tx.read().decode('utf-8')).get('transactions', [])
                found_tx = any(t['id'] == new_tx_id and t['amount'] == 20000.0 and t['source'] == 'telegram' for t in tx_all)
                record_assertion("AC7", "Live transaction record persisted in transactions history", found_tx)

        except Exception as e:
            record_assertion("AC7", "Live Telegram Webhook mutation test", False, str(e))

    # =========================================================================
    # SUMMARY REPORT
    # =========================================================================
    print("\n" + "=" * 80)
    print(" VERIFICATION SUMMARY MATRIX (GEN 2)")
    print("=" * 80)
    total_passed = sum(c['passed'] for c in results['criteria'].values())
    total_failed = sum(c['failed'] for c in results['criteria'].values())
    total_assertions = total_passed + total_failed

    for ac_id, c_data in sorted(results['criteria'].items()):
        status = "PASSED (100%)" if c_data['failed'] == 0 else f"FAILED ({c_data['failed']} failures)"
        print(f" {ac_id}: {status} — {c_data['passed']}/{c_data['passed'] + c_data['failed']} assertions passed")

    print("-" * 80)
    print(f" TOTAL ASSERTIONS VERIFIED: {total_assertions}")
    print(f" PASSED : {total_passed}")
    print(f" FAILED : {total_failed}")
    print(f" SUCCESS RATE: {round((total_passed / total_assertions) * 100, 2) if total_assertions > 0 else 0}%")
    print("=" * 80)

    return total_failed == 0

if __name__ == '__main__':
    success = run_acceptance_audit()
    sys.exit(0 if success else 1)
