import { Link } from 'react-router-dom';
import { Wordmark } from '../../components/brand/Wordmark';

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  return (
    <div className="light-surface min-h-screen bg-canvas px-6 py-10 text-ink">
      <div className="mx-auto max-w-2xl">
        <Wordmark inverted />
        <h1 className="mt-10 text-3xl font-extrabold">{kind === 'privacy' ? 'Privacy' : 'Terms'}</h1>
        <p className="mt-4 text-sm leading-relaxed text-mute">
          {kind === 'privacy'
            ? 'This demo stores preferences and drafts in your browser only. VYBE does not collect passwords or platform tokens in local storage. When a backend is added, OAuth tokens will be stored server-side.'
            : 'This is a frontend preview. Demo mode does not create a paid account or connect to Instagram or LinkedIn. Do not upload confidential media you would not keep on this device.'}
        </p>
        <Link to="/auth" className="mt-8 inline-block text-sm font-semibold text-accent">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
