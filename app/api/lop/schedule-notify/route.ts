import { NextResponse, type NextRequest } from "next/server";
import { createLopServerClient } from "@/lib/lop/supabase";
import nodemailer from "nodemailer";

/**
 * POST /api/lop/schedule-notify
 *
 * Sends scheduling notification emails to:
 * 1. Facility director (director_email on lop_facilities)
 * 2. Front desk (front_desk_email on lop_facilities)
 * 3. Patient (email on lop_patients)
 *
 * Body: { patientId: string }
 */
export async function POST(request: NextRequest) {
  try {
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
        "first_name, last_name, email, expected_arrival, arrival_window_min, facility_id, lop_facilities(name, director_email, front_desk_email), lop_law_firms(name)",
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

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No notification recipients found (no facility or patient emails configured).",
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

    // Send to patient
    if (patientEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@getfocushealth.com",
        to: patientEmail,
        subject: `Your Upcoming Visit – ${facilityName}`,
        html: patientHtml,
      });
      sentCount += 1;
    }

    // Log each notification
    for (const r of recipients) {
      await supabase.from("lop_audit_log").insert({
        action: "schedule_notification_sent",
        entity_type: "patient",
        entity_id: patientId,
        facility_id: patient.facility_id,
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
