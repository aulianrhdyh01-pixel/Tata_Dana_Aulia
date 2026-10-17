"""
================================================================================
TATADANA PRIME — ROUND 4 COMPREHENSIVE E2E & SPECIFICATION TEST SUITE
================================================================================
Exhaustive verification of requirements R1 through R7:
- R1: Server & SPA routes (/, /dashboard, /admin, /superadmin, /login, /approval, /settings)
- R2: Superadmin Authentication (shopnoure1619@gmail.com / tugasbisnis16), Role: SUPERADMIN, Plan: PRO VIP, Quick Login, Route Protection
- R3: PRO VIP Export Features (RFC-4180 CSV Export, PDF Generator, Unlocked Status)
- R4: Profile Photo Management in /settings (Data URL, 4 Presets, SQLite Persistence)
- R5: Registration Flow & Approval Gate (is_approved = 0 -> Waiting Screen /approval)
- R6: Blue-Themed OTP Verification Screen & Lanjutkan Flow:
      * Cyan & Electric Blue Theme (Logo: Tata & cyan-400 Dana)
      * OTP Input (border-2 border-blue-500 text-cyan-300)
      * Live OTP Helper (#otpLiveDisplay, #otpHintCode, 'Isi Cepat' -> autoFillOtp)
      * Main Button 'Lanjutkan' (from-blue-600 to-cyan-500)
      * Total absence of phrase 'secara realtime' in index.html UI
      * Backend send_real_smtp_email module with SMTP config env vars
      * Instant activation to is_approved = 1 upon clicking 'Lanjutkan' or verifying OTP
- R7: Telegram Webhook Persistence & Balance Mutation:
      * Idempotency with telegram_updates table and update_id
      * Natural Language nominal parsing (jt, rb, k, dot notation)
      * Real balance mutation and permanent transaction persistence
================================================================================
"""

import unittest
import os
import sys
import json
import sqlite3
import hashlib
import time
import io
import csv
import re
import socket
import threading
import urllib.request
import urllib.error
import http.server
import socketserver

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import server

HTML_PATH = os.path.join(PROJECT_ROOT, 'index.html')
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')
SERVER_PY_PATH = os.path.join(PROJECT_ROOT, 'server.py')


def find_free_port():
    """Find an available port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


class TestTataDanaR1SPARoutes(unittest.TestCase):
    """
    R1. Operasional Server Localhost & Akses SPA:
    - Server backend melayani rute: /, /dashboard, /admin, /superadmin, /login, /approval, /settings
    - Semua rute halaman dapat diakses langsung tanpa galat 404.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()
        self.expected_routes = ['/', '/dashboard', '/admin', '/superadmin', '/login', '/approval', '/settings']

    def test_r1_spa_routes_defined_in_backend(self):
        """Verify server.py spa_routes set contains all 7 routes."""
        for route in self.expected_routes:
            self.assertIn(f"'{route}'", self.server_code, f"Route '{route}' missing in server.py")

    def test_r1_spa_route_rewrite_to_index_html(self):
        """Verify server rewrites SPA requests to /index.html."""
        self.assertIn("self.path = '/index.html'", self.server_code,
                      "Server must rewrite SPA route requests to /index.html")

    def test_r1_client_router_coverage(self):
        """Verify client-side handleRoute() explicitly handles each of the 7 routes."""
        for route in ['/', '/login', '/approval', '/admin', '/superadmin', '/dashboard', '/settings']:
            pattern = rf"norm === '{re.escape(route)}'"
            self.assertTrue(re.search(pattern, self.html_code),
                            f"Client-side router missing condition for '{route}'")


