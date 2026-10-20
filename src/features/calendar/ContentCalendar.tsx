import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, DemoMark } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { ContentDraft, ContentStatus } from '../../types';
import { useToast } from '../../components/feedback/ToastProvider';

const STATUS: ContentStatus[] = ['draft', 'scheduled', 'published', 'failed', 'needs_review', 'awaiting_approval', 'queued'];

export function ContentCalendar() {
  const { drafts, updateDraft } = useApp();
  const toast = useToast();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(new Date(2026, 9, 1));
  const [open, setOpen] = useState<ContentDraft | null>(null);
  const [edit, setEdit] = useState('');

  const days = useMemo(() => buildDays(cursor, view), [cursor, view]);

  const itemsOn = (day: Date) =>
    drafts.filter((d) => {
      const t = d.scheduledTime ? new Date(d.scheduledTime) : new Date(d.createdAt);
      return t.getFullYear() === day.getFullYear() && t.getMonth() === day.getMonth() && t.getDate() === day.getDate();
    });

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-sm text-neutral-400">Local schedule. Publishing still depends on a connected backend.</p>
        </div>
        <div className="flex items-center gap-2">
          <DemoMark />
          <Button variant={view === 'month' ? 'primary' : 'secondary'} onClick={() => setView('month')}>
            Month
          </Button>
          <Button variant={view === 'week' ? 'primary' : 'secondary'} onClick={() => setView('week')}>
            Week
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="text-sm text-neutral-400" onClick={() => setCursor(addDays(cursor, view === 'week' ? -7 : -30))}>
          Previous
        </button>
        <p className="font-semibold">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <button className="text-sm text-neutral-400" onClick={() => setCursor(addDays(cursor, view === 'week' ? 7 : 30))}>
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-wider text-neutral-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const items = itemsOn(day);
          const muted = day.getMonth() !== cursor.getMonth() && view === 'month';
          return (
            <div key={day.toISOString()} className={`min-h-[110px] rounded-xl border border-hairline bg-raised p-2 ${muted ? 'opacity-40' : ''}`}>
              <p className="text-xs text-neutral-500">{day.getDate()}</p>
              <div className="mt-1 space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpen(item);
                      setEdit(item.instagram.caption || item.linkedin.caption);
                    }}
                    className="block w-full truncate rounded bg-panel px-1.5 py-1 text-left text-[11px] hover:bg-[#2a2a2a]"
                  >
                    <span className="text-accent">{item.platforms.join('+')}</span> {item.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(open)}
        title={open?.title ?? 'Post'}
        onClose={() => setOpen(null)}
        footer={
          open && (
            <>
              <Button variant="secondary" onClick={() => setOpen(null)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  updateDraft(open.id, { status: 'draft', scheduledTime: undefined });
                  toast.push({ tone: 'info', title: 'Moved to drafts' });
                  setOpen(null);
                }}
              >
                Move to drafts
              </Button>
              <Button
                onClick={() => {
                  const next = prompt('Schedule time (ISO)', open.scheduledTime ?? new Date().toISOString());
                  if (!next) return;
                  const clash = drafts.some(
                    (d) => d.id !== open.id && d.scheduledTime === next && d.platforms.some((p) => open.platforms.includes(p)),
                  );
                  if (clash) {
                    toast.push({ tone: 'warn', title: 'Duplicate slot', detail: 'That time is already used for the same platform.' });
                    return;
                  }
                  updateDraft(open.id, {
                    scheduledTime: next,
                    status: 'scheduled',
                    instagram: { ...open.instagram, caption: edit },
                  });
                  toast.push({ tone: 'success', title: 'Local schedule updated' });
                  setOpen(null);
                }}
              >
                Save
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              Status: {open.status} · {open.platforms.join(', ')}
            </p>
            <textarea className="h-40 w-full rounded-lg border border-hairline bg-[#141414] p-3 text-sm" value={edit} onChange={(e) => setEdit(e.target.value)} />
            <p className="text-xs text-neutral-500">Changing the time only updates this local calendar. The backend scheduler is not connected.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function buildDays(cursor: Date, view: 'month' | 'week') {
  if (view === 'week') {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  start.setDate(1 - start.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
