import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import pool from "@/lib/db";
import {
  LOP_SESSION_COOKIE,
  createLopSessionToken,
  getLopSessionCookieOptions,
} from "@/lib/lop/lop-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Look up auth user
    const authRes = await pool.query(
      `SELECT la.id as auth_id, la.password_hash, lu.id as lop_id, lu.email, lu.full_name, lu.role, lu.is_active
       FROM lop_auth_users la
       JOIN lop_users lu ON lu.auth_user_id = la.id
       WHERE la.email = $1`,
      [email.toLowerCase()]
    );

    const user = authRes.rows[0];
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = compareSync(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    await pool.query(`UPDATE lop_auth_users SET last_login = NOW() WHERE id = $1`, [user.auth_id]);

    const token = createLopSessionToken({
      lopUserId: user.lop_id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.lop_id, email: user.email, full_name: user.full_name, role: user.role },
    });
    res.cookies.set(LOP_SESSION_COOKIE, token, getLopSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("LOP login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
