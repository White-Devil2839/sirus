import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Download, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { PageShell, Spinner, StatusChip, TierBadge, EmptyState } from '../../components/ui.jsx';
import { useAuth } from '../../lib/auth.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: async () => (await api.get('/requests')).data.requests });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/requests/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
    onError: (e) => alert(errMsg(e)),
  });

  const requests = data || [];
  const delivered = requests.filter((r) => r.status === 'dispatched');
  const inProgress = requests.filter((r) => r.status !== 'dispatched');

  return (
    <PageShell>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500">Your meeting reports and requests, all in one place.</p>
        </div>
        <Link to="/create" className="btn-primary px-5 py-3"><Plus size={18} /> New report</Link>
      </div>

      {isLoading ? (
        <Spinner label="Loading your reports…" className="py-24" />
      ) : requests.length === 0 ? (
        <EmptyState icon={FileText} title="No reports yet">
          Create your first report — upload a recording or transcript, preview it instantly, and request the full deliverable.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Delivered reports</h2>
            {delivered.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {delivered.map((r) => (
                  <Link key={r._id} to={`/reports/${r._id}`} className="group card p-5 transition hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-center justify-between">
                      <TierBadge tier={r.tier} />
                      <StatusChip status={r.status} />
                    </div>
                    <p className="mt-4 font-bold text-ink">{r.meetingName}</p>
                    <p className="text-sm text-slate-500">{r.compliance} · {r.meetingType}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600">
                      <Download size={15} /> Open & download <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No delivered reports yet — they appear here once the team dispatches them.</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">In progress</h2>
            {inProgress.length ? (
              <div className="space-y-3">
                {inProgress.map((r) => {
                  const removable = ['draft', 'awaiting'].includes(r.status);
                  return (
                    <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Clock size={18} /></span>
                        <div>
                          <p className="font-bold text-ink">{r.meetingName || 'Untitled meeting'}</p>
                          <p className="text-xs text-slate-500">{r.compliance} · {r.meetingType} · {new Date(r.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TierBadge tier={r.tier} />
                        <StatusChip status={r.status} />
                        {r.status === 'draft' && (
                          <Link to={`/create/${r._id}/upload`} className="btn-ghost px-3 py-1.5 text-xs">Continue</Link>
                        )}
                        {removable && (
                          <button
                            onClick={() => window.confirm(`Delete "${r.meetingName || 'this request'}"?`) && remove.mutate(r._id)}
                            disabled={remove.isPending}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            title="Delete request"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nothing in progress.</p>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
