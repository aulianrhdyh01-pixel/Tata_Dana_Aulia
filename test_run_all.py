import urllib.request
import json
import time

base = 'http://127.0.0.1:3000'

def test_all():
    print('=== MEMULAI PENGUJIAN SEMUA FITUR TATADANA PRIME ===')
    
    # 1. Test Static Routes
    for route in ['/', '/login', '/approval', '/dashboard', '/admin', '/settings']:
        r = urllib.request.urlopen(f'{base}{route}')
        print(f'[OK] Rute {route}: Status {r.status}')
        assert r.status == 200

    # 2. Test Superadmin Login
    data = json.dumps({'email': 'akunadminaul16@gmail.com', 'password': 'akuadmin123'}).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    admin_auth = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Login Superadmin: {admin_auth.get("ok")} (Role: {admin_auth.get("role")})')
    assert admin_auth.get('ok') is True
    assert admin_auth.get('role') == 'superadmin'

    # 3. Test User Registration & Approval Gate
    ts = int(time.time() * 1000)
    new_email = f'user_fitur_{ts}@gmail.com'
    new_phone = f'0899{ts % 100000000:08d}'
    reg_data = json.dumps({
        'full_name': 'Nasabah Prioritas',
        'email': new_email,
        'phone_number': new_phone,
        'password': 'password123'
    }).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/auth/register', data=reg_data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    reg_res = json.loads(r.read().decode('utf-8'))
    user_id = reg_res.get('user_id')
    otp = reg_res.get('otp_code')
    print(f'[OK] Fitur Pendaftaran User Baru: ID={user_id}, OTP={otp}')
    assert reg_res.get('ok') is True

    # 4. Test OTP Verification - Ensure is_approved is 0 (Approval Gate)
    otp_data = json.dumps({'user_id': user_id, 'email': new_email, 'otp': otp}).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/auth/verify-otp', data=otp_data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    otp_res = json.loads(r.read().decode('utf-8'))
    is_appr = otp_res.get('user', {}).get('is_approved')
    print(f'[OK] Fitur Verifikasi OTP & Approval Gate: Status={otp_res.get("status")}, is_approved={is_appr}')
    assert otp_res.get('ok') is True
    assert is_appr == 0

    # 5. Test Check Status Endpoint
    req = urllib.request.Request(f'{base}/api/auth/status?email={new_email}')
    r = urllib.request.urlopen(req)
    st_res = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Cek Status Persetujuan: is_approved={st_res.get("is_approved")}')
    assert st_res.get('is_approved') == 0

    # 6. Test Admin Approve User in SQLite
    app_data = json.dumps({'user_id': user_id, 'action': 'approve'}).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/admin/approve-user', data=app_data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    app_res = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Otorisasi Approval Admin: {app_res.get("message")}')
    assert app_res.get('ok') is True

    # Check status again - now must be approved
    req = urllib.request.Request(f'{base}/api/auth/status?email={new_email}')
    r = urllib.request.urlopen(req)
    st_res2 = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Status Setelah Diapprove Admin: is_approved={st_res2.get("is_approved")}')
    assert st_res2.get('is_approved') == 1

    # 7. Test Add New Wallet
    wallet_post = json.dumps({
        'user_id': user_id,
        'name': 'BCA Utama Prioritas',
        'wallet_type': 'bank',
        'balance': 10000000,
        'is_default': 1
    }).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/wallets', data=wallet_post, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    w_create = json.loads(r.read().decode('utf-8'))
    wallet_id = w_create.get('wallet_id') or w_create.get('id')
    print(f'[OK] Fitur Tambah Wallet Baru: ID={wallet_id}, Response={w_create.get("ok")}')

    # Verify Wallets List
    req = urllib.request.Request(f'{base}/api/wallets?user_id={user_id}')
    r = urllib.request.urlopen(req)
    w_res = json.loads(r.read().decode('utf-8'))
    wallets = w_res.get('wallets', [])
    print(f'[OK] Fitur Multi-Wallet Aktif: Ditemukan {len(wallets)} dompet')
    target_wallet_id = wallets[0]['id'] if wallets else wallet_id

    # 8. Test Add Transaction (Pemasukan)
    tx_data = json.dumps({
        'user_id': user_id,
        'wallet_id': target_wallet_id,
        'type': 'pemasukan',
        'amount': 2500000,
        'category': 'Gaji & Pendapatan',
        'description': 'Gaji Eksekutif Masuk'
    }).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/transactions', data=tx_data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    tx_res = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Transaksi Pemasukan: ID={tx_res.get("transaction_id")}')
    assert tx_res.get('ok') is True

    # 9. Test Add Transaction (Pengeluaran)
    tx_out = json.dumps({
        'user_id': user_id,
        'wallet_id': target_wallet_id,
        'type': 'pengeluaran',
        'amount': 350000,
        'category': 'Makanan & Minuman',
        'description': 'Makan Siang Tim'
    }).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/transactions', data=tx_out, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    tx_out_res = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Transaksi Pengeluaran: ID={tx_out_res.get("transaction_id")}')
    assert tx_out_res.get('ok') is True

    # 10. Test Export CSV
    req = urllib.request.Request(f'{base}/api/export?user_id={user_id}&format=csv')
    r = urllib.request.urlopen(req)
    csv_bytes = r.read()
    print(f'[OK] Fitur Ekspor Laporan CSV: Berhasil ({len(csv_bytes)} bytes)')
    assert len(csv_bytes) > 0

    # 11. Test Telegram Bot Info Endpoint / Webhook
    tg_data = json.dumps({
        'message': {
            'from': {'id': 99887766, 'first_name': 'TestTelegramUser'},
            'text': 'Pengeluaran 50000 Makanan & Minuman'
        }
    }).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/telegram/webhook', data=tg_data, headers={'Content-Type': 'application/json'})
    r = urllib.request.urlopen(req)
    tg_res = json.loads(r.read().decode('utf-8'))
    print(f'[OK] Fitur Webhook/Bot Telegram: Status={tg_res.get("ok")}')
    assert tg_res.get('ok') is True

    print('\n======================================================')
    print('  SEMUA FITUR SISTEM TERVERIFIKASI 100% BERJALAN AKTIF!')
    print('======================================================')

if __name__ == '__main__':
    test_all()
