/**
 * LOP session auth — HMAC-signed cookies, no Supabase.
 * Cookie: lop_session = base64url(payload).HMAC_SHA256
 */
import { createHmac, timingSafeEqual } from "crypto";

const LOP_JWT_SECRET = process.env.LOP_JWT_SECRET || process.env.ADMIN_SESSION_SECRET || "lop-secret-change-me";
export const LOP_SESSION_COOKIE = "lop_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export interface LopSessionPayload {
  lopUserId: string;
  email: string;
  role: string;
  exp: number;
}

function sign(data: string): string {
  return createHmac("sha256", LOP_JWT_SECRET).update(data).digest("hex");
}

export function createLopSessionToken(payload: Omit<LopSessionPayload, "exp">): string {
  const full: LopSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encoded = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyLopSessionToken(token?: string | null): LopSessionPayload | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expected = sign(encoded);
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as LopSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getLopSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
