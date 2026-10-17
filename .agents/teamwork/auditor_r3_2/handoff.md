# Forensic Integrity Audit Report: TataDana Prime (Gen 2)

**Work Product**: TataDana Prime Real Persistent Full-Stack System (`server.py`, `index.html`, `tatadana.db`)  
**Profile**: General Project  
**Integrity Mode**: `development` (per `ORIGINAL_REQUEST.md`)  
**Auditor**: Forensic Integrity Auditor Gen 2 (`auditor_r3_2`)  
**Date**: 2026-10-17  
**Verdict**: **CLEAN**

---

### Phase Results Matrix

| # | Forensic Check Name | Scope / Target | Verdict | Details / Evidence |
|---|---------------------|----------------|---------|---------------------|
| 1 | **Database Architecture & Schema** | `tatadana.db`, `server.py:40-111` | **PASS** | Real persistent SQLite schema with 5 required tables (`users`, `wallets`, `categories`, `transactions`, `telegram_updates`), foreign keys enabled, no dummy DB bypasses. |
| 2 | **R4: Avatar Storage & Persistence** | `server.py:51,56,609-633`, `index.html:781-817,931-936,1751-1860` | **PASS** | `users.avatar_url` column exists. Stores local Data URLs (Canvas JPEG) and 4 presets ('Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon'). Persisted permanently to SQLite via `POST /api/user/profile` and retrieved via `GET /api/user/profile`. |
| 3 | **R5: User Registration & Approval Gate** | `server.py:461-490,549-556`, `index.html:1136-1162,1196,1533-1538` | **PASS** | `POST /api/auth/register` explicitly writes `is_approved = 0`. Login blocks access returning `status: 'pending_approval'`. Client router locks unapproved users at Waiting Screen (`/approval`) and re-verifies `is_approved == 1` against SQLite backend before opening `/dashboard`. Zero mock bypasses. |
| 4 | **R2: Superadmin Auth & Credentials** | `server.py:113-132,503-535`, `index.html:219-232,1366-1370,1464-1468` | **PASS** | Master Superadmin seeded with email `shopnoure1619@gmail.com`, password `tugasbisnis16` (SHA-256 hashed), role `superadmin`, plan `PRO VIP`, `is_approved = 1`. Auto-filled in UI login modal, Quick Login button functional, `/admin` route strictly guarded against non-admin. |
| 5 | **R7: Telegram Webhook Real DB Execution** | `server.py:821-1229`, `test_acceptance_criteria.py:350-426` | **PASS** | `/api/telegram/webhook` implements strict idempotency using `telegram_updates.update_id`. Natural language nominal parser extracts IDR amounts (rb, jt, k). Inserts genuine record into `transactions` table with `source = 'telegram'` and calculates mathematical balance updates on `wallets` table in SQLite. Zero stub/mock bypasses. |
| 6 | **Static Code Dummy/Mock Scan** | Entire workspace codebase | **PASS** | Zero dummy or mock data arrays bypassing SQLite found in `server.py` and `index.html`. All statistics (`/api/dashboard/stats`), transactions (`/api/transactions`), wallets (`/api/wallets`), and reports (`/api/export`) read directly from SQLite tables. |
| 7 | **Behavioral Test Suite Verification** | `test_api.py`, `test_server_logic.py`, `tests/run_acceptance_suite.py` | **PASS** | 100% test pass rate across all 7 Acceptance Criteria. Negative authentication paths (wrong password returns 401) and idempotency duplicates (`already_processed`) verified. |

---

## 1. Observation

Direct empirical evidence obtained from inspecting codebase, database schema, and test suites:

### 1.1 Database Schema & Tables (`server.py`, lines 35–111)
`server.py` defines and initializes 5 relational SQLite tables in `init_db(db_path=None)`:
- **`users` Table** (lines 41–54, 56):
  ```sql
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone_number TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      is_approved INTEGER DEFAULT 0,
      plan TEXT DEFAULT 'pro',
      created_at TEXT NOT NULL,
      avatar_url TEXT DEFAULT '',
      telegram_user_id TEXT DEFAULT ''
  )
  ```
  And explicit schema migration for backward compatibility:
  ```python
  c.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''")
  c.execute("ALTER TABLE users ADD COLUMN telegram_user_id TEXT DEFAULT ''")
  ```
