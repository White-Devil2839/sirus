import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays, FileAudio, BrainCircuit, ScrollText, Users, ListTree, MicVocal,
  Vote, TriangleAlert, BarChart3, ShieldCheck, Fingerprint, BookOpenCheck,
  Plus, Minus, Maximize2, RotateCcw, X, Check,
} from 'lucide-react';
import { deriveDna, DnaRadar } from './ComplianceDNA.jsx';
import { splitPages } from './EbookViewer.jsx';

// ── Intelligence Graph ───────────────────────────────────────────────────────
// Every report, rendered as a living dataflow graph. Unlike a decorative
// diagram, every node here is hydrated from the report's actual extraction
// JSON — the same object that powers the blue report, the Analyzer and the
// Compliance DNA. Click a node to inspect exactly what SIRUS extracted.

const W = 1720; // world size the nodes are laid out in
const H = 900;
const CARD_W = 244;

const CATS = {
  source: { label: 'Source', color: '#FF6B6B' },
  intel: { label: 'Intelligence', color: '#8e7dff' },
  signal: { label: 'Signals', color: '#10b981' },
  output: { label: 'Deliverables', color: '#F6BF2F' },
};

const shortResult = (r = '') => {
  const s = r.toLowerCase();
  if (/(rejet|reject|abgelehnt|rechaz)/.test(s)) return { label: 'Rejected', tone: '#ef4444' };
  if (/(adopt|approv|angenommen|aprob|carried|unanim)/.test(s)) return { label: 'Adopted', tone: '#10b981' };
  return { label: r.split(' ').slice(0, 2).join(' ') || 'Recorded', tone: '#f59e0b' };
};

const initials = (name = '') => name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '·';

// Derive everything the graph shows from the real report object.
function useGraphData(report, meta = {}) {
  return useMemo(() => {
    const x = report?.extraction || {};
    const f = report?.findings || x.findings || {};
    const spk = report?.speakerAnalysis?.speakers?.length ? report.speakerAnalysis : x.speakerAnalysis || {};
    const speakers = spk.speakers || [];
    const present = x.attendance?.present || [];
    const absent = x.attendance?.absent || [];
    const invited = x.attendance?.invited || [];
    const agenda = x.agendaItems || [];
    const alerts = agenda.flatMap((a) => a.alerts || []);
    const votes = x.votes || [];
    const nums = x.numericalData || [];
    const risks = f.risks || [];
    const tier = report?.tier || meta.tier || 'Scope';
    const trimmed = tier === 'Essential';

    return {
      x, f, speakers, present, absent, invited, agenda, alerts, votes, nums, risks,
      refs: f.complianceReferences || [],
      recs: f.recommendations || [],
      missing: f.missingDocuments || [],
      pages: splitPages(report?.generatedHtml || '').length,
      tier,
      model: report?.model || 'seed',
      language: meta.language || 'French',
      dna: deriveDna(report),
      topSpeaker: [...speakers].sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0],
      trims: {
        attendance: trimmed && !present.length && !absent.length,
        votes: trimmed && !votes.length,
        speakers: trimmed && !speakers.length,
      },
    };
  }, [report, meta]);
}

