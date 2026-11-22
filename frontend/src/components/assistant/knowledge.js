// Builds the assistant's knowledge base from the website's own content.
//
// Every fact here is read from the site's locale dictionaries, the services
// list and the public settings — nothing is written specially for the
// assistant. If the website copy changes, the assistant's answers change too.
// Each chunk carries the page it came from so answers can cite their source.

import { translate } from '../../i18n/index.js';
import { PATHS } from '../../constants/publicRoutes.js';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { SECTORS } from '../../constants/options.js';

const arr = (value) => (Array.isArray(value) ? value : []);

/**
 * Extra search words per topic, in English and Hindi, so questions phrased
 * differently from the page copy still find the right section. These are
 * search hints only — they are never shown as answers.
 */
const KEYWORDS = {
  company: 'company about who shreemadhav overview introduction background registered pvt private limited कंपनी परिचय बारे कौन',
  services: 'services service offer provide help support what do you do सेवा सेवाएँ सेवाएं क्या करते मदद',
  education: 'study abroad overseas education student students university college admission admissions course courses institution guidance counselling पढ़ाई विदेश शिक्षा विद्यार्थी छात्र प्रवेश एडमिशन कोर्स विश्वविद्यालय कॉलेज',
  consider: 'choose choosing destination country countries where decide cost budget recognition intake requirements life after study accommodation देश कहाँ चुनना खर्च बजट',
  studentDocs: 'documents document papers student transcript passport sop statement purpose recommendation lor language test ielts proof funds दस्तावेज़ दस्तावेज कागज़ पासपोर्ट',
  opportunities: 'job jobs work employment overseas career skilled worker professional sector sectors abroad नौकरी काम रोज़गार करियर कौशल',
  eligibility: 'eligibility eligible requirement requirements qualify age criteria qualification experience language पात्रता योग्यता आयु उम्र आवश्यकता',
  documents: 'documents document cv resume upload certificate certificates passport experience letter file size पात्र दस्तावेज़ सीवी रिज़्यूमे प्रमाणपत्र',
  apply: 'apply application how register registration form process steps step id online start आवेदन कैसे प्रक्रिया पंजीकरण फ़ॉर्म चरण',
  status: 'status track application id follow up update progress स्थिति आईडी अपडेट',
  employer: 'employer employers hire hiring manpower recruit recruitment business company workforce नियोक्ता भर्ती कर्मचारी',
  why: 'why choose trust ethical transparent benefits different reliable क्यों भरोसा पारदर्शी नैतिक',
  vision: 'vision mission goal values commitment दृष्टि मिशन लक्ष्य मूल्य प्रतिबद्धता',
  registration: 'registration registered cin incorporation incorporated mca legal genuine verify पंजीकरण पंजीकृत सीआईएन',
  languages: 'language languages hindi punjabi english भाषा हिंदी पंजाबी अंग्रेज़ी',
  contact: 'contact address office phone email call reach location where whatsapp hours map संपर्क पता कार्यालय फ़ोन ईमेल',
  openings: 'openings vacancies vacancy current jobs available positions रिक्तियाँ रिक्ति नौकरियाँ पद',
};

/**
 * @param {object} dict   Full site dictionary for one language (en.js / hi.js)
 * @param {object} extra  { services: [{title, summary}], settings: {...} }
 * @returns {Array<{id,title,text,bullets,link,keywords}>}
 */
