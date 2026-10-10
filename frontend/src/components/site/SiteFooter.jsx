import { Link } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { useServices } from '../../hooks/useServices.js';
import { MAIN_NAV, SOCIAL_LINKS } from '../../constants/navigation.js';
import { PATHS } from '../../constants/publicRoutes.js';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';
import { telHref, whatsappHref } from '../../utils/format.js';
import { Logo } from '../common/Logo.jsx';
import { Icon } from '../common/Icon.jsx';
import { LanguageSelector } from '../common/LanguageSelector.jsx';
import { btnPrimary } from './ui.js';

function FooterHeading({ children }) {
  return (
    <h2 className="text-white font-bold text-[15px] mb-6 relative inline-block font-heading">
      {children}
      <span className="absolute -bottom-2 left-0 w-8 h-[2.5px] bg-gradient-to-r from-brand-500 to-gold-400 rounded-full" />
    </h2>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-2.5 text-slate-400 hover:text-gold-300 transition-all duration-300 group">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-gold-300 transition-colors" />
        {children}
      </Link>
    </li>
  );
}

function ContactRow({ icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 text-gold-400">
        <Icon name={icon} size={16} />
      </span>
      <span className="text-slate-400 leading-relaxed pt-1.5 min-w-0 break-words">{children}</span>
    </li>
  );
}

export function SiteFooter() {
  const t = useT();
  const { settings } = useSiteSettings();
  const { data: services } = useServices();
  const year = new Date().getFullYear();
  const socials = SOCIAL_LINKS.filter((item) => settings[item.key]);

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #071528 0%, #0c2340 50%, #071528 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      {/* CTA banner */}
      <div className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto px-6 max-w-6xl py-12">
          <div className="bg-gradient-to-r from-navy-600/60 to-brand-700/40 rounded-2xl p-8 md:p-10 border border-white/[0.08] shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-heading">{t('site.footer.ctaTitle')}</h2>
                <p className="text-navy-100/80 text-sm md:text-base max-w-lg">{t('site.footer.ctaText')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link to={PATHS.apply} className={btnPrimary}>
                  <Icon name="user-plus" size={16} strokeWidth={2.2} />
                  {t('nav.apply')}
                </Link>
                <Link
                  to={PATHS.contact}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Icon name="chat" size={16} />
                  {t('site.footer.talk')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="relative z-10 mx-auto px-6 max-w-6xl pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Logo tone="light" />
            <p className="text-slate-400 text-[13px] leading-relaxed">{t('site.footer.profile')}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-2.5 pt-1">
                {socials.map((item) => (
                  <a
                    key={item.key}
                    href={settings[item.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Icon name={item.icon} size={16} />
                  </a>
                ))}
              </div>
            )}
            <LanguageSelector tone="light" placement="top" align="start" />
          </div>

          <nav aria-label={t('site.footer.quickLinks')}>
            <FooterHeading>{t('site.footer.quickLinks')}</FooterHeading>
            <ul role="list" className="space-y-3 text-[13px]">
              {MAIN_NAV.map((item) => (
                <FooterLink key={item.to} to={item.to}>
                  {t(item.label)}
                </FooterLink>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('site.footer.services')}>
            <FooterHeading>{t('site.footer.services')}</FooterHeading>
            <ul role="list" className="space-y-3 text-[13px]">
              {(services || []).map((service) => (
                <FooterLink key={service.id} to={`${PATHS.services}#${service.slug}`}>
                  {service.title}
                </FooterLink>
              ))}
            </ul>
          </nav>

          <div>
            <FooterHeading>{t('site.footer.contact')}</FooterHeading>
            <ul role="list" className="space-y-4 text-[13px]">
              <ContactRow icon="map-pin">{settings.office_address || REGISTERED_OFFICE_TEXT}</ContactRow>
              {settings.contact_phone && (
                <ContactRow icon="phone">
                  <a href={telHref(settings.contact_phone)} className="hover:text-gold-300 transition-colors font-medium">
                    {settings.contact_phone}
                  </a>
                </ContactRow>
              )}
              {settings.contact_email && (
                <ContactRow icon="mail">
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-gold-300 transition-colors font-medium break-all">
                    {settings.contact_email}
                  </a>
                </ContactRow>
              )}
              {settings.contact_whatsapp && (
                <ContactRow icon="whatsapp">
                  <a href={whatsappHref(settings.contact_whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors font-medium">
                    {settings.contact_whatsapp}
                  </a>
                </ContactRow>
              )}
              {settings.office_hours && <ContactRow icon="clock">{settings.office_hours}</ContactRow>}
            </ul>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="border-t border-white/[0.06] pt-8 pb-2">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            <p className="text-[12px] text-slate-500 text-center lg:text-left order-2 lg:order-1">
              © {year}{' '}
              <Link className="text-slate-400 hover:text-gold-300 font-semibold transition-colors" to={PATHS.home}>
                {t('common.legalName')}
              </Link>
              . {t('footer.rights')}{' '}
              <Link to={PATHS.privacy} className="hover:text-gold-300 underline-offset-2 hover:underline">
                {t('footer.privacy')}
              </Link>{' '}
              ·{' '}
              <Link to={PATHS.terms} className="hover:text-gold-300 underline-offset-2 hover:underline">
                {t('footer.terms')}
              </Link>
            </p>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 rounded-xl order-1 lg:order-2 text-center">
              <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
              <span>
                {t('footer.cin')}: <span className="text-white font-mono font-bold">{COMPANY.cin}</span>
              </span>
            </div>

            <div className="order-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-[12px] text-slate-400 hover:text-gold-300 transition-all duration-300 group"
              >
                <span className="font-semibold">{t('site.footer.backToTop')}</span>
                <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center group-hover:bg-brand-600 group-hover:border-brand-600 group-hover:text-white transition-all duration-300 group-hover:-translate-y-1">
                  <Icon name="chevron-up" size={16} strokeWidth={2.4} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
