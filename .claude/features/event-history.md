# Event History Feature

## Purpose
Advanced search, filtering, and bulk operations for historical event data. Provides department-wide event analysis for admins and personal history for officers.

## User Roles
**Officers (Users)** - Can view their own submitted event history
**Admins** - Can view all department events, filter, bulk delete

## Key Pages & Components

### Main Page
- `/src/app/app/history/page.tsx` - Event history table view

### Components
- `/src/app/app/history/components/history-filters.tsx` - Filter controls
- `/src/app/app/components/event-detail-dialog.tsx` - Event detail view (shared)
- `/src/app/app/components/delete-event-dialog.tsx` - Delete confirmation (shared)

## API Routes

### Event Listing with Filters
- `GET /api/events` - Same endpoint as event-logging, with advanced query params

**Query Parameters**:
- `status` - Filter by status (default: "submitted" for history page)
- `officer_ids` - Comma-separated list of officer IDs
- `start_date` - Filter events starting from this date (ISO format)
- `end_date` - Filter events up to this date (ISO format)
- `tag_ids` - Comma-separated list of tag IDs
- `page` - Page number (default: 1)
- `limit` - Events per page (default: 50)

**Response**:
```json
{
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 247,
    "totalPages": 5
  }
}
```

### Bulk Operations
- `POST /api/events/bulk-delete` - Delete multiple events (admin only)

## Database Tables
Uses same tables as Event Logging:
- `events` - Event records
- `event_tags` - Event-tag relationships
- `tags` - Tag definitions
- `users` - Officer information

## History Page Layout

### Header
- Page title: "Event History"
- Description:
  - **Admin**: "All department events and activity logs"
  - **User**: "Your submitted events"

### Filters Section (`HistoryFilters` component)
**Admin Filters**:
- **Officer** - Multi-select dropdown of department users
- **Date Range** - Start and end date pickers
- **Tags** - Multi-select tag filter
- **Clear Filters** button

**User Filters**:
- **Date Range** - Start and end date pickers only
- **Tags** - Multi-select tag filter
- **Clear Filters** button

**Filter Behavior**:
- Filters combine with AND logic
- Empty filter = no restriction
- Changes trigger immediate re-fetch
- Resets to page 1 on filter change
- Filter state stored in component state (not persisted)

### Bulk Actions Bar (Admin Only)
Appears when events are selected:
- Count indicator: "X events selected"
- "Delete Selected" button (destructive variant)
- Background highlight to indicate selection mode

### Events Table

**Columns (Admin)**:
- Checkbox (select all/individual)
- Officer
- Date
- Time
- Duration
- Tags
- Notes (preview)
- Actions (delete icon)

**Columns (User)**:
- Date
- Time
- Duration
- Tags
- Notes (preview)

**Table Features**:
- Click row to view full event details
- Checkbox click stops propagation (admin only)
- Hover state for rows
- Selected rows have highlighted background
- Responsive: Horizontal scroll on mobile
- Uses shadcn `<Table>` component

### Pagination Controls
Appears when `totalPages > 1`:
- Event count: "Showing X of Y events"
- Previous button (disabled on page 1)
- Page indicator: "Page X of Y"
- Next button (disabled on last page)
- Mobile-friendly: Icon + text on desktop, icon only on mobile

### Empty States

**No Events Found (With Filters)**:
```
No events found.
No events match your current filters. Try adjusting your search.
```

**No Events Found (No Filters)**:
```
No events found.
Events will appear here as officers log and submit their activities. (Admin)
Your submitted events will appear here. (User)
```

## Filter Components

### HistoryFilters Component
Location: `/src/app/app/history/components/history-filters.tsx`

**Props**:
- `isAdmin: boolean` - Controls visibility of officer filter
- `onFilterChange: (filters: FilterValues) => void` - Callback with new filters
- `onClearFilters: () => void` - Clear all filters callback

**Filter Values Interface**:
```typescript
interface FilterValues {
  officerIds: string[];
  startDate: string;
  endDate: string;
  tagIds: string[];
}
```

**UI Structure**:
- Card container with filters
- Officer multi-select (admin only)
- Date range inputs (start + end)
- Tag multi-select
- Clear button (shows only when filters active)

**Date Inputs**:
- Uses mobile-friendly date pickers
- Format: ISO date string (YYYY-MM-DD)
- Validation: end_date >= start_date
- Native date inputs on mobile

**Officer Filter** (Admin Only):
- Loads users via `GET /api/users/list`
- Multi-select with checkboxes
- Shows full name + email
- Sorts alphabetically

**Tag Filter**:
- Loads tags via `GET /api/tags/list`
- Multi-select with checkboxes
- Shows colored tag badges
- Sorts alphabetically

## Selection & Bulk Operations (Admin)

### Selection State
- Managed via `Set<string>` of event IDs
- "Select All" checkbox in table header
- Individual checkboxes per row
- Indeterminate state when some selected
- Selection cleared on page change
- Selection cleared after bulk delete

