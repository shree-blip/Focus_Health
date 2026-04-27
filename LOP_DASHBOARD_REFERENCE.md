# LOP Dashboard — Complete Implementation Reference

> **Last updated:** April 27, 2026 (v6 — Cloud Run + Cloud SQL + GCS migration)
> **Purpose:** Avoid re-crawling files in future sessions. Read this first.

---

## 1. Architecture Overview

| Layer | Tech | Details |
|-------|------|---------|
| Framework | Next.js 15 (App Router) | Root: `/Users/focus/Desktop/App-FullStack/focus-health/` |
| Database | Cloud SQL PostgreSQL 16 | Instance: `focus-health-db` · DB: `focus_health` · User: `focus_app` |
| Auth | Google OAuth + HMAC session cookies | Cookies: `lop_session`, `focus_admin_session`; signing via `LOP_JWT_SECRET` |
| AI | OpenAI GPT-4o via Vercel AI SDK | `@ai-sdk/openai` + `ai` package, streaming responses |
| Hosting | Google Cloud Run | Service: `focus-health-new` · Region: `us-central1` · URL: `https://focus-health-new-1075627982134.us-central1.run.app` |
| Cron | Cloud Scheduler | Protected cron routes via `CRON_SECRET` |
| Storage | Google Cloud Storage | Bucket: `focus-health-assets-adept-box-494606-s9` (private, served via `/api/lop/file`) |
| Styling | Tailwind + shadcn/ui | UI primitives in `src/components/ui/` |
| Email | nodemailer (SMTP) | Used by send-reminder, auto-remind, schedule-notify APIs |

---

## 2. Environment Variables

### Cloud Run Runtime Environment
```
DB_USER=focus_app
DB_NAME=focus_health
CLOUD_SQL_CONNECTION_NAME=adept-box-494606-s9:us-central1:focus-health-db
LOP_JWT_SECRET=<value>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=540299638751-0ghd0f3n4m5lefmr28mree3flcuem5m3.apps.googleusercontent.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@getfocushealth.com
```

### Secret Manager (mounted into Cloud Run)
```
DB_PASSWORD=focus-db-password:latest
GOOGLE_CLIENT_SECRET=google-client-secret:latest
SMTP_PASS=smtp-pass:latest
OPENAI_API_KEY=openai-api-key:latest
CRON_SECRET=cron-secret:latest
```

### Infrastructure IDs
- GCP Project: `adept-box-494606-s9`
- Cloud Run service: `focus-health-new`
- Cloud SQL instance: `focus-health-db`
- Runtime service account: `1075627982134-compute@developer.gserviceaccount.com`

---

## 3. Roles, Statuses & Document Types

### User Roles (5)
| Value | Label |
|-------|-------|
| `front_desk` | Front Desk |
| `scheduler` | Scheduler |
| `medical_records` | Medical Records |
| `accounting` | Accounting |
| `admin` | Admin |

### Case Statuses (10)
| Value | Label | Color |
|-------|-------|-------|
| `scheduled` | Scheduled | blue |
| `no_show` | No Show | rose |
| `arrived` | Arrived | emerald |
| `intake_complete` | Intake Complete | indigo |
| `in_progress` | In Progress | amber |
| `follow_up_needed` | Follow Up Needed | orange |
| `paid` | Paid | green |
| `partial_paid` | Partial Paid | lime |
| `case_dropped` | Case Dropped | red |
| `closed_no_recovery` | Closed – No Recovery | gray |

### Document Types (9) — stored as **TEXT**, not enum
| Value | Label | Required |
|-------|-------|----------|
| `lop_letter` | LOP Letter from Law Firm | Yes |
| `medical_record` | Medical Record (Chart) | Yes |
| `affidavit` | Affidavit (Notarized Form) | |
| `bill_llc` | Medical Bill – LLC | Yes |
| `bill_pllc` | Medical Bill – PLLC | |
| `drop_letter` | Drop Letter (Case Closed No Pay) | |
| `reduction_letter_unsigned` | Reduction Letter (Unsigned) | |
| `reduction_letter_signed` | Reduction Letter (Signed) | |
| `check_image` | Check Image for Payment | |

