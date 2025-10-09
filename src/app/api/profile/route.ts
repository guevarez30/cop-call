import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId, route: '/api/profile', method: 'GET' });

  try {
    requestLogger.debug('Profile fetch request received');

    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      requestLogger.warn('Missing or invalid authorization header');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Use service role to bypass RLS for verification and fetching
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT token and get the authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      requestLogger.error({ err: authError }, 'Invalid authentication token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userLogger = requestLogger.child({ userId: authUser.id });
    userLogger.debug('Fetching user profile');

    // Fetch user profile from database using service role (bypasses RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        badge_no,
        role,
        theme,
        created_at,
        organization_id,
        organizations (
          id,
          name
        )
      `
      )
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      userLogger.error({ err: profileError }, 'Failed to fetch profile');
      return NextResponse.json(
        {
          error: 'Failed to fetch profile',
          details: profileError.message,
          hint: profileError.hint,
          code: profileError.code,
        },
        { status: 500 }
      );
    }

    if (!userProfile) {
      userLogger.error('Profile not found');
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    userLogger.info(
      {
        organizationId: userProfile.organization_id,
        role: userProfile.role,
      },
      'Profile fetched successfully'
    );

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error: any) {
    requestLogger.error({ err: error }, 'Unexpected error fetching profile');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId, route: '/api/profile', method: 'PATCH' });

  try {
    requestLogger.debug('Profile update request received');

    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      requestLogger.warn('Missing or invalid authorization header');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Use service role to bypass RLS for verification and updating
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT token and get the authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      requestLogger.error({ err: authError }, 'Invalid authentication token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userLogger = requestLogger.child({ userId: authUser.id });

    // Parse request body
    const body = await request.json();
    const { full_name, badge_no, theme } = body;

    userLogger.debug({ updates: { full_name, badge_no, theme } }, 'Processing profile update');

    // Validate inputs
    const updates: { full_name?: string; badge_no?: string | null; theme?: string } = {};

    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Full name must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.full_name = full_name.trim();
    }

    if (badge_no !== undefined) {
      if (badge_no === null || badge_no === '') {
        updates.badge_no = null;
      } else if (typeof badge_no !== 'string') {
        return NextResponse.json({ error: 'Badge number must be a string' }, { status: 400 });
      } else {
        updates.badge_no = badge_no.trim();
      }
    }

    if (theme !== undefined) {
      if (theme !== 'light' && theme !== 'dark') {
        return NextResponse.json(
          { error: 'Theme must be either "light" or "dark"' },
          { status: 400 }
        );
      }
      updates.theme = theme;
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', authUser.id)
      .select(
        `
        id,
        email,
        full_name,
        badge_no,
        role,
        theme,
        created_at,
        organization_id,
        organizations (
          id,
          name
        )
      `
      )
      .single();

    if (updateError) {
      userLogger.error({ err: updateError, updates }, 'Failed to update profile');
      return NextResponse.json(
        {
          error: 'Failed to update profile',
          details: updateError.message,
          hint: updateError.hint,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      userLogger.error('Profile not found after update');
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    userLogger.info(
      {
        organizationId: updatedProfile.organization_id,
        role: updatedProfile.role,
        updates,
      },
      'Profile updated successfully'
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    requestLogger.error({ err: error }, 'Unexpected error updating profile');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
