import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import './toast.css';

// Context definition
const ToastContext = createContext({
  showToast: (msg, type = 'success') => {}
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    // Auto dismiss after 3 seconds (default)
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  // Expose toast methods globally for legacy code compatibility
  useEffect(() => {
    const toastMethods = {
      success: (msg) => showToast(msg, 'success'),
      error: (msg) => showToast(msg, 'error'),
      warning: (msg) => showToast(msg, 'warning'),
      info: (msg) => showToast(msg, 'info'),
    };
    // Assign to window for backward compatibility
    window.toast = toastMethods;
    window.showToast = showToast;
    // Cleanup on unmount
    return () => {
      delete window.toast;
      delete window.showToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="toast-container">
        {toasts.map(({ id, msg, type }) => (
          <div key={id} className={`toast toast-${type}`} onClick={() => removeToast(id)}>
            {msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
