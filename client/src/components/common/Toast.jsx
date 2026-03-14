import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const styles = {
  success: 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
  error: 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  warning: 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  info: 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[t.type]}`}
                style={{ background: 'var(--bg-primary)' }}
              >
                <Icon size={16} className="mt-0.5 shrink-0" />
                <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</p>
                <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
