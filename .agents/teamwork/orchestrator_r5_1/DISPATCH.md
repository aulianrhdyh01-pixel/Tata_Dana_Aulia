## 2026-10-17T11:28:07Z
You are the Project Orchestrator (orchestrator_r5_1) for TataDana Prime.

Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_r5_1
Authoritative requirements: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

User Request:
Kerjakan oleh 5 agen: Implementasi pembaruan dan penyempurnaan fitur pada aplikasi dashboard finansial TataDana Prime (Executive Wealth OS) di localhost:3000 berdasarkan kebutuhan:

1. Navigasi & Menu "Beranda" (Sidebar):
   - Tambahkan item menu baru "Beranda" di bagian paling atas menu navigasi sidebar (di atas "Transaksi & Mutasi").
   - Menu Beranda ini berfungsi sebagai halaman utama ringkasan finansial (overview total saldo gabungan, ringkasan pengeluaran/pemasukan bulanan, dan quick shortcut).

2. Halaman "Transaksi & Mutasi":
   - Pada form formulir "Catat Transaksi Riil Baru", ubah teks label tombol submit dari "Simpan ke Database SQLite" menjadi cukup "Simpan".
   - Pastikan fungsi penyimpanan data transaksi ke database SQLite tetap berjalan normal dan otomatis memperbarui tabel "Daftar Transaksi Lengkap".

3. Halaman "Laporan Eksekutif":
   - Ubah tampilan halaman ini agar tidak hanya menampilkan tombol ekspor, melainkan menampilkan visualisasi analitik laporan transaksi yang lengkap, elegan, dan mudah dipahami:
     a. Histogram / Bar Chart: Tren pemasukan vs pengeluaran dari waktu ke waktu (mingguan/bulanan).
     b. Donut / Pie Chart: Komposisi pengeluaran berdasarkan kategori (misal: Makanan & Minuman, Transportasi, dsb.).
     c. Kartu Metrik Ringkas: Total Pemasukan, Total Pengeluaran, Net Cashflow, dan Rasio Tabungan.
     d. Filter Periode: Pilihan filter yang mudah digunakan (Bulan Ini, 30 Hari Terakhir, Semua Waktu).
     e. Tetap pertahankan tombol "Ekspor Excel (.csv)" dan "Ekspor PDF Resmi" di bagian atas/sudut laporan.

4. Halaman & Fitur "Multi-Wallet" (Full Functional, Bukan Dummy):
   - Buat manajemen wallet benar-benar dinamis dan tersimpan di database:
     a. Default State: Jangan sediakan daftar dompet bawaan yang statis. Jika pengguna baru belum membuat dompet, tampilkan kondisi kosong (empty state) yang rapi dengan tombol call-to-action "Tambah Wallet Pertama Anda".
     b. Modal / Form "Tambah Wallet Baru":
        - Input: Nama Dompet (contoh: BCA Utama, Mandiri, GoPay), Jenis Akun (Bank, E-Wallet, Tunai), dan Saldo Awal (Rp).
        - Tombol simpan yang langsung menyimpan entri ke tabel dompet di SQLite.
     c. Terintegrasi Penuh (Real-time):
        - Dompet yang berhasil ditambahkan harus otomatis muncul di dropdown "Pilih Dompet" pada formulir transaksi.
        - Pengguna dapat memilih satu dompet untuk dijadikan dompet aktif ("Default/Aktif"), yang otomatis menyinkronkan status "Dompet Aktif" pada header atas dashboard.
        - Setiap pencatatan transaksi masuk atau keluar harus langsung memotong atau menambah saldo pada kartu dompet terkait.

Instructions:
- Decompose and execute this work with a team of 5 agents as explicitly requested by the user.
- Keep your BRIEFING.md and progress.md updated regularly in your working directory.
- Test and verify all functionalities thoroughly on localhost:3000 and automated test scripts.
- When all 4 requirements are implemented, verified, and complete, deliver handoff.md and report victory back to me.
