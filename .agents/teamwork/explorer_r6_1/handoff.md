# Exploration & Blueprint Report: Telegram Bot (@tatadana_finance_bot) & Frontend RBAC

**Author**: Explorer Analyzer (`explorer_r6_1`)  
**Date**: 2026-10-17  
**Project**: TataDana Prime (Executive Wealth OS)  
**Status**: Exploration Complete & Ready for Implementation  

---

## 1. Observation

### 1.1 Backend Environment & Server (`server.py`)
- **Environment Handling**:
  - `server.py` line 23 reads `os.environ.get('TATADANA_DB_FILE')`.
  - Lines 40-43 read `TATADANA_SMTP_HOST`, `TATADANA_SMTP_PORT`, `TATADANA_SMTP_USER`, `TATADANA_SMTP_PASS`.
  - There is currently **no `.env` file** in the project directory (`C:/Users/ASUS/.gemini/antigravity/scratch/tatadana`).
  - `python-dotenv` is not imported in `server.py`.

- **Existing Telegram References**:
  - `server.py` line 353 in `/api/admin/metrics`:
    ```python
    'bot_username': '@lilybhotom_bot',
    ```
    This needs to be updated to `@tatadana_finance_bot`.
  - `server.py` line 1226 defines `elif path == '/api/telegram/webhook':`.
    - Lines 1232-1240: Idempotency is enforced using `telegram_updates` table (`update_id INTEGER PRIMARY KEY`).
    - Lines 1250-1281: User identification reads `telegram_user_id` from `users` table via `SELECT id FROM users WHERE telegram_user_id = ?`.
    - Line 1292: Fallback logic selects first approved superadmin/admin if no match found:
      `SELECT id FROM users WHERE is_approved = 1 ORDER BY role = "superadmin" DESC, id ASC LIMIT 1` (defaults to ID=1).
    - Lines 1527-1538: Default wallet lookup:
      `SELECT id, name FROM wallets WHERE user_id = ? AND is_default = 1`
      Fallback: `SELECT id, name FROM wallets WHERE user_id = ? ORDER BY id ASC LIMIT 1`.
    - Lines 1545-1554: Transaction insertion & balance update:
      ```python
      c.execute('''
          INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
          VALUES (?, ?, ?, ?, ?, ?, 'telegram', ?)
      ''', (user_id, wallet_id, category, tx_type, amount, tx_notes, now_time))
      if tx_type == 'pemasukan':
          c.execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', (amount, wallet_id))
      else:
          c.execute('UPDATE wallets SET balance = balance - ? WHERE id = ?', (amount, wallet_id))
      ```
    - Lines 1637-1647: `/api/telegram/test-connection` endpoint.

### 1.2 SQLite Schema (`tatadana.db`)
- In `server.py` lines 81-158 (`init_db()`):
  - Table `users`:
    `id INTEGER PRIMARY KEY AUTOINCREMENT`, `email TEXT UNIQUE`, `password_hash TEXT`, `full_name TEXT`, `phone_number TEXT`, `role TEXT DEFAULT 'user'`, `is_approved INTEGER DEFAULT 0`, `plan TEXT DEFAULT 'pro'`, `created_at TEXT`, `avatar_url TEXT`, `telegram_user_id TEXT DEFAULT ''`, `otp_code TEXT DEFAULT ''`.
    *Note: `telegram_user_id` column already exists in schema.*
  - Table `wallets`:
    `id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER NOT NULL`, `name TEXT NOT NULL`, `wallet_type TEXT DEFAULT 'bank'`, `balance REAL DEFAULT 0.0`, `is_default INTEGER DEFAULT 0`.
  - Table `transactions`:
    `id INTEGER PRIMARY KEY AUTOINCREMENT`, `user_id INTEGER NOT NULL`, `wallet_id INTEGER NOT NULL`, `category_name TEXT NOT NULL`, `transaction_type TEXT NOT NULL`, `amount REAL NOT NULL`, `notes TEXT`, `source TEXT DEFAULT 'web'`, `transaction_time TEXT NOT NULL`.
  - Table `telegram_updates`:
    `update_id INTEGER PRIMARY KEY`, `processed_at TEXT NOT NULL`.
  - Master Superadmin user: ID=1 (`shopnoure1619@gmail.com`), default wallet is `BCA Utama` (`is_default=1`, initial balance 12,450,000.0).

