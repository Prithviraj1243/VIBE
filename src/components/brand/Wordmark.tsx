import { cn } from '../../utils/cn';

export function Wordmark({
  size = 'md',
  inverted = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
  className?: string;
}) {
  const type = {
    sm: 'text-base tracking-[0.18em]',
    md: 'text-lg tracking-[0.2em]',
    lg: 'text-3xl tracking-[0.22em]',
    xl: 'text-5xl tracking-[0.24em]',
  }[size];
  const mark = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-11 w-11 text-lg',
    xl: 'h-14 w-14 text-xl',
  }[size];

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-md bg-accent font-extrabold text-white',
          mark,
        )}
      >
        V
      </span>
      <span className={cn('font-extrabold', inverted ? 'text-ink' : 'text-white', type)}>VYBE</span>
    </div>
  );
}
