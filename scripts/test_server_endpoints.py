# -*- coding: utf-8 -*-
"""
Test scripts/server.py endpoints:
- GET / (Landing Page)
- GET /login
- GET /register
- GET /dashboard
- GET /dashboard/wallets
- GET /dashboard/budgets
- GET /dashboard/reports
- GET /dashboard/settings
- GET /admin
- GET /admin/users
- POST /api/telegram/webhook (with update_id idempotency)
- GET /api/export/pdf
- GET /api/export/excel
"""

import sys
import threading
import time
import urllib.request
import urllib.parse
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Import server from server.py
import server

httpd = None

def run_server():
    global httpd
    server.PORT = 3001
    server_address = ('', 3001)
    httpd = server.HTTPServer(server_address, server.TataDanaHandler)
    httpd.serve_forever()

t = threading.Thread(target=run_server, daemon=True)
t.start()
time.sleep(1)

routes_to_test = [
    ('/', 200, 'TataDana'),
    ('/login', 200, 'Masuk ke Akun TataDana'),
    ('/register', 200, 'Daftar Akun TataDana'),
    ('/dashboard', 200, 'Ringkasan Keuangan'),
    ('/dashboard/wallets', 200, 'Multi-Wallet'),
    ('/dashboard/budgets', 200, 'Budget Bulanan'),
    ('/dashboard/reports', 200, 'Laporan Keuangan'),
    ('/dashboard/settings', 200, 'Pengaturan'),
    ('/boost', 200, 'PRO Boost'),
    ('/teamwork-preview', 200, 'Teamwork'),
    ('/admin', 200, 'Superadmin'),
    ('/admin/users', 200, 'Direktori Pengguna'),
    ('/api/export/pdf', 200, '%PDF'),
    ('/api/export/excel', 200, 'ID Transaksi'),
]

passed = 0
failed = 0

for path, expected_code, content_check in routes_to_test:
    url = f'http://localhost:3001{path}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'TestRunner'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            code = resp.getcode()
            body = resp.read().decode('utf-8', errors='ignore')
            if code == expected_code and content_check in body:
                print(f'  ✅ [PASS] GET {path} returned {code} (matched "{content_check}")')
                passed += 1
            else:
                print(f'  ❌ [FAIL] GET {path} returned {code} (expected {expected_code})')
                failed += 1
    except Exception as e:
        print(f'  ❌ [ERROR] GET {path}: {e}')
        failed += 1

# Test POST /api/telegram/webhook with idempotency
webhook_url = 'http://localhost:3001/api/telegram/webhook'
payload1 = json.dumps({'update_id': 88801, 'message': {'text': 'beli nasi padang 25rb'}}).encode('utf-8')
req1 = urllib.request.Request(webhook_url, data=payload1, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req1, timeout=5) as resp1:
    body1 = json.loads(resp1.read().decode('utf-8'))
    if resp1.getcode() == 200 and body1.get('success') is True:
        print('  ✅ [PASS] POST /api/telegram/webhook first delivery processed')
        passed += 1
    else:
        print('  ❌ [FAIL] POST /api/telegram/webhook first delivery failed')
        failed += 1

# Test duplicate update_id 88801
req2 = urllib.request.Request(webhook_url, data=payload1, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req2, timeout=5) as resp2:
    body2 = json.loads(resp2.read().decode('utf-8'))
    if resp2.getcode() == 200 and body2.get('duplicate') is True:
        print('  ✅ [PASS] POST /api/telegram/webhook duplicate delivery detected & blocked (idempotent 200 OK)')
        passed += 1
    else:
        print('  ❌ [FAIL] POST /api/telegram/webhook duplicate not detected properly')
        failed += 1

# Test POST /api/telegram/chat simulator endpoint
chat_url = 'http://localhost:3001/api/telegram/chat'
chat_payload = json.dumps({'message': 'beli kopi 18rb', 'user_name': 'Budi Pratama'}).encode('utf-8')
req3 = urllib.request.Request(chat_url, data=chat_payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req3, timeout=5) as resp3:
    body3 = json.loads(resp3.read().decode('utf-8'))
    if resp3.getcode() == 200 and body3.get('ok') is True and 'Pengeluaran tercatat' in body3.get('reply', ''):
        print('  ✅ [PASS] POST /api/telegram/chat processed expense and generated formatted tree reply')
        passed += 1
    else:
        print(f'  ❌ [FAIL] POST /api/telegram/chat failed: {body3}')
        failed += 1

print(f'\nEndpoint Test Summary: {passed}/{passed+failed} passed')
if failed == 0:
    print('🎉 ALL ENDPOINTS OPERATING SMOOTHLY!')
    sys.exit(0)
else:
    sys.exit(1)
