import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { CtaCard, FactCards, HeroBanner, SectionHeading } from '../../components/site/Blocks.jsx';
import { card } from '../../components/site/ui.js';

const REASON_ICONS = ['shield', 'star', 'check-circle', 'user-check', 'lock', 'handshake'];

export default function WhyUsPage() {
  const t = useT();
  useScrollAnimation();

  // "In our own words": the company's published commitment, vision and mission.
  const quotes = [t('about.commitment.statement'), t('about.vision.text'), t('about.mission.text')];
  const quoteLabels = t('site.whyUs.words');

  return (
    <>
      <Seo
        title={t('site.seo.whyUs.title')}
        description={t('site.seo.whyUs.description')}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: PATHS.home },
          { name: 'Why Us', path: PATHS.whyUs },
        ])}
      />

      <HeroBanner image="handshake" title={t('site.whyUs.hero.title')} text={t('site.whyUs.hero.text')} />

      {/* Key reasons */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {t('about.why.items').map((item, index) => (
              <li key={item.title} className={`flex gap-4 ${index % 2 ? 'scroll-fade-in-right' : 'scroll-fade-in-left'}`}>
                <span className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shrink-0">
                  <Icon name={REASON_ICONS[index % REASON_ICONS.length]} size={26} strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-heading">{item.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What sets us apart */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.whyUs.apartTitle')} />
          <FactCards withText />
        </div>
      </section>

      {/* Commitment */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.whyUs.commitmentTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t('site.whyUs.commitment').map((item) => (
              <div key={item.title} className={`${card} p-6 text-center hover:shadow-lg transition-all duration-300 scroll-scale-in`}>
                <div className="text-5xl mb-4" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4 font-heading">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In our own words */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.whyUs.wordsTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quotes.map((quote, index) => (
              <figure key={quoteLabels[index]} className={`${card} p-8 hover:scale-[1.02] transition-transform duration-300 scroll-scale-in`}>
                <span className="text-gold-500 text-4xl font-heading leading-none" aria-hidden="true">
                  “
                </span>
                <blockquote className="text-slate-600 text-sm leading-relaxed mb-6 italic">{quote}</blockquote>
                <figcaption>
                  <p className="font-bold text-navy-900 font-heading">{t('common.legalName')}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{quoteLabels[index]}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CtaCard tone="dark" title={t('site.whyUs.cta.title')} text={t('site.whyUs.cta.text')} to={PATHS.apply} label={t('common.applyNow')} />
    </>
  );
}
