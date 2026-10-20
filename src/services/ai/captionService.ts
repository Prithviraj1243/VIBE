import type { CaptionLength, Platform, PlatformCopy, UserPreferences, WritingStyle } from '../../types';

export interface CaptionService {
  generate(input: {
    topic: string;
    platform: 'instagram' | 'linkedin';
    preferences: UserPreferences;
    tone?: WritingStyle;
  }): Promise<PlatformCopy>;
}

function igCopy(topic: string, prefs: UserPreferences, tone: WritingStyle): PlatformCopy {
  const hook =
    tone === 'bold'
      ? `${topic} is not a branding problem. It is a shipping problem.`
      : `A short take on ${topic}.`;
  const emoji = prefs.emojiUsage ? ' ↓' : '';
  const body =
    prefs.captionLength === 'short'
      ? `${hook}\n\nOne useful rule: say the lesson in the first line, then stop.${emoji}`
      : `${hook}\n\nHere is the version I would actually post:\n\n1. Name the mistake.\n2. Show the fix you use now.\n3. Ask one specific question.\n\nNo hype. Just the work.`;
  const tags =
    prefs.hashtagDensity === 'minimal'
      ? ['#buildinpublic']
      : prefs.hashtagDensity === 'high'
        ? ['#buildinpublic', '#creator', '#product', '#indiehackers', '#content']
        : ['#buildinpublic', '#product', '#creator'];
  return { hook, caption: body, hashtags: tags, cta: prefs.defaultCta };
}

function liCopy(topic: string, prefs: UserPreferences, tone: WritingStyle): PlatformCopy {
  const hook =
    tone === 'educational'
      ? `A working definition of ${topic}, without the usual jargon.`
      : `Most writing about ${topic} starts with tools. Start with the decision instead.`;
  const lengthNote: Record<CaptionLength, string> = {
    short: 'Keep this under 80 words when you edit.',
    medium: 'Two short paragraphs, then a question.',
    detailed: 'Walk through the before, the change, and the result.',
  };
  const caption = `${hook}\n\n${lengthNote[prefs.captionLength]}\n\nI would structure the post as:\n• The belief you used to hold\n• The evidence that changed it\n• The rule you use now\n\n${prefs.defaultCta}`;
  return {
    hook,
    caption,
    hashtags: prefs.hashtagDensity === 'minimal' ? [] : ['#leadership', '#product'],
    cta: prefs.defaultCta,
  };
}

class MockCaptionService implements CaptionService {
  async generate({ topic, platform, preferences, tone }: { topic: string; platform: Platform; preferences: UserPreferences; tone?: WritingStyle }): Promise<PlatformCopy> {
    await new Promise((r) => setTimeout(r, 700));
    const style = tone ?? preferences.writingStyle;
    return platform === 'instagram' ? igCopy(topic, preferences, style) : liCopy(topic, preferences, style);
  }
}

export const captionService: CaptionService = new MockCaptionService();
