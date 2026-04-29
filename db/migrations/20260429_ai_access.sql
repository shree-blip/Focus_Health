-- Add ai_access flag to lop_users
-- Allows admins to grant chatbot access to non-admin users on a per-user basis.
ALTER TABLE lop_users ADD COLUMN IF NOT EXISTS ai_access BOOLEAN NOT NULL DEFAULT FALSE;

-- Admins always have AI access — keep their flag in sync
UPDATE lop_users SET ai_access = TRUE WHERE role = 'admin';
