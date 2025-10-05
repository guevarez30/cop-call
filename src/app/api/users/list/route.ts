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

    // Fetch all users in the organization
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at, updated_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
