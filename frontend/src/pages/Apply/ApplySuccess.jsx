import { useEffect, useRef, useState } from 'react';
import { useT } from '../../context/LanguageContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { Button } from '../../components/common/Button.jsx';
import { Icon } from '../../components/common/Icon.jsx';

/** Confirmation shown after a successful submission. Printable. */
export function ApplySuccess({ applicationId, name }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable: the ID remains visible to copy manually */
    }
  };

  return (
    <section className="section apply-success">
      <div className="page-wrap page-wrap--narrow">
        <div className="apply-success__card">
          <span className="apply-success__icon" aria-hidden="true">
            <Icon name="check" size={28} strokeWidth={2} />
          </span>
          <p className="eyebrow">{t('apply.success.eyebrow')}</p>
          <h1 ref={headingRef} tabIndex={-1}>
            {t('apply.success.title', { name: name || '' }).replace(/,\s*\./, '.')}
          </h1>
          <p className="lead">{t('apply.success.text')}</p>

          <div className="apply-success__id">
            <span className="apply-success__id-label">{t('apply.success.idLabel')}</span>
            <strong className="apply-success__id-value">{applicationId}</strong>
            <button type="button" className="apply-success__copy" onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} size={16} />
              <span aria-live="polite">{copied ? t('apply.success.copied') : t('apply.success.copy')}</span>
            </button>
          </div>

          <h2 className="apply-success__next-title">{t('apply.success.nextTitle')}</h2>
          <ol className="apply-success__next">
            {t('apply.success.next').map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <div className="apply-success__actions">
            <Button variant="secondary" icon="printer" iconPosition="start" onClick={() => window.print()}>
              {t('apply.success.print')}
            </Button>
            <Button to={PATHS.home} variant="ghost" icon="arrow-right">
              {t('apply.success.home')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
