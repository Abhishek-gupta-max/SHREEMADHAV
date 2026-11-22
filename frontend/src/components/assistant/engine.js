// Answer engine for the assistant.
//
// Two providers sit behind one `answerQuestion()` call:
//
//  1. Server AI (optional) — POST /api/assistant/chat on this site's own
//     backend, which forwards to a free self-hosted model (e.g. Ollama). It is
//     used only when GET /api/assistant/status reports it as enabled. No API
//     key ever reaches the browser.
//  2. Demo mode (always available) — finds the website sections that best
//     match the question and returns that verified website text, clearly
//     labelled as matched content rather than AI-generated.
//
// Rules applied in both modes: never invent universities, courses, fees,
// scholarships, deadlines, visa rules or success rates; never guarantee an
// outcome; point visitors to the team for anything the website doesn't state.

import { api } from '../../services/api.js';
import { PATHS } from '../../constants/publicRoutes.js';

/* ---------------------------------------------------------------- Text utils */

const DEVANAGARI = /[ऀ-ॿ]/;

const STOPWORDS = new Set(
  (
    'a an the is are am was were be been being i me my we our you your he she it they them to of in on at for from by with ' +
    'and or but if so do does did can could would should will shall may might must have has had what which who whom whose ' +
    'how when where why this that these those there here about into than then also just any some please tell know want need ' +
    'get give like more most much many very really there its it\'s im i\'m you\'re hi hello hey ' +
    'है हैं था थे हो के का की को से में पर और या भी तो क्या कैसे कौन कब कहाँ कहां क्यों यह वह ये वो मैं मुझे मेरा मेरी हम आप आपका आपकी आपके कृपया बताइए बताएं बताओ चाहिए एक लिए करें करना कर रहा रही रहे'
  ).split(/\s+/),
);

function stem(word) {
  if (DEVANAGARI.test(word) || word.length <= 4) return word;
  return word.replace(/(ings|ing|ies|es|s|ed)$/, (m) => (m === 'ies' ? 'y' : '')) || word;
}

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map(stem);
}

/* ------------------------------------------------------------------ Intents */

const INTENTS = {
  greeting: /^\s*(hi|hello|hey|hii+|namaste|namaskar|good (morning|afternoon|evening))\b|^\s*(नमस्ते|नमस्कार|हैलो|हेलो)/i,
  thanks: /\b(thanks|thank you|thx|ty)\b|धन्यवाद|शुक्रिया/i,
  human: /\bare you (a |an )?(real|human|person|bot|robot|ai|machine)\b|\bwho are you\b|आप कौन|क्या आप इंसान|रोबोट/i,
  consult:
    /consult|counsel+ing|counsel+or|appointment|book (a|an)? ?(call|session|meeting)|call ?back|call me|talk to (an? )?(advisor|adviser|counsel+or|someone|human|person|expert|team)|speak (to|with)|admission (help|assistance|support)|help me (apply|with (my )?admission)|परामर्श|काउंसलिंग|सलाहकार से|बात करनी|बात करना|संपर्क करवाएँ/i,
};

