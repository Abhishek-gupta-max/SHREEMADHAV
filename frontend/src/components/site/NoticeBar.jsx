import { useT } from '../../context/LanguageContext.jsx';
import { COMPANY, REGISTERED_OFFICE_TEXT } from '../../constants/site.js';

/** Thin scrolling notice strip above the navigation (pauses on hover). */
export function NoticeBar() {
  const t = useT();
  const items = t('site.notice.items').map((item) =>
    item.replace('{cin}', COMPANY.cin).replace('{address}', REGISTERED_OFFICE_TEXT),
  );

  return (
    <div className="bg-navy-900 text-white py-1.5 text-[11px] font-semibold tracking-wide border-b border-white/10 select-none">
      <div className="mx-auto max-w-6xl px-4 flex items-center gap-3">
        <span className="bg-brand-600 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded shrink-0 shadow-sm">
          {t('site.notice.label')}
        </span>
        <div className="ticker flex-1 min-w-0" role="marquee" aria-label={t('site.notice.label')}>
          <div className="ticker__track text-white/90">
            {items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
