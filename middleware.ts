import { NextResponse, type NextRequest } from "next/server";
import { verifyLopSessionToken, LOP_SESSION_COOKIE } from "@/lib/lop/lop-auth";

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

  const token = request.cookies.get(LOP_SESSION_COOKIE)?.value;
  const payload = token ? verifyLopSessionToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/lop/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lop/:path*"],
};
