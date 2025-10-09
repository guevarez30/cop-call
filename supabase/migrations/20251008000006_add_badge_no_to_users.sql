-- Add badge_no column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_no TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_badge_no ON users(badge_no);

-- Add comment for documentation
COMMENT ON COLUMN users.badge_no IS 'Officer badge number for identification';