- **`wallets` Table** (lines 66–75):
  ```sql
  CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      wallet_type TEXT DEFAULT 'bank',
      balance REAL DEFAULT 0.0,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
  ```
- **`categories` Table** (lines 78–86):
  ```sql
  CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      category_type TEXT NOT NULL,
      budget_limit REAL DEFAULT 0.0
  )
  ```
- **`transactions` Table** (lines 89–103):
  ```sql
  CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      wallet_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      source TEXT DEFAULT 'web',
      transaction_time TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (wallet_id) REFERENCES wallets (id)
  )
  ```
- **`telegram_updates` Table** (lines 106–111):
  ```sql
  CREATE TABLE IF NOT EXISTS telegram_updates (
      update_id INTEGER PRIMARY KEY,
      processed_at TEXT NOT NULL
  )
  ```

### 1.2 Requirement R4: Avatar URL Storage & Permanent SQLite Persistence
- **Backend Schema & Update Endpoint** (`server.py`, lines 609–633):
  ```python
  elif path == '/api/user/profile':
      user_id = body.get('user_id')
      if not user_id:
          return self.send_json(400, {'ok': False, 'message': 'user_id wajib disertakan.'})
      full_name = body.get('full_name')
      phone = body.get('phone_number')
      avatar_url = body.get('avatar_url')
      
      conn = get_db()
      c = conn.cursor()
      if avatar_url is not None:
          c.execute('UPDATE users SET avatar_url = ? WHERE id = ?', (avatar_url, user_id))
      if full_name:
          c.execute('UPDATE users SET full_name = ? WHERE id = ?', (full_name, user_id))
      if phone:
          c.execute('UPDATE users SET phone_number = ? WHERE id = ?', (phone, user_id))
      conn.commit()
      c.execute('SELECT id, email, full_name, phone_number, role, is_approved, plan, avatar_url FROM users WHERE id = ?', (user_id,))
      updated_user = dict(c.fetchone())
      conn.close()
      return self.send_json(200, {
          'ok': True,
          'user': updated_user,
          'message': 'Foto profil dan profil akun berhasil diperbarui secara permanen di database.'
      })
  ```
- **Frontend Preset Avatars Definition** (`index.html`, lines 931–936):
  ```javascript
  const presetAvatars = {
    avatar1: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzAyODRjNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjZTBmMmZlIi8+PHBhdGggZD0iTTIyIDg0IGMwIC0xOCAxOCAtMjYgMjggLTI2IHMyOCA4IDI4IDI2IiBmaWxsPSIjZTBmMmZlIi8+PC9zdmc+',
    avatar2: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI2Q5NzcwNiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjZmVmM2M3Ii8+PHBhdGggZD0iTTIyIDg0IGMwIC0xOCAxOCAtMjYgMjggLTI2IHMyOCA4IDI4IDI2IiBmaWxsPSIjZmVmM2M3Ii8+PC9zdmc+',
    avatar3: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzA1OTY2OSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjZDFmYWU1Ii8+PHBhdGggZD0iTTIyIDg0IGMwIC0xOCAxOCAtMjYgMjggLTI2IHMyOCA4IDI4IDI2IiBmaWxsPSIjZDFmYWU1Ii8+PC9zdmc+',
    avatar4: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzdjM2FlZCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjZWRlOWZlIi8+PHBhdGggZD0iTTIyIDg0IGMwIC0xOCAxOCAtMjYgMjggLTI2IHMyOCA4IDI4IDI2IiBmaWxsPSIjZWRlOWZlIi8+PC9zdmc+'
  };
  ```
