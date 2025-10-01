# Data Models & Type Definitions

## TypeScript Type System

### Template Types

```typescript
// Core template structure
interface Template {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: number;
  fields?: TemplateField[];
}

// Field type enum
enum FieldType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  NUMBER = 'number',
  DROPDOWN = 'dropdown',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  TIME = 'time',
  IMAGE_UPLOAD = 'image_upload',
}

// Base field structure
interface TemplateField {
  id: string;
  template_id: string;
  field_name: string;
  field_type: FieldType;
  field_config: FieldConfig;
  display_order: number;
  is_required: boolean;
  created_at: string;
}

// Discriminated union for type-safe field configs
type FieldConfig =
  | ShortTextConfig
  | LongTextConfig
  | NumberConfig
  | DropdownConfig
  | RadioConfig
  | CheckboxConfig
  | DateConfig
  | TimeConfig
  | ImageUploadConfig;

// Individual field configs
interface ShortTextConfig {
  type: 'short_text';
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex pattern
  placeholder?: string;
  helpText?: string;
}

interface LongTextConfig {
  type: 'long_text';
  minLength?: number;
  maxLength?: number;
  rows?: number; // textarea rows
  showCharCount?: boolean;
  placeholder?: string;
  helpText?: string;
}

interface NumberConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  decimalPlaces?: number;
  placeholder?: string;
  helpText?: string;
  unit?: string; // e.g., "kg", "$", "hours"
}

interface DropdownConfig {
  type: 'dropdown';
  options: string[];
  allowCustom?: boolean;
  placeholder?: string;
  helpText?: string;
}

interface RadioConfig {
  type: 'radio';
  options: string[];
  defaultValue?: string;
  helpText?: string;
}

interface CheckboxConfig {
  type: 'checkbox';
  label: string;
  defaultValue?: boolean;
  helpText?: string;
}

interface DateConfig {
  type: 'date';
  minDate?: string; // ISO date string
  maxDate?: string;
  allowFuture?: boolean;
  allowPast?: boolean;
  helpText?: string;
}

interface TimeConfig {
  type: 'time';
  format?: '12h' | '24h';
  minTime?: string;
  maxTime?: string;
  helpText?: string;
}

interface ImageUploadConfig {
  type: 'image_upload';
  maxFiles?: number;
  maxSizePerFile?: number; // bytes
  acceptedFormats?: string[]; // MIME types
  requireDescription?: boolean;
  helpText?: string;
}
```

### Service Call Types (for later implementation)

```typescript
interface ServiceCall {
  id: string;
  template_id: string | null;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  template?: Template;
  responses?: ServiceCallResponse[];
}

interface ServiceCallResponse {
  id: string;
  service_call_id: string;
  template_field_id: string;
  response_value: ResponseValue;
  created_at: string;
  updated_at: string;
}

// Response value discriminated union
type ResponseValue =
  | TextResponse
  | NumberResponse
  | SelectResponse
  | BooleanResponse
  | DateResponse
  | TimeResponse
  | ImageResponse;

interface TextResponse {
  type: 'text';
  value: string;
}

interface NumberResponse {
  type: 'number';
  value: number;
}

interface SelectResponse {
  type: 'select';
  value: string;
}

interface BooleanResponse {
  type: 'boolean';
  value: boolean;
}

interface DateResponse {
  type: 'date';
  value: string; // ISO date
}

interface TimeResponse {
  type: 'time';
  value: string; // HH:mm format
}

interface ImageResponse {
  type: 'image';
  files: UploadedFile[];
}

interface UploadedFile {
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
  description?: string;
}
```

### Builder State Types

```typescript
// State for template builder component
interface TemplateBuilderState {
  template: {
    name: string;
    description: string;
  };
  fields: BuilderField[];
  editingFieldId: string | null;
  errors: ValidationErrors;
}

interface BuilderField {
  id: string; // temp ID for frontend, UUID when saved
  field_name: string;
  field_type: FieldType;
  field_config: FieldConfig;
  display_order: number;
  is_required: boolean;
}

interface ValidationErrors {
  template?: {
    name?: string;
    description?: string;
  };
  fields?: {
    [fieldId: string]: {
      field_name?: string;
      field_config?: string;
    };
  };
}

// Actions for reducer
type TemplateBuilderAction =
  | { type: 'SET_TEMPLATE_NAME'; payload: string }
  | { type: 'SET_TEMPLATE_DESCRIPTION'; payload: string }
  | { type: 'ADD_FIELD'; payload: { fieldType: FieldType } }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<BuilderField> } }
  | { type: 'DELETE_FIELD'; payload: { fieldId: string } }
  | { type: 'REORDER_FIELDS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_EDITING_FIELD'; payload: { fieldId: string | null } }
  | { type: 'SET_ERRORS'; payload: ValidationErrors }
  | { type: 'LOAD_TEMPLATE'; payload: Template };
```

