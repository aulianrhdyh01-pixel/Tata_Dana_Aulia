-- ==============================================================================
-- TataDana: Schema Migration (Initial Schema)
-- Version: 20261010_initial_schema.sql
-- Timezone Standard: Asia/Jakarta (WIB, UTC+7)
-- Features: 11 Tables, Full RLS, Auto Balance Triggers, System Category Seeds
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default timezone to Asia/Jakarta for this session
SET timezone = 'Asia/Jakarta';

-- ==============================================================================
-- 1. TABLE: users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT UNIQUE, -- Primary link to Telegram Account
    telegram_chat_id TEXT UNIQUE,
    telegram_username TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'STARTER' CHECK (subscription_tier IN ('STARTER', 'PRO')),
    monthly_transaction_count INTEGER NOT NULL DEFAULT 0,
    subscription_expires_at TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 2. TABLE: wallets
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. Cash, BCA, Mandiri, GoPay, OVO
    type TEXT NOT NULL DEFAULT 'CASH' CHECK (type IN ('CASH', 'BANK', 'EWALLET', 'INVESTMENT', 'OTHER')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT false,
    color TEXT NOT NULL DEFAULT '#f97316',
    icon TEXT NOT NULL DEFAULT 'wallet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- Ensure only one default wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_wallet_per_user 
ON public.wallets (user_id) 
WHERE is_default = true;

-- ==============================================================================
-- 3. TABLE: categories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL indicates global/system category
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    icon TEXT NOT NULL DEFAULT '🏷️', -- emoji representation
    color TEXT NOT NULL DEFAULT '#f97316',
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 4. TABLE: transactions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL, -- for TRANSFER
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT '',
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    source TEXT NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'TELEGRAM_TEXT', 'TELEGRAM_RECEIPT', 'TELEGRAM_VOICE', 'TRANSFER')),
    receipt_url TEXT,
    audio_url TEXT,
    raw_input TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 5. TABLE: transaction_items
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    qty NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 6. TABLE: budgets
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    month TEXT NOT NULL, -- Format: YYYY-MM (e.g. '2026-10')
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    CONSTRAINT uq_user_category_month UNIQUE (user_id, category_id, month)
);

-- ==============================================================================
-- 7. TABLE: reminders
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_time TIME NOT NULL, -- e.g. 08:00:00, 20:00:00 (strict max 2x/day per user)
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    is_active BOOLEAN NOT NULL DEFAULT true,
    channel TEXT NOT NULL DEFAULT 'TELEGRAM' CHECK (channel IN ('TELEGRAM', 'WEB_PUSH', 'EMAIL')),
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 8. TABLE: subscriptions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('STARTER', 'PRO')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'REJECTED')),
    payment_method TEXT DEFAULT 'MIDTRANS', -- 'MIDTRANS', 'MANUAL_TRANSFER', 'FREE'
    order_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    snap_token TEXT,
    midtrans_transaction_id TEXT,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 9. TABLE: ai_logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('GEMINI', 'OPENAI', 'DEEPSEEK', 'MOCK')),
    model TEXT NOT NULL,
    task TEXT NOT NULL CHECK (task IN ('PARSER', 'OCR', 'STT', 'ADVISOR')),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'FALLBACK')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 10. TABLE: audit_logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'IMPERSONATION_START', 'VIEW_TRANSACTIONS', 'APPROVE_SUB', etc.
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now()))
);

-- ==============================================================================
-- 11. TABLE: webhook_events (Strict Idempotency Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('TELEGRAM', 'MIDTRANS')),
    event_id TEXT NOT NULL, -- update_id from Telegram or order_id from Midtrans
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('Asia/Jakarta', now())),
    CONSTRAINT uq_source_event UNIQUE (source, event_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx ON public.transaction_items (transaction_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets (user_id, month);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone_number);
CREATE INDEX IF NOT EXISTS idx_users_telegram ON public.users (telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs (admin_id);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Helper function for updated_at in WIB
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('Asia/Jakarta', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_budgets_updated_at ON public.budgets;
CREATE TRIGGER trg_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Trigger for Automatic Wallet Balance Updates and Monthly Tx Counter
CREATE OR REPLACE FUNCTION public.handle_transaction_balance_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Adjust balance based on transaction type
        IF (NEW.type = 'INCOME') THEN
            UPDATE public.wallets 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'EXPENSE') THEN
            UPDATE public.wallets 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'TRANSFER') THEN
            -- Deduct from origin wallet
            UPDATE public.wallets 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.wallet_id;
            -- Add to destination wallet
            IF (NEW.destination_wallet_id IS NOT NULL) THEN
                UPDATE public.wallets 
                SET balance = balance + NEW.amount 
                WHERE id = NEW.destination_wallet_id;
            END IF;
        END IF;

        -- Increment user's monthly transaction count
        UPDATE public.users 
        SET monthly_transaction_count = monthly_transaction_count + 1 
        WHERE id = NEW.user_id;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        -- Revert balance changes on transaction deletion
        IF (OLD.type = 'INCOME') THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount 
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'EXPENSE') THEN
            UPDATE public.wallets 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'TRANSFER') THEN
            UPDATE public.wallets 
            SET balance = balance + OLD.amount 
            WHERE id = OLD.wallet_id;
            IF (OLD.destination_wallet_id IS NOT NULL) THEN
                UPDATE public.wallets 
                SET balance = balance - OLD.amount 
                WHERE id = OLD.destination_wallet_id;
            END IF;
        END IF;

        -- Decrement monthly count
        UPDATE public.users 
        SET monthly_transaction_count = GREATEST(0, monthly_transaction_count - 1) 
        WHERE id = OLD.user_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaction_balance ON public.transactions;
