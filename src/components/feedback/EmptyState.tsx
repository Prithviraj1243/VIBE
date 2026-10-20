import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-hairline bg-raised px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">{body}</p>
      {action && (
        <Link to={action.to} className="mt-4 inline-block">
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
