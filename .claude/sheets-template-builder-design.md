# Sheets Template Builder - Design Document

## Problem Statement
Build a no-code template builder where admins can create reusable service call checklists/forms with various field types. These templates can later be assigned to users who fill them out during service calls.

## Core Concepts

### 1. Templates
- **What**: A reusable form/checklist definition
- **Created by**: Admins only
- **Contains**: Multiple fields with different types and validation rules
- **Used for**: Assigned to service calls for users to complete

### 2. Fields
Each field in a template has:
- **Name**: Display label (e.g., "Customer Name", "Equipment Serial Number")
- **Type**: The input control type
- **Restrictions/Validations**: Rules for the field (required, min/max, patterns, etc.)
- **Order**: Position in the template

### 3. Field Types

| Type | Description | Validation Options |
|------|-------------|-------------------|
| **Short Text** | Single-line text input | Required, Min/Max length, Pattern (regex) |
| **Long Text** | Multi-line textarea | Required, Min/Max length, Character count |
| **Number** | Numeric input | Required, Min/Max value, Integer only, Decimal places |
| **Dropdown** | Select from predefined options | Required, Custom options list |
| **Image Upload** | Single or multiple images | Required, Max file size, Max count, File types |
| **Date** | Date picker | Required, Min/Max date, Future/Past only |
| **Time** | Time picker | Required, Format (12h/24h) |
| **Checkbox** | Boolean yes/no | Required, Default value |
| **Radio** | Single choice from options | Required, Custom options list |

## Database Schema Design

### Tables Needed

#### `templates`
```sql
- id (uuid, primary key)
- name (text, required) - "HVAC Maintenance Checklist"
- description (text, optional)
- created_by (uuid, foreign key to users)
- created_at (timestamp)
- updated_at (timestamp)
- is_active (boolean) - soft delete/archive
- version (integer) - for versioning templates
```

#### `template_fields`
```sql
- id (uuid, primary key)
- template_id (uuid, foreign key to templates)
- field_name (text, required) - "Customer Name"
- field_type (enum) - 'short_text', 'long_text', 'number', 'dropdown', etc.
- field_config (jsonb) - stores all validations and options
- display_order (integer) - determines field order in template
- is_required (boolean)
- created_at (timestamp)
```

**field_config structure** (JSONB examples):
```json
// Short Text
{
  "minLength": 3,
  "maxLength": 50,
  "pattern": "^[A-Za-z\\s]+$",
  "placeholder": "Enter customer name"
}

// Number
{
  "min": 0,
  "max": 1000,
  "step": 0.01,
  "allowDecimals": true,
  "decimalPlaces": 2
}

// Dropdown/Radio
{
  "options": ["Option 1", "Option 2", "Option 3"],
  "allowCustom": false
}

// Image Upload
{
  "maxFiles": 5,
  "maxSizePerFile": 5242880, // 5MB in bytes
  "acceptedFormats": ["image/jpeg", "image/png"],
  "requireDescription": false
}

// Long Text
{
  "minLength": 10,
  "maxLength": 500,
  "rows": 4,
  "showCharCount": true
}
```

#### `service_calls` (will be created later)
```sql
- id (uuid, primary key)
- template_id (uuid, foreign key to templates, nullable)
- assigned_to (uuid, foreign key to users)
- status (enum) - 'pending', 'in_progress', 'completed'
- created_at (timestamp)
- completed_at (timestamp, nullable)
```

#### `service_call_responses` (will be created later)
```sql
- id (uuid, primary key)
- service_call_id (uuid, foreign key to service_calls)
- template_field_id (uuid, foreign key to template_fields)
- response_value (jsonb) - stores the actual user input
- created_at (timestamp)
- updated_at (timestamp)
```

**response_value structure** (JSONB examples):
```json
// Text/Number
{
  "value": "John Doe"
}

// Dropdown/Radio
{
  "value": "Option 2"
}

// Image Upload
{
  "files": [
    {
      "url": "https://storage.../image1.jpg",
      "filename": "equipment-photo.jpg",
      "uploadedAt": "2025-09-30T10:00:00Z",
      "size": 1234567
    }
  ]
}
```

