import type { CommandPlan, WorkflowStep } from '../../types';

export interface CommandProcessor {
  plan(command: string): Promise<CommandPlan>;
}

const step = (agent: string, action: string, status: WorkflowStep['status'] = 'succeeded'): WorkflowStep => ({
  id: `${agent}-${action}`.slice(0, 40),
  agent,
  action,
  status,
});

class MockCommandProcessor implements CommandProcessor {
  async plan(command: string): Promise<CommandPlan> {
    await new Promise((r) => setTimeout(r, 650));
    const q = command.toLowerCase();

    if (q.includes('fail')) {
      return {
        intent: 'failed_workflows',
        title: 'Show failed workflows',
        summary: 'Mock processor listed local failures. No live jobs were queried.',
        steps: [
          step('Workflow Manager', 'Filter activity log by failed status'),
          step('Publishing Agent', 'Attach last error payload'),
        ],
        href: '/activity?status=failed',
        mock: true,
      };
    }

    if (q.includes('caption') || q.includes('reel') || q.includes('linkedin post') || q.includes('post from')) {
      return {
        intent: 'captions',
        title: 'Prepare platform-specific captions',
        summary:
          'Mock plan: Content Agent drafts Instagram and LinkedIn variants. Nothing was published. Open Create Content to edit and approve.',
        steps: [
          step('Workflow Manager', 'Map command to caption workflow'),
          step('Content Agent', 'Draft Instagram hook, caption, hashtags'),
          step('Content Agent', 'Draft LinkedIn opening and post'),
          step('Publishing Agent', 'Hold payload until approval', 'awaiting_approval'),
        ],
        href: '/create',
        mock: true,
      };
    }

    if (q.includes('comment') || q.includes('repl')) {
      return {
        intent: 'comments',
        title: 'Review comments and draft replies',
        summary: 'Mock plan: Engagement Agent classified demo comments. Replies stay in review mode.',
        steps: [
          step('Engagement Agent', 'Load accessible demo comments'),
          step('Engagement Agent', 'Classify intent and draft replies'),
          step('Workflow Manager', 'Queue approvals', 'awaiting_approval'),
        ],
        href: '/comments',
        mock: true,
      };
    }

    if (q.includes('inbox') || q.includes('message') || q.includes('inquir') || q.includes('lead')) {
      return {
        intent: 'inbox',
        title: 'Scan accessible inbox samples',
        summary: 'Mock plan: Inbox Agent tagged sample conversations. Live messaging APIs are not connected.',
        steps: [
          step('Inbox Agent', 'Load sample conversations'),
          step('Inbox Agent', 'Tag possible leads'),
          step('Inbox Agent', 'Draft a response for review', 'awaiting_approval'),
        ],
        href: '/inbox',
        mock: true,
      };
    }

    if (q.includes('plan') || q.includes('week') || q.includes('calendar') || q.includes('seven')) {
      return {
        intent: 'calendar',
        title: 'Draft a seven-day content outline',
        summary: 'Mock plan: Growth Analyst proposed slots on the local calendar. Scheduling APIs are not connected.',
        steps: [
          step('Growth Analyst', 'Read sample performance patterns'),
          step('Content Agent', 'Propose seven briefs'),
          step('Workflow Manager', 'Place items on the local calendar'),
        ],
        href: '/calendar',
        mock: true,
      };
    }

    if (q.includes('perform') || q.includes('best') || q.includes('analy')) {
      return {
        intent: 'analytics',
        title: 'Show labeled sample performance',
        summary: 'Mock plan: Growth Analyst summarized demo analytics. These are not live platform metrics.',
        steps: [step('Growth Analyst', 'Load demo snapshot'), step('Growth Analyst', 'Write weekly memo')],
        href: '/analytics',
        mock: true,
      };
    }

    return {
      intent: 'unknown',
      title: 'Command recorded',
      summary: `The mock processor did not match a known intent. Logged locally: “${command}”. Try a suggested command below.`,
      steps: [step('Workflow Manager', 'Store unmatched command', 'draft')],
      mock: true,
    };
  }
}

export const commandProcessor: CommandProcessor = new MockCommandProcessor();
