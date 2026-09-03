import { portfolioProjects, type PortfolioProject } from '../../content/projects';
import type {
  FindRelevantWorkInput,
  RelevantWorkMatch,
  RelevantWorkResult,
} from './contracts';

const phraseAliases: Record<string, string[]> = {
  'product-shaping': [
    'product shaping',
    'shape the product',
    'what to build',
    'rough idea',
    'rough prototype',
    'ambiguous requirements',
    'product strategy',
  ],
  'full-stack': [
    'full stack',
    'full-stack',
    'frontend and backend',
    'front end and back end',
    'end to end',
    'end-to-end',
  ],
  'product-design': [
    'product design',
    'interface design',
    'user experience',
    'ux',
    'ui',
  ],
  'ai-workflows': [
    'ai workflow',
    'ai workflows',
    'agentic workflow',
    'agent workflow',
    'applied ai',
    'llm workflow',
  ],
  'human-in-the-loop': [
    'human in the loop',
    'human-in-the-loop',
    'human review',
    'manual review',
  ],
  evaluation: [
    'evaluation',
    'evals',
    'ai judge',
    'quality rubric',
    'quality measurement',
  ],
  'production-delivery': [
    'production delivery',
    'ship to production',
    'production saas',
    'production product',
    'take it to production',
    'production experience',
  ],
  architecture: ['architecture', 'technical design', 'system design'],
  'enterprise-workflows': [
    'enterprise workflow',
    'enterprise software',
    'internal tool',
    'internal software',
  ],
  'dashboard-design': ['dashboard', 'dashboard ux', 'analytics interface'],
  'design-systems': ['design system', 'design systems', 'component system'],
  'data-visualization': [
    'data visualization',
    'data viz',
    'charts',
    'complex data',
  ],
  automation: ['automation', 'automate', 'automating'],
  qa: ['qa', 'quality assurance', 'quality control'],
  'marketing-operations': [
    'marketing team',
    'marketing tech',
    'marketing-tech',
    'marketing operations',
  ],
  'prototype-to-production': [
    'prototype to production',
    'prototype into production',
    'rough prototype',
    'v0 prototype',
  ],
  founder: ['founder', 'cofounder', 'startup'],
  cto: ['cto', 'engineering leader', 'technical leader'],
  'design-leader': ['design leader', 'head of design', 'design director'],
  'product-leader': ['product leader', 'head of product', 'product manager'],
};

const tagLabels: Record<string, string> = {
  'product-shaping': 'product shaping',
  'full-stack': 'end-to-end implementation',
  'product-design': 'product and interface design',
  'ai-workflows': 'applied AI workflows',
  'human-in-the-loop': 'human-in-the-loop review',
  evaluation: 'AI evaluation and quality measurement',
  'production-delivery': 'production delivery',
  architecture: 'architecture and systems thinking',
  'enterprise-workflows': 'complex enterprise workflows',
  'dashboard-design': 'dashboard UX',
  'design-systems': 'design-system thinking',
  'data-visualization': 'data visualization',
  automation: 'workflow automation',
  qa: 'quality assurance',
  'marketing-operations': 'marketing operations',
  'prototype-to-production': 'prototype-to-production work',
  founder: 'founder-oriented delivery',
  cto: 'technical leadership concerns',
  'design-leader': 'design leadership priorities',
  'product-leader': 'product leadership priorities',
};

const weakQueryTerms = new Set([
  'best',
  'work',
  'project',
  'projects',
  'mohit',
  'relevant',
  'show',
  'help',
]);

function normalizeText(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9+#.\-\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryTags(text: string) {
  const normalized = normalizeText(text);
  const tags = new Set<string>();

  for (const [tag, aliases] of Object.entries(phraseAliases)) {
    if (aliases.some((alias) => normalized.includes(alias))) tags.add(tag);
  }

  return { normalized, tags };
}

