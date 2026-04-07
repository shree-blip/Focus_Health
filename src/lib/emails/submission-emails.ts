import { Resend } from "resend";
import { siteConfig } from "@/lib/metadata";

type EmailField = {
  label: string;
  value: string;
};

type SubmissionEmailPayload = {
  formName: string;
  userName?: string;
  userEmail: string;
  userSubject: string;
  userIntro: string;
  adminSubject: string;
  fields: EmailField[];
};

const BRAND = {
  primary: "#1e4db7",
  secondary: "#1d2f5f",
  accent: "#e11d48",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
};

const USEFUL_LINKS = [
  { label: "Platform", href: `${siteConfig.url}/platform` },
  { label: "Market", href: `${siteConfig.url}/market` },
  { label: "Insights", href: `${siteConfig.url}/insights` },
  { label: "Contact", href: `${siteConfig.url}/contact` },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Focus-Health/61586849325711/",
    bg: "#1877F2",
    symbol: "f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/getfocushealth/",
    bg: "#E1306C",
    symbol: "◎",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/getfocus-health/",
    bg: "#0A66C2",
    symbol: "in",
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildFieldsTable(fields: EmailField[]): string {
  const rows = fields
    .map(
      (field) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid ${BRAND.border};background:#ffffff;font-weight:600;color:${BRAND.secondary};width:180px;vertical-align:top;">${escapeHtml(field.label)}</td>
          <td style="padding:10px 12px;border:1px solid ${BRAND.border};background:#ffffff;color:${BRAND.text};line-height:1.5;">${escapeHtml(field.value || "-")}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:16px;">
      ${rows}
    </table>
  `;
}

function buildFooter(): string {
  const usefulLinks = USEFUL_LINKS.map(
    (link) => `<a href="${link.href}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;margin:0 8px;">${escapeHtml(link.label)}</a>`,
  ).join("<span style=\"color:#cbd5e1;\">|</span>");

  const socialLinks = SOCIAL_LINKS.map(
    (link) => `
      <a href="${link.href}" aria-label="${escapeHtml(link.label)}" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;border-radius:9999px;background:${link.bg};color:#ffffff;text-decoration:none;font-weight:700;font-family:Arial,sans-serif;margin:0 4px;">${escapeHtml(link.symbol)}</a>
    `,
  ).join("");

  return `
    <div style="padding:24px 28px;border-top:1px solid ${BRAND.border};background:${BRAND.surface};text-align:center;">
      <p style="margin:0 0 12px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">Useful Links</p>
      <div style="margin-bottom:14px;font-size:13px;line-height:1.8;">${usefulLinks}</div>
      <div style="margin-bottom:14px;">${socialLinks}</div>
      <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
        Focus Healthcare LLC · 3001 Skyway Cir N, Irving, TX 75038<br />
        <a href="mailto:info@getfocushealth.com" style="color:${BRAND.primary};text-decoration:none;">info@getfocushealth.com</a>
      </p>
    </div>
  `;
}

function buildEmailLayout({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle: string;
  body: string;
}): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:22px 28px;background:linear-gradient(135deg, ${BRAND.secondary} 0%, ${BRAND.primary} 70%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${siteConfig.url}/focus-health-icon.png" alt="Focus Health" width="42" height="42" style="display:inline-block;vertical-align:middle;border:0;margin-right:10px;" />
                    <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.2px;">Focus Health</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.25;color:${BRAND.secondary};">${escapeHtml(title)}</h1>
              <p style="margin:0 0 18px 0;font-size:14px;color:${BRAND.muted};">${escapeHtml(subtitle)}</p>
              ${body}
            </td>
          </tr>
          <tr>
            <td>${buildFooter()}</td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildUserConfirmationHtml(payload: SubmissionEmailPayload): string {
  const greetingName = payload.userName?.trim() || "there";

  return buildEmailLayout({
    title: "Thanks for reaching out",
    subtitle: `${payload.formName} submission received`,
    body: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;">Hi ${escapeHtml(greetingName)},</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;">${escapeHtml(payload.userIntro)}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;">We have received the details below:</p>
      ${buildFieldsTable(payload.fields)}
      <p style="margin:16px 0 0 0;font-size:14px;line-height:1.7;color:${BRAND.muted};">
        If you need immediate assistance, reply to this email or contact us at
        <a href="mailto:info@getfocushealth.com" style="color:${BRAND.primary};text-decoration:none;font-weight:600;"> info@getfocushealth.com</a>.
      </p>
    `,
  });
}

function buildAdminNotificationHtml(payload: SubmissionEmailPayload): string {
  return buildEmailLayout({
    title: `New ${payload.formName} submission`,
    subtitle: "A new website form submission has been received",
    body: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;">
        A new submission was received from <strong>${escapeHtml(payload.userEmail)}</strong>.
      </p>
      ${buildFieldsTable(payload.fields)}
      <p style="margin:16px 0 0 0;font-size:14px;line-height:1.7;color:${BRAND.muted};">
        You can also review submissions in the admin panel.
      </p>
    `,
  });
}

export async function sendSubmissionEmails(payload: SubmissionEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const infoEmail = process.env.RESEND_INFO_EMAIL || "info@getfocushealth.com";

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!fromEmail) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  const resend = new Resend(apiKey);

  const userHtml = buildUserConfirmationHtml(payload);
  const adminHtml = buildAdminNotificationHtml(payload);

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: [payload.userEmail],
      subject: payload.userSubject,
      html: userHtml,
      replyTo: infoEmail,
    }),
    resend.emails.send({
      from: fromEmail,
      to: [infoEmail],
      subject: payload.adminSubject,
      html: adminHtml,
      replyTo: payload.userEmail,
    }),
  ]);

  return {
    userEmailId: userResult.data?.id,
    adminEmailId: adminResult.data?.id,
  };
}
