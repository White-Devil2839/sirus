import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';

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
                <a key={href} href={href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 ease-entry hover:bg-white/60 hover:text-ink">
                  {label}
                </a>
              ))}
            </nav>
          )}
          {user?.role === 'admin' && (
            <nav className="hidden gap-1 sm:flex">
              <NavItem to="/admin" active={pathname.startsWith('/admin')}>Admin Panel</NavItem>
            </nav>
          )}
          {user?.role === 'client' && (
            <nav className="hidden gap-1 sm:flex">
              <NavItem to="/dashboard" active={pathname.startsWith('/dashboard') || pathname.startsWith('/reports')}>My Reports</NavItem>
              <NavItem to="/create" active={pathname.startsWith('/create')}>New Report</NavItem>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
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
                <p className="text-xs capitalize text-slate-500">{user.role}{user.company ? ` · ${user.company}` : ''}</p>
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

function NavItem({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-entry ${
        active ? 'bg-white text-brand-700 shadow-soft ring-1 ring-ink/5' : 'text-slate-600 hover:bg-white/60 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
