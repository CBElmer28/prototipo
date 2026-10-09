import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store.jsx';

export default function Toast() {
  const { toast } = useStore();
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && <motion.div key={toast.id} className="toast show" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>{toast.msg}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
