# Scope: TataDana Prime Round 7

## Architecture
- Backend: Python `server.py` serving static SPA files and handling REST endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/verify-otp`, `/api/auth/status`, `/api/admin/approve-user`, `/api/admin/pending-users`, etc.).
- Database: Local persistent SQLite (`tatadana.db`) with tables: `users`, `wallets`, `categories`, `transactions`, etc.
- Frontend: Single Page Application in `index.html` (with dynamic views: landing, `#viewLogin`, `#viewApproval`, `#viewApp`, `#viewAdmin`).
- Port: Localhost 3000.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Superadmin vs User View Separation | Only shopnoure1619@gmail.com accesses #dNav-adminPanel, #mNav-adminPanel, /admin. Hide completely (display:none) for User. Sidebar displays user's own identity (name, email, role: USER). Direct /admin access by User returns 403 and redirects to /dashboard. | M2, M3 | R1 |
| 2 | Registration & Waiting Approval Gate | Users register with is_approved=0. Entering 6-digit OTP and clicking 'Lanjutkan' validates OTP but DOES NOT auto-approve. Account stays is_approved=0, routed to Waiting for Admin Approval Screen. | M2, M3 | R2 |
| 3 | Waiting for Admin Approval Screen | Displays registrant identity, "PENDING APPROVAL" status badge, notice requiring Superadmin authorization (shopnoure1619@gmail.com), interactive "🔄 Periksa Status Persetujuan Admin" button calling /api/auth/status. Unapproved users blocked from /dashboard and /admin. | M3 | R2 |
| 4 | Superadmin Desk Approval Workflow | Superadmin sees pending users queue in Superadmin Desk. Clicking "✓ Setujui Akun" updates is_approved=1 in SQLite. Once approved, user entering /dashboard sees User view. | M2, M3 | R3 |
| 5 | Operational Server & SPA Stability | server.py running on port 3000. All routes (/, /login, /approval, /dashboard, /admin) respond with HTTP 200. | M2, M4 | R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Survey & Exploration | Comprehensive inspection of server.py, index.html, tatadana.db, existing auth flow, OTP verification, and RBAC | None | DONE |
| M2 | Backend Implementation | Update server.py: keep is_approved=0 on OTP verification, provide /api/auth/status and route protection (403 for /admin), support persistent approval | M1 | DONE |
| M3 | Frontend Implementation | Update index.html: OTP 'Lanjutkan' button transitions to Waiting for Admin Approval screen, implement waiting screen UI with identity badge & check status button, strictly hide admin elements (#dNav-adminPanel, #mNav-adminPanel) for user role, render user identity in sidebar, enforce 403 redirect | M2 | DONE |
| M4 | Adversarial Verification | Test edge cases, unapproved access attempts, role tampering, OTP validation, and full approval lifecycle | M2, M3 | DONE |
| M5 | Forensic Integrity Audit | Systematic integrity audit verifying genuine SQLite persistence, no fake/mock bypasses, real route protections | M4 | DONE |

## Interface Contracts
### Auth & Approval APIs
- `POST /api/auth/verify-otp`:
  - Request: `{"email": "...", "otp": "123456"}`
  - Response: `{"success": true, "message": "OTP valid. Menunggu persetujuan admin.", "is_approved": 0, "user": {...}}`
  - Crucial: DOES NOT set `is_approved = 1`. Keeps `is_approved = 0`.
- `GET /api/auth/status` (or `POST /api/auth/status`):
  - Request: checks status by session or email param/token
  - Response: `{"is_approved": 0|1, "role": "user"|"superadmin", "status": "PENDING"|"APPROVED"}`
- `POST /api/admin/approve-user`:
  - Superadmin only. Request: `{"user_id": ...}`
  - Updates SQLite `users.is_approved = 1`.
- `GET /admin` or direct SPA navigation:
  - If user is not superadmin, 403 Forbidden / redirect to `/dashboard`.