function tagScore(project: PortfolioProject, tag: string, priority: boolean) {
  const multiplier = priority ? 1.5 : 1;
  if (project.capabilities.includes(tag)) return 7 * multiplier;
  if (project.problemTypes.includes(tag)) return 6 * multiplier;
  if (project.audiences.includes(tag)) return 3 * multiplier;
  if (project.roles.includes(tag)) return 3 * multiplier;
  return 0;
}

function directTextScore(project: PortfolioProject, normalized: string) {
  const tokens = new Set(
    normalized
      .split(' ')
      .map((token) => token.replace(/^-|-$/g, ''))
      .filter((token) => token.length >= 4 && !weakQueryTerms.has(token)),
  );
  const haystack = normalizeText(
    [project.title, project.type, project.outcome, project.summary, ...project.technologies].join(
      ' ',
    ),
  );
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 0.75;
  }
  return Math.min(score, 4);
}

function buildMatch(
  project: PortfolioProject,
  tags: Set<string>,
  priorityTags: Set<string>,
  normalized: string,
): RelevantWorkMatch & { rawScore: number } {
  const matchedTags = [...tags]
    .map((tag) => ({
      tag,
      score: tagScore(project, tag, priorityTags.has(tag)),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));

  const rawScore =
    matchedTags.reduce((sum, entry) => sum + entry.score, 0) +
    directTextScore(project, normalized);
  const reasons = matchedTags
    .slice(0, 2)
    .map((entry) => `Matches ${tagLabels[entry.tag] ?? entry.tag}.`);
  const evidence = matchedTags
    .map((entry) => project.evidenceByTag[entry.tag])
    .filter((value): value is string => Boolean(value))
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 2);

  if (evidence.length === 0) {
    evidence.push(Object.values(project.evidenceByTag)[0]);
  }

  return {
    projectId: project.id,
    title: project.title,
    canonicalUrl: project.canonicalPath,
    relevanceScore: Math.min(100, Math.round(rawScore * 4)),
    reasons,
    evidence,
    gaps: project.evidenceGaps.slice(0, 1),
    rawScore,
  };
}

function summarizeQuery(context: string, priorities: string[]) {
  const summary = [context.trim(), ...priorities.map((priority) => `Priority: ${priority}`)]
    .join(' ')
    .replace(/\s+/g, ' ');
  return summary.length <= 180 ? summary : `${summary.slice(0, 177).trimEnd()}…`;
}

export function findRelevantWork(input: FindRelevantWorkInput): RelevantWorkResult {
  const combined = [input.context, ...input.priorities].join(' ');
  const { normalized, tags } = queryTags(combined);
  const priorityTags = queryTags(input.priorities.join(' ')).tags;
  const scored = portfolioProjects
    .map((project) => buildMatch(project, tags, priorityTags, normalized))
    .sort(
      (a, b) =>
        b.rawScore - a.rawScore ||
        (portfolioProjects.find((project) => project.id === a.projectId)?.editorialOrder ?? 0) -
          (portfolioProjects.find((project) => project.id === b.projectId)?.editorialOrder ?? 0),
    );
  const confident = scored.filter((match) => match.rawScore >= 6);
  const hasUsefulContext = tags.size > 0 && confident.length > 0;

  if (!hasUsefulContext) {
    return {
      status: 'needs_context',
      querySummary: summarizeQuery(input.context, input.priorities),
      matches: scored.slice(0, Math.min(2, input.maxResults)).map(({ rawScore: _, ...match }) => ({
        ...match,
        reasons:
          match.reasons.length > 0
            ? match.reasons
            : ['Representative public work; the query did not provide a strong matching dimension.'],
      })),
      refinementSuggestion:
        'Add the product stage, audience, required capabilities, technical constraints, or outcome you need to evaluate.',
    };
  }

  return {
    status: 'ok',
    querySummary: summarizeQuery(input.context, input.priorities),
    matches: confident
      .slice(0, input.maxResults)
      .map(({ rawScore: _, ...match }) => match),
  };
}
