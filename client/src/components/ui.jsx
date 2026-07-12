import { Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  awaiting: 'bg-amber-100 text-amber-700',
  generating: 'bg-brand-100 text-brand-700',
  'in-editing': 'bg-sky-100 text-sky-700',
  locked: 'bg-violet-100 text-violet-700',
  dispatched: 'bg-emerald-100 text-emerald-700',
};
const STATUS_LABEL = {
  draft: 'Draft',
  awaiting: 'Awaiting transcription',
  generating: 'Generating…',
  'in-editing': 'In editing',
  locked: 'Locked',
  dispatched: 'Dispatched',
};

export function StatusChip({ status }) {
  return <span className={`chip ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>{STATUS_LABEL[status] || status}</span>;
}

const TIER_STYLES = {
  Essential: 'bg-brand-50 text-brand-700 ring-brand-200',
  Scope: 'bg-sky-50 text-sky-700 ring-sky-200',
  Premium: 'bg-amber-50 text-amber-700 ring-amber-200',
};
export function TierBadge({ tier }) {
  return <span className={`chip ring-1 ${TIER_STYLES[tier] || TIER_STYLES.Scope}`}>{tier}</span>;
}

export function RiskChip({ level }) {
  const styles = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600' };
  return <span className={`chip ${styles[level] || styles.Medium}`}>{level} Risk</span>;
}

export function Spinner({ label, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`}>
      <Loader2 className="animate-spin" size={18} /> {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
      {Icon && <Icon className="mb-3 text-slate-300" size={32} />}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-500">{children}</p>}
    </div>
  );
}

export function PageShell({ children, className = '' }) {
  return <main className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 ${className}`}>{children}</main>;
}

export function Modal({ open, onClose, children, size = 'lg' }) {
  if (!open) return null;
  const width = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`my-8 w-full ${width} rounded-2xl bg-white shadow-card`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
