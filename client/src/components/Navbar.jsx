import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, Palette, Check } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useTheme } from '../lib/theme.jsx';

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
        <Sparkles size={18} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">SIRUS</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/';

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          {!user && (
            <nav className="hidden gap-1 md:flex">
              {[['How it works', '/#how'], ['Tiers', '/#tiers'], ['Samples', '/#samples'], ['FAQ', '/#faq']].map(([label, href]) => (
                <a key={href} href={href} className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-all duration-300 ease-entry hover:bg-card/60 hover:text-ink">
                  {label}
                </a>
              ))}
              <NavItem to="/map" active={pathname === '/map'}>Live graph</NavItem>
            </nav>
          )}
          {user?.role === 'admin' && (
            <nav className="hidden gap-1 sm:flex">
              <NavItem to="/admin" active={pathname.startsWith('/admin')}>Admin Panel</NavItem>
              <NavItem to="/map" active={pathname === '/map'}>Graph</NavItem>
            </nav>
          )}
          {user?.role === 'client' && (
            <nav className="hidden gap-1 sm:flex">
              <NavItem to="/dashboard" active={pathname.startsWith('/dashboard') || pathname.startsWith('/reports')}>My Reports</NavItem>
              <NavItem to="/create" active={pathname.startsWith('/create')}>New Report</NavItem>
              <NavItem to="/map" active={pathname === '/map'}>Graph</NavItem>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {!user && (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink hover:text-brand-700">Sign in</Link>
              <Link to="/signup" className="btn-primary px-4 py-2">Get started</Link>
            </>
          )}
          {user && (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-ink">{user.name}</p>
                <p className="text-xs capitalize text-muted">{user.role}{user.company ? ` · ${user.company}` : ''}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-outline px-3 py-2"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Compact theme popover — swatch previews, one-click re-skin.
function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme() || {};
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!themes) return null;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-card hover:text-ink hover:shadow-soft"
        title="Theme"
        aria-label="Switch theme"
      >
        <Palette size={17} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 animate-fade-up rounded-2xl bg-card p-1.5 shadow-float ring-1 ring-ink/10">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-ink/5 ${theme === t.id ? 'bg-ink/5' : ''}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full ring-1 ring-ink/10" style={{ background: t.swatch }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink">{t.name}</span>
                <span className="block text-[11px] text-muted">{t.hint}</span>
              </span>
              {theme === t.id && <Check size={15} className="text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavItem({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-entry ${
        active ? 'bg-card text-brand-700 shadow-soft ring-1 ring-ink/5' : 'text-muted hover:bg-card/60 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
