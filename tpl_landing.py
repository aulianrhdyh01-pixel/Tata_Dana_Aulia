# tpl_landing.py
# Landing Page Component for TataDana
# Auto-generated & modularized for Round 10

def get_landing_html() -> str:
    return """<section id="viewLanding" class="block bg-slate-50 text-slate-800">
      
      <!-- 1. Sticky Navbar -->
      <nav class="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('/')" title="Kembali ke Beranda">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-base font-bold shadow-md shadow-orange-500/20">
            TD
          </div>
          <div>
            <div class="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Tata<span class="text-orange-600">Dana</span>
              <span class="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-mono border border-orange-200 font-bold">PRO</span>
            </div>
            <p class="text-[11px] text-slate-500 -mt-0.5">Catat keuangan semudah chat Telegram</p>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
          <a href="#masalah" class="hover:text-orange-600 transition">Masalah</a>
          <a href="#fitur" class="hover:text-orange-600 transition">Fitur Utama</a>
          <a href="#demo" class="hover:text-orange-600 transition">Interactive Demo</a>
          <a href="#testimoni" class="hover:text-orange-600 transition">Testimoni</a>
          <a href="#pricing" class="hover:text-orange-600 transition">Harga</a>
          <a href="#faq" class="hover:text-orange-600 transition">FAQ</a>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="navigate('/login')" class="px-4 py-2 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition cursor-pointer">
            Login
          </button>
          <button onclick="navigate('/login')" class="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition shadow-md shadow-orange-500/20 cursor-pointer">
            Daftar Gratis &rarr;
          </button>
        </div>
      </nav>

      <!-- 2. Hero Section -->
      <div class="relative overflow-hidden pt-14 pb-20 px-6 max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <!-- Pre-headline badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700 mb-6 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Catat keuangan langsung dari Telegram kamu
          </div>

          <!-- Headline H1 (Problem-aware with orange gradient accent) -->
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            Gaji habis sebelum akhir bulan? <br>
            <span class="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Sudah saatnya kamu tahu ke mana uangmu pergi.
            </span>
          </h1>

          <!-- Sub-headline -->
          <p class="text-slate-600 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya diproses otomatis di database riil dan laporan real-time.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button onclick="navigate('/login')" class="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm transition shadow-lg shadow-orange-500/25 cursor-pointer">
              Mulai Gratis Sekarang &rarr;
            </button>
            <a href="#demo" class="px-7 py-4 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 text-sm transition shadow-sm cursor-pointer">
              Lihat Demo Interaktif
            </a>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-500">✓</span> 100% Data Riil SQLite Persisten
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-500">✓</span> Bot Telegram 24/7 Responsif
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-500">✓</span> Verifikasi Admin Aman
            </div>
          </div>
        </div>

        <!-- Hero Placeholder Video Player Card -->
        <div class="max-w-4xl mx-auto mb-16 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-3 sm:p-4">
          <div class="relative bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center text-center p-6 text-white overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-orange-950/40 opacity-90"></div>
            
            <!-- Video Mock Thumbnail Visuals -->
            <div class="relative z-10 max-w-lg space-y-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-orange-500/40 group-hover:scale-110 transition duration-300 cursor-pointer" onclick="document.getElementById('demo').scrollIntoView({behavior: 'smooth'})">
                <svg class="w-8 h-8 ml-1 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div>
                <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-mono font-semibold text-orange-200 mb-2">Tonton Preview Demo • 01:00</span>
                <h3 class="text-xl sm:text-2xl font-bold tracking-tight">Simulasi Alur Transaksi Bot Telegram TataDana</h3>
                <p class="text-xs sm:text-sm text-slate-300 mt-1">Lihat bagaimana chat "Kopi Kenangan 28rb" langsung memotong saldo dompet dan mengupdate budget seketika.</p>
              </div>
            </div>

            <!-- Video Player Controls Placeholder -->
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs text-slate-300 font-mono z-10">
              <div class="flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-orange-500 animate-ping"></span>
                <span>TataDana Live Preview HD</span>
              </div>
              <span>00:15 / 01:00</span>
            </div>
          </div>
        </div>

        <!-- 3. Problem vs Solution Section (#masalah) -->
        <div id="masalah" class="pt-16 max-w-5xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">PERBANDINGAN NYATA</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Kenapa Jutaan Orang Berhenti Mencatat Keuangan?</h2>
            <p class="text-xs sm:text-sm text-slate-500">Perbedaan nyata mengelola uang dengan cara lama yang rumit vs ekosistem cerdas TataDana.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Problem Card -->
            <div class="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4 font-bold">
                ✕
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-4">Cara Lama yang Melelahkan</h3>
              <ul class="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold">✕</span>
                  <span><b>Aplikasi ribet bikin malas:</b> Harus buka app, tunggu loading, klik 5 menu cuma buat catat parkir 5 ribu.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold">✕</span>
                  <span><b>Struk belanja hilang:</b> Bon kertas menumpuk di dompet, tinta memudar, akhirnya dibuang tanpa dicatat.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold">✕</span>
                  <span><b>Spreadsheet rumit ditinggal:</b> Bikin Excel di laptop hanya bertahan seminggu, tidak sempat diupdate saat bepergian.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold">✕</span>
                  <span><b>Saldo rekening tidak sinkron:</b> Uang di bank, e-wallet, dan dompet fisik tercampur aduk tanpa kejelasan.</span>
                </li>
              </ul>
            </div>

            <!-- Solution Card -->
            <div class="bg-gradient-to-b from-orange-50/60 to-white border-2 border-orange-400 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div class="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl mb-4 font-bold shadow-md shadow-orange-500/30">
                ✓
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>Bersama TataDana</span>
                <span class="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full uppercase">Solusi Cerdas</span>
              </h3>
              <ul class="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><b>Catat dalam 3 detik:</b> Cukup ketik "Kopi Kenangan 28rb" langsung di chat Telegram tanpa install app baru.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><b>AI OCR & Voice Note:</b> Foto struk belanjaan atau kirim pesan suara, AI membaca merchant & rincian totalnya.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><b>Multi-Wallet Otomatis:</b> Pisahkan BCA, Mandiri, GoPay, dan Cash dengan pemotongan saldo real-time.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span><b>Ekspor PDF & Excel Sekali Klik:</b> Laporan keuangan rapi berstandar akuntansi siap diunduh kapan saja.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 4. Interactive Live Demo Simulator & Telegram Chat Simulator (#demo) -->
        <div id="demo" class="pt-24 max-w-5xl mx-auto">
          <div class="text-center mb-10">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">INTERACTIVE LIVE DEMO</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Simulasi Balasan Bot Telegram TataDana</h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Klik tombol cepat di bawah atau ketik pengeluaranmu sendiri untuk melihat balasan bot dan sinkronisasi saldo secara langsung.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left Column: Smartphone Telegram Chat Simulator (7 Cols) -->
            <div class="lg:col-span-7 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <!-- Telegram Header -->
              <div class="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow">
                    TD
                  </div>
                  <div>
                    <div class="text-sm font-bold flex items-center gap-1.5">
                      TataDana Finance Bot
                      <svg class="w-4 h-4 text-sky-400 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div class="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      bot • online 24/7 (Asia/Jakarta)
                    </div>
                  </div>
                </div>
                <span class="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">@tatadana_finance_bot</span>
              </div>

              <!-- Telegram Messages Area -->
              <div id="demoChatMessages" class="p-4 sm:p-5 bg-slate-100/70 space-y-3.5 min-h-[320px] max-h-[380px] overflow-y-auto text-xs">
                <!-- Welcome Bot Message -->
                <div class="flex items-start gap-2">
                  <div class="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">TD</div>
                  <div class="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm p-3.5 shadow-sm text-slate-800 max-w-[85%] leading-relaxed">
                    Halo! 👋 Saya <b>TataDana Bot</b>.<br>
                    Ketik nominal dan kebutuhanmu (contoh: <i>"Beli kopi 25rb"</i> atau <i>"Gaji 7.5jt"</i>), atau pilih contoh tombol cepat di bawah!
                  </div>
                </div>
              </div>

              <!-- Quick Action Pills -->
              <div class="p-3 bg-slate-50 border-t border-slate-200">
                <div class="text-[11px] text-slate-500 font-medium mb-2">Contoh Cepat (Klik untuk uji coba):</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" onclick="sendDemoChat('Kopi Kenangan 28rb')" class="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg text-xs text-slate-700 transition cursor-pointer">
                    ☕ Kopi Kenangan 28rb
                  </button>
                  <button type="button" onclick="sendDemoChat('Beli bensin pertamax 50rb')" class="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg text-xs text-slate-700 transition cursor-pointer">
                    ⛽ Bensin 50rb
                  </button>
                  <button type="button" onclick="sendDemoChat('Gaji bulanan 7.5jt')" class="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs text-emerald-700 transition cursor-pointer">
                    💼 Gaji 7.5jt
                  </button>
                  <button type="button" onclick="sendDemoChat('Makan siang padang 35k')" class="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg text-xs text-slate-700 transition cursor-pointer">
                    🍛 Makan Siang 35k
                  </button>
                </div>
              </div>

              <!-- Chat Input Box -->
              <div class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input id="demoChatInput" type="text" placeholder="Ketik transaksi... (contoh: Bakso 20rb)" onkeydown="if(event.key==='Enter') sendDemoChatFromInput()" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30">
                <button type="button" onclick="sendDemoChatFromInput()" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Kirim
                </button>
              </div>
            </div>

            <!-- Right Column: Interactive Dashboard Preview (5 Cols) -->
            <div class="lg:col-span-5 space-y-4">
              <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Wallet Preview</h4>
                  </div>
                  <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">BCA Utama</span>
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span class="text-[11px] text-slate-500 block">Saldo Real-Time</span>
                  <div id="demoLiveSaldo" class="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">Rp 4.972.000</div>
                  <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Pengeluaran Hari Ini:</span>
                    <span id="demoLivePengeluaran" class="font-bold text-rose-600 font-mono">Rp 28.000</span>
                  </div>
                </div>

                <!-- Budget Progress -->
                <div class="space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600 text-[11px]">
                    <span>Budget Makanan & Minuman</span>
                    <span id="demoBudgetPercent" class="font-bold text-orange-600 font-mono">28% Terpakai</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div id="demoBudgetProgressBar" class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500" style="width: 28%;"></div>
                  </div>
                  <div class="text-[10px] text-slate-400 text-right">Limit Bulanan: Rp 1.500.000</div>
                </div>

                <div class="p-3 bg-orange-50/80 border border-orange-200 rounded-xl text-[11px] text-orange-900 flex items-start gap-2">
                  <span class="text-base">💡</span>
                  <span>Data di atas disimulasikan dari obrolan bot secara instan tanpa reload browser!</span>
                </div>

                <button onclick="navigate('/login')" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Mulai Gunakan Akun Asli &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- 5. Alternating 3 Feature Blocks (#fitur) -->
        <div id="fitur" class="pt-28 max-w-6xl mx-auto space-y-20">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">FITUR UNGGULAN EKSEKUTIF</span>
            <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Semua yang Kamu Butuhkan untuk Finansial yang Sehat</h2>
            <p class="text-xs sm:text-sm text-slate-500">Dirancang khusus untuk ritme hidup cepat di Indonesia, dari chat harian hingga laporan SPT pajak tahunan.</p>
          </div>

          <!-- Feature Block 1: Multi-Modal Input -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div class="space-y-4">
              <span class="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono text-xs font-bold">01 • MULTI-MODAL INPUT</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Catat via Teks Bebas, Pesan Suara, atau Foto Struk</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tidak perlu mengetik format kaku. Tuliskan "beli kopi 25rb", kirim voice note sambil berkendara, atau jepret struk belanja bulanan di supermarket. AI Vision TataDana mengekstrak merchant, tanggal, rincian per-item, dan total nominal secara presisi.
              </p>
              <ul class="space-y-2 text-xs text-slate-700">
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Pengenalan nominal khas Indonesia ("15rb", "1.5jt", "500k")</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Transkripsi voice note otomatis hingga durasi 60 detik</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Multi-item receipt scanner khusus pengguna PRO VIP</li>
              </ul>
            </div>
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">📸</div>
                  <div>
                    <div class="text-xs font-bold text-slate-800">Scan Struk Supermarket</div>
                    <div class="text-[10px] text-slate-400">Total 3 item terdeteksi</div>
                  </div>
                </div>
                <div class="text-xs space-y-1.5 font-mono">
                  <div class="flex justify-between text-slate-600"><span>1. Susu Segar 1L</span><span>Rp 24.500</span></div>
                  <div class="flex justify-between text-slate-600"><span>2. Roti Gandum</span><span>Rp 18.000</span></div>
                  <div class="flex justify-between text-slate-600"><span>3. Telur Ayam 1kg</span><span>Rp 32.000</span></div>
                  <div class="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                    <span>TOTAL TRANSAKSI</span>
                    <span class="text-orange-600">Rp 74.500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Block 2: Multi-Wallet Management -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div class="order-2 md:order-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span class="text-[10px] text-slate-400 font-bold block">🏦 BCA UTAMA (DEFAULT)</span>
                  <span class="text-base font-extrabold text-slate-900 font-mono mt-1 block">Rp 8.450.000</span>
                  <span class="text-[10px] text-emerald-600 mt-1 block">● Rekening Operasional</span>
                </div>
                <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span class="text-[10px] text-slate-400 font-bold block">📱 GOPAY / OVO</span>
                  <span class="text-base font-extrabold text-slate-900 font-mono mt-1 block">Rp 650.000</span>
                  <span class="text-[10px] text-orange-600 mt-1 block">● Belanja Harian</span>
                </div>
                <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span class="text-[10px] text-slate-400 font-bold block">🏦 BANK MANDIRI</span>
                  <span class="text-base font-extrabold text-slate-900 font-mono mt-1 block">Rp 15.200.000</span>
                  <span class="text-[10px] text-sky-600 mt-1 block">● Tabungan & Darurat</span>
                </div>
                <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span class="text-[10px] text-slate-400 font-bold block">💵 KAS TUNAI</span>
                  <span class="text-base font-extrabold text-slate-900 font-mono mt-1 block">Rp 420.000</span>
                  <span class="text-[10px] text-slate-500 mt-1 block">● Uang Dompet Fisik</span>
                </div>
              </div>
            </div>
            <div class="order-1 md:order-2 space-y-4">
              <span class="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono text-xs font-bold">02 • MULTI-WALLET & TRANSFER</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Kelola Seluruh Rekening Bank & E-Wallet di Satu Layar</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pisahkan dana operasional bulanan, pos tabungan darurat, dan uang jajan tanpa pusing. TataDana mendukung multi-wallet fleksibel dengan penandaan dompet utama (default) dan fitur transfer saldo antar-dompet instan.
              </p>
              <ul class="space-y-2 text-xs text-slate-700">
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Pengaturan dompet default untuk transaksi cepat via bot</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Mutasi transfer antar-dompet tercatat rapi tanpa mengacaukan cashflow</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Dukungan tak terbatas untuk dompet bank, e-wallet, dan kas tunai</li>
              </ul>
            </div>
          </div>

          <!-- Feature Block 3: Executive Reports & Export -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div class="space-y-4">
              <span class="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono text-xs font-bold">03 • LAPORAN & EKSPOR RESMI</span>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Laporan Keuangan Rapi Siap Ekspor ke PDF dan Excel</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pantau visualisasi arus kas dengan grafik tren 6 bulan, diagram alokasi belanja per kategori, dan tabel mutasi lengkap. Saat dibutuhkan untuk rekonsiliasi, unduh berkas resmi PDF berdesain eksekutif atau spreadsheet Excel (.xlsx) dengan signed URL aman.
              </p>
              <ul class="space-y-2 text-xs text-slate-700">
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Ekspor dokumen PDF resmi murni berbasis server</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Ekspor OpenXML Excel (.xlsx) siap olah di Google Sheet & Microsoft Excel</li>
                <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> Filter tanggal, kategori, dan dompet yang dinamis</li>
              </ul>
            </div>
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div class="text-xs font-bold text-slate-900">Preview Dokumen Eksekutif</div>
                  <span class="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded border border-orange-200 font-mono">PDF 1.4 & XLSX</span>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span class="text-orange-600">📄</span>
                    <span>Laporan_Keuangan_TataDana_Oktober_2026.pdf</span>
                  </div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    Dokumen dilengkapi header resmi, metrik ringkasan arus kas, tabel transaksi detail, stempel verifikasi sistem, dan timestamp Asia/Jakarta (WIB).
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 6. Masonry Testimonials Grid (#testimoni) -->
        <div id="testimoni" class="pt-28 max-w-6xl mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">TESTIMONI PENGGUNA</span>
            <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Dipercaya oleh Ribuan Profesional di Indonesia</h2>
            <p class="text-xs sm:text-sm text-slate-500">Kisah nyata mereka yang berhasil mengontrol arus kas dengan mudah bersama TataDana.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div class="flex items-center text-amber-400 text-sm">★★★★★</div>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                "Sebelumnya saya selalu lupa belanja apa saja waktu jajan di luar. Sekarang habis beli kopi langsung chat bot 'Kopi 28rb', saldo BCA langsung terpotong akurat. Sangat praktis!"
              </p>
              <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div class="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">BP</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Budi Pratama</div>
                  <div class="text-[10px] text-slate-400">Software Engineer • Jakarta</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div class="flex items-center text-amber-400 text-sm">★★★★★</div>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                "Fitur foto struknya juara banget! Beli perlengkapan resto banyak bon berceceran, tinggal difoto langsung masuk pembukuan tanpa harus input manual satu-satu."
              </p>
              <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">SN</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Siti Nurhaliza</div>
                  <div class="text-[10px] text-slate-400">Owner Café • Bandung</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div class="flex items-center text-amber-400 text-sm">★★★★★</div>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                "Ekspor laporan Excel dan PDF-nya sangat membantu waktu pelaporan keuangan bulanan. Desainnya rapi, modern, dan datanya tidak pernah hilang karena SQLite riil."
              </p>
              <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div class="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">RW</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Reza Wijaya</div>
                  <div class="text-[10px] text-slate-400">Freelance Designer • Surabaya</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Pricing Section (#pricing) -->
        <div id="pricing" class="pt-28 max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">PAKET & HARGA</span>
            <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Pilihan Investasi Finansial Terbaik</h2>
            <p class="text-xs sm:text-sm text-slate-500">Mulai gratis atau buka akses tanpa batas dengan harga terjangkau.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <!-- Starter Plan Card -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-lg font-bold text-slate-900">Starter Plan</h3>
                  <span class="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded">BULANAN</span>
                </div>
                <div class="text-3xl font-extrabold text-slate-900 font-mono mb-1">
                  Rp 49.000 <span class="text-xs font-normal text-slate-400 font-sans">/ bulan</span>
                </div>
                <p class="text-xs text-slate-500 mb-6">Cocok untuk pemula yang ingin mulai disiplin mencatat transaksi.</p>
                <ul class="space-y-3 text-xs text-slate-600">
                  <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> Maksimal 50 transaksi / bulan</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> 1 Dompet Keuangan Default</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> Catat Manual via Chat Telegram</li>
                  <li class="flex items-center gap-2"><span class="text-slate-300">✕</span> Scan Foto Struk OCR AI</li>
                  <li class="flex items-center gap-2"><span class="text-slate-300">✕</span> Voice Note Transcription</li>
                  <li class="flex items-center gap-2"><span class="text-slate-300">✕</span> Ekspor PDF Resmi & Excel</li>
                </ul>
              </div>
              <div class="pt-8">
                <button onclick="navigate('/login')" class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer">
                  Mulai dengan Starter &rarr;
                </button>
              </div>
            </div>

            <!-- Pro VIP Lifetime Card -->
            <div class="bg-gradient-to-b from-orange-50/50 to-white border-2 border-orange-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
              <span class="absolute top-4 right-4 text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                PALING POPULER
              </span>
              <div>
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-lg font-bold text-slate-900">Pro VIP Lifetime</h3>
                </div>
                <div class="text-3xl font-extrabold text-orange-600 font-mono mb-1">
                  Rp 99.000 <span class="text-xs font-normal text-slate-500 font-sans">Sekali Bayar Seumur Hidup</span>
                </div>
                <p class="text-xs text-slate-600 mb-6">Solusi komplit tanpa biaya langganan bulanan berulang.</p>
                <ul class="space-y-3 text-xs text-slate-700">
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Transaksi Tanpa Batas (Unlimited)</b></li>
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Multi-Wallet Tak Terbatas & Transfer</b></li>
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Scan Foto Struk OCR AI Cerdas</b></li>
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Transkripsi Voice Note Hingga 60s</b></li>
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Ekspor Dokumen PDF & Excel (.xlsx)</b></li>
                  <li class="flex items-center gap-2"><span class="text-orange-500 font-bold">✓</span> <b>Prioritas Otorisasi Admin WhatsApp</b></li>
                </ul>
              </div>
              <div class="pt-8">
                <button onclick="navigate('/login')" class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-500/30 transition cursor-pointer">
                  Ambil Paket Pro Sekali Bayar &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. FAQ Section (#faq) -->
        <div id="faq" class="pt-28 pb-20 max-w-4xl mx-auto text-left">
          <div class="text-center mb-12">
            <span class="text-xs font-mono text-orange-600 uppercase tracking-widest font-bold block mb-1">FREQUENTLY ASKED QUESTIONS</span>
            <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Pertanyaan yang Sering Diajukan</h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">Penjelasan transparan tentang keamanan, sistem registrasi, dan integrasi Telegram Bot.</p>
          </div>

          <div class="space-y-4">
            <!-- FAQ 1 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(1)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>1. Bagaimana cara mencatat keuangan lewat Telegram?</span>
                <span id="faqIcon-1" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-1" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                Anda cukup membuka obrolan ke bot resmi <b>@tatadana_finance_bot</b> di Telegram, lalu kirimkan pesan berformat bebas seperti: <code>Beli kopi 25rb</code> atau <code>Gaji 7.5jt</code>. Sistem backend AI kami langsung memprosesnya ke basis data SQLite Anda dalam 3 detik dengan status konfirmasi rapi.
              </div>
            </div>

            <!-- FAQ 2 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(2)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>2. Mengapa akun baru saya harus menunggu persetujuan (Pending Approval)?</span>
                <span id="faqIcon-2" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-2" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                TataDana mengimplementasikan kebijakan otorisasi Role-Based Access Control (RBAC) tingkat enterprise. Setiap pendaftar baru tertahan di status <i>Pending Approval</i> demi mencegah spam dan memverifikasi identitas pengguna sebelum diberikan akses penuh ke dashboard finansial.
              </div>
            </div>

            <!-- FAQ 3 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(3)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>3. Bagaimana cara konfirmasi verifikasi akun ke Admin?</span>
                <span id="faqIcon-3" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-3" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                Setelah selesai mendaftar, layar antarmuka akan menampilkan nomor WhatsApp Admin resmi di <b class="text-orange-600 font-mono">082115624408</b> beserta tombol langsung ke WhatsApp (wa.me/6282115624408). Cukup kirimkan nama dan email Anda agar Admin dapat menyetujui akun Anda seketika.
              </div>
            </div>

            <!-- FAQ 4 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(4)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>4. Apakah saya perlu menginstall aplikasi tambahan di ponsel?</span>
                <span id="faqIcon-4" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-4" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                Sama sekali tidak! Anda cukup menggunakan aplikasi Telegram yang sudah ada di smartphone Anda untuk mencatat transaksi sehari-hari, dan membuka web browser saat ingin melihat grafik dashboard atau mengunduh laporan.
              </div>
            </div>

            <!-- FAQ 5 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(5)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>5. Format nominal apa saja yang didukung oleh Bot?</span>
                <span id="faqIcon-5" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-5" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                TataDana mendukung seluruh ragam penulisan khas Indonesia seperti <code>15rb</code>, <code>500k</code>, <code>1.5jt</code>, <code>2.5 juta</code>, hingga angka baku <code>250.000</code>. Mesin parsing kami otomatis mengenali jenis transaksi pemasukan maupun pengeluaran.
              </div>
            </div>

            <!-- FAQ 6 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(6)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>6. Apakah data keuangan saya aman dan tersimpan permanen?</span>
                <span id="faqIcon-6" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-6" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                100% aman dan persisten. Seluruh data transaksi, multi-wallet, dan foto profil tersimpan di basis data terproteksi dengan enkripsi serta waktu zona WIB (Asia/Jakarta). Tidak ada data dummy yang hilang ketika browser di-refresh.
              </div>
            </div>

            <!-- FAQ 7 -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button onclick="toggleFaqAccordion(7)" class="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:text-orange-600 transition cursor-pointer">
                <span>7. Bisakah saya mengekspor laporan transaksi ke PDF dan Excel?</span>
                <span id="faqIcon-7" class="text-orange-600 font-mono text-base font-bold">+</span>
              </button>
              <div id="faqAns-7" class="hidden mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                Ya! Melalui menu Laporan pada dashboard, pengguna paket Pro VIP dapat mengunduh berkas laporan resmi PDF berdesain eksekutif atau spreadsheet Excel (.xlsx) dengan signed URL aman kapan saja dalam satu klik.
              </div>
            </div>
          </div>
        </div>

        <!-- 9. Final CTA Section (Gradient Orange) -->
        <div class="max-w-5xl mx-auto my-12 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div class="relative z-10 max-w-2xl mx-auto space-y-5">
            <span class="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-orange-100 uppercase tracking-wider">
              MULAI HARI INI
            </span>
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Kendalikan Arus Kas Kamu Sekarang Juga</h2>
            <p class="text-xs sm:text-sm text-orange-100 leading-relaxed">
              Bergabung bersama ribuan pengguna cerdas yang telah menikmati kemudahan mencatat keuangan langsung dari chat Telegram.
            </p>
            <div class="pt-2">
              <button onclick="navigate('/login')" class="px-8 py-4 bg-white hover:bg-orange-50 text-orange-700 font-extrabold rounded-2xl text-sm transition shadow-lg shadow-black/10 hover:scale-105 transform cursor-pointer">
                Daftar Akun TataDana Sekarang &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- 10. 4-Column Footer (Clean White/Slate, NO "Masuk Admin") -->
      <footer class="bg-white border-t border-slate-200 pt-16 pb-12 px-6">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200/80 text-xs text-slate-600">
          <!-- Col 1: Brand -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-xs font-bold">TD</div>
              <span class="text-base font-bold text-slate-900">Tata<span class="text-orange-600">Dana</span></span>
            </div>
            <p class="text-slate-500 leading-relaxed">
              SaaS manajemen keuangan pribadi dan bisnis modern terintegrasi penuh dengan Telegram Bot cerdas dan SQLite persisten.
            </p>
            <div class="text-[11px] text-slate-400 font-mono">
              Timezone: WIB (Asia/Jakarta) • Midtrans Verified
            </div>
          </div>

          <!-- Col 2: Fitur Produk -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Fitur Produk</h4>
            <ul class="space-y-2">
              <li><a href="#fitur" class="hover:text-orange-600 transition">Bot Telegram 24/7</a></li>
              <li><a href="#fitur" class="hover:text-orange-600 transition">Multi-Modal Input (OCR Struk)</a></li>
              <li><a href="#fitur" class="hover:text-orange-600 transition">Voice Note Transcription</a></li>
              <li><a href="#fitur" class="hover:text-orange-600 transition">Multi-Wallet Management</a></li>
              <li><a href="#fitur" class="hover:text-orange-600 transition">Alokasi Budgeting Bulanan</a></li>
            </ul>
          </div>

          <!-- Col 3: Paket & Solusi -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Paket & Solusi</h4>
            <ul class="space-y-2">
              <li><a href="#pricing" class="hover:text-orange-600 transition">Paket Starter (Rp49rb/bln)</a></li>
              <li><a href="#pricing" class="hover:text-orange-600 transition">Paket Pro VIP (Rp99rb Sekali Bayar)</a></li>
              <li><a href="#pricing" class="hover:text-orange-600 transition">Solusi Finansial UMKM</a></li>
              <li><a href="#pricing" class="hover:text-orange-600 transition">Keuangan Personal & Freelancer</a></li>
            </ul>
          </div>

          <!-- Col 4: Bantuan & WhatsApp Admin -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Pusat Bantuan</h4>
            <ul class="space-y-2">
              <li><a href="#faq" class="hover:text-orange-600 transition">Frequently Asked Questions</a></li>
              <li><a href="https://wa.me/6282115624408" target="_blank" class="hover:text-orange-600 transition font-semibold text-emerald-600 flex items-center gap-1.5"><span>💬</span> WhatsApp: 082115624408</a></li>
              <li><a href="javascript:void(0)" class="hover:text-orange-600 transition">Panduan Setup BotFather</a></li>
              <li><a href="javascript:void(0)" class="hover:text-orange-600 transition">Kebijakan Privasi & Ketentuan</a></li>
            </ul>
          </div>
        </div>

        <div class="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TataDana Technology Inc. Hak Cipta Dilindungi Undang-Undang.</p>
          <p class="font-mono text-[11px]">Designed with Clean Modern Orange-White Visual Identity</p>
        </div>
      </footer>

    </section>"""
