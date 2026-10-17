// ==============================================================================
// TataDana: Browser Supabase Client (Online + Offline Mock Fallback)
// ==============================================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { mockSupabaseClient } from './mock-client';
import { Database } from '@/types/database';

function isMockConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return true;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return true;
  if (url.includes('your-supabase-project') || url.includes('mock.tatadana')) return true;
  return false;
}

export function createClient() {
  if (isMockConfigured()) {
    return mockSupabaseClient as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = createClient();
