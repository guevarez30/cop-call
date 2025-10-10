import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Bulk delete events
export async function POST(request: NextRequest) {
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
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Only admins can bulk delete
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { event_ids } = body;

    if (!event_ids || !Array.isArray(event_ids) || event_ids.length === 0) {
      return NextResponse.json({ error: 'event_ids array is required' }, { status: 400 });
    }

    // Validate all events belong to user's organization
    const { data: eventsToDelete, error: fetchError } = await supabase
      .from('events')
      .select('id, organization_id')
      .in('id', event_ids);

    if (fetchError) {
      console.error('Error fetching events for validation:', fetchError);
      return NextResponse.json({ error: 'Failed to validate events' }, { status: 500 });
    }

    // Check if all events belong to user's organization
    const invalidEvents = eventsToDelete?.filter(
      (event: any) => event.organization_id !== profile.organization_id
    ) || [];

    if (invalidEvents.length > 0) {
      return NextResponse.json({
        error: 'Some events do not belong to your organization',
        invalid_event_ids: invalidEvents.map((e: any) => e.id),
      }, { status: 403 });
    }

    // Delete events
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .in('id', event_ids);

    if (deleteError) {
      console.error('Error deleting events:', deleteError);
      return NextResponse.json({ error: 'Failed to delete events' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deleted_count: event_ids.length,
      message: `Successfully deleted ${event_ids.length} event${event_ids.length !== 1 ? 's' : ''}`,
    });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