### Document Statuses (4)
`not_requested`, `requested`, `received`, `missing`

---

## 4. Database Schema

**Migration source files:** `supabase/migrations/20260410_lop_dashboard.sql`, `supabase/migrations/20260410_facility_notification_emails.sql`

> Migration SQL files are retained in-repo for history. Live schema now runs on Cloud SQL PostgreSQL.

### Tables (9)
1. **`lop_facilities`** — id, name, slug, type, address, phone, director_email, front_desk_email, is_active, created_at, updated_at
2. **`lop_users`** — id, auth_user_id, email, full_name, role, is_active, created_at, updated_at
3. **`lop_user_facilities`** — id, user_id, facility_id (junction)
4. **`lop_law_firms`** — id, name, intake_email, escalation_email, primary_contact, primary_phone, is_active, notes, created_at, updated_at
5. **`lop_patients`** — id, facility_id, law_firm_id, first_name, last_name, date_of_birth, phone, email, address_line1/2, city, state, zip, date_of_accident, expected_arrival, arrival_window_min, case_status, lop_letter_status, medical_records_status, bill_charges, amount_collected, **reduction_amount**, **billing_date**, date_paid, billing_tags, medical_record_tags, follow_up_note, intake_notes, created_by, updated_by, created_at, updated_at
6. **`lop_patient_documents`** — id, patient_id, document_type (**TEXT**), file_name, file_url, storage_path, status, notes, uploaded_by, created_at, updated_at
7. **`lop_reminder_emails`** — id, patient_id, law_firm_id, recipient_email, email_type, subject, sent_at, sent_by, status, error_message
8. **`lop_audit_log`** — id, user_id, action, entity_type, entity_id, facility_id, old_values, new_values, ip_address, created_at
9. **`lop_config`** — key (unique), value, description, updated_at, updated_by

### DB Columns Added (April 10 2026)
Applied to PostgreSQL schema:
- `lop_facilities.phone TEXT`
- `lop_facilities.director_email TEXT`
- `lop_facilities.front_desk_email TEXT`

### DB Columns Added (post April 10 2026)
- `lop_patients.reduction_amount NUMERIC` — stores reduction letter amount
- `lop_patients.billing_date DATE` — date billing was issued (used for AR aging calculation)

### Seeded Data
- 3 facilities: ER of Irving, ER of White Rock, ER of Lufkin
- 1 admin: `info@getfocushealth.com` (auto-linked on first Google login)

### RLS
- Access control is enforced at the application layer (`requireLopAuth()` + `TABLE_WRITE_RULES`)
- Server-side DB proxy (`/api/lop/db`) executes with trusted backend DB credentials
- `lop_config` remains write-restricted to admin workflows

---

## 5. File Map — All 38 LOP Files (9,234 lines)

### Auth, Middleware & MFA
| File | Lines | Purpose |
|------|-------|---------|
| `middleware.ts` | 79 | Protects `/lop/*`, skips `/lop/login`, `/lop/auth/*`, `/lop/mfa-setup`. **Enforces MFA (AAL2)** — redirects to MFA enroll/verify if not at AAL2 |
| `app/lop/login/page.tsx` | 205 | Google OAuth login page with PKCE |
| `app/lop/mfa-setup/page.tsx` | 328 | **NEW** — TOTP MFA enrollment & verification. QR code display, manual secret, 6-digit code input. Redirects to dashboard on success |
| `app/lop/auth/callback/route.ts` | 22 | PKCE code exchange, sets cookies, redirects to `/lop` |
| `app/lop/layout.tsx` | 10 | Minimal root layout for `/lop` |
| `src/lib/lop/server-auth.ts` | 108 | **NEW** — Server-side auth: HMAC cookie verification + LOP user resolution via `requireLopAuth()` |
| `src/components/lop/LopAuthProvider.tsx` | 158 | Auth context: lopUser, facilities, signOut. 3-step user resolution |

