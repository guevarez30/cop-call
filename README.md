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

#### Configure Email Settings (Required for Invitations & Password Reset)

For the invitation system and password reset to work, you need to configure email in Supabase:

##### Development Setup (Quick Start)

For development/testing, you can disable email confirmation to test signup flows immediately:

1. Go to **Authentication** → **Providers** → **Email** in your Supabase dashboard
2. Disable "**Confirm email**" option
3. **Important**: Re-enable this for production!

⚠️ **Note**: With email confirmation disabled, you can test signup/login but invitations and password reset will not work without proper email configuration.

##### Production Email Configuration

For a fully functional application with invitations and password reset, configure email delivery:

**Option 1: Use Supabase's Built-in Email (Easiest)**

Supabase provides free email sending for development:
1. Go to **Authentication** → **Email Templates**
2. Supabase will send emails from `noreply@mail.app.supabase.io`
3. Customize email templates (see below)
4. **Limitation**: Limited sending volume, emails may go to spam

**Option 2: Custom SMTP (Recommended for Production)**

Use your own email service (Gmail, SendGrid, AWS SES, etc.):

1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Enable "Enable Custom SMTP"
3. Configure your SMTP provider:
   ```
   Host: smtp.yourprovider.com
   Port: 587 (or 465 for SSL)
   Username: your-smtp-username
   Password: your-smtp-password
   Sender email: noreply@yourdomain.com
   Sender name: Your App Name
   ```

**Common SMTP Providers:**
- **SendGrid**: Free tier available, reliable delivery
- **AWS SES**: Pay per email, very reliable
- **Gmail**: Simple setup, but has daily limits
- **Mailgun**: Developer-friendly with free tier

##### Customize Email Templates

After configuring email delivery, customize your email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm signup**: Welcome email with verification link
   - **Invite user**: Organization invitation email
   - **Magic Link**: Passwordless login link
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset link

**Example Invitation Template Variables:**
- `{{ .ConfirmationURL }}` - The invitation acceptance link
- `{{ .Token }}` - The invitation token
- `{{ .SiteURL }}` - Your application URL

##### Configure Site URL and Redirect URLs

Important for authentication flows to work correctly:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs** (whitelist):
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

**Why this matters**: After email verification, password reset, or invitation acceptance, users are redirected to these URLs.

#### Configure Two-Factor Authentication (2FA)

This template includes built-in 2FA support. Configure it in Supabase:

1. Go to **Authentication** → **Providers** → **Phone** (or **Authenticator**)
2. For **Authenticator App 2FA** (Recommended):
   - Enable "Authenticator App" provider
   - No additional configuration needed
   - Users can enable 2FA from their profile settings
3. For **SMS 2FA** (Optional):
   - Enable "Phone" provider
   - Configure SMS provider (Twilio, MessageBird, etc.)
   - Add phone authentication credentials

**How it works in this template:**
- Users navigate to `/app/profile` → "Security" tab
- Click "Enable Two-Factor Authentication"
- Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
- Enter verification code to confirm
- Future logins require 2FA code

**Testing 2FA:**
1. Sign up and login as a test user
2. Go to Profile → Security tab
3. Enable 2FA and scan the QR code
4. Logout and login again - you'll be prompted for 2FA code

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

Follow these steps to ensure everything is working correctly:

#### Step 1: Verify Database Tables

1. Go to your Supabase project dashboard
2. Click **Table Editor** in the left sidebar
3. Confirm you see these tables:
   - `organizations`
   - `users`
   - `invitations`
4. Check that each table has the expected columns (see Database Schema section below)

#### Step 2: Create Your First Admin User

1. Navigate to `http://localhost:3000/signup`
2. Enter your email and password
3. Click "Sign Up"
4. If email confirmation is enabled, check your email and verify
5. Login at `http://localhost:3000/login`
6. You'll be redirected to `/onboarding`
7. Enter your full name and organization name
8. Click "Complete Setup"
9. You should be redirected to `/app` dashboard

**Verify admin access:**
- You should see "Settings" in the navigation menu (Admin only)
- Click Settings - you should be able to access it
- Your role should be "admin" (first user is always admin)

#### Step 3: Test Authentication Flows

**Test Password Reset:**
1. Logout
2. Go to `/forgot-password`
3. Enter your email
4. Check your email for reset link (requires email configuration)
5. Click link and reset password
6. Login with new password

