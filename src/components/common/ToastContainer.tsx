import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { isRtl } = useLanguage();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className={`fixed z-50 bottom-4 ${
        isRtl ? 'left-4' : 'right-4'
      } flex flex-col gap-2 max-w-sm w-full pointer-events-none`}
    >
      {toasts.map((toast) => {
        let bg = 'bg-emerald-800 text-white border-emerald-700';
        let Icon = CheckCircle2;

        if (toast.type === 'error') {
          bg = 'bg-rose-800 text-white border-rose-700';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-700 text-white border-amber-600';
          Icon = AlertTriangle;
        } else if (toast.type === 'info') {
          bg = 'bg-slate-800 text-white border-slate-700';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border ${bg} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
