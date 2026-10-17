# Project: TataDana Real Persistent System

## Architecture
- **Runtime**: Standalone Python HTTP Server (server.py) on localhost:3000
- **Database**: Persistent SQLite (`tatadana.db`)
- **Frontend**: Full client interface (`index.html`) communicating via REST endpoints
- **Auth**: Real credential authentication and role-based access (Superadmin vs Regular User)
- **Timezone**: Asia/Jakarta (WIB, UTC+7)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SQLite Persistent Database | Persistent tatadana.db with users, wallets, categories, transactions | M1 | R1 |
| 2 | Superadmin Credential Init | Seed/validate shopnoure1619@gmail.com with password 160017 | M2 | R1 |
| 3 | User Registration (Pending) | New user registration saved with is_approved = 0 | M2 | R1 |
| 4 | Admin Approval Workflow | List all users and approve user (is_approved = 1) + seed wallets/categories | M2 | R2 |
| 5 | Real Transactions & Wallets | Record income/expense, compute live balance on wallets, stats | M3 | R3 |
| 6 | Real CSV Export Generator | On-demand CSV export at /api/export with actual transactions | M4 | R3 |
| 7 | Comprehensive E2E Verification | Automated acceptance tests & integrity audit | M5 | AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend & Persistent SQLite DB | server.py DB setup, schema tables, persistent storage | none | DONE |
| 2 | Admin Auth & Approval Workflow | Login shopnoure1619@gmail.com / 160017, register, approval | M1 | DONE |
| 3 | Real Transactions & Balances | Transactions, wallet balances, dashboard stats, categories | M1 | DONE |
| 4 | Real Data Export Generator | /api/export CSV with real transactions from DB | M1, M3 | DONE |
| 5 | E2E Acceptance & Forensic Audit | Full test suite against acceptance criteria & no mock check | M1-M4 | DONE |

## Interface Contracts
### Auth & Admin API
- POST `/api/auth/login`: `{email, password}` -> `{ok: true, role: 'superadmin', token, user}` (401 on invalid credentials)
- POST `/api/auth/register`: `{email, password, full_name, phone_number}` -> `{ok: true, user_id, is_approved: 0}`
- GET `/api/admin/users`: -> `{ok: true, users: [...]}`
- POST `/api/admin/approve-user`: `{user_id}` -> `{ok: true, is_approved: 1, message}`

### Transactions & Stats API
- GET `/api/dashboard/stats?user_id=X`: -> `{ok: true, total_saldo, pemasukan, pengeluaran, budget_tersisa}`
- GET `/api/wallets?user_id=X`: -> `{ok: true, wallets: [...]}`
- GET `/api/transactions?user_id=X`: -> `{ok: true, transactions: [...]}`
- POST `/api/transactions`: `{user_id, wallet_id, category_name, transaction_type, amount, notes}` -> `{ok: true, message, new_balance}`
- POST `/api/wallets/transfer`: `{user_id, from_wallet_id, to_wallet_id, amount}` -> `{ok: true, message}`
- GET `/api/export?user_id=X`: -> RFC 4180 CSV binary stream (`attachment; filename="Laporan_Keuangan_TataDana.csv"`)
