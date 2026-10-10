import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { Icon } from '../common/Icon.jsx';
import { btnPrimary, card, container } from './ui.js';

// Reusable sections of the reference layout.

/** Full-width photographic hero with a dark overlay and centred gold title. */
export function HeroBanner({ image, title, text, size = 'lg', children }) {
  const padding = size === 'sm' ? 'pt-20 pb-16 md:pt-24 md:pb-20' : 'pt-28 pb-20 md:pt-36 md:pb-32';
  const heading = size === 'sm' ? 'text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl';
  return (
    <section className={`relative overflow-hidden text-white ${padding}`}>
      {image && (
        <img
          src={`/images/${image}-1600.webp`}
          srcSet={`/images/${image}-800.webp 800w, /images/${image}-1600.webp 1600w`}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-navy-950/90 to-navy-900/80 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-gold-500/10 rounded-full -top-[100px] -right-[100px] pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] bg-gold-500/5 rounded-full -bottom-[50px] -left-[50px] pointer-events-none" />

      <div className={`${container} relative z-10`}>
        <div className="text-center animate-fade-in-up">
          <h1 className={`${heading} font-bold mb-6 leading-tight font-heading text-gold-300`}>{title}</h1>
          {text && <p className="text-lg md:text-xl text-navy-100 max-w-2xl mx-auto leading-relaxed">{text}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ badge, title, text, light = false, className = 'mb-16' }) {
  return (
    <div className={`text-center ${className}`}>
      {badge && (
        <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 text-sm font-semibold rounded-full mb-4">{badge}</span>
      )}
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 font-heading ${light ? 'text-white' : 'text-navy-900'}`}>{title}</h2>
      {text && <p className={`text-lg md:text-xl max-w-2xl mx-auto ${light ? 'text-navy-100' : 'text-slate-600'}`}>{text}</p>}
    </div>
  );
}

/** Closing call to action. `tone="light"` = pale card, `tone="dark"` = navy card. */
export function CtaCard({ title, text, to, label, icon = 'user-plus', tone = 'light' }) {
  const dark = tone === 'dark';
  return (
    <section className="py-20 px-4 scroll-fade-in">
      <div className="mx-auto max-w-4xl">
        <div
          className={`text-center py-14 md:py-16 px-6 md:px-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
            dark ? 'bg-gradient-to-br from-navy-600 to-navy-900' : 'bg-gradient-to-r from-navy-50 to-slate-50 border-2 border-gold-300/40'
          }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 font-heading ${dark ? 'text-white' : 'text-navy-900'}`}>{title}</h2>
          <p className={`mb-8 text-base md:text-lg ${dark ? 'text-navy-100' : 'text-slate-700'}`}>{text}</p>
          <Link to={to} className={btnPrimary}>
            {icon && <Icon name={icon} size={18} strokeWidth={2.2} />}
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Four factual highlight cards (replaces the reference's statistics row). */
export function FactCards({ withText = false }) {
  const t = useT();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {t('site.facts').map((fact) => (
        <div key={fact.label} className={`${card} text-center p-6 hover:scale-[1.03] transition-all duration-300 scroll-scale-in`}>
          <div className="text-3xl md:text-4xl font-bold text-gold-500 font-heading break-words">{fact.value}</div>
          <div className="text-slate-700 font-semibold mt-2 text-sm">{fact.label}</div>
          {withText && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{fact.text}</p>}
        </div>
      ))}
    </div>
  );
}

/** Company registration details (CIN, incorporation, registered office). */
export function RegistrationSection({ background = 'bg-white' }) {
  const t = useT();
  const fill = (value) => value.replace('{cin}', COMPANY.cin).replace('{address}', REGISTERED_OFFICE_TEXT);
  const icons = ['file-check', 'shield', 'map-pin'];
  const tints = ['from-gold-50 to-gold-100', 'from-navy-50 to-navy-100', 'from-brand-50 to-brand-100'];

  return (
    <section className={`py-20 px-4 ${background} scroll-fade-in`} id="registration">
      <div className="mx-auto max-w-6xl">
        <SectionHeading badge={t('site.registration.badge')} title={t('site.registration.title')} text={t('site.registration.text')} className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {t('site.registration.cards').map((item, index) => (
            <div key={item.title} className="scroll-scale-in group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100">
              <div className={`relative bg-gradient-to-br ${tints[index]} p-6 flex items-center justify-center h-36`}>
                <span className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={icons[index]} size={30} />
                </span>
                <span className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Icon name="check" size={15} strokeWidth={2.6} />
                </span>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-base font-bold text-navy-900 font-heading">{item.title}</h3>
                <p className="text-xs text-gold-600 font-semibold mb-2">{item.subtitle}</p>
                <p className="text-sm text-slate-700 font-medium break-words">{fill(item.value)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="w-14 h-14 bg-gold-400/20 rounded-full flex items-center justify-center shrink-0 text-gold-300">
                <Icon name="shield" size={28} />
              </span>
              <div>
                <p className="text-sm text-navy-200 mb-1">{t('site.registration.barLabel')}</p>
                <p className="text-xl text-gold-200 font-bold font-heading">{t('site.registration.barTitle')}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-navy-200 text-sm">{t('site.registration.barRight')}</p>
                <p className="text-lg text-gold-200 font-bold font-heading">{t('site.registration.barRightValue')}</p>
              </div>
              <a
                href="https://www.mca.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors"
              >
                {t('site.registration.verify')} <Icon name="external" size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Navy gradient section with icon + text reasons (Home and About). */
export function WhyChooseSection({ title, text, items }) {
  const icons = ['check', 'star', 'shield', 'user-check', 'lock', 'handshake'];
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-navy-600 to-navy-900 text-white scroll-fade-in">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={title} text={text} light />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {items.map((item, index) => (
            <div key={item.title} className="flex gap-4">
              <span className="w-12 h-12 rounded-xl bg-gold-300/20 flex items-center justify-center shrink-0 text-gold-300">
                <Icon name={icons[index % icons.length]} size={22} strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">{item.title}</h3>
                <p className="text-navy-100 text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Numbered step cards (Services and Process pages). */
export function StepCards({ steps, columns = 'lg:grid-cols-4', compact = false }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-6`}>
      {steps.map((step, index) => (
        <div
          key={step.title}
          className={`${card} ${compact ? 'text-center p-6 shadow-sm' : 'p-6 hover:-translate-y-2 hover:shadow-lg'} transition-all duration-300 scroll-scale-in`}
        >
          <div
            className={
              compact
                ? 'w-12 h-12 rounded-full bg-gold-300 text-navy-900 font-bold text-lg flex items-center justify-center mx-auto mb-4 font-heading'
                : 'flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-full text-2xl font-bold mb-4 font-heading shadow-md'
            }
          >
            {index + 1}
          </div>
          <h3 className={`font-bold text-navy-900 mb-2 font-heading ${compact ? 'text-sm' : 'text-xl'}`}>{step.title}</h3>
          <p className={`text-slate-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>{step.text}</p>
        </div>
      ))}
    </div>
  );
}

export function CheckItem({ children, icon = 'check-circle' }) {
  return (
    <li className="flex gap-3">
      <span className="text-gold-600 shrink-0 mt-0.5">
        <Icon name={icon} size={22} strokeWidth={2} />
      </span>
      <span className="text-slate-700 font-medium">{children}</span>
    </li>
  );
}
