import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import pool from "@/lib/db";
import nodemailer from "nodemailer";

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
    // Only medical_records and admin can send reminders
    if (!["medical_records", "admin"].includes(auth.lopUser.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { patientId, lawFirmId } = await request.json();
    if (!patientId || !lawFirmId) {
      return NextResponse.json(
        { error: "patientId and lawFirmId are required." },
        { status: 400 }
      );
    }

    // Fetch patient with facility name
    const patientRes = await pool.query(
      `SELECT p.first_name, p.last_name, p.facility_id, f.name AS facility_name
       FROM lop_patients p
       LEFT JOIN lop_facilities f ON f.id = p.facility_id
       WHERE p.id = $1`,
      [patientId]
    );
    const patient = patientRes.rows[0];
    if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

    // Fetch law firm
    const firmRes = await pool.query(
      `SELECT name, intake_email, escalation_email FROM lop_law_firms WHERE id = $1`,
      [lawFirmId]
    );
    const firm = firmRes.rows[0];
    if (!firm?.intake_email) {
      return NextResponse.json({ error: "Law firm has no intake email." }, { status: 400 });
    }

    const facilityName = patient.facility_name ?? "Focus Health ER";
    const patientName = `${patient.first_name} ${patient.last_name}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `LOP Letter Request – ${patientName} – ${facilityName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">LOP Letter Request</h2>
        <p>Dear ${firm.name},</p>
        <p>We are requesting the Letter of Protection (LOP) for the following patient:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Patient</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${patientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Facility</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${facilityName}</td>
          </tr>
        </table>
        <p>Please send the LOP letter at your earliest convenience. If you have any questions, please contact our medical records team.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          This is an automated message from Focus Health LOP Dashboard.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "noreply@getfocushealth.com",
      to: firm.intake_email,
      cc: firm.escalation_email ?? undefined,
      subject,
      html,
    });

    // HIPAA: Log the reminder action with IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await pool.query(
      `INSERT INTO lop_audit_log (user_id, action, entity_type, entity_id, ip_address, new_values)
       VALUES ($1, 'send_lop_reminder', 'patient', $2, $3, $4)`,
      [auth.lopUser.id, patientId, ip, JSON.stringify({ law_firm_id: lawFirmId, recipient: firm.intake_email })]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder email." },
      { status: 500 }
    );
  }
}
