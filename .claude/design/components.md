# Component Specifications

This document defines the specifications and variants for all UI components in the application. These specifications ensure consistency across the application and provide clear guidance for implementation.

## Visual Reference

See `examples/` directory for visual design references:
- `general-theme.png` - Overall application theme and component styling
- `account-theme.png` - Cards, tabs, badges, and status indicators
- `list-example.png` - List patterns, inputs, filters, and data display

---

## Design Tokens

### Color Palette

Based on the visual examples, our color system:

```typescript
// Primary Colors
primary: {
  DEFAULT: 'hsl(250 65% 60%)',  // Purple/Indigo primary
  hover: 'hsl(250 65% 55%)',    // Darker on hover
  active: 'hsl(250 65% 50%)',   // Even darker when active
}

// Accent Colors
accent: {
  yellow: 'hsl(51 100% 50%)',   // Bright yellow for highlights
  blue: 'hsl(210 100% 50%)',    // Blue accents
}

// Semantic Colors
destructive: {
  DEFAULT: 'hsl(0 65% 55%)',    // Red for delete/danger
  hover: 'hsl(0 65% 50%)',
  active: 'hsl(0 65% 45%)',
}

success: 'hsl(142 76% 36%)',     // Green for success states

// Background Colors (Dark Theme)
background: {
  DEFAULT: 'hsl(0 0% 10%)',      // Main dark background #1a1a1a
  secondary: 'hsl(0 0% 13%)',    // Card backgrounds
  tertiary: 'hsl(0 0% 16%)',     // Elevated elements
}

// Border Colors
border: {
  DEFAULT: 'hsl(0 0% 25%)',      // Subtle borders
  input: 'hsl(0 0% 20%)',        // Input borders
  focus: 'hsl(250 65% 60%)',     // Focus state border (primary)
}

// Text Colors
foreground: {
  DEFAULT: 'hsl(0 0% 98%)',      // Primary text (white)
  secondary: 'hsl(0 0% 65%)',    // Secondary text (gray)
  muted: 'hsl(0 0% 50%)',        // Muted text
}
```

### Spacing Scale

Follow Tailwind's default spacing scale:
- `xs`: 0.5rem (8px)
- `sm`: 0.75rem (12px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)

### Border Radius

- `sm`: 0.375rem (6px) - Small elements
- `md`: 0.5rem (8px) - Default for most components
- `lg`: 0.75rem (12px) - Cards, dialogs
- `xl`: 1rem (16px) - Large cards, modals
- `full`: 9999px - Pills, badges, circular elements

### Typography

```typescript
// Headings
h1: 'text-4xl font-bold'      // 36px
h2: 'text-3xl font-bold'      // 30px
h3: 'text-2xl font-semibold'  // 24px
h4: 'text-xl font-semibold'   // 20px
h5: 'text-lg font-medium'     // 18px

// Body
body: 'text-base'             // 16px
small: 'text-sm'              // 14px
xs: 'text-xs'                 // 12px

// Weights
light: 300
normal: 400
medium: 500
semibold: 600
bold: 700
```

---

## Button Components

### Primary Button

**Default State:**
```tsx
className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State
'hover:bg-primary-hover'

// Active/Pressed State
'active:bg-primary-active active:scale-[0.98]'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

// Disabled State
'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed'

// Loading State
'disabled:opacity-70 [&>svg]:animate-spin'
```

**Sizes:**

```typescript
// Small
'px-3 py-1.5 text-xs'

// Default
'px-4 py-2 text-sm'

// Large
'px-6 py-3 text-base'

// Icon Only
'p-2 aspect-square'
```

**Example Implementation:**

```tsx
// components/ui/button.tsx
<Button
  variant="default"
  size="default"
  disabled={false}
  loading={false}
>
  Add Wallet
</Button>
```

### Secondary/Outline Button

**Default State:**
```tsx
className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State
'hover:bg-background-secondary hover:border-primary'

// Active State
'active:bg-background-tertiary active:scale-[0.98]'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary'
```

### Ghost Button

**Default State:**
```tsx
className="inline-flex items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State
'hover:bg-background-secondary'

// Active State
'active:bg-background-tertiary'
```

