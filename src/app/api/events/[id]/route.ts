import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
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

    // Fetch existing event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions: users can only update their own events, admins can update any
    if (profile.role !== 'admin' && existingEvent.officer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Cannot update this event' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { start_time, end_time, tag_ids, notes, involved_parties, status } = body;

    // Build update object with only provided fields
    const updates: any = {};
    if (start_time !== undefined) updates.start_time = start_time;
    if (end_time !== undefined) updates.end_time = end_time;
    if (notes !== undefined) updates.notes = notes;
    if (involved_parties !== undefined) updates.involved_parties = involved_parties;
    if (status !== undefined) {
      if (status !== 'draft' && status !== 'submitted') {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
    }

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    // Update tags if provided
    if (tag_ids !== undefined) {
      // Delete existing tag relationships
      await supabase.from('event_tags').delete().eq('event_id', eventId);

      // Create new tag relationships
      if (tag_ids.length > 0) {
        const eventTags = tag_ids.map((tag_id: string) => ({
          event_id: eventId,
          tag_id,
        }));

        const { error: tagError } = await supabase
          .from('event_tags')
          .insert(eventTags);

        if (tagError) {
          console.error('Error updating event tags:', tagError);
        }
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
      .eq('id', eventId)
      .single();

    // Transform tags to flat array
    const tags = eventWithTags?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
    const result = {
      ...eventWithTags,
      tags,
      event_tags: undefined,
    };

    return NextResponse.json({
      success: true,
      event: result,
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
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

    // Fetch existing event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = existingEvent.officer_id === user.id;
    const isAdmin = profile.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Cannot delete this event' }, { status: 403 });
    }

    // Users can only delete their own drafts
    if (isOwner && !isAdmin && existingEvent.status !== 'draft') {
      return NextResponse.json({
        error: 'Forbidden: Users can only delete draft events'
      }, { status: 403 });
    }

    // Admins can delete any event (draft or submitted)
    // Delete event (cascade will handle event_tags)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('Error deleting event:', deleteError);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
