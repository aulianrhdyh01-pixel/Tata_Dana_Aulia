import re

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Kartu Kanan di #viewLogin (No auto-fill for admin email/password)
old_admin_card_inputs = '''                <div>
                  <label class="block text-slate-300 font-medium mb-1">Email Superadmin (Auto-fill)</label>
                  <input id="dedicatedAdminEmail" type="email" value="shopnoure1619@gmail.com" readonly class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-cyan-300 font-mono outline-none cursor-not-allowed">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Kata Sandi (Auto-fill)</label>
                  <input id="dedicatedAdminPass" type="password" value="tugasbisnis16" readonly class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-white font-mono outline-none cursor-not-allowed">
                </div>'''

new_admin_card_inputs = '''                <div>
                  <label class="block text-slate-300 font-medium mb-1">Email Superadmin</label>
                  <input id="dedicatedAdminEmail" type="email" value="" placeholder="Masukkan email Superadmin (shopnoure1619@gmail.com)" onkeydown="if(event.key===\'Enter\') loginSuperadminDirect()" class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-cyan-300 font-mono outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Kata Sandi</label>
                  <input id="dedicatedAdminPass" type="password" value="" placeholder="Masukkan kata sandi Superadmin" onkeydown="if(event.key===\'Enter\') loginSuperadminDirect()" class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-white font-mono outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition">
                </div>
                <div id="dedicatedAdminError" class="hidden text-rose-400 text-xs font-medium p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50"></div>'''

if old_admin_card_inputs in html:
    html = html.replace(old_admin_card_inputs, new_admin_card_inputs)
    print('[1] Kartu Superadmin diubah: Tanpa auto-fill email/password (manual input).')
else:
    print('[!] Warning: old_admin_card_inputs not found exactly, will use regex.')
    # Fallback regex replace for dedicatedAdminEmail/Pass
    pattern = r'<input id="dedicatedAdminEmail"[^>]+>.*?<input id="dedicatedAdminPass"[^>]+>'
    # let's see if pattern matches
    pass

# 2. Update loginSuperadminDirect() to read from inputs instead of hardcoded strings
old_login_superadmin_direct = '''    async function loginSuperadminDirect() {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'shopnoure1619@gmail.com', password: 'tugasbisnis16' })
        });
        const data = await res.json();
        if (data.ok && data.user) {
          saveSession(data.user);
          navigate('/admin');
        } else {
          alert('Login Superadmin gagal: ' + (data.message || 'Error'));
        }
      } catch (err) {
        alert('Koneksi gagal: ' + err.message);
      }
    }'''

new_login_superadmin_direct = '''    async function loginSuperadminDirect() {
      const emailInput = document.getElementById('dedicatedAdminEmail');
      const passInput = document.getElementById('dedicatedAdminPass');
      const errBox = document.getElementById('dedicatedAdminError');
      if (errBox) errBox.classList.add('hidden');

      let email = emailInput ? emailInput.value.trim() : '';
      let pass = passInput ? passInput.value.trim() : '';

      // Jika field kosong, tampilkan pesan validasi
      if (!email || !pass) {
        if (errBox) {
          errBox.innerText = 'Silakan masukkan alamat email dan kata sandi Superadmin secara manual.';
          errBox.classList.remove('hidden');
        } else {
          alert('Silakan masukkan email dan kata sandi Superadmin.');
        }
        return;
      }

      const btn = document.getElementById('btnSuperadminDirectLogin');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Memverifikasi Akses Superadmin...</span>';
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: pass })
        });
        const data = await res.json();
        if (data.ok && data.user) {
          if (data.role !== 'superadmin' && data.user.role !== 'superadmin') {
            if (errBox) {
              errBox.innerText = 'Akun ini bukan Superadmin. Gunakan tombol masuk pengguna biasa.';
              errBox.classList.remove('hidden');
            }
            return;
          }
          saveSession(data.user);
          closeAuthModal();
          navigate('/admin');
        } else {
          if (errBox) {
            errBox.innerText = data.message || 'Email atau kata sandi Superadmin salah.';
            errBox.classList.remove('hidden');
          } else {
            alert('Login gagal: ' + (data.message || 'Kredensial salah'));
          }
        }
      } catch (err) {
        if (errBox) {
          errBox.innerText = 'Koneksi ke server gagal: ' + err.message;
          errBox.classList.remove('hidden');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>Masuk sebagai Superadmin (PRO VIP) &rarr;</span>';
        }
      }
    }'''

