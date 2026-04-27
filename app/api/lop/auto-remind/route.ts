import { NextResponse, type NextRequest } from "next/server";
import pool from "@/lib/db";
import nodemailer from "nodemailer";

/**
 * Automated email cron endpoint.
 * Call via Vercel Cron or external scheduler once daily.
 * For patients missing an LOP letter beyond the configured delay,
 * send a reminder email to the law firm and log it.
 */
export async function GET(request: NextRequest) {
  // Bearer-token auth for cron – always required in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch configured delay (defaults to 5 days)
  const configRes = await pool.query(`SELECT value FROM lop_config WHERE key = 'reminder_delay_days' LIMIT 1`);
  const delayDays = Number(configRes.rows[0]?.value ?? 5);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - delayDays);

  // Find patients missing LOP letter whose created_at is older than cutoff
  const patientsRes = await pool.query(
    `SELECT p.id, p.first_name, p.last_name, p.facility_id, p.law_firm_id, p.lop_letter_on_file, p.created_at,
            f.name AS facility_name, lf.name AS law_firm_name, lf.intake_email, lf.escalation_email
     FROM lop_patients p
     LEFT JOIN lop_facilities f ON f.id = p.facility_id
     LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
     WHERE p.lop_letter_on_file = FALSE AND p.case_status != 'dropped' AND p.created_at < $1`,
    [cutoff.toISOString()]
  );
  const patients = patientsRes.rows;

  if (!patients.length) {
    return NextResponse.json({ sent: 0, message: "No reminders needed." });
  }

  // Check if we already sent a reminder within the last `delayDays` period
  const patientIds = patients.map((p) => p.id);
  const remindersRes = await pool.query(
    `SELECT patient_id FROM lop_reminder_emails WHERE patient_id = ANY($1) AND sent_at >= $2`,
    [patientIds, cutoff.toISOString()]
  );
  const recentlyRemindedIds = new Set(remindersRes.rows.map((r) => r.patient_id));
  const toRemind = patients.filter((p) => !recentlyRemindedIds.has(p.id));

  if (!toRemind.length) {
    return NextResponse.json({
      sent: 0,
      message: "All eligible patients already reminded recently.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const patient of toRemind) {
    if (!patient.intake_email) continue;
    const firm = { name: patient.law_firm_name ?? "Law Firm", intake_email: patient.intake_email, escalation_email: patient.escalation_email };
    const facilityName = patient.facility_name ?? "Focus Health ER";
    const patientName = `${patient.first_name} ${patient.last_name}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@getfocushealth.com",
        to: firm.intake_email,
        cc: firm.escalation_email ?? undefined,
        subject: `[Reminder] LOP Letter Request – ${patientName} – ${facilityName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">LOP Letter Reminder</h2>
            <p>Dear ${firm.name},</p>
            <p>This is a follow-up reminder requesting the Letter of Protection (LOP) for:</p>
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
            <p>The LOP letter has been outstanding for more than ${delayDays} days. Please send it at your earliest convenience.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
              Automated reminder from Focus Health LOP Dashboard.
            </p>
          </div>
        `,
      });

      // Log the reminder
      await pool.query(
        `INSERT INTO lop_reminder_emails (patient_id, law_firm_id, sent_to, email_type) VALUES ($1, $2, $3, 'lop_request')`,
        [patient.id, patient.law_firm_id, firm.intake_email]
      );

      sent++;
    } catch (err) {
      errors.push(`Patient ${patient.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
