-- ============================================================
-- Focus Health Cloud SQL Schema
-- Replaces Supabase with Cloud SQL Postgres 16
-- ============================================================

-- ————————————————
-- BLOG POSTS
-- ————————————————
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'Insights',
  tags          TEXT[] DEFAULT '{}',
  author        TEXT NOT NULL DEFAULT 'Focus Health Team',
  author_role   TEXT,
  cover_image   TEXT,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- ————————————————
-- ADMIN USERS
-- ————————————————
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT 'Admin',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ————————————————
-- ADMIN SESSIONS
-- ————————————————
CREATE TABLE IF NOT EXISTS admin_sessions (
  id            TEXT PRIMARY KEY,
  admin_id      UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ————————————————
-- ADMIN SUBMISSIONS (contact forms)
-- ————————————————
CREATE TABLE IF NOT EXISTS admin_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type     TEXT NOT NULL DEFAULT 'contact',
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  message       TEXT,
  interest      TEXT,
  data          JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_form_type ON admin_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON admin_submissions(created_at DESC);

-- ————————————————
-- LOP ENUMS
-- ————————————————
DO $$ BEGIN
  CREATE TYPE lop_user_role AS ENUM (
    'front_desk', 'scheduler', 'medical_records', 'accounting', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lop_case_status AS ENUM (
    'scheduled', 'arrived', 'intake_complete', 'in_progress',
    'follow_up_needed', 'paid', 'partial_paid', 'case_dropped', 'closed_no_recovery'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lop_document_status AS ENUM (
    'not_requested', 'requested', 'received', 'missing'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ————————————————
-- LOP FACILITIES
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_facilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL DEFAULT 'ER',
  address       TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO lop_facilities (name, slug, type, address) VALUES
  ('ER of White Rock', 'white-rock', 'ER', '11830 Greenville Ave, Dallas, TX 75243'),
  ('ER of Irving', 'irving', 'ER', '3001 Skyway Cir N, Irving, TX 75038'),
  ('ER of Lufkin', 'lufkin', 'ER', '2535 S John Redditt Dr, Lufkin, TX 75904')
ON CONFLICT (slug) DO NOTHING;

-- ————————————————
-- LOP AUTH USERS (replaces Supabase auth.users)
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_auth_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ————————————————
-- LOP USERS (profiles)
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID NOT NULL UNIQUE REFERENCES lop_auth_users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          lop_user_role NOT NULL DEFAULT 'front_desk',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lop_user_facilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES lop_users(id) ON DELETE CASCADE,
  facility_id   UUID NOT NULL REFERENCES lop_facilities(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, facility_id)
);

-- ————————————————
-- LOP SESSIONS
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_sessions (
  id            TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES lop_users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lop_sessions_user ON lop_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lop_sessions_expires ON lop_sessions(expires_at);

-- ————————————————
-- LOP LAW FIRMS
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_law_firms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  intake_email        TEXT,
  escalation_email    TEXT,
  primary_contact     TEXT,
  primary_phone       TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ————————————————
-- LOP PATIENTS
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_patients (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id             UUID NOT NULL REFERENCES lop_facilities(id),
  law_firm_id             UUID REFERENCES lop_law_firms(id),
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  date_of_birth           DATE,
  phone                   TEXT,
  email                   TEXT,
  address_line1           TEXT,
  address_line2           TEXT,
  city                    TEXT,
  state                   TEXT,
  zip                     TEXT,
  date_of_accident        DATE,
  expected_arrival        TIMESTAMPTZ,
  arrival_window_min      INT DEFAULT 60,
  case_status             lop_case_status NOT NULL DEFAULT 'scheduled',
  lop_letter_status       lop_document_status NOT NULL DEFAULT 'not_requested',
  medical_records_status  lop_document_status NOT NULL DEFAULT 'not_requested',
  bill_charges            NUMERIC(12,2),
  amount_collected        NUMERIC(12,2),
  date_paid               DATE,
  billing_tags            TEXT[],
  medical_record_tags     TEXT[],
  follow_up_note          TEXT,
  intake_notes            TEXT,
  created_by              UUID REFERENCES lop_users(id),
  updated_by              UUID REFERENCES lop_users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lop_patients_facility ON lop_patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_lop_patients_law_firm ON lop_patients(law_firm_id);
CREATE INDEX IF NOT EXISTS idx_lop_patients_case_status ON lop_patients(case_status);
CREATE INDEX IF NOT EXISTS idx_lop_patients_expected_arrival ON lop_patients(expected_arrival);
CREATE INDEX IF NOT EXISTS idx_lop_patients_created_at ON lop_patients(created_at);

-- ————————————————
-- LOP PATIENT DOCUMENTS
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_patient_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES lop_patients(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL,
  file_name       TEXT,
  file_url        TEXT,
  storage_path    TEXT,
  status          lop_document_status NOT NULL DEFAULT 'not_requested',
  notes           TEXT,
  uploaded_by     UUID REFERENCES lop_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lop_documents_patient ON lop_patient_documents(patient_id);

-- ————————————————
-- LOP REMINDER EMAILS
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_reminder_emails (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES lop_patients(id) ON DELETE CASCADE,
  law_firm_id     UUID REFERENCES lop_law_firms(id),
  recipient_email TEXT NOT NULL,
  email_type      TEXT NOT NULL,
  subject         TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by         UUID REFERENCES lop_users(id),
  status          TEXT NOT NULL DEFAULT 'sent',
  error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_lop_reminders_patient ON lop_reminder_emails(patient_id);
CREATE INDEX IF NOT EXISTS idx_lop_reminders_law_firm ON lop_reminder_emails(law_firm_id);

-- ————————————————
-- LOP AUDIT LOG
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES lop_users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  facility_id     UUID REFERENCES lop_facilities(id),
  old_values      JSONB,
  new_values      JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lop_audit_user ON lop_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_lop_audit_entity ON lop_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_lop_audit_facility ON lop_audit_log(facility_id);
CREATE INDEX IF NOT EXISTS idx_lop_audit_created ON lop_audit_log(created_at);

-- ————————————————
-- LOP CONFIG
-- ————————————————
CREATE TABLE IF NOT EXISTS lop_config (
  key             TEXT PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID REFERENCES lop_users(id)
);

INSERT INTO lop_config (key, value, description) VALUES
  ('reminder_delay_days', '5', 'Days after intake before auto-reminder for missing LOP letter'),
  ('low_collection_threshold', '3000', 'Dollar threshold for low-performing law firm alert'),
  ('scheduling_window_minutes', '60', 'Default scheduling block window in minutes'),
  ('mandatory_intake_fields', '["first_name","last_name","date_of_accident","law_firm_id","facility_id"]', 'Fields required at front desk intake')
ON CONFLICT (key) DO NOTHING;

-- ————————————————
-- UPDATED_AT TRIGGER
-- ————————————————
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_updated_at_trigger(tbl TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    CREATE TRIGGER trg_%s_updated_at
    BEFORE UPDATE ON %s
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()', tbl, tbl);
EXCEPTION WHEN duplicate_object THEN null;
END;
$$ LANGUAGE plpgsql;

SELECT create_updated_at_trigger('blog_posts');
SELECT create_updated_at_trigger('admin_users');
SELECT create_updated_at_trigger('lop_facilities');
SELECT create_updated_at_trigger('lop_users');
SELECT create_updated_at_trigger('lop_law_firms');
SELECT create_updated_at_trigger('lop_patients');
SELECT create_updated_at_trigger('lop_patient_documents');
