import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ show = true, message = 'Loading Attendly…' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center app-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="h-14 w-14 rounded-2xl gradient-btn flex items-center justify-center shadow-lg mb-4">
            <motion.div
              className="h-6 w-6 border-2 border-white/40 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          </div>
          <p className="font-display font-semibold text-lg">Attendly</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useBootLoader(ms = 900) {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return booting;
}
