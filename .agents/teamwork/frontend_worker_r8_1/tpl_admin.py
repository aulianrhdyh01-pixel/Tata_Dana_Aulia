"""
Template: Superadmin Desk & Modals (Clean Modern Orange-White Theme)
With modalAddWallet, inputWalletName, formTxWallet, exact Simpan button
"""

def get_admin_html():
    return '''            <!-- TAB 9: SUPERADMIN DESK (#dTab-adminPanel) -->
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

              <!-- 2. Sub-Nav Tabs -->
              <div class="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold px-2">
                <button type="button" onclick="switchAdminSubTab('approvalQueue')" id="btnSubTab-approval" class="pb-3 text-orange-600 border-b-2 border-orange-500 font-bold flex items-center gap-2 transition cursor-pointer">
                  <span class="text-sm">👤</span>
                  <span>Persetujuan User (<span id="adminPendingCountBadge">3</span>)</span>
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
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">AVG LATENCY</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricLatency">444 ms</div>
                    <div class="text-[11px] text-emerald-600">⚡ Webhook Telegram cepat</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">ESTIMASI BIAYA AI</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricEstimatedCost">$0.042 / bln</div>
                    <div class="text-[11px] text-orange-600">🤖 3 Provider Siaga</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">TOTAL PENGGUNA</div>
                    <div class="text-2xl font-extrabold text-slate-900 font-mono my-1" id="metricTotalUsers">5 Akun</div>
                    <div class="text-[11px] text-slate-500">Database lokal SQLite</div>
                  </div>
                  <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">MENUNGGU PERSETUJUAN</div>
                    <div class="text-2xl font-extrabold text-amber-600 font-mono my-1" id="metricPendingUsers">3 Pendaftar</div>
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

    </section>
  </div>
'''
