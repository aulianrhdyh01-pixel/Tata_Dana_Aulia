import urllib.request
import urllib.error
import json
import time

base = 'http://127.0.0.1:3000'

print("=== STARTING TATADANA PRIME API VERIFICATION ===")

# 1. Test Superadmin Login
req = urllib.request.Request(f'{base}/api/auth/login', data=json.dumps({
    'email': 'akunadminaul16@gmail.com',
    'password': 'akuadmin123'
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
login_data = json.loads(res.read().decode())
print('[TEST 1] Login Superadmin:', login_data.get('ok'), '| Role:', login_data.get('role'), '| Plan:', login_data.get('plan'))
assert login_data.get('ok') is True, "Login ok flag must be True"
assert login_data.get('role') == 'superadmin', "Role must be 'superadmin'"
assert login_data.get('plan') == 'PRO VIP', "Plan must be 'PRO VIP'"

admin_uid = login_data.get('user', {}).get('id', 40)

# 2. Test Get User Profile
res = urllib.request.urlopen(f'{base}/api/user/profile?user_id={admin_uid}')
prof_data = json.loads(res.read().decode())
print('[TEST 2] Get Profile:', prof_data.get('ok'), '| User:', prof_data.get('user', {}).get('email'))
assert prof_data.get('ok') is True, "Get Profile must return ok: True"
assert prof_data.get('user', {}).get('email') == 'akunadminaul16@gmail.com', "User email must match"

# 3. Test Update User Profile (Photo & Details)
demo_avatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230284c7"/></svg>'
req = urllib.request.Request(f'{base}/api/user/profile', data=json.dumps({
    'user_id': admin_uid,
    'full_name': 'Superadmin TataDana Prime',
    'phone_number': f'0812{admin_uid:08d}',
    'avatar_url': demo_avatar
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
upd_prof = json.loads(res.read().decode())
print('[TEST 3] Update Profile Photo:', upd_prof.get('ok'), '| Has Avatar:', bool(upd_prof.get('user', {}).get('avatar_url')))
assert upd_prof.get('ok') is True, "Update profile must return ok: True"
assert upd_prof.get('user', {}).get('avatar_url') == demo_avatar, "Avatar URL must persist"

# 4. Test Telegram Webhook (Transaction recorded permanently)
req = urllib.request.Request(f'{base}/api/telegram/webhook', data=json.dumps({
    'update_id': int(time.time()),
    'message': {
        'from': {'id': 888777, 'first_name': 'TestUser'},
        'text': 'Makan siang sate padang 35000'
    }
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
wh_data = json.loads(res.read().decode())
print('[TEST 4] Telegram Webhook:', wh_data.get('ok'), '| Tx ID:', wh_data.get('transaction_id'))
assert wh_data.get('ok') is True, "Telegram webhook must return ok: True"
assert wh_data.get('transaction_id') is not None, "Webhook must return transaction_id"
assert wh_data.get('amount') == 35000.0, "Webhook must parse 35000 amount correctly"

# 5. Test Export CSV
res = urllib.request.urlopen(f'{base}/api/export?user_id={admin_uid}')
csv_content = res.read().decode('utf-8')
print('[TEST 5] Export CSV Length:', len(csv_content), '| Contains sate padang:', 'sate padang' in csv_content)
assert res.status == 200, "Export must return status 200"
assert 'No,Tanggal (WIB)' in csv_content, "CSV must contain official header"

# 6. Test SPA Route GET /admin
res = urllib.request.urlopen(f'{base}/admin')
html_content = res.read().decode('utf-8')
print('[TEST 6] GET /admin status:', res.status, '| HTML served:', '<!DOCTYPE html>' in html_content)
assert res.status == 200, "GET /admin must return 200"
assert '<!DOCTYPE html>' in html_content, "Must serve HTML content"

# 7. Test User Registration Flow (Pending Approval)
ts = int(time.time())
test_email = f'user.{ts}@example.com'
test_phone = f'089{str(ts)[-8:]}'
test_pw = 'UserSecret123!'

req = urllib.request.Request(f'{base}/api/auth/register', data=json.dumps({
    'full_name': 'Rina Anggraini',
    'email': test_email,
    'phone_number': test_phone,
    'password': test_pw
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
reg_data = json.loads(res.read().decode())
print('[TEST 7] Register User:', reg_data.get('ok'), '| Status is_approved:', reg_data.get('is_approved'))
assert reg_data.get('ok') is True, "Register must return ok: True"
assert reg_data.get('is_approved') == 0, "New user must have is_approved == 0"
user_id = reg_data.get('user_id')

# 8. Test Login Before Approval
req = urllib.request.Request(f'{base}/api/auth/login', data=json.dumps({
    'email': test_email,
    'password': test_pw
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
login_before = json.loads(res.read().decode())
print('[TEST 8] Login Before Approval Status:', login_before.get('status'), '| is_approved:', login_before.get('is_approved'))
assert login_before.get('ok') is True
assert login_before.get('status') == 'pending_approval', "Status must be pending_approval"
assert login_before.get('is_approved') == 0, "is_approved must be 0"

# 9. Admin Approves User
req = urllib.request.Request(f'{base}/api/admin/approve-user', data=json.dumps({
    'user_id': user_id
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
appr_data = json.loads(res.read().decode())
print('[TEST 9] Admin Approve User:', appr_data.get('ok'), '| Message:', appr_data.get('message'))
assert appr_data.get('ok') is True, "Approve user must return ok: True"
assert appr_data.get('is_approved') == 1, "is_approved must become 1"

# 10. Login After Approval
req = urllib.request.Request(f'{base}/api/auth/login', data=json.dumps({
    'email': test_email,
    'password': test_pw
}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
login_after = json.loads(res.read().decode())
print('[TEST 10] Login After Approval Status:', login_after.get('status'), '| is_approved:', login_after.get('is_approved'), '| Role:', login_after.get('role'))
assert login_after.get('ok') is True
assert login_after.get('status') == 'active', "Status must be active"
assert login_after.get('is_approved') == 1, "is_approved must be 1"

print('=== ALL 10 TESTS PASSED SUCCESSFULLY WITH STRICT ASSERTIONS! ===')
