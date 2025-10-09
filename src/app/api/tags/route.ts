import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, color, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // Validate color (hex format)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (color && !hexColorRegex.test(color)) {
      return NextResponse.json({ error: 'Invalid color format. Use hex format (e.g., #FF0000)' }, { status: 400 });
    }

    // Validate description (optional string)
    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
    }

    // Check if tag already exists for this organization
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .eq('name', name.trim())
      .maybeSingle();

    if (existingTag) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 });
    }

    // Create new tag
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        name: name.trim(),
        color: color || '#3B82F6', // Default to blue if not provided
        description: description?.trim() || null,
        organization_id: profile.organization_id,
      })
      .select('id, name, color, description, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tag: newTag,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
