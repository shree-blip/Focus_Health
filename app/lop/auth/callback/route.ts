import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_DOMAINS = [
  "getfocushealth.com",
  "focusyourfinance.com",
  "erofwhiterock.com",
  "erofirving.com",
  "eroflufkin.com",
];

function isDomainAllowed(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? ALLOWED_DOMAINS.includes(domain) : false;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/lop";

  if (!code) {
    return NextResponse.redirect(
      new URL("/lop/login?error=no_code", origin),
    );
  }

  const response = NextResponse.redirect(new URL(redirect, origin));

  // ——— 1. Exchange auth code for session (reads PKCE verifier from cookies) ———
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Code exchange failed:", error);
    return NextResponse.redirect(
      new URL(
        `/lop/login?error=${encodeURIComponent(error?.message || "exchange_failed")}`,
        origin,
      ),
    );
  }

  // ——— 2. Provision LOP user (service-role client bypasses RLS) ———
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const user = data.session.user;
    const authId = user.id;
    const email = (user.email || "").toLowerCase();
    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      email.split("@")[0] ??
      "Unknown";

    // Step A: Already exists by auth_user_id?
    const { data: existingById } = await admin
      .from("lop_users")
      .select("id")
      .eq("auth_user_id", authId)
      .single();

    if (!existingById) {
      // Step B: Exists by email? Link auth_user_id
      const { data: existingByEmail } = await admin
        .from("lop_users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingByEmail) {
        await admin
          .from("lop_users")
          .update({ auth_user_id: authId })
          .eq("id", existingByEmail.id);
      } else if (isDomainAllowed(email)) {
        // Step C: Auto-provision new user
        const { data: newUser } = await admin
          .from("lop_users")
          .insert({
            auth_user_id: authId,
            email,
            full_name: fullName,
            role: "front_desk",
            is_active: true,
          })
          .select("id")
          .single();

        // Assign all active facilities
        if (newUser) {
          const { data: facilities } = await admin
            .from("lop_facilities")
            .select("id")
            .eq("is_active", true);

          if (facilities && facilities.length > 0) {
            await admin.from("lop_user_facilities").insert(
              facilities.map((f: { id: string }) => ({
                user_id: newUser.id,
                facility_id: f.id,
              })),
            );
          }
        }
      }
      // If domain not allowed and no existing record, user will see "Access Denied"
      // in the dashboard layout (LopAuthProvider won't find a lop_users row).
    }
  } catch (provisionErr) {
    // Log but don't block — session is valid, they just might lack lop_users row
    console.error("User provisioning error:", provisionErr);
  }

  return response;
}
