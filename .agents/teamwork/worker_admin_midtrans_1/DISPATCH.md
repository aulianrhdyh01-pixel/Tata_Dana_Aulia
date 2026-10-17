# Task Assignment: Worker 4 (Admin Dashboard, Multi-Provider AI & Midtrans)

## Working Directory
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_admin_midtrans_1`

## Project Root
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`

## Reference Documents
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Read this first!)
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md`

## Your Mission
You are the Admin Dashboard, Multi-Provider AI, and Midtrans Billing Specialist. You own:
1. Admin Panel Shell & Overview (`app/admin/layout.tsx`, `app/admin/page.tsx`):
   - Superadmin gate and role check.
   - Platform metrics: Total registered users, Starter vs Pro ratio, Monthly Recurring Revenue (MRR), total processed transactions, AI calls count.
2. User Impersonation (`app/admin/users/page.tsx`, `app/api/admin/impersonate/route.ts`):
   - Admin can view all users, subscription tiers, transaction counts.
   - "Impersonate" button: instantly switches context to view the user's dashboard view without logging out or needing their password, with a persistent top banner "Viewing as [User Email] - [Exit Impersonation]".
3. Multi-Provider AI Configuration (`app/admin/ai-settings/page.tsx`, `lib/ai/multi-provider-client.ts`):
   - Support for 3 major AI providers: Google Gemini, OpenAI, DeepSeek.
   - Execution mode switcher:
     - Single Provider mode (uses designated primary provider).
     - Failover mode (if primary fails with rate-limit or error, automatically retries on backup provider).
   - Secure API key configuration inputs with masking.
4. AI Usage Logs & Privacy Audit Trail:
   - `app/admin/ai-logs/page.tsx`: Table tracking provider used, model name, prompt tokens, completion tokens, latency (ms), and cost/status.
   - `app/admin/audit-logs/page.tsx`: Audit trail logging every time an admin accesses or views user transaction data (protecting user financial privacy).
5. Midtrans Subscription & Payment Gateway (`app/admin/subscriptions/page.tsx`, `lib/midtrans/`, `app/api/midtrans/`):
   - Midtrans Snap integration: create transaction token for Pro upgrade (Rp 49.000/bln or Rp 490.000/thn).
   - Mock Midtrans Simulator & payment testing UI: allows simulating settlement, pending, and failure without needing live bank credentials.
   - `app/api/midtrans/webhook/route.ts`: Midtrans notification webhook handler. On `settlement` or `capture`, automatically upgrades user's tier to `PRO` and unlocks unlimited transactions, AI advisor, and OCR features!
   - Manual payment approval/rejection interface for bank transfer receipts.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Criteria
1. Admin panel loads with metrics, users, impersonation banner, and audit trails.
2. Multi-provider AI manager supports Gemini, OpenAI, and DeepSeek with failover.
3. Midtrans subscription workflow successfully upgrades user tier to Pro.
4. Write `handoff.md` in your working directory documenting implementation and verification.

## 2026-10-10T05:38:10Z
From: 7a6c7a25-c80f-493d-99e0-0757ef089ee2 (Orchestrator)
Content:
You are Worker 4 (Admin Dashboard, Multi-Provider AI & Midtrans) for TataDana.

Your working directory is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_admin_midtrans_1

Project root is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

Read the authoritative user request at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md

Read your full task dispatch at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_admin_midtrans_1\DISPATCH.md

Read the project architecture and contracts at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Owned Files:
1. app/admin/layout.tsx and app/admin/page.tsx: Superadmin dashboard with metrics (Total users, Starter vs Pro ratio, MRR, total transactions, AI calls).
2. app/admin/users/page.tsx and app/api/admin/impersonate/route.ts: User list with Impersonation feature allowing instant view as user with a persistent top banner.
3. app/admin/ai-settings/page.tsx and lib/ai/multi-provider-client.ts: Multi-Provider AI manager (Gemini, OpenAI, DeepSeek) with Single vs Failover mode and masked API key settings.
4. app/admin/ai-logs/page.tsx and app/admin/audit-logs/page.tsx: Token usage, latency, provider logs, and privacy audit trail for transaction data access.
5. app/admin/subscriptions/page.tsx, lib/midtrans/midtrans-client.ts, app/api/midtrans/charge/route.ts, app/api/midtrans/webhook/route.ts: Midtrans Snap integration, test payment simulator, manual transfer approval/rejection, and webhook handler upgrading users to PRO.

When done, write handoff.md in your working directory and notify the orchestrator via send_message.

