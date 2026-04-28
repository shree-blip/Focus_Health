import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireLopAuth } from "@/lib/lop/server-auth";

export async function GET() {
  const auth = await requireLopAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = auth.lopUser.email.toLowerCase();
  const res = await pool.query(
    `SELECT password_hash FROM lop_auth_users WHERE LOWER(email) = $1 LIMIT 1`,
    [email]
  );
  const row = res.rows[0] as { password_hash: string | null } | undefined;
  return NextResponse.json({ hasPassword: !!row?.password_hash });
}
