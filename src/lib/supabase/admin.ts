import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin client with service role for bypassing RLS
 * SECURITY: Only use this client in API routes where you've verified user permissions
 * This client has full database access and bypasses Row Level Security
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
