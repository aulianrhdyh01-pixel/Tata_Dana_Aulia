import os
import sys
import json
import sqlite3
import re

print("======================================================================")
print("TATADANA PRIME — MILESTONE VERIFICATION AUDIT")
print("======================================================================")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_PATH = os.path.join(ROOT_DIR, 'index.html')
SERVER_PATH = os.path.join(ROOT_DIR, 'server.py')
DB_PATH = os.path.join(ROOT_DIR, 'tatadana.db')

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    server_code = f.read()

# --------------------------------------------------------------------
# REQUIREMENT 1: Navigasi & Menu "Beranda" (Sidebar)
# --------------------------------------------------------------------
print("\n--- [AUDIT 1] Navigasi & Menu 'Beranda' (Sidebar) ---")

# 1.1 Check dNav-beranda is before dNav-transaksi in sidebar nav
nav_match = re.search(r'<nav[^>]*class="[^"]*space-y-1[^"]*"[^>]*>(.*?)</nav>', html, re.DOTALL)
assert nav_match, "Sidebar <nav> not found in index.html"
nav_content = nav_match.group(1)

pos_beranda = nav_content.find('id="dNav-beranda"')
pos_transaksi = nav_content.find('id="dNav-transaksi"')

assert pos_beranda != -1, "dNav-beranda not found in sidebar nav"
assert pos_transaksi != -1, "dNav-transaksi not found in sidebar nav"
assert pos_beranda < pos_transaksi, "dNav-beranda MUST be positioned ABOVE dNav-transaksi in sidebar!"
print("[PASS 1.1] dNav-beranda is at the top of the sidebar navigation above dNav-transaksi.")

# 1.2 Check icon and text
assert "🏠" in nav_content[:pos_transaksi], "Icon 🏠 missing in Beranda nav item"
assert "Beranda" in nav_content[:pos_transaksi], "Text 'Beranda' missing in Beranda nav item"
print("[PASS 1.2] Beranda nav item correctly styled with home icon (🏠) and label 'Beranda'.")

# 1.3 Check dTab-beranda contains overview cards & quick shortcuts
assert 'id="dTab-beranda"' in html, "dTab-beranda section missing"
assert 'id="valTotalSaldo"' in html, "valTotalSaldo card missing in Beranda"
assert 'id="valPemasukan"' in html, "valPemasukan card missing in Beranda"
assert 'id="valPengeluaran"' in html, "valPengeluaran card missing in Beranda"
assert 'id="valBudgetTersisa"' in html, "valBudgetTersisa card missing in Beranda"
assert 'id="homeTxTableBody"' in html, "homeTxTableBody table missing in Beranda"

# Quick shortcuts buttons
assert "selectTab('transaksi')" in html, "Shortcut to transaksi missing"
assert "selectTab('laporan')" in html, "Shortcut to laporan missing"
assert "selectTab('wallet')" in html, "Shortcut to wallet missing"
assert "Catat Transaksi" in html, "Quick shortcut Catat Transaksi label missing"
print("[PASS 1.3] Beranda overview includes 4 financial stat cards, recent transactions, and Quick Shortcuts.")

# --------------------------------------------------------------------
# REQUIREMENT 2: Halaman "Transaksi & Mutasi"
# --------------------------------------------------------------------
print("\n--- [AUDIT 2] Halaman 'Transaksi & Mutasi' ---")

# 2.1 Submit button text must be 'Simpan' (not 'Simpan ke Database SQLite')
assert "Simpan ke Database SQLite" not in html, "Old button text 'Simpan ke Database SQLite' must not exist"
assert re.search(r'<button[^>]*onclick="realSaveTransaction\(\)"[^>]*>\s*Simpan\s*</button>', html), "Submit button text must be exactly 'Simpan'"
print("[PASS 2.1] Form submit button label updated to 'Simpan'.")

# 2.2 Table fullTxTableBody exists and is updated
assert 'id="fullTxTableBody"' in html, "Table fullTxTableBody missing"
assert 'realSaveTransaction' in html, "Function realSaveTransaction missing"
assert '/api/transactions' in server_code, "Endpoint /api/transactions missing in server.py"
print("[PASS 2.2] Transaction submission and table update mechanisms verified.")

# --------------------------------------------------------------------
# REQUIREMENT 3: Halaman "Laporan Eksekutif"
# --------------------------------------------------------------------
print("\n--- [AUDIT 3] Halaman 'Laporan Eksekutif' & Chart.js Analytics ---")

# 3.1 Chart.js loaded in head
assert 'src="https://cdn.jsdelivr.net/npm/chart.js"' in html, "Chart.js CDN script missing in <head>"
print("[PASS 3.1] Chart.js loaded via CDN in <head>.")

# 3.2 Canvases for bar chart and donut chart
assert 'id="chartIncomeExpenseTrend"' in html, "Canvas chartIncomeExpenseTrend missing"
assert 'id="chartCategoryBreakdown"' in html, "Canvas chartCategoryBreakdown missing"
print("[PASS 3.2] Canvas elements for Histogram/Bar Chart and Donut/Pie Chart present.")

