import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/metadata";

type EmailField = {
  label: string;
  value: string;
};

export type SubmissionEmailPayload = {
  formName: string;
  userName?: string;
  userEmail: string;
  userSubject: string;
  userIntro: string;
  adminSubject: string;
  fields: EmailField[];
};

/* ── Brand tokens ───────────────────────────────────────── */
const BRAND = {
  dark: "#0f1d3d",       /* Dark navy – header bg */
  primary: "#1e4db7",    /* Link / accent blue */
  secondary: "#1d2f5f",  /* Heading colour */
  text: "#333333",       /* Body copy */
  muted: "#6b7280",      /* Secondary copy */
  border: "#e5e7eb",
  surface: "#f5f5f5",    /* Footer bg */
};

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Focus-Health/61586849325711/",
    /* Facebook "f" via Unicode */
    symbol: "f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/getfocushealth/",
    symbol: "◎",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/getfocus-health/",
    symbol: "in",
  },
];

/* ── Helpers ─────────────────────────────────────────────── */
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
          <td style="padding:12px 14px;border:1px solid ${BRAND.border};background:#ffffff;font-weight:600;color:${BRAND.secondary};width:180px;vertical-align:top;font-size:14px;">${escapeHtml(field.label)}</td>
          <td style="padding:12px 14px;border:1px solid ${BRAND.border};background:#ffffff;color:${BRAND.text};line-height:1.6;font-size:14px;">${escapeHtml(field.value || "-")}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:20px;">
      ${rows}
    </table>
  `;
}

/* ── Contact Row (email only, centered) ──────────────────── */
function buildContactRow(): string {
  return `
    <div style="text-align:center;padding:24px 0 0 0;">
      <span style="font-size:15px;">&#9993;&nbsp;<a href="mailto:info@getfocushealth.com" style="color:${BRAND.text};text-decoration:underline;">info@getfocushealth.com</a></span>
    </div>
  `;
}

/* ── Footer (matches Irving H&W reference) ───────────────── */
function buildFooter(): string {
  const socialIcons = SOCIAL_LINKS.map(
    (link) => `
      <a href="${link.href}" aria-label="${escapeHtml(link.label)}"
         style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;
                border-radius:9999px;background:${BRAND.dark};color:#ffffff;
                text-decoration:none;font-weight:700;font-family:Arial,sans-serif;
                font-size:14px;margin:0 5px;">
        ${escapeHtml(link.symbol)}
      </a>`,
  ).join("");

  return `
    <!-- divider -->
    <tr><td style="padding:0 40px;"><div style="border-top:1px solid ${BRAND.border};"></div></td></tr>

    <!-- footer -->
    <tr>
      <td style="padding:28px 40px 16px;background:${BRAND.surface};text-align:center;">
        <!-- social icons -->
        <div style="margin-bottom:18px;">${socialIcons}</div>

        <!-- policy links -->
        <p style="margin:0 0 16px 0;font-size:13px;color:${BRAND.text};">
          <a href="${siteConfig.url}/terms" style="color:${BRAND.text};text-decoration:none;">Terms of Service</a>
          <span style="margin:0 6px;color:${BRAND.muted};">•</span>
          <a href="${siteConfig.url}/privacy" style="color:${BRAND.text};text-decoration:none;">Privacy Policy</a>
        </p>
      </td>
    </tr>

    <!-- brand line -->
    <tr>
      <td style="padding:14px 40px;background:${BRAND.surface};text-align:center;">
        <p style="margin:0;font-size:11px;color:${BRAND.muted};">
          © ${new Date().getFullYear()} Focus Healthcare · 3001 Skyway Cir N, Irving, TX 75038
        </p>
      </td>
    </tr>
  `;
}

/* ── Master layout ───────────────────────────────────────── */
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
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:24px 0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="max-width:640px;margin:0 auto;border-collapse:collapse;background:#ffffff;">
          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background:${BRAND.dark};padding:22px 20px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${siteConfig.url}/focus-health-icon.png" alt="Focus Health" width="44" height="44"
                         style="display:block;border:0;" />
                  </td>
                  <td style="vertical-align:middle;white-space:nowrap;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">
                      FOCUS HEALTH
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 6px 0;font-size:26px;line-height:1.3;color:${BRAND.secondary};text-align:center;font-weight:800;">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;color:${BRAND.muted};text-align:center;">
                ${escapeHtml(subtitle)}
              </p>
              ${body}
              ${buildContactRow()}
            </td>
          </tr>

          ${buildFooter()}
        </table>
      </body>
    </html>
  `;
}

function buildUserConfirmationHtml(payload: SubmissionEmailPayload): string {
  const greetingName = payload.userName?.trim() || "there";

  return buildEmailLayout({
    title: "Thanks for Reaching Out",
    subtitle: `${payload.formName} submission received`,
    body: `
      <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${BRAND.text};">Hi ${escapeHtml(greetingName)},</p>
      <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${BRAND.text};">${escapeHtml(payload.userIntro)}</p>
      <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${BRAND.text};">We have received the details below:</p>
      ${buildFieldsTable(payload.fields)}
      <p style="margin:24px 0 0 0;font-size:15px;line-height:1.7;color:${BRAND.muted};text-align:center;">
        Questions? Reply to this email or call us &mdash; our team is happy to help.
      </p>
    `,
  });
}

function buildAdminNotificationHtml(payload: SubmissionEmailPayload): string {
  return buildEmailLayout({
    title: `New ${payload.formName} Submission`,
    subtitle: "A new website form submission has been received",
    body: `
      <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:${BRAND.text};">
        A new submission was received from <strong>${escapeHtml(payload.userEmail)}</strong>.
      </p>
      ${buildFieldsTable(payload.fields)}
      <p style="margin:24px 0 0 0;font-size:14px;line-height:1.7;color:${BRAND.muted};text-align:center;">
        You can also review submissions in the <a href="${siteConfig.url}/admin/submissions" style="color:${BRAND.primary};text-decoration:underline;">admin panel</a>.
      </p>
    `,
  });
}

export function buildSubmissionEmailPreviews(payload: SubmissionEmailPayload) {
  return {
    userHtml: buildUserConfirmationHtml(payload),
    adminHtml: buildAdminNotificationHtml(payload),
  };
}

export async function sendSubmissionEmails(payload: SubmissionEmailPayload) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const fromEmail = smtpUser;
  const infoEmail = "info@getfocushealth.com";
  const notificationRecipients = [infoEmail, "jaya.r.dahal@focusyourfinance.com"];

  if (!smtpUser || !smtpPass) {
    throw new Error("Missing SMTP_USER or SMTP_PASS environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const userHtml = buildUserConfirmationHtml(payload);
  const adminHtml = buildAdminNotificationHtml(payload);

  const [userResult, adminResult] = await Promise.all([
    transporter.sendMail({
      from: `"Focus Health" <${fromEmail}>`,
      to: payload.userEmail,
      subject: payload.userSubject,
      html: userHtml,
      replyTo: infoEmail,
    }),
    transporter.sendMail({
      from: `"Focus Health" <${fromEmail}>`,
      to: notificationRecipients.join(", "),
      subject: payload.adminSubject,
      html: adminHtml,
      replyTo: payload.userEmail,
    }),
  ]);

  return {
    userMessageId: userResult.messageId,
    adminMessageId: adminResult.messageId,
  };
}