### 1.3 Frontend Codebase (`index.html`)
- **Old Bot Username References**:
  - Line 587: `<span class="text-cyan-300 font-semibold truncate" id="sidebarBotUsername">@lilybhotom_bot</span>`
  - Line 593: `<button type="button" onclick="window.open('https://t.me/lilybhotom_bot', '_blank')" ...>`
  - Line 2265: `const uname = '@lilybhotom_bot';` in `copyBotUsername()`
- **Sidebar Navigation**:
  - Line 530: `id="dNav-beranda"` is already at the very top of `<nav>`.
  - Line 551: `<button onclick="selectTab('adminPanel')" id="dNav-adminPanel" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-cyan-300 bg-blue-950/60 border border-blue-800/80 hover:bg-blue-900/60 transition shadow-sm">`
  - Other menus that MUST stay visible: Beranda, Transaksi & Mutasi, Laporan Eksekutif, Alokasi Budget, Multi-Wallet, Pengaturan Akun.
- **Navigation Function `selectTab(tab)`**:
  - Line 3646: Currently checks `if (tab === 'adminPanel' && currentUserRole !== 'superadmin' && currentUserRole !== 'admin')`, alerts a custom message, but **does not redirect to 'beranda'**.
  - Line 3662: In the loop over tabs, setting `nav.className` directly resets classes, which would inadvertently remove `hidden` from `dNav-adminPanel` when a non-admin switches between tabs.
- **Session & Login Handlers**:
  - Line 1401: `saveSession(user)` updates `currentUserData`, `currentUserRole`, and calls `applyUserToUI(user)`.
  - Line 1815: `loginSuperadminDirect()` calls `saveSession(data.user)`.
  - Line 1875: `submitDedicatedLogin()` calls `saveSession(data.user)`.
  - Line 1975: `realAdminLoginSubmit()` calls `saveSession(data.user)`.
  - Line 2010: `realUserLoginSubmit()` calls `saveSession(data.user)`.
- **Role Switcher Handlers**:
  - Line 2348: `switchRoleToApprovedUser()` sets session to User (Naftaly), alerts, and navigates to `/dashboard`.
  - Line 2397: `switchRoleToSuperadmin()` sets session to Superadmin (Lily Latifah), alerts, and navigates to `/admin`.
  - Line 2420: `switchRoleToSpecificUser(userId)`.
- **Existing Features Verification**:
  - Line 788: Submit button on form "Catat Transaksi Riil Baru" is labeled `Simpan`.
  - Lines 800-950: Executive reports charts (Histogram, Donut chart, summary metric cards).
  - Lines 1290-1370: Multi-Wallet dynamic modal and empty state CTA.
  - Lines 400-500: Blue/cyan OTP verification layout in `#viewApproval`.

---

## 2. Logic Chain & Implementation Blueprint

### 2.1 Blueprint for Worker 1: Backend Telegram Bot (@tatadana_finance_bot)

#### A. Create File `.env`
In project root `C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.env`:
```env
TELEGRAM_BOT_TOKEN=8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ
```

#### B. Safe `.env` Loader in `server.py`
To strictly comply with the rule of using standard libraries only (no external packages required):
```python
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception as e:
            print(f"[Env Loader] Error reading .env: {e}")

load_env_file()
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
```

#### C. Update `/api/admin/metrics` in `server.py`
In line 353 of `server.py`:
Change:
```python
'bot_username': '@lilybhotom_bot',
```
To:
```python
'bot_username': '@tatadana_finance_bot',
```

#### D. Background Long Polling Thread (`urllib.request`, `threading`, `json`, `sqlite3`, `time`)
1. **Helper to send message**:
```python
def send_telegram_reply(token, chat_id, text):
    if not token or not chat_id:
        return False
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = json.dumps({'chat_id': chat_id, 'text': text}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[Telegram Polling] Error sending reply to {chat_id}: {e}")
        return False
```

2. **Parser for Transaction format `[jenis] [nominal] [kategori]`**:
```python
def parse_telegram_transaction_text(text):
    text = (text or '').strip()
    if not text:
        return None
    import re
    # Check explicit format: [jenis] [nominal] [kategori]
    # e.g.: "Pengeluaran 50000 Makanan & Minuman" or "Pemasukan 1.5jt Gaji & Proyek"
    m = re.match(r'^(pengeluaran|pemasukan)\s+([\d.,kmbjt]+)\s+(.+)$', text, re.IGNORECASE)
    if m:
        raw_type = m.group(1).lower()
        raw_nom = m.group(2).lower()
        kategori = m.group(3).strip()
        
        # Parse nominal
        amount = 0.0
        m_jt = re.search(r'([\d.,]+)\s*(?:jt|juta)', raw_nom)
        m_rb = re.search(r'([\d.,]+)\s*(?:rb|ribu|k)', raw_nom)
        m_num = re.search(r'(?:rp\.?\s*)?(\d{1,3}(?:[.]\d{3})+(?:,\d+)?|\d+)', raw_nom)
        if m_jt:
            amount = float(m_jt.group(1).replace(',', '.')) * 1000000.0
        elif m_rb:
            amount = float(m_rb.group(1).replace(',', '.')) * 1000.0
        elif m_num:
            amount = float(m_num.group(1).replace('.', '').replace(',', '.'))
        
        return {
            'type': raw_type,
            'amount': amount,
            'category': kategori,
            'notes': text
        }
    return None
```

