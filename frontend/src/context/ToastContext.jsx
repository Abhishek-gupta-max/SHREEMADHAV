import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/common/Icon.jsx';
import './Toast.css';

const ToastContext = createContext(null);
const DURATION = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, { tone = 'success', title } = {}) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone, title }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => show(message, { ...options, tone: 'success' }),
      error: (message, options) => show(message, { ...options, tone: 'error' }),
      info: (message, options) => show(message, { ...options, tone: 'info' }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-region" role="region" aria-label="Notifications">
        <ol className="toast-list" role="list" aria-live="polite">
          {toasts.map((item) => (
            <li key={item.id} className={`toast toast--${item.tone}`} role={item.tone === 'error' ? 'alert' : 'status'}>
              <Icon name={item.tone === 'error' ? 'alert-circle' : item.tone === 'info' ? 'info' : 'check-circle'} size={18} />
              <div className="toast__body">
                {item.title && <strong>{item.title}</strong>}
                <span>{item.message}</span>
              </div>
              <button type="button" className="toast__close" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
