import { z } from 'zod';
import { email, line, optional, paragraph, phone } from './common.js';

export const createEmployerEnquirySchema = z.object({
  companyName: line('Company name', { min: 2, max: 200 }),
  contactPerson: line('Contact person', { min: 2, max: 150 }),
  email,
  phone,
  country: line('Country', { min: 2, max: 100 }),
  industry: line('Industry', { min: 2, max: 100 }),
  requirements: paragraph('Manpower requirements', { min: 10, max: 3000 }),
  numEmployees: z.coerce.number().int().min(1, 'At least 1 employee required').max(10000),
  message: optional(paragraph('Additional message', { min: 0, max: 2000 })),
  website: z.string().max(200).optional(), // honeypot
});