### Authenticated Pages (`app/lop/(authenticated)/`)
| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `/lop` | `page.tsx` | 389 | Dashboard — status breakdown charts, recent patients, facility switch |
| `/lop/patients` | `patients/page.tsx` | 261 | Patient list with search, filter by status/facility |
| `/lop/patients/new` | `patients/new/page.tsx` | 384 | New patient intake form, dynamic mandatory fields, scheduling notification |
| `/lop/patients/[id]` | `patients/[id]/page.tsx` | 1471 | Patient detail — full CRUD, document checklist, reminders, all PRD fields |
| `/lop/scheduling` | `scheduling/page.tsx` | 626 | Calendar view with 30-min time slots, weekly overview bar chart, day stats pills, mark arrived |
| `/lop/law-firms` | `law-firms/page.tsx` | 407 | Law firms CRUD, metrics cards, audit log |
| `/lop/reports` | `reports/page.tsx` | 868 | Reports with date range, custom date filter, facility/status filters, active filter summary, CSV export |
| `/lop/settings` | `settings/page.tsx` | ~1540 | Users CRUD, Facilities CRUD, Config management (lop_config upsert), Audit log with expandable change-diff |

### AI Assistant
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/lop/AiChatPanel.tsx` | 368 | **NEW** — Floating chat panel (Sheet), 8 quick actions, markdown renderer, streaming messages |
| `src/hooks/lop/useAiChat.ts` | 40 | **NEW** — React hook wrapping Vercel AI SDK `useChat`, sends facility_id + context_type |
| `src/lib/lop/ai-prompts.ts` | 140 | **NEW** — System prompts: BASE, DASHBOARD_BRIEFING, PATIENT_SUMMARY, REPORTS_ANALYSIS, GENERAL_CHAT |
| `src/lib/lop/ai-context.ts` | 396 | **NEW** — Server-side context builders: `buildDashboardContext`, `buildPatientContext`, `buildReportsContext`, `buildDateFilteredContext` |
| `src/lib/lop/ai-utils.ts` | 245 | **NEW** — Date expression parser (`parseDateExpression`), data completeness analysis (`analyzePatientCompleteness`, `formatMissingFields`, `TRACKABLE_FIELDS`) |

### Layout & Shell
| File | Lines | Purpose |
|------|-------|---------|
| `app/lop/(authenticated)/layout.tsx` | 61 | Wraps with LopAuthProvider + LopShell + **AiChatPanel** |
| `src/components/lop/LopShell.tsx` | 246 | Sidebar nav: Dashboard, Scheduling, Patients, Law Firms, Reports, Settings. Responsive hamburger on mobile. AI chat open event dispatch. New frosted-glass style. |

### API Routes
| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `POST /api/lop/ai/chat` | `app/api/lop/ai/chat/route.ts` | 261 | **NEW** — AI chat streaming endpoint. Cookie-auth, admin-only, GPT-4o, PHI de-identification, audit logging |
| `POST /api/lop/db` | `app/api/lop/db/route.ts` | 237 | Server-side DB proxy for Cloud SQL. Uses `requireLopAuth()` cookie auth (not header-based). PHI read audit logging |
| `GET /api/lop/file` | `app/api/lop/file/route.ts` | 1xx | **NEW** — Auth-gated private file proxy for GCS objects |
| `POST /api/lop/upload` | `app/api/lop/upload/route.ts` | 1xx | Uploads documents to private GCS bucket and returns `/api/lop/file?path=...` URL |
| `POST /api/lop/send-reminder` | `app/api/lop/send-reminder/route.ts` | 124 | Manual reminder email via SMTP |
| `GET /api/lop/auto-remind` | `app/api/lop/auto-remind/route.ts` | 143 | Cloud Scheduler target — daily auto-reminder emails (protected by `CRON_SECRET`) |
| `POST /api/lop/schedule-notify` | `app/api/lop/schedule-notify/route.ts` | 208 | Scheduling notification emails (director, front desk, patient) |
| `POST /api/lop/provision` | `app/api/lop/provision/route.ts` | 139 | Server-side user provisioning (bypasses RLS) |

### Lib Files
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/lop/permissions.ts` | 79 | **23-action** permission matrix (was 19 — added `ai:use`, `config:manage`, `facilities:manage`, `audit:read`), `hasPermission()`, `hasGlobalAccess()`, `isAllowedDomain()` |
| `src/lib/lop/types.ts` | 277 | All TS interfaces, display helpers (labels, colors), `getMissingDocuments()` |
| `src/lib/lop/db.ts` | 129 | `lopDb` helper — calls `/api/lop/db` proxy with role in headers |
| `src/lib/lop/supabase.ts` | 29 | Legacy helper (kept for compatibility; Cloud SQL is the active backend) |
| `src/lib/lop/index.ts` | 3 | Barrel re-export |

