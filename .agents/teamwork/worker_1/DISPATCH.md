# Dispatch for worker_1

Role: Full-Stack Implementation Worker
Working Directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_1
Authoritative Requirements: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Explorer Blueprint: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_1\handoff.md
Project Root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objectives & Tasks
Implement all 4 user requirements across `server.py` and `index.html`:

1. **Navigasi & Menu "Beranda" (Sidebar)**:
   - Make `dNav-beranda` visible at the very top of the desktop sidebar (above `dNav-transaksi`), styled with home icon (`🏠`) and active state classes.
   - In `dTab-beranda`, add an interactive 4-card Quick Shortcuts section (Catat Transaksi, Laporan Eksekutif, Multi-Wallet, Pengaturan) that switches tabs smoothly.
   - Maintain the overview of total combined balance, monthly income/expense summary, and recent transaction history.

2. **Halaman "Transaksi & Mutasi"**:
   - In form "Catat Transaksi Riil Baru", change the submit button label from "Simpan ke Database SQLite" to "Simpan".
   - Keep the transaction save function to SQLite and automatic update of "Daftar Transaksi Lengkap" (`#fullTxTableBody`) 100% operational.

3. **Halaman "Laporan Eksekutif"**:
   - Load Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js`).
   - Overhaul `dTab-laporan` with:
     a. Histogram / Bar Chart: Monthly / weekly income vs expense trend.
     b. Donut / Pie Chart: Expense composition by category.
     c. Summary Metric Cards: Total Pemasukan, Total Pengeluaran, Net Cashflow, Rasio Tabungan.
     d. Period Filter: "Bulan Ini", "30 Hari Terakhir", "Semua Waktu" with instant reactive updates.
     e. Retain "Ekspor Excel (.csv)" and "Ekspor PDF Resmi" buttons at top right.

4. **Halaman & Fitur "Multi-Wallet" (Full Functional, SQLite Persistent)**:
   - Backend `server.py`:
     - Add endpoint `POST /api/wallets/set-default` (or `/api/wallets/default`) to update `is_default = 1` for the selected wallet and `0` for others in SQLite.
     - In `POST /api/wallets`, auto-assign `is_default = 1` if it's the user's first wallet.
   - Frontend `index.html`:
     a. When user has no wallets, render clean empty-state card with CTA button "Tambah Wallet Pertama Anda".
     b. Modal / Form "Tambah Wallet Baru" with inputs:
        - Nama Dompet (e.g. BCA Utama, Mandiri, GoPay)
        - Jenis Akun (Bank, E-Wallet, Tunai)
        - Saldo Awal (Rp)
        - Checkbox "Jadikan Dompet Aktif"
        - Save button directly calling `POST /api/wallets` and updating UI without reload.
     c. Full real-time integration:
        - Populate "Pilih Dompet" dropdown in transaction form (`#formTxWallet`).
        - Allow user to click "Jadikan Aktif" on any wallet card, updating SQLite and immediately syncing "Dompet Aktif" in the top header (`#topActiveWallet`).
        - Transactions directly mutate wallet balance in SQLite and reflect on the wallet cards.

## Verification Requirements
- Worker MUST run tests and verify server operation on localhost:3000.
- Execute existing test suite (e.g., `python test_admin_desk.py`, `python test_lanjutkan.py`, `python test_api.py`) and write automated test scripts if needed to verify all 4 requirements.
- Document all modified files, lines, commands run, and test outputs in `handoff.md`.


## 2026-10-17T11:38:57Z
You are worker_1 (Full-Stack Worker) for TataDana Prime.

Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_1
Authoritative requirements: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Explorer Blueprint: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_1\handoff.md
Dispatch record: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_1\DISPATCH.md
Project root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Implement all 4 user requirements across `server.py` and `index.html` per the Explorer handoff report:
1. Navigasi & Menu "Beranda" (Sidebar)
2. Halaman "Transaksi & Mutasi"
3. Halaman "Laporan Eksekutif"
4. Halaman & Fitur "Multi-Wallet" (Full Functional, Bukan Dummy)
