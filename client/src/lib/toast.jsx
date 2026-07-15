import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, Sparkles, X } from 'lucide-react';

// Toast system — bottom-left stack (clear of the Ask SIRUS orb bottom-right),
// accent icon tile, auto-dismiss progress bar. Fire with:
//   const { toast } = useToast();
//   toast({ title, description, variant: 'success' | 'info' | 'warn' | 'error' | 'magic' })
const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, tile: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-400' },
  info: { icon: Info, tile: 'bg-sky-100 text-sky-600', bar: 'bg-sky-400' },
  warn: { icon: AlertTriangle, tile: 'bg-amber-100 text-amber-600', bar: 'bg-amber-400' },
  error: { icon: XCircle, tile: 'bg-red-100 text-red-600', bar: 'bg-red-400' },
  magic: { icon: Sparkles, tile: 'bg-brand-100 text-brand-600', bar: 'bg-brand-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    ({ title, description = '', variant = 'info', duration = 3600 }) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, title, description, variant, duration }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-6 z-[80] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-2.5">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          return (
            <div key={t.id} className="pointer-events-auto animate-fade-up overflow-hidden rounded-2xl bg-card shadow-float ring-1 ring-ink/10">
              <div className="flex items-start gap-3 p-3.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${v.tile}`}>
                  <v.icon size={17} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-bold leading-tight text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs leading-snug text-muted">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="rounded-lg p-1 text-muted/80 transition hover:bg-ink/5 hover:text-ink">
                  <X size={14} />
                </button>
              </div>
              {t.duration > 0 && (
                <div className="h-0.5 w-full bg-ink/5">
                  <div className={`h-full ${v.bar}`} style={{ animation: `toastbar ${t.duration}ms linear forwards` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
