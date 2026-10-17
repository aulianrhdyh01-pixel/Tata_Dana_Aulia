# Handoff Report: Codebase Survey & Implementation Blueprint for TataDana Prime

**Author**: `explorer_1` (Codebase Researcher)  
**Date**: 2026-10-17  
**Project Root**: `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`  
**Target Milestone**: Milestone 1 & 2 Implementation Blueprint (Requirements 1 - 4)

---

## 1. Observation

### General Architecture
- **Runtime**: Python 3 standard library HTTP server (`server.py`, port 3000) serving a Single Page Application (SPA) in `index.html` and REST APIs backed by SQLite (`tatadana.db`).
- **Startup Script**: `run_localhost.bat` executing `python server.py`.
- **UI Framework**: Tailwind CSS loaded via CDN (`https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js`), custom fonts, and vanilla JavaScript.
- **Strict Guidelines (`GEMINI.md`)**:
  - Pitch black theme (`#000000`) with electric blue (`#0284c7`, `#38bdf8`), cyan, and emerald accents.
  - Zero Dummy System: all metrics and entities must persist directly to SQLite (`tatadana.db`).

---

### Requirement 1: Navigasi & Menu "Beranda" (Sidebar)
1. **Sidebar Navigation Elements (`index.html:528-566`)**:
   - The desktop sidebar navigation `<nav class="p-3 space-y-1 text-xs font-medium">` has an existing hidden button at line 530:
     ```html
     <!-- Hidden helper for beranda -->
     <button onclick="selectTab('beranda')" id="dNav-beranda" class="hidden"></button>
     ```
   - Immediately below it is `dNav-transaksi` at line 532:
     ```html
     <button onclick="selectTab('transaksi')" id="dNav-transaksi" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition">
       <span class="text-sm">📄</span>
       <span>Transaksi & Mutasi</span>
     </button>
     ```
2. **Mobile Navigation (`index.html:1125-1128`)**:
   - Mobile navigation already contains a visible `mNav-beranda`:
     ```html
     <button onclick="selectTab('beranda')" id="mNav-beranda" class="flex flex-col items-center py-1 px-2 rounded-lg text-cyan-400 font-medium">
     ```
3. **Tab Controller & SPA Routing (`index.html:1361-1495, 2886-2945`)**:
   - SPA route `/dashboard` (lines 1449-1470) already invokes `selectTab('beranda')` and `loadRealDashboardData()`.
   - `selectTab(tab)` in lines 2886-2945 controls visibility for tabs:
     `['beranda', 'transaksi', 'laporan', 'budget', 'wallet', 'botSimulator', 'settings', 'adminPanel']`.
   - Active tab styles are applied to `dNav-${tab}` (`bg-blue-600 text-white font-semibold`).
4. **Beranda View (`#dTab-beranda`, `index.html:661-712`)**:
   - Contains 4 metric cards:
     - `#valTotalSaldo`: Total Saldo Riil
     - `#valPemasukan`: Pemasukan Riil
     - `#valPengeluaran`: Pengeluaran Riil
     - `#valBudgetTersisa`: Budget Tersisa Riil (with `#valBudgetBar` progress bar)
   - Contains Table: `Riwayat Transaksi Riil (SQLite)` (`#homeTxTableBody`).
   - Lacks a dedicated visual "Quick Shortcuts" button block.

---

### Requirement 2: Halaman "Transaksi & Mutasi"
1. **Form "Catat Transaksi Riil Baru" (`index.html:717-756`)**:
   - Inputs present:
     - `#formTxType` (line 722): `<select>` (`pengeluaran`, `pemasukan`)
     - `#formTxAmount` (line 729): `<input type="number">`
     - `#formTxCategory` (line 733): `<select>` (Categories)
     - `#formTxWallet` (line 744): `<select>` (Dompet, dynamically populated)
     - `#formTxNotes` (line 750): `<input type="text">`
   - Submit button verbatim at lines 752-754:
     ```html
     <button onclick="realSaveTransaction()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition">
       Simpan ke Database SQLite
     </button>
     ```
2. **Transaction Save Function (`index.html:2790-2828`)**:
   - `realSaveTransaction()` sends `POST /api/transactions` with payload `{ user_id, wallet_id, transaction_type, amount, category_name, notes, source: 'web' }`.
   - On success, it clears inputs and invokes `loadRealDashboardData()`.
