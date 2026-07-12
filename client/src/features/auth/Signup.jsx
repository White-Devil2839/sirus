import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { errMsg } from '../../lib/api.js';
import { AuthShell } from './AuthShell.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signup(form);
      navigate('/create', { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Sign up failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Registration unlocks upload, live preview, and reports.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Full name</label>
            <input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Camille Durand" />
          </div>
          <div>
            <label className="field-label">Company</label>
            <input className="field-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="CSE Rockefeller" />
          </div>
        </div>
        <div>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="field-input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full py-3.5" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
