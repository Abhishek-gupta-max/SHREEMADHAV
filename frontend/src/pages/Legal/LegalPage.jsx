import { useLanguage } from '../../context/LanguageContext.jsx';
import { Seo } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { HeroBanner } from '../../components/site/Blocks.jsx';
import { formatDate } from '../../utils/format.js';
import './LegalPage.css';

/**
 * Shared layout for legal documents. The documents are maintained in English
 * only; readers using another language see a short notice.
 */
export function LegalPage({ seoKey, title, intro, updated, sections }) {
  const { t, language } = useLanguage();

  return (
    <>
      <Seo title={t(`seo.${seoKey}.title`)} description={t(`seo.${seoKey}.description`)} />
      <HeroBanner image="library" size="sm" title={title} text={intro}>
        <p className="mt-4 text-sm text-navy-200">{t('legal.updated', { date: formatDate(updated, language, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
      </HeroBanner>

      <section className="section">
        <div className="page-wrap legal">
          <nav className="legal__toc" aria-label={t('legal.contents')}>
            <p>{t('legal.contents')}</p>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal__body prose" lang="en">
            {language !== 'en' && (
              <p className="legal__notice">
                <Icon name="globe" size={18} />
                {t('language.englishOnly')}
              </p>
            )}
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="legal__section">
                <h2>{section.title}</h2>
                {section.body}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
