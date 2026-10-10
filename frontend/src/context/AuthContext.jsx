import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onUnauthorized } from '../services/api.js';
import { authService } from '../services/adminService.js';

// The session lives in an HTTP-only cookie that JavaScript cannot read; this
// context only mirrors who is signed in, as reported by /auth/session.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | authenticated | anonymous

  useEffect(() => {
    const controller = new AbortController();
    authService
      .session({ signal: controller.signal })
      .then((current) => {
        setAdmin(current);
        setStatus(current ? 'authenticated' : 'anonymous');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('anonymous');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      setAdmin(null);
      setStatus('anonymous');
    });
    return () => onUnauthorized(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const current = await authService.login(credentials);
    setAdmin(current);
    setStatus('authenticated');
    return current;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAdmin(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      status,
      login,
      logout,
      setAdmin,
      canEdit: admin?.role === 'super_admin' || admin?.role === 'admin',
      isSuperAdmin: admin?.role === 'super_admin',
    }),
    [admin, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