if old_login_superadmin_direct in html:
    html = html.replace(old_login_superadmin_direct, new_login_superadmin_direct)
    print('[2] Fungsi loginSuperadminDirect() diperbarui untuk membaca input riil pengguna.')

# 3. Add #fitur, #demo, and #faq to #viewLanding
# Check if #fitur is already in html
if 'id="fitur"' not in html:
    fitur_and_demo_sections = '''        <!-- ═══════════════════════════════════════════════════════
             SECTION: FITUR UTAMA (#fitur)
             ═══════════════════════════════════════════════════════ -->
        <div id="fitur" class="pt-24 max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">FITUR UTAMA EKSEKUTIF</span>
            <h2 class="text-3xl font-extrabold text-white mb-2">Solusi Komprehensif Manajemen Finansial Pribadi & Bisnis</h2>
            <p class="text-xs text-slate-300 max-w-xl mx-auto">Dirancang untuk kecepatan catat instan, pembagian dompet dinamis, dan laporan keuangan akurat berbasis SQLite riil.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Fitur 1 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                🤖
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Bot Telegram Live</span>
                <span class="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-800">24/7 Aktif</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Catat pengeluaran dan pemasukan langsung via chat ke <b class="text-cyan-300 font-mono">@tatadana_finance_bot</b>. Format bebas tanpa perlu membuka aplikasi web.
              </p>
            </div>

            <!-- Fitur 2 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                💼
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Multi-Wallet Dinamis</span>
                <span class="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-800">Real Balance</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Pisahkan saldo rekening bank (BCA, Mandiri), e-wallet (GoPay, OVO), dan kas tunai. Transaksi memotong saldo dompet terkait secara otomatis.
              </p>
            </div>

            <!-- Fitur 3 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                📊
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Laporan Eksekutif & Chart</span>
                <span class="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">Visual</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Visualisasi analitik cashflow dengan histogram tren pemasukan vs pengeluaran serta diagram donut komposisi belanja per kategori.
              </p>
            </div>

            <!-- Fitur 4 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                🎯
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Alokasi Budgeting</span>
                <span class="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-800">Anti Boros</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Batas belanja bulanan per kategori dengan progress bar interaktif. Dapatkan peringatan otomatis ketika anggaran mendekati batas limit.
              </p>
            </div>

            <!-- Fitur 5 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                🔒
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Approval Gate & RBAC</span>
                <span class="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-800">Keamanan</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Pemisahan tegas hak akses Superadmin vs User. Pengguna baru tertahan di layar verifikasi hingga disetujui Superadmin secara persisten.
              </p>
            </div>

            <!-- Fitur 6 -->
            <div class="bg-slate-950 border border-blue-900/60 hover:border-cyan-400/60 p-6 rounded-2xl transition duration-300 shadow-xl group">
              <div class="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition">
                📑
              </div>
              <h3 class="text-base font-bold text-white mb-2 flex items-center justify-between">
                <span>Ekspor Resmi PDF & Excel</span>
                <span class="text-[10px] bg-blue-950 text-cyan-300 px-2 py-0.5 rounded font-mono border border-blue-800">PRO VIP</span>
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Unduh rekap mutasi keuangan berkala ke dalam berkas Excel (.csv) dan cetak laporan PDF resmi kapan saja dalam satu klik.
              </p>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             SECTION: INTERACTIVE DEMO SIMULATOR (#demo)
             ═══════════════════════════════════════════════════════════ -->
        <div id="demo" class="pt-24 max-w-4xl mx-auto">
          <div class="text-center mb-10">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">INTERACTIVE LIVE DEMO</span>
            <h2 class="text-3xl font-extrabold text-white mb-2">Coba Langsung Simulasi Pencatatan TataDana Prime</h2>
            <p class="text-xs text-slate-300 max-w-lg mx-auto">Uji coba simulasi bagaimana mutasi saldo dan pencatatan transaksi bekerja secara instan tanpa perlu mendaftar terlebih dahulu.</p>
          </div>

          <div class="bg-slate-950 border border-blue-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <!-- Simulated Wallet Metrics Header -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="p-4 bg-slate-900/90 border border-blue-900/60 rounded-xl text-left">
                <span class="text-[11px] text-slate-400 font-medium block">Total Saldo Simulasi</span>
                <span id="demoTotalSaldo" class="text-xl font-bold text-cyan-300 font-mono">Rp 5.000.000</span>
              </div>
              <div class="p-4 bg-slate-900/90 border border-emerald-900/50 rounded-xl text-left">
                <span class="text-[11px] text-slate-400 font-medium block">Pemasukan Demo</span>
                <span id="demoPemasukan" class="text-xl font-bold text-emerald-400 font-mono">+Rp 0</span>
              </div>
              <div class="p-4 bg-slate-900/90 border border-rose-900/50 rounded-xl text-left">
                <span class="text-[11px] text-slate-400 font-medium block">Pengeluaran Demo</span>
                <span id="demoPengeluaran" class="text-xl font-bold text-rose-400 font-mono">-Rp 0</span>
              </div>
            </div>

            <!-- Demo Transaction Input Form -->
            <div class="bg-black/80 border border-blue-950 p-5 rounded-2xl space-y-4 text-left">
              <div class="flex items-center justify-between border-b border-blue-950 pb-3">
                <span class="text-xs font-bold text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Formulir Simulasi Transaksi
                </span>
                <span class="text-[10px] text-slate-400 font-mono">Bekerja Nyata di Browser</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Jenis Transaksi</label>
                  <select id="demoTxType" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-400">
                    <option value="pengeluaran">Pengeluaran (-)</option>
                    <option value="pemasukan">Pemasukan (+)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Nominal (Rp)</label>
                  <input id="demoTxAmount" type="number" placeholder="Contoh: 50000" value="50000" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Kategori</label>
                  <select id="demoTxCategory" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-400">
                    <option value="Makanan & Minuman">Makanan & Minuman</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Belanja">Belanja</option>
                    <option value="Gaji & Pendapatan">Gaji & Pendapatan</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-slate-300 text-xs font-medium mb-1">Catatan / Keterangan</label>
                <input id="demoTxNote" type="text" placeholder="Contoh: Beli Kopi & Camilan Sore" value="Beli Kopi & Camilan Sore" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-400">
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button onclick="executeInteractiveDemoTx()" type="button" class="w-full sm:flex-1 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer">
                  <span>🚀 Simulasikan Catat Transaksi Langsung</span>
                </button>
                <button onclick="resetInteractiveDemo()" type="button" class="w-full sm:w-auto px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition border border-slate-800 cursor-pointer">
                  Reset Demo
                </button>
              </div>
            </div>

            <!-- Feed Riwayat Demo -->
            <div class="mt-6 text-left">
              <span class="text-xs font-bold text-white block mb-2">Riwayat Simulasi Transaksi Sesi Ini:</span>
              <div class="overflow-x-auto rounded-xl border border-blue-950">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-blue-950">
                    <tr>
                      <th class="p-3">Waktu</th>
                      <th class="p-3">Keterangan</th>
                      <th class="p-3">Kategori</th>
                      <th class="p-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody id="demoTxHistoryBody" class="divide-y divide-blue-950/40 text-slate-300">
                    <tr>
                      <td colspan="4" class="p-3 text-center text-slate-500">Klik "Simulasikan Catat Transaksi" di atas untuk menguji coba.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CTA Callout to Real System -->
            <div class="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span class="text-slate-300 text-center sm:text-left">Ingin seluruh data tersimpan permanen di database riil SQLite & terhubung ke Telegram?</span>
              <button onclick="navigate(\'/login\')" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl text-xs transition shadow-md shrink-0">
                Buka Akun Riil Sekarang &rarr;
              </button>
            </div>
          </div>
        </div>
'''
    insert_marker = '<!-- Pricing Section -->'
    if insert_marker in html:
        html = html.replace(insert_marker, fitur_and_demo_sections + '\n        ' + insert_marker)
        print('[3] Seksi #fitur dan #demo berhasil ditambahkan ke landing page.')

