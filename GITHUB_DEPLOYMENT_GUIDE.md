# Panduan Push Proyek TataDana ke GitHub & Deployment Vercel

Panduan ini berisi langkah-langkah praktis dan perintah terminal bagi pengguna VS Code untuk menghubungkan proyek TataDana ke repositori GitHub serta menyiapkannya untuk deployment ke Vercel tanpa dependensi database eksternal.

---

## 💡 Konfigurasi Basis Data (Zero Supabase Dependency)
Aplikasi TataDana **100% menggunakan basis data lokal tertanam (Embedded SQLite `tatadana.db`)**.
- **Tidak perlu membuat akun Supabase** atau mengisi `SUPABASE_URL` dan `SUPABASE_KEY`.
- Saat di-deploy ke Vercel, serverless function otomatis menginisialisasi basis data di `/tmp/tatadana.db`.
- Akun Superadmin bawaan (`akunadminaul16@gmail.com` / `akuadmin123`) sudah langsung aktif dan dapat langsung digunakan untuk login dan menyetujui pendaftaran user baru.

---

## 1. Persiapan Awal di VS Code

1. Buka folder proyek di Visual Studio Code:
   ```
   C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
   ```
2. Buka terminal terintegrasi (`Ctrl + \`` atau menu **Terminal** > **New Terminal**).
3. Pastikan terminal berada di direktori proyek:
   ```powershell
   cd "C:\Users\ASUS\.gemini\antigravity\scratch\tatadana"
   ```

---

## 2. Inisialisasi Git & Commit Perdana

Jalankan perintah berikut secara berurutan di terminal:

```bash
# Inisialisasi repositori Git lokal (jika belum pernah diinisialisasi)
git init

# Tambahkan semua berkas yang telah dikonfigurasi ke staging area
git add .

# Buat commit dengan pesan deskriptif
git commit -m "feat: TataDana Embedded SQLite - Zero Supabase Dependency for Vercel & GitHub"

# Pastikan nama branch utama adalah 'main'
git branch -M main
```

---

## 3. Menghubungkan ke GitHub Remote Repository

1. Buat repositori baru di akun GitHub Anda (misalnya bernama `tatadana`). Biarkan repositori kosong (tanpa centang README, .gitignore, atau lisensi otomatis).
2. Salin URL repositori Anda, lalu hubungkan remote `origin`:
   ```bash
   # Ganti <USERNAME> dan <REPO_NAME> sesuai akun GitHub Anda
   git remote add origin https://github.com/<USERNAME>/tatadana.git
   ```
   *(Catatan: Jika remote `origin` sudah pernah dibuat sebelumnya, jalankan `git remote set-url origin https://github.com/<USERNAME>/tatadana.git`)*.

3. Unggah seluruh kode ke branch utama di GitHub:
   ```bash
   git push -u origin main
   ```

---

## 4. Deployment ke Vercel

Proyek ini telah dilengkapi dengan berkas konfigurasi `vercel.json` dan entry point serverless `api/index.py` yang otomatis menggunakan fallback basis data SQLite di `/tmp/tatadana.db`.

### Cara Deploy Melalui Dashboard Vercel:
1. Masuk ke [https://vercel.com](https://vercel.com).
2. Klik tombol **Add New...** > **Project**.
3. Hubungkan akun GitHub Anda dan pilih repositori `tatadana`.
4. **Environment Variables**: **TIDAK WAJIB** diisi apa pun! (Basis data SQLite dan Superadmin sudah tertanam otomatis).
   *(Opsional: jika ingin mengaktifkan Telegram Bot di cloud, tambahkan `TELEGRAM_BOT_TOKEN`: `8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ`)*.
5. Klik **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Python Serverless dan merutekan antarmuka serta API ke `api/index.py`.

---

## 5. Menjalankan di Lingkungan Lokal (Localhost:3000)

Untuk menjalankan server di komputer lokal:
```bash
python server.py
```
*(Atau cukup klik dua kali berkas `run_localhost.bat`)*.

Buka browser Anda dan akses:
```
http://localhost:3000
```
- **Login Superadmin**: `akunadminaul16@gmail.com` / `akuadmin123`
- **Superadmin Desk**: `http://localhost:3000/admin`
- **User Dashboard**: `http://localhost:3000/dashboard`
