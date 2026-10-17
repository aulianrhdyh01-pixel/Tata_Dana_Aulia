# Scope: TataDana Prime Executive Wealth OS Feature Updates

## Architecture
- Frontend: Single Page Application (vanilla HTML/JS/Tailwind CSS in index.html / tatadana_widget.html or Next.js/React if configured)
- Backend: Python/Flask or Node/Express or FastAPI server (e.g. server.py) running on localhost:3000
- Database: SQLite database (tatadana.db) with persistent tables (`users`, `wallets`, `transactions`, etc.)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Navigasi & Menu "Beranda" | Item "Beranda" di bagian paling atas navigasi sidebar di atas "Transaksi & Mutasi", ringkasan finansial (total saldo gabungan, ringkasan pengeluaran/pemasukan bulanan, quick shortcut) | M1-M5 | ORIGINAL_REQUEST §1 |
| 2 | Halaman "Transaksi & Mutasi" | Label tombol submit dari "Simpan ke Database SQLite" menjadi "Simpan", penyimpanan transaksi ke SQLite tetap berfungsi dan otomatis memperbarui tabel transaksi | M1-M5 | ORIGINAL_REQUEST §2 |
| 3 | Halaman "Laporan Eksekutif" | Visualisasi analitik transaksi: Histogram/Bar chart tren pemasukan vs pengeluaran, Donut/Pie chart kategori pengeluaran, Kartu metrik (Pemasukan, Pengeluaran, Net Cashflow, Rasio Tabungan), Filter periode (Bulan Ini, 30 Hari Terakhir, Semua Waktu), dan tombol ekspor CSV & PDF | M1-M5 | ORIGINAL_REQUEST §3 |
| 4 | Halaman & Fitur "Multi-Wallet" | Manajemen wallet dinamis & persisten di database: default state kosong (empty state) "Tambah Wallet Pertama Anda", Modal "Tambah Wallet Baru" (Nama, Jenis Akun, Saldo Awal), sinkronisasi dropdown transaksi, tombol aktifkan wallet sinkron header, transaksi memotong/menambah saldo kartu wallet terkait | M1-M5 | ORIGINAL_REQUEST §4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Survey & Architecture Mapping | Inspect frontend, backend, SQLite schema, current wallet/transaction/report code | none | DONE |
| 2 | Feature Implementation | Implement requirements 1, 2, 3, 4 across frontend & backend | M1 | DONE |
| 3 | Code & UX Review | Comprehensive verification of code quality, UI elegance, dark mode styling | M2 | DONE |
| 4 | Adversarial E2E Verification | Test live functionality on localhost:3000, API calls, wallet balance mutations, chart rendering | M3 | DONE |
| 5 | Forensic Integrity Audit | Verify no dummy/mock data, real SQLite persistence, no integrity violations | M4 | DONE |

## Interface Contracts
- `wallets` table in SQLite: id, user_id, name, type (Bank, E-Wallet, Tunai), balance, is_default/is_active, created_at
- `transactions` table in SQLite: id, user_id, wallet_id, type (income, expense), amount, category, description, date
- API endpoints:
  - `GET /api/wallets` -> list user wallets
  - `POST /api/wallets` -> create new wallet with initial balance
  - `POST /api/wallets/:id/set-active` -> set default/active wallet
  - `POST /api/transactions` -> record transaction & update wallet balance
  - `GET /api/analytics` or client-side calculation for Laporan Eksekutif charts
