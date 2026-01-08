-- Migration: Add password security and MFA fields to users table
-- Run this manually in production database if Prisma migrate is not available

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Add index for performance on locked_until
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);

-- Add index for failed_login_attempts
CREATE INDEX IF NOT EXISTS idx_users_failed_attempts ON users(failed_login_attempts);

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('must_change_password', 'password_changed_at', 'failed_login_attempts', 'locked_until', 'mfa_enabled', 'mfa_secret', 'backup_codes')
ORDER BY column_name;
