import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import pool from "@/lib/db";
import {
  LOP_SESSION_COOKIE,
  createLopSessionToken,
  getLopSessionCookieOptions,
} from "@/lib/lop/lop-auth";

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const otpCode = String(code ?? "").trim();

    if (!normalizedEmail || !otpCode) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const otpRes = await pool.query(
      `SELECT id, code_hash, expires_at, attempts
       FROM lop_auth_otp_codes
       WHERE LOWER(email) = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedEmail]
    );

    const otp = otpRes.rows[0] as
      | { id: number; code_hash: string; expires_at: string; attempts: number }
      | undefined;

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 401 });
    }

    const expectedHash = otp.code_hash;
    const providedHash = hashOtp(otpCode);

    if (providedHash !== expectedHash) {
      await pool.query(
        `UPDATE lop_auth_otp_codes
         SET attempts = attempts + 1,
             used_at = CASE WHEN attempts + 1 >= 5 THEN NOW() ELSE used_at END
         WHERE id = $1`,
        [otp.id]
      );
      return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 401 });
    }

    const userRes = await pool.query(
      `SELECT id, email, full_name, role, is_active
       FROM lop_users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    const user = userRes.rows[0] as
      | { id: string; email: string; full_name: string; role: string; is_active: boolean }
      | undefined;

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Account is not allowed" }, { status: 403 });
    }

    await pool.query(`UPDATE lop_auth_otp_codes SET used_at = NOW() WHERE id = $1`, [otp.id]);

    await pool.query(
      `INSERT INTO lop_auth_users (email, password_hash, last_login)
       VALUES ($1, 'otp-only', NOW())
       ON CONFLICT (email)
       DO UPDATE SET last_login = NOW()`,
      [normalizedEmail]
    );

    const token = createLopSessionToken({
      lopUserId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
    res.cookies.set(LOP_SESSION_COOKIE, token, getLopSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("LOP OTP verify error:", err);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
