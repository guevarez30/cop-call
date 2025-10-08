# Cop Event Logger - Project Definition

## Project Vision

A mobile-first event logging application for law enforcement officers to record daily activities in real-time. Admin officers have oversight capabilities to view department-wide data, search events, and generate reports.

---

## User Roles

### Officer (Standard User)
- **Primary Device**: Mobile (in-car or personal device)
- **Primary Use Case**: Quick event logging during shift
- **Dashboard View**:
  - Today's events they've logged
  - Quick-access buttons to log new events
  - Personal activity summary

### Admin Officer (Admin User)
- **Primary Device**: Desktop/Tablet (can be mobile)
- **Primary Use Case**: Department oversight and reporting
- **Dashboard View**:
  - Department-wide event feed (all officers)
  - Search and filter capabilities
  - Report generation tools
  - Officer management

---

## Core Event Data Structure (UI Focus)

Each event record captures:
- **Officer Info**: Auto-populated from logged-in user
- **Start Time**: Auto-captured or manually set when event begins
- **End Time**: Set when event is completed
- **Event Tags**: Multi-select tag options (see categories below)
- **Notes**: Text area for incident description
- **Involved Parties** (optional): Simple text field for names/identifiers
- **Photos** (optional): Photo attachments
- **Status**: Draft (editable) or Submitted (locked)

### Event Tags (Multi-Select)
Officers can apply multiple tags to categorize events:
- Traffic Stop
- Citation
- Warning
- Arrest
- Felony
- Misdemeanor
- Warrant
- Community Interaction
- Citizen Contact
- Business Check
- School Visit
- Dispatch Call
- Disturbance
- Welfare Check
- Assistance
- Use of Force
- Verbal Commands
- Physical Control
- Less Lethal
- Property Check
- Residential
- Commercial
- Vehicle
- Report Taken
- Incident Report
- Accident Report
- Other

**Note**: Tags allow flexible categorization (e.g., "Traffic Stop" + "Arrest" + "Felony")

---

## Feature Roadmap

### Phase 1: Event Logging (MVP)
**Goal**: Officers can log events from mobile devices

- [ ] **Event Creation UI** (Mobile-optimized)
  - "Log Event" button (auto-captures start time on tap)
  - Auto-populated officer info
  - Multi-select tag interface (large touch targets, loads from admin-managed tag list)
  - Notes text area
  - Involved parties text field (optional)
  - Photo upload/camera capture (optional, unlimited)
  - End time selector
  - Save as Draft button (remains editable)
  - Submit button (locks event from officer editing, admins can still edit)

- [ ] **Officer Dashboard** (`/app` for officers)
  - "Log New Event" prominent button
  - Drafts section (editable events)
  - Today's submitted events list (chronological)
  - Event card showing: time duration, tags, notes preview, status badge
  - Filter: Today/Week/Month view
  - Empty state: "No events logged today. Tap 'Log Event' to get started."

- [ ] **Event Detail View**
  - Full event information (time duration, tags, notes, photos, involved parties)
  - Edit capability (only for draft events)
  - Visual indicator: Draft (editable) vs Submitted (read-only)
  - No delete option

### Phase 2: Admin Dashboard
**Goal**: Admins can view, search, and analyze department events

- [ ] **Admin Dashboard** (`/app` for admins)
  - Department-wide event feed (all officers, real-time)
  - Quick stats: Total events today, events by type, active officers
  - Recent events table/list view
  - Edit/delete any event (including submitted events)
  - Visual indicator showing event status (draft/submitted)

- [ ] **Search & Filter Interface**
  - Filter by: Officer, Date range, Event tags, Status (draft/submitted)
  - Full-text search in notes/descriptions
  - View event photos in search results
  - Export results (CSV/PDF)

- [ ] **Reports & Analytics**
  - Daily/weekly/monthly summaries
  - Events by officer (performance view)
  - Events by type (department trends)
  - Events by location (hotspot analysis)
  - Printable report generation