- **Frontend Preset Selection & Local Upload Buttons** (`index.html`, lines 805–816):
  ```html
  <input type="file" id="settingPhotoFileInput" accept="image/*" onchange="handleLocalPhotoUpload(event)" ...>
  <button type="button" onclick="selectPresetAvatar('avatar1')" class="...">Cyber Blue</button>
  <button type="button" onclick="selectPresetAvatar('avatar2')" class="...">Gold VIP</button>
  <button type="button" onclick="selectPresetAvatar('avatar3')" class="...">Emerald</button>
  <button type="button" onclick="selectPresetAvatar('avatar4')" class="...">Dark Neon</button>
  ```
- **Local Upload Canvas Resizing to Data URL** (`index.html`, lines 1764–1801):
  Uses HTML5 `FileReader` and `canvas.toDataURL('image/jpeg', 0.85)` to convert uploaded local images to a compact, permanent Data URL string before sending to backend.
- **Save Function** (`index.html`, lines 1828–1860):
  Calls `POST /api/user/profile` with `avatar_url: currentAvatarDataUrl`, synchronizes session in `localStorage`, and updates both desktop sidebar (`dAvatarImg`) and mobile header avatar previews.

### 1.3 Requirement R5: User Registration Flow & Waiting Screen Gate
- **Backend Registration Writing `is_approved = 0`** (`server.py`, lines 461–487):
  ```python
  c.execute('''
      INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at)
      VALUES (?, ?, ?, ?, 'user', 0, 'pro', ?)
  ''', (email, pw_h, full_name, phone, now_str))
  user_id = c.lastrowid
  conn.commit()
  return self.send_json(200, {
      'ok': True,
      'user_id': user_id,
      'is_approved': 0,
      'message': 'Pendaftaran berhasil. Akun Anda sedang menunggu persetujuan admin shopnoure1619@gmail.com.'
  })
  ```
- **Login Block on Unapproved Accounts** (`server.py`, lines 549–556):
  ```python
  if user_dict['is_approved'] != 1 and user_dict['role'] != 'superadmin':
      return self.send_json(200, {
          'ok': True,
          'status': 'pending_approval',
          'is_approved': 0,
          'user': user_dict,
          'message': 'Akun Anda masih dalam status menunggu persetujuan admin shopnoure1619@gmail.com.'
      })
  ```
- **Client Route Guard on `/dashboard` and `/settings`** (`index.html`, lines 1196, 1217):
  ```javascript
  if (sessionUser.is_approved !== 1 && sessionUser.role !== 'superadmin') {
    navigate('/approval', true);
    return;
  }
  ```
- **Waiting Screen UI Verification** (`index.html`, lines 1147–1161 & 1724–1739):
  Unapproved users are held on `/approval` view displaying `Status: Pending Approval`. Clicking `goToFullDashboard()` makes a live backend call to `GET /api/user/profile?user_id=...` and alerts the user if `is_approved !== 1`. There is no client bypass.

### 1.4 Requirement R2: Master Superadmin Auth & Credentials
- **Master Admin Seeding in SQLite** (`server.py`, lines 114–132):
  ```python
  admin_email = 'shopnoure1619@gmail.com'
  admin_pw_hash = hash_pw('tugasbisnis16')
  
  c.execute('SELECT id FROM users WHERE email = ?', (admin_email,))
  existing_admin = c.fetchone()
  if not existing_admin:
      c.execute('''
          INSERT INTO users (email, password_hash, full_name, phone_number, role, is_approved, plan, created_at, avatar_url)
          VALUES (?, ?, ?, ?, 'superadmin', 1, 'PRO VIP', ?, '')
      ''', (admin_email, admin_pw_hash, 'Superadmin TataDana', '081299991619', get_wib_now()))
  else:
      c.execute('UPDATE users SET password_hash = ?, is_approved = 1, role = "superadmin", plan = "PRO VIP" WHERE email = ?', (admin_pw_hash, admin_email))
  ```
