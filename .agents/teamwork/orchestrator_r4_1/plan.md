# Orchestration Plan: TataDana Prime System Implementation & Verification

## Objectives
Implement and verify TataDana Prime system on localhost:3000 fulfilling requirements R1 through R7 with 5 specialist subagents:
1. Explorer (`teamwork_preview_explorer`): Gap analysis against existing project files.
2. Worker (`teamwork_preview_worker`): Implementation of R1-R7 and localhost:3000 server operation.
3. Test Writer (`teamwork_preview_test_writer`): E2E and integration test suite creation and execution.
4. Challenger (`teamwork_preview_challenger`): Adversarial and edge case verification, UI theme validation.
5. Forensic Auditor (`teamwork_preview_auditor`): Forensic integrity verification and zero-regression check.

## Detailed Requirements Breakdown
- **R1: Server & SPA Routes**: Backend on localhost:3000; all routes (/, /dashboard, /admin, /superadmin, /login, /approval, /settings) return SPA without 404.
- **R2: Superadmin & Role Protection**: Auto-fill `shopnoure1619@gmail.com` / `tugasbisnis16`, role SUPERADMIN, PRO VIP package; Quick Login button; route protection (/admin for superadmin/admin, others redirected to /dashboard).
- **R3: PRO VIP Export**: Export PDF and CSV unlocked in Mutasi & Laporan.
- **R4: Settings Profile Photo**: Local file upload (Data URL) + 4 preset avatars; saved in SQLite `users.avatar_url` and synced with sidebar.
- **R5: Registration Flow**: New user registered with `is_approved = 0` redirected to `/approval`.
- **R6: Blue & Cyan OTP Screen & Lanjutkan Flow**: `/approval` themed with cyan & electric blue:
  - Tata (white) Dana (cyan-400)
  - 6-digit OTP input with blue border (`border-2 border-blue-500 text-cyan-300`)
  - Live OTP Helper displaying active OTP with 'Isi Cepat' button
  - Phrase "secara realtime" is removed from entire view and widget
  - Main button 'Lanjutkan' with blue-cyan gradient directly verifies account, activates `is_approved = 1`, initializes wallets & real balance, applies user to UI, and immediately redirects to `/dashboard`
  - Automated tests in `test_lanjutkan.py` pass with exit code 0
  - `send_real_smtp_email` in `server.py`
  - Preserve other UI elements without unsolicited changes
- **R7: Persistent Telegram Webhook**: `/api/telegram/webhook` records persistent transaction in SQLite and mutates real wallet balance.

## Verification Gates
- Explorer report confirming current state and exact patch requirements.
- Worker report with server running on localhost:3000 and passing all unit checks.
- Test Writer report with full E2E automated test pass.
- Challenger report confirming adversarial edge cases and visual theme match.
- Forensic Auditor verdict CLEAN.
