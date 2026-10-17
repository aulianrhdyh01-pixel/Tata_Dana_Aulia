# Dispatch Instructions

## 2026-10-17T09:35:51Z
From: 0485a09f-913c-401d-adbb-fec814c57386 (Parent Sentinel)
Working Directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_r4_1
Project Root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Authoritative Requirements: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md

User Request:
"Kerjakan dengan 5 agen: Implementasi dan pengujian sistem TataDana Prime di localhost:3000 dengan basis data persisten SQLite (tatadana.db), autentikasi Superadmin shopnoure1619@gmail.com / tugasbisnis16, dan layar verifikasi OTP yang telah diubah ke warna biru (cyan & electric blue) senada dengan tampilan lainnya, dilengkapi modul SMTP email realtime dan live helper display, tanpa mengubah elemen antarmuka lainnya yang tidak diminta."

Integrity mode: development

Requirements:
R1. Operasional Server Localhost & Akses SPA:
- Server backend berjalan aktif di http://localhost:3000.
- Semua rute halaman: /, /dashboard, /admin (dan /superadmin), /login, /approval, serta /settings dapat diakses langsung tanpa galat 404.

R2. Otorisasi Role Admin vs User:
- Halaman /login memiliki auto-fill kredensial Superadmin: Email: shopnoure1619@gmail.com, Password: tugasbisnis16
- Role akun: SUPERADMIN dengan paket langganan: PRO VIP.
- Tombol Quick Login "Masuk sebagai Superadmin" berfungsi login instan dan mengarahkan ke /admin.
- Proteksi Rute: Hanya role Superadmin/Admin yang dapat mengakses /admin; user biasa dialihkan ke /dashboard.

R3. Fitur Akun PRO VIP (Ekspor Laporan Aktif):
- Akun PRO VIP memiliki akses penuh ke fitur Ekspor PDF Resmi dan Ekspor Excel (.csv) pada menu Mutasi & Laporan (tombol tidak terkunci).

R4. Manajemen Foto Profil di /settings:
- Pengguna dapat mengganti foto profil melalui unggah gambar lokal (Data URL) atau 4 pilihan preset avatar.
- Foto profil tersimpan permanen di SQLite (users.avatar_url) dan tersinkronisasi di sidebar.

R5. Alur Registrasi User Baru & Approval Gate:
- Pendaftaran pengguna baru tersimpan dengan is_approved = 0 dan dialihkan ke rute /approval.

R6. Layar Verifikasi OTP Bertema Biru (Harmonisasi Desain):
- Layar /approval mengadopsi skema warna biru elektrik & cyan senada dengan tampilan TataDana lainnya:
  * Logo: Tata (putih) dan Dana (cyan-400).
  * Input OTP 6-digit dengan border biru (border-2 border-blue-500 text-cyan-300).
  * Live OTP Helper menampilkan kode OTP aktif dengan tombol 'Isi Cepat'.
  * Tombol utama 'Lanjutkan' dengan gradien biru-cyan TataDana.
- Backend server.py memuat fungsi send_real_smtp_email untuk pengiriman email SMTP riil.
- Verifikasi OTP valid mengubah status akun menjadi is_approved = 1 dan membuka dashboard.

R7. Database Webhook Telegram Persisten:
- Transaksi dari webhook Telegram (/api/telegram/webhook) tersimpan permanen di SQLite dan memutasi saldo dompet riil.

Acceptance Criteria:
- Server localhost:3000 aktif dan merespons semua rute.
- Login Superadmin dengan shopnoure1619@gmail.com / tugasbisnis16 sukses.
- Tampilan verifikasi OTP berwarna biru elektrik & cyan senada antarmuka TataDana.
- Input OTP dan tombol 'Lanjutkan' memverifikasi akun di SQLite.
- Tidak ada elemen antarmuka lain yang diubah tanpa perintah pengguna.

## 2026-10-17T09:53:49Z
From: 0485a09f-913c-401d-adbb-fec814c57386 (Parent Sentinel)
Subject: User Update / Requirement Specification Update
1. Kalimat "secara realtime" telah dihapus dari seluruh tampilan (halaman verifikasi /approval dan widget).
2. Tombol "Lanjutkan" kini langsung memverifikasi akun pengguna dan segera mengalihkan ke menu dashboard user (/dashboard), mengaktifkan status is_approved = 1, inisialisasi dompet, memuat saldo riil, dan menerapkan profil pengguna ke antarmuka.
3. Seluruh pengujian otomatis di test_lanjutkan.py lolos dengan exit code 0.

Pastikan worker, test writer, challenger, dan auditor Anda memperhitungkan spesifikasi ini dalam verifikasi dan pengujian mereka.

