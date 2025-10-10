# Authentication Feature

## Purpose
Complete authentication system including signup, login, password management, multi-factor authentication (MFA), and team invitation flows.

## User Roles
**All Users** - Can access signup, login, password reset, MFA setup
**Admins** - Can send invitations to new users

## Key Pages & Components

### Public Pages
- `/src/app/(public)/signup/page.tsx` - New user registration
- `/src/app/(public)/login/page.tsx` - User login with MFA support
- `/src/app/(public)/forgot-password/page.tsx` - Password reset request
- `/src/app/(public)/reset-password/page.tsx` - Password reset completion
- `/src/app/(public)/onboarding/page.tsx` - First-time user setup (name + org creation)
- `/src/app/(public)/accept-invite/[token]/page.tsx` - Invitation acceptance flow

### Profile Components
- `/src/app/app/profile/components/password-change-dialog.tsx` - Change password
- `/src/app/app/profile/components/mfa-setup-dialog.tsx` - Enable MFA
- `/src/app/app/profile/components/mfa-disable-dialog.tsx` - Disable MFA

### Settings Components
- `/src/app/app/settings/components/invite-user-dialog.tsx` - Invite new users (admin)

## API Routes

### Authentication
- `POST /api/auth/setup-profile` - Create organization + user profile on first login
- `GET /api/auth/check-profile` - Check if user has completed onboarding

### Invitations (Admin Only)
- `POST /api/invitations/send` - Send invitation email
- `GET /api/invitations/list` - List pending invitations
- `DELETE /api/invitations/[id]` - Revoke invitation
- `POST /api/invitations/resend/[id]` - Resend invitation email
- `GET /api/invitations/accept/[token]` - Validate invitation token

## Database Tables

### Core Tables
- `auth.users` - Supabase Auth users (managed by Supabase)
- `users` - Application user profiles
  - Links to Supabase Auth via `id`
  - Contains: full_name, email, role, organization_id, badge_no, theme
- `organizations` - Tenant organizations
- `invitations` - Pending user invitations
  - Contains: email, token, role, organization_id, invited_by, expires_at

### Key Relationships
```
auth.users (1) -> (1) users (application profile)
organizations (1) -> (many) users
organizations (1) -> (many) invitations
users (1) -> (many) invitations (invited_by)
```

## Authentication Flows

### Signup Flow
1. User visits `/signup` → provides email + password
2. Supabase creates auth user
3. User receives verification email (if enabled in Supabase settings)
4. User redirected to login

### Login Flow
1. User visits `/login` → provides email + password
2. If MFA enabled → prompts for TOTP code
3. On success → checks for user profile
4. If no profile → redirect to `/onboarding`
5. If profile exists → redirect to `/app`

### Onboarding Flow (First-Time Users)
1. After successful login without profile → redirect to `/onboarding`
2. User provides: full_name + organization_name
3. Calls `POST /api/auth/setup-profile` (uses service role)
4. Creates organization + user record
5. First user automatically assigned `admin` role
6. Redirect to `/app`

### Invitation Flow
1. **Admin sends invitation**:
   - Opens invite dialog (`/src/app/app/settings/components/invite-user-dialog.tsx`)
   - Provides: email + role (admin/user)
   - Calls `POST /api/invitations/send`
   - System creates invitation record + sends email with token

2. **User accepts invitation**:
   - Clicks link in email → redirects to `/accept-invite/[token]`
   - Token validated via `GET /api/invitations/accept/[token]`
   - If valid → shows signup form (email pre-filled, organization pre-selected)
   - User provides: password + full_name
   - Creates auth user + application profile
   - Invitation marked as accepted
   - Redirect to `/app`

### MFA Flow
1. **Setup**: User enables from profile page → scans QR code → verifies code
2. **Login**: After password → prompted for 6-digit code
3. **Disable**: Requires current TOTP code to disable

### Password Reset Flow
1. User visits `/forgot-password` → enters email
2. Supabase sends reset email
3. User clicks link → redirects to `/reset-password`
4. User sets new password → redirect to login

## Middleware & Protection

### Route Protection (`/src/middleware.ts`)
- Protected routes: `/app/*` (requires session)
- Public routes: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/accept-invite/*`
- Auth check via `getUser()` from Supabase session

## Security Patterns

### RLS Policies
- Users can only view/update their own profile
- Admins can view all users in their organization
- Organization ID automatically filtered on all queries
- **NO direct INSERT policies** - All user creation goes through service role endpoints

### Service Role Usage
- `POST /api/auth/setup-profile` - Bypasses RLS to create org + user
- `POST /api/invitations/send` - Creates invitation records
- Used for operations that require cross-table writes

## Key Dependencies
- **Supabase Auth** - Email/password authentication, MFA (TOTP)
- **Multi-tenant System** - Organizations and user roles
- **Email Service** - Invitation and password reset emails
- **Theme Context** - User preferences synced to database

## Implementation Notes

### Important Patterns
1. **Session Management**: Always get fresh session before API calls
2. **Service Role**: Only use in server-side API routes, never client-side
3. **Email Verification**: Can be disabled in dev, enable for production
4. **First User = Admin**: First user of organization gets admin role automatically
5. **Invitation Expiry**: 7 days default, can be customized

### Common Gotchas
- MFA factors must be verified before they're active
- Password reset requires valid session token in URL
- Invitations include organization_id - user is auto-assigned to org
- Profile creation requires service role (bypasses RLS)

### Testing Checklist
- [ ] Signup → Login flow
- [ ] Onboarding for first-time user
- [ ] Password reset flow
- [ ] MFA setup and login with MFA
- [ ] Invitation send and accept
- [ ] Invitation expiry handling
- [ ] Role-based access (admin vs user)

## Related Features
- **User Profile** - Profile management, MFA settings
- **Organization Settings** - Team management, invitations
- **Multi-tenant System** - Organization and role structure
