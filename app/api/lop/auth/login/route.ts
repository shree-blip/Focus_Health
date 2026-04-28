import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import pool from "@/lib/db";
import {
  LOP_SESSION_COOKIE,
  createLopSessionToken,
  getLopSessionCookieOptions,
} from "@/lib/lop/lop-auth";

// ── Brute-force rate limiting ──────────────────────────────────────────────
// Max 10 failed attempts per IP within a 15-minute sliding window.
// Note: module-level state is per-instance. For multi-instance deployments
// this is still a meaningful deterrent even without shared state.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Look up auth user and ensure email exists in admin-managed lop_users list.
    const authRes = await pool.query(
      `SELECT la.id as auth_id, la.password_hash, lu.id as lop_id, lu.email, lu.full_name, lu.role, lu.is_active
       FROM lop_auth_users la
       JOIN lop_users lu ON LOWER(lu.email) = LOWER(la.email)
       WHERE LOWER(la.email) = $1
       LIMIT 1`,
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

    // Successful login — clear rate-limit counter for this IP
    clearAttempts(ip);

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
