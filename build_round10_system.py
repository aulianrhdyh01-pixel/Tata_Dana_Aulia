"""
build_round10_system.py
Modularizes index.html into:
- tpl_landing.py
- tpl_auth.py
- tpl_admin.py
- tpl_dashboard.py
- tpl_script.py
And regenerates index.html synchronized with these modules.
"""

import os
import re

ROOT_DIR = r"C:\Users\ASUS\.gemini\antigravity\scratch\tatadana"
INDEX_PATH = os.path.join(ROOT_DIR, "index.html")

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    full_html = f.read()

# 1. Extract viewLanding (lines ~39 to 739)
landing_match = re.search(r'(<section id="viewLanding".*?</section>)', full_html, re.DOTALL)
assert landing_match, "viewLanding not found"
landing_html = landing_match.group(1)

# 2. Extract viewLogin and viewApproval (lines ~743 to 943)
auth_match = re.search(r'(<section id="viewLogin".*?</section>.*?<section id="viewApproval".*?</section>)', full_html, re.DOTALL)
assert auth_match, "viewLogin/viewApproval not found"
auth_html = auth_match.group(1)

# 3. Extract adminPanel
admin_start = full_html.find('<div id="dTab-adminPanel"')
assert admin_start != -1, "dTab-adminPanel start not found"
# Search for closing tag before </main>
main_idx = full_html.find('</main>', admin_start)
assert main_idx != -1, "</main> not found"
# Find the div closing right before </main>
# Structure: </div> (closes dTab-adminPanel) \n\n </div> (closes scroll container) \n </main>
admin_end = full_html.rfind('</div>', admin_start, full_html.rfind('</div>', admin_start, main_idx)) + 6
admin_raw = full_html[admin_start:admin_end]
assert '<div id="dTab-adminPanel"' in admin_raw, "dTab-adminPanel extraction failed"

# Ensure all 13 string literals in admin_raw:
# 1. "Enterprise Superadmin Desk"
# 2. "ROOT PRIVILEGE"
# 3. "AI INGRESS AVG LATENCY"
# 4. "ESTIMASI BIAYA"
# 5. "TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA)"
# 6. "Masuk Sesi Pengguna: Naftaly (Approved User)"
# 7. "Masuk Sesi Superadmin"
# 8. "Bot Finansial"
# 9. "@tatadana_finance_bot"
# 10. "Bot Online WIB"
# 11. "↗ Buka Chat Telegram"
# 12. "⚡ Uji Sandbox Simulator"
# 13. "Antrean Pendaftaran Pengguna Baru (Waiting for Approval)"

# Replace "AVG LATENCY" with "AI INGRESS AVG LATENCY"
admin_raw = admin_raw.replace(
    '<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">AVG LATENCY</div>',
    '<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">AI INGRESS AVG LATENCY</div>'
)

# Replace "ESTIMASI BIAYA AI" with "ESTIMASI BIAYA"
admin_raw = admin_raw.replace(
    '<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">ESTIMASI BIAYA AI</div>',
    '<div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">ESTIMASI BIAYA</div>'
)

# Add role testing toolbar and Bot Finansial widget into admin_raw if missing
toolbar_html = '''
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
'''

if "TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA)" not in admin_raw:
    # Insert right after header
    admin_raw = admin_raw.replace(
        '<!-- 2. Sub-Nav Tabs -->',
        toolbar_html + '\n              <!-- 2. Sub-Nav Tabs -->'
    )

# Write tpl_admin.py
tpl_admin_code = f'''# tpl_admin.py
# Enterprise Superadmin Desk Component for TataDana
# Auto-generated & modularized for Round 10

def get_admin_html() -> str:
    return """{admin_raw}"""
'''
with open(os.path.join(ROOT_DIR, "tpl_admin.py"), "w", encoding="utf-8") as f:
    f.write(tpl_admin_code)
print("[OK] Created tpl_admin.py")

# Write tpl_landing.py
tpl_landing_code = f'''# tpl_landing.py
# Landing Page Component for TataDana
# Auto-generated & modularized for Round 10

def get_landing_html() -> str:
    return """{landing_html}"""
'''
with open(os.path.join(ROOT_DIR, "tpl_landing.py"), "w", encoding="utf-8") as f:
    f.write(tpl_landing_code)
