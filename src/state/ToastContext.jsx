import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import { Modal } from '../components/Modal.jsx';

const ToastContext = createContext(null);

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};
const ACCENT = {
  error: '#dc2626',
  success: VC_GREEN,
  info: '#57534e',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null); // { message, confirmText, cancelText, danger, resolve }
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, { type = 'info', duration = 4000 } = {}) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const confirm = useCallback(
    (message, opts = {}) =>
      new Promise((resolve) => {
        setDialog({
          message,
          confirmText: opts.confirmText || 'Confirmar',
          cancelText: opts.cancelText || 'Cancelar',
          danger: !!opts.danger,
          resolve,
        });
      }),
    []
  );

  const closeDialog = (result) => {
    setDialog((d) => {
      d?.resolve(result);
      return null;
    });
  };

  return (
    <ToastContext.Provider value={{ notify, confirm }}>
      {children}

      <div className="fixed bottom-4 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              role="status"
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto cursor-pointer bg-white border border-stone-200 rounded-lg shadow-lg p-3 flex items-start gap-2 text-sm"
              style={{ borderLeft: `3px solid ${ACCENT[t.type] || ACCENT.info}` }}
            >
              <Icon
                size={16}
                className="mt-0.5 flex-shrink-0"
                style={{ color: ACCENT[t.type] || ACCENT.info }}
              />
              <span className="flex-1 text-stone-800">{t.message}</span>
              <X size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />
            </div>
          );
        })}
      </div>

      {dialog && (
        <Modal
          onClose={() => closeDialog(false)}
          ariaLabel="Confirmação"
          className="w-full md:max-w-sm rounded-t-2xl md:rounded-xl p-5"
        >
          <p className="text-sm text-stone-800 whitespace-pre-line mb-4">
            {dialog.message}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => closeDialog(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              {dialog.cancelText}
            </button>
            <button
              onClick={() => closeDialog(true)}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: dialog.danger ? '#dc2626' : VC_GREEN }}
            >
              {dialog.confirmText}
            </button>
          </div>
        </Modal>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() precisa estar dentro de <ToastProvider>.');
  return ctx;
}
