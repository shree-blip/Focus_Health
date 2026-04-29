-- ============================================================
-- Migration: lop_patient_identities
-- Purpose  : Separate the PERSON from the CASE so the same
--            patient can have multiple visits / law firms /
--            facilities over time.
--
-- Model after this migration:
--   lop_patient_identities  →  one row per real human
--   lop_patients            →  one row per case / visit
--                              (has identity_id FK)
-- ============================================================

-- ── 1. Create identity table ───────────────────────────────
CREATE TABLE IF NOT EXISTS lop_patient_identities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  date_of_birth DATE,
  phone         TEXT,
  email         TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique on (first_name, last_name, date_of_birth) when DOB is present
CREATE UNIQUE INDEX IF NOT EXISTS uq_identity_with_dob
  ON lop_patient_identities (lower(first_name), lower(last_name), date_of_birth)
  WHERE date_of_birth IS NOT NULL;

-- Soft unique on name alone (without DOB) — advisory, not enforced by constraint
CREATE INDEX IF NOT EXISTS idx_identity_name
  ON lop_patient_identities (lower(first_name), lower(last_name));

CREATE INDEX IF NOT EXISTS idx_identity_phone
  ON lop_patient_identities (phone)
  WHERE phone IS NOT NULL;

-- ── 2. Add identity_id to lop_patients ────────────────────
ALTER TABLE lop_patients
  ADD COLUMN IF NOT EXISTS identity_id UUID
    REFERENCES lop_patient_identities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lop_patients_identity
  ON lop_patients(identity_id)
  WHERE identity_id IS NOT NULL;

-- ── 3. Backfill: create one identity per existing unique person ──────────────
--    Group by (lower(first_name), lower(last_name), date_of_birth).
--    For each group take the most-recently-updated patient's demographics.
DO $$
DECLARE
  rec RECORD;
  new_id UUID;
BEGIN
  FOR rec IN
    SELECT DISTINCT ON (lower(first_name), lower(last_name), date_of_birth)
      first_name, last_name, date_of_birth,
      phone, email,
      address_line1, address_line2, city, state, zip
    FROM lop_patients
    WHERE identity_id IS NULL
    ORDER BY lower(first_name), lower(last_name), date_of_birth,
             updated_at DESC NULLS LAST
  LOOP
    -- Insert identity (skip if already exists from a prior run)
    INSERT INTO lop_patient_identities
      (first_name, last_name, date_of_birth, phone, email,
       address_line1, address_line2, city, state, zip)
    VALUES
      (rec.first_name, rec.last_name, rec.date_of_birth,
       rec.phone, rec.email,
       rec.address_line1, rec.address_line2, rec.city, rec.state, rec.zip)
    ON CONFLICT DO NOTHING
    RETURNING id INTO new_id;

    -- If ON CONFLICT triggered (row already existed), look it up
    IF new_id IS NULL THEN
      SELECT id INTO new_id
      FROM lop_patient_identities
      WHERE lower(first_name) = lower(rec.first_name)
        AND lower(last_name)  = lower(rec.last_name)
        AND (
              (date_of_birth IS NULL AND rec.date_of_birth IS NULL)
           OR date_of_birth = rec.date_of_birth
            );
    END IF;

    IF new_id IS NOT NULL THEN
      -- Link all matching patient rows to this identity
      UPDATE lop_patients
      SET identity_id = new_id
      WHERE identity_id IS NULL
        AND lower(first_name) = lower(rec.first_name)
        AND lower(last_name)  = lower(rec.last_name)
        AND (
              (date_of_birth IS NULL AND rec.date_of_birth IS NULL)
           OR date_of_birth = rec.date_of_birth
            );
    END IF;
  END LOOP;
END $$;

-- ── 4. Helper function: find or create an identity ────────────────────────────
--    Used by the application on new patient creation.
--    Match priority: (name + DOB) > (name + phone) > (name only)
CREATE OR REPLACE FUNCTION lop_find_or_create_identity(
  p_first TEXT,
  p_last  TEXT,
  p_dob   DATE    DEFAULT NULL,
  p_phone TEXT    DEFAULT NULL,
  p_email TEXT    DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  existing_id UUID;
  new_id      UUID;
BEGIN
  -- 1) Try exact name + DOB match (strongest match)
  IF p_dob IS NOT NULL THEN
    SELECT id INTO existing_id
    FROM lop_patient_identities
    WHERE lower(first_name) = lower(p_first)
      AND lower(last_name)  = lower(p_last)
      AND date_of_birth     = p_dob
    LIMIT 1;
  END IF;

  -- 2) Fall back to name + phone
  IF existing_id IS NULL AND p_phone IS NOT NULL THEN
    SELECT id INTO existing_id
    FROM lop_patient_identities
    WHERE lower(first_name) = lower(p_first)
      AND lower(last_name)  = lower(p_last)
      AND phone             = p_phone
    LIMIT 1;
  END IF;

  -- 3) Return existing identity if found
  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  -- 4) Create a new identity
  INSERT INTO lop_patient_identities
    (first_name, last_name, date_of_birth, phone, email)
  VALUES
    (p_first, p_last, p_dob, p_phone, p_email)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ── 5. Updated_at trigger ─────────────────────────────────
SELECT create_updated_at_trigger('lop_patient_identities');

-- ── 6. Helpful view: all cases per identity ───────────────
CREATE OR REPLACE VIEW lop_identity_cases AS
SELECT
  i.id                AS identity_id,
  i.first_name,
  i.last_name,
  i.date_of_birth,
  i.phone,
  count(p.id)         AS total_cases,
  array_agg(p.id ORDER BY p.created_at DESC)
                      AS case_ids,
  array_agg(DISTINCT f.name ORDER BY f.name)
                      AS facilities,
  array_agg(DISTINCT lf.name ORDER BY lf.name)
                      AS law_firms,
  max(p.date_of_service::TEXT)
                      AS latest_dos,
  sum(p.bill_charges)::NUMERIC(14,2)
                      AS total_billed,
  sum(p.amount_collected)::NUMERIC(14,2)
                      AS total_collected
FROM lop_patient_identities i
JOIN lop_patients p   ON p.identity_id = i.id
LEFT JOIN lop_facilities f ON f.id = p.facility_id
LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
GROUP BY i.id, i.first_name, i.last_name, i.date_of_birth, i.phone;

COMMENT ON TABLE lop_patient_identities IS
  'One row per real human being. lop_patients links here via identity_id (one row per case/visit).';

COMMENT ON FUNCTION lop_find_or_create_identity IS
  'Match by (name+DOB) or (name+phone), else create new identity. Returns identity UUID.';
