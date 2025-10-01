-- Add Row Level Security (RLS) Policies
-- This migration adds comprehensive RLS policies for organizations and users tables
-- to ensure proper data isolation and access control
-- This migration is idempotent - safe to run multiple times

-- =============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist (to allow re-running migration)
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read_own_organization" ON organizations;
  DROP POLICY IF EXISTS "service_role_insert_organizations" ON organizations;
  DROP POLICY IF EXISTS "admins_update_own_organization" ON organizations;
  DROP POLICY IF EXISTS "admins_delete_own_organization" ON organizations;
END $$;

-- Policy: Users can read their own organization
-- Allows users to view organization details for the org they belong to
CREATE POLICY "users_read_own_organization"
ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Policy: Service role can insert organizations
-- Only server-side code with service role can create new organizations
-- This prevents clients from creating arbitrary organizations
CREATE POLICY "service_role_insert_organizations"
ON organizations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Admins can update their own organization
-- Only admin users can modify their organization's details
CREATE POLICY "admins_update_own_organization"
ON organizations
FOR UPDATE
USING (
  id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can delete their own organization
-- Only admin users can delete their organization (use with caution)
CREATE POLICY "admins_delete_own_organization"
ON organizations
FOR DELETE
USING (
  id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist (to allow re-running migration)
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read_own_profile" ON users;
  DROP POLICY IF EXISTS "users_read_same_organization" ON users;
  DROP POLICY IF EXISTS "service_role_insert_users" ON users;
  DROP POLICY IF EXISTS "users_update_own_profile" ON users;
  DROP POLICY IF EXISTS "admins_update_organization_users" ON users;
  DROP POLICY IF EXISTS "admins_delete_organization_users" ON users;
END $$;

-- Policy: Users can read their own profile
-- Allows users to view their own user record
CREATE POLICY "users_read_own_profile"
ON users
FOR SELECT
USING (id = auth.uid());

-- Policy: Users can read other users in their organization
-- Allows users to see other members of their organization
CREATE POLICY "users_read_same_organization"
ON users
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Policy: Service role can insert users
-- Only server-side code with service role can create new users
-- This ensures proper user creation flow through the API
CREATE POLICY "service_role_insert_users"
ON users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Users can update their own profile
-- Allows users to modify their own user details (name, etc.)
-- Note: Role changes should be restricted separately if needed
CREATE POLICY "users_update_own_profile"
ON users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy: Admins can update users in their organization
-- Allows admin users to modify other users in their org (role changes, etc.)
CREATE POLICY "admins_update_organization_users"
ON users
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can delete users in their organization
-- Allows admin users to remove users from their organization
CREATE POLICY "admins_delete_organization_users"
ON users
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
  -- Prevent admins from deleting themselves (optional safety check)
  AND id != auth.uid()
);

-- =============================================================================
-- POLICY NOTES
-- =============================================================================
--
-- Security Considerations:
-- 1. Service role policies ensure only server-side API routes can create orgs/users
-- 2. Users are isolated to their organization's data only
-- 3. Admins have elevated permissions but only within their organization
-- 4. Auth.uid() ensures policies are tied to authenticated Supabase users
--
-- Testing:
-- After applying this migration, test the following scenarios:
-- 1. User can view their own profile
-- 2. User can view other users in their org
-- 3. User cannot view users in other orgs
-- 4. Admin can update org details
-- 5. Regular user cannot update org details
-- 6. Admin can manage users in their org
-- 7. Regular user cannot manage other users
--
