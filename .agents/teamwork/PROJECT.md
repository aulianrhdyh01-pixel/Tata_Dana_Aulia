# Project: TataDana - Executive Personal & SME Financial Management System (Round 10)

## Architecture
TataDana is an executive personal and SME financial management application built on a pure Python backend (`server.py`), persistent SQLite database (`tatadana.db`), and an interactive Single-Page Application interface modularized into Python templates (`tpl_landing.py`, `tpl_auth.py`, `tpl_dashboard.py`, `tpl_admin.py`, `tpl_script.py`) and static SPA (`index.html`).

### Core System Components:
1. **Database & Migration Layer (`tatadana.db`)**:
   - SQLite database supporting local execution (`./tatadana.db`) and serverless execution (`/tmp/tatadana.db` fallback).
   - Schema contains `users`, `wallets`, `categories`, `transactions`, `telegram_updates`, and `ai_settings`.
   - Migration adds `telegram_chat_id TEXT DEFAULT ''` to `users` table.
2. **Backend REST API Engine (`server.py`)**:
   - Runs on localhost:3000 (`PORT = 3000`).
   - Authentication & session management: Superadmin (`akunadminaul16@gmail.com` / `akuadmin123`), active and pending user logic.
   - New endpoint `POST /api/ai/parse-transaction`: natural language financial parser with AI provider + offline regex/keyword fallback, committing transaction to SQLite and mutating wallet balance.
   - Endpoint `POST /api/telegram/pairing-code`: generates unique numeric pairing code for Telegram account linking.
   - Telegram Bot listener: token `8957486024:AAGYrFIzM3QE8caHkkvpAQM1_otSg9BrtTQ`, handling `/connect <code>`, incoming financial text messages, AI parsing, transaction persistence, and Markdown confirmation.
   - Admin user management endpoints: `GET /api/admin/users`, `POST /api/admin/approve-user` (commits status 'active', does not remove row), `POST /api/admin/delete-user` (confirmed deletion).
3. **Template Modularization & Frontend SPA (`tpl_*.py`, `index.html`)**:
   - `tpl_landing.py`: Hero, feature showcase, pricing, demo simulator, and public footer.
   - `tpl_auth.py`: Login and registration modals, pending approval room with WhatsApp admin link (`082115624408`).
   - `tpl_dashboard.py`: KPI cards, wallet management, transactions, charts, and new **Floating AI Quick Record Bot** widget in bottom-right corner.
   - `tpl_admin.py`: Enterprise Superadmin Desk, retaining all registered users in table with real-time green `✓ Approved` badge and confirmed delete actions.
   - `tpl_script.py`: Core client-side JavaScript functions, DOM reactivity, and dynamic metrics recalculation.
4. **Vercel Serverless & GitHub Deployment Readiness**:
   - `vercel.json` routing rules for API and static templates.
   - `api/index.py` WSGI/ASGI/Serverless handler with automatic `/tmp/tatadana.db` fallback.
   - `requirements.txt` containing all necessary packages.
   - `.gitignore` excluding `.env`, `__pycache__`, and virtual environments.
   - VS Code Git terminal instructions in `GITHUB_DEPLOYMENT_GUIDE.md`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Codebase Survey & Architecture | Exhaustive survey of code, schema, templates, and interfaces | M1 | ORIGINAL_REQUEST |
| 2 | Comprehensive Test Suite Design | Opaque-box E2E test suite (Tiers 1-4) & regression unit tests | M2 | ORIGINAL_REQUEST |
| 3 | Floating AI Quick Record Bot UI | Floating button & popup chat widget in bottom-right of dashboard | M3 | R1 |
| 4 | AI Parsing Endpoint (`/api/ai/parse-transaction`) | Natural text parser with AI + fallback regex/keywords into structured JSON | M3 | R1 |
| 5 | Floating Bot SQLite Persistence & Auto-Update | Direct transaction insertion with `conn.commit()` and DOM stats auto-refresh | M3 | R1 |
| 6 | Database Migration for Telegram | Add `telegram_chat_id` column to `users` table | M3 | R2 |
| 7 | Telegram Account Pairing Card | Web Settings card generating pairing code for `/connect <code>` | M3 | R2 |
| 8 | Telegram Bot Listener & Parser | Bot listener (`8957486024:...`) parsing financial chats & persisting to SQLite | M3 | R2 |
| 9 | Telegram Markdown Response | Formatted Markdown confirmation message sent to user after transaction saved | M3 | R2 |
| 10 | Admin User Table Full Display | Retain all registered users (pending and active) in table | M3 | R3 |
| 11 | Admin 1-Click Approve with Badge | Single-click approve sets status='active', shows `✓ Approved` badge, hides button, row stays | M3 | R3 |
| 12 | Admin Confirmed User Deletion | Dedicated 'Hapus' button on each row with confirmation dialog | M3 | R3 |
| 13 | Template Modularization (`tpl_*.py`) | Extract components to `tpl_landing.py`, `tpl_auth.py`, `tpl_dashboard.py`, `tpl_admin.py`, `tpl_script.py` | M3 | R4 |
| 14 | Vercel Deployment Configuration | `vercel.json` and `api/index.py` serverless entrypoint | M3 | R4 |
| 15 | SQLite Serverless `/tmp` Fallback | Automatic fallback to `/tmp/tatadana.db` on Vercel; local `./tatadana.db` on port 3000 | M3 | R4 |
| 16 | Production Dependencies & .gitignore | Complete `requirements.txt` and secure `.gitignore` | M3 | R4 |
| 17 | Static Asset Routing & Visual Consistency | Orange-white palette, Plus Jakarta Sans, and reliable CDN asset loading | M3 | R4 |
| 18 | VS Code Git Deployment Guide | Clear command-line instructions for pushing to GitHub | M3 | R4 |
| 19 | Adversarial Testing & Verification | Concurrency, edge cases, cross-user isolation, error recovery | M4 | Quality |
| 20 | Forensic Integrity Audit | Static and runtime inspection for genuine logic, zero dummy/mock data | M5 | Integrity |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Survey & Technical Investigation | Complete codebase inspection, schema analysis, and architectural design | none | DONE |
| 2 | Comprehensive Test Suite Creation | Design & implement opaque-box E2E tests (`test_round10_e2e.py`) & unit tests | M1 | IN_PROGRESS |
| 3 | Core Implementation & Modularization | Implement R1, R2, R3, R4 in backend, templates, frontend, and deployment configs | M1 | PENDING |
| 4 | Adversarial Testing & Verification | Empirical verification with stress harness, edge cases, and regression suite | M2, M3 | PENDING |
| 5 | Forensic Integrity Audit | Systematic integrity audit (zero mocks, genuine commits, real AI parser & telegram) | M4 | PENDING |

