import { NextResponse, type NextRequest } from "next/server";
import { createLopServerClient } from "@/lib/lop/supabase";
import nodemailer from "nodemailer";

/**
 * Automated email cron endpoint.
 * Call via Vercel Cron or external scheduler once daily.
 * For patients missing an LOP letter beyond the configured delay,
 * send a reminder email to the law firm and log it.
 */
export async function GET(request: NextRequest) {
  // Simple bearer-token auth for cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createLopServerClient();

  // Fetch configured delay (defaults to 5 days)
  const { data: configRows } = await supabase
    .from("lop_config")
    .select("value")
    .eq("key", "reminder_delay_days")
    .single();
  const delayDays = Number(configRows?.value ?? 5);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - delayDays);

  // Find patients missing LOP letter whose created_at is older than cutoff
  const { data: rawPatients } = await supabase
    .from("lop_patients")
    .select(
      "id, first_name, last_name, facility_id, law_firm_id, lop_letter_on_file, created_at, " +
        "lop_facilities(name), lop_law_firms(name, intake_email, escalation_email)"
    )
    .eq("lop_letter_on_file", false)
    .neq("case_status", "dropped")
    .lt("created_at", cutoff.toISOString());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patients = (rawPatients ?? []) as any[];

  if (!patients.length) {
    return NextResponse.json({ sent: 0, message: "No reminders needed." });
  }

  // Check if we already sent a reminder within the last `delayDays` period
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientIds = patients.map((p: any) => p.id);
  const { data: rawReminders } = await supabase
    .from("lop_reminder_emails")
    .select("patient_id, sent_at")
    .in("patient_id", patientIds)
    .gte("sent_at", cutoff.toISOString());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentReminders = (rawReminders ?? []) as any[];

  const recentlyRemindedIds = new Set(
    recentReminders.map((r: { patient_id: string }) => r.patient_id)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toRemind = patients.filter((p: any) => !recentlyRemindedIds.has(p.id));

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
    const firm = patient.lop_law_firms as unknown as {
      name: string;
      intake_email: string | null;
      escalation_email: string | null;
    };
    if (!firm?.intake_email) continue;

    const facilityName =
      (patient.lop_facilities as unknown as { name: string })?.name ??
      "Focus Health ER";
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
      await supabase.from("lop_reminder_emails").insert({
        patient_id: patient.id,
        law_firm_id: patient.law_firm_id,
        sent_to: firm.intake_email,
        email_type: "lop_request",
      });

      sent++;
    } catch (err) {
      errors.push(`Patient ${patient.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
