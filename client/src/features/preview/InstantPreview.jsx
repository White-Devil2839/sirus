import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BarChart3, ShieldCheck, ArrowRight, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { PageShell, Spinner } from '../../components/ui.jsx';
import { Stepper } from '../create/BuilderBits.jsx';
import PipelineProgress from '../../components/PipelineProgress.jsx';
import ReportAnalyzer from '../../components/ReportAnalyzer.jsx';
import { NumericalChart, ChartLegend } from '../../components/Charts.jsx';

const TABS = [
  { key: 'speakers', label: 'Speaker Analysis', icon: Users },
  { key: 'numerical', label: 'Numerical Data', icon: BarChart3 },
  { key: 'compliance', label: 'Compliance Check', icon: ShieldCheck },
];

export default function InstantPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('compliance');

  const { data, isLoading, error } = useQuery({
    queryKey: ['preview', id],
    queryFn: async () => (await api.post(`/requests/${id}/preview`)).data.extraction,
    retry: false,
  });

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            <Sparkles className="text-brand-600" size={22} /> Instant Compliance Snapshot
          </h1>
          <p className="text-sm text-muted">A read-only preview generated from your upload. Not editable or downloadable.</p>
        </div>
        <Stepper current={2} />
      </div>

      {isLoading && (
        <div className="mx-auto max-w-md py-16">
          <p className="mb-5 text-center font-display text-xl font-semibold text-ink">Building your compliance snapshot</p>
          <PipelineProgress active />
        </div>
      )}
      {error && (
        <div className="card p-8 text-center">
          <AlertTriangle className="mx-auto text-amber-500" size={28} />
          <p className="mt-2 font-bold text-ink">Could not generate a preview</p>
          <p className="mt-1 text-sm text-muted">{errMsg(error)}</p>
          <Link to={`/create/${id}/upload`} className="btn-outline mt-4 px-5 py-2.5">Back to upload</Link>
        </div>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {/* read-only banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-800">
              <Lock size={15} /> This is a fixed preview. Request a quotation to receive the full editable, downloadable report.
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    tab === t.key ? 'bg-brand-950 text-white' : 'bg-card text-muted ring-1 ring-line/10 hover:text-ink'
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            <div className="animate-fade-up">
              {tab === 'speakers' && <SpeakerPattern sa={data.speakerAnalysis} />}
              {tab === 'numerical' && <NumericalPattern items={data.numericalData} />}
              {tab === 'compliance' && <ReportAnalyzer findings={data.findings} />}
            </div>
          </div>

          {/* Conversion CTA */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="card overflow-hidden">
              <div className="bg-brand-950 p-6 text-white">
                <h3 className="text-xl font-semibold">Get the official report</h3>
                <p className="mt-1 text-sm text-brand-200">Full transcription, audited minutes, and a signed, downloadable procès-verbal.</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-sm text-muted">
                  {['Full Deepgram-grade transcript', 'Editable, formatted minutes', 'Compliance audit & sign-off', 'PDF / DOCX download'].map((f) => (
                    <li key={f} className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-500" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => navigate(`/create/${id}/quote`)} className="btn-primary mt-5 w-full py-3.5">
                  Request Quotation <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}

function SpeakerPattern({ sa = {} }) {
  const speakers = sa.speakers || [];
  return (
    <div className="card p-6">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">Speaker Analysis</p>
      {sa.intro && <p className="mb-4 text-sm text-muted">{sa.intro}</p>}
      <div className="space-y-3">
        {speakers.map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-line/10 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {(s.name || s.id || '?').slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{s.name || s.id}</p>
              <p className="truncate text-xs text-muted">{s.role} · {s.stance}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-ink">{s.interventions}</p>
              <p className="text-[11px] text-muted/80">interventions</p>
            </div>
            <div className="w-24">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.engagement / 5) * 100}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted/80">engagement</p>
            </div>
          </div>
        ))}
        {!speakers.length && <p className="py-8 text-center text-sm text-muted/80">No speakers detected in this snapshot.</p>}
      </div>
    </div>
  );
}

function NumericalPattern({ items = [] }) {
  if (!items.length) {
    return (
      <div className="card grid place-items-center p-12 text-center">
        <BarChart3 className="text-muted/60" size={30} />
        <p className="mt-2 font-bold text-ink">No figures discussed</p>
        <p className="text-sm text-muted">This meeting had no numerical data to chart.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="card p-6">
          <p className="mb-3 text-sm font-bold text-ink">{item.label}</p>
          <NumericalChart item={item} />
          {item.chartType === 'donut' && <div className="mt-3"><ChartLegend series={item.series} /></div>}
        </div>
      ))}
    </div>
  );
}
