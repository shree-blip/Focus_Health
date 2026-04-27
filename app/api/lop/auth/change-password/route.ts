import { NextRequest, NextResponse } from "next/server";
import { hashSync, compareSync } from "bcryptjs";
import pool from "@/lib/db";
import { requireLopAuth } from "@/lib/lop/server-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    const email = auth.lopUser.email.toLowerCase();

    if (!newPassword || String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already has a password set
    const authRes = await pool.query(
      `SELECT password_hash FROM lop_auth_users WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );
    const existing = authRes.rows[0] as { password_hash: string } | undefined;

    // If they already have a password, require current password verification
    if (existing) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }
      if (!compareSync(String(currentPassword), existing.password_hash)) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    const passwordHash = hashSync(String(newPassword), 10);

    await pool.query(
      `INSERT INTO lop_auth_users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, passwordHash]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
