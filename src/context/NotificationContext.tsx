import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastContainer } from '../components/ui/ToastContainer';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  details?: string | string[] | React.ReactNode;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertModalOptions {
  title: string;
  message: React.ReactNode;
  variant?: DialogVariant;
  buttonText?: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alertModal: (options: AlertModalOptions | string) => Promise<void>;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Confirm Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  });

  // Alert Modal State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertModalOptions;
    resolve?: () => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  });

  // Toasts State
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleCloseDialog = useCallback((result: boolean) => {
    setDialogState((prev) => {
      if (prev.resolve) prev.resolve(result);
      return { ...prev, isOpen: false };
    });
  }, []);

  const alertModal = useCallback((optionsOrMsg: AlertModalOptions | string): Promise<void> => {
    const opts: AlertModalOptions =
      typeof optionsOrMsg === 'string'
        ? { title: 'Pemberitahuan', message: optionsOrMsg, variant: 'info' }
        : optionsOrMsg;

    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options: opts,
        resolve,
      });
    });
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertState((prev) => {
      if (prev.resolve) prev.resolve();
      return { ...prev, isOpen: false };
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, duration = 3500) => {
      const id = `toast-${++toastIdRef.current}-${Date.now()}`;
      const newToast: ToastItem = { id, type, message, title, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: useCallback((msg: string, title?: string) => addToast('success', msg, title), [addToast]),
    error: useCallback((msg: string, title?: string) => addToast('error', msg, title), [addToast]),
    info: useCallback((msg: string, title?: string) => addToast('info', msg, title), [addToast]),
    warning: useCallback((msg: string, title?: string) => addToast('warning', msg, title), [addToast]),
  };

  return (
    <NotificationContext.Provider value={{ confirm, alertModal, toast }}>
      {children}

      {/* Render Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        options={dialogState.options}
        onConfirm={() => handleCloseDialog(true)}
        onCancel={() => handleCloseDialog(false)}
      />

      {/* Render Alert Dialog Modal */}
      <ConfirmDialog
        isOpen={alertState.isOpen}
        options={{
          title: alertState.options.title,
          message: alertState.options.message,
          variant: alertState.options.variant || 'info',
          confirmText: alertState.options.buttonText || 'OK, Mengerti',
          cancelText: '', // Empty cancel text hides the cancel button
        }}
        onConfirm={handleCloseAlert}
        onCancel={handleCloseAlert}
      />

      {/* Render Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Convenience hooks
export const useConfirm = () => {
  const { confirm } = useNotification();
  return confirm;
};

export const useToast = () => {
  const { toast } = useNotification();
  return toast;
};

export const useAlertModal = () => {
  const { alertModal } = useNotification();
  return alertModal;
};
