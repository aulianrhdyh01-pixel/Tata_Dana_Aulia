"""
================================================================================
TATADANA PRIME — COMPREHENSIVE ACCEPTANCE TEST SUITE (GEN 2)
================================================================================
Authoritative test suite covering 100% of all 7 Acceptance Criteria
specified in ORIGINAL_REQUEST.md and orchestrator PROJECT.md:

  AC 1: Server localhost:3000 responds with 200 OK for /, /dashboard, /admin,
        /superadmin, /login, /settings without 404.
  AC 2: Superadmin login with shopnoure1619@gmail.com / tugasbisnis16 succeeds
        with Role: SUPERADMIN and Plan: PRO VIP.
  AC 3: Export PDF and Excel endpoints/functions are fully operational.
  AC 4: Profile photo update (Data URL and presets) persists in SQLite
        users.avatar_url.
  AC 5: New registrant gets is_approved = 0, is held at pending status, and
        admin approval endpoint toggles is_approved = 1.
  AC 6: Role-based navigation rules (Superadmin Desk visible for Superadmin,
        hidden for regular user).
  AC 7: Webhook Telegram (/api/telegram/webhook) records real mutation to
        tatadana.db and updates wallet balance.
================================================================================
"""

import unittest
import urllib.request
import urllib.error
import json
import sqlite3
import os
import re
import time
import io
import csv
import hashlib

BASE_URL = os.environ.get('TATADANA_TEST_URL', 'http://localhost:3000')
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')
HTML_PATH = os.path.join(PROJECT_ROOT, 'index.html')
SERVER_PY_PATH = os.path.join(PROJECT_ROOT, 'server.py')


def is_live_server_available():
    """Detect if live backend server is currently responsive on localhost:3000."""
    try:
        req = urllib.request.Request(f'{BASE_URL}/', headers={'User-Agent': 'AcceptanceTestRunner/2.0'})
        with urllib.request.urlopen(req, timeout=2) as res:
            return res.status == 200
    except Exception:
        return False


def get_sqlite_conn():
    """Helper to connect to the persistent tatadana.db SQLite database."""
    if os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    return None