---

## Interface Contracts

### 1. AI Quick Record Parser Endpoint
- **Route**: `POST /api/ai/parse-transaction`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "text": "Bensin motor 25rb cash",
    "user_id": 1
  }
  ```
- **Response Body**:
  ```json
  {
    "status": "success",
    "data": {
      "type": "expense",
      "amount": 25000,
      "category": "Transport",
      "wallet": "Cash",
      "description": "Bensin motor"
    },
    "transaction_id": 105,
    "message": "Transaksi berhasil dicatat!"
  }
  ```

### 2. Telegram Account Pairing Endpoint
- **Route**: `POST /api/telegram/pairing-code`
- **Request Body**: `{"user_id": 1}`
- **Response Body**:
  ```json
  {
    "status": "success",
    "pairing_code": "489201",
    "bot_username": "tatadana_finance_bot",
    "bot_link": "https://t.me/tatadana_finance_bot?start=connect_489201"
  }
  ```

### 3. Admin Approval & Deletion
- **Approval Route**: `POST /api/admin/approve-user` (or `POST /api/admin/approve`)
  - **Body**: `{"user_id": 2}`
  - **Action**: Updates `is_approved = 1, status = 'active'` with `conn.commit()`. Returns `{status: "success", message: "User approved"}`.
  - **UI**: Badge updates to green `✓ Approved`, approve button hidden, row remains visible.
- **Deletion Route**: `POST /api/admin/delete-user` (or `POST /api/admin/reject-user`)
  - **Body**: `{"user_id": 2}`
  - **Action**: Deletes user and associated records upon confirmation. Returns `{status: "success", message: "User deleted"}`.

### 4. Template Modularization Contract
- `tpl_landing.py`: defines `def get_landing_html() -> str`
- `tpl_auth.py`: defines `def get_auth_html() -> str`
- `tpl_dashboard.py`: defines `def get_dashboard_html() -> str` (including Floating AI Bot widget & Telegram pairing card)
- `tpl_admin.py`: defines `def get_admin_html() -> str` (including all registered users table with badge and delete button)
- `tpl_script.py`: defines `def get_client_script() -> str` (including `toggleAiQuickBot()`, `sendAiQuickMessage()`, `loadAdminUsers()`, `deleteUser()`)
- `server.py`: imports all five modules, renders complete SPA on `GET /`, `GET /admin`, `GET /dashboard`, and maintains consistency with `index.html`.

---

## Code Layout
- `server.py`: Main backend REST API server running on port 3000
- `tpl_landing.py`: Landing page template module
- `tpl_auth.py`: Login, register, and approval room template module
- `tpl_dashboard.py`: Dashboard template module with Floating AI Quick Record Bot widget
- `tpl_admin.py`: Admin desk template module with modified user management table
- `tpl_script.py`: Frontend script module with dynamic auto-update functions
- `index.html`: Static SPA frontend matching template modules
- `tatadana.db`: SQLite database
- `vercel.json`: Vercel deployment configuration
- `api/index.py`: Vercel serverless entrypoint with `/tmp/tatadana.db` fallback
- `requirements.txt`: Python package dependencies
- `.gitignore`: Git exclusion rules
- `GITHUB_DEPLOYMENT_GUIDE.md`: Step-by-step Git commands guide for GitHub push
- `test_round10_e2e.py`: Automated E2E test verification suite
- `test_api.py`, `test_admin_desk.py`, `test_telegram_backend.py`, `verify_production_readiness.py`: Regression test suites
- `.agents/teamwork/`: Orchestrator metadata, agent reports, and state tracking
