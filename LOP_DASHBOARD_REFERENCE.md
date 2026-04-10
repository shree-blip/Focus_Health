# LOP Dashboard — Complete Implementation Reference

> **Last updated:** April 10, 2026
> **Purpose:** Avoid re-crawling files in future sessions. Read this first.

---

## 1. Architecture Overview

| Layer | Tech | Details |
|-------|------|---------|
| Framework | Next.js 15 (App Router) | `/Users/focus/Desktop/App-FullStack/focus-health/` |
| Database | Supabase | Project ref `dgmkjjwmnjiefsvbhujq`, URL `https://dgmkjjwmnjiefsvbhujq.supabase.co` |
| Auth | Supabase Google OAuth (PKCE) | `flowType: 'pkce'` in client config |
| Hosting | Vercel | Production: `https://www.getfocushealth.com` |
| Cron | Vercel Cron | `vercel.json` — daily at `0 14 * * *` |
| Storage | Supabase Storage | Bucket: `lop-documents` |
| Styling | Tailwind + shadcn/ui | Components in `src/components/ui/` |

---

## 2. Environment Variables

### Vercel Production
```
NEXT_PUBLIC_SUPABASE_URL=https://dgmkjjwmnjiefsvbhujq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<key>   # NOTE: "DEFAULT" variant
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

## 3. Database Schema

**Migration file:** `supabase/migrations/20260410_lop_dashboard.sql`

### Enums (4)
- `lop_user_role`: admin, front_desk, billing, viewer
- `lop_case_status`: intake, treating, mri_pending, mri_complete, settled, closed
- `lop_document_type`: lop_agreement, medical_record, insurance_info, mri_report, billing_statement, correspondence, other
- `lop_reminder_status`: pending, sent, failed

### Tables (9)
1. **`lop_facilities`** — id (uuid), name, address, phone, is_active, created_at
2. **`lop_users`** — id, auth_user_id, email, full_name, role (enum), is_active, created_at
3. **`lop_user_facilities`** — user_id, facility_id (junction)
4. **`lop_law_firms`** — id, name, contact_name, contact_email, contact_phone, address, notes, created_at
5. **`lop_patients`** — id, facility_id (FK), law_firm_id (FK), first_name, last_name, dob, phone, email, insurance_provider, insurance_policy_number, case_status (enum), case_status_note, lop_received (bool), lop_received_date, attorney_name, attorney_phone, attorney_email, accident_date, accident_type, injury_summary, treatment_start_date, treatment_end_date, estimated_settlement, balance_owed, amount_paid, tags (text[]), notes, created_by, created_at, updated_at
6. **`lop_patient_documents`** — id, patient_id (FK), document_type (enum), file_name, file_path, uploaded_by, created_at
7. **`lop_reminder_emails`** — id, patient_id (FK), sent_to, subject, body, status (enum), error_message, created_at
8. **`lop_audit_log`** — id, user_id, action, entity_type, entity_id, metadata (jsonb), created_at
9. **`lop_config`** — id, key (unique), value, updated_at

### Seeded Data
- 3 facilities: ER of Irving, ER of White Rock, ER of Lufkin
- 1 admin user: `info@getfocushealth.com` (auth_user_id will be auto-linked on first Google login)

### RLS
- All tables have RLS enabled
- Policies allow authenticated users to perform operations
- `lop_config` has separate read/write policies

---

## 4. File Map — LOP Routes & Components

### Auth Files
| File | Purpose | Lines |
|------|---------|-------|
| `middleware.ts` | Protects `/lop/*`, excludes `/lop/login` and `/lop/auth` | ~55 |
| `app/lop/login/page.tsx` | Google OAuth login page | ~124 |
| `app/lop/auth/callback/route.ts` | PKCE code exchange, sets cookies, redirects to `/lop` | ~40 |
| `src/integrations/supabase/client.ts` | Shared Supabase client (lazy Proxy, PKCE) | ~52 |
| `src/lib/lop/client.ts` | Re-exports `supabase` as `lopClient` (any-typed) | small |
| `src/components/lop/LopAuthProvider.tsx` | Auth context: lopUser, facilities, signOut. 3-step user resolution (auth_user_id → email match → auto-provision) | ~146 |

### Authenticated Pages (all under `app/lop/(authenticated)/`)
| Route | File | Purpose | Lines |
|-------|------|---------|-------|
| `/lop` | `page.tsx` | Dashboard — status breakdown, charts, recent patients | ~268 |
| `/lop/patients` | `patients/page.tsx` | Patient list with search, filter by status/facility | ~184 |
| `/lop/patients/new` | `patients/new/page.tsx` | New patient intake form | — |
| `/lop/patients/[id]` | `patients/[id]/page.tsx` | Patient detail — full CRUD, documents, reminders, all PRD fields | ~1120 |
| `/lop/scheduling` | `scheduling/page.tsx` | Calendar view, mark arrived | ~234 |
| `/lop/law-firms` | `law-firms/page.tsx` | Law firms list, metrics, audit log | ~310 |
| `/lop/reports` | `reports/page.tsx` | Reports with filters, CSV export | ~580 |
| `/lop/settings` | `settings/page.tsx` | Users CRUD, Facilities CRUD, Config, Audit detail | — |

### Layout & Shell
| File | Purpose |
|------|---------|
| `app/lop/(authenticated)/layout.tsx` | Wraps authenticated pages with LopAuthProvider + LopShell |
| `src/components/lop/LopShell.tsx` | Sidebar navigation (Dashboard, Patients, Scheduling, Law Firms, Reports, Settings) |

### API Routes
| Route | File | Purpose |
|-------|------|---------|
| `POST /api/lop/send-reminder` | `app/api/lop/send-reminder/route.ts` | Manual reminder email via SMTP |
| `GET /api/lop/auto-remind` | `app/api/lop/auto-remind/route.ts` | Cron endpoint — daily auto-reminders |

### Lib Files
| File | Purpose |
|------|---------|
| `src/lib/lop/permissions.ts` | 18-action permission matrix, `hasPermission()`, `hasGlobalAccess()`, `isAllowedDomain()` |
| `src/lib/lop/types.ts` | All TypeScript interfaces + display helpers (status labels, colors, etc.) |

---

## 5. Allowed Domains for Auto-Provisioning

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

## 6. Permission Matrix (18 actions)

Roles: `admin`, `front_desk`, `billing`, `viewer`

- **admin**: All permissions
- **front_desk**: view/create/edit patients, view law firms, view/create/edit scheduling, view reports
- **billing**: view/edit patients, view law firms, view/export reports
- **viewer**: view patients, view law firms, view scheduling, view reports

---

## 7. Key Design Decisions & Fixes

### Supabase Client — Lazy Proxy Pattern
Client is NOT eagerly initialized. Uses `new Proxy({} as SupabaseClient<Database>, { get... })` to defer creation until first property access. This prevents `supabaseKey is required` errors during Vercel's static page generation.

### PKCE Flow
`flowType: 'pkce'` is set in client auth config. The callback route uses `exchangeCodeForSession(code)`. Do NOT change back to implicit flow.

### Middleware Auth Exclusions
Middleware at `middleware.ts` skips auth check for:
- Any path NOT starting with `/lop`
- `/lop/login`
- Any path starting with `/lop/auth` (covers `/lop/auth/callback`)

### Auto-Link Users by Email
`LopAuthProvider` does 3-step resolution:
1. Query `lop_users` by `auth_user_id`
2. If not found, query by `email` and UPDATE `auth_user_id` to link
3. If still not found and domain is allowed, INSERT new user with `front_desk` role

### Loading States
All pages use `Loader2` spinner from lucide-react (not `animate-pulse` text). Action buttons have individual loading states:
- Send Reminder: disabled + "Sending…"
- Delete Document: per-document spinner via `deletingDocId` state
- Mark Arrived: loading state on button

---

## 8. Git History (Recent)

| Commit | Message |
|--------|---------|
| `9e72aa1` | Fix login: exclude /lop/auth/callback from middleware auth check |
| `bb977ec` | Fix LOP login: PKCE flow, auto-link users by email, action spinners on all pages |
| `1efeb03` | Fix LOP login: env var name fallback, remove domain list, add error handling |
| `4dc9b91` | Lazy-init Supabase client (Vercel build fix) |
| `64159ea` | LOP PRD compliance: all fields, doc upload, tags, mark arrived, metrics, CSV export, status breakdown, add facility, audit detail |

---

## 9. Deployment Commands

```bash
# Build locally
npx next build

# Deploy to Vercel production
npx vercel --prod --yes

# Commit and push
git add -A && git commit -m "message" && git push
```

---

## 10. Known Issues / Watch Items

1. **Env var fallback** — Must always check BOTH `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` with `??`
2. **Seeded admin UUID** — `info@getfocushealth.com` was seeded with a placeholder `auth_user_id`. The auto-link-by-email logic in LopAuthProvider handles this on first Google login.
3. **RLS policies** — If queries return empty after login, check that `auth.uid()` matches `lop_users.auth_user_id`.
4. **`shree@focusyourfinance.com`** — Will be auto-provisioned as `front_desk`. May need manual upgrade to `admin` via Settings page or direct DB update.
5. **Vercel deployment** — Sometimes `npx vercel --prod --yes` fails with exit code 1. Check output with `2>&1 | tail -20`.

---

## 11. PRD Compliance Status (All Complete)

- [x] Patient Detail: All 20+ fields from PRD, document upload, tags, status history
- [x] Scheduling: Mark Arrived button with confirmation
- [x] Law Firms: Metrics cards (total firms, avg patients, top firm), audit log section
- [x] Reports: Date range filter, facility filter, status filter, CSV export
- [x] Dashboard: Status breakdown donut chart, recent patients table, facility quick-switch
- [x] Settings: Facility CRUD (Add Facility form), Audit log with expandable JSON detail, User management, Config