**Test Theme Toggle:**
1. Login and go to `/app/profile`
2. Toggle between light and dark mode
3. Refresh page - theme should persist

#### Step 4: Verify Row Level Security (RLS)

**Important security check:**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user and copy the user ID
3. Go to **Table Editor** → **users** table
4. Try to manually edit your user's `organization_id` - it should fail (RLS prevents this)
5. Go to **SQL Editor** and run:
   ```sql
   -- This should return only your user
   SELECT * FROM users WHERE id = auth.uid();

   -- This should fail (no direct INSERT allowed)
   INSERT INTO users (id, email, full_name, role, organization_id)
   VALUES ('test', 'test@test.com', 'Test', 'user', 'org-id');
   ```

If the SELECT works and INSERT fails, RLS is working correctly! ✅

#### Step 5: Test Invitation System (Admin Only)

1. Login as admin
2. Go to `/app/settings`
3. Click "Invite User" button
4. Enter an email address and select role (User or Admin)
5. Click "Send Invitation"
6. Check the invited user's email for invitation link
7. Click link to accept invitation
8. Invited user joins your organization

**Verify invitation:**
- Go to Settings → "Pending Invitations" tab
- You should see the invitation listed
- Test "Resend" and "Revoke" buttons

## Verifying CRUD Features

This template includes fully functional CRUD (Create, Read, Update, Delete) features. Here's how to test them:

### User Management (Admin Only)

**View Users:**
1. Login as admin
2. Go to `/app/settings` → "Members" tab
3. You should see all users in your organization
4. Each user shows: name, email, role, status

**Invite Users (Create):**
1. Click "Invite User" button
2. Enter email and select role
3. Invitation is created and email sent
4. View in "Pending Invitations" tab

**Deactivate Users (Delete):**
1. In Members tab, find a user
2. Click "Remove User" button
3. Confirm action
4. User is deactivated (soft delete)

**Change User Roles (Update):**
1. In Members tab, click on a user's role dropdown
2. Change between "Admin" and "User"
3. Role is updated immediately
4. User's permissions change on next page load

### User Settings (All Users)

**Profile Management (Read/Update):**
1. Go to `/app/profile` → "Profile" tab
2. View current profile information
3. Edit "Full Name"
4. Click "Update Profile"
5. Refresh - changes should persist

**Change Password (Update):**
1. Go to Profile → "Security" tab
2. Enter current password
3. Enter new password
4. Click "Change Password"
5. Logout and login with new password

**Theme Preferences (Update):**
1. Go to Profile → "Preferences" tab
2. Toggle theme (Light/Dark)
3. Refresh page - theme persists

**Two-Factor Authentication (Create/Delete):**
1. Go to Profile → "Security" tab
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter code to enable
5. To disable: Click "Disable 2FA" and confirm

### Organization Settings (Admin Only)

**Update Organization Name:**
1. Go to `/app/settings` → "General" tab
2. Click "Edit" next to organization name
3. Enter new name
4. Click "Save"
5. Name updates across the application

### Testing Role-Based Access Control

**Test as Admin:**
1. Login as admin user
2. Verify you can access:
   - `/app/settings` ✅
   - View all organization members ✅
   - Invite users ✅
   - Change user roles ✅
   - Edit organization settings ✅

**Test as Regular User:**
1. Create a second user (invite yourself with a different email)
2. Accept invitation and choose "User" role
3. Login as this user
4. Verify you CANNOT access:
   - `/app/settings` ❌ (should redirect or show error)
   - Invite users ❌
   - View other users ❌
   - Change roles ❌
5. Verify you CAN access:
   - `/app/profile` ✅
   - Change your own password ✅
   - Update your own profile ✅
   - Enable/disable your own 2FA ✅

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

All tables use PostgreSQL Row Level Security policies to ensure:

- Users can only access data from their organization
- Admins have elevated permissions within their organization
- No cross-organization data leakage
- All user/organization creation goes through protected API endpoints (service role only)
- Users cannot directly insert into `users` or `organizations` tables

**How RLS Works in This Template:**

1. **Organization Isolation**: Each user belongs to one organization and can only see data from their organization
2. **Role-Based Access**:
   - Admins can read/update all users in their organization
   - Regular users can only read/update their own profile
   - Nobody can change their own role or organization_id (prevents privilege escalation)
3. **Secure Profile Creation**: All profile creation happens through `/api/auth/setup-profile` using service role key, which bypasses RLS for controlled admin operations

**Testing RLS (Important):**