---

## 6. Permission Matrix (23 actions x 5 roles)

| Action | front_desk | scheduler | medical_records | accounting | admin |
|--------|:---:|:---:|:---:|:---:|:---:|
| `patient:create` | Y | Y | Y | | Y |
| `patient:read` | Y | Y | Y | Y | Y |
| `patient:update` | Y | | Y | | Y |
| `patient:delete` | | | | | Y |
| `schedule:create` | | Y | | | Y |
| `schedule:read` | Y | Y | Y | | Y |
| `schedule:update` | | Y | | | Y |
| `medical_records:update` | | | Y | | Y |
| `billing:update` | | | Y | | Y |
| `documents:upload` | | | Y | | Y |
| `documents:read` | Y | | Y | Y | Y |
| `financial:view` | | | Y | Y | Y |
| `law_firm:create` | | | Y | | Y |
| `law_firm:read` | Y | Y | Y | Y | Y |
| `law_firm:update` | | | Y | | Y |
| `reports:read` | | | | Y | Y |
| `reports:export` | | | | Y | Y |
| `email:send` | | | Y | | Y |
| `ai:use` | | | | | Y |
| `users:manage` | | | | | Y |
| `config:manage` | | | | | Y |
| `facilities:manage` | | | | | Y |
| `audit:read` | | | | | Y |

**Global access roles** (see all facilities): `admin`, `accounting`

---

## 7. Server-Side DB Proxy (`/api/lop/db`)

All client pages call `lopDb()` (from `src/lib/lop/db.ts`) which POSTs to `/api/lop/db`. The API route:
1. **HIPAA: Authenticates from session cookie** via `requireLopAuth()` — no longer trusts `x-lop-user-id` header
2. For write operations, checks `TABLE_WRITE_RULES` (maps table to allowed role list)
3. Executes the query using backend Cloud SQL credentials
4. **PHI read audit logging** — SELECT on `lop_patients`, `lop_patient_documents`, `lop_reminder_emails` fires audit log insert (fire-and-forget)
5. Returns result as JSON

This means API-level authorization is the primary access control — `TABLE_WRITE_RULES` in the API route is.

---

## 8. Allowed Domains for Auto-Provisioning

```typescript
const ALLOWED_DOMAINS = [
  'getfocushealth.com',
  'focusyourfinance.com',
  'erofwhiterock.com',
  'erofirving.com',
  'eroflufkin.com',
];
```

New users from these domains get auto-provisioned as `front_desk` role on first login.

---

## 9. HIPAA Compliance & Auth

### Session & OAuth Enforcement
- LOP routes are protected by signed HTTP-only session cookies.
- Google OAuth is used for identity; app access is authorized by `lop_users` role + active status.
- `requireLopAuth()` is the server-side gate used by protected APIs.

