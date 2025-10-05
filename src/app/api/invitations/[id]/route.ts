import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

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

    // Verify invitation belongs to admin's organization
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Delete the invitation (or update status to 'expired')
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);

    if (deleteError) {
      console.error('Error deleting invitation:', deleteError);
      return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
    });
  } catch (error: any) {
    console.error('Delete invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
