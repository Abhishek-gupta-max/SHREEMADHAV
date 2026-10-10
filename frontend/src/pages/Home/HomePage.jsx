import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { useServices } from '../../hooks/useServices.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { Seo } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../components/common/StateMessage.jsx';
import { CtaCard, FactCards, HeroBanner, RegistrationSection, SectionHeading, WhyChooseSection } from '../../components/site/Blocks.jsx';
import { btnOutlineLight, btnPrimary, card, iconTile } from '../../components/site/ui.js';

export default function HomePage() {
  const t = useT();
  const services = useServices();
  const featured = (services.data || []).slice(0, 3);
  useScrollAnimation([services.data]);

  return (
    <>
      <Seo title={t('seo.home.title')} description={t('seo.home.description')} />

      <HeroBanner image="gate" title={t('site.home.hero.title')} text={t('site.home.hero.text')}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 mb-12">
          <Link to={PATHS.apply} className={btnPrimary}>
            <Icon name="user-plus" size={18} strokeWidth={2.2} />
            {t('common.applyNow')}
          </Link>
          <Link to={PATHS.whyUs} className={btnOutlineLight}>
            <Icon name="info" size={18} strokeWidth={2.2} />
            {t('site.home.hero.secondary')}
          </Link>
        </div>
        <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-4xl mx-auto">
          {t('site.home.hero.badges').map((badge, index) => (
            <li key={badge} className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-gold-300 shrink-0">
                <Icon name={['shield', 'check-circle', 'handshake'][index]} size={22} strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold">{badge}</span>
            </li>
          ))}
        </ul>
      </HeroBanner>

      {/* Facts row */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-navy-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <FactCards />
        </div>
      </section>

      {/* Services overview */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.home.services.title')} text={t('site.home.services.text')} />

          {services.error && !services.data?.length ? (
            <StateMessage tone="error" title={t('services.error')} onRetry={services.reload} retryLabel={t('common.retry')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.loading && !featured.length
                ? [0, 1, 2].map((key) => (
                    <div key={key} className={`${card} p-6`}>
                      <Skeleton width={64} height={64} />
                      <Skeleton width="70%" height={20} style={{ marginTop: 24 }} />
                      <Skeleton height={12} style={{ marginTop: 12 }} />
                    </div>
                  ))
                : featured.map((service) => (
                    <Link
                      key={service.id}
                      to={`${PATHS.services}#${service.slug}`}
                      className={`${card} scroll-scale-in p-6 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 block`}
                    >
                      <span className={`${iconTile} mb-6`}>
                        <Icon name={service.icon} size={30} />
                      </span>
                      <h3 className="text-xl font-bold text-navy-900 mb-2 font-heading">{service.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{service.summary}</p>
                    </Link>
                  ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to={PATHS.services} className={btnPrimary}>
              {t('site.home.services.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in" id="about">
        <div className="mx-auto max-w-6xl">
          <SectionHeading badge={t('site.home.about.badge')} title={t('site.home.about.title')} text={t('site.home.about.subtitle')} className="mb-14" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 scroll-fade-in-left">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-shadow duration-500">
                <div className="relative overflow-hidden h-72 sm:h-80">
                  <img src="/images/consultation-800.webp" alt={t('about.who.imageAlt')} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-navy-900 mb-1 font-heading">{t('site.home.about.cardTitle')}</h3>
                  <p className="text-gold-600 font-semibold mb-3">{t('site.home.about.cardRole')}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{t('site.home.about.cardText')}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 scroll-fade-in-right">
              <h3 className="text-2xl md:text-3xl font-bold text-navy-900 mb-5 font-heading">{t('site.home.about.heading')}</h3>
              {t('about.who.paragraphs')
                .slice(0, 2)
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 30)} className="text-slate-700 text-base md:text-lg mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 my-8">
                {t('site.facts').map((fact) => (
                  <div key={fact.label} className="bg-white rounded-xl px-3 py-4 text-center shadow-sm border border-slate-100">
                    <div className="text-lg sm:text-xl font-bold text-gold-600 font-heading">{fact.value}</div>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">{fact.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 rounded-xl border-l-4 border-gold-400 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-2 font-heading">
                  <span className="text-gold-600">
                    <Icon name="shield" size={20} strokeWidth={2} />
                  </span>
                  {t('site.home.about.featureTitle')}
                </h4>
                <p className="text-slate-600 text-sm">{t('site.home.about.featureText')}</p>
              </div>

              <Link to={PATHS.about} className="inline-flex items-center gap-2 mt-6 text-brand-600 font-bold hover:text-brand-700">
                {t('site.home.about.more')} <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RegistrationSection />

      <WhyChooseSection title={t('site.home.why.title')} text={t('site.home.why.text')} items={t('about.why.items').slice(0, 4)} />

      <CtaCard title={t('site.home.cta.title')} text={t('site.home.cta.text')} to={PATHS.apply} label={t('common.applyNow')} />
    </>
  );
}
