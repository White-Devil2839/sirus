import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, Sparkles, Lock, Unlock, Send, Save, AudioLines,
  BookOpen, LayoutDashboard, PenSquare, Info, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { regionName } from '../create/BuilderBits.jsx';
import { PageShell, Spinner, StatusChip, TierBadge } from '../../components/ui.jsx';
import DocumentEditor from './DocumentEditor.jsx';
import EbookViewer from '../../components/EbookViewer.jsx';
import ReportAnalyzer from '../../components/ReportAnalyzer.jsx';

export default function RequestDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState('transcript');
  const [reportView, setReportView] = useState('editor');
  const [transcript, setTranscript] = useState('');
  const [notice, setNotice] = useState(null); // { kind: 'ok' | 'err', text }

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await api.get(`/requests/${id}`)).data.request,
  });
  const { data: meta } = useQuery({ queryKey: ['meta'], queryFn: async () => (await api.get('/meta')).data });
  const { data: reportData } = useQuery({
    queryKey: ['admin-report', id],
    queryFn: async () => (await api.get(`/requests/${id}/report`)).data,
    enabled: !!request?.report,
  });
  const report = reportData?.report;

  useEffect(() => {
    if (request) setTranscript(request.transcript?.editedText || request.transcript?.rawText || '');
  }, [request?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['request', id] });
    qc.invalidateQueries({ queryKey: ['admin-report', id] });
    qc.invalidateQueries({ queryKey: ['admin-requests'] });
  };

  const saveTranscript = useMutation({
    mutationFn: () => api.patch(`/requests/${id}/transcript`, { editedText: transcript }),
    onSuccess: () => { setNotice({ kind: 'ok', text: 'Transcript saved.' }); invalidate(); },
    onError: (e) => setNotice({ kind: 'err', text: errMsg(e) }),
  });
  const generate = useMutation({
    mutationFn: () => api.post(`/requests/${id}/generate`),
    onSuccess: () => { setNotice({ kind: 'ok', text: 'Report generated.' }); setTab('report'); invalidate(); },
    onError: (e) => setNotice({ kind: 'err', text: errMsg(e) }),
  });
  const saveReport = useMutation({
    mutationFn: (html) => api.patch(`/reports/${report._id}`, { generatedHtml: html }),
    onSuccess: () => { setNotice({ kind: 'ok', text: 'Report saved.' }); invalidate(); },
    onError: (e) => setNotice({ kind: 'err', text: errMsg(e) }),
  });
  const lock = useMutation({
    mutationFn: (locked) => api.post(`/reports/${report._id}/lock`, { locked }),
    onSuccess: () => invalidate(),
    onError: (e) => setNotice({ kind: 'err', text: errMsg(e) }),
  });
  const dispatch = useMutation({
    mutationFn: () => api.post(`/requests/${id}/dispatch`),
    onSuccess: () => { setNotice({ kind: 'ok', text: 'Report dispatched to the client.' }); invalidate(); },
    onError: (e) => setNotice({ kind: 'err', text: errMsg(e) }),
  });

  if (isLoading || !request) return <PageShell><Spinner label="Loading request…" className="py-24" /></PageShell>;

  return (
    <PageShell>
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft size={15} /> Back to intake
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{request.meetingName || 'Untitled meeting'}</h1>
          <TierBadge tier={request.tier} />
          <StatusChip status={request.status} />
        </div>
      </div>

      {meta && !meta.llm.enabled && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <Info size={15} /> Demo mode — no LLM key configured. Generation returns a realistic seeded report. Add <code className="mx-1 rounded bg-amber-100 px-1">GROQ_API_KEY</code> to server/.env to run the live model.
        </div>
      )}
      {notice && (
        <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${notice.kind === 'err' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          <span className="flex items-center gap-2">
            {notice.kind === 'err' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />} {notice.text}
          </span>
          <button onClick={() => setNotice(null)} className={`hover:underline ${notice.kind === 'err' ? 'text-red-600' : 'text-emerald-600'}`}>Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar: cover-label + workflow */}
        <aside className="space-y-4">
          <CoverLabel request={request} />
          {request.notes && (
            <div className="card p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Client notes</p>
              <p className="mt-2 text-sm text-slate-600">{request.notes}</p>
            </div>
          )}
          <div className="card p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-600">Workflow</p>
            <div className="space-y-2">
              <WorkStep n={1} label="Transcription" done={!!request.transcript?.rawText} active={tab === 'transcript'} />
              <WorkStep n={2} label="AI generation" done={!!report} />
              <WorkStep n={3} label="Edit & format" done={!!report} />
              <WorkStep n={4} label="Lock" done={report?.locked} />
              <WorkStep n={5} label="Dispatch" done={request.status === 'dispatched'} />
            </div>

            <div className="mt-4 space-y-2">
              <button onClick={() => generate.mutate()} disabled={generate.isPending || !request.transcript?.rawText} className="btn-brand w-full py-2.5 text-sm">
                <Sparkles size={15} /> {generate.isPending ? 'Generating…' : report ? 'Regenerate' : 'Generate report'}
              </button>
              {report && (
                <>
                  <button onClick={() => lock.mutate(!report.locked)} disabled={lock.isPending} className="btn-outline w-full py-2.5 text-sm">
                    {report.locked ? <><Unlock size={15} /> Unlock</> : <><Lock size={15} /> Lock report</>}
                  </button>
                  <button onClick={() => dispatch.mutate()} disabled={dispatch.isPending || !report.locked || request.status === 'dispatched'} className="btn-primary w-full py-2.5 text-sm">
                    <Send size={15} /> {request.status === 'dispatched' ? 'Dispatched' : 'Dispatch to client'}
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <div className="mb-4 flex gap-2">
            <TabBtn active={tab === 'transcript'} onClick={() => setTab('transcript')} icon={AudioLines}>Transcript</TabBtn>
            <TabBtn active={tab === 'report'} onClick={() => setTab('report')} icon={FileText} disabled={!report}>Report {report ? '' : '(none)'}</TabBtn>
          </div>

          {tab === 'transcript' && (
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <AudioLines size={14} /> Deepgram transcription runs here in production. This request already has a transcript — review and correct speaker labels before generating.
              </div>
              <textarea
                className="h-[55vh] w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed scroll-thin"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <button onClick={() => saveTranscript.mutate()} disabled={saveTranscript.isPending} className="btn-brand px-5 py-2.5 text-sm">
                  <Save size={15} /> {saveTranscript.isPending ? 'Saving…' : 'Save transcript'}
                </button>
              </div>
            </div>
          )}

          {tab === 'report' && report && (
            <div>
              <div className="mb-4 flex items-center gap-1 rounded-xl bg-white p-1 shadow-soft ring-1 ring-slate-100">
                <SubTab active={reportView === 'editor'} onClick={() => setReportView('editor')} icon={PenSquare}>Document Editor</SubTab>
                <SubTab active={reportView === 'preview'} onClick={() => setReportView('preview')} icon={BookOpen}>Preview</SubTab>
                <SubTab active={reportView === 'analyzer'} onClick={() => setReportView('analyzer')} icon={LayoutDashboard}>Report Analyzer</SubTab>
              </div>
              {reportView === 'editor' && (
                <DocumentEditor html={report.generatedHtml} onSave={(html) => saveReport.mutate(html)} saving={saveReport.isPending} locked={report.locked} />
              )}
              {reportView === 'preview' && (
                <div className="rounded-2xl bg-paperdim p-4"><EbookViewer html={report.generatedHtml} downloadable /></div>
              )}
              {reportView === 'analyzer' && <ReportAnalyzer findings={report.findings} />}
            </div>
          )}

          {tab === 'report' && !report && (
            <div className="card grid place-items-center p-12 text-center">
              <Sparkles className="text-slate-300" size={30} />
              <p className="mt-2 font-bold text-ink">No report generated yet</p>
              <p className="mt-1 text-sm text-slate-500">Review the transcript, then click “Generate report”.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function CoverLabel({ request }) {
  const rows = [
    ['Company', request.client?.company || request.client?.name],
    ['Region', regionName(request.region)],
    ['Compliance', request.compliance],
    ['Language', request.language],
    ['Meeting type', request.meetingType],
    ['Date', request.meetingDate ? new Date(request.meetingDate).toLocaleDateString() : '—'],
    ['Location', request.meetingLocation || '—'],
    ['File', request.transcript?.fileName || '—'],
  ];
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-200">★ {request.compliance} · Official Minutes</p>
        <h3 className="mt-2 text-lg font-semibold leading-tight">{request.meetingName}</h3>
      </div>
      <dl className="divide-y divide-slate-50 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k}</dt>
            <dd className="max-w-[55%] truncate font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function WorkStep({ n, label, done, active }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${active ? 'bg-brand-50' : ''}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {done ? <CheckCircle2 size={13} /> : n}
      </span>
      <span className={`text-sm font-semibold ${done ? 'text-ink' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${active ? 'bg-brand-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-100 hover:text-ink'}`}>
      <Icon size={16} /> {children}
    </button>
  );
}
function SubTab({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-brand-950 text-white' : 'text-slate-500 hover:text-ink'}`}>
      <Icon size={15} /> {children}
    </button>
  );
}
