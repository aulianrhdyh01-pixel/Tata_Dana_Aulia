import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_view_login = '''    <!-- ═══════════════════════════════════════════════════════════════
         VIEW: DEDICATED LOGIN & AUTH PAGE (/login) - TATADANA PRIME ACCESS PORTAL
         ═══════════════════════════════════════════════════════════════ -->
    <section id="viewLogin" class="hidden min-h-[90vh] py-12 px-4 sm:px-6 bg-black flex flex-col items-center justify-center">
      <div class="max-w-5xl w-full mx-auto">
        <!-- Top Nav Header with Back to Landing Page -->
        <div class="flex items-center justify-between pb-6 mb-8 border-b border-blue-900/40">
          <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('/')" title="Kembali ke Beranda">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">TD</div>
            <div>
              <h2 class="text-base font-bold text-white tracking-tight">Tata<span class="text-cyan-400">Dana</span> Prime</h2>
              <p class="text-[11px] text-blue-300">Executive Wealth OS</p>
            </div>
          </div>
          <button onclick="navigate('/')" class="px-3.5 py-1.5 rounded-xl border border-blue-900/70 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition bg-slate-950 flex items-center gap-1.5 cursor-pointer">
            <span>&larr;</span> <span>Kembali ke Beranda</span>
          </button>
        </div>

        <!-- Portal Header with Required Exact Title -->
        <div class="text-center mb-8">
          <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">TataDana Prime Access Portal</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">TATADANA PRIME ACCESS PORTAL</h1>
          <p class="text-sm font-semibold text-cyan-300 mt-1">Pendaftaran User Baru & Akses Cepat Superadmin</p>
          <p class="text-xs text-slate-400 mt-1.5 max-w-lg mx-auto">Daftarkan akun pengguna baru atau masuk instan dengan kredensial Superadmin resmi.</p>
        </div>

        <!-- Two Column Side-by-Side Cards: User Registration Form & Admin Quick Login -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <!-- KARTU KIRI: Formulir Pendaftaran User -->
          <div class="bg-slate-950 border border-blue-900/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div class="flex items-center justify-between pb-3.5 mb-4 border-b border-blue-900/60">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                  <h3 class="text-sm font-bold text-white">👤 Formulir Pendaftaran User</h3>
                </div>
                <span class="text-[10px] bg-blue-950 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono border border-blue-800">User Baru</span>
              </div>

              <div class="space-y-3.5 text-xs text-left">
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Nama Lengkap</label>
                  <input id="dedicatedRegName" type="text" placeholder="Masukkan nama lengkap" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Alamat Email</label>
                  <input id="dedicatedRegEmail" type="email" placeholder="nama@email.com" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Nomor WhatsApp / HP</label>
                  <input id="dedicatedRegPhone" type="tel" placeholder="081234567890" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-3 text-xs text-cyan-300 font-mono placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Kata Sandi</label>
                  <input id="dedicatedRegPass" type="password" placeholder="Buat kata sandi akun" onkeydown="if(event.key===\'Enter\') submitDedicatedRegister()" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition">
                </div>
                <div id="dedicatedRegError" class="hidden text-rose-400 text-xs font-medium p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50"></div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-blue-900/30">
              <button onclick="submitDedicatedRegister()" id="btnDedicatedRegisterSubmit" type="button" class="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:brightness-110 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer">
                <span>Daftarkan Akun & Buka Layar Approval &rarr;</span>
              </button>
            </div>
          </div>

          <!-- KARTU KANAN: Akses Khusus Superadmin -->
          <div class="bg-slate-950 border border-amber-900/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div class="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-900/60">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
                  <h3 class="text-sm font-bold text-amber-300">👑 Akses Khusus Superadmin</h3>
                </div>
                <span class="text-[10px] bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-full font-mono border border-amber-800">PRO VIP</span>
              </div>

              <div class="space-y-3.5 text-xs text-left">
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Email Superadmin (Auto-fill)</label>
                  <input id="dedicatedAdminEmail" type="email" value="shopnoure1619@gmail.com" readonly class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-cyan-300 font-mono outline-none cursor-not-allowed">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1">Kata Sandi (Auto-fill)</label>
                  <input id="dedicatedAdminPass" type="password" value="tugasbisnis16" readonly class="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-white font-mono outline-none cursor-not-allowed">
                </div>
                
                <!-- Info Role Superadmin -->
                <div class="p-3.5 bg-amber-950/30 rounded-xl border border-amber-900/50 text-[11px] text-amber-200/90 leading-relaxed">
                  <div class="flex items-center gap-2 font-bold text-amber-300 mb-1">
                    <span>Otoritas: SUPERADMIN</span>
                    <span>&bull;</span>
                    <span>Paket: PRO VIP</span>
                  </div>
                  Memiliki akses penuh ke Superadmin Desk, kontrol otorisasi & persetujuan (approval) pendaftar baru, serta fitur ekspor laporan resmi.
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-amber-900/30 space-y-2.5">
              <button onclick="loginSuperadminDirect()" id="btnSuperadminDirectLogin" type="button" class="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:brightness-110 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 border border-amber-400/40 cursor-pointer">
                <span>Masuk sebagai Superadmin (PRO VIP) &rarr;</span>
              </button>
              
              <!-- Tautan Login Resmi -->
              <button onclick="toggleDedicatedExistingLogin()" type="button" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition text-center block cursor-pointer">
                Sudah punya akun user? Masuk di sini (Tautan Login Resmi) &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Collapsible / Clean Existing User Login Panel (Tautan Login Resmi) -->
        <div id="dedicatedExistingLoginPanel" class="hidden max-w-md mx-auto mt-8 p-6 bg-slate-950 border border-blue-900/70 rounded-2xl shadow-xl">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-blue-900/40">
            <h4 class="text-xs font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              Masuk dengan Akun User Terdaftar
            </h4>
            <button onclick="toggleDedicatedExistingLogin()" class="text-xs text-slate-400 hover:text-white cursor-pointer">&times; Tutup</button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Email Anda</label>
              <input id="dedicatedLoginEmail" type="email" placeholder="nama@email.com" onkeydown="if(event.key===\'Enter\') submitDedicatedLogin()" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-400">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Kata Sandi</label>
              <input id="dedicatedLoginPass" type="password" placeholder="Masukkan kata sandi" onkeydown="if(event.key===\'Enter\') submitDedicatedLogin()" class="w-full bg-slate-900 border border-blue-900/60 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-400">
            </div>
            <div id="dedicatedLoginError" class="hidden text-rose-400 text-xs font-medium"></div>
            <button onclick="submitDedicatedLogin()" id="btnDedicatedLoginSubmit" type="button" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer">
              Masuk ke Akun
            </button>
          </div>
        </div>
      </div>
    </section>'''

