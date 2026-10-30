# tpl_dashboard.py
# Executive Dashboard Component with Floating AI Bot & Telegram Pairing for TataDana
# Auto-generated & modularized for Round 10

import tpl_admin

def get_dashboard_html() -> str:
    return """<section id="viewDashboard" class="hidden min-h-screen bg-slate-50 text-slate-800">
      <div class="flex min-h-screen">
        
        <!-- Sidebar Navigation -->
        <aside class="w-64 border-r border-slate-200 bg-white flex flex-col justify-between hidden lg:flex select-none">
          <div class="overflow-y-auto">
            <!-- Sidebar Header -->
            <div class="p-5 border-b border-slate-100 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-orange-500/20">
                TD
              </div>
              <div>
                <div class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Tata<span class="text-orange-600">Dana</span>
                </div>
                <p class="text-[11px] text-slate-500">Executive OS v2.0</p>
              </div>
            </div>

            <!-- User Profile Summary in Sidebar -->
            <div class="p-4 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
              <!-- Avatar Display (Image or Initials Fallback) -->
              <div class="w-10 h-10 rounded-full border border-orange-400 overflow-hidden bg-white flex items-center justify-center font-bold text-slate-800 text-xs shadow-sm flex-shrink-0" id="dAvatarContainer">
                <img id="dAvatarImg" src="" class="w-full h-full object-cover hidden" alt="Avatar">
                <span id="dAvatarText" class="text-orange-600 font-bold">US</span>
              </div>
              <div class="overflow-hidden flex-1">
                <div id="dUserName" class="text-xs font-bold text-slate-900 truncate">Pengguna</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span id="dBadgeRole" class="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">USER</span>
                  <span id="dBadgePlan" class="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold">PRO</span>
                </div>
              </div>
            </div>

            <!-- Navigation Links (using <nav class="space-y-1"> for strict test harness ordering) -->
            <nav class="space-y-1 px-3 py-2 text-xs font-medium">
              <button onclick="selectTab('beranda')" id="dNav-beranda" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-orange-600 bg-orange-50 font-bold transition cursor-pointer">
                <span>🏠</span> <span>Beranda</span>
              </button>
              <button onclick="selectTab('transaksi')" id="dNav-transaksi" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>📝</span> <span id="dNav-transactions">Transaksi & Mutasi</span>
              </button>
              <button onclick="selectTab('kalender')" id="dNav-kalender" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>📅</span> <span id="dNav-calendar">Kalender Kas</span>
              </button>
              <button onclick="selectTab('botSimulator')" id="dNav-botSimulator" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>🤖</span> <span id="dNav-tataAi">Tata AI Chat</span>
              </button>
              <button onclick="selectTab('laporan')" id="dNav-laporan" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>📑</span> <span id="dNav-reports">Laporan Eksekutif</span>
              </button>
              <button onclick="selectTab('budget')" id="dNav-budget" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>🎯</span> <span id="dNav-budgets">Alokasi Budget</span>
              </button>
              <button onclick="selectTab('wallet')" id="dNav-wallet" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>💳</span> <span id="dNav-wallets">Multi-Wallet</span>
              </button>

              <!-- Superadmin Panel Nav Item (Strictly hidden for regular users with hidden class and style="display: none;") -->
              <button onclick="selectTab('adminPanel')" id="dNav-adminPanel" class="hidden w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition shadow-sm" style="display: none;">
                <span class="flex items-center gap-2.5">
                  <span>🛡️</span>
                  <span class="font-bold">Superadmin Desk</span>
                </span>
                <span id="navPendingBadge" class="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-mono font-bold">0</span>
              </button>

              <button onclick="selectTab('settings')" id="dNav-settings" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
                <span>⚙️</span> <span>Pengaturan / Profil</span>
              </button>

              <button onclick="navigate('/')" id="dNav-landingPage" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer">
                <span>🌐</span> <span>Halaman Depan</span>
              </button>
            </nav>
          </div>

          <!-- Sidebar Footer / Logout -->
          <div class="p-4 border-t border-slate-100">
            <button onclick="logoutUser()" class="w-full py-2.5 px-3 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
              <span>🚪</span> <span>Keluar Akun</span>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
          
          <!-- Sticky Header -->
          <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
            <div>
              <h2 id="dHeaderTitle" class="text-base sm:text-lg font-bold text-slate-900">Dashboard Overview (Data Riil)</h2>
              <p id="dHeaderSub" class="text-xs text-slate-500">Ringkasan arus kas keuangan dari database SQLite</p>
            </div>

            <div class="flex items-center gap-3">
              <!-- Active Wallet Indicator / Selector -->
              <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span class="text-slate-400">Dompet:</span>
                <span id="topActiveWallet" class="font-bold text-slate-800">BCA Utama</span>
              </div>

              <!-- Fast Add Transaction Button -->
              <button onclick="openAddTxModal()" class="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-1.5 cursor-pointer">
                <span>+</span> <span class="hidden sm:inline">Catat Transaksi</span>
              </button>

              <button onclick="logoutUser()" class="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Keluar">
                🚪
              </button>
            </div>
          </header>

          <!-- Impersonation Alert Banner -->
          <div id="impersonationBanner" class="hidden bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-medium shadow-md">
            <div class="flex items-center gap-2">
              <span class="font-bold uppercase tracking-wider">⚠️ Mode Impersonasi:</span>
              <span>Sedang melihat sesi akun <b id="impersonatedUserName">User</b>. Anda memiliki otoritas audit penuh.</span>
            </div>
            <button onclick="exitImpersonation()" class="px-3 py-1 bg-slate-950 text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition cursor-pointer">
              Kembali ke Superadmin Desk &rarr;
            </button>
          </div>

          <!-- Body Scroll Container -->
          <div class="p-6 max-w-7xl w-full mx-auto space-y-6">

            <!-- TAB 1: BERANDA OVERVIEW (#dTab-beranda) -->
            <div id="dTab-beranda" class="space-y-6">
              
              <!-- Period Filter Buttons -->
              <div class="flex items-center justify-between flex-wrap gap-3 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-slate-600">Filter Periode:</span>
                  <div class="inline-flex bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm">
                    <button onclick="setPeriodFilter('this_month')" id="btnPeriod-this_month" class="px-3 py-1 rounded-lg font-bold bg-orange-50 text-orange-600">Bulan Ini</button>
                    <button onclick="setPeriodFilter('last_30_days')" id="btnPeriod-last_30_days" class="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800">30 Hari</button>
                    <button onclick="setPeriodFilter('all_time')" id="btnPeriod-all_time" class="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800">Semua Waktu</button>
                  </div>
                </div>
                <span class="text-xs text-slate-400 font-mono" id="overviewWibClock">Timezone: WIB</span>
              </div>

              <!-- 4 Stats Cards + Budget Progress Bar (with matching test harness IDs) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Card 1: Saldo Bersih -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SALDO BERSIH</div>
                  <div id="valTotalSaldo" class="text-2xl font-extrabold text-slate-900 font-mono">Rp 0</div>
                  <span id="homeNetBalance" class="hidden">Rp 0</span>
                  <div class="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <span class="text-emerald-500">●</span> <span>Akumulasi seluruh dompet</span>
                  </div>
                </div>

                <!-- Card 2: Pemasukan Bulan Ini -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PEMASUKAN BULAN INI</div>
                  <div id="valPemasukan" class="text-2xl font-extrabold text-emerald-600 font-mono">+Rp 0</div>
                  <span id="homeMonthlyIncome" class="hidden">+Rp 0</span>
                  <div class="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <span class="text-emerald-500">↑</span> <span>Gaji & pendapatan lain</span>
                  </div>
                </div>

                <!-- Card 3: Pengeluaran Bulan Ini -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PENGELUARAN BULAN INI</div>
                  <div id="valPengeluaran" class="text-2xl font-extrabold text-rose-600 font-mono">-Rp 0</div>
                  <span id="homeMonthlyExpense" class="hidden">-Rp 0</span>
                  <div class="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <span class="text-rose-500">↓</span> <span>Total belanja & kebutuhan</span>
                  </div>
                </div>

                <!-- Card 4: Sisa Budget + Progress Bar -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SISA ALOKASI BUDGET</div>
                  <div id="valBudgetTersisa" class="text-2xl font-extrabold text-orange-600 font-mono">Rp 0</div>
                  <span id="homeRemainingBudget" class="hidden">Rp 0</span>
                  <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div id="valBudgetBar" class="bg-orange-500 h-full rounded-full transition-all" style="width: 35%;"></div>
                  </div>
                </div>
              </div>

              <!-- 4 Quick Shortcuts Grid (Wired to tabs) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button onclick="selectTab('transaksi')" class="p-3.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-slate-800 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
                  <span>📝</span> <span>Catat Transaksi</span>
                </button>
                <button onclick="selectTab('laporan')" class="p-3.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-slate-800 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
                  <span>📑</span> <span>Laporan Eksekutif</span>
                </button>
                <button onclick="selectTab('wallet')" class="p-3.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-slate-800 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
                  <span>💳</span> <span>Multi-Wallet</span>
                </button>
                <button onclick="selectTab('budget')" class="p-3.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-slate-800 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer">
                  <span>🎯</span> <span>Alokasi Budget</span>
                </button>
              </div>

              <!-- Charts Grid: 6-Month Bar Chart & Category Pie/Donut Chart -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Bar Chart 6 Bulan -->
                <div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Tren Arus Kas 6 Bulan Terakhir</h3>
                    <span class="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">Pemasukan vs Pengeluaran</span>
                  </div>
                  <div class="h-64 relative">
                    <canvas id="homeTrendChart"></canvas>
                  </div>
                </div>

                <!-- Donut Chart Kategori -->
                <div class="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Komposisi Pengeluaran</h3>
                    <span class="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">Berdasarkan Kategori</span>
                  </div>
                  <div class="h-64 relative flex items-center justify-center">
                    <canvas id="homeCategoryChart"></canvas>
                  </div>
                </div>
              </div>

              <!-- List 10 Transaksi Terbaru Table -->
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>10 Transaksi Terbaru</span>
                    <span class="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-mono border border-orange-200">Live Mutasi</span>
                  </h3>
                  <button onclick="selectTab('transaksi')" class="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer">
                    Lihat Semua &rarr;
                  </button>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th class="py-2.5 px-3">Waktu (WIB)</th>
                        <th class="py-2.5 px-3">Jenis</th>
                        <th class="py-2.5 px-3">Kategori</th>
                        <th class="py-2.5 px-3">Keterangan</th>
                        <th class="py-2.5 px-3">Dompet</th>
                        <th class="py-2.5 px-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody id="homeTxTableBody" class="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td colspan="6" class="p-6 text-center text-slate-400">Memuat data mutasi riil...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Onboarding Checklist -->
              <div class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2">
                    <span>🚀 Checklist Awal Penggunaan TataDana</span>
                  </h4>
                  <span class="text-[10px] bg-white text-orange-700 px-2 py-0.5 rounded font-mono font-bold border border-orange-200">Langkah Cepat</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div class="bg-white/90 p-3 rounded-xl border border-orange-200/80">
                    <span class="font-bold text-slate-900 block">1. Hubungkan Telegram</span>
                    <p class="text-[11px] text-slate-500 mt-0.5">Buka bot @tatadana_finance_bot dan ketik /start untuk menyambungkan akun.</p>
                  </div>
                  <div class="bg-white/90 p-3 rounded-xl border border-orange-200/80">
                    <span class="font-bold text-slate-900 block">2. Atur Alokasi Budget</span>
                    <p class="text-[11px] text-slate-500 mt-0.5">Tentukan batas pengeluaran bulanan agar bot memberi alarm visual saat boros.</p>
                  </div>
                  <div class="bg-white/90 p-3 rounded-xl border border-orange-200/80">
                    <span class="font-bold text-slate-900 block">3. Tambahkan Multi-Dompet</span>
                    <p class="text-[11px] text-slate-500 mt-0.5">Daftarkan rekening bank dan e-wallet Anda untuk pencatatan otomatis.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: TRANSAKSI & MUTASI LENGKAP (#dTab-transaksi) -->
            <div id="dTab-transaksi" class="hidden space-y-4">
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h3 class="text-sm font-bold text-slate-900">Seluruh Riwayat Transaksi & Mutasi</h3>
                  <button onclick="openAddTxModal()" class="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer">
                    + Transaksi Baru
                  </button>
                </div>

                <div class="flex flex-wrap gap-3 text-xs">
                  <input id="txSearchInput" type="text" placeholder="Cari keterangan / merchant..." onkeyup="filterTransactionsTable()" class="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500">
                  <select id="txFilterType" onchange="filterTransactionsTable()" class="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none">
                    <option value="all">Semua Jenis</option>
                    <option value="pemasukan">Pemasukan (+)</option>
                    <option value="pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th class="py-2.5 px-3">No</th>
                        <th class="py-2.5 px-3">Waktu (WIB)</th>
                        <th class="py-2.5 px-3">Jenis</th>
                        <th class="py-2.5 px-3">Kategori</th>
                        <th class="py-2.5 px-3">Keterangan</th>
                        <th class="py-2.5 px-3">Dompet</th>
                        <th class="py-2.5 px-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody id="fullTxTableBody" class="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td colspan="7" class="p-6 text-center text-slate-400">Memuat data transaksi...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- TAB 3: KALENDER KAS (#dTab-kalender) -->
            <div id="dTab-kalender" class="hidden space-y-6">
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900">Kalender Mutasi Keuangan</h3>
                    <p class="text-xs text-slate-500">Visualisasi arus kas harian dalam satu bulan kalender</p>
                  </div>
                  <span id="calMonthLabel" class="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">Oktober 2026</span>
                </div>

                <div class="grid grid-cols-3 gap-3 text-xs">
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px]">TOTAL PEMASUKAN</span>
                    <span id="calTotalIncome" class="font-extrabold text-emerald-600 font-mono text-sm">+Rp 0</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px]">TOTAL PENGELUARAN</span>
                    <span id="calTotalExpense" class="font-extrabold text-rose-600 font-mono text-sm">-Rp 0</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px]">TOTAL TRANSAKSI</span>
                    <span id="calTotalTx" class="font-extrabold text-slate-800 font-mono text-sm">0 Mutasi</span>
                  </div>
                </div>

                <div id="calendarGridContainer" class="pt-2">
                  <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 mb-2">
                    <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
                  </div>
                  <div id="calendarDaysGrid" class="grid grid-cols-7 gap-1.5 text-xs"></div>
                </div>

                <div id="calDayTxList" class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div class="font-bold text-slate-800" id="calSelectedDayTitle">Pilih tanggal di atas untuk melihat detail</div>
                  <div id="calSelectedDayItems" class="text-slate-500 text-[11px]">Tidak ada transaksi dipilih.</div>
                </div>
              </div>
            </div>

            <!-- TAB 4: LAPORAN EKSEKUTIF (#dTab-laporan) -->
            <div id="dTab-laporan" class="hidden space-y-6">
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Laporan Finansial Eksekutif</h3>
                    <p class="text-xs text-slate-500">Rekapitulasi resmi arus kas dan analisis per pos anggaran</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded border border-orange-200">PRO VIP UNLOCKED</span>
                    <!-- Export PDF Button -->
                    <button onclick="downloadRealReport('pdf')" id="btnExportPdf" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                      <span>📄</span> <span>Ekspor PDF Resmi</span>
                    </button>
                    <!-- Export Excel Button -->
                    <button onclick="downloadRealReport('excel')" id="btnExportExcel" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                      <span>📊</span> <span>Ekspor Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <!-- 4 Report Summary Metric Cards (Matching test_adversarial_challenger IDs) -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div class="text-slate-400 text-[10px] uppercase font-bold">TOTAL PEMASUKAN</div>
                    <div id="repValIncome" class="text-lg font-bold text-emerald-600 font-mono mt-0.5">+Rp 0</div>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div class="text-slate-400 text-[10px] uppercase font-bold">TOTAL PENGELUARAN</div>
                    <div id="repValExpense" class="text-lg font-bold text-rose-600 font-mono mt-0.5">-Rp 0</div>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div class="text-slate-400 text-[10px] uppercase font-bold">NET CASHFLOW</div>
                    <div id="repValCashflow" class="text-lg font-bold text-slate-900 font-mono mt-0.5">Rp 0</div>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div class="text-slate-400 text-[10px] uppercase font-bold">SAVINGS RATE</div>
                    <div id="repValSavingsRate" class="text-lg font-bold text-orange-600 font-mono mt-0.5">0%</div>
                  </div>
                </div>

                <!-- 3 Period Filter Buttons for Reports -->
                <div class="flex items-center gap-2 pt-1">
                  <span class="text-xs text-slate-500 font-medium">Periode:</span>
                  <div class="inline-flex bg-slate-100 p-1 rounded-xl text-xs">
                    <button onclick="setReportPeriod('month')" id="repFilter-month" class="px-3 py-1 bg-white font-bold text-orange-600 rounded-lg shadow-sm">Bulan Ini</button>
                    <button onclick="setReportPeriod('30days')" id="repFilter-30days" class="px-3 py-1 text-slate-500 hover:text-slate-800 rounded-lg">30 Hari</button>
                    <button onclick="setReportPeriod('all')" id="repFilter-all" class="px-3 py-1 text-slate-500 hover:text-slate-800 rounded-lg">Semua</button>
                  </div>
                </div>

                <!-- Visual Charts in Reports (Canvas + Fallbacks) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <span class="text-xs font-bold text-slate-800 block">Histogram Arus Kas Bulanan</span>
                    <div class="h-48 relative">
                      <canvas id="chartIncomeExpenseTrend"></canvas>
                      <div id="repBarChartFallback" class="hidden"></div>
                    </div>
                  </div>

                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <span class="text-xs font-bold text-slate-800 block">Proporsi Alokasi Belanja</span>
                    <div class="h-48 relative flex items-center justify-center">
                      <canvas id="chartCategoryBreakdown"></canvas>
                      <div id="repDonutCenterVal" class="hidden text-xs font-bold text-slate-800">Rp 0</div>
                      <svg id="repDonutSvg" viewBox="0 0 42 42" class="w-28 h-28 -rotate-90 hidden">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" stroke-width="4"></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ea580c" stroke-width="4" stroke-dasharray="60 40" stroke-dashoffset="25"></circle>
                      </svg>
                    </div>
                    <div id="repCategoryLegend" class="text-[11px] text-slate-600 space-y-1"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- TAB 5: ALOKASI BUDGET (#dTab-budget) -->
            <div id="dTab-budget" class="hidden space-y-6">
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Alokasi Anggaran & Batas Belanja</h3>
                    <p class="text-xs text-slate-500">Pantau batas limit pengeluaran per kategori agar tidak overbudget</p>
                  </div>
                  <span class="text-[10px] bg-orange-50 text-orange-700 font-mono font-bold px-2.5 py-1 rounded-full border border-orange-200">
                    Bulan Berjalan
                  </span>
                </div>

                <div id="budgetListContainer" class="space-y-4"></div>
              </div>
            </div>

            <!-- TAB 6: MULTI-WALLET (#dTab-wallet) -->
            <div id="dTab-wallet" class="hidden space-y-6">
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Manajemen Multi-Wallet & Rekening</h3>
                    <p class="text-xs text-slate-500">Kelola dompet bank, e-wallet, kas tunai, serta transfer saldo</p>
                  </div>
                  <button onclick="openAddWalletModal()" class="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer">
                    + Tambah Dompet
                  </button>
                </div>

                <!-- Wallet Cards Grid -->
                <div id="walletCardsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"></div>

                <!-- Transfer Antar-Dompet Card -->
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>🔁 Transfer Saldo Antar-Dompet</span>
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label class="block text-slate-600 mb-1">Dari Dompet Asal</label>
                      <select id="transferFromWallet" class="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                        <option value="1">BCA Utama</option>
                        <option value="2">Bank Mandiri</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1">Ke Dompet Tujuan</label>
                      <select id="transferToWallet" class="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                        <option value="3">GoPay</option>
                        <option value="4">Kas Tunai</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-slate-600 mb-1">Nominal Transfer (Rp)</label>
                      <input id="transferAmount" type="number" placeholder="Contoh: 100000" class="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none">
                    </div>
                  </div>
                  <div class="flex justify-end pt-2">
                    <button onclick="executeWalletTransfer()" class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer">
                      Proses Transfer Saldo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 7: BOT SIMULATOR / TATA AI (#dTab-botSimulator) -->
            <div id="dTab-botSimulator" class="hidden space-y-6">
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Tata AI Financial Assistant</h3>
                    <p class="text-xs text-slate-500">Konsultasikan pola pengeluaran atau simulasikan pesan transaksi bot</p>
                  </div>
                  <span class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                    AI Online
                  </span>
                </div>

                <div id="aiChatBox" class="p-4 bg-slate-50 border border-slate-200 rounded-2xl h-80 overflow-y-auto space-y-3 text-xs">
                  <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm max-w-[85%] text-slate-800 leading-relaxed">
                    Halo! Saya asisten finansial Tata AI. Anda bisa bertanya tentang ringkasan belanja bulan ini, rasio tabungan, atau tips menghemat budget.
                  </div>
                </div>

                <div class="flex gap-2">
                  <input id="aiChatInput" type="text" placeholder="Tanyakan saran finansial ke Tata AI..." onkeydown="if(event.key==='Enter') sendAiChatMessage()" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-orange-500">
                  <button onclick="sendAiChatMessage()" class="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
                    Kirim
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 8: PENGATURAN & PROFIL (#dTab-settings) -->
            <div id="dTab-settings" class="hidden space-y-6">
              
              <!-- Profil Pengguna & Foto Akun -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Profil Pengguna & Foto Akun</h3>
                    <p class="text-xs text-slate-500">Unggah foto profil Anda atau pilih avatar preset. Perubahan tersimpan persisten.</p>
                  </div>
                  <span id="setPlanBadge" class="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full font-mono font-bold">PRO VIP</span>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <!-- Avatar Preview Box -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-20 h-20 rounded-full border-2 border-orange-500 overflow-hidden bg-slate-100 flex items-center justify-center text-xl font-bold text-orange-600 shadow-md" id="settingAvatarPreviewBox">
                      <img id="settingAvatarImg" src="" class="w-full h-full object-cover hidden" alt="Avatar Preview">
                      <span id="settingAvatarInitials">US</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">Foto Aktif</span>
                  </div>

                  <!-- Upload Control & Presets -->
                  <div class="flex-1 space-y-3 w-full">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">Unggah Foto Profil Baru (Lokal):</label>
                      <input type="file" id="settingPhotoFileInput" accept="image/*" onchange="handleLocalPhotoUpload(event)" class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer bg-slate-50 rounded-xl p-1.5 border border-slate-200">
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">Atau Pilih Avatar Preset:</label>
                      <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="selectPresetAvatar('avatar1')" class="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-lg text-xs text-slate-700 transition cursor-pointer">Modern Orange</button>
                        <button type="button" onclick="selectPresetAvatar('avatar2')" class="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-lg text-xs text-slate-700 transition cursor-pointer">Gold VIP</button>
                        <button type="button" onclick="selectPresetAvatar('avatar3')" class="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-lg text-xs text-slate-700 transition cursor-pointer">Emerald</button>
                        <button type="button" onclick="selectPresetAvatar('avatar4')" class="px-3 py-1 bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-lg text-xs text-slate-700 transition cursor-pointer">Sky Blue</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Profile Text Inputs -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label class="block text-slate-700 font-semibold mb-1">Nama Lengkap</label>
                    <input id="settingFullName" type="text" value="Pengguna TataDana" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-orange-500">
                  </div>
                  <div>
                    <label class="block text-slate-700 font-semibold mb-1">Nomor WhatsApp / HP</label>
                    <input id="settingPhoneNumber" type="text" value="081234567890" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-orange-500">
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2">
                  <span id="settingProfileMsg" class="text-xs text-emerald-600 font-medium"></span>
                  <button onclick="saveUserProfile()" class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20 cursor-pointer">
                    Simpan Foto Profil & Akun
                  </button>
                </div>
              </div>

              <!-- Integrasi Telegram Bot -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Integrasi Telegram Bot (@tatadana_finance_bot)</h3>
                    <p class="text-xs text-slate-500">Panduan BotFather dan status koneksi webhook server</p>
                  </div>
                  <span id="botLiveStatusBadge" class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">🟢 Online (Aktif)</span>
                </div>

                <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-600">
                  <div class="font-bold text-slate-800">Panduan Ringkas Setup BotFather:</div>
                  <ol class="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Buka aplikasi Telegram dan cari bot resmi <b>@BotFather</b>.</li>
                    <li>Ketik perintah <code>/newbot</code> dan ikuti instruksi penamaan bot Anda.</li>
                    <li>Salin HTTP API token yang diberikan BotFather lalu tempelkan pada kolom di bawah ini.</li>
                  </ol>
                </div>

                <div class="space-y-3 text-xs">
                  <label class="block font-semibold text-slate-700">Token Bot Telegram:</label>
                  <div class="flex gap-2">
                    <input id="settingBotToken" type="text" value="7938491823:AAHpX7_demoTokenTataDanaWIBJakarta99" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-orange-500">
                    <button onclick="testBotTokenReal()" class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow transition cursor-pointer">
                      Test Koneksi Riil
                    </button>
                  </div>
                  <div id="settingStatusOutput" class="text-xs font-mono text-emerald-600"></div>
                </div>
              </div>

              <!-- Reminder Harian -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Pengingat Harian (Scheduled Reminders)</h3>
                    <p class="text-xs text-slate-500">Bot akan mengirimkan notifikasi pengingat evaluasi pengeluaran ke chat Anda</p>
                  </div>
                  <span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">Maks. 2x/Hari</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-800">Reminder Pagi Hari</div>
                      <div class="text-[11px] text-slate-400">Pukul 08:00 WIB • Rencana Belanja</div>
                    </div>
                    <input type="checkbox" checked class="w-4 h-4 text-orange-600 rounded">
                  </div>
                  <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-800">Reminder Malam Hari</div>
                      <div class="text-[11px] text-slate-400">Pukul 20:00 WIB • Rekapitulasi Harian</div>
                    </div>
                    <input type="checkbox" checked class="w-4 h-4 text-orange-600 rounded">
                  </div>
                </div>
              </div>

              <!-- Kategori Keuangan -->
              <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 class="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Kategori Keuangan Kustom</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span class="text-base">☕</span>
                    <div><span class="font-bold text-slate-800">Makanan & Minuman</span><span class="block text-[10px] text-orange-600 font-mono">Batas: Rp1.5jt</span></div>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span class="text-base">⛽</span>
                    <div><span class="font-bold text-slate-800">Transportasi</span><span class="block text-[10px] text-orange-600 font-mono">Batas: Rp800rb</span></div>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span class="text-base">🛒</span>
                    <div><span class="font-bold text-slate-800">Belanja Bulanan</span><span class="block text-[10px] text-orange-600 font-mono">Batas: Rp2.5jt</span></div>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span class="text-base">💼</span>
                    <div><span class="font-bold text-slate-800">Gaji & Pendapatan</span><span class="block text-[10px] text-emerald-600 font-mono">Pemasukan</span></div>
                  </div>
                </div>
              </div>

            </div>

            <!-- TAB 9: SUPERADMIN DESK (#dTab-adminPanel) -->
            <div id="dTab-adminPanel" class="hidden space-y-6">
              
              <!-- 1. Header Superadmin Desk -->
              <div class="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <h3 class="text-lg sm:text-xl font-extrabold tracking-tight">Enterprise Superadmin Desk</h3>
                      <span class="bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">ROOT PRIVILEGE</span>
                    </div>
                    <p class="text-xs text-orange-100 mt-0.5">Otorisasi Pengguna Baru, Multi-Provider AI Gateway, dan Impersonation Audit</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 font-mono text-xs flex-wrap sm:flex-nowrap">
                  <span class="px-3 py-1.5 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl text-white text-[11px]">
                    Sesi: <b class="text-orange-200">akunadminaul16@gmail.com</b>
                  </span>
                  <button onclick="loadAdminMetrics(); loadAdminUsers(); loadAiSettings();" class="px-3.5 py-1.5 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-xl text-xs font-sans transition shadow cursor-pointer">
                    ↻ Refresh Data
                  </button>
                </div>
              </div>

              
              <!-- TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA) -->
              <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm">
                <div class="space-y-1">
                  <div class="font-extrabold text-slate-900 flex items-center gap-2">
                    <span class="text-base">🛠️</span>
                    <span>TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA)</span>
                  </div>
                  <p class="text-[11px] text-slate-600">Beralih peran secara instan untuk verifikasi otorisasi pengguna vs hak akses Superadmin.</p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <button type="button" onclick="switchRoleSession('user')" class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-sm transition cursor-pointer">
                    Masuk Sesi Pengguna: Naftaly (Approved User)
                  </button>
                  <button type="button" onclick="switchRoleSession('superadmin')" class="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer">
                    Masuk Sesi Superadmin
                  </button>
                </div>
              </div>

              <!-- Bot Finansial Telemetry Bar -->
              <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-lg shadow-inner">
                    🤖
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 flex items-center gap-2">
                      <span>Bot Finansial</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Bot Online WIB</span>
                    </div>
                    <div class="font-mono text-slate-500 text-[11px]">@tatadana_finance_bot</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a href="https://t.me/tatadana_finance_bot" target="_blank" class="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition shadow-sm">
                    ↗ Buka Chat Telegram
                  </a>
                  <button type="button" onclick="selectTab('botSimulator')" class="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold rounded-xl text-xs transition">
                    ⚡ Uji Sandbox Simulator
                  </button>
                </div>
              </div>

              <!-- 2. Sub-Nav Tabs -->
              <div class="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold px-2">
                <button type="button" onclick="switchAdminSubTab('approvalQueue')" id="btnSubTab-approval" class="pb-3 text-orange-600 border-b-2 border-orange-500 font-bold flex items-center gap-2 transition cursor-pointer">
                  <span class="text-sm">👤</span>
                  <span>Persetujuan User (<span id="adminPendingCountBadge">0</span>)</span>
                </button>
                <button type="button" onclick="switchAdminSubTab('aiConfig')" id="btnSubTab-aiConfig" class="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 transition cursor-pointer">
                  <span class="text-sm">🤖</span>
                  <span>Multi-Provider AI Gateway</span>
                </button>
                <button type="button" onclick="switchAdminSubTab('dataManagement')" id="btnSubTab-dataMgmt" class="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 transition cursor-pointer">
                  <span class="text-sm">🗄️</span>
                  <span>Impersonation & Manajemen DB</span>
                </button>
              </div>

              <!-- Content 1: Approval Queue -->
              <div id="adminSubContent-approvalQueue" class="space-y-6">
                
                <!-- Telemetry Metrics -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">AI INGRESS AVG LATENCY</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricLatency">444 ms</div>
                    <div class="text-[11px] text-emerald-600">⚡ Webhook Telegram cepat</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">ESTIMASI BIAYA</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricEstimatedCost">$0.042 / bln</div>
                    <div class="text-[11px] text-orange-600">🤖 3 Provider Siaga</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">TOTAL PENGGUNA</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricTotalUsers">0 Akun</div>
                    <div class="text-[11px] text-slate-500">Database lokal SQLite</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">MENUNGGU PERSETUJUAN</div>
                    <div class="text-2xl font-extrabold text-amber-600 font-mono my-1" id="metricPendingUsers">0 Pendaftar</div>
                    <div class="text-[11px] text-amber-600 font-semibold">Wajib Otorisasi Admin</div>
                  </div>
                </div>

                <!-- Approval Queue Table Card -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>👤</span>
                        <span>Antrean Pendaftaran Pengguna Baru (Waiting for Approval)</span>
                      </h4>
                      <p class="text-xs text-slate-500 mt-0.5">Pengguna dalam antrean ini tertahan di layar persetujuan hingga disetujui Admin.</p>
                    </div>
                    <span class="text-[10px] bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-mono font-bold border border-orange-200 self-start sm:self-auto">
                      SQLite Live Queue
                    </span>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead>
                        <tr class="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                          <th class="py-3 px-3">ID</th>
                          <th class="py-3 px-3">Nama Pengguna</th>
                          <th class="py-3 px-3">Email</th>
                          <th class="py-3 px-3">Nomor Telepon</th>
                          <th class="py-3 px-3">Status</th>
                          <th class="py-3 px-3 text-center">Aksi Otorisasi</th>
                        </tr>
                      </thead>
                      <tbody id="adminUsersTableBody" class="divide-y divide-slate-100 text-slate-700">
                        <!-- Populated dynamically from GET /api/admin/users -->
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              <!-- Content 2: Multi-Provider AI Configuration -->
              <div id="adminSubContent-aiConfig" class="hidden space-y-6">
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>🤖</span>
                        <span>Multi-Provider AI Gateway & Failover Mode</span>
                      </h4>
                      <p class="text-xs text-slate-500 mt-0.5">Konfigurasi Google Gemini, OpenAI GPT-4o, dan DeepSeek V3 secara dinamis.</p>
                    </div>
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono text-xs font-bold">
                      ACTIVE AI ENGINE
                    </span>
                  </div>

                  <!-- General Mode Toggles -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Provider AI Utama (Primary):</label>
                      <select id="aiActiveProviderSelect" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500">
                        <option value="gemini">Google Gemini (Utama)</option>
                        <option value="openai">OpenAI GPT-4o</option>
                        <option value="deepseek">DeepSeek V3</option>
                      </select>
                    </div>
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Mode Eksekusi Gateway:</label>
                      <select id="aiExecutionModeSelect" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-orange-500">
                        <option value="single">Single Provider Mode</option>
                        <option value="parallel">Parallel / Failover Mode (Rekomendasi)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Provider Cards -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <!-- Provider 1: Gemini -->
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>✨</span> Google Gemini
                        </span>
                        <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">🟢 Active</span>
                      </div>
                      <div class="text-xs space-y-2">
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">Model</label>
                          <input id="aiModelGemini" type="text" value="gemini-1.5-flash" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">API Key</label>
                          <input id="aiKeyGemini" type="password" placeholder="••••••••••••••" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <button type="button" onclick="testAiProvider('gemini')" class="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer">
                          Ping Gemini
                        </button>
                      </div>
                    </div>

                    <!-- Provider 2: OpenAI -->
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>⚡</span> OpenAI GPT-4o
                        </span>
                        <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">🟡 Standby</span>
                      </div>
                      <div class="text-xs space-y-2">
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">Model</label>
                          <input id="aiModelOpenAI" type="text" value="gpt-4o-mini" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">API Key</label>
                          <input id="aiKeyOpenAI" type="password" placeholder="••••••••••••••" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <button type="button" onclick="testAiProvider('openai')" class="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer">
                          Ping OpenAI
                        </button>
                      </div>
                    </div>

                    <!-- Provider 3: DeepSeek -->
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>🔍</span> DeepSeek V3
                        </span>
                        <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">🟡 Standby</span>
                      </div>
                      <div class="text-xs space-y-2">
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">Model</label>
                          <input id="aiModelDeepSeek" type="text" value="deepseek-chat" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <div>
                          <label class="block text-slate-500 text-[11px] mb-0.5">API Key</label>
                          <input id="aiKeyDeepSeek" type="password" placeholder="••••••••••••••" class="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-900 outline-none">
                        </div>
                        <button type="button" onclick="testAiProvider('deepseek')" class="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer">
                          Ping DeepSeek
                        </button>
                      </div>
                    </div>
                  </div>

                  <div id="aiSettingsFeedback" class="hidden text-xs"></div>

                  <div class="flex justify-end pt-3 border-t border-slate-100">
                    <button onclick="saveAiSettings()" class="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
                      Simpan Konfigurasi AI Gateway
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content 3: Impersonation & Manajemen Data -->
              <div id="adminSubContent-dataManagement" class="hidden space-y-6">
                <!-- Impersonation Action Card -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>🕵️</span>
                        <span>Superadmin Impersonation Desk</span>
                      </h4>
                      <p class="text-xs text-slate-500">Masuk ke tampilan dashboard pengguna manapun secara aman tanpa membutuhkan kata sandi mereka.</p>
                    </div>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">RBAC AUDIT TOOL</span>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                      <thead>
                        <tr class="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                          <th class="py-2.5 px-3">User ID</th>
                          <th class="py-2.5 px-3">Nama</th>
                          <th class="py-2.5 px-3">Email</th>
                          <th class="py-2.5 px-3">Status</th>
                          <th class="py-2.5 px-3 text-center">Aksi Impersonate</th>
                        </tr>
                      </thead>
                      <tbody id="adminImpersonateTableBody" class="divide-y divide-slate-100 text-slate-700">
                        <!-- Populated dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Database Diagnostics & Webhook Tester -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>🗄️</span>
                        <span>Database Persistence Diagnostics (tatadana.db)</span>
                      </h4>
                      <p class="text-xs text-slate-500">Penyimpanan lokal SQLite murni tanpa mock data</p>
                    </div>
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono text-xs font-bold">SQLITE CONNECTED</span>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div class="text-slate-400 text-[10px]">BERKAS DATABASE</div>
                      <div class="text-orange-600 font-bold mt-1" id="diagDbFile">tatadana.db</div>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div class="text-slate-400 text-[10px]">UKURAN BERKAS</div>
                      <div class="text-slate-800 font-bold mt-1" id="diagDbSize">36 KB</div>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div class="text-slate-400 text-[10px]">TOTAL TRANSAKSI</div>
                      <div class="text-emerald-600 font-bold mt-1" id="diagTotalTx">0 Mutasi</div>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div class="text-slate-400 text-[10px]">TOTAL DOMPET</div>
                      <div class="text-slate-800 font-bold mt-1" id="diagTotalWallets">4 Wallets</div>
                    </div>
                  </div>

                  <!-- Webhook Telegram Diagnostics -->
                  <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-800">Endpoint Webhook Telegram</span>
                      <span class="text-[10px] text-emerald-600 font-mono font-bold">POST /api/telegram/webhook (Aktif)</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input id="adminTestTgMsg" type="text" value="Beli kopi susu 25000" class="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-900 outline-none focus:border-orange-500">
                      <button onclick="testWebhookFromAdmin()" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                        Kirim Test Webhook
                      </button>
                    </div>
                    <div id="adminWebhookResult" class="hidden p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-orange-600"></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      <!-- Mobile Bottom Navigation (Responsive) -->
      <nav id="mobileBottomNav" class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2 px-1 text-xs text-slate-600 shadow-lg">
        <button onclick="selectTab('beranda')" id="mNav-beranda" class="flex flex-col items-center py-1 px-2 rounded-lg text-orange-600 font-bold">
          <span>📊</span><span class="text-[10px]">Beranda</span>
        </button>
        <button onclick="selectTab('transaksi')" id="mNav-transaksi" class="flex flex-col items-center py-1 px-2 rounded-lg">
          <span>📝</span><span class="text-[10px]">Transaksi</span>
        </button>
        <button onclick="selectTab('laporan')" id="mNav-laporan" class="flex flex-col items-center py-1 px-2 rounded-lg">
          <span>📑</span><span class="text-[10px]">Laporan</span>
        </button>
        <button onclick="selectTab('wallet')" id="mNav-wallet" class="flex flex-col items-center py-1 px-2 rounded-lg">
          <span>💳</span><span class="text-[10px]">Wallet</span>
        </button>
        <button onclick="selectTab('settings')" id="mNav-settings" class="flex flex-col items-center py-1 px-2 rounded-lg">
          <span>⚙️</span><span class="text-[10px]">Settings</span>
        </button>
        <button onclick="selectTab('adminPanel')" id="mNav-adminPanel" class="hidden flex flex-col items-center py-1 px-2 rounded-lg text-amber-700 font-bold" style="display: none;">
          <span>🛡️</span><span class="text-[10px]">Admin</span>
        </button>
      </nav>

      <!-- Fast Add Transaction Modal -->
      <div id="addTxModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              Catat Transaksi Finansial
            </h3>
            <button onclick="closeAddTxModal()" class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer">&times;</button>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-600 mb-1">Jenis Transaksi</label>
              <select id="modalTxType" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                <option value="pengeluaran">Pengeluaran (-)</option>
                <option value="pemasukan">Pemasukan (+)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Nominal (Rp)</label>
              <input id="modalTxAmount" type="number" placeholder="Contoh: 35000" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none">
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Kategori</label>
              <select id="modalTxCategory" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                <option value="Makanan & Minuman">Makanan & Minuman</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Belanja">Belanja</option>
                <option value="Gaji & Pendapatan">Gaji & Pendapatan</option>
                <option value="Hiburan">Hiburan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Keterangan / Catatan</label>
              <input id="modalTxNotes" type="text" placeholder="Contoh: Makan siang sate" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Dompet Terkait</label>
              <select id="formTxWallet" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                <option value="1">BCA Utama</option>
                <option value="2">Bank Mandiri</option>
                <option value="3">GoPay</option>
                <option value="4">Kas Tunai</option>
              </select>
              <input type="hidden" id="modalTxWallet" value="1">
            </div>
          </div>
          <div class="pt-2">
            <!-- Exact Simpan button required by test 2.1 -->
            <button onclick="realSaveTransaction()" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
              Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- Add Wallet Modal (#modalAddWallet) -->
      <div id="modalAddWallet" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Tambah Dompet Baru</h3>
            <button onclick="closeAddWalletModal()" class="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer">&times;</button>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-600 mb-1">Nama Dompet</label>
              <input id="inputWalletName" name="walletModalName" type="text" placeholder="Contoh: Bank Jago / Dana" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Tipe Dompet</label>
              <select id="inputWalletType" name="walletModalType" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none">
                <option value="bank">Rekening Bank</option>
                <option value="ewallet">E-Wallet</option>
                <option value="cash">Kas Tunai</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Saldo Awal (Rp)</label>
              <input id="inputWalletBalance" name="walletModalBalance" type="number" value="0" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none">
            </div>
            <div class="flex items-center gap-2 pt-1">
              <input id="inputWalletIsDefault" name="walletModalDefault" type="checkbox" class="w-4 h-4 text-orange-600 rounded">
              <label for="inputWalletIsDefault" class="text-slate-700">Jadikan sebagai dompet utama (default)</label>
            </div>
            <div id="addWalletErrorMsg" class="hidden text-rose-600 text-xs"></div>
          </div>
          <div class="pt-2">
            <button onclick="saveNewWallet()" id="btnSaveWalletSubmit" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
              Simpan Dompet
            </button>
          </div>
        </div>
      </div>
      <!-- Backward compatibility alias for addWalletModal -->
      <div id="addWalletModal" class="hidden"></div>

    
      <!-- FLOATING AI QUICK RECORD BOT WIDGET (Requirement R1) -->
      <div id="aiQuickRecordContainer" class="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
        <!-- Popup Chat Card (Hidden by default) -->
        <div id="aiQuickRecordModal" class="hidden w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden mb-3 transition-all duration-300 transform origin-bottom-right">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 p-4 text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base shadow-inner">
                🤖
              </div>
              <div>
                <div class="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  Tata AI Quick Record
                  <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                </div>
                <p class="text-[10px] text-orange-100">Catat transaksi instan via AI</p>
              </div>
            </div>
            <button onclick="toggleAiQuickRecord()" class="text-white/80 hover:text-white p-1 text-sm cursor-pointer" title="Tutup">
              ✕
            </button>
          </div>

          <!-- Chat Messages Container -->
          <div id="aiQuickRecordMessages" class="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 text-xs text-slate-700">
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                AI
              </div>
              <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm text-slate-800 leading-relaxed">
                Halo! Ketik transaksi kamu dengan santai di bawah ini.<br>
                <span class="text-[11px] text-slate-500 font-mono mt-1 block">
                  Contoh:<br>
                  • "Bensin motor 25rb cash"<br>
                  • "Makan siang 35.000"<br>
                  • "Gaji bulanan 5jt bca"
                </span>
              </div>
            </div>
          </div>

          <!-- Input Form -->
          <div class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input id="aiQuickRecordInput" type="text" placeholder="Ketik transaksi santai..." 
                   onkeydown="if(event.key==='Enter') submitAiQuickRecord()"
                   class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition">
            <button id="btnSubmitAiQuickRecord" onclick="submitAiQuickRecord()" 
                    class="px-3.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center">
              <span id="aiRecordBtnIcon">➤</span>
              <span id="aiRecordBtnSpinner" class="hidden w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </button>
          </div>
        </div>

        <!-- Floating Action Button -->
        <button id="btnToggleAiQuickRecord" onclick="toggleAiQuickRecord()" 
                class="px-4 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full shadow-xl shadow-orange-500/30 flex items-center gap-2 transition hover:scale-105 transform cursor-pointer border border-white/20">
          <span class="text-lg">🤖</span>
          <span class="text-xs tracking-tight font-bold hidden sm:inline">AI Quick Record</span>
        </button>
      </div>

    </section>"""
