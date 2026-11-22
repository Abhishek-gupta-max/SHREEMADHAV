import { useState, useCallback } from 'react';
import { useT } from '../../context/LanguageContext.jsx';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { COUNTRIES } from '../../constants/options.js';
import { publicService } from '../../services/publicService.js';
import { Seo } from '../../components/common/Seo.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { FormAlert, TextField, SelectField, TextareaField } from '../../components/forms/Fields.jsx';
import { HeroBanner } from '../../components/site/Blocks.jsx';
import { isEmail, isPhone } from '../../utils/validation.js';
import './EmployerPage.css';

const INITIAL = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  country: '',
  industry: '',
  requirements: '',
  numEmployees: '',
  message: '',
  website: '', // honeypot
};

function validate(values, t) {
  const e = {};
  const req = (v) => String(v ?? '').trim().length > 0;
  const minLen = (v, n) => String(v ?? '').trim().length >= n;

  if (!minLen(values.companyName, 2)) e.companyName = t('employer.errors.companyName');
  if (!minLen(values.contactPerson, 2)) e.contactPerson = t('employer.errors.contactPerson');
  if (!isEmail(values.email)) e.email = t('employer.errors.email');
  if (!isPhone(values.phone)) e.phone = t('employer.errors.phone');
  if (!minLen(values.country, 2)) e.country = t('employer.errors.country');
  if (!req(values.industry)) e.industry = t('employer.errors.industry');
  if (!minLen(values.requirements, 10)) e.requirements = t('employer.errors.requirements');
  const n = Number(values.numEmployees);
  if (!values.numEmployees || isNaN(n) || n < 1) e.numEmployees = t('employer.errors.numEmployees');
  return e;
}

