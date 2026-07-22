import { createContext, useContext, useState, useCallback } from 'react';
import { uid } from '../utils/helpers';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3200) => {
      const id = uid('toast');
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`glass rounded-2xl px-4 py-3 text-sm shadow-lg border-l-4 animate-[slideIn_0.25s_ease] ${
              t.type === 'success'
                ? 'border-l-emerald-500'
                : t.type === 'error'
                  ? 'border-l-rose-500'
                  : t.type === 'warning'
                    ? 'border-l-amber-500'
                    : 'border-l-primary'
            }`}
            style={{ background: 'var(--bg-card)', color: 'var(--text)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{t.message}</span>
              <button type="button" className="text-[var(--text-muted)] hover:opacity-80" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
