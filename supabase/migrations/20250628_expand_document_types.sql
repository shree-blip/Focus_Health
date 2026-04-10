-- Expand lop_document_type enum with new values
-- The old 'bill' and 'reduction_letter' values remain for backward compatibility.
-- New types split bills into LLC/PLLC, reduction letters into unsigned/signed, and add check_image.

ALTER TYPE lop_document_type ADD VALUE IF NOT EXISTS 'bill_llc';
ALTER TYPE lop_document_type ADD VALUE IF NOT EXISTS 'bill_pllc';
ALTER TYPE lop_document_type ADD VALUE IF NOT EXISTS 'reduction_letter_unsigned';
ALTER TYPE lop_document_type ADD VALUE IF NOT EXISTS 'reduction_letter_signed';
ALTER TYPE lop_document_type ADD VALUE IF NOT EXISTS 'check_image';

-- NOTE: Run this migration in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Each ALTER TYPE ... ADD VALUE must be run in its own transaction in PostgreSQL,
-- but Supabase SQL editor handles this automatically.
