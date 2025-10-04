-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  status invitation_status NOT NULL DEFAULT 'pending',
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Create updated_at trigger
CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES FOR INVITATIONS TABLE
-- =====================================================

-- Policy: Admins can view all invitations in their organization
CREATE POLICY "Admins can view invitations in organization"
  ON invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = invitations.organization_id
    )
  );

-- Policy: Admins can create invitations for their organization
CREATE POLICY "Admins can create invitations"
  ON invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = invitations.organization_id
    )
  );

-- Policy: Admins can update invitations in their organization
CREATE POLICY "Admins can update invitations in organization"
  ON invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = invitations.organization_id
    )
  );

-- Policy: Admins can delete invitations in their organization
CREATE POLICY "Admins can delete invitations in organization"
  ON invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = invitations.organization_id
    )
  );

-- Policy: Anyone can view invitation by token (for acceptance)
CREATE POLICY "Anyone can view invitation by token"
  ON invitations
  FOR SELECT
  USING (true);

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Admins can create, view, update, and delete invitations for their org
-- 2. Public can view invitations by token (needed for acceptance flow)
-- 3. Invitations expire after 7 days (enforced at application level)
-- 4. One pending invitation per email per organization (enforced at application level)
