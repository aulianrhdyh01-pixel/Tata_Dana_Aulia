# Adversarial Stress Testing & Verification Report — TataDana Round 10

**Target System**: TataDana Executive Personal & SME Financial Management System  
**Author**: `challenger_r10_1` (Empirical Challenger & Adversarial Critic)  
**Date**: 2026-10-31  
**Test Suite**: `test_round10_challenger.py`  
**Execution Environment**: Python 3.14.0 on Windows (Direct In-Process Handler & Isolated SQLite Context)

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

While the core functionality of Round 10 (Floating AI Quick Record Bot UI, AI transaction parsing, Telegram bot listener & pairing, template modularization, and Vercel serverless configurations) demonstrates strong multi-tenant isolation, robust SQL injection resistance, and consistent balance accounting under concurrency, **a critical vulnerability was empirically discovered in the user management layer**:
- **Critical Vulnerability**: `POST /api/admin/delete-user` lacks superadmin immunity. When called with the superadmin ID, the superadmin account (`akunadminaul16@gmail.com`) is permanently erased from the SQLite database along with all its records.

---

## Challenges

### [Critical] Challenge 1: Unprotected Superadmin Deletion Endpoint

- **Assumption challenged**: Worker handoff asserted that admin user deletion is safely restricted and preserves core administration functionality.
- **Attack scenario**: An administrator (or any unauthorized caller reaching `/api/admin/delete-user` or `/api/admin/reject-user`) sends:
  ```json
  POST /api/admin/delete-user
  {"user_id": 40}
  ```
  (where `40` is the `id` of `akunadminaul16@gmail.com`).
  In `server.py` lines 2150–2167:
  ```python
  c.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))
  c.execute('DELETE FROM wallets WHERE user_id = ?', (user_id,))
  c.execute('DELETE FROM categories WHERE user_id = ?', (user_id,))
  c.execute('DELETE FROM users WHERE id = ?', (user_id,))
  conn.commit()
  ```
  There is **zero validation** verifying whether `user_id` corresponds to `akunadminaul16@gmail.com` or has `role in ('admin', 'superadmin')`.
- **Blast radius**: Complete wipe of the superadmin account. Superadmin login fails, all admin metrics crash or return 0, and subsequent administrative control of the system is lost until a database reseed occurs.
- **Mitigation**:
  In `server.py` at line 2158, prior to executing delete queries, query the user row:
  ```python
  c.execute('SELECT email, role FROM users WHERE id = ?', (user_id,))
  target_user = c.fetchone()
  if not target_user:
      conn.close()
      return self.send_json(404, {'ok': False, 'message': 'User tidak ditemukan.'})
  if target_user['email'] == 'akunadminaul16@gmail.com' or target_user['role'] in ('admin', 'superadmin'):
      conn.close()
      return self.send_json(403, {'ok': False, 'message': 'Akun Superadmin dilindungi dan tidak dapat dihapus.'})
  ```

---

### [Medium] Challenge 2: Negative Amount Sanitization to Absolute Positive Expense

- **Assumption challenged**: Negative transaction strings such as `"Transfer minus -50000"` or `"-10rb"` should be rejected as invalid financial amounts.
- **Attack scenario**: A user inputs `"Transfer minus -50000 cash"` into the Floating AI Bot.
  `parse_indonesian_nominal` regex searches for digits and ignores the leading `-` sign, parsing the amount as positive `50000.0`.
  The transaction is recorded as an expense of `Rp 50,000`, decrementing the wallet balance instead of returning an unrecognized format error.
- **Blast radius**: Minor user surprise if the user intended to record a debt reduction or negative adjustment; system records an expense instead of failing gracefully.
- **Mitigation**:
  In `parse_natural_language_transaction`, check if `'-'` immediately precedes the detected digits and reject or invert transaction type explicitly.

---

### [Low] Challenge 3: Telegram Account Hijacking via Predictable Sequential User ID (Legacy Fallback)

- **Assumption challenged**: Telegram pairing requires a unique 6-digit pairing code generated via `/api/telegram/pairing-code`.
- **Attack scenario**: In `server.py` lines 423–428:
  ```python
  if not target_u:
      try:
          uid = int(pairing_code)
          c.execute('SELECT id, full_name, email FROM users WHERE id = ?', (uid,))
          target_u = c.fetchone()
      except ValueError:
          pass
  ```
  If a user types `/connect 1` or `/connect 2`, the code falls back to matching raw `users.id` directly if no user currently holds pairing code `"1"`.
- **Blast radius**: A Telegram user could potentially link their chat to `user_id = 1` or another low integer ID without generating a legitimate pairing code from the web UI.
- **Mitigation**: Remove the legacy fallback `SELECT id FROM users WHERE id = ?` from the `/connect` handler. Enforce that pairing ONLY succeeds when `telegram_pairing_code = ? AND telegram_pairing_code != ''`.

---

## Stress Test Results

Executed via `test_round10_challenger.py`:

