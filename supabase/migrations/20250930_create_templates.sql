-- Create templates table
-- This stores template definitions created by admins

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,

  -- Add constraints
  CONSTRAINT templates_name_check CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  CONSTRAINT templates_description_check CHECK (description IS NULL OR char_length(description) <= 500)
);

-- Create index on created_by for faster queries
CREATE INDEX idx_templates_created_by ON templates(created_by);

-- Create index on is_active for filtering
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- All authenticated users can read templates
-- All authenticated users can create templates (admin check enforced in app)
-- All authenticated users can update any template (admin check enforced in app)
-- All authenticated users can delete any template (admin check enforced in app)
--
-- Note: We're being permissive at the DB level and enforcing admin-only
-- access in the application layer. This allows any admin to manage all templates
-- in the organization, not just their own.

CREATE POLICY "Allow authenticated users to read templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create templates"
  ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update templates"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete templates"
  ON templates
  FOR DELETE
  TO authenticated
  USING (true);

-- Add helpful comment
COMMENT ON TABLE templates IS 'Template definitions for service call checklists. Admins can create and all admins can edit any template in the organization.';
