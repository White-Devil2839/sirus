import { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Printer, Lock, FileDown } from 'lucide-react';
import '../report/reportStyles.css';
import reportCssRaw from '../report/reportStyles.css?raw';

// Export the report as a Word-compatible .doc (HTML payload with the design
// CSS inlined — Word opens it directly; fulfils the "PDF + DOCX" tier output).
function downloadWord(html, filename = 'sirus-report') {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><style>${reportCssRaw.replaceAll('.sirus-report ', 'body ').replaceAll('.sirus-report', 'body')}</style></head>
<body class="sirus-report">${html}</body></html>`;
  const blob = new Blob(['﻿', doc], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Split a string of concatenated `<div class="page">…</div>` blocks into the
// inner HTML of each page, using the browser's parser (robust vs regex).
export function splitPages(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const pages = Array.from(doc.querySelectorAll('.page'));
  if (pages.length) return pages.map((p) => p.innerHTML);
  return [html];
}

export default function EbookViewer({ html, downloadable = true, watermark = null }) {
  const pages = useMemo(() => splitPages(html), [html]);
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [html]);

  const go = useCallback(
    (dir) => setActive((p) => Math.min(pages.length - 1, Math.max(0, p + dir))),
    [pages.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  if (!pages.length) {
    return <div className="grid h-64 place-items-center text-sm text-slate-400">No report content.</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar */}
      <div className="mb-4 flex w-full max-w-[900px] items-center justify-between rounded-xl bg-white px-3 py-2 shadow-soft ring-1 ring-slate-100">
        <button onClick={() => go(-1)} disabled={active === 0} className="btn-ghost px-3 py-1.5">
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="text-sm font-semibold text-slate-500">
          Page {active + 1} <span className="text-slate-300">/</span> {pages.length}
        </div>
        <div className="flex items-center gap-2">
          {downloadable ? (
            <>
              <button onClick={() => downloadWord(html)} className="btn-outline px-3 py-1.5" title="Download as Word document">
                <FileDown size={16} /> <span className="hidden sm:inline">DOCX</span>
              </button>
              <button onClick={() => window.print()} className="btn-brand px-3 py-1.5" title="Print / Save as PDF">
                <Printer size={16} /> <span className="hidden sm:inline">PDF</span>
              </button>
            </>
          ) : (
            <span className="chip bg-slate-100 text-slate-500"><Lock size={12} /> Preview</span>
          )}
          <button onClick={() => go(1)} disabled={active === pages.length - 1} className="btn-ghost px-3 py-1.5">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Book — all pages mounted; only active shown on screen, all shown in print */}
      <div className="sirus-report relative w-full">
        {watermark && !downloadable && (
          <div className="pointer-events-none absolute inset-x-0 top-24 z-10 text-center">
            <span className="rounded-full bg-black/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              {watermark}
            </span>
          </div>
        )}
        {pages.map((inner, i) => (
          <div key={i} className="page animate-fade-up" hidden={i !== active} dangerouslySetInnerHTML={{ __html: inner }} />
        ))}
      </div>

      {/* Page dots */}
      {pages.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
