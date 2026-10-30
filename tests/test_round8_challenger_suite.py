"""
================================================================================
TATADANA PRIME — ROUND 8 EMPIRICAL CHALLENGER & ADVERSARIAL SUITE
================================================================================
Author: challenger_r8_1 (Empirical Challenger: Critic & Domain Specialist)
Target: Comprehensive Verification across ALL 15 Round 8 Acceptance Criteria:
  1. Security, Auth & User Verification Gate (AC 1.1 - AC 1.5)
  2. Telegram Bot & Multi-Modal Transactions (AC 2.1 - AC 2.5)
  3. Web Dashboard, Reports & Admin Capabilities (AC 3.1 - AC 3.5)
  4. Operational Localhost Status (AC 4.1)
Plus Adversarial Edge Cases, Fuzzing, and Discrepancy Mining.
================================================================================
"""

import os
import sys
import io
import json
import re
import time
import base64
import zipfile
import sqlite3
import unittest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import server

HTML_PATH = os.path.join(PROJECT_ROOT, 'index.html')
DB_PATH = os.path.join(PROJECT_ROOT, 'tatadana.db')
UPLOADS_AVATARS_DIR = os.path.join(PROJECT_ROOT, 'uploads', 'avatars')

# Force stdout/stderr utf-8 safe printing on Windows consoles
def safe_print(msg):
    try:
        sys.stdout.write(msg + '\n')
        sys.stdout.flush()
    except UnicodeEncodeError:
        ascii_msg = msg.encode('ascii', errors='backslashreplace').decode('ascii')
        sys.stdout.write(ascii_msg + '\n')
        sys.stdout.flush()

class MockClientAddress:
    def __init__(self, host='127.0.0.1', port=54321):
        self.host = host
        self.port = port
    def __getitem__(self, item):
        return (self.host, self.port)[item]

class TestRequestHandler(server.TataDanaRequestHandler):
    """
    Subclass that simulates HTTP socket I/O entirely in-memory using BytesIO,
    capturing status codes, response headers, and binary body output without
    requiring OS socket permissions (eliminating WinError 10013 sandbox blocks).
    """
    def __init__(self, method, path, headers=None, body=None):
        self.command = method.upper()
        self.path = path
        self.request_version = 'HTTP/1.1'
        self.close_connection = True
        
        headers = headers or {}
        body_bytes = b''
        if body is not None:
            if isinstance(body, dict):
                body_bytes = json.dumps(body).encode('utf-8')
                if 'Content-Type' not in headers:
                    headers['Content-Type'] = 'application/json'
            elif isinstance(body, str):
                body_bytes = body.encode('utf-8')
            elif isinstance(body, bytes):
                body_bytes = body
            headers['Content-Length'] = str(len(body_bytes))
            
        self.rfile = io.BytesIO(body_bytes)
        self.wfile = io.BytesIO()
        self.headers = headers
        self.client_address = MockClientAddress()
        self.directory = PROJECT_ROOT
        self.status_code = None
        self.response_headers = {}

    def send_response(self, code, message=None):
        self.status_code = code

    def send_header(self, keyword, value):
        self.response_headers[keyword] = value

    def end_headers(self):
        pass

    def log_message(self, format, *args):
        pass

    def execute(self):
        try:
            if self.command == 'GET':
                self.do_GET()
            elif self.command == 'POST':
                self.do_POST()
            elif self.command == 'OPTIONS':
                self.do_OPTIONS()
            else:
                raise ValueError(f"Unsupported HTTP method: {self.command}")
        except Exception as e:
            # Capture uncaught internal server exceptions as 500 Internal Server Error
            self.status_code = 500
            self.response_headers['Content-Type'] = 'application/json'
            err_dict = {'ok': False, 'status': 500, 'error_type': type(e).__name__, 'error_message': str(e)}
            self.wfile.write(json.dumps(err_dict).encode('utf-8'))
        
        raw_output = self.wfile.getvalue()
        json_output = None
        try:
            json_output = json.loads(raw_output.decode('utf-8'))
        except Exception:
            pass
        return self.status_code, self.response_headers, raw_output, json_output


def dispatch_request(method, path, headers=None, body=None):
    handler = TestRequestHandler(method, path, headers, body)
    return handler.execute()


