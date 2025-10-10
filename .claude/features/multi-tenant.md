# Multi-Tenant System Feature

## Purpose
Complete data isolation between police departments using organization-based multi-tenancy. Each organization owns its own data (users, events, tags) with strict row-level security (RLS) enforcement.

## Architecture Pattern
**Organization → Users → Data**

Each organization is a completely isolated tenant with no cross-organization data access.

## Core Concepts

### Organization
- Top-level entity representing a police department
- All data scoped to organization
- Created during onboarding (first user)
- Name customizable by admins

### User Roles
- **Admin**: Full department access, user management, tag management
- **User**: Limited to own data, no admin features

### Data Ownership
All application data belongs to an organization:
- Users
- Events
- Tags
- Invitations

## Database Schema

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  badge_no TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Constraints**:
- User belongs to exactly one organization
- Cascade delete: Org deleted → Users deleted
- Email unique per organization (enforced in app logic)

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  officer_name TEXT NOT NULL, -- Denormalized
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Constraints**:
- Event belongs to organization and officer
- Cascade delete: Org deleted → Events deleted
- Officer name denormalized for performance

### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, name) -- Unique tag names per org
);
```

### Event Tags Junction
```sql
CREATE TABLE event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(event_id, tag_id)
);
```

### Invitations Table
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Row Level Security (RLS) Policies

### Philosophy
- **Deny by default**: RLS enabled on all tables, no default permissions
- **Organization-scoped**: All queries automatically filtered by organization_id
- **Role-based**: Policies enforce admin vs user permissions
- **No client-side filtering**: Trust RLS, not application logic

### Organizations Table

**SELECT Policy** (view_organization):
```sql
-- Users can view their own organization
USING (id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
))
```

**UPDATE Policy** (update_organization):
```sql
-- Admins can update their organization
USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

### Users Table

**SELECT Policy** (view_users):
```sql
-- Users can view themselves
-- Admins can view all users in their organization
USING (
  id = auth.uid() -- Own profile
  OR
  (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )) -- Admin viewing org users
)
```

**UPDATE Policy** (update_user):
```sql
-- Users can update their own profile (except role, org_id)
-- Admins can update any user in their org
USING (
  id = auth.uid() -- Own profile
  OR
  (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )) -- Admin updating org users
)
```

**Important**: Users cannot change their own `role` or `organization_id`

**DELETE Policy** (delete_user):
```sql
-- Only admins can delete users in their organization
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

### Events Table

**SELECT Policy** (view_events):
```sql
-- Users can view their own events
-- Admins can view all events in their organization
USING (
  officer_id = auth.uid() -- Own events
  OR
  (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )) -- Admin viewing org events
)
```

**INSERT Policy** (create_event):
```sql
-- Users can create events in their organization
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  AND officer_id = auth.uid() -- Must be own officer_id
)
```

**UPDATE Policy** (update_event):
```sql
-- Users can update own draft events
-- Admins can update any event in their organization
USING (
  (officer_id = auth.uid() AND status = 'draft') -- Own drafts
  OR
  (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )) -- Admin updating org events
)
```

**DELETE Policy** (delete_event):
```sql
-- Only admins can delete events in their organization
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

### Tags Table

**SELECT Policy** (view_tags):
```sql
-- All users can view tags in their organization
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
)
```

**INSERT/UPDATE/DELETE Policies** (manage_tags):
```sql
-- Only admins can create/update/delete tags
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

### Invitations Table

**SELECT Policy** (view_invitations):
```sql
-- Admins can view invitations in their organization
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

**INSERT/DELETE Policies**:
Similar admin-only pattern

## Service Role Bypass

### When to Use Service Role
Service role bypasses RLS for admin operations:
- Creating organizations (onboarding)
- Creating first user (onboarding)
- Accepting invitations (cross-org operation)

### Service Role Pattern
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
  { auth: { persistSession: false } }
);
```

**Critical**: Only use in API routes, never client-side

### Service Role Endpoints
- `POST /api/auth/setup-profile` - Creates org + user
- `POST /api/invitations/send` - Creates invitation record
- `GET /api/invitations/accept/[token]` - Validates cross-org token

## Organization Creation Flow

### First User Onboarding
1. User signs up via Supabase Auth
2. User logs in → no profile found → redirect to `/onboarding`
3. User provides: full_name + organization_name
4. Client calls `POST /api/auth/setup-profile`
5. Server (using service role):
   - Creates organization record
   - Creates user record (role = 'admin')
   - Links user to organization
6. Client redirects to `/app`

**Result**: New organization with first admin user

### Invitation-Based Signup
1. Admin invites user → invitation created with organization_id
2. Invited user clicks link → redirects to `/accept-invite/[token]`
3. Token validated (organization_id embedded)
4. User signs up → profile created with same organization_id
5. User assigned to existing organization
6. Invitation marked as used

**Result**: User joins existing organization

## Data Isolation Guarantees

### Organization Boundary
- No cross-organization queries possible
- RLS enforces organization_id filtering
- Admin of Org A cannot see Org B data
- Database-level isolation, not app-level

### User Boundary (Within Org)
- **Officers**: See only own events
- **Admins**: See all org events
- Users table visible to admins only
- Tags shared across org

### API Layer
All API routes verify:
1. User authenticated (`auth.uid()` exists)
2. User's organization_id matches resource
3. User's role allows operation

## Helper Functions

### Get Current User's Organization
```typescript
const { data: user } = await supabase
  .from('users')
  .select('organization_id, role')
  .eq('id', auth.uid())
  .single();
