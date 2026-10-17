## 2026-10-17T06:53:50Z
You are the Acceptance Test Writer & Verifier for TataDana Prime.
Your working directory is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\test_writer_r3_1
Project root:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Original Request:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Orchestrator Scope:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_r3_1\PROJECT.md

Your assigned mission:
1. Read ORIGINAL_REQUEST.md thoroughly.
2. Create and run a comprehensive automated end-to-end verification script (in tests/ or as an independent runner script) testing the live application on http://localhost:3000.
3. The test suite must programmatically verify all 7 acceptance criteria:
   - AC 1: Server localhost:3000 responds with 200 OK for /, /dashboard, /admin, /superadmin, /login, /settings without 404.
   - AC 2: Superadmin login with shopnoure1619@gmail.com / tugasbisnis16 succeeds with Role: SUPERADMIN and Plan: PRO VIP.
   - AC 3: Export PDF and Excel endpoints/functions are fully operational.
   - AC 4: Profile photo update (Data URL and presets) persists in SQLite users.avatar_url.
   - AC 5: New registrant gets is_approved = 0, is held at pending status, and admin approval endpoint toggles is_approved = 1.
   - AC 6: Role-based navigation rules (Superadmin Desk visible for Superadmin, hidden for regular user).
   - AC 7: Webhook Telegram (/api/telegram/webhook) records real mutation to tatadana.db and updates wallet balance.
4. Execute the test script, ensure all assertions pass 100%.
5. Write your complete test results, assertion counts, and logs in C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\test_writer_r3_1\handoff.md.
6. Send a message to your orchestrator when finished.