// Topics the website does not publish details for. Each maps to an honest
// "not published, please ask the team" answer plus the related website section.
const POLICY = [
  {
    id: 'universities',
    test: /universit|college|institut|\bcourses?\b|programme|\bprograms?\b|\bdegree|\bmasters?\b|bachelor|\bmba\b|\bmsc\b|\bbsc\b|diploma|विश्वविद्यालय|यूनिवर्सिटी|कॉलेज|कोर्स|डिग्री|संस्थान/i,
    related: 'education',
    en: 'The website does not publish a list of partner universities, institutions or courses, so I cannot name specific ones. Shortlisting courses and institutions that fit your profile is part of our guidance — our team can discuss options for your background.',
    hi: 'वेबसाइट पर साझेदार विश्वविद्यालयों, संस्थानों या कोर्स की सूची प्रकाशित नहीं है, इसलिए मैं किसी विशेष नाम की जानकारी नहीं दे सकता। आपकी प्रोफ़ाइल के अनुरूप कोर्स और संस्थान चुनना हमारे मार्गदर्शन का हिस्सा है — हमारी टीम आपसे विकल्पों पर चर्चा कर सकती है।',
  },
  {
    id: 'fees',
    test: /\bfees?\b|\bcosts?\b|price|charges?\b|tuition|expens|how much|afford|budget|rupees|\binr\b|फीस|शुल्क|खर्च|कीमत|कितना|कितने पैसे/i,
    related: 'consider',
    en: 'The website does not publish tuition fees, living costs or service charges. Total cost over the full course is one of the factors we help you weigh. Please contact our team for figures that apply to you.',
    hi: 'वेबसाइट पर ट्यूशन फीस, रहने का खर्च या सेवा शुल्क प्रकाशित नहीं हैं। पूरे कोर्स का कुल खर्च उन बातों में से एक है जिन्हें परखने में हम मदद करते हैं। आपके लिए लागू आँकड़ों के लिए कृपया हमारी टीम से संपर्क करें।',
  },
  {
    id: 'scholarships',
    test: /scholar|\bloans?\b|financ|funding|\bgrants?\b|bursar|financial aid|छात्रवृत्ति|स्कॉलरशिप|लोन|ऋण|आर्थिक सहायता/i,
    related: 'consider',
    en: 'The website does not publish scholarship, loan or financial-aid details. Our team can talk you through financial planning for your case, but no scholarship or funding can be guaranteed.',
    hi: 'वेबसाइट पर छात्रवृत्ति, लोन या आर्थिक सहायता की जानकारी प्रकाशित नहीं है। हमारी टीम आपके मामले में वित्तीय योजना पर बात कर सकती है, लेकिन किसी छात्रवृत्ति या फंडिंग की गारंटी नहीं दी जा सकती।',
  },
  {
    id: 'visa',
    test: /\bvisas?\b|immigration|embassy|consulate|work permit|study permit|\bpr\b|residen|वीज़ा|वीजा|दूतावास|इमिग्रेशन/i,
    related: 'services',
    en: 'Visa rules differ by country and change over time, and the website does not publish specific visa requirements or processing times. Our team can explain the pathway relevant to you — always confirm current rules with the official embassy or immigration authority. Visa decisions are made by the authorities, so approval cannot be guaranteed.',
    hi: 'वीज़ा नियम हर देश में अलग होते हैं और बदलते रहते हैं, और वेबसाइट पर विशेष वीज़ा आवश्यकताएँ या प्रोसेसिंग समय प्रकाशित नहीं हैं। हमारी टीम आपके लिए प्रासंगिक प्रक्रिया समझा सकती है — वर्तमान नियम हमेशा आधिकारिक दूतावास या इमिग्रेशन प्राधिकरण से पुष्टि करें। वीज़ा का निर्णय अधिकारी करते हैं, इसलिए स्वीकृति की गारंटी नहीं दी जा सकती।',
  },
  {
    id: 'deadlines',
    test: /deadline|\bintakes?\b|last date|closing date|semester|session start|when (does|do|will).*(start|open|begin)|अंतिम तिथि|आखिरी तारीख|इनटेक|सत्र/i,
    related: 'consider',
    en: 'The website does not publish admission deadlines or intake dates — they vary by institution and course. Planning around application windows is part of our guidance, so please check with our team early.',
    hi: 'वेबसाइट पर प्रवेश की अंतिम तिथियाँ या इनटेक तिथियाँ प्रकाशित नहीं हैं — ये संस्थान और कोर्स के अनुसार बदलती हैं। आवेदन अवधि के अनुसार योजना बनाना हमारे मार्गदर्शन का हिस्सा है, इसलिए कृपया जल्दी हमारी टीम से संपर्क करें।',
  },
  {
    id: 'destinations',
    test: /destination|which countr|what countr|countries|where can i (study|go|work)|\bcanada\b|australia|\buk\b|united kingdom|england|\busa\b|\bus\b|america|germany|ireland|new zealand|europe|dubai|\buae\b|देश|कनाडा|ऑस्ट्रेलिया|अमेरिका|जर्मनी|इंग्लैंड|यूरोप/i,
    related: 'consider',
    en: 'The website does not list specific destination countries or partner institutions there. When you apply, you can choose a preferred country — or “Open to suggestions” — and our team discusses the options that suit your profile.',
    hi: 'वेबसाइट पर विशेष गंतव्य देशों या वहाँ के साझेदार संस्थानों की सूची नहीं है। आवेदन करते समय आप पसंदीदा देश — या “सुझावों के लिए खुला” — चुन सकते हैं, और हमारी टीम आपकी प्रोफ़ाइल के अनुसार विकल्पों पर चर्चा करती है।',
  },
  {
    id: 'guarantee',
    test: /guarant|success rate|\bsure\b|100 ?%|assur|pakka|गारंटी|पक्का|निश्चित|सफलता दर/i,
    related: 'why',
    en: 'No admission, scholarship, job or visa outcome can be guaranteed — those decisions are made by institutions, employers and government authorities. The website does not publish success rates. What we do commit to is a transparent, systematic and ethical process.',
    hi: 'प्रवेश, छात्रवृत्ति, नौकरी या वीज़ा के परिणाम की गारंटी नहीं दी जा सकती — ये निर्णय संस्थान, नियोक्ता और सरकारी अधिकारी लेते हैं। वेबसाइट पर सफलता दर प्रकाशित नहीं है। हम पारदर्शी, व्यवस्थित और नैतिक प्रक्रिया के लिए प्रतिबद्ध हैं।',
  },
];

