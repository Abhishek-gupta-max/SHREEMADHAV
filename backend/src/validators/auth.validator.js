import { z } from 'zod';
import { ADMIN_ROLES } from '../config/constants.js';
import { email, line, oneOf, password } from './common.js';

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(128),
});

export const updateProfileSchema = z.object({
  name: line('Name', { min: 2, max: 120 }),
  email,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  });

export const createAdminSchema = z.object({
  name: line('Name', { min: 2, max: 120 }),
  email,
  password,
  role: oneOf(ADMIN_ROLES, 'Select a role'),
});

export const updateAdminSchema = z.object({
  role: oneOf(ADMIN_ROLES, 'Select a role'),
  isActive: z.boolean({ error: 'Choose whether the account is active' }),
});
