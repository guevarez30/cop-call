import { z } from 'zod';

// ============================================================================
// Template Validation Schemas
// ============================================================================

export const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
});

// ============================================================================
// Field Configuration Schemas
// ============================================================================

// Short Text Config
export const shortTextConfigSchema = z.object({
  type: z.literal('short_text'),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).max(1000).optional(),
  pattern: z.string().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
}).refine((data) => {
  // If both minLength and maxLength are provided, min must be less than max
  if (data.minLength !== undefined && data.maxLength !== undefined) {
    return data.minLength <= data.maxLength;
  }
  return true;
}, {
  message: 'Minimum length must be less than or equal to maximum length',
});

// Long Text Config
export const longTextConfigSchema = z.object({
  type: z.literal('long_text'),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).max(10000).optional(),
  rows: z.number().min(2).max(20).optional(),
  showCharCount: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
}).refine((data) => {
  if (data.minLength !== undefined && data.maxLength !== undefined) {
    return data.minLength <= data.maxLength;
  }
  return true;
}, {
  message: 'Minimum length must be less than or equal to maximum length',
});

// Number Config
export const numberConfigSchema = z.object({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  allowDecimals: z.boolean().optional(),
  decimalPlaces: z.number().min(0).max(10).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  unit: z.string().max(20).optional(),
}).refine((data) => {
  if (data.min !== undefined && data.max !== undefined) {
    return data.min <= data.max;
  }
  return true;
}, {
  message: 'Minimum value must be less than or equal to maximum value',
});

// Dropdown Config
export const dropdownConfigSchema = z.object({
  type: z.literal('dropdown'),
  options: z.array(z.string()).min(1, 'At least one option is required'),
  allowCustom: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

// Radio Config
export const radioConfigSchema = z.object({
  type: z.literal('radio'),
  options: z.array(z.string()).min(2, 'At least two options are required for radio buttons'),
  defaultValue: z.string().optional(),
  helpText: z.string().optional(),
});

// Checkbox Config
export const checkboxConfigSchema = z.object({
  type: z.literal('checkbox'),
  label: z.string().min(1, 'Checkbox label is required'),
  defaultValue: z.boolean().optional(),
  helpText: z.string().optional(),
});

// Date Config
export const dateConfigSchema = z.object({
  type: z.literal('date'),
  minDate: z.string().optional(), // ISO date string
  maxDate: z.string().optional(),
  allowFuture: z.boolean().optional(),
  allowPast: z.boolean().optional(),
  helpText: z.string().optional(),
}).refine((data) => {
  if (data.minDate && data.maxDate) {
    return new Date(data.minDate) <= new Date(data.maxDate);
  }
  return true;
}, {
  message: 'Minimum date must be before or equal to maximum date',
});

// Time Config
export const timeConfigSchema = z.object({
  type: z.literal('time'),
  format: z.enum(['12h', '24h']).optional(),
  minTime: z.string().optional(),
  maxTime: z.string().optional(),
  helpText: z.string().optional(),
});

// Image Upload Config
export const imageUploadConfigSchema = z.object({
  type: z.literal('image_upload'),
  maxFiles: z.number().min(1).max(20).optional(),
  maxSizePerFile: z.number().min(1).optional(), // bytes
  acceptedFormats: z.array(z.string()).optional(),
  requireDescription: z.boolean().optional(),
  helpText: z.string().optional(),
});

// ============================================================================
// Discriminated Union of All Field Configs
// ============================================================================

export const fieldConfigSchema = z.discriminatedUnion('type', [
  shortTextConfigSchema,
  longTextConfigSchema,
  numberConfigSchema,
  dropdownConfigSchema,
  radioConfigSchema,
  checkboxConfigSchema,
  dateConfigSchema,
  timeConfigSchema,
  imageUploadConfigSchema,
]);

// ============================================================================
// Template Field Schema
// ============================================================================

export const templateFieldSchema = z.object({
  field_name: z.string().min(1, 'Field name is required').max(100, 'Field name must be 100 characters or less'),
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

// ============================================================================
// Complete Template with Fields Schema
// ============================================================================

export const completeTemplateSchema = z.object({
  template: templateSchema,
  fields: z.array(templateFieldSchema).min(1, 'At least one field is required'),
});

// ============================================================================
// API Request/Response Schemas
// ============================================================================

// Create Template Request
export const createTemplateRequestSchema = templateSchema;

// Update Template Request
export const updateTemplateRequestSchema = templateSchema.partial();

// Create/Update Field Request
export const createFieldRequestSchema = templateFieldSchema.omit({ display_order: true });

// Update Field Request
export const updateFieldRequestSchema = templateFieldSchema.partial().omit({ display_order: true });

// Reorder Fields Request
export const reorderFieldsRequestSchema = z.object({
  fieldIds: z.array(z.string().uuid()),
});
