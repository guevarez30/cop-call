# Organization Settings Feature

## Purpose
Admin-only interface for managing organization details, team members, user roles, and pending invitations.

## User Roles
**Admins Only** - Full access to all settings
**Users** - See "Admin Access Required" message

## Key Pages & Components

### Main Page
- `/src/app/app/settings/page.tsx` - Server component for auth check
- `/src/app/app/settings/settings-client.tsx` - Client component with tabs

### Components
- `/src/app/app/settings/components/invite-user-dialog.tsx` - Send user invitations
- `/src/app/app/settings/components/remove-user-dialog.tsx` - Confirm user removal
- `/src/app/app/settings/components/tag-list.tsx` - Tag management (separate tab)

## API Routes

### User Management
- `GET /api/users/list` - List all users in organization (admin only)
- `PATCH /api/users/[id]/role` - Change user role (admin only)
- `DELETE /api/users/[id]` - Remove user from organization (admin only)

### Invitation Management
- `GET /api/invitations/list` - List pending invitations (admin only)
- `POST /api/invitations/send` - Send new invitation (admin only)
- `POST /api/invitations/resend/[id]` - Resend invitation email (admin only)
- `DELETE /api/invitations/[id]` - Revoke invitation (admin only)

### Organization Management
- `PATCH /api/organizations` - Update organization details (admin only)

## Database Tables

### Users Table (`users`)
- Lists all users in organization
- Shows: full_name, email, role, created_at
- Admin can modify roles and remove users

### Invitations Table (`invitations`)
```sql
id: uuid (primary key)
organization_id: uuid (foreign key -> organizations)
email: text
token: uuid (unique)
role: text ('admin' | 'user')
invited_by: uuid (foreign key -> users)
expires_at: timestamptz
created_at: timestamptz
```

### Organizations Table (`organizations`)
```sql
id: uuid (primary key)
name: text
created_at: timestamptz
updated_at: timestamptz
```

## Settings Page Layout

### Access Control
**Server-Side Check**:
```typescript
const { profile } = await requireAuth();
if (profile.role !== 'admin') {
  // Show unauthorized message
}
```

**Unauthorized UI**:
```
[Alert Icon]
Admin Access Required
You need administrator privileges to access organization settings.
```

### Tab Navigation
**Tabs**:
1. **Team** - User management and invitations
2. **Department** - Tag management (see tag-management.md)

**Default Tab**: Team

## Team Tab

### 1. Team Members Card

**Header**:
- Title: "Team Members"
- "Invite User" button (primary CTA)
- Description: "Manage users and their permissions in your organization"

**Loading State**:
- Centered spinner while fetching users

**Empty State**:
```
[Users Icon]
No team members to display
Invite users to get started
```

**User List**:
Each user card shows:
- Full name (bold)
- Admin badge (if role = 'admin')
- "You" badge (if current user)
- Email (muted text)
- Join date (hidden on mobile)
- Actions dropdown (three-dot menu)

**User Actions Dropdown**:
- **For Users (role = 'user')**:
  - "Promote to Admin" (if not self)
  - "Remove User" (if not self, destructive)

- **For Admins (role = 'admin')**:
  - "Demote to User" (disabled if last admin)
  - Cannot remove admins (must demote first)

**Role Change Restrictions**:
- Cannot change own role
- Cannot demote last admin (prevents lockout)
- Loading state shown during role change

**User Card Layout**:
```
[Name] [Admin Badge] [You Badge]
[Email]
                            [Join Date] [Menu]
```

### 2. Pending Invitations Card

**Header**:
- Title: "Pending Invitations"
- Description: "Users who have been invited but haven't joined yet"

**Loading State**:
- Centered spinner while fetching invitations

**Empty State**:
```
[Mail Icon]
No pending invitations
Invite users to collaborate with your team
```

**Invitation List**:
Each invitation card shows:
- Email (bold)
- Admin badge (if role = 'admin')
- Invited by + expiry info: "Invited by [Name] · Expires in X days"
- Resend button (circular icon)
- Revoke button (trash icon, circular)

**Invitation Actions**:
- **Resend**: Sends new invitation email with same token
- **Revoke**: Deletes invitation, token becomes invalid

**Expiry Calculation**:
```typescript
const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
```

### 3. Organization Details Card

**Header**:
- Title: "Organization Details"
- Description: "Manage your organization's information"

**Fields**:
- **Organization Name**:
  - Editable inline (same pattern as profile editing)
  - Click pencil → input + save/cancel buttons
  - Updates via `PATCH /api/organizations`
  - Auto-refreshes profile context after save

- **Plan** (Placeholder):
  - Display: "Free Plan"
  - "Upgrade" button (not yet implemented)

## Invite User Dialog

### Component
Location: `/src/app/app/settings/components/invite-user-dialog.tsx`

**Fields**:
- **Email** - Required, validated
- **Role** - Dropdown: "User" or "Admin"

**Validation**:
- Email format validation
- Check if user already exists in organization
- Check if invitation already sent to this email

**API Call**:
```typescript
POST /api/invitations/send
Body: { email, role }
```

**Flow**:
1. Admin clicks "Invite User" button
2. Dialog opens with form
3. Admin enters email and selects role
4. Click "Send Invitation"
5. API creates invitation record
6. Email sent with invitation link
7. Success toast + dialog closes + refresh invitations list

**Email Content**:
- Contains invitation link: `/accept-invite/[token]`
- Includes organization name
- Expires in 7 days (default)

## Remove User Dialog

### Component
Location: `/src/app/app/settings/components/remove-user-dialog.tsx`

**Props**:
- `userName: string` - User's full name
- `userEmail: string` - User's email
- `onConfirm: () => Promise<void>` - Confirmation callback

