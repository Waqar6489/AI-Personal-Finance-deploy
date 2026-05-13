import { useState, useCallback } from 'react';

let toastFn = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  toastFn = showToast;

  return { toasts, showToast };
}

export function toast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export function ToastContainer({ toasts }) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{icons[t.type] || '📢'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
