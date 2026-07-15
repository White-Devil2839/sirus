import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Undo2, Redo2, Save, Sparkles, Code2, Maximize2, Minimize2, Printer,
} from 'lucide-react';
import '../../report/reportStyles.css';
import { useToast } from '../../lib/toast.jsx';

// Page-based document editor (image 5). Edits the blue design-system HTML
// directly via a contentEditable surface + formatting toolbar, so what admin
// edits is exactly what the client receives.
export default function DocumentEditor({ html, onSave, saving, locked }) {
  const { toast } = useToast();
  const ref = useRef(null);
  const [dirty, setDirty] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState(html || '');
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html || '';
    setSource(html || '');
  }, [html]);

  const exec = (cmd, val = null) => {
    if (locked) return;
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    setDirty(true);
  };
  const format = (tag) => exec('formatBlock', tag);

  const save = () => {
    const current = showSource ? source : ref.current?.innerHTML || '';
    onSave(current);
    setDirty(false);
  };

  const Btn = ({ icon: Icon, onClick, title, disabled }) => (
    <button onClick={onClick} disabled={disabled || locked} title={title} className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-ink/10 disabled:opacity-40">
      <Icon size={16} />
    </button>
  );

  return (
    <div className={full ? 'fixed inset-0 z-50 flex flex-col bg-card' : 'card overflow-hidden'}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line/10 bg-ink/[0.04] px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-card px-1 py-0.5 ring-1 ring-line/10">
          <Btn icon={Bold} onClick={() => exec('bold')} title="Bold" />
          <Btn icon={Italic} onClick={() => exec('italic')} title="Italic" />
          <Btn icon={Underline} onClick={() => exec('underline')} title="Underline" />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-card px-1 py-0.5 ring-1 ring-line/10">
          <Btn icon={Heading2} onClick={() => format('h2')} title="Heading" />
          <Btn icon={Heading3} onClick={() => format('h3')} title="Subheading" />
          <Btn icon={List} onClick={() => exec('insertUnorderedList')} title="Bullet list" />
          <Btn icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Numbered list" />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-card px-1 py-0.5 ring-1 ring-line/10">
          <Btn icon={Undo2} onClick={() => exec('undo')} title="Undo" />
          <Btn icon={Redo2} onClick={() => exec('redo')} title="Redo" />
        </div>

        <button
          onClick={() => toast({ title: 'SIRUS AI Assist', description: 'Planned inline tool: rephrase, summarize or expand the selected passage with the report LLM.', variant: 'magic' })}
          disabled={locked}
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-40"
        >
          <Sparkles size={14} /> SIRUS AI Assist
        </button>

        <div className="ml-auto flex items-center gap-1">
          <Btn icon={Code2} onClick={() => setShowSource((s) => !s)} title="Source" />
          <Btn icon={Printer} onClick={() => window.print()} title="Print" />
          <Btn icon={full ? Minimize2 : Maximize2} onClick={() => setFull((f) => !f)} title="Fullscreen" />
          <button onClick={save} disabled={saving || locked} className="btn-brand ml-1 px-4 py-1.5 text-xs">
            <Save size={14} /> {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Editable surface */}
      <div className={`overflow-y-auto bg-paperdim p-4 scroll-thin ${full ? 'flex-1' : 'max-h-[70vh]'}`}>
        {showSource ? (
          <textarea
            className="h-[60vh] w-full rounded-xl border border-line/15 bg-card p-4 font-mono text-xs"
            value={source}
            readOnly={locked}
            onChange={(e) => { setSource(e.target.value); setDirty(true); }}
          />
        ) : (
          <div
            ref={ref}
            className="sirus-report outline-none"
            contentEditable={!locked}
            suppressContentEditableWarning
            onInput={() => setDirty(true)}
          />
        )}
      </div>

      {locked && (
        <div className="border-t border-line/10 bg-violet-50 px-4 py-2 text-center text-xs font-semibold text-violet-700">
          This report is locked. Unlock it to make further edits.
        </div>
      )}
    </div>
  );
}
