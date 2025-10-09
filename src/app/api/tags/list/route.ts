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

    // Fetch user profile to get organization_id
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all tags for the organization
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, color, created_at, updated_at')
      .eq('organization_id', profile.organization_id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tags: tags || [],
    });
  } catch (error: any) {
    console.error('List tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
