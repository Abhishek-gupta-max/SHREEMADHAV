// Copy for the seven-page site structure (Home, About, Services, Process,
// Why Us, Requirements, Contact), its header and footer. Merged into en.js
// under the `site` key. Only ShreeMadhav's own information appears here.

const siteEn = {
  seo: {
    process: {
      title: 'Our Process',
      description:
        'How ShreeMadhav Overseas Solutions works: online application, application ID, profile review, guidance, documentation and ongoing support.',
    },
    whyUs: {
      title: 'Why Choose Us',
      description:
        'Professional, transparent and ethical overseas recruitment support from ShreeMadhav Overseas Solutions Private Limited, Chandigarh.',
    },
    requirements: {
      title: 'Requirements',
      description:
        'Eligibility, qualifications and documents needed to apply for overseas opportunities with ShreeMadhav Overseas Solutions, plus current openings.',
    },
  },

  notice: {
    label: 'Company Info',
    items: [
      'Registered under the Companies Act, 2013',
      'CIN: {cin}',
      'Registered Office: {address}',
      'Apply online and receive your application ID instantly',
      'Connecting Talent with Global Opportunities',
    ],
  },

  badge: {
    line1: 'Private Limited Company',
    line2: 'Registered under the Companies Act, 2013',
    line3: 'CIN: {cin}',
  },

  drawer: {
    menu: 'Menu Links',
    action: 'Action',
    contact: 'Contact Info',
    company: 'Registered Company',
  },

  footer: {
    ctaTitle: 'Ready to Start Your Global Career?',
    ctaText: 'Apply online in a few minutes and receive your application ID instantly.',
    talk: 'Talk to Us',
    quickLinks: 'Quick Links',
    services: 'Our Services',
    contact: 'Contact Us',
    legal: 'Legal',
    backToTop: 'Back to Top',
    profile:
      'ShreeMadhav Overseas Solutions Private Limited is a professionally managed overseas recruitment and manpower solutions company committed to transparency and ethical recruitment practices.',
  },

  facts: [
    { value: 'Pvt. Ltd.', label: 'Registered Company', text: 'Registered under the Companies Act, 2013' },
    { value: '2026', label: 'Year of Incorporation', text: 'Incorporated on 24 June 2026' },
    { value: 'Chandigarh', label: 'Registered Office', text: 'SCO 156-157, Sector 34A' },
    { value: '3', label: 'Website Languages', text: 'English, Hindi and Punjabi' },
  ],

  registration: {
    badge: 'Official Registration',
    title: 'Company Registration',
    text: 'Our registration details can be verified on the Ministry of Corporate Affairs portal.',
    cards: [
      { title: 'Certificate of Incorporation', subtitle: 'Ministry of Corporate Affairs', value: '24 June 2026' },
      { title: 'Corporate Identity Number', subtitle: 'CIN', value: '{cin}' },
      { title: 'Registered Office', subtitle: 'Chandigarh, India', value: '{address}' },
    ],
    verify: 'Verify on MCA',
    barLabel: 'Our commitment to compliance',
    barTitle: 'Registered Private Limited Company',
    barRight: 'Registered with',
    barRightValue: 'Ministry of Corporate Affairs',
  },

  processSteps: [
    { title: 'Online Application', text: 'Fill in the secure online form with your details, preferences and CV.' },
    { title: 'Application ID', text: 'Receive your unique application ID instantly for all future communication.' },
    { title: 'Profile Review', text: 'Our team reviews your qualifications, experience and goals.' },
    { title: 'Guidance & Options', text: 'We explain suitable options, requirements and realistic next steps.' },
    { title: 'Documentation', text: 'We help you prepare and organise the documents your application needs.' },
    { title: 'Employer Coordination', text: 'We work with employers to match your profile with their workforce requirements.' },
    { title: 'Status Updates', text: 'We keep you informed by phone or email as your application progresses.' },
    { title: 'Ongoing Support', text: 'Structured assistance throughout the recruitment process.' },
  ],

  home: {
    hero: {
      title: 'Connecting Talent with Global Opportunities',
      text: 'A professionally managed overseas recruitment and manpower solutions company connecting skilled, semi-skilled and qualified professionals with genuine employment opportunities across international markets.',
      secondary: 'Why Us',
      badges: ['Registered Private Limited Company', 'Transparent & Systematic Process', 'Ethical Recruitment Practices'],
    },
    services: {
      title: 'Our Services',
      text: 'Professional support for overseas recruitment, international opportunities and education',
      viewAll: 'View All Services',
    },
    about: {
      badge: 'Who We Are',
      title: 'About ShreeMadhav',
      subtitle: 'Your overseas recruitment partner in Chandigarh, India',
      heading: 'Your Professional Overseas Recruitment Partner',
      cardTitle: 'ShreeMadhav Overseas Solutions',
      cardRole: 'Private Limited Company · Chandigarh',
      cardText:
        'We work closely with employers to understand their workforce requirements and guide candidates with accurate information and structured assistance.',
      featureTitle: 'Registered under the Companies Act, 2013',
      featureText: 'Incorporated on 24 June 2026 with the Ministry of Corporate Affairs, Government of India.',
      more: 'Read More About Us',
    },
    why: {
      title: 'Why Choose Us',
      text: 'Professional, transparent and ethical recruitment support at every stage',
    },
    cta: {
      title: 'Ready to Start Your Journey?',
      text: 'Apply online in a few minutes. You will receive an application ID to use in all future communication with our team.',
    },
  },

  about: {
    hero: {
      title: 'About ShreeMadhav',
      text: 'Your professional partner in overseas recruitment and manpower solutions',
    },
    commitmentItems: [
      'Professionalism in all our operations',
      'Transparency at every stage',
      'Ethical recruitment practices',
      'Client satisfaction as our priority',
    ],
    values: {
      title: 'Our Values',
      text: 'Professionalism, transparency, ethics and long-term relationships built on trust, communication and quality service.',
    },
    whyTitle: 'Why Choose ShreeMadhav',
    cta: {
      title: 'Get in Touch',
      text: 'Ready to explore overseas opportunities? Contact us today and our team will respond.',
    },
  },

  services: {
    hero: {
      title: 'Our Services',
      text: 'Overseas recruitment, international opportunities and education support tailored to your needs',
    },
    apply: 'Apply Now',
    education: {
      badge: 'Overseas Education',
      considerTitle: 'What to Consider Before You Decide',
      documentsTitle: 'Documents Students Typically Prepare',
    },
    opportunities: {
      badge: 'International Opportunities',
      sectorsTitle: 'Sectors Candidates Commonly Explore',
    },
    processTitle: 'Our Recruitment Process',
    cta: {
      title: 'Ready to Get Started?',
      text: 'Whether you are a candidate or an employer, our team is ready to help.',
      button: 'Request a Consultation',
    },
  },

  process: {
    hero: {
      title: 'Our Process',
      text: 'A transparent, systematic journey from application to ongoing support',
    },
    howTitle: 'How We Work',
    stagesTitle: 'Stage by Stage',
    stages: [
      {
        title: 'Stage 1: Getting Started',
        badge: 'You need: CV and contact details',
        text: 'Submit your application online in about ten minutes and keep the application ID you receive.',
      },
      {
        title: 'Stage 2: Profile Review',
        badge: 'Handled by: Our team',
        text: 'We review your qualifications, experience and preferences against suitable opportunities.',
      },
      {
        title: 'Stage 3: Preparation',
        badge: 'You need: Certificates, passport or ID, experience letters',
        text: 'We explain the requirements that apply to you and help you organise your documents.',
      },
      {
        title: 'Stage 4: Matching',
        badge: 'Handled by: Our team and employers',
        text: 'We work with employers to understand their workforce requirements and identify suitable candidates.',
      },
      {
        title: 'Stage 5: Next Steps',
        badge: 'Updates by: Phone or email',
        text: 'We keep you informed and provide structured assistance throughout the recruitment process.',
      },
    ],
    worksTitle: 'Why Our Process Works',
    works: [
      { icon: '🎯', title: 'Transparent', text: 'Clear information about requirements and next steps at every stage.' },
      { icon: '⚙️', title: 'Systematic', text: 'A defined process, with every application tracked by its own ID.' },
      { icon: '🤝', title: 'Reliable', text: 'Consistent follow-through and clear communication with every candidate.' },
    ],
    cta: {
      title: 'Ready to Begin Your Journey?',
      text: 'Start your application now and take the first step towards an overseas career.',
    },
  },

  whyUs: {
    hero: {
      title: 'Why Choose Us',
      text: 'Professional, transparent and ethical overseas recruitment support',
    },
    apartTitle: 'What Sets Us Apart',
    commitmentTitle: 'Our Commitment to You',
    commitment: [
      {
        icon: '🎯',
        title: 'Professionalism',
        text: 'A structured, professional approach to every application and every employer requirement.',
      },
      {
        icon: '🤝',
        title: 'Ethical Partnership',
        text: 'We are committed to ethical recruitment practices and honest, clear communication.',
      },
      {
        icon: '🌍',
        title: 'Long-term Relationships',
        text: 'Lasting relationships with candidates, employers and international partners, built on trust and quality service.',
      },
    ],
    wordsTitle: 'In Our Own Words',
    words: ['Our Commitment', 'Our Vision', 'Our Mission'],
    cta: {
      title: 'Start Your Overseas Career Journey',
      text: 'Apply online today and our team will review your profile.',
    },
  },

  requirements: {
    hero: {
      title: 'Requirements',
      text: 'Check what you need before applying for overseas opportunities',
    },
    cards: {
      general: {
        title: 'General Eligibility',
        items: [
          'Applicants aged 16 to 70 years',
          'A valid email address and phone number',
          'Willingness to work or study in an international environment',
          'Consent to share your details for processing your application',
        ],
      },
      professional: {
        title: 'Professional Qualifications',
        items: [
          'Educational qualifications relevant to the position',
          'Work experience as required for the role',
          'Relevant certifications or trade licences',
          'Language skills as required by the employer or institution',
        ],
      },
      documents: {
        title: 'Documentation Needed',
        items: [
          'Up-to-date CV or resume (PDF or Word, up to 5 MB)',
          'Valid passport or government ID',
          'Educational certificates and mark sheets',
          'Experience letters from previous employers',
          'Professional licences or trade certificates',
          'Up to 4 supporting documents with your application',
        ],
      },
      process: {
        title: 'Application Process',
        rows: [
          { title: 'Apply Online', text: 'Complete the online form in about ten minutes' },
          { title: 'Application ID', text: 'Issued instantly when you submit' },
          { title: 'Profile Review', text: 'Our team reviews your details and documents' },
          { title: 'Follow-up', text: 'We contact you by phone or email about next steps' },
        ],
      },
    },
    openingsTitle: 'Current Openings',
    cta: {
      title: 'Check Your Eligibility',
      text: 'Not sure if you qualify? Contact us and our team will guide you.',
      button: 'Contact Us',
    },
  },

  contact: {
    hero: {
      title: 'Get in Touch',
    },
    officeTitle: 'Our Office',
    callTitle: 'Call Us',
    emailTitle: 'Email Us',
    pending: 'Will be published shortly. Please use the form below and we will respond by email.',
    emailNote: 'We respond to messages by email.',
    whatsapp: 'WhatsApp',
    hoursTitle: 'Business Hours',
    howTitle: 'How It Works',
    formTitle: 'Send us a Message',
    mapTitle: 'Find Us on Map',
    mapLabel: 'Map showing the ShreeMadhav Overseas Solutions registered office in Sector 34A, Chandigarh',
    whyTitle: 'Why Contact Us?',
    why: [
      { title: 'Clear Guidance', text: 'Get accurate information about requirements, documents and next steps.' },
      { title: 'Application Follow-up', text: 'Already applied? Quote your application ID and we will look it up.' },
      { title: 'For Employers', text: 'Share your workforce requirements and our team will get in touch.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'How do I apply?',
        a: 'Click "Apply Now", complete the five-step online form and upload your CV. You will receive an application ID as soon as you submit.',
      },
      {
        q: 'What documents do I need?',
        a: 'A CV or resume in PDF or Word format (up to 5 MB). You can also upload up to four supporting documents such as certificates, experience letters or your passport.',
      },
      {
        q: 'How will I know the status of my application?',
        a: 'Our team reviews every application and contacts candidates by phone or email about suitable next steps. Please quote your application ID whenever you contact us.',
      },
      {
        q: 'I am an employer. How can I work with you?',
        a: 'Use the contact form and choose "Employer / business partnership" as the topic, with a short outline of your workforce requirements.',
      },
      {
        q: 'Is the website available in other languages?',
        a: 'Yes. Use the language selector at the top of the page to view the website in English, Hindi or Punjabi.',
      },
    ],
    cta: {
      title: 'Ready to Start Your Journey?',
      text: 'Apply now or send us a message about the opportunities you are interested in.',
    },
  },
};

export default siteEn;
