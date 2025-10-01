# Implementation Roadmap - Template Builder

## Overview
This document outlines the step-by-step implementation plan for the sheets template builder feature. We'll build incrementally, testing each piece before moving to the next.

## Phase 1: Foundation (Database & Types)
**Goal**: Set up data layer and type system

### Tasks
1. **Create database migrations**
   - [ ] `templates` table
   - [ ] `template_fields` table
   - [ ] Add RLS policies for admin-only access
   - [ ] Test migrations in Supabase dashboard

2. **Set up TypeScript types**
   - [ ] Create `src/types/template.ts` with all type definitions
   - [ ] Create `src/lib/validations/template.ts` with Zod schemas
   - [ ] Create `src/lib/template-defaults.ts` with default configs

3. **API utilities**
   - [ ] Create `src/lib/api/templates.ts` for template CRUD
   - [ ] Create `src/lib/api/template-fields.ts` for field operations

**Exit Criteria**: Can create a template record in database via API route

---

## Phase 2: Template List & Empty State
**Goal**: Admin can see template list page with proper empty state

### Tasks
1. **Update sheets page**
   - [ ] Replace placeholder with template list view
   - [ ] Add proper empty state with guidance (per CLAUDE.md)
   - [ ] Add "Create New Template" button
   - [ ] Mobile-responsive layout

2. **Fetch templates**
   - [ ] Create API route `GET /api/templates`
   - [ ] Display templates in grid/list
   - [ ] Show template metadata (name, field count, last updated)

3. **Template card component**
   - [ ] `src/app/app/sheets/components/template-card.tsx`
   - [ ] Show template name, description, field count
   - [ ] Actions: Edit, Preview, Duplicate, Archive

**Exit Criteria**:
- Empty state displays with helpful message
- Can fetch and display existing templates
- Mobile-responsive

---

## Phase 3: Basic Template Creation
**Goal**: Admin can create a template with name and description

### Tasks
1. **Create new template route**
   - [ ] `src/app/app/sheets/new/page.tsx`
   - [ ] Form with name and description inputs
   - [ ] Validation with Zod
   - [ ] Save button (disabled until valid)

2. **API route**
   - [ ] `POST /api/templates` - create new template
   - [ ] Validate admin permission
   - [ ] Return created template with ID

3. **Navigation**
   - [ ] After save, redirect to edit page with template ID
   - [ ] Cancel button returns to list

**Exit Criteria**: Can create a template with just name/description

---

## Phase 4: Template Builder Shell
**Goal**: Build the main builder interface (no fields yet)

### Tasks
1. **Create edit template page**
   - [ ] `src/app/app/sheets/[templateId]/page.tsx`
   - [ ] Fetch template data
   - [ ] Display template name/description (editable)
   - [ ] Empty field list area
   - [ ] "Add Field" button (disabled for now)

2. **Builder layout components**
   - [ ] `template-builder.tsx` - main builder container
   - [ ] `template-header.tsx` - name, description, actions
   - [ ] `field-list.tsx` - empty list with message
   - [ ] Desktop: two-column layout (palette + fields)
   - [ ] Mobile: single column with drawer palette

3. **State management**
   - [ ] Set up useReducer for builder state
   - [ ] Actions: update name, update description, save
   - [ ] API route: `PATCH /api/templates/[id]`

**Exit Criteria**:
- Can edit template name/description
- Builder layout looks good on desktop and mobile
- Changes save to database

---

## Phase 5: Field Palette
**Goal**: Visual selector for field types

### Tasks
1. **Field palette component**
   - [ ] `src/app/app/sheets/components/template-builder/field-palette.tsx`
   - [ ] Grid of clickable field type cards
   - [ ] Each card shows icon, label, description
   - [ ] Use lucide-react icons
   - [ ] Mobile: drawer/sheet component

2. **Field type metadata**
   - [ ] Import from `template-defaults.ts`
   - [ ] Render all available field types
   - [ ] Visual feedback on hover

3. **Add field action**
   - [ ] Click field type → dispatch ADD_FIELD action
   - [ ] Create field with default config
   - [ ] Assign next display_order
   - [ ] Auto-expand field editor

