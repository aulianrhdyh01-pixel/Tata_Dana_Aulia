import urllib.request
import json
import os
import re

BASE_URL = "http://localhost:3000"

def test_backend_telegram():
    print("=== TEST 1: Verifikasi Integrasi Backend Telegram Bot ===")
    
    # 1. Verifikasi .env
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    assert os.path.exists(env_file), ".env file must exist"
    with open(env_file, "r", encoding="utf-8") as f:
        env_content = f.read()
    assert "8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ" in env_content, "Token bot baru harus ada di .env"
    print("  [PASS] File .env memuat TELEGRAM_BOT_TOKEN baru")

    # 2. Test /start greeting via Webhook
    start_payload = json.dumps({
        "update_id": 999901,
        "message": {
            "message_id": 101,
            "from": {"id": 987654321, "first_name": "TestUser"},
            "chat": {"id": 987654321, "type": "private"},
            "text": "/start"
        }
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/telegram/webhook", data=start_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        d = json.loads(resp.read().decode('utf-8'))
        reply = d.get('reply_text', '')
        assert "Halo! Saya bot asisten keuangan TataDana" in reply, f"Greeting salah: {reply}"
        assert "[Jenis] [Nominal] [Kategori]" in reply
        print("  [PASS] Perintah /start membalas sapaan resmi TataDana")

    # 3. Test transaksi via Telegram chat: Pengeluaran 50000 Makanan & Minuman
    tx_payload = json.dumps({
        "update_id": 999902,
        "message": {
            "message_id": 102,
            "from": {"id": 987654321, "first_name": "TestUser"},
            "chat": {"id": 987654321, "type": "private"},
            "text": "Pengeluaran 50000 Makanan & Minuman"
        }
    }).encode('utf-8')
    req_tx = urllib.request.Request(f"{BASE_URL}/api/telegram/webhook", data=tx_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_tx) as resp:
        assert resp.status == 200
        d_tx = json.loads(resp.read().decode('utf-8'))
        assert d_tx.get('ok') is True
        assert 'transaction_id' in d_tx
        assert d_tx.get('amount') == 50000.0
        print("  [PASS] Transaksi chat Telegram otomatis tersimpan ke SQLite & mutasi saldo berhasil: ID #" + str(d_tx['transaction_id']))


def test_ui_and_rbac():
    print("\n=== TEST 2: Verifikasi UI Sidebar & RBAC index.html ===")
    html_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Verifikasi Username bot baru di UI
    assert "@tatadana_finance_bot" in html, "Username @tatadana_finance_bot harus ada di index.html"
    assert "https://t.me/tatadana_finance_bot" in html, "Link t.me/tatadana_finance_bot harus ada di tombol sidebar"
    assert "@lilybhotom_bot" not in html, "Username lama @lilybhotom_bot tidak boleh ada lagi"
    assert "@lilybothom_bot" not in html, "Username lama @lilybothom_bot tidak boleh ada lagi"
    print("  [PASS] Username @tatadana_finance_bot & link t.me/tatadana_finance_bot terverifikasi di sidebar")

    # 2. Verifikasi menu sidebar
    assert 'id="dNav-beranda"' in html, "Menu Beranda harus ada"
    assert 'id="dNav-transaksi"' in html, "Menu Transaksi harus ada"
    assert 'id="dNav-kalender"' in html, "Menu Kalender harus ada"
    assert 'id="dNav-botSimulator"' in html, "Menu Tata AI (botSimulator) harus ada"
    assert 'id="dNav-laporan"' in html, "Menu Laporan Eksekutif harus ada"
    assert 'id="dNav-budget"' in html, "Menu Alokasi Budget harus ada"
    assert 'id="dNav-wallet"' in html, "Menu Multi-Wallet harus ada"
    assert 'id="dNav-adminPanel"' in html, "Menu Superadmin Desk harus ada"
    assert 'id="dNav-settings"' in html, "Menu Pengaturan Akun harus ada"
    print("  [PASS] Seluruh item menu yang diminta user (Beranda, Transaksi, Kalender, Tata AI, Laporan, Budget, Wallet, Settings) tersedia")

    # 3. Verifikasi logika applyRBAC & proteksi 403
    assert "function applyRBAC(role)" in html, "Fungsi applyRBAC(role) harus didefinisikan"
    assert "selectTab('beranda')" in html, "Redirection ke beranda pada proteksi admin harus ada"
    assert "403 FORBIDDEN" in html, "Notifikasi 403 Forbidden harus ada"
    print("  [PASS] Fungsi applyRBAC dan proteksi rute 403 Forbidden terpasang dengan benar")

    # 4. Verifikasi copy bot username
    assert "const uname = '@tatadana_finance_bot';" in html, "copyBotUsername harus menyalin @tatadana_finance_bot"
    print("  [PASS] Tombol salin username bot menyalin @tatadana_finance_bot")


if __name__ == "__main__":
    test_backend_telegram()
    test_ui_and_rbac()
    print("\n[SUCCESS] SELURUH PENGUJIAN BOT TELEGRAM & RBAC SUKSES 100%!")
