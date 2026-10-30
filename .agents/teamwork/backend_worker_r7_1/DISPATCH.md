# Dispatch to Backend Worker (Round 7)

## Mission
Implement backend requirements for Round 7:
1. Update `/api/auth/verify-otp` in `server.py`:
   - Regular users MUST strictly remain `is_approved = 0` after OTP verification (do NOT auto-approve). Only superadmin (`shopnoure1619@gmail.com`) can have `is_approved = 1`.
   - Update `users` table: `UPDATE users SET is_approved = ? WHERE id = ?` with `0` for regular users.
   - Return HTTP 200 with `{'ok': True, 'success': True, 'status': 'pending_approval', 'is_approved': 0, 'role': user_dict['role'], 'user': user_dict, 'message': 'OTP valid. Menunggu persetujuan admin (shopnoure1619@gmail.com).'}`.
2. Update `/api/auth/status`:
   - Implement handler in `do_POST` for `/api/auth/status` (handling `user_id` and `email` in JSON body).
   - Enhance both `do_GET` and `do_POST` responses to include `ok: True, success: True, is_approved: 0|1, status: 'PENDING'|'APPROVED', approval_status: 'PENDING'|'APPROVED'`.
3. Update `/api/admin/approve-user`:
   - In both `do_GET` and `do_POST`, ensure `users SET is_approved = 1 WHERE id = ?` executes and returns `{'ok': True, 'success': True, 'is_approved': 1, 'user_id': user_id}`.
4. Ensure all SPA routes (`/`, `/login`, `/approval`, `/dashboard`, `/admin`, `/superadmin`, `/settings`) return HTTP 200 with `index.html`.
5. Restart `server.py` on port 3000 if it was running or start it. Verify server responds on `http://localhost:3000`.

## File Ownership
- Exclusively owns: `server.py`
- DO NOT edit `index.html`.

## Mandatory Reading
- C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/ORIGINAL_REQUEST.md
- C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/orchestrator_r7_1/SCOPE.md
- C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/explorer_r7_1/handoff.md

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output
Write your report and handoff to:
C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/backend_worker_r7_1/handoff.md
Send a completion message back to orchestrator when done.


## 2026-10-30T11:24:18Z
You are backend_worker_1. Your working directory is C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/backend_worker_r7_1.
Your project root is C:/Users/ASUS/.gemini/antigravity/scratch/tatadana.

MANDATORY INSTRUCTIONS:
1. Read C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/ORIGINAL_REQUEST.md (specifically the latest section ## 2026-10-30T11:08:10Z).
2. Read C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/orchestrator_r7_1/SCOPE.md, C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/explorer_r7_1/handoff.md, and C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/backend_worker_r7_1/DISPATCH.md.
3. You exclusively own server.py. DO NOT edit index.html.
4. Implement all backend requirements:
   - Ensure /api/auth/verify-otp strictly leaves regular users with is_approved = 0 and returns status: 'pending_approval', is_approved: 0, ok: True, success: True.
   - Implement handler for POST /api/auth/status in do_POST.
   - Update /api/auth/status in do_GET and do_POST to return success: True, is_approved, role, status: 'PENDING'|'APPROVED', approval_status: 'PENDING'|'APPROVED'.
   - Ensure /api/admin/approve-user persistently updates SQLite users SET is_approved = 1 WHERE id = ? and returns ok: True, success: True, is_approved: 1.
   - Ensure all SPA routes (/, /login, /approval, /dashboard, /admin, /superadmin, /settings) return HTTP 200 with index.html.
   - Restart server.py on port 3000 (check if process is running, restart cleanly if needed, verify with curl or urllib).
5. MANDATORY INTEGRITY WARNING:
   DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
6. Test your changes by writing and running test scripts. Ensure passing test output is recorded.
7. Write your handoff report to C:/Users/ASUS/.gemini/antigravity/scratch/tatadana/.agents/teamwork/backend_worker_r7_1/handoff.md.
8. Update progress.md in your working directory and send a completion message back to the orchestrator.
