import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { query, queryOne } from "@/lib/db";
import { createLopSessionToken, getLopSessionCookieOptions, LOP_SESSION_COOKIE } from "@/lib/lop/lop-auth";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const email = payload.email.toLowerCase();

    // Look up user in lop_users
    const user = await queryOne<{
      id: string;
      email: string;
      full_name: string | null;
      role: string;
      is_active: boolean;
    }>(
      `SELECT id, email, full_name, role, is_active FROM lop_users WHERE LOWER(email) = $1`,
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: "No LOP account found for this Google account. Contact your administrator." },
        { status: 403 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Your account is inactive. Contact your administrator." }, { status: 403 });
    }

    // Upsert into lop_auth_users (ensure they have a record, no password needed for Google users)
    await query(
      `INSERT INTO lop_auth_users (email, password_hash)
       VALUES ($1, 'google-oauth')
       ON CONFLICT (email) DO NOTHING`,
      [email]
    );

    // Update last_login
    await query(`UPDATE lop_auth_users SET last_login = NOW() WHERE email = $1`, [email]);

    // Create HMAC session token
    const token = createLopSessionToken({
      lopUserId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
    res.cookies.set(LOP_SESSION_COOKIE, token, getLopSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
