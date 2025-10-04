import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile and verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { email, role = 'user' } = await request.json()

    // Validate input
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists in the application
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, organization_id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation for this email in this organization
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('organization_id', profile.organization_id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      )
    }

    const invitationExpiresAt = new Date()
    invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7) // 7 days from now

    // First, create the invitation record to get the token
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: profile.organization_id,
        email: normalizedEmail,
        invited_by_user_id: user.id,
        role: role,
        status: 'pending',
        expires_at: invitationExpiresAt.toISOString(),
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Use Supabase's inviteUserByEmail to create new auth user and send invitation email
    // Include the invitation token in the redirect URL
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite/${invitation.token}`,
      })

    if (inviteError) {
      console.error('Error inviting user:', inviteError)

      // Cleanup: delete the invitation record if auth invite fails
      await supabaseAdmin
        .from('invitations')
        .delete()
        .eq('id', invitation.id)

      // If user already has an auth account, reject the invitation
      if (inviteError.message?.includes('already registered') ||
          inviteError.message?.includes('already exists') ||
          inviteError.status === 422) {
        return NextResponse.json(
          { error: 'This user already has an account in the system' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to send invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invitation,
    })
  } catch (error: any) {
    console.error('Send invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
