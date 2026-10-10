// Labels for back-office vocabularies (the admin panel is English-only).

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

export const JOB_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

export const ROLES = [
  { value: 'super_admin', label: 'Super administrator' },
  { value: 'admin', label: 'Administrator' },
  { value: 'viewer', label: 'Viewer (read-only)' },
];

export const SERVICE_ICON_OPTIONS = [
  { value: 'compass', label: 'Compass' },
  { value: 'graduation', label: 'Graduation cap' },
  { value: 'globe', label: 'Globe' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'user-check', label: 'Person with check' },
  { value: 'file-check', label: 'Document with check' },
  { value: 'building', label: 'Building' },
  { value: 'handshake', label: 'Handshake' },
];

export const ADMIN_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
];

const toMap = (list) => Object.fromEntries(list.map((item) => [item.value, item.label]));
export const STATUS_LABELS = { ...toMap(ENQUIRY_STATUSES), ...toMap(JOB_STATUSES), ...toMap(APPLICATION_STATUSES) };
export const ROLE_LABELS = toMap(ROLES);

export const ACTIVITY_LABELS = {
  'application.submitted': 'Application submitted',
  'application.status_changed': 'Status changed',
  'application.note_added': 'Note added',
  'application.document_viewed': 'Document opened',
  'application.deleted': 'Application deleted',
  'enquiry.status_changed': 'Enquiry status changed',
  'enquiry.deleted': 'Enquiry deleted',
  'job.created': 'Opening created',
  'job.updated': 'Opening updated',
  'job.deleted': 'Opening deleted',
  'service.created': 'Service created',
  'service.updated': 'Service updated',
  'service.deleted': 'Service deleted',
  'settings.updated': 'Website settings updated',
};
