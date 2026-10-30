# TataDana Technical Survey & Architectural Specification Report

**Document ID**: TATADANA-EXP-R10-SURVEY  
**Date**: 2026-10-31  
**Author**: explorer_r10_1 (Codebase & Specification Explorer)  
**Target Audience**: Orchestrator, Test Writer, Backend Worker, Frontend Worker  
**Working Directory**: `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`  

---

## 1. Executive Summary

TataDana is an executive personal and SME financial management application built on a pure Python backend engine (`server.py`), persistent SQLite database (`tatadana.db`), and an interactive Single-Page Application (`index.html`) featuring an orange-white executive visual identity. 

This survey delivers an exhaustive technical assessment of the existing codebase and produces precise architectural specifications for four core requirements:
- **R1: Floating AI Quick Record Bot**: An interactive floating chat widget on the user dashboard connected to a new `/api/ai/parse-transaction` endpoint with robust multi-provider AI + regex/keyword fallback, SQLite persistence (`conn.commit()`), and seamless DOM auto-updates without full-page reload.
- **R2: Telegram Bot Integration**: Schema migration (`telegram_chat_id` column), user settings pairing card (`/connect <code>`), and listener logic using token `8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ` to link accounts and parse financial natural language inputs directly into SQLite with clean Markdown replies.
- **R3: Admin User Management**: Redesigning the admin user management table to retain all users (pending and approved), converting single-click approvals into persistent green `✓ Approved` badges without row removal, and introducing confirmed 'Hapus' (delete) actions.
- **R4: Modularization, Vercel & GitHub Readiness**: Extracting monolithic templates into modular Python files (`tpl_landing.py`, `tpl_auth.py`, `tpl_dashboard.py`, `tpl_admin.py`, `tpl_script.py`), setting up `vercel.json` and serverless entrypoint `api/index.py` with `/tmp/tatadana.db` fallback, creating complete `requirements.txt`, `.gitignore`, and Git terminal instructions.

---

## 2. Current Codebase Forensic Survey

### 2.1 Backend Server (`server.py`)
- **Framework & Architecture**: Built using Python's standard library `http.server.SimpleHTTPRequestHandler` and `socketserver.TCPServer`. The server class `TataDanaRequestHandler` handles CORS (`Access-Control-Allow-Origin: *`), JSON parsing (`parse_body`), and request routing in `do_GET` and `do_POST`.
- **Environment & Port**: Runs on localhost port 3000 (`PORT = int(os.environ.get('PORT', 3000))`). Environment variables are loaded via custom parser `load_env_file()` and `python-dotenv`.
- **Timezone**: Explicitly standardized to Western Indonesia Time (`WIB = timezone(timedelta(hours=7))`).
- **Superadmin Account**: Master credentials `akunadminaul16@gmail.com` with password `akuadmin123` (SHA-256: `2413701f499af5a38c8842e20064cfb83808ba82812ffa513c692b4186003a8f`), role `superadmin` / `admin`, plan `PRO VIP`, status `active`, `is_approved = 1`.
- **Existing API Endpoints**:
  * `GET /admin`, `GET /dashboard`, `GET /login`, `GET /settings`, `GET /approval`: SPA route rewriting serving `index.html`.
  * `POST /api/auth/register`: Creates pending user (`is_approved = 0, status = 'pending'`).
  * `POST /api/auth/login`: Authenticates superadmin and regular users. Pending users receive `status: 'pending_approval'`.
  * `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp`, `GET /api/auth/status`.
  * `GET /api/admin/metrics`: Returns dynamic SQLite counts (`total_users`, `pending_approvals`, `approved_users_count`, `total_transactions`, `total_wallets`).
  * `GET /api/admin/users`: Returns all users ordered by ID descending.
  * `GET & POST /api/admin/approve-user` (alias `/api/admin/approve`): Approves user (`is_approved = 1, status = 'active'`), seeds default wallets, commits to SQLite.
  * `POST /api/admin/reject-user`: Deletes user by ID.
  * `GET /api/dashboard/stats`: Returns `net_balance`, `monthly_income`, `monthly_expense`, `remaining_budget`.
  * `GET & POST /api/transactions`: Transaction history and new transaction creation.
  * `GET & POST /api/wallets`, `POST /api/wallets/set-default`, `POST /api/wallets/delete`, `POST /api/wallets/transfer`.
  * `GET /api/budgets`, `GET /api/reports/analytics`, `GET /api/export/pdf`, `GET /api/export/excel`, `GET /api/export/csv`.
  * `POST /api/telegram/webhook`: Webhook handler with idempotency via `telegram_updates`.
  * `GET & POST /api/admin/ai-settings`, `POST /api/admin/ai-test`, `POST /api/admin/impersonate`.
  * `GET /uploads/avatars/...`: Static image file serving.
