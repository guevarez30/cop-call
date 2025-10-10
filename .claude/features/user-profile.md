# User Profile Feature

## Purpose
Personal profile management allowing users to update their information, manage security settings (password, MFA), and customize preferences (theme).

## User Roles
**All Users** - Full access to their own profile settings

## Key Pages & Components

### Main Page
- `/src/app/app/profile/page.tsx` - User profile page

### Dialogs & Components
- `/src/app/app/profile/components/password-change-dialog.tsx` - Change password
- `/src/app/app/profile/components/mfa-setup-dialog.tsx` - Enable two-factor authentication
- `/src/app/app/profile/components/mfa-disable-dialog.tsx` - Disable two-factor authentication

### Context Providers
- `/src/lib/user-profile-context.tsx` - Global profile state management
- `/src/lib/theme-context.tsx` - Theme state and persistence

## API Routes

### Profile Management
- `GET /api/profile` - Get current user's profile
- `PATCH /api/profile` - Update profile fields
  - Updatable fields: `full_name`, `badge_no`, `theme`
  - Non-updatable: `email`, `role`, `organization_id`

### Organization Info
- Profile includes nested organization data via JOIN
- Organization name displayed as read-only

## Database Tables

### Users Table (`users`)
```sql
id: uuid (primary key, references auth.users)
organization_id: uuid (foreign key -> organizations)
email: text
full_name: text
role: text ('admin' | 'user')
badge_no: text (nullable)
theme: text ('light' | 'dark', default: 'light')
created_at: timestamptz
updated_at: timestamptz
```

### Auth Users (`auth.users`)
- Managed by Supabase Auth
- Contains: email, encrypted password, MFA factors
- Referenced by `users.id`

## Profile Page Sections

### 1. Profile Header Card
**Information Displayed**:
- Avatar (with initials fallback)
- Full name (editable inline)
- Role badge (Admin or User)

**Inline Editing**:
- Click pencil icon to edit name
- Inline input with save/cancel buttons
- Updates via `PATCH /api/profile`
- Optimistic UI update via context

**UI Pattern**:
```
[Avatar] [Full Name] [Edit Icon]
         [Role Badge: Admin/User]
```

### 2. Contact Information Card
**Fields**:
- **Email** - Read-only (managed via Supabase Auth)
- **Badge Number** - Editable inline (optional field)

**Badge Number Editing**:
- Click pencil icon to edit
- Inline input with save/cancel
- Can be cleared (set to null)
- Updates via `PATCH /api/profile`

### 3. Account Details Card
**Read-Only Information**:
- **Organization** - Organization name (from joined table)
- **Member Since** - Formatted join date (e.g., "September 2025")
- **Status** - Active indicator (green dot)

**Purpose**: Display account metadata, no actions

### 4. Security Card
**Password Management**:
- "Change" button opens password change dialog
- Dialog prompts for new password
- Uses Supabase Auth `updateUser()` API
- Requires re-authentication for security

**Two-Factor Authentication (MFA)**:
- Shows current status: Enabled (green) or Not enabled
- "Enable" button → Opens MFA setup dialog
- "Disable" button → Opens MFA disable dialog
- Uses Supabase Auth MFA APIs (TOTP)

### 5. Preferences Card
**Theme Selection**:
- Current theme indicator (sun/moon icon)
- Light/Dark theme toggle buttons
- Updates immediately in UI
- Persists to database via `PATCH /api/profile`
- Synced across devices

**Email Notifications** (Placeholder):
- "Configure" button (not yet implemented)
- Future: Email notification preferences

### 6. Danger Zone Card
**Delete Account** (Placeholder):
- "Delete" button (not yet implemented)
- Future: Account deletion with confirmation
- Border highlighted in destructive red

## User Profile Context

### Context Provider (`UserProfileContext`)
Location: `/src/lib/user-profile-context.tsx`

**State**:
```typescript
{
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
```

**Methods**:
- `refreshProfile()` - Refetch profile from API
- `updateProfile(updates)` - Update profile fields

**Usage**:
```typescript
const { profile, loading, updateProfile } = useUserProfile();
```

**Automatic Fetching**:
- Fetches on mount
- Provides global profile access
- Caches profile data to reduce API calls

### Theme Context (`ThemeContext`)
Location: `/src/lib/theme-context.tsx`

**State**:
- `theme: 'light' | 'dark'`
- `setTheme(newTheme)` - Update theme

**Behavior**:
- Applies theme class to document root
- Persists to user profile table
- Loads from profile on app init
- Falls back to 'light' if not set

## Password Change Flow

### PasswordChangeDialog Component
**Fields**:
- Current password (optional, for validation)
- New password
- Confirm new password

**Validation**:
- New password minimum length (6+ chars recommended)
- Passwords must match
- Shows error if passwords don't match

**API Call**:
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

**Success**:
- Toast notification: "Password updated successfully"
- Dialog closes automatically
- No logout required

## MFA (Two-Factor Authentication)

### MFA Setup Flow
**Component**: `MfaSetupDialog`

**Steps**:
1. User clicks "Enable" on profile page
2. Dialog opens, calls `supabase.auth.mfa.enroll()`
3. Server returns QR code + secret
4. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
5. User enters 6-digit verification code
6. Call `supabase.auth.mfa.verify()` with code
7. MFA factor marked as verified
8. Success toast + refresh MFA status

