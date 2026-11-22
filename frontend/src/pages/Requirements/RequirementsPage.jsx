import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { publicService } from '../../services/publicService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { formatDate } from '../../utils/format.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { Skeleton, StateMessage } from '../../components/common/StateMessage.jsx';
import { CheckItem, CtaCard, HeroBanner, SectionHeading } from '../../components/site/Blocks.jsx';
import { btnPrimary, card } from '../../components/site/ui.js';

const panel = `${card} p-8 border-l-4 border-l-navy-600 hover:shadow-lg transition-shadow scroll-scale-in`;

export default function RequirementsPage() {
  const { t, language } = useLanguage();
  const jobs = useAsync(
    async (signal) => {
      try {
        return await publicService.jobs({ signal });
      } catch {
        return []; // Show "no openings" gracefully when API is unavailable
      }
    },
    [],
    { initialData: [] },
  );
  useScrollAnimation([jobs.data?.length]);
  const cards = t('site.requirements.cards');

  return (
    <>
      <Seo
        title={t('site.seo.requirements.title')}
        description={t('site.seo.requirements.description')}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: PATHS.home },
          { name: 'Requirements', path: PATHS.requirements },
        ])}
      />

      <HeroBanner image="passport" title={t('site.requirements.hero.title')} text={t('site.requirements.hero.text')} />

      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {['general', 'professional'].map((key) => (
            <div key={key} className={panel}>
              <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">{cards[key].title}</h2>
              <ul role="list" className="space-y-4">
                {cards[key].items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
            </div>
          ))}

          <div className={panel}>
            <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">{cards.documents.title}</h2>
            <ul role="list" className="space-y-3 text-sm">
              {cards.documents.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gold-600 font-bold" aria-hidden="true">
                    •
                  </span>
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={panel}>
            <h2 className="text-2xl font-bold text-navy-900 mb-6 font-heading">{cards.process.title}</h2>
            <dl className="space-y-4">
              {cards.process.rows.map((row) => (
                <div key={row.title}>
                  <dt className="font-bold text-navy-900 mb-1 font-heading text-sm">{row.title}</dt>
                  <dd className="text-slate-600 text-sm">{row.text}</dd>
                </div>
              ))}
            </dl>
            <Link to={PATHS.apply} className={`${btnPrimary} mt-6`}>
              <Icon name="user-plus" size={16} strokeWidth={2.2} />
              {t('common.applyNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* Current openings (merged from the former Careers page) */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in scroll-mt-40" id="openings">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title={t('site.requirements.openingsTitle')} text={t('careers.hero.intro')} className="mb-12" />

          {jobs.loading ? (
            <div className="space-y-4" aria-busy="true">
              {[0, 1].map((key) => (
                <div key={key} className={`${card} p-6`}>
                  <Skeleton width="45%" height={22} />
                  <Skeleton width="70%" height={14} style={{ marginTop: 12 }} />
                </div>
              ))}
            </div>
          ) : jobs.error ? (
            <StateMessage tone="error" title={t('careers.error')} text={t('common.networkError')} onRetry={jobs.reload} retryLabel={t('common.retry')} />
          ) : jobs.data.length === 0 ? (
            <StateMessage
              icon="briefcase"
              title={t('careers.empty.title')}
              text={t('careers.empty.text')}
              action={
                <Link to={PATHS.apply} className={btnPrimary}>
                  {t('careers.empty.cta')}
                </Link>
              }
            />
          ) : (
            <ul role="list" className="space-y-4">
              {jobs.data.map((job) => (
                <li key={job.id}>
                  <Link
                    to={`${PATHS.requirements}/${job.slug}`}
                    className={`${card} p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}
                  >
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-navy-900 font-heading group-hover:text-brand-600 transition-colors">{job.title}</h3>
                      <ul role="list" className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-slate-500">
                        {(job.location || job.country) && (
                          <li className="inline-flex items-center gap-1.5">
                            <Icon name="map-pin" size={15} /> {[job.location, job.country].filter(Boolean).join(', ')}
                          </li>
                        )}
                        {job.sector && (
                          <li className="inline-flex items-center gap-1.5">
                            <Icon name="layers" size={15} /> {job.sector}
                          </li>
                        )}
                        <li className="inline-flex items-center gap-1.5">
                          <Icon name="clock" size={15} /> {t(`careers.employmentTypes.${job.employment_type}`)}
                        </li>
                      </ul>
                    </div>
                    <div className="flex md:flex-col md:items-end gap-3 md:gap-1 shrink-0 text-sm">
                      <span className="text-slate-400">{t('careers.posted', { date: formatDate(job.published_at, language) })}</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-brand-600">
                        {t('careers.viewDetails')} <Icon name="arrow-right" size={15} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CtaCard
        tone="dark"
        title={t('site.requirements.cta.title')}
        text={t('site.requirements.cta.text')}
        to={PATHS.contact}
        label={t('site.requirements.cta.button')}
        icon="mail"
      />
    </>
  );
}
