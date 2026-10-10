// Seeds the initial service catalogue (English, Hindi, Punjabi).
// Only inserts services whose slug does not exist yet, so edits made in the
// admin panel are never overwritten. Usage: npm run db:seed
import { pool, withTransaction } from '../src/config/database.js';
import { ServiceModel } from '../src/models/service.model.js';

const SERVICES = [
  {
    slug: 'overseas-education-guidance',
    icon: 'graduation',
    featured: true,
    en: {
      title: 'Overseas Education Guidance',
      summary:
        'Structured guidance for students planning to study abroad, from choosing a course and institution to preparing a complete application.',
      body:
        'We help students understand their options, shortlist courses that match their academic background and goals, and prepare applications carefully and on time.',
    },
    hi: {
      title: 'विदेश शिक्षा मार्गदर्शन',
      summary:
        'विदेश में पढ़ाई की योजना बना रहे विद्यार्थियों के लिए व्यवस्थित मार्गदर्शन — कोर्स और संस्थान चुनने से लेकर पूरा आवेदन तैयार करने तक।',
      body:
        'हम विद्यार्थियों को उनके विकल्प समझने, उनकी शैक्षणिक पृष्ठभूमि और लक्ष्यों के अनुसार कोर्स चुनने और समय पर सावधानीपूर्वक आवेदन तैयार करने में सहायता करते हैं।',
    },
    pa: {
      title: 'ਵਿਦੇਸ਼ੀ ਸਿੱਖਿਆ ਮਾਰਗਦਰਸ਼ਨ',
      summary:
        'ਵਿਦੇਸ਼ ਵਿੱਚ ਪੜ੍ਹਾਈ ਦੀ ਯੋਜਨਾ ਬਣਾ ਰਹੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਿਵਸਥਿਤ ਮਾਰਗਦਰਸ਼ਨ — ਕੋਰਸ ਅਤੇ ਸੰਸਥਾ ਚੁਣਨ ਤੋਂ ਲੈ ਕੇ ਪੂਰੀ ਅਰਜ਼ੀ ਤਿਆਰ ਕਰਨ ਤੱਕ।',
      body:
        'ਅਸੀਂ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਉਨ੍ਹਾਂ ਦੇ ਵਿਕਲਪ ਸਮਝਣ, ਉਨ੍ਹਾਂ ਦੀ ਸਿੱਖਿਆ ਅਤੇ ਟੀਚਿਆਂ ਅਨੁਸਾਰ ਕੋਰਸ ਚੁਣਨ ਅਤੇ ਸਮੇਂ ਸਿਰ ਧਿਆਨ ਨਾਲ ਅਰਜ਼ੀ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਾਂ।',
    },
  },
  {
    slug: 'international-opportunity-support',
    icon: 'globe',
    featured: true,
    en: {
      title: 'International Opportunity Support',
      summary:
        'Support for candidates exploring work and career opportunities abroad, with clear information at every stage of the process.',
      body:
        'We assess each candidate’s profile, explain the steps involved and keep them informed as their application moves forward.',
    },
    hi: {
      title: 'अंतरराष्ट्रीय अवसर सहायता',
      summary:
        'विदेश में काम और करियर के अवसर तलाश रहे उम्मीदवारों के लिए सहायता, प्रक्रिया के हर चरण पर स्पष्ट जानकारी के साथ।',
      body:
        'हम हर उम्मीदवार की प्रोफ़ाइल का आकलन करते हैं, आवश्यक चरण समझाते हैं और आवेदन आगे बढ़ने पर उन्हें सूचित रखते हैं।',
    },
    pa: {
      title: 'ਅੰਤਰਰਾਸ਼ਟਰੀ ਮੌਕਿਆਂ ਲਈ ਸਹਾਇਤਾ',
      summary:
        'ਵਿਦੇਸ਼ ਵਿੱਚ ਕੰਮ ਅਤੇ ਕਰੀਅਰ ਦੇ ਮੌਕੇ ਲੱਭ ਰਹੇ ਉਮੀਦਵਾਰਾਂ ਲਈ ਸਹਾਇਤਾ, ਪ੍ਰਕਿਰਿਆ ਦੇ ਹਰ ਪੜਾਅ ’ਤੇ ਸਪਸ਼ਟ ਜਾਣਕਾਰੀ ਨਾਲ।',
      body:
        'ਅਸੀਂ ਹਰ ਉਮੀਦਵਾਰ ਦੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਮੁਲਾਂਕਣ ਕਰਦੇ ਹਾਂ, ਲੋੜੀਂਦੇ ਕਦਮ ਸਮਝਾਉਂਦੇ ਹਾਂ ਅਤੇ ਅਰਜ਼ੀ ਅੱਗੇ ਵਧਣ ’ਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਜਾਣੂ ਰੱਖਦੇ ਹਾਂ।',
    },
  },
  {
    slug: 'career-job-assistance',
    icon: 'briefcase',
    featured: true,
    en: {
      title: 'Career & Job Assistance',
      summary:
        'Practical help with CVs, role selection and preparation, so candidates present their experience clearly to prospective employers.',
      body:
        'From aligning a CV with the role to preparing for interviews, we help candidates put their best application forward.',
    },
    hi: {
      title: 'करियर और नौकरी सहायता',
      summary:
        'सीवी, भूमिका के चयन और तैयारी में व्यावहारिक सहायता, ताकि उम्मीदवार अपने अनुभव को संभावित नियोक्ताओं के सामने स्पष्ट रूप से रख सकें।',
      body:
        'सीवी को भूमिका के अनुरूप बनाने से लेकर साक्षात्कार की तैयारी तक, हम उम्मीदवारों को सर्वोत्तम आवेदन प्रस्तुत करने में सहायता करते हैं।',
    },
    pa: {
      title: 'ਕਰੀਅਰ ਅਤੇ ਨੌਕਰੀ ਸਹਾਇਤਾ',
      summary:
        'ਸੀਵੀ, ਭੂਮਿਕਾ ਦੀ ਚੋਣ ਅਤੇ ਤਿਆਰੀ ਵਿੱਚ ਵਿਹਾਰਕ ਮਦਦ, ਤਾਂ ਜੋ ਉਮੀਦਵਾਰ ਆਪਣਾ ਤਜਰਬਾ ਸੰਭਾਵੀ ਮਾਲਕਾਂ ਸਾਹਮਣੇ ਸਪਸ਼ਟ ਰੂਪ ਵਿੱਚ ਰੱਖ ਸਕਣ।',
      body:
        'ਸੀਵੀ ਨੂੰ ਭੂਮਿਕਾ ਅਨੁਸਾਰ ਢਾਲਣ ਤੋਂ ਲੈ ਕੇ ਇੰਟਰਵਿਊ ਦੀ ਤਿਆਰੀ ਤੱਕ, ਅਸੀਂ ਉਮੀਦਵਾਰਾਂ ਨੂੰ ਵਧੀਆ ਅਰਜ਼ੀ ਪੇਸ਼ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਾਂ।',
    },
  },
  {
    slug: 'candidate-guidance',
    icon: 'user-check',
    en: {
      title: 'Candidate Guidance',
      summary:
        'One-to-one guidance that helps candidates understand requirements, timelines and realistic next steps before they commit.',
    },
    hi: {
      title: 'उम्मीदवार मार्गदर्शन',
      summary:
        'व्यक्तिगत मार्गदर्शन, जिससे उम्मीदवार कोई निर्णय लेने से पहले आवश्यकताएँ, समय-सीमा और व्यावहारिक अगले कदम समझ सकें।',
    },
    pa: {
      title: 'ਉਮੀਦਵਾਰ ਮਾਰਗਦਰਸ਼ਨ',
      summary:
        'ਨਿੱਜੀ ਮਾਰਗਦਰਸ਼ਨ, ਤਾਂ ਜੋ ਉਮੀਦਵਾਰ ਕੋਈ ਫ਼ੈਸਲਾ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਲੋੜਾਂ, ਸਮਾਂ-ਸੀਮਾ ਅਤੇ ਵਿਹਾਰਕ ਅਗਲੇ ਕਦਮ ਸਮਝ ਸਕਣ।',
    },
  },
  {
    slug: 'documentation-support',
    icon: 'file-check',
    en: {
      title: 'Documentation Support',
      summary:
        'Careful help organising, checking and preparing the documents an application needs, so nothing important is missed.',
    },
    hi: {
      title: 'दस्तावेज़ सहायता',
      summary:
        'आवेदन के लिए आवश्यक दस्तावेज़ों को व्यवस्थित करने, जाँचने और तैयार करने में सावधानीपूर्ण सहायता, ताकि कुछ भी महत्वपूर्ण न छूटे।',
    },
    pa: {
      title: 'ਦਸਤਾਵੇਜ਼ ਸਹਾਇਤਾ',
      summary:
        'ਅਰਜ਼ੀ ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਨੂੰ ਵਿਵਸਥਿਤ ਕਰਨ, ਜਾਂਚਣ ਅਤੇ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਧਿਆਨਪੂਰਵਕ ਮਦਦ, ਤਾਂ ਜੋ ਕੁਝ ਵੀ ਜ਼ਰੂਰੀ ਨਾ ਰਹਿ ਜਾਵੇ।',
    },
  },
  {
    slug: 'international-consultancy',
    icon: 'compass',
    en: {
      title: 'International Consultancy',
      summary:
        'Considered advice for individuals and families weighing international education or career decisions.',
    },
    hi: {
      title: 'अंतरराष्ट्रीय परामर्श',
      summary: 'अंतरराष्ट्रीय शिक्षा या करियर से जुड़े निर्णयों पर विचार कर रहे व्यक्तियों और परिवारों के लिए सोच-समझकर दी गई सलाह।',
    },
    pa: {
      title: 'ਅੰਤਰਰਾਸ਼ਟਰੀ ਸਲਾਹ-ਮਸ਼ਵਰਾ',
      summary: 'ਅੰਤਰਰਾਸ਼ਟਰੀ ਸਿੱਖਿਆ ਜਾਂ ਕਰੀਅਰ ਸਬੰਧੀ ਫ਼ੈਸਲਿਆਂ ’ਤੇ ਵਿਚਾਰ ਕਰ ਰਹੇ ਵਿਅਕਤੀਆਂ ਅਤੇ ਪਰਿਵਾਰਾਂ ਲਈ ਸੋਚ-ਸਮਝ ਕੇ ਦਿੱਤੀ ਸਲਾਹ।',
    },
  },
  {
    slug: 'employer-business-support',
    icon: 'handshake',
    en: {
      title: 'Employer & Business Support',
      summary:
        'A dependable point of contact for international employers and business partners looking for suitable candidates.',
    },
    hi: {
      title: 'नियोक्ता और व्यावसायिक सहायता',
      summary: 'उपयुक्त उम्मीदवारों की तलाश कर रहे अंतरराष्ट्रीय नियोक्ताओं और व्यावसायिक साझेदारों के लिए एक भरोसेमंद संपर्क।',
    },
    pa: {
      title: 'ਮਾਲਕ ਅਤੇ ਕਾਰੋਬਾਰੀ ਸਹਾਇਤਾ',
      summary: 'ਯੋਗ ਉਮੀਦਵਾਰਾਂ ਦੀ ਭਾਲ ਕਰ ਰਹੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਮਾਲਕਾਂ ਅਤੇ ਕਾਰੋਬਾਰੀ ਭਾਈਵਾਲਾਂ ਲਈ ਇੱਕ ਭਰੋਸੇਯੋਗ ਸੰਪਰਕ।',
    },
  },
];

async function seed() {
  let inserted = 0;
  for (const [index, service] of SERVICES.entries()) {
    if (await ServiceModel.slugExists(service.slug)) continue;
    await withTransaction(async (db) => {
      const id = await ServiceModel.create(
        { slug: service.slug, icon: service.icon, sortOrder: (index + 1) * 10, isFeatured: service.featured, isActive: true },
        db,
      );
      await ServiceModel.replaceTranslations(id, { en: service.en, hi: service.hi, pa: service.pa }, db);
    });
    inserted += 1;
  }
  console.log(`Services seeded: ${inserted} added, ${SERVICES.length - inserted} already present.`);
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
