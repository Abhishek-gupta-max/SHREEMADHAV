import { Link } from 'react-router-dom';
import { PATHS } from '../../constants/publicRoutes.js';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { LegalPage } from './LegalPage.jsx';

// Website terms of use. Have them reviewed by the company's legal adviser
// before launch.
const UPDATED = '2026-10-08';

const sections = [
  {
    id: 'about-these-terms',
    title: 'About these terms',
    body: (
      <p>
        These terms govern your use of this website, operated by ShreeMadhav Overseas Solutions Private Limited
        (CIN {COMPANY.cin}), registered office {REGISTERED_OFFICE_TEXT}. By using the website you agree to them. If you
        do not agree, please do not use the website.
      </p>
    ),
  },
  {
    id: 'information-on-this-website',
    title: 'Information on this website',
    body: (
      <p>
        The content of this website is general information about our services. It is not a guarantee of admission,
        employment, a visa or any other outcome. Requirements set by institutions, employers and authorities change, and
        we will confirm the details that apply to you individually.
      </p>
    ),
  },
  {
    id: 'applications-and-enquiries',
    title: 'Applications and enquiries',
    body: (
      <>
        <p>When you submit an application or enquiry, you confirm that:</p>
        <ul>
          <li>the information you provide is accurate and complete;</li>
          <li>you have the right to share any documents you upload; and</li>
          <li>you are at least 16 years old.</li>
        </ul>
        <p>
          Submitting an application does not create an obligation on either side. Your application ID is a reference for
          communication; it is not a confirmation of any offer or placement.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <p>
        You must not misuse the website, including by submitting false information, uploading harmful files, attempting
        to gain unauthorised access, or interfering with its operation.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <p>
        The text, design and branding of this website belong to ShreeMadhav Overseas Solutions Private Limited or are
        used under licence. You may not copy or reuse them for commercial purposes without permission.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        We work to keep the website accurate and available, but we do not guarantee that it will always be error-free or
        uninterrupted. To the extent permitted by law, we are not liable for losses arising from reliance on general
        website content.
      </p>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: (
      <p>
        Our use of personal information is described in our <Link to={PATHS.privacy}>Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts at
        Chandigarh.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms can be sent through our <Link to={PATHS.contact}>contact page</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      seoKey="terms"
      title="Terms & Conditions"
      intro="The terms that apply when you use this website and submit applications or enquiries."
      updated={UPDATED}
      sections={sections}
    />
  );
}
