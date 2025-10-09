# Design Principles

This document outlines the core design principles that guide all UX and UI decisions in this project. These principles are derived from industry-leading design systems and best practices, adapted for our specific tech stack and use cases.

## Visual Design Examples

Reference design examples are available in `examples/`:

- `list-example.png` - Example of list/table layout patterns
- `account-theme.png` - Account settings page theme and styling
- `general-theme.png` - General application theme and visual design

These examples serve as visual references for maintaining design consistency across the application.

---

## Core Design Values

### Human-Centered Design

- **Users First**: Every design decision must prioritize user needs and reduce cognitive load
- **Accessibility by Default**: Design for all users, including those using assistive technologies
- **Progressive Disclosure**: Reveal complexity gradually, showing only what's necessary when it's needed
- **Error Prevention**: Design to prevent errors before they happen, rather than just handling them gracefully

### Consistency and Clarity

- **Visual Consistency**: Maintain consistent patterns, spacing, and visual hierarchy throughout
- **Predictable Behavior**: Users should never wonder whether different actions mean the same thing
- **Clear Communication**: Use plain language and familiar concepts, avoid jargon

---

## Apple Human Interface Guidelines Principles

### 1. Clarity

- **Visual Hierarchy**: Use well-proportioned typography, ample white space, and clear focal points
- **Purpose-Driven Design**: Every element must have a clear purpose; eliminate unnecessary complexity
- **Immediate Understanding**: Users should instantly know what they can do without extensive instructions
- **Depth and Layering**: Guide user focus through subtle shadows, elevation, and visual depth

### 2. Deference

- **Content First**: UI should help users understand and interact with content, not compete with it
- **Minimal Distraction**: Reduce visual clutter; let content be the hero
- **Fluid Animations**: Use motion to communicate relationships and provide visual continuity

### 3. Depth

- **Visual Layers**: Create hierarchy through elevation and layering
- **Realistic Motion**: Use physics-based animations that feel natural
- **Contextual Awareness**: Adapt interface based on user context and device capabilities

### Key Apple Design Attributes

- **Seamless Interactions**: Every interaction should feel natural, intuitive, and responsive
- **Gestures**: Swiping, tapping, and dragging should feel fluid and purposeful
- **Responsive Feedback**: Provide immediate visual/haptic feedback for all user actions
- **Reduced Cognitive Load**: Design decisions should minimize mental effort

---

## Nielsen Norman Group: 10 Usability Heuristics

### 1. Visibility of System Status

The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time.

**In Practice:**

- Show loading states for async operations
- Display progress indicators for multi-step processes
- Provide clear confirmation after actions
- Use toast notifications for background operations

### 2. Match Between System and the Real World

The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.

**In Practice:**

- Use domain-appropriate terminology
- Follow real-world conventions (e.g., trash icon for delete)
- Present information in natural, logical order
- Avoid technical jargon in user-facing content

### 3. User Control and Freedom

Users often perform actions by mistake. They need a clearly marked 'emergency exit' to leave the unwanted action without having to go through an extended process.

**In Practice:**

- Provide undo/redo functionality
- Allow easy cancellation of operations
- Support backwards navigation
- Enable users to exit flows without losing progress

### 4. Consistency and Standards

Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.

**In Practice:**

- Maintain consistent component behavior
- Use standard iconography and terminology
- Follow platform conventions (web, iOS, Android)
- Establish and follow internal design patterns

### 5. Error Prevention

Good error messages are important, but the best designs carefully prevent problems from occurring in the first place.

**In Practice:**

- Validate input fields in real-time
- Disable invalid actions before they occur
- Use confirmation dialogs for destructive actions
- Provide helpful constraints and guardrails

### 6. Recognition Rather Than Recall

Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another.

**In Practice:**

- Keep important information visible
- Provide contextual help and tooltips
- Show recently used items
- Use autocomplete and suggestions

### 7. Flexibility and Efficiency of Use

Shortcuts — hidden from novice users — may speed up the interaction for the expert user so that the design can cater to both inexperienced and experienced users.

**In Practice:**

- Provide keyboard shortcuts
- Support batch operations
- Allow customization of workflows
- Offer quick actions for common tasks

### 8. Aesthetic and Minimalist Design

Interfaces should not contain information that is irrelevant or rarely needed. Every extra unit of information in an interface competes with the relevant units of information.

**In Practice:**

- Remove unnecessary elements
- Use progressive disclosure for advanced features
- Prioritize essential information
- Maintain generous white space

### 9. Help Users Recognize, Diagnose, and Recover from Errors

Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution.

**In Practice:**

- Write human-friendly error messages
- Explain what went wrong and why
- Suggest actionable next steps
- Provide links to relevant help resources

### 10. Help and Documentation

It's best if the system doesn't need any additional explanation. However, it may be necessary to provide documentation to help users understand how to complete their tasks.

**In Practice:**

- Design self-explanatory interfaces
- Provide contextual help when needed
- Create searchable documentation
- Include examples and tutorials for complex features

---

## Tailwind CSS Design Principles

### Mobile-First Responsive Design

