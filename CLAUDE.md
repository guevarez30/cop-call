# MicroSaaS Template - Project Documentation

## Project Overview

A mobile-responsive multi-tenant SaaS application template built with modern web technologies, focusing on incremental development and clean architecture.

## Development Philosophy

- **Incremental Development**: No home run, single-shot code development
- **Mobile-First**: Mobile-responsive UI as primary focus
- **Component-Based**: Utilizing Tailwind CSS and shadcn/ui components
- **Iterative Approach**: Build and test features step-by-step
- **First-Time User Experience**: Always consider empty states and provide contextual guidance
  - No special onboarding flows
  - Every page should handle empty data gracefully
  - Display helpful messages showing users how to get started on that specific page
  - Guide users naturally through the app as they use it

## Tech Stack

### Frontend

- **Framework**: Next.js 15.x (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Type Safety**: TypeScript (if configured)

### Backend & Database

- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **API Routes**: Next.js API Routes (protected)

## Project Structure

```
/
├── .claude/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes
│   │   │   ├── page.tsx       # Home page (root "/")
│   │   │   └── components/    # Components specific to public pages
│   │   ├── (protected)/       # Auth-protected routes
│   │   │   └── app/           # Main application ("/app")
│   │   │       ├── page.tsx
│   │   │       ├── components/ # Components specific to /app dashboard
│   │   │       └── ...        # Additional app pages with nested components
│   │   ├── api/               # API routes (mostly protected)
│   │   │   └── ...
│   │   └── lib/               # Utilities, Supabase client, etc.
│   ├── components/            # Global shared components (used across multiple pages)
│   └── middleware.ts          # Route protection middleware
├── supabase/
│   └── migrations/            # SQL migration files (run in order)
└── CLAUDE.md                  # This file - project overview
```

### Component Organization Strategy

- **Page-specific components**: Nested in `components/` folder within the page directory
- **Shared components**: Only placed in global `/src/components/` if used across multiple pages
- **Principle**: Keep components close to where they're used for better code organization and maintainability

## Organization Hierarchy

The application uses a hierarchical multi-tenant data model:

**Organization → Teams → Users → [Your Data Models]**

- **Organization**: Top-level entity that owns all application data
- **Teams**: Groups within an organization (optional, may be implemented later)
- **Users**: Belong to an organization, have roles (Admin or User)
- **[Your Data Models]**: Add your application-specific entities here

### Multi-Tenant Data Ownership Pattern

- **Organization-scoped resources**: Shared across all users in the organization (e.g., settings, configurations)
- **User-scoped resources**: Owned by individual users, but viewable by admins
- **Cross-admin collaboration**: All admins have equal access to organization-level resources

## User Personas

### Admin

- **Dashboard**: Overview of organization-wide data and metrics
- **Access**: Full application access including admin-only pages
- **Permissions**:
  - View organization-wide analytics and data
  - Manage organization-level resources
  - Manage team members
  - View all user data across the organization
  - Access admin-only pages

### User

- **Dashboard**: Personal data and activities view
- **Access**: Standard application features
- **Permissions**:
  - View and manage own data
  - Use organization-level resources
  - No access to admin-only pages
  - No access to organization-wide analytics
  - Cannot manage organization settings or other users

## Route Architecture

### Public Routes

- `/` - Home page (marketing/landing page)

### Protected Routes (Auth Required)

- `/app` - Main application dashboard (different for Admin vs User)
  - **Admin**: Organization-wide overview and analytics
  - **User**: Personal dashboard
- `/app/*` - All application pages and features (add your routes here)
- `/api/*` - Most API endpoints (except auth-related)

## Authentication Strategy

- **Provider**: Supabase Auth
- **Protection Method**: Next.js middleware for route protection
- **Protected Areas**:
  - All `/app/*` routes
  - Most `/api/*` routes (except public auth endpoints)

### Signup & Onboarding Flow

**Development Setup Note:**
For development, disable email confirmation in Supabase Dashboard:

- Go to **Authentication** → **Providers** → **Email**
- Disable "**Confirm email**" to allow instant signup without email verification
- Re-enable for production

**Flow:**

1. **Signup (`/signup`)**:
   - User provides: email and password only
   - Creates Supabase Auth user
   - **With email confirmation**: Email verification link sent, user must verify before login
   - **Without email confirmation**: User can login immediately
   - User sees success message

2. **Login (`/login`)**:
   - User signs in with email and password
   - Checks if user profile exists in database
   - **If profile exists**: Redirects to `/app` dashboard
   - **If no profile**: Redirects to `/onboarding` for first-time setup

3. **Onboarding (`/onboarding`)**:
   - First-time user experience
   - User provides: full name and organization name
   - Calls `/api/auth/setup-profile` to create organization and user profile
   - Redirects to `/app` dashboard after completion

4. **Profile Setup API (`/api/auth/setup-profile`)**:
   - Protected endpoint that requires valid session token
   - Uses Supabase service role to create organization and user records
   - First user of organization is automatically assigned `admin` role
   - Returns success, allowing redirect to application

## Database

### Schema

**Core Tables:**

- `organizations` - Top-level entity owning all data
- `users` - Application users with roles (admin/user), linked to Supabase Auth

**Key Relationships:**

- Each user belongs to one organization
- Users reference Supabase Auth users
- Cascade deletes maintain referential integrity

### Migrations

- Location: `/supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Run with: `supabase db push` or via Supabase Dashboard

**Template Migrations:**

1. `20250930000001_create_organizations.sql` - Organizations table with RLS enabled
2. `20250930000002_create_users.sql` - Users table, user_role enum, with RLS enabled
3. `20251002000001_add_rls_policies.sql` - Comprehensive RLS policies for users and organizations
4. `20251002000002_allow_initial_profile_creation.sql` - (Deprecated) Initial permissive INSERT policies
5. `20251002000003_remove_open_insert_policies.sql` - Removes permissive INSERT policies for security

**Important RLS Notes:**

- Tables have RLS enabled by default for security
- **NO direct INSERT policies** - All user/org creation goes through `/api/auth/setup-profile` using service role
- Service role bypasses RLS for admin operations (used in setup-profile endpoint)
- Admins can view/update all users in their organization
- Users can only view/update their own profile (except role and organization_id)
- This ensures all profile creation is validated and controlled server-side

_Add your application-specific migrations after these base migrations_

### Connection

- **Provider**: Supabase
- **Client**: Supabase JavaScript client
- **Configuration**: Environment variables for connection strings and keys

## Development Workflow

### Phase 1: Foundation

- [ ] Set up Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase project and environment variables
- [ ] Create database migrations (organizations, users)
- [ ] Create Supabase client utilities
- [ ] Implement authentication middleware

### Phase 2: Core Structure

- [ ] Build public home page (`/`)
- [ ] Create protected app layout
- [ ] Implement authentication UI (login/signup)
- [ ] Set up route protection

### Phase 3: Application Features

- [ ] Build main dashboard (`/app`) with role-based views
- [ ] Develop your application-specific features incrementally
- [ ] Create necessary API routes
- [ ] Connect to Supabase database

### Phase 4: Enhancement

- [ ] Refine mobile responsiveness
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Optimize performance

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Key Principles

1. **Mobile-first responsive design**
2. **Incremental feature development**
3. **Auth protection by default for app routes**
4. **Clean separation between public and protected areas**
5. **Component reusability with shadcn/ui**
6. **Type-safe database queries with Supabase**
7. **Empty state guidance**: Always show helpful, contextual messages when data is empty to guide users on how to get started

## Notes for Claude

- Always confirm changes before implementing
- Break down large features into smaller tasks
- Test authentication flows thoroughly
- Prioritize mobile responsiveness in all components
- Use shadcn/ui components as building blocks
- Keep API routes secure by default
