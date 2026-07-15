import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
const MOD = IS_MAC ? '⌘' : 'Ctrl';

const GROUPS = [
  {
    title: 'Global',
    items: [
      [[MOD, 'K'], 'Open the command palette'],
      [['?'], 'Show this guide'],
      [['Esc'], 'Close dialogs'],
    ],
  },
  {
    title: 'Report viewer',
    items: [
      [['←', '→'], 'Previous / next page'],
    ],
  },
];

// '?' opens a grouped keyboard-shortcut cheat sheet.
export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('sirus:shortcuts', show);
    return () => window.removeEventListener('sirus:shortcuts', show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md animate-fade-up rounded-3xl bg-card p-6 shadow-float ring-1 ring-ink/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Keyboard size={18} className="text-brand-500" /> Keyboard shortcuts
          </p>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink"><X size={16} /></button>
        </div>
        <div className="mt-4 space-y-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted/80">{g.title}</p>
              <div className="space-y-1.5">
                {g.items.map(([keys, label]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-ink/[0.03] px-3 py-2">
                    <span className="text-sm text-muted">{label}</span>
                    <span className="flex gap-1">
                      {keys.map((k) => (
                        <kbd key={k} className="rounded-md bg-card px-2 py-0.5 text-xs font-bold text-ink shadow-soft ring-1 ring-ink/10">{k}</kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