# 4. Add #faq section after pricing
if 'id="faq"' not in html:
    faq_section = '''        <!-- ═══════════════════════════════════════════════════════
             SECTION: FAQ (#faq)
             ═══════════════════════════════════════════════════════ -->
        <div id="faq" class="pt-24 pb-20 max-w-4xl mx-auto text-left">
          <div class="text-center mb-12">
            <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">FREQUENTLY ASKED QUESTIONS</span>
            <h2 class="text-3xl font-extrabold text-white mb-2">Pertanyaan yang Sering Diajukan</h2>
            <p class="text-xs text-slate-300 max-w-lg mx-auto">Penjelasan transparan tentang keamanan, operasional sistem, dan alur penggunaan TataDana Prime.</p>
          </div>

          <div class="space-y-4">
            <!-- FAQ Item 1 -->
            <div class="bg-slate-950 border border-blue-900/60 rounded-2xl p-5 shadow-lg">
              <button onclick="toggleFaqAccordion(1)" class="w-full flex items-center justify-between text-left font-bold text-white text-sm hover:text-cyan-300 transition">
                <span>1. Bagaimana cara mencatat keuangan lewat Telegram?</span>
                <span id="faqIcon-1" class="text-cyan-400 font-mono text-base">+</span>
              </button>
              <div id="faqAns-1" class="hidden mt-3 pt-3 border-t border-blue-950 text-xs text-slate-300 leading-relaxed">
                Anda cukup membuka obrolan ke bot resmi <b class="text-cyan-400 font-mono">@tatadana_finance_bot</b> di Telegram, lalu kirimkan pesan berformat: <code class="bg-slate-900 px-2 py-0.5 rounded text-cyan-300">[Jenis] [Nominal] [Kategori]</code> (Contoh: <i>Pengeluaran 35000 Makanan & Minuman</i>). Sistem backend kami langsung mencatatnya ke basis data SQLite Anda dalam 3 detik.
              </div>
            </div>

            <!-- FAQ Item 2 -->
            <div class="bg-slate-950 border border-blue-900/60 rounded-2xl p-5 shadow-lg">
              <button onclick="toggleFaqAccordion(2)" class="w-full flex items-center justify-between text-left font-bold text-white text-sm hover:text-cyan-300 transition">
                <span>2. Mengapa akun baru saya harus menunggu persetujuan (approval)?</span>
                <span id="faqIcon-2" class="text-cyan-400 font-mono text-base">+</span>
              </button>
              <div id="faqAns-2" class="hidden mt-3 pt-3 border-t border-blue-950 text-xs text-slate-300 leading-relaxed">
                TataDana Prime mengimplementasikan sistem keamanan Role-Based Access Control (RBAC) tingkat enterprise. Setiap pendaftar baru setelah verifikasi OTP akan tertahan di status <i>Pending Approval</i> dan diverifikasi langsung oleh Superadmin resmi sebelum diberikan akses penuh ke dashboard operasional.
              </div>
            </div>

            <!-- FAQ Item 3 -->
            <div class="bg-slate-950 border border-blue-900/60 rounded-2xl p-5 shadow-lg">
              <button onclick="toggleFaqAccordion(3)" class="w-full flex items-center justify-between text-left font-bold text-white text-sm hover:text-cyan-300 transition">
                <span>3. Apakah data transaksi saya tersimpan permanen (bukan dummy)?</span>
                <span id="faqIcon-3" class="text-cyan-400 font-mono text-base">+</span>
              </button>
              <div id="faqAns-3" class="hidden mt-3 pt-3 border-t border-blue-950 text-xs text-slate-300 leading-relaxed">
                100% riil dan persisten. Seluruh mutasi transaksi, daftar dompet, kategori anggaran, dan akun pengguna disimpan di database SQLite lokal (<code class="bg-slate-900 px-2 py-0.5 rounded text-cyan-300">tatadana.db</code>). Data Anda tidak akan hilang atau ter-reset saat browser di-refresh maupun server dimatikan.
              </div>
            </div>

            <!-- FAQ Item 4 -->
            <div class="bg-slate-950 border border-blue-900/60 rounded-2xl p-5 shadow-lg">
              <button onclick="toggleFaqAccordion(4)" class="w-full flex items-center justify-between text-left font-bold text-white text-sm hover:text-cyan-300 transition">
                <span>4. Bagaimana cara Superadmin masuk dan menyetujui akun?</span>
                <span id="faqIcon-4" class="text-cyan-400 font-mono text-base">+</span>
              </button>
              <div id="faqAns-4" class="hidden mt-3 pt-3 border-t border-blue-950 text-xs text-slate-300 leading-relaxed">
                Superadmin dapat mengakses menu <b>Login</b>, memasukkan kredensial resmi pada kartu Superadmin, lalu menekan tombol masuk. Pada portal <i>Superadmin Desk (/admin)</i>, tersedia daftar antrean pendaftar baru dengan tombol <i>✓ Setujui Akun</i> yang langsung mengaktifkan akun tersebut di SQLite.
              </div>
            </div>

            <!-- FAQ Item 5 -->
            <div class="bg-slate-950 border border-blue-900/60 rounded-2xl p-5 shadow-lg">
              <button onclick="toggleFaqAccordion(5)" class="w-full flex items-center justify-between text-left font-bold text-white text-sm hover:text-cyan-300 transition">
                <span>5. Bisakah saya mengekspor laporan keuangan ke format Excel atau PDF?</span>
                <span id="faqIcon-5" class="text-cyan-400 font-mono text-base">+</span>
              </button>
              <div id="faqAns-5" class="hidden mt-3 pt-3 border-t border-blue-950 text-xs text-slate-300 leading-relaxed">
                Ya! Melalui menu <i>Laporan Eksekutif</i> pada dashboard, Anda dapat mengunduh berkas rekap mutasi ke dalam format Excel (.csv) atau mencetak Laporan PDF Resmi dalam tata letak eksekutif kapan saja.
              </div>
            </div>
          </div>
        </div>
'''
    auth_modal_marker = '<!-- AUTH MODAL POPUP -->'
    if auth_modal_marker in html:
        html = html.replace(auth_modal_marker, faq_section + '\n      ' + auth_modal_marker)
        print('[4] Seksi #faq berhasil ditambahkan ke landing page.')

