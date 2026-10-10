import { Link } from 'react-router-dom';
import { PATHS } from '../../constants/publicRoutes.js';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { LegalPage } from './LegalPage.jsx';

// Plain-language privacy policy describing what this website actually does.
// Have it reviewed by the company's legal adviser before launch.
const UPDATED = '2026-10-08';

const sections = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <p>
        This website is operated by ShreeMadhav Overseas Solutions Private Limited (CIN {COMPANY.cin}), a private limited
        company with its registered office at {REGISTERED_OFFICE_TEXT} (“we”, “us”, “our”). This policy explains how we
        collect, use and protect personal information submitted through this website.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>We collect only the information you choose to give us:</p>
        <ul>
          <li>
            <strong>Applications:</strong> your name, email address, phone number, date of birth, gender, location,
            qualifications, work experience, preferences, any message you add, your CV and any supporting documents you
            upload.
          </li>
          <li>
            <strong>Contact enquiries:</strong> your name, email address, optional phone number, the subject and your
            message.
          </li>
          <li>
            <strong>Technical information:</strong> the IP address from which a form was submitted, kept to protect the
            service against abuse.
          </li>
        </ul>
        <p>
          We remember your language choice in your browser’s local storage, and keep an unfinished application form in
          your browser’s session storage until you close the tab. These stay on your device and are not sent to us until
          you submit.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use your information',
    body: (
      <ul>
        <li>To review your application and contact you about suitable education or career options.</li>
        <li>To respond to your enquiries.</li>
        <li>To keep records of our communication with you, referenced by your application ID.</li>
        <li>To keep the website secure and prevent misuse.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'When information is shared',
    body: (
      <p>
        We do not sell your personal information. Where pursuing an opportunity requires sharing your details with an
        institution or employer, we will discuss this with you first. We may also disclose information where required by
        law.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'How we protect your information',
    body: (
      <p>
        Information is transmitted over encrypted connections. Uploaded documents are stored in private storage that is
        not publicly accessible, and can only be opened by authorised staff after signing in. Access to our back-office
        system is password-protected and logged.
      </p>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <p>
        We keep application and enquiry records for as long as needed to provide our services and meet legal
        obligations. You can ask us to delete your information at any time, subject to any records we are legally
        required to keep.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your choices and rights',
    body: (
      <p>
        You may ask to see, correct or delete the personal information we hold about you, or withdraw your consent to
        further processing. Please <Link to={PATHS.contact}>contact us</Link> and quote your application ID if you have
        one. We handle personal information in line with the data protection laws applicable in India.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>We may update this policy from time to time. The date at the top of this page shows when it last changed.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      seoKey="privacy"
      title="Privacy Policy"
      intro="How ShreeMadhav Overseas Solutions collects, uses and protects the information you share with us."
      updated={UPDATED}
      sections={sections}
    />
  );
}