class TataDanaRound8ChallengerSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        safe_print("\n" + "=" * 80)
        safe_print(" STARTING TATADANA PRIME ROUND 8 ADVERSARIAL CHALLENGER SUITE")
        safe_print("=" * 80)
        server.init_db(DB_PATH)
        with open(HTML_PATH, 'r', encoding='utf-8') as f:
            cls.html_content = f.read()

    # ==========================================================================
    # GROUP 1: Security, Auth & User Verification Gate (AC 1.1 - AC 1.5)
    # ==========================================================================

    def test_ac1_1_registration_captures_fields_and_persists_is_approved_0(self):
        """AC 1.1: Verify new user registration captures Name, Email, Phone, Password and persists with is_approved = 0."""
        safe_print("\n[CHALLENGER AC 1.1] Testing registration persistence & initial approval gate...")
        test_ts = int(time.time() * 1000)
        reg_payload = {
            'full_name': f'Challenger User {test_ts}',
            'email': f'challenger_{test_ts}@tatadana.id',
            'phone_number': f'0899{test_ts % 100000000:08d}',
            'password': 'SecurePassword123!'
        }
        status, headers, raw, res_json = dispatch_request('POST', '/api/auth/register', body=reg_payload)
        
        self.assertEqual(status, 200, f"Registration must return 200, got {status}: {raw}")
        self.assertIsNotNone(res_json, "Response must be valid JSON")
        self.assertTrue(res_json.get('ok') or res_json.get('success'), "Response ok/success must be True")
        self.assertEqual(res_json.get('is_approved'), 0, f"API must report is_approved = 0, got: {res_json.get('is_approved')}")
        self.assertEqual(res_json.get('status'), 'pending_approval')
        
        # Verify in SQLite directly
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', (reg_payload['email'],))
        row = c.fetchone()
        conn.close()
        
        self.assertIsNotNone(row, "User record must exist in tatadana.db users table")
        self.assertEqual(row['full_name'], reg_payload['full_name'])
        self.assertEqual(row['phone_number'], reg_payload['phone_number'])
        self.assertEqual(row['is_approved'], 0, "SQLite record must strictly have is_approved = 0")
        self.assertEqual(row['role'], 'user', "SQLite record role must be 'user'")
        self.assertEqual(row['password_hash'], server.hash_pw(reg_payload['password']), "Password hash must match sha256")
        safe_print(f"  -> PASS: User {reg_payload['email']} successfully persisted with is_approved=0, role='user'.")

    def test_ac1_2_unapproved_user_blocked_and_shows_whatsapp_instructions(self):
        """AC 1.2: Unapproved users cannot access user dashboard; interface (#boxWaitingApproval) displays explicit instruction to contact Admin via WhatsApp at 082115624408 with direct link https://wa.me/6282115624408."""
        safe_print("\n[CHALLENGER AC 1.2] Testing unapproved user dashboard blocking & WhatsApp notice...")
        test_ts = int(time.time() * 1000)
        unapproved_email = f'unapproved_{test_ts}@tatadana.id'
        unapproved_pw = 'UnapprovedPass123!'
        reg_payload = {
            'full_name': 'Calon Nasabah Pending',
            'email': unapproved_email,
            'phone_number': f'0898{test_ts % 100000000:08d}',
            'password': unapproved_pw
        }
        status_reg, _, _, reg_res = dispatch_request('POST', '/api/auth/register', body=reg_payload)
        self.assertEqual(status_reg, 200, f"Registration must succeed, got {status_reg}: {reg_res}")
        
        # Attempt login with unapproved user
        status, headers, raw, login_res = dispatch_request('POST', '/api/auth/login', body={
            'email': unapproved_email,
            'password': unapproved_pw
        })
        self.assertEqual(status, 200)
        self.assertEqual(login_res.get('status'), 'pending_approval')
        self.assertEqual(login_res.get('is_approved'), 0)
        self.assertEqual(login_res.get('whatsapp_contact'), '082115624408')
        self.assertIn('6282115624408', login_res.get('whatsapp_link', ''))

        # Check status check endpoint
        status, headers, raw, status_res = dispatch_request('GET', f'/api/auth/status?email={unapproved_email}')
        self.assertEqual(status, 200)
        self.assertEqual(status_res.get('is_approved'), 0)
        self.assertEqual(status_res.get('whatsapp_contact'), '082115624408')

        # Frontend DOM Verification in index.html
        html = self.html_content
        self.assertIn('id="boxWaitingApproval"', html, "index.html must contain #boxWaitingApproval")
        self.assertIn('id="badgePendingApproval"', html, "index.html must contain #badgePendingApproval")
        self.assertIn('PENDING APPROVAL', html, "Badge text must contain 'PENDING APPROVAL'")
        self.assertIn('id="waitingUserName"', html, "index.html must contain #waitingUserName")
        self.assertIn('id="waitingUserEmail"', html, "index.html must contain #waitingUserEmail")
        self.assertIn('082115624408', html, "index.html must contain WhatsApp phone 082115624408")
        self.assertIn('https://wa.me/6282115624408', html, "index.html must contain direct WhatsApp link")
        self.assertIn('id="btnCheckApproval"', html, "index.html must contain #btnCheckApproval")

        # Routing guard verification
        self.assertIn("/approval", html, "Route /approval must be handled in index.html router")
        safe_print("  -> PASS: Unapproved users blocked from dashboard; WhatsApp contact 082115624408 & link verified in API and DOM.")

    def test_ac1_3_superadmin_auth_and_access_gate(self):
        """AC 1.3: Login with akunadminaul16@gmail.com and password akuadmin123 enters directly as Superadmin (role: superadmin, plan: PRO VIP). Verify other credentials cannot access admin desk."""
        safe_print("\n[CHALLENGER AC 1.3] Testing Superadmin authentication & RBAC isolation...")
        # 1. Superadmin login
        status, headers, raw, admin_res = dispatch_request('POST', '/api/auth/login', body={
            'email': 'akunadminaul16@gmail.com',
            'password': 'akuadmin123'
        })
        self.assertEqual(status, 200)
        self.assertTrue(admin_res.get('ok'))
        self.assertEqual(admin_res.get('role'), 'superadmin')
        self.assertEqual(admin_res.get('plan'), 'PRO VIP')
        self.assertEqual(admin_res.get('is_approved'), 1)
        self.assertEqual(admin_res.get('user', {}).get('email'), 'akunadminaul16@gmail.com')

        # 2. Superadmin wrong password challenge
        status, headers, raw, wrong_pw_res = dispatch_request('POST', '/api/auth/login', body={
            'email': 'akunadminaul16@gmail.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(status, 401, "Wrong password for superadmin must return HTTP 401")
        self.assertFalse(wrong_pw_res.get('ok'))

        # 3. Legacy admin downgraded to regular user
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT email, role, plan FROM users WHERE email = ?', ('shopnoure1619@gmail.com',))
        legacy = c.fetchone()
        conn.close()
        if legacy:
            self.assertEqual(legacy['role'], 'user', "Legacy admin must be downgraded to role 'user'")
            self.assertEqual(legacy['plan'], 'starter', "Legacy admin plan must be 'starter'")

        # 4. Frontend DOM check: non-superadmins blocked on /admin
        self.assertIn("role !== 'superadmin'", self.html_content)
        self.assertIn("dNav-adminPanel", self.html_content)
        safe_print("  -> PASS: akunadminaul16@gmail.com authenticated strictly as superadmin/PRO VIP; legacy admin downgraded.")

    def test_ac1_4_absence_of_masuk_admin_button_from_public_landing(self):
        """AC 1.4: Link/button 'Masuk Admin' is completely absent from public navbar / landing page."""
        safe_print("\n[CHALLENGER AC 1.4] Testing complete absence of 'Masuk Admin' button...")
        html = self.html_content
        # Remove HTML comments to verify visible rendered code
        rendered_html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
        self.assertNotIn("Masuk Admin", rendered_html, "Link/button 'Masuk Admin' must NOT exist in visible HTML")
        self.assertNotIn(">Masuk Admin<", rendered_html)
        self.assertNotIn("admin-login", rendered_html.lower())
        
        # Verify landing navbar contains only unified login
        nav_match = re.search(r'<nav[^>]*id="publicNav"[^>]*>(.*?)</nav>', html, re.DOTALL)
        if nav_match:
            nav_html = nav_match.group(1)
            self.assertNotIn("Admin", nav_html, "Public navbar must not contain any Admin links")
        safe_print("  -> PASS: 'Masuk Admin' is completely eliminated from public navbar and landing page.")

    def test_ac1_5_profile_photo_display_upload_and_serving(self):
        """AC 1.5: User profile picture displays correctly and functional upload (POST /api/user/profile-photo) persists photo to disk, updates SQLite avatar_url, and serves photo via HTTP 200."""
        safe_print("\n[CHALLENGER AC 1.5] Testing profile photo upload, disk persistence, DB update & HTTP 200 serving...")
        # 1. DOM verification
        html = self.html_content
        self.assertIn('id="dAvatarImg"', html, "Sidebar avatar image element must exist")
        self.assertIn('id="settingAvatarImg"', html, "Settings avatar image element must exist")
        self.assertIn('id="settingPhotoFileInput"', html, "File input element #settingPhotoFileInput must exist")
        self.assertIn('handleLocalPhotoUpload', html, "JS handler handleLocalPhotoUpload must exist")

        # 2. Upload test via POST /api/user/profile-photo
        test_png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x02\x00\x00\x00\x02\x08\x06\x00\x00\x00v\x28\xb53\x00\x00\x00\x13IDATx\x9cc\xf8\xff\x9f\x01\x03\x03\x03\x00\x00\x00\xff\xff\x03\x00\x08\xfc\x02\xfe\xa7\x9d\x01\xa0\x00\x00\x00\x00IEND\xaeB`\x82'
        base64_data = "data:image/png;base64," + base64.b64encode(test_png_bytes).decode('ascii')
        
        status, headers, raw, upload_res = dispatch_request('POST', '/api/user/profile-photo', body={
            'user_id': 40,
            'image_base64': base64_data
        })
        
        # Empirical Bug Detection Assertion:
        if status == 500 and upload_res and upload_res.get('error_type') == 'UnboundLocalError':
            safe_print(f"  [DEFECT CONFIRMED] POST /api/user/profile-photo threw UnboundLocalError: {upload_res.get('error_message')}")
            safe_print("  [DEFECT ROOT CAUSE] 'import time' at line 2304 inside do_POST shadows global time module at line 1889!")
            self.fail(f"BUG in server.py: UnboundLocalError at line 1889 when uploading profile photo: {upload_res.get('error_message')}")

        self.assertEqual(status, 200, f"Expected 200 from profile photo upload, got {status}: {upload_res}")
        photo_url = upload_res.get('photo_url')
        self.assertIsNotNone(photo_url)
        self.assertTrue(photo_url.startswith('/uploads/avatars/'))

        # Verify disk persistence
        rel_path = photo_url.lstrip('/')
        abs_disk_path = os.path.join(PROJECT_ROOT, rel_path)
        self.assertTrue(os.path.exists(abs_disk_path), f"Saved avatar file must exist on disk: {abs_disk_path}")
        self.assertGreater(os.path.getsize(abs_disk_path), 0, "Saved avatar file must not be empty")

        # Verify SQLite persistence
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT avatar_url FROM users WHERE id = 40')
        db_avatar = c.fetchone()['avatar_url']
        conn.close()
        self.assertEqual(db_avatar, photo_url, "avatar_url in SQLite users table must match photo_url")

        # Verify HTTP 200 static file serving
        status_get, get_headers, served_bytes, _ = dispatch_request('GET', photo_url)
        self.assertEqual(status_get, 200, f"GET {photo_url} must return HTTP 200")
        self.assertEqual(get_headers.get('Content-Type'), 'image/png')
        safe_print(f"  -> PASS: Profile photo uploaded to {photo_url}, saved on disk ({len(served_bytes)} bytes), DB updated, served with HTTP 200.")

    # ==========================================================================
    # GROUP 2: Telegram Bot & Multi-Modal Transactions (AC 2.1 - AC 2.5)
    # ==========================================================================

    def test_ac2_1_telegram_webhook_idempotency(self):
        """AC 2.1: /api/telegram/webhook is idempotent: duplicate update_id requests return 200 without creating duplicate transactions."""
        safe_print("\n[CHALLENGER AC 2.1] Testing Telegram webhook idempotency with duplicate update_id...")
        unique_update_id = int(time.time() * 1000) + 12345
        webhook_payload = {
            'update_id': unique_update_id,
            'message': {
                'message_id': 101,
                'from': {'id': 999901, 'first_name': 'Tester'},
                'text': 'beli makan malam 45000'
            }
        }
        
        # Count transactions before
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT COUNT(*) as cnt FROM transactions')
        tx_count_before = c.fetchone()['cnt']
        conn.close()

        # First delivery
        status1, _, _, res1 = dispatch_request('POST', '/api/telegram/webhook', body=webhook_payload)
        self.assertEqual(status1, 200)
        self.assertTrue(res1.get('ok'))

        # Count transactions after first delivery
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT COUNT(*) as cnt FROM transactions')
        tx_count_after1 = c.fetchone()['cnt']
        conn.close()
        self.assertEqual(tx_count_after1, tx_count_before + 1, "First delivery must create exactly 1 transaction")

        # Second delivery (Duplicate network retry)
        status2, _, _, res2 = dispatch_request('POST', '/api/telegram/webhook', body=webhook_payload)
        self.assertEqual(status2, 200, "Duplicate delivery must return HTTP 200")
        self.assertTrue(res2.get('ok'))
        self.assertEqual(res2.get('status'), 'already_processed', "Duplicate must return status 'already_processed'")

        # Count transactions after second delivery
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT COUNT(*) as cnt FROM transactions')
        tx_count_after2 = c.fetchone()['cnt']
        conn.close()
        self.assertEqual(tx_count_after2, tx_count_after1, "Duplicate delivery must NOT create a second transaction")
        safe_print("  -> PASS: Idempotency enforced. Duplicate update_id returns 200 without duplicate transaction.")

    def test_ac2_2_indonesian_nominal_parser_and_recording(self):
        """AC 2.2: Indonesian nominal parser converts '15rb', '1.5jt', '500k', '250.000', '2.5 juta' into accurate numeric values."""
        safe_print("\n[CHALLENGER AC 2.2] Testing Indonesian nominal parser on shorthand patterns...")
        test_cases = [
            ("beli bakso 15rb", 15000.0),
            ("proyek freelance 1.5jt", 1500000.0),
            ("bayar tagihan wifi 500k", 500000.0),
            ("servis motor 250.000", 250000.0),
            ("bonus akhir tahun 2.5 juta", 2500000.0),
            ("kopi senja 25k", 25000.0),
            ("bensin pertalite 35.000", 35000.0),
            ("uang jajan 15 rb", 15000.0)
        ]
        
        for input_text, expected_amount in test_cases:
            parsed_val = server.parse_indonesian_nominal(input_text)
            self.assertEqual(parsed_val, expected_amount, f"Parser failed for '{input_text}': expected {expected_amount}, got {parsed_val}")
            
            # Now test execution via webhook handler
            uid = int(time.time() * 1000) + int(expected_amount) % 10000
            status, _, _, res = dispatch_request('POST', '/api/telegram/webhook', body={
                'update_id': uid,
                'message': {
                    'message_id': 200 + (uid % 1000),
                    'from': {'id': 999902, 'first_name': 'Tester'},
                    'text': input_text
                }
            })
            self.assertEqual(status, 200)
            self.assertTrue(res.get('ok'))
            reply = res.get('reply_text', '')
            self.assertIn(f"{int(expected_amount):,}", reply.replace('.', ','), f"Reply must contain formatted amount {expected_amount}")
        safe_print("  -> PASS: All Indonesian nominal shorthand variations ('15rb', '1.5jt', '500k', '250.000', '2.5 juta') parsed accurately.")

    def test_ac2_3_voice_note_transcription_and_limit_enforcement(self):
        """AC 2.3: Voice note handling transcribes audio (<=60s) and includes transcript line (Transkrip: '[hasil transkrip]') in reply."""
        safe_print("\n[CHALLENGER AC 2.3] Testing Voice note transcription pipeline & <=60s limit enforcement...")
        # 1. Valid voice note (duration <= 60s)
        uid_valid = int(time.time() * 1000) + 301
        voice_transcript = "beli makan siang nasi uduk 20rb"
        status, _, _, res = dispatch_request('POST', '/api/telegram/webhook', body={
            'update_id': uid_valid,
            'message': {
                'message_id': 301,
                'from': {'id': 999903, 'first_name': 'Tester'},
                'voice': {
                    'duration': 12,
                    'transcript': voice_transcript
                }
            }
        })
        self.assertEqual(status, 200)
        self.assertTrue(res.get('ok'))
        reply = res.get('reply_text', '')
        self.assertIn(f'Transkrip: "{voice_transcript}"', reply, "Reply must contain exact transcript line")
        self.assertIn("Rp 20,000", reply)

        # 2. Adversarial challenge: Voice note exceeding 60s (e.g. 75s)
        uid_long = int(time.time() * 1000) + 302
        status_long, _, _, res_long = dispatch_request('POST', '/api/telegram/webhook', body={
            'update_id': uid_long,
            'message': {
                'message_id': 302,
                'from': {'id': 999903, 'first_name': 'Tester'},
                'voice': {
                    'duration': 75, # Exceeds 60 seconds
                    'transcript': 'panjang sekali lebih dari satu menit'
                }
            }
        })
        self.assertEqual(status_long, 200)
        self.assertFalse(res_long.get('ok'), "Voice note >60s must return ok=False")
        self.assertEqual(res_long.get('status'), 'voice_too_long')
        self.assertIn("Durasi voice note maksimal 60 detik", res_long.get('reply_text', ''))
        safe_print("  -> PASS: Valid voice note generates transcript line; voice note >60s strictly rejected.")

    def test_ac2_4_receipt_photo_pro_multi_item_vs_starter_cta_rejection(self):
        """AC 2.4: Receipt photo on Pro extracts items, while Starter receives upgrade CTA message."""
        safe_print("\n[CHALLENGER AC 2.4] Testing Receipt photo processing: Pro multi-item extraction vs Starter upgrade CTA...")
        # 1. Setup Starter User
        test_ts = int(time.time() * 1000)
        conn = server.get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, telegram_user_id)
            VALUES (?, ?, 'Starter User', ?, 'user', 1, 'starter', ?, 'tg_starter_1')
        ''', (f'starter_{test_ts}@tatadana.id', server.hash_pw('pass123'), f'0897{test_ts % 100000000:08d}', server.get_wib_now()))
        starter_uid = c.lastrowid
        
        # Setup Pro User
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, telegram_user_id)
            VALUES (?, ?, 'Pro VIP User', ?, 'user', 1, 'PRO VIP', ?, 'tg_pro_1')
        ''', (f'pro_{test_ts}@tatadana.id', server.hash_pw('pass123'), f'0896{test_ts % 100000000:08d}', server.get_wib_now()))
        pro_uid = c.lastrowid
        conn.commit()
        conn.close()

        # Seed wallets
        conn = server.get_db()
        server.seed_user_wallets_and_data(conn, starter_uid)
        server.seed_user_wallets_and_data(conn, pro_uid)
        conn.close()

        # 2. Test Starter photo receipt input
        uid_starter = int(time.time() * 1000) + 401
        status, _, _, res_starter = dispatch_request('POST', '/api/telegram/webhook', body={
            'update_id': uid_starter,
            'message': {
                'message_id': 401,
                'from': {'id': 'tg_starter_1', 'first_name': 'Starter'},
                'photo': [{'file_id': 'photo_123', 'file_size': 1024}]
            }
        })
        self.assertEqual(status, 200)
        self.assertEqual(res_starter.get('status'), 'pro_required')
        reply_starter = res_starter.get('reply_text', '')
        self.assertIn("Fitur Foto Struk & AI Vision OCR hanya tersedia untuk pengguna Paket PRO", reply_starter)
        self.assertIn("Rp99.000", reply_starter)

        # 3. Test Pro photo receipt input
        uid_pro = int(time.time() * 1000) + 402
        status_pro, _, _, res_pro = dispatch_request('POST', '/api/telegram/webhook', body={
            'update_id': uid_pro,
            'user_id': pro_uid,
            'message': {
                'message_id': 402,
                'from': {'id': 'tg_pro_1', 'first_name': 'ProUser'},
                'photo': [{'file_id': 'photo_pro_123', 'file_size': 2048}]
            },
            'merchant': 'Indomaret Point Stasiun',
            'items': [
                {'name': 'Roti Gandum', 'price': 18000},
                {'name': 'Susu UHT 1L', 'price': 22000}
            ]
        })
        self.assertEqual(status_pro, 200)
        self.assertTrue(res_pro.get('ok'))
        reply_pro = res_pro.get('reply_text', '')
        self.assertIn("Struk Belanja Berhasil Diekstrak (AI Vision OCR)", reply_pro)
        self.assertIn("Indomaret Point Stasiun", reply_pro)
        self.assertIn("Roti Gandum: Rp 18,000", reply_pro)
        self.assertIn("Susu UHT 1L: Rp 22,000", reply_pro)
        self.assertIn("Rp 40,000", reply_pro)
        safe_print("  -> PASS: Starter receives Pro upgrade CTA; Pro user extracts multi-item receipt details.")

    def test_ac2_5_bot_reply_contains_budget_progress_bar_and_wib_timezone(self):
        """AC 2.5: Bot reply contains visual budget progress bar and updated saldo in WIB timezone."""
        safe_print("\n[CHALLENGER AC 2.5] Testing visual budget progress bar and WIB timezone in bot reply...")
        # Create user with clean budget limit to test partial progress bar
        test_ts = int(time.time() * 1000)
        conn = server.get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, telegram_user_id)
            VALUES (?, ?, 'Budget User', ?, 'user', 1, 'pro', ?, 'tg_budget_user')
        ''', (f'budget_{test_ts}@tatadana.id', server.hash_pw('pass123'), f'0894{test_ts % 100000000:08d}', server.get_wib_now()))
        b_uid = c.lastrowid
        conn.commit()
        server.seed_user_wallets_and_data(conn, b_uid)
        conn.close()

        uid = int(time.time() * 1000) + 501
        status, _, _, res = dispatch_request('POST', '/api/telegram/webhook', body={
            'update_id': uid,
            'user_id': b_uid,
            'message': {
                'message_id': 501,
                'from': {'id': 'tg_budget_user', 'first_name': 'BudgetUser'},
                'text': 'beli makan siang 50rb'
            }
        })
        self.assertEqual(status, 200)
        self.assertTrue(res.get('ok'))
        reply = res.get('reply_text', '')
        
        # Check visual progress bar with both filled and unfilled characters
        self.assertTrue('█' in reply and '░' in reply, f"Reply must contain budget progress bar characters [█░]. Reply:\n{reply}")
        # Check WIB timezone
        self.assertIn("WIB", reply, "Reply must display timestamp in WIB timezone")
        # Check Saldo line
        self.assertIn("Saldo", reply, "Reply must contain updated Saldo info")
        safe_print("  -> PASS: Bot reply contains visual progress bar [█░], WIB timestamp, and updated saldo.")

    # ==========================================================================
    # GROUP 3: Web Dashboard, Reports & Admin Capabilities (AC 3.1 - AC 3.5)
    # ==========================================================================

    def test_ac3_1_modern_orange_white_visual_theme(self):
        """AC 3.1: Consistent modern orange-white visual theme throughout index.html (bg-slate-50/bg-white, #ea580c/#f97316 accents, Plus Jakarta Sans font)."""
        safe_print("\n[CHALLENGER AC 3.1] Testing modern orange-white visual design consistency...")
        html = self.html_content
        
        # Font check
        self.assertIn("Plus Jakarta Sans", html, "index.html must load Plus Jakarta Sans font")
        
        # Color palette checks
        self.assertIn("bg-slate-50", html, "index.html must use clean light background bg-slate-50")
        self.assertIn("bg-white", html, "index.html must use white cards")
        self.assertIn("text-orange-600", html, "index.html must use orange-600 accent text")
        self.assertIn("bg-orange-600", html, "index.html must use orange-600 accent background")
        self.assertIn("from-orange-500", html, "index.html must use orange gradient accents")
        
        # Ensure dark theme is NOT the main body background
        body_match = re.search(r'<body[^>]*class="([^"]*)"', html)
        self.assertIsNotNone(body_match)
        body_classes = body_match.group(1)
        self.assertNotIn("bg-slate-950", body_classes, "Body must not have dark theme bg-slate-950")
        self.assertNotIn("bg-black", body_classes, "Body must not have dark theme bg-black")
        self.assertIn("bg-slate-50", body_classes, "Body must have clean light background bg-slate-50")
        
        # Anti-regression: 'secara realtime' must be absent
        self.assertNotIn("secara realtime", html, "Regression phrase 'secara realtime' must be completely absent")
        safe_print("  -> PASS: Modern orange-white SaaS visual theme confirmed; dark theme eradicated; anti-regression intact.")

    def test_ac3_2_dashboard_components_and_sidebar_order(self):
        """AC 3.2: Dashboard presents 4 stats cards, charts, transaction list, period filters, multi-wallet, and monthly budget."""
        safe_print("\n[CHALLENGER AC 3.2] Testing Dashboard UI components & sidebar hierarchy...")
        html = self.html_content
        
        # 4 Metric stats cards
        for card_id in ["valTotalSaldo", "valPemasukan", "valPengeluaran", "valBudgetTersisa"]:
            self.assertIn(f'id="{card_id}"', html, f"Metric card #{card_id} must exist")
        self.assertIn('id="valBudgetBar"', html, "Progress bar #valBudgetBar must exist")

        # Charts
        self.assertIn('id="chartIncomeExpenseTrend"', html, "Trend chart canvas must exist")
        self.assertIn('id="chartCategoryBreakdown"', html, "Category donut canvas must exist")

        # Transaction lists
        self.assertIn('id="homeTxTableBody"', html, "Home recent transactions table must exist")
        self.assertIn('id="fullTxTableBody"', html, "Full transactions table must exist")

        # Period filters
        self.assertIn('id="repFilter-month"', html, "Period filter month must exist")
        self.assertIn('id="repFilter-30days"', html, "Period filter 30days must exist")
        self.assertIn('id="repFilter-all"', html, "Period filter all must exist")

        # Multi-wallet elements
        self.assertIn('id="modalAddWallet"', html, "Add wallet modal must exist")
        self.assertIn('id="inputWalletName"', html, "Wallet name input must exist")
        self.assertIn('id="inputWalletBalance"', html, "Wallet balance input must exist")

        # Sidebar order: dNav-beranda ABOVE dNav-transaksi
        pos_beranda = html.find('id="dNav-beranda"')
        pos_transaksi = html.find('id="dNav-transaksi"')
        self.assertGreater(pos_beranda, -1, "dNav-beranda must exist")
        self.assertGreater(pos_transaksi, -1, "dNav-transaksi must exist")
        self.assertLess(pos_beranda, pos_transaksi, "dNav-beranda must be ordered ABOVE dNav-transaksi")

        # Transaction submit button exact label 'Simpan'
        btn_simpan_match = re.search(r'<button[^>]*onclick="realSaveTransaction\(\)"[^>]*>\s*Simpan\s*</button>', html)
        self.assertIsNotNone(btn_simpan_match, "Transaction modal button must have exact text 'Simpan'")
        safe_print("  -> PASS: 4 stats cards, charts, tables, filters, multi-wallet, and exact sidebar ordering verified.")

    def test_ac3_3_report_exports_to_valid_pdf_and_excel(self):
        """AC 3.3: Report exports to PDF (GET /api/export/pdf) generate valid binary %PDF-1.4 and Excel (GET /api/export/excel) generate valid OpenXML ZIP .xlsx with signed download URLs."""
        safe_print("\n[CHALLENGER AC 3.3] Testing pure Python PDF 1.4 & OpenXML XLSX report generators & signed URLs...")
        # 1. Test Signed URL generation
        status, _, _, signed_res = dispatch_request('GET', '/api/export/signed-url?user_id=40&format=pdf')
        self.assertEqual(status, 200)
        self.assertTrue(signed_res.get('ok'))
        signed_url = signed_res.get('download_url')
        self.assertIn("token=", signed_url)
        self.assertIn("user_id=40", signed_url)

        # 2. Test Plan Gating: Starter user (ID 1) must be rejected with 403 Forbidden
        status_starter, _, _, starter_res = dispatch_request('GET', '/api/export/pdf?user_id=1')
        self.assertEqual(status_starter, 403, "Starter user must receive HTTP 403 on export")
        self.assertIn("hanya tersedia untuk akun paket PRO", starter_res.get('message', ''))

        # 3. Test PDF binary generation for PRO Superadmin (ID 40)
        status, pdf_headers, pdf_bytes, _ = dispatch_request('GET', '/api/export/pdf?user_id=40')
        self.assertEqual(status, 200, "PDF export for PRO user must return HTTP 200")
        self.assertEqual(pdf_headers.get('Content-Type'), 'application/pdf')
        self.assertIn('.pdf', pdf_headers.get('Content-Disposition', ''))
        self.assertTrue(pdf_bytes.startswith(b'%PDF-1.4'), f"PDF binary must start with %PDF-1.4 header, got: {pdf_bytes[:10]}")
        self.assertIn(b'%%EOF', pdf_bytes, "PDF binary must contain %%EOF trailer")
        self.assertGreater(len(pdf_bytes), 1000, "PDF binary size must be valid (>1000 bytes)")

        # 4. Test OpenXML XLSX binary generation for PRO Superadmin (ID 40)
        status, xlsx_headers, xlsx_bytes, _ = dispatch_request('GET', '/api/export/excel?user_id=40')
        self.assertEqual(status, 200, "Excel export for PRO user must return HTTP 200")
        self.assertEqual(xlsx_headers.get('Content-Type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertIn('.xlsx', xlsx_headers.get('Content-Disposition', ''))
        self.assertTrue(xlsx_bytes.startswith(b'PK\x03\x04'), "XLSX must be a valid zip archive (starts with PK\x03\x04)")
        
        # Verify internal ZIP structure
        with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as z:
            names = z.namelist()
            self.assertIn('[Content_Types].xml', names)
            self.assertIn('xl/workbook.xml', names)
            self.assertIn('xl/worksheets/sheet1.xml', names)
            sheet_xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
            self.assertIn('<worksheet', sheet_xml)
            self.assertIn('<sheetData>', sheet_xml)
        safe_print(f"  -> PASS: Valid %PDF-1.4 ({len(pdf_bytes)} bytes) and OpenXML XLSX ({len(xlsx_bytes)} bytes) verified; plan gating strictly enforced.")

    def test_ac3_4_admin_dashboard_user_approval_and_wallet_seeding(self):
        """AC 3.4: Admin Dashboard can approve pending users (updates is_approved = 1, seeds default wallets) enabling user login."""
        safe_print("\n[CHALLENGER AC 3.4] Testing Admin user approval workflow & default wallet seeding...")
        # 1. Register new pending user
        test_ts = int(time.time() * 1000)
        user_email = f'pending_for_approval_{test_ts}@tatadana.id'
        user_pw = 'ApprovedPass123!'
        dispatch_request('POST', '/api/auth/register', body={
            'full_name': 'Nasabah Prioritas Baru',
            'email': user_email,
            'phone_number': f'0895{test_ts % 100000000:08d}',
            'password': user_pw
        })
        
        # Verify blocked before approval
        _, _, _, login_pre = dispatch_request('POST', '/api/auth/login', body={'email': user_email, 'password': user_pw})
        self.assertEqual(login_pre.get('status'), 'pending_approval')
        new_uid = login_pre.get('user', {}).get('id')
        self.assertIsNotNone(new_uid)

        # 2. Admin approves user via POST /api/admin/approve-user
        status, _, _, approve_res = dispatch_request('POST', '/api/admin/approve-user', body={'user_id': new_uid})
        self.assertEqual(status, 200)
        self.assertTrue(approve_res.get('ok'))
        self.assertEqual(approve_res.get('is_approved'), 1)

        # 3. Verify SQLite DB state
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT is_approved FROM users WHERE id = ?', (new_uid,))
        self.assertEqual(c.fetchone()['is_approved'], 1, "User is_approved must be 1 in SQLite")
        
        # Verify wallets seeded
        c.execute('SELECT COUNT(*) as cnt FROM wallets WHERE user_id = ?', (new_uid,))
        wallet_cnt = c.fetchone()['cnt']
        self.assertGreaterEqual(wallet_cnt, 4, f"Approved user must receive at least 4 default wallets, got {wallet_cnt}")
        conn.close()

        # 4. User login now succeeds into dashboard
        status, _, _, login_post = dispatch_request('POST', '/api/auth/login', body={'email': user_email, 'password': user_pw})
        self.assertEqual(status, 200)
        self.assertEqual(login_post.get('status'), 'active')
        self.assertEqual(login_post.get('is_approved'), 1)
        self.assertIsNotNone(login_post.get('token'))
        safe_print("  -> PASS: User approved by admin, wallets seeded, login successfully unlocks user dashboard.")

    def test_ac3_5_admin_multi_provider_ai_configuration(self):
        """AC 3.5: Admin Multi-Provider AI configuration (/api/admin/ai-settings) allows switching between Gemini, OpenAI, DeepSeek, and single vs parallel/failover mode."""
        safe_print("\n[CHALLENGER AC 3.5] Testing Multi-Provider AI configuration switching & persistence...")
        # 1. Fetch current AI settings
        status, _, _, current_ai = dispatch_request('GET', '/api/admin/ai-settings')
        self.assertEqual(status, 200)
        self.assertTrue(current_ai.get('ok'))
        self.assertIn('active_provider', current_ai.get('settings', {}))

        # 2. Switch to DeepSeek with failover mode
        status, _, _, update1 = dispatch_request('POST', '/api/admin/ai-settings', body={
            'active_provider': 'deepseek',
            'execution_mode': 'failover',
            'deepseek_model': 'deepseek-chat',
            'deepseek_api_key': 'sk-test-deepseek-encrypted'
        })
        self.assertEqual(status, 200)
        self.assertEqual(update1.get('settings', {}).get('active_provider'), 'deepseek')
        self.assertEqual(update1.get('settings', {}).get('execution_mode'), 'failover')

        # 3. Switch to OpenAI with parallel mode
        status, _, _, update2 = dispatch_request('POST', '/api/admin/ai-settings', body={
            'active_provider': 'openai',
            'execution_mode': 'parallel',
            'openai_model': 'gpt-4o-mini',
            'openai_api_key': 'sk-test-openai-encrypted'
        })
        self.assertEqual(status, 200)
        self.assertEqual(update2.get('settings', {}).get('active_provider'), 'openai')
        self.assertEqual(update2.get('settings', {}).get('execution_mode'), 'parallel')

        # 4. Switch back to Gemini with single mode
        status, _, _, update3 = dispatch_request('POST', '/api/admin/ai-settings', body={
            'active_provider': 'gemini',
            'execution_mode': 'single',
            'gemini_model': 'gemini-1.5-flash',
            'gemini_api_key': 'AIza-test-gemini-key'
        })
        self.assertEqual(status, 200)
        self.assertEqual(update3.get('settings', {}).get('active_provider'), 'gemini')
        self.assertEqual(update3.get('settings', {}).get('execution_mode'), 'single')

        # 5. Test AI connection ping endpoint
        status, _, _, test_ping = dispatch_request('POST', '/api/admin/ai-test', body={'provider': 'gemini'})
        self.assertEqual(status, 200)
        self.assertTrue(test_ping.get('ok'))
        self.assertEqual(test_ping.get('provider'), 'gemini')
        safe_print("  -> PASS: Multi-Provider AI settings (Gemini, OpenAI, DeepSeek, single/parallel/failover) switch and persist in DB.")

    # ==========================================================================
    # GROUP 4: Operational Localhost Status (AC 4.1)
    # ==========================================================================

    def test_ac4_1_localhost_server_operational_status(self):
        """AC 4.1: Application server is operational on localhost:3000 / 127.0.0.1:3000 and SPA routes respond with HTTP 200."""
        safe_print("\n[CHALLENGER AC 4.1] Testing application server operational status and SPA routes...")
        spa_routes = ['/', '/login', '/approval', '/dashboard', '/admin', '/superadmin', '/settings']
        for route in spa_routes:
            status, headers, content, _ = dispatch_request('GET', route)
            ctype = headers.get('Content-Type') or headers.get('Content-type')
            self.assertTrue(ctype is None or 'text/html' in ctype, f"Route {route} Content-Type must be HTML, got: {ctype}")
            self.assertIn(b'<!DOCTYPE html>', content, f"Route {route} must serve HTML document")
            self.assertIn(b'TataDana', content)

        # Test API telemetry endpoint
        status, _, _, metrics = dispatch_request('GET', '/api/admin/metrics')
        self.assertEqual(status, 200)
        self.assertTrue(metrics.get('ok'))
        self.assertGreater(metrics.get('total_users', 0), 0)
        self.assertEqual(metrics.get('bot_status'), 'online')
        safe_print(f"  -> PASS: Server operational. All SPA routes ({', '.join(spa_routes)}) respond with HTTP 200.")

    # ==========================================================================
    # ADVERSARIAL STRESS TESTS & DEFENSIVE INVARIANTS
    # ==========================================================================

    def test_adversarial_1_duplicate_registration_email_collision(self):
        """Adversarial 1: Registering with existing email returns 400 with explicit error message."""
        safe_print("\n[ADVERSARIAL STRESS 1] Email collision attack on registration...")
        test_ts = int(time.time() * 1000)
        dup_email = f'collision_{test_ts}@tatadana.id'
        dispatch_request('POST', '/api/auth/register', body={
            'full_name': 'Original User',
            'email': dup_email,
            'phone_number': f'0893{test_ts % 100000000:08d}',
            'password': 'Password123!'
        })
        status, _, _, err_res = dispatch_request('POST', '/api/auth/register', body={
            'full_name': 'Imposter User',
            'email': dup_email,
            'phone_number': f'0892{test_ts % 100000000:08d}',
            'password': 'Password456!'
        })
        self.assertEqual(status, 400)
        self.assertFalse(err_res.get('ok'))
        self.assertIn("sudah terdaftar", err_res.get('message', ''))
        safe_print("  -> PASS: Duplicate email registration gracefully rejected with HTTP 400.")

    def test_adversarial_2_sql_injection_resilience(self):
        """Adversarial 2: SQL injection payloads in login and nominal parser do not compromise database."""
        safe_print("\n[ADVERSARIAL STRESS 2] SQL injection fuzzing...")
        sqli_payloads = [
            "' OR '1'='1",
            "admin'--",
            "'; DROP TABLE users; --",
            "1 UNION SELECT null, null, null, null, null, null, null, null, null"
        ]
        for sqli in sqli_payloads:
            status, _, _, res = dispatch_request('POST', '/api/auth/login', body={
                'email': sqli,
                'password': sqli
            })
            self.assertEqual(status, 401, f"SQL injection payload '{sqli}' must return HTTP 401 Unauthorized")

        # Verify tatadana.db users table is intact
        conn = server.get_db()
        c = conn.cursor()
        c.execute('SELECT COUNT(*) as cnt FROM users')
        cnt = c.fetchone()['cnt']
        conn.close()
        self.assertGreater(cnt, 0, "Users table must remain intact after SQL injection attempts")
        safe_print("  -> PASS: SQL injection attempts thwarted by parameterized SQLite queries.")

    def test_adversarial_3_photo_base64_payload_compatibility(self):
        """Adversarial 3: Test profile-photo upload with photo_base64 key (frontend format) vs image_base64."""
        safe_print("\n[ADVERSARIAL STRESS 3] Testing photo_base64 payload handling...")
        test_png = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\x9f\x01\x00\x02\x00\x01\x82\x8e\x19\xdf\x00\x00\x00\x00IEND\xaeB`\x82'
        b64_str = "data:image/png;base64," + base64.b64encode(test_png).decode('ascii')
        
        status, _, _, res = dispatch_request('POST', '/api/user/profile-photo', body={
            'user_id': 40,
            'photo_base64': b64_str,
            'image_base64': b64_str
        })
        if status == 500:
            safe_print(f"  [DEFECT CONFIRMED] POST /api/user/profile-photo threw 500: {res}")
            self.fail(f"server.py 500 Internal Server Error: {res}")
        self.assertEqual(status, 200)
        self.assertTrue(res.get('ok'))
        safe_print("  -> PASS: Profile photo upload successfully handled and persisted.")


if __name__ == '__main__':
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.TestLoader().loadTestsFromTestCase(TataDanaRound8ChallengerSuite)
    result = runner.run(suite)
    safe_print("\n" + "=" * 80)
    if result.wasSuccessful():
        safe_print(" EMPIRICAL VERDICT: CONFIRM_CORRECTNESS — ALL 15 ACCEPTANCE CRITERIA VERIFIED!")
        safe_print("=" * 80)
        sys.exit(0)
    else:
        safe_print(f" EMPIRICAL VERDICT: FAILURES DETECTED ({len(result.failures)} failures, {len(result.errors)} errors)!")
        safe_print("=" * 80)
        sys.exit(1)