print("[OK] Created tpl_landing.py")

# Write tpl_auth.py
tpl_auth_code = f'''# tpl_auth.py
# Authentication & Approval Portal Component for TataDana
# Auto-generated & modularized for Round 10

def get_auth_html() -> str:
    return """{auth_html}"""
'''
with open(os.path.join(ROOT_DIR, "tpl_auth.py"), "w", encoding="utf-8") as f:
    f.write(tpl_auth_code)
print("[OK] Created tpl_auth.py")

# 4. Extract viewDashboard and add Floating AI Quick Record Bot + Telegram pairing card
dashboard_match = re.search(r'(<section id="viewDashboard".*?</section>)', full_html, re.DOTALL)
assert dashboard_match, "viewDashboard not found"
dashboard_html = dashboard_match.group(1)

# Floating AI Quick Record Bot widget
floating_bot_widget = '''
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
'''

# Telegram pairing card in Settings tab
telegram_pairing_card = '''
            <!-- Card Pairing Akun Telegram (Requirement R2) -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>✈️</span> Hubungkan Akun Telegram
                  </h3>
                  <p class="text-xs text-slate-500">Hubungkan bot @tatadana_finance_bot untuk mencatat transaksi langsung dari Telegram</p>
                </div>
                <span id="tgPairingStatusBadge" class="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono font-bold">
                  Belum Terhubung
                </span>
              </div>

              <div class="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl text-xs space-y-2 text-slate-700">
                <div class="font-bold text-orange-900">Langkah Menghubungkan:</div>
                <ol class="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
                  <li>Klik tombol <b>Buat Kode Pairing</b> di bawah ini.</li>
                  <li>Buka Telegram dan cari bot resmi <b>@tatadana_finance_bot</b>.</li>
                  <li>Kirim pesan perintah: <code class="font-bold text-orange-700 font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200" id="pairingCodeCommandExample">/connect [KODE]</code></li>
                </ol>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <button type="button" onclick="generateTelegramPairingCode()" id="btnGeneratePairingCode" 
                        class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer">
                  🔑 Buat Kode Pairing
                </button>
                <div id="pairingCodeDisplayArea" class="hidden flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-xs">
                  <span class="text-slate-500">Perintah Anda:</span>
                  <span id="activePairingCodeText" class="font-bold text-orange-600 select-all">/connect 123456</span>
                  <button type="button" onclick="copyPairingCode()" class="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer" title="Salin">📋</button>
                </div>
              </div>
              <div id="pairingFeedbackMsg" class="hidden text-xs font-medium"></div>
            </div>
'''

if "aiQuickRecordContainer" not in dashboard_html:
    dashboard_html = dashboard_html.replace(
        '</section>',
        floating_bot_widget + '\n    </section>'
    )

if "Hubungkan Akun Telegram" not in dashboard_html:
    dashboard_html = dashboard_html.replace(
        '<!-- Profile Photo Upload Card -->',
        telegram_pairing_card + '\n            <!-- Profile Photo Upload Card -->'
    )

# Replace internal dTab-adminPanel with updated admin_raw
admin_orig = full_html[admin_start:admin_end]
dashboard_html = dashboard_html.replace(admin_orig, admin_raw)

tpl_dashboard_code = f'''# tpl_dashboard.py
# Executive Dashboard Component with Floating AI Bot & Telegram Pairing for TataDana
# Auto-generated & modularized for Round 10

import tpl_admin

def get_dashboard_html() -> str:
    return """{dashboard_html}"""
'''
with open(os.path.join(ROOT_DIR, "tpl_dashboard.py"), "w", encoding="utf-8") as f:
    f.write(tpl_dashboard_code)
print("[OK] Created tpl_dashboard.py")

# 5. Extract script and enhance with Round 10 functions
script_match = re.search(r'<script>(.*?)</script>', full_html, re.DOTALL)
assert script_match, "script not found"
script_js = script_match.group(1)

# Helper function escapeHtml
escape_func_code = '''
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
'''

