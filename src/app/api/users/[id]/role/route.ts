import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/users/[id]/role
 * Update a user's role (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "admin" or "user"' }, { status: 400 });
    }

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get requester's profile to verify admin status and organization
    const { data: requesterProfile, error: requesterError } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', authUser.id)
      .single();

    if (requesterError || !requesterProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Verify requester is an admin
    if (requesterProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get target user to verify they exist and are in same organization
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('role, organization_id, full_name')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Verify same organization
    if (targetUser.organization_id !== requesterProfile.organization_id) {
      return NextResponse.json({ error: 'Cannot modify users from other organizations' }, { status: 403 });
    }

    // Prevent users from changing their own role
    if (targetUserId === authUser.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 403 });
    }

    // If demoting from admin to user, verify there will be at least one admin left
    if (targetUser.role === 'admin' && role === 'user') {
      const { count: adminCount, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', requesterProfile.organization_id)
        .eq('role', 'admin');

      if (countError) {
        return NextResponse.json({ error: 'Failed to verify admin count' }, { status: 500 });
      }

      // Prevent demoting the last admin
      if (adminCount && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin. Promote another user to admin first.' },
          { status: 400 }
        );
      }
    }

    // Use admin client to update the user's role (bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: updatedUser, error: updateError } = await adminSupabase
      .from('users')
      .update({ role })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]/role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
