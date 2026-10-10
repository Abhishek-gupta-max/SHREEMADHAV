import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { MAX_FILE_SIZE_MB, MAX_SUPPORTING_FILES } from '../../constants/site.js';
import { OPPORTUNITY_TYPES, SECTORS } from '../../constants/options.js';
import { publicService } from '../../services/publicService.js';
import { session } from '../../utils/storage.js';
import { Seo } from '../../components/common/Seo.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { FormAlert } from '../../components/forms/Fields.jsx';
import { HeroBanner } from '../../components/site/Blocks.jsx';
import { INITIAL_VALUES, STEPS, stepIndexForField } from './applySteps.js';
import { StepFields } from './StepFields.jsx';
import { ApplySuccess } from './ApplySuccess.jsx';
import './ApplyPage.css';

const DRAFT_KEY = 'smos.apply.draft';

function initialValuesFromUrl(params) {
  const values = { ...INITIAL_VALUES, ...(session.getJSON(DRAFT_KEY) || {}) };
  const position = params.get('position');
  const opportunity = params.get('opportunity');
  const sector = params.get('sector');
  if (position) values.preferredPosition = position.slice(0, 150);
  if (OPPORTUNITY_TYPES.includes(opportunity)) values.preferredOpportunity = opportunity;
  if (SECTORS.includes(sector)) values.preferredSector = sector;
  values.consent = false;
  values.website = '';
  return values;
}

