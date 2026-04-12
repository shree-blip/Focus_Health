import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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

export async function POST(request: NextRequest) {
  try {
    const { auth_user_id, email, full_name } = await request.json();

    if (!auth_user_id || !email) {
      return NextResponse.json(
        { error: "auth_user_id and email are required" },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    // Verify this auth_user_id actually exists in Supabase Auth
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(auth_user_id);

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: "Invalid auth user" },
        { status: 401 },
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Step 1: Check by auth_user_id
    const { data: existingById } = await admin
      .from("lop_users")
      .select("*")
      .eq("auth_user_id", auth_user_id)
      .single();

    if (existingById) {
      return NextResponse.json({ user: existingById });
    }

    // Step 2: Check by email and link auth_user_id
    if (normalizedEmail) {
      const { data: existingByEmail } = await admin
        .from("lop_users")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (existingByEmail) {
        const { data: linked } = await admin
          .from("lop_users")
          .update({ auth_user_id })
          .eq("id", existingByEmail.id)
          .select("*")
          .single();

        return NextResponse.json({ user: linked || existingByEmail });
      }
    }

    // Step 3: Auto-provision if domain is allowed
    if (normalizedEmail && isDomainAllowed(normalizedEmail)) {
      const { data: newUser, error: insertError } = await admin
        .from("lop_users")
        .insert({
          auth_user_id,
          email: normalizedEmail,
          full_name: full_name || normalizedEmail.split("@")[0],
          role: "front_desk",
          is_active: true,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Provision insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create account: " + insertError.message },
          { status: 500 },
        );
      }

      // HIPAA: Do NOT auto-assign all facilities.
      // New users start with zero facility access.
      // An admin must explicitly assign facilities (minimum-necessary principle).
      // Log the auto-provisioning event.
      if (newUser) {
        await admin.from("lop_audit_log").insert({
          action: "user_auto_provisioned",
          entity_type: "user",
          entity_id: newUser.id,
          new_values: {
            email: normalizedEmail,
            role: "front_desk",
            note: "Auto-provisioned — awaiting admin facility assignment",
          },
        });
      }

      return NextResponse.json({ user: newUser });
    }

    // Domain not allowed
    return NextResponse.json(
      {
        error:
          "Your email domain is not authorized for the LOP Dashboard. Contact your administrator.",
      },
      { status: 403 },
    );
  } catch (err) {
    console.error("Provision error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
