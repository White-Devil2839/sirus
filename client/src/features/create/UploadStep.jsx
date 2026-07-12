import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UploadCloud, FileText, ArrowRight, ArrowLeft, CheckCircle2, X, AudioLines, FileAudio } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { PageShell, Spinner } from '../../components/ui.jsx';
import { Stepper, SummaryPanel } from './BuilderBits.jsx';

const MEETING_TYPES = ['Ordinary', 'Extraordinary', 'Exceptional', 'Other'];
const ACCEPT = '.docx,.pdf,.txt,.mp3,.wav,.m4a,.mp4,.webm,.ogg';
const isAudioFile = (f) => /\.(mp3|wav|m4a|mp4|webm|ogg)$/i.test(f?.name || '');

export default function UploadStep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [fields, setFields] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await api.get(`/requests/${id}`)).data.request,
  });
  const { data: caps } = useQuery({ queryKey: ['meta'], queryFn: async () => (await api.get('/meta')).data });
  const audioEnabled = !!caps?.audio?.enabled;

  // Initialize the form once the request arrives (TanStack Query v5 has no
  // onSuccess callback on useQuery, so seed local state via an effect).
  useEffect(() => {
    if (request && !fields) {
      setFields({
        meetingName: request.meetingName || '',
        meetingLocation: request.meetingLocation || '',
        meetingType: request.meetingType || 'Ordinary',
        meetingDate: '',
      });
    }
  }, [request, fields]);

  const meta = { ...request, ...(fields || {}) };

  function pick(f) {
    if (!f) return;
    setError('');
    setFile(f);
  }

  async function start() {
    if (!file) return setError('Please attach a meeting file — audio (.mp3/.wav/.m4a/.mp4) or a transcript (.docx/.pdf/.txt).');
    setBusy(true);
    setError('');
    try {
      await api.patch(`/requests/${id}`, fields);
      const fd = new FormData();
      fd.append('file', file);
      // Audio transcription can take a while for long recordings — allow 5 min.
      await api.post(`/requests/${id}/transcript`, fd, { timeout: 300000 });
      navigate(`/create/${id}/preview`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !fields) return <PageShell><Spinner label="Loading…" className="py-20" /></PageShell>;

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Upload your meeting</h1>
          <p className="text-sm text-slate-500">Attach the transcript and describe the meeting.</p>
        </div>
        <Stepper current={1} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="chip bg-brand-50 text-brand-700">{request.compliance}</span>
              <span className="text-slate-400">·</span>
              <span>{request.language}</span>
            </div>
            <Link to="/create" className="text-xs font-bold uppercase tracking-wide text-brand-600 hover:underline">Change processing type</Link>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
              drag ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-300'
            }`}
          >
            <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => pick(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {isAudioFile(file) ? <FileAudio className="text-coral" size={28} /> : <FileText className="text-brand-600" size={28} />}
                <div className="text-left">
                  <p className="font-bold text-ink">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(file.size > 1048576 ? 1 : 2)} MB
                    {isAudioFile(file) ? ' · will be transcribed with Deepgram' : ' · ready'}
                  </p>
                </div>
                <CheckCircle2 className="text-emerald-500" size={22} />
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn-outline p-1.5"><X size={14} /></button>
              </div>
            ) : (
              <>
                <UploadCloud className="mx-auto text-brand-400" size={34} />
                <p className="mt-3 font-bold text-ink">Click or drag and drop your meeting file</p>
                <p className="mt-1 text-xs text-slate-500">Audio or video (.mp3, .wav, .m4a, .mp4) · transcript (.docx, .pdf, .txt)</p>
              </>
            )}
          </div>

          {/* Deepgram capability status */}
          <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm ${audioEnabled ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            <AudioLines size={15} />
            {audioEnabled
              ? 'Audio & video are transcribed automatically with Deepgram — speakers identified and timestamped.'
              : 'Audio transcription is offline (no Deepgram key configured) — upload a written transcript instead.'}
          </div>

          {/* Meeting fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Meeting Name *</label>
              <input className="field-input" value={fields.meetingName} onChange={(e) => setFields({ ...fields, meetingName: e.target.value })} placeholder="Séance extraordinaire du CSE" />
            </div>
            <div>
              <label className="field-label">Meeting Location</label>
              <input className="field-input" value={fields.meetingLocation} onChange={(e) => setFields({ ...fields, meetingLocation: e.target.value })} placeholder="Lyon, France" />
            </div>
            <div>
              <label className="field-label">Meeting Type *</label>
              <select className="field-input" value={fields.meetingType} onChange={(e) => setFields({ ...fields, meetingType: e.target.value })}>
                {MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Date &amp; Time *</label>
              <input type="datetime-local" className="field-input" value={fields.meetingDate} onChange={(e) => setFields({ ...fields, meetingDate: e.target.value })} />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-between">
            <Link to="/create" className="btn-outline px-5 py-3"><ArrowLeft size={16} /> Back</Link>
            <button onClick={start} disabled={busy} className="btn-primary px-6 py-3.5">
              {busy ? (isAudioFile(file) ? 'Transcribing audio…' : 'Analysing…') : 'Start'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <SummaryPanel meta={{ ...meta, region: request.region }} />
      </div>
    </PageShell>
  );
}
