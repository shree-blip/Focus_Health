# LOP Dashboard — Complete Implementation Reference

> **Last updated:** April 10, 2026 (v2 — post-PRD audit)
> **Purpose:** Avoid re-crawling files in future sessions. Read this first.

---

## 1. Architecture Overview

| Layer | Tech | Details |
|-------|------|---------|
| Framework | Next.js 15 (App Router) | Root: `/Users/focus/Desktop/App-FullStack/focus-health/` |
| Database | Supabase (PostgreSQL) | Ref `dgmkjjwmnjiefsvbhujq` — `https://dgmkjjwmnjiefsvbhujq.supabase.co` |
| Auth | Supabase Google OAuth (PKCE) | `flowType: 'pkce'`, `@supabase/ssr` cookie-based client |
| Hosting | Vercel | Production: `https://www.getfocushealth.com` |
| Cron | Vercel Cron | `vercel.json` — daily at `0 14 * * *` (auto-reminder emails) |
| Storage | Supabase Storage | Bucket: `lop-documents` |
| Styling | Tailwind + shadcn/ui | UI primitives in `src/components/ui/` |
| Email | nodemailer (SMTP) | Used by send-reminder, auto-remind, schedule-notify APIs |

---

## 2. Environment Variables

### Vercel Production
```
NEXT_PUBLIC_SUPABASE_URL=https://dgmkjjwmnjiefsvbhujq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<key>   # NOTE: "DEFAULT" variant on Vercel
SUPABASE_SERVICE_ROLE_KEY=<key>
SMTP_USER=<email>
SMTP_APP_PASSWORD=<app-password>
```

### Local `.env`
```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FvuSPk5KfBlj-1EZKnmvgg_e8mznTYD
```