3. **Backend Save Endpoint (`server.py:864-964`)**:
   - Inserts row into `transactions` table.
   - Updates `wallets` table in SQLite:
     - If `pemasukan`: `UPDATE wallets SET balance = balance + ? WHERE id = ?`
     - If `pengeluaran`: `UPDATE wallets SET balance = balance - ? WHERE id = ?`
   - Commits changes and returns JSON response with `new_balance`.
4. **Table Update Logic (`index.html:2714-2753`)**:
   - `loadRealDashboardData()` fetches `GET /api/transactions?user_id=...` and renders:
     - Top 5 items in `#homeTxTableBody` (Beranda).
     - All items in `#fullTxTableBody` ("Daftar Transaksi Lengkap" in Transaksi & Mutasi).

---

### Requirement 3: Halaman "Laporan Eksekutif"
1. **Current State (`index.html:792-816`)**:
   - `#dTab-laporan` only contains a basic card with title `Mutasi & Laporan Keuangan Riil`, a description, and two export buttons:
     - Line 803: `button id="btnExportExcel"` with `onclick="downloadRealReport('excel')"`
     - Line 806: `button id="btnExportPdf"` with `onclick="generatePdfReport()"`
   - There are **no visual charts, no metric summary cards, and no period filters**.
2. **Chart Library Status**:
   - Ripgrep search across the entire project for `chart` or `chart.js` yielded 0 results in `index.html`.
   - Chart.js is not loaded.
3. **Data Availability**:
   - The endpoint `GET /api/transactions?user_id=...` (`server.py:451-468`) returns all user transactions with timestamps formatted as `YYYY-MM-DD HH:MM:SS WIB`.
   - This provides all required data to compute:
     - Income vs Expense over time.
     - Expense breakdown by category.
     - Summary metrics (Total Income, Total Expense, Net Cashflow, Savings Ratio).
     - Period filtering (This Month, Last 30 Days, All Time).

---

### Requirement 4: Halaman & Fitur "Multi-Wallet" (Full Functional, SQLite Persistent)
1. **Current State (`index.html:828-836`)**:
   - Container `#dTab-wallet` currently consists only of:
     ```html
     <div id="dTab-wallet" class="hidden">
       <div class="bg-slate-950 border border-blue-900/60 rounded-3xl p-6 space-y-4">
         <h3 class="text-sm font-bold text-white">Dompet Multi-Wallet Riil</h3>
         <div id="realWalletGrid" class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
           <!-- Dynamic from SQLite -->
         </div>
       </div>
     </div>
     ```
   - No modal/form to create a new wallet exists in the UI.
   - When `wallets` array is empty, `#realWalletGrid` is rendered blank (`innerHTML = ''`), without any empty-state card or CTA button.
2. **Wallet Rendering Logic (`index.html:2691-2712`)**:
   - `loadRealDashboardData()` fetches `GET /api/wallets?user_id=...`.
   - For each wallet, it adds an `<option>` to `#formTxWallet` and creates a card in `#realWalletGrid`.
   - There is no button on the wallet card to set it as default/active.
3. **Header Active Wallet Status (`index.html:641`)**:
   - Header contains:
     ```html
     <span class="text-xs text-slate-400 hidden sm:inline">Dompet Aktif: <b class="text-cyan-400" id="topActiveWallet">BCA Utama</b></span>
     ```
   - `#topActiveWallet` is hardcoded to "BCA Utama" and is **never updated** dynamically by JavaScript in `loadRealDashboardData()`.
4. **Backend Wallet Endpoints (`server.py`)**:
   - Table schema (`server.py:113`): `wallets (id INTEGER PK, user_id INTEGER, name TEXT, wallet_type TEXT, balance REAL, is_default INTEGER)`.
   - `GET /api/wallets?user_id=...` (`server.py:471`): returns wallets ordered by `is_default DESC, id ASC`.
   - `POST /api/wallets` (`server.py:966`): creates new wallet with `{ user_id, name, wallet_type, balance, is_default }`.
   - **Missing Endpoint**: There is currently no `POST /api/wallets/set-default` endpoint to switch the default/active wallet for a user in SQLite.
   - Fallback in `server.py:924`: If `wallet_id` is missing and user has 0 wallets, `server.py` auto-seeds "BCA Utama". This should instead prompt the user or handle empty state cleanly.

---

## 2. Logic Chain