**Exit Criteria**:
- Can click field types in palette
- Field appears in field list (basic rendering)
- No saving yet, just local state

---

## Phase 6: Field List & Reordering
**Goal**: Display fields and reorder via drag-and-drop

### Tasks
1. **Field list item component**
   - [ ] `field-list-item.tsx`
   - [ ] Shows field icon, name, type, required badge
   - [ ] Drag handle (⋮ icon)
   - [ ] Edit and Delete buttons
   - [ ] Compact mobile view

2. **Drag-and-drop**
   - [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable`
   - [ ] Implement DnD context
   - [ ] Update display_order on drop
   - [ ] Visual feedback during drag

3. **Delete field**
   - [ ] Confirmation dialog (use shadcn AlertDialog)
   - [ ] Remove from state
   - [ ] Recalculate display_order

**Exit Criteria**:
- Fields display in order
- Can drag to reorder
- Can delete with confirmation
- Mobile touch-friendly

---

## Phase 7: Field Editor - Short Text
**Goal**: Fully functional field editor for one field type

### Tasks
1. **Field editor component**
   - [ ] `field-editor.tsx`
   - [ ] Sidebar on desktop, modal on mobile
   - [ ] Shows field being edited
   - [ ] Common fields: name, required checkbox
   - [ ] Type-specific config section

2. **Short text config editor**
   - [ ] `config-editors/short-text-config.tsx`
   - [ ] Min/max length inputs
   - [ ] Placeholder input
   - [ ] Help text textarea
   - [ ] Pattern (regex) input with validation
   - [ ] Real-time validation

3. **Field preview**
   - [ ] `field-preview.tsx`
   - [ ] Shows how field will appear to users
   - [ ] Updates live as config changes
   - [ ] Respects all validation rules

4. **Save field changes**
   - [ ] Update field in state
   - [ ] API route: `POST /api/templates/[id]/fields`
   - [ ] Persist to `template_fields` table
   - [ ] Return saved field with DB id

**Exit Criteria**:
- Can fully configure short text field
- Preview updates in real-time
- Saves to database correctly
- Validation works

---

## Phase 8: Remaining Basic Field Types
**Goal**: Implement Long Text, Number, Checkbox

### Tasks
1. **Long text**
   - [ ] Config editor component
   - [ ] Renderer component
   - [ ] Validation logic

2. **Number**
   - [ ] Config editor with min/max/step
   - [ ] Decimal places option
   - [ ] Unit input (optional)
   - [ ] Renderer component

3. **Checkbox**
   - [ ] Config editor (label, default value)
   - [ ] Renderer component

**Exit Criteria**: Can create templates with these 4 field types

---

## Phase 9: Selection Field Types
**Goal**: Implement Dropdown and Radio

### Tasks
1. **Dropdown field**
   - [ ] Config editor with options list
   - [ ] Add/remove/reorder options UI
   - [ ] "Allow custom" checkbox
   - [ ] Renderer using shadcn Select component

2. **Radio field**
   - [ ] Similar config to dropdown
   - [ ] Default value selector
   - [ ] Renderer using shadcn RadioGroup

**Exit Criteria**: Can create choice-based fields with custom options

---

## Phase 10: Date/Time Field Types
**Goal**: Implement Date and Time pickers

### Tasks
1. **Date field**
   - [ ] Config editor (min/max date, future/past)
   - [ ] Renderer using shadcn Calendar/Popover
   - [ ] Proper date formatting

2. **Time field**
   - [ ] Config editor (12h/24h format, min/max)
   - [ ] Renderer with time input
   - [ ] Format validation

**Exit Criteria**: Can create date/time fields with constraints

---

## Phase 11: Image Upload Field
**Goal**: Implement image upload with Supabase Storage

### Tasks
1. **Supabase Storage setup**
   - [ ] Create `service-call-images` bucket
   - [ ] Set up storage policies
   - [ ] Public read, authenticated write

2. **Image upload config editor**
   - [ ] Max files input
   - [ ] Max size per file input
   - [ ] Accepted formats checkboxes
   - [ ] Require description checkbox

3. **Image upload renderer**
   - [ ] File input with drag-and-drop
   - [ ] Multiple file handling
   - [ ] Upload progress indicator
   - [ ] Preview thumbnails
   - [ ] Delete uploaded images

4. **Upload API**
   - [ ] Upload to Supabase Storage
   - [ ] Generate unique filenames
   - [ ] Return public URLs
   - [ ] Error handling

**Exit Criteria**:
- Can upload images to Supabase Storage
- Images display as thumbnails
- File size/type validation works
- Can delete uploaded images

---

## Phase 12: Template Preview Mode
**Goal**: Preview template as users will see it

### Tasks
1. **Preview page/modal**
   - [ ] `src/app/app/sheets/[templateId]/preview/page.tsx`
   - [ ] Read-only mode
   - [ ] Renders all fields exactly as users see them
   - [ ] "Back to Edit" button

2. **Preview renderer**
   - [ ] Loop through fields in display_order
   - [ ] Use same field renderers
   - [ ] Show validation messages
   - [ ] Mobile preview mode

**Exit Criteria**:
- Preview accurately shows user experience
- Works on mobile
- All field types render correctly

---

## Phase 13: Template Management Features
**Goal**: Duplicate, archive, and manage templates

### Tasks
1. **Duplicate template**
   - [ ] "Duplicate" button on template card
   - [ ] API route: `POST /api/templates/[id]/duplicate`
   - [ ] Copy template + all fields
   - [ ] Append "(Copy)" to name
   - [ ] Navigate to edit new template

2. **Archive template**
   - [ ] "Archive" button with confirmation
   - [ ] API route: `DELETE /api/templates/[id]` (soft delete)
   - [ ] Set `is_active = false`
   - [ ] Filter archived from main list
   - [ ] Optional: "Show Archived" toggle

3. **Template stats**
   - [ ] Show field count on card
   - [ ] Show last updated date
   - [ ] Optional: usage count (# of service calls)

**Exit Criteria**:
- Can duplicate templates
- Can archive/restore templates
- Template list shows useful metadata

---

## Phase 14: Polish & Testing
**Goal**: Refinement and edge case handling

### Tasks
1. **Error handling**
   - [ ] Network error messages
   - [ ] Validation error display
   - [ ] Failed uploads retry
   - [ ] Toast notifications (use shadcn Sonner)

2. **Loading states**
   - [ ] Skeleton loaders for template list
   - [ ] Spinner during save
   - [ ] Upload progress bars
   - [ ] Optimistic UI updates

3. **Empty states**
   - [ ] No templates yet
   - [ ] No fields in template
   - [ ] No uploaded images

4. **Accessibility**
   - [ ] Keyboard navigation
   - [ ] ARIA labels
   - [ ] Focus management
   - [ ] Screen reader testing

5. **Mobile refinement**
   - [ ] Test on actual devices
   - [ ] Touch target sizes
   - [ ] Responsive breakpoints
   - [ ] Mobile-specific interactions

**Exit Criteria**:
- Feels polished and professional
- Works smoothly on mobile
- Good error handling
- Accessible

---

## Future Enhancements (Not MVP)

### Phase 15+: Service Call Integration
- Create service call with template
- Assign to user
- User fills out template
- Submit responses
- Admin reviews completed forms

### Phase 16+: Advanced Features
- Conditional logic (show field if...)
- Calculated fields (sum, average)
- Template categories/tags
- Template versioning
- Field validation formulas
- Rich text fields
- Signature fields
- GPS location fields
- Multi-language templates

---

## Testing Strategy

### Unit Tests
- Field config validation (Zod schemas)
- Field renderer components
- State management (reducer)

### Integration Tests
- Template CRUD operations
- Field CRUD operations
- Image upload flow
- RLS policies

### E2E Tests (later)
- Complete template creation flow
- Duplicate template
- Preview mode
- Mobile workflows

---

## Success Metrics

**Phase 1-7** (MVP Core):
- Admin can create template with 1+ fields
- Templates save to database
- Mobile responsive

**Phase 8-11** (Full Field Types):
- All field types implemented
- Image upload works
- Validation configured per field

**Phase 12-14** (Polish):
- Preview mode works
- Template management complete
- Professional UX

---

**Next Step**: Begin Phase 1 - Create database migrations

**Document Version**: 1.0
**Last Updated**: 2025-09-30
