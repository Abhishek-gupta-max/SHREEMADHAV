import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { SECTORS } from '../../constants/options.js';
import { SERVICE_IMAGES, SERVICE_IMAGE_FALLBACK } from '../../constants/navigation.js';
import { useServices } from '../../hooks/useServices.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../components/common/StateMessage.jsx';
import { CheckItem, CtaCard, HeroBanner, SectionHeading, StepCards } from '../../components/site/Blocks.jsx';
import { card, iconTile } from '../../components/site/ui.js';

const AUDIENCE_ICONS = ['graduation', 'user-check', 'briefcase', 'building'];

export default function ServicesPage() {
  const t = useT();
  const { data, loading, error, reload } = useServices();
  const services = data || [];
  useScrollAnimation([services.length]);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Home', path: PATHS.home },
      { name: 'Services', path: PATHS.services },
    ]),
    ...services.map((service) => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.summary,
      areaServed: 'IN',
      provider: { '@type': 'Organization', name: 'ShreeMadhav Overseas Solutions Private Limited' },
    })),
  ];

  return (
    <>
      <Seo title={t('seo.services.title')} description={t('seo.services.description')} jsonLd={jsonLd} />

      <HeroBanner image="consultation" title={t('site.services.hero.title')} text={t('site.services.hero.text')} />

      {/* Service cards */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          {error && !services.length ? (
            <StateMessage tone="error" title={t('services.error')} text={t('common.networkError')} onRetry={reload} retryLabel={t('common.retry')} />
          ) : !loading && !services.length ? (
            <StateMessage title={t('services.empty')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading && !services.length
                ? [0, 1, 2].map((key) => <Skeleton key={key} height={420} style={{ borderRadius: 16 }} />)
                : services.map((service) => (
                    <article
                      key={service.id}
                      id={service.slug}
                      className="scroll-scale-in relative rounded-2xl overflow-hidden group h-[420px] shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-500 scroll-mt-40"
                    >
                      <img
                        src={`/images/${SERVICE_IMAGES[service.slug] || SERVICE_IMAGE_FALLBACK}-800.webp`}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-300" />
                      <div className="relative z-10 h-full flex flex-col justify-end p-7 text-white">
                        <span className="w-14 h-14 rounded-2xl bg-gold-500/20 backdrop-blur-md border border-gold-400/30 flex items-center justify-center mb-5 shadow-lg text-gold-300">
                          <Icon name={service.icon} size={28} />
                        </span>
                        <h2 className="text-2xl font-bold mb-3 font-heading text-white">{service.title}</h2>
                        <p className="text-slate-200 text-sm leading-relaxed mb-5">{service.summary}</p>
                        <Link to={PATHS.apply} className="inline-flex items-center gap-2 text-gold-300 font-semibold hover:text-gold-200 transition">
                          {t('site.services.apply')} <Icon name="arrow-right" size={16} />
                        </Link>
                      </div>
                    </article>
                  ))}
            </div>
          )}
        </div>
      </section>

      {/* Overseas education (merged from the former Education page) */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in scroll-mt-40" id="education">
        <div className="mx-auto max-w-6xl">
          <SectionHeading badge={t('site.services.education.badge')} title={t('education.hero.title')} text={t('education.hero.intro')} className="mb-12" />
          <StepCards steps={t('education.guidance.steps')} columns="lg:grid-cols-5" compact />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className={`${card} p-8 border-l-4 border-l-navy-600 scroll-scale-in`}>
              <h3 className="text-2xl font-bold text-navy-900 mb-6 font-heading">{t('site.services.education.considerTitle')}</h3>
              <ul role="list" className="space-y-4">
                {t('education.consider.items').map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="text-gold-600 shrink-0 mt-0.5">
                      <Icon name="check-circle" size={22} strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-slate-800 font-semibold">{item.title}</span>
                      <span className="block text-slate-600 text-sm">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${card} p-8 border-l-4 border-l-navy-600 scroll-scale-in`}>
              <h3 className="text-2xl font-bold text-navy-900 mb-2 font-heading">{t('site.services.education.documentsTitle')}</h3>
              <p className="text-slate-600 text-sm mb-6">{t('education.documents.intro')}</p>
              <ul role="list" className="space-y-3">
                {t('education.documents.items').map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* International opportunities (merged from the former Opportunities page) */}
      <section className="py-20 px-4 scroll-fade-in scroll-mt-40" id="opportunities">
        <div className="mx-auto max-w-6xl">
          <SectionHeading badge={t('site.services.opportunities.badge')} title={t('opportunities.hero.title')} text={t('opportunities.hero.intro')} className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t('opportunities.audience.items').map((item, index) => (
              <div key={item.title} className={`${card} p-6 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 scroll-scale-in`}>
                <span className={`${iconTile} mb-5`}>
                  <Icon name={AUDIENCE_ICONS[index]} size={28} />
                </span>
                <h3 className="text-lg font-bold text-navy-900 mb-2 font-heading">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className={`${card} p-8 mt-10 scroll-scale-in`}>
            <h3 className="text-2xl font-bold text-navy-900 mb-2 font-heading">{t('site.services.opportunities.sectorsTitle')}</h3>
            <p className="text-slate-600 text-sm mb-6">{t('opportunities.sectors.intro')}</p>
            <ul role="list" className="flex flex-wrap gap-3">
              {SECTORS.filter((sector) => sector !== 'other').map((sector) => (
                <li key={sector}>
                  <Link
                    to={`${PATHS.apply}?sector=${sector}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-100 text-navy-800 text-sm font-semibold hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors"
                  >
                    {t(`options.sector.${sector}`)}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recruitment process */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.services.processTitle')} className="mb-12" />
          <StepCards steps={t('site.processSteps').slice(0, 5)} columns="lg:grid-cols-5" compact />
        </div>
      </section>

      <CtaCard
        title={t('site.services.cta.title')}
        text={t('site.services.cta.text')}
        to={PATHS.contact}
        label={t('site.services.cta.button')}
        icon="chat"
      />
    </>
  );
}
