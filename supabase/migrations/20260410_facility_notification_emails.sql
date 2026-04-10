-- Add notification email columns to lop_facilities
-- These support scheduling email notifications per PRD FR-02 / Section 8.1
-- Already applied to remote DB via Management API on 2026-04-10

ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS director_email TEXT;
ALTER TABLE lop_facilities ADD COLUMN IF NOT EXISTS front_desk_email TEXT;
