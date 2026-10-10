import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { PATHS } from '../../constants/publicRoutes.js';
import { REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { ENQUIRY_TYPES } from '../../constants/options.js';
import { publicService } from '../../services/publicService.js';
import { useScrollAnimation } from '../../hooks/useScrollAnimation.js';
import { isEmail, isPhone } from '../../utils/validation.js';
import { telHref, whatsappHref } from '../../utils/format.js';
import { Seo, breadcrumbJsonLd } from '../../components/common/Seo.jsx';
import { Icon } from '../../components/common/Icon.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { FormAlert, SelectField, TextField, TextareaField } from '../../components/forms/Fields.jsx';
import { CtaCard, HeroBanner, SectionHeading, StepCards } from '../../components/site/Blocks.jsx';
import { card } from '../../components/site/ui.js';
import './ContactPage.css';

const EMPTY = { fullName: '', email: '', phone: '', enquiryType: 'general', subject: '', message: '', website: '' };

function validate(values, t) {
  const errors = {};
  if (values.fullName.trim().length < 3) errors.fullName = t('apply.errors.fullName');
  if (!isEmail(values.email)) errors.email = t('apply.errors.email');
  if (values.phone.trim() && !isPhone(values.phone)) errors.phone = t('apply.errors.phone');
  if (values.subject.trim().length < 3) errors.subject = t('contact.form.errors.subject');
  if (values.message.trim().length < 10) errors.message = t('contact.form.errors.message');
  return errors;
}

function InfoCard({ emoji, title, children }) {
  return (
    <div className={`${card} p-6 text-center hover:scale-[1.02] transition-transform duration-300 scroll-scale-in`}>
      <div className="text-5xl mb-4" aria-hidden="true">
        {emoji}
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-3 font-heading">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  const t = useT();
  const { settings } = useSiteSettings();
  const [params] = useSearchParams();
  const formRef = useRef(null);
  useScrollAnimation();

  const [values, setValues] = useState(() => ({
    ...EMPTY,
    enquiryType: ENQUIRY_TYPES.includes(params.get('topic')) ? params.get('topic') : 'general',
    subject: (params.get('subject') || '').slice(0, 200),
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [submitError, setSubmitError] = useState('');

  const bind = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => {
      setValues((current) => ({ ...current, [name]: event.target.value }));
      if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values, t);
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setStatus('sending');
    setSubmitError('');
    try {
      await publicService.sendEnquiry({ ...values, phone: values.phone.trim() || undefined });
      setStatus('sent');
      setValues(EMPTY);
    } catch (error) {
      setStatus('error');
      if (error.errors) setErrors(error.errors);
      setSubmitError(error.isNetworkError ? t('common.networkError') : error.message || t('common.genericError'));
    }
  };

  const address = settings.office_address || REGISTERED_OFFICE_TEXT;
  // Search by address only: a name search can match unrelated businesses.
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(REGISTERED_OFFICE_TEXT)}&z=16&output=embed`;

  return (
    <>
      <Seo
        title={t('seo.contact.title')}
        description={t('seo.contact.description')}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: PATHS.home },
          { name: 'Contact', path: PATHS.contact },
        ])}
      />

      <HeroBanner image="documents" title={t('site.contact.hero.title')} text={t('contact.hero.intro')} />

      {/* Contact cards */}
      <section className="py-20 px-4 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard emoji="📍" title={t('site.contact.officeTitle')}>
              <p className="font-bold mb-1">{t('contact.details.office')}</p>
              <p className="whitespace-pre-line">{address}</p>
            </InfoCard>
            <InfoCard emoji="📞" title={t('site.contact.callTitle')}>
              {settings.contact_phone || settings.contact_whatsapp ? (
                <>
                  {settings.contact_phone && (
                    <p className="text-slate-700 font-semibold mb-2">
                      <a href={telHref(settings.contact_phone)} className="text-gold-600 hover:underline">
                        {settings.contact_phone}
                      </a>
                    </p>
                  )}
                  {settings.contact_whatsapp && (
                    <p className="text-slate-700 font-semibold">
                      {t('site.contact.whatsapp')}:{' '}
                      <a href={whatsappHref(settings.contact_whatsapp)} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">
                        {settings.contact_whatsapp}
                      </a>
                    </p>
                  )}
                </>
              ) : (
                <p>{t('site.contact.pending')}</p>
              )}
            </InfoCard>
            <InfoCard emoji="📧" title={t('site.contact.emailTitle')}>
              {settings.contact_email ? (
                <>
                  <p className="text-slate-700 font-semibold mb-2">
                    <a href={`mailto:${settings.contact_email}`} className="text-gold-600 hover:underline break-all">
                      {settings.contact_email}
                    </a>
                  </p>
                  <p>{t('site.contact.emailNote')}</p>
                </>
              ) : (
                <p>{t('site.contact.pending')}</p>
              )}
            </InfoCard>
          </div>

          {settings.office_hours && (
            <div className="mt-16 bg-gradient-to-r from-navy-50 to-slate-50 p-8 rounded-3xl border border-slate-100 scroll-scale-in">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center font-heading">{t('site.contact.hoursTitle')}</h2>
              <p className="text-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm max-w-md mx-auto font-semibold text-slate-800">
                {settings.office_hours}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.contact.howTitle')} />
          <StepCards steps={t('site.processSteps')} compact />
        </div>
      </section>

      {/* Form */}
      <section className="py-20 px-4 scroll-fade-in" id="message">
        <div className="mx-auto max-w-2xl">
          <SectionHeading title={t('site.contact.formTitle')} className="mb-12" />
          <div className="contact-form bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 scroll-scale-in">
            {status === 'sent' ? (
              <div className="text-center py-6" role="status">
                <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon name="check" size={28} strokeWidth={2.4} />
                </span>
                <h3 className="text-2xl font-bold text-navy-900 mb-2 font-heading">{t('contact.form.successTitle')}</h3>
                <p className="text-slate-600 mb-6">{t('contact.form.successText')}</p>
                <button type="button" onClick={() => setStatus('idle')} className="font-bold text-brand-600 hover:text-brand-700">
                  {t('contact.form.another')}
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
                {status === 'error' && submitError && <FormAlert>{submitError}</FormAlert>}
                <fieldset disabled={status === 'sending'} className="contact-form__fields">
                  <div className="form-grid">
                    <TextField {...bind('fullName')} label={t('contact.form.fullName')} required autoComplete="name" maxLength={150} />
                    <TextField {...bind('email')} type="email" label={t('contact.form.email')} required autoComplete="email" maxLength={190} />
                    <TextField {...bind('phone')} type="tel" label={t('contact.form.phone')} optionalLabel={t('common.optional')} autoComplete="tel" maxLength={20} />
                    <SelectField
                      {...bind('enquiryType')}
                      label={t('contact.form.enquiryType')}
                      required
                      options={ENQUIRY_TYPES.map((value) => ({ value, label: t(`contact.enquiryTypes.${value}`) }))}
                    />
                    <TextField {...bind('subject')} className="span-2" label={t('contact.form.subject')} required maxLength={200} />
                    <TextareaField {...bind('message')} className="span-2" label={t('contact.form.message')} hint={t('contact.form.messageHint')} required maxLength={3000} rows={6} />
                  </div>
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input id="contact-website" tabIndex={-1} autoComplete="off" {...bind('website')} />
                  </div>
                </fieldset>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {status === 'sending' && <Spinner size={16} />}
                  {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 px-4 bg-slate-100 scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.contact.mapTitle')} className="mb-12" />
          <div className="rounded-3xl overflow-hidden shadow-lg border border-white scroll-scale-in h-[360px] md:h-[400px]">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('site.contact.mapLabel')}
            />
          </div>
        </div>
      </section>

      {/* Why contact us */}
      <section className="py-20 px-4 bg-white scroll-fade-in">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title={t('site.contact.whyTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t('site.contact.why').map((item) => (
              <div key={item.title} className="flex gap-4 scroll-scale-in">
                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gold-500/10 text-gold-600 shrink-0">
                  <Icon name="check-circle" size={24} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1 font-heading">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-r from-navy-50 to-slate-50 scroll-fade-in">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title={t('site.contact.faqTitle')} />
          <div className="space-y-4">
            {t('site.contact.faqs').map((faq) => (
              <details key={faq.q} className="group border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm scroll-scale-in">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 hover:bg-slate-50 transition-colors list-none">
                  <h3 className="text-base md:text-lg font-bold text-navy-900 font-heading">{faq.q}</h3>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0">
                    <Icon name="chevron-down" size={20} strokeWidth={2.4} />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaCard tone="dark" title={t('site.contact.cta.title')} text={t('site.contact.cta.text')} to={PATHS.apply} label={t('common.applyNow')} />
    </>
  );
}
