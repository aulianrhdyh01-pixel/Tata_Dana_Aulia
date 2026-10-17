# TataDana — Platform Manajemen Keuangan Pribadi Indonesia

> **Catat keuangan semudah chat — langsung dari Telegram kamu**

Aplikasi SaaS fintech Indonesia berbasis integrasi Telegram Bot, multi-modal AI (Teks "15rb", Foto Struk OCR, Voice Note STT), Multi-Wallet, Budget Bulanan dengan visual progress bar (`█░`), Laporan & Export in-app (PDF & Excel .xlsx), serta Superadmin Command Center dengan Multi-Provider AI (Gemini, OpenAI, DeepSeek) dan Midtrans payment gateway.

---

## 🚀 Cara Menjalankan di Localhost

Seluruh kode sumber dan aset aplikasi telah siap di direktori:
```
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
```

### Opsi 1: Menjalankan Langsung via Python (Siap Pakai, Zero-Dependency)
Karena Python 3.14 sudah terpasang di sistem Anda, Anda dapat langsung menjalankan server dengan satu perintah:

```powershell
cd "C:\Users\ASUS\.gemini\antigravity\scratch\tatadana"
python scripts/server.py
```

Setelah dijalankan, buka browser di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Opsi 2: Menjalankan via Node.js / Next.js
Jika Anda ingin menjalankan server via Node.js / Next.js:

1. Pastikan Node.js terpasang (dapat diinstall via `winget install OpenJS.NodeJS.LTS`).
2. Jalankan perintah instalasi dan start:
```powershell
cd "C:\Users\ASUS\.gemini\antigravity\scratch\tatadana"
npm install
npm run dev
```

Atau menjalankan server standalone Node.js:
```powershell
node scripts/server.js
```

---

## 🧭 Daftar Halaman & Fitur Localhost

| Rute / URL | Halaman | Deskripsi Fitur |
|---|---|---|
| **`http://localhost:3000/`** | 🏠 **Landing Page** | Tampilan fintech modern (Tema Orange + Putih #ffffff, #f8fafc, #f97316), Problem awareness, Simulator chat Telegram live, Pricing switch (Starter Rp49k/bln vs Pro Rp99k sekali bayar), FAQ komprehensif. |
| **`http://localhost:3000/login`** | 🔑 **Login & Auth** | Halaman masuk dengan verifikasi nomor HP (OTP) & 1-Click Sandbox Demo Access. |
| **`http://localhost:3000/dashboard`** | 📊 **User Overview** | 4 Stats Cards (Saldo Total, Pemasukan, Pengeluaran, Sisa Budget), AI Financial Advisor banner, tabel 10 transaksi terbaru real-time WIB. |
| **`http://localhost:3000/dashboard/wallets`** | 👛 **Multi-Wallet** | Manajemen dompet (GoPay default Telegram, Rekening Bank BCA, Mandiri, Cash, OVO) & fitur transfer saldo antar-wallet. |
| **`http://localhost:3000/dashboard/budgets`** | 🎯 **Budget Bulanan** | Pengaturan batas belanja per kategori dengan progress bar visual `████████░░` dan simulasi alert 80% & 100%. |
| **`http://localhost:3000/dashboard/reports`** | 📑 **Laporan & Export** | Filter transaksi multi-kriteria, ekspansi rincian struk OCR, serta unduh langsung file **PDF** dan **Excel (.xlsx)**. |
| **`http://localhost:3000/dashboard/settings`** | ⚙️ **Pengaturan & Bot** | Setup token bot @BotFather, tombol fungsional **Test Koneksi** (getMe & setWebhook), serta jadwal reminder 2x/hari. |
| **`http://localhost:3000/admin`** | 🛡️ **Superadmin Panel** | Metrik MRR, konfigurasi Multi-Provider AI (Gemini, OpenAI, DeepSeek failover), log token, audit log privasi (UU PDP), dan approval manual Midtrans. |

---

## 📡 Endpoint API & Integrasi Telegram

- **GET `/api/telegram/test`**: Diagnostik status koneksi bot, status webhook, dan modul AI parsing.
- **POST `/api/telegram/webhook`**: Endpoint penerima update Telegram dengan **Idempotency Check** (`update_id`) untuk mencegah pencatatan transaksi ganda akibat network retry.
- **GET `/api/export/pdf`**: Unduh langsung file PDF laporan keuangan bulanan.
- **GET `/api/export/excel`**: Unduh langsung file spreadsheet (.csv/.xlsx) laporan transaksi.

---

## 📁 Struktur Direktori Proyek

```
tatadana/
├── app/                        # Next.js 14 App Router (Layouts & Pages)
│   ├── dashboard/              # Halaman User Dashboard (wallets, budgets, reports, settings)
│   ├── admin/                  # Halaman Superadmin Command Center
│   ├── api/                    # API Route Handlers (telegram webhook, export, auth)
│   └── globals.css             # Tema Gelap Fintech & Styling Tokens
├── components/                 # UI Components (Charts, Simulator, Navbar, Cards)
├── lib/                        # Business Logic & Integrations
│   ├── telegram/               # Webhook Idempotency, Parser Nominal Indonesia, Formatter
│   ├── ai/                     # Multi-Provider AI Engine (Gemini, OpenAI, DeepSeek failover)
│   ├── export/                 # PDF & Excel Exporter Engines
│   └── midtrans/               # Midtrans Client & Payment Webhooks
├── scripts/                    # Runtime Servers & Verification Suites
│   ├── server.py               # Standalone Python Localhost Server (Siap jalan instan)
│   ├── server.js               # Standalone Node.js Localhost Server
│   └── verify-all.js           # Comprehensive E2E Verification Suite
├── supabase/migrations/        # 11 Tabel Database Supabase, RLS, & WIB Timezone
├── .env.example                # Panduan Environment Variables Lengkap
├── .env.local                  # Konfigurasi Lokal
└── package.json                # Project Dependencies & Scripts
```