const CANNED = {
  greeting: {
    en: 'Hello! I can explain our services, how to apply, eligibility, documents and contact details, or help you request a consultation. What would you like to know?',
    hi: 'नमस्ते! मैं हमारी सेवाएँ, आवेदन का तरीका, पात्रता, दस्तावेज़ और संपर्क विवरण समझा सकता हूँ, या परामर्श का अनुरोध करने में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?',
  },
  thanks: {
    en: 'You are welcome! Ask me anything else about our services, or request a consultation whenever you are ready.',
    hi: 'आपका स्वागत है! हमारी सेवाओं के बारे में कुछ और पूछें, या जब चाहें परामर्श का अनुरोध करें।',
  },
  human: {
    en: 'I am an automated AI assistant for ShreeMadhav Overseas Solutions — not a person or a member of staff. I explain information published on this website. For advice on your own case, please request a consultation with our team.',
    hi: 'मैं ShreeMadhav Overseas Solutions का एक स्वचालित AI सहायक हूँ — कोई व्यक्ति या स्टाफ़ सदस्य नहीं। मैं इस वेबसाइट पर प्रकाशित जानकारी समझाता हूँ। अपने मामले की सलाह के लिए कृपया हमारी टीम से परामर्श का अनुरोध करें।',
  },
  consult: {
    en: 'I can help you request a consultation with our team. Use the button below to share your details — your request is sent through the website’s enquiry system, and our team will contact you.',
    hi: 'मैं हमारी टीम से परामर्श का अनुरोध करने में आपकी मदद कर सकता हूँ। नीचे दिए बटन से अपना विवरण साझा करें — आपका अनुरोध वेबसाइट की संपर्क प्रणाली से भेजा जाएगा और हमारी टीम संपर्क करेगी।',
  },
  notFound: {
    en: 'I could not find that in the website content, so I would rather not guess. Our team can answer it directly — you can request a consultation or use the contact page. You can also ask me about services, the application process, eligibility, documents or contact details.',
    hi: 'मुझे यह जानकारी वेबसाइट की सामग्री में नहीं मिली, इसलिए मैं अनुमान नहीं लगाऊँगा। हमारी टीम इसका सीधा उत्तर दे सकती है — आप परामर्श का अनुरोध कर सकते हैं या संपर्क पेज का उपयोग कर सकते हैं। आप मुझसे सेवाएँ, आवेदन प्रक्रिया, पात्रता, दस्तावेज़ या संपर्क विवरण के बारे में भी पूछ सकते हैं।',
  },
};

/* ---------------------------------------------------------------- Retrieval */

const indexCache = new WeakMap();

function indexFor(chunks) {
  if (indexCache.has(chunks)) return indexCache.get(chunks);
  const index = chunks.map((chunk) => {
    const weights = new Map();
    const addTokens = (text, weight) =>
      tokenize(text).forEach((tok) => weights.set(tok, Math.max(weights.get(tok) || 0, weight)));
    addTokens(chunk.text, 1);
    addTokens(chunk.bullets.join(' '), 1);
    addTokens(chunk.title, 2);
    addTokens(chunk.keywords, 2.5);
    return { chunk, weights };
  });
  indexCache.set(chunks, index);
  return index;
}

