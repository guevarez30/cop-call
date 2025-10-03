-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================
-- Problem: Policies that query 'users' table within 'users' policies
-- Solution: Use security definer functions to bypass RLS

-- Step 1: Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users in organization" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update users in organization" ON users;

-- Step 2: Create security definer function to get current user info
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE (
  user_id uuid,
  user_role user_role,
  user_org_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, role, organization_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Step 3: Recreate policies using the security definer function

-- Policy: Admins can view all users in their organization
CREATE POLICY "Admins can view all users in organization"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.get_current_user_info() AS curr_user
      WHERE curr_user.user_role = 'admin'
        AND curr_user.user_org_id = users.organization_id
    )
  );

-- Policy: Users can update their own profile (except role and organization_id)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT user_role FROM public.get_current_user_info())
    AND organization_id = (SELECT user_org_id FROM public.get_current_user_info())
  );

-- Policy: Admins can update any user in their organization
CREATE POLICY "Admins can update users in organization"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.get_current_user_info() AS curr_user
      WHERE curr_user.user_role = 'admin'
        AND curr_user.user_org_id = users.organization_id
    )
  );

-- =====================================================
-- EXPLANATION:
-- =====================================================
-- The security definer function runs with elevated privileges
-- and bypasses RLS, preventing infinite recursion.
-- It's safe because it only returns data for auth.uid(),
-- which is guaranteed to be the current authenticated user.
