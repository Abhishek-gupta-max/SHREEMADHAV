import { PATHS } from './publicRoutes.js';

// Primary navigation (same order as the reference design). Labels are i18n
// keys; `icon` names come from components/common/Icon.jsx.
export const MAIN_NAV = [
  { to: PATHS.home, label: 'nav.home', icon: 'home', end: true },
  { to: PATHS.about, label: 'nav.about', icon: 'info' },
  { to: PATHS.services, label: 'nav.services', icon: 'briefcase' },
  { to: PATHS.process, label: 'nav.process', icon: 'clipboard' },
  { to: PATHS.whyUs, label: 'nav.whyUs', icon: 'shield' },
  { to: PATHS.requirements, label: 'nav.requirements', icon: 'file-check' },
  { to: PATHS.employer, label: 'nav.employer', icon: 'briefcase' },
  { to: PATHS.contact, label: 'nav.contact', icon: 'phone' },
];

export const SOCIAL_LINKS = [
  { key: 'social_facebook', icon: 'facebook', label: 'Facebook' },
  { key: 'social_linkedin', icon: 'linkedin', label: 'LinkedIn' },
  { key: 'social_instagram', icon: 'instagram', label: 'Instagram' },
  { key: 'social_youtube', icon: 'youtube', label: 'YouTube' },
  { key: 'social_x', icon: 'x-social', label: 'X' },
];

// Photograph used for each service card (by service slug).
export const SERVICE_IMAGES = {
  'overseas-education-guidance': 'graduation',
  'international-opportunity-support': 'gate',
  'career-job-assistance': 'candidate',
  'candidate-guidance': 'consultation',
  'documentation-support': 'documents',
  'international-consultancy': 'passport',
  'employer-business-support': 'handshake',
};
export const SERVICE_IMAGE_FALLBACK = 'team';
