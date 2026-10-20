import { Bell, Menu, Plus, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { useState } from 'react';

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { comments, conversations, activity } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openNotices, setOpenNotices] = useState(false);
  const notices = [
    ...comments.filter((c) => c.status === 'pending').slice(0, 2).map((c) => ({ id: c.id, text: `Reply waiting · ${c.author}`, to: '/comments' })),
    ...conversations.filter((c) => c.unread).map((c) => ({ id: c.id, text: `Unread · ${c.sender}`, to: '/inbox' })),
    ...activity.filter((a) => a.status === 'failed').slice(0, 1).map((a) => ({ id: a.id, text: a.taskName, to: '/activity' })),
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-shell/95 px-4 backdrop-blur">
      <button className="rounded-md p-2 text-neutral-400 hover:bg-white/5 lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu size={18} />
      </button>

      <form
        className="relative hidden min-w-0 flex-1 md:block md:max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) navigate(`/command?prompt=${encodeURIComponent(query.trim())}`);
        }}
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask VYBE or search a workflow"
          className="w-full rounded-lg border border-hairline bg-panel py-2 pl-9 pr-12 text-sm text-white placeholder:text-neutral-500"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link to="/create">
          <Button className="h-9">
            <Plus size={15} />
            <span className="hidden sm:inline">Create a post</span>
          </Button>
        </Link>
        <Link to="/command" className="hidden sm:inline-flex">
          <Button variant="secondary" className="h-9">
            <Sparkles size={14} className="text-accent" />
            Run a workflow
          </Button>
        </Link>
        <div className="relative">
          <button
            className="relative rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
            onClick={() => setOpenNotices((v) => !v)}
          >
            <Bell size={17} />
            {notices.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
          </button>
          {openNotices && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-hairline bg-panel p-2 shadow-card">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Needs attention</p>
              {notices.length === 0 && <p className="px-2 py-3 text-sm text-neutral-400">Nothing waiting.</p>}
              {notices.map((n) => (
                <Link
                  key={n.id}
                  to={n.to}
                  onClick={() => setOpenNotices(false)}
                  className="block rounded-lg px-2 py-2 text-sm text-neutral-200 hover:bg-white/5"
                >
                  {n.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
