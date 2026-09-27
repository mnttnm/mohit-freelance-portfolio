/* =============================================================================
   Work page presentation layer.

   Canonical facts (titles, outcomes, links, capabilities, evidence gaps) live in
   ./projects.ts and are shared with the WebMCP tools. This file only adds what
   the /projects page needs to *show* them: screenshots with captions, the
   longer narrative, and the build notes. Everything a visitor reads as a claim
   is either here verbatim or derived from projects.ts, never invented in markup.
   ============================================================================= */

import type { ImageMetadata } from 'astro';
import { getProject, type PortfolioProject } from './projects';

import opsOnboarding from '../assets/projects/ops-onboarding.webp';
import opsClient from '../assets/projects/ops-client.webp';
import opsTemplates from '../assets/projects/ops-templates.webp';
import resizingInput from '../assets/projects/resizing-input.webp';
import resizingReview from '../assets/projects/resizing-review.webp';
import resizingEval from '../assets/projects/resizing-eval.webp';
import dashboardOriginal from '../../public/images/dashboard-skill-project/original.webp';
import dashboardV7Light from '../../public/images/dashboard-skill-project/v7-light.webp';
import dashboardV7Dark from '../../public/images/dashboard-skill-project/v7-dark.webp';
import slicelyDashboard from '../assets/projects/slicely-dashboard.webp';
import slicelyStudio from '../assets/projects/slicely-studio.webp';
import aiToolkit from '../assets/projects/ai-toolkit.webp';
import reviewhubOps from '../assets/projects/reviewhub-ops.webp';
import reviewhubSlack from '../assets/projects/reviewhub-slack.webp';
import greetwood from '../assets/projects/greetwood.webp';
import businessCopilot from '../assets/projects/business-copilot.webp';
import learningLog from '../assets/projects/learning-log.webp';
import figmaVariableExplorer from '../assets/projects/figma-variable-explorer.webp';
import careerGuide from '../assets/projects/career-guide.webp';
import notesInGdocs from '../assets/projects/notes-in-gdocs.webp';
import deanAvatar from '../assets/dean-teffer.webp';
import fredAvatar from '../assets/fred-wilmot.webp';

/* ---- Disciplines --------------------------------------------------------- */
/* The same four layers the home hero uses. Each project's set is derived from
   its canonical `capabilities`, so the page can't claim a discipline the
   evidence doesn't list. */

export const disciplines = [
  { id: 'design', label: 'Design' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'qa', label: 'QA & Automation' },
  { id: 'ai', label: 'AI Workflows' },
] as const;

export type DisciplineId = (typeof disciplines)[number]['id'];

const capabilityDiscipline: Record<string, DisciplineId> = {
  'product-design': 'design',
  'design-systems': 'design',
  'dashboard-design': 'design',
  'information-architecture': 'design',
  'full-stack': 'engineering',
  architecture: 'engineering',
  'production-delivery': 'engineering',
  'data-modeling': 'engineering',
  'frontend-development': 'engineering',
  'design-to-code': 'engineering',
  'developer-tools': 'engineering',
  'interactive-content': 'engineering',
  qa: 'qa',
  evaluation: 'qa',
  automation: 'qa',
  'human-in-the-loop': 'qa',
  'ai-workflows': 'ai',
  'agent-tooling': 'ai',
};

export function disciplinesFor(project: PortfolioProject): DisciplineId[] {
  const found = new Set(
    project.capabilities
      .map((capability) => capabilityDiscipline[capability])
      .filter(Boolean),
  );
  return disciplines.map((d) => d.id).filter((id) => found.has(id));
}

function canonical(id: string): PortfolioProject {
  const project = getProject(id);
  if (!project) throw new Error(`Missing canonical project: ${id}`);
  return project;
}

/* ---- Case files (the six "selects") --------------------------------------- */

export interface Shot {
  src: ImageMetadata;
  caption: string;
  alt: string;
}

interface CaseFileSource {
  id: string;
  /** A voiced one-liner. The canonical `outcome` in projects.ts stays as the
      plain statement the WebMCP tools return. */
  tagline: string;
  description: string;
  stack: string[];
  shots: Shot[];
  notes: Array<{ heading: string; body: string }>;
}