3. **Message Handler Function**:
```python
def handle_telegram_message(token, msg):
    chat_id = msg.get('chat', {}).get('id')
    sender_tg_id = str(msg.get('from', {}).get('id') or '')
    raw_text = str(msg.get('text') or '').strip()
    
    if not raw_text or not chat_id:
        return

    # 1. Handle /start
    if raw_text == '/start' or raw_text.startswith('/start'):
        # Check if /start has linking parameter (e.g. /start 081299991619)
        parts = raw_text.split()
        if len(parts) > 1:
            phone_arg = parts[1].strip().replace('-', '').replace(' ', '')
            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id, full_name FROM users WHERE phone_number LIKE ?', (f'%{phone_arg[-8:]}',))
            target_u = c.fetchone()
            if target_u:
                c.execute('UPDATE users SET telegram_user_id = ? WHERE id = ?', (sender_tg_id, target_u['id']))
                conn.commit()
                conn.close()
                reply = (
                    f"✅ Akun Telegram Anda berhasil terhubung dengan TataDana!\n"
                    f"👤 Pemilik: {target_u['full_name']}\n"
                    f"Sekarang Anda dapat mencatat transaksi: [Jenis] [Nominal] [Kategori]"
                )
                send_telegram_reply(token, chat_id, reply)
                return
            conn.close()
        
        # Default official greeting for /start as required:
        greeting = (
            "Halo! Saya bot asisten keuangan TataDana. Anda dapat mencatat transaksi langsung dari sini dengan format: "
            "[Jenis] [Nominal] [Kategori] (Contoh: Pengeluaran 50000 Makanan & Minuman)."
        )
        send_telegram_reply(token, chat_id, greeting)
        return

    # 2. Handle [jenis] [nominal] [kategori]
    parsed_tx = parse_telegram_transaction_text(raw_text)
    conn = get_db()
    c = conn.cursor()

    # User identification
    user_id = None
    if sender_tg_id:
        c.execute('SELECT id FROM users WHERE telegram_user_id = ? AND telegram_user_id != ""', (sender_tg_id,))
        u = c.fetchone()
        if u:
            user_id = u['id']
            
    if not user_id:
        # Fallback to user ID = 1 (admin)
        c.execute('SELECT id FROM users WHERE id = 1')
        u1 = c.fetchone()
        user_id = u1['id'] if u1 else 1

    if parsed_tx and parsed_tx['amount'] > 0:
        tx_type = parsed_tx['type']
        amount = parsed_tx['amount']
        category = parsed_tx['category']
        notes = parsed_tx['notes']

        # Get default wallet
        c.execute('SELECT id, name, balance FROM wallets WHERE user_id = ? AND is_default = 1', (user_id,))
        w_row = c.fetchone()
        if not w_row:
            c.execute('SELECT id, name, balance FROM wallets WHERE user_id = ? ORDER BY id ASC LIMIT 1', (user_id,))
            w_row = c.fetchone()
        if not w_row:
            c.execute('INSERT INTO wallets (user_id, name, wallet_type, balance, is_default) VALUES (?, "BCA Utama", "bank", 0.0, 1)', (user_id,))
            wallet_id = c.lastrowid
            wallet_name = 'BCA Utama'
            curr_balance = 0.0
        else:
            wallet_id = w_row['id']
            wallet_name = w_row['name']
            curr_balance = float(w_row['balance'])

        # Save transaction
        now_time = get_wib_now()
        c.execute('''
            INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
            VALUES (?, ?, ?, ?, ?, ?, 'telegram', ?)
        ''', (user_id, wallet_id, category, tx_type, amount, notes, now_time))
        
        # Mutate wallet balance
        if tx_type == 'pemasukan':
            c.execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', (amount, wallet_id))
            new_bal = curr_balance + amount
        else:
            c.execute('UPDATE wallets SET balance = balance - ? WHERE id = ?', (amount, wallet_id))
            new_bal = curr_balance - amount
        conn.commit()

        # Send confirmation
        reply = (
            f"✅ Transaksi Berhasil Dicatat!\n"
            f"├ Jenis: {tx_type.capitalize()}\n"
            f"├ Nominal: Rp {int(amount):,}\n"
            f"├ Kategori: {category}\n"
            f"├ Dompet: {wallet_name}\n"
            f"└ Sisa Saldo: Rp {int(new_bal):,}\n\n"
            f"Waktu: {now_time}"
        )
        send_telegram_reply(token, chat_id, reply)
    conn.close()
```

