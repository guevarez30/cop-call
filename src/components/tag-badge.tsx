import { Tag } from '@/lib/types';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Helper function to determine contrasting text color
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Helper to lighten a color by a percentage (0-1)
export function lightenColor(hexColor: string, amount: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Parse tag name to detect group::label format
export function parseTagName(name: string): { isGrouped: boolean; group?: string; label: string } {
  const parts = name.split('::');
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return { isGrouped: true, group: parts[0].trim(), label: parts[1].trim() };
  }
  return { isGrouped: false, label: name };
}

export function TagBadge({ tag, size = 'md', className = '' }: TagBadgeProps) {
  const parsed = parseTagName(tag.name);
  const textColor = getContrastColor(tag.color);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  if (parsed.isGrouped) {
    // Two-tone display: lighter background for group, solid for label
    const lighterColor = lightenColor(tag.color, 0.6);
    const lighterTextColor = getContrastColor(lighterColor);

    return (
      <div className={`inline-flex rounded-md overflow-hidden font-medium transition-all duration-150 ${className}`}>
        <span
          className={`${sizeClasses[size]} border-r border-black/10 transition-all duration-150`}
          style={{ backgroundColor: lighterColor, color: lighterTextColor }}
        >
          {parsed.group}
        </span>
        <span
          className={`${sizeClasses[size]} transition-all duration-150`}
          style={{ backgroundColor: tag.color, color: textColor }}
        >
          {parsed.label}
        </span>
      </div>
    );
  } else {
    // Solid color for single word
    return (
      <div
        className={`inline-flex rounded-md font-medium transition-all duration-150 ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: tag.color, color: textColor }}
      >
        {parsed.label}
      </div>
    );
  }
}
