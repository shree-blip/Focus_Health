import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import twilio from "twilio";

/**
 * POST /api/lop/sms-test
 *
 * Admin-only diagnostic endpoint to test Twilio SMS delivery.
 * Body: { phone: "2145551234" }
 * Returns detailed status about env vars, phone parsing, and Twilio response.
 */

function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireLopAuth();
    if (!auth || auth.lopUser.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { phone } = await request.json();

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_FROM_NUMBER;
    const parsed = phone ? toE164(phone) : null;

    const diagnostics: Record<string, unknown> = {
      step1_envVars: {
        TWILIO_ACCOUNT_SID: twilioSid ? `${twilioSid.substring(0, 8)}...` : "NOT SET",
        TWILIO_AUTH_TOKEN: twilioToken ? "SET (hidden)" : "NOT SET",
        TWILIO_FROM_NUMBER: twilioFrom ?? "NOT SET",
      },
      step2_phone: {
        rawInput: phone ?? "NOT PROVIDED",
        parsedE164: parsed ?? "PARSE FAILED",
      },
    };

    if (!twilioSid || !twilioToken || !twilioFrom) {
      return NextResponse.json({
        success: false,
        message: "Missing Twilio env vars. Add them in Vercel project settings → Environment Variables, then redeploy.",
        diagnostics,
      });
    }

    if (!parsed) {
      return NextResponse.json({
        success: false,
        message: "Phone number could not be parsed to E.164. Enter a 10-digit US number.",
        diagnostics,
      });
    }

    // Attempt to send a real test SMS
    try {
      const client = twilio(twilioSid, twilioToken);
      const msg = await client.messages.create({
        body: "Focus Health SMS test – if you received this, SMS is working correctly!",
        from: twilioFrom,
        to: parsed,
      });

      diagnostics.step3_twilio = {
        messageSid: msg.sid,
        status: msg.status,
        dateCreated: msg.dateCreated,
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage,
      };

      return NextResponse.json({
        success: true,
        message: `SMS sent! SID: ${msg.sid}, status: ${msg.status}`,
        diagnostics,
      });
    } catch (twilioErr: unknown) {
      const err = twilioErr as Record<string, unknown>;
      diagnostics.step3_twilio = {
        error: err.message ?? String(twilioErr),
        code: err.code ?? "unknown",
        status: err.status ?? "unknown",
        moreInfo: err.moreInfo ?? null,
      };

      return NextResponse.json({
        success: false,
        message: `Twilio error: ${err.message ?? twilioErr}`,
        diagnostics,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Diagnostic failed", detail: String(error) },
      { status: 500 },
    );
  }
}
