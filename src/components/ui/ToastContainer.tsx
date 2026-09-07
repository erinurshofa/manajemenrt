import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem } from '../../context/NotificationContext';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
                border: 'border-emerald-200 dark:border-emerald-800/60',
                bg: 'bg-white/95 dark:bg-stone-900/95',
                indicator: 'bg-emerald-500',
              };
            case 'error':
              return {
                icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
                border: 'border-rose-200 dark:border-rose-800/60',
                bg: 'bg-white/95 dark:bg-stone-900/95',
                indicator: 'bg-rose-500',
              };
            case 'warning':
              return {
                icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
                border: 'border-amber-200 dark:border-amber-800/60',
                bg: 'bg-white/95 dark:bg-stone-900/95',
                indicator: 'bg-amber-500',
              };
            default:
              return {
                icon: <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />,
                border: 'border-stone-200 dark:border-stone-800',
                bg: 'bg-white/95 dark:bg-stone-900/95',
                indicator: 'bg-amber-600',
              };
          }
        };

        const styles = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md border ${styles.border} ${styles.bg} transform transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in`}
            role="status"
          >
            {/* Color Accent Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.indicator}`} />

            {/* Icon */}
            <div className="mt-0.5">{styles.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-2">
              {toast.title && (
                <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight mb-0.5">
                  {toast.title}
                </p>
              )}
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug break-words">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
