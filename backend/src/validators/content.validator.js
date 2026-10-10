import { z } from 'zod';
import { EMPLOYMENT_TYPES, JOB_STATUSES, LOCALES, SERVICE_ICONS, SETTING_KEYS } from '../config/constants.js';
import { email, line, oneOf, optional, paginationQuery, paragraph, phone, url } from './common.js';

/* ------------------------------------------------------------- services */

const serviceCopy = z.object({
  title: line('Title', { min: 3, max: 150 }),
  summary: paragraph('Summary', { min: 10, max: 400 }),
  body: optional(paragraph('Details', { max: 4000 })),
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')
    .max(120),
  icon: oneOf(SERVICE_ICONS, 'Select an icon'),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  translations: z.object({
    en: serviceCopy,
    // Other languages are optional; missing ones fall back to English.
    ...Object.fromEntries(LOCALES.filter((l) => l !== 'en').map((l) => [l, optional(serviceCopy)])),
  }),
});

export const servicesQuery = z.object({
  lang: z.preprocess((value) => (LOCALES.includes(value) ? value : 'en'), z.enum(LOCALES)),
});

/* ----------------------------------------------------------------- jobs */

export const jobSchema = z.object({
  title: line('Title', { min: 3, max: 160 }),
  country: optional(line('Country', { max: 100 })),
  location: optional(line('Location', { max: 150 })),
  sector: optional(line('Sector', { max: 100 })),
  employmentType: oneOf(EMPLOYMENT_TYPES, 'Select an employment type'),
  summary: paragraph('Summary', { min: 20, max: 4000 }),
  requirements: optional(paragraph('Requirements', { max: 4000 })),
  status: oneOf(JOB_STATUSES, 'Select a status'),
});

export const listJobsQuery = z.object({
  ...paginationQuery,
  status: optional(oneOf(JOB_STATUSES, 'Unknown status')),
});

export const slugParam = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{1,180}$/, 'Invalid reference'),
});

/* ------------------------------------------------------------- settings */

const SETTING_RULES = {
  contact_phone: phone,
  contact_whatsapp: phone,
  contact_email: email,
  office_address: paragraph('Office address', { max: 300 }),
  office_hours: line('Office hours', { max: 120 }),
  map_url: url,
  social_facebook: url,
  social_instagram: url,
  social_linkedin: url,
  social_youtube: url,
  social_x: url,
};

export const settingsSchema = z
  .object(Object.fromEntries(SETTING_KEYS.map((key) => [key, optional(SETTING_RULES[key])])))
  .strict();
