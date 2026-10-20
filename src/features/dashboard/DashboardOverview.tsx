import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Instagram,
  Linkedin,
  PenTool,
  Sparkles,
  MessageSquare,
  Inbox,
  CalendarDays,
  Terminal,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { DemoMark } from '../../components/ui/Badge';
import { ConnectionBadge, WorkflowStatusBadge } from '../../components/feedback/StatusBadge';
import { greetingFor, formatDate } from '../../utils/cn';

export function DashboardOverview() {
  const { preferences, socialAccounts, drafts, activity, comments, conversations, analytics } = useApp();
  const pending = comments.filter((c) => c.status === 'pending').length;
  const tasks = [
    ...drafts.filter((d) => d.status === 'needs_review').map((d) => ({ id: d.id, title: `Approve caption · ${d.title}`, to: '/create' })),
    ...comments.filter((c) => c.status === 'pending').slice(0, 2).map((c) => ({ id: c.id, title: `Review reply · ${c.author}`, to: '/comments' })),
    ...socialAccounts.filter((a) => a.status === 'needs_attention').map((a) => ({ id: a.id, title: `Reconnect ${a.platform}`, to: '/integrations' })),
    ...drafts.filter((d) => d.status === 'failed').map((d) => ({ id: d.id, title: `Failed publish · ${d.title}`, to: '/activity' })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label-kicker">{formatDate(new Date())}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {greetingFor()}, {preferences.displayName.split(' ')[0]}.
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Here's what's happening with your online presence.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/create">
            <Button>Create a post</Button>
          </Link>
          <Link to="/command">
            <Button variant="secondary">Run an AI workflow</Button>
          </Link>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Connected accounts</h2>
          <DemoMark />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {socialAccounts.map((account) => (
            <div key={account.id} className="surface flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/5">
                  {account.platform === 'instagram' ? <Instagram size={20} /> : <Linkedin size={20} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold capitalize">{account.platform}</p>
                    <ConnectionBadge status={account.status} />
                  </div>
                  <p className="text-sm text-neutral-400">{account.handle}</p>
                  <p className="text-xs text-neutral-500">{account.lastSynced}</p>
                </div>
              </div>
              <Link to="/integrations" className="text-sm font-semibold text-accent">
                Manage
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold">Performance overview</h2>
          <DemoMark />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Posts published', analytics.postsPublished, 'Sample period'],
            ['Engagement', analytics.engagement, 'Comments + reactions (demo)'],
            ['Pending content', drafts.filter((d) => d.status === 'draft' || d.status === 'needs_review').length, 'Local drafts'],
            ['Unanswered', pending + conversations.filter((c) => !c.handled).length, 'Demo comments & messages'],
          ].map(([label, value, hint]) => (
            <div key={String(label)} className="surface p-4">
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="mt-2 text-2xl font-extrabold">{value}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>
            </div>
          ))}
        </div>
        <div className="surface mt-4 h-56 p-4">
          <p className="mb-2 text-xs text-neutral-500">Engagement over time · sample</p>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={analytics.series}>
              <XAxis dataKey="date" tick={{ fill: '#77756F', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#77756F', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#222', border: '1px solid #2C2C2C', borderRadius: 8 }} />
              <Area type="monotone" dataKey="instagram" stroke="#F28C45" fill="rgba(242,140,69,0.18)" />
              <Area type="monotone" dataKey="linkedin" stroke="#8ea4c8" fill="rgba(142,164,200,0.12)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Today's tasks</h2>
            <span className="text-xs text-neutral-500">{tasks.length} need you</span>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <Link key={t.id} to={t.to} className="flex items-center justify-between rounded-lg bg-panel px-3 py-3 text-sm hover:bg-[#2a2a2a]">
                {t.title}
                <ChevronRight size={14} className="text-neutral-500" />
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
                { to: '/create', icon: PenTool, label: 'Create a post' },
                { to: '/create', icon: Sparkles, label: 'Generate captions' },
                { to: '/comments', icon: MessageSquare, label: 'Review comments' },
                { to: '/inbox', icon: Inbox, label: 'Draft message replies' },
                { to: '/calendar', icon: CalendarDays, label: 'Plan content' },
                { to: '/command', icon: Terminal, label: 'Open Command Center' },
              ].map((a) => (
                <Link key={a.label} to={a.to} className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm text-neutral-300 hover:text-white">
                  <a.icon size={15} className="text-accent" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">AI agent activity</h2>
            <Link to="/activity" className="text-xs text-accent">
              History
            </Link>
          </div>
          <ol className="space-y-4">
            {activity.slice(0, 5).map((item) => (
              <li key={item.id} className="border-l border-hairline pl-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.taskName}</p>
                  <WorkflowStatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-neutral-500">{item.details}</p>
                <Link to="/activity" className="mt-1 inline-block text-xs text-accent">
                  Open details
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
