# Project: TataDana Prime - Telegram Bot (@tatadana_finance_bot) & RBAC Integration

## Architecture
TataDana Prime is an executive personal finance dashboard and server running on Python (server.py) and SQLite (tatadana.db) with a single-page frontend (index.html).

### Key Components
1. **Backend Server (`server.py`)**:
   - HTTP server handling REST endpoints for auth, transactions, wallets, exports, telegram webhook.
   - Background thread for Telegram bot polling using standard library (`urllib.request`, `threading`, `json`, `sqlite3`).
   - Telegram Bot token loaded from `.env` via `TELEGRAM_BOT_TOKEN`.
   - Polling calls Telegram Bot API `getUpdates` with `timeout=30`, processes `/start` and transaction messages (`[jenis] [nominal] [kategori]`).
   - Match `telegram_user_id` or fallback to user ID 1 (admin default wallet), mutating wallet balance and creating transaction records.
   - Maintain compatibility with `/api/telegram/webhook`.

2. **Frontend Dashboard (`index.html`)**:
   - Single-page application with responsive dark theme, charts, modal workflows.
   - Telegram bot references updated to `@tatadana_finance_bot` and URL `https://t.me/tatadana_finance_bot`.
   - `id="sidebarBotUsername"` updated to `@tatadana_finance_bot`.
   - Sidebar menus for User Biasa:
     1. Beranda (`dNav-beranda`)
     2. Transaksi & Mutasi (`dNav-transactions`)
     3. Kalender (`dNav-kalender`)
     4. Tata AI (`dNav-tataAi` / `dNav-botSimulator`)
     5. Laporan Eksekutif (`dNav-reports`)
     6. Alokasi Budget (`dNav-budgets`)
     7. Multi-Wallet (`dNav-wallets`)
     8. Pengaturan Akun (`dNav-settings`)
   - Superadmin Desk (`dNav-adminPanel`):
     - RBAC implemented via `applyRBAC(role)`:
       - `role === 'user'` -> hide `#dNav-adminPanel` (add `hidden` class).
       - `role === 'superadmin'` or `role === 'admin'` -> show `#dNav-adminPanel` (remove `hidden` class).
   - Navigation guard in `selectTab('adminPanel')`: if non-admin, alert/notify 403 and redirect to 'beranda'.
   - Login response handler and Role Switcher call `applyRBAC(role)` immediately for dynamic toggle without page reload.
   - Fix styling so no empty blue pill/bar appears above Bot Finansial card.
   - All existing features preserved (Beranda top menu, Simpan label, executive reports charts, multi-wallet, blue OTP).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | .env Configuration | `TELEGRAM_BOT_TOKEN` in `.env` | M2 | R1 |
| 2 | Telegram Env Loader | `server.py` reads `TELEGRAM_BOT_TOKEN` from env | M2 | R1 |
| 3 | Telegram UI Update | `@tatadana_finance_bot` in sidebar, link `https://t.me/tatadana_finance_bot`, `sidebarBotUsername` | M3 | R1 |
| 4 | Telegram Polling Thread | Background thread long polling Telegram `getUpdates` (30s) using stdlib only | M2 | R2 |
| 5 | Telegram `/start` Handler | Greeting message with formatting instructions | M2 | R2 |
| 6 | Telegram Transaction Parser | Parse `[jenis] [nominal] [kategori]`, record transaction in SQLite, mutate wallet | M2 | R2 |
| 7 | User Identification & Fallback | Match `telegram_user_id` or fallback to admin (ID=1) default wallet | M2 | R2 |
| 8 | Webhook Compatibility | Preserve `/api/telegram/webhook` functionality | M2 | R2 |
| 9 | RBAC Sidebar Navigation | Hide `#dNav-adminPanel` for 'user', show for 'superadmin'/'admin' | M3 | R3 |
| 10 | RBAC `selectTab` Guard | Guard `selectTab('adminPanel')` with 403 redirect to beranda | M3 | R3 |
| 11 | `applyRBAC(role)` Function | Dynamic function toggling `hidden` on `#dNav-adminPanel` | M3 | R3 |
| 12 | Role Switcher Integration | Instant toggle of RBAC without page reload in Role Switcher | M3 | R4 |
| 13 | Login Handler RBAC Call | Call `applyRBAC(role)` upon successful login | M3 | R4 |
| 14 | Sidebar Menu Completeness | Beranda, Transaksi, Kalender, Tata AI, Laporan, Budget, Wallet, Settings | M3 | User Feedback |
| 15 | Layout Cleanup | Fix dNav-botSimulator empty pill/bar above card | M3 | User Feedback |
| 16 | Adversarial Review & Security | Verification of token security, role enforcement, code quality | M4 | Review |
| 17 | Verification & Test Suite | Automated end-to-end testing, server restart, live acceptance verification | M5 | AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Codebase Exploration | Investigate server.py, index.html, tatadana.db, telegram endpoints, auth/role | none | DONE |
| 2 | Backend Telegram Bot | .env, server.py env loading, polling thread, parser, wallet mutation | M1 | IN_PROGRESS |
| 3 | Frontend RBAC & Telegram UI | index.html bot username/url, applyRBAC, Kalender, Tata AI, 403 guard | M1 | IN_PROGRESS |
| 4 | Adversarial Review & Audit | Security audit, regression checks, role boundaries, token leaks | M2, M3 | PLANNED |
| 5 | Verification & Test Suite | Automated test script, server restart, localhost:3000 verification | M2, M3, M4 | PLANNED |

## Code Layout
- `server.py`: Backend Python server (port 3000)
- `index.html`: Main SPA frontend
- `.env`: Environment variables (contains `TELEGRAM_BOT_TOKEN`)
- `tatadana.db`: SQLite database
- `.agents/teamwork/`: Metadata and agent logs
