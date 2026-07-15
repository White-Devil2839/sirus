import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { PageShell } from '../../components/ui.jsx';
import { Stepper, SummaryPanel } from './BuilderBits.jsx';

// Region config — each country ships its own compliance bodies, legal frame
// and default report language (config-driven per proposal Section 8).
export const REGIONS = [
  {
    code: 'FR', name: 'France', flag: '🇫🇷', language: 'French', law: 'Code du travail',
    bodies: [
      { code: 'CSE', name: 'Comité Social et Économique' },
      { code: 'CSSCT', name: 'Santé, Sécurité & Conditions de Travail' },
      { code: 'CSEE', name: 'CSE Établissement' },
      { code: 'QVCT', name: 'Qualité de Vie & Conditions de Travail' },
      { code: 'AG', name: 'Assemblée Générale / Governance' },
    ],
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', language: 'German', law: 'BetrVG',
    bodies: [
      { code: 'BR', name: 'Betriebsrat (Works Council)' },
      { code: 'GBR', name: 'Gesamtbetriebsrat (Central Works Council)' },
      { code: 'WA', name: 'Wirtschaftsausschuss (Economic Committee)' },
      { code: 'AG', name: 'General Assembly / Governance' },
    ],
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸', language: 'Spanish', law: 'Estatuto de los Trabajadores',
    bodies: [
      { code: 'CE', name: 'Comité de Empresa' },
      { code: 'DP', name: 'Delegados de Personal' },
      { code: 'CSS', name: 'Comité de Seguridad y Salud' },
      { code: 'AG', name: 'Asamblea General / Governance' },
    ],
  },
  {
    code: 'IT', name: 'Italy', flag: '🇮🇹', language: 'Italian', law: 'Statuto dei Lavoratori',
    bodies: [
      { code: 'RSU', name: 'Rappresentanza Sindacale Unitaria' },
      { code: 'RLS', name: 'Rappresentante Lavoratori per la Sicurezza' },
      { code: 'AG', name: 'Assemblea Generale / Governance' },
    ],
  },
  {
    code: 'UK', name: 'United Kingdom', flag: '🇬🇧', language: 'English', law: 'ICE Regulations 2004',
    bodies: [
      { code: 'WC', name: 'Works Council (ICE)' },
      { code: 'JCC', name: 'Joint Consultative Committee' },
      { code: 'HSC', name: 'Health & Safety Committee' },
      { code: 'AG', name: 'General Meeting / Governance' },
    ],
  },
  {
    code: 'CH', name: 'Switzerland', flag: '🇨🇭', language: 'French', law: 'Loi sur la participation',
    bodies: [
      { code: 'CP', name: 'Commission du personnel' },
      { code: 'HSC', name: 'Commission santé & sécurité' },
      { code: 'AG', name: 'Assemblée Générale / Governance' },
    ],
  },
];
const LANGUAGES = ['French', 'English', 'German', 'Spanish', 'Italian'];

export default function MetadataStep() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meta, setMeta] = useState({
    region: 'FR',
    compliance: 'CSE',
    language: 'French',
    company: user?.company || '',
    tier: 'Scope',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function next() {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/requests', meta);
      navigate(`/create/${data.request._id}/upload`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Create Meeting Report</h1>
          <p className="text-sm text-muted">Choose your compliance framework to begin.</p>
        </div>
        <Stepper current={0} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Region */}
          <section className="card p-6">
            <SectionHead icon={Globe} title="Select Region / Country" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {REGIONS.map((r) => {
                const selected = meta.region === r.code;
                return (
                  <button
                    key={r.code}
                    onClick={() =>
                      setMeta({
                        ...meta,
                        region: r.code,
                        // switching country swaps the bodies + default language
                        compliance: r.bodies[0].code,
                        language: r.language,
                      })
                    }
                    className={`relative rounded-2xl border-2 p-4 text-center transition ${
                      selected ? 'border-brand-500 bg-brand-50' : 'border-line/10 bg-card hover:border-line/15'
                    }`}
                  >
                    {selected && <Check size={16} className="absolute right-2 top-2 text-brand-600" />}
                    <span className="text-3xl">{r.flag}</span>
                    <p className="mt-2 text-sm font-bold text-ink">{r.name}</p>
                    <p className="text-[11px] font-semibold text-muted/80">{r.law}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Compliance — bodies of the selected region */}
          <section className="card p-6">
            <SectionHead icon={ShieldCheck} title="Select Compliance" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(REGIONS.find((r) => r.code === meta.region)?.bodies || []).map((c) => {
                const selected = meta.compliance === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setMeta({ ...meta, compliance: c.code })}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      selected ? 'border-brand-500 bg-brand-50' : 'border-line/10 bg-card hover:border-line/15'
                    }`}
                  >
                    <p className="text-base font-black text-brand-700">{c.code}</p>
                    <p className="mt-1 text-xs leading-snug text-muted">{c.name}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language + company */}
          <section className="card grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className="field-label">Report Language</label>
              <select className="field-input" value={meta.language} onChange={(e) => setMeta({ ...meta, language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Organisation</label>
              <input className="field-input" value={meta.company} onChange={(e) => setMeta({ ...meta, company: e.target.value })} placeholder="e.g. CSE Rockefeller" />
            </div>
          </section>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button onClick={next} disabled={busy} className="btn-primary px-6 py-3.5">
              {busy ? 'Creating…' : 'Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <SummaryPanel meta={meta} />
      </div>
    </PageShell>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon size={18} /></span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
    </div>
  );
}
