import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import pool from "@/lib/db";
import nodemailer from "nodemailer";
import twilio from "twilio";

/**
 * POST /api/lop/schedule-notify
 *
 * HIPAA: Requires authenticated LOP user (scheduler, front_desk, or admin).
 *
 * Sends expected-walk-in notifications to:
 * 1. Facility director — email
 * 2. Front desk — email
 * 3. Patient — email + SMS (if phone on file)
 *
 * Wording note: ER walk-in centers cannot offer "appointments" — these messages
 * frame the entry as an expected walk-in arrival window, not a guaranteed slot.
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

/** Build a Google Maps directions URL for a postal address. */
function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
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

    // Fetch patient with facility and law firm info
    const patientRes = await pool.query(
      `SELECT p.first_name, p.last_name, p.email, p.phone, p.expected_arrival, p.arrival_window_min, p.facility_id,
              f.name AS facility_name, f.address AS facility_address, f.phone AS facility_phone,
              f.director_email, f.front_desk_email, lf.name AS law_firm_name
       FROM lop_patients p
       LEFT JOIN lop_facilities f ON f.id = p.facility_id
       LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
       WHERE p.id = $1`,
      [patientId]
    );
    const patient = patientRes.rows[0];
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

    const facilityName = patient.facility_name ?? "Focus Health ER";
    const facilityAddress = patient.facility_address as string | null;
    const facilityPhone = patient.facility_phone as string | null;
    const lawFirmName = patient.law_firm_name ?? "N/A";
    const patientName = `${patient.first_name} ${patient.last_name}`;
    const facility = { name: facilityName, director_email: patient.director_email, front_desk_email: patient.front_desk_email };

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
      : "Not set";
    const windowMin = patient.arrival_window_min ?? 60;
    const mapsUrl = facilityAddress ? directionsUrl(facilityAddress) : null;

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

    const subject = `Expected Walk-In – ${patientName} – ${facilityName}`;

    const facilityLocationRow = facilityAddress
      ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Location</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${facilityAddress}${
          mapsUrl ? ` &middot; <a href="${mapsUrl}" style="color: #0B3B91;">Directions</a>` : ""
        }</td></tr>`
      : "";
    const facilityPhoneRow = facilityPhone
      ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Facility Phone</td><td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${facilityPhone.replace(/[^0-9+]/g, "")}" style="color: #0B3B91;">${facilityPhone}</a></td></tr>`
      : "";

    // Staff email (director + front desk)
    const staffHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Expected Walk-In</h2>
        <p>An LOP patient is expected to walk in at <strong>${facilityName}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Patient</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${patientName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Expected Arrival</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${arrivalStr}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Arrival Window</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${windowMin} minutes</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Law Firm</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${lawFirmName}</td></tr>
          ${facilityLocationRow}
          ${facilityPhoneRow}
        </table>
        <p style="color: #475569; font-size: 13px;">
          This is an expected walk-in, not a guaranteed appointment. Treatment order may shift if higher-acuity patients arrive.
        </p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          This is an automated notification from Focus Health LOP Dashboard.
        </p>
      </div>
    `;

    // Patient email — friendlier tone, no internal details
    const patientLocationBlock = facilityAddress
      ? `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Address</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${facilityAddress}${
            mapsUrl ? ` &middot; <a href="${mapsUrl}" style="color: #0B3B91;">Get directions</a>` : ""
          }</td></tr>
          ${facilityPhone ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${facilityPhone.replace(/[^0-9+]/g, "")}" style="color: #0B3B91;">${facilityPhone}</a></td></tr>` : ""}
        </table>`
      : "";

    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Your Walk-In at ${facilityName}</h2>
        <p>Dear ${patient.first_name},</p>
        <p>We are expecting your walk-in at <strong>${facilityName}</strong>. Please plan to arrive within the window below.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Expected Walk-In</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${arrivalStr}</td></tr>
        </table>
        ${patientLocationBlock}
        <p>This is an expected walk-in, not a guaranteed appointment. Higher-acuity emergencies may affect the order of care; we appreciate your patience.</p>
        <p>If you have questions, please call the facility directly using the number above.</p>
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
        subject: `Your Expected Walk-In – ${facilityName}`,
        html: patientHtml,
      });
      sentCount += 1;
    }

    // Send to patient (SMS via Twilio)
    console.log("[SMS DEBUG] twilioSid?", !!twilioSid, "twilioToken?", !!twilioToken, "twilioFrom?", twilioFrom, "patientPhone?", patientPhone, "rawPhone?", patient.phone);
    if (twilioSid && twilioToken && twilioFrom && patientPhone) {
      try {
        const twilioClient = twilio(twilioSid, twilioToken);
        // SMS includes address + facility phone when available; kept under 320 chars to stay within 2 SMS segments.
        const smsLocation = facilityAddress ? ` Address: ${facilityAddress}.` : "";
        const smsCall = facilityPhone ? ` Call ${facilityPhone} with questions.` : "";
        const smsBody = `Hi ${patient.first_name}, ${facilityName} is expecting your walk-in around ${arrivalStr}. This is not a guaranteed appointment.${smsLocation}${smsCall} Reply STOP to opt out.`;
        console.log("[SMS DEBUG] Sending SMS from", twilioFrom, "to", patientPhone);
        const msg = await twilioClient.messages.create({
          body: smsBody,
          from: twilioFrom,
          to: patientPhone,
        });
        console.log("[SMS DEBUG] Twilio response SID:", msg.sid, "status:", msg.status);
        sentCount += 1;

        // Audit log the SMS
        const ipSms = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
        pool.query(
          `INSERT INTO lop_audit_log (user_id, action, entity_type, entity_id, facility_id, ip_address, new_values)
           VALUES ($1, 'schedule_sms_sent', 'patient', $2, $3, $4, $5)`,
          [auth.lopUser.id, patientId, patient.facility_id, ipSms, JSON.stringify({ recipient_type: "patient_sms", phone: patientPhone, twilio_sid: msg.sid, expected_arrival: patient.expected_arrival })]
        ).catch(console.error);
      } catch (smsErr: unknown) {
        // Log full Twilio error details
        const errMsg = smsErr instanceof Error ? smsErr.message : String(smsErr);
        const errCode = (smsErr as Record<string, unknown>)?.code ?? "unknown";
        const errStatus = (smsErr as Record<string, unknown>)?.status ?? "unknown";
        console.error("[SMS DEBUG] Twilio SMS FAILED:", errMsg, "code:", errCode, "status:", errStatus, "full:", JSON.stringify(smsErr, null, 2));

        // Also log the failure to the audit log so admin can see it
        const ipSmsErr = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
        pool.query(
          `INSERT INTO lop_audit_log (user_id, action, entity_type, entity_id, facility_id, ip_address, new_values)
           VALUES ($1, 'schedule_sms_failed', 'patient', $2, $3, $4, $5)`,
          [auth.lopUser.id, patientId, patient.facility_id, ipSmsErr, JSON.stringify({ recipient_type: "patient_sms", phone: patientPhone, error: errMsg, twilio_error_code: errCode })]
        ).catch(console.error);
      }
    } else {
      console.warn("[SMS DEBUG] SMS skipped — missing config or phone. twilioSid?", !!twilioSid, "twilioToken?", !!twilioToken, "twilioFrom?", !!twilioFrom, "patientPhone?", patientPhone);
    }

    // HIPAA: Log each notification with user + IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    for (const r of recipients) {
      pool.query(
        `INSERT INTO lop_audit_log (user_id, action, entity_type, entity_id, facility_id, ip_address, new_values)
         VALUES ($1, 'schedule_notification_sent', 'patient', $2, $3, $4, $5)`,
        [auth.lopUser.id, patientId, patient.facility_id, ip, JSON.stringify({ recipient_type: r.type, recipient_email: r.email, expected_arrival: patient.expected_arrival })]
      ).catch(console.error);
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
