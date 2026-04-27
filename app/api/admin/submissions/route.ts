import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const admin = verifyAdminSessionToken(token);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query(
    `SELECT * FROM admin_submissions ORDER BY created_at DESC LIMIT 500`
  );
  return NextResponse.json(rows);
}
