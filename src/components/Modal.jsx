// src/components/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, footer }) {
  // lock body scroll + close on Esc
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal container */}
      <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
        <div
          className="w-full max-w-3xl bg-white border border-app-border rounded-xl shadow-card grid"
          style={{ gridTemplateRows: 'auto 1fr auto', maxHeight: '85vh' }}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Dialog'}
        >
          {/* header */}
          <div className="px-4 sm:px-5 py-3 border-b border-app-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
            >
              <X size={18} />
            </button>
          </div>

          {/* body (scrolls) */}
          <div className="p-4 sm:p-5 overflow-y-auto">{children}</div>

          {/* footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-app-border flex justify-end gap-2">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
