-- Add 'no_show' value to the lop_case_status enum
-- This status is used when a scheduled patient does not arrive on their expected day.

ALTER TYPE lop_case_status ADD VALUE IF NOT EXISTS 'no_show' AFTER 'scheduled';

-- Add billing fields for aging, collection reporting, and reduction tracking
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS billing_date DATE;
ALTER TABLE lop_patients ADD COLUMN IF NOT EXISTS reduction_amount NUMERIC(12,2);

COMMENT ON COLUMN lop_patients.billing_date IS 'Date the bill was sent/created — used to compute outstanding days and aging category';
COMMENT ON COLUMN lop_patients.reduction_amount IS 'Total reduction amount — must match the amount in the signed reduction letter';
