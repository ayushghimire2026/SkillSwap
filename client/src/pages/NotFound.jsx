import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-9xl font-black gradient-text">404</h1>
        <p className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mt-4">Page Not Found</p>
        <p className="text-surface-400 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary text-base px-8 py-3">
          ← Go Home
        </Link>
      </motion.div>
    </div>
  );
}