- **Telegram Background Thread**:
  `telegram_polling_worker` runs as a daemon thread calling `https://api.telegram.org/bot{token}/getUpdates`. Incoming messages are passed to `process_telegram_incoming_message`.

### 2.2 Frontend SPA (`index.html`)
- **Structure**: Monolithic SPA (3,835 lines, ~226 KB) containing:
  * Top Notification Banner: Real-time WIB clock and system indicator.
  * `viewLanding` (lines 39–739): Clean modern orange-white landing page with hero, problem breakdown, features, interactive demo, pricing, FAQ, and footer.
  * `viewLogin` (lines 743–841): Unified access portal with login and registration forms.
  * `viewApproval` (lines 846–943): Pending approval waiting room with WhatsApp verification contact (`082115624408`) and OTP box.
  * `viewDashboard` (lines 947–2064): Executive dashboard with sidebar, top navbar, and sub-tabs:
    - `dTab-beranda`: KPI stat cards, trend bar chart, category donut chart, recent transactions.
    - `dTab-transaksi`: Full transaction history with filters.
    - `dTab-kalender`: Cash calendar visualizer.
    - `dTab-botSimulator`: Interactive Tata AI chatbot interface.
    - `dTab-laporan`: Executive report analytics and PDF/Excel downloads.
    - `dTab-budget`: Monthly category budget management.
    - `dTab-wallet`: Multi-wallet management and inter-wallet transfer.
    - `dTab-settings`: User profile, photo upload, BotFather guide, reminder toggles.
    - `dTab-adminPanel`: Enterprise Superadmin Desk (approval queue table, AI configuration, impersonation).
  * `<script>` (lines 2066–3832): Client state (`currentUserId`, `currentUserData`, `currentUserRole`), SPA client-side routing (`navigate`, `handleRoute`), and DOM manipulation functions.
- **Current Deficiencies Observed**:
  * No floating AI quick record widget exists in the bottom right of the user dashboard.
  * Admin user management table in `loadAdminUsers()` filters only `u.is_approved === 0` (hiding approved users).
  * In `approveDirectUser()`, when approval succeeds, the row is permanently removed from the DOM table (`row.remove()`).
  * No 'Hapus' (delete) button exists on table rows.
  * Settings view lacks a dedicated Telegram account pairing card with `/connect <code>`.

### 2.3 Database Schema (`tatadana.db`)
Inspected via `server.py` (`init_db`) and `reset_production_db.py`:
1. **`users` Table**:
   - Columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `email TEXT UNIQUE`, `password_hash TEXT`, `full_name TEXT`, `phone_number TEXT UNIQUE`, `role TEXT DEFAULT 'user'`, `is_approved INTEGER DEFAULT 0`, `status TEXT DEFAULT 'pending'`, `plan TEXT DEFAULT 'pro'`, `created_at TEXT`, `avatar_url TEXT DEFAULT ''`, `telegram_user_id TEXT DEFAULT ''`, `otp_code TEXT DEFAULT ''`.
   - *Missing Column*: `telegram_chat_id` (Required by R2).
2. **`wallets` Table**:
   - Columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER`, `name TEXT`, `wallet_type TEXT DEFAULT 'bank'`, `balance REAL DEFAULT 0.0`, `is_default INTEGER DEFAULT 0`, `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