- [ ] **Officer Management** (Admin only)
  - View all officers in organization
  - Assign roles (officer/admin)
  - View officer activity history

- [ ] **Tag Management** (Admin only)
  - Create new event tags
  - Edit existing tag names
  - Archive/delete unused tags
  - View tag usage statistics

### Phase 3: Enhanced Features (Future)
**Note**: Skipping for initial development

- [ ] Custom Forms System
  - Specialized forms (use-of-force reports, pursuit forms, etc.)
  - Form builder for admins
  - Form approval workflows

- [ ] Scheduling System
  - Shift scheduling
  - Overtime posting and signup

- [ ] GPS Integration
  - Auto-capture GPS coordinates on event creation
  - Map view of events

- [ ] Notifications
  - Real-time alerts for admins
  - Officer activity notifications

---

## UI/UX Priorities

### Mobile-First Design
- Large touch targets (minimum 44x44px)
- Thumb-friendly navigation (bottom tabs/buttons)
- Minimal text input requirements
- Quick actions accessible within 2 taps
- Optimized photo capture and upload from mobile devices

### Officer Experience
- **Speed**: Log an event in under 30 seconds
- **Simplicity**: Only essential fields required
- **Clarity**: Clear visual feedback on submission
- **Accessibility**: Works in various lighting conditions (day/night mode)

### Admin Experience
- **Overview**: See department activity at a glance
- **Drill-down**: Easy navigation from summary to detail
- **Export**: Quick data export for reporting
- **Responsive**: Works on desktop and tablet

---

## Public Landing Page

### Purpose
Simple informational page (not a marketing site)

### Content
- App name and tagline
- Brief description: "Event logging for law enforcement officers"
- Login button (primary CTA)
- Maybe: Department/organization info or contact

### Design
- Clean, minimal design
- Single page (no multi-page marketing site)
- Mobile-responsive
- Focus on getting authenticated users to login quickly

---

## Technical Approach (UI-First)

### Development Strategy
1. **Build UI components first** - No database integration yet
2. **Use mock data** - Hard-coded sample events for development
3. **Focus on workflows** - Get the user experience right
4. **Add persistence later** - Once data models are finalized

### Current Database
- **Users table**: Already exists (authentication)
- **Organizations table**: Already exists (multi-tenant)
- **Event data**: Will be modeled later after UI is validated

---

## Design Decisions Made

✅ **Event Categories**: Tag-based system (multi-select) instead of dropdown hierarchy
✅ **Dynamic Tags**: Admins can create new tags (tag management interface)
✅ **Location**: Skipping for MVP
✅ **Event Editing**: Officers can edit until marked as "Submitted", Admins can edit any event
✅ **Event Deletion**: Officers cannot delete, Admins can delete any event
✅ **Involved Parties**: Simple text field
✅ **Time Tracking**: Yes - start time (auto-captured) and end time (event duration)
✅ **Media Attachments**: Yes - photo upload/camera capture (no limits)
✅ **Offline Support**: No - requires internet connection for MVP
✅ **Draft Expiration**: Drafts never expire
✅ **Time Entry**: Auto-capture start time when "Log Event" is tapped (officers may be on scene for extended periods)

---

## Next Steps

### Immediate (Foundational)
1. **Update README.md** - Reflect cop event logger purpose and setup instructions
2. **Simplify Landing Page** - Minimal public page with login CTA
3. **Create Mock Data** - TypeScript types and sample events for development

### Phase 1 Implementation
4. **Event Creation UI** - Mobile-optimized form with tags, photos, time tracking
5. **Officer Dashboard** - Drafts section + submitted events list
6. **Event Detail/Edit** - View and edit draft events

### Phase 2 Implementation
7. **Admin Dashboard** - Department-wide event feed, stats, edit/delete capabilities
8. **Search & Filter** - Advanced filtering by tags, officer, date range
9. **Tag Management** - Create, edit, archive tags (admin-only)
10. **Reports & Analytics** - Event summaries and export capabilities