export function buildKnowledge(dict, { services = [], settings = {} } = {}) {
  const t = (key, vars) => translate(dict, key, vars);
  const chunks = [];
  const add = (id, chunk) => chunks.push({ id, bullets: [], keywords: KEYWORDS[id] || '', ...chunk });

  add('company', {
    title: t('site.home.about.title'),
    text: arr(t('about.who.paragraphs'))[0] || t('site.footer.profile'),
    bullets: [t('site.home.about.cardText')],
    link: { label: t('nav.about'), to: PATHS.about },
  });

  add('services', {
    title: t('site.services.hero.title'),
    text: t('site.services.hero.text'),
    bullets: services.map((s) => (s.summary ? `${s.title} — ${s.summary}` : s.title)),
    link: { label: t('nav.services'), to: PATHS.services },
  });

  add('education', {
    title: t('education.hero.title'),
    text: t('education.hero.intro'),
    bullets: arr(t('education.guidance.steps')).map((s) => `${s.title}: ${s.text}`),
    link: { label: t('nav.services'), to: `${PATHS.services}#education` },
  });

  add('consider', {
    title: t('education.consider.title'),
    text: t('education.consider.intro'),
    bullets: arr(t('education.consider.items')).map((s) => `${s.title}: ${s.text}`),
    link: { label: t('nav.services'), to: `${PATHS.services}#education` },
  });

  add('studentDocs', {
    title: t('education.documents.title'),
    text: t('education.documents.intro'),
    bullets: arr(t('education.documents.items')),
    link: { label: t('nav.services'), to: `${PATHS.services}#education` },
  });

  add('opportunities', {
    title: t('opportunities.hero.title'),
    text: `${t('opportunities.hero.intro')} ${t('opportunities.sectors.intro')}`,
    bullets: [
      ...arr(t('opportunities.audience.items')).map((s) => `${s.title}: ${s.text}`),
      `${t('opportunities.sectors.title')}: ${SECTORS.filter((s) => s !== 'other')
        .map((s) => t(`options.sector.${s}`))
        .join(', ')}`,
    ],
    link: { label: t('nav.services'), to: `${PATHS.services}#opportunities` },
  });

  add('eligibility', {
    title: t('site.requirements.cards.general.title'),
    text: t('site.requirements.hero.text'),
    bullets: [
      ...arr(t('site.requirements.cards.general.items')),
      ...arr(t('site.requirements.cards.professional.items')),
    ],
    link: { label: t('nav.requirements'), to: PATHS.requirements },
  });

  add('documents', {
    title: t('site.requirements.cards.documents.title'),
    text: arr(t('site.contact.faqs'))[1]?.a || '',
    bullets: arr(t('site.requirements.cards.documents.items')),
    link: { label: t('nav.requirements'), to: PATHS.requirements },
  });

  add('apply', {
    title: t('site.process.hero.title'),
    text: arr(t('site.contact.faqs'))[0]?.a || t('site.process.hero.text'),
    bullets: arr(t('site.processSteps')).map((s) => `${s.title}: ${s.text}`),
    link: { label: t('common.applyNow'), to: PATHS.apply },
  });

  add('status', {
    title: arr(t('site.contact.faqs'))[2]?.q || '',
    text: arr(t('site.contact.faqs'))[2]?.a || '',
    bullets: [],
    link: { label: t('nav.contact'), to: PATHS.contact },
  });

  add('employer', {
    title: t('employer.hero.title'),
    text: t('employer.hero.text'),
    bullets: [arr(t('about.approach.items'))[0]?.text, arr(t('site.contact.faqs'))[3]?.a].filter(Boolean),
    link: { label: t('nav.employer'), to: PATHS.employer },
  });

  add('why', {
    title: t('about.why.title'),
    text: t('site.whyUs.hero.text'),
    bullets: arr(t('about.why.items')).map((s) => `${s.title}: ${s.text}`),
    link: { label: t('nav.whyUs'), to: PATHS.whyUs },
  });

  add('vision', {
    title: `${t('about.vision.title')} / ${t('about.mission.title')}`,
    text: t('about.commitment.statement'),
    bullets: [`${t('about.vision.title')}: ${t('about.vision.text')}`, `${t('about.mission.title')}: ${t('about.mission.text')}`],
    link: { label: t('nav.about'), to: PATHS.about },
  });

  add('registration', {
    title: t('site.registration.title'),
    text: `${t('site.badge.line1')} · ${t('site.badge.line2')}`,
    bullets: arr(t('about.who.facts')).map((f) => `${f.label}: ${f.value}`),
    link: { label: t('nav.about'), to: PATHS.about },
  });

  add('languages', {
    title: arr(t('site.contact.faqs'))[4]?.q || '',
    text: arr(t('site.contact.faqs'))[4]?.a || '',
    link: { label: t('nav.home'), to: PATHS.home },
  });

  const contactBullets = [`${t('contact.details.office')}: ${settings.office_address || REGISTERED_OFFICE_TEXT}`];
  if (settings.contact_phone) contactBullets.push(`${t('contact.details.phone')}: ${settings.contact_phone}`);
  if (settings.contact_whatsapp) contactBullets.push(`${t('contact.details.whatsapp')}: ${settings.contact_whatsapp}`);
  if (settings.contact_email) contactBullets.push(`${t('contact.details.email')}: ${settings.contact_email}`);
  if (settings.office_hours) contactBullets.push(`${t('contact.details.hours')}: ${settings.office_hours}`);
  add('contact', {
    title: t('contact.details.title'),
    text:
      settings.contact_phone || settings.contact_email
        ? t('contact.hero.intro')
        : t('contact.details.pending'),
    bullets: contactBullets,
    link: { label: t('nav.contact'), to: PATHS.contact },
  });

  add('openings', {
    title: t('site.requirements.openingsTitle'),
    text: `${t('careers.hero.intro')} ${t('careers.empty.text')}`,
    link: { label: t('site.requirements.openingsTitle'), to: `${PATHS.requirements}#openings` },
  });

  return chunks.filter((c) => c.title || c.text);
}

/** Company constants exposed for the server prompt (no secrets). */
export const COMPANY_FACTS = {
  cin: COMPANY.cin,
  incorporatedOn: COMPANY.incorporatedOn,
  office: REGISTERED_OFFICE_TEXT,
};
