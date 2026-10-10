import { z } from 'zod';
import { cleanSingleLine, cleanText } from '../utils/sanitize.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/pagination.js';

/** Single-line text: tags and control characters removed, whitespace collapsed. */
export const line = (label, { min = 2, max = 150 } = {}) =>
  z
    .string({ error: `${label} is required` })
    .transform(cleanSingleLine)
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .min(min, `${label} must be at least ${min} characters`)
        .max(max, `${label} must be ${max} characters or fewer`),
    );

/** Multi-line text with an optional minimum length. */
export const paragraph = (label, { min = 0, max = 2000 } = {}) =>
  z
    .string({ error: `${label} is required` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `${label} must be at least ${min} characters` : undefined)
        .max(max, `${label} must be ${max} characters or fewer`),
    );

export const email = z
  .string({ error: 'Email address is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .max(190, 'Email address is too long')
  .pipe(z.email('Enter a valid email address'));

export const phone = z
  .string({ error: 'Phone number is required' })
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 7 && digits <= 15;
  }, 'Enter a valid phone number')
  .transform((value) => value.replace(/\s+/g, ' '));

export const oneOf = (values, message) => z.enum(values, { error: () => message });

/** Treats empty strings and null as "not provided". */
export const optional = (schema) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), schema.optional());

export const idParam = z.object({
  id: z.coerce.number({ error: 'Invalid id' }).int().positive('Invalid id'),
});

export const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  q: optional(z.string().trim().max(100)),
};

export const isoDate = z
  .string({ error: 'Date is required' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Enter a valid date');

export const password = z
  .string({ error: 'Password is required' })
  .min(10, 'Use at least 10 characters')
  .max(128, 'Use 128 characters or fewer')
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), 'Include at least one letter and one number');

export const url = z
  .string()
  .trim()
  .max(500)
  .refine((value) => /^https:\/\/[^\s]+$/i.test(value), 'Enter a full https:// link');