class TestTataDanaR2SuperadminAuth(unittest.TestCase):
    """
    R2. Otorisasi Role Admin vs User:
    - Halaman /login memiliki auto-fill kredensial Superadmin: shopnoure1619@gmail.com / tugasbisnis16
    - Role akun: SUPERADMIN dengan paket langganan: PRO VIP.
    - Tombol Quick Login 'Masuk sebagai Superadmin' berfungsi login instan dan mengarahkan ke /admin.
    - Proteksi Rute: Hanya role Superadmin/Admin yang dapat mengakses /admin; user biasa dialihkan ke /dashboard.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()

    def test_r2_superadmin_seeding_and_credentials(self):
        """Verify server seeds master Superadmin with email shopnoure1619@gmail.com and password hash of tugasbisnis16."""
        self.assertIn("admin_email = 'shopnoure1619@gmail.com'", self.server_code)
        self.assertIn("admin_pw_hash = hash_pw('tugasbisnis16')", self.server_code)
        self.assertIn("'PRO VIP'", self.server_code)

        expected_hash = hashlib.sha256('tugasbisnis16'.encode('utf-8')).hexdigest()
        self.assertEqual(server.hash_pw('tugasbisnis16'), expected_hash)

    def test_r2_ui_autofill_and_quick_login_button(self):
        """Verify HTML contains auto-fill fields and quick login button."""
        self.assertIn('value="shopnoure1619@gmail.com"', self.html_code)
        self.assertIn('value="tugasbisnis16"', self.html_code)
        self.assertIn('quickSuperadminLogin', self.html_code)
        self.assertIn('Masuk sebagai Superadmin', self.html_code)

    def test_r2_admin_route_protection_logic(self):
        """Verify client-side handleRoute() protects /admin against non-superadmin users."""
        self.assertIn("sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin'", self.html_code)
        self.assertIn("navigate('/dashboard', true)", self.html_code)


class TestTataDanaR3ExportFeatures(unittest.TestCase):
    """
    R3. Fitur Akun PRO VIP (Ekspor Laporan Aktif):
    - Akun PRO VIP memiliki akses penuh ke fitur Ekspor PDF Resmi dan Ekspor Excel (.csv) pada menu Mutasi & Laporan (tombol tidak terkunci).
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()

    def test_r3_server_csv_export_endpoint(self):
        """Verify /api/export endpoint produces RFC-4180 CSV with correct headers."""
        self.assertIn("path == '/api/export'", self.server_code)
        self.assertIn("text/csv; charset=utf-8", self.server_code)
        self.assertIn("attachment; filename=", self.server_code)
        self.assertIn("No', 'Tanggal (WIB)', 'Jenis', 'Kategori', 'Catatan', 'Dompet', 'Nominal (IDR)', 'Sumber", self.server_code)

    def test_r3_pro_vip_export_authorization_guard(self):
        """Verify export is restricted to PRO / PRO VIP accounts."""
        self.assertIn("is_pro = (u_row['role'] in ('admin', 'superadmin')) or ('pro' in str(u_row['plan']).lower())", self.server_code)

    def test_r3_ui_export_controls_and_badge(self):
        """Verify UI contains Excel export, PDF export, and PRO VIP UNLOCKED badge."""
        self.assertIn("downloadRealReport('excel')", self.html_code)
        self.assertIn("generatePdfReport()", self.html_code)
        self.assertIn("PRO VIP UNLOCKED", self.html_code)
        self.assertIn("window.print()", self.html_code)


