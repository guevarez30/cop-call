import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Check Profile API Endpoint
 * Securely checks if an authenticated user has a profile in the database
 * Used during login flow to determine if user needs onboarding
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Use service role to bypass RLS for this check
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    )

    // Verify the JWT token and get authenticated user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log('Checking profile for user ID:', user.id)

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    console.log('Profile query result:', { profile, error: profileError })

    // maybeSingle() returns null if not found (no error thrown)
    // Only throw if there's an actual database error
    if (profileError) {
      console.error('Database error checking profile:', profileError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    console.log('Returning hasProfile:', !!profile, 'hasOrganization:', !!profile?.organization_id)

    return NextResponse.json({
      hasProfile: !!profile,
      hasOrganization: !!profile?.organization_id,
      userId: user.id
    })
  } catch (error: any) {
    console.error('Check profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
