import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Extract the token
    const token = authHeader.substring(7)

    // Use service role to bypass RLS for verification and fetching
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the JWT token and get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      console.error('Invalid authentication token:', authError?.message)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user profile from database using service role (bypasses RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        theme,
        created_at,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        {
          error: 'Failed to fetch profile',
          details: profileError.message,
          hint: profileError.hint,
          code: profileError.code
        },
        { status: 500 }
      )
    }

    if (!userProfile) {
      console.error('Profile not found for user:', authUser.id)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('Profile fetched successfully for:', userProfile.email)

    return NextResponse.json({
      success: true,
      profile: userProfile
    })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Extract the token
    const token = authHeader.substring(7)

    // Use service role to bypass RLS for verification and updating
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the JWT token and get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      console.error('Invalid authentication token:', authError?.message)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { full_name, theme } = body

    // Validate inputs
    const updates: { full_name?: string; theme?: string } = {}

    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Full name must be a non-empty string' },
          { status: 400 }
        )
      }
      updates.full_name = full_name.trim()
    }

    if (theme !== undefined) {
      if (theme !== 'light' && theme !== 'dark') {
        return NextResponse.json(
          { error: 'Theme must be either "light" or "dark"' },
          { status: 400 }
        )
      }
      updates.theme = theme
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', authUser.id)
      .select(`
        id,
        email,
        full_name,
        role,
        theme,
        created_at,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to update profile',
          details: updateError.message,
          hint: updateError.hint,
          code: updateError.code
        },
        { status: 500 }
      )
    }

    if (!updatedProfile) {
      console.error('Profile not found for user:', authUser.id)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('Profile updated successfully for:', updatedProfile.email)

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error: any) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