const caseFileSources: CaseFileSource[] = [
  {
    id: 'ops-workspace',
    tagline: 'Dense enterprise workflows, made calm.',
    description:
      "The internal app a sales team runs its day on: client onboarding, templates, reporting, and in-app help, all on one shared data model.",
    stack: ['Next.js 16', 'Tailwind v4', 'shadcn/ui', 'Supabase', 'NextAuth'],
    shots: [
      { src: opsOnboarding, caption: 'Onboarding', alt: 'Multi-step client onboarding form with a progress checklist' },
      { src: opsClient, caption: 'Client record', alt: 'Client overview with identity, billing, and contacts panels' },
      { src: opsTemplates, caption: 'Templates', alt: 'Template library with filters for vertical and channel' },
    ],
    notes: [
      {
        heading: 'Three modules, one model',
        body: 'Onboarding, template admin, and reporting share one data model, so a template change flows cleanly into both.',
      },
      {
        heading: 'History that stays true',
        body: 'Past onboarding records stay intact and readable even as the templates behind them evolve.',
      },
      {
        heading: 'Enterprise plumbing',
        body: "SSO through the company's OIDC server with NextAuth v5, trusted server-side operations in Supabase, and CodeBuild → ECS deploys.",
      },
    ],
  },
  {
    id: 'ai-resizing-studio',
    tagline: 'AI does first-pass QA. People review what matters.',
    description:
      'Thousands of event posters, reformatted into every ad size. An AI judge checks each output first, so reviewers only look where it counts.',
    stack: ['Gemini 3 Image', 'OpenAI GPT Image', 'Next.js', 'Supabase', 'AI-as-judge'],
    shots: [
      { src: resizingInput, caption: 'Batch', alt: 'Batch input screen for generating every target ratio at once' },
      { src: resizingReview, caption: 'Review', alt: 'Source and generated images side by side with the AI verdict' },
      { src: resizingEval, caption: 'Evaluation', alt: 'Dashboard tracking good-rate, risk, and cost per good output' },
    ],
    notes: [
      {
        heading: 'Risk-scored at scale',
        body: 'Every asset fans out into all its ratios at once, and each output is scored for crop loss and mismatch before anyone opens it.',
      },
      {
        heading: 'Keyboard-fast review',
        body: 'Source and output side by side, the AI verdict attached, rated Good / Okay / Bad without touching the mouse.',
      },
      {
        heading: 'A rubric that sharpens',
        body: 'The dashboard tracks cost per good output and flags where AI and human judgement disagree.',
      },
    ],
  },
  {
    id: 'dashboard-skill',
    tagline: 'From a wall of charts to a clear next step.',
    description:
      'An agent skill that redesigns dashboards around decisions instead of data. The case study puts Claude with and without it side by side.',
    stack: ['UI/UX', 'Data Viz', 'Agent Skill', 'Recharts', 'Design System'],
    shots: [
      { src: dashboardOriginal, caption: 'Before', alt: 'The original dashboard, a grid of equally weighted charts' },
      { src: dashboardV7Light, caption: 'After', alt: 'The V7 dashboard led by a conversion funnel and earned insights' },
      { src: dashboardV7Dark, caption: 'After, dark', alt: 'The V7 dashboard in its dark theme' },
    ],
    notes: [
      {
        heading: 'Six principles',
        body: 'Start from the decision, lead with one thing, earn every element, show the insight, end in a next step, spend emphasis sparingly.',
      },
      {
        heading: 'Wrong turns included',
        body: 'Original → V1 → V4 → V7, with the over-decorated V4 kept in because it teaches the most.',
      },
      {
        heading: 'Tested blind',
        body: 'A fresh agent rebuilds from the same brief. If it lands in the same place, the principles are doing the work.',
      },
    ],
  },
  {
    id: 'slicely',
    tagline: 'Show it a PDF once. Get structured data every time.',
    description:
      'Annotate a PDF, define the extraction once, and every similar document comes back as a number, a table, a chart, or text.',
    stack: ['Next.js', 'Supabase', 'Tailwind CSS', 'LLM Integration'],
    shots: [
      { src: slicelyDashboard, caption: 'Results', alt: 'Slicer output rendered as text and tables, ready for review' },
      { src: slicelyStudio, caption: 'Studio', alt: 'A PDF beside its page-selection rules and LLM prompts' },
    ],
    notes: [
      {
        heading: 'Annotation that feels light',
        body: 'The screen you spend the most time in, designed so pointing at the right part of a PDF takes seconds.',
      },
      {
        heading: 'Results that pick their shape',
        body: 'Each recipe returns different data, and the renderer chooses the right view on its own.',
      },
      {
        heading: 'Pipeline-ready',
        body: 'Batch processing and webhooks, so it slots into a larger system instead of standing alone.',
      },
    ],
  },
  {
    id: 'ai-toolkit',
    tagline: 'The agent skills I use every day, open-sourced.',
    description:
      'Skills and automations for Claude Code and Codex, covering product UI, dashboards, UX, and interface grading. One command to install.',
    stack: ['Claude Code', 'Codex', 'Agent Skills', 'Automations'],
    shots: [
      { src: aiToolkit, caption: 'The repository', alt: 'The AI Toolkit repository listing its skills and automations' },
    ],
    notes: [
      { heading: 'product-ui', body: 'The invisible craft that makes product interfaces feel premium.' },
      { heading: 'dashboard', body: 'Requirements → strategy → design, for dashboards people act on.' },
      { heading: 'interface-grader', body: 'Scores any interface against a craft rubric, iteration over iteration.' },
      { heading: 'Codex automations', body: 'Daily digests, weekly journals, content mining, session backups.' },
    ],
  },
  {
    id: 'reviewhub',
    tagline: 'Feedback goes in. Fixes come out.',
    description:
      'Reviewers annotate a live prototype, the note lands in Slack or Confluence, a coding agent picks it up, and the thread updates itself when the fix ships.',
    stack: ['Agentation', 'Slack', 'Confluence', 'Devin', 'Next.js'],
    shots: [
      { src: reviewhubOps, caption: 'Operations', alt: 'ReviewHub dashboard of projects, webhooks, and review counts' },
      { src: reviewhubSlack, caption: 'In Slack', alt: 'Annotated review submissions arriving in a Slack thread' },
    ],
    notes: [
      {
        heading: 'Pixel-accurate notes',
        body: 'Anyone can annotate the running app itself, not a screenshot of it.',
      },
      {
        heading: 'Where your team already is',
        body: 'Slack by default, Confluence for Atlassian teams. The rest of the loop stays the same.',
      },
      {
        heading: 'The loop closes itself',
        body: 'Agents take the task, ship the fix, and update the thread. Nobody plays telephone.',
      },
    ],
  },
];

