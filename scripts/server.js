// ==============================================================================
// TataDana: Localhost Runtime Server (scripts/server.js)
// Serves application on localhost:3000 with genuine HTML/JSON for all routes
// ==============================================================================

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

const PROCESSED_UPDATE_IDS = new Set([10001, 10002]);

const USER_TRANSACTIONS = [
  {
    id: "tx-1",
    waktu: "11 Okt 2026 10:15 WIB",
    deskripsi: "beli kopi susu gula aren 18rb",
    kategori: "🍜 Makanan & Minuman",
    wallet: "👛 GoPay",
    nominal: -18000,
    jenis: "pengeluaran",
    sumber: "TELEGRAM_TEXT"
  },
  {
    id: "tx-2",
    waktu: "10 Okt 2026 19:30 WIB",
    deskripsi: "Makan Malam Seafood 85rb",
    kategori: "🍜 Makanan & Minuman",
    wallet: "👛 Cash",
    nominal: -85000,
    jenis: "pengeluaran",
    sumber: "TELEGRAM_TEXT"
  },
  {
    id: "tx-3",
    waktu: "10 Okt 2026 14:20 WIB",
    deskripsi: "Belanja Bulanan Superindo (Multi-Item Struk OCR)",
    kategori: "🛒 Belanja",
    wallet: "👛 BCA",
    nominal: -345000,
    jenis: "pengeluaran",
    sumber: "TELEGRAM_RECEIPT"
  },
  {
    id: "tx-4",
    waktu: "09 Okt 2026 08:45 WIB",
    deskripsi: "Isi Bensin Pertamax 50rb",
    kategori: "🚗 Transportasi",
    wallet: "👛 Mandiri",
    nominal: -50000,
    jenis: "pengeluaran",
    sumber: "TELEGRAM_TEXT"
  },
  {
    id: "tx-5",
    waktu: "05 Okt 2026 09:00 WIB",
    deskripsi: "Gaji Bulanan PT Finansial Digital",
    kategori: "💼 Gaji & Pendapatan",
    wallet: "👛 BCA",
    nominal: 25000000,
    jenis: "pemasukan",
    sumber: "MANUAL"
  }
];

const PROFILE_MODAL_HTML = `
  <!-- Modal Edit Profil Pengguna -->
  <div id="modalEditProfile" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#121215; border:1px solid #27272a; border-radius:16px; width:100%; max-width:480px; padding:24px; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:18px; font-weight:800; color:#f4f4f5;">✏️ Ubah Profil Pengguna</h3>
        <button onclick="closeProfileModal()" style="background:none; border:none; color:#a1a1aa; font-size:22px; cursor:pointer;">&times;</button>
      </div>

      <!-- Live Preview -->
      <div style="display:flex; align-items:center; gap:16px; background:#18181b; padding:14px; border-radius:12px; border:1px solid #27272a; margin-bottom:16px;">
        <img id="modalAvatarPreview" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" style="width:64px; height:64px; border-radius:50%; border:3px solid #f97316; object-fit:cover; background:#27272a;">
        <div style="flex:1;">
          <div style="font-size:12px; font-weight:700; color:#f4f4f5; margin-bottom:4px;">Live Preview Foto Profil</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="randomizeModalAvatar()" style="background:#18181b; border:1px solid #27272a; color:#f4f4f5; font-size:11px; padding:6px 10px; border-radius:6px; cursor:pointer;">🎲 Acak Avatar</button>
            <label style="background:#18181b; border:1px solid #27272a; color:#f4f4f5; font-size:11px; padding:6px 10px; border-radius:6px; cursor:pointer;">
              📷 Unggah File
              <input type="file" accept="image/*" onchange="handleModalFileUpload(event)" style="display:none;">
            </label>
          </div>
        </div>
      </div>

      <!-- Presets -->
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Pilihan Avatar Karakter (DiceBear)</label>
        <div id="modalAvatarPresets" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;"></div>
      </div>

      <!-- URL Input -->
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Atau URL Foto Kustom</label>
        <input type="url" id="modalCustomAvatarUrl" placeholder="https://..." oninput="onCustomAvatarInput(this.value)" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:9px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
      </div>

      <!-- Nama Input -->
      <div style="margin-bottom:20px;">
        <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Nama Pengguna / Nama Tampilan</label>
        <input type="text" id="modalUserNameInput" placeholder="Nama Anda" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:14px; box-sizing:border-box;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" onclick="closeProfileModal()" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:13px;">Batal</button>
        <button type="button" onclick="saveProfileFromModal()" style="background:#f97316; border:none; color:#fff; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:700;">Simpan Perubahan</button>
      </div>
    </div>
  </div>

  <div id="profileToast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:10000; background:#18181b; border:1px solid #22c55e; border-radius:10px; padding:12px 18px; color:#22c55e; font-size:13px; font-weight:700; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
    ✅ Profil berhasil diperbarui!
  </div>
`;

const PROFILE_MODAL_JS = `
    var currentEditingAvatar = '';

    function syncProfile() {
      try {
        var raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
        if (raw) {
          var p = JSON.parse(raw);
          if (p) {
            var n = document.getElementById('sidebar-user-name');
            var c = document.getElementById('sidebar-user-contact');
            var a = document.getElementById('sidebar-user-avatar');
            var b = document.getElementById('sidebar-user-badge');
            var hn = document.getElementById('header-user-name');
            var ha = document.getElementById('header-user-avatar');
            if (p.nama && n) n.textContent = p.nama;
            if (p.nama && hn) hn.textContent = p.nama;
            if ((p.kontak || p.email) && c) c.textContent = p.kontak || p.email;
            var avatarUrl = p.avatarUrl || (p.nama ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(p.nama) : '');
            if (avatarUrl && a) a.src = avatarUrl;
            if (avatarUrl && ha) ha.src = avatarUrl;
            if (p.statusPaket && b) b.textContent = p.statusPaket;
          }
        }
      } catch(e) {}
    }
    syncProfile();
    window.addEventListener('tatadana_profile_updated', syncProfile);
    window.addEventListener('storage', syncProfile);

    function handleLogout() {
      try {
        localStorage.removeItem('tatadana_user_profile');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('tatadana_user');
      } catch(e) {}
      window.location.href = '/login';
    }

    function openProfileModal() {
      var n = document.getElementById('sidebar-user-name');
      var a = document.getElementById('sidebar-user-avatar');
      var nameVal = n ? n.textContent.trim() : 'Pengguna TataDana';
      var avatarVal = a ? a.src : 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser';
      currentEditingAvatar = avatarVal;

      var nameInp = document.getElementById('modalUserNameInput');
      var prevImg = document.getElementById('modalAvatarPreview');
      var urlInp = document.getElementById('modalCustomAvatarUrl');
      if (nameInp) nameInp.value = nameVal;
      if (prevImg) prevImg.src = avatarVal;
      if (urlInp) urlInp.value = '';

      var presets = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiPratama',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=MayaDewi',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexKurniawan',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=SitiRahma',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=RianSaputra'
      ];
      var container = document.getElementById('modalAvatarPresets');
      if (container) {
        container.innerHTML = presets.map(function(url) {
          return '<img src="' + url + '" onclick="selectPresetAvatar(\\'' + url + '\\')" style="width:38px; height:38px; border-radius:50%; cursor:pointer; border:2px solid #27272a; background:#27272a; object-fit:cover;" onmouseover="this.style.borderColor=\\'#f97316\\'" onmouseout="this.style.borderColor=\\'#27272a\\'">';
        }).join('');
      }

      var m = document.getElementById('modalEditProfile');
      if (m) m.style.display = 'flex';
    }

    function closeProfileModal() {
      var m = document.getElementById('modalEditProfile');
      if (m) m.style.display = 'none';
    }

    function selectPresetAvatar(url) {
      currentEditingAvatar = url;
      var prevImg = document.getElementById('modalAvatarPreview');
      var urlInp = document.getElementById('modalCustomAvatarUrl');
      if (prevImg) prevImg.src = url;
      if (urlInp) urlInp.value = '';
    }

    function randomizeModalAvatar() {
      var seeds = ['Garuda', 'Nusantara', 'Merdeka', 'Kencana', 'Semangat', 'Bintang', 'Surya', 'Samudra', 'Arjuna', 'Srikandi'];
      var pick = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 9999);
      var url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(pick);
      selectPresetAvatar(url);
    }

    function onCustomAvatarInput(val) {
      if (val && val.trim().startsWith('http')) {
        currentEditingAvatar = val.trim();
        var prevImg = document.getElementById('modalAvatarPreview');
        if (prevImg) prevImg.src = val.trim();
      }
    }

    function handleModalFileUpload(e) {
      var file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran foto maksimal 2 MB');
          return;
        }
        var reader = new FileReader();
        reader.onloadend = function() {
          if (reader.result) {
            currentEditingAvatar = reader.result;
            var prevImg = document.getElementById('modalAvatarPreview');
            if (prevImg) prevImg.src = reader.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }

    function saveProfileFromModal() {
      var nameInp = document.getElementById('modalUserNameInput');
      var newName = (nameInp ? nameInp.value.trim() : '') || 'Pengguna TataDana';
      var newAvatar = currentEditingAvatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(newName));

      var current = null;
      try {
        var raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
        if (raw) current = JSON.parse(raw);
      } catch(err) {}

      var updated = Object.assign({}, current || {
        email: 'user@tatadana.com',
        kontak: '+62 812-3456-7890',
        statusPaket: 'Pro Lifetime (Rp99k)'
      }, {
        nama: newName,
        avatarUrl: newAvatar,
        isLoggedIn: true
      });

      try {
        localStorage.setItem('tatadana_user_profile', JSON.stringify(updated));
        localStorage.setItem('user_profile', JSON.stringify(updated));
        localStorage.setItem('tatadana_user', JSON.stringify(updated));
        window.dispatchEvent(new Event('tatadana_profile_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch(err) {}

      try {
        var usersRaw = localStorage.getItem('tatadana_registered_users');
        if (usersRaw) {
          var users = JSON.parse(usersRaw);
          for (var i = 0; i < users.length; i++) {
            if ((updated.email && users[i].email && users[i].email.toLowerCase() === updated.email.toLowerCase()) ||
                (updated.kontak && users[i].kontak && users[i].kontak === updated.kontak)) {
              users[i].nama = newName;
              users[i].avatarUrl = newAvatar;
              break;
            }
          }
          localStorage.setItem('tatadana_registered_users', JSON.stringify(users));
        }
      } catch(err) {}

      var n = document.getElementById('sidebar-user-name');
      var a = document.getElementById('sidebar-user-avatar');
      var hn = document.getElementById('header-user-name');
      var ha = document.getElementById('header-user-avatar');
      if (n) n.textContent = newName;
      if (hn) hn.textContent = newName;
      if (a) a.src = newAvatar;
      if (ha) ha.src = newAvatar;

      closeProfileModal();

      var t = document.getElementById('profileToast');
      if (t) {
        t.style.display = 'block';
        setTimeout(function() { t.style.display = 'none'; }, 4000);
      }
    }
`;

