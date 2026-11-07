import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store.jsx';
import Icon from './Icon.jsx';

export default function Toast() {
  const { toast, closeToast } = useStore();
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast show" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Icon name="bell" /><span>{toast.msg}</span>
            <button type="button" className="x" onClick={closeToast} aria-label="Cerrar aviso"><Icon name="x" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
