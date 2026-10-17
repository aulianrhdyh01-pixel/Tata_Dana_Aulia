# -*- coding: utf-8 -*-
with open('scripts/server.py', 'r', encoding='utf-8') as f:
    code = f.read()

needles = [
    ("top_needle", 'PORT = int(os.environ.get("PORT", 3000))\nHOST = "0.0.0.0"'),
    ("fitur_needle", '<!-- Problem Awareness Section -->\n  <section style="background: #0e0e11;'),
    ("sim_start", 'function simulateSend() {{'),
    ("sim_end", 'c.scrollTop = c.scrollHeight;\n      }}, 500);\n    }}'),
    ("sim_input", '<input type="text" id="simInput" placeholder="Coba ketik misal: \'nasi padang 25rb\'..." style="flex:1; background:#1c1c22; border:1px solid var(--border-dark); border-radius:8px; padding:12px; color:var(--text-primary); font-size:14px;">'),
    ("tg_link", '<a href="https://t.me/TataDanaBot" target="_blank" rel="noopener noreferrer" class="btn btn-primary"'),
    ("test_conn_start", 'async function testConnection() {{'),
    ("test_conn_end", 'st.innerHTML = \'<span style="color:#22c55e;">🟢 Terhubung Sukses! (Mode Sandbox Simulator Localhost).</span>\';\n          }}\n        }}'),
    ("budget_btn", '<button class="btn btn-primary">+ Tambah Budget Kategori</button>'),
    ("budgets_end", '      </div>\n"""\n            self.send_html(render_layout("Budget Bulanan", content, "budgets"))'),
    ("ocr_btn", '<button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="alert'),
    ("filter_card", '<!-- Filter Controls -->\n      <div class="card" style="margin-bottom: 24px; padding: 20px;">'),
    ("reports_end", '      </div>\n"""\n            self.send_html(render_layout("Laporan & Export", content, "reports"))'),
    ("transfer_btn", '<button class="btn btn-primary" onclick="showWalletToast(\'Transfer sebesar Rp 500.000 berhasil disimulasikan!\')">Transfer Sekarang</button>'),
    ("wallet_script", '        function showWalletToast(msg) {'),
    ("admin_approve", 'onclick="alert(\'Pembayaran Siti Rahma telah disetujui! Status user diperbarui menjadi PRO.\')"'),
    ("admin_end", '      </div>\n"""\n            self.send_html(render_layout("Superadmin Panel", admin_content, "admin"))'),
    ("users_table", '<td><strong>Budi Santoso</strong></td>'),
    ("users_end", '      </div>\n\'\'\'\n            self.send_html(render_layout("Direktori Pengguna", users_content, "admin"))'),
    ("boost_alert", '⚡ Aktifkan Pro Boost Sekarang (Rp 99.000)'),
    ("boost_end", '      </div>\n"""\n            self.send_html(render_layout("TataDana Pro Boost", boost_content, "boost"))'),
    ("teamwork_alert", '✨ Mulai Simulasi Kolaborasi'),
    ("teamwork_end", '      </div>\n"""\n            self.send_html(render_layout("TataDana Teamwork Preview", teamwork_content, "teamwork"))'),
    ("api_test", 'elif path == "/api/telegram/test":')
]

for name, needle in needles:
    pos = code.find(needle)
    print(f"[{'PASS' if pos != -1 else 'FAIL'}] {name:16} (pos: {pos})")