# Update loadAdminUsers to display all users, show Approve button only for pending, show Hapus button for all
new_load_admin_users = '''
    async function loadAdminUsers() {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        const tbody = document.getElementById('adminUsersTableBody');
        if (!tbody) return;

        if (!data.ok || !data.users || data.users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada pendaftaran akun pengguna di SQLite.</td></tr>';
          return;
        }

        // Retain ALL registered users (both pending and approved) - R3 requirement
        const allUsers = data.users;
        const pendingCount = allUsers.filter(u => u.is_approved === 0 || u.status === 'pending').length;
        const badgePending = document.getElementById('adminPendingCountBadge');
        if (badgePending) badgePending.innerText = pendingCount;
        const navBadge = document.getElementById('navPendingBadge');
        if (navBadge) navBadge.innerText = pendingCount;

        tbody.innerHTML = allUsers.map(u => {
          const isApproved = (u.is_approved === 1 || u.status === 'active');
          const statusBadge = isApproved 
            ? '<span class="badge badge-success px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Approved</span>'
            : '<span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDING</span>';

          const approveBtn = !isApproved
            ? `<button id="btnApproveUser-${u.id}" onclick="approveDirectUser(this, ${u.id})" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer">✓ Setujui</button>`
            : '';

          return `
            <tr id="applicantRow-${u.id}" class="hover:bg-slate-50 transition border-b border-slate-100">
              <td class="py-3 px-3 font-mono font-bold text-slate-500">#${u.id}</td>
              <td class="py-3 px-3 font-bold text-slate-800">${escapeHtml(u.full_name || 'Tanpa Nama')}</td>
              <td class="py-3 px-3 font-mono text-slate-600">${escapeHtml(u.email || '-')}</td>
              <td class="py-3 px-3 font-mono text-slate-600">${escapeHtml(u.phone_number || '-')}</td>
              <td class="py-3 px-3" id="userStatusBadgeCell-${u.id}">
                ${statusBadge}
              </td>
              <td class="py-3 px-3 text-center space-x-1.5 whitespace-nowrap" id="userActionCell-${u.id}">
                ${approveBtn}
                <button onclick="deleteDirectUser(${u.id}, '${escapeHtml(u.email || '')}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer">
                  🗑️ Hapus
                </button>
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        console.error('Error loading admin users:', err);
      }
    }

    async function approveDirectUser(btn, userId) {
      if (!userId) return;
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Memproses...';
      }

      try {
        const res = await fetch('/api/admin/approve-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        if (data.ok || res.status === 200) {
          // Update status badge dynamically to green '✓ Approved'
          const badgeCell = document.getElementById('userStatusBadgeCell-' + userId);
          if (badgeCell) {
            badgeCell.innerHTML = '<span class="badge badge-success px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Approved</span>';
          }
          // Hide approve button without removing the row from the DOM!
          if (btn) {
            btn.style.display = 'none';
          }
          // Refresh metrics dynamic counters
          if (typeof loadAdminMetrics === 'function') loadAdminMetrics();
        } else {
          alert('Gagal menyetujui akun: ' + (data.message || 'Error'));
          if (btn) {
            btn.disabled = false;
            btn.innerText = '✓ Setujui';
          }
        }
      } catch (err) {
        alert('Gagal menyetujui akun: ' + err.message);
        if (btn) {
          btn.disabled = false;
          btn.innerText = '✓ Setujui';
        }
      }
    }

    async function deleteDirectUser(userId, email) {
      if (!userId) return;
      if (!confirm(`Apakah Anda yakin ingin menghapus pengguna ${email || '#' + userId}? Data transaksi dan akun akan dihapus permanen.`)) {
        return;
      }
      try {
        const res = await fetch('/api/admin/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        if (data.ok || res.status === 200) {
          const row = document.getElementById('applicantRow-' + userId);
          if (row) row.remove();
          if (typeof loadAdminMetrics === 'function') loadAdminMetrics();
        } else {
          alert('Gagal menghapus pengguna: ' + (data.message || 'Error'));
        }
      } catch (err) {
        alert('Gagal menghapus pengguna: ' + err.message);
      }
    }

    function switchRoleSession(role) {
      if (role === 'user') {
        currentUserId = 2;
        currentUserRole = 'user';
        currentUserPlan = 'pro';
        currentUserData = { id: 2, email: 'naftaly@example.com', full_name: 'Naftaly', role: 'user', plan: 'pro', is_approved: 1 };
        saveSession(currentUserData);
        navigate('/dashboard');
        selectTab('beranda');
        alert('Sesi beralih ke: Naftaly (Approved User)');
      } else {
        currentUserId = 1;
        currentUserRole = 'superadmin';
        currentUserPlan = 'PRO VIP';
        currentUserData = { id: 1, email: 'akunadminaul16@gmail.com', full_name: 'Superadmin TataDana', role: 'superadmin', plan: 'PRO VIP', is_approved: 1 };
        saveSession(currentUserData);
        navigate('/admin');
        selectTab('adminPanel');
        alert('Sesi beralih ke: Master Superadmin');
      }
    }

    // --- Floating AI Quick Record Logic (R1) ---
    function toggleAiQuickRecord() {
      const modal = document.getElementById('aiQuickRecordModal');
      if (!modal) return;
      modal.classList.toggle('hidden');
      if (!modal.classList.contains('hidden')) {
        const input = document.getElementById('aiQuickRecordInput');
        if (input) input.focus();
      }
    }

    async function submitAiQuickRecord() {
      const input = document.getElementById('aiQuickRecordInput');
      const msgBox = document.getElementById('aiQuickRecordMessages');
      const btnIcon = document.getElementById('aiRecordBtnIcon');
      const btnSpinner = document.getElementById('aiRecordBtnSpinner');
      const btn = document.getElementById('btnSubmitAiQuickRecord');

      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      // Add user message bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start justify-end gap-2';
      userBubble.innerHTML = `
        <div class="bg-orange-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm text-xs max-w-[80%] leading-relaxed">
          ${escapeHtml(text)}
        </div>
      `;
      msgBox.appendChild(userBubble);
      input.value = '';
      msgBox.scrollTop = msgBox.scrollHeight;

      // Show spinner
      if (btn) btn.disabled = true;
      if (btnIcon) btnIcon.classList.add('hidden');
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        const res = await fetch('/api/ai/parse-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            user_id: currentUserId || 1
          })
        });
        const data = await res.json();

        const botBubble = document.createElement('div');
        botBubble.className = 'flex items-start gap-2';

        if (data.ok && (data.parsed || data.data)) {
          const p = data.parsed || data.data;
          const isExp = (p.type === 'pengeluaran' || p.type === 'expense');
          const sign = isExp ? '-' : '+';
          const colorClass = isExp ? 'text-rose-600' : 'text-emerald-600';
          const badgeBg = isExp ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
          
          botBubble.innerHTML = `
            <div class="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              AI
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm text-slate-800 text-xs leading-relaxed max-w-[85%] space-y-1.5">
              <div class="font-bold text-slate-900 flex items-center justify-between gap-2">
                <span>${escapeHtml(p.description || text)}</span>
                <span class="font-mono ${colorClass} font-extrabold">${sign}Rp ${Math.round(p.amount).toLocaleString('id-ID')}</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}">${escapeHtml(p.category)}</span>
                <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-mono">👛 ${escapeHtml(p.wallet || data.wallet_name || 'Dompet')}</span>
              </div>
              <div class="text-[10px] text-emerald-700 pt-1 font-medium">
                ${data.reply_message || '✅ Transaksi berhasil dicatat ke database.'}
              </div>
            </div>
          `;
          msgBox.appendChild(botBubble);
          msgBox.scrollTop = msgBox.scrollHeight;

          // Reactively refresh dashboard data without reloading page!
          if (typeof loadRealDashboardData === 'function') {
            loadRealDashboardData();
          }
        } else {
          botBubble.innerHTML = `
            <div class="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              AI
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm p-3 shadow-sm text-amber-900 text-xs leading-relaxed max-w-[85%]">
              ⚠️ ${data.message || 'Format tidak terdeteksi. Silakan coba: "Bensin motor 25rb cash"'}
            </div>
          `;
          msgBox.appendChild(botBubble);
          msgBox.scrollTop = msgBox.scrollHeight;
        }
      } catch (err) {
        const errBubble = document.createElement('div');
        errBubble.className = 'flex items-start gap-2';
        errBubble.innerHTML = `
          <div class="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
            !
          </div>
          <div class="bg-rose-50 border border-rose-200 rounded-2xl rounded-tl-sm p-3 shadow-sm text-rose-800 text-xs leading-relaxed">
            Gagal menghubungi AI: ${err.message}
          </div>
        `;
        msgBox.appendChild(errBubble);
        msgBox.scrollTop = msgBox.scrollHeight;
      } finally {
        if (btn) btn.disabled = false;
        if (btnIcon) btnIcon.classList.remove('hidden');
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    }

    // --- Telegram Account Pairing Logic (R2) ---
    async function generateTelegramPairingCode() {
      const btn = document.getElementById('btnGeneratePairingCode');
      const area = document.getElementById('pairingCodeDisplayArea');
      const codeText = document.getElementById('activePairingCodeText');
      const feedback = document.getElementById('pairingFeedbackMsg');

      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Membuat Kode...';
      }

      try {
        const res = await fetch('/api/telegram/pairing-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUserId || 1 })
        });
        const data = await res.json();
        if (data.ok && data.pairing_code) {
          if (area) area.classList.remove('hidden');
          if (codeText) codeText.innerText = `/connect ${data.pairing_code}`;
          if (feedback) {
            feedback.className = 'text-xs font-medium text-emerald-600';
            feedback.innerText = `Kode ${data.pairing_code} siap. Kirim /connect ${data.pairing_code} ke @tatadana_finance_bot di Telegram.`;
            feedback.classList.remove('hidden');
          }
        } else {
          if (feedback) {
            feedback.className = 'text-xs font-medium text-rose-600';
            feedback.innerText = 'Gagal membuat kode: ' + (data.message || 'Error');
            feedback.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (feedback) {
          feedback.className = 'text-xs font-medium text-rose-600';
          feedback.innerText = 'Koneksi gagal: ' + err.message;
          feedback.classList.remove('hidden');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = '🔑 Buat Kode Pairing Baru';
        }
      }
    }

    function copyPairingCode() {
      const codeText = document.getElementById('activePairingCodeText');
      if (codeText) {
        navigator.clipboard.writeText(codeText.innerText.trim()).then(() => {
          alert('Perintah /connect disalin ke clipboard!');
        }).catch(() => {
          alert('Silakan salin teks secara manual: ' + codeText.innerText);
        });
      }
    }
'''

