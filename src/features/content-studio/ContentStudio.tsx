import { useMemo, useState } from 'react';
import { Copy, Instagram, Linkedin, Save, Send, Sparkles, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { captionService } from '../../services/ai/captionService';
import { Button } from '../../components/ui/Button';
import { Badge, DemoMark } from '../../components/ui/Badge';
import { useToast } from '../../components/feedback/ToastProvider';
import type { Platform, PlatformCopy, WritingStyle } from '../../types';

const emptyCopy = (): PlatformCopy => ({ hook: '', caption: '', hashtags: [], cta: '' });
const IG_LIMIT = 2200;
const LI_LIMIT = 3000;

export function ContentStudio() {
  const { preferences, addDraft, requestPublish } = useApp();
  const toast = useToast();
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState<WritingStyle>(preferences.writingStyle);
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram', 'linkedin']);
  const [ig, setIg] = useState<PlatformCopy>(emptyCopy());
  const [li, setLi] = useState<PlatformCopy>(emptyCopy());
  const [media, setMedia] = useState<{ url: string; name: string; type: 'image' | 'video' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (p: Platform) => {
    setPlatforms((cur) => (cur.includes(p) ? (cur.length > 1 ? cur.filter((x) => x !== p) : cur) : [...cur, p]));
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const okType = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!okType) {
      setError('Use an image or video file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Keep files under 25 MB in this demo upload.');
      return;
    }
    setError(null);
    setMedia({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image',
    });
  };

  const generate = async () => {
    if (!brief.trim()) {
      setError('Add a topic or brief first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (platforms.includes('instagram')) setIg(await captionService.generate({ topic: brief, platform: 'instagram', preferences, tone }));
      if (platforms.includes('linkedin')) setLi(await captionService.generate({ topic: brief, platform: 'linkedin', preferences, tone }));
      toast.push({ tone: 'success', title: 'Mock captions ready', detail: 'Generated locally. No model API was called.' });
    } finally {
      setBusy(false);
    }
  };

  const save = (status: 'draft' | 'awaiting_approval' | 'scheduled') => {
    addDraft({
      title: brief.slice(0, 72) || 'Untitled draft',
      brief,
      mediaUrl: media?.url,
      mediaName: media?.name,
      mediaType: media?.type,
      mediaSource: media ? 'local' : 'none',
      platforms,
      instagram: ig,
      linkedin: li,
      status,
      scheduledTime: status === 'scheduled' ? new Date(Date.now() + 3600_000).toISOString() : undefined,
      tone,
    });
    toast.push({
      tone: 'success',
      title: status === 'draft' ? 'Draft saved locally' : status === 'scheduled' ? 'Queued on the local calendar' : 'Submitted for approval',
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Create Content</h1>
          <p className="text-sm text-neutral-400">Separate Instagram and LinkedIn variants. Uploads stay in this browser.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DemoMark />
          <Button variant="secondary" onClick={() => save('draft')}>
            <Save size={14} /> Save as draft
          </Button>
          <Button variant="secondary" onClick={() => save('awaiting_approval')}>
            Submit for approval
          </Button>
          <Button
            onClick={async () => {
              const id = Date.now().toString();
              save('scheduled');
              const reason = await requestPublish(id);
              toast.push({ tone: 'warn', title: 'Publishing not connected', detail: reason });
            }}
          >
            <Send size={14} /> Prepare publish request
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <label className="surface flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-sm text-neutral-400">
            <Upload size={18} className="text-accent" />
            {media ? (
              <>
                <span className="text-white">{media.name}</span>
                <span>Stored locally in this session. Remote storage is not connected.</span>
              </>
            ) : (
              <span>Upload image or video · max 25 MB</span>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="surface p-5 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Topic, brief, or transcript</label>
            <textarea
              rows={4}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-[#141414] p-3 text-sm"
              placeholder="What should this post be about?"
            />
            <div className="flex flex-wrap items-center gap-2">
              <PlatformToggle active={platforms.includes('instagram')} onClick={() => toggle('instagram')} icon={<Instagram size={14} />} label="Instagram" />
              <PlatformToggle active={platforms.includes('linkedin')} onClick={() => toggle('linkedin')} icon={<Linkedin size={14} />} label="LinkedIn" />
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as WritingStyle)}
                className="ml-auto rounded-lg border border-hairline bg-panel px-3 py-2 text-sm"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="bold">Bold</option>
                <option value="educational">Educational</option>
                <option value="custom">Custom</option>
              </select>
              <Button onClick={generate} disabled={busy}>
                <Sparkles size={14} /> {busy ? 'Drafting…' : 'Generate captions'}
              </Button>
            </div>
          </div>

          {platforms.includes('instagram') && <CopyEditor label="Instagram" limit={IG_LIMIT} value={ig} onChange={setIg} />}
          {platforms.includes('linkedin') && <CopyEditor label="LinkedIn" limit={LI_LIMIT} value={li} onChange={setLi} />}
        </div>

        <div className="space-y-4 lg:col-span-5">
          {platforms.includes('instagram') && <Preview platform="Instagram" copy={ig} media={media} name={preferences.displayName} />}
          {platforms.includes('linkedin') && <Preview platform="LinkedIn" copy={li} media={media} name={preferences.displayName} />}
        </div>
      </div>
    </div>
  );
}

function PlatformToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${active ? 'border-accent bg-accent/10 text-white' : 'border-hairline text-neutral-500'}`}
    >
      {icon} {label}
    </button>
  );
}

function CopyEditor({
  label,
  value,
  onChange,
  limit,
}: {
  label: string;
  value: PlatformCopy;
  onChange: (v: PlatformCopy) => void;
  limit: number;
}) {
  const count = value.caption.length;
  const over = count > limit;
  return (
    <div className="surface space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{label}</h2>
        <button
          className="text-xs text-neutral-400 hover:text-white"
          onClick={() => navigator.clipboard.writeText([value.hook, value.caption, value.hashtags.join(' '), value.cta].filter(Boolean).join('\n\n'))}
        >
          <Copy size={13} className="inline" /> Copy
        </button>
      </div>
      <input
        value={value.hook}
        onChange={(e) => onChange({ ...value, hook: e.target.value })}
        placeholder="Hook / opening"
        className="w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2 text-sm"
      />
      <textarea
        rows={6}
        value={value.caption}
        onChange={(e) => onChange({ ...value, caption: e.target.value })}
        className="w-full rounded-lg border border-hairline bg-[#141414] p-3 text-sm"
      />
      <p className={`text-xs ${over ? 'text-red-300' : 'text-neutral-500'}`}>
        {count}/{limit} characters {over ? '· over the typical limit' : ''}
      </p>
      <input
        value={value.hashtags.join(' ')}
        onChange={(e) => onChange({ ...value, hashtags: e.target.value.split(' ').filter(Boolean) })}
        className="w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2 text-sm"
      />
      <input
        value={value.cta}
        onChange={(e) => onChange({ ...value, cta: e.target.value })}
        placeholder="Call to action"
        className="w-full rounded-lg border border-hairline bg-[#141414] px-3 py-2 text-sm"
      />
    </div>
  );
}

function Preview({
  platform,
  copy,
  media,
  name,
}: {
  platform: string;
  copy: PlatformCopy;
  media: { url: string; type: 'image' | 'video' } | null;
  name: string;
}) {
  const text = useMemo(() => [copy.hook, copy.caption, copy.cta, copy.hashtags.join(' ')].filter(Boolean).join('\n\n'), [copy]);
  return (
    <div className="surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{platform} preview</p>
        <Badge>Local preview</Badge>
      </div>
      <div className="rounded-xl bg-[#111] p-3">
        <p className="text-xs font-semibold">{name}</p>
        {media?.type === 'video' ? (
          <video src={media.url} className="mt-2 aspect-video w-full rounded-lg object-cover" controls />
        ) : media ? (
          <img src={media.url} alt="" className="mt-2 aspect-video w-full rounded-lg object-cover" />
        ) : (
          <div className="mt-2 grid aspect-video place-items-center rounded-lg bg-panel text-xs text-neutral-500">No media</div>
        )}
        <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-300">{text || 'Generate or write a caption to preview.'}</p>
      </div>
    </div>
  );
}