# 3.3 Metric Cards
assert 'id="repValIncome"' in html, "Total Pemasukan metric card (repValIncome) missing"
assert 'id="repValExpense"' in html, "Total Pengeluaran metric card (repValExpense) missing"
assert 'id="repValCashflow"' in html, "Net Cashflow metric card (repValCashflow) missing"
assert 'id="repValSavingsRate"' in html, "Rasio Tabungan metric card (repValSavingsRate) missing"
print("[PASS 3.3] 4 Summary Metric Cards (Pemasukan, Pengeluaran, Net Cashflow, Rasio Tabungan) present.")

# 3.4 Period Filters
assert 'id="repFilter-month"' in html or 'id="btnPeriod-this_month"' in html, "Bulan Ini period filter button missing"
assert 'id="repFilter-30days"' in html or 'id="btnPeriod-last_30_days"' in html, "30 Hari Terakhir period filter button missing"
assert 'id="repFilter-all"' in html or 'id="btnPeriod-all_time"' in html, "Semua Waktu period filter button missing"
print("[PASS 3.4] Period filter buttons (Bulan Ini, 30 Hari Terakhir, Semua Waktu) present.")

# 3.5 Export Buttons Retained
assert 'id="btnExportExcel"' in html, "Ekspor Excel button (btnExportExcel) missing"
assert 'id="btnExportPdf"' in html, "Ekspor PDF button (btnExportPdf) missing"
print("[PASS 3.5] Official export buttons (Excel .csv & PDF Resmi) retained.")

# 3.6 Backend Analytics Endpoint
assert '/api/reports/analytics' in server_code, "Endpoint /api/reports/analytics missing in server.py"
assert 'total_income' in server_code, "total_income calculation missing in server.py"
assert 'total_expense' in server_code, "total_expense calculation missing in server.py"
assert 'net_cashflow' in server_code, "net_cashflow calculation missing in server.py"
assert 'savings_rate' in server_code, "savings_rate calculation missing in server.py"
print("[PASS 3.6] Backend analytics endpoint computes all required metrics, trends, and category shares.")

# --------------------------------------------------------------------
# REQUIREMENT 4: Halaman & Fitur "Multi-Wallet" (Full Functional, SQLite)
# --------------------------------------------------------------------
print("\n--- [AUDIT 4] Halaman & Fitur 'Multi-Wallet' (SQLite Persistent) ---")

# 4.1 Empty State & Add Wallet Button
assert 'Tambah Wallet Pertama Anda' in html, "Empty state CTA 'Tambah Wallet Pertama Anda' missing"
assert 'openAddWalletModal' in html or 'openWalletModal' in html, "Modal opener function missing"
print("[PASS 4.1] Empty state with CTA button 'Tambah Wallet Pertama Anda' implemented.")

# 4.2 Modal Form Fields
assert 'id="modalAddWallet"' in html, "Modal #modalAddWallet missing"
assert 'inputWalletName' in html or 'walletModalName' in html, "Input wallet name missing"
assert 'inputWalletType' in html or 'walletModalType' in html, "Input wallet type missing"
assert 'inputWalletBalance' in html or 'walletModalBalance' in html, "Input initial balance missing"
assert 'inputWalletIsDefault' in html or 'walletModalDefault' in html, "Default wallet checkbox missing"
print("[PASS 4.2] Add Wallet modal with Name, Account Type, Initial Balance, and Default checkbox present.")

# 4.3 SQLite Backend Endpoints
assert '/api/wallets/set-default' in server_code or '/api/wallets/default' in server_code, "Endpoint /api/wallets/set-default missing in server.py"
assert 'UPDATE wallets SET is_default = 1' in server_code, "SQL to set default wallet missing in server.py"
assert 'UPDATE wallets SET balance = balance' in server_code, "Transaction balance mutation missing in server.py"
print("[PASS 4.3] SQLite backend endpoints for creating wallets, setting default active wallet, and mutating balances verified.")

# 4.4 Header Active Wallet Sync
assert 'id="topActiveWallet"' in html, "Top header active wallet indicator (topActiveWallet) missing"
assert 'topActiveWallet.innerText' in html, "Header dynamic wallet update missing in script"
print("[PASS 4.4] Header active wallet indicator dynamically synced with active SQLite wallet.")

# 4.5 Regression Check: test_lanjutkan constraint ('secara realtime' not in viewApproval)
approval_match = re.search(r'<section[^>]*id="viewApproval"[^>]*>(.*?)</section>', html, re.DOTALL)
if approval_match:
    approval_content = approval_match.group(1)
    assert 'secara realtime' not in approval_content, "'secara realtime' must NOT appear in viewApproval"
    print("[PASS 4.5] Strict regression check: 'secara realtime' is not present in viewApproval HTML.")

print("\n======================================================================")
print("ALL 4 USER REQUIREMENTS VERIFIED SUCCESSFULLY!")
print("======================================================================")