export const caseFiles = caseFileSources.map((source, index) => {
  const project = canonical(source.id);
  return {
    ...source,
    number: String(index + 1).padStart(2, '0'),
    title: project.title,
    type: project.type,
    outcome: source.tagline,
    links: project.links,
    isPrivate: project.confidentiality === 'screenshots-only',
    disciplines: disciplinesFor(project),
  };
});

export type CaseFile = (typeof caseFiles)[number];

/* ---- Also shipped (the ledger) -------------------------------------------- */

const shippedSources: Array<{ id: string; image: ImageMetadata; label: string; blurb: string; signal?: string }> = [
  { id: 'figma-variable-explorer', image: figmaVariableExplorer, label: 'Open plugin', blurb: 'Figma variables, inspectable and exportable', signal: '8,000+ users' },
  { id: 'notes-in-google-docs', image: notesInGdocs, label: 'Install', blurb: 'A thought on your Mac, straight into a Doc', signal: '1,000+ installs' },
  { id: 'greetwood', image: greetwood, label: 'Visit store', blurb: 'A furniture storefront, built entirely in code', signal: 'Live store' },
  { id: 'learning-log', image: learningLog, label: 'Open app', blurb: 'Quick notes, published as they happen' },
  { id: 'tech-career-guide', image: careerGuide, label: 'Open app', blurb: '45+ tech careers, mapped for CS students' },
  { id: 'business-copilot', image: businessCopilot, label: 'Read article', blurb: 'Claude Code as a planning partner' },
];

export const alsoShipped = shippedSources.map((source, index) => {
  const project = canonical(source.id);
  const primary = project.links.find((link) => link.kind !== 'source');
  if (!primary) throw new Error(`Missing primary project link: ${source.id}`);
  const sourceLink = project.links.find((link) => link.kind === 'source');
  return {
    ...source,
    number: String(caseFileSources.length + index + 1).padStart(2, '0'),
    title: project.title,
    type: project.type,
    outcome: source.blurb,
    url: primary.url,
    sourceUrl: sourceLink?.url ?? null,
    disciplines: disciplinesFor(project),
  };
});

export type ShippedProject = (typeof alsoShipped)[number];

/* ---- Client words, placed beside the work they vouch for ------------------ */

export const caseQuotes: Record<
  string,
  { person: string; role: string; href: string; avatar: ImageMetadata; quote: string }
> = {
  // Shown after the named case file. Word-for-word excerpts of the full
  // testimonials on the home page (an ellipsis marks a trimmed opening).
  'ai-resizing-studio': {
    person: 'Dean Teffer',
    role: 'VP of AI, Arctic Wolf',
    href: 'https://www.linkedin.com/in/deanteffer',
    avatar: deanAvatar,
    quote:
      '…he highlighted assumptions and gaps in our thinking, and then recommended paths forward. This really accelerated our work and led to a much better UI.',
  },
  slicely: {
    person: 'Fred Wilmot',
    role: 'Founder & 3x CISO',
    href: 'https://www.linkedin.com/in/fredwilmot/',
    avatar: fredAvatar,
    quote:
      'I would work with Mohit again, especially in trying to translate a vision into design quickly and effectively.',
  },
};