CREATE TRIGGER trg_transaction_balance
AFTER INSERT OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance_change();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (auth.uid() = id OR is_admin = true);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- 2. Wallets policies
CREATE POLICY "Users can CRUD own wallets" ON public.wallets
FOR ALL USING (auth.uid() = user_id);

-- 3. Categories policies
CREATE POLICY "Users can read system or own categories" ON public.categories
FOR SELECT USING (is_system = true OR user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can CRUD own categories" ON public.categories
FOR ALL USING (auth.uid() = user_id);

-- 4. Transactions policies
CREATE POLICY "Users can CRUD own transactions" ON public.transactions
FOR ALL USING (auth.uid() = user_id);

-- 5. Transaction Items policies
CREATE POLICY "Users can CRUD items of own transactions" ON public.transaction_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE transactions.id = transaction_items.transaction_id 
        AND transactions.user_id = auth.uid()
    )
);

-- 6. Budgets policies
CREATE POLICY "Users can CRUD own budgets" ON public.budgets
FOR ALL USING (auth.uid() = user_id);

-- 7. Reminders policies
CREATE POLICY "Users can CRUD own reminders" ON public.reminders
FOR ALL USING (auth.uid() = user_id);

-- 8. Subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. AI Logs policies
CREATE POLICY "Users can view own AI logs" ON public.ai_logs
FOR SELECT USING (auth.uid() = user_id);

-- 10. Audit Logs policies (Superadmin only)
CREATE POLICY "Superadmin view audit logs" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.is_admin = true
    )
);

-- 11. Webhook Events policies (Backend only)
CREATE POLICY "Backend service access to webhook_events" ON public.webhook_events
FOR ALL USING (auth.role() = 'service_role');

-- ==============================================================================
-- DEFAULT SEED CATEGORIES (INDONESIAN FINTECH STANDARD)
-- ==============================================================================
INSERT INTO public.categories (id, user_id, name, type, icon, color, is_system) VALUES
-- Pengeluaran (Expense)
('c0000000-0000-0000-0000-000000000001', NULL, 'Makanan & Minuman', 'EXPENSE', '🍔', '#ef4444', true),
('c0000000-0000-0000-0000-000000000002', NULL, 'Transportasi', 'EXPENSE', '🚗', '#f97316', true),
('c0000000-0000-0000-0000-000000000003', NULL, 'Belanja & Kebutuhan', 'EXPENSE', '🛍️', '#3b82f6', true),
('c0000000-0000-0000-0000-000000000004', NULL, 'Tagihan & Utilitas', 'EXPENSE', '⚡', '#eab308', true),
('c0000000-0000-0000-0000-000000000005', NULL, 'Hiburan & Hobi', 'EXPENSE', '🎬', '#8b5cf6', true),
('c0000000-0000-0000-0000-000000000006', NULL, 'Kesehatan & Medis', 'EXPENSE', '💊', '#10b981', true),
('c0000000-0000-0000-0000-000000000007', NULL, 'Pendidikan', 'EXPENSE', '🎓', '#06b6d4', true),
('c0000000-0000-0000-0000-000000000008', NULL, 'Donasi & Hadiah', 'EXPENSE', '🎁', '#ec4899', true),
('c0000000-0000-0000-0000-000000000009', NULL, 'Pajak & Biaya Admin', 'EXPENSE', '💼', '#64748b', true),
('c0000000-0000-0000-0000-000000000010', NULL, 'Lain-lain', 'EXPENSE', '📦', '#94a3b8', true),

-- Pemasukan (Income)
('c0000000-0000-0000-0000-000000000011', NULL, 'Gaji & Upah', 'INCOME', '💵', '#22c55e', true),
('c0000000-0000-0000-0000-000000000012', NULL, 'Investasi & Dividen', 'INCOME', '📈', '#10b981', true),
('c0000000-0000-0000-0000-000000000013', NULL, 'Bisnis & Penjualan', 'INCOME', '🛒', '#3b82f6', true),
('c0000000-0000-0000-0000-000000000014', NULL, 'Bonus & Hadiah', 'INCOME', '🎁', '#a855f7', true),
('c0000000-0000-0000-0000-000000000015', NULL, 'Pemasukan Lain', 'INCOME', '💰', '#14b8a6', true)
ON CONFLICT (id) DO NOTHING;
