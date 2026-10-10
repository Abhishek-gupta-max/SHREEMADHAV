import { createContext, useContext } from 'react';
import { publicService } from '../services/publicService.js';
import { useAsync } from '../hooks/useAsync.js';

// Public contact details and social links managed in Admin → Settings.
// Blank values are hidden by the UI rather than shown as placeholders.
const SettingsContext = createContext({ settings: {}, loading: true });

export function SettingsProvider({ children }) {
  const { data, loading } = useAsync((signal) => publicService.settings({ signal }), [], { initialData: {} });
  return <SettingsContext.Provider value={{ settings: data || {}, loading }}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
