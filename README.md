# MicroSaaS Template

A mobile-responsive multi-tenant SaaS application template built with Next.js 15, Supabase, and Tailwind CSS.

## Features

### ✅ Completed
- [x] User Registration (Sign up with email/password)
- [x] User Login (Sign in with email/password)
- [x] User Profile (View profile information)

### 🚧 In Progress / Planned
- [ ] User Profile Settings (Edit profile information)
- [ ] Invite Users (Admin permission required)
- [ ] Deactivate Users (Admin permission required)
- [ ] Password Reset (Forgot password flow)
- [ ] Theme Controls (Light/Dark mode toggle)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- Git
- A Supabase account (free tier works)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd service-call
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created (~2 minutes)

#### Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `anon public` key (under Project API keys)
   - `service_role` key (under Project API keys) - ⚠️ Keep this secret!

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run Database Migrations

You need to create the database schema. You have two options:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Run the migrations in order:

**Migration 1: Create Organizations Table**
- Open `supabase/migrations/20250930000001_create_organizations.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 2: Create Users Table**
- Open `supabase/migrations/20250930000002_create_users.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 3: Add RLS Policies**
- Open `supabase/migrations/20251001000001_add_rls_policies.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes (login, signup, home)
│   │   ├── app/               # Protected app routes
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── profile/       # User profile page
│   │   │   └── settings/      # Settings page
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── profile/       # Profile endpoints
│   │   └── middleware.ts      # Route protection
│   ├── components/            # Shared components
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       └── supabase/          # Supabase client utilities
│           ├── client.ts      # Browser client
│           └── server.ts      # Server client
├── supabase/
│   └── migrations/            # Database migrations
├── .env.local                 # Environment variables (create this)
└── CLAUDE.md                  # Project documentation for AI
```

## User Roles

The application supports two user roles:

### Admin
- Full access to all features
- Can view organization-wide analytics
- Can manage team members (invite, deactivate)
- Can modify organization settings

### User
- Standard application access
- Can view and manage own data
- Cannot access admin-only features

## Database Schema

### Organizations
- Multi-tenant structure where each organization owns its data
- First user to sign up creates an organization and becomes admin

### Users
- Linked to Supabase Auth
- Belongs to one organization
- Has a role (admin or user)

See `.claude/database-schema.md` for detailed schema documentation.

## Security

### Row Level Security (RLS)
All tables use PostgreSQL Row Level Security policies to ensure:
- Users can only access data from their organization
- Admins have elevated permissions within their organization
- No cross-organization data leakage

### Authentication
- Passwords are hashed and managed by Supabase Auth
- Sessions use secure JWT tokens
- API routes verify authentication before processing requests

## Development

### Adding New Features
1. Read `CLAUDE.md` for development guidelines
2. Create database migrations in `supabase/migrations/`
3. Add API routes in `src/app/api/`
4. Build UI components in `src/app/app/`
5. Use shadcn/ui for consistent styling

### Running Tests
```bash
# Tests coming soon
npm test
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Mobile-first responsive design

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

### Environment Variables for Production
Make sure to set the same environment variables in your production environment.

## Troubleshooting

### "Not authenticated" error
- Ensure you're logged in
- Check that your Supabase credentials are correct in `.env.local`
- Verify RLS policies are applied in Supabase

### "Failed to fetch profile" error
- Ensure all database migrations have been run
- Check Supabase logs in the dashboard
- Verify your user exists in the `users` table

### Development server won't start
- Delete `node_modules/` and `.next/`
- Run `npm install` again
- Check for port conflicts (default is 3000)

## Contributing

This is a template project. Feel free to:
- Fork and customize for your needs
- Submit issues for bugs
- Suggest new features

## License

MIT License - feel free to use this template for your projects.

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review `CLAUDE.md` for detailed documentation
3. Check Supabase documentation
4. Open an issue in the repository

## Next Steps

After setup, you'll want to:
1. [ ] Complete user profile settings page
2. [ ] Implement invite users functionality
3. [ ] Add user deactivation for admins
4. [ ] Set up password reset flow
5. [ ] Implement theme switching
6. [ ] Add your application-specific features

Happy building! 🚀