## User Experience Flow

### Admin Flow (Template Creation)
1. Navigate to `/app/sheets`
2. Click "Create New Template"
3. Enter template name and description
4. Add fields one by one:
   - Click "Add Field" button
   - Select field type from dropdown/visual selector
   - Configure field name
   - Set validations/restrictions
   - Reorder fields via drag-and-drop
5. Preview template
6. Save template

### Admin Flow (Template Management)
1. View list of all templates
2. Actions: Edit, Duplicate, Archive, Preview
3. See usage stats (how many service calls use this template)

### User Flow (Later - Completing Service Call)
1. Receive assigned service call with template
2. Fill out form with all required fields
3. Upload images where needed
4. Submit completed form
5. Admin can review submissions

## Technical Architecture

### Component Hierarchy

```
/app/sheets/
├── page.tsx (Main template list view)
├── new/
│   └── page.tsx (Template creation wizard)
├── [templateId]/
│   ├── page.tsx (Template detail/edit view)
│   └── preview/
│       └── page.tsx (Preview how template looks to users)
└── components/
    ├── template-list.tsx
    ├── template-card.tsx
    ├── template-builder/
    │   ├── template-builder.tsx (Main builder component)
    │   ├── field-palette.tsx (List of available field types)
    │   ├── field-editor.tsx (Edit individual field)
    │   ├── field-list.tsx (Current fields in template)
    │   ├── field-preview.tsx (Shows how field will look)
    │   └── validation-configurator.tsx (UI for setting validations)
    └── field-renderers/
        ├── short-text-field.tsx
        ├── long-text-field.tsx
        ├── number-field.tsx
        ├── dropdown-field.tsx
        ├── image-upload-field.tsx
        ├── date-field.tsx
        └── ... (one renderer per field type)
```

### State Management Strategy

For template builder, we need complex state:
- Template metadata (name, description)
- Array of fields with their configs
- Current editing field
- Validation errors
- Drag-and-drop state

**Approach**: Use React state with useReducer for complex template builder state.

### Key Technical Decisions

1. **Field Configuration Storage**: JSONB in PostgreSQL
   - Pro: Flexible, can add new field types without schema changes
   - Pro: Each field type can have unique validation rules
   - Con: Need careful TypeScript typing

2. **Field Ordering**: Use `display_order` integer column
   - Simple to implement
   - Easy to reorder with drag-and-drop
   - On save, recalculate all orders (0, 1, 2, 3...)

3. **Field Type Definitions**: TypeScript discriminated unions
   ```typescript
   type FieldType =
     | { type: 'short_text', config: ShortTextConfig }
     | { type: 'number', config: NumberConfig }
     | { type: 'dropdown', config: DropdownConfig }
     // ... etc
   ```

4. **Validation**: Zod schemas
   - One schema per field type
   - Validate on client side during template creation
   - Validate on server side during service call submission

5. **Image Upload Strategy**:
   - Use Supabase Storage
   - Upload to bucket: `service-call-images/{service_call_id}/{field_id}/{filename}`
   - Store URLs in response_value JSONB
   - Set appropriate access policies

## Implementation Phases

### Phase 1: Database & Types
- [ ] Create Supabase migration for `templates` table
- [ ] Create Supabase migration for `template_fields` table
- [ ] Define TypeScript types for all field types
- [ ] Create Zod schemas for validation

### Phase 2: Template List & Basic CRUD
- [ ] Build template list view (`/app/sheets`)
- [ ] Create "New Template" button and route
- [ ] Build basic template creation form (name, description)
- [ ] Implement save template API route
- [ ] Display empty state with guidance

### Phase 3: Field Builder - Core
- [ ] Build field palette (visual selector for field types)
- [ ] Implement "Add Field" functionality
- [ ] Create field editor sidebar/modal
- [ ] Build field list with delete functionality
- [ ] Add basic field preview

### Phase 4: Field Types - Basic
- [ ] Implement Short Text field type + config
- [ ] Implement Long Text field type + config
- [ ] Implement Number field type + config
- [ ] Build validation configurator UI