```

### Check Admin Status
```typescript
const { data: user } = await supabase
  .from('users')
  .select('role')
  .eq('id', auth.uid())
  .single();

const isAdmin = user?.role === 'admin';
```

### Organization-Scoped Query Example
```typescript
// Automatic org filtering via RLS
const { data: events } = await supabase
  .from('events')
  .select('*');

// RLS automatically adds: WHERE organization_id = user's_org_id
// Admins see all org events, users see only their own
```

## Role-Based Access Control

### Admin Capabilities
- View all organization data
- Manage users (invite, promote, remove)
- Manage tags (create, edit, delete)
- Edit/delete any event
- Update organization details

### User Capabilities
- View own profile
- Create events
- Edit own draft events
- View own submitted events
- Select from org tags
- View organization name

### Permission Enforcement
- **Database Level**: RLS policies
- **API Level**: Route handlers check role
- **UI Level**: Conditional rendering (not security, just UX)

## Migration Strategy

### Database Migrations
Located in `/supabase/migrations/`:
1. `20250930000001_create_organizations.sql`
2. `20250930000002_create_users.sql`
3. `20251002000001_add_rls_policies.sql`
4. `20251003000001_fix_rls_infinite_recursion.sql`
5. Additional migrations for events, tags, invitations

**Run Order**: Critical - must run in sequence

### RLS Migration Pattern
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY policy_name ON table_name
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
));
```

## Common Pitfalls

### Infinite Recursion
**Problem**: RLS policy on `users` table references `users` table
**Solution**: Use `auth.uid()` directly, not subquery when possible

### Service Role Leaks
**Problem**: Service role client used in client-side code
**Solution**: Only import service role in API routes

### Missing RLS Policies
**Problem**: New table created without RLS enabled
**Solution**: All tables must have RLS enabled + policies defined

### Cross-Org References
**Problem**: Trying to JOIN across organizations
**Solution**: Always filter by organization_id first

## Testing Multi-Tenancy

### Checklist
- [ ] Create two organizations
- [ ] User from Org A cannot see Org B data
- [ ] Admin from Org A cannot manage Org B users
- [ ] Events scoped correctly (officer vs admin)
- [ ] Tags scoped to organization
- [ ] Invitations scoped to organization
- [ ] Direct database queries return correct data
- [ ] API endpoints enforce org boundaries

### Test Scenarios

**Scenario 1: Cross-Org Event Access**
1. Create event as Officer in Org A
2. Login as Admin in Org B
3. Verify event not visible in Org B dashboard
4. Verify event not in Org B history
5. Verify direct API call returns 404/403

**Scenario 2: Cross-Org User Management**
1. Login as Admin in Org A
2. Get user list
3. Verify only Org A users returned
4. Attempt to update Org B user (should fail)

**Scenario 3: Invitation Boundary**
1. Admin in Org A sends invitation
2. User accepts invitation
3. Verify user added to Org A (not Org B)
4. Verify user sees Org A data only

## Performance Considerations

### RLS Overhead
- RLS adds subquery to every query
- Can impact performance on large datasets
- Solution: Proper indexes on organization_id

### Recommended Indexes
```sql
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_events_org ON events(organization_id);
CREATE INDEX idx_events_officer ON events(officer_id);
CREATE INDEX idx_tags_org ON tags(organization_id);
CREATE INDEX idx_invitations_org ON invitations(organization_id);
```

### Query Optimization
- RLS policies should use indexed columns
- Avoid complex subqueries in policies
- Monitor slow query log for RLS overhead

## Security Best Practices

### 1. Never Disable RLS
```sql
-- ❌ NEVER DO THIS
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

### 2. Service Role in API Routes Only
```typescript
// ✅ Good - server-side API route
// /api/auth/setup-profile/route.ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);

// ❌ Bad - client component
// page.tsx
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);
```

### 3. Validate Organization Context
```typescript
// Always verify user's org matches resource
const { data: event } = await supabase
  .from('events')
  .select('*, users!inner(organization_id)')
  .eq('id', eventId)
  .single();

if (event.users.organization_id !== currentUser.organization_id) {
  throw new Error('Unauthorized');
}
```

### 4. Admin Check Pattern
```typescript
// Server-side admin verification
const { data: user } = await supabase
  .from('users')
  .select('role, organization_id')
  .eq('id', authUserId)
  .single();

if (user?.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

## Related Features
- **Authentication** - Onboarding creates first org
- **Organization Settings** - Manage org details
- **User Profile** - Organization membership
- **Event Logging** - Organization-scoped events
- **Tag Management** - Organization-scoped tags
