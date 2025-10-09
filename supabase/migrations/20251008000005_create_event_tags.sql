-- Create event_tags junction table to map events to tags
CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (event_id, tag_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_event_tags_event_id ON event_tags(event_id);
CREATE INDEX idx_event_tags_tag_id ON event_tags(tag_id);

-- Enable RLS
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view event-tag mappings for their organization's events
CREATE POLICY "Users can view event-tag mappings for their organization"
  ON event_tags
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Policy: Users can add tags to their own events
CREATE POLICY "Users can add tags to their own events"
  ON event_tags
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE officer_id = auth.uid()
    )
  );

-- Policy: Users can remove tags from their own events, admins can remove all
CREATE POLICY "Users can remove tags from their own events"
  ON event_tags
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      ) AND (
        officer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Add comments
COMMENT ON TABLE event_tags IS 'Junction table mapping events to tags (many-to-many relationship)';
