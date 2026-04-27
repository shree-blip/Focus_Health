import { NextResponse } from "next/server";
import { LOP_SESSION_COOKIE } from "@/lib/lop/lop-auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(LOP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
