-- Allow admin-created LOP users to exist before they log in.
-- When the user first signs in, /api/lop/provision links their auth_user_id.
ALTER TABLE lop_users ALTER COLUMN auth_user_id DROP NOT NULL;
