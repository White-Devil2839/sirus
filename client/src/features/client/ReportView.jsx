import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BookOpen, LayoutDashboard, ArrowLeft, MessageSquare, Sparkles, Send, X } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { PageShell, Spinner, TierBadge } from '../../components/ui.jsx';
import EbookViewer from '../../components/EbookViewer.jsx';
import ReportAnalyzer from '../../components/ReportAnalyzer.jsx';

export default function ReportView() {
  const { id } = useParams();
  const [view, setView] = useState('book');

  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => (await api.get(`/requests/${id}/report`)).data,
    retry: false,
  });

  if (isLoading) return <PageShell><Spinner label="Opening your report…" className="py-24" /></PageShell>;
  if (error) return <PageShell><div className="card p-8 text-center text-sm text-slate-500">{errMsg(error)}</div></PageShell>;

  const { report, request } = data;

  return (
    <PageShell>
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft size={15} /> Back to my reports
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{request.meetingName}</h1>
          <TierBadge tier={report.tier} />
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-soft ring-1 ring-slate-100">
          <ToggleBtn active={view === 'book'} onClick={() => setView('book')} icon={BookOpen}>Report</ToggleBtn>
          <ToggleBtn active={view === 'dash'} onClick={() => setView('dash')} icon={LayoutDashboard}>Analyzer</ToggleBtn>
        </div>
      </div>

      {view === 'book' ? (
        <EbookViewer html={report.generatedHtml} downloadable />
      ) : (
        <ReportAnalyzer findings={report.findings} />
      )}

      <AskSirus request={request} />
    </PageShell>
  );
}

function ToggleBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-brand-950 text-white' : 'text-slate-500 hover:text-ink'}`}>
      <Icon size={15} /> {children}
    </button>
  );
}

// ── "Ask SIRUS" — live Groq-backed assistant, grounded in this report ────────
const GREETING = {
  French: 'Bonjour ! Je suis SIRUS Assist. Posez-moi une question sur votre rapport, vos risques de conformité, ou l’avancement de votre demande.',
  default: 'Hi! I’m SIRUS Assist. Ask me anything about your report, its compliance findings, or where your request is in the process.',
};
const CHIPS = {
  French: ['Quels sont les principaux risques ?', 'Où en est mon rapport ?', 'Que contient mon offre ?'],
  default: ['What are the main risks?', 'Where is my report?', 'What does my tier include?'],
};

function AskSirus({ request }) {
  const lang = request.language === 'French' ? 'French' : 'default';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING[lang] }]);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const ask = useMutation({
    mutationFn: async (question) => {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post(`/requests/${request._id}/ask`, { question, history }, { timeout: 60000 });
      return data.answer;
    },
    onSuccess: (answer) => setMessages((m) => [...m, { role: 'assistant', content: answer }]),
    onError: (e) => setMessages((m) => [...m, { role: 'assistant', content: `⚠ ${errMsg(e)}`, error: true }]),
  });

  function send(question) {
    const q = (question ?? input).trim();
    if (!q || ask.isPending) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    ask.mutate(q);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-float transition-all duration-300 ease-entry hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-glow"
        >
          <MessageSquare size={18} /> Ask SIRUS
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex max-h-[70vh] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-float ring-1 ring-ink/10 animate-fade-up">
          {/* header */}
          <div className="flex items-center justify-between bg-brand-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600"><Sparkles size={14} /></span>
              <div>
                <p className="text-sm font-bold leading-tight">SIRUS Assist</p>
                <p className="text-[10px] text-brand-300">Answers in {request.language} · grounded in your report</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-brand-200 hover:bg-white/10 hover:text-white"><X size={16} /></button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scroll-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-brand-600 text-white'
                      : m.error
                        ? 'rounded-bl-md bg-red-50 text-red-700 ring-1 ring-red-100'
                        : 'rounded-bl-md bg-paper text-ink ring-1 ring-ink/5'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {ask.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-paper px-4 py-3 ring-1 ring-ink/5">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 140}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            {/* suggested questions */}
            {messages.length === 1 && !ask.isPending && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CHIPS[lang].map((c) => (
                  <button key={c} onClick={() => send(c)} className="rounded-full border border-brand-200 bg-brand-50/60 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100">
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-ink/5 p-3"
          >
            <input
              className="min-w-0 flex-1 rounded-full border border-ink/10 bg-paper px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-400"
              placeholder={lang === 'French' ? 'Votre question…' : 'Your question…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || ask.isPending} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
