import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Parse request body
    const body = await request.json();
    const { name, color } = body;

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // Validate color (hex format)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (color && !hexColorRegex.test(color)) {
      return NextResponse.json({ error: 'Invalid color format. Use hex format (e.g., #FF0000)' }, { status: 400 });
    }

    // Check if tag exists and belongs to user's organization
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .maybeSingle();

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if new name conflicts with another tag
    const { data: conflictingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .eq('name', name.trim())
      .neq('id', id)
      .maybeSingle();

    if (conflictingTag) {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 });
    }

    // Update tag
    const updateData: { name: string; color?: string } = { name: name.trim() };
    if (color) {
      updateData.color = color;
    }

    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select('id, name, color, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tag: updatedTag,
    });
  } catch (error: any) {
    console.error('Update tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Check if tag exists and belongs to user's organization
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .maybeSingle();

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Delete tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('organization_id', profile.organization_id);

    if (error) {
      console.error('Error deleting tag:', error);
      return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
