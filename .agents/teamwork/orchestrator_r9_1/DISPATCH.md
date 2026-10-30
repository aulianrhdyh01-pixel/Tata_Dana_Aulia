# Dispatch Messages

## 2026-10-30T16:10:51Z

Sender: b124fdb4-5496-4025-add1-979a2242bf7c
Priority: MESSAGE_PRIORITY_HIGH

Jalankan oleh 5 agen. Reset dan bersihkan semua data tiruan pada aplikasi TataDana untuk keperluan produksi sehingga kondisi awal benar-benar kosong kecuali akun superadmin, pastikan dashboard user dan admin menampilkan data riil berbasis user login dan SQLite, serta perbaiki fungsionalitas tombol approval admin dan autentikasi login.

Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Integrity mode: development

Konteks Proyek TataDana:
- Lokasi proyek: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
- Kredensial Superadmin: akunadminaul16@gmail.com / akuadmin123 (tetap dipertahankan sebagai superadmin tunggal dengan role admin saat reset)
- Nomor WhatsApp Admin: 082115624408
- Database: SQLite (tatadana.db) & skema Supabase migrations
- File inti: server.py, index.html, tatadana.db, run_localhost.bat
- Server berjalan di port 3000 localhost

## Requirements

### R1. Reset dan Pembersihan Data Tiruan (Seed/Mock Data)
Reset dan bersihkan seluruh data dummy/mock/seed pada aplikasi TataDana sehingga kondisi awal database benar-benar kosong (0 pengguna reguler, 0 pendaftar, 0 transaksi). Akun superadmin tunggal dengan email `akunadminaul16@gmail.com` dan password `akuadmin123` (role `admin`) wajib tetap dipertahankan.

### R2. Isolasi dan Filter Data pada Dashboard User
Data saldo, ringkasan (summary), dan daftar transaksi pada Dashboard User harus difilter secara ketat berdasarkan pengguna yang sedang login (`WHERE user_id = current_user.id`), sehingga pengguna yang baru dibuat / terdaftar memiliki saldo awal Rp 0 dan riwayat transaksi 0.

### R3. Penghitungan Dinamis Statistik Dashboard Admin
Metrik 'Total Pengguna' dan 'Menunggu Persetujuan' pada Dashboard Admin wajib dihitung secara dinamis dan riil dari baris database SQLite menggunakan query agregasi (`COUNT(*)`), bukan menggunakan angka statis / hardcode.

### R4. Penanganan Interaksi Tombol Approval Admin
Tombol Approve pada antrean pendaftar Admin harus langsung beralih ke status `disabled` saat diklik satu kali untuk mencegah pengiriman klik berulang (race condition), melakukan pemanggilan API backend, dan langsung menghapus baris pendaftar dari antrean antarmuka saat respons status 200 OK diterima.

### R5. Persistensi Database SQLite pada Endpoint Approval
Endpoint approval pada backend SQLite harus memanggil `conn.commit()` agar pembaruan status pendaftar menjadi `'active'` tersimpan secara persisten ke database SQLite.

### R6. Logika Autentikasi dan Login
Fungsi login harus mengizinkan pengguna dengan status `'active'` untuk berhasil masuk, serta memvalidasi kesesuaian email dan hash password dengan benar tanpa memicu error penolakan status.

## Verification Resources
Tim wajib membuat skrip pengujian otomatis (misalnya skrip Python mandiri) yang memverifikasi:
- Kondisi database setelah reset (hanya ada superadmin, 0 pendaftar, 0 pengguna lain, 0 transaksi).
- Eksekusi alur approval pendaftar menghasilkan status `'active'` yang persisten di SQLite (`conn.commit()`).
- Pengguna yang baru di-approve dapat berhasil login dengan kredensial yang valid.
- Dashboard user hanya menampilkan data milik user tersebut (saldo Rp 0 untuk akun baru).
- Endpoint metrik admin menghasilkan nilai `COUNT(*)` SQLite yang sesuai kondisi riil.

## Acceptance Criteria

### Data Reset & Initial State
- [ ] Database SQLite (`tatadana.db`) bersih dari data dummy: memiliki tepat 0 pengguna reguler, 0 pendaftar antrean, dan 0 transaksi.
- [ ] Akun superadmin `akunadminaul16@gmail.com` dengan role `admin` tetap tersimpan dan dapat login.

### Dashboard Filtering
- [ ] Endpoint / query data transaksi dan saldo pada Dashboard User secara ketat memfilter berdasarkan ID pengguna yang sedang login (`WHERE user_id = current_user.id`).
- [ ] Pengguna baru yang login melihat saldo bernilai Rp 0 dan daftar riwayat transaksi kosong (0 transaksi).
- [ ] Data milik pengguna lain tidak bocor ke dashboard pengguna yang sedang login.

### Admin Dashboard Real-Time Counts
- [ ] Nilai 'Total Pengguna' dihitung melalui query `COUNT(*)` pada tabel pengguna SQLite yang relevan.
- [ ] Nilai 'Menunggu Persetujuan' dihitung melalui query `COUNT(*)` pada pendaftar berstatus pending di SQLite.
- [ ] Tidak ada angka statis hardcode yang menggantikan hasil query agregasi database.

### Approval Button & Backend Persistence
- [ ] Tombol Approve dinonaktifkan (`disabled`) seketika saat pertama kali diklik.
- [ ] Baris pendaftar yang disetujui terhapus dari antarmuka antrean setelah menerima respons HTTP 200 OK.
- [ ] Pemanggilan endpoint approval mengeksekusi `conn.commit()` pada koneksi SQLite sehingga record tersimpan dengan status `'active'`.

### Authentication & Login Flow
- [ ] Akun berstatus `'active'` dapat login dengan sukses saat email dan password hash valid.
- [ ] Validasi login tidak melempar error penolakan status untuk akun `'active'`.

### Automated Verification
- [ ] Skrip verifikasi otomatis berhasil dijalankan dan semua asersi pengujian (database state, approval commit, login, filtering dashboard) lulus (exit code 0).
