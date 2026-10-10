// Domain vocabularies shared by validators, models and controllers.
// The React app mirrors the public lists in frontend/src/constants/options.js;
// keep the two in sync when adding values.

export const APPLICATION_STATUSES = [
  'new',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'rejected',
  'closed',
];

export const ENQUIRY_STATUSES = ['new', 'in_progress', 'resolved', 'archived'];
export const ENQUIRY_TYPES = ['general', 'education', 'opportunities', 'employer', 'application'];

export const JOB_STATUSES = ['draft', 'published', 'closed'];
export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'temporary', 'internship'];

export const ADMIN_ROLES = ['super_admin', 'admin', 'viewer'];

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
export const EXPERIENCE_LEVELS = ['fresher', '0-1', '1-3', '3-5', '5-10', '10+'];
export const OPPORTUNITY_TYPES = ['study_abroad', 'overseas_employment', 'professional_placement', 'not_sure'];

export const QUALIFICATIONS = [
  'secondary',
  'higher_secondary',
  'diploma',
  'bachelors',
  'masters',
  'doctorate',
  'professional_certification',
  'other',
];

export const SECTORS = [
  'healthcare',
  'hospitality',
  'construction_engineering',
  'information_technology',
  'manufacturing',
  'logistics_transport',
  'agriculture',
  'retail_sales',
  'education',
  'finance_accounting',
  'other',
];

export const LOCALES = ['en', 'hi', 'pa'];
export const DEFAULT_LOCALE = 'en';

export const SERVICE_ICONS = [
  'compass',
  'graduation',
  'globe',
  'briefcase',
  'user-check',
  'file-check',
  'building',
  'handshake',
];

// Website settings editable in Admin → Settings. Values are optional; the
// public site hides anything left blank instead of showing placeholders.
export const SETTING_KEYS = [
  'contact_phone',
  'contact_whatsapp',
  'contact_email',
  'office_address',
  'office_hours',
  'map_url',
  'social_facebook',
  'social_instagram',
  'social_linkedin',
  'social_youtube',
  'social_x',
];

export const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

export const CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