## Zod Validation Schemas

```typescript
import { z } from 'zod';

// Template validation
export const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().max(500).optional().nullable(),
});

// Field config schemas
export const shortTextConfigSchema = z.object({
  type: z.literal('short_text'),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().max(1000).optional(),
  pattern: z.string().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

export const longTextConfigSchema = z.object({
  type: z.literal('long_text'),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().max(10000).optional(),
  rows: z.number().min(2).max(20).optional(),
  showCharCount: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

export const numberConfigSchema = z.object({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  allowDecimals: z.boolean().optional(),
  decimalPlaces: z.number().min(0).max(10).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  unit: z.string().optional(),
});

export const dropdownConfigSchema = z.object({
  type: z.literal('dropdown'),
  options: z.array(z.string()).min(1, 'At least one option required'),
  allowCustom: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

export const imageUploadConfigSchema = z.object({
  type: z.literal('image_upload'),
  maxFiles: z.number().min(1).max(20).optional(),
  maxSizePerFile: z.number().min(1).optional(),
  acceptedFormats: z.array(z.string()).optional(),
  requireDescription: z.boolean().optional(),
  helpText: z.string().optional(),
});

// Union of all configs
export const fieldConfigSchema = z.discriminatedUnion('type', [
  shortTextConfigSchema,
  longTextConfigSchema,
  numberConfigSchema,
  dropdownConfigSchema,
  imageUploadConfigSchema,
  // ... add others as implemented
]);

// Complete field validation
export const templateFieldSchema = z.object({
  field_name: z.string().min(1, 'Field name is required').max(100),
  field_type: z.enum([
    'short_text',
    'long_text',
    'number',
    'dropdown',
    'radio',
    'checkbox',
    'date',
    'time',
    'image_upload',
  ]),
  field_config: fieldConfigSchema,
  is_required: z.boolean(),
  display_order: z.number().min(0),
});

// Complete template with fields
export const completeTemplateSchema = z.object({
  template: templateSchema,
  fields: z.array(templateFieldSchema).min(1, 'At least one field required'),
});
```

## Default Configurations

```typescript
// Default configs for each field type when added
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
  },
  [FieldType.NUMBER]: {
    type: 'number',
    allowDecimals: false,
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
    maxSizePerFile: 5242880, // 5MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

// Field type metadata for UI
export const fieldTypeMetadata = {
  [FieldType.SHORT_TEXT]: {
    label: 'Short Text',
    description: 'Single-line text input',
    icon: 'Type', // lucide-react icon name
  },
  [FieldType.LONG_TEXT]: {
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: 'AlignLeft',
  },
  [FieldType.NUMBER]: {
    label: 'Number',
    description: 'Numeric input',
    icon: 'Hash',
  },
  [FieldType.DROPDOWN]: {
    label: 'Dropdown',
    description: 'Select from options',
    icon: 'ChevronDown',
  },
  [FieldType.RADIO]: {
    label: 'Radio Buttons',
    description: 'Single choice',
    icon: 'Circle',
  },
  [FieldType.CHECKBOX]: {
    label: 'Checkbox',
    description: 'Yes/No toggle',
    icon: 'CheckSquare',
  },
  [FieldType.DATE]: {
    label: 'Date',
    description: 'Date picker',
    icon: 'Calendar',
  },
  [FieldType.TIME]: {
    label: 'Time',
    description: 'Time picker',
    icon: 'Clock',
  },
  [FieldType.IMAGE_UPLOAD]: {
    label: 'Image Upload',
    description: 'Upload images',
    icon: 'Image',
  },
};
```

---

**Document Version**: 1.0
**Last Updated**: 2025-09-30