export default function EmployerPage() {
  const t = useT();
  const { settings } = useSiteSettings();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState(null);

  const setField = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => { if (!e[name]) return e; const n = { ...e }; delete n[name]; return n; });
  }, []);

  const industries = t('employer.industries').map((ind) => ({ value: ind, label: ind }));
  const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = validate(values, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('submitting');
    setSubmitError(null);
    try {
      await publicService.sendEmployerEnquiry({
        companyName: values.companyName.trim(),
        contactPerson: values.contactPerson.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        country: values.country,
        industry: values.industry,
        requirements: values.requirements.trim(),
        numEmployees: Number(values.numEmployees),
        message: values.message.trim() || undefined,
        website: values.website,
      });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('error');
      setSubmitError(
        error?.status === 0
          ? t('employer.errors.network')
          : error?.message || t('employer.errors.generic'),
      );
    }
  };

  const submitting = status === 'submitting';

  return (
    <>
      <Seo title={t('employer.seo.title')} description={t('employer.seo.description')} />
      <HeroBanner image="handshake" size="sm" title={t('employer.hero.title')} text={t('employer.hero.text')} />

      <section className="section employer-section">
        <div className="page-wrap employer__grid">

          {/* Left sidebar */}
          <aside className="employer__aside scroll-fade-in-left">
            <div className="employer__aside-card">
              <div className="employer__aside-icon">
                <Icon name="briefcase" size={28} />
              </div>
              <h2>Why Partner With Us?</h2>
              <ul role="list" className="employer__aside-list">
                {[
                  'Access to a large pool of skilled candidates',
                  'Pre-screened and qualified professionals',
                  'MEA-approved recruitment consultant',
                  'End-to-end recruitment support',
                  'Transparent and ethical process',
                  'Dedicated team for employer needs',
                ].map((item) => (
                  <li key={item}>
                    <Icon name="check-circle" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(settings?.contact_phone || settings?.contact_email) && (
              <div className="employer__aside-contact">
                <p className="employer__aside-contact-label">Need to talk first?</p>
                {settings.contact_phone && (
                  <a href={`tel:${settings.contact_phone.replace(/[^\d+]/g, '')}`} className="employer__aside-contact-link">
                    <Icon name="phone" size={16} />
                    {settings.contact_phone}
                  </a>
                )}
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="employer__aside-contact-link">
                    <Icon name="mail" size={16} />
                    {settings.contact_email}
                  </a>
                )}
              </div>
            )}
          </aside>

          {/* Form */}
          <div className="employer__form-wrap scroll-fade-in">
            {status === 'success' ? (
              <div className="employer__success">
                <div className="employer__success-icon">
                  <Icon name="check-circle" size={32} />
                </div>
                <h2>{t('employer.form.successTitle')}</h2>
                <p>{t('employer.form.successText')}</p>
                <button
                  type="button"
                  className="employer__success-link"
                  onClick={() => { setStatus('idle'); setValues(INITIAL); setErrors({}); }}
                >
                  {t('employer.form.another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="employer__form">
                <div className="employer__form-header">
                  <h2>{t('employer.form.title')}</h2>
                  <p>{t('employer.form.subtitle')}</p>
                </div>

                {status === 'error' && submitError && (
                  <FormAlert>{submitError}</FormAlert>
                )}

                {/* Honeypot */}
                <input type="text" name="website" value={values.website} onChange={(e) => setField('website', e.target.value)} style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                <div className="employer__fields">
                  <div className="employer__row">
                    <TextField
                      id="emp-companyName"
                      name="companyName"
                      label={t('employer.form.companyName')}
                      placeholder="e.g. Acme Corporation"
                      required
                      value={values.companyName}
                      onChange={(e) => setField('companyName', e.target.value)}
                      error={errors.companyName}
                      disabled={submitting}
                    />
                    <TextField
                      id="emp-contactPerson"
                      name="contactPerson"
                      label={t('employer.form.contactPerson')}
                      placeholder="e.g. John Smith"
                      required
                      value={values.contactPerson}
                      onChange={(e) => setField('contactPerson', e.target.value)}
                      error={errors.contactPerson}
                      disabled={submitting}
                    />
                  </div>

                  <div className="employer__row">
                    <TextField
                      id="emp-email"
                      name="email"
                      type="email"
                      label={t('employer.form.email')}
                      placeholder="e.g. hr@company.com"
                      required
                      value={values.email}
                      onChange={(e) => setField('email', e.target.value)}
                      error={errors.email}
                      disabled={submitting}
                    />
                    <TextField
                      id="emp-phone"
                      name="phone"
                      type="tel"
                      label={t('employer.form.phone')}
                      placeholder="+971 50 123 4567"
                      hint={t('employer.form.phoneHint')}
                      required
                      value={values.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      error={errors.phone}
                      disabled={submitting}
                    />
                  </div>

                  <div className="employer__row">
                    <SelectField
                      id="emp-country"
                      name="country"
                      label={t('employer.form.country')}
                      placeholder="Select country…"
                      options={countryOptions}
                      required
                      value={values.country}
                      onChange={(e) => setField('country', e.target.value)}
                      error={errors.country}
                      disabled={submitting}
                    />
                    <SelectField
                      id="emp-industry"
                      name="industry"
                      label={t('employer.form.industry')}
                      placeholder="Select industry…"
                      options={industries}
                      required
                      value={values.industry}
                      onChange={(e) => setField('industry', e.target.value)}
                      error={errors.industry}
                      disabled={submitting}
                    />
                  </div>

                  <TextareaField
                    id="emp-requirements"
                    name="requirements"
                    label={t('employer.form.requirements')}
                    placeholder="Describe the roles, skills, qualifications and experience level you are looking for…"
                    hint={t('employer.form.requirementsHint')}
                    rows={4}
                    required
                    value={values.requirements}
                    onChange={(e) => setField('requirements', e.target.value)}
                    error={errors.requirements}
                    disabled={submitting}
                  />

                  <TextField
                    id="emp-numEmployees"
                    name="numEmployees"
                    type="number"
                    label={t('employer.form.numEmployees')}
                    placeholder="e.g. 10"
                    hint={t('employer.form.numEmployeesHint')}
                    required
                    min={1}
                    value={values.numEmployees}
                    onChange={(e) => setField('numEmployees', e.target.value)}
                    error={errors.numEmployees}
                    disabled={submitting}
                  />

                  <TextareaField
                    id="emp-message"
                    name="message"
                    label={t('employer.form.message')}
                    placeholder="Any specific requirements, timelines or additional notes…"
                    hint={t('employer.form.messageHint')}
                    optionalLabel="Optional"
                    rows={3}
                    value={values.message}
                    onChange={(e) => setField('message', e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="employer__submit">
                  <Button type="submit" size="lg" loading={submitting} variant="primary">
                    {submitting ? t('employer.form.submitting') : t('employer.form.submit')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
