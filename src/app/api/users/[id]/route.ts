import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/users/[id]
 * Remove a user from the organization (admin only)
 *
 * Security:
 * - Only admins can remove users
 * - Cannot remove yourself
 * - Cannot remove users with admin role (must demote first)
 * - Can only remove users from your own organization
 * - Deletes from auth.users which cascades to users table
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

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
      .select('role, organization_id, full_name, email')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Verify same organization
    if (targetUser.organization_id !== requesterProfile.organization_id) {
      return NextResponse.json({ error: 'Cannot remove users from other organizations' }, { status: 403 });
    }

    // Prevent users from removing themselves
    if (targetUserId === authUser.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 403 });
    }

    // Prevent removing users with admin role (must demote first)
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove an admin. Please demote them to user first.' },
        { status: 400 }
      );
    }

    // Use admin client to delete the user from Supabase Auth
    // This will cascade delete to the users table due to ON DELETE CASCADE
    const adminSupabase = createAdminClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User removed successfully',
      user: {
        id: targetUserId,
        full_name: targetUser.full_name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