### For Requirement 1 (Beranda Sidebar Navigation & Overview)
- **Step 1.1**: `dNav-beranda` is currently present at line 530 directly above `dNav-transaksi` (line 532) in `index.html`, but has class `hidden`.
- **Step 1.2**: Removing `class="hidden"` and adding standard active/inactive sidebar classes (`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition`) with a home icon (`🏠`) makes "Beranda" the topmost visible menu item.
- **Step 1.3**: The SPA routing function `handleRoute('/dashboard')` (line 1466) already calls `selectTab('beranda')`. Thus, clicking "Beranda" or navigating to `/dashboard` seamlessly activates `dTab-beranda`.
- **Step 1.4**: Adding a "Quick Shortcuts" container with 4 action buttons (`+ Catat Transaksi`, `📊 Analitik & Laporan`, `💳 Kelola Multi-Wallet`, `⚙️ Pengaturan Akun`) inside `dTab-beranda` satisfies the requirement for "quick shortcuts" alongside the existing 4 stat cards and recent transactions table.

### For Requirement 2 (Transaksi Submit Button Text)
- **Step 2.1**: The submit button in form "Catat Transaksi Riil Baru" is located at line 752 with text `Simpan ke Database SQLite`.
- **Step 2.2**: Changing the text content to `Simpan` changes only the visual label while leaving the `onclick="realSaveTransaction()"` handler, form validation, `/api/transactions` POST request, and `loadRealDashboardData()` table updates 100% intact.

### For Requirement 3 (Laporan Eksekutif Visual Analytics)
- **Step 3.1**: To support high-performance, dark-themed charts without local bundle bloat, loading Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js`) in `<head>` is optimal and reliable.
- **Step 3.2**: In `dTab-laporan`, retain the existing export header and buttons (`#btnExportExcel` and `#btnExportPdf`).
- **Step 3.3**: Insert a Period Filter toolbar with 3 interactive toggle buttons: `Bulan Ini`, `30 Hari Terakhir`, and `Semua Waktu`.
- **Step 3.4**: Insert 4 Summary Metric Cards (Total Income, Total Expense, Net Cashflow, Savings Ratio) updated dynamically based on the active period filter.
- **Step 3.5**: Insert a 2-column chart grid:
  - Column 1: Bar chart comparing Income vs Expense over weekly/monthly intervals.
  - Column 2: Donut chart showing Expense category distribution with color coding.
- **Step 3.6**: Create JavaScript function `renderExecutiveReport(period)` that filters transactions from `dataTx.transactions`, computes metrics, updates cards, and instantiates/updates Chart.js canvas instances.

### For Requirement 4 (Multi-Wallet Dynamic & Persistent)
- **Step 4.1**: In `server.py`, implement `POST /api/wallets/set-default`:
  - Accepts `{ user_id, wallet_id }`.
  - Executes `UPDATE wallets SET is_default = 0 WHERE user_id = ?` followed by `UPDATE wallets SET is_default = 1 WHERE id = ? AND user_id = ?`.
  - Returns `{ ok: true, wallet_id, message }`.
- **Step 4.2**: In `server.py:966` (`POST /api/wallets`), if the user currently has 0 wallets, automatically set `is_default = 1` for the first created wallet.
- **Step 4.3**: In `index.html` within `dTab-wallet`:
  - Add page header with `+ Tambah Wallet Baru` button.
  - When `dataWallets.wallets.length === 0`, render a clean empty state card with CTA button `+ Tambah Wallet Pertama Anda`.
  - When wallets exist, render cards showing wallet name, account type badge, balance (Rp), and an action button (`Jadikan Aktif` or `⭐ Dompet Aktif`).
- **Step 4.4**: Create modal dialog `#modalAddWallet` with fields:
  - Nama Dompet (text)
  - Jenis Akun (select: Bank, E-Wallet, Tunai)
  - Saldo Awal (number)
  - Jadikan Dompet Aktif (checkbox)
  - Save button calling `saveNewWallet()`.
- **Step 4.5**: In `loadRealDashboardData()`:
  - Update `#topActiveWallet` in the top header with the name of the wallet where `is_default === 1` (or "Belum Ada" if none).
  - Populate `#formTxWallet` dropdown with all user wallets, setting the default wallet as selected. If empty, show disabled placeholder.
- **Step 4.6**: When a transaction is submitted via `realSaveTransaction()`, SQLite balance mutation (`server.py:945-947`) and subsequent `loadRealDashboardData()` execution will immediately update wallet card balances and header status.

---

## 3. Caveats

1. **Active Localhost Server**:
   - The backend server operates on `http://localhost:3000`. Do not change the port or break existing REST contracts expected by `test_api.py`, `test_lanjutkan.py`, and `test_admin_desk.py`.
2. **CDN Accessibility**:
   - Chart.js CDN (`https://cdn.jsdelivr.net/npm/chart.js`) requires client internet access when viewing in the browser. In offline mode, charts should gracefully handle missing `window.Chart` with a fallback message without throwing uncaught errors.
