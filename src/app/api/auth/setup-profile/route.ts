import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Server-side client with service role for bypassing RLS
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

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestLogger = logger.child({ requestId, route: '/api/auth/setup-profile' })

  try {
    requestLogger.info('Setup profile request received')
    requestLogger.debug({
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }, 'Environment check')

    // CRITICAL SECURITY: Verify the request is authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      requestLogger.warn('Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the JWT token and get the authenticated user
    const token = authHeader.substring(7)
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      requestLogger.error({ err: authError }, 'Invalid authentication token')
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const { userId, email, fullName, organizationName } = await request.json()
    requestLogger.debug({ userId, fullName, organizationName }, 'Processing setup profile request')

    // Validate required fields
    if (!userId || !email || !fullName || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // CRITICAL SECURITY: Verify userId matches authenticated user
    if (userId !== authUser.id) {
      requestLogger.error({
        provided: userId,
        authenticated: authUser.id
      }, 'User ID mismatch - potential security issue')
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Step 1: Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizationName
      })
      .select()
      .single()

    if (orgError) {
      requestLogger.error({ err: orgError, organizationName }, 'Failed to create organization')
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    requestLogger.info({
      organizationId: org.id,
      organizationName: org.name
    }, 'Organization created successfully')

    // Step 2: Create user profile linked to organization
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        organization_id: org.id,
        email: email,
        full_name: fullName,
        role: 'admin' // First user is always admin
      })
      .select()
      .single()

    if (userError) {
      requestLogger.error({
        err: userError,
        userId,
        organizationId: org.id
      }, 'Failed to create user profile')

      // Cleanup: delete the organization if user creation fails
      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', org.id)

      requestLogger.info({ organizationId: org.id }, 'Organization cleaned up after user creation failure')

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    requestLogger.info({
      userId: user.id,
      organizationId: user.organization_id,
      role: user.role,
      action: 'onboarding_complete'
    }, 'User profile created successfully - onboarding complete')

    return NextResponse.json({
      success: true,
      user,
      organization: org
    })
  } catch (error: any) {
    requestLogger.error({ err: error }, 'Unexpected error in setup profile')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
