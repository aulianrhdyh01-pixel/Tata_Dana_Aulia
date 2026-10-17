# TataDana Prime Workspace Rules

## Aturan Preservasi Tampilan UI (UI Preservation Guardrail)
1. **Dilarang Mengubah Tampilan Tanpa Perintah**:
   - Jangan pernah mengubah tata letak (layout), skema warna (pitch black `#000000` dengan aksen electric blue, amber, dan emerald), struktur kartu, tipografi, susunan navigasi, atau styling Tailwind CSS yang sudah ada sebelumnya kecuali jika pengguna secara tegas dan eksplisit menginstruksikan perubahan tampilan tersebut.
2. **Fokus pada Backend & Logika Sistem**:
   - Setiap penambahan fitur baru, perbaikan bug, atau optimasi harus difokuskan pada backend logic (`server.py`), basis data SQLite (`tatadana.db`), atau integrasi API/webhook tanpa mengubah atau merusak desain visual antarmuka di `index.html`.
3. **Integritas Sistem Riil**:
   - Seluruh data transaksi, pengguna, dompet, dan approval harus selalu tersimpan secara persisten pada SQLite riil (`tatadana.db`) tanpa menggunakan data tiruan/dummy.

## Prinsip Eksekusi Sistem Riil & Fungsionalitas Penuh (No Dummy Policy)
1. **Zero Dummy System**:
   - Seluruh data wajib terhubung secara persisten ke database SQLite `tatadana.db` dan endpoint HTTP backend `server.py`.
   - Dilarang keras menggunakan data tiruan statis (*dummy/mock*) untuk transaksi, saldo, status pengguna, atau metrik sistem ("hapus sistem dummy jalankan sistem real").
2. **Fungsionalitas Penuh (Fully Operational End-to-End)**:
   - Setiap fitur, tombol, dan kontrol interaktif (termasuk tombol switch role Admin vs User, approval/reject, copy username bot, dan simulator) wajib memiliki implementasi logika aktif yang benar-benar dapat dijalankan ("implementasikan fungsionalitas penuh agar setiap fiturnya benar-benar bisa dijalankan").
   - Status persetujuan pengguna (approval) dan penolakan (reject) langsung tercatat di SQLite secara permanen dan merefleksikan perubahan nilai secara instan pada antarmuka.
3. **Enterprise Superadmin Desk (/admin)**:
   - Tata letak halaman Superadmin Desk mengadopsi spesifikasi Gambar Referensi 2: Header Enterprise Superadmin Desk dengan badge ROOT PRIVILEGE, 4 metrik teknis riil SQLite (Latency 444 ms, Estimasi Biaya $0.042/bln, Total Pengguna, Antrean Persetujuan), Toolbar Pengujian Role (Admin vs User biasa) dengan proteksi 403 Forbidden, dan Widget Status Bot Telegram Live di sidebar.

## Invarian Pemisahan Antarmuka & Hak Akses Berbasis Role (RBAC)
1. **Hak Akses & Tampilan Sesi Pengguna Biasa (role: 'user')**:
   - **Sembunyikan Menu Admin**: Elemen `Superadmin Desk` (`#dNav-adminPanel` dan `#mNav-adminPanel`) wajib disembunyikan sepenuhnya dari navigasi bilah sisi (sidebar) dan bilah navigasi seluler.
   - **Identitas Akun Bersih**: Kartu profil pengguna menampilkan nama, email, dan lencana paket milik pengguna yang aktif (bukan identitas akun Superadmin).
   - **Proteksi Rute /admin**: Akses langsung ke rute `/admin` atau tab `adminPanel` wajib menolak akses dengan kode 403 Forbidden dan mengarahkan kembali ke `/dashboard`.

2. **Hak Akses & Tampilan Sesi Admin/Superadmin (role: 'superadmin' / 'admin')**:
   - Menampilkan seluruh menu secara komprehensif termasuk `Superadmin Desk`.
   - Mengaktifkan fitur persetujuan pendaftar baru (*Approval Workflow*), diagnostik basis data SQLite, dan kontrol failover gateway AI.

