import { Link } from 'react-router-dom';
import { ArrowRight, PenLine, MessageCircle, LineChart, ShieldCheck } from 'lucide-react';
import { Wordmark } from '../../components/brand/Wordmark';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/feedback/ToastProvider';

export function AuthPage() {
  const { loginAsDemo } = useApp();
  const toast = useToast();

  return (
    <div className="light-surface min-h-screen bg-canvas text-ink md:grid md:grid-cols-2">
      <section className="flex flex-col justify-between border-b border-line bg-white px-8 py-10 md:border-b-0 md:border-r md:px-16 md:py-14">
        <Wordmark inverted />
        <div className="max-w-lg py-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Personal AI command center</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Your online presence, working with you.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mute">
            VYBE turns a natural-language command into a plan for captions, replies, and publishing — then waits for your approval before anything leaves this app.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              { icon: PenLine, title: 'Create', body: 'Platform-specific captions that follow the voice you save.' },
              { icon: MessageCircle, title: 'Engage', body: 'Triage comments and messages you actually have access to.' },
              { icon: LineChart, title: 'Grow', body: 'Read the numbers you have, not invented dashboards.' },
            ].map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-canvas text-accent">
                  <item.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-mute">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-mute">VYBE · Demo workspace. Official APIs are not connected yet.</p>
      </section>

      <section className="grid place-items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-extrabold">Welcome to VYBE</h2>
          <p className="mt-1 text-sm text-mute">Your personal AI command center.</p>

          <Button
            className="mt-8 w-full"
            onClick={() => {
              loginAsDemo();
              toast.push({ tone: 'info', title: 'Demo session started', detail: 'You are using mock data. No Google account was used.' });
            }}
          >
            Continue in demo mode <ArrowRight size={16} />
          </Button>

          <button
            type="button"
            onClick={() =>
              toast.push({
                tone: 'warn',
                title: 'Google sign-in is not connected',
                detail: 'AuthService.signInWithGoogle() is reserved for Firebase or another provider.',
              })
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm font-semibold text-ink"
          >
            Continue with Google
          </button>
          <p className="mt-2 text-center text-[11px] text-mute">
            Google OAuth is not live. This button does not authenticate an account.
          </p>

          <div className="mt-6 flex gap-2 rounded-xl border border-line bg-canvas p-3 text-xs text-mute">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
            Connected social accounts are authorized separately. Tokens are never stored in this browser build.
          </div>

          <p className="mt-6 text-center text-xs text-mute">
            By continuing you agree to the{' '}
            <Link to="/legal/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="underline">
              Privacy
            </Link>{' '}
            notes.
          </p>
        </div>
      </section>
    </div>
  );
}
