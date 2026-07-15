import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Waypoints, Sparkles } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Spinner } from '../../components/ui.jsx';
import MeetingMap from '../../components/MeetingMap.jsx';

// ── /map — the Intelligence Graph page ───────────────────────────────────────
// Guests explore the public sample library; signed-in clients see their own
// delivered meetings; admins see every generated report. Same graph, real data.

const GENERATED = new Set(['in-editing', 'locked', 'dispatched']);

export default function IntelligenceGraph() {
  const { user } = useAuth();

  const { data: samples = [] } = useQuery({
    queryKey: ['samples'],
    queryFn: async () => (await api.get('/samples')).data.samples,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => (await api.get('/requests')).data.requests,
    enabled: !!user,
  });

  const options = useMemo(() => {
    const mine = (requests || [])
      .filter((r) => (user?.role === 'admin' ? GENERATED.has(r.status) : r.status === 'dispatched'))
      .map((r) => ({
        kind: 'request', id: r._id, label: r.meetingName || 'Untitled meeting',
        sub: user?.role === 'admin' ? `${r.status} · ${r.tier}` : `your meeting · ${r.tier}`,
      }));
    const lib = (samples || []).map((s) => ({ kind: 'sample', id: s._id, label: s.title, sub: `sample · ${s.tier}` }));
    return [...mine, ...lib];
  }, [requests, samples, user]);

  // Deep-linkable selection: /map?m=sample:<id> or /map?m=request:<id>
  const [params, setParams] = useSearchParams();
  const [sel, setSel] = useState(() => {
    const [kind, id] = (params.get('m') || '').split(':');
    return kind && id ? { kind, id } : null;
  });
  const pick = (o) => { setSel(o); setParams({ m: `${o.kind}:${o.id}` }, { replace: true }); };
  const current = options.find((o) => o.kind === sel?.kind && o.id === sel?.id) || options[0];

  const { data: loaded, isLoading } = useQuery({
    queryKey: ['graph', current?.kind, current?.id],
    enabled: !!current,
    queryFn: async () => {
      if (current.kind === 'sample') {
        const { sample } = (await api.get(`/samples/${current.id}`)).data;
        return { report: sample, meta: { org: sample.org, meetingType: sample.meetingType, language: sample.language, tier: sample.tier } };
      }
      const { report, request } = (await api.get(`/requests/${current.id}/report`)).data;
      return { report, meta: { org: request.meetingName, meetingType: request.meetingType, language: request.language, compliance: request.compliance, tier: request.tier } };
    },
  });

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-app mb-2 flex items-center gap-1.5"><Waypoints size={13} /> Intelligence graph</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Every report has an <span className="serif-accent text-brand-600">anatomy.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            This is the live dataflow behind a SIRUS report — every node is hydrated from the
            report&rsquo;s actual extraction, nothing is illustrative. Click any node to inspect
            what the AI found.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MeetingPicker options={options} current={current} onPick={pick} />
          {!user && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
              <Sparkles size={12} /> Demo mode — exploring the public sample library, no account needed
            </span>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-270px)] min-h-[540px]">
        {!current || isLoading || !loaded
          ? <div className="grid h-full place-items-center rounded-3xl bg-card ring-1 ring-ink/10"><Spinner label="Tracing the pipeline…" /></div>
          : <MeetingMap key={`${current.kind}-${current.id}`} report={loaded.report} meta={loaded.meta} className="h-full w-full" />}
      </div>
    </main>
  );
}

function MeetingPicker({ options, current, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!current) return null;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-2xl bg-card py-2.5 pl-4 pr-3 text-left shadow-soft ring-1 ring-ink/10 transition hover:shadow-card"
        aria-haspopup="listbox" aria-expanded={open}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
        <span className="min-w-0">
          <span className="block max-w-[260px] truncate text-sm font-semibold text-ink">{current.label}</span>
          <span className="block text-[10px] capitalize text-muted">{current.sub}</span>
        </span>
        <ChevronDown size={15} className={`shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl bg-card p-1.5 shadow-float ring-1 ring-ink/10 animate-fade-up scroll-thin" role="listbox">
          {options.map((o) => {
            const active = o.kind === current.kind && o.id === current.id;
            return (
              <button
                key={`${o.kind}-${o.id}`}
                onClick={() => { onPick({ kind: o.kind, id: o.id }); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ink/5 ${active ? 'bg-ink/5' : ''}`}
                role="option" aria-selected={active}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${o.kind === 'sample' ? 'bg-gold' : 'bg-brand-500'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{o.label}</span>
                  <span className="block text-[10px] capitalize text-muted">{o.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
