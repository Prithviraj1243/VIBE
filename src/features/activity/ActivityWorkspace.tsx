import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const ActivityWorkspace: React.FC = () => {
  const { activityLogs } = useApp();
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const filtered = activityLogs.filter(log => {
    if (filterAgent === 'all') return true;
    return log.agent === filterAgent;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Activity & Execution History
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Auditable log of commands, sub-agent tasks, external dispatches, and verification records.
          </p>
        </div>

        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">All Responsible Agents</option>
          <option value="Content Engine">Content Engine</option>
          <option value="Publishing Dispatcher">Publishing Dispatcher</option>
          <option value="Engagement Partner">Engagement Partner</option>
          <option value="Inbox Assistant">Inbox Assistant</option>
          <option value="Growth Analyst">Growth Analyst</option>
          <option value="Workflow Orchestrator">Workflow Orchestrator</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(log => (
          <div
            key={log.id}
            className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{log.taskName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                  {log.agent}
                </span>
                <span className="text-[10px] text-neutral-400">• {log.startedAt}</span>
              </div>
              <p className="text-xs text-neutral-300">
                Triggered by: <span className="text-neutral-400 italic">"{log.triggerCommand}"</span>
              </p>
              <p className="text-[11px] text-neutral-400">{log.details}</p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                log.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                log.status === 'awaiting_approval' ? 'bg-orange-500/10 text-[#F28C45] border border-orange-500/20' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {log.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
