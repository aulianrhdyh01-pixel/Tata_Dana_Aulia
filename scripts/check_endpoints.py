# -*- coding: utf-8 -*-
import sys
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

routes = [
    ('/', 'Landing Page'),
    ('/login', 'Login'),
    ('/register', 'Register'),
    ('/dashboard', 'Dashboard Beranda'),
    ('/dashboard/wallets', 'Multi-Wallet'),
    ('/dashboard/budgets', 'Budget'),
    ('/dashboard/reports', 'Laporan & Export'),
    ('/dashboard/settings', 'Integrasi Bot Telegram'),
    ('/boost', 'TataDana Pro Boost'),
    ('/teamwork-preview', 'Teamwork Preview'),
    ('/admin', 'Admin Dashboard'),
    ('/admin/users', 'Admin Users'),
]

for path, label in routes:
    url = f'http://localhost:3000{path}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'LocalCheck'})
        with urllib.request.urlopen(req, timeout=3) as res:
            html = res.read().decode('utf-8', errors='ignore')
            print(f'[OK 200] {path:22} -> {label} (length: {len(html)})', flush=True)
    except Exception as e:
        print(f'[FAIL] {path:22} -> {e}', flush=True)
