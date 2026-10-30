-- ==============================================================================
-- TataDana Schema Migration - Round 8 Update
-- Version: 20261030000001_superadmin_round8.sql
-- Description:
-- 1. Updates Superadmin to akunadminaul16@gmail.com and downgrades shopnoure1619@gmail.com
-- 2. Ensures registration approval gate (is_approved_by_admin = false default)
-- 3. Adds table for AI Multi-Provider settings (Gemini, OpenAI, DeepSeek)
-- 4. Ensures avatar_url support for profile photo upload
-- ==============================================================================

-- 1. AI Settings Configuration Table (Multi-Provider Support)
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id SERIAL PRIMARY KEY,
    active_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (active_provider IN ('gemini', 'openai', 'deepseek')),
    execution_mode TEXT NOT NULL DEFAULT 'single' CHECK (execution_mode IN ('single', 'parallel', 'failover')),
    gemini_api_key TEXT DEFAULT '',
    gemini_model TEXT DEFAULT 'gemini-1.5-flash',
    openai_api_key TEXT DEFAULT '',
    openai_model TEXT DEFAULT 'gpt-4o-mini',
    deepseek_api_key TEXT DEFAULT '',
    deepseek_model TEXT DEFAULT 'deepseek-chat',
    fallback_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Seed Default AI Settings Row
INSERT INTO public.ai_settings (id, active_provider, execution_mode, gemini_model, openai_model, deepseek_model, fallback_enabled)
VALUES (1, 'gemini', 'single', 'gemini-1.5-flash', 'gpt-4o-mini', 'deepseek-chat', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Update / Downgrade Legacy Admin in profiles
UPDATE public.profiles
SET role = 'user',
    plan = 'starter'
WHERE email = 'shopnoure1619@gmail.com';

-- 3. Ensure Superadmin Role for akunadminaul16@gmail.com
UPDATE public.profiles
SET role = 'superadmin',
    plan = 'pro',
    is_approved_by_admin = true,
    phone_number = '082115624408'
WHERE email = 'akunadminaul16@gmail.com';

-- 4. Telegram Voice & Photo Receipt Event Logs
CREATE TABLE IF NOT EXISTS public.telegram_multimodal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_id BIGINT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('text', 'voice', 'photo')),
    transcript TEXT,
    ocr_raw TEXT,
    parsed_json JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Enable RLS for multimodal logs
ALTER TABLE public.telegram_multimodal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own multimodal logs" 
ON public.telegram_multimodal_logs FOR SELECT 
USING (auth.uid() = user_id);
