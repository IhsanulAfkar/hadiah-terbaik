-- Add new Role enum values
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OPERATOR_DUKCAPIL';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VERIFIKATOR_DUKCAPIL';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'KEMENAG';

-- Add new Status enum values  
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'NEEDS_REVISION';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';

-- Migrate existing DUKCAPIL user to OPERATOR_DUKCAPIL
UPDATE users SET role = 'OPERATOR_DUKCAPIL' WHERE role = 'DUKCAPIL';

-- Display result
SELECT 'Migration complete' as message;
SELECT username, role FROM users WHERE username = 'dukcapil_op';
