import { UploadCloud, AudioLines, PenLine, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

const STEPS = [
  { n: '01', label: 'Upload Recordings', icon: UploadCloud },
  { n: '02', label: 'AI Transcribes Audio', icon: AudioLines },
  { n: '03', label: 'Reformulate & Edit Minutes', icon: PenLine },
  { n: '04', label: 'Compliance Check', icon: ShieldCheck },
  { n: '05', label: 'Report Ready to Distribute', icon: FileText },
];

export default function ProcessStrip() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-y-4">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-start">
          <div className="flex w-24 flex-col items-center text-center sm:w-28">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
              <s.icon size={20} />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-400">{s.n}</span>
            <span className="mt-0.5 text-xs font-semibold leading-tight text-slate-600">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="mt-3 hidden text-slate-300 sm:block" size={18} />}
        </div>
      ))}
    </div>
  );
}
