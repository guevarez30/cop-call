-- Create template_fields table
-- This stores individual fields within each template

CREATE TABLE IF NOT EXISTS template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_config JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT template_fields_name_check CHECK (char_length(field_name) > 0 AND char_length(field_name) <= 100),
  CONSTRAINT template_fields_type_check CHECK (field_type IN (
    'short_text',
    'long_text',
    'number',
    'dropdown',
    'radio',
    'checkbox',
    'date',
    'time',
    'image_upload'
  )),
  CONSTRAINT template_fields_display_order_check CHECK (display_order >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_template_fields_template_id ON template_fields(template_id);
CREATE INDEX idx_template_fields_display_order ON template_fields(template_id, display_order);
CREATE INDEX idx_template_fields_type ON template_fields USING GIN ((field_config));

-- Enable Row Level Security
ALTER TABLE template_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- All authenticated users can read template fields
-- All authenticated users can create/update/delete template fields (admin check enforced in app)
-- This allows any admin to manage all template fields in the organization

CREATE POLICY "Allow authenticated users to read template fields"
  ON template_fields
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create template fields"
  ON template_fields
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update template fields"
  ON template_fields
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete template fields"
  ON template_fields
  FOR DELETE
  TO authenticated
  USING (true);

-- Add helpful comment
COMMENT ON TABLE template_fields IS 'Fields that make up a template. Each field has a type and configuration stored as JSONB for flexibility.';