# Replace old loadAdminUsers and approveDirectUser in script_js
script_js = re.sub(r'async function loadAdminUsers\(\)\s*\{.*?\}\s*(?=async function loadAiSettings)', '', script_js, flags=re.DOTALL)
script_js = re.sub(r'async function approveDirectUser\(btnOrId, maybeId\)\s*\{.*?\}\s*(?=function switchAdminSubTab)', '', script_js, flags=re.DOTALL)

# Append new handlers to script_js
enhanced_script_js = escape_func_code + '\n' + new_load_admin_users + '\n' + script_js

# Write tpl_script.py
tpl_script_code = f'''# tpl_script.py
# Core Client JavaScript Engine for TataDana Single-Page Application
# Auto-generated & modularized for Round 10

def get_script_js() -> str:
    return """{enhanced_script_js}"""

def get_client_script() -> str:
    return get_script_js()
'''
with open(os.path.join(ROOT_DIR, "tpl_script.py"), "w", encoding="utf-8") as f:
    f.write(tpl_script_code)
print("[OK] Created tpl_script.py")

# 6. Reconstruct synchronized index.html
head_and_top_banner = full_html[:full_html.find('<section id="viewLanding"')]
closing_html = """
</body>
</html>
"""

new_index_html = f"""{head_and_top_banner}{landing_html}
    {auth_html}
    {dashboard_html}
  </div>
  <script>
{enhanced_script_js}
  </script>
{closing_html}"""

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(new_index_html)
print("[OK] Reconstructed index.html with 100% modular sync!")