**Confirmation Message**:
```
Remove [User Name]?
Are you sure you want to remove [user@email.com] from your organization?
This action cannot be undone.
```

**Actions**:
- Cancel (ghost button)
- Remove (destructive button)

**Flow**:
1. Admin clicks "Remove User" in dropdown
2. Dialog opens with user info
3. Admin confirms
4. Calls `DELETE /api/users/[id]`
5. Success toast + dialog closes + refresh user list

**Backend Behavior**:
- Deletes user record from `users` table
- Cascade deletes: user's events, invitations they sent
- Does NOT delete Supabase Auth user (orphaned)
- User can no longer login to this organization

## Role Management

### Promote to Admin
**Requirements**:
- Must be current admin
- Cannot promote self
- Target must be 'user' role

**API Call**:
```typescript
PATCH /api/users/[id]/role
Body: { role: 'admin' }
```

**Effect**:
- User gains admin privileges
- Can access settings page
- Can view all department events
- Can edit/delete any events

**UI Feedback**:
- Toast: "User promoted to Admin successfully"
- User card updates with admin badge

### Demote to User
**Requirements**:
- Must be current admin
- Cannot demote self
- Cannot demote last admin (prevents lockout)

**Last Admin Check**:
```typescript
const adminCount = users.filter(u => u.role === 'admin').length;
const isLastAdmin = user.role === 'admin' && adminCount === 1;
```

**API Call**:
```typescript
PATCH /api/users/[id]/role
Body: { role: 'user' }
```

**Effect**:
- User loses admin privileges
- Cannot access settings page
- Can only see own events
- Cannot edit/delete others' events

**UI Feedback**:
- Toast: "User demoted to User successfully"
- Admin badge removed from user card

## Organization Name Editing

### Inline Edit Pattern
Same as profile page:
1. Click pencil icon
2. Input appears with current name
3. Edit value
4. Click save (checkmark)
5. API call: `PATCH /api/organizations`
6. Refresh user profile context (contains org name)
7. Name updated across app

**Validation**:
- Required field
- Min length: 1 character
- Max length: 255 characters

**API Endpoint**:
```typescript
PATCH /api/organizations
Body: { name: string }
```

**RLS**:
- Only admins can update organization
- Can only update own organization

## Invitation Expiry

### Default Expiry
- 7 days from creation
- Configurable in `/api/invitations/send`

### Expiry Display
- Shows days remaining: "Expires in 5 days"
- Red warning if < 2 days
- Expired invitations auto-filtered from list (future enhancement)

### Expired Invitations
- Token validation fails on accept
- User sees "Invitation expired" message
- Admin must resend invitation

## Loading States

### User List Loading
```
<Spinner className="animate-spin" />
```

### Invitation List Loading
Same spinner pattern

### Role Change Loading
- Spinner replaces dropdown menu icon
- Dropdown disabled during change

### Organization Name Save Loading
- Save button shows spinner
- Input disabled during save

## Error Handling

### API Errors
- Toast notification with error message
- Dialog remains open on error
- User can retry

### Validation Errors
- Inline error messages
- Disabled submit buttons
- Clear error text

## Common Use Cases

### Admin Invites New Officer
1. Navigate to settings page
2. Click "Invite User" button
3. Enter officer's email
4. Select role: "User"
5. Click "Send Invitation"
6. Officer receives email
7. Officer accepts invitation and creates account

### Admin Promotes User to Admin
1. Navigate to settings page
2. Find user in team members list
3. Click three-dot menu
4. Click "Promote to Admin"
5. User immediately gains admin access
6. Admin badge appears on user card

### Admin Removes Former Employee
1. Navigate to settings page
2. Find user in team members list
3. Click three-dot menu
4. Click "Remove User"
5. Confirm removal in dialog
6. User removed from organization
7. User can no longer login

### Admin Resends Expired Invitation
1. Navigate to settings page
2. Go to Pending Invitations section
3. Find invitation
4. Click resend icon
5. New email sent with same token
6. Expiry date updated

### Admin Revokes Invitation
1. Navigate to settings page
2. Go to Pending Invitations section
3. Find invitation
4. Click trash icon
5. Invitation deleted
6. Token becomes invalid

## Mobile Responsive Patterns

### User Cards
- Stack vertically on mobile
- Join date hidden on small screens
- Actions dropdown remains visible
- Full-width layout

### Buttons
- "Invite User" button full-width on mobile
- Dropdown menu buttons remain icon size (44x44px)

### Organization Name Edit
- Input full-width on mobile
- Save/cancel icons maintain touch target size

## Security Considerations

### Role Change Validation
- Server-side validation required
- Check admin status of requester
- Prevent last admin demotion
- Prevent self-role change

### User Removal Validation
- Must be admin to remove users
- Cannot remove admins (must demote first)
- Cascade deletes handled correctly

### Invitation Security
- Tokens are UUID (unguessable)
- Expiry enforced server-side
- Organization ID embedded in invitation

## Testing Checklist
- [ ] Non-admin sees unauthorized message
- [ ] Admin can view team members
- [ ] Admin can invite user
- [ ] Admin can resend invitation
- [ ] Admin can revoke invitation
- [ ] Admin can promote user to admin
- [ ] Admin can demote admin to user
- [ ] Cannot demote last admin
- [ ] Cannot change own role
- [ ] Admin can remove user (non-admin only)
- [ ] Organization name editing works
- [ ] Mobile responsive layout
- [ ] Loading states display correctly

## Related Features
- **Authentication** - Invitation acceptance flow
- **User Profile** - Organization name displayed
- **Multi-tenant** - Organization and role structure
- **Tag Management** - Department tab in settings
