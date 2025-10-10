# Event Logging Feature

## Purpose
Core feature allowing police officers to log daily activities in real-time with draft/submit workflows, photo attachments, multi-select tags, and time tracking.

## User Roles
**Officers (Users)** - Can create, edit own drafts, view own submitted events
**Admins** - Can view all events, edit/delete any event (including submitted)

## Key Pages & Components

### Main Dashboard Pages
- `/src/app/app/page.tsx` - Main dashboard
  - **AdminDashboard** component - Department-wide event feed
  - **UserDashboard** component - Personal event view

### Event Components
- `/src/app/app/components/event-form.tsx` - Create/edit event dialog
- `/src/app/app/components/event-card.tsx` - Event summary card
- `/src/app/app/components/event-detail-dialog.tsx` - Full event view dialog
- `/src/app/app/components/delete-event-dialog.tsx` - Delete confirmation dialog

## API Routes

### Event CRUD
- `GET /api/events` - List events (filtered by role and query params)
  - Officers: Only their own events
  - Admins: All events in organization
  - Query params: `status`, `officer_ids`, `start_date`, `end_date`, `tag_ids`, `page`, `limit`

- `POST /api/events` - Create new event
  - Auto-populates: officer_id, organization_id, officer_name
  - Required: start_time, end_time, notes
  - Optional: tags (array of tag IDs)

- `PATCH /api/events/[id]` - Update event
  - Officers: Can only update own drafts
  - Admins: Can update any event
  - Fields: start_time, end_time, notes, tags, status

- `DELETE /api/events/[id]` - Delete event
  - Officers: Cannot delete
  - Admins: Can delete any event

- `POST /api/events/bulk-delete` - Bulk delete events (admin only)
  - Body: `{ event_ids: string[] }`

## Database Tables

### Events Table (`events`)
```sql
id: uuid (primary key)
organization_id: uuid (foreign key -> organizations)
officer_id: uuid (foreign key -> users)
officer_name: text (denormalized for performance)
start_time: timestamptz (when event started)
end_time: timestamptz (when event ended)
notes: text (event description)
status: text ('draft' | 'submitted')
created_at: timestamptz
updated_at: timestamptz
```

### Event Tags Junction Table (`event_tags`)
```sql
id: uuid (primary key)
event_id: uuid (foreign key -> events)
tag_id: uuid (foreign key -> tags)
created_at: timestamptz

UNIQUE constraint on (event_id, tag_id)
```

### Key Relationships
```
organizations (1) -> (many) events
users (1) -> (many) events (as officer)
events (many) -> (many) tags (through event_tags)
```

## Event Workflow

### Creating an Event (Officer/Admin)
1. Click "Log New Event" button on dashboard
2. Event form dialog opens (`EventForm` component)
3. Officer info auto-populated from profile
4. User provides:
   - **Start time** (defaults to now, can adjust)
   - **End time** (required)
   - **Tags** (multi-select from department tags)
   - **Notes** (required text description)
5. User saves:
   - **Save as Draft** → status = 'draft', remains editable
   - **Submit** → status = 'submitted', locked from officer editing

### Editing an Event
**Officers**:
- Can only edit their own drafts
- Click event card → opens detail dialog → click "Edit" → opens form
- Cannot edit submitted events

**Admins**:
- Can edit any event (draft or submitted)
- Same UI flow as officers
- Can change status, time, tags, notes

### Deleting an Event
**Officers**: Cannot delete any events

**Admins**:
- **Single delete**: Click trash icon in event detail dialog
- **Bulk delete**: Select multiple in history view → "Delete Selected" button
- Confirmation dialog shows before deletion

### Viewing Events
**Officers Dashboard (`/app`)**:
- Shows today's events only
- Sections:
  - Drafts (editable, yellow indicator)
  - Today's submitted events (read-only)
- Empty state: "No events logged today. Tap 'Log New Event' to get started."

**Admin Dashboard (`/app`)**:
- Shows all department events for today
- Can see all officers' drafts and submitted events
- Officer name displayed on each event card
- Can edit/delete any event

## Event Display Components

### EventCard
Displays event summary:
- Time duration (e.g., "2:30 PM - 3:15 PM", "45 min")
- Tags (badge pills, max 2 visible + "+N more" indicator)
- Notes preview (truncated to ~80 chars)
- Status indicator (draft badge)
- Officer name (admin view only)