function buildNodes(d, meta) {
  const live = d.model && !/seed|demo/.test(d.model);
  return [
    {
      id: 'meeting', cat: 'source', icon: CalendarDays, x: 30, y: 150, order: 0,
      title: 'Meeting', sub: d.x.cover?.org || meta.org || meta.meetingName || 'Session on record',
      body: (
        <div className="flex flex-wrap gap-1">
          {[d.x.cover?.complianceInstance || meta.compliance, meta.meetingType || d.x.documentDetails?.type, d.x.cover?.date || d.x.documentDetails?.date]
            .filter(Boolean).slice(0, 3).map((c) => (
              <span key={c} className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">{c}</span>
            ))}
        </div>
      ),
    },
    {
      id: 'transcript', cat: 'source', icon: FileAudio, x: 30, y: 405, order: 0.5,
      title: 'Transcript', sub: `Diarized · ${d.language}`,
      body: (
        <div className="flex h-7 items-end gap-[3px]">
          {Array.from({ length: 26 }, (_, i) => (
            <span key={i} className="w-[4px] rounded-full" style={{ height: `${22 + ((i * 37 + 13) % 71)}%`, background: '#FF6B6B', opacity: 0.35 + ((i * 29) % 50) / 100 }} />
          ))}
        </div>
      ),
    },
    {
      id: 'engine', cat: 'intel', icon: BrainCircuit, x: 322, y: 270, order: 1,
      title: 'AI extraction', sub: live ? 'Groq LLM · JSON contract' : 'Curated extraction · JSON contract',
      body: (
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600">
            {live ? d.model : 'seed pipeline'}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><Check size={11} /> Zod contract passed</div>
        </div>
      ),
    },
    {
      id: 'overview', cat: 'intel', icon: ScrollText, x: 614, y: 30, order: 2,
      title: 'Executive summary', sub: 'The story, distilled',
      body: <p className="serif-accent line-clamp-2 text-[11px] leading-snug text-muted">“{(d.x.overview?.executiveSummary || '').slice(0, 110)}…”</p>,
    },
    {
      id: 'attendance', cat: 'signal', icon: Users, x: 614, y: 262, order: 2.2,
      title: 'Attendance', sub: 'Who was in the room', trimmed: d.trims.attendance,
      body: d.trims.attendance ? null : (
        <div>
          <div className="mb-1 flex flex-wrap gap-1">
            {Array.from({ length: Math.min(d.present.length, 12) }, (_, i) => <span key={i} className="h-2 w-2 rounded-full bg-emerald-500/80" />)}
            {Array.from({ length: Math.min(d.absent.length, 6) }, (_, i) => <span key={i} className="h-2 w-2 rounded-full bg-[#FF6B6B]/70" />)}
          </div>
          <p className="text-[10px] font-semibold text-muted">{d.present.length} present · {d.absent.length} absent{d.invited.length ? ` · ${d.invited.length} invited` : ''}</p>
        </div>
      ),
    },
    {
      id: 'agenda', cat: 'signal', icon: ListTree, x: 614, y: 494, order: 2.4,
      title: 'Agenda & debates', sub: 'Minute-by-minute record',
      body: (
        <div>
          <div className="mb-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            {d.agenda.map((_, i) => <span key={i} className="flex-1" style={{ background: `hsl(${255 - i * 22}, 70%, 62%)` }} />)}
          </div>
          <p className="text-[10px] font-semibold text-muted">{d.agenda.length} items · {d.alerts.length} alerts raised</p>
        </div>
      ),
    },
    {
      id: 'speakers', cat: 'signal', icon: MicVocal, x: 614, y: 716, order: 2.6,
      title: 'Speaker dynamics', sub: 'Who held the floor', trimmed: d.trims.speakers,
      body: d.trims.speakers ? null : (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {d.speakers.slice(0, 5).map((s, i) => (
              <span key={i} className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white ring-2 ring-card" style={{ background: `hsl(${250 + i * 26}, 62%, ${52 + i * 3}%)` }}>
                {initials(s.name)}
              </span>
            ))}
            {d.speakers.length > 5 && <span className="grid h-6 w-6 place-items-center rounded-full bg-ink/10 text-[9px] font-bold text-muted ring-2 ring-card">+{d.speakers.length - 5}</span>}
          </div>
          {d.topSpeaker && <p className="min-w-0 truncate text-[10px] font-semibold text-muted">led by {d.topSpeaker.name}</p>}
        </div>
      ),
    },
    {
      id: 'votes', cat: 'signal', icon: Vote, x: 906, y: 148, order: 3.2,
      title: 'Votes & decisions', sub: 'Formal record', trimmed: d.trims.votes,
      body: d.trims.votes ? null : d.votes.length ? (
        <div>
          <div className="mb-1 flex flex-wrap gap-1">
            {d.votes.slice(0, 3).map((v, i) => {
              const r = shortResult(v.result);
              return <span key={i} className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: r.tone }}>{r.label}</span>;
            })}
          </div>
          <p className="text-[10px] font-semibold text-muted">{d.votes.length} formal vote{d.votes.length > 1 ? 's' : ''} recorded</p>
        </div>
      ) : <p className="text-[10px] font-semibold text-muted">No formal vote this session</p>,
    },
    {
      id: 'risks', cat: 'signal', icon: TriangleAlert, x: 906, y: 388, order: 3.4,
      title: 'Risk detection', sub: 'Quiet red flags, surfaced',
      body: (
        <div className="flex flex-wrap gap-1">
          {['High', 'Medium', 'Low'].map((lvl) => {
            const n = d.risks.filter((r) => r.riskLevel === lvl).length;
            if (!n) return null;
            const tone = lvl === 'High' ? '#ef4444' : lvl === 'Medium' ? '#f59e0b' : '#10b981';
            return <span key={lvl} className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: `${tone}1a`, color: tone }}>{n} {lvl}</span>;
          })}
          {!d.risks.length && <span className="text-[10px] font-semibold text-muted">No risks flagged</span>}
        </div>
      ),
    },
    {
      id: 'numbers', cat: 'signal', icon: BarChart3, x: 906, y: 620, order: 3.6,
      title: 'Figures', sub: 'Every number, extracted',
      body: d.nums[0]?.series?.length ? (
        <div>
          <div className="mb-1 flex h-7 items-end gap-1">
            {d.nums[0].series.slice(0, 6).map((s, i) => {
              const max = Math.max(...d.nums[0].series.map((v) => v.value), 1);
              return <span key={i} className="w-4 rounded-t-sm bg-brand-500/70" style={{ height: `${Math.max(12, (s.value / max) * 100)}%` }} title={`${s.name}: ${s.value}`} />;
            })}
          </div>
          <p className="truncate text-[10px] font-semibold text-muted">{d.nums.length} chart{d.nums.length > 1 ? 's' : ''} · {d.nums[0].label}</p>
        </div>
      ) : <p className="text-[10px] font-semibold text-muted">No figures detected</p>,
    },
    {
      id: 'compliance', cat: 'output', icon: ShieldCheck, x: 1198, y: 250, order: 4.2,
      title: 'Compliance audit', sub: 'Grounded in the legal framework',
      body: (
        <div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold text-ink">{d.f.score ?? '—'}%</span>
            <span className="text-[10px] font-semibold text-muted">{d.refs.length} legal references</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold" style={{ width: `${d.f.score ?? 0}%` }} />
          </div>
        </div>
      ),
    },
    {
      id: 'dna', cat: 'output', icon: Fingerprint, x: 1198, y: 540, order: 4.6,
      title: 'Compliance DNA', sub: 'Six-trait fingerprint',
      body: (
        <div className="flex items-center gap-2">
          <DnaRadar traits={d.dna} size={62} />
          <div>
            <p className="font-display text-lg font-bold leading-none text-ink">{Math.round(d.dna.reduce((s, t) => s + t.value, 0) / d.dna.length)}</p>
            <p className="text-[10px] font-semibold text-muted">composite</p>
          </div>
        </div>
      ),
    },
    {
      id: 'report', cat: 'output', icon: BookOpenCheck, x: 1454, y: 388, order: 5.2,
      title: 'Report', sub: `${d.tier} tier · ready to read`,
      body: (
        <div className="flex gap-1.5">
          {[[d.pages, 'pages'], [d.risks.length, 'risks'], [d.recs.length, 'recs']].map(([n, l]) => (
            <span key={l} className="rounded-lg bg-ink/[0.06] px-2 py-1 text-center">
              <span className="block text-xs font-bold leading-none text-ink">{n}</span>
              <span className="text-[9px] font-semibold text-muted">{l}</span>
            </span>
          ))}
        </div>
      ),
    },
  ];
}

