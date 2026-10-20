import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  Bot,
  PenTool,
  CalendarDays,
  Inbox,
  MessageSquare,
  BarChart3,
  History,
  Plug,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Wordmark } from '../brand/Wordmark';
import { useApp } from '../../context/AppContext';
import { cn, initials } from '../../utils/cn';

const NAV = [
  { label: 'Overview', to: '/', icon: LayoutDashboard, end: true },
  { label: 'AI Command Center', to: '/command', icon: Terminal },
  { label: 'AI Agents', to: '/agents', icon: Bot },
  { label: 'Create Content', to: '/create', icon: PenTool },
  { label: 'Content Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Social Inbox', to: '/inbox', icon: Inbox },
  { label: 'Comments', to: '/comments', icon: MessageSquare },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Activity History', to: '/activity', icon: History },
];

const SYSTEM = [
  { label: 'Integrations', to: '/integrations', icon: Plug },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
  mobile,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { preferences, logout, comments, conversations } = useApp();
  const pendingComments = comments.filter((c) => c.status === 'pending').length;
  const unread = conversations.filter((c) => c.unread).length;
  const badges: Record<string, number | undefined> = {
    '/comments': pendingComments || undefined,
    '/inbox': unread || undefined,
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
      collapsed && !mobile ? 'justify-center px-2' : '',
      isActive ? 'bg-accent text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
    );

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-hairline bg-shell',
        mobile ? 'w-72' : collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-hairline px-3">
        {(!collapsed || mobile) && <Wordmark size="sm" />}
        {collapsed && !mobile && (
          <span className="mx-auto grid h-8 w-8 place-items-center rounded-md bg-accent text-sm font-extrabold text-white">
            V
          </span>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className={cn('px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500', collapsed && !mobile && 'text-center px-0')}>
          {collapsed && !mobile ? 'Go' : 'Workspace'}
        </p>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onNavigate} title={item.label}>
                <Icon size={18} className="shrink-0" />
                {(!collapsed || mobile) && <span className="flex-1 truncate">{item.label}</span>}
                {(!collapsed || mobile) && badges[item.to] && (
                  <span className="rounded-full bg-black/20 px-1.5 text-[10px]">{badges[item.to]}</span>
                )}
              </NavLink>
            );
          })}
        </div>
        <p className={cn('mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500', collapsed && !mobile && 'text-center px-0')}>
          {collapsed && !mobile ? 'Sys' : 'System'}
        </p>
        <div className="space-y-0.5">
          {SYSTEM.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={onNavigate} title={item.label}>
                <Icon size={18} className="shrink-0" />
                {(!collapsed || mobile) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-hairline p-3">
        <div className={cn('flex items-center gap-3', collapsed && !mobile && 'justify-center')}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-bold text-accent">
            {initials(preferences.displayName)}
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{preferences.displayName}</p>
              <p className="truncate text-[11px] text-neutral-500">Demo · {preferences.autonomyMode}</p>
            </div>
          )}
          {(!collapsed || mobile) && (
            <button onClick={logout} className="rounded-md p-1.5 text-neutral-400 hover:text-red-300" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
