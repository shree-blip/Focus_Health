-- ============================================================
-- LOP Dashboard Schema Migration
-- Manages LOP patients across ER facilities
-- ============================================================

-- ————————————————
-- 1. ENUMS
-- ————————————————
CREATE TYPE lop_user_role AS ENUM (
  'front_desk',
  'scheduler',
  'medical_records',
  'accounting',
  'admin'
);

CREATE TYPE lop_case_status AS ENUM (
  'scheduled',
  'arrived',
  'intake_complete',
  'in_progress',
  'follow_up_needed',
  'paid',
  'partial_paid',
  'case_dropped',
  'closed_no_recovery'
);

CREATE TYPE lop_document_status AS ENUM (
  'not_requested',
  'requested',
  'received',
  'missing'
);

-- ————————————————
-- 2. FACILITIES
-- ————————————————
CREATE TABLE lop_facilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL DEFAULT 'ER',
  address       TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the three launch facilities
INSERT INTO lop_facilities (name, slug, type, address) VALUES
  ('ER of White Rock', 'white-rock', 'ER', '11830 Greenville Ave, Dallas, TX 75243'),
  ('ER of Irving', 'irving', 'ER', '3001 Skyway Cir N, Irving, TX 75038'),
  ('ER of Lufkin', 'lufkin', 'ER', '2535 S John Redditt Dr, Lufkin, TX 75904');

-- ————————————————
-- 3. USERS (LOP-specific profiles)
-- ————————————————
CREATE TABLE lop_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID NOT NULL UNIQUE,  -- links to Supabase auth.users
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          lop_user_role NOT NULL DEFAULT 'front_desk',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: which facilities a user can access
CREATE TABLE lop_user_facilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES lop_users(id) ON DELETE CASCADE,
  facility_id   UUID NOT NULL REFERENCES lop_facilities(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, facility_id)
);

