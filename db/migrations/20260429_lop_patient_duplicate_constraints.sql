-- ======================================================
-- LOP Patient Duplicate Prevention Constraints
-- Applied: 2026-04-29
-- ======================================================
-- Two hard constraints that block true duplicates at the DB level:
--   1. Same MRN at the same facility → always a duplicate
--   2. Same patient name + date_of_service at same facility → same visit entered twice
--
-- Returning patients (same name, different date_of_service) are ALLOWED — a
-- patient can visit the ER multiple times and each visit is a separate case.
-- ======================================================

-- 1. Unique MRN per facility (partial — only when MRN is provided)
CREATE UNIQUE INDEX IF NOT EXISTS uq_lop_patients_facility_mrn
  ON lop_patients (facility_id, mrn)
  WHERE mrn IS NOT NULL AND mrn <> '';

-- 2. Unique (facility + name + date_of_service) — prevents same visit imported twice
--    Uses lower() so "John" and "john" aren't two different people.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lop_patients_facility_name_dos
  ON lop_patients (facility_id, lower(last_name), lower(first_name), date_of_service)
  WHERE date_of_service IS NOT NULL;

-- 3. Advisory index for the UI duplicate-check query (no uniqueness enforced)
--    Helps catch duplicates when DOB is known but date_of_service differs (returning patients)
CREATE INDEX IF NOT EXISTS idx_lop_patients_name_dob
  ON lop_patients (facility_id, lower(last_name), lower(first_name), date_of_birth);

COMMENT ON INDEX uq_lop_patients_facility_mrn IS
  'Prevents the same MRN being imported or entered twice for the same facility.';

COMMENT ON INDEX uq_lop_patients_facility_name_dos IS
  'Prevents the same patient visit (name + date of service) being created twice.';
