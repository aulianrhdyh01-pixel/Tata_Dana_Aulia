-- ==============================================================================
-- TATADANA PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRES)
-- Generated for TataDana Financial Management System
-- Timezone: WIB (Asia/Jakarta)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone default for session
SET timezone = 'Asia/Jakarta';

-- 2. USERS & PROFILES TABLE (Extensions to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
    plan_expires_at TIMESTAMPTZ,
    is_approved_by_admin BOOLEAN DEFAULT FALSE,
    approved_by_admin_at TIMESTAMPTZ,
    approved_by_email TEXT,
    default_currency TEXT DEFAULT 'IDR',
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_time_1 TIME DEFAULT '13:00',
    reminder_time_2 TIME DEFAULT '20:30',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Seed Initial Superadmin (shopnoure1619@gmail.com)
COMMENT ON TABLE public.profiles IS 'Profil user TataDana terintegrasi dengan nomor telepon OTP dan status persetujuan admin';

-- 3. WALLETS (MULTI-WALLET)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "BCA Utama", "Mandiri", "GoPay", "Cash"
    wallet_type TEXT DEFAULT 'bank' CHECK (wallet_type IN ('cash', 'bank', 'ewallet', 'investment', 'other')),
    account_number TEXT,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE, -- Default wallet for quick Telegram input
    color_hex TEXT DEFAULT '#2563eb',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Ensure user has only one default wallet
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_default_wallet 
ON public.wallets (user_id) 
WHERE is_default = TRUE;

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means system global category
    name TEXT NOT NULL,
    icon_emoji TEXT DEFAULT '📦',
    category_type TEXT NOT NULL CHECK (category_type IN ('pengeluaran', 'pemasukan')),
    color_hex TEXT DEFAULT '#38bdf8',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 5. BUDGETS PER CATEGORY
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    month_year DATE NOT NULL, -- e.g. 2026-10-01
    amount_limit NUMERIC(15, 2) NOT NULL,
    alert_80_sent BOOLEAN DEFAULT FALSE,
    alert_100_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(user_id, category_id, month_year)
);

-- 6. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('pengeluaran', 'pemasukan', 'transfer')),
    destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL, -- for transfer
    amount NUMERIC(15, 2) NOT NULL,
    notes TEXT,
    source TEXT DEFAULT 'telegram_text' CHECK (source IN ('telegram_text', 'telegram_photo', 'telegram_voice', 'web_dashboard', 'recurring')),
    receipt_image_url TEXT,
    voice_transcript TEXT,
    transaction_time TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_tx_user_date ON public.transactions(user_id, transaction_time DESC);

-- 7. RECEIPT TRANSACTION ITEMS (Part 4.2 OCR Breakdown)
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(15, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    subtotal NUMERIC(15, 2) NOT NULL,
    item_time TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 8. TELEGRAM BOT CONNECTIONS & IDEMPOTENCY
CREATE TABLE IF NOT EXISTS public.telegram_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_user_id BIGINT UNIQUE,
    bot_token_encrypted TEXT NOT NULL,
    bot_username TEXT,
    webhook_url TEXT,
    webhook_status TEXT DEFAULT 'untested' CHECK (webhook_status IN ('untested', 'testing', 'connected', 'failed')),
    last_tested_at TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Idempotency check table for Telegram updates
CREATE TABLE IF NOT EXISTS public.telegram_processed_updates (
    update_id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 9. AI PROVIDERS & CONFIGURATION (Superadmin Controlled)
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL UNIQUE, -- 'gemini', 'openai', 'deepseek'
    display_name TEXT NOT NULL,
    model_name TEXT NOT NULL, -- e.g. 'gemini-1.5-flash', 'gpt-4o', 'deepseek-chat'
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority_order INTEGER DEFAULT 1,
    supports_vision BOOLEAN DEFAULT TRUE,
    supports_audio BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Default system configuration
INSERT INTO public.system_settings (key, value) VALUES
('ai_mode', '{"mode": "failover", "primary": "gemini", "fallback_1": "openai", "fallback_2": "deepseek"}'),
('admin_email', '{"email": "shopnoure1619@gmail.com"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 10. AI CALL LOGS & MONITORING
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'text_parse', 'ocr_receipt', 'speech_to_text', 'financial_advisor'
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 11. MIDTRANS PAYMENTS & MANUAL APPROVAL
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'pro')),
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT DEFAULT 'midtrans_qris', -- 'midtrans_bca', 'manual_transfer', etc.
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    payment_proof_url TEXT,
    approved_by_admin UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 12. AUDIT LOGS FOR ADMIN DATA ACCESS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    target_user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- 'view_transactions', 'impersonate_user', 'approve_payment', 'approve_user'
    ip_address TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 13. REPORT EXPORT HISTORY (Stored in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.report_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'xlsx')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    storage_file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

-- User Policies: Users can only view and modify their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own wallets" ON public.wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own telegram connection" ON public.telegram_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own report exports" ON public.report_exports FOR ALL USING (auth.uid() = user_id);

-- Superadmin full bypass policy (checks role = 'superadmin' on profiles)
CREATE POLICY "Superadmin can manage all" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
);