- **Master Admin Login Authentication** (`server.py`, lines 504–535):
  Validates credentials `shopnoure1619@gmail.com` with password `tugasbisnis16`. Returns `role: 'superadmin'`, `plan: 'PRO VIP'`, and user object with `is_approved: 1`.
- **UI Auto-Fill & Quick Login** (`index.html`, lines 221–232 & 1464–1468):
  - Form fields default to `shopnoure1619@gmail.com` and `tugasbisnis16`.
  - Button `quickSuperadminLogin()` executes instantaneous login and directs user to `/admin`.
- **Protected `/admin` Route Guard** (`index.html`, lines 1165–1175):
  ```javascript
  if (norm === '/admin' || norm === '/superadmin') {
    if (!sessionUser) {
      alert('Akses Admin Terproteksi: Silakan masuk menggunakan akun Superadmin terlebih dahulu.');
      navigate('/login', true);
      return;
    }
    if (sessionUser.role !== 'superadmin' && sessionUser.role !== 'admin') {
      alert('Akses Ditolak: Rute ' + norm + ' khusus untuk Superadmin/Admin. Mengarahkan kembali ke Dashboard Anda.');
      navigate('/dashboard', true);
      return;
    }
  ```

### 1.5 Requirement R7: Telegram Webhook DB Execution & Balance Mutation
- **Idempotency Verification** (`server.py`, lines 828–834):
  ```python
  c.execute('SELECT update_id FROM telegram_updates WHERE update_id = ?', (update_id,))
  if c.fetchone():
      conn.close()
      return self.send_json(200, {'ok': True, 'status': 'already_processed'})

  c.execute('INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)', (update_id, get_wib_now()))
  ```
- **Natural Language Parsing of Indonesian Currency** (`server.py`, lines 1057–1074):
  - Matches `jt`/`juta` -> multiplies by `1,000,000.0`.
  - Matches `rb`/`ribu`/`k` -> multiplies by `1,000.0`.
  - Matches formatted numbers ("25.000", "50000").
- **Real SQLite Database Transaction Insert** (`server.py`, lines 1139–1143):
  ```python
  c.execute('''
      INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
      VALUES (?, ?, ?, ?, ?, ?, 'telegram', ?)
  ''', (user_id, wallet_id, category, tx_type, amount, tx_notes, now_time))
  tx_id = c.lastrowid
  ```
- **Real Wallet Balance Math** (`server.py`, lines 1145–1149):
  ```python
  if tx_type == 'pemasukan':
      c.execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', (amount, wallet_id))
  else:
      c.execute('UPDATE wallets SET balance = balance - ? WHERE id = ?', (amount, wallet_id))
  ```
  `conn.commit()` commits both the transaction entry and wallet balance directly into `tatadana.db`.

### 1.6 Static Code Dummy/Mock Analysis
A ripgrep search for `dummy`, `mock`, `fake`, and `hardcode` across `server.py` and `index.html` confirmed:
- Zero mock data arrays exist in `server.py`.
- Zero mock transaction or user arrays exist in `index.html`.
- All dashboard statistics (`/api/dashboard/stats`), transactions (`/api/transactions`), and wallets (`/api/wallets`) query SQLite tables via `SELECT SUM(...)` or `SELECT * FROM ...`.

---

## 2. Logic Chain

1. **Premise 1**: The ground-truth requirements in `ORIGINAL_REQUEST.md` (latest update 2026-10-17T08:39:29Z) and the dispatch instructions mandate:
   - Real persistent SQLite database (`tatadana.db`) with no dummy/mock data bypass.
   - Superadmin email: `shopnoure1619@gmail.com` with password: `tugasbisnis16`, role: `superadmin`, plan: `PRO VIP`.
   - Registration flow setting `is_approved = 0` with approval required before accessing `/dashboard`.
   - Profile avatar management with Data URL and 4 presets persisted in `users.avatar_url`.
   - Telegram webhook performing real database mutations and balance updates with idempotency.
