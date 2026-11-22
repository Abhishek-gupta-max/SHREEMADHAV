import { createContext, useContext } from 'react';
import { publicService } from '../services/publicService.js';
import { useAsync } from '../hooks/useAsync.js';

// Public contact details and social links managed in Admin → Settings.
// Blank values are hidden by the UI rather than shown as placeholders.
const SettingsContext = createContext({ settings: {}, loading: true });

// Fallback settings shown when the API is unavailable (Vercel static deployment).
// Update these to match real contact details.
const FALLBACK_SETTINGS = {
  contact_phone: '',
  contact_email: '',
  contact_whatsapp: '',
  office_hours: '',
  office_address: 'SCO 156-157, 4th Floor, Sector 34A, Chandigarh 160022, India',
  social_facebook: '',
  social_linkedin: '',
  social_instagram: '',
  social_youtube: '',
  social_x: '',
};

export function SettingsProvider({ children }) {
  const { data, loading } = useAsync(
    async (signal) => {
      try {
        return await publicService.settings({ signal });
      } catch {
        return FALLBACK_SETTINGS;
      }
    },
    [],
    { initialData: FALLBACK_SETTINGS },
  );
  return (
    <SettingsContext.Provider value={{ settings: data || FALLBACK_SETTINGS, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
