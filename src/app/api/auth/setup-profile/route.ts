import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  try {
    console.log('=== Setup Profile API Called ===')
    console.log('ENV Check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    const { userId, email, fullName, organizationName } = await request.json()
    console.log('Request data:', { userId, email, fullName, organizationName })

    // Validate required fields
    if (!userId || !email || !fullName || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      )
    }

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
      console.error('User creation error:', userError)

      // Cleanup: delete the organization if user creation fails
      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', org.id)

      return NextResponse.json(
        { error: 'Failed to create user profile', details: userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
      organization: org
    })
  } catch (error: any) {
    console.error('Setup profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
