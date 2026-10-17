import urllib.request
import urllib.parse
import json
import re
import sys
import os

BASE_URL = "http://localhost:3000"

def test_api():
    print("=== TEST 1: Verifikasi Backend Endpoints ===")
    
    # 1. Test GET /api/reports/analytics for Admin (user_id=1)
    req = urllib.request.Request(f"{BASE_URL}/api/reports/analytics?user_id=1&period=month")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('ok') is True, "Analytics response should have ok: True"
        assert 'total_income' in data, "Analytics missing total_income"
        assert 'total_expense' in data, "Analytics missing total_expense"
        assert 'net_cashflow' in data, "Analytics missing net_cashflow"
        assert 'savings_rate' in data, "Analytics missing savings_rate"
        assert 'categories' in data, "Analytics missing categories"
        assert 'trend' in data, "Analytics missing trend"
        print("  [PASS] GET /api/reports/analytics?period=month OK:", data)

    # 1b. Test periods: 30days & all
    for p in ['30days', 'all']:
        req = urllib.request.Request(f"{BASE_URL}/api/reports/analytics?user_id=1&period={p}")
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            d = json.loads(resp.read().decode('utf-8'))
            assert d.get('ok') is True
            print(f"  [PASS] GET /api/reports/analytics?period={p} OK")

    # 2. Test Multi-Wallet API for a test user
    import time
    ts = int(time.time())
    reg_payload = json.dumps({
        "full_name": f"Test User Wallet {ts}",
        "email": f"test_wallet_{ts}@tatadana.id",
        "password": "password123",
        "phone": f"081{ts}"
    }).encode('utf-8')
    req_reg = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=reg_payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req_reg) as resp:
            reg_data = json.loads(resp.read().decode('utf-8'))
            test_user_id = reg_data.get('user_id')
    except urllib.error.HTTPError:
        login_payload = json.dumps({
            "email": "test_wallet_user@tatadana.id",
            "password": "password123"
        }).encode('utf-8')
        req_login = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req_login) as resp:
            log_data = json.loads(resp.read().decode('utf-8'))
            test_user_id = log_data.get('user', {}).get('id', 1)
    # Add new wallet
    payload = json.dumps({
        "user_id": test_user_id,
        "name": "Bank Jago Bisnis",
        "wallet_type": "bank",
        "balance": 2500000.0,
        "is_default": 1
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/wallets", data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        w_data = json.loads(resp.read().decode('utf-8'))
        assert w_data.get('ok') is True
        w1_id = w_data['wallet_id']
        print("  [PASS] POST /api/wallets created wallet:", w_data)

    # Add second wallet
    payload2 = json.dumps({
        "user_id": test_user_id,
        "name": "OVO Cash",
        "wallet_type": "ewallet",
        "balance": 350000.0,
        "is_default": 0
    }).encode('utf-8')
    req2 = urllib.request.Request(f"{BASE_URL}/api/wallets", data=payload2, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req2) as resp:
        w2_data = json.loads(resp.read().decode('utf-8'))
        assert w2_data.get('ok') is True
        w2_id = w2_data['wallet_id']
        print("  [PASS] POST /api/wallets second wallet:", w2_data)

    # Set second wallet as default
    payload_def = json.dumps({
        "user_id": test_user_id,
        "wallet_id": w2_id
    }).encode('utf-8')
    req_def = urllib.request.Request(f"{BASE_URL}/api/wallets/set-default", data=payload_def, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_def) as resp:
        assert resp.status == 200
        def_data = json.loads(resp.read().decode('utf-8'))
        assert def_data.get('ok') is True
        print("  [PASS] POST /api/wallets/set-default OK:", def_data)

    # Verify wallets list
    req_list = urllib.request.Request(f"{BASE_URL}/api/wallets?user_id={test_user_id}")
    with urllib.request.urlopen(req_list) as resp:
        wallets = json.loads(resp.read().decode('utf-8')).get('wallets', [])
        assert len(wallets) == 2, f"Expected 2 wallets, got {len(wallets)}"
        # Check w2 is default
        w2_item = next(w for w in wallets if w['id'] == w2_id)
        assert w2_item['is_default'] == 1, "w2 should be default"
        print("  [PASS] GET /api/wallets verified default switch")

    # Test transaction recording with wallet balance mutation
    tx_payload = json.dumps({
        "user_id": test_user_id,
        "wallet_id": w2_id,
        "transaction_type": "pengeluaran",
        "amount": 50000.0,
        "category_name": "Makanan & Minuman",
        "notes": "Makan Siang Soto",
        "source": "web"
    }).encode('utf-8')
    req_tx = urllib.request.Request(f"{BASE_URL}/api/transactions", data=tx_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_tx) as resp:
        assert resp.status == 200
        tx_data = json.loads(resp.read().decode('utf-8'))
        assert tx_data.get('ok') is True
        assert tx_data['new_balance'] == 300000.0, f"Expected 300000, got {tx_data['new_balance']}"
        print("  [PASS] POST /api/transactions deducted wallet balance accurately:", tx_data)

    # Delete wallet w1
    del_payload = json.dumps({
        "user_id": test_user_id,
        "wallet_id": w1_id
    }).encode('utf-8')
    req_del = urllib.request.Request(f"{BASE_URL}/api/wallets/delete", data=del_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_del) as resp:
        assert resp.status == 200
        del_data = json.loads(resp.read().decode('utf-8'))
        assert del_data.get('ok') is True
        print("  [PASS] POST /api/wallets/delete OK:", del_data)

    # Clean up w2
    del2_payload = json.dumps({
        "user_id": test_user_id,
        "wallet_id": w2_id
    }).encode('utf-8')
    req_del2 = urllib.request.Request(f"{BASE_URL}/api/wallets/delete", data=del2_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_del2) as resp:
        assert resp.status == 200
        print("  [PASS] Cleaned up test wallet 2")


def test_html_ui():
    print("\n=== TEST 2: Verifikasi Struktur UI index.html ===")
    html_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Menu Beranda di navigasi sidebar di atas Transaksi & Mutasi
    assert 'id="dNav-beranda"' in html, "id='dNav-beranda' not found"
    assert 'id="dNav-transaksi"' in html, "id='dNav-transaksi' not found"
    idx_beranda = html.find('id="dNav-beranda"')
    idx_transaksi = html.find('id="dNav-transaksi"')
    assert idx_beranda < idx_transaksi, "dNav-beranda must be placed ABOVE dNav-transaksi"
    # Ensure dNav-beranda is NOT hidden
    beranda_chunk = html[idx_beranda-50:idx_beranda+150]
    assert 'class="hidden"' not in beranda_chunk, "dNav-beranda should be a visible menu button"
    print("  [PASS] Menu 'Beranda' berada di paling atas sidebar sebelum 'Transaksi & Mutasi'")

    # 2. Tombol submit formulir transaksi berlabel 'Simpan'
    assert 'Simpan ke Database SQLite' not in html, "'Simpan ke Database SQLite' still present in html"
    assert re.search(r'realSaveTransaction\(\)[^>]*>\s*Simpan\s*</button>', html), "Tombol 'Simpan' not found"
    print("  [PASS] Label tombol submit transaksi diubah menjadi 'Simpan'")

    # 3. Halaman Laporan Eksekutif
    assert 'id="dTab-laporan"' in html, "dTab-laporan not found"
    assert 'id="repValIncome"' in html, "repValIncome card not found"
    assert 'id="repValExpense"' in html, "repValExpense card not found"
    assert 'id="repValCashflow"' in html, "repValCashflow card not found"
    assert 'id="repValSavingsRate"' in html, "repValSavingsRate card not found"
    assert 'id="repFilter-month"' in html, "repFilter-month not found"
    assert 'id="repFilter-30days"' in html, "repFilter-30days not found"
    assert 'id="repFilter-all"' in html, "repFilter-all not found"
    assert 'id="btnExportExcel"' in html, "btnExportExcel not found"
    assert 'id="btnExportPdf"' in html, "btnExportPdf not found"
    assert 'repBarChartContent' in html, "Histogram/Bar chart container not found"
    assert 'repDonutSvg' in html, "Donut SVG not found"
    assert 'repCategoryLegend' in html, "Donut legend not found"
    print("  [PASS] Laporan Eksekutif memiliki 4 kartu metrik, filter periode, histogram, donut chart, dan tombol ekspor")

    # 4. Halaman Multi-Wallet
    assert 'id="dTab-wallet"' in html, "dTab-wallet not found"
    assert 'id="walletContainer"' in html, "walletContainer not found"
    assert 'id="modalAddWallet"' in html, "modalAddWallet not found"
    assert 'Tambah Wallet Pertama Anda' in html, "Empty state CTA not found"
    assert 'id="inputWalletName"' in html, "inputWalletName not found"
    assert 'id="inputWalletType"' in html, "inputWalletType not found"
    assert 'id="inputWalletBalance"' in html, "inputWalletBalance not found"
    assert 'id="inputWalletIsDefault"' in html, "inputWalletIsDefault not found"
    assert 'setWalletDefault' in html, "setWalletDefault function not found"
    assert 'renderWalletSection' in html, "renderWalletSection function not found"
    print("  [PASS] Multi-Wallet memiliki empty state CTA, modal input dompet, sinkronisasi default, dan kartu dinamis")

if __name__ == "__main__":
    test_api()
    test_html_ui()
    print("\n[SUCCESS] SELURUH 4 FITUR TERVERIFIKASI SUKSES 100%!")
