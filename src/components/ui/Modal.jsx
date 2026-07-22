import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Button } from './Button';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close overlay"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${widths[size]} rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5" aria-label="Close">
                <FiX />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </Modal>
  );
}
