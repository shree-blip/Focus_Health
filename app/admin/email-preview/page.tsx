import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import { buildSubmissionEmailPreviews } from "@/lib/emails/submission-emails";

export const metadata: Metadata = generateSEOMetadata({
  title: "Email Template Preview - Admin",
  canonicalUrl: "/admin/email-preview",
  noIndex: true,
});

const samplePayload = {
  formName: "Partner Opportunity Form",
  userName: "Alex Morgan",
  userEmail: "alex.morgan@example.com",
  userSubject: "Your partnership request was received",
  userIntro: "Thanks for your interest in partnering with Focus Health. We will review your details and follow up shortly.",
  adminSubject: "New partner request from Alex Morgan",
  fields: [
    { label: "Name", value: "Alex Morgan" },
    { label: "Email", value: "alex.morgan@example.com" },
    { label: "Phone", value: "+1 214 555 0123" },
    { label: "Market Interest", value: "Dallas-Fort Worth" },
    { label: "Cash To Invest", value: "$1,000,000 - $2,000,000" },
    { label: "Partner Type", value: "Turn-Key ER Ownership" },
    { label: "Additional Info", value: "Looking for opportunities in Q3 with operator support." },
    { label: "Submitted At", value: new Date().toISOString() },
  ],
};

export default function AdminEmailPreviewPage() {
  const { userHtml, adminHtml } = buildSubmissionEmailPreviews(samplePayload);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Email Template Preview</h1>
        <p className="text-muted-foreground mt-2">
          Live preview of the reusable Resend templates with sample variables.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">User Confirmation Email</h2>
          <iframe
            title="User confirmation email preview"
            srcDoc={userHtml}
            className="h-[820px] w-full rounded-lg border border-border bg-white"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Internal Notification Email</h2>
          <iframe
            title="Admin notification email preview"
            srcDoc={adminHtml}
            className="h-[820px] w-full rounded-lg border border-border bg-white"
          />
        </section>
      </div>
    </div>
  );
}