# Match <section id="viewLogin" ... </section>
pattern = r'<section id="viewLogin".*?</section>'
match = re.search(pattern, html, flags=re.DOTALL)
if match:
    html = html[:match.start()] + new_view_login + html[match.end():]
    print('viewLogin successfully replaced!')
else:
    print('Pattern not matched!')

# Add toggleDedicatedExistingLogin if not present
if 'function toggleDedicatedExistingLogin' not in html:
    helper_code = '''
    function toggleDedicatedExistingLogin() {
      const panel = document.getElementById('dedicatedExistingLoginPanel');
      if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
'''
    insert_point = html.find('function submitDedicatedLogin()')
    if insert_point != -1:
        html = html[:insert_point] + helper_code + '\n    ' + html[insert_point:]
        print('toggleDedicatedExistingLogin added!')

# Ensure submitDedicatedRegister checks for email format and phone
register_enhancement = '''    async function submitDedicatedRegister() {
      const name = document.getElementById('dedicatedRegName').value.trim();
      const email = document.getElementById('dedicatedRegEmail').value.trim();
      const phone = document.getElementById('dedicatedRegPhone').value.trim();
      const pass = document.getElementById('dedicatedRegPass').value.trim();
      const errBox = document.getElementById('dedicatedRegError');

      if (errBox) errBox.classList.add('hidden');
      if (!name || !email || !phone || !pass) {
        if (errBox) {
          errBox.innerText = 'Semua kolom formulir pendaftaran wajib diisi secara lengkap.';
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (!/\\S+@\\S+\\.\\S+/.test(email)) {
        if (errBox) {
          errBox.innerText = 'Format alamat email tidak valid.';
          errBox.classList.remove('hidden');
        }
        return;
      }

      const btn = document.getElementById('btnDedicatedRegisterSubmit');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Memproses Pendaftaran...</span>';
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: name, email: email, phone_number: phone, password: pass })
        });
        const data = await res.json();
        if (!data.ok) {
          if (errBox) {
            errBox.innerText = data.message || 'Pendaftaran gagal.';
            errBox.classList.remove('hidden');
          }
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>Daftarkan Akun & Buka Layar Approval &rarr;</span>';
          }
          return;
        }

        const newUser = {
          id: data.user_id,
          full_name: name,
          email: email,
          phone_number: phone,
          role: 'user',
          is_approved: 0,
          plan: 'pro',
          avatar_url: '',
          otp_code: data.otp_code || ''
        };
        saveSession(newUser);
        closeAuthModal();
        navigate('/approval');
      } catch (err) {
        if (errBox) {
          errBox.innerText = 'Koneksi ke server gagal: ' + err.message;
          errBox.classList.remove('hidden');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>Daftarkan Akun & Buka Layar Approval &rarr;</span>';
        }
      }
    }'''

old_reg_match = re.search(r'async function submitDedicatedRegister\(\)\s*\{.*?\n    \}', html, flags=re.DOTALL)
if old_reg_match:
    html = html[:old_reg_match.start()] + register_enhancement + html[old_reg_match.end():]
    print('submitDedicatedRegister enhanced!')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('File index.html saved successfully!')
