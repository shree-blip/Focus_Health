"use client";

/**
 * Legacy file — lopClient was the Supabase browser client.
 * Now LOP uses API routes backed by Cloud SQL.
 * This stub prevents import errors in files not yet updated.
 */

const storageNotImpl = () => { throw new Error("Supabase storage removed. Use Cloud Storage API instead."); };

// No-op stub for any remaining references
export const lopClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: (_bucket: string) => ({
      upload: storageNotImpl,
      getPublicUrl: storageNotImpl,
      remove: storageNotImpl,
    }),
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
