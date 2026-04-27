import { NextRequest, NextResponse } from "next/server";
import { sendSubmissionEmails } from "@/lib/emails/submission-emails";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const inferredName = String(email).split("@")[0] || "Subscriber";
    const submittedAt = new Date().toISOString();

    // Send emails (best-effort — submission succeeds regardless)
    try {
      await sendSubmissionEmails({
        formName: "Newsletter Subscription",
        userName: inferredName,
        userEmail: email,
        userSubject: "You are subscribed to Focus Health insights",
        userIntro:
          "Thanks for subscribing. You will receive updates on healthcare infrastructure trends, facility launches, and investor education content.",
        adminSubject: `New newsletter subscription: ${email}`,
        fields: [
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
        `INSERT INTO admin_submissions (form_type, email, data) VALUES ($1,$2,$3)`,
        ['newsletter', email, '{}']
      );
    } catch (dbErr) {
      console.error('DB save failed (non-blocking):', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter submission error:", error);
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 });
  }
}
