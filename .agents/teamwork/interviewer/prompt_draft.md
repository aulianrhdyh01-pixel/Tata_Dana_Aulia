Jalankan oleh 5 agen. Bangun fitur Floating AI Quick Record Bot di halaman dashboard user, integrasi Bot Telegram untuk pencatatan transaksi otomatis via AI, modifikasi manajemen pengguna di halaman admin, serta persiapkan seluruh proyek TataDana agar siap dibuka di VS Code, di-push ke GitHub, dan dideploy ke Vercel untuk kesiapan produksi dengan tampilan dan fitur yang konsisten.

Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Integrity mode: development

## Context & Credentials
- Lokasi proyek: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
- Kredensial Superadmin: akunadminaul16@gmail.com / akuadmin123 (status active, PRO VIP)
- Nomor WhatsApp Admin: 082115624408
- Telegram Bot Token: 8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ
- File inti: server.py, index.html, tatadana.db, tpl_landing.py, tpl_auth.py, tpl_dashboard.py, tpl_admin.py, tpl_script.py
- Server lokal berjalan di port 3000 localhost

## Requirements

### R1. Floating AI Quick Record Bot di Dashboard User (tpl_dashboard.py)
- UI Widget: Buat tombol widget chat melayang di pojok kanan bawah dashboard. Terdapat input teks ringkas agar pengguna bisa mengetik transaksi secara santai (misal: 'Bensin motor 25rb cash').
- AI Parsing: Buat endpoint /api/ai/parse-transaction yang menggunakan AI provider untuk mengekstrak teks menjadi JSON: {type, amount, category, wallet, description}.
- Database SQLite: Simpan hasil parsing tersebut langsung ke tabel transaksi dengan user_id akun yang sedang login, dan lakukan conn.commit().
- Auto Update: Tampilkan pesan balasan konfirmasi singkat dari bot dan refresh otomatis angka 'Total Saldo', 'Pengeluaran Bulan Ini', serta riwayat transaksi di dashboard.

### R2. Integrasi Bot Telegram untuk Pencatatan Transaksi Otomatis AI
- Database: Tambahkan kolom telegram_chat_id pada tabel users di database SQLite jika belum ada.
- Account Linking: Di halaman Settings web user, tambahkan kartu untuk menghubungkan akun Telegram dengan membuat pairing code (misal: /connect [8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ]).
- Telegram Handler: Buat listener bot Telegram yang menerima teks pesan keuangan pengguna, mem-parsing teks tersebut menjadi JSON {type, amount, category, wallet, description} lewat AI Gateway, lalu menyimpan hasilnya ke tabel transactions berdasarkan user_id pemilik akun.
- Respon: Kirim pesan balasan rapi berformat Markdown ke Telegram setelah transaksi berhasil tersimpan di database.

### R3. Modifikasi Manajemen Pengguna di Halaman Admin (tpl_admin.py)
- Data Pendaftaran Tetap Tampil: Semua pengguna yang mendaftar harus tetap tercatat dan terlihat di tabel daftar pengguna, baik yang berstatus 'pending' maupun yang sudah disetujui.
- Perilaku Tombol Approve: Saat tombol persetujuan diklik 1 kali, perbarui status pengguna di database SQLite menjadi 'active' (conn.commit()). Jangan hapus baris user dari tabel; ubah statusnya secara real-time menjadi badge hijau '✓ Approved' dan sembunyikan tombol approve tersebut.
- Tombol Hapus: Sediakan tombol 'Hapus' pada setiap baris user. Baris data pengguna HANYA boleh hilang dari tampilan jika tombol 'Hapus' ini dikonfirmasi dan diklik oleh admin.

### R4. Modularisasi File Template & Kesiapan Deployment Vercel & GitHub
- Modularisasi Template Antarmuka: Ekstrak komponen antarmuka dari index.html ke modul-modul template Python (tpl_landing.py, tpl_auth.py, tpl_dashboard.py, tpl_admin.py, tpl_script.py) sesuai spesifikasi.
- Struktur File Deployment Vercel: Buat file vercel.json dan file entry point serverless (misal api/index.py atau app.py) agar aplikasi backend Python beserta modul templatenya (index.html, tpl_landing.py, tpl_auth.py, tpl_dashboard.py, tpl_admin.py) dapat berjalan lancar di Vercel tanpa error 404 atau Server Error.
- Persistensi SQLite di Vercel: Sediakan penanganan database SQLite lokal dengan fallback ke /tmp/tatadana.db saat berjalan di Vercel agar operasi baca-tulis tidak gagal di environment serverless, sementara basis data lokal di repositori tetap berfungsi untuk localhost.
- Dependensi (requirements.txt): Buatkan file requirements.txt yang berisi semua pustaka Python yang dipakai proyek ini secara lengkap.
- File Pengaman (.gitignore): Buatkan file .gitignore standar agar file konfigurasi lokal (.env), cache Python (__pycache__), dan file virtual environment tidak ikut terunggah ke repositori GitHub.
- Aset Statis & Routing: Pastikan seluruh file CSS, layout orange-putih, font Plus Jakarta Sans, dan script frontend terbaca dengan benar melalui path absolut/relatif yang kompatibel dengan hosting Vercel.
- Panduan Singkat: Berikan panduan baris perintah Git sederhana yang harus dijalankan di terminal VS Code untuk menghubungkannya ke repositori GitHub.

