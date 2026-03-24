import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';

const icons = {
  success: <HiCheckCircle className="w-5 h-5 text-green-500" />,
  error: <HiExclamationCircle className="w-5 h-5 text-red-500" />,
  info: <HiInformationCircle className="w-5 h-5 text-primary-500" />,
};

export default function ToastContainer() {
  const context = useNotifications();
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-strong rounded-xl p-4 shadow-xl flex items-start gap-3"
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm font-medium text-surface-800 dark:text-surface-200 flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
              <HiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
