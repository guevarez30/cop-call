# Tag Management Feature

## Purpose
Admin-only department-level tag management for categorizing police events. Tags are shared across the entire organization and used for event logging and filtering.

## User Roles
**Admins Only** - Can create, edit, archive, and delete tags
**Users** - Can view and select tags when logging events

## Key Pages & Components

### Main Component
- `/src/app/app/settings/components/tag-list.tsx` - Tag management interface
  - Located in Settings page → Department tab

### Shared Component
- `/src/components/tag-badge.tsx` - Tag display component (used across app)

## API Routes

### Tag Management
- `GET /api/tags/list` - List all active tags in organization
- `POST /api/tags` - Create new tag (admin only)
- `PATCH /api/tags/[id]` - Update tag name/description (admin only)
- `DELETE /api/tags/[id]` - Delete tag (admin only)

## Database Tables

### Tags Table (`tags`)
```sql
id: uuid (primary key)
organization_id: uuid (foreign key -> organizations)
name: text (tag name, e.g., "Traffic Stop")
description: text (optional explanation)
color: text (hex color code, e.g., "#3b82f6")
created_at: timestamptz
updated_at: timestamptz
```

### Event Tags Junction (`event_tags`)
```sql
id: uuid (primary key)
event_id: uuid (foreign key -> events)
tag_id: uuid (foreign key -> tags)

UNIQUE(event_id, tag_id)
```

**Purpose**: Many-to-many relationship between events and tags

### Key Relationships
```
organizations (1) -> (many) tags
tags (many) -> (many) events (through event_tags)
```

## Tag List Component

### Location
- Settings page → Department tab
- Full-width card layout
- Mobile-responsive

### Header
- Title: "Event Tags"
- Description: "Manage tags used to categorize events across your department"
- "Add Tag" button (primary CTA)

### Loading State
```
<Spinner />
Loading tags...
```

### Empty State
```
[Tag Icon]
No tags yet
Create tags to help officers categorize their events
```

### Tag List Display
Each tag card shows:
- **Tag Badge** - Colored pill with tag name
- **Description** - Optional explanation (muted text)
- **Usage Count** - "Used in X events" (future enhancement)
- **Actions** - Edit and delete icons

**Card Layout**:
```
[Colored Badge: Tag Name]
Description text here
                        [Edit Icon] [Delete Icon]
```

## Create Tag Dialog

### Fields
- **Tag Name** - Required, text input
- **Description** - Optional, textarea
- **Color** - Color picker (predefined palette)

### Validation
- Name required (min 1 character)
- Name uniqueness within organization
- Description max 500 characters
- Color must be valid hex code

### Predefined Color Palette
Common colors for quick selection:
- Blue: `#3b82f6` (primary)
- Red: `#ef4444` (warnings, violations)
- Green: `#22c55e` (positive interactions)
- Yellow: `#eab308` (cautions)
- Purple: `#a855f7` (administrative)
- Orange: `#f97316` (incidents)
- Gray: `#6b7280` (neutral)

### API Call
```typescript
POST /api/tags
Body: {
  name: string;
  description?: string;
  color: string;
}
```

### Success Flow
1. Dialog closes
2. Toast: "Tag created successfully"
3. Tag list refreshed
4. New tag immediately available for event logging

## Edit Tag Dialog

### Fields
Same as create:
- Tag Name (editable)
- Description (editable)
- Color (editable)

### Pre-populated Data
- Current tag name
- Current description
- Current color

### API Call
```typescript
PATCH /api/tags/[id]
Body: {
  name?: string;
  description?: string;
  color?: string;
}
```

### Update Behavior
- Tag name changes propagate to all existing events (via foreign key)
- Badge colors update immediately across app
- No history/audit of changes (future enhancement)

## Delete Tag Dialog

### Confirmation Message
```
Delete "[Tag Name]"?
Are you sure you want to delete this tag?
[If tag in use]: This tag is currently used in X events. Those events will no longer have this tag.
This action cannot be undone.
```

### API Call
```typescript
DELETE /api/tags/[id]
```

### Delete Behavior
- Removes tag from `tags` table
- CASCADE deletes all `event_tags` records (removes tag from events)
- Events remain, just lose this tag association
- Cannot be undone

### Restrictions
- Admin only
- Must confirm deletion
- Warning shown if tag in use

## Tag Badge Component

### Location
`/src/components/tag-badge.tsx`

### Usage
Used throughout the app:
- Event cards (dashboard)
- Event detail dialog
- Event history table
- Tag management list
- Event form (tag selector)

### Props
```typescript
interface TagBadgeProps {
  tag: {
    id: string;
    name: string;
    color: string;
  };
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void; // Optional remove handler
}
```

### Sizes
- **sm**: Compact (history table, overflow indicators)
- **md**: Standard (event cards, detail dialog)
- **lg**: Large (tag management, prominence)

### Visual Design
- Background: `tag.color` with opacity
- Text: Same color, darker shade
- Border: Same color
- Rounded pill shape
- Padding: Responsive to size
- Optional X icon for removal (in event form)

### Example Usage
```typescript
<TagBadge tag={tag} size="md" />
<TagBadge tag={tag} size="sm" onRemove={() => removeTag(tag.id)} />
```

## Tag Selection in Event Form