### Bulk Delete Flow
1. Admin selects multiple events (checkboxes)
2. Bulk actions bar appears with count
3. Click "Delete Selected" button
4. Delete confirmation dialog opens
5. Dialog shows: "You are about to delete X submitted events. This action cannot be undone."
6. Confirm → POST to `/api/events/bulk-delete`
7. Success toast + refresh data + clear selection

### Single Delete Flow (Admin)
1. Click trash icon in table row (stops propagation)
2. Delete confirmation dialog opens
3. Dialog shows: "Are you sure you want to delete this submitted event?"
4. Confirm → DELETE `/api/events/[id]`
5. Success toast + refresh data

## Pagination Implementation

### State Management
```typescript
const [pagination, setPagination] = useState<PaginationMeta>({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0,
});
```

### Page Change Handler
- Validates page number within bounds
- Updates pagination state
- Triggers data re-fetch
- Clears selection

### Data Fetching
- `useCallback` hook to memoize fetch function
- Dependencies: page, limit, filters
- Refetches on any dependency change
- Shows loading spinner during fetch

## Event Detail Dialog Integration

### Opening Detail View
- Click on table row (except checkbox/action cells)
- Opens `EventDetailDialog` component
- Shows complete event information
- Same component used in event-logging feature

### Detail Dialog Actions (Admin)
- **Delete** button in dialog footer
- Closes detail dialog
- Opens delete confirmation dialog
- After delete → refreshes data

## Performance Optimizations

### API Pagination
- Server-side pagination reduces payload size
- 50 events per page (configurable)
- Total count returned for pagination UI
- Offset-based pagination

### Filter Debouncing
- Not currently implemented
- Could add debounce on filter changes
- Would reduce API calls during rapid changes

### Table Rendering
- Virtual scrolling not implemented (50 items manageable)
- Consider react-window for 100+ items per page
- Memoization on event cards could improve performance

## Mobile Responsiveness

### Table Layout
- Horizontal scroll on mobile
- Touch-friendly row click target
- Pagination buttons condensed (icons only)
- Filters stack vertically

### Filter Inputs
- Full-width on mobile
- Native date pickers on mobile devices
- Large touch targets (44px minimum)
- Dropdown menus optimized for touch

## Data Loading States

### Initial Load
```
<Spinner size="lg" />
Loading events...
```

### Empty State
```
No events found.
[Contextual message based on filters]
```

### Error State
Toast notification with error message

## Query Examples

### Admin: All Events from Specific Officer, Last 30 Days
```
GET /api/events?status=submitted&officer_ids=abc-123&start_date=2025-09-10&page=1&limit=50
```

### Admin: Events Tagged "Traffic Stop" from All Officers
```
GET /api/events?status=submitted&tag_ids=tag-uuid-1&page=1&limit=50
```

### User: Own Events from Date Range
```
GET /api/events?status=submitted&start_date=2025-09-01&end_date=2025-09-30&page=1&limit=50
```
(API automatically filters to user's own events)

### Admin: Multiple Filters Combined
```
GET /api/events?status=submitted&officer_ids=uuid1,uuid2&tag_ids=tag1,tag2&start_date=2025-09-01&end_date=2025-09-30
```

## RLS Behavior
- Same RLS policies as event-logging
- Officers automatically filtered to own events
- Admins see all organization events
- No client-side filtering needed

## Common Use Cases

### Admin Reviews Last Week's Activity
1. Open history page
2. Set date range: 7 days ago to today
3. Leave officer filter empty (all officers)
4. Review events in table
5. Export to CSV (future feature)

### Admin Searches for Specific Incident Type
1. Open history page
2. Select tag: "Use of Force"
3. Review matching events
4. Click event to see full details

### Admin Bulk Deletes Test Events
1. Open history page
2. Filter by specific officer (test account)
3. Select all events on page
4. Click "Delete Selected"
5. Confirm deletion

### Officer Reviews Own History
1. Open history page
2. See own submitted events only
3. Filter by date range or tags if needed
4. Click event to review details

## Testing Checklist
- [ ] Admin can filter by officer
- [ ] Date range filtering works correctly
- [ ] Tag filtering works correctly
- [ ] Multiple filters combine correctly
- [ ] Clear filters resets state
- [ ] Pagination forward/backward
- [ ] Pagination resets on filter change
- [ ] Select all events on page
- [ ] Bulk delete multiple events
- [ ] Single delete from table
- [ ] Row click opens detail dialog
- [ ] Officer sees only own events
- [ ] Mobile responsive filters
- [ ] Mobile responsive table (horizontal scroll)

## Related Features
- **Event Logging** - Creates events that appear in history
- **Tag Management** - Tags used for filtering
- **Multi-tenant System** - Organization-level data isolation
- **User Profile** - Officer information displayed in results
