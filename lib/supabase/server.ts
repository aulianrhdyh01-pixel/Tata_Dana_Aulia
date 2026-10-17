// ==============================================================================
// TataDana: Server Supabase Client (App Router & Route Handlers)
// ==============================================================================

import { mockSupabaseClient } from './mock-client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

/**
 * Returns a Supabase server client (or fallback mock client)
 */
export async function createServerClient() {
  if (isMockConfigured()) {
    return mockSupabaseClient as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}
