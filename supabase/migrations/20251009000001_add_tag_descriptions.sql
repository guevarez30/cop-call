-- Add description column to tags table
ALTER TABLE tags
ADD COLUMN description TEXT;

-- Add comment for the new column
COMMENT ON COLUMN tags.description IS 'Optional description explaining what the tag represents (e.g., "Adult Arrest", "Traffic Stop")';
