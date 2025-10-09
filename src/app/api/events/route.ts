import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Create new event
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

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { start_time, end_time, tag_ids = [], notes = '', involved_parties, status = 'draft' } = body;

    // Validate required fields
    if (!start_time) {
      return NextResponse.json({ error: 'Start time is required' }, { status: 400 });
    }

    if (status !== 'draft' && status !== 'submitted') {
      return NextResponse.json({ error: 'Invalid status. Must be "draft" or "submitted"' }, { status: 400 });
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        officer_id: user.id,
        officer_name: profile.full_name || profile.email,
        start_time,
        end_time: end_time || null,
        notes: notes || '',
        involved_parties: involved_parties || null,
        status,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    // Create event-tag relationships
    if (tag_ids && tag_ids.length > 0) {
      const eventTags = tag_ids.map((tag_id: string) => ({
        event_id: event.id,
        tag_id,
      }));

      const { error: tagError } = await supabase
        .from('event_tags')
        .insert(eventTags);

      if (tagError) {
        console.error('Error creating event tags:', tagError);
        // Event created but tags failed - could rollback or just log
      }
    }

    // Fetch event with tags
    const { data: eventWithTags } = await supabase
      .from('events')
      .select(`
        *,
        event_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('id', event.id)
      .single();

    // Transform tags to flat array
    const tags = eventWithTags?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
    const result = {
      ...eventWithTags,
      tags,
      event_tags: undefined, // Remove junction data from response
    };

    return NextResponse.json({
      success: true,
      event: result,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List events
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

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'draft' or 'submitted'

    // Build query based on role
    let query = supabase
      .from('events')
      .select(`
        *,
        event_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('organization_id', profile.organization_id)
      .order('start_time', { ascending: false });

    // If user is not admin, filter to only their events
    if (profile.role !== 'admin') {
      query = query.eq('officer_id', user.id);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Transform events to include tags as flat array
    const transformedEvents = events?.map((event: any) => ({
      ...event,
      tags: event.event_tags?.map((et: any) => et.tags).filter(Boolean) || [],
      event_tags: undefined, // Remove junction data
    })) || [];

    return NextResponse.json({
      success: true,
      events: transformedEvents,
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
