import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/60" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg rounded-xl border border-hairline bg-shell shadow-card"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <h2 id="modal-title" className="text-sm font-semibold text-white">
            {title}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-neutral-300">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
