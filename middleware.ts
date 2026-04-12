import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply LOP auth checks on /lop routes (except login, auth callback, and MFA setup)
  if (
    !pathname.startsWith("/lop") ||
    pathname === "/lop/login" ||
    pathname.startsWith("/lop/auth") ||
    pathname === "/lop/mfa-setup"
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/lop/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // HIPAA: Enforce MFA — check Authenticator Assurance Level
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData) {
    const { currentLevel, nextLevel } = aalData;

    // If the user needs to verify MFA (has factors enrolled but hasn't verified this session)
    if (nextLevel === "aal2" && currentLevel === "aal1") {
      const mfaUrl = new URL("/lop/mfa-setup", request.url);
      mfaUrl.searchParams.set("step", "verify");
      mfaUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(mfaUrl);
    }

    // If the user hasn't enrolled any MFA factors yet, send them to enroll
    if (currentLevel === "aal1" && nextLevel === "aal1") {
      const mfaUrl = new URL("/lop/mfa-setup", request.url);
      mfaUrl.searchParams.set("step", "enroll");
      mfaUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(mfaUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/lop/:path*"],
};