export default function ApplyPage() {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const [params] = useSearchParams();

  const jobId = /^\d+$/.test(params.get('job') || '') ? params.get('job') : '';
  const jobTitle = jobId ? params.get('position') : '';

  const [values, setValues] = useState(() => initialValuesFromUrl(params));
  const [draftRestored] = useState(() => Boolean(session.getJSON(DRAFT_KEY)?.fullName));
  const [files, setFiles] = useState({ cv: [], documents: [] });
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(0); // highest step index reached
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [applicationId, setApplicationId] = useState(null);

  const headingRef = useRef(null);
  const formRef = useRef(null);
  const alertRef = useRef(null);
  const previousStep = useRef(step);

  // Keep a draft (text fields only) for the browser session.
  useEffect(() => {
    if (status === 'success') return undefined;
    const timer = window.setTimeout(() => {
      const { consent: _c, website: _w, ...draft } = values;
      session.setJSON(DRAFT_KEY, draft);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, status]);

  // Move focus to the step heading whenever the step changes.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const setFileField = useCallback((name, list) => {
    setFiles((current) => ({ ...current, [name]: list }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const focusFirstError = (stepErrors) => {
    const first = Object.keys(stepErrors)[0];
    window.requestAnimationFrame(() => {
      const element = formRef.current?.querySelector(`[name="${first}"], #apply-${first}`);
      element?.focus();
    });
  };

  const validateStep = (index) => STEPS[index].validate(values, files, t);

  const goNext = () => {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      focusFirstError(stepErrors);
      return;
    }
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setCompleted((value) => Math.max(value, next));
  };

  const goTo = (index) => {
    if (index <= completed && status !== 'submitting') {
      setErrors({});
      setStep(index);
    }
  };

  const submit = async () => {
    // Re-check every step; jump to the first one with a problem.
    for (let index = 0; index < STEPS.length; index += 1) {
      const stepErrors = validateStep(index);
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors);
        setStep(index);
        focusFirstError(stepErrors);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'consent') formData.append(key, value ? 'true' : '');
      else formData.append(key, typeof value === 'string' ? value.trim() : value);
    });
    formData.append('language', language);
    if (jobId) formData.append('jobId', jobId);
    formData.append('cv', files.cv[0]);
    files.documents.forEach((file) => formData.append('documents', file));

    setStatus('submitting');
    setSubmitError(null);
    setProgress(0);

    try {
      const id = await publicService.submitApplication(formData, { onProgress: setProgress });
      setApplicationId(id);
      setStatus('success');
      session.remove(DRAFT_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('error');
      const fieldErrors = error.errors || {};
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        const target = Math.min(...Object.keys(fieldErrors).map(stepIndexForField));
        setStep(target);
        focusFirstError(fieldErrors);
      }
      setSubmitError(error.isNetworkError ? t('common.networkError') : error.message || t('common.genericError'));
      window.requestAnimationFrame(() => alertRef.current?.focus());
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (step < STEPS.length - 1) goNext();
    else submit();
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const submitting = status === 'submitting';
  const progressPercent = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  if (status === 'success') {
    return (
      <>
        <Seo title={t('seo.apply.title')} description={t('seo.apply.description')} noindex />
        <ApplySuccess applicationId={applicationId} name={values.fullName.trim().split(' ')[0]} />
      </>
    );
  }

  return (
    <>
      <Seo title={t('seo.apply.title')} description={t('seo.apply.description')} />
      <HeroBanner image="student" size="sm" title={t('apply.hero.title')} text={t('apply.hero.intro')} />

      <section className="section apply">
        <div className="page-wrap apply__grid">
          {/* Progress rail */}
          <aside className="apply__rail">
            <div className="apply__mobile-progress" aria-hidden="true">
              <span>{t('apply.stepOf', { current: step + 1, total: STEPS.length })}</span>
              <strong>{t(`apply.steps.${current.key}`)}</strong>
              <span className="apply__bar">
                <span style={{ width: `${progressPercent}%` }} />
              </span>
            </div>

            <ol className="apply-steps" role="list" aria-label={t('apply.hero.title')}>
              {STEPS.map((item, index) => {
                const state = index === step ? 'current' : index < completed || index < step ? 'done' : index <= completed ? 'reachable' : 'upcoming';
                return (
                  <li key={item.key} className={`apply-steps__item is-${state}`}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      disabled={index > completed || submitting}
                      aria-current={index === step ? 'step' : undefined}
                    >
                      <span className="apply-steps__marker" aria-hidden="true">
                        {state === 'done' ? <Icon name="check" size={14} strokeWidth={2.2} /> : index + 1}
                      </span>
                      <span className="apply-steps__label">{t(`apply.steps.${item.key}`)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="apply__aside">
              <h2>{t('apply.aside.title')}</h2>
              <ul role="list">
                {t('apply.aside.items').map((item) => (
                  <li key={item}>
                    <Icon name="check" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="apply__secure">
                <Icon name="lock" size={16} />
                {t('apply.secureNote')}
              </p>
              <p className="apply__help">
                {t('apply.aside.help')}{' '}
                {settings.contact_phone ? (
                  <a href={`tel:${settings.contact_phone.replace(/[^\d+]/g, '')}`}>{settings.contact_phone}</a>
                ) : (
                  <Link to={PATHS.contact}>{t('common.contactUs')}</Link>
                )}
              </p>
            </div>
          </aside>

          {/* Form */}
          <form ref={formRef} className="apply__form" onSubmit={onSubmit} noValidate aria-labelledby="apply-step-title">
            {draftRestored && step === 0 && (
              <FormAlert tone="info">{t('apply.draftRestored')}</FormAlert>
            )}

            {jobTitle && (
              <div className="apply__job">
                <Icon name="briefcase" size={18} />
                <span>
                  {t('apply.applyingFor')}: <strong>{jobTitle}</strong>
                </span>
              </div>
            )}

            {status === 'error' && submitError && (
              <div ref={alertRef} tabIndex={-1} className="apply__alert">
                <FormAlert title={t('apply.errors.failedTitle')}>{submitError}</FormAlert>
              </div>
            )}

            <header className="apply__step-head">
              <p className="apply__step-count">{t('apply.stepOf', { current: step + 1, total: STEPS.length })}</p>
              <h2 id="apply-step-title" ref={headingRef} tabIndex={-1}>
                {t(`apply.steps.${current.key}`)}
              </h2>
              <p>{t(`apply.stepIntro.${current.key}`)}</p>
            </header>

            <fieldset className="apply__fieldset" disabled={submitting}>
              <legend className="visually-hidden">{t(`apply.steps.${current.key}`)}</legend>
              <StepFields
                stepKey={current.key}
                values={values}
                files={files}
                errors={errors}
                onChange={setField}
                onFilesChange={setFileField}
                onEditStep={goTo}
                maxSize={MAX_FILE_SIZE_MB}
                maxFiles={MAX_SUPPORTING_FILES}
              />
            </fieldset>

            {submitting && (
              <div className="apply__upload" role="status" aria-live="polite">
                <div className="apply__bar apply__bar--upload">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <span>
                  {t('apply.actions.submitting')} {progress > 0 && progress < 100 ? `${progress}%` : ''}
                </span>
              </div>
            )}

            <div className="apply__actions">
              {step > 0 ? (
                <Button variant="ghost" icon="arrow-left" iconPosition="start" onClick={() => goTo(step - 1)} disabled={submitting}>
                  {t('apply.actions.back')}
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" size="lg" icon={isLast ? undefined : 'arrow-right'} loading={submitting} variant={isLast ? 'accent' : 'primary'}>
                {isLast ? (submitting ? t('apply.actions.submitting') : t('apply.actions.submit')) : t('apply.actions.next')}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
