/**
 * LOP server-side auth helpers — Cloud SQL only, no Supabase.
 */
import { cookies } from "next/headers";
import { queryOne, query } from "@/lib/db";
import { LOP_SESSION_COOKIE, verifyLopSessionToken } from "./lop-auth";

export interface LopUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  ai_access: boolean;
}

/**
 * Verify auth from session cookie and return basic session info (no extra DB lookup).
 */
export async function getAuthenticatedUser(): Promise<{ authUserId: string; email: string; lopUserId: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(LOP_SESSION_COOKIE)?.value;
    const session = verifyLopSessionToken(token);
    if (!session) return null;
    return { authUserId: session.lopUserId, email: session.email, lopUserId: session.lopUserId };
  } catch {
    return null;
  }
}

/**
 * Run a raw query against lop_* tables (replaces getAdminClient()).
 */
export async function lopDbQuery<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  return query<T>(sql, params);
}

export async function lopDbQueryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
  return queryOne<T>(sql, params);
}

/** @deprecated Use lopDbQuery/lopDbQueryOne instead */
export function getAdminClient(): never {
  throw new Error("getAdminClient is removed. Use lopDbQuery from server-auth instead.");
}

/**
 * Get a LOP user by their id from Cloud SQL.
 */
export async function getLopUser(lopUserId: string) {
  return queryOne<LopUser>(
    `SELECT id, auth_user_id, email, full_name, role, is_active, ai_access
     FROM lop_users WHERE id = $1 AND is_active = TRUE`,
    [lopUserId]
  );
}

/**
 * Full auth check: cookie → session verify → LOP user lookup.
 * Returns { authUserId, lopUser } or null.
 */
export async function requireLopAuth(): Promise<{ authUserId: string; lopUser: LopUser } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(LOP_SESSION_COOKIE)?.value;
    const session = verifyLopSessionToken(token);
    if (!session) return null;

    const lopUser = await queryOne<LopUser>(
      `SELECT id, auth_user_id, email, full_name, role, is_active, ai_access
       FROM lop_users WHERE id = $1 AND is_active = TRUE`,
      [session.lopUserId]
    );
    if (!lopUser) return null;

    return { authUserId: session.lopUserId, lopUser };
  } catch {
    return null;
  }
}
