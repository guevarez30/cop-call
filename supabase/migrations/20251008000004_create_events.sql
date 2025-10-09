-- Create event_status enum
CREATE TYPE event_status AS ENUM ('draft', 'submitted');

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  officer_name TEXT NOT NULL, -- Denormalized for performance
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  involved_parties TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_events_officer_id ON events(officer_id);
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view events from their own organization
CREATE POLICY "Users can view their organization's events"
  ON events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert their own events
CREATE POLICY "Users can create their own events"
  ON events
  FOR INSERT
  WITH CHECK (
    officer_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their own events, admins can update all
CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND (
      officer_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND (
      officer_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Policy: Users can delete their own events, admins can delete all
CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND (
      officer_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE events IS 'Events/calls logged by officers';
COMMENT ON COLUMN events.officer_name IS 'Denormalized officer name for performance';
COMMENT ON COLUMN events.status IS 'Event status: draft (being edited) or submitted (finalized)';
