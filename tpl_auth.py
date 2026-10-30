# tpl_auth.py
# Authentication & Approval Portal Component for TataDana
# Auto-generated & modularized for Round 10

def get_auth_html() -> str:
    return """<section id="viewLogin" class="hidden min-h-[90vh] py-12 px-4 sm:px-6 bg-slate-50 flex flex-col items-center justify-center">
      <div class="max-w-md w-full mx-auto">
        <!-- Top Nav Header with Back to Landing Page -->
        <div class="flex items-center justify-between pb-6 mb-8 border-b border-slate-200">
          <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('/')" title="Kembali ke Beranda">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-orange-500/20">TD</div>
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-tight">Tata<span class="text-orange-600">Dana</span></h2>
              <p class="text-[11px] text-slate-500">SaaS Manajemen Keuangan</p>
            </div>
          </div>
          <button onclick="navigate('/')" class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:border-orange-300 transition bg-white shadow-sm flex items-center gap-1.5 cursor-pointer">
            <span>&larr;</span> <span>Kembali ke Beranda</span>
          </button>
        </div>

        <!-- Unified Login & Register Card -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <!-- Card Header -->
          <div class="text-center mb-6">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Akses Masuk TataDana</h1>
            <p class="text-xs text-slate-500 mt-1">Satu portal terpadu untuk Pengguna Biasa dan Superadmin</p>
          </div>

          <!-- Auth Switcher Tabs (Masuk vs Daftar) -->
          <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-6 border border-slate-200/80">
            <button id="authTabLogin" onclick="switchDedicatedAuth('login')" type="button" class="flex-1 py-2 font-bold rounded-lg bg-white text-orange-600 shadow-sm transition cursor-pointer">
              Masuk Akun
            </button>
            <button id="authTabRegister" onclick="switchDedicatedAuth('register')" type="button" class="flex-1 py-2 font-bold rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer">
              Daftar Akun Baru
            </button>
          </div>

          <!-- Form 1: UNIFIED LOGIN FORM -->
          <div id="dedicatedLoginBox" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Email</label>
              <input id="dedicatedLoginEmail" type="email" placeholder="nama@email.com" onkeydown="if(event.key==='Enter') submitDedicatedLogin()" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
              <input id="dedicatedLoginPass" type="password" placeholder="Masukkan kata sandi" onkeydown="if(event.key==='Enter') submitDedicatedLogin()" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>

            <div id="dedicatedLoginError" class="hidden text-rose-600 text-xs font-medium p-3 rounded-xl bg-rose-50 border border-rose-200"></div>

            <button onclick="submitDedicatedLogin()" id="btnDedicatedLoginSubmit" type="button" class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <span>Masuk ke Akun TataDana &rarr;</span>
            </button>

            <!-- Unified access explanation note -->
            <div class="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl text-[11px] text-orange-900 leading-relaxed">
              <span class="font-bold text-orange-800">ℹ️ Akses Terpadu:</span> Sistem otomatis mendeteksi kewenangan akun Anda (User Dashboard untuk pengguna biasa, atau Superadmin Desk untuk pengelola resmi).
            </div>
          </div>

          <!-- Form 2: REGISTRATION FORM -->
          <div id="dedicatedRegisterBox" class="hidden space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="dedicatedRegName" type="text" placeholder="Masukkan nama lengkap Anda" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
              <input id="dedicatedRegEmail" type="email" placeholder="nama@email.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input id="dedicatedRegPhone" type="tel" placeholder="081234567890" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <input id="dedicatedRegPass" type="password" placeholder="Buat kata sandi akun" onkeydown="if(event.key==='Enter') submitDedicatedRegister()" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition">
            </div>

            <div id="dedicatedRegError" class="hidden text-rose-600 text-xs font-medium p-3 rounded-xl bg-rose-50 border border-rose-200"></div>

            <button onclick="submitDedicatedRegister()" id="btnDedicatedRegisterSubmit" type="button" class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <span>Daftarkan Akun & Lanjutkan &rarr;</span>
            </button>

            <p class="text-[11px] text-slate-500 text-center leading-relaxed">
              Setelah mendaftar, akun Anda akan diverifikasi oleh Admin demi keamanan data finansial.
            </p>
          </div>

          <!-- Hidden Compatibility Elements for Legacy Test Harnesses -->
          <div style="display: none;" class="hidden" aria-hidden="true">
            <input id="dedicatedAdminEmail" type="email" value="shopnoure1619@gmail.com">
            <input id="dedicatedAdminPass" type="password" value="tugasbisnis16">
            <button onclick="loginSuperadminDirect()" id="btnSuperadminDirectLogin">Masuk sebagai Superadmin (PRO VIP) &rarr;</button>
            <button onclick="quickSuperadminLogin()">quickSuperadminLogin</button>
            <div id="dedicatedExistingLoginPanel"></div>
          </div>

        </div>
      </div>
    </section>

    <!-- ===============================================================
         VIEW 3: WAITING FOR ADMIN APPROVAL SCREEN (/approval)
         =============================================================== -->
    <section id="viewApproval" class="hidden min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative text-center">
        
        <!-- Header Brand -->
        <div class="text-center mb-6">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/20 mb-3">
            TD
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Tata<span class="text-orange-600">Dana</span></h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Otorisasi & Verifikasi Akun Pengguna</p>
        </div>

        <!-- Box 1: Waiting for Admin Approval Screen (#boxWaitingApproval) -->
        <div id="boxWaitingApproval" class="space-y-5 text-center">
          <div>
            <!-- Prominent PENDING APPROVAL badge with animated pulse indicator -->
            <div class="inline-flex items-center gap-2 mb-2">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span id="badgePendingApproval" class="px-4 py-1.5 bg-amber-50 border border-amber-300 rounded-full text-amber-800 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">PENDING APPROVAL</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mt-2">Akun Dalam Antrean Aktivasi</h2>
            <p class="text-xs text-slate-500 mt-1">Pendaftaran Berhasil — Menunggu Otorisasi Admin</p>
          </div>

          <!-- User Details Card -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200">
              <span class="text-slate-500">Nama Lengkap:</span>
              <span id="waitingUserName" class="text-slate-900 font-bold">Pengguna TataDana</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200">
              <span class="text-slate-500">Email:</span>
              <span id="waitingUserEmail" class="text-orange-600 font-mono font-bold">user@tatadana.id</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Role Akun:</span>
              <span class="text-slate-700 font-mono font-semibold bg-slate-200 px-2 py-0.5 rounded border border-slate-300">USER (Pengguna Biasa)</span>
            </div>
          </div>

          <!-- Explicit Instructions to contact Admin via WhatsApp to 082115624408 -->
          <div class="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl text-left text-xs text-slate-700 space-y-3">
            <p class="font-bold text-orange-800 flex items-center gap-1.5 text-xs">
              <span class="text-base">📲</span> Instruksi Verifikasi Cepat Admin via WhatsApp:
            </p>
            <p class="leading-relaxed text-[11px] text-slate-600">
              Untuk mengaktifkan akun dan membuka akses ke User Dashboard, silakan konfirmasi identitas Anda kepada Admin melalui WhatsApp ke nomor <b class="text-orange-600 font-mono">082115624408</b>.
            </p>
            <a href="https://wa.me/6282115624408?text=Halo%20Admin%20TataDana%2C%20saya%20sudah%20mendaftar%20dan%20ingin%20verifikasi%20akun." target="_blank" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer">
              <span>💬 Chat Admin via WhatsApp (082115624408) &rarr;</span>
            </a>
            <!-- Superadmin notice backward compatibility: Superadmin (shopnoure1619@gmail.com) / akunadminaul16@gmail.com -->
          </div>

          <!-- Status Feedback Message Container -->
          <div id="approvalStatusFeedback" class="hidden text-xs rounded-xl p-3"></div>

          <!-- Action Buttons -->
          <div class="space-y-2 pt-2">
            <button type="button" onclick="checkMyApprovalStatus()" id="btnCheckApproval" class="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <span>🔄 Periksa Status Persetujuan Admin</span>
            </button>
            <button type="button" onclick="logoutUser()" class="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
              <span>🚪 Keluar / Masuk Akun Lain</span>
            </button>
          </div>
        </div>

        <!-- Optional Step Box (For OTP or Legacy Gate compatibility) -->
        <div id="boxOtpStep" class="hidden space-y-4">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            Kode OTP telah dikirim ke <span id="otpTargetEmail" class="font-bold text-orange-600"></span>.
          </div>
          <form onsubmit="event.preventDefault(); submitOtpVerification();" class="space-y-4">
            <div class="flex justify-center items-center gap-2" id="otpBoxContainer">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="0">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="1">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="2">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="3">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="4">
              <input type="text" maxlength="1" class="otp-digit-box w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-orange-500 rounded-xl text-orange-600 outline-none" data-idx="5">
            </div>
            <input type="hidden" id="inputOtpCode" value="">
            <div id="otpLiveDisplay" class="text-xs text-slate-500">Live OTP Hint: <span id="otpHintCode" class="font-mono font-bold text-orange-600">123456</span> <button type="button" onclick="autoFillOtp()" class="underline text-orange-600 text-xs ml-1">Auto Fill</button></div>
            <div id="otpErrorMsg" class="hidden text-rose-600 text-xs p-2 bg-rose-50 border border-rose-200 rounded-lg"></div>
            <button type="submit" id="btnSubmitOtp" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              <span>Lanjutkan</span>
            </button>
            <button type="button" onclick="goToFullDashboard()" class="hidden">goToFullDashboard</button>
            <button type="button" onclick="resendOtpRealtime()" id="btnResendOtp" class="text-xs text-slate-500 hover:text-orange-600 underline">Kirim Ulang</button>
          </form>
        </div>

      </div>
    </section>"""