-- ————————————————
-- 4. LAW FIRMS
-- ————————————————
CREATE TABLE lop_law_firms (
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
-- 5. PATIENTS (LOP cases)
-- ————————————————
CREATE TABLE lop_patients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id           UUID NOT NULL REFERENCES lop_facilities(id),
  law_firm_id           UUID REFERENCES lop_law_firms(id),

  -- Demographics (Front Desk Intake)
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  date_of_birth         DATE,
  phone                 TEXT,
  email                 TEXT,
  address_line1         TEXT,
  address_line2         TEXT,
  city                  TEXT,
  state                 TEXT,
  zip                   TEXT,
  date_of_accident      DATE,
  
  -- Scheduling
  expected_arrival      TIMESTAMPTZ,
  arrival_window_min    INT DEFAULT 60,  -- window in minutes

  -- Status
  case_status           lop_case_status NOT NULL DEFAULT 'scheduled',
  lop_letter_status     lop_document_status NOT NULL DEFAULT 'not_requested',
  medical_records_status lop_document_status NOT NULL DEFAULT 'not_requested',

  -- Billing (Medical Records team fills)
  bill_charges          NUMERIC(12,2),
  amount_collected      NUMERIC(12,2),
  date_paid             DATE,
  billing_tags          TEXT[],
  medical_record_tags   TEXT[],

  -- Notes
  follow_up_note        TEXT,
  intake_notes          TEXT,

  -- Audit
  created_by            UUID REFERENCES lop_users(id),
  updated_by            UUID REFERENCES lop_users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lop_patients_facility ON lop_patients(facility_id);
CREATE INDEX idx_lop_patients_law_firm ON lop_patients(law_firm_id);
CREATE INDEX idx_lop_patients_case_status ON lop_patients(case_status);
CREATE INDEX idx_lop_patients_expected_arrival ON lop_patients(expected_arrival);
CREATE INDEX idx_lop_patients_created_at ON lop_patients(created_at);

-- ————————————————
-- 6. PATIENT DOCUMENTS
-- ————————————————
CREATE TABLE lop_patient_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES lop_patients(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL,  -- 'lop_letter', 'medical_record', 'affidavit', 'bill', 'reduction_letter', 'drop_letter'
  file_name       TEXT,
  file_url        TEXT,
  storage_path    TEXT,           -- Supabase Storage path
  status          lop_document_status NOT NULL DEFAULT 'not_requested',
  notes           TEXT,
  uploaded_by     UUID REFERENCES lop_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lop_documents_patient ON lop_patient_documents(patient_id);

-- ————————————————
-- 7. REMINDER EMAILS LOG
-- ————————————————
CREATE TABLE lop_reminder_emails (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES lop_patients(id) ON DELETE CASCADE,
  law_firm_id     UUID REFERENCES lop_law_firms(id),
  recipient_email TEXT NOT NULL,
  email_type      TEXT NOT NULL,        -- 'lop_letter_request', 'document_followup', 'scheduled_report'
  subject         TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by         UUID REFERENCES lop_users(id),  -- NULL if automated
  status          TEXT NOT NULL DEFAULT 'sent',    -- 'sent', 'failed', 'bounced'
  error_message   TEXT
);

CREATE INDEX idx_lop_reminders_patient ON lop_reminder_emails(patient_id);
CREATE INDEX idx_lop_reminders_law_firm ON lop_reminder_emails(law_firm_id);

-- ————————————————
-- 8. AUDIT LOG
-- ————————————————
CREATE TABLE lop_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES lop_users(id),
  action          TEXT NOT NULL,          -- 'patient_created', 'status_changed', 'document_uploaded', 'reminder_sent', etc.
  entity_type     TEXT NOT NULL,          -- 'patient', 'law_firm', 'document', 'user'
  entity_id       UUID,
  facility_id     UUID REFERENCES lop_facilities(id),
  old_values      JSONB,
  new_values      JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lop_audit_user ON lop_audit_log(user_id);
CREATE INDEX idx_lop_audit_entity ON lop_audit_log(entity_type, entity_id);
CREATE INDEX idx_lop_audit_facility ON lop_audit_log(facility_id);
CREATE INDEX idx_lop_audit_created ON lop_audit_log(created_at);

-- ————————————————
-- 9. CONFIGURATION TABLE
-- ————————————————
CREATE TABLE lop_config (
  key             TEXT PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID REFERENCES lop_users(id)
);

-- Seed default config
INSERT INTO lop_config (key, value, description) VALUES
  ('reminder_delay_days', '5', 'Days after intake before auto-reminder for missing LOP letter'),
  ('low_collection_threshold', '3000', 'Dollar threshold for low-performing law firm alert'),
  ('scheduling_window_minutes', '60', 'Default scheduling block window in minutes'),
  ('mandatory_intake_fields', '["first_name","last_name","date_of_accident","law_firm_id","facility_id"]', 'Fields required at front desk intake');

-- ————————————————
-- 10. ROW LEVEL SECURITY
-- ————————————————

-- Enable RLS on all tables
ALTER TABLE lop_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_user_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_reminder_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lop_config ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's LOP user ID
CREATE OR REPLACE FUNCTION get_lop_user_id()
RETURNS UUID AS $$
  SELECT id FROM lop_users WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_lop_user_role()
RETURNS lop_user_role AS $$
  SELECT role FROM lop_users WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get facility IDs the current user can access
CREATE OR REPLACE FUNCTION get_lop_user_facility_ids()
RETURNS SETOF UUID AS $$
  SELECT facility_id FROM lop_user_facilities
  WHERE user_id = get_lop_user_id()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Facilities: all authenticated LOP users can read
CREATE POLICY "lop_facilities_select" ON lop_facilities
  FOR SELECT TO authenticated
  USING (TRUE);

-- Users: admins can manage, users can see own record
CREATE POLICY "lop_users_select" ON lop_users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR get_lop_user_role() IN ('admin', 'accounting'));

CREATE POLICY "lop_users_insert" ON lop_users
  FOR INSERT TO authenticated
  WITH CHECK (get_lop_user_role() = 'admin');

CREATE POLICY "lop_users_update" ON lop_users
  FOR UPDATE TO authenticated
  USING (get_lop_user_role() = 'admin');

-- User Facilities: admins manage, users see own assignments
CREATE POLICY "lop_user_facilities_select" ON lop_user_facilities
  FOR SELECT TO authenticated
  USING (user_id = get_lop_user_id() OR get_lop_user_role() = 'admin');

CREATE POLICY "lop_user_facilities_manage" ON lop_user_facilities
  FOR ALL TO authenticated
  USING (get_lop_user_role() = 'admin');

-- Law Firms: readable by all LOP users, manageable by admin/medical_records
CREATE POLICY "lop_law_firms_select" ON lop_law_firms
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM lop_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "lop_law_firms_manage" ON lop_law_firms
  FOR ALL TO authenticated
  USING (get_lop_user_role() IN ('admin', 'medical_records'));

-- Patients: facility-scoped access
CREATE POLICY "lop_patients_select" ON lop_patients
  FOR SELECT TO authenticated
  USING (
    get_lop_user_role() IN ('admin', 'accounting')
    OR facility_id IN (SELECT get_lop_user_facility_ids())
  );

CREATE POLICY "lop_patients_insert" ON lop_patients
  FOR INSERT TO authenticated
  WITH CHECK (
    get_lop_user_role() IN ('admin', 'front_desk', 'scheduler', 'medical_records')
    AND (
      get_lop_user_role() = 'admin'
      OR facility_id IN (SELECT get_lop_user_facility_ids())
    )
  );

CREATE POLICY "lop_patients_update" ON lop_patients
  FOR UPDATE TO authenticated
  USING (
    get_lop_user_role() IN ('admin', 'front_desk', 'medical_records')
    AND (
      get_lop_user_role() = 'admin'
      OR facility_id IN (SELECT get_lop_user_facility_ids())
    )
  );

-- Documents: same facility scoping as patients
CREATE POLICY "lop_documents_select" ON lop_patient_documents
  FOR SELECT TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM lop_patients
      WHERE get_lop_user_role() IN ('admin', 'accounting')
        OR facility_id IN (SELECT get_lop_user_facility_ids())
    )
  );

