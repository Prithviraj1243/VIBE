import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DemoMark } from '../../components/ui/Badge';
import { WorkflowStatusBadge } from '../../components/feedback/StatusBadge';
import type { WorkflowStatus } from '../../types';

const STATUSES: WorkflowStatus[] = ['draft', 'queued', 'running', 'awaiting_approval', 'succeeded', 'failed', 'cancelled'];

export function ActivityHistory() {
  const { activity } = useApp();
  const [params] = useSearchParams();
  const [agent, setAgent] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState<string>(params.get('status') ?? 'all');
  const [open, setOpen] = useState<string | null>(null);

  const agents = Array.from(new Set(activity.map((a) => a.agent)));
  const rows = useMemo(
    () =>
      activity.filter((a) => {
        const okA = agent === 'all' || a.agent === agent;
        const okP = platform === 'all' || a.platform === platform;
        const okS = status === 'all' || a.status === status;
        return okA && okP && okS;
      }),
    [activity, agent, platform, status],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity History</h1>
          <p className="text-sm text-neutral-400">A successful local plan is not a published post.</p>
        </div>
        <DemoMark />
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={agent} onChange={(e) => setAgent(e.target.value)} className="rounded-lg border border-hairline bg-panel px-3 py-2 text-sm">
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-lg border border-hairline bg-panel px-3 py-2 text-sm">
          <option value="all">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="both">Both</option>
          <option value="system">System</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-hairline bg-panel px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.id}
            onClick={() => setOpen(open === row.id ? null : row.id)}
            className="surface w-full p-4 text-left"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{row.taskName}</p>
                <p className="text-xs text-neutral-500">
                  {row.agent} · {row.platform} · {new Date(row.startedAt).toLocaleString()}
                </p>
              </div>
              <WorkflowStatusBadge status={row.status} />
            </div>
            {open === row.id && (
              <div className="mt-3 space-y-1 text-sm text-neutral-300">
                <p>
                  <span className="text-neutral-500">Command: </span>
                  {row.triggerCommand}
                </p>
                <p>
                  <span className="text-neutral-500">Steps: </span>
                  {row.stepsCompleted}/{row.stepsTotal}
                </p>
                <p>{row.details}</p>
                {row.error && <p className="text-red-300">{row.error}</p>}
                {row.completedAt && (
                  <p className="text-xs text-neutral-500">Completed {new Date(row.completedAt).toLocaleString()}</p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
