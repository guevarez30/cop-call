-- Create tags table for organization-scoped tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure tag names are unique within an organization
  UNIQUE(organization_id, name)
);

-- Add check constraint to ensure color is a valid hex color
ALTER TABLE tags
ADD CONSTRAINT tags_color_check
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Create index for faster lookups by organization
CREATE INDEX idx_tags_organization_id ON tags(organization_id);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tags from their own organization
CREATE POLICY "Users can view their organization's tags"
  ON tags
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Only admins can insert tags for their organization
CREATE POLICY "Admins can create tags for their organization"
  ON tags
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update tags from their organization
CREATE POLICY "Admins can update their organization's tags"
  ON tags
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete tags from their organization
CREATE POLICY "Admins can delete their organization's tags"
  ON tags
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at();

-- Add comments
COMMENT ON TABLE tags IS 'Organization-scoped tags for categorizing events';
COMMENT ON COLUMN tags.name IS 'Tag name. Supports grouping format: group::label (e.g., priority::high, status::active)';
COMMENT ON COLUMN tags.color IS 'Hex color code for tag display (e.g., #FF0000)';
