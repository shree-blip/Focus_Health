import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify the authenticated user from the session cookie (server-side).
 * This is the ONLY trusted way to identify a user in API routes.
 *
 * HIPAA: Never trust client-supplied auth_user_id — always verify from the cookie.
 *
 * Returns { authUserId, email, aal } or null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<{
  authUserId: string;
  email: string;
  aal: string;
} | null> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // API routes are read-only for cookies in this context
          },
        },
      },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // HIPAA: Check MFA assurance level
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const aal = aalData?.currentLevel ?? "aal1";

    return {
      authUserId: user.id,
      email: user.email ?? "",
      aal,
    };
  } catch {
    return null;
  }
}

/**
 * Get the admin (service-role) Supabase client.
 * Bypasses RLS — use only on the server after authentication.
 */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Verify a user is an active LOP user and return their record.
 * Uses the admin client to query lop_users by auth_user_id.
 */
export async function getLopUser(authUserId: string) {
  const admin = getAdminClient();
  const { data } = await admin
    .from("lop_users")
    .select("id, role, is_active, email, full_name")
    .eq("auth_user_id", authUserId)
    .single();

  if (!data || !data.is_active) return null;
  return data as {
    id: string;
    role: string;
    is_active: boolean;
    email: string;
    full_name: string;
  };
}

/**
 * Full auth check: cookie → auth user → LOP user lookup.
 * Returns { authUserId, lopUser } or null.
 *
 * NOTE: MFA (AAL2) enforcement is handled by middleware.ts which CAN
 * read/write cookies for token refresh. API routes have read-only cookies
 * (setAll is a no-op), so getAuthenticatorAssuranceLevel() can return
 * stale AAL1 after a token refresh. Enforcing AAL2 here would block
 * all data fetching for users who already passed the middleware MFA check.
 */
export async function requireLopAuth() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return null;

  const lopUser = await getLopUser(authUser.authUserId);
  if (!lopUser) return null;

  return { authUserId: authUser.authUserId, lopUser };
}
