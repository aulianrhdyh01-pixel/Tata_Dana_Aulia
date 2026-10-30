# Progress — explorer_r9_1

- Last visited: 2026-10-30T16:26:00Z
- Status: Investigation completed for R1 to R6. Writing handoff.md.
- Key findings:
  1. tatadana.db currently has 73 users, 257 transactions, 164 wallets, 354 categories.
  2. server.py init_db() automatically seeds Naftaly, Budi, Citra, Dimas, mock wallets, and sample transactions on every restart.
  3. /api/dashboard/stats hardcodes fallback total_budget = 6250000.0 instead of 0.0, and returns keys different from index.html (total_saldo vs net_balance).
  4. /api/admin/metrics already executes SQLite COUNT(*), but index.html has hardcoded HTML defaults (5 Akun, 3 Pendaftar, 3).
  5. approveDirectUser in index.html lacks button disable, and does not immediately remove DOM row on HTTP 200 OK.
  6. /api/admin/approve alias needed alongside /api/admin/approve-user; status column and 'active' status need explicit handling with conn.commit().
  7. /api/auth/login needs status validation to accept 'active' status or is_approved=1, and role 'admin' for superadmin.