- **Start Small**: Design for mobile first, then scale up
- **Breakpoint Strategy**: Use `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes progressively
- **Unprefixed = Mobile**: Base utilities apply to all screen sizes; prefixed utilities override at specific breakpoints
- **Fluid Layouts**: Use responsive containers and flexible grid systems

### Utility-First Philosophy

- **Composition Over Configuration**: Build complex designs from simple utility classes
- **Predefined Design System**: Use Tailwind's design tokens for visual consistency
- **No Arbitrary Values**: Prefer Tailwind's spacing/color scale over custom values (unless absolutely necessary)
- **Avoid Dynamic Classes**: Never construct class names dynamically (breaks JIT compilation)

### Component Architecture

- **Reusable Components**: Extract repeated patterns into React components
- **Single Responsibility**: Each component should have one clear purpose
- **Composition**: Build complex UIs by composing simple components
- **Props for Variants**: Use props to handle component variations, not conditional classes

### Performance Optimization

- **JIT Mode**: Enable Just-in-Time compilation for optimal bundle size
- **PurgeCSS**: Automatically remove unused styles in production
- **Class Consolidation**: Group related utilities logically
- **Avoid @apply**: Minimize @apply usage; prefer components for reuse

### Spacing and Layout

- **Consistent Spacing Scale**: Use Tailwind's spacing scale (0.25rem increments)
- **Generous White Space**: Don't overcrowd interfaces
- **Logical Grouping**: Use space to create visual relationships
- **Alignment**: Maintain consistent alignment throughout the UI

### Color and Contrast

- **Accessible Contrast**: Ensure WCAG AA compliance minimum (AAA preferred)
- **Semantic Colors**: Use colors meaningfully (red = danger, green = success, etc.)
- **Dark Mode**: Design with dark mode from the start using `dark:` prefix
- **Color Consistency**: Limit palette to maintain visual cohesion

### Typography

- **Type Scale**: Use Tailwind's type scale for hierarchical consistency
- **Line Height**: Ensure comfortable reading with appropriate line heights
- **Font Weight**: Use weight strategically to establish hierarchy
- **Responsive Text**: Scale typography appropriately across breakpoints

---

## shadcn/ui Component Principles

### Core Philosophy

- **Open Code**: Component code is transparent and fully modifiable
- **Composition First**: Components use a common, composable interface
- **Beautiful Defaults**: Carefully chosen default styles that work out of the box
- **Accessibility Built-In**: All components are accessible by default
- **Type Safety**: Full TypeScript support with proper type definitions

### Component Architecture

- **Two-Layer Design**: Separate presentation from logic
- **Copy & Paste, Don't Install**: Components live in your codebase for full control
- **Direct Modification**: Customize by editing code, not through complex props
- **Radix UI Foundation**: Built on accessible, unstyled Radix primitives

### Design Aesthetics

- **Minimalist Approach**: "Less is more" - clean, uncluttered interfaces
- **No Unnecessary Ornamentation**: Focus on functionality and clarity
- **Subtle Interactions**: Smooth, purposeful animations and transitions
- **Modern Defaults**: Contemporary design patterns that feel current

### Customization Strategy

- **Code Over Config**: Modify component code directly rather than using configuration props
- **Tailwind Integration**: Use Tailwind utilities for styling variations
- **Theme Variables**: Use CSS variables for consistent theming
- **Variant API**: Use CVA (class-variance-authority) for structured variants

### Accessibility Standards

- **WCAG 2.1 Compliance**: Meet or exceed Level AA standards
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible, logical focus indicators
- **High Contrast**: Support for high-contrast color schemes
- **Customizable Text**: Respect user font size preferences

### Performance Best Practices

- **Tree Shaking**: Components support tree-shaking for minimal bundle size
- **Minimal Runtime**: Lightweight with minimal JavaScript overhead
- **Lazy Loading**: Load components only when needed
- **Optimized Rendering**: Efficient re-render patterns

---

## Mobile-First Responsive Design Principles

### Mobile-First Methodology

- **Design for Constraints**: Start with smallest screen, most limited context
- **Progressive Enhancement**: Add features/complexity as screen size increases
- **Touch-First Interactions**: Design for touch targets (min 44x44px)
- **Thumb-Friendly**: Place primary actions within easy thumb reach

### Breakpoint Strategy

```
Mobile:    < 640px   (base, unprefixed)
Tablet:    ≥ 640px   (sm:)
Laptop:    ≥ 1024px  (lg:)
Desktop:   ≥ 1280px  (xl:)
Large:     ≥ 1536px  (2xl:)
```

### Touch & Interaction

- **Minimum Touch Targets**: 44x44px minimum (48x48px preferred)
- **Generous Spacing**: Prevent mis-taps with adequate spacing between interactive elements
- **Swipe Gestures**: Consider swipe interactions for mobile navigation
- **Hover States**: Don't rely on hover; provide touch-appropriate feedback

### Content Strategy

- **Content Priority**: Show most important content first on mobile
- **Vertical Scrolling**: Design for vertical scroll; avoid horizontal scroll
- **Readable Text**: Minimum 16px font size for body text
- **Line Length**: 45-75 characters per line for optimal readability

### Layout Patterns

- **Stack on Mobile**: Use vertical stacking for complex layouts
- **Side-by-Side on Desktop**: Expand to multi-column layouts on larger screens
- **Flexible Grids**: Use responsive grid systems (CSS Grid, Flexbox)
- **Container Queries**: Use container queries for component-level responsiveness (when available)

### Performance on Mobile

- **Optimize Images**: Use responsive images with srcset/sizes
- **Reduce Bundle Size**: Minimize JavaScript and CSS for faster load
- **Critical CSS**: Inline critical CSS for above-the-fold content
- **Lazy Load**: Defer loading of below-the-fold content

---

## Application-Specific Design Principles

### Empty States & First-Time User Experience

- **No Special Onboarding**: Avoid separate onboarding flows
- **Contextual Guidance**: Each page should handle empty data gracefully
- **Helpful Empty States**: Show users exactly what to do to get started
- **Action-Oriented**: Include clear CTAs in empty states
- **Progressive Learning**: Users learn the app naturally through use

### Multi-Tenant Design Patterns

- **Role-Based Views**: Adapt UI based on user role (Admin vs User)
- **Organization Context**: Always show which organization user is viewing
- **Permission-Aware UI**: Hide/disable features based on permissions
- **Data Scoping**: Clearly indicate data ownership (personal vs organization-wide)

### Form Design

- **Real-Time Validation**: Validate as user types (with debounce)
- **Clear Error States**: Show exactly what's wrong and how to fix it
- **Smart Defaults**: Pre-fill with sensible defaults when possible
- **Save States**: Auto-save drafts, prevent data loss
- **Accessible Forms**: Proper labels, ARIA attributes, error associations

### Navigation & Information Architecture

- **Clear Hierarchy**: Maintain consistent navigation structure
- **Breadcrumbs**: Show user location in complex hierarchies
- **Active States**: Clearly indicate current page/section
- **Mobile Navigation**: Collapsible menu for mobile, expanded for desktop

### Loading & Async States

- **Skeleton Screens**: Show content structure while loading
- **Optimistic UI**: Update UI immediately, rollback on error
- **Progressive Loading**: Load critical content first
- **Loading Indicators**: Always show when data is being fetched
- **Timeout Handling**: Handle slow connections gracefully

### Data Visualization

- **Responsive Charts**: Adapt visualizations to screen size
- **Accessible Data**: Provide table alternatives to charts
- **Color-Blind Safe**: Use patterns in addition to color
- **Interactive Elements**: Make data explorable and filterable

### Authentication & Security UX

- **Clear Session State**: Always show if user is logged in
- **Secure by Default**: Protected routes require authentication
- **Password Visibility Toggle**: Allow users to see password when typing
- **Helpful Errors**: Guide users without revealing security details
- **Session Expiry**: Warn before session expires, save user progress

---

## Design System Governance

### Component Library

- **shadcn/ui Foundation**: Use shadcn/ui components as building blocks
- **Custom Extensions**: Build custom components following same patterns
- **Documentation**: Document all custom components and their usage
- **Storybook**: Maintain visual component documentation (if applicable)

### Design Tokens

- **Tailwind Config**: Centralize design tokens in tailwind.config.js
- **CSS Variables**: Use CSS custom properties for dynamic theming
- **Consistent Naming**: Follow clear, predictable naming conventions
- **No Magic Numbers**: Use named tokens instead of arbitrary values

### Code Quality

- **Component Reusability**: Extract repeated patterns into components
- **Semantic HTML**: Use proper HTML5 semantic elements
- **Clean Props API**: Keep component APIs simple and intuitive
- **Type Safety**: Leverage TypeScript for component props

### Testing & Validation

- **Accessibility Testing**: Regular audits with axe DevTools, Lighthouse
- **Responsive Testing**: Test on real devices across breakpoints
- **Cross-Browser**: Ensure compatibility with modern browsers
- **Performance Monitoring**: Track Core Web Vitals

---

## Quick Reference Checklist

Before shipping any UI, verify:

- [ ] **Mobile-first responsive** (works well on all screen sizes)
- [ ] **Accessible** (keyboard navigable, screen reader friendly, WCAG AA)
- [ ] **Loading states** (skeleton, spinner, or progress indicator)
- [ ] **Empty states** (helpful guidance for first-time users)
- [ ] **Error states** (clear, actionable error messages)
- [ ] **Success feedback** (confirmations, toasts for user actions)
- [ ] **Touch targets** (minimum 44x44px for interactive elements)
- [ ] **Color contrast** (meets WCAG AA standards minimum)
- [ ] **Consistent spacing** (uses Tailwind spacing scale)
- [ ] **Typography hierarchy** (clear visual hierarchy with type scale)
- [ ] **Performance** (optimized images, minimal bundle, fast load)
- [ ] **Dark mode support** (if applicable to the feature)

---

## Resources

- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines
- **Nielsen Norman Group**: https://www.nngroup.com/articles/ten-usability-heuristics/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
