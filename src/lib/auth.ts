import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id: string
  created_at: string
  updated_at: string
}

/**
 * Server-side authentication helper
 * Verifies user is authenticated and fetches their profile from the database
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with role from database
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Failed to fetch user profile:', error)
    // User is authenticated but has no profile - might be a setup issue
    redirect('/login')
  }

  return {
    user,
    profile: profile as UserProfile,
  }
}

/**
 * Server-side admin role verification
 * Verifies user is authenticated AND has admin role
 * Redirects to /app if not admin, or to login if not authenticated
 */
export async function requireAdmin() {
  const { user, profile } = await requireAuth()

  if (profile.role !== 'admin') {
    // User is authenticated but not an admin - redirect to main app
    redirect('/app')
  }

  return {
    user,
    profile,
  }
}

/**
 * Checks if the current user is an admin (without redirecting)
 * Returns null if not authenticated or profile not found
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch {
    return false
  }
}
