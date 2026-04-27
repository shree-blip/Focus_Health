"use client";

/**
 * Legacy file — lopClient was the Supabase browser client.
 * Now LOP uses API routes backed by Cloud SQL.
 * This stub prevents import errors in files not yet updated.
 */

// No-op stub for any remaining references
export const lopClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as unknown as ReturnType<typeof import("@supabase/supabase-js").createClient<never>>;
