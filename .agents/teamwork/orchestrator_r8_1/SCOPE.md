# Scope: Round 8 — TataDana Full End-to-End Implementation & Enhancement

## Architecture
- Backend: Python HTTP server (`server.py`) serving REST APIs, webhook handlers, and SPA routing.
- Database: Persistent SQLite database (`tatadana.db`) and Supabase migration definitions (`supabase/migrations`).
- Frontend: Single Page Application (`index.html`) styled with Tailwind CSS, Chart.js, modern orange-white visual identity.
- Telegram Bot: Shared webhook endpoint (`/api/telegram/webhook`) with idempotency check (`update_id`) and multi-modal transaction processing.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Visual Identity & Landing Page | Orange-white modern theme, Inter/Plus Jakarta Sans, remove "Masuk Admin" navbar button, unified login | M3 | R1 |
| 2 | Registration & Pending Approval Gate | Name, Email, Phone, Password, pending status, WhatsApp 082115624408 verification screen | M2, M3 | R2 |
| 3 | Admin Auth Gate | Exclusive admin credentials `akunadminaul16@gmail.com` / `akuadmin123`, RBAC separation | M2 | R2 |
| 4 | Telegram Bot Multi-Modal & Idempotency | Idempotent `/api/telegram/webhook`, Indonesian nominals, receipt OCR, voice STT with transcript, WIB timestamps | M2 | R3 |
| 5 | User Dashboard & Reports | 4 stats cards, charts, multi-wallet, budget bar, export PDF/Excel with signed URL | M2, M3 | R4 |
| 6 | Profile Photo Management | Display user profile picture and persistent upload/change photo feature | M2, M3 | R4 |
| 7 | Admin Dashboard & Multi-Provider AI | Impersonation, user approval queue, Gemini/OpenAI/DeepSeek config, usage logs | M2, M3 | R5 |
| 8 | Subscription & Payment | Starter (50 tx limit) vs Pro, Midtrans & manual transfer approval | M2 | R6 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Survey & Gap Analysis | Codebase investigation, gap identification across R1-R6 | none | IN_PROGRESS |
| 2 | M2: Backend & Database Implementation | Server APIs, admin auth, profile photo upload API, Telegram & reports | M1 | PLANNED |
| 3 | M3: Frontend & Visual UI Implementation | Orange-white theme, landing page, unified login, profile photo UI, approval screen | M1 | PLANNED |
| 4 | M4: Adversarial Integration Testing | Comprehensive test suite for all ACs | M2, M3 | PLANNED |
| 5 | M5: Forensic Integrity Audit | Anti-cheat, zero-mock, persistent logic verification | M2, M3, M4 | PLANNED |

## Interface Contracts
### Auth & Verification
- `POST /api/auth/register`: `{name, email, phone, password}` -> `{status: 'pending_approval', message: '...', user: {...}}`
- `POST /api/auth/login`: `{email, password}` -> If `akunadminaul16@gmail.com` + `akuadmin123` => `{status: 'success', role: 'superadmin', user: {...}}`; If regular user approved => `{status: 'success', role: 'user', ...}`; If pending => `{status: 'pending_approval', whatsapp: '082115624408', ...}`
- `POST /api/user/profile-photo`: Multipart or Base64 upload -> persists photo -> `{status: 'success', photo_url: '...'}`
- `GET /api/telegram/webhook` / `POST /api/telegram/webhook`: Idempotent handling with `update_id`.
