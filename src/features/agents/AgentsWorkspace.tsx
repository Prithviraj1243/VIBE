import { useState } from 'react';
import { Cpu, Mail, MessageSquare, Play, Send, Sliders, Sparkles, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { WorkflowStatusBadge } from '../../components/feedback/StatusBadge';
import { useToast } from '../../components/feedback/ToastProvider';
import type { Agent } from '../../types';

const ICONS: Record<string, typeof Sparkles> = {
  Sparkles,
  Send,
  MessageSquare,
  Mail,
  TrendingUp,
  Cpu,
};

export function AgentsWorkspace() {
  const { agents, preferences } = useApp();
  const toast = useToast();
  const [selected, setSelected] = useState<Agent | null>(null);
  const [mode, setMode] = useState<'configure' | 'test' | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Agents</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-400">
          Six modular capabilities coordinated by one orchestrator. They do not each require a separate model call for every task.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            enabled={preferences.enabledAgents.includes(agent.id)}
            onConfigure={() => {
              setSelected(agent);
              setMode('configure');
            }}
            onTest={() => {
              setSelected(agent);
              setMode('test');
            }}
          />
        ))}
      </div>

      <Modal
        open={Boolean(selected && mode)}
        title={mode === 'test' ? `Test · ${selected?.name}` : `Configure · ${selected?.name}`}
        onClose={() => setSelected(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast.push({
                  tone: 'info',
                  title: mode === 'test' ? 'Test run logged locally' : 'Preferences saved locally',
                  detail: 'No remote agent runtime is connected.',
                });
                setSelected(null);
              }}
            >
              {mode === 'test' ? 'Run mock test' : 'Save'}
            </Button>
          </>
        }
      >
        {selected && mode === 'configure' && (
          <p>
            {selected.name} follows your {preferences.autonomyMode} mode. Enabled agents can prepare work. External actions still require the matching permission in Settings.
          </p>
        )}
        {selected && mode === 'test' && (
          <p>
            A mock test will record a local activity item for {selected.name}. It will not call a model or a social API.
          </p>
        )}
      </Modal>
    </div>
  );
}

function AgentCard({
  agent,
  enabled,
  onConfigure,
  onTest,
}: {
  agent: Agent;
  enabled: boolean;
  onConfigure: () => void;
  onTest: () => void;
}) {
  const Icon = ICONS[agent.avatarIcon] ?? Cpu;
  const statusTone =
    agent.status === 'active' ? 'success' : agent.status === 'needs_approval' ? 'warn' : agent.status === 'unavailable' ? 'danger' : 'neutral';
  const statusLabel =
    agent.status === 'needs_approval' ? 'Needs approval' : agent.status[0].toUpperCase() + agent.status.slice(1);

  return (
    <article className="surface flex flex-col p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-panel text-accent">
          <Icon size={18} />
        </span>
        <div className="flex gap-1">
          <Badge tone={statusTone}>{statusLabel}</Badge>
          {!enabled && <Badge>Disabled</Badge>}
        </div>
      </div>
      <h2 className="mt-4 text-lg font-semibold">{agent.name}</h2>
      <p className="text-xs text-accent">{agent.role}</p>
      <p className="mt-2 flex-1 text-sm text-neutral-400">{agent.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.capabilities.map((c) => (
          <span key={c} className="rounded-md bg-panel px-2 py-1 text-[11px] text-neutral-300">
            {c}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
        <p>Recent runs</p>
        {agent.recentRuns.map((r) => (
          <div key={r.id} className="flex items-center justify-between">
            <span>{r.label}</span>
            <WorkflowStatusBadge status={r.status} />
          </div>
        ))}
        <p className="pt-1">Awaiting approval: {agent.pendingApprovals}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onConfigure}>
          <Sliders size={14} /> Configure
        </Button>
        <Button variant="secondary" onClick={onTest} aria-label={`Test ${agent.name}`}>
          <Play size={14} /> Test
        </Button>
      </div>
    </article>
  );
}
