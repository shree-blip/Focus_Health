import { NextResponse, type NextRequest } from "next/server";
import { createLopServerClient } from "@/lib/lop/supabase";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { patientId, lawFirmId } = await request.json();
    if (!patientId || !lawFirmId) {
      return NextResponse.json(
        { error: "patientId and lawFirmId are required." },
        { status: 400 }
      );
    }

    const supabase = createLopServerClient();

    // Fetch patient
    const { data: patient } = await supabase
      .from("lop_patients")
      .select("first_name, last_name, facility_id, lop_facilities(name)")
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    // Fetch law firm
    const { data: firm } = await supabase
      .from("lop_law_firms")
      .select("name, intake_email, escalation_email")
      .eq("id", lawFirmId)
      .single();

    if (!firm?.intake_email) {
      return NextResponse.json(
        { error: "Law firm has no intake email." },
        { status: 400 }
      );
    }

    const facilityName =
      (patient.lop_facilities as unknown as { name: string } | null)?.name ?? "Focus Health ER";
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder email." },
      { status: 500 }
    );
  }
}
