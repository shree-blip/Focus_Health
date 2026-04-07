import { NextRequest, NextResponse } from "next/server";
import { sendSubmissionEmails } from "@/lib/emails/submission-emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const submission = {
      id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "contact" as const,
      name,
      email,
      role: role || "",
      message,
      createdAt: new Date().toISOString(),
    };

    await sendSubmissionEmails({
      formName: "Contact Form",
      userName: name,
      userEmail: email,
      userSubject: "We received your Focus Health message",
      userIntro: "Thank you for contacting Focus Health. Our team will review your message and reply shortly.",
      adminSubject: `New contact form submission from ${name}`,
      fields: [
        { label: "Name", value: name },
        { label: "Email", value: email },
        { label: "Role", value: role || "Not provided" },
        { label: "Message", value: message },
        { label: "Submitted At", value: submission.createdAt },
      ],
    });

    // Optionally forward to Supabase Edge Function (best-effort)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/functions/v1/send-community-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ name, organization: role, email, message }),
        });
      }
    } catch {
      // Silently ignore edge function errors
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