### Phase 5: Field Types - Advanced
- [ ] Implement Dropdown field type + config
- [ ] Implement Image Upload field type + config
- [ ] Implement Date/Time field types
- [ ] Implement Checkbox/Radio field types

### Phase 6: Advanced Builder Features
- [ ] Drag-and-drop field reordering
- [ ] Template preview mode
- [ ] Duplicate template functionality
- [ ] Template versioning (optional)

### Phase 7: Template Usage (Later)
- [ ] Assign template to service call
- [ ] Render template for user to fill out
- [ ] Validate user responses
- [ ] Save responses to database
- [ ] Display completed forms to admin

## UI/UX Considerations

### Template Builder Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [< Back]  New Template                           [Preview] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Template Name: [_________________________]                  │
│  Description:   [_________________________]                  │
│                                                               │
├───────────────────┬─────────────────────────────────────────┤
│ Field Palette     │ Template Fields                         │
│                   │                                         │
│ [+] Short Text    │  1. ⋮ Customer Name (Short Text)       │
│ [+] Long Text     │     [Edit] [Delete]                     │
│ [+] Number        │                                         │
│ [+] Dropdown      │  2. ⋮ Equipment Serial # (Short Text)  │
│ [+] Image Upload  │     [Edit] [Delete]                     │
│ [+] Date          │                                         │
│ [+] Checkbox      │  3. ⋮ Photos (Image Upload)            │
│                   │     [Edit] [Delete]                     │
│                   │                                         │
│                   │  [+ Add Field]                          │
│                   │                                         │
│                   │  [Save Template] [Cancel]               │
└───────────────────┴─────────────────────────────────────────┘
```

### Field Editor Modal
When clicking [Edit] on a field:
```
┌─────────────────────────────────────────────┐
│ Edit Field                           [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  Field Name: [Customer Name_______]         │
│  Field Type: [Short Text ▼]                │
│                                             │
│  ☑ Required field                           │
│                                             │
│  Validations:                               │
│  Min Length: [3__]                          │
│  Max Length: [50_]                          │
│                                             │
│  Advanced:                                  │
│  Placeholder: [Enter customer name____]     │
│  Help Text: [______________________]        │
│                                             │
│           [Cancel]  [Save Changes]          │
└─────────────────────────────────────────────┘
```

### Mobile Considerations
- Field palette becomes a modal/drawer on mobile
- Stack field editor below field list on mobile
- Drag handles should be touch-friendly (larger hit area)
- Preview mode is crucial for mobile testing

## Security Considerations

1. **Template Creation**: Admin only
   - Middleware check for admin role
   - API routes validate user is admin

2. **Template Editing**: Admin only + created_by check
   - Users can only edit templates they created (optional: or all admins can edit all)

3. **Image Uploads**:
   - Validate file types on client and server
   - Enforce size limits
   - Scan for malicious content (future)
   - Supabase Storage policies to restrict access

4. **SQL Injection**:
   - Use Supabase client parameterized queries
   - Never concatenate user input into queries

## Open Questions

1. **Can admins edit templates after they're in use?**
   - Option A: Allow edits, affects all future service calls
   - Option B: Version templates, existing service calls use old version
   - **Recommendation**: Start with Option A for simplicity

2. **Can users save partial responses?**
   - Save draft functionality?
   - **Recommendation**: Start without, add later if needed

3. **Should templates have categories/tags?**
   - Help organize many templates
   - **Recommendation**: Add later as enhancement

4. **Conditional fields?** (Show field B only if field A = "Yes")
   - Complex but powerful
   - **Recommendation**: Phase 2 feature, not MVP

## Success Metrics

- Admin can create a 10-field template in under 5 minutes
- Template builder works smoothly on mobile device
- Zero data loss during template creation
- All field types render correctly for users
- Image uploads complete successfully 95%+ of time

## Next Steps

1. Create database migrations
2. Define TypeScript types
3. Build template list view with empty state
4. Implement basic template creation flow
5. Add first field type (Short Text)
6. Iterate and add more field types

---

**Document Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Planning Complete
