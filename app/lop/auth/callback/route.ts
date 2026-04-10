import { NextResponse, type NextRequest } from "next/server";

/**
 * Fallback redirect — the real OAuth callback is handled on /lop/login.
 * If a user lands here (e.g. stale bookmark), forward them to login
 * with the code so it can be exchanged client-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/lop";

  if (code) {
    // Forward code to the login page which handles exchange client-side
    const loginUrl = new URL("/lop/login", origin);
    loginUrl.searchParams.set("code", code);
    loginUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL("/lop/login", origin));
}
