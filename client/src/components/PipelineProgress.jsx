import { useEffect, useState } from 'react';
import { FileText, Braces, ShieldCheck, Layout, Check } from 'lucide-react';

// "Never watch a spinner": while the AI call is in flight, walk through the
// real pipeline stages (paced client-side; the final stage holds until the
// request resolves). Honest about what the server is actually doing.
const STAGES = [
  { icon: FileText, label: 'Reading the transcript' },
  { icon: Braces, label: 'Extracting structure & votes' },
  { icon: ShieldCheck, label: 'Auditing compliance' },
  { icon: Layout, label: 'Composing the report' },
];

export default function PipelineProgress({ active, compact = false }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    setStep(0);
    const timers = STAGES.slice(0, -1).map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 2200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!active) return null;

  return (
    <div className={`animate-fade-up ${compact ? 'space-y-1.5' : 'space-y-2.5'}`} role="status" aria-live="polite">
      {STAGES.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={s.label} className={`flex items-center gap-2.5 rounded-xl px-3 transition-all duration-500 ease-entry ${compact ? 'py-1.5' : 'py-2'} ${current ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white transition-colors duration-500 ${done ? 'bg-emerald-500' : current ? 'bg-brand-600' : 'bg-ink/15'}`}>
              {done ? <Check size={13} /> : <s.icon size={13} className={current ? 'animate-pulse' : ''} />}
            </span>
            <span className={`text-sm font-semibold ${done ? 'text-muted line-through decoration-muted/40' : current ? 'text-ink' : 'text-muted/70'}`}>
              {s.label}
            </span>
            {current && (
              <span className="ml-auto flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${d * 140}ms` }} />
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