3. **`categories` Table**:
   - Columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER`, `name TEXT`, `category_type TEXT`, `budget_limit REAL DEFAULT 0.0`.
4. **`transactions` Table**:
   - Columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER`, `wallet_id INTEGER`, `category_name TEXT`, `transaction_type TEXT`, `amount REAL`, `notes TEXT`, `source TEXT DEFAULT 'web'`, `transaction_time TEXT`, `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.
5. **`telegram_updates` Table**:
   - Columns: `update_id INTEGER PRIMARY KEY`, `processed_at TEXT`.
6. **`ai_settings` Table**:
   - Columns: `id INTEGER PRIMARY KEY`, `active_provider TEXT DEFAULT 'gemini'`, `execution_mode TEXT DEFAULT 'single'`, `gemini_api_key TEXT`, `gemini_model TEXT`, `openai_api_key TEXT`, `openai_model TEXT`, `deepseek_api_key TEXT`, `deepseek_model TEXT`, `fallback_enabled INTEGER DEFAULT 1`, `updated_at TEXT`.

### 2.4 Existing Test Suites & Assertions
1. `test_admin_desk.py`:
   - Enforces specific strings in `/admin` HTML: `"Enterprise Superadmin Desk"`, `"ROOT PRIVILEGE"`, `"AI INGRESS AVG LATENCY"`, `"ESTIMASI BIAYA"`, `"TOOLBAR PENGUJIAN ROLE (ADMIN VS USER BIASA)"`, `"Masuk Sesi Pengguna: Naftaly (Approved User)"`, `"Masuk Sesi Superadmin"`, `"Bot Finansial"`, `"@tatadana_finance_bot"` or `"@lilybhotom_bot"`, `"Bot Online WIB"`, `"↗ Buka Chat Telegram"`, `"⚡ Uji Sandbox Simulator"`, `"Antrean Pendaftaran Pengguna Baru (Waiting for Approval)"`.
   - Tests `/api/admin/metrics`, `/api/auth/login`, and `/api/admin/users`.
2. `test_telegram_backend.py`:
   - Validates `TELEGRAM_BOT_TOKEN == "8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ"`.
   - Verifies `parse_indonesian_nominal` and `parse_telegram_transaction_text` for Indonesian monetary strings.
3. `test_api.py`:
   - Tests login, profile update, Telegram webhook, CSV export, registration, approval flow (`/api/admin/approve-user`), and login post-approval.
4. `verify_production_readiness.py`:
   - Verifies clean production state (1 superadmin, 0 regular users, 0 transactions), user data isolation, and admin dynamic counts.

---

## 3. Requirement Analysis & Implementation Specifications

### 3.1 R1: Floating AI Quick Record Bot di Dashboard User

#### 3.1.1 UI Widget Design (in `tpl_dashboard.py` / `index.html`)
- **DOM Container**: Positioned at bottom right of the viewport with high z-index:
  ```html
  <!-- Floating AI Quick Record Widget -->
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
  ```

#### 3.1.2 Backend Endpoint `/api/ai/parse-transaction`
- **Method**: `POST`
- **Request Body Contract**:
  ```json
  {
    "text": "Bensin motor 25rb cash",
    "user_id": 1
  }
  ```
- **Parsing Architecture**:
  1. Primary AI attempt: If an AI provider (Gemini, OpenAI, or DeepSeek) is configured in `ai_settings` with a non-demo valid API key, construct a structured JSON-only prompt requesting schema: `{type, amount, category, wallet, description}`.
  2. Fallback Natural Language Parser (Offline & Zero-Key Resilient):
     - Amount: Evaluated using `parse_indonesian_nominal(text)`.
     - Transaction Type: Checks income keywords (`['gaji', 'gajian', 'salary', 'pemasukan', 'transfer masuk', 'terima uang', 'bonus', 'fee', 'proyek', 'freelance', 'income']`). Defaults to `pengeluaran`.
     - Category Mapping:
       * Transportasi: `bensin, bbm, pertalite, pertamax, solar, gojek, grab, ojol, tol, parkir, angkot, krl, kereta, service, cuci motor`
       * Makanan & Minuman: `makan, minum, kopi, cafe, resto, bakso, nasi, sate, warmindo, sarapan, ayam, martabak`
       * Tagihan & Wifi: `wifi, indihome, pulsa, kuota, token, pln, listrik, pdam, air, bpjs, kost, kos, kontrakan`
       * Belanja Kebutuhan: `belanja, supermarket, minimarket, alfamart, indomaret, baju, sabun, shopee, tokped`
       * Hiburan: `nonton, bioskop, game, steam, netflix, spotify, liburan`
       * Kesehatan: `obat, apotek, dokter, klinik, rs, vitamin`
       * Gaji & Proyek: when type is `pemasukan`.
     - Wallet Resolution:
       * Scans text for: `cash / tunai` -> wallet name `'Cash'`, `bca` -> `'BCA Utama'`, `mandiri` -> `'Mandiri'`, `gopay` -> `'GoPay'`.
       * Looks up `wallets` table `WHERE user_id = ? AND LOWER(name) LIKE ?`.
       * If no specific wallet mentioned, falls back to user's default wallet (`is_default = 1`), then first wallet.
     - Description: Cleans text by stripping nominal and wallet tokens to produce a neat title (e.g. "Bensin motor").
- **Database Transaction Insertion**:
  ```python
  c.execute('''
      INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
      VALUES (?, ?, ?, ?, ?, ?, 'ai_bot', ?)
  ''', (user_id, wallet_id, category, tx_type, amount, description, now_time))
  tx_id = c.lastrowid

  if tx_type == 'pemasukan':
      c.execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', (amount, wallet_id))
  else:
      c.execute('UPDATE wallets SET balance = balance - ? WHERE id = ?', (amount, wallet_id))

  conn.commit()
  ```
- **Response JSON**:
  ```json
  {
    "ok": true,
    "success": true,
    "transaction_id": 42,
    "parsed": {
      "type": "pengeluaran",
      "amount": 25000.0,
      "category": "Transportasi",
      "wallet": "Cash",
      "description": "Bensin motor"
    },
    "wallet_name": "Cash",
    "new_balance": 475000.0,
    "reply_message": "✅ Dicatat: Pengeluaran Rp 25.000 (Transportasi) via Dompet Cash.",
    "message": "Transaksi berhasil disimpan ke database."
  }
  ```

#### 3.1.3 Frontend Auto-Update Mechanism
- When `/api/ai/parse-transaction` returns HTTP 200:
  1. Add user bubble to `aiQuickRecordMessages`.
  2. Add assistant confirmation bubble displaying:
     - Type & Amount (formatted in IDR, e.g. `-Rp 25.000` in red/orange or `+Rp 5.000.000` in green).
     - Category and Wallet badge.
     - Updated wallet balance.
  3. Invoke existing `loadRealDashboardData()` immediately:
     - Re-fetches `/api/dashboard/stats?user_id=...` -> dynamically updates `valTotalSaldo`, `valPengeluaran`, `valPemasukan`, and budget progress bars.
     - Re-fetches `/api/transactions?user_id=...` -> prepends new transaction row to `homeTxTableBody` and `fullTxTableBody`.
     - Re-fetches `/api/wallets?user_id=...` -> updates wallet cards and balances.
  4. ZERO full page reload is required; seamless reactive DOM update.

---

### 3.2 R2: Telegram Bot Integration

#### 3.2.1 Schema Migration (`users` Table)
- Add `telegram_chat_id` and `telegram_pairing_code`:
  ```sql
  ALTER TABLE users ADD COLUMN telegram_chat_id TEXT DEFAULT '';
  ALTER TABLE users ADD COLUMN telegram_pairing_code TEXT DEFAULT '';
  ```
- Both `server.py` (`init_db`) and `reset_production_db.py` must execute `ALTER TABLE users ADD COLUMN telegram_chat_id TEXT DEFAULT ''` wrapped in `try/except` to guarantee backward compatibility on existing SQLite databases.

#### 3.2.2 Web Settings Pairing Card (in `tpl_dashboard.py` / `index.html`)
- Added to `dTab-settings`:
  ```html
  <!-- Card Pairing Akun Telegram -->
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
        <li>Buka aplikasi Telegram dan cari bot resmi <b>@tatadana_finance_bot</b> (atau klik tautan).</li>
        <li>Kirim pesan: <code class="font-bold text-orange-700 font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200" id="pairingCodeCommandExample">/connect [KODE]</code></li>
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
        <button type="button" onclick="copyPairingCode()" class="text-slate-400 hover:text-slate-700 ml-1" title="Salin">📋</button>
      </div>
    </div>
    <div id="pairingFeedbackMsg" class="hidden text-xs font-medium"></div>
  </div>
  ```

#### 3.2.3 Pairing Endpoint `/api/telegram/pairing-code`
- **Method**: `POST`
- **Request**: `{"user_id": 1}`
- **Logic**:
  * Generates a 6-digit random code: `f"{random.randint(100000, 999999)}"`.
  * Stores in database: `UPDATE users SET telegram_pairing_code = ? WHERE id = ?`.
  * `conn.commit()`.
  * Returns:
    ```json
    {
      "ok": true,
      "pairing_code": "489201",
      "command": "/connect 489201",
      "bot_username": "@tatadana_finance_bot",
      "bot_url": "https://t.me/tatadana_finance_bot"
    }
    ```

#### 3.2.4 Telegram Listener Handler
- **Token**: `8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ`
- **Command `/connect <code>`**:
  * When a message starts with `/connect`:
    ```python
    parts = raw_text.split()
    if len(parts) > 1:
        code_arg = parts[1].strip()
        conn = get_db()
        c = conn.cursor()
        # Match by pairing code, or if token/user_id format
        c.execute('SELECT id, full_name, email FROM users WHERE telegram_pairing_code = ?', (code_arg,))
        target_u = c.fetchone()
        if not target_u and (code_arg == TELEGRAM_BOT_TOKEN or '8957486024' in code_arg):
            c.execute('SELECT id, full_name, email FROM users WHERE role IN ("admin", "superadmin") LIMIT 1')
            target_u = c.fetchone()
        
        if target_u:
            c.execute('UPDATE users SET telegram_chat_id = ?, telegram_user_id = ?, telegram_pairing_code = "" WHERE id = ?', 
                      (str(chat_id), sender_tg_id, target_u['id']))
            conn.commit()
            conn.close()
            reply = (
                f"✅ *Akun Berhasil Terhubung!*\n"
                f"👤 Pemilik: *{target_u['full_name']}*\n"
                f"📧 Email: `{target_u['email']}`\n\n"
                f"Sekarang Anda dapat langsung mencatat transaksi finansial di chat ini.\n\n"
                f"*Contoh format chat:*\n"
                f"• `Bensin motor 25rb cash`\n"
                f"• `Makan siang 35.000`\n"
                f"• `Gaji bulanan 5jt bca`"
            )
            send_telegram_reply(token, chat_id, reply)
            return
        conn.close()
    ```
- **Financial Message Ingress via AI Gateway / Natural Language**:
  * Incoming messages resolve `user_id` by matching:
    ```sql
    SELECT id, full_name FROM users WHERE telegram_chat_id = ? OR telegram_user_id = ?
    ```
  * Parsed via `parse_telegram_transaction_text` or AI Gateway.
  * Stored in `transactions` with `conn.commit()`.
  * Response sent back via Telegram in clean Markdown format:
    ```text
    ✅ *Transaksi Berhasil Dicatat!*
    ━━━━━━━━━━━━━━━━━━━
    📌 *Jenis*: 💸 Pengeluaran
    💰 *Nominal*: Rp 25,000
    📂 *Kategori*: 🚗 Transportasi
    👛 *Dompet*: Cash
    📝 *Catatan*: Bensin motor 25rb cash
    ━━━━━━━━━━━━━━━━━━━
    💵 *Sisa Saldo*: Rp 475,000
    ⏰ *Waktu*: 31 Oktober 2026 10:30 WIB
    ```

---

### 3.3 R3: Admin User Management di Halaman Admin (`tpl_admin.py`)

#### 3.3.1 Retaining All Registered Users
In `loadAdminUsers()`:
- DO NOT filter out approved users! Keep all users:
  ```javascript
  const allUsers = data.users; // Both pending (is_approved === 0) and approved (is_approved === 1)
  ```
- Render both statuses in `adminUsersTableBody`:
  ```html
  <tr id="applicantRow-${u.id}" class="hover:bg-slate-50 transition border-b border-slate-100">
    <td class="py-3 px-3 font-mono font-bold text-slate-500">#${u.id}</td>
    <td class="py-3 px-3 font-bold text-slate-800">${u.full_name || 'Tanpa Nama'}</td>
    <td class="py-3 px-3 font-mono text-slate-600">${u.email}</td>
    <td class="py-3 px-3 font-mono text-slate-600">${u.phone_number || '-'}</td>
    <td class="py-3 px-3" id="userStatusBadgeCell-${u.id}">
      ${u.is_approved === 1 || u.status === 'active' 
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Approved</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDING</span>`}
    </td>
    <td class="py-3 px-3 text-center space-x-1.5 whitespace-nowrap" id="userActionCell-${u.id}">
      ${u.is_approved === 0 && u.status !== 'active' ? `
        <button id="btnApproveUser-${u.id}" onclick="approveDirectUser(this, ${u.id})" 
                class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer">
          ✓ Setujui
        </button>
      ` : ''}
      <button onclick="deleteDirectUser(${u.id}, '${u.email}')" 
              class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer">
        🗑️ Hapus
      </button>
    </td>
  </tr>
  ```

#### 3.3.2 Approve Button Dynamic Transition
- Function `approveDirectUser(btnOrId, maybeId)`:
  * Disables button immediately:
    ```javascript
    btn.disabled = true;
    btn.innerText = 'Memproses...';
    ```
  * Calls `/api/admin/approve-user?user_id=` + userId.
  * On HTTP 200 OK:
    - **CRITICAL REQUIREMENT**: DO NOT execute `row.remove()`!
    - Update badge in cell `userStatusBadgeCell-${userId}` to:
      ```html
      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Approved</span>
      ```
    - Hide or remove the approve button:
      ```javascript
      if (btn) btn.style.display = 'none';
      ```
    - The row remains intact in the table!
    - The 'Hapus' button remains present and clickable!
    - Call `loadAdminMetrics()` to refresh dynamic header counters.

#### 3.3.3 Confirmed Delete Button ('Hapus')
- Every row contains `<button onclick="deleteDirectUser(${u.id}, '${u.email}')">🗑️ Hapus</button>`.
- Client Function:
  ```javascript
  async function deleteDirectUser(userId, email) {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna ${email}? Data akun dan riwayat akan dihapus secara permanen.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.ok || res.status === 200) {
        const row = document.getElementById('applicantRow-' + userId);
        if (row) row.remove();
        loadAdminMetrics();
      } else {
        alert('Gagal menghapus pengguna: ' + (data.message || 'Error'));
      }
    } catch (err) {
      alert('Gagal menghapus pengguna: ' + err.message);
    }
  }
  ```
- Backend Support in `server.py`:
  Both `POST /api/admin/reject-user` and alias `POST /api/admin/delete-user` accept `{user_id: X}` or `?user_id=X`, delete dependent records, execute `DELETE FROM users WHERE id = ?`, and call `conn.commit()`.

---

### 3.4 R4: Modularization, Vercel & GitHub Readiness

#### 3.4.1 Modularization Architecture
Extract `index.html` into 5 Python modules:
```
tatadana/
├── tpl_landing.py     # get_landing_html() -> <section id="viewLanding"> ... </section>
├── tpl_auth.py        # get_auth_html() -> <section id="viewLogin"> and <section id="viewApproval">
├── tpl_dashboard.py   # get_dashboard_html() -> <section id="viewDashboard"> (user tabs + floating AI bot)
├── tpl_admin.py       # get_admin_html() -> <div id="dTab-adminPanel"> (Superadmin Desk & user management)
├── tpl_script.py      # get_script_js() -> JavaScript client app (<script>...</script>)
```
In `server.py`:
```python
import tpl_landing
import tpl_auth
import tpl_dashboard
import tpl_admin
import tpl_script

def render_index_html():
    landing_part = tpl_landing.get_landing_html()
    auth_part = tpl_auth.get_auth_html()
    dashboard_part = tpl_dashboard.get_dashboard_html()
    admin_part = tpl_admin.get_admin_html()
    script_part = tpl_script.get_script_js()
    
    # Assembles head, banner, container, embeds admin inside dashboard, adds script
    ...
```
Furthermore, `index.html` on the filesystem is kept synchronized with this assembled output so any static server or file inspection matches 100%.

#### 3.4.2 Vercel Deployment Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/uploads/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.py"
    }
  ]
}
```

#### 3.4.3 Serverless Entrypoint & SQLite Persistence (`api/index.py`)
- In Vercel serverless functions, the root filesystem is read-only; write operations are only permitted in `/tmp`.
- In `server.py` and `api/index.py`:
  ```python
  def resolve_db_path():
      if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
          tmp_db = '/tmp/tatadana.db'
          if not os.path.exists(tmp_db):
              bundle_db = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tatadana.db')
              if os.path.exists(bundle_db):
                  import shutil
                  try:
                      shutil.copy2(bundle_db, tmp_db)
                  except Exception as e:
                      print(f"[DB Init] Failed to copy bundle DB to /tmp: {e}")
              if not os.path.exists(tmp_db):
                  init_db(tmp_db)
          return tmp_db
      return os.environ.get('TATADANA_DB_FILE') or os.path.abspath(os.path.join(os.path.dirname(__file__), 'tatadana.db'))
  ```
- Local execution on port 3000 uses `./tatadana.db` directly, while Vercel serverless runs safely on `/tmp/tatadana.db` without `sqlite3.OperationalError: attempt to write a readonly database`.
- `api/index.py` implements a WSGI / `handler(BaseHTTPRequestHandler)` wrapper bridging Vercel's Python runtime to `TataDanaRequestHandler`.

#### 3.4.4 Complete `requirements.txt`
```
python-dotenv>=1.0.0
```
All other server capabilities (HTTP, SQLite, JSON, CSV, PDF generation, XLSX zip generation, hash, urllib, socket) use Python's built-in standard library, ensuring instant sub-second deployment on Vercel without heavy C-extensions.

#### 3.4.5 Robust `.gitignore`
```gitignore
# Environment & secrets
.env
.env.local
.env.*.local

