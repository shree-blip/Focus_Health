import { NextResponse } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";

export async function GET() {
  const auth = await requireLopAuth();
  if (!auth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: auth.lopUser.id,
      email: auth.lopUser.email,
      full_name: auth.lopUser.full_name,
      role: auth.lopUser.role,
    },
  });
}