### PHI De-Identification (AI Route)
- Before sending patient data to OpenAI, the AI chat route runs `deidentifyPhi()`:
  - Patient names → coded identifiers (`Patient-001`, `Patient-002`, …)
  - Phone numbers → `***-***-XXXX` (last 4 kept)
  - Patient emails → `***@domain.com` (org emails preserved)
  - Addresses → `[REDACTED]`
  - DOBs → `YYYY-XX-XX` (year kept for age calculation)

### Audit Logging
- All AI queries are logged to `lop_audit_log` with action `ai_query:<context_type>`.
- All PHI table reads (SELECT on `lop_patients`, `lop_patient_documents`, `lop_reminder_emails`) are logged.
- Logs include: user_id, IP address, entity_type, entity_id, operation metadata.

### Session Cookie Auth (server-auth.ts)
- `getAuthenticatedUser()` — validates signed session from HTTP cookies.
- `requireLopAuth()` — full pipeline: cookie verification → user lookup in DB → active role checks.
- Used by both `/api/lop/db` and `/api/lop/ai/chat` routes.
- **HIPAA**: Never trusts client-supplied `auth_user_id` — always derived from cookie.

---

## 10. AI Assistant (GPT-4o)

### Architecture
```
AiChatPanel.tsx → useAiChat hook → POST /api/lop/ai/chat → server-auth + context builder → OpenAI GPT-4o (streaming)
```

### Access Control
- **Admin-only** — gated by `ai:use` permission (only `admin` role).
- Floating button appears bottom-right; opens a right-side Sheet panel.
- Also triggerable from sidebar via custom `open-ai-chat` event.

### Context Types (4)
| Type | System Prompt | Data Context |
|------|---------------|--------------|
| `general` | `GENERAL_CHAT_PROMPT` | Dashboard context + optional date-filtered context |
| `dashboard_briefing` | `DASHBOARD_BRIEFING_PROMPT` | Full dashboard stats, metrics, alerts |
| `patient_summary` | `PATIENT_SUMMARY_PROMPT` | Single patient with docs, reminders, audit timeline |
| `reports_analysis` | `REPORTS_ANALYSIS_PROMPT` | Report KPIs, firm/facility breakdowns |

### Context Builders (server-side, `ai-context.ts`)
- `buildDashboardContext(facilityId?)` — all patients, status distribution, billed/collected, law firm performance, data completeness, missing fields
- `buildPatientContext(patientId)` — full patient record with docs, reminders, audit log, financial summary, completeness score
- `buildReportsContext(reportData)` — client-supplied report KPIs
- `buildDateFilteredContext(facilityId, from, to)` — patients created/arriving/paid in range + audit events

### Date Expression Parser (`ai-utils.ts`)
Parses natural language dates from user messages: "today", "yesterday", "this week", "last month", "last 7 days", "april 1 to 10", ISO ranges. Used to auto-fetch date-filtered context.

### Data Completeness Analysis (`ai-utils.ts`)
- 15 trackable fields across 7 categories (Demographics, Contact, Address, Case, Financial, Scheduling, Notes).
- 6 critical fields flagged with ⚠️: phone, email, DOB, law_firm_id, date_of_accident, bill_charges.
- `analyzePatientCompleteness(patient)` returns score, missing count, missing-by-category, critical missing.

### Quick Actions (8)
Daily Briefing, Missing Data, Missing Docs, Today's Activity, This Week, Collections, Follow-Ups, Performance.

### Markdown Renderer
Built-in `AiMarkdown` component handles: headers, bold, italic, code, lists (ordered/unordered), tables, code blocks.

---

## 11. Key Design Decisions & Fixes

### Cloud SQL + API-first Access
LOP pages persist data through internal API routes (for example `/api/lop/db`, `/api/blog`) backed by Cloud SQL. This avoids browser-local persistence and keeps state durable across Cloud Run instances.

### OAuth Callback Flow
Google OAuth callback sets/refreshes app session cookies. Do NOT bypass server-side cookie issuance.

