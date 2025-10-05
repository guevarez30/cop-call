# MicroSaaS Template

A mobile-responsive multi-tenant SaaS application template built with Next.js 15, Supabase, and Tailwind CSS.

## Features

### ✅ Completed

- [x] User Registration (Sign up with email/password)
- [x] User Login (Sign in with email/password)
- [x] First-Time User Onboarding (Organization setup)
- [x] User Profile (View and edit profile information)
- [x] Theme Controls (Light/Dark mode toggle with persistence)
- [x] Change Password (Update account password)
- [x] Password Reset (Forgot password flow)
- [x] Invite Users (Send email invitations - Admin only)
- [x] Accept Invitations (Join organization via invitation link)
- [x] Manage Invitations (Resend/revoke pending invites - Admin only)
- [x] Organization Settings (Edit organization name - Admin only)
- [x] Two-factor authentication
- [x] Deactivate Users (Admin permission required)

### 🚧 In Progress / Planned
- [ ] Upload avatar image
- [ ] Stripe integration

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
cd <your-project-name>
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

#### Configure Supabase Settings

**Email Configuration (For Development):**

1. Go to **Authentication** → **Providers** → **Email**
2. Disable "**Confirm email**" to test signup without verification
3. ⚠️ Re-enable for production

For production email setup (invitations, password reset), see [Email Configuration Details](#production-email-setup).

**URL Configuration:**

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (or your deployment URL)
3. Add **Redirect URLs**: `http://localhost:3000/**`

**Two-Factor Authentication (Optional):**

1. Go to **Authentication** → **Providers**
2. Enable "**Authenticator App**" provider
3. Users can enable 2FA from `/app/profile` → Security tab

### 5. Run Database Migrations

You need to create the database schema. You have two options:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Run the migrations in order (IMPORTANT: Run in this exact order):

**Migration 1: Create Organizations Table**
- Open `supabase/migrations/20250930000001_create_organizations.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 2: Create Users Table**
- Open `supabase/migrations/20250930000002_create_users.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 3: Add RLS Policies**
- Open `supabase/migrations/20251002000001_add_rls_policies.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 4: Fix RLS Infinite Recursion**
- Open `supabase/migrations/20251003000001_fix_rls_infinite_recursion.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 5: Add Theme to Users**
- Open `supabase/migrations/20251003000002_add_theme_to_users.sql`
- Copy the entire contents
- Paste into SQL Editor and click "Run"

**Migration 6: Create Invitations Table**
- Open `supabase/migrations/20251003000003_create_invitations.sql`
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

### 7. Verify Your Setup

**Quick verification steps:**

1. **Check Database Tables**: Go to Supabase → **Table Editor** and verify `organizations`, `users`, and `invitations` tables exist

2. **Create First Admin User**:
   - Go to `http://localhost:3000/signup`
   - Sign up with email/password
   - Complete onboarding (full name + organization name)
   - Verify you see "Settings" in navigation (admin only)

3. **Test Basic Features**:
   - **Profile**: Update your name at `/app/profile`
   - **Theme**: Toggle light/dark mode (persists on refresh)
   - **Password**: Change password from Security tab
   - **2FA**: Enable authenticator app (if configured)

4. **Test Admin Features** (at `/app/settings`):
   - View organization members
   - Invite a user (requires email configuration)
   - Update organization name

5. **Verify RLS Security**: Run in Supabase SQL Editor:
   ```sql
   -- Should return your user
   SELECT * FROM users WHERE id = auth.uid();

   -- Should fail (RLS prevents direct inserts)
   INSERT INTO users (id, email, full_name, role, organization_id)
   VALUES ('test', 'test@test.com', 'Test', 'user', 'org-id');
   ```

✅ If basic signup/login works and you can access Settings as admin, you're ready to build!

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── (public)/                   # Public routes (no auth required)
│   │   │   ├── login/                  # Login page
│   │   │   ├── signup/                 # Sign up page
│   │   │   ├── onboarding/             # First-time user setup
│   │   │   ├── forgot-password/        # Password reset request
│   │   │   ├── reset-password/         # Password reset form
│   │   │   └── accept-invite/[token]/  # Invitation acceptance
│   │   ├── app/                        # Protected app routes
│   │   │   ├── page.tsx                # Main dashboard
│   │   │   ├── layout.tsx              # App layout with navigation
│   │   │   ├── profile/                # User profile page
│   │   │   └── settings/               # Organization settings (Admin only)
│   │   ├── api/                        # API routes
│   │   │   ├── auth/                   # Authentication endpoints
│   │   │   │   ├── check-profile/      # Check if user profile exists
│   │   │   │   └── setup-profile/      # Create organization & user
│   │   │   ├── profile/                # Profile update endpoints
│   │   │   ├── organizations/          # Organization management
│   │   │   ├── invitations/            # Invitation management
│   │   │   │   ├── send/               # Send invitation
│   │   │   │   ├── list/               # List pending invitations
│   │   │   │   ├── accept/[token]/     # Accept invitation
│   │   │   │   ├── resend/[id]/        # Resend invitation
│   │   │   │   └── [id]/               # Delete invitation
│   │   │   └── users/                  # User management
│   │   │       └── list/               # List organization users
│   │   ├── page.js                     # Home/landing page
│   │   └── layout.js                   # Root layout
│   ├── components/
│   │   └── ui/                         # shadcn/ui components
│   └── lib/
│       ├── supabase/                   # Supabase client utilities
│       │   ├── client.ts               # Browser client
│       │   ├── server.ts               # Server client
│       │   └── middleware.ts           # Auth middleware
│       ├── auth.ts                     # Auth helper functions
│       ├── role-context.tsx            # Role management context
│       ├── user-profile-context.tsx    # User profile context
│       └── theme-context.tsx           # Theme management
├── supabase/
│   └── migrations/                     # Database migrations (6 files)
├── .env.local                          # Environment variables (create this)
└── CLAUDE.md                           # Project documentation for AI
```

## Application Routes

### Public Routes (No Authentication Required)
- `/` - Home/landing page
- `/login` - User login
- `/signup` - New user registration
- `/onboarding` - First-time user setup (creates organization and profile)
- `/forgot-password` - Request password reset email
- `/reset-password` - Reset password with token
- `/accept-invite/[token]` - Accept organization invitation

### Protected Routes (Authentication Required)
- `/app` - Main dashboard (role-based view)
- `/app/profile` - User profile management
- `/app/settings` - Organization settings (**Admin only**)

### User Flow
1. **New User**: Signup → Email Verification (optional) → Login → Onboarding → Dashboard
2. **Invited User**: Receive Email → Accept Invite → Signup/Login → Dashboard
3. **Password Reset**: Forgot Password → Email → Reset Password → Login

## User Roles

The application supports two user roles:

### Admin

- Full access to all features
- Access to organization settings page (`/app/settings`)
- Can invite new users to the organization
- Can manage pending invitations (resend, revoke)
- Can view all organization members
- Can edit organization name
- View organization-wide data

### User

- Standard application access
- Can view and manage own data
- Cannot access admin-only features
- Cannot access organization settings page

## Database Schema

The application uses the following core tables:

### Tables
- **organizations** - Multi-tenant organizations
  - `id`, `name`, `created_at`, `updated_at`

- **users** - Application users (linked to Supabase Auth)
  - `id`, `email`, `full_name`, `role` (admin/user), `organization_id`, `theme` (light/dark), `created_at`, `updated_at`

- **invitations** - Pending organization invitations
  - `id`, `organization_id`, `email`, `role`, `token`, `status` (pending/accepted/expired), `invited_by_user_id`, `expires_at`, `created_at`, `updated_at`

### Key Features
- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamps** with trigger-based `updated_at` updates
- **Cascade deletes** to maintain referential integrity
- **Indexes** on frequently queried columns for performance
- **Enums** for `user_role` (admin, user) and `invitation_status` (pending, accepted, expired)

## Security

### Row Level Security (RLS)

All tables use RLS policies to ensure:
- Users only access data from their organization
- Admins have elevated permissions within their organization
- No cross-organization data leakage
- Users cannot change their own role or organization_id

### Authentication

- Passwords hashed by Supabase Auth
- Secure JWT tokens for sessions
- All API routes verify authentication
- Service role key only used server-side

### Production Checklist

Before deploying:

- [ ] Re-enable email confirmation in Supabase
- [ ] Configure production email (custom SMTP recommended)
- [ ] Update Site URL and Redirect URLs (remove localhost)
- [ ] Set environment variables in hosting platform
- [ ] Enable rate limiting in Supabase (Auth & API)
- [ ] Test RLS with multiple users
- [ ] Verify service role key never exposed to client
- [ ] Test all CRUD operations and role permissions

**For detailed security best practices**, see `CLAUDE.md` or [Production Security Details](#production-security-details).

## Development

### API Endpoints

All API endpoints (except public auth endpoints) require authentication via Bearer token in the Authorization header.

#### Authentication
- `POST /api/auth/check-profile` - Check if user profile exists in database
- `POST /api/auth/setup-profile` - Create organization and user profile (first-time setup)

#### Profile Management
- `GET /api/profile` - Get current user's profile
- `PATCH /api/profile` - Update user profile (name, theme)

#### Organization Management (Admin Only)
- `PATCH /api/organizations` - Update organization details (name)

#### User Management (Admin Only)
- `GET /api/users/list` - List all users in organization

#### Invitation Management (Admin Only)
- `POST /api/invitations/send` - Send invitation email
- `GET /api/invitations/list` - List pending invitations
- `POST /api/invitations/resend/[id]` - Resend invitation email
- `DELETE /api/invitations/[id]` - Revoke/delete invitation

#### Invitation Acceptance (Public)
- `POST /api/invitations/accept/[token]` - Accept invitation and join organization

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

### Environment Variables for Production

Make sure to set the same environment variables in your production environment.

## Troubleshooting

### Common Issues

**Can't login after signup**
- User profile not created → Complete onboarding at `/onboarding`
- Check user exists in `users` table (Supabase Table Editor)

**"Row Level Security Policy Violation"**
- Profile doesn't exist in `users` table → Complete onboarding
- Run in SQL Editor to verify: `SELECT * FROM users WHERE id = auth.uid();`

**Migration errors**
- Migrations must run in order (by timestamp)
- If tables exist, drop them: `DROP TABLE IF EXISTS users, organizations, invitations CASCADE;`

**CORS / Connection errors**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (ends with `.supabase.co`)
- Check Supabase project isn't paused (free tier pauses after inactivity)
- Restart dev server after changing environment variables

**Email not sending**
- Check spam folder
- Verify email configuration (see [Production Email Setup](#production-email-setup))
- Check Supabase → Logs → Auth Logs

**Can't access Settings page**
- Only admins can access `/app/settings`
- First user is automatically admin
- Check role in `users` table (Table Editor)

**Build errors**
- Run `npm install`
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`
- Requires Node.js 18+

**More help:**
- Check Supabase Dashboard → **Logs** for errors
- Review `CLAUDE.md` for architecture details
- Check browser console (F12) for errors

## Contributing

This is a template project. Feel free to:

- Fork and customize for your needs
- Submit issues for bugs
- Suggest new features

## License

Coming soon

## Support

For questions or issues:

1. Check the troubleshooting section above
2. Review `CLAUDE.md` for detailed documentation
3. Check Supabase documentation
4. Open an issue in the repository

Happy building! 🚀

---

## Appendix: Advanced Configuration

### Production Email Setup

For production-ready email delivery (invitations, password resets):

**Option 1: Supabase Built-in Email**
- Go to **Authentication** → **Email Templates**
- Emails sent from `noreply@mail.app.supabase.io`
- Limited volume, may go to spam
- Good for testing, not recommended for production

**Option 2: Custom SMTP (Recommended)**
1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Enable "Enable Custom SMTP"
3. Configure your provider:
   ```
   Host: smtp.yourprovider.com
   Port: 587 (or 465 for SSL)
   Username: your-smtp-username
   Password: your-smtp-password
   Sender email: noreply@yourdomain.com
   Sender name: Your App Name
   ```

**Recommended SMTP Providers:**
- **SendGrid**: Free tier, reliable
- **AWS SES**: Pay per email, enterprise-grade
- **Mailgun**: Developer-friendly

**Customize Email Templates:**
- Go to **Authentication** → **Email Templates**
- Customize: Confirm signup, Invite user, Reset password, Magic Link
- Use variables: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`

### Production Security Details

**Environment Variables:**
- Never commit `.env.local` to git
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - server-side only
- Set all env vars in hosting platform (Vercel, Netlify, etc.)

**Supabase Security Settings:**
1. **Enable Email Verification**: Auth → Providers → Email → "Confirm email"
2. **Rate Limiting**: Settings → API → Configure limits (10 req/min for auth, 100 req/min for API)
3. **JWT Expiration**: Settings → Auth → Set expiry (1 hour default)
4. **Redirect URLs**: Auth → URL Configuration → Remove localhost in production

**Database Security:**
- Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Test policies with multiple users and roles
- Set up backups (free tier: 7-day retention, pro: point-in-time recovery)

**API Security Pattern:**
```typescript
// All API routes should follow this pattern
const user = await getUser();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

const profile = await getUserProfile(user.id);
if (profile.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

// Process request...
```

**Monitoring:**
- Check Supabase → Logs for auth/API/database errors
- Monitor failed login attempts, API error rates, RLS policy failures
- Set up alerts for anomalies

For complete architecture and development guidelines, see `CLAUDE.md`.
