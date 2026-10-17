import urllib.request, json, time

# 1. Test /approval HTML: verify 'secara realtime' is completely removed from delivery text
res = urllib.request.urlopen('http://localhost:3000/approval')
html = res.read().decode('utf-8')
assert 'secara realtime' not in html
assert 'Kode OTP 6-digit dikirimkan ke email <span id="otpTargetEmail" class="text-cyan-400 font-mono font-bold"></span>.' in html
print('[TEST 1 PASS] Kalimat "secara realtime" berhasil dihapus dari tampilan!')

# 2. Test registration + click Lanjutkan directly to user dashboard
ts = int(time.time())
reg_data = json.dumps({
    'full_name': f'Budi Test {ts}', 
    'email': f'budi.{ts}@tatadana.id', 
    'phone_number': f'0877{ts}', 
    'password': 'mypassword123'
}).encode('utf-8')
req_reg = urllib.request.Request('http://localhost:3000/api/auth/register', data=reg_data, headers={'Content-Type': 'application/json'})
res_reg = urllib.request.urlopen(req_reg)
d_reg = json.loads(res_reg.read().decode('utf-8'))
assert d_reg['ok'] == True
uid = d_reg['user_id']
otp = d_reg['otp_code']
print(f'[TEST 2 PASS] User registered #{uid}, OTP: {otp}')

# 3. Test clicking 'Lanjutkan' via verify-otp
verify_data = json.dumps({'user_id': uid, 'otp': otp}).encode('utf-8')
req_v = urllib.request.Request('http://localhost:3000/api/auth/verify-otp', data=verify_data, headers={'Content-Type': 'application/json'})
res_v = urllib.request.urlopen(req_v)
d_v = json.loads(res_v.read().decode('utf-8'))
assert d_v['ok'] == True
assert d_v['is_approved'] == 1
assert d_v['status'] == 'active'
print('[TEST 3 PASS] Tombol Lanjutkan berhasil memverifikasi akun dan mengaktifkan status!')

# 4. Test User Profile & Dashboard Access
req_prof = urllib.request.Request(f'http://localhost:3000/api/user/profile?user_id={uid}')
res_prof = urllib.request.urlopen(req_prof)
d_prof = json.loads(res_prof.read().decode('utf-8'))
assert d_prof['ok'] == True
assert d_prof['user']['is_approved'] == 1
print('[TEST 4 PASS] User profile aktif dan siap membuka rute /dashboard langsung!')
print('ALL TESTS PASSED SUCCESSFULLY!')
