import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import { ConfirmOptions } from '../../context/NotificationContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variant = options.variant || 'info';
  const showCancel = options.cancelText !== '';
  const confirmLabel = options.confirmText || (variant === 'danger' ? 'Hapus' : 'Ya, Lanjutkan');
  const cancelLabel = options.cancelText || 'Batal';

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50',
          btnConfirm:
            'bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-lg shadow-rose-700/25 focus:ring-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/50',
          btnConfirm:
            'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white shadow-lg shadow-amber-700/25 focus:ring-amber-500',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/50',
          btnConfirm:
            'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-700/25 focus:ring-emerald-500',
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-amber-700 dark:text-amber-400" />,
          iconBg: 'bg-amber-50 dark:bg-stone-800 border-amber-200 dark:border-stone-700',
          btnConfirm:
            'bg-gradient-to-r from-amber-700 via-amber-800 to-stone-800 hover:from-amber-600 hover:to-stone-700 text-white shadow-lg shadow-stone-800/25 focus:ring-amber-600',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with modern glassmorphism blur */}
      <div
        className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden transform transition-all p-6 sm:p-7 z-10">
        {/* Close Button Top-Right */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Tutup (Escape)"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Variant Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.iconBg}`}
          >
            {styles.icon}
          </div>

          {/* Header & Body */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              {options.title}
            </h3>

            <div className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {options.message}
            </div>

            {/* Details Box (e.g., Cascade Delete Details) */}
            {options.details && (
              <div className="mt-3.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
                {Array.isArray(options.details) ? (
                  <ul className="space-y-1 list-disc list-inside">
                    {options.details.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div>{options.details}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-7 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 ${styles.btnConfirm}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