3. **Database Migration Safety**:
   - SQLite table `wallets` already contains `id`, `user_id`, `name`, `wallet_type`, `balance`, `is_default`. No schema alteration (`ALTER TABLE`) is required for `wallets`, preserving database compatibility.
4. **Starter Plan Limitation**:
   - `server.py` enforces a 50 transactions/month limit for Starter plan users. Ensure test users or admin users use `PRO VIP` or stay within budget limits.

---

## 4. Conclusion & Implementation Blueprint

### Detailed File Changes Plan

#### A. Backend Changes: `server.py`
1. **Add Endpoint `POST /api/wallets/set-default`** (around line 996):
   ```python
   # API: Set Wallet as Default / Active
   elif path == '/api/wallets/set-default' or path == '/api/wallets/default':
       try:
           user_id = int(body.get('user_id', 1))
           wallet_id = int(body.get('wallet_id', 0))
       except (ValueError, TypeError):
           return self.send_json(400, {'ok': False, 'message': 'user_id dan wallet_id tidak valid.'})

       conn = get_db()
       c = conn.cursor()
       c.execute('SELECT id, name FROM wallets WHERE id = ? AND user_id = ?', (wallet_id, user_id))
       w_row = c.fetchone()
       if not w_row:
           conn.close()
           return self.send_json(404, {'ok': False, 'message': 'Dompet tidak ditemukan.'})

       c.execute('UPDATE wallets SET is_default = 0 WHERE user_id = ?', (user_id,))
       c.execute('UPDATE wallets SET is_default = 1 WHERE id = ? AND user_id = ?', (wallet_id, user_id))
       conn.commit()
       conn.close()
       return self.send_json(200, {
           'ok': True,
           'wallet_id': wallet_id,
           'wallet_name': w_row['name'],
           'message': f'Dompet {w_row["name"]} berhasil dijadikan dompet aktif.'
       })
   ```
2. **Auto-Default First Wallet in `POST /api/wallets`** (line 984):
   - If user has 0 wallets in database: force `is_default = 1`.

---

#### B. Frontend Changes: `index.html`
1. **Head Section (Line 7)**:
   - Add Chart.js script:
     ```html
     <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
     ```
2. **Requirement 1 — Sidebar Navigation (Lines 528-535)**:
   - Unhide and style `dNav-beranda`:
     ```html
     <button onclick="selectTab('beranda')" id="dNav-beranda" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition">
       <span class="text-sm">🏠</span>
       <span>Beranda</span>
     </button>
     ```
3. **Requirement 1 — Quick Shortcuts in `dTab-beranda` (Lines 686-688)**:
   - Add Quick Shortcuts Card Grid:
     ```html
     <!-- Quick Shortcuts Section -->
     <div class="bg-slate-950 border border-blue-900/40 rounded-2xl p-4">
       <div class="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider font-mono">Aksi Cepat & Navigasi</div>
       <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
         <button onclick="selectTab('transaksi')" class="p-3 bg-slate-900/80 hover:bg-blue-900/30 border border-blue-900/40 hover:border-cyan-400 rounded-xl text-left transition group">
           <div class="text-lg mb-1 group-hover:scale-110 transition-transform">➕</div>
           <div class="font-bold text-xs text-white">Catat Transaksi</div>
           <div class="text-[10px] text-slate-400">Mutasi baru</div>
         </button>
         <button onclick="selectTab('laporan')" class="p-3 bg-slate-900/80 hover:bg-blue-900/30 border border-blue-900/40 hover:border-cyan-400 rounded-xl text-left transition group">
           <div class="text-lg mb-1 group-hover:scale-110 transition-transform">📊</div>
           <div class="font-bold text-xs text-white">Laporan Eksekutif</div>
           <div class="text-[10px] text-slate-400">Analitik visual</div>
         </button>
         <button onclick="selectTab('wallet')" class="p-3 bg-slate-900/80 hover:bg-blue-900/30 border border-blue-900/40 hover:border-cyan-400 rounded-xl text-left transition group">
           <div class="text-lg mb-1 group-hover:scale-110 transition-transform">💳</div>
           <div class="font-bold text-xs text-white">Multi-Wallet</div>
           <div class="text-[10px] text-slate-400">Kelola dompet</div>
         </button>
         <button onclick="selectTab('settings')" class="p-3 bg-slate-900/80 hover:bg-blue-900/30 border border-blue-900/40 hover:border-cyan-400 rounded-xl text-left transition group">
           <div class="text-lg mb-1 group-hover:scale-110 transition-transform">⚙️</div>
           <div class="font-bold text-xs text-white">Pengaturan</div>
           <div class="text-[10px] text-slate-400">Profil & akun</div>
         </button>
       </div>
     </div>
     ```
