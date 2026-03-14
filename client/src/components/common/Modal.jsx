import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl overflow-hidden`}
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                {title && <h2 className="font-display font-600 text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h2>}
                {onClose && (
                  <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <div className="overflow-y-auto max-h-[80vh] px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
