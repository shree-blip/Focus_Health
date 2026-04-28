-- ======================================================
-- LOP Schema Patch — Phase 2 (Cloud SQL)
-- Applied: 2026-04-27
-- ======================================================

-- lop_facilities: scheduling email notification columns
ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS director_email TEXT;
ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS front_desk_email TEXT;

-- lop_patients: additional financial and billing columns
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS reduction_amount NUMERIC(12,2);
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS billing_date DATE;
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES lop_users(id);
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- lop_case_status enum: add no_show value
ALTER TYPE lop_case_status ADD VALUE IF NOT EXISTS 'no_show';
