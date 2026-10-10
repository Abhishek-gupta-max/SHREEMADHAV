import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { SITE } from '../../constants/site.js';
import { publicService } from '../../services/publicService.js';
import { useAsync } from '../../hooks/useAsync.js';
import { formatDate } from '../../utils/format.js';
import { Seo } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import { StateMessage } from '../../components/common/StateMessage.jsx';
import { HeroBanner } from '../../components/site/Blocks.jsx';
import { btnPrimary, card } from '../../components/site/ui.js';

const SCHEMA_EMPLOYMENT = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  internship: 'INTERN',
};

export default function JobDetailPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { data: job, loading, error, reload } = useAsync((signal) => publicService.job(slug, { signal }), [slug]);
  const backLink = `${PATHS.requirements}#openings`;

  if (loading) return <PageLoader label={t('common.loading')} />;

  if (error || !job) {
    const missing = error?.status === 404;
    return (
      <section className="py-20 px-4">
        <Seo title={t('careers.notFound')} description={t('site.seo.requirements.description')} noindex />
        <div className="mx-auto max-w-2xl">
          <StateMessage
            tone={missing ? 'empty' : 'error'}
            icon="briefcase"
            title={missing ? t('careers.notFound') : t('careers.error')}
            onRetry={missing ? undefined : reload}
            retryLabel={t('common.retry')}
            action={
              <Link to={backLink} className={btnPrimary}>
                {t('careers.back')}
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const location = [job.location, job.country].filter(Boolean).join(', ');
  const applyLink = `${PATHS.apply}?job=${job.id}&position=${encodeURIComponent(job.title)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [job.summary, job.requirements].filter(Boolean).join('\n\n'),
    datePosted: job.published_at?.slice(0, 10),
    employmentType: SCHEMA_EMPLOYMENT[job.employment_type],
    hiringOrganization: { '@type': 'Organization', name: SITE.legalName, sameAs: SITE.url },
    ...(job.country && {
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location || undefined, addressCountry: job.country } },
    }),
  };

  const facts = [
    location && { label: t('careers.location'), value: location, icon: 'map-pin' },
    job.sector && { label: t('careers.sector'), value: job.sector, icon: 'layers' },
    { label: t('careers.type'), value: t(`careers.employmentTypes.${job.employment_type}`), icon: 'clock' },
  ].filter(Boolean);

  return (
    <>
      <Seo title={job.title} description={job.summary.slice(0, 155)} jsonLd={jsonLd} />
      <HeroBanner image="worksite" size="sm" title={job.title} text={t('careers.posted', { date: formatDate(job.published_at, language) })} />

      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <article className={`${card} p-8 lg:col-span-2`}>
            <h2 className="text-2xl font-bold text-navy-900 mb-4 font-heading">{t('careers.about')}</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{job.summary}</p>
            {job.requirements && (
              <>
                <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4 font-heading">{t('careers.requirements')}</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </>
            )}
          </article>

          <aside className={`${card} p-6 lg:sticky lg:top-40 space-y-4`}>
            <dl className="space-y-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex gap-3">
                  <span className="text-gold-600 mt-0.5">
                    <Icon name={fact.icon} size={18} />
                  </span>
                  <div>
                    <dt className="text-xs text-slate-500">{fact.label}</dt>
                    <dd className="text-sm font-semibold text-navy-900">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <Link to={applyLink} className={`${btnPrimary} w-full`}>
              <Icon name="user-plus" size={16} strokeWidth={2.2} />
              {t('careers.applyForRole')}
            </Link>
            <Link to={backLink} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy-700">
              <Icon name="arrow-left" size={15} /> {t('careers.back')}
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
