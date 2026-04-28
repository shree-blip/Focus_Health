-- Add columns used by the White Rock LOP tracker CSV that don't yet exist on
-- lop_patients. These are operational metadata captured by the medical records
-- team and are also useful for any future facility's intake spreadsheet.

ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS last_date_of_contact DATE;
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS point_of_contact TEXT;
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS mr_dept_notes TEXT;

COMMENT ON COLUMN lop_patients.last_date_of_contact IS 'Most recent date staff contacted the law firm or patient about this case.';
COMMENT ON COLUMN lop_patients.point_of_contact IS 'In-house staff member owning follow-up for this patient (e.g. "Cynthia").';
COMMENT ON COLUMN lop_patients.mr_dept_notes IS 'Per-patient medical-records contact list for the law firm — comma-separated emails as captured during intake.';
