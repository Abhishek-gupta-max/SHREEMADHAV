import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { CtaCard, HeroBanner, SectionHeading, StepCards } from '../../components/site/Blocks.jsx';
import { card } from '../../components/site/ui.js';

export default function ProcessPage() {
  const t = useT();
  useScrollAnimation();

  return (
    <>
      <Seo
        title={t('site.seo.process.title')}
        description={t('site.seo.process.description')}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: PATHS.home },
          { name: 'Process', path: PATHS.process },
        ])}
      />

      <HeroBanner image="worksite" title={t('site.process.hero.title')} text={t('site.process.hero.text')} />

      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.process.howTitle')} />
          <StepCards steps={t('site.processSteps')} />
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={t('site.process.stagesTitle')} />
          <ol role="list" className="space-y-6">
            {t('site.process.stages').map((stage) => (
              <li key={stage.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow scroll-fade-in-left">
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20 shrink-0">
                    <Icon name="check-circle" size={24} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-navy-900 mb-1 font-heading">{stage.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">{stage.text}</p>
                    <span className="inline-block px-3 py-1 bg-navy-50 text-navy-700 text-xs font-bold rounded-full">{stage.badge}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.process.worksTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t('site.process.works').map((item) => (
              <div key={item.title} className={`${card} p-6 text-center scroll-scale-in`}>
                <div className="text-5xl mb-4" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-3 font-heading">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaCard tone="dark" title={t('site.process.cta.title')} text={t('site.process.cta.text')} to={PATHS.apply} label={t('common.applyNow')} />
    </>
  );
}
