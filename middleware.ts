import { NextResponse, type NextRequest } from "next/server";

// Cookie name must match lop-auth.ts — kept inline to avoid importing Node.js
// crypto/Buffer into Edge Runtime (middleware runs on Edge).
const LOP_SESSION_COOKIE = "lop_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply LOP auth checks on /lop routes (except login and auth routes)
  if (
    !pathname.startsWith("/lop") ||
    pathname === "/lop/login" ||
    pathname.startsWith("/lop/auth") ||
    pathname === "/lop/mfa-setup"
  ) {
    return NextResponse.next();
  }

  // Edge-compatible check: verify the cookie exists and has the expected
  // "payload.signature" shape. Full HMAC verification happens in
  // requireLopAuth() inside each server-side API route handler.
  const token = request.cookies.get(LOP_SESSION_COOKIE)?.value;
  const parts = token?.split(".");
  const looksValid = parts?.length === 2 && parts[0].length > 0 && parts[1].length > 0;

  if (!looksValid) {
    const loginUrl = new URL("/lop/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lop/:path*"],
};
