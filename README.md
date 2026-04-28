# Focus Health

Next.js 15 (App Router) application for the Focus Health public site and the LOP dashboard. Hosted on **Google Cloud Run**, backed by **Cloud SQL (PostgreSQL 16)** and **Google Cloud Storage**.

## Tech Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL 16 on Cloud SQL (`pg` driver, Unix socket via Cloud SQL connector in production)
- Google Cloud Storage for private document uploads (served through `/api/lop/file`)
- Google OAuth + HMAC-signed session cookies for the LOP dashboard
- OpenAI GPT-4o (AI SDK, streaming) for the admin AI assistant
- Nodemailer (SMTP) for transactional / reminder email
- Twilio for optional SMS

## Local Development

Requires Node 20+ and either `bun` or `npm`. Install dependencies and start the dev server:

```sh
bun install      # or: npm install
bun run dev      # or: npm run dev
```

The app is served at `http://localhost:3000`.

To talk to a real Cloud SQL instance from your machine, either run the [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) and point `DB_HOST` at `127.0.0.1`, or use the public IP TCP path already wired in [src/lib/db.ts](src/lib/db.ts).

## Environment Variables

Create `.env.local` for local dev. In Cloud Run, plain values come from `--set-env-vars` and secrets are mounted from **Secret Manager** via `--set-secrets`.

### Database (Cloud SQL)

```sh
# Cloud Run (Unix socket via Cloud SQL connector)
CLOUD_SQL_CONNECTION_NAME=adept-box-494606-s9:us-central1:focus-health-db
DB_USER=focus_app
DB_NAME=focus_health
DB_PASSWORD=...                 # from Secret Manager: focus-db-password

# Local dev fallback (TCP)
DB_HOST=...
DB_PORT=5432
```

### LOP Dashboard

```sh
LOP_JWT_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...        # Secret Manager: google-client-secret
CRON_SECRET=...                 # Secret Manager: cron-secret
OPENAI_API_KEY=...              # Secret Manager: openai-api-key
```

### Email (Resend / SMTP)

```sh
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@getfocushealth.com
SMTP_PASS=...                   # Secret Manager: smtp-pass

# Public marketing forms (Resend)
RESEND_API_KEY=...
RESEND_FROM_EMAIL="Focus Health <no-reply@yourdomain.com>"
RESEND_INFO_EMAIL=info@getfocushealth.com
```

`RESEND_FROM_EMAIL` must use a sender domain verified in Resend. If `RESEND_INFO_EMAIL` is unset, internal notifications fall back to `info@getfocushealth.com`.

### Twilio (optional SMS)

```sh
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

## Deployment — Google Cloud Run

The service is built directly from source using Google Cloud Buildpacks (no Dockerfile needed).

```sh
gcloud run deploy focus-health-new \
  --source . \
  --region us-central1 \
  --project adept-box-494606-s9 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances adept-box-494606-s9:us-central1:focus-health-db \
  --set-env-vars "DB_USER=focus_app,DB_NAME=focus_health,CLOUD_SQL_CONNECTION_NAME=adept-box-494606-s9:us-central1:focus-health-db,LOP_JWT_SECRET=...,NEXT_PUBLIC_GOOGLE_CLIENT_ID=...,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=info@getfocushealth.com" \
  --set-secrets "DB_PASSWORD=focus-db-password:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,SMTP_PASS=smtp-pass:latest,OPENAI_API_KEY=openai-api-key:latest,CRON_SECRET=cron-secret:latest" \
  --quiet
```

| | |
|---|---|
| GCP project | `adept-box-494606-s9` |
| Cloud Run service | `focus-health-new` |
| Region | `us-central1` |
| Service URL | `https://focus-health-new-1075627982134.us-central1.run.app` |
| Cloud SQL instance | `focus-health-db` (PostgreSQL 16) |
| GCS bucket | `focus-health-assets-adept-box-494606-s9` (private) |
| Runtime service account | `1075627982134-compute@developer.gserviceaccount.com` |

The runtime service account must hold:

- `roles/cloudsql.client` — to open the Cloud SQL Unix socket
- `roles/secretmanager.secretAccessor` — to read mounted secrets
- `roles/storage.objectAdmin` on the assets bucket — for upload / delete

### Cron — Cloud Scheduler

Daily LOP reminder email is driven by a Cloud Scheduler job hitting `GET /api/lop/auto-remind` with `Authorization: Bearer ${CRON_SECRET}`. Example:

```sh
gcloud scheduler jobs create http lop-auto-remind \
  --schedule="0 14 * * *" \
  --uri="https://focus-health-new-1075627982134.us-central1.run.app/api/lop/auto-remind" \
  --http-method=GET \
  --headers="Authorization=Bearer <CRON_SECRET>" \
  --time-zone="America/Chicago" \
  --location=us-central1
```

### Direct Cloud SQL access

```sh
psql "host=/cloudsql/adept-box-494606-s9:us-central1:focus-health-db dbname=focus_health user=focus_app password=<DB_PASSWORD>"
```

Prefer committing migration SQL files in [db/migrations/](db/migrations/) for reproducibility — applied manually to Cloud SQL on top of [db/migrations/cloud_sql_schema.sql](db/migrations/cloud_sql_schema.sql), the canonical schema.

## LOP Dashboard

For the full LOP dashboard architecture, schema, file map, permissions, and known issues, see [LOP_DASHBOARD_REFERENCE.md](LOP_DASHBOARD_REFERENCE.md).
