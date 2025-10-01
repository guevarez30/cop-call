// Template and Field Type Definitions

// ============================================================================
// Core Template Types
// ============================================================================

export interface Template {
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

// ============================================================================
// Field Type Enum
// ============================================================================

export enum FieldType {
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

// ============================================================================
// Template Field
// ============================================================================

export interface TemplateField {
  id: string;
  template_id: string;
  field_name: string;
  field_type: FieldType;
  field_config: FieldConfig;
  display_order: number;
  is_required: boolean;
  created_at: string;
}

// ============================================================================
// Field Configurations (Discriminated Union)
// ============================================================================

export type FieldConfig =
  | ShortTextConfig
  | LongTextConfig
  | NumberConfig
  | DropdownConfig
  | RadioConfig
  | CheckboxConfig
  | DateConfig
  | TimeConfig
  | ImageUploadConfig;

// Short Text Field
export interface ShortTextConfig {
  type: 'short_text';
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex pattern
  placeholder?: string;
  helpText?: string;
}

// Long Text Field
export interface LongTextConfig {
  type: 'long_text';
  minLength?: number;
  maxLength?: number;
  rows?: number; // textarea rows
  showCharCount?: boolean;
  placeholder?: string;
  helpText?: string;
}

// Number Field
export interface NumberConfig {
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

// Dropdown Field
export interface DropdownConfig {
  type: 'dropdown';
  options: string[];
  allowCustom?: boolean;
  placeholder?: string;
  helpText?: string;
}

// Radio Field
export interface RadioConfig {
  type: 'radio';
  options: string[];
  defaultValue?: string;
  helpText?: string;
}

// Checkbox Field
export interface CheckboxConfig {
  type: 'checkbox';
  label: string;
  defaultValue?: boolean;
  helpText?: string;
}

// Date Field
export interface DateConfig {
  type: 'date';
  minDate?: string; // ISO date string
  maxDate?: string;
  allowFuture?: boolean;
  allowPast?: boolean;
  helpText?: string;
}

// Time Field
export interface TimeConfig {
  type: 'time';
  format?: '12h' | '24h';
  minTime?: string;
  maxTime?: string;
  helpText?: string;
}

// Image Upload Field
export interface ImageUploadConfig {
  type: 'image_upload';
  maxFiles?: number;
  maxSizePerFile?: number; // bytes
  acceptedFormats?: string[]; // MIME types
  requireDescription?: boolean;
  helpText?: string;
}

// ============================================================================
// Template Builder State (for frontend)
// ============================================================================

export interface TemplateBuilderState {
  template: {
    name: string;
    description: string;
  };
  fields: BuilderField[];
  editingFieldId: string | null;
  errors: ValidationErrors;
}

export interface BuilderField {
  id: string; // temp ID for frontend, UUID when saved
  field_name: string;
  field_type: FieldType;
  field_config: FieldConfig;
  display_order: number;
  is_required: boolean;
}

export interface ValidationErrors {
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

// ============================================================================
// Template Builder Actions (for useReducer)
// ============================================================================

export type TemplateBuilderAction =
  | { type: 'SET_TEMPLATE_NAME'; payload: string }
  | { type: 'SET_TEMPLATE_DESCRIPTION'; payload: string }
  | { type: 'ADD_FIELD'; payload: { fieldType: FieldType } }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<BuilderField> } }
  | { type: 'DELETE_FIELD'; payload: { fieldId: string } }
  | { type: 'REORDER_FIELDS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_EDITING_FIELD'; payload: { fieldId: string | null } }
  | { type: 'SET_ERRORS'; payload: ValidationErrors }
  | { type: 'LOAD_TEMPLATE'; payload: Template };

// ============================================================================
// Service Call Types (for future implementation)
// ============================================================================

export interface ServiceCall {
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

export interface ServiceCallResponse {
  id: string;
  service_call_id: string;
  template_field_id: string;
  response_value: ResponseValue;
  created_at: string;
  updated_at: string;
}

// Response Value Types (Discriminated Union)
export type ResponseValue =
  | TextResponse
  | NumberResponse
  | SelectResponse
  | BooleanResponse
  | DateResponse
  | TimeResponse
  | ImageResponse;

export interface TextResponse {
  type: 'text';
  value: string;
}

export interface NumberResponse {
  type: 'number';
  value: number;
}

export interface SelectResponse {
  type: 'select';
  value: string;
}

export interface BooleanResponse {
  type: 'boolean';
  value: boolean;
}

export interface DateResponse {
  type: 'date';
  value: string; // ISO date
}

export interface TimeResponse {
  type: 'time';
  value: string; // HH:mm format
}

export interface ImageResponse {
  type: 'image';
  files: UploadedFile[];
}

export interface UploadedFile {
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
  description?: string;
}
