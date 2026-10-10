// Shared utility-class recipes for the public site, so buttons and cards look
// identical everywhere without repeating long class strings.

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-700/20 transition-all duration-300 hover:-translate-y-0.5';

export const btnOutlineLight =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent hover:bg-white/5 border-2 border-white/20 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5';

export const card = 'bg-white rounded-2xl shadow-md border border-slate-100';

export const iconTile =
  'w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center text-white shadow-sm';

export const sectionTitle = 'text-4xl font-bold text-navy-900 font-heading';

export const container = 'mx-auto w-full max-w-6xl px-4';
