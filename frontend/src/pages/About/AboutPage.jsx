import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { CheckItem, CtaCard, HeroBanner, RegistrationSection, WhyChooseSection } from '../../components/site/Blocks.jsx';
import { card, iconTile } from '../../components/site/ui.js';

export default function AboutPage() {
  const t = useT();
  useScrollAnimation();

  const pillars = [
    { icon: 'users', title: t('about.mission.title'), text: t('about.mission.text') },
    { icon: 'star', title: t('about.vision.title'), text: t('about.vision.text') },
    { icon: 'shield', title: t('site.about.values.title'), text: t('site.about.values.text') },
  ];

  return (
    <>
      <Seo
        title={t('seo.about.title')}
        description={t('seo.about.description')}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: PATHS.home },
          { name: 'About', path: PATHS.about },
        ])}
      />

      <HeroBanner image="team" title={t('site.about.hero.title')} text={t('site.about.hero.text')} />

      {/* Who we are */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div className="scroll-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6 font-heading">{t('about.who.eyebrow')}</h2>
              {t('about.who.paragraphs').map((paragraph) => (
                <p key={paragraph.slice(0, 30)} className="text-slate-700 text-base md:text-lg mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="scroll-fade-in-right">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300">
                <div className="h-72 sm:h-80 relative overflow-hidden">
                  <img src="/images/consultation-800.webp" alt={t('about.who.imageAlt')} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-400 to-gold-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-navy-900 mb-1 font-heading">{t('site.home.about.cardTitle')}</h3>
                  <p className="text-gold-600 font-semibold mb-4">{t('site.home.about.cardRole')}</p>
                  <dl className="pt-4 border-t border-slate-100 space-y-3">
                    {t('about.who.facts').map((fact) => (
                      <div key={fact.label} className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                        <dt className="text-slate-500">{fact.label}</dt>
                        <dd className="text-slate-800 font-medium break-words">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className={`${card} p-8 scroll-scale-in`}>
            <h2 className="text-2xl font-bold text-navy-900 mb-2 font-heading">{t('about.commitment.eyebrow')}</h2>
            <p className="text-slate-600 mb-6">{t('about.commitment.text')}</p>
            <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t('site.about.commitmentItems').map((item) => (
                <CheckItem key={item} icon="check">
                  {item}
                </CheckItem>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mission, vision, values */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div key={pillar.title} className={`${card} p-6 hover:shadow-lg transition-all scroll-scale-in`}>
                <span className={`${iconTile} mb-6`}>
                  <Icon name={pillar.icon} size={30} />
                </span>
                <h3 className="text-xl font-bold text-navy-900 mb-3 font-heading">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RegistrationSection background="bg-slate-50" />

      <WhyChooseSection title={t('site.about.whyTitle')} items={t('about.why.items').slice(0, 4)} />

      <CtaCard title={t('site.about.cta.title')} text={t('site.about.cta.text')} to={PATHS.contact} label={t('common.contactUs')} icon="mail" />
    </>
  );
}
