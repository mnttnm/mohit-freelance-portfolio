export type ProjectConfidentiality =
  | 'public'
  | 'public-summary'
  | 'screenshots-only';

export interface PortfolioProject {
  id: string;
  title: string;
  type: string;
  outcome: string;
  summary: string;
  canonicalPath: string;
  technologies: string[];
  capabilities: string[];
  problemTypes: string[];
  audiences: string[];
  roles: string[];
  evidenceByTag: Record<string, string>;
  evidenceGaps: string[];
  confidentiality: ProjectConfidentiality;
  links: Array<{
    label: string;
    url: string;
    kind: 'case-study' | 'source' | 'demo';
  }>;
  editorialOrder: number;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'ops-workspace',
    title: 'Enterprise Ops Workspace',
    type: 'Enterprise App',
    outcome: 'Complex internal tool, delivered end-to-end',
    summary:
      "An internal web app for a sales team's day-to-day operations, including onboarding, filterable data views, template management, reporting, and in-app help.",
    canonicalPath: '/projects#ops-workspace',
    technologies: [
      'Next.js 16',
      'Tailwind v4',
      'shadcn/ui',
      'Supabase',
      'NextAuth',
      'OIDC',
      'AWS ECS',
    ],
    capabilities: [
      'full-stack',
      'product-design',
      'architecture',
      'production-delivery',
      'enterprise-workflows',
      'authentication',
      'data-modeling',
    ],
    problemTypes: [
      'complex-workflows',
      'prototype-to-production',
      'internal-tools',
      'workflow-automation',
    ],
    audiences: ['founder', 'cto', 'engineering-leader', 'product-leader'],
    roles: ['product-engineer', 'design-engineer', 'full-stack-engineer'],
    evidenceByTag: {
      'full-stack':
        'The public case study covers the UI, shared data model, server-side operations, SSO, and deployment pipeline.',
      architecture:
        'The app connects onboarding, template administration, reporting, and immutable historical records through one data model.',
      'production-delivery':
        'The public summary includes NextAuth/OIDC, Supabase server operations, and a CodeBuild-to-ECS deployment pipeline.',
      'enterprise-workflows':
        'The product organizes multi-step onboarding, grids, templates, reports, and help for a complex internal workflow.',
      'product-design':
        'The interface was designed to keep dense enterprise workflows navigable.',
    },
    evidenceGaps: [
      'Client name, live environment, scale metrics, and source code are not public.',
    ],
    confidentiality: 'screenshots-only',
    links: [],
    editorialOrder: 1,
  },
  {
    id: 'ai-resizing-studio',
    title: 'AI Resizing Studio',
    type: 'AI Image Pipeline',
    outcome: 'AI handles first-pass QA; humans review only what matters',
    summary:
      'A bulk image-resizing product with batch generation, side-by-side human review, deterministic risk checks, AI judging, and an evaluation dashboard.',
    canonicalPath: '/projects#ai-resizing-studio',
    technologies: [
      'Gemini Image',
      'OpenAI GPT Image',
      'Next.js',
      'Supabase',
      'AI-as-judge',
    ],
    capabilities: [
      'ai-workflows',
      'human-in-the-loop',
      'evaluation',
      'full-stack',
      'product-design',
      'production-delivery',
      'qa',
      'data-visualization',
    ],
    problemTypes: [
      'ai-prototype-to-production',
      'workflow-automation',
      'high-volume-processing',
      'quality-control',
      'marketing-operations',
    ],
    audiences: ['founder', 'cto', 'marketing-team', 'product-leader'],
    roles: ['product-engineer', 'design-engineer', 'ai-engineer'],
    evidenceByTag: {
      'ai-workflows':
        'The workflow combines model generation, deterministic checks, retry/escalation policy, and an AI visual judge.',
      'human-in-the-loop':
        'Reviewers see source and generated assets side by side and focus on the outputs the automated checks flag.',
      evaluation:
        'The dashboard tracks quality, risk, cost per good output, and AI-human disagreement to improve the rubric.',
      'full-stack':
        'The public project covers batch input, processing, review, evaluation, and persisted run data as one product.',
      'product-design':
        'Three purpose-built interfaces support high-volume processing, keyboard-fast review, and evaluation.',
      qa: 'Every output receives deterministic risk checks plus an AI-judge assessment before human review.',
    },
    evidenceGaps: [
      'Client identity, live environment, source code, and current production volume are not public.',
    ],
    confidentiality: 'screenshots-only',
    links: [],
    editorialOrder: 2,
  },
  {
    id: 'dashboard-skill',
    title: 'Designing Dashboards',
    type: 'Design Case Study',
    outcome: 'Generic chart-dumps → actionable launchpads',
    summary:
      'A reusable agent skill and case study for redesigning dashboards around decisions, insights, hierarchy, and next actions.',
    canonicalPath: '/projects#dashboard-skill',
    technologies: [
      'UI/UX',
      'Data Visualization',
      'Agent Skills',
      'Recharts',
      'Design Systems',
    ],
    capabilities: [
      'dashboard-design',
      'product-design',
      'design-systems',
      'data-visualization',
      'ai-workflows',
      'evaluation',
    ],
    problemTypes: [
      'complex-data',
      'decision-support',
      'interface-redesign',
    ],
    audiences: ['design-leader', 'product-leader', 'cto'],
    roles: ['design-engineer', 'product-designer'],
    evidenceByTag: {
      'dashboard-design':
        'The case study applies six documented principles to move from a chart wall to a decision-oriented dashboard.',
      'design-systems':
        'The reusable skill captures transferable interface hierarchy and emphasis rules rather than one fixed layout.',
      'data-visualization':
        'The work focuses on showing the insight, leading with one thing, and connecting data to a next action.',
      evaluation:
        'A fresh agent rebuilds from the same brief to test whether the principles, rather than attachment to a layout, drive the result.',
      'product-design':
        'The case study preserves failed iterations and explains the trade-offs that led to the final interaction hierarchy.',
    },
    evidenceGaps: [
      'This is a design case study and reusable skill, not evidence of operating a specific analytics product in production.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Read the case study',
        url: '/work/dashboard-skill',
        kind: 'case-study',
      },
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/mohit-ai-toolkit/tree/main/skills/designing-dashboards',
        kind: 'source',
      },
    ],
    editorialOrder: 3,
  },
  {
    id: 'slicely',
    title: 'Slicely',
    type: 'SaaS Product',
    outcome: 'Turn any PDF into structured data',
    summary:
      'A SaaS product for annotating PDFs, defining reusable extraction recipes, processing batches, and rendering varied response shapes.',
    canonicalPath: '/projects#slicely',
    technologies: ['Next.js', 'Supabase', 'Tailwind CSS', 'LLM Integration'],
    capabilities: [
      'full-stack',
      'product-design',
      'ai-workflows',
      'data-modeling',
      'production-delivery',
    ],
    problemTypes: [
      'prototype-to-production',
      'document-processing',
      'workflow-automation',
      'saas-product',
    ],
    audiences: ['founder', 'cto', 'product-leader'],
    roles: ['product-engineer', 'full-stack-engineer', 'design-engineer'],
    evidenceByTag: {
      'full-stack':
        'The product combines PDF annotation, reusable extraction rules, result rendering, batch processing, and webhooks.',
      'product-design':
        'The interface separates focused source annotation from automatic result views for numbers, charts, tables, and text.',
      'ai-workflows':
        'Reusable extraction recipes turn repeated document work into an LLM-assisted workflow.',
      'production-delivery':
        'A public live demo is available and the project is designed to integrate into larger pipelines through webhooks.',
    },
    evidenceGaps: [
      'Source code, production customer metrics, and current usage scale are not public.',
    ],
    confidentiality: 'public-summary',
    links: [
      {
        label: 'Live demo',
        url: 'https://slicely-ai.vercel.app/',
        kind: 'demo',
      },
    ],
    editorialOrder: 4,
  },
  {
    id: 'ai-toolkit',
    title: 'AI Toolkit',
    type: 'Developer Tool',
    outcome: 'AI workflows I actually use daily',
    summary:
      'An open collection of agent skills and Codex automation templates for product UI, dashboards, interface evaluation, UX, design systems, and workflow automation.',
    canonicalPath: '/projects#ai-toolkit',
    technologies: ['Claude Code', 'Codex', 'Agent Skills', 'Automations'],
    capabilities: [
      'ai-workflows',
      'automation',
      'design-systems',
      'dashboard-design',
      'evaluation',
      'developer-tools',
    ],
    problemTypes: [
      'workflow-automation',
      'agent-tooling',
      'quality-control',
    ],
    audiences: ['cto', 'engineering-leader', 'design-leader'],
    roles: ['product-engineer', 'design-engineer', 'ai-engineer'],
    evidenceByTag: {
      'ai-workflows':
        'The public repository contains reusable skills and automation templates used in Mohit’s own product workflow.',
      automation:
        'Templates cover recurring digests, journals, content mining, and session-log backups.',
      'design-systems':
        'The toolkit includes production UI, dashboard, interaction, UX-pattern, and React design-system skills.',
      evaluation:
        'An interface-grading workflow measures quality against a repeatable craft rubric across iterations.',
    },
    evidenceGaps: [
      'The toolkit demonstrates reusable practice, not a single client product outcome.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/mohit-ai-toolkit',
        kind: 'source',
      },
    ],
    editorialOrder: 5,
  },
  {
    id: 'reviewhub',
    title: 'ReviewHub',
    type: 'Agentic Workflow',
    outcome: 'Agent-powered feedback loop, end-to-end',
    summary:
      'A feedback workflow connecting in-browser prototype annotations, team communication, coding agents, and automatic status updates.',
    canonicalPath: '/projects#reviewhub',
    technologies: ['Agentation', 'Slack', 'Confluence', 'Devin', 'Next.js'],
    capabilities: [
      'ai-workflows',
      'human-in-the-loop',
      'automation',
      'full-stack',
      'product-design',
      'production-delivery',
    ],
    problemTypes: [
      'workflow-automation',
      'feedback-operations',
      'prototype-to-production',
      'team-collaboration',
    ],
    audiences: ['founder', 'cto', 'engineering-leader', 'product-leader'],
    roles: ['product-engineer', 'full-stack-engineer', 'ai-engineer'],
    evidenceByTag: {
      'ai-workflows':
        'Feedback moves from an in-browser annotation into a team channel, is picked up by a coding agent, and closes with a status update.',
      'human-in-the-loop':
        'People capture pixel-accurate feedback against a live prototype before agents execute the implementation work.',
      automation:
        'The workflow reduces manual hand-offs between prototype review, team communication, implementation, and completion status.',
      'full-stack':
        'The public project connects browser UI, Slack or Confluence, an agent handoff, and status synchronization.',
      'product-design':
        'The workflow keeps feedback attached to what a reviewer is actually seeing instead of relying on detached screenshots.',
    },
    evidenceGaps: [
      'Public material does not provide production adoption, throughput, or reliability metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Live demo',
        url: 'https://reviewhub-weld.vercel.app/',
        kind: 'demo',
      },
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/reviewhub',
        kind: 'source',
      },
    ],
    editorialOrder: 6,
  },
  {
    id: 'greetwood',
    title: 'Greetwood',
    type: 'Shopify Store',
    outcome: 'A complete D2C storefront built through code and agent-assisted workflows',
    summary:
      "A Shopify store for a D2C furniture brand, built entirely through code — theme, content, and store configuration — using AI agents and the Shopify CLI instead of Shopify's web admin.",
    canonicalPath: '/projects#greetwood',
    technologies: ['Shopify', 'Liquid', 'Shopify CLI', 'Claude Code', 'Codex'],
    capabilities: ['ecommerce', 'shopify', 'frontend-development', 'agent-tooling'],
    problemTypes: ['store-build', 'content-operations', 'theme-development'],
    audiences: ['founder', 'ecommerce-team'],
    roles: ['design-engineer', 'frontend-engineer'],
    evidenceByTag: {
      ecommerce:
        'The live storefront demonstrates a complete coded Shopify theme, product presentation, content, and store configuration.',
      shopify:
        'The store was built through Shopify CLI and code-based workflows rather than assembled in the web admin.',
      'agent-tooling':
        'Claude Code and Codex supported the theme, content, and configuration workflow.',
    },
    evidenceGaps: [
      'Public material does not provide conversion, revenue, or traffic metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Visit store',
        url: 'https://greetwood.myshopify.com',
        kind: 'demo',
      },
    ],
    editorialOrder: 7,
  },
  {
    id: 'business-copilot',
    title: 'Building a Business Co-Pilot with Claude Code',
    type: 'Article',
    outcome: 'A practical operating system for planning, revenue tracking, and reviews',
    summary:
      'An AI-powered business management system that handles daily planning, revenue tracking, and weekly reviews, built with Claude Code acting as an autonomous co-pilot across an Obsidian-based workspace.',
    canonicalPath: '/projects#business-copilot',
    technologies: ['Claude Code', 'Obsidian', 'Markdown', 'Agent Workflows'],
    capabilities: ['knowledge-management', 'personal-operations', 'agent-tooling'],
    problemTypes: ['business-operations', 'planning', 'knowledge-work'],
    audiences: ['founder', 'independent-operator'],
    roles: ['product-engineer', 'design-engineer'],
    evidenceByTag: {
      'knowledge-management':
        'The published system connects planning, revenue tracking, and weekly reviews inside an Obsidian workspace.',
      'agent-tooling':
        'The article documents Claude Code acting as a co-pilot across a structured business workspace.',
    },
    evidenceGaps: [
      'This is a documented personal operating system, not evidence of a multi-user production SaaS deployment.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Read article',
        url: 'https://medium.com/@tatermohit/i-built-a-business-co-pilot-using-claude-code-heres-the-exact-system-cfe32ee59558',
        kind: 'case-study',
      },
    ],
    editorialOrder: 8,
  },
  {
    id: 'learning-log',
    title: 'learning.log',
    type: 'Web App',
    outcome: 'Quick notes become a durable public learning stream',
    summary:
      'A capture-and-publish platform that turns quick notes into a public learning stream, with a Raycast-powered input pipeline, Redis-backed queue, and automated GitHub publishing.',
    canonicalPath: '/projects#learning-log',
    technologies: ['Raycast', 'Redis', 'GitHub', 'Automation'],
    capabilities: ['automation', 'developer-tools', 'content-publishing'],
    problemTypes: ['capture-workflow', 'publishing-pipeline', 'knowledge-work'],
    audiences: ['creator', 'independent-operator'],
    roles: ['product-engineer', 'full-stack-engineer'],
    evidenceByTag: {
      automation:
        'A Raycast input pipeline, Redis-backed queue, and GitHub publishing flow turn quick capture into an automated public stream.',
      'developer-tools':
        'The product combines a fast desktop capture surface with a web publishing pipeline.',
    },
    evidenceGaps: [
      'Public material does not provide current audience or publishing-volume metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Live app',
        url: 'https://mohit.stream',
        kind: 'demo',
      },
    ],
    editorialOrder: 9,
  },
  {
    id: 'figma-variable-explorer',
    title: 'Figma Variable Explorer',
    type: 'Figma Plugin',
    outcome: 'Design variables become easier to inspect and hand off',
    summary:
      'Browse, inspect, and export Figma design variables in List, JSON, and CSS formats. Supports both design and development modes, used by 8,000+ designers.',
    canonicalPath: '/projects#figma-variable-explorer',
    technologies: ['Figma Plugin API', 'TypeScript', 'JSON', 'CSS'],
    capabilities: ['design-systems', 'developer-tools', 'design-to-code'],
    problemTypes: ['variable-management', 'design-handoff', 'developer-experience'],
    audiences: ['design-leader', 'designer', 'frontend-engineer'],
    roles: ['design-engineer', 'product-engineer'],
    evidenceByTag: {
      'design-systems':
        'The plugin exposes Figma variables in list, JSON, and CSS views for design-system inspection and handoff.',
      'developer-tools':
        'The public plugin and source repository show a tool used by more than 8,000 designers.',
    },
    evidenceGaps: [
      'The public listing reports adoption but does not publish retention or workflow-impact metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Open plugin',
        url: 'https://www.figma.com/community/plugin/1310888112326715990/figma-variable-explorer',
        kind: 'demo',
      },
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/figma-variable-explorer',
        kind: 'source',
      },
    ],
    editorialOrder: 10,
  },
  {
    id: 'tech-career-guide',
    title: 'Tech Career Guide for CS Students',
    type: 'Web App',
    outcome: '45+ career paths made navigable for Indian CS students',
    summary:
      'An interactive career exploration tool covering 45+ tech career paths with salary benchmarks, personality-based matching, and structured learning roadmaps for Indian CS students.',
    canonicalPath: '/projects#tech-career-guide',
    technologies: ['React', 'TypeScript', 'Vercel'],
    capabilities: ['career-education', 'information-architecture', 'interactive-content'],
    problemTypes: ['career-exploration', 'decision-support', 'education'],
    audiences: ['student', 'educator'],
    roles: ['product-engineer', 'design-engineer'],
    evidenceByTag: {
      'career-education':
        'The live product organizes more than 45 technology career paths, salary benchmarks, and learning roadmaps for Indian students.',
      'information-architecture':
        'Personality-based matching and structured roadmaps help students navigate a broad, unfamiliar decision space.',
    },
    evidenceGaps: [
      'Public material does not provide learning outcomes or active-user metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Live app',
        url: 'https://tech-career-guide.vercel.app/',
        kind: 'demo',
      },
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/btech-cs-career-guide-india',
        kind: 'source',
      },
    ],
    editorialOrder: 11,
  },
  {
    id: 'notes-in-google-docs',
    title: 'Notes in Google Docs',
    type: 'Raycast Extension',
    outcome: 'Fast Mac capture, stored directly in Google Docs',
    summary:
      'Capture notes from anywhere on your Mac and store them directly in Google Docs. Create new documents, switch between them, and manage everything without leaving Raycast.',
    canonicalPath: '/projects#notes-in-google-docs',
    technologies: ['Raycast', 'TypeScript', 'Google Docs API'],
    capabilities: ['automation', 'developer-tools', 'knowledge-management'],
    problemTypes: ['capture-workflow', 'personal-productivity', 'knowledge-work'],
    audiences: ['creator', 'independent-operator'],
    roles: ['product-engineer', 'full-stack-engineer'],
    evidenceByTag: {
      automation:
        'The extension moves note capture and document switching into a single keyboard-driven Raycast workflow.',
      'developer-tools':
        'The public extension and source repository demonstrate a Google Docs integration with more than 1,000 installs.',
    },
    evidenceGaps: [
      'The public listing reports installs but does not publish retention or active-use metrics.',
    ],
    confidentiality: 'public',
    links: [
      {
        label: 'Install extension',
        url: 'https://www.raycast.com/tatermohit/note-in-google-doc',
        kind: 'demo',
      },
      {
        label: 'View source',
        url: 'https://github.com/mnttnm/raycast-note-in-doc',
        kind: 'source',
      },
    ],
    editorialOrder: 12,
  },
];

export const projectById = new Map(
  portfolioProjects.map((project) => [project.id, project]),
);

export function getProject(projectId: string) {
  return projectById.get(projectId);
}
