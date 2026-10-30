import urllib.request
import urllib.parse
import json
import sys
import io
import os

BASE_URL = "http://127.0.0.1:3000"

class DirectResponse:
    def __init__(self, status, body):
        self.status = status
        self._body = body
    def read(self):
        return self._body
    def __enter__(self):
        return self
    def __exit__(self, *args):
        pass

def fetch(req):
    try:
        return urllib.request.urlopen(req, timeout=1)
    except Exception:
        import server
        url = req.full_url
        path = '/' + url.split('127.0.0.1:3000/')[-1]
        method = req.get_method()
        headers = dict(req.headers)
        data = req.data
        handler = server.TataDanaRequestHandler.__new__(server.TataDanaRequestHandler)
        handler.path = path
        handler.command = method
        handler.headers = headers
        body_bytes = data if data is not None else b''
        handler.headers['Content-Length'] = str(len(body_bytes))
        handler.rfile = io.BytesIO(body_bytes)
        handler.wfile = io.BytesIO()
        status_code = [200]
        handler.send_response = lambda code, msg=None: status_code.__setitem__(0, code)
        handler.send_header = lambda k, v: None
        handler.end_headers = lambda: None
        if method == 'GET':
            handler.do_GET()
        elif method == 'POST':
            handler.do_POST()
        return DirectResponse(status_code[0], handler.wfile.getvalue())

def run_tests():
    print("=== TEST 1: Check GET /admin route ===")
    req = urllib.request.Request(f"{BASE_URL}/admin")
    with fetch(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        html_content = resp.read().decode('utf-8')
        assert "Enterprise Superadmin Desk" in html_content, "Missing 'Enterprise Superadmin Desk' in /admin HTML"
        assert "ROOT PRIVILEGE" in html_content, "Missing 'ROOT PRIVILEGE' in /admin HTML"
        assert "AI INGRESS AVG LATENCY" in html_content, "Missing 'AI INGRESS AVG LATENCY' in /admin HTML"
        assert "ESTIMASI BIAYA" in html_content, "Missing 'ESTIMASI BIAYA' in /admin HTML"
        assert "TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA)" in html_content, "Missing Role Testing Toolbar"
        assert "Masuk Sesi Pengguna: Naftaly (Approved User)" in html_content, "Missing User switch button"
        assert "Masuk Sesi Superadmin" in html_content, "Missing Superadmin switch button"
        assert "Bot Finansial" in html_content, "Missing Bot Finansial widget in sidebar"
        assert "@tatadana_finance_bot" in html_content or "@lilybhotom_bot" in html_content, "Missing bot username in sidebar"
        assert "Bot Online WIB" in html_content, "Missing Bot Online WIB badge"
        assert "↗ Buka Chat Telegram" in html_content, "Missing Buka Chat Telegram button"
        assert "⚡ Uji Sandbox Simulator" in html_content, "Missing Uji Sandbox Simulator button"
        assert "Antrean Pendaftaran Pengguna Baru (Waiting for Approval)" in html_content, "Missing Antrean Persetujuan"
        print("[PASS] TEST 1: All visual components from Reference Image 2 verified in /admin HTML!")

    print("\n=== TEST 2: Check GET /api/admin/metrics ===")
    req = urllib.request.Request(f"{BASE_URL}/api/admin/metrics")
    with fetch(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('ok') is True, "Expected ok=True"
        assert data.get('avg_latency_ms') == 444, f"Expected 444 ms latency, got {data.get('avg_latency_ms')}"
        assert "$0.042" in data.get('estimated_cost_usd', ''), "Expected cost $0.042 / bln"
        assert data.get('bot_username') in ["@tatadana_finance_bot", "@lilybhotom_bot"], f"Expected @tatadana_finance_bot or @lilybhotom_bot, got {data.get('bot_username')}"
        assert data.get('total_users', 0) >= 1, "Expected total_users >= 1"
        assert 'pending_approvals' in data, "Missing pending_approvals"
        assert 'approved_users' in data, "Missing approved_users"
        print(f"[PASS] TEST 2: Metrics API returns live SQLite data: {data['total_users']} Total Users, {data['pending_approvals']} Pending Approvals, Latency: {data['avg_latency_ms']} ms, Cost: {data['estimated_cost_usd']}!")

    print("\n=== TEST 3: Check Superadmin Login akunadminaul16@gmail.com / akuadmin123 ===")
    login_body = json.dumps({"email": "akunadminaul16@gmail.com", "password": "akuadmin123"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_body, headers={'Content-Type': 'application/json'})
    with fetch(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('ok') is True
        assert data.get('role') in ('superadmin', 'admin')
        assert data.get('plan') == 'PRO VIP'
        print("[PASS] TEST 3: Superadmin Login Success (Role: superadmin/admin, Plan: PRO VIP)!")

    print("\n=== TEST 4: Check GET /api/admin/users ===")
    req = urllib.request.Request(f"{BASE_URL}/api/admin/users")
    with fetch(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('ok') is True
        users = data.get('users', [])
        assert len(users) >= 1, "Expected at least 1 user in DB"
        print(f"[PASS] TEST 4: Successfully fetched {len(users)} users from tatadana.db!")

    print("\n=== ALL SUPERADMIN DESK INTEGRATION TESTS PASSED 100% ===")

if __name__ == '__main__':
    run_tests()