### Middleware Auth Exclusions
`middleware.ts` skips auth check for:
- Any path NOT starting with `/lop`
- `/lop/login`
- `/lop/mfa-setup` (MFA page must be accessible pre-AAL2)
- Any path starting with `/lop/auth` (covers `/lop/auth/callback`)

### Auto-Link Users by Email (LopAuthProvider 3-step)
1. Query `lop_users` by `auth_user_id`
2. If not found, query by `email` and UPDATE `auth_user_id` to link
3. If still not found and domain is allowed, INSERT new user with `front_desk` role

### Financial Gating
Dollar amounts (bill_charges, amount_collected) are hidden unless user has `financial:view` permission. Only `medical_records`, `accounting`, and `admin` can see financial data.

### Dynamic Mandatory Intake Fields
`patients/new/page.tsx` reads `lop_config.mandatory_intake_fields` to determine which fields show `*` and are required. Admins configure this in Settings > Config.

### 30-Minute Scheduling Slots
`scheduling/page.tsx` groups patients into 30-min windows (e.g., 09:00-09:30, 09:30-10:00). Each patient card shows exact arrival time and window duration.

### Scheduling Email Notifications
When `expected_arrival` is set during intake, `patients/new/page.tsx` calls `/api/lop/schedule-notify` which sends emails to:
- Facility director (`director_email`)
- Front desk (`front_desk_email`)
- Patient (if email provided)

### Loading States
All pages use `Loader2` spinner from lucide-react. Action buttons have individual loading states:
- Send Reminder: disabled + "Sending..."
- Delete Document: per-document spinner via `deletingDocId`
- Mark Arrived: loading state on button

### AI Assistant — Admin Only
The AI chat panel (`AiChatPanel.tsx`) renders only if `hasPermission(lopUser, 'ai:use')` returns true. The API route also server-side checks `auth.lopUser.role !== 'admin'`.

### AI PHI Safety
All patient context sent to OpenAI is de-identified via `deidentifyPhi()`. This is an additional safety layer; for full compliance also obtain a BAA from OpenAI (or use Azure OpenAI).

### AI SDK Streaming
The AI chat endpoint uses `streamText()` from the `ai` package and returns `result.toDataStreamResponse()` for streaming. The client uses `useChat()` from `ai/react`.

---

## 11b. UI Design System (April 14, 2026 overhaul)

All dashboard tabs now share a consistent design language:

| Pattern | Tailwind Classes |
|---------|------------------|
| Page sticky header | `sticky top-0 z-20 rounded-[30px] border border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.06)]` |
| Section cards | `rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)]` |
| Page background | `bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.09),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]` |
| Primary action button | `h-12 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] text-white shadow-[0_18px_38px_rgba(215,38,56,0.22)]` |
| Secondary button | `h-11 rounded-full border-white/80 bg-white/90 shadow-sm` |
| Search input | `h-11 rounded-full bg-slate-100/90 border-white/80 pl-11` |
| Pill filter active | `rounded-2xl bg-white text-[#0B3B91] shadow-sm ring-1 ring-slate-200` |
| Pill filter inactive | `rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200/70` |
| Page title | `font-heading text-4xl font-extrabold tracking-tight text-[#0B3B91]` |
| Metric accent card | `border-l-4 border-[#0B3B91] rounded-[24px] bg-white shadow-sm` |
| NavItem active | `bg-white text-[#0B3B91] shadow-sm ring-1 ring-white/80` (icon bg: `bg-[#0B3B91] text-white`) |
| NavItem inactive | `text-slate-500 hover:bg-white/80` (icon bg: `bg-slate-100 text-slate-500`) |
| Active dot | `h-2.5 w-2.5 rounded-full bg-[#D72638]` — shown on active nav item |
| Brand colors | Primary: `#0B3B91` (navy) · Accent: `#D72638` (red) · Dark navy: `#002668` |

