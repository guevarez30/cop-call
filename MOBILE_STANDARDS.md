# Mobile Responsive Design Standards

## Overview

This document defines the mobile-first design standards for the application. All UI components and pages must adhere to these standards to ensure a consistent, accessible, and optimal mobile experience.

## Core Principles

1. **Mobile-First Design**: Start with mobile layouts, then enhance for larger screens
2. **Touch-Optimized**: All interactive elements must be easily tappable
3. **No Pinch-to-Zoom**: Application renders at proper scale, pinch-zoom is disabled
4. **Performance**: Optimize for mobile network conditions and device capabilities
5. **Accessibility**: Meet WCAG 2.1 AA standards for touch targets and contrast

---

## Viewport Configuration

**Status**: ✅ Implemented in `src/app/layout.js`

```javascript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

This configuration:
- Prevents pinch-to-zoom and double-tap zoom
- Ensures proper rendering on all mobile devices
- Disables user scaling to maintain consistent UI

---

## Touch Target Requirements

### Minimum Sizes

- **iOS Guideline**: 44×44px minimum
- **Material Design**: 48×48px minimum
- **Our Standard**: **44×44px minimum** for all interactive elements

### Implementation

All buttons, links, and interactive elements must meet minimum touch target sizes:

```jsx
// Button examples
<Button size="default">     // h-10 (40px) - Use cautiously
<Button size="lg">          // h-11 (44px) - Preferred minimum
<Button className="h-14">   // 56px - Large CTAs

// Input examples
<Input className="h-11" />  // 44px minimum
<Input className="h-10" />  // 40px - acceptable for dense forms
```

### Spacing Between Targets

- **Minimum spacing**: 8px between adjacent touch targets
- **Preferred spacing**: 12-16px for improved usability
- Use Tailwind spacing utilities: `gap-2`, `gap-3`, `gap-4`

---

## Responsive Breakpoints

### Tailwind Breakpoints (Mobile-First)

```css
/* Default (mobile): 0px - 639px */
/* No prefix needed */

sm: 640px   /* Small tablets, large phones landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops, small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Usage Strategy

1. **Start with mobile** (no breakpoint prefix)
2. **Add tablet adjustments** at `sm:` or `md:`
3. **Add desktop enhancements** at `lg:` and above

```jsx
// Example: Mobile-first layout
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">...</div>
</div>
```

---

## Typography Sizing

### Heading Hierarchy

```jsx
// Mobile → Desktop
<h1 className="text-3xl sm:text-4xl lg:text-5xl">    // 30px → 36px → 48px
<h2 className="text-2xl sm:text-3xl lg:text-4xl">    // 24px → 30px → 36px
<h3 className="text-xl sm:text-2xl">                 // 20px → 24px
<h4 className="text-lg sm:text-xl">                  // 18px → 20px
```

### Body Text

```jsx
// Default body text
<p className="text-base">           // 16px - Primary body text
<p className="text-sm">             // 14px - Secondary text
<p className="text-xs">             // 12px - Captions, labels

// Minimum readable size: 14px (text-sm)
// Never use text smaller than 12px
```

### Line Height

- **Headings**: `leading-tight` or `leading-snug`
- **Body text**: `leading-normal` (1.5) or `leading-relaxed` (1.625)
- **Dense UI**: `leading-none` (use sparingly)

---

## Layout Patterns

### Container Widths

```jsx
// Full-width mobile, contained desktop
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {children}
</div>

// Common max-widths:
max-w-md    // 448px - Forms, cards
max-w-2xl   // 672px - Content, articles
max-w-7xl   // 1280px - Main container
```

### Padding & Spacing

```jsx
// Page/Section padding
px-4 sm:px-6 lg:px-8    // Horizontal: 16px → 24px → 32px
py-6 sm:py-8 lg:py-12   // Vertical: 24px → 32px → 48px

// Component padding
p-4 sm:p-6              // 16px → 24px
p-3 sm:p-4              // 12px → 16px
```

### Grid Layouts

```jsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Photo grid
<div className="grid grid-cols-4 md:grid-cols-6 gap-2">
  {photos.map(photo => <Image key={photo.id} {...photo} />)}
</div>
```

---

## Component Patterns

### Mobile Navigation

**Use Sheet component for mobile, Sidebar for desktop:**

```jsx
// Mobile (< md)
<Sheet>
  <SheetTrigger>
    <Button variant="outline" size="icon" className="md:hidden">
      <Menu />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Navigation items */}
  </SheetContent>
