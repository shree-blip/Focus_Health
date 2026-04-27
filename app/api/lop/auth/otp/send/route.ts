import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import nodemailer from "nodemailer";
import pool from "@/lib/db";

let otpTableReady = false;

async function ensureOtpTable() {
  if (otpTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lop_auth_otp_codes (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_lop_auth_otp_codes_email_created
    ON lop_auth_otp_codes (email, created_at DESC)
  `);

  otpTableReady = true;
}

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userRes = await pool.query(
      `SELECT id, email, is_active FROM lop_users WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );
    const user = userRes.rows[0] as { id: string; email: string; is_active: boolean } | undefined;

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: "No active LOP account found for this email." },
        { status: 403 }
      );
    }

    await ensureOtpTable();

    const code = generateOtpCode();
    const codeHash = hashOtp(code);

    await pool.query(
      `UPDATE lop_auth_otp_codes SET used_at = NOW()
       WHERE LOWER(email) = $1 AND used_at IS NULL`,
      [normalizedEmail]
    );

    await pool.query(
      `INSERT INTO lop_auth_otp_codes (email, code_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [normalizedEmail, codeHash]
    );

    await pool.query(`DELETE FROM lop_auth_otp_codes WHERE created_at < NOW() - INTERVAL '2 days'`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "Focus Health <noreply@getfocushealth.com>",
      to: normalizedEmail,
      subject: "Your Focus Health LOP login code",
      text: `Your one-time login code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your one-time login code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${code}</p><p>This code expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("LOP OTP send error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
