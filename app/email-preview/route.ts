import { NextResponse } from "next/server";
import { buildSubmissionEmailPreviews, type SubmissionEmailPayload } from "@/lib/emails/submission-emails";

const samplePayload: SubmissionEmailPayload = {
  formName: "Partner Inquiry",
  userName: "John Smith",
  userEmail: "john@example.com",
  userSubject: "Thanks for your Partner Inquiry – Focus Health",
  userIntro:
    "Thank you for your interest in partnering with Focus Health. Our team will review your information and reach out within 1–2 business days.",
  adminSubject: "New Partner Inquiry from john@example.com",
  fields: [
    { label: "Name", value: "John Smith" },
    { label: "Email", value: "john@example.com" },
    { label: "Phone", value: "(555) 123-4567" },
    { label: "Market Interest", value: "Dallas / Fort Worth" },
    { label: "Cash Available", value: "$250,000 – $500,000" },
    { label: "Partner Type", value: "Financial Partner" },
    { label: "Additional Info", value: "Interested in freestanding ER opportunities in North Texas." },
    { label: "Submitted At", value: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) },
  ],
};

export async function GET() {
  const { userHtml, adminHtml } = buildSubmissionEmailPreviews(samplePayload);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email Template Preview – Focus Health</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #e5e7eb; font-family: Arial, Helvetica, sans-serif; padding: 32px 16px; }
    .wrapper { max-width: 720px; margin: 0 auto; }
    .label { font-size: 20px; font-weight: 700; color: #1d2f5f; margin-bottom: 6px; }
    .sublabel { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
    .spacer { height: 48px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <h2 class="label">User Confirmation Email</h2>
    <p class="sublabel">This is what the person who submitted the form receives.</p>
    ${userHtml}

    <div class="spacer"></div>

    <h2 class="label">Admin Notification Email</h2>
    <p class="sublabel">This is what info@getfocushealth.com receives.</p>
    ${adminHtml}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