**Dialog UI**:
- QR code display
- Manual secret key (for copy/paste)
- Verification code input
- "Verify" button
- Cancel option

### MFA Disable Flow
**Component**: `MfaDisableDialog`

**Security**:
- Requires current TOTP code to disable
- Prevents unauthorized MFA removal

**Steps**:
1. User clicks "Disable" on profile page
2. Dialog prompts for current 6-digit code
3. Call `supabase.auth.mfa.unenroll()` with factor ID and code
4. MFA factor removed
5. Success toast + refresh MFA status

### MFA Login Integration
- Integrated in login page (`/src/app/(public)/login/page.tsx`)
- After password verification, checks for MFA
- If enabled, prompts for TOTP code
- Must verify code to complete login

### MFA Status Check
On profile page mount:
```typescript
const { data } = await supabase.auth.mfa.listFactors();
const verifiedFactor = data?.totp?.find(f => f.status === 'verified');
```

## Inline Editing Pattern

### Full Name Edit
**UI States**:
- **View Mode**: Name + pencil icon
- **Edit Mode**: Input + save/cancel icons

**Interaction**:
1. Click pencil icon → switch to edit mode
2. Input auto-focused
3. Edit value
4. Click save (checkmark) → API call + update context
5. Click cancel (X) → revert and exit edit mode

**Validation**:
- Required field (cannot be empty)
- Save button disabled if empty
- Shows loading state during save

### Badge Number Edit
Same pattern as full name, but:
- Optional field (can be cleared)
- Saves `null` if left empty
- No minimum length requirement

## Avatar Display

### Avatar Component
Uses shadcn `<Avatar>` component:
- Circular profile image
- Fallback: User initials (first letter of each name part)
- Size: 64px on mobile, 80px on desktop
- Background: Primary color

**Initials Logic**:
```typescript
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
```

## Date Formatting

### Member Since Display
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};
```

Output: "September 2025"

## Theme Management

### Theme Application
- Theme class applied to `<html>` element
- Tailwind dark mode uses `class` strategy
- CSS variables defined for light/dark modes
- Smooth transition between themes

### Theme Persistence
- Stored in `users.theme` column
- Loaded on app initialization
- Updated via `PATCH /api/profile`
- Immediately reflected in UI

### Theme Values
- `light` - Default theme
- `dark` - Dark mode theme

## RLS Policies

### Profile Access
**SELECT**: Users can view their own profile
**UPDATE**: Users can update own profile (except `role`, `organization_id`, `email`)

### Protected Fields
- `email` - Cannot be changed (use Supabase Auth email management)
- `role` - Can only be changed by admins via settings page
- `organization_id` - Cannot be changed (permanent assignment)

## Mobile Optimizations

### Touch Targets
- All buttons: `h-11` minimum (44px)
- Edit icons: `h-11 w-11` (44x44px)
- Input fields: `h-11` minimum

### Layout
- Cards stack vertically
- Full-width on mobile
- Responsive max-width: `max-w-4xl`
- Padding adjusts for mobile

### Responsive Patterns
- Buttons full-width on mobile, auto-width on desktop
- Text wraps with `break-words` on long emails
- Icons + text on desktop, icons only on mobile (where appropriate)

## Error Handling

### API Errors
- Show toast notification with error message
- Revert UI on failure (optimistic updates)
- Log errors to console for debugging

### Validation Errors
- Inline validation feedback
- Disabled buttons for invalid states
- Clear error messages

## Loading States

### Initial Page Load
```typescript
if (loading) {
  return <Spinner />;
}
```

### Save Operations
- Button shows loading spinner
- Inputs disabled during save
- Success/error toast after completion

## Common Use Cases

### Officer Updates Badge Number
1. Navigate to profile page
2. Click pencil icon next to badge number
3. Enter badge number
4. Click save
5. Badge number updated immediately

### Officer Enables MFA
1. Navigate to profile page
2. Scroll to Security section
3. Click "Enable" next to Two-Factor Authentication
4. Scan QR code with authenticator app
5. Enter verification code
6. MFA enabled successfully

### Officer Changes Theme
1. Navigate to profile page
2. Scroll to Preferences section
3. Click "Dark" button
4. Theme changes immediately
5. Preference saved to database

### Officer Changes Password
1. Navigate to profile page
2. Click "Change" button in Security section
3. Enter new password (and confirm)
4. Click save
5. Password updated, toast notification shown

## Testing Checklist
- [ ] View profile page
- [ ] Edit full name inline
- [ ] Edit badge number inline
- [ ] Clear badge number (set to null)
- [ ] Change password successfully
- [ ] Enable MFA and verify
- [ ] Disable MFA with code
- [ ] Switch theme light → dark
- [ ] Switch theme dark → light
- [ ] Theme persists on page reload
- [ ] Mobile responsive layout
- [ ] Error handling on failed updates

## Related Features
- **Authentication** - Password management, MFA
- **Organization Settings** - Organization details displayed
- **Theme System** - Global theme application
- **Multi-tenant** - User roles and organization membership
