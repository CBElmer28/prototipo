import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store.jsx';

export default function Toast() {
  const { toast, closeToast } = useStore();
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast show" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <span><span aria-hidden="true">🔔 </span>{toast.msg}</span>
            <button type="button" className="x" onClick={closeToast} aria-label="Cerrar aviso">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