See "Step 4: Verify Row Level Security" in the "Verify Your Setup" section above to test that RLS is working correctly.

### Authentication

- Passwords are hashed and managed by Supabase Auth
- Sessions use secure JWT tokens
- API routes verify authentication before processing requests
- Service role key used only in protected API routes, never exposed to client

### Production Security Best Practices

#### 1. Environment Variables

**Never commit these to git:**
- ✅ Use `.env.local` for local development (already in `.gitignore`)
- ✅ Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- ❌ Never put secrets in client-side code
- ❌ Never commit `.env.local` to version control

**Service Role Key Security:**
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - only use server-side
- Only use in API routes (never in client components)
- Rotate if compromised
- Use environment variables, never hardcode

#### 2. Supabase Security Settings

**Enable these security features in production:**

1. **Email Verification** (Required):
   - Go to **Authentication** → **Providers** → **Email**
   - Enable "Confirm email"
   - This was disabled for development - re-enable for production!

2. **Rate Limiting**:
   - Go to **Settings** → **API**
   - Configure rate limits to prevent abuse:
     - Authentication endpoints: 10 requests/minute per IP
     - API endpoints: 100 requests/minute per user
   - Protects against brute force attacks

3. **Email Rate Limiting**:
   - Supabase automatically rate-limits emails
   - Configure in **Authentication** → **Rate Limits**
   - Prevents email spam/abuse

4. **JWT Expiration**:
   - Go to **Settings** → **Authentication**
   - Set JWT expiry time (default: 1 hour)
   - Set refresh token expiry (default: 30 days)
   - Balance security vs user experience

5. **Allowed Redirect URLs**:
   - Go to **Authentication** → **URL Configuration**
   - Only whitelist your production domain(s)
   - Remove `localhost` URLs in production

#### 3. Database Security

**Verify these settings before launch:**

1. **Check RLS is enabled** on all tables:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```
   All tables should show `rowsecurity = true`

2. **Review RLS policies**:
   - Go to **Database** → **Policies**
   - Verify policies match your security requirements
   - Test with multiple user accounts

3. **Backup Strategy**:
   - Supabase Free tier: Daily backups (7-day retention)
   - Pro tier: Point-in-time recovery
   - Set up regular backups for critical data

#### 4. API Security

**All API routes in this template:**
- ✅ Verify authentication before processing
- ✅ Validate user permissions (role checks)
- ✅ Use parameterized queries (prevents SQL injection)
- ✅ Return appropriate error codes (don't leak sensitive info)

**Example secure API route pattern:**
```typescript
// Verify authentication
const user = await getUser();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

