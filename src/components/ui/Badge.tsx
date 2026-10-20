import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'demo';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
    accent: 'bg-accent-soft text-accent border-accent/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warn: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-300 border-red-500/20',
    demo: 'bg-accent-soft text-accent border-accent/25',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoMark({ className }: { className?: string }) {
  return (
    <Badge tone="demo" className={className}>
      Demo data
    </Badge>
  );
}