### Tab Lists (shadcn Tabs)
Patient detail tabs use shadcn `<Tabs>`. The `<TabsList>` should use `rounded-2xl bg-slate-100 p-1` with `<TabsTrigger>` styled as `rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0B3B91]`.

---

## 12. Git History (Key Commits)

| Commit | Message |
|--------|---------|
| `UI-2026` | UI overhaul: glassmorphism cards, pill filters, gradient buttons, redesigned scheduling/patients/reports/law-firms/intake pages |
| `b92672d` | Fix login hang: remove redundant MFA check from login page (middleware handles it) |
| `f17f104` | Enforce MFA (TOTP) for all LOP dashboard access |
| `1dc4140` | HIPAA compliance: cookie-based auth, PHI de-identification, security headers, MFA, session timeouts, read audit logging |
| `fe0bda0` | AI enhancement: comprehensive missing-data detection, date queries, A-to-Z context crawl |
| `7ea11f5` | Fix AI button overlap, reports custom date filter, add active filter summary |
| `3e6b429` | Scheduling: weekly overview with bar chart, day stats pills, improved hover/UX |
| `83f3146` | AI assistant: GPT-4o streaming chat, dashboard briefing, patient case summary, reports analysis |
| `04f5fd0` | Scheduling email notifications, dynamic mandatory intake fields, 30-min time slots |
| `975efa6` | LOP Dashboard: role-based data hiding, server-side auth, facility editing, audit logging |
| `8c21e49` | Fix PKCE login: stop manual exchangeCodeForSession, let createBrowserClient auto-detect |
| `7c16e2a` | Migrate all LOP pages from lopClient to lopDb (service-role proxy, bypasses RLS) |
| `81a92e8` | Fix login: handle OAuth callback on login page |
| `ea020f6` | Fix PKCE: switch to @supabase/ssr cookie-based auth |
| `9e72aa1` | Fix login: exclude /lop/auth/callback from middleware auth check |
| `bb977ec` | Fix LOP login: PKCE flow, auto-link users by email, action spinners |
| `4dc9b91` | Lazy-init Supabase client (Vercel build fix) |
| `64159ea` | LOP PRD compliance: all fields, doc upload, tags, mark arrived, metrics, CSV export |
| `5034580` | Add LOP Dashboard: patient management, scheduling, law firms, reports, settings |
| `948c2dc` | Cloud Run fixes: private GCS file proxy, upload path fix, patients loading guard, blog admin persistence via API |

---

## 13. Deployment Commands

```bash
# Build locally
npx next build

# Deploy to Cloud Run (production)
gcloud run deploy focus-health-new --source . --region us-central1 --project adept-box-494606-s9 --platform managed --allow-unauthenticated --add-cloudsql-instances adept-box-494606-s9:us-central1:focus-health-db --set-env-vars "DB_USER=focus_app,DB_NAME=focus_health,CLOUD_SQL_CONNECTION_NAME=adept-box-494606-s9:us-central1:focus-health-db,LOP_JWT_SECRET=lop-focus-health-2024-secure,NEXT_PUBLIC_GOOGLE_CLIENT_ID=540299638751-0ghd0f3n4m5lefmr28mree3flcuem5m3.apps.googleusercontent.com,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=info@getfocushealth.com" --set-secrets "DB_PASSWORD=focus-db-password:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,SMTP_PASS=smtp-pass:latest,OPENAI_API_KEY=openai-api-key:latest,CRON_SECRET=cron-secret:latest" --quiet

# Commit and push
git add -A && git commit -m "message" && git push
```

### Cloud SQL direct SQL (manual schema change)
```bash
# Example: run SQL through psql using Cloud SQL credentials
psql "host=/cloudsql/adept-box-494606-s9:us-central1:focus-health-db dbname=focus_health user=focus_app password=<DB_PASSWORD>" -c "SELECT 1;"
```
Prefer committed migration SQL files for reproducibility.

---

## 14. Known Issues / Watch Items

