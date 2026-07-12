import { Check } from 'lucide-react';

export const STEPS = ['Compliance', 'Upload', 'Preview', 'Quotation'];

export const REGION_NAMES = { FR: 'France', DE: 'Germany', ES: 'Spain', IT: 'Italy', UK: 'United Kingdom', CH: 'Switzerland' };
export const regionName = (code) => REGION_NAMES[code] || code || '—';

export function Stepper({ current }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <Check size={13} /> : i + 1}
            </span>
            <span className={`font-semibold ${active ? 'text-ink' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

// Live "Summary Report" mini cover — updates as metadata is entered (image 1, right).
export function SummaryPanel({ meta }) {
  const crumbs = [regionName(meta.region), meta.compliance, meta.language].filter(Boolean);
  return (
    <div className="sticky top-24">
      <p className="eyebrow-app">Summary Report</p>
      <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-200">
            ★ Official Minutes · {meta.compliance || 'CSE'}
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight">
            {meta.meetingName || 'Your meeting title'}
          </h3>
          <p className="mt-2 text-sm font-semibold text-brand-100">
            {meta.company || 'Your organisation'}
            {meta.meetingLocation ? ` · ${meta.meetingLocation}` : ''}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-100 text-sm">
          <Field label="Region" value={regionName(meta.region)} />
          <Field label="Compliance" value={meta.compliance || '—'} />
          <Field label="Language" value={meta.language || '—'} />
          <Field label="Meeting type" value={meta.meetingType || '—'} />
          <Field label="Date" value={meta.meetingDate ? new Date(meta.meetingDate).toLocaleDateString() : '—'} />
          <Field label="Tier" value={meta.tier || 'Scope'} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {crumbs.map((c) => (
          <span key={c} className="chip bg-brand-50 text-brand-700">{c}</span>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 truncate font-semibold text-ink">{value}</p>
    </div>
  );
}
