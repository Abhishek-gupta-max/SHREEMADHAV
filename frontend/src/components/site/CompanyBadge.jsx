import { useT } from '../../context/LanguageContext.jsx';
import { COMPANY } from '../../constants/site.js';
import { Icon } from '../common/Icon.jsx';

/** "Registered company" badge shown beside the logo and in the mobile drawer. */
export function CompanyBadge({ variant = 'inline' }) {
  const t = useT();
  const lines = (
    <div className="flex flex-col justify-center" style={{ lineHeight: 1.15 }}>
      <span className="text-navy-700 font-extrabold uppercase tracking-wide whitespace-nowrap" style={{ fontSize: '9.5px', letterSpacing: '0.06em' }}>
        {t('site.badge.line1')}
      </span>
      <span className="text-slate-500 font-semibold whitespace-nowrap mt-[3px]" style={{ fontSize: '8.5px' }}>
        {t('site.badge.line2')}
      </span>
      <span className="text-slate-500 font-semibold whitespace-nowrap mt-[2px]" style={{ fontSize: '8.5px' }}>
        {t('site.badge.line3').replace('{cin}', COMPANY.cin)}
      </span>
    </div>
  );

  if (variant === 'box') {
    return (
      <div className="bg-navy-50 border border-navy-100 rounded-xl p-3.5 flex gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-white border border-navy-100 flex items-center justify-center text-brand-600 shrink-0">
          <Icon name="shield" size={18} />
        </span>
        {lines}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
      <span className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 flex items-center justify-center text-brand-600 shrink-0">
        <Icon name="shield" size={18} />
      </span>
      {lines}
    </div>
  );
}