### CRITICAL: Env Var Name Mismatch
Vercel uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` but local uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. All files have a `??` fallback checking both. **Never remove the fallback.**

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

### Case Statuses (9)
| Value | Label | Color |
|-------|-------|-------|
| `scheduled` | Scheduled | blue |
| `arrived` | Arrived | cyan |
| `intake_complete` | Intake Complete | indigo |
| `in_progress` | In Progress | yellow |
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

**Migration file:** `supabase/migrations/20260410_lop_dashboard.sql`
**Notification cols migration:** `supabase/migrations/20260410_facility_notification_emails.sql`

### Tables (9)
1. **`lop_facilities`** — id, name, slug, type, address, phone, director_email, front_desk_email, is_active, created_at, updated_at
2. **`lop_users`** — id, auth_user_id, email, full_name, role, is_active, created_at, updated_at
3. **`lop_user_facilities`** — id, user_id, facility_id (junction)
4. **`lop_law_firms`** — id, name, intake_email, escalation_email, primary_contact, primary_phone, is_active, notes, created_at, updated_at
5. **`lop_patients`** — id, facility_id, law_firm_id, first_name, last_name, date_of_birth, phone, email, address_line1/2, city, state, zip, date_of_accident, expected_arrival, arrival_window_min, case_status, lop_letter_status, medical_records_status, bill_charges, amount_collected, date_paid, billing_tags, medical_record_tags, follow_up_note, intake_notes, created_by, updated_by, created_at, updated_at
6. **`lop_patient_documents`** — id, patient_id, document_type (**TEXT**), file_name, file_url, storage_path, status, notes, uploaded_by, created_at, updated_at
7. **`lop_reminder_emails`** — id, patient_id, law_firm_id, recipient_email, email_type, subject, sent_at, sent_by, status, error_message
8. **`lop_audit_log`** — id, user_id, action, entity_type, entity_id, facility_id, old_values, new_values, ip_address, created_at
9. **`lop_config`** — key (unique), value, description, updated_at, updated_by

### DB Columns Added (April 10 2026)
Via Supabase Management API:
- `lop_facilities.phone TEXT`
- `lop_facilities.director_email TEXT`
- `lop_facilities.front_desk_email TEXT`

### Seeded Data
- 3 facilities: ER of Irving, ER of White Rock, ER of Lufkin
- 1 admin: `info@getfocushealth.com` (auto-linked on first Google login)

### RLS
- All tables have RLS enabled; policies allow authenticated users
- **Server-side proxy** (`/api/lop/db`) uses service-role key, bypassing RLS entirely
- `lop_config` has separate read/write policies

---

## 5. File Map — All 27 LOP Files (5,778 lines)

### Auth & Middleware
| File | Lines | Purpose |
|------|-------|---------|
| `middleware.ts` | 51 | Protects `/lop/*`, skips `/lop/login` and `/lop/auth/*` |
| `app/lop/login/page.tsx` | 204 | Google OAuth login page with PKCE |
| `app/lop/auth/callback/route.ts` | 22 | PKCE code exchange, sets cookies, redirects to `/lop` |
| `app/lop/layout.tsx` | 10 | Minimal root layout for `/lop` |
| `src/integrations/supabase/client.ts` | 43 | Shared Supabase client (lazy Proxy, PKCE, env fallback) |
| `src/lib/lop/client.ts` | 13 | Re-exports `supabase` as `lopClient` (any-typed) |
| `src/components/lop/LopAuthProvider.tsx` | 158 | Auth context: lopUser, facilities, signOut. 3-step user resolution |

### Authenticated Pages (`app/lop/(authenticated)/`)
| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `/lop` | `page.tsx` | 387 | Dashboard — status breakdown charts, recent patients, facility switch |
| `/lop/patients` | `patients/page.tsx` | 261 | Patient list with search, filter by status/facility |
| `/lop/patients/new` | `patients/new/page.tsx` | 384 | New patient intake form, dynamic mandatory fields, scheduling notification |
| `/lop/patients/[id]` | `patients/[id]/page.tsx` | 1333 | Patient detail — full CRUD, document checklist, reminders, all PRD fields |
| `/lop/scheduling` | `scheduling/page.tsx` | 298 | Calendar view with 30-min time slots, mark arrived |
| `/lop/law-firms` | `law-firms/page.tsx` | 407 | Law firms CRUD, metrics cards, audit log |
| `/lop/reports` | `reports/page.tsx` | 600 | Reports with date range, facility, status filters, CSV export |
| `/lop/settings` | `settings/page.tsx` | 934 | Users CRUD, Facilities CRUD (phone/emails), Config mgmt, Audit detail |

### Layout & Shell
| File | Lines | Purpose |
|------|-------|---------|
| `app/lop/(authenticated)/layout.tsx` | 54 | Wraps with LopAuthProvider + LopShell |
| `src/components/lop/LopShell.tsx` | 154 | Sidebar nav: Dashboard, Patients, Scheduling, Law Firms, Reports, Settings |

### API Routes
| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `POST /api/lop/db` | `app/api/lop/db/route.ts` | 238 | Server-side DB proxy (service-role), TABLE_WRITE_RULES for role gating |
| `POST /api/lop/send-reminder` | `app/api/lop/send-reminder/route.ts` | 96 | Manual reminder email via SMTP |
| `GET /api/lop/auto-remind` | `app/api/lop/auto-remind/route.ts` | 143 | Vercel Cron — daily auto-reminder emails |
| `POST /api/lop/schedule-notify` | `app/api/lop/schedule-notify/route.ts` | 186 | Scheduling notification emails (director, front desk, patient) |
| `POST /api/lop/provision` | `app/api/lop/provision/route.ts` | 137 | Server-side user provisioning (bypasses RLS) |

### Lib Files
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/lop/permissions.ts` | 76 | 19-action permission matrix, `hasPermission()`, `hasGlobalAccess()`, `isAllowedDomain()` |
| `src/lib/lop/types.ts` | 277 | All TS interfaces, display helpers (labels, colors), `getMissingDocuments()` |
| `src/lib/lop/db.ts` | 130 | `lopDb` helper — calls `/api/lop/db` proxy with role in headers |
| `src/lib/lop/supabase.ts` | 29 | Server-side Supabase client (service-role) |
| `src/lib/lop/index.ts` | 3 | Barrel re-export |

---

## 6. Permission Matrix (19 actions x 5 roles)

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
| `users:manage` | | | | | Y |
| `config:manage` | | | | | Y |
| `facilities:manage` | | | | | Y |
| `audit:read` | | | | | Y |

**Global access roles** (see all facilities): `admin`, `accounting`

---

## 7. Server-Side DB Proxy (`/api/lop/db`)

All client pages call `lopDb()` (from `src/lib/lop/db.ts`) which POSTs to `/api/lop/db`. The API route:
1. Verifies `x-lop-user-id` header matches an active `lop_users` row
2. For write operations, checks `TABLE_WRITE_RULES` (maps table to allowed role list)
3. Executes the query using the **service-role** Supabase client (bypasses RLS)
4. Returns result as JSON

This means RLS policies are not the primary access control — `TABLE_WRITE_RULES` in the API route is.

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

## 9. Key Design Decisions & Fixes

### Supabase Client — Lazy Proxy Pattern
Client uses `new Proxy({} as SupabaseClient, { get... })` to defer creation until first property access. Prevents `supabaseKey is required` errors during Vercel static page generation.

### PKCE Flow
`flowType: 'pkce'` with `@supabase/ssr` cookie-based auth. The callback route uses `exchangeCodeForSession(code)`. Do NOT change to implicit flow.

### Middleware Auth Exclusions
`middleware.ts` skips auth check for:
- Any path NOT starting with `/lop`
- `/lop/login`
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

---

## 10. Git History (Key Commits)

| Commit | Message |
|--------|---------|
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

---

## 11. Deployment Commands

```bash
# Build locally
npx next build

# Deploy to Vercel production
npx vercel --prod --yes

# Commit and push
git add -A && git commit -m "message" && git push
```

### Supabase Management API (for direct SQL when CLI fails)
```bash
# Run SQL against live DB
curl -s -X POST \
  "https://api.supabase.com/v1/projects/dgmkjjwmnjiefsvbhujq/database/query" \
  -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT 1;"}'
```
Token stored in macOS Keychain under service "Supabase CLI".

---

## 12. Known Issues / Watch Items

1. **Env var fallback** — Must always check BOTH `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` with `??`
2. **Seeded admin UUID** — `info@getfocushealth.com` was seeded with a placeholder `auth_user_id`. Auto-link-by-email handles this on first Google login.
3. **`supabase db push` fails** — CLI login role gets permission denied (42501). Use Supabase Management API direct SQL instead.
4. **RLS vs TABLE_WRITE_RULES** — RLS policies exist but the DB proxy uses service-role (bypasses RLS). Actual write-gating is in `TABLE_WRITE_RULES` in `/api/lop/db`.
5. **Vercel deployment** — Sometimes `npx vercel --prod --yes` fails silently. Check output with `2>&1 | tail -20`.

---

## 13. PRD Compliance (FR-01 through FR-18) — All Complete

| FR | Requirement | Status |
|----|-------------|--------|
| FR-01 | Google OAuth login w/ PKCE, domain allow-list | Done |
| FR-02 | Role-based access control (5 roles, 19 actions) | Done |
| FR-03 | Facility-scoped data access | Done |
| FR-04 | Dashboard with status breakdown, charts, recent patients | Done |
| FR-05 | Patient list with search, filter by status/facility | Done |
| FR-06 | Patient detail with full CRUD, all PRD fields | Done |
| FR-07 | Document upload/management with 9 document types | Done |
| FR-08 | Document checklist (required + optional) | Done |
| FR-09 | Scheduling calendar with 30-min time slots | Done |
| FR-10 | Mark Arrived with confirmation | Done |
| FR-11 | Law firm management with metrics | Done |
| FR-12 | Reminder emails (manual + auto-cron) | Done |
| FR-13 | Reports with filters + CSV export | Done |
| FR-14 | Settings: Users, Facilities, Config, Audit log | Done |
| FR-15 | Audit logging for all mutations | Done |
| FR-16 | Financial gating (financial:view permission) | Done |
| FR-17 | Dynamic mandatory intake fields (from lop_config) | Done |
| FR-18 | Scheduling email notifications (director + front desk + patient) | Done |
