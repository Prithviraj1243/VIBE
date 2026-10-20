import { Badge } from '../ui/Badge';
import type { ConnectionStatus, WorkflowStatus } from '../../types';

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  const map = {
    draft: { tone: 'neutral' as const, label: 'Draft' },
    queued: { tone: 'warn' as const, label: 'Queued' },
    running: { tone: 'accent' as const, label: 'Running' },
    awaiting_approval: { tone: 'warn' as const, label: 'Awaiting approval' },
    succeeded: { tone: 'success' as const, label: 'Succeeded' },
    failed: { tone: 'danger' as const, label: 'Failed' },
    cancelled: { tone: 'neutral' as const, label: 'Cancelled' },
  };
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const map = {
    demo_connection: { tone: 'demo' as const, label: 'Demo connection' },
    connected: { tone: 'success' as const, label: 'Connected' },
    needs_attention: { tone: 'warn' as const, label: 'Needs attention' },
    not_connected: { tone: 'neutral' as const, label: 'Not connected' },
  };
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