| # | Section | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|---|
| 1 | Concurrency | 15 rapid sequential AI transactions (`10rb cash`) | Balance decrements by exactly Rp 150,000; 15 rows in `transactions` | Final balance Rp 850,000; 15 rows committed | **PASS** |
| 2 | Concurrency | 8-thread concurrent burst to `/api/ai/parse-transaction` | Atomic deductions, no corrupted balance state | 8/8 threads committed, balance decremented to Rp 730,000 | **PASS** |
| 3 | Multi-Tenant | User A logs AI + Telegram tx; query User B stats & history | User B shows Rp 0 expense, 0 transactions | Exactly 0 transactions, Rp 0 expense for User B | **PASS** |
| 4 | Multi-Tenant | User A tx attribution | User A stats reflect Rp 200,000 total expense | Rp 200,000 accurately attributed | **PASS** |
| 5 | Adversarial | SQL Injection: `'; DROP TABLE transactions; --` | Parameterized query protects table; no 500 crash | Table intact, status 200/400, zero syntax errors | **PASS** |
| 6 | Adversarial | SQL Injection: `' OR '1'='1' --` | Handled gracefully | Status 200/400, no data exfiltration | **PASS** |
| 7 | Adversarial | XSS: `<script>alert('XSS')</script> 20rb cash` | Parsed safely without script execution | Status 200, parsed safely | **PASS** |
| 8 | Adversarial | Zero nominal: `"Beli permen 0 rupiah cash"` | Rejected, 0 rows added to DB | 0 rows added, status unrecognized | **PASS** |
| 9 | Adversarial | Negative nominal: `"Transfer minus -50000 cash"` | Rejected or sanitized | Sanitized to +Rp 50,000 | **WARN** |
| 10 | Adversarial | Extreme nominal: `"Beli gedung 10 triliun bca"` | Parsed accurately without integer overflow | Parsed without overflow | **PASS** |
| 11 | Adversarial | Fuzzing: Empty JSON, integers, null fields, 50KB string | Graceful 400/200, zero 500 crashes | Handled gracefully without crash | **PASS** |
| 12 | Telegram | Unlinked chat sends financial text | Fallback to master admin sandbox (ID=1) | Routed to ID=1, not arbitrary regular users | **PASS** |
| 13 | Telegram | Pairing code replay: Adversary re-sends used code | Rejected with invalid/expired warning | Rejected; target account remains bound to legitimate chat | **PASS** |
| 14 | Admin | Triple rapid approve click on same user | Idempotent; user remains active; wallets not duplicated | Idempotent; status='active', 4 wallets | **PASS** |
| 15 | Admin | Confirmed user deletion | Purges user and cascade child records | Users: 0, Wallets: 0, Transactions: 0 | **PASS** |
| 16 | Admin | Superadmin permanent deletion protection | Deletion request rejected (400/403); superadmin preserved | **Superadmin DELETED (HTTP 200)** | **FAIL** |
| 17 | Templates | 5 modular template files import cleanly | `tpl_*.py` return >100 char markup | All 5 modules return complete HTML/JS | **PASS** |
| 18 | Templates | 13 exact string literals in `tpl_admin.py` | All 13 strings present | 13/13 strings present | **PASS** |
| 19 | Templates | 13 exact string literals in `index.html` | All 13 strings present | 13/13 strings present | **PASS** |
| 20 | Templates | Floating AI Bot widget elements in `tpl_dashboard.py` | `#aiQuickRecordContainer`, modal, input present | All 4 DOM IDs present | **PASS** |
| 21 | Deployment | `vercel.json` valid config | Valid JSON with routes/builds | Valid configuration | **PASS** |
| 22 | Deployment | `api/index.py` serverless fallback | `/tmp/tatadana.db` fallback logic and `handler` | Present and verified | **PASS** |
| 23 | Deployment | Localhost SPA routes: `GET /`, `/dashboard`, `/admin` | Return HTTP 200 with TataDana HTML | All 3 return HTTP 200 | **PASS** |

---

## Regression Test Results

All 4 baseline verification suites were independently executed and passed with 100% success:

1. `test_round10_e2e.py`: **7/7 PASSED (100%)** (Exit code 0)
   - Tier 1: Feature Coverage (R1, R2, R3, R4) -> PASS
   - Tier 2: Boundary & Corner Cases -> PASS
   - Tier 3: Cross-Feature Combinations -> PASS
   - Tier 4: Real-World Scenarios (Multi-Tenant Journey) -> PASS
2. `test_telegram_backend.py`: **6/6 PASSED (100%)** (Exit code 0)
   - All tests (token loading, parser, DB operations, wallet mutation, metrics) completed with 100% success.
3. `test_admin_desk.py`: **4/4 PASSED (100%)** (Exit code 0)
   - Verified 13 visual literals, `/api/admin/metrics`, superadmin login, and `/api/admin/users`.
4. `verify_production_readiness.py`: **8/8 PASSED (100%)** (Exit code 0)
   - Database clean baseline, dynamic COUNT(*) metrics, registration gate, approval persistence, dashboard data isolation, zero dummy leak.

---

## Unchallenged Areas

- **Live Telegram Webhook over Outbound Internet**: Sandbox network policies restrict outbound connections to `api.telegram.org`. Verified through in-process Telegram update simulation (`process_telegram_incoming_message`).