/** Returns chunks ranked by relevance to the question (best first). */
export function search(chunks, question, limit = 3) {
  const query = [...new Set(tokenize(question))];
  if (!query.length) return [];
  const scored = indexFor(chunks).map(({ chunk, weights }) => {
    let score = 0;
    for (const q of query) {
      if (weights.has(q)) {
        score += weights.get(q);
        continue;
      }
      // Partial match for longer words ("eligib" ~ "eligibility").
      if (q.length >= 5) {
        for (const [tok, w] of weights) {
          if (tok.length >= 5 && (tok.startsWith(q) || q.startsWith(tok))) {
            score += w * 0.6;
            break;
          }
        }
      }
    }
    return { chunk, score: score / Math.sqrt(query.length) };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.score || 0;
  if (top < 1.2) return [];
  return scored.filter((s) => s.score >= Math.max(1.2, top * 0.7)).slice(0, limit).map((s) => s.chunk);
}

/* --------------------------------------------------------------- Composition */

function chunkToParts(chunk, maxBullets = 8) {
  return {
    text: chunk.text,
    bullets: chunk.bullets.slice(0, maxBullets),
    link: chunk.link,
    source: chunk.title,
  };
}

/**
 * Local (demo-mode) answer. Deterministic: only website text and the honest
 * policy notes above are ever returned.
 */
export function localAnswer(question, { chunks, lang }) {
  const L = lang === 'hi' ? 'hi' : 'en';
  const actions = new Set();
  const intro = [];
  let parts = [];

  const policies = POLICY.filter((p) => p.test.test(question)).slice(0, 2);
  const wantsConsult = INTENTS.consult.test(question);

  if (INTENTS.human.test(question)) {
    intro.push(CANNED.human[L]);
    actions.add('consult');
  } else if (wantsConsult && !policies.length) {
    intro.push(CANNED.consult[L]);
    actions.add('consult');
  } else if (INTENTS.greeting.test(question) && tokenize(question).length <= 2) {
    return { text: CANNED.greeting[L], bullets: [], links: [], sources: [], actions: [], intent: 'greeting' };
  } else if (INTENTS.thanks.test(question) && tokenize(question).length <= 3) {
    return { text: CANNED.thanks[L], bullets: [], links: [], sources: [], actions: [], intent: 'thanks' };
  }

  policies.forEach((p) => intro.push(p[L]));
  if (policies.length) actions.add('consult');
  if (wantsConsult) actions.add('consult');

  // Website sections that answer (or relate to) the question.
  const found = search(chunks, question, 2);
  if (policies.length) {
    const related = chunks.find((c) => c.id === policies[0].related);
    if (related && !found.includes(related)) found.unshift(related);
  }
  parts = found.slice(0, 2).map((c, i) => chunkToParts(c, i === 0 ? 8 : 5));

  if (!intro.length && !parts.length) {
    return {
      text: CANNED.notFound[L],
      bullets: [],
      links: [{ label: chunks.find((c) => c.id === 'contact')?.link.label || 'Contact', to: PATHS.contact }],
      sources: [],
      actions: ['consult'],
      intent: 'notFound',
    };
  }

  const [first, second] = parts;
  const text = [intro.join(' '), first?.text].filter(Boolean).join('\n\n');
  const bullets = first?.bullets || [];
  const extra = second ? { text: second.text, bullets: second.bullets } : null;

  return {
    text,
    bullets,
    extra,
    links: parts.map((p) => p.link).filter(Boolean),
    sources: parts.map((p) => p.source).filter(Boolean),
    actions: [...actions],
    intent: policies[0]?.id || (wantsConsult ? 'consult' : 'content'),
    context: found,
  };
}

/* ------------------------------------------------------------ Server provider */

let statusPromise = null;

/** Asks the backend whether a self-hosted model is configured. Cached. */
export function getServerStatus() {
  if (!statusPromise) {
    statusPromise = api
      .get('/assistant/status')
      .then((r) => ({ enabled: Boolean(r.data?.enabled), model: r.data?.model || '' }))
      .catch(() => ({ enabled: false, model: '' }));
  }
  return statusPromise;
}

function contextFor(chunks) {
  return chunks
    .slice(0, 4)
    .map((c) => `## ${c.title}\n${c.text}\n${c.bullets.map((b) => `- ${b}`).join('\n')}\nPage: ${c.link?.to || ''}`)
    .join('\n\n')
    .slice(0, 6000);
}

/**
 * Main entry point used by the panel.
 * @returns {Promise<{text, bullets, extra?, links, sources, actions, mode: 'ai'|'demo'}>}
 */
export async function answerQuestion(question, { chunks, lang, history = [], signal }) {
  const local = localAnswer(question, { chunks, lang });
  const status = await getServerStatus();
  const smallTalk = local.intent === 'greeting' || local.intent === 'thanks';

  if (!status.enabled || smallTalk) return { ...local, mode: 'demo' };

  // Give the model the best-matching sections plus the general overview.
  const related = local.context?.length ? local.context : search(chunks, question, 3);
  const base = chunks.filter((c) => ['services', 'company', 'contact'].includes(c.id));
  const context = contextFor([...new Set([...related, ...base])]);

  try {
    const response = await api.post(
      '/assistant/chat',
      {
        question,
        language: lang,
        context,
        history: history.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 800) })),
      },
      { signal },
    );
    const text = String(response.data?.answer || '').trim();
    if (!text) throw new Error('Empty answer');
    return {
      text,
      bullets: [],
      links: local.links,
      sources: local.sources,
      actions: local.actions,
      mode: 'ai',
      model: status.model,
    };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    // Model unavailable right now — fall back to website content.
    return { ...local, mode: 'demo' };
  }
}

/** Plain text for speech synthesis (no bullets markup, sensible length). */
export function spokenText(answer) {
  const lines = [answer.text, ...(answer.bullets || [])];
  if (answer.extra) lines.push(answer.extra.text);
  return lines.filter(Boolean).join('. ').replace(/\s*—\s*/g, ', ').replace(/\.\s*\./g, '.').slice(0, 1600);
}
