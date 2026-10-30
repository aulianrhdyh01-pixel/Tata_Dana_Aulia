# Round 8 Orchestration Plan — TataDana

## Goal
Deliver complete end-to-end functionality for TataDana per Round 8 requirements:
1. Modern clean orange-white visual theme (not dark mode), geometric fonts, remove "Masuk Admin" button from public view, unified login.
2. Complete Supabase schema in `supabase/migrations`, auth registration with Name, Email, Phone, Password.
3. Pending approval gate with admin WhatsApp contact instruction (082115624408).
4. Superadmin authentication exclusively for `akunadminaul16@gmail.com` / `akuadmin123`.
5. Profile picture management: display and persistent upload/change.
6. Telegram bot multi-modal (text nominal Indonesian, receipt OCR Pro, voice note STT with transcript line), idempotent webhook, standardized progress bar responses, commands.
7. User dashboard with 4 stats cards, charts, multi-wallet, custom categories, budget, reports with signed URL export.
8. Admin dashboard with impersonation, user approvals, multi-provider AI settings, logs.
9. Subscription with Starter vs Pro enforcement, Midtrans integration.

## 5-Agent Execution Strategy

### Step 1: Milestone 1 — Survey & Gap Analysis
- **Agent**: `explorer_r8_1` (`teamwork_explorer`)
- **Working Directory**: `.agents/teamwork/explorer_r8_1`
- **Scope**:
  - Inspect existing codebase (`server.py`, `index.html`, `supabase/migrations`, test suites, database).
  - Identify all changes needed for R1–R6:
    - Update admin credentials to `akunadminaul16@gmail.com` / `akuadmin123`.
    - Registration fields: Name, Email, Phone, Password.
    - Pending approval screen updating admin WhatsApp to `082115624408`.
    - Removal of "Masuk Admin" link from public landing/navbar, unified login modal.
    - Orange-white modern UI theme across all views (landing page, dashboard, admin, auth modals).
    - Profile picture display and upload feature with persistent backend storage.
    - Telegram webhook idempotency & multi-modal support check.
    - Existing test suite review and requirements for new tests.
  - Produce comprehensive `analysis.md` and `handoff.md`.

### Step 2: Milestone 2 — Backend & Database Implementation
- **Agent**: `backend_worker_r8_1` (`teamwork_worker`)
- **Working Directory**: `.agents/teamwork/backend_worker_r8_1`
- **Scope**:
  - Update admin authentication strictly for `akunadminaul16@gmail.com` / `akuadmin123`.
  - Ensure registration handles Name, Email, Phone, Password and sets `is_approved = 0`.
  - Implement/verify profile photo upload endpoint (`/api/user/profile-photo` or similar) persisting photo to disk/db and returning persistent URL.
  - Update approval flow APIs, WhatsApp contact data.
  - Verify Telegram bot webhook idempotency, multi-modal parser, bot commands.
  - Verify reports export endpoints (PDF/Excel) with signed/download URLs.
  - Run backend unit tests and document results in `handoff.md`.

### Step 3: Milestone 3 — Frontend & Visual UI Implementation
- **Agent**: `frontend_worker_r8_1` (`teamwork_worker`)
- **Working Directory**: `.agents/teamwork/frontend_worker_r8_1`
- **Scope**:
  - Update landing page and user/admin dashboard visual identity to clean orange-white modern theme (geometric font Inter / Plus Jakarta Sans, gradient orange accents, clean light background).
  - Remove "Masuk Admin" button/link from navbar and public landing page. Use unified login.
  - Update waiting approval screen with clear admin verification instruction via WhatsApp to 082115624408.
  - Add profile picture display and functional upload/change photo input with persistent update.
  - Ensure 4 stats cards, charts, multi-wallet, budget progress bar, report filters, and admin desk render cleanly with orange-white styling.
  - Document UI verification and results in `handoff.md`.

### Step 4: Milestone 4 — Adversarial Integration Testing
- **Agent**: `challenger_r8_1` (`teamwork_challenger`)
- **Working Directory**: `.agents/teamwork/challenger_r8_1`
- **Scope**:
  - Write and execute automated adversarial tests covering all Acceptance Criteria.
  - Test registration flow, pending approval gate, admin WhatsApp contact text verification.
  - Test admin auth exclusively allowing `akunadminaul16@gmail.com` / `akuadmin123` and rejecting others from admin desk.
  - Test public navbar has no "Masuk Admin" link.
  - Test profile photo upload persistence.
  - Test Telegram webhook idempotency (`update_id`) and Indonesian nominal parsing ("15rb", "1.5jt", "500k").
  - Test reports filtering & export.
  - Report pass/fail and deliver `handoff.md`.

### Step 5: Milestone 5 — Forensic Integrity Audit
- **Agent**: `auditor_r8_1` (`teamwork_auditor`)
- **Working Directory**: `.agents/teamwork/auditor_r8_1`
- **Scope**:
  - Perform static analysis, runtime verification, zero-mock audit, and anti-cheating checks.
  - Verify all implementations are authentic, persistent, and not mocked.
  - Issue CLEAN or INTEGRITY VIOLATION verdict.

### Step 6: Synthesis & Final Handoff
- Check all gate criteria in `GATE_STATUS.md`.
- Ensure all 5 milestones pass.
- Write orchestrator `handoff.md` and send report to sentinel parent (`e0a1810c-616a-4906-ac50-b19797062bfe`).
