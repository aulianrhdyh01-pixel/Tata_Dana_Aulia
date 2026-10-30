## 2026-10-30T13:58:06Z
You are backend_worker_r8_1, a teamwork_worker agent.
Your working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\backend_worker_r8_1
Project root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Caller orchestrator ID: c7f82487-13d2-412c-a7f6-cbae1bb01659

MANDATORY: Read C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md (lines 484 to end) and C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_r8_1\handoff.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
- You EXCLUSIVELY own and modify: `server.py`, database files (`tatadana.db`), migrations in `supabase/migrations/`, and backend test scripts.
- DO NOT edit `index.html`.

Your Tasks:
1. Superadmin Authentication & RBAC:
   - Update `server.py` to seed and authenticate Superadmin strictly using email `akunadminaul16@gmail.com` and password `akuadmin123`.
   - Update SQLite database (`tatadana.db`) to ensure `akunadminaul16@gmail.com` has `role = 'superadmin'`, `plan = 'PRO VIP'`, `is_approved = 1`. Remove or downgrade legacy admin `shopnoure1619@gmail.com`.
   - Ensure all other logins receive `role: 'user'` and cannot access admin endpoints.
2. Registration & Pending Approval:
   - Ensure `POST /api/auth/register` handles Name, Email, Phone, Password, and inserts with `is_approved = 0`.
   - When a pending user attempts login, return pending status and include WhatsApp verification contact `082115624408`.
3. Profile Photo Upload:
   - Implement `POST /api/user/profile-photo` (supporting multipart or JSON base64) that writes photo to `uploads/avatars/` on disk, updates `avatar_url` in database for the authenticated user, and returns `{status: 'success', photo_url: '/uploads/avatars/...'}`.
   - Serve static `/uploads/avatars/` path in `server.py` so uploaded avatars are accessible via HTTP GET.
4. Telegram Bot Multi-Modal & Webhook:
   - Ensure `/api/telegram/webhook` idempotency using `update_id`.
   - Ensure Indonesian nominal parser handles "15rb", "1.5jt", "500k", etc.
   - Add handling for voice notes: when `voice` is present in update message, transcribe/process and return reply containing `🎙️ Transkrip: "[hasil transkrip]"`, transaction summary, and budget progress bar `█░`.
   - Add handling for photo receipts: if Pro user, extract items; if Starter user, reply with CTA upgrade message.
   - Format replies with budget progress bar `█░` and WIB timestamps.
5. Report Export Endpoints:
   - Implement `GET /api/export/pdf` and `GET /api/export/excel` (and `/api/export/signed-url`) returning valid PDF and Excel files.
6. Admin Capabilities & Multi-Provider AI:
   - Implement `GET /api/admin/ai-settings` and `POST /api/admin/ai-settings` storing provider configuration (Gemini, OpenAI, DeepSeek; single vs parallel/failover mode).
   - Implement `POST /api/admin/impersonate`.
7. Localhost Server & Verification:
   - Run a backend test script (e.g. `test_round8_backend.py`) to verify all backend APIs.
   - Ensure server runs on `http://localhost:3000` and responds with HTTP 200.
   - Document all changes, files modified, and test results in `handoff.md` in your working directory.
   - Send completion message back to orchestrator (`c7f82487-13d2-412c-a7f6-cbae1bb01659`).
