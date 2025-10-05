import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Fetch user profile and verify admin role
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invitationId = params.id;

    // Fetch invitation and verify it belongs to admin's organization
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('organization_id', profile.organization_id)
      .eq('status', 'pending')
      .single();

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already accepted' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Cannot resend expired invitation. Please create a new one.' },
        { status: 400 }
      );
    }

    // Resend Supabase invitation email
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      invitation.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite/${invitation.token}`,
      }
    );

    if (inviteError) {
      console.error('Error resending invitation:', inviteError);
      return NextResponse.json({ error: 'Failed to resend invitation email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation email resent successfully',
    });
  } catch (error: any) {
    console.error('Resend invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