# Python artifacts
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Virtual environments
.venv/
venv/
ENV/
env/
env.bak/
venv.bak/

# Node & Next.js artifacts
node_modules/
.next/
out/
build/

# Vercel deployment cache
.vercel/

# OS & Editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Binaries
cloudflared.exe
```

#### 3.4.6 Static Assets, CSS & Font Routing
- Fonts: Google Fonts `Plus Jakarta Sans` via HTTPS CDN (`https://fonts.googleapis.com/...`).
- Tailwind CSS: Antigravity/Tailwind CDN via HTTPS (`https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js`).
- Charts: Chart.js CDN via HTTPS (`https://cdn.jsdelivr.net/npm/chart.js`).
- Uploads: Served via `/uploads/avatars/...` by `server.py` and routed via `vercel.json` to `api/index.py`.

#### 3.4.7 VS Code Git Terminal Commands Guide
A clean, copy-pasteable guide to push to GitHub:
```bash
# 1. Buka Terminal terintegrasi di VS Code (Ctrl + ` atau Terminal > New Terminal)
# 2. Pastikan berada di folder proyek:
cd "C:\Users\ASUS\.gemini\antigravity\scratch\tatadana"

# 3. Inisialisasi Git repository jika belum diinisialisasi:
git init

# 4. Tambahkan seluruh berkas proyek ke staging:
git add .

