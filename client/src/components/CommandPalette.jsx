import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Home, LayoutDashboard, Plus, Inbox, FileText, Palette, Sparkles,
  CornerDownLeft, BookOpen, ShieldCheck, CircleHelp, Waypoints,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useTheme } from '../lib/theme.jsx';

// Subsequence fuzzy match: every query char must appear in order.
function fuzzy(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ⌘K command palette — navigation, actions, live request search, themes.
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTheme, themes } = useTheme() || { themes: [] };

  // Global bindings: ⌘K / Ctrl+K opens; Escape closes. '?' opens shortcuts overlay.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea/i.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === '?' && !typing && !e.metaKey && !e.ctrlKey) {
        window.dispatchEvent(new CustomEvent('sirus:shortcuts'));
      }
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener('sirus:command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('sirus:command', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  // Live request search (only when signed in and palette open).
  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => (await api.get('/requests')).data.requests,
    enabled: open && !!user,
    staleTime: 15000,
  });

  const commands = useMemo(() => {
    const go = (to) => () => navigate(to);
    const base = [];

    // Navigation
    base.push({ group: 'Go to', label: 'Home', icon: Home, run: go('/') });
    base.push({ group: 'Go to', label: 'Intelligence graph', icon: Waypoints, run: go('/map') });
    if (user?.role === 'client') {
      base.push({ group: 'Go to', label: 'My reports', icon: LayoutDashboard, run: go('/dashboard') });
      base.push({ group: 'Go to', label: 'New report', icon: Plus, run: go('/create') });
    }
    if (user?.role === 'admin') {
      base.push({ group: 'Go to', label: 'Admin intake', icon: Inbox, run: go('/admin') });
    }
    if (!user) {
      base.push({ group: 'Go to', label: 'Sample library', icon: BookOpen, run: () => { navigate('/'); setTimeout(() => document.getElementById('samples')?.scrollIntoView({ behavior: 'smooth' }), 80); } });
      base.push({ group: 'Go to', label: 'Sign in', icon: ShieldCheck, run: go('/login') });
      base.push({ group: 'Go to', label: 'Create an account', icon: Sparkles, run: go('/signup') });
    }

    // Actions
    base.push({ group: 'Actions', label: 'Keyboard shortcuts', icon: CircleHelp, run: () => window.dispatchEvent(new CustomEvent('sirus:shortcuts')) });

    // Themes
    for (const t of themes) {
      base.push({ group: 'Theme', label: `Theme: ${t.name}`, hint: t.hint, icon: Palette, swatch: t.swatch, run: () => setTheme(t.id) });
    }

    // Requests (live data)
    for (const r of requests || []) {
      const label = r.meetingName || 'Untitled meeting';
      base.push({
        group: user?.role === 'admin' ? 'Requests' : 'My meetings',
        label,
        hint: `${r.compliance} · ${r.status}`,
        icon: FileText,
        run: go(user?.role === 'admin' ? `/admin/${r._id}` : r.status === 'dispatched' ? `/reports/${r._id}` : `/create/${r._id}/upload`),
      });
    }
    return base;
  }, [user, requests, navigate, setTheme, themes]);

  const results = useMemo(() => {
    const list = query.trim() ? commands.filter((c) => fuzzy(query, `${c.label} ${c.hint || ''}`)) : commands;
    return list.slice(0, 14);
  }, [commands, query]);

  const groups = useMemo(() => {
    const m = new Map();
    results.forEach((c, i) => {
      if (!m.has(c.group)) m.set(c.group, []);
      m.get(c.group).push({ ...c, index: i });
    });
    return [...m.entries()];
  }, [results]);

  const run = useCallback(
    (cmd) => {
      setOpen(false);
      cmd.run();
    },
    []
  );

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) run(results[active]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl animate-fade-up overflow-hidden rounded-3xl bg-card shadow-float ring-1 ring-ink/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-ink/5 px-5 py-4">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onInputKey}
            placeholder="Search pages, meetings, themes…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
          />
          <kbd className="rounded-md bg-ink/5 px-2 py-1 text-[10px] font-bold text-muted">ESC</kbd>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2 scroll-thin">
          {groups.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">Nothing matches “{query}”.</p>
          )}
          {groups.map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted/80">{group}</p>
              {items.map((c) => (
                <button
                  key={`${c.group}-${c.label}`}
                  onMouseEnter={() => setActive(c.index)}
                  onClick={() => run(c)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${c.index === active ? 'bg-brand-600 text-white' : 'text-ink hover:bg-ink/5'}`}
                >
                  {c.swatch ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full ring-1 ring-ink/10" style={{ background: c.swatch }} />
                  ) : (
                    <c.icon size={16} className={c.index === active ? 'text-white/80' : 'text-muted'} />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.label}</span>
                  {c.hint && <span className={`truncate text-xs ${c.index === active ? 'text-white/70' : 'text-muted/80'}`}>{c.hint}</span>}
                  {c.index === active && <CornerDownLeft size={14} className="shrink-0 text-white/70" />}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-ink/5 px-5 py-2.5 text-[11px] text-muted">
          <span><kbd className="rounded bg-ink/5 px-1.5 py-0.5 font-bold">↑↓</kbd> navigate</span>
          <span><kbd className="rounded bg-ink/5 px-1.5 py-0.5 font-bold">↵</kbd> select</span>
          <span className="ml-auto flex items-center gap-1 text-muted/80"><Sparkles size={11} /> SIRUS</span>
        </div>
      </div>
    </div>
  );
}