## Verification Resources
- Gunakan dan kembangkan pengujian yang sudah ada di repositori: test_api.py, test_admin_desk.py, test_telegram_backend.py, dan verify_production_readiness.py untuk menguji fungsionalitas baru secara end-to-end.

## Acceptance Criteria

### Floating AI Quick Record Bot
- [ ] Tombol widget chat melayang tampil di pojok kanan bawah halaman dashboard user (tpl_dashboard.py).
- [ ] Input teks pada widget menerima teks natural transaksi dan mengirimkan request ke endpoint /api/ai/parse-transaction.
- [ ] Endpoint /api/ai/parse-transaction mengekstrak input menjadi JSON terstruktur {type, amount, category, wallet, description}.
- [ ] Hasil parsing tersimpan secara persisten ke tabel transaksi SQLite dengan user_id yang sesuai (conn.commit()).
- [ ] Widget chat menampilkan pesan konfirmasi bot, dan nilai Total Saldo, Pengeluaran Bulan Ini, serta riwayat transaksi di dashboard diperbarui secara otomatis tanpa reload halaman manual.

### Integrasi Bot Telegram
- [ ] Kolom telegram_chat_id ada dan terdefinisi di tabel users pada basis data SQLite.
- [ ] Kartu pairing akun Telegram tersedia di halaman Settings web user dan menghasilkan pairing code yang valid untuk verifikasi akun.
- [ ] Listener bot Telegram memproses pesan masuk dari pengguna terhubung, mem-parsing detail keuangan lewat AI Gateway, dan menyimpan transaksi ke tabel transactions akun terkait.
- [ ] Bot Telegram mengirimkan balasan konfirmasi berformat Markdown yang rapi kepada pengguna setelah data tersimpan.

### Manajemen Pengguna Admin
- [ ] Tabel pengguna di halaman admin (tpl_admin.py) menampilkan seluruh pengguna pendaftar baik yang berstatus 'pending' maupun 'active/approved'.
- [ ] Mengklik tombol persetujuan (Approve) 1 kali mengubah status pengguna menjadi 'active' di basis data SQLite (conn.commit()), mengubah tampilan baris secara real-time menjadi badge hijau '✓ Approved', menyembunyikan tombol approve, dan baris tidak terhapus.
- [ ] Tombol 'Hapus' tersedia di setiap baris pengguna dan hanya menghapus baris pengguna dari tabel dan basis data jika telah dikonfirmasi dan diklik oleh admin.

### Modularisasi, Vercel & GitHub Readiness
- [ ] File modul template Python (tpl_landing.py, tpl_auth.py, tpl_dashboard.py, tpl_admin.py, tpl_script.py) terbuat dan terintegrasi dengan backend.
- [ ] File vercel.json dan entry point serverless (api/index.py atau app.py) terkonfigurasi dengan benar sehingga rute dan template berjalan tanpa error 404 atau 500.
- [ ] Penanganan basis data SQLite berfungsi di Vercel (fallback /tmp/tatadana.db) serta berjalan normal pada localhost di port 3000.
- [ ] File requirements.txt mencakup seluruh dependensi Python yang dibutuhkan tanpa ada modul yang tertinggal.
- [ ] File .gitignore mengabaikan .env, __pycache__, dan virtual environment.
- [ ] Seluruh aset statis (CSS, layout orange-putih, font Plus Jakarta Sans, dan JavaScript) termuat dengan benar di lingkungan Vercel dan lokal.
- [ ] File dokumentasi panduan perintah Git untuk koneksi dan push ke repositori GitHub tersedia dengan jelas.
- [ ] Skrip pengujian otomatis (memperluas test_*.py dan verify_production_readiness.py) dijalankan dan lulus verifikasi.