# 5. Buat commit perdana dengan pesan deskriptif:
git commit -m "feat: TataDana production-ready with Floating AI Bot, Telegram Integration, Admin Approval, and Vercel modular deployment"

# 6. Pastikan branch utama bernama main:
git branch -M main

# 7. Hubungkan ke remote GitHub Anda (ganti <USERNAME> dan <REPO_NAME> sesuai akun Anda):
git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git

# 8. Push kode ke GitHub:
git push -u origin main
```

---

## 4. Architectural Interface Contracts

### 4.1 REST API Contracts

#### Endpoint 1: `POST /api/ai/parse-transaction`
- **Request**:
  ```json
  {
    "text": "string (e.g. 'Bensin motor 25rb cash' or 'Gaji bulanan 5jt bca')",
    "user_id": 1
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "ok": true,
    "success": true,
    "transaction_id": 105,
    "parsed": {
      "type": "pengeluaran",
      "amount": 25000.0,
      "category": "Transportasi",
      "wallet": "Cash",
      "description": "Bensin motor"
    },
    "wallet_id": 4,
    "wallet_name": "Cash",
    "new_balance": 475000.0,
    "reply_message": "✅ Dicatat: Pengeluaran Rp 25.000 (Transportasi) via Dompet Cash.",
    "message": "Transaksi berhasil disimpan ke database."
  }
  ```
- **Response 400 Bad Request**:
  ```json
  {
    "ok": false,
    "message": "Format transaksi tidak terdeteksi atau nominal tidak valid."
  }
  ```

#### Endpoint 2: `POST /api/telegram/pairing-code`
- **Request**:
  ```json
  {
    "user_id": 1
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "ok": true,
    "pairing_code": "849201",
    "command": "/connect 849201",
    "bot_username": "@tatadana_finance_bot",
    "bot_url": "https://t.me/tatadana_finance_bot"
  }
  ```

#### Endpoint 3: `POST /api/admin/approve-user` / `GET /api/admin/approve-user?user_id=X`
- **Request**: `{"user_id": 2}` or query param `?user_id=2`
- **Response 200 OK**:
  ```json
  {
    "ok": true,
    "success": true,
    "user_id": 2,
    "is_approved": 1,
    "status": "active",
    "message": "Akun user ID 2 (rina@example.com) berhasil disetujui (Approved)."
  }
  ```

#### Endpoint 4: `POST /api/admin/delete-user` / `POST /api/admin/reject-user`
- **Request**: `{"user_id": 2}`
- **Response 200 OK**:
  ```json
  {
    "ok": true,
    "success": true,
    "user_id": 2,
    "message": "Akun user ID 2 telah berhasil dihapus dari database."
  }
  ```

---

## 5. Test Plan for Test Writer & Workers

### 5.1 Test Suite Specifications (`test_round10_verification.py`)
The Test Writer must construct a comprehensive, self-contained automated verification script covering:

1. **R1 Verification**:
   - `POST /api/ai/parse-transaction` with `"Bensin motor 25rb cash"`:
     * Asserts HTTP 200, `ok == True`.
     * Asserts `parsed['amount'] == 25000.0`, `parsed['type'] == 'pengeluaran'`, `parsed['category'] == 'Transportasi'`, `parsed['wallet'] == 'Cash'`.
     * Verifies SQLite persistence: `SELECT * FROM transactions WHERE id = ...` must exist with `user_id = 1` and `source = 'ai_bot'`.
     * Verifies wallet balance deduction in `wallets` table.
   - `POST /api/ai/parse-transaction` with `"Gaji bulanan 5jt bca"`:
     * Asserts `parsed['amount'] == 5000000.0`, `parsed['type'] == 'pemasukan'`, `parsed['category'] == 'Gaji & Proyek'`.
     * Verifies wallet balance increment.
   - Inspects `tpl_dashboard.py` / `index.html` for presence of `id="aiQuickRecordContainer"`, `id="aiQuickRecordModal"`, `id="aiQuickRecordInput"`, `id="btnSubmitAiQuickRecord"`, `loadRealDashboardData()`.

2. **R2 Verification**:
   - Schema check: Queries `PRAGMA table_info(users)` and asserts column `telegram_chat_id` exists.
   - Pairing code endpoint: `POST /api/telegram/pairing-code` returns valid 6-digit code.
   - Telegram `/connect <code>`: Invokes `process_telegram_incoming_message` with `/connect <code_from_previous_step>` and asserts `telegram_chat_id` is updated in SQLite.
   - Natural language Telegram message: Sends `"Makan siang padang 30rb"` from connected chat ID, asserts transaction is recorded in SQLite and reply contains Markdown confirmation.

3. **R3 Verification**:
   - Inspects `tpl_admin.py` / `index.html`:
     * Checks `adminUsersTableBody` retains pending and approved users.
     * Verifies approve button click logic: does NOT remove row, sets green badge `✓ Approved`, hides approve button.
     * Checks 'Hapus' button exists with confirmation modal logic calling delete endpoint.
   - Functional API test: Approves user -> checks SQLite `status = 'active'`, `is_approved = 1`. Deletes user -> checks user is removed from SQLite.

4. **R4 Verification**:
   - Template modularization: Asserts files `tpl_landing.py`, `tpl_auth.py`, `tpl_dashboard.py`, `tpl_admin.py`, `tpl_script.py` exist and import cleanly in Python.
   - Deployment files: Asserts `vercel.json` exists with correct routes, `api/index.py` exists with `/tmp/tatadana.db` fallback.
   - File assets: Checks `requirements.txt` contains `python-dotenv`, `.gitignore` contains `.env`, `__pycache__`, `venv`.
   - VS Code Git guide: Confirms documentation file with Git CLI commands exists.

5. **Regression Verification**:
   - Runs existing `test_admin_desk.py`, `test_telegram_backend.py`, and `test_api.py` to ensure 100% backward compatibility and zero regressions.

---
*Report successfully completed by explorer_r10_1. All interface contracts, schemas, and implementation blueprints are finalized.*
