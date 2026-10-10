import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { Seo } from '../../components/common/Seo.jsx';
import { Button } from '../../components/common/Button.jsx';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const t = useT();
  return (
    <section className="section not-found">
      <Seo title={t('seo.notFound.title')} description={t('seo.notFound.description')} noindex />
      <div className="page-wrap page-wrap--narrow">
        <p className="eyebrow">{t('notFound.eyebrow')}</p>
        <h1>{t('notFound.title')}</h1>
        <p className="lead">{t('notFound.text')}</p>
        <div className="not-found__actions">
          <Button to={PATHS.home} icon="arrow-right">
            {t('notFound.home')}
          </Button>
          <Button to={PATHS.contact} variant="secondary">
            {t('common.contactUs')}
          </Button>
        </div>
      </div>
    </section>
  );
}
