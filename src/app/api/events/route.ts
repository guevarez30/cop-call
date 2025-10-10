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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100
    const officerIdsParam = searchParams.get('officer_ids'); // Comma-separated officer IDs (admin-only filter)
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const tagIdsParam = searchParams.get('tag_ids'); // Comma-separated tag IDs

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Parse officer IDs and tag IDs
    const officerIds = officerIdsParam ? officerIdsParam.split(',').filter(Boolean) : [];
    const tagIds = tagIdsParam ? tagIdsParam.split(',').filter(Boolean) : [];

    // Build base query
    let query = supabase
      .from('events')
      .select(`
        *,
        event_tags (
          tag_id,
          tags (
            id,
            name,
            color,
            description
          )
        )
      `, { count: 'exact' }) // Get total count for pagination
      .eq('organization_id', profile.organization_id);

    // Filter based on role:
    // - Regular users: only their own events
    // - Admins: if officer filter applied, filter by those officers; otherwise show own drafts + all submitted events
    if (profile.role !== 'admin') {
      query = query.eq('officer_id', user.id);
    } else {
      // Admin with officer filter: show all events for the specified officers
      if (officerIds.length > 0) {
        query = query.in('officer_id', officerIds);
      } else {
        // Admin without officer filter: show own drafts OR all submitted events (not other officers' drafts)
        query = query.or(`and(officer_id.eq.${user.id},status.eq.draft),status.eq.submitted`);
      }
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by date range
    if (startDate) {
      query = query.gte('start_time', new Date(startDate).toISOString());
    }
    if (endDate) {
      // Add 1 day and use less than to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      query = query.lt('start_time', endDateTime.toISOString());
    }

    // Apply ordering and pagination
    const offset = (page - 1) * limit;
    query = query
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Transform events to include tags as flat array
    let transformedEvents = events?.map((event: any) => ({
      ...event,
      tags: event.event_tags?.map((et: any) => et.tags).filter(Boolean) || [],
      event_tags: undefined, // Remove junction data
    })) || [];

    // Filter by tags if provided (post-query filter for many-to-many)
    if (tagIds.length > 0) {
      transformedEvents = transformedEvents.filter((event: any) => {
        const eventTagIds = event.tags.map((tag: any) => tag.id);
        // Event must have at least one of the specified tags
        return tagIds.some(tagId => eventTagIds.includes(tagId));
      });
    }

    // Calculate pagination metadata
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
