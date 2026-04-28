-- Migration: Add ER of White Rock CSV fields to lop_patients
-- Date: 2026-04-27

-- 1. Create disposition_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lop_disposition_status') THEN
    CREATE TYPE lop_disposition_status AS ENUM (
      'discharged',
      'ama',
      'mse',
      'lwbs',
      'eloped_lbtc',
      'observation',
      'transferred'
    );
  END IF;
END$$;

-- 2. Add new columns to lop_patients (safe, idempotent)
ALTER TABLE lop_patients
  ADD COLUMN IF NOT EXISTS mrn                  TEXT,
  ADD COLUMN IF NOT EXISTS date_of_service      DATE,
  ADD COLUMN IF NOT EXISTS disposition_status   TEXT,
  ADD COLUMN IF NOT EXISTS chief_complaint      TEXT,
  ADD COLUMN IF NOT EXISTS primary_insurance    TEXT,
  ADD COLUMN IF NOT EXISTS is_lop_case          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referral_source      TEXT,
  ADD COLUMN IF NOT EXISTS llc_billed_charges   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS pllc_billed_charges  NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS total_received_llc   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS total_received_pllc  NUMERIC(12,2);

-- 3. Make facility_id nullable (CSV records will be assigned to ER of White Rock)
ALTER TABLE lop_patients ALTER COLUMN facility_id DROP NOT NULL;

-- 4. Add index for common queries
CREATE INDEX IF NOT EXISTS idx_lop_patients_mrn ON lop_patients(mrn);
CREATE INDEX IF NOT EXISTS idx_lop_patients_dos ON lop_patients(date_of_service);
CREATE INDEX IF NOT EXISTS idx_lop_patients_is_lop ON lop_patients(is_lop_case);

-- 5. Ensure ER of White Rock facility exists
INSERT INTO lop_facilities (id, name, type, address, city, state, zip, phone, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'ER of White Rock',
  'emergency_room',
  '9440 Garland Rd',
  'Dallas',
  'TX',
  '75218',
  NULL,
  true,
  now()
)
ON CONFLICT DO NOTHING;
