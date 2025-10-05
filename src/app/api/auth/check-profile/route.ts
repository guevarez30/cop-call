import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Check Profile API Endpoint
 * Securely checks if an authenticated user has a profile in the database
 * Used during login flow to determine if user needs onboarding
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId, route: '/api/auth/check-profile' });

  try {
    requestLogger.debug('Check profile request received');
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Use service role to bypass RLS for this check
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public',
        },
      }
    );

    // Verify the JWT token and get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      requestLogger.error({ err: authError }, 'Authentication failed');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    requestLogger.debug({ userId: user.id }, 'Checking profile for user');

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id')
      .eq('id', user.id)
      .maybeSingle();

    requestLogger.debug(
      {
        userId: user.id,
        hasProfile: !!profile,
        hasOrganization: !!profile?.organization_id,
      },
      'Profile query result'
    );

    // maybeSingle() returns null if not found (no error thrown)
    // Only throw if there's an actual database error
    if (profileError) {
      requestLogger.error(
        { err: profileError, userId: user.id },
        'Database error checking profile'
      );
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    requestLogger.info(
      {
        userId: user.id,
        hasProfile: !!profile,
        hasOrganization: !!profile?.organization_id,
      },
      'Profile check complete'
    );

    return NextResponse.json({
      hasProfile: !!profile,
      hasOrganization: !!profile?.organization_id,
      userId: user.id,
    });
  } catch (error: any) {
    requestLogger.error({ err: error }, 'Unexpected error in check profile');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