### EventDetailDialog
Full event view:
- Complete time range and duration
- All tags (full list)
- Complete notes (no truncation)
- Officer info (admin view)
- Action buttons:
  - Edit (if draft and own event, or admin)
  - Delete (admin only)
  - Close

### EventForm
Create/edit dialog:
- Mobile-optimized inputs
- Time pickers (start/end)
- Tag multi-select (loads from `/api/tags/list`)
- Notes textarea
- Save as Draft / Submit buttons
- Cancel button

## RLS Policies

### Events Table
**SELECT**:
- Officers: Can view their own events
- Admins: Can view all events in their organization

**INSERT**:
- All authenticated users can create events
- organization_id must match user's organization
- officer_id must match authenticated user

**UPDATE**:
- Officers: Can only update own drafts (`status = 'draft' AND officer_id = auth.uid()`)
- Admins: Can update any event in their organization

**DELETE**:
- Admins only: Can delete any event in their organization

### Event Tags Junction Table
- Inherits permissions from events table
- Can modify tags on any event they can update

## Time Tracking

### Start Time
- Auto-captured when "Log New Event" is clicked
- Can be manually adjusted (officers may start logging after event begins)
- Stored as `timestamptz` in UTC

### End Time
- Required field
- Defaults to current time
- Can be set to future (for ongoing events)
- Must be after start time

### Duration Calculation
- Calculated in UI: `end_time - start_time`
- Displayed in human-readable format: "45 min", "2h 15m"
- Helper: `getEventDuration()` and `formatDuration()` in `/src/lib/mock-data.ts`

## Tags Integration

### Multi-Select Tags
- Officers select from department-managed tags
- Tags loaded via `GET /api/tags/list`
- Can select 0 to many tags
- Examples: "Traffic Stop" + "Arrest" + "Felony"

### Tag Display
- Event cards show max 2 tags + "+N more"
- Detail dialog shows all tags
- Tags are colored badge pills
- Tag component: `<TagBadge>` from `/src/components/tag-badge.tsx`

## Key Data Patterns

### Denormalized Officer Name
- `officer_name` stored on events table for performance
- Avoids JOIN on users table for list views
- Updated when user changes their name (via trigger or manual sync)

### Status States
- `draft` - Editable by officer, yellow indicator
- `submitted` - Locked from officer editing, admins can still edit

### Today's Events Filter
- `getTodaysEvents()` helper filters by date
- Uses local timezone for "today" calculation
- Only shows events where `start_time` is today

## Mobile Optimizations

### Touch Targets
- "Log New Event" button: `h-14` (56px) on mobile
- All form inputs: `h-11` minimum (44px)
- Time pickers: Native mobile date/time inputs
- Tag selector: Large touch targets for pills

### Form UX
- Auto-focus on notes field
- Minimal required fields (start, end, notes)
- Quick save: Draft vs Submit buttons
- Cancel confirmation if unsaved changes

### Photo Attachments (Future)
- Not yet implemented in current codebase
- Planned: Camera capture + upload
- Unlimited photos per event

## Performance Considerations

### Pagination
- Events API supports `page` and `limit` params
- Default: 50 events per page
- Returns `pagination` metadata with total count

### Filtering
- All filters handled server-side
- Indexes on: organization_id, officer_id, status, start_time
- Tag filtering uses JOIN on event_tags table

### Real-time Updates
- No websockets currently
- Manual refresh required
- Future: Supabase Realtime subscriptions

## Common Use Cases

### Quick Event Log (30 seconds)
1. Tap "Log New Event"
2. Adjust start/end time (defaults to now)
3. Select 1-2 tags
4. Type brief notes
5. Tap "Submit"

### Draft Event (Work in Progress)
1. Start event during incident
2. Log basic info, save as draft
3. Continue patrol
4. Return later to add details
5. Submit when complete

### Admin Review
1. View department feed
2. See all officers' submitted events
3. Click event to view details
4. Edit if needed (fix typos, adjust times, add tags)
5. Delete if duplicate or test event

## Testing Checklist
- [ ] Create event as officer
- [ ] Save as draft, edit draft, submit draft
- [ ] Create event as admin
- [ ] Admin can view all department events
- [ ] Officer can only see their own events
- [ ] Edit submitted event as admin
- [ ] Delete event as admin
- [ ] Bulk delete as admin
- [ ] Tags display correctly
- [ ] Time duration calculated correctly
- [ ] Mobile form usability

## Related Features
- **Event History** - Historical search and filtering
- **Tag Management** - Department tag configuration
- **Multi-tenant System** - Organization and role-based access
- **User Profile** - Officer info and badge number
