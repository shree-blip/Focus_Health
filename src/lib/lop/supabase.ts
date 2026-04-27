/**
 * Legacy file — was Supabase client. Now re-exports Cloud SQL helpers.
 * Kept to avoid breaking imports.
 */
export { query as lopQuery, queryOne as lopQueryOne } from "@/lib/db";

/** @deprecated Use Cloud SQL via @/lib/db instead */
export function createLopServerClient(): never {
  throw new Error("createLopServerClient removed. Use Cloud SQL via @/lib/db.");
}

/** @deprecated */
export function getLopClient(): never {
  throw new Error("getLopClient removed. Use API routes backed by Cloud SQL.");
}
