import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestLogger = logger.child({ requestId, route: '/api/organizations', method: 'PATCH' })

  try {
    requestLogger.debug('Organization update request received')

    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      requestLogger.warn('Missing or invalid authorization header')
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
      requestLogger.error({ err: authError }, 'Invalid authentication token')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userLogger = requestLogger.child({ userId: authUser.id })

    // Get user profile to check role and organization
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, role, organization_id')
      .eq('id', authUser.id)
      .single()

    if (profileError || !userProfile) {
      userLogger.error({ err: profileError }, 'Failed to fetch user profile')
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (userProfile.role !== 'admin') {
      userLogger.warn({ role: userProfile.role }, 'Non-admin user attempted to update organization')
      return NextResponse.json(
        { error: 'Only administrators can update organization details' },
        { status: 403 }
      )
    }

    const orgLogger = userLogger.child({ organizationId: userProfile.organization_id })

    // Parse request body
    const body = await request.json()
    const { name } = body

    orgLogger.debug({ updates: { name } }, 'Processing organization update')

    // Validate inputs
    const updates: { name?: string } = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Organization name must be a non-empty string' },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabaseAdmin
      .from('organizations')
      .update(updates)
      .eq('id', userProfile.organization_id)
      .select('id, name, created_at')
      .single()

    if (updateError) {
      orgLogger.error({ err: updateError, updates }, 'Failed to update organization')
      return NextResponse.json(
        {
          error: 'Failed to update organization',
          details: updateError.message,
          hint: updateError.hint,
          code: updateError.code
        },
        { status: 500 }
      )
    }

    if (!updatedOrg) {
      orgLogger.error('Organization not found after update')
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    orgLogger.info({
      updates
    }, 'Organization updated successfully')

    return NextResponse.json({
      success: true,
      organization: updatedOrg
    })
  } catch (error: any) {
    requestLogger.error({ err: error }, 'Unexpected error updating organization')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