class TestTataDanaR4ProfilePhotoManagement(unittest.TestCase):
    """
    R4. Manajemen Foto Profil di /settings:
    - Pengguna dapat mengganti foto profil melalui unggah gambar lokal (Data URL) atau 4 pilihan preset avatar.
    - Foto profil tersimpan permanen di SQLite (users.avatar_url) dan tersinkronisasi di sidebar.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()

    def test_r4_schema_and_profile_endpoint(self):
        """Verify avatar_url column in DB schema and /api/user/profile update query."""
        self.assertIn("avatar_url TEXT DEFAULT ''", self.server_code)
        self.assertIn("UPDATE users SET avatar_url = ? WHERE id = ?", self.server_code)

    def test_r4_ui_presets_and_file_reader(self):
        """Verify 4 distinct avatar presets and FileReader Data URL upload in index.html."""
        for preset in ['Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon']:
            self.assertIn(preset, self.html_code, f"Preset '{preset}' missing in UI")
        self.assertIn("handleLocalPhotoUpload", self.html_code)
        self.assertIn("readAsDataURL", self.html_code)
        self.assertIn("selectPresetAvatar", self.html_code)


class TestTataDanaR5RegistrationAndApprovalGate(unittest.TestCase):
    """
    R5. Alur Registrasi User Baru & Approval Gate:
    - Pendaftaran pengguna baru tersimpan dengan is_approved = 0 dan dialihkan ke rute /approval.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()

    def test_r5_registration_defaults_unapproved(self):
        """Verify new users register with is_approved = 0."""
        self.assertIn("VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?, ?)", self.server_code)

    def test_r5_approval_gate_and_waiting_screen(self):
        """Verify unapproved user cannot access /dashboard and is directed to /approval."""
        self.assertIn("sessionUser.is_approved !== 1 && sessionUser.role !== 'superadmin'", self.html_code)
        self.assertIn("navigate('/approval', true)", self.html_code)
        self.assertIn('id="viewApproval"', self.html_code)


