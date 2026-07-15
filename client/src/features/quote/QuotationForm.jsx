import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Star, Gem, Crown, ArrowRight, PartyPopper } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { PageShell } from '../../components/ui.jsx';
import { Stepper } from '../create/BuilderBits.jsx';

const TIERS = [
  {
    key: 'Essential', icon: Star, turnaround: '~15–30 min', best: 'Small teams, informal minutes',
    features: ['AI transcript, single channel', 'Chronological summary', 'Basic compliance check', 'Speaker-name correction', 'PDF output'],
  },
  {
    key: 'Scope', icon: Gem, turnaround: '~1–2 hours', best: 'Works councils, CSE/CSSCT bodies', recommended: true,
    features: ['Transcript + speaker diarization', 'Agenda-based structure', 'Full compliance audit', 'Full text & speaker edits', 'Decision log · PDF + DOCX'],
  },
  {
    key: 'Premium', icon: Crown, turnaround: 'Same day, priority', best: 'Enterprises, regulated groups',
    features: ['Multi-language transcript', 'Formal legal layout', 'Clause-by-clause review', 'Human reviewer pass', 'Signed · branded · audit trail'],
  },
];

export default function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tier, setTier] = useState('Scope');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/requests/${id}`, { tier, notes, status: 'awaiting' });
      setDone(true);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg card p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-500"><PartyPopper size={30} /></span>
          <h1 className="mt-5 text-2xl font-semibold text-ink">Request submitted!</h1>
          <p className="mt-2 text-muted">
            Your <strong>{tier}</strong> report request has been sent to the consultancy team. You will see the finished,
            downloadable report in your dashboard once it is delivered.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-6 px-6 py-3.5">Go to my reports <ArrowRight size={18} /></button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Request your report</h1>
          <p className="text-sm text-muted">Pick a service tier — this is the only path to an editable, downloadable report.</p>
        </div>
        <Stepper current={3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {TIERS.map((t) => {
          const selected = tier === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTier(t.key)}
              className={`relative rounded-3xl border-2 p-6 text-left transition ${
                selected ? 'border-brand-500 bg-brand-50/40 shadow-card' : 'border-line/10 bg-card hover:border-line/15'
              }`}
            >
              {t.recommended && (
                <span className="absolute -top-3 left-6 chip bg-brand-600 text-white">Most popular</span>
              )}
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'}`}>
                  <t.icon size={20} />
                </span>
                {selected && <Check className="text-brand-600" size={20} />}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{t.key}</h3>
              <p className="text-xs font-semibold text-brand-500">{t.turnaround}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}</li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line/10 pt-3 text-xs text-muted/80">Best for: {t.best}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 card p-6">
        <label className="field-label">Notes for the consultancy team (optional)</label>
        <textarea
          className="field-input min-h-[100px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything the team should emphasise — e.g. focus on the reclassification-search compliance gap, formal tone, CC the HR director…"
        />
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button onClick={submit} disabled={busy} className="btn-primary px-6 py-3.5">
            {busy ? 'Submitting…' : `Submit ${tier} request`} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </PageShell>
  );
}