const EDGES = [
  ['meeting', 'engine'], ['transcript', 'engine'],
  ['engine', 'overview'], ['engine', 'attendance'], ['engine', 'agenda'], ['engine', 'speakers'],
  ['attendance', 'votes'], ['agenda', 'votes'], ['agenda', 'risks'], ['agenda', 'numbers'],
  ['votes', 'compliance'], ['risks', 'compliance'], ['numbers', 'compliance'],
  ['speakers', 'dna'], ['compliance', 'dna'],
  ['overview', 'report'], ['compliance', 'report'], ['dna', 'report'],
];

export default function MeetingMap({ report, meta = {}, className = '' }) {
  const d = useGraphData(report, meta);
  const nodes = useMemo(() => buildNodes(d, meta), [d, meta]);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const viewportRef = useRef(null);
  const movedRef = useRef(false);
  const dragRef = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0, k: 0.7 });
  const [selected, setSelected] = useState(null);
  const [runKey, setRunKey] = useState(0);

  const fit = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const k = Math.min((cw - 48) / W, (ch - 48) / H, 1);
    setT({ k, x: (cw - W * k) / 2, y: (ch - H * k) / 2 });
  };
  useLayoutEffect(fit, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Native wheel listener so preventDefault works (React's is passive).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setT((v) => {
        const k = Math.min(1.6, Math.max(0.28, v.k * Math.exp(-e.deltaY * 0.0016)));
        return { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const zoom = (dir) => {
    const el = viewportRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    setT((v) => {
      const k = Math.min(1.6, Math.max(0.28, v.k * (dir > 0 ? 1.22 : 0.82)));
      return { k, x: cw / 2 - ((cw / 2 - v.x) * k) / v.k, y: ch / 2 - ((ch / 2 - v.y) * k) / v.k };
    });
  };

  const anchor = (n, side) => ({ x: n.x + (side === 'out' ? CARD_W : 0), y: n.y + 52 });

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-paper ring-1 ring-ink/10 ${className}`}>
      <style>{`
        @keyframes mapflow { to { stroke-dashoffset: -22; } }
        @keyframes mapedge { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mapnode { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* dot-grid canvas */}
      <div
        ref={viewportRef}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        style={{ backgroundImage: 'radial-gradient(rgb(var(--ink) / 0.07) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        onPointerDown={(e) => {
          movedRef.current = false;
          dragRef.current = { px: e.clientX, py: e.clientY, ox: t.x, oy: t.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.px;
          const dy = e.clientY - dragRef.current.py;
          if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
          setT((v) => ({ ...v, x: dragRef.current.ox + dx, y: dragRef.current.oy + dy }));
        }}
        onPointerUp={() => { dragRef.current = null; }}
      >
        <div key={runKey} className="absolute left-0 top-0" style={{ width: W, height: H, transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})`, transformOrigin: '0 0' }}>
          {/* edges */}
          <svg width={W} height={H} className="absolute inset-0" style={{ overflow: 'visible' }}>
            {EDGES.map(([from, to]) => {
              const a = anchor(byId[from], 'out');
              const b = anchor(byId[to], 'in');
              const bend = Math.max(50, (b.x - a.x) * 0.45);
              const color = CATS[byId[to].cat].color;
              const delay = byId[to].order * 0.14;
              return (
                <g key={`${from}-${to}`} style={{ animation: `mapedge 0.6s ease both`, animationDelay: `${delay}s` }}>
                  <path
                    d={`M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`}
                    fill="none" stroke={color} strokeOpacity="0.7" strokeWidth="2"
                    strokeLinecap="round" strokeDasharray="4 7"
                    style={{ animation: 'mapflow 1.5s linear infinite' }}
                  />
                  <circle cx={b.x} cy={b.y} r="2.6" fill={color} fillOpacity="0.8" />
                </g>
              );
            })}
          </svg>

          {/* nodes */}
          {nodes.map((n) => {
            const cat = CATS[n.cat];
            const isSel = selected === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { if (!movedRef.current) setSelected(isSel ? null : n.id); }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute rounded-2xl bg-card p-3.5 text-left shadow-card ring-1 transition-all duration-300 ease-entry hover:-translate-y-1 hover:shadow-float ${n.trimmed ? 'opacity-60 ring-ink/10' : 'ring-ink/10'}`}
                style={{ left: n.x, top: n.y, width: CARD_W, animation: 'mapnode 0.7s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${n.order * 0.14}s`, boxShadow: isSel ? `0 0 0 2px ${cat.color}, 0 18px 40px -18px ${cat.color}66` : undefined }}
              >
                <span className={`absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-soft ring-1 ring-ink/10 ${n.trimmed ? 'bg-card text-amber-600' : 'bg-card text-emerald-600'}`}>
                  <span className={`h-1 w-1 rounded-full ${n.trimmed ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {n.trimmed ? 'Not in tier' : 'Complete'}
                </span>
                <div className="mb-2 flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: `${cat.color}1c`, color: cat.color }}>
                    <n.icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[13px] font-semibold leading-tight text-ink">{n.title}</span>
                    <span className="block truncate text-[10px] text-muted">{n.sub}</span>
                  </span>
                </div>
                {n.trimmed
                  ? <p className="text-[10px] font-semibold text-muted">Included from the Scope tier upward.</p>
                  : n.body}
              </button>
            );
          })}
        </div>
      </div>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded-full bg-card/80 px-4 py-2 text-[11px] font-semibold text-muted shadow-soft ring-1 ring-ink/10 backdrop-blur">
        {Object.values(CATS).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.label}
          </span>
        ))}
      </div>

      {/* controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-2xl bg-card/90 p-1 shadow-soft ring-1 ring-ink/10 backdrop-blur">
        <CtrlBtn title="Zoom in" onClick={() => zoom(1)}><Plus size={15} /></CtrlBtn>
        <CtrlBtn title="Zoom out" onClick={() => zoom(-1)}><Minus size={15} /></CtrlBtn>
        <CtrlBtn title="Fit to view" onClick={fit}><Maximize2 size={14} /></CtrlBtn>
        <CtrlBtn title="Replay the pipeline" onClick={() => setRunKey((k) => k + 1)}><RotateCcw size={14} /></CtrlBtn>
      </div>

      {/* hint */}
      {!selected && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-card/80 px-3.5 py-1.5 text-[11px] font-semibold text-muted shadow-soft ring-1 ring-ink/10 backdrop-blur">
          Drag to pan · scroll to zoom · click a node to inspect
        </div>
      )}

      {/* inspector */}
      {selected && byId[selected] && <Inspector node={byId[selected]} d={d} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CtrlBtn({ children, ...props }) {
  return (
    <button {...props} className="grid h-8 w-8 place-items-center rounded-xl text-muted transition hover:bg-ink/5 hover:text-ink">
      {children}
    </button>
  );
}

// ── Inspector — the real data behind the selected node ──────────────────────
function Inspector({ node, d, onClose }) {
  const cat = CATS[node.cat];
  return (
    <aside className="absolute bottom-3 right-3 top-3 flex w-[min(340px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl bg-card/95 shadow-float ring-1 ring-ink/10 backdrop-blur-xl animate-fade-up">
      <div className="flex items-center gap-2.5 border-b border-ink/5 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: `${cat.color}1c`, color: cat.color }}>
          <node.icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-ink">{node.title}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cat.color }}>{cat.label}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink" aria-label="Close inspector"><X size={15} /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm scroll-thin">
        <InspectorBody id={node.id} d={d} trimmed={node.trimmed} />
      </div>
    </aside>
  );
}

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5 text-[13px]">
    <span className="shrink-0 font-semibold text-muted">{label}</span>
    <span className="text-right font-medium text-ink">{children || '—'}</span>
  </div>
);

const MiniBar = ({ value, max = 100, tone = '#8e7dff' }) => (
  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: tone }} />
  </div>
);

function InspectorBody({ id, d, trimmed }) {
  if (trimmed) {
    return (
      <p className="rounded-xl bg-amber-500/10 p-3 text-[13px] font-medium leading-relaxed text-amber-700">
        The Essential tier delivers the core minutes only — this section is extracted and rendered from the Scope tier upward.
      </p>
    );
  }

  switch (id) {
    case 'meeting': {
      const dd = d.x.documentDetails || {};
      const c = d.x.cover || {};
      return (
        <>
          <Row label="Organisation">{c.org}</Row>
          <Row label="Session">{dd.title || c.title}</Row>
          <Row label="Date">{dd.date || c.date}</Row>
          <Row label="Location">{dd.location || c.location}</Row>
          <Row label="Type">{dd.type}</Row>
          <Row label="Instance">{c.complianceInstance}</Row>
          <Row label="Prepared by">{dd.preparedBy || c.preparedBy}</Row>
          {dd.reference && <Row label="Reference">{dd.reference}</Row>}
        </>
      );
    }
    case 'transcript':
      return (
        <>
          <Row label="Language">{d.language}</Row>
          <Row label="Form">Diarized, speaker-attributed</Row>
          {d.x.notice && <p className="rounded-xl bg-ink/[0.04] p-3 text-xs leading-relaxed text-muted">{d.x.notice}</p>}
        </>
      );
    case 'engine':
      return (
        <>
          <Row label="Model">{d.model}</Row>
          <Row label="Contract">Zod report schema</Row>
          <Row label="Repair pass">1 retry on invalid JSON</Row>
          <div className="space-y-1.5 pt-1">
            {['Transcript normalised', 'Structure extracted as JSON', 'Schema validated', 'Rendered to the design system'].map((s) => (
              <div key={s} className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-600"><Check size={11} /></span>{s}
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-brand-500/[0.08] p-3 text-xs leading-relaxed text-muted">
            The model returns structured JSON only — a deterministic renderer composes the report, so the layout can never drift.
          </p>
        </>
      );
    case 'overview':
      return (
        <>
          <p className="serif-accent text-[15px] leading-relaxed text-ink">{d.x.overview?.executiveSummary}</p>
          {d.x.overview?.context && <p className="text-xs leading-relaxed text-muted">{d.x.overview.context}</p>}
        </>
      );
    case 'attendance':
      return (
        <>
          <Row label="Present">{d.present.length}</Row>
          <Row label="Absent / excused">{d.absent.length}</Row>
          <Row label="Invited">{d.invited.length}</Row>
          <div className="space-y-1 pt-1">
            {d.present.slice(0, 8).map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="truncate font-medium text-ink">{p.name}</span>
                <span className="shrink-0 text-[11px] text-muted">{p.role || p.group}{p.voteRight ? ' · votes' : ''}</span>
              </div>
            ))}
            {d.present.length > 8 && <p className="text-[11px] font-semibold text-muted">+ {d.present.length - 8} more in the report</p>}
          </div>
        </>
      );
    case 'agenda':
      return (
        <div className="space-y-2.5">
          {d.agenda.map((a, i) => (
            <div key={i} className="rounded-xl bg-ink/[0.04] p-3">
              <p className="text-[13px] font-semibold leading-snug text-ink">{i + 1}. {a.title}</p>
              {!!(a.alerts || []).length && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(a.alerts || []).map((al, j) => (
                    <span key={j} className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${al.type === 'decision' ? 'bg-emerald-500/10 text-emerald-600' : al.type === 'tension' ? 'bg-red-500/10 text-red-500' : al.type === 'unresolved' ? 'bg-amber-500/10 text-amber-600' : 'bg-sky-500/10 text-sky-600'}`}>
                      {al.type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    case 'speakers':
      return (
        <div className="space-y-2.5">
          {d.speakers.map((s, i) => (
            <div key={i}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-ink">{s.name}</span>
                <span className="shrink-0 text-[11px] text-muted">{s.interventions} interventions</span>
              </div>
              <div className="flex items-center gap-2">
                <MiniBar value={s.engagement || 0} max={5} />
                <span className="w-7 text-right text-[11px] font-bold text-ink">{s.engagement}/5</span>
              </div>
            </div>
          ))}
        </div>
      );
    case 'votes':
      return d.votes.length ? (
        <div className="space-y-3">
          {d.votes.map((v, i) => {
            const r = shortResult(v.result);
            const total = (v.summary?.favorable || 0) + (v.summary?.unfavorable || 0) + (v.summary?.abstention || 0) || 1;
            return (
              <div key={i} className="rounded-xl bg-ink/[0.04] p-3">
                <p className="mb-2 text-[13px] font-semibold leading-snug text-ink">{v.question}</p>
                <div className="mb-1.5 flex h-2 overflow-hidden rounded-full">
                  <span style={{ width: `${((v.summary?.favorable || 0) / total) * 100}%`, background: '#10b981' }} />
                  <span style={{ width: `${((v.summary?.unfavorable || 0) / total) * 100}%`, background: '#ef4444' }} />
                  <span style={{ width: `${((v.summary?.abstention || 0) / total) * 100}%`, background: '#f59e0b' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                  <span>{v.summary?.favorable ?? 0} for · {v.summary?.unfavorable ?? 0} against · {v.summary?.abstention ?? 0} abst.</span>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: r.tone }}>{r.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className="text-[13px] text-muted">No formal vote was taken in this session.</p>;
    case 'risks':
      return d.risks.length ? (
        <div className="space-y-2.5">
          {d.risks.map((r, i) => {
            const tone = r.riskLevel === 'High' ? '#ef4444' : r.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';
            return (
              <div key={i} className="rounded-xl bg-ink/[0.04] p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold leading-snug text-ink">{r.title}</p>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: `${tone}1a`, color: tone }}>{r.riskLevel}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-muted">
                  <span className="flex items-center gap-1">impact {Array.from({ length: 5 }, (_, j) => <span key={j} className={`h-1.5 w-1.5 rounded-full ${j < (r.impact || 0) ? '' : 'opacity-20'}`} style={{ background: tone }} />)}</span>
                  <span>{r.confidence}% confidence</span>
                </div>
                {r.related && <p className="mt-1 text-[11px] italic text-muted">{r.related}</p>}
              </div>
            );
          })}
        </div>
      ) : <p className="text-[13px] text-muted">No compliance risks were flagged.</p>;
    case 'numbers':
      return d.nums.length ? (
        <div className="space-y-3">
          {d.nums.map((n, i) => (
            <div key={i}>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">{n.label}</p>
              <div className="space-y-1">
                {(n.series || []).map((s, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="w-24 truncate text-[11px] text-muted">{s.name}</span>
                    <MiniBar value={s.value} max={Math.max(...n.series.map((v) => v.value), 1)} />
                    <span className="w-10 text-right text-[11px] font-bold text-ink">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-[13px] text-muted">No numerical series were extracted.</p>;
    case 'compliance':
      return (
        <>
          <Row label="Audit score">{d.f.score}%</Row>
          <Row label="Risk exposure">{d.f.riskExposure}</Row>
          <Row label="Missing documents">{d.missing.length}</Row>
          <div className="space-y-1.5 pt-1">
            {d.refs.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="min-w-0 truncate"><b className="text-ink">{r.code}</b> <span className="text-muted">{r.title}</span></span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${/compliant/i.test(r.status) ? 'bg-emerald-500/10 text-emerald-600' : /partial/i.test(r.status) ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-500'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </>
      );
    case 'dna':
      return (
        <>
          <div className="mx-auto w-fit"><DnaRadar traits={d.dna} size={180} /></div>
          <div className="space-y-2">
            {d.dna.map((tr) => (
              <div key={tr.key} className="flex items-center gap-2">
                <span className="w-28 text-[12px] font-semibold text-muted">{tr.key}</span>
                <MiniBar value={tr.value} />
                <span className="w-8 text-right text-[12px] font-bold text-ink">{tr.value}</span>
              </div>
            ))}
          </div>
        </>
      );
    case 'report':
      return (
        <>
          <Row label="Pages">{d.pages}</Row>
          <Row label="Tier">{d.tier}</Row>
          <Row label="Risks documented">{d.risks.length}</Row>
          <Row label="Recommendations">{d.recs.length}</Row>
          <div className="space-y-1.5 pt-1">
            {d.recs.slice(0, 4).map((r, i) => (
              <p key={i} className="rounded-xl bg-ink/[0.04] p-2.5 text-[12px] leading-snug text-ink"><b>{r.title}</b>{r.description ? <span className="text-muted"> — {r.description}</span> : null}</p>
            ))}
          </div>
        </>
      );
    default:
      return null;
  }
}
