# Task Assignment: Worker 3 (Dashboard Web, Analytics & Reports Export)

## Working Directory
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_dashboard_reports_1`

## Project Root
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`

## Reference Documents
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Read this first!)
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md`

## Your Mission
You are the Web User Dashboard, Analytics, and Reports Export Specialist. You own:
1. Dashboard Overview UI (`app/dashboard/page.tsx`, `app/dashboard/layout.tsx`):
   - Responsive layout (375px to 1280px) in deep pitch black (`#09090b` / `#121215`) with fintech orange accents (`#f97316`).
   - 4 Stats Cards: Saldo Total, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Budget Tersisa.
   - Dynamic period filter: Harian, Mingguan, Bulanan, Tahunan, Custom date range.
   - Charts:
     - Pie Chart / Doughnut: Expense breakdown by category.
     - Bar Chart: 6-month comparison (Income vs Expense).
     - Trend Line: Daily expense trend.
   - 10 Recent Transactions table/list with categories, timestamps in Asia/Jakarta (WIB), and badges.
   - Interactive onboarding checklist (Connect Telegram, Set Budget, Add 1st Transaction).
2. Multi-Wallet Manager (`app/dashboard/wallets/page.tsx`):
   - Manage Cash, BCA, Mandiri, GoPay, OVO.
   - Set 1 default wallet.
   - Modal for inter-wallet transfer with balance updates.
3. Categories & Budgets (`app/dashboard/budgets/page.tsx`):
   - Custom categories with emojis and color pickers.
   - Monthly category budgets with visual progress bar (`[████░░]`) and warning indicators if spending >80% or >100%.
4. Full Reports & Export Engine (`app/dashboard/reports/page.tsx`, `lib/export/`):
   - Interactive transaction table: pagination, column sorting, search query, multi-filter by wallet/category/type/date range.
   - Multi-item detail expansion for receipt items.
   - On-demand PDF report generator (`lib/export/pdf-exporter.ts`) with custom company header, summary, and transaction table.
   - On-demand Excel (.xlsx) report generator (`lib/export/excel-exporter.ts`) with formatted cells and sheets.
   - Export history list with download links.
   - API endpoints: `app/api/export/pdf/route.ts` and `app/api/export/excel/route.ts`.
5. Settings (`app/dashboard/settings/page.tsx`):
   - Profile tab: name, email, phone number, subscription tier badge.
   - Telegram Bot tab: step-by-step BotFather guide, bot token input, "Test Koneksi" button with live status indicator (Connected / Error).
   - Daily Reminder tab: configure reminder times (maximum 2x/day).
   - Category management tab.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Criteria
1. Responsive dark dashboard renders properly with charts and statistics.
2. Multi-wallet and budget features work seamlessly.
3. PDF and Excel export generation produces valid downloadable files.
4. Settings tabs are fully functional.
5. Write `handoff.md` in your working directory documenting implementation and verification.


## 2026-10-10T05:38:10Z
[Message] sender=7a6c7a25-c80f-493d-99e0-0757ef089ee2 priority=MESSAGE_PRIORITY_HIGH
You are Worker 3 (Dashboard Web, Analytics & Reports Export) for TataDana.
Working directory: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_dashboard_reports_1
Project root: C:\Users\ASUS\.gemini\antigravity\scratch\tatadana
Scope & Owned Files:
1. app/dashboard/layout.tsx and app/dashboard/page.tsx
2. app/dashboard/wallets/page.tsx
3. app/dashboard/budgets/page.tsx
4. app/dashboard/reports/page.tsx
5. lib/export/pdf-exporter.ts, lib/export/excel-exporter.ts, app/api/export/pdf/route.ts, app/api/export/excel/route.ts
6. app/dashboard/settings/page.tsx
7. components/dashboard/*, components/reports/*, app/api/transactions/route.ts, app/api/wallets/route.ts, app/api/budgets/route.ts.
