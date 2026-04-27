import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/lop/server-auth";
import pool from "@/lib/db";

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

export async function POST(_request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth_user_id = authUser.authUserId;
    const normalizedEmail = authUser.email.toLowerCase();

    // Step 1: Check by auth_user_id
    const byId = await pool.query(
      `SELECT * FROM lop_users WHERE auth_user_id = $1 LIMIT 1`,
      [auth_user_id]
    );
    if (byId.rows[0]) return NextResponse.json({ user: byId.rows[0] });

    // Step 2: Check by email and link auth_user_id
    const byEmail = await pool.query(
      `SELECT * FROM lop_users WHERE email = $1 LIMIT 1`,
      [normalizedEmail]
    );
    if (byEmail.rows[0]) {
      const linked = await pool.query(
        `UPDATE lop_users SET auth_user_id = $1 WHERE id = $2 RETURNING *`,
        [auth_user_id, byEmail.rows[0].id]
      );
      return NextResponse.json({ user: linked.rows[0] || byEmail.rows[0] });
    }

    // Step 3: Auto-provision if domain is allowed
    if (isDomainAllowed(normalizedEmail)) {
      const newUser = await pool.query(
        `INSERT INTO lop_users (auth_user_id, email, full_name, role, is_active)
         VALUES ($1, $2, $3, 'front_desk', TRUE) RETURNING *`,
        [auth_user_id, normalizedEmail, normalizedEmail.split("@")[0]]
      );

      if (newUser.rows[0]) {
        pool.query(
          `INSERT INTO lop_audit_log (action, entity_type, entity_id, new_values)
           VALUES ($1, 'user', $2, $3)`,
          [
            "user_auto_provisioned",
            newUser.rows[0].id,
            JSON.stringify({ email: normalizedEmail, role: "front_desk", note: "Auto-provisioned — awaiting admin facility assignment" }),
          ]
        ).catch(console.error);

        return NextResponse.json({ user: newUser.rows[0] });
      }
    }

    return NextResponse.json(
      { error: "Your email domain is not authorized for the LOP Dashboard. Contact your administrator." },
      { status: 403 }
    );
  } catch (err) {
    console.error("Provision error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

