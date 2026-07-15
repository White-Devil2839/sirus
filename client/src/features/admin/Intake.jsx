import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Folder, FileAudio, ChevronRight, Inbox, Users, MessageSquareText } from 'lucide-react';
import { api } from '../../lib/api.js';
import { PageShell, Spinner, StatusChip, TierBadge, EmptyState } from '../../components/ui.jsx';

const FILTERS = ['All', 'awaiting', 'in-editing', 'locked', 'dispatched'];
const FILTER_LABEL = { All: 'All', awaiting: 'Awaiting', 'in-editing': 'In editing', locked: 'Locked', dispatched: 'Dispatched' };

export default function Intake() {
  const [filter, setFilter] = useState('All');
  const { data, isLoading } = useQuery({ queryKey: ['admin-requests'], queryFn: async () => (await api.get('/requests')).data.requests });

  const requests = (data || []).filter((r) => r.status !== 'draft');
  const shown = filter === 'All' ? requests : requests.filter((r) => r.status === filter);

  // Group into folders per client.
  const folders = useMemo(() => {
    const map = new Map();
    for (const r of shown) {
      const key = r.client?._id || 'unknown';
      if (!map.has(key)) map.set(key, { client: r.client, items: [] });
      map.get(key).items.push(r);
    }
    return [...map.values()];
  }, [shown]);

  const stats = {
    awaiting: requests.filter((r) => r.status === 'awaiting').length,
    editing: requests.filter((r) => ['in-editing', 'locked'].includes(r.status)).length,
    dispatched: requests.filter((r) => r.status === 'dispatched').length,
  };

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Admin Panel · Client Intake</h1>
        <p className="text-sm text-muted">Every service request, organized by client folder.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Inbox} tone="amber" value={stats.awaiting} label="Awaiting transcription" />
        <StatCard icon={MessageSquareText} tone="sky" value={stats.editing} label="In editing / locked" />
        <StatCard icon={Users} tone="green" value={stats.dispatched} label="Dispatched" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${filter === f ? 'bg-brand-950 text-white' : 'bg-card text-muted ring-1 ring-line/10 hover:text-ink'}`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner label="Loading intake…" className="py-24" />
      ) : folders.length === 0 ? (
        <EmptyState icon={Inbox} title="No requests here">Client requests appear as folders once submitted.</EmptyState>
      ) : (
        <div className="space-y-6">
          {folders.map((folder) => (
            <div key={folder.client?._id || 'x'} className="card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Folder size={20} /></span>
                <div>
                  <p className="font-black text-ink">{folder.client?.company || folder.client?.name || 'Unknown client'}</p>
                  <p className="text-xs text-muted">{folder.client?.name} · {folder.client?.email} · {folder.items.length} request(s)</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {folder.items.map((r) => (
                  <Link key={r._id} to={`/admin/${r._id}`} className="group flex items-center gap-3 rounded-xl border border-line/10 p-4 transition hover:border-brand-200 hover:bg-brand-50/30">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink/10 text-muted"><FileAudio size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">{r.meetingName || 'Untitled meeting'}</p>
                      <p className="truncate text-xs text-muted">{r.compliance} · {r.meetingType} · {new Date(r.meetingDate || r.createdAt).toLocaleDateString()}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <TierBadge tier={r.tier} />
                        <StatusChip status={r.status} />
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted/60 transition group-hover:translate-x-1 group-hover:text-brand-600" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function StatCard({ icon: Icon, tone, value, label }) {
  const tones = { amber: 'bg-amber-50 text-amber-500', sky: 'bg-sky-50 text-sky-500', green: 'bg-emerald-50 text-emerald-500' };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}><Icon size={22} /></span>
      <div>
        <p className="text-2xl font-black text-ink">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
