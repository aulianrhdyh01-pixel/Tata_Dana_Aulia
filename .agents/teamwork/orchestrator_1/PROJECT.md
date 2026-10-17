# Project: TataDana

TataDana is a premium Indonesian personal finance SaaS integrated with Telegram Bot (single bot, multi-user) and Supabase, supporting natural language transactions, receipt photo OCR, voice note STT, multi-wallet, budget alerts, real-time analytics dashboard, PDF/Excel export, AI Financial Advisor, and Midtrans subscription. Built with a full Dark Mode theme (pitch black background `#09090b` / `#0c0c0e`, fintech orange accents `#f97316` / `#ea580c`), and an interactive in-app Sandbox/Simulator.

## Architecture & Code Layout

- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide React
- **Timezone Standard**: All transaction timestamps, reminders, and bot responses strictly formatted in `Asia/Jakarta` (WIB).
- **Design System**: Deep pitch dark mode (`bg-[#09090b]`, card `bg-[#121215]`, border `border-zinc-800`), vibrant orange accents (`text-orange-500`, `bg-orange-500`, hover `bg-orange-600`), sleek typography.

### Module Boundaries & File Ownership

#### Worker 1: Database, Supabase Migrations, Auth, Types & Foundation (`worker_db_auth_1`)
- **Owned Files**:
  - `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `next.config.js`
  - `supabase/migrations/20261010_initial_schema.sql` (Tables: `users`, `wallets`, `categories`, `transactions`, `transaction_items`, `budgets`, `reminders`, `subscriptions`, `ai_logs`, `audit_logs`, `webhook_events`, RLS policies, indexes, WIB triggers)
  - `types/database.ts` (Full TypeScript interfaces matching DB schema)
  - `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/mock-client.ts`
  - `lib/auth/auth-context.tsx`, `lib/auth/auth-service.ts`
  - `app/login/page.tsx`, `app/register/page.tsx`, `app/auth/callback/route.ts`
  - `lib/date-utils.ts` (WIB Asia/Jakarta helpers)
  - `.env.example`, `.env.local`

#### Worker 2: Telegram Bot Webhook & Multi-Modal Parsing (`worker_telegram_ai_1`)
- **Owned Files**:
  - `app/api/telegram/webhook/route.ts` (Telegram webhook with update_id idempotency check against `webhook_events`)
  - `app/api/telegram/test/route.ts` (Test Telegram bot getMe / setWebhook)
  - `lib/telegram/bot-service.ts` (Message dispatcher, commands `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`)
  - `lib/telegram/formatter.ts` (Standardized response templates: progress bar `█░`, remaining balance, quotes)
  - `lib/telegram/idempotency.ts`
  - `lib/ai/parser.ts` (Natural language parser for Indonesian format: "15rb", "1.5jt", "500k", structured output `{jenis, nominal, kategori, catatan}`)
  - `lib/ai/ocr-service.ts` (Receipt photo OCR extractor: merchant, date, multi-items)
  - `lib/ai/stt-service.ts` (Voice note audio STT transcriber with 60s limit and transcript reply)
  - `lib/ai/advisor-service.ts` (AI Financial Advisor for spending surges and budget deviations)
  - `lib/subscription/quota-guard.ts` (Starter 50 tx/month limit, receipt OCR & advisor upgrade CTAs)

#### Worker 3: Dashboard Web, Analytics & Reports Export (`worker_dashboard_reports_1`)
- **Owned Files**:
  - `app/dashboard/layout.tsx` (Dashboard layout with sidebar, header, wallet switcher, dark mode)
  - `app/dashboard/page.tsx` (Overview: 4 stats cards, Pie chart, Bar chart 6-month comparison, Trend line daily, 10 recent transactions, onboarding checklist)
  - `app/dashboard/wallets/page.tsx` (Multi-wallet manager: Cash, BCA, Mandiri, GoPay, OVO, set default, inter-wallet transfer modal)
  - `app/dashboard/budgets/page.tsx` (Category budgets, visual progress bars, budget alert badges)
  - `app/dashboard/reports/page.tsx` (Interactive data table with pagination, search, multi-filter, multi-item receipt expansion, PDF/Excel export triggers, export history list)
  - `app/dashboard/settings/page.tsx` (Tabs: Profile, Telegram Bot setup guide + token tester with live indicator, Reminders max 2x/day, Categories)
  - `components/dashboard/*` (Charts, StatsCards, TransactionList, WalletTransferModal, etc.)
  - `components/reports/*` (ReportFilters, ExportHistoryTable, ReceiptModal)
  - `lib/export/pdf-exporter.ts` (PDF generator using jsPDF)
  - `lib/export/excel-exporter.ts` (Excel generator using xlsx / exceljs)
  - `app/api/export/pdf/route.ts`, `app/api/export/excel/route.ts`
  - `app/api/transactions/route.ts`, `app/api/wallets/route.ts`, `app/api/budgets/route.ts`

#### Worker 4: Admin Panel, Multi-Provider AI & Midtrans (`worker_admin_midtrans_1`)
- **Owned Files**:
  - `app/admin/layout.tsx` (Admin shell with Superadmin navigation)
  - `app/admin/page.tsx` (Admin overview metrics, total users, MRR, transactions, AI calls)
  - `app/admin/users/page.tsx` (User list, Impersonation button with session switcher)
  - `app/admin/ai-settings/page.tsx` (Multi-Provider config: Gemini, OpenAI, DeepSeek; Single vs Failover mode; secure key storage)
  - `app/admin/ai-logs/page.tsx` (Token usage, latency, prompt/response logs)
  - `app/admin/audit-logs/page.tsx` (Audit trail for user transaction data access)
  - `app/admin/subscriptions/page.tsx` (Subscription list, manual payment approval/rejection)
  - `lib/admin/admin-service.ts`, `lib/admin/impersonation.ts`
  - `lib/ai/multi-provider-client.ts` (Failover router across Gemini, OpenAI, DeepSeek)
  - `lib/midtrans/midtrans-client.ts` (Snap token creation, payment verification, mock simulator)
  - `app/api/midtrans/charge/route.ts`, `app/api/midtrans/webhook/route.ts`
  - `app/api/admin/impersonate/route.ts`

#### Worker 5: Landing Page, Simulator Sandbox & E2E Testing (`worker_landing_simulator_1`)
- **Owned Files**:
  - `app/page.tsx` (High-converting dark landing page: sticky navbar, hero headline, problem vs solution, 3 alternating features, testimonials, pricing toggle Starter vs Pro, 7+ FAQ accordion, final CTA, 4-col footer)
  - `components/landing/*` (Navbar, Hero, ProblemSolution, FeatureBlocks, PricingSection, FaqAccordion, Footer)
  - `components/simulator/telegram-simulator.tsx` (Interactive live Telegram chat simulator in landing & dashboard: allows user to type Indonesian text e.g. "beli kopi 18rb", test receipt OCR, test voice notes, see instant bot reply and live balance update)
  - `components/simulator/dashboard-preview.tsx` (Interactive sandbox preview)
  - `tests/e2e/test-acceptance.ts` or `scripts/verify-acceptance.ts` (Automated verification runner)
  - `scripts/verify-all.js` (E2E acceptance test script testing all criteria from ORIGINAL_REQUEST.md: Idempotency, Migrations, WIB timezone, Indonesian nominal parsing, Starter 50 tx limit, PDF/Excel generation, build verification)

## Feature Inventory

| # | Feature | Description | Milestone | Worker |
|---|---------|-------------|-----------|--------|
| 1 | Supabase Migration Schema | 11 tables (`users`, `wallets`, `categories`, `transactions`, `transaction_items`, `budgets`, `reminders`, `subscriptions`, `ai_logs`, `audit_logs`, `webhook_events`), RLS, indexes | M1 | worker_db_auth |
| 2 | Auth & Multi-Wallet DB | Email/Password, Google OAuth, Phone OTP linking for Telegram, WIB timezone triggers | M1 | worker_db_auth |
| 3 | Telegram Webhook & Idempotency | `/api/telegram/webhook` with `update_id` strict idempotency, 200 OK repeat handling | M2 | worker_telegram_ai |
| 4 | Multi-modal AI Parsing | Indonesian currency parsing ("15rb", "1.5jt", "500k"), Structured JSON output | M2 | worker_telegram_ai |
| 5 | Receipt Vision OCR & Voice STT | Pro multi-item receipt OCR extraction, 60s voice note audio transcription | M2 | worker_telegram_ai |
| 6 | Standardized Bot Replies & Commands | Progress bar `█░`, default wallet balance, quotes, `/saldo`, `/hari ini`, etc. | M2 | worker_telegram_ai |
| 7 | Starter Quota & Advisor | 50 tx/month limit for Starter, AI Financial Advisor alerts on budget deviations | M2 | worker_telegram_ai |
| 8 | Dark Mode Web Dashboard | Stats cards, Pie chart, 6-month Bar chart, Trend line, 10 transactions, onboarding | M3 | worker_dashboard_reports |
| 9 | Multi-Wallet & Budget UI | Cash, BCA, Mandiri, GoPay, OVO, transfer modal, budget progress bars | M3 | worker_dashboard_reports |
| 10 | Reports & PDF/Excel Export | Data table with filters & expansion, PDF & XLSX generator, export history | M3 | worker_dashboard_reports |
| 11 | Settings & Bot Connect | Profile, Telegram BotFather guide & test connection indicator, reminders 2x/day | M3 | worker_dashboard_reports |
| 12 | Superadmin & Impersonation | Admin dashboard, user impersonation, data access audit logs | M4 | worker_admin_midtrans |
| 13 | Multi-Provider AI Engine | Gemini, OpenAI, DeepSeek switcher with Single / Failover mode & API key manager | M4 | worker_admin_midtrans |
| 14 | Midtrans & Subscription Billing | Snap checkout, manual transfer approval/rejection, instant Pro status upgrade | M4 | worker_admin_midtrans |
| 15 | Fintech Dark Landing Page | Modern hero, problem vs solution, features, testimonials, pricing, 7+ FAQs | M5 | worker_landing_simulator |
| 16 | In-app Interactive Simulator | Telegram bot chat simulator & live sandbox for zero-setup end-to-end testing | M5 | worker_landing_simulator |
| 17 | E2E Acceptance Verification | Test script validating all acceptance criteria, builds, and runs on localhost:3000 | M5 | worker_landing_simulator |

## Interface Contracts

### 1. Types Contract (`types/database.ts`)
```typescript
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type SubscriptionTier = 'STARTER' | 'PRO';

export interface User {
  id: string;
  email: string;
  phone_number?: string;
  telegram_chat_id?: string;
  subscription_tier: SubscriptionTier;
  monthly_transaction_count: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string; // e.g. Cash, BCA, Mandiri, GoPay, OVO
  type: string;
  balance: number;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string; // emoji
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string; // Asia/Jakarta (WIB)
  source: 'MANUAL' | 'TELEGRAM_TEXT' | 'TELEGRAM_RECEIPT' | 'TELEGRAM_VOICE';
  items?: TransactionItem[];
  created_at: string;
}

export interface TransactionItem {
  id?: string;
  transaction_id?: string;
  item_name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string; // YYYY-MM
}
```

### 2. Indonesian Currency Parser Contract (`lib/ai/parser.ts`)
```typescript
export interface ParsedTransaction {
  jenis: 'INCOME' | 'EXPENSE';
  nominal: number; // e.g. "18rb" -> 18000, "1.5jt" -> 1500000, "500k" -> 500000
  kategori: string;
  catatan: string;
  items?: { name: string; qty: number; price: number; total: number }[];
}
```

### 3. Telegram Webhook Contract (`/api/telegram/webhook`)
- Header/Body: Telegram Update object with `update_id`.
- Response: Status `200 OK`, JSON `{ status: 'ok', processed: boolean, duplicate: boolean }`.
- If `update_id` already exists in `webhook_events`, immediately return 200 OK with `{ duplicate: true }` without executing or creating any transactions.

### 4. Export API Contract
- `/api/export/pdf`: Query params `period`, `wallet_id`, `category_id`. Returns application/pdf download or JSON with download URL.
- `/api/export/excel`: Returns application/vnd.openxmlformats-officedocument.spreadsheetml.sheet or JSON with download URL.
