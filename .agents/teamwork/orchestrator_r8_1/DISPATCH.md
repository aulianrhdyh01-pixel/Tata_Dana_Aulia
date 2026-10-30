# Dispatch Log

## 2026-10-30T13:41:25Z

jalankan oleh 5 agen. Bangun dan perbarui aplikasi TataDana, SaaS manajemen keuangan pribadi Indonesia yang terintegrasi penuh dengan Telegram Bot dan Supabase, di mana setiap fitur berfungsi end-to-end dengan tema visual orange-putih modern.

Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Integrity mode: development

## Requirements

### R1. Landing Page & Visual Identity
- Landing page modern bertema orange-putih bersih (bukan dark theme) dengan font geometris (Inter atau Plus Jakarta Sans), sticky navbar, logo TataDana, pre-headline badge, headline problem-aware ("Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu ke mana uangmu pergi." dengan aksen gradient orange), hero placeholder video, CTA buttons, problem vs solution section, interactive dashboard preview & Telegram chat reply simulator, 3 blok fitur alternating, masonry testimonial grid (placeholder), pricing toggle (Starter vs Pro), minimal 7 FAQ, final CTA gradient orange, dan footer 4 kolom.
- Hapus tombol/link "Masuk Admin" dari tampilan publik / navbar landing page. Akses admin dan pengguna biasa menggunakan satu form login terpadu.

### R2. Database Schema, Auth & Admin Verification Gate
- Skema database Supabase lengkap di `supabase/migrations` (users, wallets, categories, transactions, transaction_items, budgets, reminders, subscriptions, ai_logs, audit_logs, webhook_events) dengan Row Level Security (RLS) dan penanganan timestamp zona waktu WIB (Asia/Jakarta).
- Form registrasi mengumpulkan Nama, Email, Nomor HP, dan Password.
- Setiap pengguna baru yang mendaftar berada dalam status pending approval dan wajib diverifikasi/disetujui oleh admin sebelum dapat mengakses user dashboard. Tampilkan layar instruksi kontak verifikasi admin ke nomor WhatsApp 082115624408.
- Akses Admin khusus menggunakan email `akunadminaul16@gmail.com` dan password `akuadmin123`. Selain kombinasi email dan password tersebut hanya diperlakukan sebagai user biasa.

### R3. Integrasi Telegram Bot (Multi-Modal & Idempotent)
- 1 Bot Telegram bersama yang terhubung via endpoint webhook publik (`/api/telegram/webhook`) dengan verifikasi token fungsional (`getMe` dan `setWebhook`) pada tab Settings.
- Idempotency check ketat menggunakan `update_id` Telegram untuk mencegah pencatatan transaksi ganda akibat retry Telegram API.
- Multi-modal transaction input:
  - Teks: Parsing LLM structured output/function calling menghasilkan `{jenis, nominal, kategori, catatan}` dengan penanganan eksplisit format nominal Indonesia ("15rb", "1.5jt", "500k").
  - Foto Struk (Pro): AI Vision OCR mengekstrak merchant, tanggal, serta multi-item transaksi.
  - Voice Note: Transkripsi speech-to-text (durasi maksimal 60 detik) lalu diproses ke pipeline parsing LLM, menampilkan baris hasil transkrip (`🎙️ Transkrip: "[hasil transkrip]"`) pada balasan bot.
