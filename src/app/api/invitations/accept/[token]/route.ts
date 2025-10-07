import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const supabaseAdmin = createAdminClient();
    const { token } = await params;

    // Fetch invitation by token using admin client (bypasses RLS)
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select(
        `
        *,
        organization:organizations(
          id,
          name
        )
      `
      )
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      // Update invitation status to expired
      await supabaseAdmin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);

      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error: any) {
    console.error('Get invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    // Fetch invitation by token using admin client (bypasses RLS)
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      // Update invitation status to expired
      await supabaseAdmin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);

      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    // Check if user email matches invitation email
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email mismatch. Please log in with the invited email address.' },
        { status: 400 }
      );
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      );
    }

    const { fullName } = await request.json();

    // Validate full name
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Create user profile using admin client
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: user.id,
        organization_id: invitation.organization_id,
        email: invitation.email,
        full_name: fullName.trim(),
        role: invitation.role,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      // Don't fail the request if this fails - user profile is already created
    }

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
