# Service Call - Project Documentation

## Project Overview
Service Call is a mobile-responsive web application built with modern web technologies, focusing on incremental development and clean architecture.

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
│   └── database-schema.md     # Detailed database schema documentation
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes
│   │   │   ├── page.tsx       # Home page (root "/")
│   │   │   └── components/    # Components specific to public pages
│   │   ├── (protected)/       # Auth-protected routes
│   │   │   └── app/           # Main application ("/app")
│   │   │       ├── page.tsx
│   │   │       ├── components/ # Components specific to /app dashboard
│   │   │       ├── sheets/
│   │   │       │   ├── page.tsx
│   │   │       │   └── components/ # Components specific to sheets page
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

The application uses a hierarchical data model:

**Organization → Teams → Users → Service Calls**

- **Organization**: Top-level entity that owns all data (templates, teams, users, service calls)
- **Teams**: Groups within an organization (optional, may be implemented later)
- **Users**: Belong to an organization, have roles (Admin or User)
- **Service Calls**: Created by users, use templates from the organization
- **Templates**: Belong to the organization, can be used by all users in that org

### Key Ownership Rules
1. **Templates are organization-scoped**: Any admin in the organization can create, edit, or delete any template
2. **Service calls are user-scoped**: Users own their service calls but admins can view all
3. **No personal templates**: Templates are shared resources across the organization
4. **Cross-admin collaboration**: All admins have equal access to manage templates

## User Personas

### Admin
- **Dashboard**: Overview of team performance and metrics
- **Access**: Full application access including admin-only pages
- **Permissions**:
  - View team performance data
  - Access `/app/sheets` page to manage templates
  - Create, edit, and delete ANY template in the organization
  - Manage team members
  - View all service calls across the organization

### User
- **Dashboard**: Personal service calls view
- **Access**: Standard application features
- **Permissions**:
  - View own service calls
  - Create and manage own calls using organization templates
  - No access to `/app/sheets` (template management)
  - No access to team-wide analytics
  - Cannot create or edit templates

### Development Mode
- **Persona Toggle**: Header includes a toggle to switch between Admin and User views
- **Purpose**: Testing different permission levels and UI variations during development

## Route Architecture

### Public Routes
- `/` - Home page (marketing/landing page)

### Protected Routes (Auth Required)
- `/app` - Main application dashboard (different for Admin vs User)
  - **Admin**: Team performance overview
  - **User**: Personal service calls dashboard
- `/app/sheets` - Admin-only page
- `/app/*` - All application pages and features
- `/api/*` - Most API endpoints (except auth-related)

## Authentication Strategy
- **Provider**: Supabase Auth
- **Protection Method**: Next.js middleware for route protection
- **Protected Areas**:
  - All `/app/*` routes
  - Most `/api/*` routes (except public auth endpoints)

## Database

### Schema
See `.claude/database-schema.md` for detailed schema documentation.

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

**Existing Migrations:**
1. `20250930000001_create_organizations.sql` - Organizations table
2. `20250930000002_create_users.sql` - Users table and user_role enum

### Connection
- **Provider**: Supabase
- **Client**: Supabase JavaScript client
- **Configuration**: Environment variables for connection strings and keys

## Development Workflow

### Phase 1: Foundation
- [x] Set up Tailwind CSS
- [x] Create database migrations (organizations, users)
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase project and environment variables
- [ ] Create Supabase client utilities
- [ ] Implement authentication middleware

### Phase 2: Core Structure
- [ ] Build public home page (`/`)
- [ ] Create protected app layout
- [ ] Implement authentication UI (login/signup)
- [ ] Set up route protection

### Phase 3: Application Features
- [ ] Build main dashboard (`/app`)
- [ ] Develop core features incrementally
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
