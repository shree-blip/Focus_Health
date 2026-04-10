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
 * Client-side Supabase client re-exported as an `any`-typed instance
 * so LOP table queries compile before the generated types are updated.
 */
import { supabase } from "@/integrations/supabase/client";
export const lopClient = supabase as ReturnType<typeof createClient<any>>;