4. **Polling Worker Loop**:
```python
def telegram_polling_worker(token):
    print(f"[Telegram Polling] Memulai background long polling untuk token {token[:10]}...")
    # 1. Reset webhook to avoid 409 Conflict
    try:
        del_req = urllib.request.Request(f"https://api.telegram.org/bot{token}/deleteWebhook", method='POST')
        urllib.request.urlopen(del_req, timeout=10)
        print("[Telegram Polling] Webhook berhasil di-reset untuk mode polling.")
    except Exception as e:
        print(f"[Telegram Polling] Notice on deleteWebhook: {e}")

    offset = None
    while True:
        try:
            url = f"https://api.telegram.org/bot{token}/getUpdates?timeout=30"
            if offset is not None:
                url += f"&offset={offset}"
            req = urllib.request.Request(url, headers={'User-Agent': 'TataDana-Bot/1.0'})
            with urllib.request.urlopen(req, timeout=40) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('ok'):
                    for update in data.get('result', []):
                        up_id = update.get('update_id')
                        offset = up_id + 1
                        
                        # Idempotency check via telegram_updates table
                        conn = get_db()
                        c = conn.cursor()
                        c.execute('SELECT update_id FROM telegram_updates WHERE update_id = ?', (up_id,))
                        if c.fetchone():
                            conn.close()
                            continue
                        c.execute('INSERT INTO telegram_updates (update_id, processed_at) VALUES (?, ?)', (up_id, get_wib_now()))
                        conn.commit()
                        conn.close()

                        msg = update.get('message')
                        if msg:
                            handle_telegram_message(token, msg)
        except Exception as e:
            time.sleep(5)
```

5. **Start Thread in `__main__`**:
```python
if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    init_db()
    
    # Start Telegram Polling Thread
    if TELEGRAM_BOT_TOKEN:
        poll_thread = threading.Thread(target=telegram_polling_worker, args=(TELEGRAM_BOT_TOKEN,), daemon=True)
        poll_thread.start()
        print("[Telegram] Polling thread active.")
    ...
```

---

### 2.2 Blueprint for Worker 2: Frontend RBAC & Telegram UI Fixes (`index.html`)

#### A. Telegram UI Updates
1. **Line 587**:
   ```html
   <span class="text-cyan-300 font-semibold truncate" id="sidebarBotUsername">@tatadana_finance_bot</span>
   ```
2. **Line 593**:
   ```html
   <button type="button" onclick="window.open('https://t.me/tatadana_finance_bot', '_blank')" ...>
   ```
3. **Line 2265 (`copyBotUsername()`)**:
   ```javascript
   function copyBotUsername() {
     const uname = '@tatadana_finance_bot';
     ...
   }
   ```

#### B. Implement `applyRBAC(role)`
Add this function to JavaScript in `index.html`:
```javascript
function applyRBAC(role) {
  const r = (role || '').toLowerCase();
  const isAdmin = (r === 'superadmin' || r === 'admin');
  const adminNav = document.getElementById('dNav-adminPanel');
  const mAdminNav = document.getElementById('mNav-adminPanel');
  
  if (adminNav) {
    if (isAdmin) {
      adminNav.classList.remove('hidden');
    } else {
      adminNav.classList.add('hidden');
    }
  }
  if (mAdminNav) {
    if (isAdmin) {
      mAdminNav.classList.remove('hidden');
    } else {
      mAdminNav.classList.add('hidden');
    }
  }
}
```

#### C. Guard Navigation in `selectTab(tab)`
In `selectTab(tab)`:
1. **Update 403 guard**:
```javascript
    function selectTab(tab) {
      if (tab === 'adminPanel' && currentUserRole !== 'superadmin' && currentUserRole !== 'admin') {
        alert("403: Akses Ditolak — Halaman ini hanya untuk Superadmin.");
        selectTab('beranda');
        return;
      }
```
2. **Preserve `hidden` class in tab iteration**:
In the `tabs.forEach(t => ...)` loop:
```javascript
        if (nav) {
          if (t === 'adminPanel') {
            const isSuperadmin = (currentUserRole === 'superadmin' || currentUserRole === 'admin');
            nav.className = "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 bg-slate-900/60 border border-slate-800 hover:text-white hover:bg-slate-800 transition" + (isSuperadmin ? "" : " hidden");
          } else if (t === 'botSimulator') {
            nav.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-cyan-300 bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/40 transition";
          } else {
            nav.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition";
          }
        }
```

