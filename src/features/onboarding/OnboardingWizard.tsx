import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Instagram, Linkedin } from 'lucide-react';
import { Wordmark } from '../../components/brand/Wordmark';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import type { CaptionLength, HashtagPreference, WritingStyle } from '../../types';

export function OnboardingWizard() {
  const { preferences, completeOnboarding, skipOnboarding, socialAccounts, toggleAccount } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: preferences.displayName,
    writingStyle: preferences.writingStyle,
    language: preferences.language,
    captionLength: preferences.captionLength,
    emojiUsage: preferences.emojiUsage,
    hashtagDensity: preferences.hashtagDensity,
  });

  const styles: { id: WritingStyle; label: string }[] = [
    { id: 'casual', label: 'Casual' },
    { id: 'professional', label: 'Professional' },
    { id: 'bold', label: 'Bold' },
    { id: 'educational', label: 'Educational' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#141414] px-6 py-8 text-white">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between">
        <Wordmark size="sm" />
        <button onClick={skipOnboarding} className="text-sm text-neutral-400 hover:text-white">
          Skip for now
        </button>
      </header>

      <div className="mx-auto mt-8 flex gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1 rounded-full ${step === s ? 'w-8 bg-accent' : step > s ? 'w-5 bg-neutral-500' : 'w-3 bg-neutral-800'}`} />
        ))}
      </div>

      <main className="mx-auto my-auto w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Card key="1" kicker="Step 1 of 4" title="Let's make VYBE yours.">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Preferred display name</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="mt-2 w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2.5 text-white"
              />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!form.displayName.trim()}>
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          )}
          {step === 2 && (
            <Card key="2" kicker="Step 2 of 4" title="Personal style">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Writing style</p>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, writingStyle: s.id })}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${form.writingStyle === s.id ? 'border-accent bg-accent/10' : 'border-hairline bg-[#141414] text-neutral-400'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Language">
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2 text-sm"
                  >
                    <option>English</option>
                    <option>Hinglish</option>
                    <option>Spanish</option>
                  </select>
                </Field>
                <Field label="Caption length">
                  <select
                    value={form.captionLength}
                    onChange={(e) => setForm({ ...form, captionLength: e.target.value as CaptionLength })}
                    className="w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2 text-sm"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Toggle on={form.emojiUsage} onClick={() => setForm({ ...form, emojiUsage: !form.emojiUsage })}>
                  Emoji {form.emojiUsage ? 'on' : 'off'}
                </Toggle>
                {(['minimal', 'moderate', 'high'] as HashtagPreference[]).map((h) => (
                  <Toggle key={h} on={form.hashtagDensity === h} onClick={() => setForm({ ...form, hashtagDensity: h })}>
                    Hashtags · {h}
                  </Toggle>
                ))}
              </div>
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </Card>
          )}
          {step === 3 && (
            <Card key="3" kicker="Step 3 of 4" title="Social accounts">
              <p className="mb-4 text-sm text-neutral-400">
                These cards are mock connection states. Connecting here does not authorize Instagram or LinkedIn.
              </p>
              {socialAccounts.map((account) => (
                <div key={account.id} className="mb-3 flex items-center justify-between rounded-xl border border-hairline bg-[#141414] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5">
                      {account.platform === 'instagram' ? <Instagram size={18} /> : <Linkedin size={18} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold capitalize">{account.platform}</p>
                      <p className="text-xs text-neutral-500">
                        {account.platform === 'instagram'
                          ? 'Captions, comments, and publishing payloads'
                          : 'Posts and limited inbox samples'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={account.status === 'not_connected' ? 'neutral' : 'demo'}>
                      {account.status === 'not_connected' ? 'Not connected' : 'Demo'}
                    </Badge>
                    <Button variant="secondary" onClick={() => toggleAccount(account.id)}>
                      {account.status === 'not_connected' ? 'Connect (demo)' : 'Disconnect'}
                    </Button>
                  </div>
                </div>
              ))}
              <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} />
            </Card>
          )}
          {step === 4 && (
            <Card key="4" kicker="Step 4 of 4" title="You are set.">
              <dl className="space-y-2 text-sm">
                <Row k="Name" v={form.displayName} />
                <Row k="Style" v={form.writingStyle} />
                <Row k="Language" v={form.language} />
                <Row k="Length" v={form.captionLength} />
                <Row k="Emoji" v={form.emojiUsage ? 'Yes' : 'No'} />
                <Row k="Hashtags" v={form.hashtagDensity} />
              </dl>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(3)} className="text-sm text-neutral-400">
                  Back
                </button>
                <Button onClick={() => completeOnboarding(form)}>Save and enter VYBE</Button>
              </div>
            </Card>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Card({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-xl border border-hairline bg-raised p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{kicker}</p>
      <h2 className="mt-1 text-2xl font-bold">{title}</h2>
      <div className="mt-6">{children}</div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? 'border-accent bg-accent/10 text-white' : 'border-hairline text-neutral-400'}`}>
      {children}
    </button>
  );
}

function Nav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-6 flex justify-between">
      <button onClick={onBack} className="text-sm text-neutral-400">
        Back
      </button>
      <Button onClick={onNext}>
        Continue <ArrowRight size={16} />
      </Button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-hairline py-2">
      <dt className="text-neutral-500">{k}</dt>
      <dd className="font-medium capitalize">{v}</dd>
    </div>
  );
}
