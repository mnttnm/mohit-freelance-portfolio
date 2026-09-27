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
  description: string;
  stack: string[];
  shots: Shot[];
  notesTitle: string;
  notes: Array<{ heading: string; body: string }>;
}

const caseFileSources: CaseFileSource[] = [
  {
    id: 'ops-workspace',
    description:
      "An internal web app that supports a sales team's day-to-day operations. It includes multi-step onboarding forms, filterable tables and grids, template detail views, and an in-app help system, with a UI designed to keep complex enterprise workflows easy to navigate.",
    stack: ['Next.js 16', 'Tailwind v4', 'shadcn/ui', 'Supabase', 'NextAuth'],
    shots: [
      { src: opsOnboarding, caption: 'Onboarding wizard', alt: 'Multi-step client onboarding form with a progress checklist' },
      { src: opsClient, caption: 'Client record', alt: 'Client overview with identity, billing, and contacts panels' },
      { src: opsTemplates, caption: 'Template hub', alt: 'Template library with filters for vertical and channel' },
    ],
    notesTitle: 'How the app is put together',
    notes: [
      {
        heading: 'Three connected modules',
        body: "Client capture wizard, template library admin, and reporting. Each module has its own role but shares a common data model, so a change to a template ripples cleanly into how it's used in onboarding and how it shows up in reports.",
      },
      {
        heading: 'Data model',
        body: "Clients, templates, submissions, and audit records. Designed so historical onboarding records stay intact and readable even as templates evolve over time, the kind of detail that only matters once you're months into using it.",
      },
      {
        heading: 'Auth and deployment',
        body: "NextAuth v5 against the company's OIDC server for SSO, Supabase service-role on the server side for trusted operations, and a CodeBuild → ECS pipeline for deploys.",
      },
    ],
  },
  {
    id: 'ai-resizing-studio',
    description:
      "A bulk image-resizing tool for a marketing team that reformats thousands of event posters into every ad ratio they need. It's built around three interfaces (batch processing, side-by-side review, and an evaluation dashboard) with an AI judge running first-pass QA on every output, so reviewers spend their attention only where it's actually needed.",
    stack: ['Gemini 3 Image', 'OpenAI GPT Image', 'Next.js', 'Supabase', 'AI-as-judge'],
    shots: [
      { src: resizingInput, caption: 'Batch processing', alt: 'Batch input screen for generating every target ratio at once' },
      { src: resizingReview, caption: 'Side-by-side review', alt: 'Source and generated images side by side with the AI verdict' },
      { src: resizingEval, caption: 'Evaluation dashboard', alt: 'Dashboard tracking good-rate, risk, and cost per good output' },
    ],
    notesTitle: 'How the three interfaces work together',
    notes: [
      {
        heading: 'Processing: generate at scale',
        body: 'Drop in images or a CSV and the pipeline fans each asset out into all of its target ratios at once. Every output gets a risk score (none → high) computed from crop loss, aspect-ratio mismatch, and the strategy used, so problem outputs are flagged before a human ever opens them.',
      },
      {
        heading: 'Review: a keyboard-fast human pass',
        body: "Source and generated sit side by side with the AI's verdict and score already attached. Reviewers rate Good / Okay / Bad entirely from the keyboard, and filters rebuild the queue on the fly so you can burn down just the unreviewed or just the high-risk outputs.",
      },
      {
        heading: 'Evaluation: AI in the loop',
        body: 'An AI visual judge grades every output against the same rubric a human would. Deterministic checks and a retry/escalation policy decide what to auto-accept, retry, reroute to another model, or send up for manual design work. The dashboard surfaces where the AI and humans disagree, so the rubric keeps sharpening.',
      },
    ],
  },
  {
    id: 'dashboard-skill',
    description:
      'An agent skill that turns the everyday “wall of charts” dashboard into something a person can actually act on. The case study isolates what the skill adds (Claude with no skill vs. with it) and the six grounding principles behind it that hold for any dashboard, any stack, any domain.',
    stack: ['UI/UX', 'Data Viz', 'Agent Skill', 'Recharts', 'Design System'],
    shots: [
      { src: dashboardOriginal, caption: 'Before: the chart wall', alt: 'The original dashboard, a grid of equally weighted charts' },
      { src: dashboardV7Light, caption: 'After: V7', alt: 'The V7 dashboard led by a conversion funnel and earned insights' },
      { src: dashboardV7Dark, caption: 'V7, dark theme', alt: 'The V7 dashboard in its dark theme' },
    ],
    notesTitle: "What's inside the case study",
    notes: [
      {
        heading: 'Six grounding principles',
        body: 'Start from the decision not the data, lead with one thing, earn every element, show the insight not just the data, end in a next step, and spend emphasis sparingly.',
      },
      {
        heading: 'A real redesign, including the wrong turns',
        body: 'Original → V1 → V4 → V7, shown honestly. The V4 frame is kept in on purpose, because an iteration that mistook richness for clarity is the clearest lesson of the lot.',
      },
      {
        heading: 'Validated, not just asserted',
        body: 'A fresh agent with no memory of the previous version rebuilds the dashboard blind from the same brief. If it lands in the same place, the principles are doing the work, not attachment to a layout.',
      },
    ],
  },
  {
    id: 'slicely',
    description:
      'A web app for extracting structured data from PDFs using reusable recipes. Users annotate the relevant pages of a PDF, define their extraction rules once, and view results rendered as a number, table, chart, or plain text, with no per-document configuration needed.',
    stack: ['Next.js', 'Supabase', 'Tailwind CSS', 'LLM Integration'],
    shots: [
      { src: slicelyDashboard, caption: 'Results dashboard', alt: 'Slicer output rendered as text and tables, ready for review' },
      { src: slicelyStudio, caption: 'Annotation studio', alt: 'A PDF beside its page-selection rules and LLM prompts' },
    ],
    notesTitle: "What's inside",
    notes: [
      {
        heading: 'Annotation module',
        body: 'A focused interface for marking up source PDFs, the part you spend the most time in when configuring a new slicer. Designed so pointing at the right regions of a PDF feels lightweight.',
      },
      {
        heading: 'Dynamic response renderer',
        body: 'Each slicer can return very different shapes of data. The renderer picks the right view automatically (a single number, a chart, a table, or formatted text) with no per-slicer UI work.',
      },
      {
        heading: 'Bulk processing & webhooks',
        body: 'Designed to chew through batches and notify other systems when results are ready, so it fits into a larger pipeline rather than being a standalone tool.',
      },
    ],
  },
  {
    id: 'ai-toolkit',
    description:
      'A collection of reusable agent skills and Codex automation templates for Claude Code and Codex. Skills cover product UI, dashboards, interface grading, UX patterns, interaction design, and workflow automation, and install with a single command. I use it to keep my agentic-engineering practice current.',
    stack: ['Claude Code', 'Codex', 'Agent Skills', 'Automations'],
    shots: [
      { src: aiToolkit, caption: 'The skills repository', alt: 'The AI Toolkit repository listing its skills and automations' },
    ],
    notesTitle: 'Skills in the toolkit',
    notes: [
      { heading: 'product-ui', body: 'Production-grade product interface work: the invisible craft that makes software feel premium.' },
      { heading: 'dashboard', body: 'Modern, actionable dashboards through a structured requirements → strategy → design workflow.' },
      { heading: 'interface-grader', body: 'Quantitative grading of any frontend interface against a craft rubric, with iteration-over-iteration deltas.' },
      { heading: 'ux-patterns & interaction-design', body: 'Frictionless UX patterns and the microinteractions, motion, and state handling that go on top.' },
      { heading: 'Codex automations', body: 'Templates for daily digests, weekly journals, content mining, and session-log backups.' },
    ],
  },
  {
    id: 'reviewhub',
    description:
      'A feedback pipeline that connects three tools: in-browser annotations on a live prototype, a communication channel (Slack or Confluence), and a coding agent. Feedback captured in the browser flows to the chosen channel, gets picked up by an agent, and the task status updates automatically once the work is done.',
    stack: ['Agentation', 'Slack', 'Confluence', 'Devin', 'Next.js'],
    shots: [
      { src: reviewhubOps, caption: 'Review operations', alt: 'ReviewHub dashboard of projects, webhooks, and review counts' },
      { src: reviewhubSlack, caption: 'Feedback in Slack', alt: 'Annotated review submissions arriving in a Slack thread' },
    ],
    notesTitle: 'How the loop closes',
    notes: [
      {
        heading: 'Live prototype review',
        body: 'An Agentation widget overlays the running app so anyone (PM, designer, client) can drop pixel-accurate annotations without leaving the browser, against what they are actually seeing.',
      },
      {
        heading: 'Feedback where your team already lives',
        body: "Slack is the default destination, with Confluence wired in for teams that work out of Atlassian. Pick the destination per project; the rest of the pipeline doesn't change.",
      },
      {
        heading: 'Agent handoff and status sync',
        body: 'Coding agents pick tasks up from the feed and execute. Once a fix lands, the Confluence page or Slack thread updates itself, so nobody plays telephone between QA, design, and engineering.',
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
    outcome: project.outcome,
    links: project.links,
    isPrivate: project.confidentiality === 'screenshots-only',
    privacyNote: project.confidentiality === 'screenshots-only' ? project.evidenceGaps[0] : null,
    disciplines: disciplinesFor(project),
  };
});

export type CaseFile = (typeof caseFiles)[number];

/* ---- Also shipped (the ledger) -------------------------------------------- */

const shippedSources: Array<{ id: string; image: ImageMetadata; label: string; signal?: string }> = [
  { id: 'figma-variable-explorer', image: figmaVariableExplorer, label: 'Open plugin', signal: '8,000+ users' },
  { id: 'notes-in-google-docs', image: notesInGdocs, label: 'Install', signal: '1,000+ installs' },
  { id: 'greetwood', image: greetwood, label: 'Visit store', signal: 'Live store' },
  { id: 'learning-log', image: learningLog, label: 'Open app' },
  { id: 'tech-career-guide', image: careerGuide, label: 'Open app' },
  { id: 'business-copilot', image: businessCopilot, label: 'Read article' },
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
    outcome: project.outcome,
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
  // Shown after the named case file. Quotes are verbatim from the home page.
  'ai-resizing-studio': {
    person: 'Dean Teffer',
    role: 'VP of AI, Arctic Wolf',
    href: 'https://www.linkedin.com/in/deanteffer',
    avatar: deanAvatar,
    quote:
      'Mohit is a highly talented product engineer and a pleasure to work with. There were many occasions where after analyzing our goals, he highlighted assumptions and gaps in our thinking, and then recommended paths forward. This really accelerated our work and led to a much better UI.',
  },
  slicely: {
    person: 'Fred Wilmot',
    role: 'Founder & 3x CISO',
    href: 'https://www.linkedin.com/in/fredwilmot/',
    avatar: fredAvatar,
    quote:
      'Mohit effectively translated complex product requirements into wireframes and effective UX designs. We brainstormed solutions given his experience and my requirements. I would work with Mohit again, especially in trying to translate a vision into design quickly and effectively.',
  },
};
