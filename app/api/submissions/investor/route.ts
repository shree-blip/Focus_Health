import { NextRequest, NextResponse } from "next/server";
import { sendSubmissionEmails } from "@/lib/emails/submission-emails";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();

    // Send emails (best-effort — submission succeeds regardless)
    try {
      await sendSubmissionEmails({
        formName: "Investor Waitlist",
        userName: name,
        userEmail: email,
        userSubject: "You are on the Focus Health investor waitlist",
        userIntro:
          "Thank you for joining our investor waitlist. We will send your investor deck and next steps from our investor relations team shortly.",
        adminSubject: `New investor waitlist submission from ${name}`,
        fields: [
          { label: "Name", value: name },
          { label: "Email", value: email },
          { label: "Submitted At", value: submittedAt },
        ],
      });
    } catch (emailError) {
      console.error("Email send failed (non-blocking):", emailError);
    }

    // Persist to Cloud SQL
    try {
      await query(
        `INSERT INTO admin_submissions (form_type, name, email, data) VALUES ($1,$2,$3,$4)`,
        ['investor', name, email, '{}']
      );
    } catch (dbErr) {
      console.error('DB save failed (non-blocking):', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Investor submission error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