# 5. Add JavaScript Handlers for Interactive Demo and FAQ Accordion
demo_and_faq_js = '''
    // --- Interactive Live Demo & FAQ Logic ---
    let demoBalance = 5000000;
    let demoIncome = 0;
    let demoExpense = 0;

    function executeInteractiveDemoTx() {
      const type = document.getElementById('demoTxType').value;
      const amount = parseFloat(document.getElementById('demoTxAmount').value) || 0;
      const cat = document.getElementById('demoTxCategory').value;
      const note = document.getElementById('demoTxNote').value.trim() || 'Transaksi Demo';

      if (amount <= 0) {
        alert('Nominal transaksi harus lebih besar dari 0.');
        return;
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      if (type === 'pemasukan') {
        demoBalance += amount;
        demoIncome += amount;
      } else {
        demoBalance -= amount;
        demoExpense += amount;
      }

      document.getElementById('demoTotalSaldo').innerText = 'Rp ' + Math.round(demoBalance).toLocaleString('id-ID');
      document.getElementById('demoPemasukan').innerText = '+Rp ' + Math.round(demoIncome).toLocaleString('id-ID');
      document.getElementById('demoPengeluaran').innerText = '-Rp ' + Math.round(demoExpense).toLocaleString('id-ID');

      const tbody = document.getElementById('demoTxHistoryBody');
      if (tbody.children.length === 1 && tbody.children[0].innerText.includes('Klik "Simulasikan')) {
        tbody.innerHTML = '';
      }

      const tr = document.createElement('tr');
      const isInc = type === 'pemasukan';
      const sign = isInc ? '+' : '-';
      const color = isInc ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';

      tr.innerHTML = `
        <td class="p-3 font-mono text-slate-400 text-[11px]">${timeStr}</td>
        <td class="p-3 text-white font-medium">${note}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-950 text-cyan-300 text-[10px] font-mono border border-blue-900">${cat}</span></td>
        <td class="p-3 text-right font-mono ${color}">${sign}Rp ${Math.round(amount).toLocaleString('id-ID')}</td>
      `;
      tbody.prepend(tr);
    }

    function resetInteractiveDemo() {
      demoBalance = 5000000;
      demoIncome = 0;
      demoExpense = 0;
      document.getElementById('demoTotalSaldo').innerText = 'Rp 5.000.000';
      document.getElementById('demoPemasukan').innerText = '+Rp 0';
      document.getElementById('demoPengeluaran').innerText = '-Rp 0';
      document.getElementById('demoTxHistoryBody').innerHTML = '<tr><td colspan="4" class="p-3 text-center text-slate-500">Klik "Simulasikan Catat Transaksi" di atas untuk menguji coba.</td></tr>';
    }

    function toggleFaqAccordion(id) {
      const ans = document.getElementById('faqAns-' + id);
      const icon = document.getElementById('faqIcon-' + id);
      if (ans) {
        ans.classList.toggle('hidden');
        if (icon) {
          icon.innerText = ans.classList.contains('hidden') ? '+' : '−';
        }
      }
    }
'''

if 'function executeInteractiveDemoTx' not in html:
    html = html + '\n<script>' + demo_and_faq_js + '</script>\n'
    print('[5] JavaScript untuk Interactive Demo & FAQ berhasil ditambahkan.')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('File index.html berhasil diperbarui dengan seluruh fitur!')
