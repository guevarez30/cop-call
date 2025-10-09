# Design System Documentation

This directory contains all design-related documentation and resources for the application. Use these files to ensure consistency in UI/UX implementation.

## Directory Structure

```
.claude/design/
├── README.md                   # This file - overview of design documentation
├── design-principles.md        # Core design philosophy and principles
├── components.md               # Detailed component specifications and variants
└── examples/                   # Visual design reference images
    ├── general-theme.png       # Overall application theme
    ├── account-theme.png       # Cards, tabs, badges styling
    └── list-example.png        # List patterns and inputs
```

## Quick Start for Agents

### When implementing UI components:

1. **Check `components.md` first** - Contains detailed specifications for all component variants
2. **Reference `design-principles.md`** - Understand the philosophy behind design decisions
3. **View `examples/`** - See visual references for styling and layout

### Key Files

#### `design-principles.md`
- Apple HIG principles (Clarity, Deference, Depth)
- Nielsen Norman Group usability heuristics
- Tailwind CSS and shadcn/ui design patterns
- Mobile-first responsive design methodology
- Accessibility standards
- Application-specific patterns

#### `components.md`
- Complete component variant specifications
- All interaction states (hover, active, focus, disabled)
- Design tokens (colors, spacing, typography)
- Accessibility requirements
- Implementation examples
- Usage guidelines

#### `examples/`
- Visual references showing actual design aesthetic
- Use these to understand color palette, spacing, and overall theme

## Implementation Workflow

1. **Before coding**: Review the relevant sections in `components.md`
2. **Check visual examples**: Reference `examples/` for color and style
3. **Apply principles**: Ensure implementation follows `design-principles.md`
4. **Verify accessibility**: Use the checklist in `components.md`

## Component States Priority

When implementing components, ensure all states are covered:

1. **Default** - Base appearance
2. **Hover** - Mouse hover or touch preview
3. **Active/Pressed** - During click/tap
4. **Focus** - Keyboard focus state
5. **Disabled** - When action is unavailable
6. **Loading** - During async operations (if applicable)
7. **Error** - When validation fails (for inputs)

## Design Tokens Reference

Quick reference for common values (see `components.md` for complete list):

- **Primary Color**: Purple/Indigo (`hsl(250 65% 60%)`)
- **Background**: Dark (`hsl(0 0% 10%)`)
- **Border Radius**: `rounded-md` (8px) default
- **Spacing**: Use Tailwind scale (4px increments)
- **Typography**: `text-sm` (14px) for body

## Accessibility Checklist

Before completing any UI component:

- [ ] Keyboard navigable
- [ ] Visible focus indicators
- [ ] Screen reader friendly
- [ ] WCAG AA contrast ratios
- [ ] Touch targets ≥ 44x44px
- [ ] Proper ARIA attributes

## Related Documentation

- **Project Overview**: `../CLAUDE.md` (in project root)
- **Project Definition**: `../project-definition.md`
- **Agent Configurations**: `../agents/`

## For Maintainers

### Updating Design Documentation

When updating component specs:

1. Update `components.md` with new/changed component specifications
2. Update `design-principles.md` if adding new design patterns
3. Add new visual examples to `examples/` if design aesthetic changes
4. Keep this README in sync with structural changes

### Adding New Components

When documenting a new component:

1. Add specification to `components.md` under appropriate section
2. Include all variant states
3. Provide implementation example
4. Document accessibility requirements
5. Add usage guidelines