4. **Requirement 2 — Transaksi Submit Button (Line 752)**:
   - Change button label:
     ```html
     <button onclick="realSaveTransaction()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition">
       Simpan
     </button>
     ```
5. **Requirement 3 — Laporan Eksekutif Section (`dTab-laporan`, Lines 792-816)**:
   - Overhaul `dTab-laporan` to include:
     - Header bar with title, status, and retained Export buttons (`#btnExportExcel`, `#btnExportPdf`).
     - Period filter bar:
       ```html
       <div class="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-blue-900/40 w-fit">
         <button onclick="setReportPeriod('this_month')" id="btnPeriod-this_month" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white transition">Bulan Ini</button>
         <button onclick="setReportPeriod('last_30_days')" id="btnPeriod-last_30_days" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition">30 Hari Terakhir</button>
         <button onclick="setReportPeriod('all_time')" id="btnPeriod-all_time" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition">Semua Waktu</button>
       </div>
       ```
     - 4 Summary Metric Cards (Total Income, Total Expense, Net Cashflow, Savings Ratio).
     - 2-Column Visual Charts:
       - Chart 1: Bar Chart (`<canvas id="chartIncomeExpenseTrend"></canvas>`).
       - Chart 2: Donut Chart (`<canvas id="chartCategoryBreakdown"></canvas>`).
6. **Requirement 4 — Multi-Wallet Section (`dTab-wallet`, Lines 828-836)**:
   - Overhaul `dTab-wallet` to include:
     - Header with title and `+ Tambah Wallet Baru` button (`onclick="openWalletModal()"`).
     - Grid container `#realWalletGrid` capable of rendering empty state with CTA button or populated cards with `Jadikan Aktif` buttons.
   - Add Modal Dialog `#modalAddWallet`:
     - Inputs: `#walletModalName`, `#walletModalType` (`bank`, `ewallet`, `cash`), `#walletModalBalance`, `#walletModalDefault` (checkbox).
     - Buttons: `Batal` and `Simpan Dompet` (`onclick="saveNewWallet()"`).
7. **Requirement 4 — Header Synchronization (`topActiveWallet`)**:
   - In `loadRealDashboardData()`:
     ```javascript
     const activeWallet = (dataWallets.wallets || []).find(w => w.is_default === 1);
     const topEl = document.getElementById('topActiveWallet');
     if (topEl) {
       topEl.innerText = activeWallet ? activeWallet.name : (dataWallets.wallets.length > 0 ? dataWallets.wallets[0].name : 'Belum Ada');
     }
     ```

---

## 5. Verification Method

### Step 1: Code Structure & Layout Verification
- Inspect `index.html` lines 528-540 to verify `dNav-beranda` is the topmost element in `<nav>` without `hidden` class.
- Inspect `index.html` around line 752 to confirm the button text is exactly `Simpan`.
- Inspect `index.html` in `dTab-laporan` to confirm Chart.js canvases, metric cards, period filter buttons, and export buttons are present.
- Inspect `index.html` in `dTab-wallet` to confirm the add wallet modal and empty state markup.

### Step 2: API & Database Persistence Test
Run automated API verification using Python:
1. `GET /api/wallets?user_id=1`: Returns list of wallets.
2. `POST /api/wallets`: Creates a new wallet (e.g. "BCA Bisnis", type "bank", balance 5000000).
3. `POST /api/wallets/set-default`: Sets new wallet as active; verify `is_default == 1` in SQLite.
4. `POST /api/transactions`: Creates transaction linked to wallet; verify wallet balance updates in SQLite.
5. `GET /api/transactions?user_id=1`: Confirms transaction is saved.

### Step 3: Run Existing Regression Test Suite
Execute existing project tests to ensure zero regressions:
```powershell
python test_admin_desk.py
python test_lanjutkan.py
python test_api.py
```
Expected result: All tests pass with exit code 0.

### Invalidation Conditions
- If `dNav-beranda` is placed below `dNav-transaksi` instead of above it.
- If the submit button label remains `Simpan ke Database SQLite` instead of `Simpan`.
- If Chart.js fails to initialize or period filter throws errors.
- If creating a wallet does not persist to SQLite or does not update `#formTxWallet` dropdown and `#topActiveWallet` in real time.
