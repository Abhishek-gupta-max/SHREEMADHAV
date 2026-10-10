import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  EXPERIENCE_LEVELS,
  GENDERS,
  LOCALES,
  OPPORTUNITY_TYPES,
  QUALIFICATIONS,
  SECTORS,
} from '../config/constants.js';
import { email, isoDate, line, oneOf, optional, paginationQuery, paragraph, phone } from './common.js';

const MIN_AGE = 16;
const MAX_AGE = 70;

function ageOn(dateString, today = new Date()) {
  const dob = new Date(`${dateString}T00:00:00Z`);
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export const createApplicationSchema = z.object({
  fullName: line('Full name', { min: 3, max: 150 }),
  email,
  phone,
  dateOfBirth: isoDate.refine((value) => {
    const age = ageOn(value);
    return age >= MIN_AGE && age <= MAX_AGE;
  }, `Applicants must be between ${MIN_AGE} and ${MAX_AGE} years old`),
  gender: oneOf(GENDERS, 'Select a gender option'),

  city: line('City', { max: 100 }),
  state: line('State / province', { max: 100 }),
  country: line('Country', { max: 100 }),

  qualification: oneOf(QUALIFICATIONS, 'Select your highest qualification'),
  experience: oneOf(EXPERIENCE_LEVELS, 'Select your experience'),
  profession: line('Current profession', { max: 150 }),
  preferredOpportunity: oneOf(OPPORTUNITY_TYPES, 'Select the type of opportunity'),

  preferredCountry: line('Preferred country', { max: 100 }),
  preferredSector: oneOf(SECTORS, 'Select a preferred sector'),
  preferredPosition: line('Preferred position', { max: 150 }),

  message: optional(paragraph('Message', { max: 2000 })),
  consent: z
    .union([z.literal('true'), z.literal(true), z.literal('on')], {
      error: () => 'Please confirm your consent to continue',
    })
    .transform(() => true),
  language: z.preprocess((value) => (LOCALES.includes(value) ? value : 'en'), z.enum(LOCALES)),
  jobId: optional(z.coerce.number().int().positive()),
  // Honeypot field: hidden from people, so any value marks an automated submission.
  website: z.string().max(200).optional(),
});

export const listApplicationsQuery = z.object({
  ...paginationQuery,
  status: optional(oneOf(APPLICATION_STATUSES, 'Unknown status')),
  preferredCountry: optional(z.string().trim().max(100)),
  preferredSector: optional(oneOf(SECTORS, 'Unknown sector')),
  opportunity: optional(oneOf(OPPORTUNITY_TYPES, 'Unknown opportunity type')),
  from: optional(isoDate),
  to: optional(isoDate),
  sort: optional(
    z.enum(['created_at', 'full_name', 'status', 'preferred_country', 'preferred_position', 'reference_no']),
  ),
  order: optional(z.enum(['asc', 'desc'])),
});

export const updateApplicationSchema = z.object({
  status: oneOf(APPLICATION_STATUSES, 'Select a valid status'),
  note: optional(paragraph('Note', { max: 2000 })),
});

export const createNoteSchema = z.object({
  body: paragraph('Note', { min: 2, max: 2000 }),
});

export const documentParams = z.object({
  id: z.coerce.number().int().positive(),
  documentId: z.coerce.number().int().positive(),
});

export const listDocumentsQuery = z.object({
  ...paginationQuery,
  docType: optional(z.enum(['cv', 'supporting'])),
});
