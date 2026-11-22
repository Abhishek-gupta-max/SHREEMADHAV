import { useLanguage } from '../context/LanguageContext.jsx';
import { publicService } from '../services/publicService.js';
import { useAsync } from './useAsync.js';

// Static fallback services shown when the API is unavailable (Vercel static deployment
// without a connected backend). These mirror the seeded database content.
const FALLBACK_SERVICES = [
  {
    id: 1,
    slug: 'overseas-education-guidance',
    icon: 'graduation',
    title: 'Overseas Education Guidance',
    summary:
      'Structured guidance on courses, institutions, applications and documents for students planning to study abroad — from first enquiry to final submission.',
    is_featured: 1,
  },
  {
    id: 2,
    slug: 'international-opportunity-support',
    icon: 'globe',
    title: 'International Opportunity Support',
    summary:
      'Support for skilled workers and professionals exploring overseas employment, covering job matching, documentation and step-by-step assistance throughout the process.',
    is_featured: 1,
  },
  {
    id: 3,
    slug: 'career-job-assistance',
    icon: 'briefcase',
    title: 'Career & Job Assistance',
    summary:
      'Help finding suitable international positions, preparing a strong application, and understanding employer requirements across a range of sectors.',
    is_featured: 1,
  },
  {
    id: 4,
    slug: 'candidate-guidance',
    icon: 'user-check',
    title: 'Candidate Guidance',
    summary:
      'One-on-one guidance for candidates at every stage — from understanding their options to preparing documents and responding to employer feedback.',
    is_featured: 0,
  },
  {
    id: 5,
    slug: 'documentation-support',
    icon: 'file-check',
    title: 'Documentation Support',
    summary:
      'Practical help organising the documents required for overseas applications, including certificates, CVs, reference letters and supporting paperwork.',
    is_featured: 0,
  },
  {
    id: 6,
    slug: 'international-consultancy',
    icon: 'compass',
    title: 'International Consultancy',
    summary:
      'Consultancy for individuals and families considering international relocation, covering options, timelines, visa pathways and realistic expectations.',
    is_featured: 0,
  },
  {
    id: 7,
    slug: 'employer-business-support',
    icon: 'handshake',
    title: 'Employer & Business Support',
    summary:
      'End-to-end recruitment support for international employers — from understanding manpower requirements to shortlisting and presenting suitable candidates.',
    is_featured: 0,
  },
];

/** Active services in the current language (refetched when it changes).
 *  Falls back to static data when the API is unreachable. */
export function useServices() {
  const { language } = useLanguage();
  const result = useAsync(
    async (signal) => {
      try {
        return await publicService.services(language, { signal });
      } catch {
        return FALLBACK_SERVICES;
      }
    },
    [language],
    { initialData: [] },
  );
  return result;
}
