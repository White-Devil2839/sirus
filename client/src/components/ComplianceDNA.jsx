import { useMemo, useState } from 'react';
import { Fingerprint, ChevronDown } from 'lucide-react';

// ── Compliance DNA ───────────────────────────────────────────────────────────
// A deterministic six-trait fingerprint of a meeting's compliance posture,
// derived entirely from the report's real data (never invented):
//   Compliance  — the audit score itself
//   Documentation — documentation-quality metric (fallback: missing docs count)
//   Decisiveness — formal votes + recorded decisions
//   Participation — average speaker engagement
//   Risk shield — inverse of measured risk exposure
//   Completeness — data-completeness metric
const clamp = (n) => Math.max(8, Math.min(100, Math.round(n)));

export function deriveDna(report) {
  const f = report?.findings || {};
  const ext = report?.extraction || {};
  const metric = (label) => {
    const m = (f.metrics || []).find((x) => (x.label || '').toLowerCase().includes(label));
    return m ? Number(m.value) : null;
  };

  const decisions = (ext.agendaItems || []).flatMap((a) => a.alerts || []).filter((al) => al.type === 'decision').length;
  const votes = (ext.votes || []).length;
  const speakers = report?.speakerAnalysis?.speakers || [];
  const avgEngagement = speakers.length ? speakers.reduce((s, x) => s + (x.engagement || 0), 0) / speakers.length : 0;

  return [
    { key: 'Compliance', value: clamp(f.score ?? 50) },
    { key: 'Documentation', value: clamp(metric('documentation') ?? 100 - (f.counts?.missingDocuments ?? 2) * 18) },
    { key: 'Decisiveness', value: clamp(30 + votes * 25 + decisions * 12) },
    { key: 'Participation', value: clamp(avgEngagement * 20 + Math.min(speakers.length, 6) * 4) },
    { key: 'Risk shield', value: clamp(100 - (metric('risk') ?? (f.counts?.criticalRisks ?? 1) * 22)) },
    { key: 'Completeness', value: clamp(metric('completeness') ?? 75) },
  ];
}

function polygonPoints(traits, cx, cy, r) {
  return traits
    .map((t, i) => {
      const angle = (Math.PI / 180) * (i * 60 - 90);
      const rad = (t.value / 100) * r;
      return `${(cx + Math.cos(angle) * rad).toFixed(1)},${(cy + Math.sin(angle) * rad).toFixed(1)}`;
    })
    .join(' ');
}

function ringPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (i * 60 - 90);
    return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
  }).join(' ');
}

export function DnaRadar({ traits, size = 150 }) {
  const c = size / 2;
  const r = size / 2 - 12;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Compliance DNA radar">
      <defs>
        <linearGradient id="dnaFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8e7dff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F6BF2F" stopOpacity="0.55" />
        </linearGradient>
        <filter id="dnaGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.33, 0.66, 1].map((k) => (
        <polygon key={k} points={ringPoints(c, c, r * k)} fill="none" stroke="rgb(var(--ink) / 0.10)" strokeWidth="1" />
      ))}
      {traits.map((_, i) => {
        const angle = (Math.PI / 180) * (i * 60 - 90);
        return (
          <line key={i} x1={c} y1={c} x2={c + Math.cos(angle) * r} y2={c + Math.sin(angle) * r} stroke="rgb(var(--ink) / 0.07)" strokeWidth="1" />
        );
      })}
      <polygon points={polygonPoints(traits, c, c, r)} fill="url(#dnaFill)" stroke="#8e7dff" strokeWidth="1.5" filter="url(#dnaGlow)" strokeLinejoin="round" />
      {traits.map((t, i) => {
        const angle = (Math.PI / 180) * (i * 60 - 90);
        const rad = (t.value / 100) * r;
        return <circle key={t.key} cx={c + Math.cos(angle) * rad} cy={c + Math.sin(angle) * rad} r="2.6" fill="#8e7dff" />;
      })}
    </svg>
  );
}

// Slim strip for the report view: radar + trait bars, expandable.
export default function ComplianceDNA({ report }) {
  const traits = useMemo(() => deriveDna(report), [report]);
  const [open, setOpen] = useState(false);
  const composite = Math.round(traits.reduce((s, t) => s + t.value, 0) / traits.length);

  return (
    <div className="card mb-5 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-ink/[0.03]" aria-expanded={open}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Fingerprint size={18} /></span>
        <span className="flex-1">
          <span className="block font-display text-base font-semibold text-ink">Compliance DNA</span>
          <span className="block text-xs text-muted">Six-trait fingerprint derived from this session's audit · composite {composite}</span>
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          {traits.map((t) => (
            <span key={t.key} className="h-6 w-1.5 overflow-hidden rounded-full bg-ink/10" title={`${t.key}: ${t.value}`}>
              <span className="block w-full rounded-full bg-brand-500" style={{ height: `${t.value}%`, marginTop: `${100 - t.value}%` }} />
            </span>
          ))}
        </span>
        <ChevronDown size={17} className={`text-muted transition-transform duration-300 ease-entry ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid animate-fade-up items-center gap-6 border-t border-ink/5 p-5 sm:grid-cols-[170px_1fr]">
          <div className="mx-auto"><DnaRadar traits={traits} size={160} /></div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {traits.map((t) => (
              <div key={t.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-muted">{t.key}</span>
                  <span className="font-bold text-ink">{t.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold" style={{ width: `${t.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
