# Task Assignment: Worker 2 (Telegram Bot Webhook & Multi-Modal Parsing)

## Working Directory
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_ai_1`

## Project Root
`C:\Users\ASUS\.gemini\antigravity\scratch\tatadana`

## Reference Documents
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md` (Read this first!)
- `C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md`

## Your Mission
You are the Telegram Bot Webhook & Multi-Modal Parsing Specialist. You own:
1. Webhook Endpoint & Idempotency:
   - `app/api/telegram/webhook/route.ts`:
     - Must inspect incoming Telegram update `update_id`.
     - Check `webhook_events` table (or mock store). If `update_id` already exists, immediately return status 200 OK with `{ status: 'ok', processed: false, duplicate: true }` WITHOUT duplicate transaction creation.
     - If new, record `update_id` and proceed with processing.
   - `app/api/telegram/test/route.ts`: Test endpoint to verify bot connectivity, `getMe`, and webhook registration.
   - `lib/telegram/idempotency.ts`: Dedicated helper for atomic deduplication.
2. Multi-Modal Parsing Engine (`lib/ai/parser.ts`):
   - Natural Language Indonesian parser with explicit nominal support:
     - "18rb" -> 18000
     - "15rb" -> 15000
     - "1.5jt" -> 1500000
     - "500k" / "250k" -> 500000 / 250000
     - Example: "beli kopi susu 18rb" -> `{ jenis: 'EXPENSE', nominal: 18000, kategori: 'Makanan & Minuman', catatan: 'beli kopi susu' }`
     - Example: "gaji bulanan 10jt" -> `{ jenis: 'INCOME', nominal: 10000000, kategori: 'Gaji', catatan: 'gaji bulanan' }`
3. Receipt Vision OCR & Voice STT:
   - `lib/ai/ocr-service.ts`: Extracts merchant, transaction date, and multi-item list from receipt photos.
   - `lib/ai/stt-service.ts`: Audio transcription with 60-second limit; bot reply must include `[Transkripsi: ...]` line before transaction breakdown.
4. Standardized Bot Replies & Command Dispatcher:
   - `lib/telegram/formatter.ts`:
     - Visual progress bar for monthly budget: e.g. `[██████░░░░] 60%`
     - Remaining default wallet balance: `Sisa Saldo: Rp 1.450.000`
     - Motivational finance quote: e.g. "Hemat pangkal kaya, catat terus biar gak boncos!"
   - `lib/telegram/bot-service.ts`:
     - Commands: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`.
5. Subscription Limits & Pro AI Financial Advisor:
   - `lib/subscription/quota-guard.ts`: Starter tier limited to 50 transactions/month. When limit reached or when Starter user sends photo/voice, bot replies with polite rejection and Pro upgrade CTA.
   - `lib/ai/advisor-service.ts`: Triggers actionable financial advice when user spends >20% over budget or experiences spending spikes.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Criteria
1. Webhook endpoint returns 200 OK on duplicate update_id without creating duplicate records.
2. Parsing handles all Indonesian currency expressions accurately.
3. Bot formatters render progress bars, balance, and commands.
4. Write `handoff.md` in your working directory documenting implementation and verification.


## 2026-10-10T05:38:09Z
You are Worker 2 (Telegram Bot Webhook & Multi-Modal Parsing) for TataDana.

Your working directory is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_ai_1

Project root is:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana

Read the authoritative user request at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md

Read your full task dispatch at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_ai_1\DISPATCH.md

Read the project architecture and contracts at:
C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\.agents\teamwork\orchestrator_1\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Owned Files:
1. app/api/telegram/webhook/route.ts: Telegram webhook endpoint with strict idempotency using update_id checked against webhook_events. Repeated update_id returns 200 OK without creating duplicate transactions.
2. app/api/telegram/test/route.ts and lib/telegram/idempotency.ts.
3. lib/ai/parser.ts: Natural language Indonesian transaction parser with explicit nominal support ("15rb" -> 15000, "1.5jt" -> 1500000, "500k" -> 500000, "250k" -> 250000). Structured output { jenis, nominal, kategori, catatan }.
4. lib/ai/ocr-service.ts: Multi-item receipt vision OCR extraction (merchant, date, items).
5. lib/ai/stt-service.ts: Voice note audio transcription (max 60s, includes transcription line in reply).
6. lib/telegram/formatter.ts: Standardized reply formatting with budget progress bar [██████░░░░], remaining default wallet balance, and motivational quote.
7. lib/telegram/bot-service.ts: Command router for /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /sheet, /bantuan.
8. lib/subscription/quota-guard.ts: Starter tier limit (max 50 tx/month) & Pro upgrade CTA.
9. lib/ai/advisor-service.ts: Pro AI Financial Advisor logic for budget deviations.

When done, write handoff.md in your working directory and notify the orchestrator via send_message.