- Format balasan bot terstandarisasi untuk pemasukan dan pengeluaran (progress bar visual budget `█░`, sisa saldo wallet default, kata motivasi).
- Commands: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`.
- Reminder harian terjadwal (maksimal 2x/hari) dan AI Financial Advisor otomatis untuk pengguna Pro saat terjadi lonjakan pengeluaran (>50% vs minggu lalu, >80% total pemasukan, atau >20% budget kategori).
- Pembatasan paket Starter (maksimal 50 transaksi/bulan, tolak foto struk dan AI advisor dengan pesan CTA upgrade).

### R4. User Dashboard & Profil
- Overview Dashboard responsif (375px hingga 1280px) dengan 4 stats cards, pie chart kategori, bar chart 6 bulan, trend line harian, list 10 transaksi terbaru, filter periode dinamis, dan onboarding checklist.
- Manajemen Multi-Wallet dengan wallet default dan transfer antar-dompet.
- Kategori kustom (emoji & warna) dan alokasi budget bulanan dengan visual progress bar.
- Laporan transaksi in-app lengkap dengan pagination, sorting, search, filter multi-dimensi, detail ekspansi multi-item struk, serta export on-demand ke PDF dan Excel (.xlsx) via Supabase Storage dengan signed URL.
- Manajemen Profil: menampilkan foto profil pengguna serta fitur fungsional untuk mengunggah dan mengganti foto profil.
- Tab Settings: Profil, Telegram Bot (panduan BotFather, status 🟢/🔴, tombol Test Koneksi), Reminder, dan Kategori.

### R5. Admin Dashboard & AI Multi-Provider
- Akses Superadmin mandiri dengan fitur Impersonation (masuk ke tampilan user tanpa login ulang).
- Manajemen approval pengguna baru: daftar user pending dengan tombol Approve/Reject untuk mengaktifkan akses ke user dashboard.
- Konfigurasi Multi-Provider AI (Gemini, OpenAI, DeepSeek) dengan pilihan mode Single atau Paralel (failover) serta penyimpanan API key terenkripsi.
- Monitoring AI usage logs, audit trail akses data transaksi user, dan persetujuan/penolakan manual pembayaran Midtrans.

### R6. Subscription & Payment
- Paket Starter (Rp49.000/bln) dan Paket Pro (Rp99.000 sekali bayar) dengan penegakan batasan fitur yang ketat.
- Integrasi Midtrans untuk pembayaran otomatis serta dukungan pembayaran transfer manual dengan approval dari admin dashboard.

## Acceptance Criteria

### Security, Auth & User Verification Gate
- [ ] Pengguna baru dapat mendaftar dengan field Nama, Email, Nomor HP, dan Password.
- [ ] Pengguna baru setelah mendaftar tidak dapat langsung mengakses dashboard pengguna sebelum disetujui (approved) oleh Admin; halaman antarmuka menampilkan instruksi verifikasi ke admin via WhatsApp 082115624408.
- [ ] Login menggunakan `akunadminaul16@gmail.com` dan password `akuadmin123` berhasil masuk langsung ke Admin Dashboard. Kredensial lain tidak dapat mengakses Admin Dashboard.
- [ ] Tombol/link "Masuk Admin" ditiadakan dari navbar / landing page publik.
- [ ] Profil pengguna menampilkan foto profil dan pengguna dapat mengunggah/mengganti foto profil dengan hasil perubahan tersimpan persisten.

### Telegram Bot & Multi-Modal Transactions
- [ ] Endpoint webhook Telegram merespons update webhook secara idempotent (request duplikat dengan `update_id` sama tidak menghasilkan transaksi ganda).
- [ ] Parsing teks berhasil mengekstrak nominal bahasa Indonesia ("15rb", "1.5jt", "500k") menjadi angka yang tepat dan mencatat transaksi ke database.
- [ ] Pemrosesan voice note berhasil mentranskripsi dan mengurai data transaksi serta menyertakan baris transkrip pada balasan bot.
- [ ] Input foto struk pada akun Pro berhasil mengekstrak rincian item transaksi; akun Starter menerima pesan penolakan fitur Pro dengan CTA upgrade.
- [ ] Balasan Telegram bot menyertakan visual progress bar budget dan info saldo terupdate dalam zona waktu WIB.

### Web Dashboard, Reports & Admin Capabilities
- [ ] Tampilan antarmuka konsisten menggunakan palet warna orange-putih modern di seluruh halaman web.
- [ ] Dashboard menyajikan 4 stats cards, grafik visual, daftar transaksi, filter periode, multi-wallet, dan budget bulanan.
- [ ] Laporan in-app dapat difilter, disortir, dan diexport ke PDF serta Excel (.xlsx) dengan signed URL yang valid.
- [ ] Admin Dashboard dapat menyetujui (approve) pengguna baru yang tertahan di status pending, sehingga pengguna tersebut dapat login dan masuk ke dashboard.
- [ ] Admin dapat mengonfigurasi provider AI (Gemini, OpenAI, DeepSeek) dan beralih antara mode single dan paralel (failover).

## Verification Resources
- Test suite yang ada di proyek (`tests/`, `test_run_all.py`, dll.) serta penambahan skrip pengujian baru untuk memverifikasi alur registrasi berstatus pending approval, verifikasi admin WhatsApp, otentikasi admin `akunadminaul16@gmail.com`, dan penggantian foto profil.

## 2026-10-30T13:50:15Z

User instruction received: "jalankan di local host" - Pastikan aplikasi backend/frontend TataDana dijalankan di localhost sehingga user dapat langsung mengakses dan mengujinya melalui browser di localhost. Recorded to ORIGINAL_REQUEST.md. Please ensure your workers verify server operational status on localhost (e.g. port 3000) as part of delivery.
