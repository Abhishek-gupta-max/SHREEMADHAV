import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useT } from '../../context/LanguageContext.jsx';
import { useSiteSettings } from '../../context/SettingsContext.jsx';
import { MAIN_NAV } from '../../constants/navigation.js';
import { PATHS } from '../../constants/publicRoutes.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { telHref, whatsappHref } from '../../utils/format.js';
import { Logo } from '../common/Logo.jsx';
import { Icon } from '../common/Icon.jsx';
import { LanguageSegmented, LanguageSelector } from '../common/LanguageSelector.jsx';
import { CompanyBadge } from './CompanyBadge.jsx';

const applyButton =
  'items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-[12.5px] font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap';

export function SiteNavbar() {
  const t = useT();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  useFocusTrap(drawerRef, open, () => setOpen(false));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', open);
    return () => document.body.classList.remove('is-locked');
  }, [open]);

  useEffect(() => {
    const onResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const linkClass = ({ isActive }) =>
    `px-2.5 py-1.5 text-[13px] font-semibold rounded-md whitespace-nowrap transition-all duration-150 ${
      isActive ? 'text-navy-700 bg-navy-50 font-bold' : 'text-slate-600 hover:text-navy-700 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm" aria-label={t('nav.primary')}>
      <div className="mx-auto px-4 sm:px-5 xl:px-8 max-w-[1440px]">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo + registration badge */}
          <div className="flex items-center min-w-0">
            <Logo size="sm" />
            <div className="hidden 2xl:flex">
              <CompanyBadge />
            </div>
          </div>

          {/* Desktop links */}
          <ul role="list" className="hidden xl:flex items-center gap-0.5 mx-2">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={linkClass}>
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Language, Apply, menu */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="site-nav-lang">
              <LanguageSelector />
            </div>
            {!pathname.startsWith(PATHS.apply) && (
              <Link to={PATHS.apply} className={`hidden md:inline-flex ${applyButton}`}>
                <Icon name="user-plus" size={15} strokeWidth={2.2} />
                {t('nav.apply')}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="xl:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label={t('common.openMenu')}
              aria-expanded={open}
              aria-controls="site-drawer"
            >
              <Icon name="menu" size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 xl:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t('common.menu')}
        inert={!open}
        className={`fixed top-0 right-0 bottom-0 w-[320px] max-w-[88vw] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out xl:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Logo size="sm" onClick={() => setOpen(false)} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label={t('common.closeMenu')}
          >
            <Icon name="close" size={20} strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-6">
          <CompanyBadge variant="box" />

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-1">{t('site.drawer.menu')}</span>
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-navy-50 text-navy-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-navy-700'
                  }`
                }
              >
                <span className="text-slate-400">
                  <Icon name={item.icon} size={17} />
                </span>
                {t(item.label)}
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2">{t('site.drawer.action')}</span>
            <Link
              to={PATHS.apply}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              <Icon name="user-plus" size={16} strokeWidth={2.2} />
              {t('nav.apply')}
            </Link>
          </div>

          <LanguageSegmented />

          {(settings.contact_phone || settings.contact_email || settings.contact_whatsapp || settings.office_hours) && (
            <div className="mt-auto pt-5 border-t border-slate-100 flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2">{t('site.drawer.contact')}</span>
              <div className="flex flex-col gap-2.5 px-2 text-xs text-slate-500">
                {settings.contact_phone && (
                  <a href={telHref(settings.contact_phone)} className="flex items-center gap-2 hover:text-navy-700">
                    <Icon name="phone" size={14} /> {settings.contact_phone}
                  </a>
                )}
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-navy-700 break-all">
                    <Icon name="mail" size={14} /> {settings.contact_email}
                  </a>
                )}
                {settings.contact_whatsapp && (
                  <a href={whatsappHref(settings.contact_whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-600">
                    <Icon name="whatsapp" size={14} /> {settings.contact_whatsapp}
                  </a>
                )}
                {settings.office_hours && (
                  <span className="flex items-center gap-2">
                    <Icon name="clock" size={14} /> {settings.office_hours}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
