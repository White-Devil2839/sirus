import { useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2, FileX2, TrendingUp, Filter } from 'lucide-react';
import { ComplianceDonut, MetricBar, ImpactDots, ConfidenceBar } from './Charts.jsx';
import { RiskChip } from './ui.jsx';

const TABS = [
  { key: 'risks', label: 'Risks' },
  { key: 'missingDocuments', label: 'Missing Documents' },
  { key: 'complianceReferences', label: 'Compliance References' },
  { key: 'recommendations', label: 'Recommendations' },
];

function SummaryCard({ icon: Icon, tone, count, title, sub }) {
  const tones = {
    red: 'bg-red-50 text-red-500',
    amber: 'bg-amber-50 text-amber-500',
    green: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-sky-50 text-sky-500',
  };
  return (
    <div className="rounded-2xl border border-line/10 bg-card p-3">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </span>
        <p className="text-2xl font-black leading-none text-ink">{count}</p>
      </div>
      <p className="mt-2 break-words text-[13px] font-bold leading-tight text-ink">{title}</p>
      <p className="break-words text-[11px] leading-tight text-muted">{sub}</p>
    </div>
  );
}

function RiskExposureMeter({ level }) {
  const pos = /high/i.test(level) ? 90 : /medium/i.test(level) ? 55 : 20;
  return (
    <div className="rounded-2xl border border-line/10 bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="flex items-center gap-2 text-brand-600">
        <TrendingUp size={18} />
        <span className="text-xs font-bold uppercase tracking-wide">Risk Exposure Level</span>
      </div>
      <p className="mt-1 text-lg font-black text-ink">{level}</p>
      <div className="relative mt-4 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400">
        <div className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-brand-600 shadow" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted/80">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>
    </div>
  );
}

export default function ReportAnalyzer({ findings = {} }) {
  const [tab, setTab] = useState('risks');
  const [levelFilter, setLevelFilter] = useState('All');

  const counts = findings.counts || {};
  const metrics = findings.metrics || [];
  const risks = findings.risks || [];

  const filteredRisks = useMemo(
    () => (levelFilter === 'All' ? risks : risks.filter((r) => r.riskLevel === levelFilter)),
    [risks, levelFilter]
  );

  return (
    <div className="space-y-5">
      {/* Top row: score · risk summary · findings list */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Compliance score */}
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 text-brand-600">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Compliance Score</span>
          </div>
          <div className="grid place-items-center">
            <ComplianceDonut score={findings.score || 0} />
          </div>
          <p className="mt-2 text-center text-xs text-muted">Overall compliance score based on AI analysis of the report.</p>
          <div className="mt-5 space-y-3">
            {metrics.map((m, i) => (
              <MetricBar key={i} label={m.label} value={m.value} />
            ))}
          </div>
        </div>

        {/* Risk summary */}
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 text-brand-600">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Risk Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={AlertTriangle} tone="red" count={counts.criticalRisks ?? 0} title="Critical Risks" sub="Require attention" />
            <SummaryCard icon={Lightbulb} tone="amber" count={counts.recommendations ?? 0} title="Recommendations" sub="Reduce risk" />
            <SummaryCard icon={CheckCircle2} tone="green" count={counts.compliantAreas ?? 0} title="Compliant Areas" sub="Meeting requirements" />
            <SummaryCard icon={FileX2} tone="blue" count={counts.missingDocuments ?? 0} title="Missing Documents" sub="Not found" />
          </div>
          <div className="mt-3">
            <RiskExposureMeter level={findings.riskExposure || 'Low to Medium'} />
          </div>
        </div>

        {/* Findings (tabbed peek) */}
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 text-brand-600">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Findings</span>
          </div>
          <div className="mb-3 flex flex-wrap gap-1 border-b border-line/10 pb-2 text-xs">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-2.5 py-1 font-semibold ${tab === t.key ? 'bg-brand-50 text-brand-700' : 'text-muted hover:text-ink'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="max-h-[320px] space-y-3 overflow-y-auto scroll-thin pr-1">
            <FindingsList tab={tab} findings={findings} />
          </div>
        </div>
      </div>

      {/* Bottom: findings overview table + filters */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card overflow-hidden p-6 lg:col-span-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-brand-600">Findings Overview · Risks ({filteredRisks.length})</p>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-muted/80">
                  <th className="pb-2 pr-3 font-semibold">Risk Title</th>
                  <th className="whitespace-nowrap pb-2 pr-3 font-semibold">Level</th>
                  <th className="whitespace-nowrap pb-2 pr-3 font-semibold">Impact</th>
                  <th className="whitespace-nowrap pb-2 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 align-top">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-ink">{r.title}</p>
                      <p className="text-xs text-muted">{r.description}</p>
                      {r.related && <p className="mt-0.5 text-[11px] font-medium text-brand-500">Related: {r.related}</p>}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-3"><RiskChip level={r.riskLevel} /></td>
                    <td className="whitespace-nowrap py-3 pr-3"><ImpactDots impact={r.impact} level={r.riskLevel} /></td>
                    <td className="whitespace-nowrap py-3"><ConfidenceBar confidence={r.confidence} /></td>
                  </tr>
                ))}
                {!filteredRisks.length && (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-muted/80">No risks at this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card h-fit p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            <Filter size={16} /> Filter Findings
          </p>
          <label className="field-label">Risk Level</label>
          <select className="field-input" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            {['All', 'High', 'Medium', 'Low'].map((l) => <option key={l}>{l}</option>)}
          </select>
          {findings.summary && (
            <div className="mt-5 rounded-xl bg-brand-50/60 p-4 text-sm leading-relaxed text-brand-900">
              {findings.summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FindingsList({ tab, findings }) {
  const items = findings[tab] || [];
  if (!items.length) return <p className="py-6 text-center text-sm text-muted/80">Nothing here.</p>;

  if (tab === 'risks') {
    return items.map((r, i) => (
      <div key={i} className="rounded-xl border border-line/10 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{r.title}</p>
          <RiskChip level={r.riskLevel} />
        </div>
        <p className="mt-1 text-xs text-muted">{r.description}</p>
        {r.related && <p className="mt-1 text-[11px] font-medium text-brand-500">{r.related}</p>}
      </div>
    ));
  }
  if (tab === 'complianceReferences') {
    return items.map((r, i) => (
      <div key={i} className="flex items-center justify-between rounded-xl border border-line/10 p-3">
        <div>
          <p className="text-sm font-semibold text-ink">{r.code}</p>
          <p className="text-xs text-muted">{r.title}</p>
        </div>
        <span className={`chip ${r.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600' : r.status === 'Missing' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          {r.status}
        </span>
      </div>
    ));
  }
  // missingDocuments & recommendations share {title, description}
  return items.map((r, i) => (
    <div key={i} className="rounded-xl border border-line/10 p-3">
      <p className="text-sm font-semibold text-ink">{r.title}</p>
      <p className="mt-1 text-xs text-muted">{r.description}</p>
    </div>
  ));
}