</Sheet>

// Desktop (>= md)
<aside className="hidden md:flex">
  {/* Sidebar navigation */}
</aside>
```

### Dialogs vs. Sheets

- **Dialog**: Use for desktop confirmations, settings
  - Centers on screen
  - Max-width for readability
  - Use for short interactions

- **Sheet**: Use for mobile forms, menus
  - Slides from edge
  - Full-width or near-full-width
  - Better for longer content on mobile

### Forms

```jsx
// Form spacing
<form className="space-y-6">  // 24px between fields
  <div className="space-y-2"> // 8px label-to-input
    <Label htmlFor="field">Label</Label>
    <Input id="field" className="h-11" /> // 44px touch target
  </div>
</form>

// Button groups
<div className="flex flex-col sm:flex-row gap-3">
  <Button className="flex-1">Primary</Button>
  <Button className="flex-1" variant="outline">Secondary</Button>
</div>
```

### Cards

```jsx
// Responsive card
<Card>
  <CardContent className="p-4 sm:p-6">
    {/* Mobile: 16px padding, Desktop: 24px */}
  </CardContent>
</Card>

// Interactive cards (clickable)
<Card
  variant="interactive"
  onClick={handleClick}
  className="cursor-pointer"
>
  {/* content */}
</Card>
```

---

## Touch Interaction Standards

### CSS Utilities (Available in globals.css)

```jsx
// Touch action control
className="touch-manipulation"  // Removes delay on double-tap
className="touch-none"          // Disables all touch actions
className="touch-pan-y"         // Allow vertical scroll only

// User selection
className="select-none-ui"      // Prevent selection on buttons, UI
className="select-text-content" // Enable selection on text content

// iOS-specific
className="no-callout"          // Disable long-press menu on iOS

// Safe areas for notched devices
className="safe-top"            // Padding for status bar
className="safe-bottom"         // Padding for home indicator
```

### Best Practices

1. **Buttons and interactive elements**: Add `touch-manipulation` to remove tap delay
2. **UI chrome** (headers, toolbars, buttons): Add `select-none-ui`
3. **Content areas**: Add `select-text-content` to allow text selection
4. **Images**: Add `no-callout` to prevent iOS long-press menu

```jsx
// Example implementation
<Button className="touch-manipulation select-none-ui">
  Submit
</Button>

<div className="select-text-content">
  <p>User can select this text content</p>
</div>
```

---

## Input Fields

### Height Standards

```jsx
<Input className="h-11" />      // 44px - Standard
<Input className="h-10" />      // 40px - Dense forms
<Textarea className="min-h-[100px]" /> // Minimum height
```

### Input Types for Mobile

Use appropriate input types to trigger correct mobile keyboards:

```jsx
<Input type="email" />          // Email keyboard
<Input type="tel" />            // Phone keyboard
<Input type="number" />         // Numeric keyboard
<Input type="url" />            // URL keyboard
<Input type="search" />         // Search keyboard with "Go"
<Input type="date" />           // Date picker
<Input type="time" />           // Time picker
```

### Input Attributes

```jsx
// Disable autocorrect/autocapitalize where appropriate
<Input
  type="text"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="none"
  spellCheck="false"
/>

// Enable for user content
<Textarea
  autoComplete="on"
  autoCorrect="on"
  autoCapitalize="sentences"
  spellCheck="true"
/>
```

---

## Images & Media

### Image Sizing

```jsx
// Responsive images
<img
  className="w-full h-auto"
  alt="Description"
/>

// Fixed aspect ratio
<div className="relative aspect-square">
  <img className="w-full h-full object-cover" />
