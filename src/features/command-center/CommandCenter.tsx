import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Paperclip, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge, DemoMark } from '../../components/ui/Badge';
import { WorkflowStatusBadge } from '../../components/feedback/StatusBadge';
import type { CommandPlan } from '../../types';
import { useToast } from '../../components/feedback/ToastProvider';

type Chat =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'vybe'; text: string; plan?: CommandPlan; phase: string };

const SUGGESTIONS = [
  'Create captions for my latest reel.',
  'Prepare a LinkedIn post from this video.',
  'Review my latest comments.',
  "Plan my next week's content.",
  'Show failed workflows.',
];

export function CommandCenter() {
  const { runCommand, activity } = useApp();
  const toast = useToast();
  const [params] = useSearchParams();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'understanding' | 'planning' | 'running' | 'complete' | 'failed'>('idle');
  const [messages, setMessages] = useState<Chat[]>([
    {
      id: 'w',
      role: 'vybe',
      phase: 'idle',
      text: 'This is the mock command processor. I can map a few intents to a task plan. I will not claim a live model or a social API ran.',
    },
  ]);
  const [active, setActive] = useState<CommandPlan | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = params.get('prompt');
    if (p) setInput(p);
  }, [params]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const submit = async (text?: string) => {
    const command = (text ?? input).trim();
    if (!command || busy) return;
    setInput('');
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: command }]);
    setBusy(true);
    setPhase('understanding');
    await wait(280);
    setPhase('planning');
    try {
      const plan = await runCommand(command);
      setPhase(plan.steps.some((s) => s.status === 'failed') ? 'failed' : 'complete');
      setActive(plan);
      setMessages((m) => [
        ...m,
        {
          id: `v${Date.now()}`,
          role: 'vybe',
          phase: 'complete',
          text: plan.summary,
          plan,
        },
      ]);
    } catch {
      setPhase('failed');
      toast.push({ tone: 'danger', title: 'Command failed', detail: 'Mock processor threw an error.' });
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_280px]">
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">AI Command Center</h1>
            <p className="text-sm text-neutral-400">Natural language in. Structured tasks out. Mock processor in this build.</p>
          </div>
          <DemoMark />
        </div>

        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <Badge tone={phase === 'understanding' ? 'accent' : 'neutral'}>Understanding</Badge>
          <Badge tone={phase === 'planning' ? 'accent' : 'neutral'}>Planning</Badge>
          <Badge tone={phase === 'running' ? 'warn' : 'neutral'}>Running</Badge>
          <Badge tone={phase === 'complete' ? 'success' : 'neutral'}>Complete</Badge>
          <Badge tone={phase === 'failed' ? 'danger' : 'neutral'}>Failed</Badge>
        </div>

        <div ref={scroller} className="surface flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-accent text-white' : 'bg-panel text-neutral-200'}`}>
                <p>{m.text}</p>
                {m.role === 'vybe' && m.plan && (
                  <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                    {m.plan.steps.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                        <span>
                          <strong>{s.agent}</strong> · {s.action}
                        </span>
                        <WorkflowStatusBadge status={s.status} />
                      </li>
                    ))}
                    {m.plan.href && (
                      <Link to={m.plan.href} className="mt-2 inline-block text-xs font-semibold text-accent">
                        Open related workspace
                      </Link>
                    )}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {busy && <p className="text-xs text-neutral-500">Mock processor · {phase}…</p>}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => submit(s)} className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-neutral-300 hover:text-white">
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-3 flex items-end gap-2 rounded-xl border border-hairline bg-raised p-2">
          <button type="button" className="p-2 text-neutral-500" title="Attachments stay local" onClick={() => toast.push({ tone: 'info', title: 'Local attachment only', detail: 'No remote storage is connected.' })}>
            <Paperclip size={16} />
          </button>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="Describe the work. Shift+Enter for a new line."
            className="flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <Button type="submit" disabled={!input.trim() || busy}>
            <Send size={15} />
          </Button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="surface p-4">
          <h2 className="text-sm font-semibold">Current workflow</h2>
          {!active && <p className="mt-2 text-xs text-neutral-500">No plan yet.</p>}
          {active && (
            <div className="mt-3 space-y-2 text-xs text-neutral-300">
              <p className="font-medium text-white">{active.title}</p>
              <p>{active.summary}</p>
              <p className="text-accent">Source: mock command processor</p>
            </div>
          )}
        </div>
        <div className="surface p-4">
          <h2 className="text-sm font-semibold">Recent workflows</h2>
          <ul className="mt-3 space-y-2">
            {activity.slice(0, 5).map((a) => (
              <li key={a.id} className="text-xs text-neutral-400">
                <p className="text-neutral-200">{a.taskName}</p>
                <WorkflowStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