### Destructive Button

**Default State:**
```tsx
className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-destructive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State
'hover:bg-destructive-hover'

// Active State
'active:bg-destructive-active active:scale-[0.98]'
```

### Link Button

**Default State:**
```tsx
className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State
'hover:underline hover:text-primary-hover'

// Active State
'active:text-primary-active'
```

### Icon Button

**Default State:**
```tsx
className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
```

**Variants:**

```typescript
// Sizes
'p-1.5 [&>svg]:w-4 [&>svg]:h-4' // Small
'p-2 [&>svg]:w-5 [&>svg]:h-5'   // Default
'p-3 [&>svg]:w-6 [&>svg]:h-6'   // Large
```

---

## Input Components

### Text Input

**Default State:**
```tsx
className="flex h-10 w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
```

**Variants:**

```typescript
// Hover State (not focused)
'hover:border-border-focus/50'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary'

// Error State
'border-destructive focus-visible:ring-destructive'

// Success State
'border-success focus-visible:ring-success'

// Disabled State
'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-secondary/50'
```

**Sizes:**

```typescript
// Small
'h-8 px-2 py-1 text-xs'

// Default
'h-10 px-3 py-2 text-sm'

// Large
'h-12 px-4 py-3 text-base'
```

**With Icon:**

```tsx
// Leading Icon Container
<div className="relative">
  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
    <SearchIcon className="h-4 w-4 text-foreground-muted" />
  </div>
  <input className="pl-10 ..." />
</div>

// Trailing Icon Container
<div className="relative">
  <input className="pr-10 ..." />
  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
    <Icon className="h-4 w-4 text-foreground-muted" />
  </div>
</div>
```

### Search Input

**Default State:**
```tsx
className="flex h-10 w-full rounded-md border border-input bg-background-secondary pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
```

**Icon Positioning:**
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
  <input type="search" className="..." placeholder="Search..." />
</div>
```

### Textarea

**Default State:**
```tsx
className="flex min-h-[80px] w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
```

### Select/Dropdown

**Default State:**
```tsx
className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
```

**Variants:**

```typescript
// Hover State (closed)
'hover:border-border-focus/50'

// Open State
'ring-2 ring-primary border-primary'

// With Chevron Icon
'[&>svg]:w-4 [&>svg]:h-4 [&>svg]:opacity-50 [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180'
```

### Date Picker Input

**Default State:**
```tsx
className="flex h-10 w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
```

---

## Checkbox Components

### Checkbox

**Default State:**
```tsx
className="peer h-4 w-4 shrink-0 rounded-sm border border-input bg-background-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
```

**Variants:**

```typescript
// Hover State (unchecked)
'hover:border-primary/50 hover:bg-background-tertiary'

// Checked State
'data-[state=checked]:bg-primary data-[state=checked]:border-primary'

// Indeterminate State
'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

// Disabled State
'disabled:cursor-not-allowed disabled:opacity-50'
```

**With Label:**

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>
```

### Checkbox Group

```tsx
<div className="space-y-3">
  <div className="flex items-start space-x-2">
    <Checkbox id="option1" />
    <div className="grid gap-1.5 leading-none">
      <label htmlFor="option1" className="text-sm font-medium">
        Option 1
      </label>
      <p className="text-xs text-foreground-muted">
        Description text
      </p>
    </div>
  </div>
</div>
```

---

## Radio Button Components

### Radio Button

**Default State:**
```tsx
className="aspect-square h-4 w-4 rounded-full border border-input bg-background-secondary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
```

**Variants:**

```typescript
// Hover State
'hover:border-primary/50'

// Checked State
'data-[state=checked]:border-primary data-[state=checked]:bg-primary [&>span]:data-[state=checked]:flex'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary'
```

### Radio Group

```tsx
<RadioGroup defaultValue="option1" className="space-y-3">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>
```

---

## Toggle/Switch Components

### Switch

**Default State:**
```tsx
className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
```

**Toggle Thumb:**
```tsx
className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
```

**Variants:**

```typescript
// Hover State
'hover:data-[state=unchecked]:bg-input/80'

// Checked State
'data-[state=checked]:bg-primary'

// Focus State
'focus-visible:ring-2 focus-visible:ring-primary'
```

