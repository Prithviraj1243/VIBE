import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover disabled:opacity-40',
    secondary: 'bg-panel text-white border border-hairline hover:bg-[#2a2a2a]',
    ghost: 'bg-transparent text-neutral-300 hover:bg-white/5',
    danger: 'bg-danger/15 text-red-300 border border-danger/30 hover:bg-danger/25',
    light: 'bg-ink text-white hover:bg-black',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