// Verify authorization (role check)
const profile = await getUserProfile(user.id);
if (profile.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

// Process request...
```

#### 5. Monitoring and Logging

**Set up monitoring for:**
- Failed login attempts (potential brute force)
- API error rates
- Database query performance
- Failed RLS policy checks

**Use Supabase Dashboard:**
- **Logs** → View recent queries and errors
- **Reports** → Monitor API usage and performance

#### 6. Deployment Checklist

Before deploying to production:

- [ ] Re-enable email confirmation in Supabase
- [ ] Configure custom SMTP for reliable email delivery
- [ ] Set up custom domain and update Site URL
- [ ] Update redirect URLs (remove localhost)
- [ ] Set all environment variables in hosting platform
- [ ] Enable rate limiting on auth endpoints
- [ ] Test RLS policies with multiple test users
- [ ] Verify service role key is only used server-side
- [ ] Set up database backups
- [ ] Configure monitoring/alerting
- [ ] Test all CRUD operations in production environment
- [ ] Test role-based access control (admin vs user)
- [ ] Verify 2FA is working if enabled

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

### Common Setup Issues

#### 1. "Failed to fetch" or CORS errors

**Problem**: Getting CORS errors when trying to connect to Supabase

**Solutions**:
- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct (should end with `.supabase.co`)
- Make sure you're using the correct anon key (not the service role key for client-side)
- Check that your Supabase project is not paused (happens after inactivity on free tier)
- Clear browser cache and restart dev server

#### 2. Database Migrations Failed

**Problem**: Error running migrations or migrations not applying correctly

**Solutions**:
- **Check migration order**: Migrations must run in order (by timestamp in filename)
- **Check for existing tables**: If tables already exist, migrations will fail. Either:
  - Drop existing tables in SQL Editor: `DROP TABLE IF EXISTS users, organizations, invitations CASCADE;`
  - Or skip migrations if structure is already correct
- **Check syntax errors**: Copy migration SQL and run in SQL Editor to see detailed errors
- **Service role key**: If using Supabase CLI, verify project is linked correctly

#### 3. Can't Login After Signup

**Problem**: User created in Supabase Auth but can't login or gets redirected to onboarding repeatedly

**Solutions**:
- **Profile not created**: Check if user exists in `users` table (Table Editor → users)
- **If missing**: Go through onboarding flow at `/onboarding` to create profile
- **Check RLS policies**: Verify `users` table has correct RLS policies applied
- **Check organization**: Verify user has valid `organization_id` in users table

#### 4. "Row Level Security Policy Violation"

**Problem**: Getting RLS errors when trying to access data

**Solutions**:
- **Common cause**: User profile doesn't exist in `users` table
- **Fix**: Complete onboarding to create profile
- **Verify policies**: Go to Database → Policies and check policies are enabled
- **Test**: Run this in SQL Editor to verify:
  ```sql
  SELECT * FROM users WHERE id = auth.uid();
  ```
  Should return your user if logged in

#### 5. Email Not Sending

**Problem**: Not receiving invitation emails or password reset emails

**Solutions**:
- **Check email configuration**: See "Configure Email Settings" section above
- **Development mode**: Email confirmation might be disabled - check Auth → Providers → Email
- **Check spam folder**: Supabase default emails often go to spam
- **Use custom SMTP**: For reliable delivery, configure custom SMTP provider
- **Check Supabase logs**: Go to Logs → Auth Logs to see if emails are being sent
- **Check rate limits**: Supabase limits email sending to prevent abuse

#### 6. "Invalid JWT" or Session Errors

**Problem**: Getting logged out randomly or JWT errors

**Solutions**:
- **Check environment variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase project
- **Clear cookies**: Clear browser cookies and local storage
- **Check JWT expiry**: Go to Settings → Authentication in Supabase - JWT might be expired
- **Restart dev server**: After changing environment variables, restart `npm run dev`

#### 7. Can't Access Settings Page (Not Admin)

**Problem**: Redirected or blocked when trying to access `/app/settings`

**Solution**:
- **Check role**: Only admin users can access Settings
- **Verify in database**: Table Editor → users → check your role is 'admin'
- **First user is admin**: The first user who creates an organization is automatically admin
- **Change role**: Have another admin change your role, or update in database:
  ```sql
  UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
  ```

#### 8. Invitation Link Not Working

**Problem**: Clicking invitation link shows error or doesn't work

**Solutions**:
- **Check token**: Invitation token is in the URL - verify it's complete (not truncated)
- **Check expiration**: Invitations expire (default: 7 days). Check `invitations` table for `expires_at`
- **Check status**: Invitation might already be accepted. Check `status` column in `invitations` table
- **Resend invitation**: Admin can resend from Settings → Pending Invitations

#### 9. Build Errors / TypeScript Errors

**Problem**: Getting TypeScript or build errors

**Solutions**:
- **Install dependencies**: Run `npm install` to ensure all packages are installed
- **Clear cache**: Delete `.next` folder and rebuild:
  ```bash
  rm -rf .next
  npm run dev
  ```
- **Check Node version**: Requires Node.js 18+. Check with `node --version`
- **Type errors**: This template is TypeScript - check for type mismatches

#### 10. Database Connection Issues

**Problem**: Can't connect to Supabase database

**Solutions**:
- **Project paused**: Free tier projects pause after 1 week inactivity. Go to dashboard to unpause
- **Wrong credentials**: Double-check all three environment variables
- **Network issues**: Check your internet connection
- **Supabase status**: Check https://status.supabase.com for outages

### Getting More Help

If you're still stuck:

1. **Check Supabase Logs**:
   - Go to your Supabase Dashboard → **Logs**
   - Check Auth Logs, API Logs, and Database Logs for errors

2. **Review CLAUDE.md**:
   - Read `CLAUDE.md` for detailed architecture and development guidelines

3. **Supabase Documentation**:
   - [Supabase Docs](https://supabase.com/docs)
   - [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
   - [Authentication Docs](https://supabase.com/docs/guides/auth)

4. **Check Console Logs**:
   - Open browser Developer Tools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed API requests

5. **Open an Issue**:
   - If you found a bug, open an issue in the repository
   - Include error messages, browser console logs, and steps to reproduce

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
