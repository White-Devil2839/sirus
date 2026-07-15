import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { errMsg } from '../../lib/api.js';
import { AuthShell } from './AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  }

  const fill = (email) => setForm({ email, password: 'password123' });

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your SIRUS workspace.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="field-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full py-3.5" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-4 text-sm">
        <p className="font-semibold text-brand-800">Demo accounts (password: password123)</p>
        <div className="mt-2 flex flex-col gap-1.5">
          <button onClick={() => fill('client@sirus.app')} className="text-left text-brand-700 hover:underline">→ client@sirus.app (client journey)</button>
          <button onClick={() => fill('admin@sirus.app')} className="text-left text-brand-700 hover:underline">→ admin@sirus.app (admin panel)</button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        No account? <Link to="/signup" className="font-semibold text-brand-700 hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}