---

## Badge/Pill Components

### Badge

**Default State:**
```tsx
className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

**Variants:**

```typescript
// Primary/Default
'bg-primary/10 text-primary border border-primary/20'

// Secondary
'bg-background-tertiary text-foreground-secondary border border-border'

// Success
'bg-success/10 text-success border border-success/20'

// Destructive/Error
'bg-destructive/10 text-destructive border border-destructive/20'

// Warning
'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'

// Outline
'border border-border text-foreground-secondary'
```

**With Indicator Dot:**

```tsx
<Badge variant="primary">
  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
  2 out of 1 synced
</Badge>
```

**With Close Button:**

```tsx
<Badge variant="default">
  Label
  <button className="ml-1 rounded-full hover:bg-foreground/10">
    <X className="h-3 w-3" />
  </button>
</Badge>
```

---

## Card Components

### Card

**Default State:**
```tsx
// Container
className="rounded-lg border border-border bg-background-secondary shadow-sm"

// Header
className="flex flex-col space-y-1.5 p-6"

// Title
className="text-2xl font-semibold leading-none tracking-tight"

// Description
className="text-sm text-foreground-muted"

// Content
className="p-6 pt-0"

// Footer
className="flex items-center p-6 pt-0"
```

**Variants:**

```typescript
// Hover State (interactive cards)
'hover:border-primary/30 hover:shadow-md transition-all duration-200'

// Selected/Active State
'border-primary bg-background-tertiary'

// Elevated Card
'shadow-lg'
```

### Wallet Card (from example)

```tsx
<div className="rounded-lg border border-primary/30 bg-background-secondary p-4 hover:border-primary/50 hover:bg-background-tertiary transition-all">
  <div className="flex items-start justify-between">
    <div className="flex items-center space-x-3">
      <div className="rounded-md bg-primary/10 p-2">
        <WalletIcon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">vlad</span>
          <Badge variant="secondary">ETH</Badge>
        </div>
        <span className="text-xs text-foreground-muted">0xd8da...6045</span>
      </div>
    </div>
    <button className="text-destructive hover:text-destructive-hover">
      <TrashIcon className="h-4 w-4" />
    </button>
  </div>
  <div className="mt-3 flex items-center justify-between text-sm">
    <span className="text-foreground-muted">1 donation</span>
    <span className="font-semibold">$4241.33</span>
  </div>
</div>
```

---

## Tab Components

### Tabs

**Tab List:**
```tsx
className="inline-flex h-10 items-center justify-center rounded-md bg-background-tertiary p-1 text-foreground-muted"
```

**Tab Trigger:**
```tsx
className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
```

**Variants:**

```typescript
// Hover State (inactive tab)
'hover:text-foreground hover:bg-background-secondary/50'

// Active State
'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'

// With Badge
<TabsTrigger value="issues">
  Exchange Issues
  <Badge className="ml-2" variant="destructive">1</Badge>
</TabsTrigger>
```

### Underline Tabs (Alternative Style)

**Tab List:**
```tsx
className="flex items-center border-b border-border"
```

**Tab Trigger:**
```tsx
className="relative px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
```

---

## Dialog/Modal Components

### Dialog

**Overlay:**
```tsx
className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
```

**Content:**
```tsx
className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background-secondary p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"
```

**Header:**
```tsx
className="flex flex-col space-y-1.5 text-center sm:text-left"
```

**Title:**
```tsx
className="text-lg font-semibold leading-none tracking-tight"
```

**Description:**
```tsx
className="text-sm text-foreground-muted"
```

**Footer:**
```tsx
className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
```

---

## Toast/Notification Components

### Toast

**Container:**
```tsx
className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-border bg-background-secondary p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
```

**Variants:**

```typescript
// Success Toast
'border-success/50 bg-success/5 [&>svg]:text-success'

// Error/Destructive Toast
'border-destructive/50 bg-destructive/5 [&>svg]:text-destructive'

