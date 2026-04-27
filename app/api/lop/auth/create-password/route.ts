import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const plainPassword = String(password ?? "");

    if (!normalizedEmail || !plainPassword) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (plainPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const userRes = await pool.query(
      `SELECT id, is_active FROM lop_users WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );

    const lopUser = userRes.rows[0] as { id: string; is_active: boolean } | undefined;
    if (!lopUser) {
      return NextResponse.json(
        { error: "No LOP account found for this email. Contact your administrator." },
        { status: 403 }
      );
    }

    if (!lopUser.is_active) {
      return NextResponse.json({ error: "Your account is inactive. Contact your administrator." }, { status: 403 });
    }

    const passwordHash = hashSync(plainPassword, 10);

    await pool.query(
      `INSERT INTO lop_auth_users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [normalizedEmail, passwordHash]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create password error:", err);
    return NextResponse.json({ error: "Failed to create password" }, { status: 500 });
  }
}
