import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch all pending invitations for the organization
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(
        `
        *,
        invited_by:users!invitations_invited_by_user_id_fkey(
          id,
          full_name,
          email
        )
      `
      )
      .eq('organization_id', profile.organization_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      invitations,
    });
  } catch (error: any) {
    console.error('List invitations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