// Warning Toast
'border-accent-yellow/50 bg-accent-yellow/5 [&>svg]:text-accent-yellow'
```

---

## Loading States

### Skeleton

**Base Skeleton:**
```tsx
className="animate-pulse rounded-md bg-background-tertiary"
```

**Variants:**

```typescript
// Text Skeleton
'h-4 w-full rounded'

// Avatar Skeleton
'h-12 w-12 rounded-full'

// Card Skeleton
'h-32 w-full rounded-lg'
```

### Spinner

**Default Spinner:**
```tsx
className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
```

**Sizes:**

```typescript
// Small
'h-3 w-3 border'

// Default
'h-4 w-4 border-2'

// Large
'h-6 w-6 border-2'
```

---

## Tooltip Components

### Tooltip

**Trigger:**
```tsx
// No special styling, just wraps the element
```

**Content:**
```tsx
className="z-50 overflow-hidden rounded-md border border-border bg-background-tertiary px-3 py-1.5 text-xs text-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
```

---

## Form Label & Error Components

### Label

**Default State:**
```tsx
className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
```

### Field Error

**Error Message:**
```tsx
className="text-sm font-medium text-destructive"
```

### Field Description

**Helper Text:**
```tsx
className="text-sm text-foreground-muted"
```

---

## Interaction States Summary

### Animation Transitions

All interactive components should use smooth transitions:

```typescript
// Standard transition
'transition-colors duration-150'

// For transforms (scale, translate)
'transition-all duration-200'

// For fade effects
'transition-opacity duration-150'
```

### Focus States

All interactive elements must have visible focus indicators:

```typescript
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
```

### Active/Pressed States

Buttons and clickable elements should provide tactile feedback:

```typescript
'active:scale-[0.98]' // Slight scale down on press
```

### Disabled States

Disabled elements should be clearly indicated:

```typescript
'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed'
```

---

## Accessibility Requirements

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical and intuitive
- Enter/Space should activate buttons
- Arrow keys should navigate within groups (radio, tabs, etc.)
- Escape should close dialogs and dropdowns

### ARIA Attributes

- Use proper ARIA labels for icon-only buttons
- Maintain ARIA states (aria-expanded, aria-selected, etc.)
- Use aria-describedby for error messages
- Implement aria-live regions for dynamic content

### Screen Reader Support

- All form inputs must have associated labels
- Error messages must be announced
- Loading states must be communicated
- Navigation state changes must be announced

### Touch Targets

- Minimum touch target: 44x44px
- Preferred touch target: 48x48px
- Adequate spacing between interactive elements

---

## Component Usage Guidelines

### When to Use Each Button Variant

- **Primary**: Main actions, form submissions, CTAs
- **Secondary/Outline**: Secondary actions, cancellation
- **Ghost**: Tertiary actions, menu items, subtle interactions
- **Destructive**: Delete, remove, permanent actions
- **Link**: Navigation, external links, inline actions

### Input States Priority

1. Error state (highest priority - always shown if present)
2. Success state (shown after validation passes)
3. Focus state (shown during user interaction)
4. Hover state (shown when hovering)
5. Default state (base state)

### Component Composition

Build complex components by composing simple ones:

```tsx
// Good: Composing Button + Badge
<Button>
  Notifications
  <Badge className="ml-2">3</Badge>
</Button>

// Good: Composing Card + Input + Button
<Card>
  <CardHeader>
    <CardTitle>Search</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Type here..." />
  </CardContent>
  <CardFooter>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

---

## Implementation Checklist

When implementing a new component, verify:

- [ ] All variant states implemented (default, hover, active, focus, disabled)
- [ ] Proper color contrast ratios (WCAG AA minimum)
- [ ] Keyboard navigation support
- [ ] Screen reader accessibility
- [ ] Touch target sizes (min 44x44px)
- [ ] Responsive behavior across breakpoints
- [ ] Loading states where applicable
- [ ] Error states for user inputs
- [ ] Smooth transitions and animations
- [ ] Dark mode support (if applicable)
- [ ] Consistent spacing using design tokens
- [ ] TypeScript types defined
- [ ] Component documented with examples

---

## Resources

- **shadcn/ui Components**: https://ui.shadcn.com
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Tailwind CSS Utilities**: https://tailwindcss.com/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Touch Target Sizes**: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
