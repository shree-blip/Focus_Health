// Supabase browser client using @supabase/ssr (cookie-based auth).
// This ensures PKCE code verifiers and session tokens are stored in cookies,
// making them available to both the browser and server (middleware, callbacks).
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  '';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Lazy-initialised singleton so the module can be imported at build time
// without throwing when env vars are absent during static generation.
let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        'Supabase URL and key must be set via NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or _DEFAULT_KEY) environment variables.'
      );
    }
    // createBrowserClient automatically sets flowType:'pkce' and stores
    // auth data (including PKCE verifier) in cookies via document.cookie.
    _supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// Proxy object that lazily creates the client on first property access.
// This allows the module to be imported during static build without error.
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});