### Multi-Select Interface
- Dropdown with checkboxes
- Search/filter by tag name
- Selected tags shown as badges above dropdown
- Click badge to remove selection

### Implementation
- Uses shadcn `<Popover>` + `<Checkbox>` components
- Tags loaded via `GET /api/tags/list`
- Selection stored as array of tag IDs
- Submits tag IDs to event API

### Visual Feedback
- Selected: Checkbox checked + badge displayed
- Unselected: Checkbox unchecked
- Badge click removes tag from selection

## Tag Organization Patterns

### Common Tag Categories
Law enforcement departments typically use tags like:

**Incident Types**:
- Traffic Stop
- Arrest
- Warrant
- Disturbance
- Welfare Check

**Interaction Types**:
- Community Interaction
- Citizen Contact
- Business Check
- School Visit

**Severity/Classification**:
- Felony
- Misdemeanor
- Citation
- Warning

**Use of Force**:
- Verbal Commands
- Physical Control
- Less Lethal

**Report Types**:
- Incident Report
- Accident Report

### Combining Tags
Officers can apply multiple tags to one event:
- Example: "Traffic Stop" + "Arrest" + "Felony"
- Example: "Welfare Check" + "Use of Force" + "Incident Report"

## RLS Policies

### Tags Table
**SELECT**: All users in organization can view tags
**INSERT**: Admins only
**UPDATE**: Admins only
**DELETE**: Admins only

### Tag Security
- organization_id automatically filtered
- Users cannot see tags from other organizations
- Tag IDs validated against user's organization on event creation

## Tag Usage Analytics (Future)

### Potential Metrics
- Most used tags
- Tag usage trends over time
- Tags never used (candidates for deletion)
- Tag combinations (which tags often paired)

### Implementation Notes
- Requires COUNT query on `event_tags` table
- Could be expensive for large datasets
- Consider caching or periodic calculation

## Performance Considerations

### Tag Loading
- Tags loaded once per session
- Cached in component state
- Re-fetched only on CRUD operations
- Small dataset (typically < 100 tags)

### Tag Filtering
- Client-side search in tag selector
- Server-side filtering in event history
- Indexed on `organization_id`

## Mobile Optimizations

### Tag List
- Cards stack vertically
- Full-width on mobile
- Large touch targets for edit/delete (44x44px)

### Tag Selector (Event Form)
- Full-screen popover on mobile
- Large touch targets for checkboxes
- Search input at top
- Scrollable tag list

### Tag Badges
- Responsive font sizes
- Touch-friendly removal (if enabled)
- Wrap to multiple lines if needed

## Common Use Cases

### Admin Creates Department Tags (Initial Setup)
1. Navigate to Settings → Department tab
2. Click "Add Tag" for each category
3. Create tags like:
   - Traffic Stop (blue)
   - Arrest (red)
   - Community Interaction (green)
   - Welfare Check (yellow)
4. Tags immediately available for officers

### Admin Renames Tag (Typo Fix)
1. Navigate to Settings → Department tab
2. Find tag in list
3. Click edit icon
4. Update name: "Comunity" → "Community"
5. Save changes
6. Tag name updated on all existing events

### Admin Deletes Unused Tag
1. Navigate to Settings → Department tab
2. Find tag in list (e.g., "Test Tag")
3. Click delete icon
4. Confirm deletion
5. Tag removed from system

### Officer Selects Tags for Event
1. Open event form
2. Click tag selector dropdown
3. Check multiple tags:
   - ☑ Traffic Stop
   - ☑ Citation
   - ☐ Arrest (not applicable)
4. Badges appear above selector
5. Submit event with selected tags

## Tag Naming Conventions

### Best Practices
- Use title case: "Traffic Stop" not "traffic stop"
- Be specific: "DUI Arrest" not "Arrest DUI"
- Avoid abbreviations unless universal: "DUI" OK, "TS" not clear
- Keep concise: "Business Check" not "Checking on Local Businesses"
- Consistent tense: "Traffic Stop" not "Stopped for Traffic"

### Anti-Patterns
- Too many tags (overwhelms officers)
- Overlapping tags ("Arrest" + "Arrested Person")
- Unclear tags ("Miscellaneous", "Other")
- Location-specific tags (use separate location field)

## Error Handling

### Duplicate Tag Names
- Server validation prevents duplicate names
- Toast error: "A tag with this name already exists"
- User must choose different name

### Delete Tag in Use
- Warning shown with usage count
- User must confirm
- Events updated automatically (tag removed)

### API Errors
- Toast notification with error message
- Dialog remains open on error
- User can retry

## Testing Checklist
- [ ] Admin can create tag
- [ ] Admin can edit tag name
- [ ] Admin can edit tag description
- [ ] Admin can change tag color
- [ ] Admin can delete tag
- [ ] Delete removes tag from existing events
- [ ] Duplicate tag name prevented
- [ ] Officer can select tags in event form
- [ ] Selected tags appear in event detail
- [ ] Tags filtered in history page
- [ ] Non-admin cannot access tag management
- [ ] Mobile responsive layout

## Related Features
- **Event Logging** - Tag selection when creating events
- **Event History** - Tag filtering
- **Organization Settings** - Department tab location
- **Multi-tenant** - Organization-scoped tags
