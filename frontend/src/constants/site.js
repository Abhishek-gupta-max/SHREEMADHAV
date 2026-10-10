// Facts about the company that appear across the site. Only information
// supplied by the client belongs here. Contact details (phone, email,
// address, social links) are managed in Admin → Settings instead.

export const SITE = {
  url: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, ''),
  legalName: 'ShreeMadhav Overseas Solutions Private Limited',
  shortName: 'ShreeMadhav Overseas Solutions',
  defaultTitle: 'ShreeMadhav Overseas Solutions | Overseas Education & International Opportunities',
  city: 'Chandigarh',
  country: 'India',
  ogImage: '/images/og-cover.jpg',
};

// Statutory details from the Certificate of Incorporation (MCA, 24 June 2026).
// PAN and TAN are deliberately not published on the website.
export const COMPANY = {
  cin: 'U78300CH2026PTC047026',
  incorporatedOn: '2026-06-24',
  registeredOffice: {
    street: 'SCO 156-157, 4th Floor, Sector 34A',
    city: 'Chandigarh',
    postalCode: '160022',
    region: 'Chandigarh',
    country: 'India',
  },
};

export const REGISTERED_OFFICE_TEXT = `${COMPANY.registeredOffice.street}, ${COMPANY.registeredOffice.city} ${COMPANY.registeredOffice.postalCode}, ${COMPANY.registeredOffice.country}`;

export const MAX_FILE_SIZE_MB = 5;
export const MAX_SUPPORTING_FILES = 4;