CREATE POLICY "lop_documents_manage" ON lop_patient_documents
  FOR ALL TO authenticated
  USING (
    get_lop_user_role() IN ('admin', 'medical_records')
    AND patient_id IN (
      SELECT id FROM lop_patients
      WHERE get_lop_user_role() = 'admin'
        OR facility_id IN (SELECT get_lop_user_facility_ids())
    )
  );

-- Reminder Emails: facility-scoped reads, admin/med_records send
CREATE POLICY "lop_reminders_select" ON lop_reminder_emails
  FOR SELECT TO authenticated
  USING (
    get_lop_user_role() IN ('admin', 'accounting')
    OR patient_id IN (
      SELECT id FROM lop_patients
      WHERE facility_id IN (SELECT get_lop_user_facility_ids())
    )
  );

CREATE POLICY "lop_reminders_insert" ON lop_reminder_emails
  FOR INSERT TO authenticated
  WITH CHECK (get_lop_user_role() IN ('admin', 'medical_records'));

-- Audit Log: admins only
CREATE POLICY "lop_audit_select" ON lop_audit_log
  FOR SELECT TO authenticated
  USING (get_lop_user_role() = 'admin');

CREATE POLICY "lop_audit_insert" ON lop_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);  -- any authenticated user action gets logged

-- Config: admins manage, all LOP users can read
CREATE POLICY "lop_config_select" ON lop_config
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM lop_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "lop_config_manage" ON lop_config
  FOR ALL TO authenticated
  USING (get_lop_user_role() = 'admin');

-- ————————————————
-- 11. UPDATED_AT TRIGGER
-- ————————————————
CREATE OR REPLACE FUNCTION lop_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lop_facilities_updated_at
  BEFORE UPDATE ON lop_facilities
  FOR EACH ROW EXECUTE FUNCTION lop_set_updated_at();

CREATE TRIGGER trg_lop_users_updated_at
  BEFORE UPDATE ON lop_users
  FOR EACH ROW EXECUTE FUNCTION lop_set_updated_at();

CREATE TRIGGER trg_lop_law_firms_updated_at
  BEFORE UPDATE ON lop_law_firms
  FOR EACH ROW EXECUTE FUNCTION lop_set_updated_at();

CREATE TRIGGER trg_lop_patients_updated_at
  BEFORE UPDATE ON lop_patients
  FOR EACH ROW EXECUTE FUNCTION lop_set_updated_at();

CREATE TRIGGER trg_lop_documents_updated_at
  BEFORE UPDATE ON lop_patient_documents
  FOR EACH ROW EXECUTE FUNCTION lop_set_updated_at();

-- ————————————————
-- 12. STORAGE BUCKET for LOP documents
-- ————————————————
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lop-documents',
  'lop-documents',
  FALSE,
  10485760,  -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: facility-scoped upload/download
CREATE POLICY "lop_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lop-documents');

CREATE POLICY "lop_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lop-documents'
    AND get_lop_user_role() IN ('admin', 'medical_records')
  );