#### D. Wire `applyRBAC(role)` into Login and Role Switcher Handlers
1. In `saveSession(user)`:
   Add `applyRBAC(currentUserRole);`
2. In `applyUserToUI(user)`:
   Ensure `applyRBAC(user.role);` is called.
3. In `submitDedicatedLogin()`, `realAdminLoginSubmit()`, `realUserLoginSubmit()`, `loginSuperadminDirect()`:
   Ensure `applyRBAC(...)` is called immediately upon receiving the successful login response.
4. In `switchRoleToApprovedUser()`:
   ```javascript
   currentUserRole = 'user';
   applyRBAC('user');
   ```
5. In `switchRoleToSuperadmin()`:
   ```javascript
   currentUserRole = 'superadmin';
   applyRBAC('superadmin');
   ```
6. In `switchRoleToSpecificUser(userId)`:
   ```javascript
   currentUserRole = u.role || 'user';
   applyRBAC(currentUserRole);
   ```

---

## 3. Caveats & Edge Cases

1. **Telegram Webhook Conflict**:
   If a bot token previously had a webhook configured, calling `getUpdates` will throw HTTP 409 Conflict. The blueprint includes a call to `deleteWebhook` before starting the long poll to ensure smooth transition.
2. **Network Timeout vs Polling Timeout**:
   When using `getUpdates?timeout=30`, urllib socket timeout must be greater (e.g. 40 seconds) to avoid premature timeout exceptions on the client side.
3. **Daemon Thread Safety**:
   Running the polling loop with `daemon=True` ensures the thread terminates cleanly when the server process shuts down without hanging the terminal.
4. **SQLite Multi-Threading**:
   SQLite connections cannot be shared across threads. The polling worker must obtain a fresh connection via `get_db()` inside its thread.
5. **Class Reset in Frontend**:
   `selectTab` loops through all tabs and resets their `className`. If `adminPanel` does not conditionally include `hidden` based on the user's role, clicking any other tab would unhide the Superadmin Desk menu for regular users. The blueprint explicitly addresses this.

---

## 4. Conclusion

The architecture of TataDana Prime is modular and allows clean, decoupled implementation:
- **Worker 1** can implement backend Telegram polling and env loading in `server.py` and `.env` with 0 external dependencies.
- **Worker 2** can update Telegram bot username links and enforce RBAC dynamically in `index.html` without affecting backend functionality.
- All existing features (Dark Mode, Beranda top position, "Simpan" label, Executive charts, Multi-Wallet, Blue OTP) are well-isolated and will remain 100% regression-free.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Verify `.env` and Token Loading**:
   Inspect `.env` file content:
   `TELEGRAM_BOT_TOKEN=8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ`
2. **Verify Server Startup & Polling**:
   Start server `python server.py`. Output should show:
   `[Telegram Polling] Background polling thread dimulai.`
   GET `http://localhost:3000/api/admin/metrics` should return:
   `bot_username: "@tatadana_finance_bot"`
3. **Verify Telegram Webhook Endpoint Preservation**:
   POST `http://localhost:3000/api/telegram/webhook`:
   Payload: `{"update_id": 999901, "message": {"from": {"id": 1111}, "text": "Pengeluaran 35000 Transportasi"}}`
   Expect status 200, transaction recorded in SQLite, and wallet balance decreased.
4. **Verify Frontend Bot Links & RBAC in `index.html`**:
   - Grep for `lilybhotom_bot` or `lilybothom_bot` — should return 0 results.
   - Grep for `@tatadana_finance_bot` — should match sidebar username, link, and copy helper.
   - Test RBAC in browser / automated test:
     - Login as User (or switch to Naftaly): `#dNav-adminPanel` contains `hidden`.
     - Call `selectTab('adminPanel')`: alert displays "403: Akses Ditolak — Halaman ini hanya untuk Superadmin." and redirects to 'beranda'.
     - Switch to Superadmin: `#dNav-adminPanel` removes `hidden`.
     - Other tabs (Beranda, Transaksi, Laporan, Budget, Wallet, Settings) remain visible.