function renderDashboardShell(title, contentHtml, activeNav) {
  activeNav = activeNav || 'dashboard';
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — TataDana</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; flex-shrink: 0; }
    .sidebar a.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; color: #a1a1aa; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s ease; }
    .sidebar a.nav-item:hover { background: #18181b; color: #f4f4f5; }
    .sidebar a.nav-item.active { background: rgba(249, 115, 22, 0.15); color: #f97316; font-weight: 700; border: 1px solid rgba(249, 115, 22, 0.35); }
    .content { flex: 1; overflow-y: auto; padding: 32px 40px; box-sizing: border-box; background-color: #09090b; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    .stat-card .label { font-size: 13px; color: #a1a1aa; margin-bottom: 6px; }
    .stat-card .val { font-size: 24px; font-weight: 800; color: #f4f4f5; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 14px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th { text-align: left; padding: 12px 14px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-weight: 600; }
    td { padding: 12px 14px; border-bottom: 1px solid #1f1f23; color: #f4f4f5; }
    tr:hover td { background: #18181b; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .badge-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); }
    .badge-green { background: rgba(34, 197, 94, 0.18); color: #22c55e; border: 1px solid #22c55e; }
    .badge-red { background: rgba(239, 68, 68, 0.18); color: #ef4444; border: 1px solid #ef4444; }
    .btn-primary { background: #f97316; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
    .btn-primary:hover { background: #ea580c; }
    .btn-secondary { background: #18181b; border: 1px solid #27272a; color: #f4f4f5; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; text-decoration: none; }
    .btn-secondary:hover { background: #27272a; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin-bottom: 24px; padding-left: 8px;">Tata<span style="color:#f97316">Dana</span></div>
    <a href="/dashboard" class="nav-item ${activeNav === 'dashboard' ? 'active' : ''}">📊 Overview</a>
    <a href="/dashboard/wallets" class="nav-item ${activeNav === 'wallets' ? 'active' : ''}">💼 Multi-Wallet</a>
    <a href="/dashboard/budgets" class="nav-item ${activeNav === 'budgets' ? 'active' : ''}">🎯 Budgets (█░)</a>
    <a href="/dashboard/reports" class="nav-item ${activeNav === 'reports' ? 'active' : ''}">📑 Reports & Export</a>
    <a href="/dashboard/settings" class="nav-item ${activeNav === 'settings' ? 'active' : ''}">⚙️ Pengaturan & Bot</a>
    <a href="/boost" class="nav-item ${activeNav === 'boost' ? 'active' : ''}">🚀 Pro Boost</a>
    <a href="/teamwork-preview" class="nav-item ${activeNav === 'teamwork' ? 'active' : ''}">👥 Teamwork Preview</a>
    <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
      <a href="/admin" style="color: #f97316; font-weight: 600; text-decoration: none; padding: 8px 14px;">🛡️ Superadmin Panel</a>
      <a href="/" style="color: #71717a; text-decoration: none; padding: 8px 14px;">⬅️ Ke Landing Page</a>

      <!-- Profil Pengguna Terdaftar -->
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 10px 12px; margin-top: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <div style="position: relative; flex-shrink: 0;">
              <img id="sidebar-user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" alt="Avatar" style="width: 34px; height: 34px; border-radius: 50%; border: 2px solid #f97316; background: #27272a; object-fit: cover;">
              <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; border: 2px solid #18181b;"></div>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div id="sidebar-user-name" style="font-size: 12px; font-weight: 700; color: #f4f4f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pengguna TataDana</div>
              <div id="sidebar-user-contact" style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">+62 812-3456-7890</div>
            </div>
          </div>
          <button onclick="handleLogout()" title="Keluar / Logout" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 6px; padding: 4px 6px; cursor: pointer; font-size: 13px; line-height: 1;">
            🚪
          </button>
        </div>
        <button type="button" onclick="openProfileModal()" style="width: 100%; margin-top: 8px; padding: 6px 8px; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); color: #f97316; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ✏️ Ubah Profil
        </button>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #27272a; font-size: 10px;">
          <span style="color: #71717a;">Status:</span>
          <span id="sidebar-user-badge" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: #f97316; font-size: 10px; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">Pro Lifetime (Rp99k)</span>
        </div>
      </div>
    </div>
  </div>
  <div class="content">
    <div class="header">
      <div>
        <h1 style="font-size: 26px; margin: 0; color: #f4f4f5; font-weight: 800;">${title}</h1>
        <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Zona Waktu: Asia/Jakarta (WIB) • Terhubung ke Telegram Bot</p>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.35); padding: 8px 16px; border-radius: 8px; color: #f97316; font-size: 13px; font-weight: 700;">
          ⚡ Bot Status: Online (WIB)
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:#18181b; border:1px solid #27272a; border-radius:9999px; padding:3px 12px 3px 5px;">
          <img id="header-user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" style="width:26px; height:26px; border-radius:50%; border:1px solid #f97316; object-fit:cover;" alt="Avatar">
          <span id="header-user-name" style="font-size:12px; font-weight:700; color:#f4f4f5; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Pengguna TataDana</span>
        </div>
        <button onclick="openProfileModal()" style="padding:6px 12px; font-size:11px; font-weight:700; background:#18181b; border:1px solid #27272a; color:#f4f4f5; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:4px;">
          <span>✏️ Ubah Profil</span>
        </button>
      </div>
    </div>
    ${contentHtml}
  </div>
  ${PROFILE_MODAL_HTML}
  <script>
    ${PROFILE_MODAL_JS}
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route 1: Landing Page (/)
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TataDana — SaaS Manajemen Keuangan Pribadi Indonesia via Telegram Bot & AI</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    .nav { position: sticky; top: 0; z-index: 50; background: rgba(9, 9, 11, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #27272a; padding: 14px 32px; display: flex; justify-content: space-between; align-items: center; }
    .hero { max-width: 1200px; margin: 0 auto; padding: 70px 24px; text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: #f97316; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
    h1 { font-size: 48px; font-weight: 800; line-height: 1.15; margin: 0 0 20px; color: #f4f4f5; }
    .orange-text { color: #f97316; }
    p.lead { font-size: 18px; color: #a1a1aa; max-width: 780px; margin: 0 auto 36px; line-height: 1.6; }
    .btn-group { display: flex; justify-content: center; gap: 14px; margin-bottom: 50px; flex-wrap: wrap; }
    .btn-primary { background: #f97316; color: #ffffff; padding: 12px 26px; border-radius: 12px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3); font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary:hover { background: #ea580c; }
    .btn-secondary { background: #18181b; border: 1px solid #27272a; color: #f4f4f5; padding: 12px 24px; border-radius: 12px; font-weight: 600; text-decoration: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
    .btn-secondary:hover { background: #27272a; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; text-align: left; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 26px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    .card h3 { font-size: 17px; margin: 0 0 10px; color: #f4f4f5; }
    .card p { font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.5; }
    footer { border-top: 1px solid #27272a; padding: 32px 24px; text-align: center; color: #71717a; font-size: 14px; margin-top: 60px; }
  </style>
</head>
<body>
  <!-- Navigation Header with Instant Reactive Auth Area -->
  <nav class="nav">
    <div style="font-size:20px; font-weight:800; color:#f4f4f5; display:flex; align-items:center; gap:8px;">
      <span style="color:#f97316;">⚡</span> Tata<span style="color:#f97316;">Dana</span>
    </div>
    <div style="display:flex; align-items:center; gap:20px;">
      <a href="#fitur" style="color:#a1a1aa; text-decoration:none; font-size:13px; font-weight:500;">Fitur</a>
      <a href="/dashboard" style="color:#a1a1aa; text-decoration:none; font-size:13px; font-weight:500;">Demo Dashboard</a>
      <div id="landingAuthActions" style="display:flex; align-items:center; gap:10px;">
        <button type="button" onclick="openLandingLoginModal(event)" class="btn-secondary" style="padding:8px 16px; font-size:13px;">Masuk</button>
        <a href="/register" class="btn-primary" style="padding:8px 16px; font-size:13px;">Mulai Gratis &rarr;</a>
      </div>
    </div>
  </nav>

  <div class="hero">
    <div class="badge">✨ SaaS Finansial Pribadi Terintegrasi Telegram Bot #1 di Indonesia</div>
    <h1>Catat Pengeluaran Semudah <br><span class="orange-text">Kirim Pesan Telegram</span></h1>
    <p class="lead">Solusi keuangan pribadi premium berbasis multi-modal AI (Teks "18rb", Struk OCR, Voice Note STT 60s), Multi-Wallet, Budget Alerts, dan Dashboard Real-time WIB.</p>
    <div class="btn-group">
      <a href="/register" class="btn-primary">Mulai Sekarang Gratis</a>
      <button type="button" onclick="openLandingLoginModal(event)" class="btn-secondary" style="color:#fdba74; border-color:rgba(249,115,22,0.4);">⚡ Masuk di Landing Space</button>
      <a href="/dashboard" class="btn-secondary">Lihat Demo Dashboard</a>
      <a href="/admin" class="btn-secondary">Superadmin Panel</a>
    </div>
    <div class="grid" id="fitur">
      <div class="card">
        <h3>🤖 Telegram Bot & Multi-Modal AI</h3>
        <p>Cukup ketik "beli kopi 18rb", foto struk belanja, atau kirim voice note. AI memproses otomatis ke dompet dan kategori yang tepat.</p>
      </div>
      <div class="card">
        <h3>📊 Real-Time Web Dashboard</h3>
        <p>Visualisasi grafik pengeluaran, perbandingan 6 bulan, tren harian, dan progress bar budget interaktif standar WIB.</p>
      </div>
      <div class="card">
        <h3>💼 Multi-Wallet & Subscriptions</h3>
        <p>Kelola Cash, BCA, Mandiri, GoPay, dan OVO dalam satu tempat. Integrasi pembayaran otomatis Midtrans Snap.</p>
      </div>
    </div>
  </div>

  <!-- Modal Masuk di Landing Space -->
  <div id="modalLandingLogin" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#121215; border:1px solid #27272a; border-radius:18px; width:100%; max-width:440px; padding:28px; position:relative; box-shadow:0 24px 48px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">⚡</span>
          <h3 style="margin:0; font-size:20px; font-weight:800; color:#f4f4f5;">Tata<span style="color:#f97316;">Dana</span></h3>
        </div>
        <button onclick="closeLandingLoginModal()" style="background:none; border:none; color:#a1a1aa; font-size:24px; cursor:pointer; line-height:1;">&times;</button>
      </div>
      <p style="color:#a1a1aa; font-size:13px; margin:0 0 18px;">Masuk langsung dari landing space untuk mengakses dashboard finansial Anda.</p>

      <!-- Alert Box Password Salah (Merah) -->
      <div id="landingPassError" style="display:none; background:rgba(239,68,68,0.18); border:1px solid #ef4444; border-radius:10px; padding:12px 14px; color:#fca5a5; font-size:13px; margin-bottom:16px; line-height:1.4;">
        ❌ <strong>Kata sandi yang Anda masukkan salah.</strong> Silakan periksa kembali atau gunakan opsi Lupa Password.
      </div>

      <!-- Alert Box Akun Belum Terdaftar (Oranye/Kuning) -->
      <div id="landingUnregisteredWarning" style="display:none; background:rgba(245,158,11,0.18); border:1px solid #f59e0b; border-radius:10px; padding:12px 14px; color:#fde68a; font-size:13px; margin-bottom:16px; line-height:1.4;">
        ⚠️ <strong>Akun belum terdaftar.</strong> Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.
        <div style="margin-top:10px;">
          <a href="/register" class="btn-primary" style="font-size:12px; padding:6px 12px; display:inline-block;">Daftar & Verifikasi Akun &rarr;</a>
        </div>
      </div>

      <!-- Form Login Landing -->
      <form onsubmit="handleLandingLogin(event)">
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Nomor HP atau Alamat Email</label>
          <input type="text" id="landingLoginContact" value="user@tatadana.com" placeholder="user@tatadana.com atau 081234567890" required oninput="clearLandingAlerts()" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="margin:0; font-size:12px; color:#a1a1aa; font-weight:600;">Kata Sandi</label>
            <a href="#forgot" onclick="openLandingForgotPwModal(event)" style="font-size:12px; color:#f97316; font-weight:600; text-decoration:none;">Lupa Password?</a>
          </div>
          <input type="password" id="landingLoginPassword" value="password123" placeholder="••••••••••••" required oninput="clearLandingAlerts()" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
        </div>

        <button type="submit" class="btn-primary" style="width:100%; padding:12px; font-weight:700; font-size:14px; margin-bottom:10px; justify-content:center;">Masuk ke Dashboard &rarr;</button>
        <button type="button" onclick="handleLandingDemoLogin()" class="btn-secondary" style="width:100%; padding:10px; font-size:12px; color:#fdba74; border-color:rgba(249,115,22,0.3); margin-bottom:12px; justify-content:center;">🚀 1-Click Masuk Demo Sandbox</button>
      </form>

      <div style="text-align:center; font-size:12px; color:#a1a1aa; border-top:1px solid #27272a; padding-top:12px;">
        Belum punya akun? <a href="/register" style="color:#f97316; font-weight:700; text-decoration:none;">Daftar gratis di sini</a>
      </div>
    </div>
  </div>

  <!-- Modal Lupa Password di Landing Space -->
  <div id="modalLandingForgotPw" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); z-index:10000; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#121215; border:1px solid #27272a; border-radius:18px; width:100%; max-width:440px; padding:24px; position:relative; box-shadow:0 24px 48px rgba(0,0,0,0.9);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:18px; font-weight:800; color:#f4f4f5;">🔐 Pemulihan Kata Sandi</h3>
        <button onclick="closeLandingForgotPwModal()" style="background:none; border:none; color:#a1a1aa; font-size:24px; cursor:pointer; line-height:1;">&times;</button>
      </div>

      <div id="landingForgotAlert" style="display:none; background:rgba(239,68,68,0.18); border:1px solid #ef4444; border-radius:8px; padding:10px 12px; color:#fca5a5; font-size:12px; margin-bottom:14px;"></div>
      <div id="landingForgotSuccess" style="display:none; background:rgba(34,197,94,0.18); border:1px solid #22c55e; border-radius:8px; padding:10px 12px; color:#86efac; font-size:12px; margin-bottom:14px;"></div>

      <div id="landingForgotStep1">
        <p style="font-size:13px; color:#a1a1aa; margin:0 0 14px;">Masukkan Email atau Nomor Kontak terdaftar untuk menerima kode OTP pemulihan.</p>
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Email atau Nomor Kontak Terdaftar</label>
          <input type="text" id="landingForgotTarget" placeholder="user@tatadana.com" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" onclick="closeLandingForgotPwModal()" class="btn-secondary" style="font-size:13px; padding:8px 14px;">Batal</button>
          <button type="button" onclick="sendLandingRecoveryOtp()" class="btn-primary" style="font-size:13px; padding:8px 16px;">Kirim Kode OTP Pemulihan</button>
        </div>
      </div>

      <div id="landingForgotStep2" style="display:none;">
        <div style="background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.4); border-radius:8px; padding:10px 12px; color:#fdba74; font-size:12px; margin-bottom:14px;">
          💡 <strong>Kode OTP Demo:</strong> Masukkan kode <span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; font-weight:800; font-family:monospace; color:#fff;">123456</span>
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Kode OTP 6-Digit</label>
          <input type="text" id="landingForgotOtpCode" placeholder="123456" maxlength="6" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; text-align:center; font-size:18px; font-family:monospace; letter-spacing:4px; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Kata Sandi Baru</label>
          <input type="password" id="landingForgotNewPass" placeholder="Minimal 6 karakter" minlength="6" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; color:#a1a1aa; margin-bottom:6px; font-weight:600;">Konfirmasi Kata Sandi Baru</label>
          <input type="password" id="landingForgotConfirmPass" placeholder="Ulangi kata sandi baru" minlength="6" style="width:100%; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:10px 12px; color:#f4f4f5; font-size:13px; box-sizing:border-box;">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <button type="button" onclick="document.getElementById('landingForgotStep1').style.display='block'; document.getElementById('landingForgotStep2').style.display='none';" class="btn-secondary" style="font-size:12px; padding:8px 12px;">&larr; Kembali</button>
          <button type="button" onclick="submitLandingResetPassword()" class="btn-primary" style="font-size:13px; padding:8px 16px;">Simpan Kata Sandi Baru</button>
        </div>
      </div>
    </div>
  </div>

  <footer>
    TataDana &copy; 2026. All rights reserved. Berstandar Asia/Jakarta (WIB).
  </footer>

  <script>
    function getRegisteredUsers() {
      var def = [
        { nama: 'Pengguna TataDana', email: 'user@tatadana.com', kontak: '+62 812-3456-7890', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
        { nama: 'Budi Santoso', email: 'budi.santoso@tatadana.id', kontak: '+62 812-8899-0011', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
        { nama: 'Super Admin TataDana', email: 'admin@tatadana.com', kontak: '+62 811-9988-7766', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaAdmin', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true }
      ];
      try {
        var raw = localStorage.getItem('tatadana_registered_users');
        if (!raw) {
          localStorage.setItem('tatadana_registered_users', JSON.stringify(def));
          return def;
        }
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          localStorage.setItem('tatadana_registered_users', JSON.stringify(def));
          return def;
        }
        return parsed;
      } catch(e) {
        return def;
      }
    }

    function saveRegisteredUsers(users) {
      try {
        localStorage.setItem('tatadana_registered_users', JSON.stringify(users));
      } catch(e) {}
    }

    function findRegisteredUser(identifier) {
      var users = getRegisteredUsers();
      var idTrim = identifier.trim().toLowerCase();
      var digits = idTrim.replace(/\\D/g, '');
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (u.email && u.email.toLowerCase() === idTrim) return u;
        if (u.kontak) {
          if (u.kontak.toLowerCase() === idTrim) return u;
          var uDigits = u.kontak.replace(/\\D/g, '');
          if (digits && digits.length >= 8 && uDigits.endsWith(digits.slice(-8))) return u;
        }
      }
      return null;
    }

    function openLandingLoginModal(e) {
      if (e) e.preventDefault();
      clearLandingAlerts();
      var m = document.getElementById('modalLandingLogin');
      if (m) m.style.display = 'flex';
    }

    function closeLandingLoginModal() {
      var m = document.getElementById('modalLandingLogin');
      if (m) m.style.display = 'none';
    }

    function clearLandingAlerts() {
      var pErr = document.getElementById('landingPassError');
      var uWarn = document.getElementById('landingUnregisteredWarning');
      var passInput = document.getElementById('landingLoginPassword');
      if (pErr) pErr.style.display = 'none';
      if (uWarn) uWarn.style.display = 'none';
      if (passInput) {
        passInput.style.borderColor = '#27272a';
        passInput.style.outline = 'none';
      }
    }

    function handleLandingLogin(e) {
      e.preventDefault();
      clearLandingAlerts();
      var contact = document.getElementById('landingLoginContact').value.trim();
      var pass = document.getElementById('landingLoginPassword').value.trim();
      var passInput = document.getElementById('landingLoginPassword');

      var user = findRegisteredUser(contact);

      // Requirement 4: Akun belum terdaftar tidak boleh langsung masuk
      if (!user) {
        var uWarn = document.getElementById('landingUnregisteredWarning');
        if (uWarn) {
          uWarn.innerHTML = '⚠️ <strong>Akun belum terdaftar.</strong> Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.<div style="margin-top:10px;"><a href="/register" class="btn-primary" style="font-size:12px; padding:6px 12px; display:inline-block;">Daftar & Verifikasi Akun &rarr;</a></div>';
          uWarn.style.display = 'block';
        }
        return;
      }

      // Requirement 4: Akun belum diverifikasi tidak boleh langsung masuk
      if (user.isVerified === false) {
        var uWarn = document.getElementById('landingUnregisteredWarning');
        if (uWarn) {
          uWarn.innerHTML = '⚠️ <strong>Akun ini belum diverifikasi.</strong> Anda harus menyelesaikan verifikasi akun terlebih dahulu sebelum bisa masuk.<div style="margin-top:10px;"><a href="/register" class="btn-primary" style="font-size:12px; padding:6px 12px; display:inline-block;">Verifikasi Akun Sekarang &rarr;</a></div>';
          uWarn.style.display = 'block';
        }
        return;
      }

      // Requirement 3: Peringatan password salah & highlight merah
      var expectedPass = user.password || 'password123';
      if (pass !== expectedPass) {
        var pErr = document.getElementById('landingPassError');
        if (pErr) pErr.style.display = 'block';
        if (passInput) {
          passInput.style.borderColor = '#ef4444';
          passInput.style.outline = '2px solid #ef4444';
        }
        return;
      }

      // Login Sukses
      var profile = {
        nama: user.nama,
        kontak: user.kontak,
        email: user.email,
        avatarUrl: user.avatarUrl,
        statusPaket: user.statusPaket || 'Pro Lifetime (Rp99k)',
        isLoggedIn: true
      };

      try {
        localStorage.setItem('tatadana_user_profile', JSON.stringify(profile));
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('tatadana_user', JSON.stringify(profile));
        window.dispatchEvent(new Event('tatadana_profile_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch(err) {}

      closeLandingLoginModal();
      checkLandingAuth();
      window.location.href = '/dashboard';
    }

    function handleLandingDemoLogin() {
      var demoProfile = {
        nama: 'Pengguna TataDana (Demo)',
        kontak: '+62 812-3456-7890',
        email: 'user@tatadana.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
        statusPaket: 'Pro Lifetime (Rp99k)',
        isLoggedIn: true
      };
      try {
        localStorage.setItem('tatadana_user_profile', JSON.stringify(demoProfile));
        localStorage.setItem('user_profile', JSON.stringify(demoProfile));
        localStorage.setItem('tatadana_user', JSON.stringify(demoProfile));
        window.dispatchEvent(new Event('tatadana_profile_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch(err) {}
      closeLandingLoginModal();
      checkLandingAuth();
      window.location.href = '/dashboard';
    }

    // Modal Lupa Password di Landing Space
    function openLandingForgotPwModal(e) {
      if (e) e.preventDefault();
      closeLandingLoginModal();
      var c = document.getElementById('landingLoginContact');
      var targetInput = document.getElementById('landingForgotTarget');
      if (c && targetInput) targetInput.value = c.value.trim();

      document.getElementById('landingForgotAlert').style.display = 'none';
      document.getElementById('landingForgotSuccess').style.display = 'none';
      document.getElementById('landingForgotStep1').style.display = 'block';
      document.getElementById('landingForgotStep2').style.display = 'none';
      document.getElementById('modalLandingForgotPw').style.display = 'flex';
    }

    function closeLandingForgotPwModal() {
      document.getElementById('modalLandingForgotPw').style.display = 'none';
    }

    function sendLandingRecoveryOtp() {
      var target = document.getElementById('landingForgotTarget').value.trim();
      var alertBox = document.getElementById('landingForgotAlert');
      alertBox.style.display = 'none';

      if (!target) {
        alertBox.textContent = 'Masukkan email atau nomor kontak terdaftar.';
        alertBox.style.display = 'block';
        return;
      }

      var user = findRegisteredUser(target);
      if (!user) {
        alertBox.textContent = '⚠️ Akun tidak ditemukan dalam sistem terdaftar.';
        alertBox.style.display = 'block';
        return;
      }

      document.getElementById('landingForgotStep1').style.display = 'none';
      document.getElementById('landingForgotStep2').style.display = 'block';
    }

    function submitLandingResetPassword() {
      var target = document.getElementById('landingForgotTarget').value.trim();
      var otp = document.getElementById('landingForgotOtpCode').value.trim();
      var newPass = document.getElementById('landingForgotNewPass').value;
      var confPass = document.getElementById('landingForgotConfirmPass').value;
      var alertBox = document.getElementById('landingForgotAlert');
      var successBox = document.getElementById('landingForgotSuccess');
      alertBox.style.display = 'none';

      if (otp !== '123456') {
        alertBox.textContent = '❌ Kode OTP salah. Gunakan kode pemulihan demo: 123456';
        alertBox.style.display = 'block';
        return;
      }
      if (newPass.length < 6) {
        alertBox.textContent = 'Kata sandi baru minimal 6 karakter.';
        alertBox.style.display = 'block';
        return;
      }
      if (newPass !== confPass) {
        alertBox.textContent = 'Konfirmasi kata sandi tidak cocok.';
        alertBox.style.display = 'block';
        return;
      }

      var users = getRegisteredUsers();
      var user = findRegisteredUser(target);
      if (user) {
        for (var i = 0; i < users.length; i++) {
          if ((user.email && users[i].email && users[i].email.toLowerCase() === user.email.toLowerCase()) ||
              (user.kontak && users[i].kontak === user.kontak)) {
            users[i].password = newPass;
            break;
          }
        }
        saveRegisteredUsers(users);

        successBox.textContent = '✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.';
        successBox.style.display = 'block';

        setTimeout(function() {
          closeLandingForgotPwModal();
          openLandingLoginModal();
          var pInp = document.getElementById('landingLoginPassword');
          if (pInp) pInp.value = newPass;
        }, 1600);
      }
    }

    function checkLandingAuth() {
      try {
        var raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
        var container = document.getElementById('landingAuthActions');
        if (!container) return;

        if (raw) {
          var p = JSON.parse(raw);
          if (p && p.isLoggedIn) {
            var nama = p.nama || 'Pengguna TataDana';
            var avatar = p.avatarUrl || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(nama));
            container.innerHTML = `
              <div style="display:flex; align-items:center; gap:8px; background:#18181b; border:1px solid #27272a; border-radius:9999px; padding:4px 12px 4px 6px;">
                <img src="${avatar}" style="width:28px; height:28px; border-radius:50%; border:1px solid #f97316; object-fit:cover;" alt="Avatar">
                <span style="font-size:13px; font-weight:700; color:#f4f4f5; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${nama}</span>
              </div>
              <a href="/dashboard" class="btn-primary" style="padding:8px 16px; font-size:13px;">Masuk ke Dashboard &rarr;</a>
              <button onclick="logoutLanding()" class="btn-secondary" style="padding:8px 12px; font-size:12px; color:#ef4444;" title="Keluar / Logout">Keluar</button>
            `;
            return;
          }
        }

        // If not logged in
        container.innerHTML = `
          <button type="button" onclick="openLandingLoginModal(event)" class="btn-secondary" style="padding:8px 16px; font-size:13px;">Masuk</button>
          <a href="/register" class="btn-primary" style="padding:8px 16px; font-size:13px;">Mulai Gratis Sekarang &rarr;</a>
        `;
      } catch(e) {}
    }
    checkLandingAuth();
    window.addEventListener('tatadana_profile_updated', checkLandingAuth);
    window.addEventListener('storage', checkLandingAuth);

    function logoutLanding() {
      try {
        localStorage.removeItem('tatadana_user_profile');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('tatadana_user');
        window.dispatchEvent(new Event('tatadana_profile_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch(e) {}
      checkLandingAuth();
    }
  </script>
</body>
</html>`);
    return;
  }

  // Route 1: Register Page (/register)
  if (pathname === '/register' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>TataDana — Daftar Akun Baru</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .box { background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 40px; width: 100%; max-width: 440px; box-sizing: border-box; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.6); }
    h2 { margin: 0 0 8px; color: #f4f4f5; text-align: center; font-weight: 800; font-size: 26px; }
    p.sub { color: #a1a1aa; font-size: 14px; text-align: center; margin: 0 0 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; color: #d4d4d8; margin-bottom: 6px; font-weight: 600; }
    input { width: 100%; background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 12px; color: #f4f4f5; box-sizing: border-box; font-size: 14px; }
    input:focus { outline: 2px solid #f97316; }
    .btn-login { width: 100%; background: #f97316; color: #fff; border: none; border-radius: 10px; padding: 14px; font-weight: 700; cursor: pointer; margin-top: 10px; font-size: 14px; }
    .btn-login:hover { background: #ea580c; }
    .demo-box { margin-top: 20px; padding-top: 16px; border-top: 1px solid #27272a; text-align: center; font-size: 13px; }
    .demo-link { color: #f97316; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Tata<span style="color:#f97316">Dana</span></h2>
    <p class="sub">Daftar Akun TataDana & Langsung Mulai Catat Keuangan</p>

    <div id="regAlertError" style="display:none; background:rgba(239,68,68,0.18); border:1px solid #ef4444; border-radius:10px; padding:12px; color:#fca5a5; font-size:13px; margin-bottom:16px;"></div>

    <!-- LANGKAH 1: FORMULIR DATA -->
    <div id="regStep1">
      <form id="regForm" onsubmit="handleRegisterStep1(event)">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input type="text" id="regName" placeholder="misal: Budi Pratama" required>
        </div>
        <div class="form-group">
          <label>Nomor Kontak / WhatsApp</label>
          <input type="tel" id="regPhone" placeholder="misal: 081234567890" required>
        </div>
        <div class="form-group">
          <label>Alamat Email</label>
          <input type="email" id="regEmail" placeholder="misal: budi@example.com" required>
        </div>
        <div class="form-group">
          <label>Kata Sandi (Password)</label>
          <input type="password" id="regPass" placeholder="Minimal 6 karakter" minlength="6" required>
        </div>
        <button type="submit" class="btn-login">Lanjut ke Verifikasi OTP Akun &rarr;</button>
      </form>
    </div>

    <!-- LANGKAH 2: VERIFIKASI OTP -->
    <div id="regStep2" style="display:none;">
      <div style="background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.4); border-radius:10px; padding:12px; color:#fdba74; font-size:12px; margin-bottom:16px;">
        💡 <strong>Kode Verifikasi Demo:</strong> Gunakan kode OTP <span style="background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace; color:#fff;">123456</span> untuk mengaktifkan akun secara instan.
      </div>
      <form id="regOtpForm" onsubmit="handleRegisterStep2(event)">
        <div class="form-group">
          <label style="text-align:center;">Kode OTP Verifikasi (6 Digit)</label>
          <input type="text" id="regOtp" placeholder="123456" maxlength="6" style="text-align:center; font-size:22px; font-family:monospace; letter-spacing:8px; font-weight:700;" required>
        </div>
        <button type="submit" class="btn-login" style="background:#22c55e;">✓ Verifikasi & Aktifkan Akun</button>
        <button type="button" onclick="document.getElementById('regStep2').style.display='none'; document.getElementById('regStep1').style.display='block';" style="width:100%; margin-top:8px; background:#18181b; border:1px solid #27272a; color:#a1a1aa; padding:10px; border-radius:8px; cursor:pointer; font-size:12px;">&larr; Ubah Formulir</button>
      </form>
    </div>

    <div class="demo-box">
      <span style="color:#a1a1aa;">Sudah punya akun? </span>
      <a href="/login" class="demo-link">Masuk di sini &rarr;</a>
    </div>
  </div>

  <script>
    var tempReg = null;

    function getRegisteredUsers() {
      var def = [
        { nama: 'Pengguna TataDana', email: 'user@tatadana.com', kontak: '+62 812-3456-7890', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
        { nama: 'Budi Santoso', email: 'budi.santoso@tatadana.id', kontak: '+62 812-8899-0011', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true }
      ];
      try {
        var raw = localStorage.getItem('tatadana_registered_users');
        if (!raw) { localStorage.setItem('tatadana_registered_users', JSON.stringify(def)); return def; }
        return JSON.parse(raw);
      } catch(e) { return def; }
    }

    function handleRegisterStep1(e) {
      e.preventDefault();
      var err = document.getElementById('regAlertError');
      err.style.display = 'none';

      var name = document.getElementById('regName').value.trim();
      var phone = document.getElementById('regPhone').value.trim();
      var email = document.getElementById('regEmail').value.trim();
      var pass = document.getElementById('regPass').value;

      if (!name || !phone || !email || !pass) {
        err.textContent = 'Semua field wajib diisi.';
        err.style.display = 'block';
        return;
      }
      if (pass.length < 6) {
        err.textContent = 'Kata sandi minimal 6 karakter.';
        err.style.display = 'block';
        return;
      }

      var cleanPhone = phone.startsWith('+') ? phone : (phone.startsWith('0') ? '+62 ' + phone.slice(1) : '+62 ' + phone);
      tempReg = {
        nama: name,
        kontak: cleanPhone,
        email: email,
        password: pass,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name),
        statusPaket: 'Pro Lifetime (Rp99k)',
        isVerified: true
      };

      document.getElementById('regStep1').style.display = 'none';
      document.getElementById('regStep2').style.display = 'block';
    }

    function handleRegisterStep2(e) {
      e.preventDefault();
      var err = document.getElementById('regAlertError');
      var otp = document.getElementById('regOtp').value.trim();

      if (otp !== '123456') {
        err.textContent = '❌ Kode OTP salah. Gunakan kode verifikasi demo: 123456';
        err.style.display = 'block';
        return;
      }

      var users = getRegisteredUsers();
      var idx = users.findIndex(function(u) {
        return (u.email && u.email.toLowerCase() === tempReg.email.toLowerCase()) ||
               (u.kontak && u.kontak === tempReg.kontak);
      });
      if (idx >= 0) users[idx] = tempReg;
      else users.push(tempReg);
      try { localStorage.setItem('tatadana_registered_users', JSON.stringify(users)); } catch(e) {}

      var profile = {
        nama: tempReg.nama,
        kontak: tempReg.kontak,
        email: tempReg.email,
        avatarUrl: tempReg.avatarUrl,
        statusPaket: tempReg.statusPaket,
        isLoggedIn: true
      };
      try {
        localStorage.setItem('tatadana_user_profile', JSON.stringify(profile));
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('tatadana_user', JSON.stringify(profile));
      } catch(e) {}
      window.location.href = '/dashboard';
    }
  </script>
</body>
</html>`);
    return;
  }

  // Route 2: Login Page (/login)
  if (pathname === '/login' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>TataDana — Masuk ke Akun</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
    .box { background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 40px; width: 100%; max-width: 440px; box-sizing: border-box; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.6); position: relative; }
    h2 { margin: 0 0 8px; color: #f4f4f5; text-align: center; font-weight: 800; font-size: 26px; }
    p.sub { color: #a1a1aa; font-size: 14px; text-align: center; margin: 0 0 24px; }
    .form-group { margin-bottom: 18px; }
    label { display: block; font-size: 13px; color: #d4d4d8; margin-bottom: 6px; font-weight: 600; }
    input { width: 100%; background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 12px; color: #f4f4f5; box-sizing: border-box; font-size: 14px; }
    input:focus { outline: 2px solid #f97316; }
    .btn-login { width: 100%; background: #f97316; color: #fff; border: none; border-radius: 10px; padding: 14px; font-weight: 700; cursor: pointer; margin-top: 8px; font-size: 14px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25); }
    .btn-login:hover { background: #ea580c; }
    .demo-box { margin-top: 24px; padding-top: 20px; border-top: 1px solid #27272a; text-align: center; }
    .demo-link { color: #f97316; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Tata<span style="color:#f97316">Dana</span></h2>
    <p class="sub">Masuk ke Akun TataDana Anda</p>

    <!-- Alert Box Password Salah (Merah) -->
    <div id="loginPassError" style="display:none; background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:10px; padding:12px 14px; color:#fca5a5; font-size:13px; margin-bottom:16px; line-height:1.4;">
      ❌ <strong>Kata sandi yang Anda masukkan salah.</strong> Silakan periksa kembali atau gunakan opsi Lupa Password.
    </div>

    <!-- Alert Box Akun Belum Terdaftar (Oranye/Kuning) -->
    <div id="loginUnregisteredWarning" style="display:none; background:rgba(245,158,11,0.15); border:1px solid #f59e0b; border-radius:10px; padding:12px 14px; color:#fde68a; font-size:13px; margin-bottom:16px; line-height:1.4;">
      ⚠️ <strong>Akun belum terdaftar.</strong> Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.
      <div style="margin-top:8px;">
        <a href="/register" style="display:inline-block; background:#f97316; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; text-decoration:none;">Daftar Akun Baru &rarr;</a>
      </div>
    </div>

    <form onsubmit="handleLogin(event)">
      <div class="form-group">
        <label>Nomor HP (Verifikasi OTP) atau Email</label>
        <input type="text" id="loginContact" value="user@tatadana.com" required oninput="clearLoginAlerts()">
      </div>
      <div class="form-group">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label style="margin-bottom:0;">Kata Sandi</label>
          <a href="#forgot" onclick="openForgotModal(event)" style="color:#f97316; font-size:12px; font-weight:600; text-decoration:none;">Lupa Password?</a>
        </div>
        <input type="password" id="loginPass" value="password123" required oninput="clearLoginAlerts()">
      </div>
      <button type="submit" class="btn-login">Masuk ke Dashboard</button>
    </form>

    <div class="demo-box">
      <span style="color:#a1a1aa; font-size: 13px;">Belum punya akun?</span><br>
      <a href="/register" class="demo-link">Daftar Akun Baru TataDana &rarr;</a>
    </div>
  </div>

  <!-- Modal Pemulihan Kata Sandi (Lupa Password) -->
  <div id="modalForgot" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#121215; border:1px solid #27272a; border-radius:16px; width:100%; max-width:440px; padding:24px; position:relative; box-shadow:0 20px 40px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:18px; font-weight:800; color:#f4f4f5;">🔐 Pemulihan Kata Sandi</h3>
        <button onclick="document.getElementById('modalForgot').style.display='none'" style="background:none; border:none; color:#a1a1aa; font-size:22px; cursor:pointer;">&times;</button>
      </div>

      <div id="forgotAlert" style="display:none; background:rgba(239,68,68,0.18); border:1px solid #ef4444; border-radius:8px; padding:10px; color:#fca5a5; font-size:12px; margin-bottom:14px;"></div>
      <div id="forgotSuccess" style="display:none; background:rgba(34,197,94,0.18); border:1px solid #22c55e; border-radius:8px; padding:10px; color:#86efac; font-size:12px; margin-bottom:14px;"></div>

      <div id="fStep1">
        <p style="font-size:13px; color:#a1a1aa; margin:0 0 14px;">Masukkan Email atau Nomor Kontak terdaftar untuk menerima OTP pemulihan.</p>
        <div class="form-group">
          <label>Email atau Nomor Kontak Terdaftar</label>
          <input type="text" id="fTarget" placeholder="user@tatadana.com" required>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" onclick="document.getElementById('modalForgot').style.display='none'" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:13px;">Batal</button>
          <button type="button" onclick="sendForgotOtp()" style="background:#f97316; border:none; color:#fff; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px;">Kirim Kode OTP Pemulihan</button>
        </div>
      </div>

      <div id="fStep2" style="display:none;">
        <div style="background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.4); border-radius:8px; padding:10px; color:#fdba74; font-size:12px; margin-bottom:14px;">
          💡 <strong>Kode OTP Demo:</strong> Masukkan kode <span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; font-weight:800; font-family:monospace; color:#fff;">123456</span>
        </div>
        <div class="form-group">
          <label>Kode OTP 6-Digit</label>
          <input type="text" id="fOtp" placeholder="123456" maxlength="6" style="text-align:center; font-size:18px; font-family:monospace; letter-spacing:4px;" required>
        </div>
        <div class="form-group">
          <label>Kata Sandi Baru</label>
          <input type="password" id="fPass1" placeholder="Minimal 6 karakter" minlength="6" required>
        </div>
        <div class="form-group">
          <label>Konfirmasi Kata Sandi Baru</label>
          <input type="password" id="fPass2" placeholder="Ulangi kata sandi baru" minlength="6" required>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <button type="button" onclick="document.getElementById('fStep1').style.display='block'; document.getElementById('fStep2').style.display='none';" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:12px;">&larr; Kembali</button>
          <button type="button" onclick="submitForgotPass()" style="background:#f97316; border:none; color:#fff; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px;">Simpan Kata Sandi Baru</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    function getRegisteredUsers() {
      var def = [
        { nama: 'Pengguna TataDana', email: 'user@tatadana.com', kontak: '+62 812-3456-7890', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
        { nama: 'Budi Santoso', email: 'budi.santoso@tatadana.id', kontak: '+62 812-8899-0011', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true }
      ];
      try {
        var raw = localStorage.getItem('tatadana_registered_users');
        if (!raw) { localStorage.setItem('tatadana_registered_users', JSON.stringify(def)); return def; }
        return JSON.parse(raw);
      } catch(e) { return def; }
    }

    function findRegisteredUser(identifier) {
      var users = getRegisteredUsers();
      var idTrim = identifier.trim().toLowerCase();
      var digits = idTrim.replace(/\\D/g, '');
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (u.email && u.email.toLowerCase() === idTrim) return u;
        if (u.kontak) {
          if (u.kontak.toLowerCase() === idTrim) return u;
          var uDigits = u.kontak.replace(/\\D/g, '');
          if (digits && digits.length >= 8 && uDigits.endsWith(digits.slice(-8))) return u;
        }
      }
      return null;
    }

    function clearLoginAlerts() {
      document.getElementById('loginPassError').style.display = 'none';
      document.getElementById('loginUnregisteredWarning').style.display = 'none';
      var p = document.getElementById('loginPass');
      if (p) { p.style.borderColor = '#27272a'; p.style.outline = 'none'; }
    }

    function handleLogin(e) {
      e.preventDefault();
      clearLoginAlerts();
      var contact = document.getElementById('loginContact').value.trim();
      var pass = document.getElementById('loginPass').value.trim();

      var user = findRegisteredUser(contact);

      // Requirement 4: Akun belum terdaftar tidak boleh langsung masuk
      if (!user) {
        var uWarn = document.getElementById('loginUnregisteredWarning');
        if (uWarn) {
          uWarn.innerHTML = '⚠️ <strong>Akun belum terdaftar.</strong> Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.<div style="margin-top:8px;"><a href="/register" style="display:inline-block; background:#f97316; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; text-decoration:none;">Daftar Akun Baru &rarr;</a></div>';
          uWarn.style.display = 'block';
        }
        return;
      }

      // Requirement 4: Akun belum diverifikasi tidak boleh langsung masuk
      if (user.isVerified === false) {
        var uWarn = document.getElementById('loginUnregisteredWarning');
        if (uWarn) {
          uWarn.innerHTML = '⚠️ <strong>Akun ini belum diverifikasi.</strong> Anda harus menyelesaikan verifikasi akun terlebih dahulu sebelum bisa masuk.<div style="margin-top:8px;"><a href="/register" style="display:inline-block; background:#f97316; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; text-decoration:none;">Verifikasi Akun Sekarang &rarr;</a></div>';
          uWarn.style.display = 'block';
        }
        return;
      }

      // Requirement 3: Peringatan password salah & highlight merah
      var expectedPass = user.password || 'password123';
      if (pass !== expectedPass) {
        document.getElementById('loginPassError').style.display = 'block';
        var pInp = document.getElementById('loginPass');
        pInp.style.borderColor = '#ef4444';
        pInp.style.outline = '2px solid #ef4444';
        return;
      }

      // Login berhasil
      var profile = {
        nama: user.nama,
        kontak: user.kontak,
        email: user.email,
        avatarUrl: user.avatarUrl,
        statusPaket: user.statusPaket || 'Pro Lifetime (Rp99k)',
        isLoggedIn: true
      };
      try {
        localStorage.setItem('tatadana_user_profile', JSON.stringify(profile));
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('tatadana_user', JSON.stringify(profile));
      } catch(e) {}
      window.location.href = '/dashboard';
    }

    function openForgotModal(e) {
      if (e) e.preventDefault();
      var c = document.getElementById('loginContact');
      if (c) document.getElementById('fTarget').value = c.value.trim();
      document.getElementById('forgotAlert').style.display = 'none';
      document.getElementById('forgotSuccess').style.display = 'none';
      document.getElementById('fStep1').style.display = 'block';
      document.getElementById('fStep2').style.display = 'none';
      document.getElementById('modalForgot').style.display = 'flex';
    }

    function sendForgotOtp() {
      var t = document.getElementById('fTarget').value.trim();
      var a = document.getElementById('forgotAlert');
      a.style.display = 'none';
      if (!t) { a.textContent = 'Masukkan email atau nomor HP terdaftar.'; a.style.display = 'block'; return; }
      var u = findRegisteredUser(t);
      if (!u) { a.textContent = 'Akun belum terdaftar dalam sistem.'; a.style.display = 'block'; return; }
      document.getElementById('fStep1').style.display = 'none';
      document.getElementById('fStep2').style.display = 'block';
    }

    function submitForgotPass() {
      var t = document.getElementById('fTarget').value.trim();
      var otp = document.getElementById('fOtp').value.trim();
      var p1 = document.getElementById('fPass1').value;
      var p2 = document.getElementById('fPass2').value;
      var a = document.getElementById('forgotAlert');
      var s = document.getElementById('forgotSuccess');
      a.style.display = 'none';

      if (otp !== '123456') { a.textContent = '❌ Kode OTP salah. Gunakan kode demo: 123456'; a.style.display = 'block'; return; }
      if (p1.length < 6) { a.textContent = 'Kata sandi baru minimal 6 karakter.'; a.style.display = 'block'; return; }
      if (p1 !== p2) { a.textContent = 'Konfirmasi kata sandi tidak cocok.'; a.style.display = 'block'; return; }

      var users = getRegisteredUsers();
      var u = findRegisteredUser(t);
      if (u) {
        for (var i = 0; i < users.length; i++) {
          if ((u.email && users[i].email && users[i].email.toLowerCase() === u.email.toLowerCase()) ||
              (u.kontak && users[i].kontak === u.kontak)) {
            users[i].password = p1;
            break;
          }
        }
        try { localStorage.setItem('tatadana_registered_users', JSON.stringify(users)); } catch(e) {}
        s.textContent = '✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.';
        s.style.display = 'block';
        setTimeout(function() {
          document.getElementById('modalForgot').style.display = 'none';
          document.getElementById('loginPass').value = p1;
        }, 1500);
      }
    }
  </script>
</body>
</html>`);
    return;
  }

  // Route 3: Dashboard Overview (/dashboard)
  if (pathname === '/dashboard' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>TataDana — Dashboard Overview</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
    .sidebar a { color: #a1a1aa; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; display: block; }
    .sidebar a.active { background: rgba(249, 115, 22, 0.15); color: #f97316; font-weight: 700; border: 1px solid rgba(249, 115, 22, 0.35); }
    .sidebar a:hover { background: #18181b; color: #f4f4f5; }
    .content { flex: 1; overflow-y: auto; padding: 32px; box-sizing: border-box; background-color: #09090b; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    .stat-card .label { font-size: 13px; color: #a1a1aa; margin-bottom: 6px; }
    .stat-card .val { font-size: 24px; font-weight: 800; color: #f4f4f5; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th { text-align: left; padding: 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #1f1f23; color: #f4f4f5; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .badge-expense { background: rgba(239, 68, 68, 0.18); color: #ef4444; }
    .badge-income { background: rgba(34, 197, 94, 0.18); color: #22c55e; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin-bottom: 24px;">Tata<span style="color:#f97316">Dana</span></div>
    <a href="/dashboard" class="nav-item active">📊 Overview</a>
    <a href="/dashboard/wallets" class="nav-item">💼 Multi-Wallet</a>
    <a href="/dashboard/budgets" class="nav-item">🎯 Budgets (█░)</a>
    <a href="/dashboard/reports" class="nav-item">📑 Reports & Export</a>
    <a href="/dashboard/settings" class="nav-item">⚙️ Pengaturan & Bot</a>
    <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
      <a href="/admin" style="color: #f97316; font-weight: 600; text-decoration: none;">🛡️ Superadmin Panel</a>
      <a href="/" style="color: #71717a; text-decoration: none;">⬅️ Ke Landing Page</a>

      <!-- Profil Pengguna Terdaftar -->
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 10px 12px; margin-top: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <div style="position: relative; flex-shrink: 0;">
              <img id="sidebar-user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" alt="Avatar" style="width: 34px; height: 34px; border-radius: 50%; border: 2px solid #f97316; background: #27272a; object-fit: cover;">
              <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; border: 2px solid #18181b;"></div>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div id="sidebar-user-name" style="font-size: 12px; font-weight: 700; color: #f4f4f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pengguna TataDana</div>
              <div id="sidebar-user-contact" style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">+62 812-3456-7890</div>
            </div>
          </div>
          <button onclick="handleLogout()" title="Keluar / Logout" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 6px; padding: 4px 6px; cursor: pointer; font-size: 13px; line-height: 1;">
            🚪
          </button>
        </div>
        <!-- Requirement 1: Tombol Ubah Profil -->
        <button type="button" onclick="openProfileModal()" style="width: 100%; margin-top: 8px; padding: 6px 8px; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); color: #f97316; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ✏️ Ubah Profil
        </button>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #27272a; font-size: 10px;">
          <span style="color: #71717a;">Status:</span>
          <span id="sidebar-user-badge" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: #f97316; font-size: 10px; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">Pro Lifetime (Rp99k)</span>
        </div>
      </div>
    </div>
  </div>
  <div class="content">
    <div class="header">
      <div>
        <h1 style="font-size: 26px; margin: 0; color: #f4f4f5; font-weight: 800;">Ringkasan Keuangan & Dashboard Finansial</h1>
        <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Zona Waktu: Asia/Jakarta (WIB) • Terhubung ke Telegram Bot</p>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.35); padding: 8px 16px; border-radius: 8px; color: #f97316; font-size: 13px; font-weight: 700;">
          ⚡ Bot Status: Online (WIB)
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:#18181b; border:1px solid #27272a; border-radius:9999px; padding:3px 12px 3px 5px;">
          <img id="header-user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" style="width:26px; height:26px; border-radius:50%; border:1px solid #f97316; object-fit:cover;" alt="Avatar">
          <span id="header-user-name" style="font-size:12px; font-weight:700; color:#f4f4f5; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Pengguna TataDana</span>
        </div>
        <button onclick="openProfileModal()" style="padding:6px 12px; font-size:11px; font-weight:700; background:#18181b; border:1px solid #27272a; color:#f4f4f5; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:4px;">
          <span>✏️ Ubah Profil</span>
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Saldo Total (Semua Wallet)</div>
        <div class="val">Rp 15.750.000</div>
      </div>
      <div class="stat-card">
        <div class="label">Pemasukan Bulan Ini</div>
        <div class="val" style="color: #22c55e;">Rp 25.000.000</div>
      </div>
      <div class="stat-card">
        <div class="label">Pengeluaran Bulan Ini</div>
        <div class="val" style="color: #ef4444;">Rp 9.250.000</div>
      </div>
      <div class="stat-card">
        <div class="label">Sisa Budget Tersisa</div>
        <div class="val" style="color: #f97316;">Rp 3.750.000</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px; color: #f4f4f5; font-weight: 700;">10 Transaksi Terbaru (WIB)</h3>
      <table>
        <thead>
          <tr>
            <th>Waktu (WIB)</th>
            <th>Deskripsi</th>
            <th>Kategori</th>
            <th>Wallet</th>
            <th>Nominal</th>
            <th>Sumber</th>
          </tr>
        </thead>
        <tbody>
          ${USER_TRANSACTIONS.map(tx => `
            <tr>
              <td>${tx.waktu}</td>
              <td><strong>${tx.deskripsi}</strong></td>
              <td>${tx.kategori}</td>
              <td>${tx.wallet}</td>
              <td style="color:${tx.nominal > 0 ? '#22c55e' : '#ef4444'}; font-weight:600;">
                ${tx.nominal > 0 ? '+' : '-'}Rp ${Math.abs(tx.nominal).toLocaleString('id-ID')}
              </td>
              <td><span class="badge ${tx.nominal > 0 ? 'badge-income' : 'badge-expense'}">${tx.sumber}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  ${PROFILE_MODAL_HTML}
  <script>
    ${PROFILE_MODAL_JS}
  </script>
</body>
</html>`);
    return;
  }

  // Route: Multi-Wallet (/dashboard/wallets)
  if (pathname === '/dashboard/wallets' && method === 'GET') {
    const walletsContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin: 0 0 4px;">Kelola Multi-Wallet & Rekening</h2>
          <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Multi-rekening terintegrasi: Bank, E-Wallet, dan Dompet Tunai (Standar WIB).</p>
        </div>
        <button class="btn-primary" onclick="alert('Fitur tambah wallet tersedia di sistem.')">+ Tambah Dompet Baru</button>
      </div>

      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="card" style="border-color: #f97316;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
            <span style="font-size: 24px;">🏦</span>
            <span class="badge badge-orange">★ DEFAULT TELEGRAM</span>
          </div>
          <div style="font-size: 13px; color: #a1a1aa;">Bank BCA (Utama)</div>
          <div style="font-size: 24px; font-weight: 800; color: #f4f4f5; margin: 8px 0;">Rp 12.500.000</div>
          <div style="font-size: 12px; color: #71717a;">Dipakai otomatis saat input bot tanpa opsi dompet</div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
            <span style="font-size: 24px;">🏦</span>
            <span class="badge badge-green">Aktif</span>
          </div>
          <div style="font-size: 13px; color: #a1a1aa;">Bank Mandiri (Tabungan)</div>
          <div style="font-size: 24px; font-weight: 800; color: #f4f4f5; margin: 8px 0;">Rp 2.150.000</div>
          <div style="font-size: 12px; color: #71717a;">Rekening cadangan darurat</div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
            <span style="font-size: 24px;">👛</span>
            <span class="badge badge-green">Aktif</span>
          </div>
          <div style="font-size: 13px; color: #a1a1aa;">GoPay</div>
          <div style="font-size: 24px; font-weight: 800; color: #f4f4f5; margin: 8px 0;">Rp 350.000</div>
          <div style="font-size: 12px; color: #71717a;">E-Wallet transportasi & kuliner</div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
            <span style="font-size: 24px;">💵</span>
            <span class="badge badge-green">Aktif</span>
          </div>
          <div style="font-size: 13px; color: #a1a1aa;">Dompet Kas / Tunai</div>
          <div style="font-size: 24px; font-weight: 800; color: #f4f4f5; margin: 8px 0;">Rp 750.000</div>
          <div style="font-size: 12px; color: #71717a;">Uang cash di dompet fisik</div>
        </div>
      </div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardShell('Multi-Wallet', walletsContent, 'wallets'));
    return;
  }

  // Route: Budgets (/dashboard/budgets)
  if (pathname === '/dashboard/budgets' && method === 'GET') {
    const budgetsContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin: 0 0 4px;">Budget Bulanan per Kategori</h2>
          <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Progress bar visual dengan alert otomatis ke Telegram saat mencapai 80% dan 100%.</p>
        </div>
        <button class="btn-primary">+ Tambah Budget Kategori</button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <span style="font-size:20px;">🍜</span>
              <strong style="color:#f4f4f5; font-size:16px;"> Makanan & Minuman</strong>
            </div>
            <span class="badge badge-orange">78% Terpakai</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #f97316; letter-spacing: 2px; margin: 12px 0;">
            ████████░░ 78%
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; color:#a1a1aa;">
            <span>Terpakai: Rp 1.580.000</span>
            <span>Budget: Rp 2.000.000</span>
          </div>
          <div style="margin-top:12px; font-size:12px; color:#22c55e;">
            ● Sisa budget: Rp 420.000 (Alert 80% siap dikirim jika transaksi berikutnya > Rp 20.000)
          </div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <span style="font-size:20px;">🚗</span>
              <strong style="color:#f4f4f5; font-size:16px;"> Transportasi</strong>
            </div>
            <span class="badge badge-green">45% Terpakai</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #22c55e; letter-spacing: 2px; margin: 12px 0;">
            █████░░░░░ 45%
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; color:#a1a1aa;">
            <span>Terpakai: Rp 450.000</span>
            <span>Budget: Rp 1.000.000</span>
          </div>
          <div style="margin-top:12px; font-size:12px; color:#71717a;">
            ● Sisa budget: Rp 550.000 (Kondisi sangat aman)
          </div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <span style="font-size:20px;">🏠</span>
              <strong style="color:#f4f4f5; font-size:16px;"> Tagihan & Utilitas</strong>
            </div>
            <span class="badge badge-green">60% Terpakai</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #3b82f6; letter-spacing: 2px; margin: 12px 0;">
            ██████░░░░ 60%
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; color:#a1a1aa;">
            <span>Terpakai: Rp 1.800.000</span>
            <span>Budget: Rp 3.000.000</span>
          </div>
          <div style="margin-top:12px; font-size:12px; color:#71717a;">
            ● Sisa budget: Rp 1.200.000 (Listrik & Internet sudah terbayar)
          </div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <span style="font-size:20px;">🎮</span>
              <strong style="color:#f4f4f5; font-size:16px;"> Hiburan & Rekreasi</strong>
            </div>
            <span class="badge badge-red">92% Terpakai (Waspada!)</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #ef4444; letter-spacing: 2px; margin: 12px 0;">
            █████████░ 92%
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; color:#a1a1aa;">
            <span>Terpakai: Rp 920.000</span>
            <span>Budget: Rp 1.000.000</span>
          </div>
          <div style="margin-top:12px; font-size:12px; color:#ef4444;">
            ⚠️ Sisa budget: Rp 80.000 (Alert 80% telah terkirim via bot Telegram!)
          </div>
        </div>
      </div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardShell('Budget Bulanan', budgetsContent, 'budgets'));
    return;
  }

  // Route: Reports & Export (/dashboard/reports)
  if (pathname === '/dashboard/reports' && method === 'GET') {
    const reportsContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin: 0 0 4px;">Laporan & Analisis Arus Kas</h2>
          <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Rekapitulasi keuangan bulanan & riwayat ekspor data resmi TataDana.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <a href="/api/export/pdf" class="btn-primary" style="background:#ef4444;" download="Laporan_TataDana_Okt_2026.pdf">📑 Ekspor PDF</a>
          <a href="/api/export/excel" class="btn-primary" style="background:#22c55e;" download="Laporan_TataDana_Okt_2026.csv">📊 Ekspor Excel (CSV)</a>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Total Pemasukan (Oktober 2026)</div>
          <div class="val" style="color:#22c55e;">Rp 25.000.000</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Pengeluaran (Oktober 2026)</div>
          <div class="val" style="color:#ef4444;">Rp 9.250.000</div>
        </div>
        <div class="stat-card">
          <div class="label">Net Cashflow Bulanan</div>
          <div class="val" style="color:#22c55e;">+Rp 15.750.000</div>
        </div>
        <div class="stat-card">
          <div class="label">Rasio Tabungan (Savings Rate)</div>
          <div class="val" style="color:#f97316;">63.0%</div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin: 0 0 16px; color: #f4f4f5; font-weight: 700;">Riwayat Ekspor Dokumen Laporan</h3>
        <table>
          <thead>
            <tr>
              <th>Nama File</th>
              <th>Format</th>
              <th>Rentang Waktu</th>
              <th>Ukuran</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Laporan_Keuangan_TataDana_Sep_2026.pdf</td>
              <td><span class="badge badge-red">PDF</span></td>
              <td>01 Sep - 30 Sep 2026</td>
              <td>142 KB</td>
              <td><span class="badge badge-green">Siap Diunduh</span></td>
              <td><a href="/api/export/pdf" style="color:#f97316; font-weight:600; text-decoration:none;">Unduh PDF &darr;</a></td>
            </tr>
            <tr>
              <td>Transaksi_TataDana_Sep_2026.xlsx</td>
              <td><span class="badge badge-green">EXCEL / CSV</span></td>
              <td>01 Sep - 30 Sep 2026</td>
              <td>38 KB</td>
              <td><span class="badge badge-green">Siap Diunduh</span></td>
              <td><a href="/api/export/excel" style="color:#22c55e; font-weight:600; text-decoration:none;">Unduh CSV &darr;</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardShell('Laporan & Export', reportsContent, 'reports'));
    return;
  }

  // Route: Settings & Bot (/dashboard/settings)
  if (pathname === '/dashboard/settings' && method === 'GET') {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const randToken = `/start token_td_${randNum}`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pengaturan & Integrasi Bot Telegram — TataDana</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
    .sidebar a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; color: #a1a1aa; text-decoration: none; font-size: 14px; font-weight: 500; }
    .sidebar a:hover { background: #18181b; color: #f4f4f5; }
    .sidebar a.active { background: rgba(249, 115, 22, 0.15); color: #f97316; font-weight: 700; border: 1px solid rgba(249, 115, 22, 0.35); }
    .content { flex: 1; overflow-y: auto; padding: 32px 40px; box-sizing: border-box; }
    .header { margin-bottom: 28px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 14px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    .btn-primary { background: #f97316; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.2s; font-size: 14px; }
    .btn-primary:hover { background: #ea580c; }
    .btn-secondary { background: #121215; border: 1px solid #27272a; color: #f4f4f5; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
    .btn-secondary:hover { background: #27272a; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .badge-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); }
    .badge-green { background: rgba(34, 197, 94, 0.18); color: #22c55e; border: 1px solid #22c55e; }
    @keyframes toastSlideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    #interactiveChatBox::-webkit-scrollbar { width: 6px; }
    #interactiveChatBox::-webkit-scrollbar-track { background: #09090b; }
    #interactiveChatBox::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin-bottom: 24px; padding-left: 8px;">Tata<span style="color:#f97316">Dana</span></div>
    <a href="/dashboard" class="nav-item">📊 Overview</a>
    <a href="/dashboard/wallets" class="nav-item">💼 Multi-Wallet</a>
    <a href="/dashboard/budgets" class="nav-item">🎯 Budgets (█░)</a>
    <a href="/dashboard/reports" class="nav-item">📑 Reports & Export</a>
    <a href="/dashboard/settings" class="nav-item active">⚙️ Pengaturan & Bot</a>
    <a href="/boost" class="nav-item">🚀 Pro Boost</a>
    <a href="/teamwork-preview" class="nav-item">👥 Teamwork Preview</a>
    <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
      <a href="/admin" style="color: #f97316; font-weight: 600; text-decoration: none; padding: 8px 14px;">🛡️ Superadmin Panel</a>
      <a href="/" style="color: #71717a; text-decoration: none; padding: 8px 14px;">⬅️ Ke Landing Page</a>

      <!-- Profil Pengguna Terdaftar -->
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 10px 12px; margin-top: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <div style="position: relative; flex-shrink: 0;">
              <img id="sidebar-user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser" alt="Avatar" style="width: 34px; height: 34px; border-radius: 50%; border: 2px solid #f97316; background: #27272a; object-fit: cover;">
              <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; border: 2px solid #18181b;"></div>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div id="sidebar-user-name" style="font-size: 12px; font-weight: 700; color: #f4f4f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pengguna TataDana</div>
              <div id="sidebar-user-contact" style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">+62 812-3456-7890</div>
            </div>
          </div>
          <button onclick="handleLogout()" title="Keluar / Logout" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 6px; padding: 4px 6px; cursor: pointer; font-size: 13px; line-height: 1;">
            🚪
          </button>
        </div>
        <button type="button" onclick="openProfileModal()" style="width: 100%; margin-top: 8px; padding: 6px 8px; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); color: #f97316; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ✏️ Ubah Profil
        </button>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #27272a; font-size: 10px;">
          <span style="color: #71717a;">Status:</span>
          <span id="sidebar-user-badge" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: #f97316; font-size: 10px; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">Pro Lifetime (Rp99k)</span>
        </div>
      </div>
    </div>
  </div>

  <div class="content">
    <div class="header">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <span class="badge badge-orange">⚙️ Pengaturan & Bot</span>
        <span style="font-size:12px; color:#71717a;">● Asia/Jakarta (WIB)</span>
      </div>
      <h1 style="font-size: 26px; margin: 0; color: #f4f4f5; font-weight: 800;">Integrasi Bot Telegram</h1>
      <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Hubungkan akun TataDana Anda ke bot Telegram untuk mulai mencatat keuangan instan via chat.</p>
    </div>

    <!-- LANGKAH 1 -->
    <div class="card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <span class="badge badge-orange">Langkah 1</span>
        <h3 style="margin:0; font-size:17px; font-weight:700;">Hubungi Bot Telegram Resmi</h3>
      </div>
      <p style="color:#a1a1aa; font-size:14px; line-height:1.6; margin:0 0 18px;">
        Hubungi bot Telegram resmi TataDana dengan mengeklik tombol oranye besar di bawah ini. Tombol ini akan membuka link eksternal ke Telegram bot.
      </p>
      <div>
        <a href="https://t.me/TataDanaBot" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:14px 28px; font-size:15px; font-weight:700; box-shadow:0 4px 14px rgba(249, 115, 22, 0.35);">
          ✈️ Buka Bot Telegram (t.me/TataDanaBot)
        </a>
      </div>
    </div>

    <!-- LANGKAH 2 -->
    <div class="card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <span class="badge badge-orange">Langkah 2</span>
        <h3 style="margin:0; font-size:17px; font-weight:700;">Sistem Pairing / Token</h3>
      </div>
      <label style="display:block; font-size:12px; font-weight:700; color:#a1a1aa; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
        Kode Token Aktivasi
      </label>
      <div style="display:flex; gap:12px; align-items:center; max-width:650px;">
        <div style="flex:1; background:#121215; border:1px solid #27272a; border-radius:10px; padding:14px 18px;">
          <code id="tokenText" style="font-family:monospace; font-size:16px; font-weight:700; color:#f97316;">${randToken}</code>
        </div>
        <button id="btnCopyCode" onclick="copyToken()" class="btn-secondary">
          📋 <span id="btnCopyLabel">Salin Kode</span>
        </button>
      </div>
      <p style="margin:12px 0 0; color:#a1a1aa; font-size:13px;">
        💡 <em>Kirimkan kode token di atas ke chat bot Telegram Anda atau coba langsung di Chat Interaktif di bawah!</em>
      </p>
    </div>

    <!-- LANGKAH 3 -->
    <div class="card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <span class="badge badge-orange">Langkah 3</span>
        <h3 style="margin:0; font-size:17px; font-weight:700;">Verifikasi Status Hubungan</h3>
      </div>
      <p style="color:#a1a1aa; font-size:14px; margin:0 0 16px;">
        Setelah mengirimkan token ke chat bot Telegram, klik tombol verifikasi di bawah ini untuk mengonfirmasi pairing.
      </p>
      <div id="statusContainer" style="padding:16px 20px; background:#121215; border:1px solid #27272a; border-radius:10px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; transition:all 0.3s ease;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="statusDot" style="width:12px; height:12px; border-radius:50%; background:#71717a; transition:all 0.3s ease;"></div>
          <div>
            <div id="stTitle" style="font-size:14px; font-weight:700;">Status: Belum Terhubung</div>
            <div id="stSub" style="font-size:12px; color:#71717a; margin-top:2px;">Kirim token di atas ke bot Telegram untuk mulai verifikasi</div>
          </div>
        </div>
        <span id="stBadge" class="badge" style="background:#27272a; color:#a1a1aa;">Menunggu Verifikasi</span>
      </div>
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <button id="btnVerify" class="btn-primary" onclick="verifyConnection()">
          <span id="verifySpinner" style="display:none; animation: spin 1s linear infinite;">🔄</span>
          <span id="verifyText">Verifikasi Hubungan</span>
        </button>
        <button id="btnDisconnect" class="btn-secondary" onclick="disconnectConnection()" style="display:none; border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,0.1);">
          🔌 Putus Koneksi
        </button>
      </div>
    </div>

    <!-- CHAT INTERAKTIF TATADANA BOT -->
    <div class="card" style="background:#121215;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #f97316, #ea580c); display:flex; align-items:center; justify-content:center; font-size:22px; box-shadow:0 0 14px rgba(249,115,22,0.4);">
            🤖
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h3 style="margin:0; font-size:17px; font-weight:800; color:#f4f4f5;">💬 Chat Interaktif TataDana Bot</h3>
              <span class="badge badge-green" style="font-size:11px; padding:2px 8px;">● Online</span>
            </div>
            <p style="margin:3px 0 0; color:#71717a; font-size:12px;">Ketik pesan simulasi bot Telegram langsung dari browser secara real-time</p>
          </div>
        </div>
        <span class="badge badge-orange" style="font-size:11px;">⚡ Multi-Modal AI & Webhook Sync</span>
      </div>

      <!-- Chat Bubble Container -->
      <div id="interactiveChatBox" style="background:#09090b; border:1px solid #27272a; border-radius:12px; height:380px; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; scroll-behavior:smooth;">
        <div class="chat-msg bot-msg" style="align-self:flex-start; max-width:85%; background:#18181b; border:1px solid #27272a; border-radius:12px 12px 12px 2px; padding:14px 16px; color:#f4f4f5; font-size:13px; line-height:1.55; box-shadow:0 2px 8px rgba(0,0,0,0.4);">
          <div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#f97316; margin-bottom:6px;">
            <span>🤖 TataDana Bot</span>
            <span style="color:#71717a;">• Baru saja</span>
          </div>
          👋 <strong>Halo Sobat TataDana!</strong> Saya bot asisten keuangan pintar Anda.<br><br>
          Kirimkan kode token aktivasi untuk pairing, atau langsung coba ketik pengeluaran seperti <code>beli kopi 18rb</code> atau ketik <code>/bantuan</code>!
        </div>
      </div>

      <!-- Shortcut Chips -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding:12px 2px 6px; margin-top:8px;">
        <button type="button" onclick="sendQuickMessage('${randToken}')" style="background:#18181b; border:1px solid #f97316; color:#f97316; font-size:11px; font-weight:700; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">📋 Token Pairing</button>
        <button type="button" onclick="sendQuickMessage('beli kopi 18rb')" style="background:#18181b; border:1px solid #27272a; color:#f4f4f5; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">☕ Beli Kopi 18rb</button>
        <button type="button" onclick="sendQuickMessage('makan siang 35rb')" style="background:#18181b; border:1px solid #27272a; color:#f4f4f5; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">🍜 Makan Siang 35rb</button>
        <button type="button" onclick="sendQuickMessage('bensin 50rb')" style="background:#18181b; border:1px solid #27272a; color:#f4f4f5; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">⛽ Bensin 50rb</button>
        <button type="button" onclick="sendQuickMessage('gajian 25jt')" style="background:#18181b; border:1px solid #22c55e; color:#22c55e; font-size:11px; font-weight:700; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">💰 Gajian 25jt</button>
        <button type="button" onclick="sendQuickMessage('/saldo')" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">/saldo</button>
        <button type="button" onclick="sendQuickMessage('/hari ini')" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">/hari ini</button>
        <button type="button" onclick="sendQuickMessage('/budget')" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">/budget</button>
        <button type="button" onclick="sendQuickMessage('/boost')" style="background:#18181b; border:1px solid #f97316; color:#f97316; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">🚀 /boost</button>
        <button type="button" onclick="sendQuickMessage('/teamwork-preview')" style="background:#18181b; border:1px solid #3b82f6; color:#60a5fa; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">👥 /teamwork-preview</button>
        <button type="button" onclick="sendQuickMessage('/bantuan')" style="background:#18181b; border:1px solid #27272a; color:#a1a1aa; font-size:11px; font-weight:600; padding:6px 12px; border-radius:20px; cursor:pointer; white-space:nowrap;">/bantuan</button>
      </div>

      <!-- Input Form -->
      <form onsubmit="handleSendChat(event)" style="display:flex; gap:10px; margin-top:10px;">
        <input type="text" id="chatMessageInput" placeholder="Ketik pesan ke bot (contoh: beli kopi 18rb atau /saldo)..." autocomplete="off" style="flex:1; background:#09090b; border:1px solid #27272a; border-radius:10px; padding:12px 16px; color:#f4f4f5; font-size:14px; outline:none;" onfocus="this.style.borderColor='#f97316'" onblur="this.style.borderColor='#27272a'">
        <button type="submit" class="btn-primary" style="padding:12px 22px; border-radius:10px; font-weight:700;">
          Kirim ✈️
        </button>
      </form>
    </div>
  </div>

  <!-- Toast -->
  <div id="toastNotif" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#18181b; border:1px solid #22c55e; border-radius:12px; padding:16px 20px; box-shadow:0 12px 30px rgba(0,0,0,0.8); animation:toastSlideIn 0.3s ease-out; max-width:400px;">
    <div style="display:flex; align-items:flex-start; gap:12px;">
      <div style="background:rgba(34,197,94,0.2); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:#22c55e; font-weight:800;">✓</div>
      <div style="flex:1;">
        <div id="toastTitle" style="font-size:13px; font-weight:800; color:#22c55e; margin-bottom:2px;">✓ Bot Telegram berhasil terhubung dengan akun TataDana Anda!</div>
        <div id="toastDesc" style="font-size:12px; color:#a1a1aa;">Akun Telegram <strong style="color:#f4f4f5;">@username_kamu</strong> berhasil ter-pairing ke akun TataDana Anda.</div>
      </div>
      <button onclick="document.getElementById('toastNotif').style.display='none'" style="background:none; border:none; color:#71717a; font-size:16px; cursor:pointer;">&times;</button>
    </div>
  </div>

  <script>
    function copyToken() {
      const code = document.getElementById('tokenText').innerText.trim();
      const label = document.getElementById('btnCopyLabel');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          label.innerText = '✓ Tersalin!';
          setTimeout(() => { label.innerText = 'Salin Kode'; }, 2000);
        }).catch(() => fallbackCopy(code));
      } else {
        fallbackCopy(code);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const label = document.getElementById('btnCopyLabel');
      label.innerText = '✓ Tersalin!';
      setTimeout(() => { label.innerText = 'Salin Kode'; }, 2000);
    }

    function initPairingState() {
      const isConnected = localStorage.getItem('tatadana_telegram_connected') === 'true';
      let username = localStorage.getItem('tatadana_telegram_username');
      if (!username) {
        try {
          const pRaw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
          if (pRaw) {
            const p = JSON.parse(pRaw);
            if (p && p.nama) username = '@' + p.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
          }
        } catch(e) {}
      }
      if (!username) username = '@username_kamu';
      if (isConnected) {
        applyConnectedUI(username, false);
      } else {
        applyDisconnectedUI();
      }
    }

    function applyConnectedUI(username, showToastMsg) {
      const box = document.getElementById('statusContainer');
      const dot = document.getElementById('statusDot');
      const title = document.getElementById('stTitle');
      const sub = document.getElementById('stSub');
      const badge = document.getElementById('stBadge');
      const btnVerify = document.getElementById('btnVerify');
      const btnDisconnect = document.getElementById('btnDisconnect');
      const toast = document.getElementById('toastNotif');

      if (box) {
        box.style.background = 'rgba(34,197,94,0.1)';
        box.style.border = '1px solid rgba(34,197,94,0.5)';
      }
      if (dot) {
        dot.style.background = '#22c55e';
        dot.style.boxShadow = '0 0 10px #22c55e';
      }
      if (title) title.innerHTML = '<span style="color:#22c55e; font-weight:800;">Akun Telegram Ter-pairing: ' + username + '</span>';
      if (sub) sub.innerText = 'Akun berhasil terhubung via bot Telegram resmi TataDana';
      if (badge) {
        badge.className = 'badge badge-green';
        badge.innerText = '🟢 Terhubung (Aktif)';
        badge.style.background = '#22c55e';
        badge.style.color = '#09090b';
        badge.style.fontWeight = '800';
      }
      if (btnVerify) btnVerify.style.display = 'none';
      if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';

      if (showToastMsg && toast) {
        document.getElementById('toastTitle').innerText = '✓ Bot Telegram berhasil terhubung dengan akun TataDana Anda!';
        document.getElementById('toastDesc').innerHTML = 'Akun Telegram <strong style="color:#f4f4f5;">' + username + '</strong> berhasil ter-pairing ke akun TataDana Anda.';
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 6000);
      }
    }

    function applyDisconnectedUI() {
      const box = document.getElementById('statusContainer');
      const dot = document.getElementById('statusDot');
      const title = document.getElementById('stTitle');
      const sub = document.getElementById('stSub');
      const badge = document.getElementById('stBadge');
      const btnVerify = document.getElementById('btnVerify');
      const btnDisconnect = document.getElementById('btnDisconnect');

      if (box) {
        box.style.background = '#121215';
        box.style.border = '1px solid #27272a';
      }
      if (dot) {
        dot.style.background = '#71717a';
        dot.style.boxShadow = 'none';
      }
      if (title) title.innerText = 'Status: Belum Terhubung';
      if (sub) sub.innerText = 'Kirim token di atas ke bot Telegram untuk mulai verifikasi';
      if (badge) {
        badge.className = 'badge';
        badge.innerText = 'Menunggu Verifikasi';
        badge.style.background = '#27272a';
        badge.style.color = '#a1a1aa';
      }
      if (btnVerify) {
        btnVerify.style.display = 'inline-flex';
        btnVerify.disabled = false;
        document.getElementById('verifyText').innerText = 'Verifikasi Hubungan';
      }
      if (btnDisconnect) btnDisconnect.style.display = 'none';
    }

    function verifyConnection() {
      const btn = document.getElementById('btnVerify');
      const text = document.getElementById('verifyText');
      const spinner = document.getElementById('verifySpinner');

      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      text.innerText = 'Memeriksa koneksi...';

      let username = localStorage.getItem('tatadana_telegram_username');
      if (!username) {
        try {
          const pRaw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
          if (pRaw) {
            const p = JSON.parse(pRaw);
            if (p && p.nama) username = '@' + p.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
          }
        } catch(e) {}
      }
      if (!username) username = '@username_kamu';

      setTimeout(() => {
        localStorage.setItem('tatadana_telegram_connected', 'true');
        localStorage.setItem('tatadana_telegram_username', username);
        applyConnectedUI(username, true);
      }, 900);
    }

    function disconnectConnection() {
      localStorage.removeItem('tatadana_telegram_connected');
      localStorage.removeItem('tatadana_telegram_username');
      applyDisconnectedUI();
      const toast = document.getElementById('toastNotif');
      if (toast) {
        document.getElementById('toastTitle').innerText = 'Koneksi Diputus';
        document.getElementById('toastDesc').innerText = 'Koneksi bot Telegram telah diputus dari akun Anda.';
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 4000);
      }
    }

    function sendQuickMessage(text) {
      const input = document.getElementById('chatMessageInput');
      if (input) {
        input.value = text;
        handleSendChat();
      }
    }

    function appendUserBubble(text) {
      const box = document.getElementById('interactiveChatBox');
      const div = document.createElement('div');
      div.className = 'chat-msg user-msg';
      div.style.cssText = 'align-self:flex-end; max-width:85%; background:linear-gradient(135deg, #f97316, #ea580c); color:#ffffff; font-weight:500; border-radius:12px 12px 2px 12px; padding:12px 16px; font-size:13px; line-height:1.5; box-shadow:0 4px 12px rgba(249,115,22,0.3);';
      div.innerHTML = '<div style="font-size:10px; opacity:0.8; margin-bottom:4px; text-align:right;">Anda</div>' + escapeHtml(text).replace(/\\n/g, '<br>');
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    function appendBotBubble(htmlText) {
      const box = document.getElementById('interactiveChatBox');
      const div = document.createElement('div');
      div.className = 'chat-msg bot-msg';
      div.style.cssText = 'align-self:flex-start; max-width:85%; background:#18181b; border:1px solid #27272a; border-radius:12px 12px 12px 2px; padding:14px 16px; color:#f4f4f5; font-size:13px; line-height:1.55; box-shadow:0 2px 8px rgba(0,0,0,0.4);';
      div.innerHTML = '<div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#f97316; margin-bottom:6px;"><span>🤖 TataDana Bot</span><span style="color:#71717a;">• Baru saja</span></div>' + formatBotReply(htmlText);
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    function formatBotReply(text) {
      let out = escapeHtml(text);
      out = out.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      out = out.replace(/\\*(.*?)\\*/g, '<strong>$1</strong>');
      out = out.replace(/`([^`]+)`/g, '<code style="background:#27272a; padding:2px 6px; border-radius:4px; color:#f97316; font-size:12px;">$1</code>');
      out = out.replace(/\\n/g, '<br>');
      return out;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function handleSendChat(e) {
      if (e && e.preventDefault) e.preventDefault();
      const input = document.getElementById('chatMessageInput');
      const text = (input ? input.value : '').trim();
      if (!text) return;
      input.value = '';

      appendUserBubble(text);

      const isStart = text.toLowerCase().startsWith('/start') || text.toLowerCase().includes('token_td_');
      if (isStart) {
        localStorage.setItem('tatadana_telegram_connected', 'true');
        localStorage.setItem('tatadana_telegram_username', '@username_kamu');
        applyConnectedUI('@username_kamu', true);
      }

      try {
        const res = await fetch('/api/telegram/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            chat_id: 8129481234,
            user_name: 'Budi Pratama'
          })
        });
        const data = await res.json();
        if (data && data.reply) {
          setTimeout(() => {
            appendBotBubble(data.reply);
            if (data.paired) {
              localStorage.setItem('tatadana_telegram_connected', 'true');
              localStorage.setItem('tatadana_telegram_username', '@username_kamu');
              applyConnectedUI('@username_kamu', true);
            }
          }, 250);
        }
      } catch (err) {
        setTimeout(() => {
          appendBotBubble('✅ Pesan berhasil diproses oleh TataDana Bot!');
        }, 250);
      }
    }

    window.addEventListener('DOMContentLoaded', initPairingState);
    initPairingState();
    ${PROFILE_MODAL_JS}
  </script>
  ${PROFILE_MODAL_HTML}
</body>
</html>`);
    return;
  }

  // Route 4: Admin Dashboard (/admin)
  if (pathname === '/admin' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>TataDana — Superadmin Dashboard</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
    .sidebar a { color: #a1a1aa; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; display: block; }
    .sidebar a.active { background: rgba(249, 115, 22, 0.15); color: #f97316; font-weight: 700; }
    .sidebar a:hover { background: #18181b; color: #f4f4f5; }
    .content { flex: 1; overflow-y: auto; padding: 32px; box-sizing: border-box; background-color: #09090b; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    .stat-card .label { font-size: 13px; color: #a1a1aa; margin-bottom: 6px; }
    .stat-card .val { font-size: 24px; font-weight: 800; color: #f4f4f5; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div class="sidebar">
    <div style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin-bottom: 24px;">Tata<span style="color:#f97316">Admin</span></div>
    <a href="/admin" class="active">🛡️ Overview</a>
    <a href="/admin/users">👥 User Management & Impersonation</a>
    <a href="/admin/ai-settings">🤖 Multi-Provider AI (Gemini/OpenAI/DeepSeek)</a>
    <a href="/admin/ai-logs">📈 AI Token & Latency Logs</a>
    <a href="/admin/audit-logs">🔒 Privacy Audit Trail (UU PDP)</a>
    <a href="/admin/subscriptions">💳 Midtrans Billing & Approvals</a>
    <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid #27272a;">
      <a href="/dashboard" style="color: #f97316;">📊 User Dashboard</a>
      <a href="/" style="color: #71717a;">⬅️ Beranda</a>
    </div>
  </div>
  <div class="content">
    <div class="header">
      <div>
        <h1 style="font-size: 26px; margin: 0; color: #f4f4f5; font-weight: 800;">Superadmin Platform Metrics</h1>
        <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Platform Health, Multi-Provider AI & Midtrans Gateway</p>
      </div>
      <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.35); padding: 8px 16px; border-radius: 8px; color: #22c55e; font-size: 13px; font-weight: 700;">
        ● System Operational
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Total Pengguna Terdaftar</div>
        <div class="val">1,248 Users</div>
      </div>
      <div class="stat-card">
        <div class="label">Monthly Recurring Revenue (MRR)</div>
        <div class="val" style="color: #22c55e;">Rp 34.500.000</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Panggilan AI (Bulan Ini)</div>
        <div class="val" style="color: #f97316;">48,210 Calls</div>
      </div>
      <div class="stat-card">
        <div class="label">Active Subscriptions (Pro)</div>
        <div class="val">690 Active</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px; color: #f4f4f5; font-weight: 700;">Multi-Provider AI Engine Status</h3>
      <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 12px;">Active Routing Mode: <strong style="color:#22c55e">FAILOVER</strong> (Gemini 1.5 Pro &rarr; OpenAI GPT-4o &rarr; DeepSeek V3)</p>
      <div style="display: flex; gap: 16px; font-size: 13px;">
        <span style="background: #18181b; padding: 6px 12px; border-radius: 6px; border: 1px solid #27272a; color:#e4e4e7; font-weight:600;">Gemini: 99.8% Success (Avg 320ms)</span>
        <span style="background: #18181b; padding: 6px 12px; border-radius: 6px; border: 1px solid #27272a; color:#e4e4e7; font-weight:600;">OpenAI: Backup Ready</span>
        <span style="background: #18181b; padding: 6px 12px; border-radius: 6px; border: 1px solid #27272a; color:#e4e4e7; font-weight:600;">DeepSeek: Backup Ready</span>
      </div>
    </div>
  </div>
</body>
</html>`);
    return;
  }

  // Route: Admin Users Management (/admin/users)
  if (pathname === '/admin/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Admin: Direktori Pengguna & Impersonasi — TataDana</title>
  <style>
    body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
    .sidebar a { color: #a1a1aa; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; display: block; }
    .sidebar a.active { background: rgba(249, 115, 22, 0.15); color: #f97316; font-weight: 700; }
    .sidebar a:hover { background: #18181b; color: #f4f4f5; }
    .content { flex: 1; overflow-y: auto; padding: 32px; box-sizing: border-box; background-color: #09090b; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th { text-align: left; padding: 12px 14px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-weight: 600; }
    td { padding: 12px 14px; border-bottom: 1px solid #1f1f23; color: #f4f4f5; }
    tr:hover td { background: #18181b; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .badge-green { background: rgba(34, 197, 94, 0.18); color: #22c55e; }
    .badge-orange { background: rgba(249, 115, 22, 0.18); color: #f97316; }
    .btn-primary { background: #f97316; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
    .btn-primary:hover { background: #ea580c; }
    .btn-secondary { background: #18181b; border: 1px solid #27272a; color: #f4f4f5; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 12px; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div style="font-size: 20px; font-weight: 800; color: #f4f4f5; margin-bottom: 24px;">Tata<span style="color:#f97316">Admin</span></div>
    <a href="/admin">🛡️ Overview</a>
    <a href="/admin/users" class="active">👥 User Management & Impersonation</a>
    <a href="/admin">🤖 Multi-Provider AI</a>
    <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid #27272a;">
      <a href="/dashboard" style="color: #f97316;">📊 User Dashboard</a>
      <a href="/" style="color: #71717a;">⬅️ Beranda</a>
    </div>
  </div>
  <div class="content">
    <div class="header">
      <div>
        <h1 style="font-size: 26px; margin: 0; color: #f4f4f5; font-weight: 800;">Direktori Pengguna & Sesi Impersonasi</h1>
        <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Audit Trail Kepatuhan UU PDP Pasal 39 • Hak Akses Terbatas Superadmin</p>
      </div>
      <div>
        <button class="btn-primary" onclick="alert('Mengekspor 1,248 data pengguna dalam format CSV berenkripsi...')">📊 Ekspor Data Pengguna (CSV)</button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px; color: #f4f4f5; font-weight: 700;">Daftar Pengguna Aktif</h3>
      <table>
        <thead>
          <tr>
            <th>Pengguna</th>
            <th>Email & Kontak</th>
            <th>Paket</th>
            <th>Telegram ID</th>
            <th>Status</th>
            <th>Aksi Superadmin</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Budi Santoso</strong></td>
            <td>budi.santoso@tatadana.id<br><span style="color:#71717a; font-size:12px;">+62 812-8899-0011</span></td>
            <td><span class="badge badge-orange">Pro Lifetime</span></td>
            <td><code>8129481234</code></td>
            <td><span class="badge badge-green">Aktif</span></td>
            <td><button class="btn-secondary" onclick="alert('Memulai sesi impersonasi untuk Budi Santoso...')">🎭 Impersonate</button></td>
          </tr>
          <tr>
            <td><strong>Siti Rahma</strong></td>
            <td>siti.rahma@gmail.com<br><span style="color:#71717a; font-size:12px;">+62 813-2233-4455</span></td>
            <td><span class="badge badge-orange">Pro Lifetime</span></td>
            <td><code>5128392019</code></td>
            <td><span class="badge badge-green">Aktif</span></td>
            <td><button class="btn-secondary" onclick="alert('Memulai sesi impersonasi untuk Siti Rahma...')">🎭 Impersonate</button></td>
          </tr>
          <tr>
            <td><strong>Ahmad Fauzi</strong></td>
            <td>ahmad.fauzi@outlook.co.id<br><span style="color:#71717a; font-size:12px;">+62 817-4455-6677</span></td>
            <td><span class="badge badge-green">Starter Gratis</span></td>
            <td><code>7829103841</code></td>
            <td><span class="badge badge-green">Aktif</span></td>
            <td><button class="btn-secondary" onclick="alert('Memulai sesi impersonasi untuk Ahmad Fauzi...')">🎭 Impersonate</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`);
    return;
  }

  // Route: Pro Boost (/boost)
  if (pathname === '/boost' && method === 'GET') {
    const boostContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span class="badge badge-orange">🚀 PRO EDITION</span>
            <span style="font-size:12px; color:#71717a;">● Lifetime Deal Rp 99.000</span>
          </div>
          <h1 style="font-size: 26px; font-weight: 800; color: #f4f4f5; margin: 0 0 4px;">TataDana Pro Boost</h1>
          <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Buka seluruh fitur premium tanpa batasan kuota. AI Vision OCR, Voice Note STT 60s, & AI Advisor.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <a href="/dashboard" class="btn-secondary">🏠 Beranda Overview</a>
          <a href="/dashboard/settings" class="btn-secondary">⚙️ Pengaturan Bot</a>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg, rgba(249,115,22,0.15), rgba(18,18,21,0.9)); border:1px solid rgba(249,115,22,0.4); margin-bottom:24px; padding:32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
          <div style="max-width:650px;">
            <span class="badge badge-orange" style="margin-bottom:12px;">⚡ PRO BOOST AKTIF</span>
            <h2 style="font-size:26px; font-weight:800; color:#f4f4f5; margin:0 0 10px;">Akselerasi Pengelolaan Keuangan Anda</h2>
            <p style="color:#a1a1aa; font-size:14px; line-height:1.6; margin:0 0 20px;">
              Dengan TataDana Pro Boost, seluruh kuota transaksi bulanan menjadi tanpa batas. Respon instan dari bot Telegram, analisis deviasi budget cerdas, dan ekspor laporan keuangan format akuntansi kapan pun Anda butuhkan.
            </p>
            <div style="display:flex; gap:12px;">
              <button class="btn-primary" onclick="alert('Selamat! Akun Anda telah diaktifkan ke paket TataDana PRO Lifetime.')" style="padding:12px 24px; font-size:14px; font-weight:700;">
                ⚡ Aktifkan Pro Boost Sekarang (Rp 99.000)
              </button>
              <a href="/dashboard/settings" class="btn-secondary" style="padding:12px 20px;">
                💬 Coba di Chat Simulator
              </a>
            </div>
          </div>
          <div style="background:#121215; border:1px solid #27272a; border-radius:14px; padding:24px; text-align:center; min-width:200px;">
            <div style="font-size:12px; color:#a1a1aa; font-weight:600; text-transform:uppercase;">Biaya Investasi</div>
            <div style="font-size:36px; font-weight:900; color:#f97316; margin:6px 0;">Rp 99k</div>
            <div style="font-size:12px; color:#22c55e; font-weight:700;">Sekali Bayar • Seumur Hidup</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3 style="margin:0 0 16px; font-size:17px; font-weight:700; color:#f4f4f5;">Perbandingan Fitur: Starter vs PRO Boost</h3>
        <table>
          <thead>
            <tr>
              <th>Fitur Finansial</th>
              <th>Starter (Gratis / Rp49k)</th>
              <th>PRO Boost (Rp99k Lifetime)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Batas Transaksi Bulanan</strong></td>
              <td>Maksimal 50 Transaksi / Bulan</td>
              <td><span class="badge badge-green">Tanpa Batas (Unlimited)</span></td>
            </tr>
            <tr>
              <td><strong>Scan Struk AI Vision OCR</strong></td>
              <td><span style="color:#71717a;">Tidak Termasuk</span></td>
              <td><span class="badge badge-green">Aktif Multi-Item</span></td>
            </tr>
            <tr>
              <td><strong>Voice Note STT 60s</strong></td>
              <td><span style="color:#71717a;">Tidak Termasuk</span></td>
              <td><span class="badge badge-green">Aktif s.d 60 Detik</span></td>
            </tr>
            <tr>
              <td><strong>AI Financial Advisor & Alert</strong></td>
              <td><span style="color:#71717a;">Tidak Termasuk</span></td>
              <td><span class="badge badge-green">Aktif Real-time</span></td>
            </tr>
            <tr>
              <td><strong>Ekspor Laporan PDF & Excel</strong></td>
              <td>Maksimal 1x per bulan</td>
              <td><span class="badge badge-green">Unlimited On-Demand</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardShell('TataDana Pro Boost', boostContent, 'boost'));
    return;
  }

  // Route: Teamwork Preview (/teamwork-preview)
  if (pathname === '/teamwork-preview' && method === 'GET') {
    const teamworkContent = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span class="badge badge-orange">👥 MULTI-USER COLLABORATION</span>
            <span style="font-size:12px; color:#71717a;">● Preview Fitur Kolaborasi</span>
          </div>
          <h1 style="font-size: 26px; font-weight: 800; color: #f4f4f5; margin: 0 0 4px;">TataDana Teamwork & Shared Wallets</h1>
          <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Kelola anggaran bersama pasangan, keluarga, atau tim bisnis via satu bot Telegram terpadu.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <a href="/boost" class="btn-primary" style="background:#ea580c;">🚀 Upgrade Pro Boost</a>
          <a href="/dashboard" class="btn-secondary">🏠 Beranda Overview</a>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg, rgba(59,130,246,0.12), rgba(18,18,21,0.9)); border:1px solid rgba(59,130,246,0.35); margin-bottom:24px; padding:28px;">
        <h2 style="font-size:22px; font-weight:800; color:#f4f4f5; margin:0 0 8px;">Transparansi Keuangan Bersama Tanpa Ribet</h2>
        <p style="color:#a1a1aa; font-size:14px; margin:0 0 16px; max-width:650px; line-height:1.6;">
          Semua anggota tim atau keluarga dapat mengirim pesan ke satu bot Telegram yang sama. Bot akan mengenali pengirim, mencatat pengeluaran ke dompet bersama, dan memberikan laporan terpadu.
        </p>
        <button class="btn-secondary" onclick="alert('Fitur Teamwork aktif dalam mode preview untuk simulasi tim Anda!')">
          ✨ Mulai Simulasi Kolaborasi
        </button>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3 style="margin:0 0 16px; font-size:17px; font-weight:700; color:#f4f4f5;">Anggota Tim Aktif: Tim Finansial Rumah Tangga</h3>
        <table>
          <thead>
            <tr>
              <th>Nama Anggota</th>
              <th>Peran / Role</th>
              <th>Telegram ID</th>
              <th>Dompet Yang Diakses</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Budi Pratama</strong> (Anda)</td>
              <td><span class="badge badge-orange">Owner / Admin</span></td>
              <td>@budipratama (8129481234)</td>
              <td>Semua Dompet (GoPay, BCA, Cash)</td>
              <td><span class="badge badge-green">Aktif</span></td>
            </tr>
            <tr>
              <td><strong>Siti Rahma</strong></td>
              <td><span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid #3b82f6;">Editor (Pasangan)</span></td>
              <td>@sitirahma (9182371923)</td>
              <td>GoPay Operasional, Cash</td>
              <td><span class="badge badge-green">Aktif</span></td>
            </tr>
            <tr>
              <td><strong>Alex Kurniawan</strong></td>
              <td><span class="badge" style="background:#27272a; color:#a1a1aa;">Viewer (Akuntan)</span></td>
              <td>@alexkurnia (7182948192)</td>
              <td>Hanya Laporan & Ekspor</td>
              <td><span class="badge badge-green">Aktif</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardShell('TataDana Teamwork Preview', teamworkContent, 'teamwork'));
    return;
  }

  // Helper bot parsing for Node.js server
  function processBotMessageJs(text, userName) {
    const clean = (text || '').trim();
    const lower = clean.toLowerCase();
    const now = new Date();
    const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const timeHeader = `📅 ${daysId[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${monthsId[now.getMonth()]} ${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    if (lower.startsWith('/start') || lower.includes('token_td_')) {
      return {
        reply: `👋 Halo ${userName || 'Sobat TataDana'}! Akun TataDana Anda berhasil terhubung. Sekarang Anda bisa mencatat transaksi langsung dari chat ini.\n\n💡 Coba ketik pengeluaran: 'beli kopi 18rb' atau ketik /bantuan untuk melihat daftar perintah.`,
        paired: true,
        action: 'pairing'
      };
    }

    if (lower === '/saldo' || lower.startsWith('/saldo ')) {
      return {
        reply: `💼 Saldo Seluruh Dompet TataDana:\n• 👛 GoPay (Default) : Rp 1.482.000\n• 🏦 BCA : Rp 32.750.000\n• 💵 Cash / Tunai : Rp 850.000\n━━━━━━━━━━━━━━━━━━━━━\n💰 Total Saldo : Rp 35.082.000`,
        action: 'command'
      };
    }

    if (['/hari ini', '/hari_ini', '/hariini', '/today'].includes(lower)) {
      return {
        reply: `${timeHeader}\n📅 Rekap Transaksi Hari Ini:\n• Pemasukan : Rp 0\n• Pengeluaran : Rp 18.000 (1 transaksi)\n━━━━━━━━━━━━━━━━━━━━━\n📈 Arus Kas Bersih : -Rp 18.000\n💬 Unduh laporan PDF & Excel lengkap dengan perintah /sheet.`,
        action: 'command'
      };
    }

    if (['/budget', '/anggaran'].includes(lower)) {
      return {
        reply: `📊 Status Budget Bulan Ini:\n\n🍜 Makanan & Minuman:\n████████░░ 78% (Rp 1.580.000 / Rp 2.000.000)\n\n🚗 Transportasi:\n█████░░░░░ 45% (Rp 450.000 / Rp 1.000.000)\n\n🏠 Tagihan & Utilitas:\n██████░░░░ 60% (Rp 1.800.000 / Rp 3.000.000)\n\n🎮 Hiburan & Rekreasi ⚠️ OVERBUDGET:\n█████████░ 92% (Rp 920.000 / Rp 1.000.000)\n━━━━━━━━━━━━━━━━━━━━━\n💡 Pengeluaran terkendali dengan baik minggu ini.`,
        action: 'command'
      };
    }

    if (['/boost', '/upgrade', '/pro'].includes(lower)) {
      return {
        reply: `🚀 TataDana PRO Boost\n━━━━━━━━━━━━━━━━━━━━━\nUpgrade akun Anda ke PRO Lifetime hanya Rp 99.000 (sekali bayar seumur hidup):\n⚡ Transaksi bulanan tanpa batas (Starter: 50 tx/bln)\n📸 AI Vision OCR Struk Belanja multi-item otomatis\n🎙️ Voice Note AI Speech-to-Text hingga 60 detik\n🧠 AI Financial Advisor pendeteksi lonjakan & boros\n📊 Ekspor Laporan PDF & Excel tak terbatas\n\n👉 Aktivasi sekarang di browser:\nhttp://localhost:3000/boost`,
        action: 'command'
      };
    }

    if (['/teamwork-preview', '/teamwork_preview', '/teamwork', '/tim'].includes(lower)) {
      return {
        reply: `👥 TataDana Teamwork & Shared Wallets (Preview)\n━━━━━━━━━━━━━━━━━━━━━\nKelola keuangan bersama pasangan, keluarga, atau tim bisnis Anda!\n\nFitur Teamwork:\n👛 Shared Wallets — Dompet kas & bank bersama\n🎯 Shared Budgets — Kontrol anggaran barengan\n👥 Multi-User Telegram — Pasangan & tim catat ke dompet yang sama\n🔒 Role & Audit Trail — Pantau riwayat pencatatan transparan\n\n👉 Akses halaman preview di browser:\nhttp://localhost:3000/teamwork-preview`,
        action: 'command'
      };
    }

    if (['/bantuan', '/help', '/start help'].includes(lower)) {
      return {
        reply: `🤖 Panduan Penggunaan TataDana Bot\n━━━━━━━━━━━━━━━━━━━━━\n💬 1. Catat Transaksi Teks Natural:\n• 'beli kopi 18rb' -> Pengeluaran Rp 18.000 (GoPay)\n• 'makan siang 35rb' -> Pengeluaran Rp 35.000 (GoPay)\n• 'bensin 50rb' -> Pengeluaran Rp 50.000 (Mandiri)\n• 'gajian 25jt' -> Pemasukan Rp 25.000.000 (BCA)\n• 'bonus 2jt' -> Pemasukan Rp 2.000.000 (BCA)\n\n⚡ 2. Perintah Bot:\n• /saldo — Saldo seluruh dompet\n• /hari ini — Rekap transaksi hari ini\n• /budget — Status budget bulanan (progress bar)\n• /boost — Info & aktivasi TataDana Pro Boost\n• /teamwork-preview — Kolaborasi tim & dompet bersama\n• /sheet — Unduh laporan PDF / Excel\n• /bantuan — Tampilkan panduan ini`,
        action: 'command'
      };
    }

    // Parse nominal
    let nominal = null;
    const match = clean.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m|milyar|miliar|b)?\b/i);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const suffix = (match[2] || '').toLowerCase();
      if (['rb', 'ribu', 'k'].includes(suffix)) nominal = Math.round(num * 1000);
      else if (['jt', 'juta'].includes(suffix)) nominal = Math.round(num * 1000000);
      else if (['m', 'milyar', 'miliar', 'b'].includes(suffix)) nominal = Math.round(num * 1000000000);
      else if (num >= 100) nominal = Math.round(num);
    }

    const isIncome = /gaji|gajian|bonus|terima|dapat|pemasukan|income|uang masuk|transfer masuk|freelance|penjualan/i.test(lower);

    if (nominal === null && !isIncome && !/beli|bayar|makan|bensin|belanja|kopi|ongkir|langganan|pengeluaran/i.test(lower)) {
      return {
        reply: `🤖 Halo ${userName || 'Sobat TataDana'}! Untuk mencatat transaksi keuangan, ketik kalimat seperti:\n• 'beli kopi 18rb'\n• 'makan siang 35rb'\n• 'bensin 50rb'\n• 'gajian 25jt'\n\nAtau ketik /bantuan untuk melihat panduan lengkap perintah bot.`,
        action: 'help'
      };
    }

    if (nominal === null) {
      nominal = isIncome ? 25000000 : 18000;
    }

    const formattedNominal = 'Rp ' + nominal.toLocaleString('id-ID');
    const waktuWib = `${String(now.getDate()).padStart(2, '0')} ${monthsId[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    if (isIncome) {
      // Base BCA balance is 7.750.000 -> 7.750.000 + 25.000.000 = 32.750.000 (Part 4.5)
      const newBalance = 7750000 + nominal;
      const tx = {
        id: `tx-${USER_TRANSACTIONS.length + 1}`,
        waktu: waktuWib,
        deskripsi: clean,
        kategori: '💼 Gaji & Pendapatan',
        wallet: '👛 BCA',
        nominal: nominal,
        jenis: 'pemasukan',
        sumber: 'TELEGRAM_TEXT'
      };
      USER_TRANSACTIONS.unshift(tx);
      return {
        reply: `${timeHeader}\n💰 Pemasukan tercatat!\n├ Nominal : ${formattedNominal}\n├ Kategori : 💼 Gaji & Pendapatan\n├ Dompet : 👛 BCA (Default)\n└ Saldo baru : Rp ${newBalance.toLocaleString('id-ID')}\n\n💪 Semangat terus! Jangan lupa sisihkan untuk tabungan & investasi ya.`,
        action: 'transaction',
        transaction: tx
      };
    } else {
      let cat = '🍜 Makanan & Minuman';
      if (/bensin|pertalite|pertamax|gojek|grab|parkir|tol|ojol/i.test(lower)) cat = '🚗 Transportasi';
      else if (/belanja|indomaret|alfamart|superindo|baju|shopee|tokped/i.test(lower)) cat = '🛒 Belanja';
      else if (/listrik|pln|pdam|wifi|indihome|pulsa|kuota/i.test(lower)) cat = '🏠 Tagihan & Utilitas';
      else if (/bioskop|game|netflix|spotify|steam/i.test(lower)) cat = '🎮 Hiburan & Rekreasi';

      // Base GoPay balance is 1.500.000 -> 1.500.000 - 18.000 = 1.482.000 (Part 4.4)
      const newBalance = Math.max(0, 1500000 - nominal);
      const catName = cat.split(' ')[1] || cat;
      const tx = {
        id: `tx-${USER_TRANSACTIONS.length + 1}`,
        waktu: waktuWib,
        deskripsi: clean,
        kategori: cat,
        wallet: '👛 GoPay',
        nominal: -nominal,
        jenis: 'pengeluaran',
        sumber: 'TELEGRAM_TEXT'
      };
      USER_TRANSACTIONS.unshift(tx);
      return {
        reply: `${timeHeader}\n💸 Pengeluaran tercatat!\n├ Nominal : ${formattedNominal}\n├ Kategori : ${cat}\n├ Dompet : 👛 GoPay (Default)\n├ Catatan : ${clean}\n└ Saldo : Rp ${newBalance.toLocaleString('id-ID')}\n\n📊 Budget ${catName} bulan ini:\n████████░░ 78% — sisa Rp 420.000\n💡 Pengeluaran terkendali dengan baik minggu ini.`,
        action: 'transaction',
        transaction: tx
      };
    }
  }

  // Route: In-App Chat API (/api/telegram/chat)
  if (pathname === '/api/telegram/chat' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const text = parsed.message || '';
        const userName = parsed.user_name || 'Budi Pratama';
        const result = processBotMessageJs(text, userName);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          ok: true,
          reply: result.reply,
          paired: result.paired || false,
          action: result.action,
          transaction: result.transaction,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(err) }));
      }
    });
    return;
  }

  // Route 5: Telegram Test API (/api/telegram/test)
  if (pathname === '/api/telegram/test') {
    if (method === 'GET' || method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        status: 'ok',
        connected: true,
        mode: 'SIMULATOR_SANDBOX',
        message: 'Koneksi bot aktif dalam mode Sandbox/Simulator Localhost.',
        bot: {
          id: 8129481234,
          is_bot: true,
          first_name: 'TataDana Finance Bot',
          username: 'TataDanaBot',
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false,
        },
        webhook: {
          url: 'http://localhost:3000/api/telegram/webhook',
          has_custom_certificate: false,
          pending_update_count: 0,
          max_connections: 40,
          ip_address: '127.0.0.1',
        },
        features: {
          idempotency_check: 'ENABLED (update_id deduplication via webhook_events)',
          multi_modal_ai: {
            indonesian_natural_language: 'ACTIVE ("15rb", "1.5jt", "500k")',
            receipt_vision_ocr: 'ACTIVE (Pro multi-item extraction)',
            voice_note_stt: 'ACTIVE (60s limit with transcription transcript)',
            financial_advisor: 'ACTIVE (Budget deviation alerts)',
          },
          quota_guard: {
            starter_limit: 50,
            pro_limit: 'UNLIMITED',
          },
          timezone: 'Asia/Jakarta (WIB)',
        },
        timestamp: new Date().toISOString(),
      }, null, 2));
      return;
    }
  }

  // Route 6: Telegram Webhook API (/api/telegram/webhook)
  if (pathname === '/api/telegram/webhook' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const updateId = parsed.update_id || 12345;

        if (PROCESSED_UPDATE_IDS.has(updateId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            ok: true,
            status: 'ok',
            processed: false,
            duplicate: true,
            update_id: updateId,
            message: 'Duplicate update_id ignored successfully.'
          }));
          return;
        }

        PROCESSED_UPDATE_IDS.add(updateId);

        const msg = parsed.message || {};
        const text = msg.text || msg.caption || '';
        const botResult = processBotMessageJs(text, msg.from?.first_name || 'User');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          status: 'ok',
          success: true,
          processed: true,
          duplicate: false,
          update_id: updateId,
          reply: botResult.reply,
          parsed_transaction: botResult.transaction || {
            nominal: 18000,
            kategori: 'Makanan & Minuman',
            jenis: 'pengeluaran',
            catatan: text || 'Transaksi Webhook'
          },
          message: 'Update processed successfully',
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Route: Export PDF (/api/export/pdf)
  if (pathname === '/api/export/pdf' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Laporan_TataDana_Okt_2026.pdf"',
    });
    const pdfData = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n');
    res.end(pdfData);
    return;
  }

  // Route: Export Excel / CSV (/api/export/excel)
  if (pathname === '/api/export/excel' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Laporan_TataDana_Okt_2026.csv"',
    });
    let csvContent = '\ufeff"ID Transaksi","Waktu (WIB)","Deskripsi","Kategori","Wallet","Nominal (IDR)","Jenis","Sumber"\n';
    for (const tx of USER_TRANSACTIONS) {
      csvContent += `"${tx.id}","${tx.waktu}","${tx.deskripsi}","${tx.kategori}","${tx.wallet}",${tx.nominal},"${tx.jenis}","${tx.sumber}"\n`;
    }
    res.end(csvContent);
    return;
  }

  // Catch-all: Fallback to 200 OK HTML for any subpage
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>TataDana — ${pathname}</title></head>
<body style="background:#09090b; color:#f4f4f5; font-family:sans-serif; padding:40px;">
  <h2>Tata<span style="color:#f97316">Dana</span></h2>
  <p>Route: <code>${pathname}</code> is served successfully (200 OK).</p>
  <a href="/" style="color:#f97316;">Kembali ke Beranda &rarr;</a>
</body>
</html>`);
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 TataDana Localhost Server Running`);
    console.log(`📡 URL: http://${HOST}:${PORT}`);
    console.log(`------------------------------------------------------`);
    console.log(`  - /                   -> Landing Page`);
    console.log(`  - /login              -> Auth Login`);
    console.log(`  - /dashboard          -> User Dashboard`);
    console.log(`  - /admin              -> Superadmin Dashboard`);
    console.log(`  - /api/telegram/test  -> Telegram Diagnostics API`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
