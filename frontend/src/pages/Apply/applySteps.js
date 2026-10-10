import { ageFrom, isEmail, isPhone, validateCv, validateSupporting } from '../../utils/validation.js';

// Step definitions for the application form. Each step lists the fields it
// owns (used to route server-side errors back to the right step) and a
// validator returning { field: message } using translated messages.

export const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  city: '',
  state: '',
  country: 'India',
  qualification: '',
  experience: '',
  profession: '',
  preferredOpportunity: '',
  preferredCountry: '',
  preferredSector: '',
  preferredPosition: '',
  message: '',
  consent: false,
  website: '', // honeypot
};

const required = (value) => String(value ?? '').trim().length > 0;
const minLength = (value, min) => String(value ?? '').trim().length >= min;

export const STEPS = [
  {
    key: 'personal',
    fields: ['fullName', 'email', 'phone', 'dateOfBirth', 'gender'],
    validate: (v, _files, t) => {
      const e = {};
      if (!minLength(v.fullName, 3)) e.fullName = t('apply.errors.fullName');
      if (!isEmail(v.email)) e.email = t('apply.errors.email');
      if (!isPhone(v.phone)) e.phone = t('apply.errors.phone');
      if (!required(v.dateOfBirth)) e.dateOfBirth = t('apply.errors.date');
      else {
        const age = ageFrom(v.dateOfBirth);
        if (Number.isNaN(age)) e.dateOfBirth = t('apply.errors.date');
        else if (age < 16 || age > 70) e.dateOfBirth = t('apply.errors.age');
      }
      if (!required(v.gender)) e.gender = t('apply.errors.select');
      return e;
    },
  },
  {
    key: 'location',
    fields: ['city', 'state', 'country'],
    validate: (v, _files, t) => {
      const e = {};
      ['city', 'state', 'country'].forEach((field) => {
        if (!minLength(v[field], 2)) e[field] = t('apply.errors.required');
      });
      return e;
    },
  },
  {
    key: 'background',
    fields: ['qualification', 'experience', 'profession', 'preferredOpportunity'],
    validate: (v, _files, t) => {
      const e = {};
      if (!required(v.qualification)) e.qualification = t('apply.errors.select');
      if (!required(v.experience)) e.experience = t('apply.errors.select');
      if (!minLength(v.profession, 2)) e.profession = t('apply.errors.required');
      if (!required(v.preferredOpportunity)) e.preferredOpportunity = t('apply.errors.select');
      return e;
    },
  },
  {
    key: 'preferences',
    fields: ['preferredCountry', 'preferredSector', 'preferredPosition'],
    validate: (v, _files, t) => {
      const e = {};
      if (!minLength(v.preferredCountry, 2)) e.preferredCountry = t('apply.errors.required');
      if (!required(v.preferredSector)) e.preferredSector = t('apply.errors.select');
      if (!minLength(v.preferredPosition, 2)) e.preferredPosition = t('apply.errors.required');
      return e;
    },
  },
  {
    key: 'documents',
    fields: ['cv', 'documents', 'message', 'consent', 'jobId'],
    validate: (v, files, t) => {
      const e = {};
      const cvError = validateCv(files.cv, t);
      if (cvError) e.cv = cvError;
      const docError = validateSupporting(files.documents, t);
      if (docError) e.documents = docError;
      if (String(v.message).length > 2000) e.message = t('apply.errors.tooLong', { max: 2000 });
      if (!v.consent) e.consent = t('apply.errors.consent');
      return e;
    },
  },
];

export function stepIndexForField(field) {
  const index = STEPS.findIndex((step) => step.fields.includes(field));
  return index === -1 ? STEPS.length - 1 : index;
}
