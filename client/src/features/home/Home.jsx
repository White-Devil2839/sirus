import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, ArrowRight, FileText, HelpCircle, Search, Clock, Hourglass,
  ClipboardCheck, AlertTriangle, FileWarning, BarChart3, CheckCircle2, X,
  UploadCloud, AudioLines, ShieldCheck, Send, Vote, Check, Minus, ChevronDown, MousePointerClick,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import EbookViewer, { splitPages } from '../../components/EbookViewer.jsx';
import ReportAnalyzer from '../../components/ReportAnalyzer.jsx';
import { ComplianceDonut } from '../../components/Charts.jsx';
import { Modal, TierBadge, Spinner } from '../../components/ui.jsx';

// Rises in as it enters the viewport.
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startHref = user ? (user.role === 'admin' ? '/admin' : '/create') : '/signup';

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-canvas">
        {/* drifting color halos */}
        <div className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] animate-drift rounded-blob bg-brand-400/25 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-[-10rem] h-[26rem] w-[26rem] animate-drift rounded-blob bg-gold/25 blur-3xl [animation-delay:-7s]" />
        <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] animate-drift rounded-blob bg-coral/15 blur-3xl [animation-delay:-13s]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="animate-fade-up">
              <span className="chip-frost text-brand-700">
                <Sparkles size={14} /> AI POWERED · CSE / CSSCT / AG
              </span>
            </div>
            <h1 className="mt-6 animate-fade-up text-display font-semibold text-ink text-balance [animation-delay:80ms]">
              Turn meetings into <em className="serif-accent text-brand-600">compliance-ready</em> reports.
            </h1>
            <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-slate-600 [animation-delay:160ms]">
              Enterprise-grade minutes that capture every risk, insight, and recommendation. Upload a
              recording or transcript and watch an audited, signature-ready report take shape.
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <button onClick={() => navigate(startHref)} className="btn-primary group px-7 py-4 text-base">
                {user ? 'Go to workspace' : 'Create your first report'}
                <ArrowRight size={18} className="transition-transform duration-300 ease-entry group-hover:translate-x-1" />
              </button>
              <a href="#samples" className="btn-outline px-7 py-4 text-base">
                <FileText size={18} /> View sample reports
              </a>
            </div>
            <div className="mt-9 flex animate-fade-up items-center gap-3 [animation-delay:320ms]">
              <div className="flex -space-x-2">
                {['#5b45f0', '#2f69ff', '#198c61'].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-paper" style={{ background: c }} />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">Trusted by 500+ works-council teams</p>
            </div>
          </div>

          {/* Floating SIRUS card */}
          <div className="relative animate-fade-up pb-16 lg:justify-self-end [animation-delay:200ms]">
            <div className="w-full max-w-sm animate-float-slow rounded-4xl bg-white/90 p-6 shadow-float ring-1 ring-ink/5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white"><Sparkles size={16} /></span>
                <span className="font-display text-lg font-semibold text-ink">SIRUS</span>
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Compliance Score</p>
              <div className="mt-2 grid place-items-center"><ComplianceDonut score={92} size={170} /></div>
              <div className="mt-4 space-y-2">
                {[['Risks Identified', 3, 'bg-red-500'], ['Recommendations', 7, 'bg-amber-500'], ['Missing Documents', 4, 'bg-sky-500'], ['Compliant Areas', 12, 'bg-emerald-500']].map(
                  ([label, n, c]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2">
                      <span className="text-sm font-medium text-slate-600">{label}</span>
                      <span className={`grid h-6 w-6 place-items-center rounded-md text-xs font-bold text-white ${c}`}>{n}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            {/* floating product-truth chips */}
            <div className="absolute -left-20 top-16 z-10 hidden animate-float-slow items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-float ring-1 ring-ink/5 backdrop-blur lg:flex [animation-delay:-3s]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500"><AlertTriangle size={15} /></span>
              <div>
                <p className="text-[11px] font-bold leading-tight text-ink">Compliance gap flagged</p>
                <p className="text-[10px] text-slate-400">Code du travail · Art. L.2315-34</p>
              </div>
            </div>
            <div className="absolute -right-8 bottom-44 z-10 hidden animate-float-slow items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-float ring-1 ring-ink/5 backdrop-blur lg:flex [animation-delay:-5.5s]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-500"><Vote size={15} /></span>
              <div>
                <p className="text-[11px] font-bold leading-tight text-ink">Vote recorded</p>
                <p className="text-[10px] text-slate-400">0 favorable · 4 unfavorable</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-6 hidden rotate-[-4deg] rounded-2xl bg-brand-950 px-4 py-3 text-white shadow-float lg:block">
              <p className="text-xs font-semibold text-brand-200">Turnaround</p>
              <p className="font-display text-lg font-semibold">Minutes, not hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="overflow-hidden border-y border-ink/5 bg-white/70 py-3.5 backdrop-blur-md" aria-hidden>
        <div className="marquee-track items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {['Procès-verbal', 'CSE', 'Speaker Analysis', 'CSSCT', 'Compliance Audit', 'AG', 'Vote Records', 'QVCT', 'Risk Findings', 'CSEE', 'PDF · DOCX Export', 'Code du travail'].map((t) => (
                <span key={t} className="mx-5 flex items-center gap-5 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t} <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* THE PREMISE */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6">
        <Reveal>
          <p className="eyebrow-app"><span className="h-px w-10 bg-brand-300" /> The premise</p>
          <p className="mt-6 max-w-3xl font-display text-display-sm font-semibold leading-tight text-ink text-balance">
            Every session holds <em className="serif-accent text-brand-600">a decision, a vote, an obligation</em>.
            Most of it evaporates the moment the meeting ends. SIRUS keeps it — and hands it back as an{' '}
            <em className="serif-accent text-gold">audit-ready record</em>.
          </p>
        </Reveal>
      </section>

      <Journey />
      <LiveDemo />

      {/* STATS BAND */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 rounded-4xl bg-brand-950 p-8 text-white sm:p-12 lg:grid-cols-4">
            {[
              ['92%', 'average compliance score'],
              ['15', 'speakers identified per session'],
              ['60s', 'to a first compliance snapshot'],
              ['3', 'service tiers, one pipeline'],
            ].map(([n, label], i) => (
              <div key={label} className={i > 0 ? 'lg:border-l lg:border-white/10 lg:pl-8' : ''}>
                <p className="font-display text-5xl font-semibold text-white sm:text-6xl">
                  {n}
                </p>
                <p className="mt-2 max-w-[12rem] text-sm leading-snug text-brand-200">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <BeforeAfter />
      <TiersMatrix />
      <SampleLibrary />
      <Testimonials />
      <Faq />

      {/* CTA band */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-4xl bg-brand-950 p-10 text-white sm:flex-row sm:p-14">
            <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 animate-drift rounded-blob bg-brand-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 animate-drift rounded-blob bg-gold/20 blur-3xl [animation-delay:-9s]" />
            <div className="relative">
              <h3 className="font-display text-display-sm font-semibold text-balance">
                Ready to turn recordings into <em className="serif-accent text-gold">compliance intelligence</em>?
              </h3>
              <p className="mt-3 text-lg text-brand-200">Register, upload, and preview your report before you commit.</p>
            </div>
            <button onClick={() => navigate(startHref)} className="btn relative bg-white px-7 py-4 text-base text-brand-950 hover:bg-brand-50 hover:shadow-float hover:-translate-y-0.5">
              Get started <ArrowRight size={18} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t border-ink/5 bg-paperdim/70">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white"><Sparkles size={16} /></span>
                <span className="font-display text-xl font-semibold text-ink">SIRUS</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                From conversations to compliance. AI-drafted, human-audited meeting minutes for works councils.
              </p>
            </div>
            <div className="flex gap-16 text-sm">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Product</p>
                <div className="space-y-2">
                  <a href="#samples" className="link-underline block text-slate-600 hover:text-ink">Sample library</a>
                  <Link to="/signup" className="link-underline block text-slate-600 hover:text-ink">Create a report</Link>
                  <Link to="/login" className="link-underline block text-slate-600 hover:text-ink">Sign in</Link>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Coverage</p>
                <div className="space-y-2 text-slate-600">
                  <p>France · CSE / CSSCT</p>
                  <p>AG · CSEE · QVCT</p>
                  <p className="text-slate-400">More regions soon</p>
                </div>
              </div>
            </div>
          </div>
          <p className="relative z-10 mt-12 border-t border-ink/5 pt-6 text-xs text-slate-400">
            © 2026 SIRUS · AI Meeting Minutes &amp; Compliance Reports · Built on the MERN stack
          </p>
        </div>
        {/* watermark wordmark */}
        <p className="pointer-events-none absolute -bottom-10 right-0 select-none font-display text-[clamp(6rem,18vw,16rem)] font-semibold leading-none text-ink/[0.045]" aria-hidden>
          SIRUS
        </p>
      </footer>
    </div>
  );
}

// ── The journey: one upload in, a signed record out ─────────────────────────
const JOURNEY = [
  { n: '01', icon: UploadCloud, tone: 'text-coral', dot: 'bg-coral', ring: 'ring-coral/20', title: 'Upload the meeting', sub: 'Audio, video, or a raw transcript — drag, drop, done.' },
  { n: '02', icon: AudioLines, tone: 'text-brand-500', dot: 'bg-brand-500', ring: 'ring-brand-500/20', title: 'Deepgram transcribes', sub: 'Every word captured, speakers diarized and timestamped.' },
  { n: '03', icon: Sparkles, tone: 'text-sky-500', dot: 'bg-sky-400', ring: 'ring-sky-400/20', title: 'AI drafts the minutes', sub: 'Agenda items, votes and a speaker log — structured like a procès-verbal.' },
  { n: '04', icon: ShieldCheck, tone: 'text-gold', dot: 'bg-gold', ring: 'ring-gold/25', title: 'Compliance audit', sub: 'Gaps flagged clause-by-clause against the Code du travail.' },
  { n: '05', icon: Send, tone: 'text-emerald-500', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', title: 'Signed record, delivered', sub: 'Locked by your consultant, dispatched to your dashboard.' },
];

function Journey() {
  return (
    <section id="how" className="relative mx-auto max-w-5xl overflow-hidden px-4 py-16 sm:px-6">
      <Reveal className="mb-16 text-center">
        <p className="eyebrow-app justify-center">How it works</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          One upload in. A <em className="serif-accent text-brand-600">signed record</em> out.
        </h2>
      </Reveal>

      <div className="relative">
        {/* the spine — one colored stop per step */}
        <div
          className="absolute left-5 top-2 bottom-2 w-px opacity-40 lg:left-1/2"
          style={{ background: 'linear-gradient(to bottom, #FF6B6B, #6d5efc 28%, #38bdf8 52%, #F6BF2F 76%, #10b981)' }}
        />

        <div className="space-y-14 lg:space-y-20">
          {JOURNEY.map((step, i) => {
            const left = i % 2 === 0; // card side on desktop
            return (
              <Reveal key={step.n} delay={60}>
                <div className="relative grid items-center gap-6 pl-14 lg:grid-cols-2 lg:gap-0 lg:pl-0">
                  {/* dot on the spine */}
                  <span className={`absolute left-5 top-7 h-3.5 w-3.5 -translate-x-1/2 rounded-full ${step.dot} ring-4 ring-paper lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2`} />

                  {/* card */}
                  <div className={left ? 'lg:pr-16' : 'lg:order-2 lg:pl-16'}>
                    <div className="group flex items-start gap-4 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink/5 transition-all duration-500 ease-entry hover:-translate-y-1 hover:shadow-float">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper ${step.tone} ring-1 ${step.ring} transition-transform duration-300 ease-spring group-hover:scale-110`}>
                        <step.icon size={22} />
                      </span>
                      <div>
                        <p className="font-display text-xl font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.sub}</p>
                      </div>
                    </div>
                  </div>

                  {/* ghost numeral */}
                  <div className={`hidden lg:flex ${left ? 'lg:order-2 lg:justify-start lg:pl-16' : 'lg:justify-end lg:pr-16'}`}>
                    <span className="select-none font-display text-[7rem] font-semibold leading-none text-ink/[0.06]" aria-hidden>
                      {step.n}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const BEFORE = [
  { icon: FileText, title: '120+ page PDFs', sub: 'Overwhelming and hard to navigate' },
  { icon: HelpCircle, title: 'Unstructured content', sub: 'No clear organization or hierarchy' },
  { icon: Search, title: 'Difficult to review', sub: 'Time-consuming manual checks' },
  { icon: Clock, title: 'High risk of missing gaps', sub: 'Critical issues get overlooked' },
  { icon: Hourglass, title: 'Time consuming', sub: 'Takes hours or days to complete' },
];
const AFTER = [
  { icon: ClipboardCheck, title: 'Compliance Score', sub: 'Instant overall assessment' },
  { icon: AlertTriangle, title: 'Risks Identified', sub: 'AI detects gaps & high-risk areas' },
  { icon: FileWarning, title: 'Missing Clauses Highlighted', sub: 'Know exactly what is missing' },
  { icon: BarChart3, title: 'Executive Summary', sub: 'Clear, structured insights in seconds' },
  { icon: CheckCircle2, title: 'Ready-to-Review Report', sub: 'Actionable, audit-ready output' },
];

function BeforeAfter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center">Why SIRUS</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          From <em className="serif-accent text-red-500">manual chaos</em> to <em className="serif-accent text-brand-600">audit&#8209;ready clarity</em>
        </h2>
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-4xl border border-red-100 bg-gradient-to-br from-red-50/70 to-white p-8">
            <span className="chip bg-red-100 text-red-600">Before Analysis</span>
            <h3 className="mt-5 font-display text-3xl font-semibold text-ink">Manual. Slow. Uncertain.</h3>
            <div className="mt-6 space-y-3">
              {BEFORE.map((b) => (
                <Row key={b.title} {...b} tone="red" />
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="h-full rounded-4xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-8">
            <span className="chip bg-brand-100 text-brand-700">After SIRUS</span>
            <h3 className="mt-5 font-display text-3xl font-semibold text-ink">Automated. Structured. Actionable.</h3>
            <div className="mt-6 space-y-3">
              {AFTER.map((a) => (
                <Row key={a.title} {...a} tone="brand" />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ icon: Icon, title, sub, tone }) {
  const c = tone === 'red' ? 'bg-white text-red-500 ring-red-100' : 'bg-white text-brand-600 ring-brand-100';
  return (
    <div className="group flex items-start gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-transparent transition-all duration-300 ease-entry hover:bg-white hover:shadow-soft">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 ease-spring group-hover:scale-110 ${c}`}><Icon size={18} /></span>
      <div>
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

const TIER_DESC = {
  Essential: 'Chronological summary · PDF',
  Scope: 'Agenda-based · full compliance audit',
  Premium: 'Formal legal layout · signed · audit trail',
};

// A real report cover, scaled down — the thumbnail IS the product.
function MiniCover({ id }) {
  const { data } = useQuery({
    queryKey: ['sample', id],
    queryFn: async () => (await api.get(`/samples/${id}`)).data.sample,
    staleTime: Infinity,
  });
  const firstPage = useMemo(() => (data ? splitPages(data.generatedHtml)[0] : null), [data]);

  if (!firstPage) {
    return (
      <div className="h-full w-full animate-pulse rounded-xl bg-white/60">
        <div className="p-4">
          <div className="h-2 w-16 rounded bg-brand-100" />
          <div className="mt-3 h-1.5 w-3/4 rounded bg-slate-100" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
    );
  }
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden rounded-xl bg-white mask-fade-b">
      <div className="sirus-report absolute left-0 top-0 origin-top-left" style={{ width: 900, transform: 'scale(0.365)' }}>
        <div className="page !shadow-none" dangerouslySetInnerHTML={{ __html: firstPage }} />
      </div>
    </div>
  );
}

function SampleLibrary() {
  const [openId, setOpenId] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['samples'], queryFn: async () => (await api.get('/samples')).data.samples });

  return (
    <section id="samples" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center">Sample Library</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          See the <em className="serif-accent text-brand-600">quality</em> before you register
        </h2>
        <p className="mt-3 text-lg text-slate-500">Flip through a real report at each service tier — no login required.</p>
      </Reveal>

      {isLoading ? (
        <Spinner label="Loading samples…" className="py-12" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {(data || []).map((s, i) => (
            <Reveal key={s._id} delay={i * 110}>
              <button
                onClick={() => setOpenId(s._id)}
                className="group w-full rounded-4xl bg-white p-5 text-left shadow-soft ring-1 ring-ink/5 transition-all duration-500 ease-entry hover:-translate-y-2 hover:shadow-float"
              >
                <div className="flex items-center justify-between">
                  <TierBadge tier={s.tier} />
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-paper text-slate-400 transition-all duration-300 ease-spring group-hover:bg-brand-600 group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </div>
                <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-paperdim to-white p-2.5 ring-1 ring-ink/5">
                  <MiniCover id={s._id} />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-ink">{s.org}</p>
                <p className="text-sm text-slate-500">{s.meetingType} · {s.language}</p>
                <p className="mt-1 text-xs font-semibold text-brand-600">{TIER_DESC[s.tier]}</p>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <SampleModal id={openId} onClose={() => setOpenId(null)} />
    </section>
  );
}

// ── LIVE DEMO — the real Report Analyzer, running on real seeded data ───────
function LiveDemo() {
  const { data: samples } = useQuery({ queryKey: ['samples'], queryFn: async () => (await api.get('/samples')).data.samples });
  const premium = (samples || []).find((s) => s.tier === 'Premium');
  const { data: sample } = useQuery({
    queryKey: ['sample', premium?._id],
    queryFn: async () => (await api.get(`/samples/${premium._id}`)).data.sample,
    enabled: !!premium,
    staleTime: Infinity,
  });

  if (!sample?.findings) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center"><MousePointerClick size={14} /> Live product demo</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          This is the <em className="serif-accent text-brand-600">actual dashboard</em>. Click around.
        </h2>
        <p className="mt-3 text-lg text-slate-500">Not a mockup — the real Report Analyzer, on a real CSE session. Filter the risks, switch the tabs.</p>
      </Reveal>

      <Reveal>
        {/* faux browser chrome */}
        <div className="overflow-hidden rounded-4xl bg-white shadow-float ring-1 ring-ink/10">
          <div className="flex items-center gap-3 border-b border-ink/5 bg-paperdim/70 px-5 py-3">
            <span className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-coral/80" />
              <span className="h-3 w-3 rounded-full bg-gold/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </span>
            <span className="mx-auto flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-medium text-slate-400 ring-1 ring-ink/5">
              <ShieldCheck size={12} className="text-emerald-500" /> sirus.app / reports / analyzer
            </span>
            <span className="chip bg-emerald-50 text-emerald-600">Live data</span>
          </div>
          <div className="bg-paper p-4 sm:p-6">
            <ReportAnalyzer findings={sample.findings} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── TIER MATRIX — the proposal's Section 5 comparison, verbatim content ─────
const MATRIX = [
  ['Transcription', 'AI transcript, single channel', 'AI + speaker diarization', 'Speaker ID + multi-language'],
  ['Formatting', 'Chronological summary', 'Agenda-based structure', 'Agenda-based + formal legal layout'],
  ['Compliance check', 'Basic completeness check', 'Full audit vs regulation', 'Audit + clause-by-clause notes'],
  ['Editing', 'Speaker-name correction', 'Full text & speaker edits', 'Full edits + human reviewer'],
  ['Votes & decisions log', null, 'Detection & tabulation', 'Signature-ready decision log'],
  ['Output formats', 'PDF', 'PDF + DOCX', 'PDF + DOCX + letterhead'],
  ['Signature & approval', null, 'Digital sign-off block', 'Sign-off + audit trail'],
  ['Turnaround', '~15–30 min', '~1–2 hours', 'Same day · priority'],
];

function TiersMatrix() {
  const navigate = useNavigate();
  return (
    <section id="tiers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center">Service tiers</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          Three tiers. <em className="serif-accent text-brand-600">One pipeline.</em>
        </h2>
        <p className="mt-3 text-lg text-slate-500">Every tier runs the same AI engine — the difference is depth, audit and human review.</p>
      </Reveal>

      <Reveal>
        <div className="overflow-x-auto scroll-thin">
          <div className="min-w-[760px] overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-ink/5">
            {/* header row */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="p-5" />
              {['Essential', 'Scope', 'Premium'].map((t) => (
                <div key={t} className={`relative p-5 text-center ${t === 'Scope' ? 'bg-brand-50/70' : ''}`}>
                  {t === 'Scope' && <span className="absolute left-1/2 top-2 -translate-x-1/2 chip bg-brand-600 text-white">Most popular</span>}
                  <p className={`font-display text-2xl font-semibold ${t === 'Scope' ? 'mt-4 text-brand-700' : 'text-ink'}`}>{t}</p>
                </div>
              ))}
            </div>
            {/* feature rows */}
            {MATRIX.map(([label, ...cells], r) => (
              <div key={label} className={`grid grid-cols-[1.2fr_1fr_1fr_1fr] text-sm ${r % 2 ? '' : 'bg-paper/60'}`}>
                <div className="flex items-center px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
                {cells.map((cell, c) => (
                  <div key={c} className={`flex items-center justify-center gap-1.5 px-4 py-3.5 text-center text-slate-600 ${c === 1 ? 'bg-brand-50/40 font-medium text-ink' : ''}`}>
                    {cell ? (
                      <><Check size={14} className="shrink-0 text-emerald-500" /> {cell}</>
                    ) : (
                      <Minus size={14} className="text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            ))}
            {/* CTA row */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-t border-ink/5">
              <div className="p-5" />
              {['Essential', 'Scope', 'Premium'].map((t) => (
                <div key={t} className={`p-5 text-center ${t === 'Scope' ? 'bg-brand-50/70' : ''}`}>
                  <button onClick={() => navigate('/signup')} className={t === 'Scope' ? 'btn-brand w-full py-2.5 text-xs' : 'btn-outline w-full py-2.5 text-xs'}>
                    Start with {t}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────
const QUOTES = [
  {
    quote: 'Our extraordinary session ran three hours. The signed procès-verbal was in my inbox before lunch — with the reclassification gap we had missed flagged against the exact article.',
    name: 'Claire Fontaine',
    role: 'HR Director · Meridia SAS',
    tone: 'bg-brand-600',
  },
  {
    quote: 'I used to spend two evenings per session writing minutes. Now I review, adjust two paragraphs, and sign. The vote tables are always exact.',
    name: 'Marc Lefebvre',
    role: 'CSE Secretary · Groupe Atlas',
    tone: 'bg-emerald-500',
  },
  {
    quote: 'We productized our intake on SIRUS. Clients see the compliance snapshot before they commit — our conversion doubled in a quarter.',
    name: 'Sophie Bernard',
    role: 'Partner · Cabinet Juris Social',
    tone: 'bg-gold',
  },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center">Loved by the people who sign</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          Word gets around the <em className="serif-accent text-brand-600">works council</em>
        </h2>
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 110}>
            <figure className="flex h-full flex-col rounded-4xl bg-white p-8 shadow-soft ring-1 ring-ink/5 transition-all duration-500 ease-entry hover:-translate-y-1 hover:shadow-float">
              <span className="serif-accent text-6xl leading-none text-brand-200" aria-hidden>“</span>
              <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{q.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
                <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ${q.tone}`}>
                  {q.name.split(' ').map((w) => w[0]).join('')}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{q.name}</p>
                  <p className="text-xs text-slate-500">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How accurate is the audio transcription?',
    a: 'Recordings are transcribed with Deepgram Nova-2 with speaker diarization — each intervention is attributed to a numbered speaker with timestamps. Your consultant then verifies names before the report is generated, so the official minutes never rely on raw AI output alone.',
  },
  {
    q: 'What is the difference between the free preview and the official report?',
    a: 'The instant preview is a fixed, read-only snapshot (speaker analysis, figures, compliance check) to show you what we see in your meeting. The official report is produced after full transcription, tier-specific AI drafting, human editing, and lock-in — and only then becomes downloadable as PDF/DOCX.',
  },
  {
    q: 'Which regulations and languages are covered?',
    a: 'Six regions, each audited against its own framework: France (Code du travail — CSE, CSSCT, CSEE, QVCT), Germany (BetrVG — Betriebsrat), Spain (Estatuto de los Trabajadores — Comité de Empresa), Italy (Statuto dei Lavoratori — RSU), the UK (ICE Regulations) and Switzerland (Loi sur la participation). Reports are delivered in French, English, German, Spanish or Italian.',
  },
  {
    q: 'Is my meeting data secure?',
    a: 'Recordings and transcripts are treated as personal data: encrypted in transit, stored per-client, never used to train models, and every edit, lock and dispatch is recorded in an audit trail with a clear retention policy.',
  },
  {
    q: 'Can our consultant edit the report before we receive it?',
    a: 'Yes — that is the point. Every report passes through the admin Document Editor where your consultancy team edits against your notes, locks the content, and only then dispatches it. Locking freezes the report; nothing changes after sign-off.',
  },
  {
    q: 'How fast will I get my report?',
    a: 'The instant preview takes about a minute. Official reports depend on tier: Essential ~15–30 minutes, Scope ~1–2 hours, Premium same-day with priority queueing.',
  },
];

function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow-app justify-center">Questions</p>
        <h2 className="mt-3 font-display text-display-sm font-semibold text-ink text-balance">
          Everything the <em className="serif-accent text-brand-600">secretary</em> asks first
        </h2>
      </Reveal>
      <Reveal>
        <div className="overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-ink/5">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q} className={i > 0 ? 'border-t border-ink/5' : ''}>
                <button
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-paper/60"
                  aria-expanded={open}
                >
                  <span className="font-display text-lg font-semibold text-ink">{f.q}</span>
                  <ChevronDown size={18} className={`shrink-0 text-brand-500 transition-transform duration-300 ease-entry ${open ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-400 ease-entry ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

function SampleModal({ id, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sample', id],
    queryFn: async () => (await api.get(`/samples/${id}`)).data.sample,
    enabled: !!id,
  });

  return (
    <Modal open={!!id} onClose={onClose} size="xl">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          {data && <TierBadge tier={data.tier} />}
          <span className="font-bold text-ink">{data?.title || 'Sample report'}</span>
        </div>
        <button onClick={onClose} className="btn-outline p-2"><X size={16} /></button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto bg-paperdim p-4 scroll-thin sm:p-6">
        {isLoading ? <Spinner label="Loading report…" className="py-12" /> : <EbookViewer html={data?.generatedHtml} downloadable />}
      </div>
    </Modal>
  );
}
