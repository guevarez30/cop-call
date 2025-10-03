-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view all users in their organization
CREATE POLICY "Admins can view all users in organization"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  );

-- Policy: Users can update their own profile (except role and organization_id)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Policy: Admins can update any user in their organization
CREATE POLICY "Admins can update users in organization"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  );

-- =====================================================
-- RLS POLICIES FOR ORGANIZATIONS TABLE
-- =====================================================

-- Policy: Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can update their organization
CREATE POLICY "Admins can update own organization"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. NO INSERT policies - all user/org creation goes through /api/auth/setup-profile
--    which uses the service role to bypass RLS
-- 2. NO DELETE policies - deletions should be handled by admin API endpoints if needed
-- 3. Users can view and update their own profile (but cannot change role or org)
-- 4. Admins have full view/update access to all users in their organization
-- 5. All users can view their organization details
-- 6. Only admins can update organization details
