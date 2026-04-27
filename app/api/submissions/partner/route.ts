import { NextRequest, NextResponse } from "next/server";
import { sendSubmissionEmails } from "@/lib/emails/submission-emails";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, marketInterest, cashToInvest, partnerType, additionalInfo } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Return submission data with an ID for client-side storage
    const submission = {
      id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "partner" as const,
      name,
      email,
      phone: phone || "",
      marketInterest: marketInterest || "",
      cashToInvest: cashToInvest || "",
      partnerType: partnerType || "",
      additionalInfo: additionalInfo || "",
      createdAt: new Date().toISOString(),
    };

    // Send emails (best-effort — submission succeeds regardless)
    try {
      await sendSubmissionEmails({
        formName: "Partner Opportunity Form",
        userName: name,
        userEmail: email,
        userSubject: "Your partnership request was received",
        userIntro: "Thanks for your interest in partnering with Focus Health. We will review your details and follow up shortly.",
        adminSubject: `New partner request from ${name}`,
        fields: [
          { label: "Name", value: name },
          { label: "Email", value: email },
          { label: "Phone", value: phone || "Not provided" },
          { label: "Market Interest", value: marketInterest || "Not provided" },
          { label: "Cash To Invest", value: cashToInvest || "Not provided" },
          { label: "Partner Type", value: partnerType || "Not provided" },
          { label: "Additional Info", value: additionalInfo || "Not provided" },
          { label: "Submitted At", value: submission.createdAt },
        ],
      });
    } catch (emailError) {
      console.error("Email send failed (non-blocking):", emailError);
    }

    // Persist to Cloud SQL
    try {
      await query(
        `INSERT INTO admin_submissions (form_type, name, email, phone, data) VALUES ($1,$2,$3,$4,$5)`,
        ['partner', name, email, phone || null, JSON.stringify({ marketInterest, cashToInvest, partnerType, additionalInfo })]
      );
    } catch (dbErr) {
      console.error('DB save failed (non-blocking):', dbErr);
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Partner submission error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
