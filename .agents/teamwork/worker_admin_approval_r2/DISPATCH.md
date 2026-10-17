# DISPATCH — Worker 2 (Admin Auth & Registration/Approval Workflow)
Working Directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_admin_approval_r2
Project Root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Reference: ORIGINAL_REQUEST.md

Task:
Implement & verify Superadmin Authentication and User Registration/Approval workflow.
- Admin login with email shopnoure1619@gmail.com and password 160017 succeeds with superadmin role.
- Login with invalid credentials returns 401 with clear error message.
- User registration via /api/auth/register records user with is_approved = 0.
- User login with is_approved = 0 indicates pending approval.
- Admin can list all users via /api/admin/users.
- Admin can approve user via /api/admin/approve-user, setting is_approved = 1 and initializing default wallets (BCA Utama, Mandiri, GoPay, Cash) and budget categories.
- Write and run verification script. Document results in handoff.md.
