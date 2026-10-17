import urllib.request, json, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

routes = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/dashboard/wallets',
    '/dashboard/budgets',
    '/dashboard/reports',
    '/dashboard/settings',
    '/admin',
    '/admin/users',
    '/boost',
    '/teamwork-preview',
    '/api/telegram/test',
    '/api/export/pdf',
    '/api/export/excel',
]

all_ok = True
for r in routes:
    try:
        url = f'http://127.0.0.1:3000{r}'
        req = urllib.request.urlopen(url, timeout=3)
        body = req.read()
        print(f'{r:25} -> {req.status} OK (len: {len(body)})')
    except Exception as e:
        print(f'{r:25} -> ERROR: {e}')
        all_ok = False

# Test POST /api/telegram/chat
try:
    chat_url = 'http://127.0.0.1:3000/api/telegram/chat'
    payload = json.dumps({'message': 'beli kopi 18rb'}).encode('utf-8')
    req = urllib.request.Request(chat_url, data=payload, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req, timeout=3)
    data = json.loads(resp.read().decode('utf-8'))
    first_line = data.get("reply", "").splitlines()[0] if data.get("reply") else ""
    print(f"{'/api/telegram/chat':25} -> {resp.status} OK (reply: {first_line})")
except Exception as e:
    print(f"{'/api/telegram/chat':25} -> ERROR: {e}")
    all_ok = False

# Test POST /api/telegram/test with token
try:
    test_url = 'http://127.0.0.1:3000/api/telegram/test'
    payload = json.dumps({'token': 'demo:token', 'action': 'test'}).encode('utf-8')
    req = urllib.request.Request(test_url, data=payload, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req, timeout=3)
    data = json.loads(resp.read().decode('utf-8'))
    print(f"{'/api/telegram/test (POST)':25} -> {resp.status} OK (bot: {data.get('bot', {}).get('username')})")
except Exception as e:
    print(f"{'/api/telegram/test (POST)':25} -> ERROR: {e}")
    all_ok = False

if all_ok:
    print('\n🎉 ALL ROUTES AND BOT APIS ARE LIVE AND WORKING FLAWLESSLY ON LOCALHOST:3000!')
