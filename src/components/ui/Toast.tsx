import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-accent-200 bg-accent-50',
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-accent-600',
};

const textColors = {
  success: 'text-emerald-900',
  error: 'text-red-900',
  warning: 'text-amber-900',
  info: 'text-accent-900',
};

export const ToastContainer = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${styles[toast.type]} p-4 shadow-elevated animate-slide-up`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${textColors[toast.type]}`}>{toast.title}</p>
              {toast.message && <p className={`mt-0.5 text-xs ${textColors[toast.type]} opacity-80`}>{toast.message}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className={`flex-shrink-0 rounded-md p-0.5 ${textColors[toast.type]} opacity-60 hover:opacity-100 transition-opacity`}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