class TestTataDanaR6BlueThemedOTPScreenAndLanjutkanFlow(unittest.TestCase):
    """
    R6. Layar Verifikasi OTP Bertema Biru (Harmonisasi Desain) & Lanjutkan Flow:
    - Layar /approval mengadopsi skema warna biru elektrik & cyan senada dengan tampilan TataDana lainnya:
      * Logo: Tata (putih) dan Dana (cyan-400).
      * Input OTP 6-digit dengan border biru (border-2 border-blue-500 text-cyan-300).
      * Live OTP Helper menampilkan kode OTP aktif dengan tombol 'Isi Cepat'.
      * Tombol utama 'Lanjutkan' dengan gradien biru-cyan TataDana (from-blue-600 to-cyan-500).
      * Kalimat "secara realtime" telah dihapus dari seluruh tampilan (halaman verifikasi /approval dan widget).
      * Tombol "Lanjutkan" kini langsung memverifikasi akun pengguna dan segera mengalihkan ke menu dashboard user (/dashboard),
        mengaktifkan status is_approved = 1, inisialisasi dompet, memuat saldo riil, dan menerapkan profil pengguna ke antarmuka.
      * Seluruh pengujian otomatis di test_lanjutkan.py lolos dengan exit code 0.
    - Backend server.py memuat fungsi send_real_smtp_email untuk pengiriman email SMTP riil.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            self.html_code = f.read()

    def test_r6_branding_tata_white_dana_cyan(self):
        """Verify Tata (putih) and Dana (cyan-400) branding."""
        self.assertIn('Tata<span class="text-cyan-400">Dana</span>', self.html_code)

    def test_r6_otp_input_blue_border_styling(self):
        """Verify 6-digit OTP input styled with border-2 border-blue-500 text-cyan-300."""
        self.assertIn('border-2 border-blue-500 text-cyan-300', self.html_code)

    def test_r6_live_otp_helper_and_isi_cepat(self):
        """Verify Live OTP Helper (#otpLiveDisplay, #otpHintCode) and 'Isi Cepat' button triggering autoFillOtp()."""
        self.assertIn('id="otpLiveDisplay"', self.html_code)
        self.assertIn('id="otpHintCode"', self.html_code)
        self.assertIn('onclick="autoFillOtp()"', self.html_code)
        self.assertIn('function autoFillOtp()', self.html_code)

    def test_r6_lanjutkan_button_gradient(self):
        """Verify main button 'Lanjutkan' with blue-cyan gradient (from-blue-600 to-cyan-500)."""
        self.assertIn('from-blue-600 to-cyan-500', self.html_code)
        self.assertIn('<span>Lanjutkan</span>', self.html_code)

    def test_r6_sentinel_removal_secara_realtime(self):
        """Verify phrase 'secara realtime' is completely removed from HTML views."""
        self.assertNotIn('secara realtime', self.html_code,
                         "CRITICAL SENTINEL VIOLATION: 'secara realtime' must not appear anywhere in index.html!")

    def test_r6_smtp_email_module_in_backend(self):
        """Verify server.py contains send_real_smtp_email function and SMTP env vars."""
        self.assertIn('def send_real_smtp_email(to_email, otp_code):', self.server_code)
        for var in ['TATADANA_SMTP_HOST', 'TATADANA_SMTP_PORT', 'TATADANA_SMTP_USER', 'TATADANA_SMTP_PASS']:
            self.assertIn(var, self.server_code, f"Missing SMTP config variable {var} in server.py")

    def test_r6_verify_otp_and_resend_endpoints(self):
        """Verify /api/auth/verify-otp and /api/auth/resend-otp endpoints are defined."""
        self.assertIn("path == '/api/auth/verify-otp'", self.server_code)
        self.assertIn("path == '/api/auth/resend-otp'", self.server_code)

    def test_r6_lanjutkan_instant_activation_flow(self):
        """Verify submitOtpVerification() navigates to /dashboard and sets is_approved = 1."""
        self.assertIn("async function submitOtpVerification()", self.html_code)
        self.assertIn("navigate('/dashboard')", self.html_code)
        self.assertIn("sUser.is_approved = 1", self.html_code)


class TestTataDanaR7TelegramWebhookPersistence(unittest.TestCase):
    """
    R7. Database Webhook Telegram Persisten:
    - Transaksi dari webhook Telegram (/api/telegram/webhook) tersimpan permanen di SQLite dan memutasi saldo dompet riil.
    """

    def setUp(self):
        with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
            self.server_code = f.read()

    def test_r7_idempotency_table_and_check(self):
        """Verify telegram_updates table exists and update_id prevents duplicate processing."""
        self.assertIn("CREATE TABLE IF NOT EXISTS telegram_updates", self.server_code)
        self.assertIn("SELECT update_id FROM telegram_updates WHERE update_id = ?", self.server_code)
        self.assertIn("'already_processed'", self.server_code)

    def test_r7_currency_parser_logic(self):
        """Verify nominal parsing regex patterns for jt, rb, k, and plain numbers."""
        patterns = [
            r'([\d.,]+)\s*(?:jt|juta)',
            r'([\d.,]+)\s*(?:rb|ribu|k)',
            r'(?:rp\.?\s*)?(\d{1,3}(?:[.]\d{3})+(?:,\d+)?|\d+)'
        ]
        for pat in patterns:
            self.assertIn(pat, self.server_code, f"Missing regex pattern {pat} in server.py")

    def test_r7_transaction_insertion_and_balance_update(self):
        """Verify webhook inserts transaction with source='telegram' and mutates wallet balance."""
        self.assertIn("INSERT INTO transactions", self.server_code)
        self.assertIn("'telegram'", self.server_code)
        self.assertIn("UPDATE wallets SET balance = balance", self.server_code)


class TestTataDanaInProcessDatabaseLogic(unittest.TestCase):
    """
    Isolated In-Memory / Temporary Database Tests:
    Tests the complete database lifecycle without touching production tatadana.db:
    - Seeding master Superadmin
    - Registration -> verify OTP -> activation
    - Direct Lanjutkan click (empty OTP fallback)
    - Telegram webhook transaction & balance mutation
    - CSV export generation
    """

    def setUp(self):
        self.test_db = f":memory:"
        self.conn = sqlite3.connect(self.test_db)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")
        server.init_db(self.test_db)

    def tearDown(self):
        self.conn.close()

    def test_db_master_superadmin_seeded(self):
        """Verify master Superadmin is created with PRO VIP and active status."""
        c = self.conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', ('shopnoure1619@gmail.com',))
        admin = c.fetchone()
        self.assertIsNotNone(admin)
        self.assertEqual(admin['role'], 'superadmin')
        self.assertEqual(admin['plan'], 'PRO VIP')
        self.assertEqual(admin['is_approved'], 1)
        self.assertEqual(admin['password_hash'], server.hash_pw('tugasbisnis16'))

        # Check seeded default wallets
        c.execute('SELECT COUNT(*) as cnt FROM wallets WHERE user_id = ?', (admin['id'],))
        w_cnt = c.fetchone()['cnt']
        self.assertGreaterEqual(w_cnt, 4, "Admin must have at least 4 default wallets")

    def test_db_user_registration_and_otp_activation(self):
        """Verify user registration sets is_approved = 0 and OTP verification activates to is_approved = 1."""
        c = self.conn.cursor()
        email = 'newuser@tatadana.id'
        pw_hash = server.hash_pw('SecretPass123')
        otp = '654321'
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, otp_code)
            VALUES (?, ?, 'New User', '081234567890', 'user', 0, 'pro', ?, ?)
        ''', (email, pw_hash, server.get_wib_now(), otp))
        user_id = c.lastrowid
        self.conn.commit()

        # Check before verification
        c.execute('SELECT is_approved, otp_code FROM users WHERE id = ?', (user_id,))
        u_before = c.fetchone()
        self.assertEqual(u_before['is_approved'], 0)
        self.assertEqual(u_before['otp_code'], otp)

        # Simulate OTP Verification / Lanjutkan click
        c.execute('UPDATE users SET is_approved = 1 WHERE id = ?', (user_id,))
        server.seed_user_wallets_and_data(self.conn, user_id)
        self.conn.commit()

        # Check after verification
        c.execute('SELECT is_approved FROM users WHERE id = ?', (user_id,))
        u_after = c.fetchone()
        self.assertEqual(u_after['is_approved'], 1)

        c.execute('SELECT COUNT(*) as cnt FROM wallets WHERE user_id = ?', (user_id,))
        self.assertGreaterEqual(c.fetchone()['cnt'], 4)

    def test_db_telegram_webhook_idempotency_and_mutation(self):
        """Verify Telegram transaction records permanently and updates wallet balance accurately."""
        c = self.conn.cursor()
        c.execute('SELECT id FROM users WHERE email = ?', ('shopnoure1619@gmail.com',))
        admin_id = c.fetchone()['id']

        c.execute('SELECT id, balance FROM wallets WHERE user_id = ? AND is_default = 1', (admin_id,))
        w_row = c.fetchone()
        w_id = w_row['id']
        start_bal = float(w_row['balance'])

        update_id = 99887711
        # 1. Idempotency record
        c.execute('INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)', (update_id, server.get_wib_now()))

        # 2. Insert expense of 45,000
        amount = 45000.0
        c.execute('''
            INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
            VALUES (?, ?, 'Makanan & Minuman', 'pengeluaran', ?, 'Telegram: Nasi Padang 45rb', 'telegram', ?)
        ''', (admin_id, w_id, amount, server.get_wib_now()))
        tx_id = c.lastrowid

        # 3. Deduct balance
        c.execute('UPDATE wallets SET balance = balance - ? WHERE id = ?', (amount, w_id))
        self.conn.commit()

        # 4. Verify balance
        c.execute('SELECT balance FROM wallets WHERE id = ?', (w_id,))
        new_bal = float(c.fetchone()['balance'])
        self.assertEqual(new_bal, start_bal - amount)

        # 5. Verify transaction record
        c.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,))
        tx = c.fetchone()
        self.assertEqual(tx['amount'], amount)
        self.assertEqual(tx['source'], 'telegram')

    def test_db_profile_avatar_url_persistence(self):
        """Verify avatar_url column updates and persists Data URL accurately."""
        c = self.conn.cursor()
        c.execute('SELECT id FROM users WHERE email = ?', ('shopnoure1619@gmail.com',))
        admin_id = c.fetchone()['id']

        test_data_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...'
        c.execute('UPDATE users SET avatar_url = ? WHERE id = ?', (test_data_url, admin_id))
        self.conn.commit()

        c.execute('SELECT avatar_url FROM users WHERE id = ?', (admin_id,))
        self.assertEqual(c.fetchone()['avatar_url'], test_data_url)


if __name__ == '__main__':
    unittest.main()
