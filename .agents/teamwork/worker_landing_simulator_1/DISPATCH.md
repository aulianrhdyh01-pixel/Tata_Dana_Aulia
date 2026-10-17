# Task Assignment: Worker 5 (Landing Page, Interactive Simulator & E2E Testing)

## Working Directory
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_landing_simulator_1`

## Project Root
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`

## Reference Documents
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Read this first!)
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md`

## Your Mission
You are the Landing Page, Interactive Simulator, and End-to-End Acceptance Testing Specialist. You own:
1. High-Converting Fintech Dark Landing Page (`app/page.tsx`, `components/landing/*`):
   - Pitch black theme (`#09090b` / `#0c0c0e`) with electric fintech orange accents (`#f97316`).
   - Sticky navbar with logo, features, pricing, FAQ, and "Coba Gratis" / "Masuk" buttons.
   - Hero Section: Problem-aware punchy headline, subheadline, CTA buttons, social proof badge.
   - Problem vs Solution section: Highlighting manual spreadsheets vs instant automated Telegram tracking.
   - 3 Alternating feature blocks with rich visual cards (Multi-Modal AI, Real-time Dashboard, Budget & Alerts).
   - Testimonial grid with authentic Indonesian user stories (freelancer, UMKM owner, karyawan).
   - Interactive Pricing section: Monthly vs Annually toggle for Starter (Rp 0) vs Pro (Rp 49.000/bln).
   - 7+ Comprehensive FAQs with interactive accordion (security, Telegram privacy, bank sync, export, etc.).
   - Final high-impact CTA section and sleek 4-column footer.
2. Interactive Sandbox & Telegram Bot Simulator (`components/simulator/*`):
   - Built directly into both the landing page and accessible for standalone testing!
   - Real-time interactive Telegram chat simulator widget:
     - Allows users/testers to type Indonesian natural text like "beli kopi susu 18rb", "makan siang padang 35k", "gaji bulanan 10jt".
     - Simulates receipt photo upload with instant OCR breakdown.
     - Simulates voice note recording with transcription preview and transaction confirmation.
     - Displays formatted bot response with budget progress bar (`[████░░]`), remaining balance, and motivational quote!
     - Immediately reflects the newly added transaction in the live preview cards!
3. Automated Verification & Acceptance Test Suite:
   - Create `scripts/verify-all.js` (executable via `node scripts/verify-all.js`) testing all criteria from `ORIGINAL_REQUEST.md`:
     1. Telegram Webhook Idempotency: Send duplicate `update_id` payload to `/api/telegram/webhook` -> returns 200 OK without duplicate transaction.
     2. Supabase Migrations: Validate `supabase/migrations/20261010_initial_schema.sql` exists and has all 11 required tables, RLS policies, and Asia/Jakarta triggers.
     3. RLS Security: Verify RLS logic ensures user isolation.
     4. Timezone verification: All formatted dates conform to WIB (Asia/Jakarta).
     5. Multi-modal parsing: "beli kopi susu 18rb" -> Rp 18.000 Makanan & Minuman; "15rb", "1.5jt", "250k" parsed accurately.
     6. Starter Quota Enforcement: Starter package capped at 50 tx/month with upgrade CTA; receipt OCR blocked for Starter.
     7. Reports Export: Generate PDF and XLSX files and verify valid binary output.
     8. Midtrans & Pro Upgrade: Verify Pro subscription status unlocks all features.
     9. Localhost readiness: Verify build (`npm run build` or `next build`) compiles without errors.
4. Execute the verification script, collect results, and report findings in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Criteria
1. Landing page is visually stunning, responsive, and adheres to dark mode with orange accents.
2. Interactive simulator works interactively for instant testing of Telegram multi-modal inputs.
3. Verification script checks all acceptance criteria and reports passing results.
4. Write `handoff.md` in your working directory documenting implementation and verification.


## 2026-10-10T05:38:11Z
You are Worker 5 (Landing Page, Interactive Simulator & E2E Testing) for TataDana.

Your working directory is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_landing_simulator_1

Project root is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

Read the authoritative user request at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md

Read your full task dispatch at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_landing_simulator_1\DISPATCH.md

Read the project architecture and contracts at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Owned Files:
1. app/page.tsx and components/landing/*: High-converting fintech dark landing page (#09090b with orange #f97316 accents), sticky navbar, hero headline, problem vs solution, 3 alternating feature blocks, testimonial grid, interactive pricing toggle (Starter vs Pro), 7+ FAQ accordion, final CTA, 4-col footer.
2. components/simulator/telegram-simulator.tsx & components/simulator/dashboard-preview.tsx: Real-time interactive Telegram Bot chat simulator embedded on the page! Allows typing Indonesian natural text ("beli kopi susu 18rb", "makan siang padang 35k"), receipt photo OCR test, voice note test, with instant bot response and live balance/budget updates.
3. scripts/verify-all.js: Complete automated verification script testing all acceptance criteria:
   - Telegram Webhook Idempotency (duplicate update_id returns 200 OK without double transactions)
   - Supabase Migrations syntax and table completeness (11 tables)
   - RLS policies and WIB (Asia/Jakarta) timezone formatting
   - Multi-modal parsing ("beli kopi susu 18rb" -> Rp 18.000, "15rb", "1.5jt", "250k")
   - Starter quota limit (50 tx/month) & Pro feature gate
   - PDF & Excel report generation
   - Midtrans subscription flow & Pro upgrade
   - Application build verification (run npm run build or verify compilation)
4. Execute the verification script, collect results, and report in handoff.md.

When done, write handoff.md in your working directory and notify the orchestrator via send_message.
