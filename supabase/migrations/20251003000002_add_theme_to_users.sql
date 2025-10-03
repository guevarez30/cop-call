-- Add theme preference column to users table
ALTER TABLE users
ADD COLUMN theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));

-- Add comment
COMMENT ON COLUMN users.theme IS 'User theme preference: light or dark';