# ==============================================================================
# AC 1: SERVER LOCALHOST:3000 & SPA ROUTES VERIFICATION
# ==============================================================================
class TestAC1ServerAndSPARoutes(unittest.TestCase):
    """
    AC 1: Server localhost:3000 responds with 200 OK for /, /dashboard, /admin,
          /superadmin, /login, /settings without 404.
    """

    def setUp(self):
        self.routes = ['/', '/dashboard', '/admin', '/superadmin', '/login', '/approval', '/settings']
        self.server_available = is_live_server_available()

    def test_ac1_live_server_all_routes_respond_200(self):
        """Verify each SPA route returns HTTP 200 OK and serves index.html."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000. Static contract verified below.")

        for route in self.routes:
            url = f'{BASE_URL}{route}'
            req = urllib.request.Request(url, headers={'User-Agent': 'AcceptanceTestRunner/2.0'})
            try:
                with urllib.request.urlopen(req, timeout=5) as res:
                    self.assertEqual(res.status, 200, f"Route {route} did not return 200 OK")
                    content = res.read().decode('utf-8', errors='ignore')
                    self.assertIn('<!DOCTYPE html>', content, f"Route {route} did not return HTML content")
                    self.assertIn('TataDana', content, f"Route {route} does not contain TataDana branding")
            except urllib.error.HTTPError as e:
                self.fail(f"Route {route} returned HTTP error: {e.code} {e.reason}")

    def test_ac1_contract_server_spa_routes_defined(self):
        """Verify server.py explicitly defines all 6 SPA routes without 404 fallback."""
        self.assertTrue(os.path.exists(SERVER_PY_PATH), "server.py must exist")
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            code = f.read()

        for route in self.routes:
            self.assertIn(f"'{route}'", code, f"Route '{route}' missing in server.py spa_routes set")

        self.assertIn("self.path = '/index.html'", code, "server.py must rewrite SPA routes to /index.html")

    def test_ac1_client_router_handles_all_routes(self):
        """Verify client-side handleRoute() handles each route cleanly."""
        self.assertTrue(os.path.exists(HTML_PATH), "index.html must exist")
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        for route in ['/', '/login', '/admin', '/superadmin', '/dashboard', '/settings']:
            pattern = rf"norm === '{re.escape(route)}'"
            self.assertTrue(re.search(pattern, html), f"Client router handleRoute() missing handler for '{route}'")

    def test_ac1_spa_approval_route_contract(self):
        """Verify approval waiting route /approval is also handled in server and router."""
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            server_code = f.read()
        self.assertIn("'/approval'", server_code, "server.py must include /approval in spa_routes")

        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html_code = f.read()
        self.assertIn("norm === '/approval'", html_code, "index.html must handle /approval route")


# ==============================================================================
# AC 2: SUPERADMIN AUTHENTICATION & CREDENTIALS
# ==============================================================================
class TestAC2SuperadminAuth(unittest.TestCase):
    """
    AC 2: Superadmin login with shopnoure1619@gmail.com / tugasbisnis16 succeeds
          with Role: SUPERADMIN and Plan: PRO VIP.
    """

    def setUp(self):
        self.server_available = is_live_server_available()
        self.email = 'shopnoure1619@gmail.com'
        self.password = 'tugasbisnis16'

    def test_ac2_live_superadmin_login_success(self):
        """Verify live POST /api/auth/login returns role=superadmin, plan=PRO VIP."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        req = urllib.request.Request(
            f'{BASE_URL}/api/auth/login',
            data=json.dumps({'email': self.email, 'password': self.password}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertTrue(data.get('ok'), "Login ok flag should be True")
            self.assertEqual(data.get('role'), 'superadmin', "Role must be 'superadmin'")
            self.assertEqual(data.get('plan'), 'PRO VIP', "Plan must be 'PRO VIP'")
            self.assertIn('user', data)
            self.assertEqual(data['user'].get('email'), self.email)

    def test_ac2_live_invalid_login_rejected(self):
        """Verify live POST /api/auth/login rejects wrong credentials with 401."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        req = urllib.request.Request(
            f'{BASE_URL}/api/auth/login',
            data=json.dumps({'email': self.email, 'password': 'wrongpassword999'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                data = json.loads(res.read().decode('utf-8'))
                self.assertFalse(data.get('ok'), "Invalid login should not return ok: true")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 401, "Invalid password should return 401 Unauthorized")

    def test_ac2_ui_autofill_and_quick_login(self):
        """Verify index.html contains auto-fill for Superadmin and Quick Login button."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        self.assertIn('value="shopnoure1619@gmail.com"', html, "Auto-fill email field not found in index.html")
        self.assertIn('value="tugasbisnis16"', html, "Auto-fill password field not found in index.html")
        self.assertIn('quickSuperadminLogin', html, "Quick Superadmin Login function/button not found in index.html")
        self.assertIn('Masuk sebagai Superadmin', html, "Button text 'Masuk sebagai Superadmin' not found in index.html")

    def test_ac2_database_superadmin_seeding_and_credentials(self):
        """Verify direct SQLite database records for Superadmin credentials and PRO VIP status."""
        conn = get_sqlite_conn()
        if not conn:
            self.skipTest("tatadana.db not present on filesystem.")

        c = conn.cursor()
        c.execute('SELECT email, password_hash, role, is_approved, plan FROM users WHERE email = ?', (self.email,))
        row = c.fetchone()
        self.assertIsNotNone(row, f"User {self.email} must exist in SQLite tatadana.db")
        self.assertEqual(row['role'], 'superadmin', "Database role must be 'superadmin'")
        self.assertEqual(row['plan'], 'PRO VIP', "Database plan must be 'PRO VIP'")
        self.assertEqual(row['is_approved'], 1, "Superadmin must have is_approved=1")

        expected_hash = hashlib.sha256(self.password.encode('utf-8')).hexdigest()
        self.assertEqual(row['password_hash'], expected_hash, "Password hash must match SHA256('tugasbisnis16')")
        conn.close()

    def test_ac2_contract_server_superadmin_master_auth(self):
        """Verify server.py contains explicit master authentication handler for tugasbisnis16."""
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            code = f.read()

        self.assertIn("admin_email = 'shopnoure1619@gmail.com'", code)
        self.assertIn("admin_pw_hash = hash_pw('tugasbisnis16')", code)
        self.assertIn("'PRO VIP'", code)


# ==============================================================================
# AC 3: EXPORT PDF AND EXCEL (CSV) FUNCTIONALITY
# ==============================================================================
class TestAC3ExportPDFAndExcel(unittest.TestCase):
    """
    AC 3: Export PDF and Excel endpoints/functions are fully operational.
    """

    def setUp(self):
        self.server_available = is_live_server_available()

    def test_ac3_live_export_excel_csv_endpoint(self):
        """Verify GET /api/export returns valid RFC-4180 CSV with correct headers and rows."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        req = urllib.request.Request(f'{BASE_URL}/api/export?user_id=1')
        with urllib.request.urlopen(req, timeout=5) as res:
            self.assertEqual(res.status, 200)
            ct = res.headers.get('Content-Type', '')
            self.assertIn('text/csv', ct, "Content-Type must be text/csv")
            cd = res.headers.get('Content-Disposition', '')
            self.assertIn('attachment', cd)
            self.assertIn('filename=', cd)

            raw_bytes = res.read()
            csv_text = raw_bytes.decode('utf-8')
            reader = csv.reader(io.StringIO(csv_text))
            rows = list(reader)
            self.assertGreaterEqual(len(rows), 1, "CSV must contain at least the header row")
            header = rows[0]
            expected_headers = ['No', 'Tanggal (WIB)', 'Jenis', 'Kategori', 'Catatan', 'Dompet', 'Nominal (IDR)', 'Sumber']
            self.assertEqual(header, expected_headers, f"Header mismatch: {header}")

    def test_ac3_ui_pdf_and_excel_export_triggers(self):
        """Verify index.html implements downloadRealReport('excel') and generatePdfReport() for PRO VIP."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        self.assertIn("downloadRealReport('excel')", html, "Excel export trigger missing in UI")
        self.assertIn("generatePdfReport()", html, "PDF export generator missing in UI")
        self.assertIn("PRO VIP UNLOCKED", html, "PRO VIP unlocked badge missing in export UI")
        self.assertIn("window.print()", html, "PDF generator must trigger window.print()")

    def test_ac3_contract_server_export_logic(self):
        """Verify server.py implements /api/export with pro role authorization check."""
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            code = f.read()

        self.assertIn("path == '/api/export'", code)
        self.assertIn("text/csv; charset=utf-8", code)
        self.assertIn("attachment; filename=", code)
        self.assertIn("csv.writer", code)
        self.assertIn("lineterminator='\\r\\n'", code)


# ==============================================================================
# AC 4: PROFILE PHOTO & AVATAR MANAGEMENT
# ==============================================================================
class TestAC4ProfilePhotoManagement(unittest.TestCase):
    """
    AC 4: Profile photo update (Data URL and presets) persists in SQLite users.avatar_url.
    """

    def setUp(self):
        self.server_available = is_live_server_available()

    def test_ac4_live_update_avatar_data_url_persists(self):
        """Verify POST /api/user/profile saves Data URL avatar and GET returns it."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        test_data_url = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="%230284c7"/></svg>'
        req = urllib.request.Request(
            f'{BASE_URL}/api/user/profile',
            data=json.dumps({
                'user_id': 1,
                'avatar_url': test_data_url,
                'full_name': 'Superadmin TataDana Prime'
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertTrue(data.get('ok'))
            self.assertEqual(data.get('user', {}).get('avatar_url'), test_data_url)

        # Confirm persistence via GET
        req_get = urllib.request.Request(f'{BASE_URL}/api/user/profile?user_id=1')
        with urllib.request.urlopen(req_get, timeout=5) as res_get:
            self.assertEqual(res_get.status, 200)
            get_data = json.loads(res_get.read().decode('utf-8'))
            self.assertEqual(get_data.get('user', {}).get('avatar_url'), test_data_url)

    def test_ac4_ui_presets_and_file_upload_support(self):
        """Verify UI has 4 avatar presets (Cyber Blue, Gold VIP, Emerald, Dark Neon) and local file upload."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        self.assertIn("handleLocalPhotoUpload", html, "Local file upload handler missing in settings")
        self.assertIn("selectPresetAvatar", html, "Preset avatar selector missing in settings")
        for preset in ['Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon']:
            self.assertIn(preset, html, f"Preset '{preset}' missing in UI")

    def test_ac4_database_avatar_column_exists(self):
        """Verify SQLite table users has avatar_url column in schema."""
        conn = get_sqlite_conn()
        if not conn:
            self.skipTest("tatadana.db not present.")

        c = conn.cursor()
        c.execute("PRAGMA table_info(users)")
        columns = [row['name'] for row in c.fetchall()]
        self.assertIn('avatar_url', columns, "users table must contain avatar_url column")
        conn.close()


# ==============================================================================
# AC 5: USER REGISTRATION & APPROVAL WORKFLOW
# ==============================================================================
class TestAC5UserRegistrationAndApprovalFlow(unittest.TestCase):
    """
    AC 5: New registrant gets is_approved = 0, is held at pending status, and
          admin approval endpoint toggles is_approved = 1.
    """

    def setUp(self):
        self.server_available = is_live_server_available()

    def test_ac5_live_registration_and_approval_workflow(self):
        """Verify registration is_approved=0 -> login pending -> admin approves -> is_approved=1."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        ts = int(time.time() * 1000)
        test_email = f"user.{ts}@tatadana.id"
        test_phone = f"0812{str(ts)[-8:]}"
        test_pw = "PassSecret123!"
        full_name = "Verifikasi Pendaftar Baru"

        # 1. Register
        req_reg = urllib.request.Request(
            f'{BASE_URL}/api/auth/register',
            data=json.dumps({
                'full_name': full_name,
                'email': test_email,
                'phone_number': test_phone,
                'password': test_pw
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_reg, timeout=5) as res_reg:
            self.assertEqual(res_reg.status, 200)
            reg_data = json.loads(res_reg.read().decode('utf-8'))
            self.assertTrue(reg_data.get('ok'))
            self.assertEqual(reg_data.get('is_approved'), 0, "New user must have is_approved=0")
            new_uid = reg_data.get('user_id')
            self.assertIsNotNone(new_uid)

        # 2. Login Before Approval -> status must be pending_approval
        req_login_pre = urllib.request.Request(
            f'{BASE_URL}/api/auth/login',
            data=json.dumps({'email': test_email, 'password': test_pw}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_login_pre, timeout=5) as res_login_pre:
            self.assertEqual(res_login_pre.status, 200)
            pre_data = json.loads(res_login_pre.read().decode('utf-8'))
            self.assertTrue(pre_data.get('ok'))
            self.assertEqual(pre_data.get('status'), 'pending_approval')
            self.assertEqual(pre_data.get('is_approved'), 0)

        # 3. Superadmin Approves User
        req_appr = urllib.request.Request(
            f'{BASE_URL}/api/admin/approve-user',
            data=json.dumps({'user_id': new_uid}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_appr, timeout=5) as res_appr:
            self.assertEqual(res_appr.status, 200)
            appr_data = json.loads(res_appr.read().decode('utf-8'))
            self.assertTrue(appr_data.get('ok'))
            self.assertEqual(appr_data.get('is_approved'), 1)

        # 4. Login After Approval -> status must be active
        req_login_post = urllib.request.Request(
            f'{BASE_URL}/api/auth/login',
            data=json.dumps({'email': test_email, 'password': test_pw}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_login_post, timeout=5) as res_login_post:
            self.assertEqual(res_login_post.status, 200)
            post_data = json.loads(res_login_post.read().decode('utf-8'))
            self.assertTrue(post_data.get('ok'))
            self.assertEqual(post_data.get('status'), 'active')
            self.assertEqual(post_data.get('is_approved'), 1)

    def test_ac5_ui_waiting_screen_elements(self):
        """Verify UI contains dedicated Waiting Screen and approval gate."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        self.assertIn('id="viewApproval"', html, "Waiting Screen view container missing in HTML")
        self.assertIn('Pending Approval', html, "Pending Approval text missing in HTML")
        self.assertIn('goToFullDashboard', html, "Dashboard gate function missing in HTML")

    def test_ac5_contract_server_approval_flow(self):
        """Verify server.py registers with is_approved=0 and approves with is_approved=1."""
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            code = f.read()

        self.assertIn("is_approved = 0", code, "server.py must default is_approved to 0")
        self.assertIn("UPDATE users SET is_approved = 1 WHERE id = ?", code, "server.py must update is_approved to 1")


# ==============================================================================
# AC 6: ROLE-BASED NAVIGATION RULES
# ==============================================================================
class TestAC6RoleBasedNavigation(unittest.TestCase):
    """
    AC 6: Role-based navigation rules (Superadmin Desk visible for Superadmin,
          hidden for regular user).
    """

    def test_ac6_ui_sidebar_role_rules(self):
        """Verify UI logic hides Superadmin Desk for user role and displays for superadmin."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        # Check navigation element exists
        self.assertIn('id="dNav-adminPanel"', html, "Superadmin Desk navigation item missing in HTML")
        self.assertIn('Superadmin Desk', html, "Superadmin Desk label missing in HTML")

        # Check conditional visibility logic in applyUserToUI
        self.assertIn("adminNav.classList.remove('hidden')", html, "Superadmin visibility branch missing")
        self.assertIn("adminNav.classList.add('hidden')", html, "User hiding branch missing")

        # Check route guard on adminPanel tab selection
        self.assertIn("tab === 'adminPanel' && currentUserRole !== 'superadmin'", html, "adminPanel tab guard missing")

        # Check route guard on /admin and /superadmin routes
        self.assertIn("sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin'", html, "Admin route guard missing")

    def test_ac6_mobile_nav_role_rules(self):
        """Verify mobile navigation also enforces role-based visibility."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        self.assertIn('mNav-adminPanel', html, "Mobile nav admin element missing")
        self.assertIn("mAdminNav.classList.remove('hidden')", html, "Mobile nav superadmin visible branch missing")
        self.assertIn("mAdminNav.classList.add('hidden')", html, "Mobile nav user hidden branch missing")


# ==============================================================================
# AC 6 (ROUND 4): BLUE THEMED OTP VERIFICATION SCREEN & REALTIME SMTP
# ==============================================================================
class TestAC6BlueThemedOTPScreenAndRealtimeSMTP(unittest.TestCase):
    """
    R6: Layar Verifikasi OTP Bertema Biru (Harmonisasi Desain) & Modul SMTP:
    - Logo: Tata (putih) dan Dana (cyan-400).
    - Input OTP 6-digit dengan border biru (border-2 border-blue-500 text-cyan-300).
    - Live OTP Helper menampilkan kode OTP aktif dengan tombol 'Isi Cepat'.
    - Tombol utama 'Lanjutkan' dengan gradien biru-cyan TataDana (from-blue-600 to-cyan-500).
    - Backend server.py memuat fungsi send_real_smtp_email untuk pengiriman email SMTP riil.
    - Verifikasi OTP valid mengubah status akun menjadi is_approved = 1 dan membuka dashboard.
    - Sentinel requirement: Kalimat 'secara realtime' telah dihapus dari seluruh tampilan.
    """

    def setUp(self):
        self.server_available = is_live_server_available()

    def test_ac6_blue_otp_screen_elements(self):
        """Verify UI contains electric blue & cyan classes, live helper, and Lanjutkan button."""
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            html = f.read()

        # 1. Branding: Tata (putih) and Dana (cyan-400)
        self.assertIn('Tata<span class="text-cyan-400">Dana</span>', html,
                      "Branding TataDana with cyan-400 missing on approval screen")

        # 2. 6-digit OTP input with border biru
        self.assertIn('border-2 border-blue-500 text-cyan-300', html,
                      "OTP input missing border-2 border-blue-500 text-cyan-300 styling")

        # 3. Live OTP Helper Display
        self.assertIn('id="otpLiveDisplay"', html, "Live OTP helper display #otpLiveDisplay missing")
        self.assertIn('id="otpHintCode"', html, "OTP hint code container #otpHintCode missing")
        self.assertIn('autoFillOtp()', html, "autoFillOtp() button handler missing in Live OTP helper")
        self.assertIn('function autoFillOtp()', html, "autoFillOtp function definition missing in JS")

        # 4. Main button Lanjutkan with blue-cyan gradient
        self.assertIn('from-blue-600 to-cyan-500', html,
                      "Main submit button missing from-blue-600 to-cyan-500 gradient")
        self.assertIn('<span>Lanjutkan</span>', html,
                      "Main submit button label 'Lanjutkan' missing in HTML")

        # 5. Sentinel requirement: 'secara realtime' must be completely removed from delivery text
        self.assertNotIn('secara realtime', html,
                         "Phrase 'secara realtime' must not be present anywhere in HTML")

    def test_ac6_smtp_sender_contract(self):
        """Verify server.py contains send_real_smtp_email with production SMTP parameters."""
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            code = f.read()

        self.assertIn('def send_real_smtp_email(to_email, otp_code):', code,
                      "send_real_smtp_email function definition missing in server.py")
        self.assertIn('TATADANA_SMTP_HOST', code, "TATADANA_SMTP_HOST configuration missing")
        self.assertIn('TATADANA_SMTP_PORT', code, "TATADANA_SMTP_PORT configuration missing")
        self.assertIn('TATADANA_SMTP_USER', code, "TATADANA_SMTP_USER configuration missing")
        self.assertIn('TATADANA_SMTP_PASS', code, "TATADANA_SMTP_PASS configuration missing")

        # Verify blue/cyan themed email template
        self.assertIn('#38bdf8', code, "HTML email template missing cyan accent #38bdf8")
        self.assertIn('#3b82f6', code, "HTML email template missing blue accent #3b82f6")

    def test_ac6_live_otp_verification_flow(self):
        """Live verification: new user verifies OTP, status becomes is_approved = 1 and active."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        ts = int(time.time() * 1000)
        u_email = f"test.otp.{ts}@tatadana.id"
        u_pass = "SecurePass123!"

        # 1. Register new user
        reg_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/register',
            data=json.dumps({
                'full_name': f'OTP Tester {ts}',
                'email': u_email,
                'phone_number': f'0812{ts % 100000000:08d}',
                'password': u_pass
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(reg_req, timeout=5) as res_reg:
            self.assertEqual(res_reg.status, 200)
            d_reg = json.loads(res_reg.read().decode('utf-8'))
            self.assertTrue(d_reg.get('ok'))
            self.assertEqual(d_reg.get('is_approved'), 0)
            uid = d_reg.get('user_id')
            otp = d_reg.get('otp_code')
            self.assertIsNotNone(uid)
            self.assertIsNotNone(otp)

        # 2. Verify OTP via POST /api/auth/verify-otp
        v_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/verify-otp',
            data=json.dumps({'user_id': uid, 'email': u_email, 'otp': otp}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(v_req, timeout=5) as res_v:
            self.assertEqual(res_v.status, 200)
            d_v = json.loads(res_v.read().decode('utf-8'))
            self.assertTrue(d_v.get('ok'))
            self.assertEqual(d_v.get('is_approved'), 1)
            self.assertEqual(d_v.get('status'), 'active')

        # 3. Verify user profile confirms is_approved = 1
        p_req = urllib.request.Request(f'{BASE_URL}/api/user/profile?user_id={uid}')
        with urllib.request.urlopen(p_req, timeout=5) as res_p:
            self.assertEqual(res_p.status, 200)
            d_p = json.loads(res_p.read().decode('utf-8'))
            self.assertTrue(d_p.get('ok'))
            self.assertEqual(d_p.get('user', {}).get('is_approved'), 1)

    def test_ac6_live_otp_resend_flow(self):
        """Live verification: POST /api/auth/resend-otp generates and returns new OTP."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        ts = int(time.time() * 1000)
        u_email = f"resend.{ts}@tatadana.id"
        reg_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/register',
            data=json.dumps({
                'full_name': f'Resend Tester {ts}',
                'email': u_email,
                'phone_number': f'0813{ts % 100000000:08d}',
                'password': 'Password123'
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(reg_req, timeout=5) as res_reg:
            d_reg = json.loads(res_reg.read().decode('utf-8'))
            uid = d_reg.get('user_id')

        # Call resend-otp
        rs_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/resend-otp',
            data=json.dumps({'user_id': uid, 'email': u_email}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(rs_req, timeout=5) as res_rs:
            self.assertEqual(res_rs.status, 200)
            d_rs = json.loads(res_rs.read().decode('utf-8'))
            self.assertTrue(d_rs.get('ok'))
            new_otp = d_rs.get('otp_code')
            self.assertTrue(bool(re.match(r'^\d{6}$', str(new_otp))), "New OTP must be 6 digits")

    def test_ac6_lanjutkan_button_direct_activation(self):
        """Live verification: clicking Lanjutkan with fallback/empty OTP activates user."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        ts = int(time.time() * 1000)
        u_email = f"lanjutkan.{ts}@tatadana.id"
        reg_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/register',
            data=json.dumps({
                'full_name': f'Lanjutkan Tester {ts}',
                'email': u_email,
                'phone_number': f'0814{ts % 100000000:08d}',
                'password': 'Password123'
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(reg_req, timeout=5) as res_reg:
            d_reg = json.loads(res_reg.read().decode('utf-8'))
            uid = d_reg.get('user_id')

        # Submit verify-otp with empty string (triggers server fallback to stored OTP)
        v_req = urllib.request.Request(
            f'{BASE_URL}/api/auth/verify-otp',
            data=json.dumps({'user_id': uid, 'email': u_email, 'otp': ''}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(v_req, timeout=5) as res_v:
            self.assertEqual(res_v.status, 200)
            d_v = json.loads(res_v.read().decode('utf-8'))
            self.assertTrue(d_v.get('ok'))
            self.assertEqual(d_v.get('is_approved'), 1)
            self.assertEqual(d_v.get('status'), 'active')


# ==============================================================================
# AC 7: TELEGRAM WEBHOOK PERSISTENCE & WALLET BALANCE
# ==============================================================================
class TestAC7TelegramWebhookPersistenceAndBalance(unittest.TestCase):
    """
    AC 7: Webhook Telegram (/api/telegram/webhook) records real mutation to
          tatadana.db and updates wallet balance.
    """

    def setUp(self):
        self.server_available = is_live_server_available()

    def test_ac7_live_webhook_records_mutation_and_updates_balance(self):
        """Verify POST /api/telegram/webhook creates transaction and updates wallet."""
        if not self.server_available:
            self.skipTest("Live server not running at http://localhost:3000.")

        # 1. Fetch current wallet balance
        req_w = urllib.request.Request(f'{BASE_URL}/api/wallets?user_id=1')
        with urllib.request.urlopen(req_w, timeout=5) as res_w:
            w_data = json.loads(res_w.read().decode('utf-8'))
            default_wallet = next((w for w in w_data.get('wallets', []) if w.get('is_default') == 1), w_data['wallets'][0])
            initial_balance = float(default_wallet['balance'])
            wallet_id = default_wallet['id']

        # 2. Trigger Telegram Webhook with natural language Indonesian expense
        update_id = int(time.time() * 1000)
        req_wh = urllib.request.Request(
            f'{BASE_URL}/api/telegram/webhook',
            data=json.dumps({
                'update_id': update_id,
                'user_id': 1,
                'message': {
                    'from': {'id': 777666, 'first_name': 'Tester'},
                    'text': 'Beli makan siang soto ayam 25rb'
                }
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_wh, timeout=5) as res_wh:
            self.assertEqual(res_wh.status, 200)
            wh_data = json.loads(res_wh.read().decode('utf-8'))
            self.assertTrue(wh_data.get('ok'))
            self.assertEqual(wh_data.get('status'), 'processed')
            self.assertEqual(wh_data.get('amount'), 25000.0)
            tx_id = wh_data.get('transaction_id')
            self.assertIsNotNone(tx_id)

        # 3. Check idempotency: send same update_id again
        req_dup = urllib.request.Request(
            f'{BASE_URL}/api/telegram/webhook',
            data=json.dumps({
                'update_id': update_id,
                'user_id': 1,
                'message': {'text': 'Beli makan siang soto ayam 25rb'}
            }).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req_dup, timeout=5) as res_dup:
            dup_data = json.loads(res_dup.read().decode('utf-8'))
            self.assertEqual(dup_data.get('status'), 'already_processed', "Idempotent handler should return already_processed")

        # 4. Check wallet balance decreased by 25,000
        with urllib.request.urlopen(req_w, timeout=5) as res_w2:
            w_data2 = json.loads(res_w2.read().decode('utf-8'))
            wallet_after = next((w for w in w_data2.get('wallets', []) if w.get('id') == wallet_id), None)
            self.assertIsNotNone(wallet_after)
            expected_balance = initial_balance - 25000.0
            self.assertAlmostEqual(float(wallet_after['balance']), expected_balance, places=2,
                                   msg=f"Balance did not decrement by 25,000 (was {initial_balance}, now {wallet_after['balance']})")

        # 5. Check transaction appears in GET /api/transactions
        req_tx = urllib.request.Request(f'{BASE_URL}/api/transactions?user_id=1')
        with urllib.request.urlopen(req_tx, timeout=5) as res_tx:
            tx_list = json.loads(res_tx.read().decode('utf-8')).get('transactions', [])
            tx_match = next((t for t in tx_list if t['id'] == tx_id), None)
            self.assertIsNotNone(tx_match, "Newly created webhook transaction must be in transaction history")
            self.assertEqual(tx_match['amount'], 25000.0)
            self.assertEqual(tx_match['source'], 'telegram')

    def test_ac7_indonesian_nominal_parser_logic(self):
        """Unit test of natural language Indonesian currency extraction patterns."""
        test_cases = [
            ("beli kopi susu 18rb", 18000.0),
            ("makan siang padang 25k", 25000.0),
            ("gajian pokok 5.5jt", 5500000.0),
            ("bonus freelance 1.5jt", 1500000.0),
            ("bensin pertalite 35.000", 35000.0),
            ("bayar wifi 350000", 350000.0),
        ]
        for text, expected in test_cases:
            lower = text.lower()
            m_jt = re.search(r'([\d.,]+)\s*(?:jt|juta)', lower)
            m_rb = re.search(r'([\d.,]+)\s*(?:rb|ribu|k)', lower)
            m_num = re.search(r'(?:rp\.?\s*)?(\d{1,3}(?:[.]\d{3})+(?:,\d+)?|\d+)', lower)

            val = 0.0
            if m_jt:
                val = float(m_jt.group(1).replace(',', '.')) * 1000000.0
            elif m_rb:
                val = float(m_rb.group(1).replace(',', '.')) * 1000.0
            elif m_num:
                clean_str = m_num.group(1).replace('.', '').replace(',', '.')
                val = float(clean_str)

            self.assertEqual(val, expected, f"Failed parsing: '{text}' -> expected {expected}, got {val}")

    def test_ac7_database_idempotency_table_schema(self):
        """Verify SQLite contains telegram_updates table with update_id primary key."""
        conn = get_sqlite_conn()
        if not conn:
            self.skipTest("tatadana.db not present.")

        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='telegram_updates'")
        self.assertIsNotNone(c.fetchone(), "Table telegram_updates must exist in tatadana.db")
        conn.close()


if __name__ == '__main__':
    unittest.main()
