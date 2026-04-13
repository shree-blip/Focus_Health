import { NextResponse, type NextRequest } from "next/server";
import { createLopServerClient } from "@/lib/lop/supabase";
import { requireLopAuth } from "@/lib/lop/server-auth";
import nodemailer from "nodemailer";
import twilio from "twilio";

/**
 * POST /api/lop/schedule-notify
 *
 * HIPAA: Requires authenticated LOP user (scheduler, front_desk, or admin).
 *
 * Sends scheduling notifications to:
 * 1. Facility director — email
 * 2. Front desk — email
 * 3. Patient — email + SMS (if phone on file)
 *
 * Body: { patientId: string }
 */

/** Normalize a phone number to E.164 (+1XXXXXXXXXX) for Twilio. Returns null if unparseable. */
function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
export async function POST(request: NextRequest) {
  try {
    // HIPAA: Authenticate from session cookie
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    // Only scheduler, front_desk, and admin can send scheduling notifications
    if (!["scheduler", "front_desk", "admin"].includes(auth.lopUser.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { patientId } = await request.json();
    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required." },
        { status: 400 },
      );
    }

    const supabase = createLopServerClient();

    // Fetch patient with facility and law firm info
    const { data: patient } = await supabase
      .from("lop_patients")
      .select(
        "first_name, last_name, email, phone, expected_arrival, arrival_window_min, facility_id, lop_facilities(name, director_email, front_desk_email), lop_law_firms(name)",
      )
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const facility = patient.lop_facilities as unknown as {
      name: string;
      director_email: string | null;
      front_desk_email: string | null;
    } | null;

    const facilityName = facility?.name ?? "Focus Health ER";
    const lawFirmName =
      (patient.lop_law_firms as unknown as { name: string } | null)?.name ?? "N/A";
    const patientName = `${patient.first_name} ${patient.last_name}`;

    // Format arrival time
    const arrivalDate = patient.expected_arrival
      ? new Date(patient.expected_arrival)
      : null;
    const arrivalStr = arrivalDate
      ? arrivalDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Not scheduled";
    const windowMin = patient.arrival_window_min ?? 60;

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_FROM_NUMBER;
    const patientPhone = patient.phone ? toE164(patient.phone) : null;

    // Build recipient list
    const recipients: { email: string; type: string }[] = [];
    if (facility?.director_email) {
      recipients.push({ email: facility.director_email, type: "director" });
    }
    if (facility?.front_desk_email) {
      recipients.push({ email: facility.front_desk_email, type: "front_desk" });
    }
    if (patient.email) {
      recipients.push({ email: patient.email, type: "patient" });
    }

    const hasSmsRecipient = Boolean(
      twilioSid && twilioToken && twilioFrom && patientPhone,
    );

    if (recipients.length === 0 && !hasSmsRecipient) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message:
          "No notification recipients found (no facility or patient emails configured, and no SMS recipient available).",
      });
    }

    // Build email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `LOP Patient Scheduled – ${patientName} – ${facilityName}`;

    // Staff email (director + front desk)
    const staffHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">LOP Patient Scheduled</h2>
        <p>A new LOP patient has been scheduled at <strong>${facilityName}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Patient</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${patientName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Expected Arrival</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${arrivalStr}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Arrival Window</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${windowMin} minutes</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Law Firm</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lawFirmName}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          This is an automated notification from Focus Health LOP Dashboard.
        </p>
      </div>
    `;

    // Patient email — friendlier tone, no internal details
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Your Visit at ${facilityName}</h2>
        <p>Dear ${patient.first_name},</p>
        <p>You have been scheduled for a visit at <strong>${facilityName}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Expected Time</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${arrivalStr}</td></tr>
        </table>
        <p>Please note that emergency patients may affect scheduling. We appreciate your patience and understanding.</p>
        <p>If you have any questions, please contact our team.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          Focus Health
        </p>
      </div>
    `;

    const staffEmails = recipients
      .filter((r) => r.type !== "patient")
      .map((r) => r.email);
    const patientEmail = recipients.find((r) => r.type === "patient")?.email;

    let sentCount = 0;

    // Send to staff
    if (staffEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@getfocushealth.com",
        to: staffEmails.join(", "),
        subject,
        html: staffHtml,
      });
      sentCount += staffEmails.length;
    }

    // Send to patient (email)
    if (patientEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@getfocushealth.com",
        to: patientEmail,
        subject: `Your Upcoming Visit – ${facilityName}`,
        html: patientHtml,
      });
      sentCount += 1;
    }

    // Send to patient (SMS via Twilio)
    if (twilioSid && twilioToken && twilioFrom && patientPhone) {
      try {
        const twilioClient = twilio(twilioSid, twilioToken);
        const smsBody = `Hi ${patient.first_name}, your visit at ${facilityName} is scheduled for ${arrivalStr}. Reply STOP to opt out.`;
        await twilioClient.messages.create({
          body: smsBody,
          from: twilioFrom,
          to: patientPhone,
        });
        sentCount += 1;

        // Audit log the SMS
        const ipSms = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
        await supabase.from("lop_audit_log").insert({
          user_id: auth.lopUser.id,
          action: "schedule_sms_sent",
          entity_type: "patient",
          entity_id: patientId,
          facility_id: patient.facility_id,
          ip_address: ipSms,
          new_values: {
            recipient_type: "patient_sms",
            phone: patientPhone,
            expected_arrival: patient.expected_arrival,
          },
        });
      } catch (smsErr) {
        // Don't fail the whole request if SMS fails — log and continue
        console.error("Twilio SMS error:", smsErr);
      }
    }

    // HIPAA: Log each notification with user + IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    for (const r of recipients) {
      await supabase.from("lop_audit_log").insert({
        user_id: auth.lopUser.id,
        action: "schedule_notification_sent",
        entity_type: "patient",
        entity_id: patientId,
        facility_id: patient.facility_id,
        ip_address: ip,
        new_values: {
          recipient_type: r.type,
          recipient_email: r.email,
          expected_arrival: patient.expected_arrival,
        },
      });
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error) {
    console.error("Schedule notification error:", error);
    return NextResponse.json(
      { error: "Failed to send scheduling notification." },
      { status: 500 },
    );
  }
}
