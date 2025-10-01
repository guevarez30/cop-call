import { FieldType, FieldConfig } from '@/types/template';

// ============================================================================
// Default Field Configurations
// ============================================================================

export const defaultFieldConfigs: Record<FieldType, FieldConfig> = {
  [FieldType.SHORT_TEXT]: {
    type: 'short_text',
    maxLength: 255,
    placeholder: 'Enter text...',
  },
  [FieldType.LONG_TEXT]: {
    type: 'long_text',
    rows: 4,
    maxLength: 2000,
    showCharCount: true,
    placeholder: 'Enter details...',
  },
  [FieldType.NUMBER]: {
    type: 'number',
    allowDecimals: false,
    placeholder: 'Enter number...',
  },
  [FieldType.DROPDOWN]: {
    type: 'dropdown',
    options: ['Option 1', 'Option 2', 'Option 3'],
    placeholder: 'Select an option...',
  },
  [FieldType.RADIO]: {
    type: 'radio',
    options: ['Yes', 'No'],
  },
  [FieldType.CHECKBOX]: {
    type: 'checkbox',
    label: 'I agree',
    defaultValue: false,
  },
  [FieldType.DATE]: {
    type: 'date',
    allowFuture: true,
    allowPast: true,
  },
  [FieldType.TIME]: {
    type: 'time',
    format: '12h',
  },
  [FieldType.IMAGE_UPLOAD]: {
    type: 'image_upload',
    maxFiles: 5,
    maxSizePerFile: 5242880, // 5MB in bytes
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

// ============================================================================
// Field Type Metadata (for UI rendering)
// ============================================================================

export interface FieldTypeMetadata {
  label: string;
  description: string;
  icon: string; // lucide-react icon name
  category: 'text' | 'numeric' | 'selection' | 'datetime' | 'media';
}

export const fieldTypeMetadata: Record<FieldType, FieldTypeMetadata> = {
  [FieldType.SHORT_TEXT]: {
    label: 'Short Text',
    description: 'Single-line text input',
    icon: 'Type',
    category: 'text',
  },
  [FieldType.LONG_TEXT]: {
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: 'AlignLeft',
    category: 'text',
  },
  [FieldType.NUMBER]: {
    label: 'Number',
    description: 'Numeric input',
    icon: 'Hash',
    category: 'numeric',
  },
  [FieldType.DROPDOWN]: {
    label: 'Dropdown',
    description: 'Select from options',
    icon: 'ChevronDown',
    category: 'selection',
  },
  [FieldType.RADIO]: {
    label: 'Radio Buttons',
    description: 'Single choice from list',
    icon: 'Circle',
    category: 'selection',
  },
  [FieldType.CHECKBOX]: {
    label: 'Checkbox',
    description: 'Yes/No toggle',
    icon: 'CheckSquare',
    category: 'selection',
  },
  [FieldType.DATE]: {
    label: 'Date',
    description: 'Date picker',
    icon: 'Calendar',
    category: 'datetime',
  },
  [FieldType.TIME]: {
    label: 'Time',
    description: 'Time picker',
    icon: 'Clock',
    category: 'datetime',
  },
  [FieldType.IMAGE_UPLOAD]: {
    label: 'Image Upload',
    description: 'Upload one or more images',
    icon: 'Image',
    category: 'media',
  },
};

// ============================================================================
// Field Type Groups (for organized palette display)
// ============================================================================

export const fieldTypeGroups = [
  {
    name: 'Text',
    fieldTypes: [FieldType.SHORT_TEXT, FieldType.LONG_TEXT],
  },
  {
    name: 'Numeric',
    fieldTypes: [FieldType.NUMBER],
  },
  {
    name: 'Selection',
    fieldTypes: [FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX],
  },
  {
    name: 'Date & Time',
    fieldTypes: [FieldType.DATE, FieldType.TIME],
  },
  {
    name: 'Media',
    fieldTypes: [FieldType.IMAGE_UPLOAD],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default config for a field type
 */
export function getDefaultFieldConfig(fieldType: FieldType): FieldConfig {
  return defaultFieldConfigs[fieldType];
}

/**
 * Get metadata for a field type
 */
export function getFieldTypeMetadata(fieldType: FieldType): FieldTypeMetadata {
  return fieldTypeMetadata[fieldType];
}

/**
 * Get default field name for a field type
 */
export function getDefaultFieldName(fieldType: FieldType): string {
  const metadata = fieldTypeMetadata[fieldType];
  return `New ${metadata.label} Field`;
}

/**
 * Generate a unique temporary ID for new fields (frontend only)
 */
export function generateTempFieldId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
