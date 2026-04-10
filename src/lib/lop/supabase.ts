import { createClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Server-side Supabase client with service role for LOP admin operations.
 * Uses `any` for the Database generic because the LOP tables are added
 * via a custom migration and are not yet in the auto-generated types.
 * Once you run `supabase gen types` and merge the output into
 * `src/integrations/supabase/types.ts`, you can remove the `any` cast.
 */
export function createLopServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<any>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client-side Supabase client re-exported as an `any`-typed instance.
 * Lazy-loaded to avoid importing the browser client in server-only modules.
 */
export function getLopClient() {
  // Dynamic require so server-only API routes don't trigger the browser client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabase } = require("@/integrations/supabase/client");
  return supabase as ReturnType<typeof createClient<any>>;
}
