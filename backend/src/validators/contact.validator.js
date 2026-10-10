import { z } from 'zod';
import { ENQUIRY_STATUSES, ENQUIRY_TYPES } from '../config/constants.js';
import { email, line, oneOf, optional, paginationQuery, paragraph, phone } from './common.js';

export const createEnquirySchema = z.object({
  fullName: line('Full name', { min: 3, max: 150 }),
  email,
  phone: optional(phone),
  enquiryType: oneOf(ENQUIRY_TYPES, 'Select what your enquiry is about'),
  subject: line('Subject', { min: 3, max: 200 }),
  message: paragraph('Message', { min: 10, max: 3000 }),
  website: z.string().max(200).optional(), // honeypot
});

export const listEnquiriesQuery = z.object({
  ...paginationQuery,
  status: optional(oneOf(ENQUIRY_STATUSES, 'Unknown status')),
  enquiryType: optional(oneOf(ENQUIRY_TYPES, 'Unknown type')),
});

export const updateEnquirySchema = z.object({
  status: oneOf(ENQUIRY_STATUSES, 'Select a valid status'),
});
