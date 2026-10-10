// Client-side validation mirrors the API rules (backend/src/validators) so
// most problems are caught before upload. The server always re-validates.

import { MAX_FILE_SIZE_MB, MAX_SUPPORTING_FILES } from '../constants/site.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

const CV_EXTENSIONS = ['pdf', 'doc', 'docx'];
const DOC_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
export const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const DOC_ACCEPT = `${CV_ACCEPT},.jpg,.jpeg,.png,image/jpeg,image/png`;

const extension = (name = '') => name.split('.').pop().toLowerCase();

export function isEmail(value) {
  return EMAIL_RE.test(String(value).trim());
}

export function isPhone(value) {
  const text = String(value).trim();
  const digits = text.replace(/\D/g, '').length;
  return PHONE_RE.test(text) && digits >= 7 && digits <= 15;
}

export function ageFrom(dateString, today = new Date()) {
  const dob = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return NaN;
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Returns a translated error for the CV, or null. */
export function validateCv(files, t) {
  const file = files[0];
  if (!file) return t('apply.errors.cvRequired');
  if (!CV_EXTENSIONS.includes(extension(file.name))) return t('apply.errors.cvType');
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return t('apply.errors.fileSize', { name: file.name, size: MAX_FILE_SIZE_MB });
  return null;
}

export function validateSupporting(files, t) {
  if (files.length > MAX_SUPPORTING_FILES) return t('apply.errors.fileCount', { count: MAX_SUPPORTING_FILES });
  for (const file of files) {
    if (!DOC_EXTENSIONS.includes(extension(file.name))) return `${file.name}: ${t('apply.errors.docType')}`;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return t('apply.errors.fileSize', { name: file.name, size: MAX_FILE_SIZE_MB });
  }
  return null;
}