1. **Cloud SQL attachment** — Cloud Run deploy must include `--add-cloudsql-instances adept-box-494606-s9:us-central1:focus-health-db`.
2. **Seeded admin UUID** — `info@getfocushealth.com` was seeded with a placeholder `auth_user_id`. Auto-link-by-email handles this on first Google login.
3. **DB credential secrets** — `DB_PASSWORD` is loaded from Secret Manager (`focus-db-password`). Do not hardcode DB passwords in code or local scripts.
4. **App-layer authorization** — Write authorization is enforced via `TABLE_WRITE_RULES` in `/api/lop/db`; keep this matrix synced with role policy.
5. **GCS public ACLs blocked** — Bucket policy prevents `allUsers` grants. Keep uploads private and serve documents through `/api/lop/file`.
6. **Service account storage IAM** — Runtime SA must keep `roles/storage.objectAdmin` on `focus-health-assets-adept-box-494606-s9` for upload operations.
7. **OPENAI_API_KEY** — Must be set in Cloud Run secrets for AI assistant to function. If missing, `/api/lop/ai/chat` returns 500.
8. **Cloud Scheduler auth** — Cron calls must include valid `CRON_SECRET`.
9. **PHI de-identification** — The `deidentifyPhi()` function uses regex patterns; exotic name formats or multi-word names may slip through. Consider a BAA with OpenAI for full HIPAA compliance.
10. **Settings page** — Now fully rebuilt with 4 tabs: Users, Facilities, Configuration (`lop_config` CRUD), and Audit Log (expandable change-diff view with user names and action filters).
11. **`no_show` status** — `no_show` is fully implemented in `LopCaseStatus`, `CASE_STATUS_LABELS` (→ "No-Show"), and `CASE_STATUS_COLORS` (`bg-rose-100 text-rose-800`). No action needed.

---

## 15. PRD Compliance (FR-01 through FR-18) + Post-PRD Features

### Original PRD (FR-01 – FR-18) — All Complete

| FR | Requirement | Status |
|----|-------------|--------|
| FR-01 | Google OAuth login w/ PKCE, domain allow-list | Done |
| FR-02 | Role-based access control (5 roles, 23 actions) | Done |
| FR-03 | Facility-scoped data access | Done |
| FR-04 | Dashboard with status breakdown, charts, recent patients | Done |
| FR-05 | Patient list with search, filter by status/facility | Done |
| FR-06 | Patient detail with full CRUD, all PRD fields | Done |
| FR-07 | Document upload/management with 9 document types | Done |
| FR-08 | Document checklist (required + optional) | Done |
| FR-09 | Scheduling calendar with 30-min time slots, weekly overview | Done |
| FR-10 | Mark Arrived with confirmation | Done |
| FR-11 | Law firm management with metrics | Done |
| FR-12 | Reminder emails (manual + auto-cron) | Done |
| FR-13 | Reports with filters + CSV export | Done |
| FR-14 | Settings: Users, Facilities, Config, Audit log | Done |
| FR-15 | Audit logging for all mutations | Done |
| FR-16 | Financial gating (financial:view permission) | Done |
| FR-17 | Dynamic mandatory intake fields (from lop_config) | Done |
| FR-18 | Scheduling email notifications (director + front desk + patient) | Done |

### Post-PRD Additions (April 10–12, 2026)

| Feature | Status |
|---------|--------|
| HIPAA MFA (TOTP) enforcement — AAL2 required for all LOP routes | Done |
| Server-side cookie-based auth (replaces header-based) | Done |
| PHI de-identification before OpenAI API calls | Done |
| PHI read audit logging on SELECT queries | Done |
| AI assistant — GPT-4o streaming chat (admin-only) | Done |
| AI context builders: dashboard, patient, reports, date-filtered | Done |
| Natural language date query parsing | Done |
| Data completeness analysis (15 fields, 7 categories, critical flags) | Done |
| Scheduling weekly overview with bar chart + day stats | Done |
| Reports custom date filter + active filter summary | Done |