</div>
```

### Performance

1. Use Next.js `<Image>` component for optimization
2. Provide appropriate sizes for different breakpoints
3. Use lazy loading for below-fold images
4. Provide alt text for accessibility

---

## Loading States

### Skeleton Screens

Use skeleton loaders for better perceived performance:

```jsx
// Loading state
{loading ? (
  <Skeleton className="h-12 w-full" />
) : (
  <div>{content}</div>
)}
```

### Spinners

```jsx
// Centered spinner
<div className="flex items-center justify-center min-h-[400px]">
  <Spinner size="lg" variant="muted" />
</div>

// Inline spinner
<Button disabled={loading}>
  {loading && <Spinner size="sm" className="mr-2" />}
  Submit
</Button>
```

---

## Empty States

Every page must handle empty data gracefully with helpful guidance:

```jsx
<Card>
  <CardContent className="py-12">
    <div className="text-center space-y-3">
      <p className="text-base text-muted-foreground">
        No events logged today.
      </p>
      <p className="text-sm text-muted-foreground">
        Tap "Log New Event" to get started.
      </p>
    </div>
  </CardContent>
</Card>
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```jsx
// Built into shadcn/ui components
focus:ring-2 focus:ring-ring focus:ring-offset-2
focus-visible:outline-none focus-visible:ring-2
```

### ARIA Labels

```jsx
// Descriptive labels for screen readers
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Hidden but accessible text
<span className="sr-only">Menu</span>
```

### Color Contrast

- **Normal text**: 4.5:1 minimum
- **Large text (18px+)**: 3:1 minimum
- **UI components**: 3:1 minimum

Test all color combinations for WCAG AA compliance.

---

## Testing Checklist

### Mobile Testing

- [ ] Test on actual iOS device (iPhone)
- [ ] Test on actual Android device
- [ ] Test in Chrome DevTools mobile emulation
- [ ] Verify pinch-to-zoom is disabled
- [ ] Verify double-tap zoom is disabled
- [ ] Test all touch targets are minimum 44px
- [ ] Test touch interactions feel responsive
- [ ] Verify no horizontal scrolling on mobile
- [ ] Test form inputs trigger correct keyboards
- [ ] Verify text is readable without zooming

### Responsive Testing

- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone standard)
- [ ] Test at 768px width (iPad portrait)
- [ ] Test at 1024px width (iPad landscape)
- [ ] Test at 1280px+ width (desktop)

### Performance Testing

- [ ] Test on 3G network throttling
- [ ] Verify images load properly
- [ ] Check for layout shift during loading
- [ ] Verify smooth scrolling
- [ ] Test with React DevTools performance

---

## Common Issues & Solutions

### Issue: Text Too Small on Mobile

**Solution**: Ensure minimum 14px (text-sm) for body text, 16px (text-base) preferred

```jsx
// ❌ Too small
<p className="text-xs">Content</p>

// ✅ Readable
<p className="text-sm sm:text-base">Content</p>
```

### Issue: Buttons Too Small to Tap

**Solution**: Use minimum h-11 (44px) for mobile buttons

```jsx
// ❌ Too small
<Button className="h-8">Click</Button>

// ✅ Touch-friendly
<Button className="h-11">Click</Button>
```

### Issue: Horizontal Scrolling on Mobile

**Solution**: Ensure all containers use proper responsive classes

```jsx
// ❌ Fixed width overflows
<div className="w-[800px]">Content</div>

// ✅ Responsive width
<div className="w-full max-w-2xl">Content</div>
```

### Issue: Pull-to-Refresh Interfering

**Solution**: Already disabled globally in globals.css via `overscroll-behavior-y: none`

### Issue: Text Selection on Buttons

**Solution**: Apply `select-none-ui` utility class

```jsx
<Button className="select-none-ui">Submit</Button>
```

---

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html)

### Tools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Web Inspector (for iOS testing)
- Lighthouse (for accessibility & performance audits)

---

## Updates & Maintenance

This document should be updated whenever:
- New mobile patterns are established
- Breakpoint strategy changes
- Touch target requirements are modified
- New accessibility standards are adopted

**Last Updated**: January 2025
**Version**: 1.0