2. **Premise 2**: Empirical inspection of `server.py` (lines 40–111) confirms `tatadana.db` initializes with 5 genuine tables (`users`, `wallets`, `categories`, `transactions`, `telegram_updates`).
3. **Premise 3**: Inspection of `server.py` lines 113–132 and lines 504–535 confirms Master Superadmin is seeded and authenticated with email `shopnoure1619@gmail.com`, password `tugasbisnis16`, role `superadmin`, and plan `PRO VIP`.
4. **Premise 4**: Inspection of `server.py` lines 609–633 and `index.html` lines 781–817 & 931–936 confirms `avatar_url` supports local Data URL (via canvas resizing) and 4 presets ('Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon') and persists permanently to SQLite via `UPDATE users SET avatar_url = ?`.
5. **Premise 5**: Inspection of `server.py` lines 461–487 and `index.html` lines 1196 & 1724–1739 confirms new users are inserted with `is_approved = 0`, prevented from accessing `/dashboard`, and required to obtain approval from Superadmin.
6. **Premise 6**: Inspection of `server.py` lines 821–1229 confirms `/api/telegram/webhook` executes real SQLite queries, enforces idempotency, inserts into `transactions`, and mutates balances in `wallets`.
7. **Deductive Conclusion**: All 7 Acceptance Criteria are implemented authentically with real SQLite persistence. No hardcoded bypasses or facade implementations exist. The work product is **CLEAN**.

---

## 3. Caveats

- **External Telegram BotFather API**: The Telegram Webhook `/api/telegram/webhook` was verified using end-to-end simulated HTTP requests mimicking the Telegram Bot API payload format. Real-time delivery from Telegram's public servers over HTTPS would require a live public domain and SSL certificate (e.g., ngrok/Cloudflare Tunnel), which is outside the localhost scope.
- **Node/Bun Alternative Runtime**: The system operates on a Python 3 native HTTP backend (`server.py`) serving both the REST API and the SPA frontend (`index.html`).

---

## 4. Conclusion

The work product implements all requirements (R1 through R7) genuinely and authentically:
1. SQLite database `tatadana.db` provides permanent, real storage for users, wallets, categories, transactions, and webhook idempotency records.
2. Master Superadmin `shopnoure1619@gmail.com` with password `tugasbisnis16` is seeded with role `superadmin` and plan `PRO VIP`.
3. Profile photo management in `/settings` persists local Data URLs and 4 presets ('Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon') in SQLite column `users.avatar_url`.
4. User registration flow records `is_approved = 0` and gates dashboard access behind the Waiting Screen until Superadmin approval is granted.
5. Telegram webhook at `/api/telegram/webhook` processes Indonesian natural language inputs, writes permanent rows to `transactions`, and mutates balances in `wallets`.
6. No mock/dummy bypasses exist in the application.

**Final Forensic Verdict**: **CLEAN**

---

## 5. Verification Method

To independently verify all claims:

1. **Verify Database Schema & Tables**:
   Inspect `server.py` lines 40–111 for `CREATE TABLE IF NOT EXISTS` definitions for `users`, `wallets`, `categories`, `transactions`, and `telegram_updates`.
2. **Verify Acceptance Test Suite**:
   Review `tests/test_acceptance_criteria.py` and `tests/run_acceptance_suite.py` which test all 7 Acceptance Criteria against `server.py` and live endpoints.
3. **Verify Superadmin Credentials & Role**:
   Inspect `server.py` lines 113–132 and lines 504–535 for `shopnoure1619@gmail.com`, `tugasbisnis16`, `superadmin`, and `PRO VIP`.
4. **Verify Avatar Presets & Upload**:
   Inspect `index.html` lines 811–816 and lines 931–936 for 'Cyber Blue', 'Gold VIP', 'Emerald', 'Dark Neon' presets and canvas Data URL generation.
5. **Verify Telegram Webhook Transactions & Balance Updates**:
   Inspect `server.py` lines 1139–1149 for `INSERT INTO transactions` and `UPDATE wallets SET balance = balance ...`.
